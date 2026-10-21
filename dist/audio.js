(function(root){
'use strict';
const ids=['menu','stage1_dungeon','stage2_dungeon','stage1_elite','stage2_elite','stage1_boss','stage2_boss','rest','shop','mystery'];
const clamp=(v,fallback)=>Number.isFinite(Number(v))?Math.max(0,Math.min(1,Number(v))):fallback;

function trackFor(run,home=false){
 if(home||!run)return 'menu';
 if(run.scene==='camp'||run.scene==='stageclear'||run.scene==='victory')return 'rest';
 if(run.scene==='master'||run.scene==='education'||run.scene==='event'||run.scene==='defeat')return 'mystery';
 if(run.scene==='shop')return 'shop';
 const prefix='stage'+(run.stage===1?2:1)+'_';
 if(run.scene==='battle'){
  if(['sentinel','dealer'].includes(run.battle?.enemyId))return prefix+'boss';
  if(run.battle?.elite)return prefix+'elite';
 }
 return prefix+'dungeon';
}

class Music{
 constructor(host=root){
  this.host=host;this.ctx=null;this.master=null;this.active=null;
  this.desired=null;this.routeTrack='menu';this.previewId=null;
  this.unlocked=false;this.muted=false;this.volume=.45;this.sfxVolume=.65;
  this.ducked=false;this.hidden=false;this.generation=0;
  this.loading=null;this.loadingGeneration=-1;this.cache=new Map();this.requests=new Map();
  this.status='Press any button to start music.';this.error=null;this.onchange=null;
 }
 get state(){return {current:this.active?.id||null,requested:this.desired,preview:this.previewId,muted:this.muted,volume:this.volume,status:this.status,error:this.error,unlocked:this.unlocked};}
 emit(){if(this.onchange)this.onchange(this.state);}
 context(){
  if(!this.ctx){
   const Context=this.host.AudioContext||this.host.webkitAudioContext;
   if(!Context){this.status='Audio is not available in this browser.';this.emit();return null;}
   try{this.ctx=new Context();this.master=this.ctx.createGain();this.master.gain.value=0;this.master.connect(this.ctx.destination);}
   catch(_){this.status='Audio is not available in this browser.';this.emit();return null;}
  }
  return this.ctx;
 }
 async unlock(){
  if(this.hidden)return;
  const ctx=this.context();if(!ctx)return;
  try{if(ctx.state==='suspended')await ctx.resume();this.unlocked=true;this.level();await this.playDesired();}
  catch(_){this.unlocked=false;this.status='Tap a button to enable audio.';this.emit();}
 }
 configure(settings={}){
  if(settings.volume!==undefined)this.volume=clamp(settings.volume,.45);
  if(settings.sfxVolume!==undefined)this.sfxVolume=clamp(settings.sfxVolume,.65);
  if(settings.muted!==undefined&&this.muted!==!!settings.muted){
   this.muted=!!settings.muted;this.generation++;
   if(this.muted){this.stop(.25);this.status='Music muted.';}
   else this.playDesired();
  }
  this.level();this.emit();
 }
 level(){
  if(!this.master)return;
  const gain=this.master.gain,now=this.ctx.currentTime;
  gain.cancelScheduledValues(now);gain.setValueAtTime(gain.value,now);
  gain.linearRampToValueAtTime(this.muted||this.hidden?0:this.volume*(this.ducked?.3:1),now+.2);
 }
 duck(value){if(this.ducked!==!!value){this.ducked=!!value;this.level();}}
 setRoute(run,home=false){this.routeTrack=trackFor(run,home);if(!this.previewId)this.setTrack(this.routeTrack);}
 preview(id){if(!ids.includes(id))return;this.previewId=id;this.setTrack(id);}
 endPreview(){this.previewId=null;this.setTrack(this.routeTrack);}
 setTrack(id){
  if(!ids.includes(id))return;
  if(this.desired!==id){this.desired=id;this.generation++;this.error=null;}
  return this.playDesired();
 }
 async readAudio(id){
  if(this.cache.has(id)){const b=this.cache.get(id);this.cache.delete(id);this.cache.set(id,b);return b;}
  if(this.requests.has(id))return this.requests.get(id);
  const task=(async()=>{
   const embedded=this.host.DC_MUSIC?.[id];let buffer;
   if(embedded){
    const raw=this.host.atob(embedded.slice(embedded.indexOf(',')+1));
    const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));buffer=await this.ctx.decodeAudioData(bytes.buffer);
   }else{
    let failure;
    for(const ext of ['ogg','mp3']){
     let timer,controller;
     try{
      if(this.host.AbortController){controller=new this.host.AbortController();timer=this.host.setTimeout(()=>controller.abort(),15000);}
      const response=await this.host.fetch('assets/music/'+id+'.'+ext,controller?{signal:controller.signal}:{});
      if(!response.ok)throw new Error('Missing audio');
      buffer=await this.ctx.decodeAudioData(await response.arrayBuffer());break;
     }catch(error){failure=error;}
     finally{if(timer)this.host.clearTimeout(timer);}
    }
    if(!buffer)throw failure||new Error('Audio unavailable');
   }
   this.cache.set(id,buffer);
   // Keep only two decoded tracks. The current source owns its own reference.
   while(this.cache.size>2)this.cache.delete(this.cache.keys().next().value);
   return buffer;
  })();
  this.requests.set(id,task);
  try{return await task;}finally{this.requests.delete(id);}
 }
 async playDesired(){
  const id=this.desired;
  if(!id||!this.unlocked||this.muted||this.hidden)return;
  if(this.active?.id===id)return;
  const token=this.generation;
  if(this.loading===id&&this.loadingGeneration===token)return;
  this.loading=id;this.loadingGeneration=token;this.status='Loading music…';this.emit();
  try{
   const buffer=await this.readAudio(id);
   // A slow response must never start an old scene or bypass a later mute.
   if(token!==this.generation||id!==this.desired||this.muted||this.hidden)return;
   const ctx=this.ctx,now=ctx.currentTime;
   const source=ctx.createBufferSource(),gain=ctx.createGain();
   source.buffer=buffer;source.loop=true;source.loopStart=0;source.loopEnd=buffer.duration;
   source.connect(gain);gain.connect(this.master);
   gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(1,now+.85);
   this.stop(.85);this.active={id,source,gain};
   source.onended=()=>{source.disconnect();gain.disconnect();};source.start(now);
   this.status='Playing';this.error=null;this.level();this.emit();
  }catch(_){
   if(token===this.generation){this.stop(.4);this.error='Music could not load. You can keep playing.';this.status=this.error;this.emit();}
  }finally{if(this.loading===id&&this.loadingGeneration===token)this.loading=null;}
 }
 stop(fade=.3){
  const old=this.active;if(!old)return;this.active=null;
  const now=this.ctx.currentTime;
  old.gain.gain.cancelScheduledValues(now);old.gain.gain.setValueAtTime(old.gain.gain.value,now);
  old.gain.gain.linearRampToValueAtTime(0,now+fade);
  try{old.source.stop(now+fade+.02);}catch(_){}
 }
 async setHidden(value){
  this.hidden=!!value;this.generation++;this.level();
  if(value){
   this.stop(.08);this.status='Music paused.';
   if(this.ctx)try{await this.ctx.suspend();}catch(_){}
   // Visibility can change before suspend resolves. Resume the current scene,
   // rather than leaving a visible page suspended by an older hide request.
   if(!this.hidden&&this.unlocked)await this.unlock();
   this.emit();
  }
  else if(this.unlocked)await this.unlock();
 }
}
if(typeof module!=='undefined')module.exports={trackFor,Music};
else root.DCAudio=new Music(root);
})(typeof window!=='undefined'?window:globalThis);
