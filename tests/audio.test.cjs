const test=require('node:test');
const assert=require('node:assert/strict');
const api=require('../dist/audio.js');
const registry=require('../dist/music-data.js').assets;

// Node has no Web Audio device. This fake observes the controller's audio-node
// boundary, retaining fetch/decode scheduling and the real controller code.
function rig(options={}){
 let contextCount=0,canResume=!options.blocked;const sources=[],pending=new Map(),decodes=[];
 const param=()=>({value:0,cancelScheduledValues(){},setValueAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;}});
 class Context{
  constructor(){contextCount++;this.state=options.blocked?'suspended':'running';this.currentTime=1;this.destination={};}
  resume(){if(!canResume)return Promise.reject(new Error('gesture required'));this.state='running';return Promise.resolve();}
  suspend(){this.state='suspended';return Promise.resolve();}
  createGain(){return {gain:param(),connect(){},disconnect(){}};}
  createBufferSource(){const s={buffer:null,loop:false,playbackRate:{value:1},connect(){},disconnect(){},start(when){s.started=true;s.startTime=when;},stop(when){s.stopped=true;s.stopTime=when;}};sources.push(s);return s;}
  decodeAudioData(bytes){if(options.slowDecode)return new Promise(resolve=>decodes.push({url:bytes.url,resolve:()=>resolve({duration:60,url:bytes.url})}));return Promise.resolve({duration:60,url:bytes.url});}
 }
 const host={AudioContext:Context,setTimeout,clearTimeout,DCAudioAssets:registry,...options.host,fetch(url){return new Promise((resolve,reject)=>pending.set(url,{resolve:()=>resolve({ok:true,arrayBuffer:async()=>Object.assign(new ArrayBuffer(16),{url})}),reject}));}};
 const music=new api.Music(host);
 const tick=()=>new Promise(r=>setImmediate(r));
 const release=part=>{const item=[...pending].find(([url])=>url.includes(part));assert.ok(item,'fetch started for '+part);item[1].resolve();};
 const decoded=part=>{const item=decodes.find(item=>item.url.includes(part));assert.ok(item,'decode started for '+part);item.resolve();};
 return {music,host,sources,pending,release,decoded,tick,contextCount:()=>contextCount,allowResume:()=>{canResume=true;}};
}
const greeting=(key='artifact:starting',voiceId='vo_dm_01',visitNumber=1)=>({key,speaker:'dungeonMaster',visitNumber,voiceId});
const voiceSources=r=>r.sources.filter(s=>s.started&&s.loop===false);

test('visible surface routing uses supplied map/defeat and canonical shared combat with explicit Boss flags',()=>{
 assert.equal(api.trackFor(null,true),'menu');
 for(const [stage,combat,boss]of [[0,'bgm_combat_stage_1','bgm_boss_stage_1'],[1,'bgm_combat_stage_2','bgm_boss_stage_2']]){
  assert.equal(api.trackFor({stage,scene:'map'}),'bgm_map');
  assert.equal(api.trackFor({stage,scene:'battle',battle:{enemyId:'wisp',elite:false}}),combat);
  assert.equal(api.trackFor({stage,scene:'battle',battle:{enemyId:'knight',elite:true}}),combat);
  assert.equal(api.trackFor({stage,scene:'battle',battle:{enemyId:'future-boss'}},false,{boss:true}),boss);
  assert.equal(api.trackFor({stage,scene:'battle',battle:{enemyId:'sentinel'}},false,{boss:false}),combat,'explicit definition flag takes precedence over legacy ids');
 }
 for(const [scene,id]of [['camp','bgm_rest'],['event','mystery'],['shop','bgm_shop'],['defeat','bgm_defeat']])assert.equal(api.trackFor({stage:0,scene}),id);
 assert.equal(api.trackFor({stage:1,scene:'reward'},false,{surface:'artifact'}),'mystery');
 assert.equal(api.trackFor({stage:1,scene:'shop'},false,{surface:'education'}),'mystery');
});

test('music waits for a player gesture and does not restart identical source aliases',async()=>{
 const r=rig();r.music.setTrack('stage1_dungeon');await r.tick();assert.equal(r.contextCount(),0);
 r.music.unlock();await r.tick();r.release('stage1_combat');await r.tick();
 assert.equal(r.sources.filter(s=>s.started).length,1);
 r.music.setTrack('stage1_elite');await r.tick();assert.equal(r.sources.filter(s=>s.started).length,1);
 assert.equal(r.music.state.current,'bgm_combat_stage_1');
});

