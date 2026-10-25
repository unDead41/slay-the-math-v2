/* Presentation only: atlas frames never resolve combat, rewards, questions or RNG. */
(function(root){
 'use strict';
 const D=typeof module!=='undefined'?require('./animation-data.js'):root.DCAnimationData;
 function createTextureCache({load,budgetBytes=96*1024*1024}){
  const entries=new Map(),owners=new Map();let bytes=0,loads=0,hits=0;
  const budget=Number.isFinite(budgetBytes)&&budgetBytes>=0?Math.floor(budgetBytes):96*1024*1024;
  function held(){return {active:new Set([...owners.values()].map(v=>v.current)),idle:new Set([...owners.values()].map(v=>v.idle))};}
  function remove(path,entry){if(entries.get(path)!==entry)return;entries.delete(path);bytes-=entry.bytes;}
  function trim(){const {active,idle}=held();while(bytes>budget){const ready=[...entries].filter(([path,e])=>e.image&&!active.has(path)),victim=ready.find(([path])=>!idle.has(path))||ready[0];if(!victim)break;remove(...victim);}}
  function get(path){
   let entry=entries.get(path);if(entry){entries.delete(path);entries.set(path,entry);hits++;return entry.promise;}
   entry={bytes:0,image:null,promise:null};entries.set(path,entry);loads++;
   entry.promise=Promise.resolve().then(()=>load(path)).then(image=>{const width=image?.naturalWidth||image?.width||0,height=image?.naturalHeight||image?.height||0;if(!width||!height)throw Error('Decoded texture has no size');if(entries.get(path)===entry){entry.image=image;entry.bytes=width*height*4;bytes+=entry.bytes;trim();}return image;}).catch(error=>{remove(path,entry);throw error;});return entry.promise;
  }
  return {load:get,retain(owner,current,idle=current){owners.set(owner,{current,idle});trim();},release(owner){owners.delete(owner);trim();},forget(path){const entry=entries.get(path);if(entry&&(!entry.image||!held().active.has(path)))remove(path,entry);},stats:()=>({bytes,budgetBytes:budget,overBudgetBytes:Math.max(0,bytes-budget),entries:entries.size,pending:[...entries.values()].filter(e=>!e.image).length,owners:owners.size,loads,hits})};
 }
 const textureCache=createTextureCache({load:decodeTexture});
 const actionName=pose=>pose==='standing'?'idle':pose==='damage'?'damaged':pose;
 function spec(stage,id){const actor=id==='mc_01'?D.hero:D.actors[id];return actor&&(actor.stages?actor.stages.includes(stage):actor.stage===stage)?actor:null;}
 function intentAction(stage,id,intent){
  const actor=spec(stage,id);
  return actor?.intentActions?.[intent.label]||(actor&&intent.block?'defend':intent.block||/burst|storm|pulse|wave/i.test(intent.label)?'skill':'attack');
 }
 async function decodeTexture(path){
  const image=new root.Image();let url;
  try{if(root.STMHosted?.manager){const response=await root.STMHosted.manager.fetchAsset('assets/'+path,{priority:0});url=root.URL.createObjectURL(await response.blob());image.src=url;}else image.src=root.DC_ASSETS?.[path]||'assets/'+path;await image.decode();return image;}
  finally{if(url)root.URL.revokeObjectURL(url);}
 }
 function texture(path){return textureCache.load(path);}
 function create({canvas,spec:actor,load=texture,requestFrame=fn=>root.requestAnimationFrame(fn),cancelFrame=id=>root.cancelAnimationFrame(id),motion=true,paused=false}){
  const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return null;
  const host=canvas.parentElement,textureOwner={},cache=load===texture?textureCache:null;
  let dead=false,generation=0,raf=null,current='idle',frame=0,sourceFrame=0,image=null,elapsed=0,lastTime=null,ready=false;
  ctx.imageSmoothingEnabled=true;
  function cancel(){if(raf!==null)cancelFrame(raf);raf=null;lastTime=null;}
  function sourceIndex(index){
   const clip=actor.animations[current],blink=clip.blink;
   if(!clip.loop||!blink||!blink.frames.includes(index))return index;
   const total=clip.durationsMs?clip.durationsMs.reduce((sum,ms)=>sum+ms,0):clip.frames.length*1000/clip.fps;
   return Math.floor(elapsed/total)%blink.everyLoops===blink.everyLoops-1?index:blink.openFrame;
  }
  function paint(index){
   if(dead||!image)return;const clip=actor.animations[current],source=sourceIndex(index),rect=clip.frames[source];
   const pivot=clip.pivots?.[source]||actor.sourcePivot||D.sourcePivot,scale=(actor.drawScale??D.drawScale)*(clip.scales?.[source]??1);
   ctx.clearRect(0,0,D.canvas[0],D.canvas[1]);
   const floor=actor.floorPivot||D.floorPivot;
   ctx.drawImage(image,...rect,floor[0]-pivot[0]*scale,floor[1]-pivot[1]*scale,rect[2]*scale,rect[3]*scale);
   frame=index;sourceFrame=source;ready=true;host.dataset.animationReady='true';
   canvas.dataset.action=current;canvas.dataset.frame=String(index);canvas.dataset.sourceFrame=String(source);canvas.dataset.texture=clip.image;
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
   if(next!==frame||sourceIndex(next)!==sourceFrame)paint(next);schedule();
  }
  function play(pose){
   if(dead)return;cancel();
   const wanted=motion?actionName(pose):'idle',action=actor.animations[wanted]?wanted:'idle',token=++generation;
   cache?.retain(textureOwner,actor.animations[action].image,actor.animations.idle.image);
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
   if(dead)return;const changed=options.motion!==undefined&&motion!==!!options.motion,pauseChanged=options.paused!==undefined&&paused!==!!options.paused;
   if(!changed&&!pauseChanged)return;
   if(options.motion!==undefined)motion=!!options.motion;
   if(options.paused!==undefined)paused=!!options.paused;
   cancel();if(changed){play('idle');return;}schedule();
  }
  function destroy(){if(dead)return;dead=true;generation++;cancel();image=null;ready=false;cache?.release(textureOwner);delete host.dataset.animationReady;}
  function snapshot(){return {actor:actor.id,action:current,frame,sourceFrame,paused,motion,ready,destroyed:dead};}
  play('idle');return {play,configure,destroy,snapshot};
 }
 function mount(canvas,stage,id,options={}){
  const actor=spec(stage,id);
  if(!actor||!canvas||typeof root.CanvasRenderingContext2D!=='function')return null;
  return create({canvas,spec:actor,...options});
 }
 function preload(stage,id){const actor=spec(stage,id);return actor?texture(actor.animations.idle.image):Promise.reject(Error('Unknown actor for this stage'));}
 function forgetPreload(stage,id){const actor=spec(stage,id);if(actor)textureCache.forget(actor.animations.idle.image);}
 const api={data:D,spec,intentAction,preload,forgetPreload,createTextureCache,cacheStats:()=>textureCache.stats(),supports:(stage,id)=>!!spec(stage,id),create,mount};
 if(typeof module!=='undefined')module.exports=api;else root.DCActorAnimation=api;
})(typeof window!=='undefined'?window:globalThis);
