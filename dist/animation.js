/* Presentation only: atlas frames never resolve combat, rewards, questions or RNG. */
(function(root){
 'use strict';
 const D=typeof module!=='undefined'?require('./animation-data.js'):root.DCAnimationData;
 const textures=new Map();
 const actionName=pose=>pose==='standing'?'idle':pose==='damage'?'damaged':pose;
 function spec(stage,id){const actor=id==='mc_01'?D.hero:D.actors[id];return actor&&(actor.stages?actor.stages.includes(stage):actor.stage===stage)?actor:null;}
 function intentAction(stage,id,intent){
  const actor=spec(stage,id);
  return actor?.intentActions?.[intent.label]||(actor&&intent.block?'defend':intent.block||/burst|storm|pulse|wave/i.test(intent.label)?'skill':'attack');
 }
 function texture(path){
  if(textures.has(path)){const promise=textures.get(path);textures.delete(path);textures.set(path,promise);return promise;}
  const promise=(async()=>{const image=new root.Image();image.src=root.DC_ASSETS?.[path]||'assets/'+path;await image.decode();return image;})();
  textures.set(path,promise);while(textures.size>4)textures.delete(textures.keys().next().value);
  promise.catch(()=>{if(textures.get(path)===promise)textures.delete(path);});return promise;
 }
 function create({canvas,spec:actor,load=texture,requestFrame=fn=>root.requestAnimationFrame(fn),cancelFrame=id=>root.cancelAnimationFrame(id),motion=true,paused=false}){
  const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return null;
  const host=canvas.parentElement;
  let dead=false,generation=0,raf=null,current='idle',frame=0,image=null,elapsed=0,lastTime=null,ready=false;
  ctx.imageSmoothingEnabled=true;
  function cancel(){if(raf!==null)cancelFrame(raf);raf=null;lastTime=null;}
  function paint(index){
   if(dead||!image)return;const clip=actor.animations[current],rect=clip.frames[index];
   const pivot=clip.pivots?.[index]||actor.sourcePivot||D.sourcePivot,scale=(actor.drawScale??D.drawScale)*(clip.scales?.[index]??1);
   ctx.clearRect(0,0,D.canvas[0],D.canvas[1]);
   const floor=actor.floorPivot||D.floorPivot;
   ctx.drawImage(image,...rect,floor[0]-pivot[0]*scale,floor[1]-pivot[1]*scale,rect[2]*scale,rect[3]*scale);
   frame=index;ready=true;host.dataset.animationReady='true';
   canvas.dataset.action=current;canvas.dataset.frame=String(index);canvas.dataset.texture=clip.image;
  }
  function schedule(){if(!dead&&ready&&motion&&!paused&&raf===null)raf=requestFrame(tick);}
  function tick(time){
   raf=null;if(dead||paused||!motion||!image)return;
   if(lastTime!==null)elapsed+=Math.max(0,time-lastTime);lastTime=time;
   const clip=actor.animations[current];let index;
   if(clip.durationsMs){
    const total=clip.durationsMs.reduce((sum,ms)=>sum+ms,0);
    if(!clip.loop&&elapsed>=total){play('idle');return;}
    let time=clip.loop?elapsed%total:elapsed;index=0;
    while(index<clip.frames.length-1&&time>=clip.durationsMs[index]){time-=clip.durationsMs[index];index++;}
   }else index=Math.floor(elapsed*clip.fps/1000);
   if(!clip.loop&&index>=clip.frames.length){play('idle');return;}
   const next=clip.loop?index%clip.frames.length:Math.min(index,clip.frames.length-1);
   if(next!==frame)paint(next);schedule();
  }
  function play(pose){
   if(dead)return;cancel();
   const wanted=motion?actionName(pose):'idle',action=actor.animations[wanted]?wanted:'idle',token=++generation;
   current=action;elapsed=0;frame=0;ready=false;image=null;
   Promise.resolve(load(actor.animations[action].image)).then(loaded=>{
    if(dead||token!==generation)return;image=loaded;paint(0);schedule();
   }).catch(()=>{
    if(dead||token!==generation)return;
    if(action!=='idle'){play('idle');return;}
    delete host.dataset.animationReady;ready=false;image=null;
   });
  }
  function configure(options){
   if(dead)return;const changed=options.motion!==undefined&&motion!==!!options.motion;
   if(options.motion!==undefined)motion=!!options.motion;
   if(options.paused!==undefined)paused=!!options.paused;
   cancel();if(changed){play('idle');return;}schedule();
  }
  function destroy(){if(dead)return;dead=true;generation++;cancel();image=null;ready=false;delete host.dataset.animationReady;}
  function snapshot(){return {actor:actor.id,action:current,frame,paused,motion,ready,destroyed:dead};}
  play('idle');return {play,configure,destroy,snapshot};
 }
 function mount(canvas,stage,id,options={}){
  const actor=spec(stage,id);
  if(!actor||!canvas||typeof root.CanvasRenderingContext2D!=='function')return null;
  return create({canvas,spec:actor,...options});
 }
 const api={data:D,spec,intentAction,supports:(stage,id)=>!!spec(stage,id),create,mount};
 if(typeof module!=='undefined')module.exports=api;else root.DCActorAnimation=api;
})(typeof window!=='undefined'?window:globalThis);