test('supplied explicit MP3 wins over stale embedded alias and stale OGG',async()=>{
 const r=rig({host:{DC_MUSIC:{stage1_dungeon:'data:audio/mpeg;base64,OLD'},atob(){throw new Error('stale embedded alias was used');}}});
 r.music.setTrack('stage1_dungeon');r.music.unlock();await r.tick();
 assert.deepEqual([...r.pending.keys()],['assets/music/stage1_combat.mp3']);r.release('stage1_combat');await r.tick();
 assert.equal(r.music.state.current,'bgm_combat_stage_1');
});

test('slow music cannot replace a newer scene or bypass Music mute',async()=>{
 const r=rig();r.music.setTrack('stage1_dungeon');r.music.unlock();await r.tick();
 r.music.setTrack('stage2_elite');await r.tick();r.release('stage2_combat');await r.tick();
 assert.equal(r.music.state.current,'bgm_combat_stage_2');
 r.release('stage1_combat');await r.tick();assert.equal(r.music.state.current,'bgm_combat_stage_2');
 r.music.setTrack('rest');await r.tick();r.music.configure({muted:true});r.release('rest');await r.tick();
 assert.equal(r.music.state.current,null);assert.equal(r.sources.filter(s=>s.started).length,1);
});

test('route changes crossfade native music sources at original playback rate',async()=>{
 const r=rig();r.music.setTrack('map');r.music.unlock();await r.tick();r.release('map');await r.tick();const old=r.sources[0];
 r.music.setTrack('shop');await r.tick();r.release('shop');await r.tick();const next=r.sources[1];
 assert.equal(next.loop,true);assert.equal(next.playbackRate.value,1);assert.equal(old.stopTime,1.87);assert.equal(next.startTime,1);
 assert.equal(r.music.state.current,'bgm_shop');
});

test('one-shot greeting does not restart on rerender and supersedes the previous voice',async()=>{
 const r=rig(),owner={};assert.equal(typeof r.music.syncVoice,'function');
 r.music.syncVoice(greeting(),owner);r.music.unlock();await r.tick();r.release('dungeon_master/meet_01');await r.tick();
 assert.equal(voiceSources(r).length,1);const first=voiceSources(r)[0];assert.equal(first.loop,false);assert.equal(first.playbackRate.value,1);
 r.music.syncVoice(greeting(),owner);await r.tick();assert.equal(voiceSources(r).length,1);
 r.music.syncVoice(greeting('artifact:elite:0:a','vo_dm_02',2),owner);await r.tick();r.release('dungeon_master/meet_02');await r.tick();
 assert.equal(voiceSources(r).length,2);assert.ok(first.stopTime<=voiceSources(r)[1].startTime,'old voice stops before next starts');
 assert.equal(r.music.state.voice,'vo_dm_02');
});

test('late voice decode after leaving a surface cannot play or retain ducking',async()=>{
 const r=rig({slowDecode:true}),owner={};assert.equal(typeof r.music.syncVoice,'function');
 r.music.syncVoice(greeting(),owner);r.music.unlock();await r.tick();r.release('dungeon_master/meet_01');await r.tick();
 r.music.syncVoice(null,owner);r.decoded('dungeon_master/meet_01');await r.tick();
 assert.equal(voiceSources(r).length,0);assert.equal(r.music.state.voice,null);assert.equal(r.music.state.duckFactor,1);
});

test('blocked autoplay retains only current greeting until a successful gesture',async()=>{
 const r=rig({blocked:true}),owner={};assert.equal(typeof r.music.syncVoice,'function');
 r.music.syncVoice(greeting(),owner);await r.music.unlock();
 r.music.syncVoice(greeting('artifact:elite:0:a','vo_dm_02',2),owner);r.allowResume();r.music.unlock();await r.tick();
 assert.deepEqual([...r.pending.keys()],['assets/voice/dungeon_master/meet_02.mp3']);
 r.release('dungeon_master/meet_02');await r.tick();assert.equal(r.music.state.voice,'vo_dm_02');
});

