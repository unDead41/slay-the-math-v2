(function(root){
'use strict';
const defaults=root.DCAudioAssets||(typeof module!=='undefined'?require('./music-data.js').assets:null);
const clamp=(v,fallback)=>Number.isFinite(Number(v))?Math.max(0,Math.min(1,Number(v))):fallback;
function trackFor(run,home=false,presentation={}){
 if(home||!run)return 'menu';
 if(presentation.surface==='artifact'||presentation.surface==='education')return 'mystery';
 if(run.scene==='defeat')return 'bgm_defeat';
 if(['camp','stageclear','victory'].includes(run.scene))return 'bgm_rest';
 if(['master','education','event'].includes(run.scene))return 'mystery';
 if(run.scene==='shop')return 'bgm_shop';
 if(run.scene==='map')return 'bgm_map';
 const stage=run.stage===1?2:1;
 if(run.scene==='battle'){
  const definition=root.DCConfig?.enemies?.[run.battle?.enemyId];
  const boss=typeof presentation.boss==='boolean'?presentation.boss:(definition?!!definition.boss:!!run.battle?.boss);
  return 'bgm_'+(boss?'boss':'combat')+'_stage_'+stage;
 }
 // Reward and other legacy combat-adjacent surfaces retain the stage cue.
 return 'bgm_combat_stage_'+stage;
}
class Music{
 constructor(host=root){
  this.host=host;this.assets=host.DCAudioAssets||defaults||{assets:{},aliases:{},voiceSequences:{}};
  this.ctx=null;this.master=null;this.voiceMaster=null;this.active=null;this.voiceActive=null;
  this.musicTails=new Set();this.voiceTails=new Set();
  this.desired=null;this.routeTrack='menu';this.previewId=null;
  this.unlocked=false;this.muted=false;this.volume=.45;this.sfxVolume=.65;
  this.voiceMuted=false;this.voiceVolume=.85;this.hidden=false;
  this.ducked=false;this.ducks=new Map();this.generation=0;this.voiceGeneration=0;
  this.loading=null;this.loadingGeneration=-1;this.cache=new Map();this.requests=new Map();
  this.voiceSurface=null;this.voiceOwner=null;this.pendingVoice=null;
  this.voiceDelayTimer=null;this.voiceDeadlineTimer=null;this.voiceWatchdog=null;
  this.status='Press any button to start music.';this.voiceStatus='';this.error=null;this.onchange=null;
 }
 get duckFactor(){return Math.min(1,...this.ducks.values());}
 get state(){return {current:this.active?.id||null,requested:this.desired,preview:this.previewId,muted:this.muted,volume:this.volume,status:this.status,error:this.error,unlocked:this.unlocked,voice:this.voiceActive?.id||null,voiceMuted:this.voiceMuted,voiceVolume:this.voiceVolume,voiceStatus:this.voiceStatus,duckFactor:this.duckFactor};}
 emit(){if(this.onchange)this.onchange(this.state);}
 resolve(id){const key=this.assets?.aliases?.[id]||id;return Object.hasOwn(this.assets?.assets||{},key)?key:null;}
 context(){
  if(!this.ctx){
   const Context=this.host.AudioContext||this.host.webkitAudioContext;
   if(!Context){this.status='Audio is not available in this browser.';this.emit();return null;}
   try{
    this.ctx=new Context();this.master=this.ctx.createGain();this.master.gain.value=0;this.master.connect(this.ctx.destination);
    this.voiceMaster=this.ctx.createGain();this.voiceMaster.gain.value=0;this.voiceMaster.connect(this.ctx.destination);
   }catch(_){this.status='Audio is not available in this browser.';this.emit();return null;}
  }
  return this.ctx;
 }
 async unlock(){
  if(this.hidden)return;
  const ctx=this.context();if(!ctx)return;
  try{
   if(ctx.state==='suspended')await ctx.resume();
   if(this.hidden||ctx.state!=='running')return;
   this.unlocked=true;this.level();
   // A long BGM fetch must not delay the current NPC greeting.
   await Promise.all([this.playDesired(),this.playPendingVoice()]);
  }catch(_){this.unlocked=false;this.status='Tap a button to enable audio.';this.emit();}
 }
 configure(settings={}){
  if(settings.volume!==undefined)this.volume=clamp(settings.volume,.45);
  if(settings.sfxVolume!==undefined)this.sfxVolume=clamp(settings.sfxVolume,.65);
  if(settings.voiceVolume!==undefined)this.voiceVolume=clamp(settings.voiceVolume,.85);
  if(settings.voiceMuted!==undefined)this.voiceMuted=!!settings.voiceMuted;
  if(this.voiceMuted||this.voiceVolume===0){
   this.voiceGeneration++;this.pendingVoice=null;this.cancelLoads('voice');this.stopVoice(.08);
  }
  if(settings.muted!==undefined&&this.muted!==!!settings.muted){
   this.muted=!!settings.muted;this.generation++;
   if(this.muted){this.cancelLoads('bgm');this.stop(.25);this.status='Music muted.';}
   else this.playDesired();
  }
  this.level();this.emit();
 }
 ramp(node,value,seconds){
  if(!node||!this.ctx)return;const gain=node.gain,now=this.ctx.currentTime;
  gain.cancelScheduledValues(now);gain.setValueAtTime(gain.value,now);gain.linearRampToValueAtTime(value,now+seconds);
 }
 level(seconds=.2){
  this.ramp(this.master,this.muted||this.hidden?0:this.volume*this.duckFactor,seconds);
  this.ramp(this.voiceMaster,this.voiceMuted||this.hidden?0:this.voiceVolume,.08);
 }
 duck(value){this.ducked=!!value;this.setDuck('predict',value?.3:1);}
 setDuck(reason,factor){
  const before=this.duckFactor;if(factor<1)this.ducks.set(reason,factor);else this.ducks.delete(reason);
  const after=this.duckFactor;if(before!==after)this.level(after<before?.15:.35);
 }
 setRoute(run,home=false,presentation={}){
  this.routeTrack=trackFor(run,home,presentation);if(!this.previewId)this.setTrack(this.routeTrack);
  this.syncVoice(home&&!presentation.voiceOwner?null:presentation.encounter,presentation.voiceOwner||run);
 }
 preview(id){const key=this.resolve(id);if(!key||this.assets.assets[key].bus!=='bgm')return;this.previewId=key;this.setTrack(key);}
 endPreview(){this.previewId=null;this.setTrack(this.routeTrack);}
 setTrack(id){
  const key=this.resolve(id);if(!key||this.assets.assets[key].bus!=='bgm')return;
  if(this.desired!==key){this.desired=key;this.generation++;this.error=null;this.cancelLoads('bgm',key);}
  return this.playDesired();
 }
 cancelLoads(bus,except){
  for(const [id,request]of this.requests){
   if(request.bus!==bus||id===except)continue;
   request.cancelled=true;for(const controller of request.controllers)controller.abort();
   this.requests.delete(id);
  }
 }
 async readAudio(id){
  if(this.cache.has(id)){const buffer=this.cache.get(id);this.cache.delete(id);this.cache.set(id,buffer);return buffer;}
  if(this.requests.has(id))return this.requests.get(id).promise;
  const asset=this.assets.assets[id],request={bus:asset.bus,cancelled:false,controllers:new Set(),promise:null};
  request.promise=(async()=>{
   const embedded=(asset.bus==='voice'?this.host.DC_VOICE:this.host.DC_MUSIC)?.[id];let buffer;
   if(embedded){
    const raw=this.host.atob(embedded.slice(embedded.indexOf(',')+1));
    const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));buffer=await this.ctx.decodeAudioData(bytes.buffer);
   }else{
    let failure;
    for(const src of asset.srcs){
     let timer,controller;
     try{
      if(request.cancelled)throw new Error('Audio request superseded');
      if(!this.host.STMHosted?.manager&&this.host.AbortController){controller=new this.host.AbortController();request.controllers.add(controller);timer=this.host.setTimeout(()=>controller.abort(),15000);}
      const response=this.host.STMHosted?.manager?await this.host.STMHosted.manager.fetchAsset(src,{priority:0}):await this.host.fetch(src,controller?{signal:controller.signal}:{});
      if(!response.ok)throw new Error('Missing audio');
      const bytes=await response.arrayBuffer();
      if(request.cancelled)throw new Error('Audio request superseded');
      buffer=await this.ctx.decodeAudioData(bytes);break;
     }catch(error){failure=error;if(request.cancelled)break;}
     finally{if(timer)this.host.clearTimeout(timer);if(controller)request.controllers.delete(controller);}
    }
    if(!buffer)throw failure||new Error('Audio unavailable');
   }
   if(request.cancelled)throw new Error('Audio request superseded');
   this.cache.set(id,buffer);
   // Two BGM plus two short voices, keyed by canonical asset rather than aliases.
   const sameBus=[...this.cache.keys()].filter(key=>this.assets.assets[key].bus===asset.bus);
   while(sameBus.length>2)this.cache.delete(sameBus.shift());
   return buffer;
  })();
  this.requests.set(id,request);
  try{return await request.promise;}finally{if(this.requests.get(id)===request)this.requests.delete(id);}
 }
 async playDesired(){
  const id=this.desired;
  if(!id||!this.unlocked||this.muted||this.hidden||this.ctx?.state!=='running')return;
  if(this.active?.id===id)return;
  const token=this.generation;
  if(this.loading===id&&this.loadingGeneration===token)return;
  this.loading=id;this.loadingGeneration=token;this.status='Loading music…';this.emit();
  try{
   const buffer=await this.readAudio(id);
   if(token!==this.generation||id!==this.desired||this.muted||this.hidden||this.ctx.state!=='running')return;
   const ctx=this.ctx,now=ctx.currentTime,asset=this.assets.assets[id];
   const source=ctx.createBufferSource(),gain=ctx.createGain();
   source.buffer=buffer;source.loop=asset.loop;source.loopStart=0;source.loopEnd=buffer.duration;source.playbackRate.value=asset.playbackRate;
   source.connect(gain);gain.connect(this.master);
   gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(1,now+.85);
   this.stop(.85);const active={id,source,gain};this.active=active;
   source.onended=()=>{this.musicTails.delete(active);source.disconnect();gain.disconnect();};source.start(now);
   this.status='Playing';this.error=null;this.level();this.emit();
  }catch(_){
   if(token===this.generation&&!this.hidden&&!this.muted){this.stop(.4);this.error='Music could not load. You can keep playing.';this.status=this.error;this.emit();}
  }finally{if(this.loading===id&&this.loadingGeneration===token)this.loading=null;}
 }
 stop(fade=.3){
  if(!this.ctx)return;const now=this.ctx.currentTime;
  for(const tail of this.musicTails)try{tail.source.stop(now);}catch(_){}
  this.musicTails.clear();const old=this.active;if(!old)return;this.active=null;
  this.ramp(old.gain,0,fade);if(fade>0)this.musicTails.add(old);
  try{old.source.stop(fade>0?now+fade+.02:now);}catch(_){}
 }
 syncVoice(encounter,owner=null){
  const id=this.resolve(encounter?.voiceId),sequence=this.assets.voiceSequences?.[encounter?.speaker];
  if(!encounter||typeof encounter.key!=='string'||!id||this.assets.assets[id].bus!=='voice'||!sequence?.includes(id))encounter=null;
  const same=encounter&&this.voiceSurface&&this.voiceOwner===owner&&this.voiceSurface.key===encounter.key&&this.voiceSurface.voiceId===id;
  if(same)return;
  // An obsolete scope always yields, even to lower-priority thinking in a new question.
  if(encounter?.scope&&this.voiceOwner===owner&&encounter.scope===this.voiceSurface?.scope&&(this.voiceActive||this.pendingVoice)&&encounter.priority<this.voiceSurface.priority)return;
  if(!encounter&&!this.voiceSurface&&!this.pendingVoice&&!this.voiceActive)return;
  this.voiceGeneration++;this.cancelLoads('voice');this.pendingVoice=null;
  this.stopVoice(encounter?0:.08);
  this.voiceOwner=encounter?owner:null;this.voiceSurface=encounter?{...encounter,voiceId:id}:null;
  if(!encounter||this.voiceMuted||this.voiceVolume===0||this.hidden)return;
  const now=this.voiceNow(),deadline=encounter.startDeadlineMs??(encounter.speaker==='alyssa'?2000:0);
  this.pendingVoice={...this.voiceSurface,token:this.voiceGeneration,notBefore:now+(encounter.delayMs||0),expiresAt:deadline?now+deadline:Infinity};
  if(deadline){const token=this.voiceGeneration;this.voiceDeadlineTimer=this.voiceTimer(()=>{if(token!==this.voiceGeneration||this.voiceActive)return;this.voiceGeneration++;this.pendingVoice=null;this.cancelLoads('voice');this.stopVoice(0);},deadline);}
  this.playPendingVoice();
 }
 voiceNow(){return (this.host.Date||Date).now();}
 voiceTimer(fn,ms){const timer=this.host.setTimeout(fn,ms);timer?.unref?.();return timer;}
 clearVoiceTimers(){for(const key of ['voiceDelayTimer','voiceDeadlineTimer','voiceWatchdog']){if(this[key]!==null)this.host.clearTimeout(this[key]);this[key]=null;}}
 async playPendingVoice(){
  const pending=this.pendingVoice;
  if(!pending||!this.unlocked||this.hidden||this.voiceMuted||this.voiceVolume===0||this.ctx?.state!=='running')return;
  if(this.voiceNow()>=pending.expiresAt){this.pendingVoice=null;this.clearVoiceTimers();return;}
  if(this.voiceNow()<pending.notBefore){if(this.voiceDelayTimer===null)this.voiceDelayTimer=this.voiceTimer(()=>{this.voiceDelayTimer=null;if(pending.token===this.voiceGeneration)this.playPendingVoice();},pending.notBefore-this.voiceNow());return;}
  this.pendingVoice=null;const token=pending.token;
  try{
   const buffer=await this.readAudio(pending.voiceId);
   if(token!==this.voiceGeneration||this.hidden||this.voiceMuted||this.voiceVolume===0||this.voiceSurface?.key!==pending.key||this.voiceNow()>=pending.expiresAt)return;
   if(this.ctx.state!=='running'){this.unlocked=false;this.pendingVoice=pending;return;}
   const ctx=this.ctx,source=ctx.createBufferSource(),gain=ctx.createGain();
   source.buffer=buffer;source.loop=false;source.playbackRate.value=1;source.connect(gain);gain.connect(this.voiceMaster);
   gain.gain.setValueAtTime(1,ctx.currentTime);
   const active={id:pending.voiceId,source,gain,token};this.voiceActive=active;
   this.clearVoiceTimers();
   source.onended=()=>{
    this.voiceTails.delete(active);source.disconnect();gain.disconnect();
    if(this.voiceActive!==active)return;
    this.clearVoiceTimers();
    this.voiceActive=null;this.voiceStatus='';this.setDuck('voice',1);this.emit();
   };
   source.start(ctx.currentTime);this.voiceStatus='Speaking';this.setDuck('voice',.3);this.emit();
   this.voiceWatchdog=this.voiceTimer(()=>{if(this.voiceActive===active){this.stopVoice(0);this.emit();}},(buffer.duration+2)*1000);
  }catch(_){
   if(token===this.voiceGeneration){this.stopVoice(0);this.voiceStatus='Voice could not load. You can keep playing.';this.emit();}
  }
 }
 stopVoice(fade=.08){
  this.clearVoiceTimers();
  if(this.ctx){for(const tail of this.voiceTails)try{tail.source.stop(this.ctx.currentTime);}catch(_){}this.voiceTails.clear();}
  const old=this.voiceActive;this.voiceActive=null;
  if(old){this.ramp(old.gain,0,fade);if(fade>0)this.voiceTails.add(old);try{old.source.stop(this.ctx.currentTime+fade);}catch(_){}}
  this.voiceStatus='';this.setDuck('voice',1);
 }
 async setHidden(value){
  this.hidden=!!value;this.generation++;this.level();
  if(value){
   this.voiceGeneration++;this.pendingVoice=null;this.cancelLoads('voice');this.stopVoice(0);
   this.cancelLoads('bgm');this.stop(0);this.status='Music paused.';
   if(this.ctx)try{await this.ctx.suspend();}catch(_){}
   if(!this.hidden&&this.unlocked)await this.unlock();
   this.emit();
  }else if(this.unlocked)await this.unlock();
 }
}
if(typeof module!=='undefined')module.exports={trackFor,Music};else root.DCAudio=new Music(root);
})(typeof window!=='undefined'?window:globalThis);
