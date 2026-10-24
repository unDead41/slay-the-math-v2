'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),A=require('../dist/animation.js');
const image=(id,width=4,height=4)=>({id,naturalWidth:width,naturalHeight:height});
function cache(options){assert.equal(typeof A.createTextureCache,'function','Decoded texture cache must budget pixels, not a fixed file count');return A.createTextureCache(options);}
test('decoded cache evicts by pixel bytes rather than number of textures',async()=>{
 const calls={};const c=cache({budgetBytes:128,load:async path=>{calls[path]=(calls[path]||0)+1;return image(path,path==='big'?8:4);}});
 await c.load('big');await c.load('small');assert.equal(c.stats().bytes,64);await c.load('big');assert.equal(calls.big,2);assert.equal(c.stats().bytes,128);
});
test('active clips survive pressure and idle is preferred ahead of unrelated textures',async()=>{
 const calls={};const c=cache({budgetBytes:192,load:async path=>{calls[path]=(calls[path]||0)+1;return image(path);}});const owner={};c.retain(owner,'attack','idle');
 for(const p of ['idle','attack','other','next'])await c.load(p);await c.load('idle');await c.load('attack');assert.equal(calls.idle,1);assert.equal(calls.attack,1);await c.load('other');assert.equal(calls.other,2);assert.ok(c.stats().bytes<=192);c.release(owner);assert.equal(c.stats().owners,0);
});
test('one released owner cannot unpin a clip still used by another actor',async()=>{
 const calls={};const c=cache({budgetBytes:64,load:async path=>{calls[path]=(calls[path]||0)+1;return image(path);}}),a={},b={};c.retain(a,'idle','idle');c.retain(b,'idle','idle');await c.load('idle');c.release(a);await c.load('other');await c.load('idle');assert.equal(calls.idle,1);c.release(b);await c.load('other');await c.load('idle');assert.equal(calls.idle,2);
});
test('oversized unowned images can be displayed without staying in the cache',async()=>{
 let loads=0;const c=cache({budgetBytes:64,load:async()=>{loads++;return image('big',8);}});assert.equal((await c.load('big')).id,'big');assert.equal(c.stats().bytes,0);await c.load('big');assert.equal(loads,2);
});
test('active-only oversize is reported and released immediately when its owner exits',async()=>{
 const c=cache({budgetBytes:64,load:async()=>image('big',8)}),owner={};c.retain(owner,'big','big');await c.load('big');assert.equal(c.stats().bytes,128);assert.equal(c.stats().overBudgetBytes,64);c.release(owner);assert.equal(c.stats().bytes,0);assert.equal(c.stats().overBudgetBytes,0);
});
test('concurrent requests decode one image and a failed decode never poisons retry',async()=>{
 let loads=0;const c=cache({budgetBytes:128,load:async path=>{loads++;if(path==='bad'&&loads===2)throw Error('decode failed');return image(path);}});
 const [a,b]=await Promise.all([c.load('same'),c.load('same')]);assert.equal(a,b);assert.equal(loads,1);await assert.rejects(c.load('bad'),/decode failed/);assert.equal(c.stats().entries,1);assert.equal((await c.load('bad')).id,'bad');assert.equal(loads,3);
});
test('a forgotten late load cannot replace or inflate a newer same-path entry',async()=>{
 const finish=[];const c=cache({budgetBytes:256,load:()=>new Promise(r=>finish.push(r))});const old=c.load('same');c.forget('same');const fresh=c.load('same');await new Promise(r=>setImmediate(r));finish[1](image('new'));assert.equal((await fresh).id,'new');finish[0](image('old',8));await old;assert.equal((await c.load('same')).id,'new');assert.equal(c.stats().bytes,64);
});
