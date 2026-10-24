/* Injected inside sandbox app copies by the dev server or production builder. */
{
 const F=window.STMDevFixtures;
 let devMotion=null,devLast=null,devBaseline=null,devSetup=null,devBefore=null;
 // Practice is a separate document: isolate its storage before its own scripts.
 const practice=window.DCEducationPractice.createDocument;
 window.DCEducationPractice.createDocument=function(data){return practice(data).replace('<head>','<head><script>('+function(){const make=()=>{const m=new Map();return {get length(){return m.size},key:i=>[...m.keys()][i]??null,getItem:k=>m.get(String(k))??null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(String(k)),clear:()=>m.clear()}};Object.defineProperty(window,'localStorage',{value:make()});Object.defineProperty(window,'sessionStorage',{value:make()});}+')();</script>');};
 function cleanup(){music.setRoute(null,true);music.stopVoice(0);devMotion?.destroy();devMotion=null;if($('#dialog').open)close();seenQuestions=[];learningProfile=null;ui.educationPractice=false;ui.modal=null;ui.artifactChoice=null;ui.rewardChoice=null;ui.cardOrder=[];ui.feedback=null;ui.answer='';ui.shopTab='cards';ui.shopChoice=0;}
 function install(next){cleanup();run=F.copy(next);ui.home=false;render();devBefore=F.copy(run);}
 function launch(setup){const next=F.create(setup);devSetup=F.copy(setup);devBaseline=F.copy(next);devLast={kind:'scene',setup:F.copy(setup)};install(next);return snapshot();}
 function snapshot(){return {version:window.DCRelease?.version,selection:devLast,setup:devSetup,baseline:devBefore,run:F.copy(run),valid:run?E.validate(run):true,motion:devMotion?.snapshot()||null};}
 function cards(id,language='en',extra={}){
  const d=CC.catalog[id];if(!d)throw Error('Unknown card.');
  cleanup();run=null;ui.home=true;render();clearTimeout(menuTimer);QL.setLanguage(language);
  const states=[['Base',false,false],['Upgraded',true,false],...(d.focus_eligible?[['Focus',false,true],['Upgraded + Focus',true,true]]:[])];
  const plans=states.map(([name,upgraded,focused])=>{const r=F.cardSetup(id,upgraded,focused,extra),c=r.battle.hand[0];return {name,upgraded,plan:E.cardPlan(r,c)};});
  $('#header').textContent='Card Inspector · '+id;document.body.classList.remove('home-active');
  $('#game').innerHTML='<h1>'+esc(K.cardName(d,language))+'</h1><p>Real combat plans. Focus may remain inactive when there is no legal benefit.</p><div style="display:flex;gap:20px;flex-wrap:wrap;padding:20px">'+plans.map(x=>'<section style="width:240px"><h2>'+esc(x.name)+'</h2>'+CU.view(x.plan,{upgraded:x.upgraded,lang:language})+'<p>'+esc(x.plan.focusReason)+' · '+esc(x.plan.errors.join(', ')||'Legal')+'</p><pre style="white-space:pre-wrap">'+esc(JSON.stringify(x.plan.values,null,2))+'</pre></section>').join('')+'</div>';
  const style=document.createElement('style');style.textContent='#game .playing-card{width:230px!important;height:350px!important;transform:none!important;position:relative!important;inset:auto!important}';$('#game').append(style);music.setRoute(null,true);devLast={kind:'cards',id,language,extra};return plans.map(x=>({name:x.name,focused:x.plan.focused,values:x.plan.values,errors:x.plan.errors}));
 }
 function testCard(id,state,extra={}){const d=CC.catalog[id];if(!d)throw Error('Unknown card.');if(!d.focus_eligible&&['focus','both'].includes(state))throw Error('Passive has no Focus state.');const up=['upgrade','both'].includes(state),focus=['focus','both'].includes(state),next=F.cardSetup(id,up,focus,extra);devSetup={...extra,kind:'combat',card:id,state};devBaseline=F.copy(next);devLast={kind:'cardCombat',id,state,extra};install(next);return snapshot();}
 function openMotion(options={}){
  cleanup();run=null;ui.home=true;render();clearTimeout(menuTimer);music.setRoute(null,true);
  const data=S.data,original=options.actor==='mc_01'?data.hero:data.actors[options.actor];if(!original)throw Error('Unknown actor.');
  const action=options.action||'idle';if(!original.animations[action])throw Error('Unknown animation.');
  const actor=F.copy(original),n=(key,value,min,max)=>{const v=Number(options[key]??value);if(!Number.isFinite(v)||v<min||v>max)throw Error('Invalid '+key);return v;};
  const speed=n('speed',1,.1,3),scale=n('scale',1,.2,2),x=n('x',0,-500,500),y=n('y',0,-500,500);
  actor.drawScale=(actor.drawScale??data.drawScale)*scale;actor.floorPivot=[(actor.floorPivot||data.floorPivot)[0]+x,(actor.floorPivot||data.floorPivot)[1]+y];actor.animations[action].loop=options.loop!==false;
  $('#header').textContent='Motion Inspector · '+original.name;document.body.classList.remove('home-active');
  $('#game').innerHTML='<h1>'+esc(original.name)+' · '+esc(action)+'</h1><p>'+esc(original.facing)+' facing · real renderer · original on left, temporary preview on right</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'+['original','edited'].map(k=>'<div style="position:relative;background:#111c29;overflow:hidden"><canvas id="dev-'+k+'" width="'+data.canvas[0]+'" height="'+data.canvas[1]+'" style="display:block;width:100%;height:auto;'+(k==='edited'&&options.flip?'transform:scaleX(-1)':'')+'"></canvas>'+(options.overlay!==false?'<div style="position:absolute;left:0;right:0;top:'+((k==='edited'?actor.floorPivot:original.floorPivot||data.floorPivot)[1]/data.canvas[1]*100)+'%;border-top:1px dashed #f5cb6b;pointer-events:none"></div><div style="position:absolute;left:'+((k==='edited'?actor.floorPivot:original.floorPivot||data.floorPivot)[0]/data.canvas[0]*100)+'%;top:0;bottom:0;border-left:1px dashed #66aaff;pointer-events:none"></div>':'')+'</div>').join('')+'</div><p id="dev-motion-status" role="status"></p>';
  let next=new Map(),serial=0,t=0,last=null,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,raf=null,dead=false;
  const request=fn=>{next.set(++serial,fn);return serial;},cancel=id=>next.delete(id);
  const controllers=[S.create({canvas:$('#dev-original'),spec:original,requestFrame:request,cancelFrame:cancel}),S.create({canvas:$('#dev-edited'),spec:actor,requestFrame:request,cancelFrame:cancel})];
  controllers.forEach(c=>c.play(action));
  function fire(time){const callbacks=[...next.values()];next.clear();callbacks.forEach(fn=>fn(time));const s=controllers[1].snapshot();$('#dev-motion-status').textContent='Frame '+s.frame+' · '+s.action+(s.ready?'':' · loading texture');}
  function pump(now){if(dead)return;if(document.hidden){last=null;raf=requestAnimationFrame(pump);return;}if(!paused){t+=last===null?0:Math.max(0,now-last)*speed;fire(t);}last=now;raf=requestAnimationFrame(pump);}
  raf=requestAnimationFrame(pump);
  async function seek(frame){paused=true;const clip=actor.animations[action],index=Math.max(0,Math.min(clip.frames.length-1,Number(frame)||0));controllers.forEach(c=>c.play(action));const deadline=performance.now()+10000;while(controllers.some(c=>!c.snapshot().ready)){if(dead)return;if(performance.now()>deadline)throw Error('Texture could not be loaded.');await new Promise(resolve=>setTimeout(resolve,20));}t=clip.durationsMs?clip.durationsMs.slice(0,index).reduce((a,b)=>a+b,0):index*1000/clip.fps;t+=.01;fire(0);fire(t);return devMotion?.snapshot();}
  devMotion={destroy(){dead=true;cancelAnimationFrame(raf);controllers.forEach(c=>c.destroy());next.clear();},toggle(){paused=!paused;last=null;return paused;},seek,step(){return seek(controllers[1].snapshot().frame+1);},snapshot(){return {...controllers[1].snapshot(),paused,options:F.copy(options),frameCount:actor.animations[action].frames.length};}};
  devLast={kind:'motion',options:F.copy(options)};return devMotion.snapshot();
 }
 window.STMDevApi={
  catalog(){return {version:window.DCRelease?.version,maxHp:C.MAX_HP,enemies:C.enemies,events:Object.values(X.catalog),cards:K.data.cards,artifacts:Object.values(A.catalog),actors:{mc_01:S.data.hero,...S.data.actors}};},
  launch,snapshot,cards,testCard,motion:openMotion,
  loadRun(next){if(!E.validate(next))throw Error('Invalid preview.');devSetup={kind:'edited',scene:next.scene,stage:next.stage,seed:next.seed};devBaseline=F.copy(next);devLast={kind:'edited'};install(next);return snapshot();},
  playback(action,value){if(!devMotion)throw Error('Open a motion preview first.');return action==='seek'?devMotion.seek(value):action==='step'?devMotion.step():devMotion.toggle();},
  restart(){if(!devLast)return;const last=F.copy(devLast);if(last.kind==='scene'||last.kind==='cardCombat'||last.kind==='edited'){install(devBaseline);return snapshot();}if(last.kind==='cards')return cards(last.id,last.language,last.extra);return openMotion(last.options);},
  home(){cleanup();run=null;ui.home=true;render();},
  command(action){if(run?.scene!=='battle')throw Error('Open a combat first.');if(action==='refill'){run.hp=run.maxHp;run.battle.energy=A.maxEnergy(run);}else if(action==='turn')E.endTurn(run);else if(action==='draw')E.draw(run,1);else if(action==='win'||action==='lose'){const next=F.copy(run);F.forceResult(next,action);run=next;}else throw Error('Unknown command.');render();return snapshot();}
 };
}
