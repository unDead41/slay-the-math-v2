const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const file=require('node:path').join(__dirname,'../dist/audio.js');
const api=fs.existsSync(file)?require(file):{};

test('music follows the site, stage and enemy rank',()=>{
 assert.equal(typeof api.trackFor,'function');
 assert.equal(api.trackFor(null,true),'menu');
 for(const stage of [0,1]){
  const n=stage+1;
  assert.equal(api.trackFor({stage,scene:'map'}),'stage'+n+'_dungeon');
  assert.equal(api.trackFor({stage,scene:'battle',battle:{enemyId:'wisp',elite:false}}),'stage'+n+'_dungeon');
  assert.equal(api.trackFor({stage,scene:'battle',battle:{enemyId:'knight',elite:true}}),'stage'+n+'_elite');
  assert.equal(api.trackFor({stage,scene:'battle',battle:{enemyId:stage?'dealer':'sentinel',elite:false}}),'stage'+n+'_boss');
 }
 for(const [scene,id]of [['camp','rest'],['event','mystery'],['shop','shop']])assert.equal(api.trackFor({stage:0,scene}),id);
});

function rig(){
 let contextCount=0;const sources=[],pending=new Map();
 const param=()=>({value:0,cancelScheduledValues(){},setValueAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;}});
 class Context{
  constructor(){contextCount++;this.state='running';this.currentTime=1;this.destination={};}
  resume(){this.state='running';return Promise.resolve();}suspend(){this.state='suspended';return Promise.resolve();}
  createGain(){return {gain:param(),connect(){},disconnect(){}};}
  createBufferSource(){const s={buffer:null,loop:false,connect(){},disconnect(){},start(){s.started=true;},stop(){s.stopped=true;}};sources.push(s);return s;}
  decodeAudioData(bytes){return Promise.resolve({duration:60,bytes});}
 }
 const host={AudioContext:Context,setTimeout,clearTimeout,fetch(url){return new Promise((resolve,reject)=>pending.set(url,{resolve:()=>resolve({ok:true,arrayBuffer:async()=>new ArrayBuffer(16)}),reject}));}};
 const music=new api.Music(host);
 const tick=()=>new Promise(r=>setImmediate(r));
 const release=id=>{const item=[...pending].find(([url])=>url.includes(id));assert.ok(item,'fetch started for '+id);item[1].resolve();};
 return {music,sources,release,tick,contextCount:()=>contextCount};
}

test('music waits for a player gesture and never restarts on the same scene',async()=>{
 assert.equal(typeof api.Music,'function');const r=rig();
 r.music.setTrack('stage1_dungeon');await r.tick();assert.equal(r.contextCount(),0);
 r.music.unlock();await r.tick();r.release('stage1_dungeon');await r.tick();
 assert.equal(r.sources.filter(x=>x.started).length,1);
 r.music.setTrack('stage1_dungeon');await r.tick();
 assert.equal(r.sources.filter(x=>x.started).length,1);
});

test('a slow previous track cannot replace a newer scene or start after mute',async()=>{
 assert.equal(typeof api.Music,'function');const r=rig();
 r.music.setTrack('stage1_dungeon');r.music.unlock();await r.tick();
 r.music.setTrack('stage2_elite');await r.tick();
 r.release('stage2_elite');await r.tick();assert.equal(r.music.state.current,'stage2_elite');
 r.release('stage1_dungeon');await r.tick();assert.equal(r.music.state.current,'stage2_elite');
 r.music.setTrack('rest');await r.tick();r.music.configure({muted:true});
 r.release('rest');await r.tick();assert.equal(r.music.state.current,null);
 assert.equal(r.sources.filter(x=>x.started).length,1);
});

test('showing the page while suspension is pending resumes after that suspension finishes',async()=>{
 const r=rig();r.music.setTrack('menu');r.music.unlock();await r.tick();r.release('menu');await r.tick();
 const ctx=r.music.ctx;let release;
 ctx.suspend=()=>new Promise(resolve=>{release=()=>{ctx.state='suspended';resolve();};});
 const hiding=r.music.setHidden(true);await r.tick();
 await r.music.setHidden(false);release();await hiding;await r.tick();
 assert.equal(r.music.hidden,false);assert.equal(ctx.state,'running');
 assert.equal(r.music.state.current,'menu');
});
