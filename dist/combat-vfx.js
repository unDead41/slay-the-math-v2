/* Live, read-only compositor for the reviewed Shield V3 / Passive V10 / stat V9 fields. */
(function(root){'use strict';
 const attributes=['strength','agility','defense'],barriers=['thorns','weak','vulnerable'];
 // Visible idle alpha heights in the unchanged, floor-registered 1600x1200 posters.
 const bodyHeight={mc_01:539,wisp:999,beetle:998,bat:1000,knight:999,shard:999,weaver:947,shade:936,mimic:675,golem:812,reaper:957,sentinel:832,dealer:836};
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
 function create(options={}){
  const doc=options.document||root.document,win=doc.defaultView||root,media=win.matchMedia?.('(prefers-reduced-motion: reduce)');
  const A=root.STMAuraField,P=root.STMPassiveField,S=root.STMShieldField;
  if(typeof win.CanvasRenderingContext2D==='undefined'||!A||!P||!S)return null;
  let state=null,clock=0,last=0,lastPaint=0,raf=0,dead=false,pageHidden=false,frames=0,average=0,slow=false;
  const actors=new Map(),enabled=()=>!dead&&!pageHidden&&!doc.hidden&&options.motion?.()!==false&&!media?.matches&&!doc.querySelector('#dialog[open]');
  function stop(){if(raf)win.cancelAnimationFrame(raf);raf=0;last=0;lastPaint=0;}
  function clearActor(actor){for(const c of actor.canvases){const ctx=c.getContext('2d');ctx?.clearRect(0,0,c.width,c.height);c.dataset.vfxState='paused';}}
  function dispose(actor){for(const field of actor.fields.values())field.destroy?.();actor.fields.clear();actor.passive=null;actor.body.width=actor.body.height=1;clearActor(actor);}
  function reset(){stop();for(const actor of actors.values())dispose(actor);actors.clear();state=null;clock=0;slow=false;average=0;}
  function linked(role){
   const canvases=[...doc.querySelectorAll('.'+role+' .combat-vfx-canvas')];if(canvases.length!==2)return null;
   let actor=actors.get(role);if(actor&&actor.canvases.every((c,i)=>c===canvases[i]))return actor;
   if(actor)dispose(actor);
   actor={role,canvases,body:doc.createElement('canvas'),fields:new Map(),passive:null,passiveOrder:[],statOrder:[],rings:new Map(),events:new Map(),values:{},flowKey:'',flows:new Map(),supported:false};
   actors.set(role,actor);return actor;
  }
  function request(){if(!raf&&state&&enabled())raf=win.requestAnimationFrame(tick);}
  function cancelBursts(){for(const actor of actors.values())actor.events.clear();}
  function cancel(){stop();cancelBursts();for(const actor of actors.values())clearActor(actor);}
  function mount(next){
   if(!next){reset();return;}
   const first=!state||state.identity!==next.identity||next.seq<state.seq;if(first)reset();state=next;
   for(const role of ['player','enemy']){
    const actor=linked(role);if(!actor)continue;const view=next.actors?.[role];actor.values=view?.values||{};
    const equipped=view?.equipped||[],order=actor.passiveOrder.filter(p=>equipped.includes(p.source));
    for(const passive of view?.passives||[])if(!order.some(p=>p.id===passive.id))order.push(passive);
    if(order.map(p=>p.id).join()!==actor.passiveOrder.map(p=>p.id).join()){
     if(!actor.passive){actor.passive=P.create();actor.passive.setSelection([] ,clock,{immediate:true});}
     actor.passive.setSelection(order.map(p=>p.id),clock,{immediate:first,intro:!first&&order.length>actor.passiveOrder.length});actor.passiveOrder=order;
    }
   }
   sync();
  }
  function play(batch){
   if(!state||dead||pageHidden||doc.hidden)return;
   const start=clock+(batch?.leadMs||0)/1000;
   for(const role of ['player','enemy']){
    const actor=actors.get(role);if(!actor)continue;
    for(const e of batch?.visuals?.[role]||[]){
     const list=actor.events.get(e.id)||[],prior=list.at(-1),delay=prior&&prior.start+prior.duration>start?prior.start+prior.duration:start;
     const duration=attributes.includes(e.id)?.85:e.event==='gain'?1.6:e.event==='hit'?1:e.id==='block'?(e.event==='break'?1.65:1.3):1.7;
     list.push({...e,start:delay,duration});actor.events.set(e.id,list);
    }
   }
   request();
  }
  function sync(){if(!state||!enabled()){cancel();return;}last=0;request();}
  function ringAt(actor,id){const v=actor.rings.get(id);if(!v)return A.ringLayout();const t=ease((clock-v.start)/.72);return Object.fromEntries(Object.keys(v.to).map(k=>[k,v.from[k]+(v.to[k]-v.from[k])*t]));}
  function orderedStats(actor){
   const order=actor.statOrder.filter(id=>actor.values[id]||actor.events.has(id));for(const id of attributes)if((actor.values[id]||actor.events.has(id))&&!order.includes(id))order.push(id);
   if(order.join()!==actor.statOrder.join()){
    const rings=new Map();order.forEach((id,slot)=>{const to=A.ringLayout(order.length,slot);rings.set(id,{from:actor.rings.has(id)?ringAt(actor,id):to,to,start:clock});});actor.rings=rings;actor.statOrder=order;
   }
   return order;
  }
  function eventAt(actor,id){const list=actor.events.get(id);if(!list)return null;return list.find(e=>clock<e.start+e.duration)||null;}
  function prune(actor){for(const [id,list]of actor.events){const next=list.filter(e=>clock<e.start+e.duration);if(next.length)actor.events.set(id,next);else actor.events.delete(id);}}
  function measure(actor,quality){
   const r=actor.canvases[0].getBoundingClientRect();if(!r.width||!r.height)return false;
   const ratio=Math.min(win.devicePixelRatio||1,quality==='low'?1:1.5,Math.sqrt((quality==='low'?400000:800000)/(r.width*r.height)));
   const width=Math.max(1,Math.round(r.width*ratio)),height=Math.max(1,Math.round(r.height*ratio));
   for(const c of [...actor.canvases,actor.body])if(c.width!==width||c.height!==height){c.width=width;c.height=height;}
   const element=actor.canvases[0].closest('.combatant'),id=actor.role==='player'?'mc_01':element?.dataset.enemy;
   const spec=actor.role==='player'?root.DCAnimationData?.hero:root.DCAnimationData?.actors[id],foot=spec?.floorPivot||root.DCAnimationData?.floorPivot||[800,1100];
   actor.geometry={width:r.width,height:r.height,ratio,footX:r.width*foot[0]/1600,footY:r.height*foot[1]/1200,unit:r.width/1600,scale:(bodyHeight[id]||900)/350};
   return true;
  }
  function field(actor,id){if(!actor.fields.has(id))actor.fields.set(id,id==='block'?S.create():A.create());return actor.fields.get(id);}
  function transform(ctx,g,role){ctx.setTransform(g.ratio*g.unit,0,0,g.ratio*g.unit,g.footX*g.ratio,g.footY*g.ratio);ctx.scale((role==='enemy'?-1:1)*g.scale,g.scale);}
  function paintActor(actor,quality,profile){
   prune(actor);const stats=orderedStats(actor),active=[...stats,...['block',...barriers].filter(id=>actor.values[id]||actor.events.has(id))];
   const fading=actor.passive?.snapshot(clock).tracks.some(t=>t.weight>.001),alive=active.length>0||actor.passiveOrder.length>0||fading;
   if(!measure(actor,quality))return false;
   const contexts=actor.canvases.map(c=>c.getContext('2d')),body=actor.body.getContext('2d');
   if(!A||!P||!S||!body||![body,...contexts].every(c=>typeof c?.setTransform==='function'&&typeof c?.save==='function'))return false;
   actor.supported=true;const g=actor.geometry,ids=stats.map(id=>id+'-'+(eventAt(actor,id)?.event||((actor.values[id]||0)>0?'up':'down'))),key=[profile,ids.join()].join(':');
   if(key!==actor.flowKey){actor.flows=new Map(A.planStatParticles(ids,{quality:profile,actor:actor.role}).map(v=>[v.attribute,v.flow]));actor.flowKey=key;}
   const keep=new Set(active);for(const [id,f]of actor.fields)if(!keep.has(id)){f.destroy?.();actor.fields.delete(id);}
   for(let side=0;side<2;side++){
    const ctx=contexts[side],front=side===1;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    if(actor.passive&&(actor.passiveOrder.length||actor.passive.snapshot(clock).tracks.some(t=>t.weight>.001))){ctx.save();transform(ctx,g,actor.role);actor.passive.paint(ctx,clock,{quality,front});ctx.restore();}
    body.setTransform(1,0,0,1,0,0);body.clearRect(0,0,actor.body.width,actor.body.height);body.save();transform(body,g,actor.role);
    for(const id of active){
     const event=eventAt(actor,id),age=event?clock-event.start:0;body.save();
     if(attributes.includes(id)){
      const sign=event&&age<0?((event.from||0)>0?'up':'down'):event?.event||((actor.values[id]||0)>0?'up':'down'),alpha=event?(age<0?Number(!!event.from):ease(age/.12)*(actor.values[id]?1:1-ease((age-.45)/.4))):1;
      field(actor,id).paint(body,clock,id+'-'+sign,{quality:profile,front,ring:ringAt(actor,id),flow:actor.flows.get(id),alpha:alpha*(active.length>3?.65:.88)});
     }else{
      const waiting=event&&age<0,kind=waiting?'active':event?.event||'active',speed=1.8,offset=kind==='hit'||kind==='break'?1.55:kind==='expire'?(id==='block'?1.55:id==='weak'?1.35:1.1):0;
      const continues=event&&actor.events.get(id)?.some(e=>e.start>event.start),refresh=id==='block'&&kind==='gain'&&event.from>0;
      const time=event&&!waiting?offset+age*speed:clock,alpha=waiting?Number(event.event!=='gain'||!!event.from):event&&kind==='hit'&&!actor.values[id]&&!continues?1-ease((age-.65)/.35):1;
      if(id==='block')field(actor,id).paint(body,refresh?clock:time,refresh?'active':kind,{loop:refresh||!event,quality,front,alpha:alpha*(active.length>3?.68:.9)*(refresh?1+.08*Math.sin(Math.PI*clamp(age/1.6)):1)});
      else field(actor,id).paint(body,time,id+'-'+kind,{loop:!event,quality:profile,front,alpha:alpha*(active.length>3?.7:.9)});
     }
     body.restore();
    }
    body.restore();
    // Body VFX fade above the feet. Only the separate Passive pass owns floor pixels.
    body.setTransform(1,0,0,1,0,0);body.globalCompositeOperation='destination-in';body.globalAlpha=1;
    const y=g.footY*g.ratio,s=g.scale*g.unit*g.ratio,mask=body.createLinearGradient(0,y-30*s,0,y-5*s);mask.addColorStop(0,'#fff');mask.addColorStop(1,'#fff0');body.fillStyle=mask;body.fillRect(0,0,actor.body.width,actor.body.height);body.globalCompositeOperation='source-over';
    ctx.drawImage(actor.body,0,0);
    if(frames%6===0||!alive){const c=actor.canvases[side];c.dataset.vfxState=alive?'playing':'empty';c.dataset.vfxClock=clock.toFixed(3);c.dataset.vfxQuality=profile;c.dataset.vfxCostMs=average.toFixed(2);c.dataset.vfxFrames=String(frames);c.dataset.vfxEffects=active.join(',');c.dataset.vfxPassives=JSON.stringify(actor.passive?.snapshot(clock).tracks.filter(t=>t.weight>.001).map(t=>({id:t.id,radius:Number(t.radius.toFixed(2))}))||[]);c.dataset.vfxEvents=JSON.stringify([...actor.events.values()].flat().map(e=>({id:e.id,event:e.event})));c.dataset.vfxFloor=actor.passiveOrder.length||fading?'passive':'none';c.dataset.vfxParticles=JSON.stringify([...actor.flows].map(([id,f])=>({id,radius:f.radius,count:f.perRail*2})));}
   }
   return alive;
  }
  function tick(now){
   raf=0;if(!state||!enabled()){cancel();return;}
   if(last)clock+=Math.min(.08,Math.max(0,(now-last)/1000));last=now;
   const quality=options.quality?.()==='low'||slow?'low':'full',interval=quality==='low'?32:16;
   if(lastPaint&&now-lastPaint<interval){request();return;}lastPaint=now;
   let active=false;const count=[...actors.values()].reduce((n,a)=>n+new Set([...Object.keys(a.values),...a.events.keys()]).size+Number(a.passiveOrder.length>0),0),profile=quality==='low'?(count>=6?'dense-low':'low'):count>=7?'dense':count>=3?'multi':'full',started=win.performance.now();
   for(const actor of actors.values())active=paintActor(actor,quality,profile)||active;
   frames++;average=average*.9+(win.performance.now()-started)*.1;if(frames>=12&&average>21)slow=true;
   if(active)request();
  }
  const visibility=()=>sync(),hide=()=>{pageHidden=true;cancel();},show=()=>{pageHidden=false;sync();},resize=()=>{cancelBursts();sync();};
  const bindings=[[doc,'visibilitychange',visibility],[win,'pagehide',hide],[win,'pageshow',show],[win,'resize',resize],[media,'change',sync]];
  for(const [target,event,fn]of bindings)target?.addEventListener?.(event,fn);
  return {mount,play,sync,cancel,cancelBursts,reset,destroy(){dead=true;reset();for(const [target,event,fn]of bindings)target?.removeEventListener?.(event,fn);}};
 }
 const api={create};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DCCombatVFX=api;
})(typeof window!=='undefined'?window:globalThis);
