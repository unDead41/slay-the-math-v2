/* V9 preview renderer: shared lane planner, isolated actors, bounded buffers. */
(function(){'use strict';
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),ease=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
 const palette={strength:'#f54b59',agility:'#56e49a',defense:'#65b9ff',block:'#80e9ff',thorns:'#a9774d',weak:'#ad73ef',vulnerable:'#e83f51'},passiveColors=STMPassiveField.COLORS;
 const combinedIds=['strength-up','agility-up','defense-up','thorns-active','weak-active','vulnerable-active'];
 function create(backCanvas,frontCanvas,stage){
  const back=backCanvas.getContext('2d'),front=frontCanvas.getContext('2d');if(!back||!front)throw Error('Canvas 2D tidak disokong.');
  const auras=new Map(),shields=new Map(),passives=new Map();
  let w=1,h=1,dpr=1,quality='auto',autoTier='full',effective='full',profile='full',actorView='player',actors=[],flowPlans=new Map();
  let mode='status',kind='strength-up',selection=[0],statSelection=['strength-up'],statLayouts=new Map(),elapsed=0,paused=false,loop=true,speed=1,last=0,raf=0,dead=false,dirty=true,plan=false,frames=0,introduced=false,complete=false;
  let shieldReport=null,passiveReport=null,auraReport=null,actorReports=[],seekFraction=null,paintAvg=0,frameAvg=0,autoSamples=0;
  const isShield=()=>mode==='status'&&kind.startsWith('shield-'),isAura=()=>mode==='combined'||mode==='stat-stack'||(mode==='status'&&!isShield());
  const period=()=>mode==='passive'?STMPassiveField.PERIOD:mode==='combined'?24:mode==='stat-stack'?12:isShield()?STMShieldField.duration(kind.slice(7)):STMAuraField.duration(kind);
  const stopAt=()=>isShield()&&['break','expire'].includes(kind.slice(7))?5:period();
  const auraIds=()=>mode==='combined'?combinedIds:mode==='stat-stack'?statSelection:isAura()?[kind]:[];
  function schedule(){if(!raf&&!dead&&!document.hidden){raf=requestAnimationFrame(tick);stage.dataset.rafPending='1';}}
  function invalidate(){dirty=true;complete=false;schedule();}
  function layoutAt(attribute){const e=statLayouts.get(attribute);if(!e)return STMAuraField.ringLayout();const p=ease((elapsed-e.started)/.72);return Object.fromEntries(Object.keys(e.to).map(k=>[k,e.from[k]+(e.to[k]-e.from[k])*p]));}
  function setStatRings(ids,immediate){const next=new Map();ids.forEach((id,slot)=>{const a=STMAuraField.definition(id).attribute,to=STMAuraField.ringLayout(ids.length,slot);next.set(a,{from:immediate?to:layoutAt(a),to,started:immediate?elapsed-1:elapsed});});statLayouts=next;statSelection=ids.slice();}
  function updateBudget(){
   effective=quality==='auto'?autoTier:quality;const fields=actors.length*(mode==='combined'?7:mode==='stat-stack'?statSelection.length:1);
   profile=effective==='low'?(fields>=6?'dense-low':'low'):fields>=10?'dense':fields>=3?'multi':'full';
   flowPlans=new Map(actors.map(a=>[a.role,new Map(STMAuraField.planStatParticles(auraIds(),{quality:profile,actor:a.role}).map(p=>[p.id,p.flow]))]));
   const keep=new Set(actors.flatMap(a=>auraIds().map(id=>a.role+'|'+id)));for(const [key,field]of auras)if(!keep.has(key)){field.destroy();auras.delete(key);}
   if(!isShield()&&mode!=='combined')shields.clear();if(mode!=='passive')passives.clear();
   stage.dataset.effectiveQuality=effective;stage.dataset.renderProfile=profile;stage.dataset.actorView=actorView;stage.dataset.quality=quality;
  }
  function field(id,role){const k=role+'|'+id;if(!auras.has(k))auras.set(k,STMAuraField.create());return auras.get(k);}
  function shield(role){if(!shields.has(role))shields.set(role,STMShieldField.create());return shields.get(role);}
  function passive(role){if(!passives.has(role)){const f=STMPassiveField.create();f.setSelection(selection,elapsed,{immediate:true,intro:!introduced&&elapsed<.1});passives.set(role,f);}return passives.get(role);}
  function paintAura(ctx,id,actor,alpha=1,ring=STMAuraField.ringLayout()){
   const d=STMAuraField.definition(id),reveal=introduced||(d.kind==='barrier'&&d.state!=='active')?1:ease(elapsed/.95);
   const f=field(id,actor.role).paint(ctx,elapsed,id,{loop:mode==='combined'?true:loop,quality:profile,front:ctx===front,alpha,reveal,ring,flow:flowPlans.get(actor.role)?.get(id)||null});auraReport=f;
   return f;
  }
  function draw(ctx){
   ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const reports=[];
   for(const a of actors){
    ctx.save();const r=a.region;ctx.beginPath();ctx.rect(r.x,r.y,r.width,r.height);ctx.clip();
    if(mode==='passive'&&plan){const ps=Math.min((r.width-38)/440,(r.height-92)/440);ctx.translate(a.x,r.y+r.height/2+15);ctx.scale(ps*a.facing,ps);}
    else{if(mode!=='passive'){ctx.beginPath();ctx.rect(a.x-205*a.scale,a.y-375*a.scale,410*a.scale,375*a.scale);ctx.clip();}ctx.translate(a.x,a.y);ctx.scale(a.scale*a.facing,a.scale);}
    ctx.globalCompositeOperation='lighter';const results=[];
    if(mode==='passive')passiveReport=passive(a.role).paint(ctx,elapsed,{quality:effective,front:ctx===front,plan});
    else if(mode==='combined'){for(const [i,id]of combinedIds.entries())results.push(paintAura(ctx,id,a,.39,i<3?STMAuraField.ringLayout(3,i):STMAuraField.ringLayout()));shieldReport=shield(a.role).paint(ctx,elapsed,'active',{loop:true,quality:effective,front:ctx===front,alpha:.5});}
    else if(mode==='stat-stack')for(const id of statSelection)results.push(paintAura(ctx,id,a,1,layoutAt(STMAuraField.definition(id).attribute)));
    else if(isShield())shieldReport=shield(a.role).paint(ctx,elapsed,kind.slice(7),{loop,quality:effective,front:ctx===front});
    else results.push(paintAura(ctx,kind,a));
    ctx.restore();
    if(ctx===front)reports.push({role:a.role,facing:a.facing,anchor:{x:a.x,y:a.y,scale:a.scale},region:r,motes:results.flatMap(f=>f.parts.filter(p=>p.orb).map(p=>({...p.orb,alpha:p.alpha,color:p.color,id:f.id,screenX:a.x+p.orb.x*a.scale*a.facing,screenY:a.y+p.orb.y*a.scale}))),radialSpikes:results.flatMap(f=>f.parts.filter(p=>p.burst).map(p=>({...p.burst,alpha:p.alpha}))),effects:results.map(f=>f.id)});
   }
   if(ctx===front)actorReports=reports;
  }
  function resize(){
   let r=stage.getBoundingClientRect();const desired=actorView==='both'?(r.width<700?'920px':'575px'):'';if(stage.style.height!==desired)stage.style.height=desired;r=stage.getBoundingClientRect();w=r.width;h=r.height;
   const roles=actorView==='both'?['player','enemy']:[actorView],vertical=roles.length===2&&w<700;
   actors=roles.map((role,i)=>{const rw=vertical?w:w/roles.length,rh=vertical?h/2:h,rx=vertical?0:i*rw,ry=vertical?i*rh:0,scale=Math.min(1,(rw-30)/410);return{role,facing:role==='enemy'?-1:1,x:rx+rw/2,y:ry+rh-104-22*scale,scale,region:{x:rx,y:ry,width:rw,height:rh}};});
   for(const role of ['player','enemy']){const el=document.getElementById(role==='player'?'previewPlayer':'previewEnemy'),label=document.getElementById(role==='player'?'playerPreviewName':'enemyPreviewName'),a=actors.find(a=>a.role===role);if(!el)continue;el.hidden=!a||(mode==='passive'&&plan);label.hidden=!a||(mode==='passive'&&plan);if(a){const ox=role==='player'?395:339,oy=role==='player'?546:380;el.style.transform='translate('+(a.x-ox*a.scale)+'px,'+(a.y-oy*a.scale)+'px) scale('+a.scale+')';label.style.left=a.x+'px';label.style.top=(a.y+43*a.scale)+'px';}}
   stage.dataset.actorLayout=JSON.stringify(actors);updateBudget();dpr=Math.min(devicePixelRatio||1,effective==='low'?1.25:1.75,Math.sqrt(1000000/Math.max(1,w*h)));
   for(const c of [backCanvas,frontCanvas]){const cw=Math.round(w*dpr),ch=Math.round(h*dpr);if(c.width!==cw||c.height!==ch){c.width=cw;c.height=ch;}c.style.width=w+'px';c.style.height=h+'px';}
   stage.dataset.backingPixels=String(backCanvas.width*backCanvas.height*2);invalidate();
  }
  function checksum(ctx){
   const data=ctx.getImageData(0,0,ctx.canvas.width,ctx.canvas.height).data;let hash=2166136261,minX=ctx.canvas.width,minY=ctx.canvas.height,maxX=-1,maxY=-1,floorPixels=0;
   for(let i=0;i<data.length;i++){hash=Math.imul(hash^data[i],16777619);if(i%4===3&&data[i]>0){const n=(i-3)/4,x=n%ctx.canvas.width,y=Math.floor(n/ctx.canvas.width);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);const px=x/dpr,py=y/dpr;for(const a of actors)if(px>=a.region.x&&px<a.region.x+a.region.width&&py>=a.region.y&&py<a.region.y+a.region.height&&py>a.y+1){floorPixels++;break;}}}
   return{hash:(hash>>>0).toString(16),bounds:maxX<0?null:[minX/dpr,minY/dpr,maxX/dpr,maxY/dpr],floorPixels};
  }
  function publish(capture=false){
   stage.dataset.frames=String(frames);stage.dataset.clock=elapsed.toFixed(3);stage.dataset.animationState=complete?'complete':paused?'paused':'playing';stage.dataset.floorOwner=mode==='passive'?'passive':'none';stage.dataset.footX=String(actors[0]?.x||0);stage.dataset.footY=String(actors[0]?.y||0);stage.dataset.actorReports=JSON.stringify(actorReports);
   stage.dataset.textureBytes=String([...auras.values()].reduce((n,f)=>n+f.stats().bytes,0));stage.dataset.textureSurfaces=String([...auras.values()].reduce((n,f)=>n+f.stats().surfaces,0));stage.dataset.activeAuraFields=String(auras.size);
   if(mode==='passive'&&passiveReport){stage.dataset.passiveVersion='5';stage.dataset.passivePeriod=String(passiveReport.period);stage.dataset.passiveProgress=String(seekFraction??passiveReport.p);stage.dataset.passiveLayers=JSON.stringify(passiveReport.layers.map(v=>({id:v.id,slot:Number(v.slot.toFixed(3)),radius:Number(v.radius.toFixed(3))})));stage.dataset.passivePaintMs=paintAvg.toFixed(2);stage.dataset.passiveGroundOnly='true';}
   else if(isShield()&&shieldReport){stage.dataset.shieldVersion='3';stage.dataset.shieldPeriod=String(shieldReport.period);stage.dataset.shieldProgress=String(seekFraction??shieldReport.t/shieldReport.period);stage.dataset.shieldPhase=shieldReport.phase;stage.dataset.shieldFragments=String(shieldReport.fragments.length);stage.dataset.shieldPaintMs=paintAvg.toFixed(2);}
   else if(isAura()){
    stage.dataset.auraVersion='9';stage.dataset.auraPeriod=String(period());stage.dataset.auraProgress=String(seekFraction??((elapsed%period())/period()));stage.dataset.auraPhase=['combined','stat-stack'].includes(mode)?'steady':auraReport?.phase||'steady';stage.dataset.auraFamily=mode==='combined'?'combined':auraReport?.family||'';stage.dataset.auraPaintMs=paintAvg.toFixed(2);stage.dataset.auraDetachedLinks=String(auraReport?.detachedLinks||0);stage.dataset.auraSpikes=String(auraReport?.spikes||0);stage.dataset.auraElectricArcs=String(auraReport?.electricArcs||0);
    const ids=mode==='stat-stack'?statSelection:mode==='combined'?combinedIds.slice(0,3):auraReport?.kind==='orbit'?[kind]:[];stage.dataset.statRings=JSON.stringify(ids.map((id,slot)=>{const d=STMAuraField.definition(id);return{id,attribute:d.attribute,slot:slot+1,color:d.color,direction:id.endsWith('-up')?'up':'down',...(mode==='stat-stack'?layoutAt(d.attribute):STMAuraField.ringLayout(ids.length,slot))};}));
    stage.dataset.statBeads=JSON.stringify(auraReport?.parts.filter(p=>p.orb).map(p=>({...p.orb,alpha:p.alpha,color:p.color}))||[]);stage.dataset.thornsRadialSpikes=String(auraReport?.parts.filter(p=>p.burst).length||0);stage.dataset.thornsRadialDirections=JSON.stringify(auraReport?.parts.filter(p=>p.burst).map(p=>({...p.burst,alpha:p.alpha}))||[]);
   }
   if(capture&&paused&&seekFraction!==null){const prefix=mode==='passive'?'passive':isShield()?'shield':'aura',a=checksum(back),b=checksum(front);stage.dataset[prefix+'BackPixels']=a.hash;stage.dataset[prefix+'FrontPixels']=b.hash;stage.dataset[prefix+'PixelBounds']=JSON.stringify([a.bounds,b.bounds]);stage.dataset[prefix+'FloorPixels']=String(a.floorPixels+b.floorPixels);stage.dataset[prefix+'CapturedAt']=String(seekFraction);}
  }
  function tick(now){
   raf=0;stage.dataset.rafPending='0';if(dead||document.hidden||paused&&!dirty)return;
   try{const dt=last?Math.max(0,(now-last)/1000):0;last=now;if(!paused){elapsed=loop?elapsed+Math.min(.15,dt)*speed:Math.min(stopAt(),elapsed+Math.min(.15,dt)*speed);if(elapsed>=.95)introduced=true;}
    const capture=dirty,start=performance.now();draw(back);draw(front);const cost=performance.now()-start;paintAvg=paintAvg*.9+cost*.1;frameAvg=frameAvg*.9+dt*100;dirty=false;frames++;complete=!loop&&!paused&&elapsed>=stopAt();
    if(frames%12===0||capture||complete)publish(capture);
    if(quality==='auto'&&!paused&&++autoSamples>=90){autoSamples=0;if(autoTier==='full'&&paintAvg>20){autoTier='low';resize();}}
   }catch(error){stage.dataset.renderError=error.message;const box=document.getElementById('renderError');box.hidden=false;box.textContent='Preview tidak dapat dirender: '+error.message;dead=true;throw error;}
   if(!paused&&!complete||dirty)schedule();
  }
  const onVisibility=()=>{last=0;if(document.hidden){if(raf)cancelAnimationFrame(raf);raf=0;stage.dataset.rafPending='0';}else if(dirty||!paused&&!complete)schedule();};document.addEventListener('visibilitychange',onVisibility);
  const observer=new ResizeObserver(resize);observer.observe(stage);resize();
  return{
   set(s){const priorMode=mode,priorKind=kind,wasPassive=mode==='passive';mode=s.mode;kind=s.kind||kind;const paired=priorMode==='status'&&mode==='status'&&priorKind!==kind&&!priorKind.startsWith('shield-')&&!kind.startsWith('shield-')&&STMAuraField.definition(priorKind).kind==='orbit'&&STMAuraField.definition(kind).kind==='orbit'&&STMAuraField.definition(priorKind).attribute===STMAuraField.definition(kind).attribute;
    if(s.selection)selection=s.selection.slice();if(!(wasPassive&&mode==='passive')&&!paired&&!(priorMode==='stat-stack'&&mode==='stat-stack')){elapsed=0;introduced=false;}if(mode==='stat-stack')setStatRings(s.stats||statSelection,priorMode!=='stat-stack'||!loop&&elapsed>=period());
    if(mode==='passive')for(const f of passives.values())f.setSelection(selection,elapsed,{immediate:!wasPassive,intro:!wasPassive});if(!isShield())delete stage.dataset.shieldVersion;if(mode!=='passive')delete stage.dataset.passiveVersion;if(!isAura())delete stage.dataset.auraVersion;
    seekFraction=null;paused=false;stage.dataset.effect=kind;stage.dataset.mode=mode;stage.dataset.passiveCount=String(mode==='passive'?selection.length:0);stage.dataset.passiveGroundOnly=String(mode==='passive');resize();},
   setActors(value){actorView=['player','enemy','both'].includes(value)?value:'player';resize();},
   replay(){elapsed=0;introduced=false;paused=false;last=0;seekFraction=null;if(mode==='passive')for(const f of passives.values())f.setSelection(selection,0,{immediate:true,intro:true});if(mode==='stat-stack')setStatRings(statSelection,true);invalidate();},
   setQuality(value){quality=['full','low','auto'].includes(value)?value:'auto';if(quality==='auto')autoTier='full';autoSamples=0;resize();},
   setSpeed(value){speed=value;},setLoop(value){loop=value;if(!value&&isShield())elapsed=0;seekFraction=null;invalidate();},
   setPlan(value){plan=value;stage.dataset.passivePlan=String(value);resize();},
   seekCycle(value){for(const prefix of ['shield','passive','aura'])delete stage.dataset[prefix+'CapturedAt'];seekFraction=clamp(value);elapsed=seekFraction*period();introduced=true;if(mode==='passive')for(const f of passives.values())f.setSelection(selection,elapsed,{immediate:true});if(mode==='stat-stack')setStatRings(statSelection,true);paused=true;stage.dataset.animationState='paused';invalidate();},
   pause(value){paused=value;if(!value){seekFraction=null;last=0;}stage.dataset.animationState=value?'paused':'playing';invalidate();},
   destroy(){dead=true;if(raf)cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener('visibilitychange',onVisibility);for(const f of auras.values())f.destroy();auras.clear();shields.clear();passives.clear();}
  };
 }
 window.ArcanePreview={create,palette,passiveColors};
})();
