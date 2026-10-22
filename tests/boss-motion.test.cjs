const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),S=require('../dist/animation.js'),D=require('../dist/animation-data.js'),C=require('../dist/config.js');
const flush=async()=>{for(let i=0;i<6;i++)await Promise.resolve();};
test('both bosses use all sixty left-facing source cells, original variable holds, and a floor registration that preserves translucent VFX',async()=>{
 for(const [id,stage] of [['sentinel',0],['dealer',1]]){const a=S.spec(stage,id);assert.equal(a.flipX,false);assert.equal(a.facing,'left');assert.equal(S.spec(1-stage,id),null);assert.deepEqual(C.enemies[id].patterns.map(p=>S.intentAction(stage,id,p)),['attack','defend','skill']);
 for(const [action,c]of Object.entries(a.animations)){assert.equal(c.frames.length,6);assert.equal(c.durationsMs.length,6);assert.equal(c.loop,action==='idle');assert.ok(fs.existsSync(require('node:path').join(__dirname,'../dist/assets',a.posters[action])));
  let callback,clock=0;const draws=[],host={dataset:{}},canvas={parentElement:host,dataset:{},getContext:()=>({clearRect(){},drawImage(...args){draws.push(args);}})};
  const p=S.create({canvas,spec:a,load:async()=>({}),requestFrame:fn=>{callback=fn;return 1;},cancelFrame:()=>{callback=null;}});await flush();p.play(action);await flush();callback(0);await flush();
  for(let i=0;i<6;i++){assert.equal(p.snapshot().action,action);assert.equal(p.snapshot().frame,i);assert.deepEqual(draws.at(-1).slice(1,5),c.frames[i]);assert.equal(draws.at(-1)[5],a.floorPivot[0]-a.sourcePivot[0]*a.drawScale);clock+=c.durationsMs[i];callback(clock);await flush();}
  assert.equal(p.snapshot().action,'idle');assert.equal(p.snapshot().frame,0);p.destroy();assert.equal(callback,null);assert.equal(host.dataset.animationReady,undefined);
 }
 }
});