test('Voice mute and zero volume consume greeting without replay on unmute or slider changes',async()=>{
 const r=rig(),owner={};assert.equal(typeof r.music.syncVoice,'function');
 r.music.configure({voiceMuted:true});r.music.syncVoice(greeting(),owner);await r.music.unlock();
 assert.equal(r.pending.size,0);r.music.configure({voiceMuted:false});r.music.syncVoice(greeting(),owner);await r.tick();assert.equal(r.pending.size,0);
 r.music.configure({voiceVolume:0});r.music.syncVoice(greeting('artifact:elite:0:a','vo_dm_02',2),owner);
 r.music.configure({voiceVolume:.9});r.music.syncVoice(greeting('artifact:elite:0:a','vo_dm_02',2),owner);await r.tick();assert.equal(r.pending.size,0);
 r.music.syncVoice(greeting('artifact:boss:0:a','vo_dm_03',3),owner);await r.tick();r.music.configure({voiceMuted:true});r.release('dungeon_master/meet_03');await r.tick();
 assert.equal(voiceSources(r).length,0);r.music.configure({voiceMuted:false});await r.tick();assert.equal(voiceSources(r).length,0);
});

test('Music mute leaves Voice audible, and Voice/Predict duck takes minimum factor with current Music setting',async()=>{
 const r=rig(),owner={};assert.equal(typeof r.music.syncVoice,'function');
 r.music.configure({muted:true,voiceVolume:.7});r.music.syncVoice(greeting(),owner);r.music.unlock();await r.tick();r.release('dungeon_master/meet_01');await r.tick();
 assert.equal(r.music.state.voice,'vo_dm_01');assert.equal(r.music.voiceMaster.gain.value,.7);
 r.music.configure({muted:false,volume:.8});r.music.duck(true);
 assert.equal(r.music.state.duckFactor,.3);assert.equal(r.music.master.gain.value,.24);
 voiceSources(r)[0].onended();assert.equal(r.music.state.duckFactor,.3,'Predict keeps its own duck after Voice ends');
 r.music.configure({volume:.5});r.music.duck(false);assert.equal(r.music.master.gain.value,.5);
});

test('hidden page stops voice and show resumes BGM without replaying greeting',async()=>{
 const r=rig(),owner={};assert.equal(typeof r.music.syncVoice,'function');
 r.music.syncVoice(greeting(),owner);r.music.unlock();await r.tick();r.release('dungeon_master/meet_01');await r.tick();const voice=voiceSources(r)[0];
 await r.music.setHidden(true);assert.equal(voice.stopped,true);assert.equal(voice.stopTime,1,'hidden stop is immediate so suspended context cannot resume a voice tail');assert.equal(r.music.state.voice,null);
 await r.music.setHidden(false);r.music.syncVoice(greeting(),owner);await r.tick();assert.equal(voiceSources(r).length,1);
});

test('showing the page while suspension is pending resumes after that suspension finishes',async()=>{
 const r=rig();r.music.setTrack('menu');r.music.unlock();await r.tick();r.release('menu.ogg');await r.tick();
 const ctx=r.music.ctx;let release;
 ctx.suspend=()=>new Promise(resolve=>{release=()=>{ctx.state='suspended';resolve();};});
 const hiding=r.music.setHidden(true);await r.tick();await r.music.setHidden(false);release();await hiding;await r.tick();
 assert.equal(r.music.hidden,false);assert.equal(ctx.state,'running');assert.equal(r.music.state.current,'menu');
});


test('leaving and rapidly reopening a surface does not overlap the old voice fade',async()=>{
 const r=rig(),owner={};r.music.syncVoice(greeting(),owner);r.music.unlock();await r.tick();r.release('dungeon_master/meet_01');await r.tick();
 const old=voiceSources(r)[0];r.music.syncVoice(null,owner);r.music.syncVoice(greeting(),owner);await r.tick();
 assert.equal(voiceSources(r).length,2);assert.ok(old.stopTime<=voiceSources(r)[1].startTime,'a retiring voice must stop before a new cached greeting starts');
});

test('rapid scene changes retire older music fades before starting a third loop',async()=>{
 const r=rig();r.music.setTrack('map');r.music.unlock();await r.tick();r.release('map');await r.tick();const first=r.sources[0];
 r.music.setTrack('shop');await r.tick();r.release('shop');await r.tick();
 r.music.setTrack('rest');await r.tick();r.release('rest');await r.tick();
 assert.ok(first.stopTime<=r.sources[2].startTime,'an earlier music tail cannot accumulate behind the new crossfade');
});

test('a missing audio catalog cannot block game scene rendering',()=>{
 const vm=require('node:vm'),fs=require('node:fs');const host={};
 vm.runInNewContext(fs.readFileSync(require.resolve('../dist/audio.js'),'utf8'),host);
 assert.doesNotThrow(()=>host.DCAudio.setRoute({stage:0,scene:'map'},false,{surface:'map'}));
 assert.equal(host.DCAudio.state.current,null);
});
