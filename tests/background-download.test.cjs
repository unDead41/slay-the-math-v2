'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),http=require('node:http'),crypto=require('node:crypto');
const R=require('../dist/asset-readiness.js');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const entry=(url,bytes,pack='common',required=false)=>({url,bytes,pack,required,sha256:hash('x'.repeat(bytes))});
const until=async fn=>{const end=Date.now()+4000;while(!fn()){assert.ok(Date.now()<end,'Expected background work to progress');await new Promise(r=>setTimeout(r,5));}};
class Cache{data=new Map();async match(k){return this.data.get(k)?.clone();}async put(k,r){this.data.set(k,r.clone());}async delete(k){return this.data.delete(k);}}
async function site(t,{hold=false,failOnce=false}={}){
 const seen=[],release=[],counts={};const server=http.createServer((q,r)=>{const name=new URL(q.url,'http://x').pathname.split('/').pop();seen.push(name);counts[name]=(counts[name]||0)+1;if(failOnce&&counts[name]===1){r.writeHead(404);r.end('missing');return;}const finish=()=>r.end('xxxx');hold?release.push(finish):finish();});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 t.after(()=>server.closeAllConnections());t.after(()=>server.close());const manifest={manifestId:'queue-test',entries:['a','b','c','d','front'].map(u=>entry(u,4))};const manager=R.create({host:globalThis,base:'http://127.0.0.1:'+server.address().port+'/game/',manifest,cache:new Cache(),retryDelays:[]});t.after(()=>manager.destroy());return{manager,seen,release,counts};
}
test('startup gates75 percent of bytes, not75 percent of files, and includes all hard core',()=>{
 const manifest={entries:[entry('core',10,'core',true),entry('hero',65,'hero'),entry('later',25,'stage1'),entry('boss',1000,'boss1'),entry('practice',500,'practice')],startup:{ratio:.75,urls:['hero','later']}};
 const p=R.startupPlan(manifest);assert.equal(p.totalBytes,100);assert.equal(p.targetBytes,75);assert.equal(p.selectedBytes,75);assert.deepEqual(p.beforeMenu,['core','hero']);assert.equal(p.beforeMenu.includes('boss'),false);assert.equal(p.beforeMenu.includes('practice'),false);
});
test('whole-file startup never rounds below75 percent and tolerates an older manifest',()=>{
 const m={entries:[entry('core',10,'core',true),entry('a',60),entry('b',30)],startup:{ratio:.75,urls:['core','a','b']}};assert.equal(R.startupPlan(m).selectedBytes,100);assert.deepEqual(R.startupPlan({entries:m.entries}).beforeMenu,['core']);
});
test('retained progress does not call evicted online-only bytes ready',async t=>{
 const s=await site(t);s.manager.destroy();const m=R.create({host:globalThis,base:s.manager.base,manifest:s.manager.manifest,cache:null,memoryBudgetBytes:4});t.after(()=>m.destroy());await m.fetchAsset('a');await m.fetchAsset('b');const p=m.progress(['a','b']);assert.equal(p.verifiedBytes,8);assert.equal(p.availableBytes,4);assert.equal(m.available('a'),false);assert.equal(m.available('b'),true);assert.equal(m.stats().availableBytes,4);
});
test('incremental background queue promotes room resources without occupying foreground capacity',async t=>{
 const s=await site(t,{hold:true}),q=R.createBackgroundQueue({manager:s.manager,limit:()=>1});t.after(()=>q.destroy());q.enqueue('a',90);q.enqueue('b',95);q.enqueue('c',60);await until(()=>s.seen.length===1);const front=s.manager.fetchAsset('front');await until(()=>s.seen.includes('front'));assert.equal(q.stats().active,1);s.release.splice(0).forEach(r=>r());await front;await until(()=>s.seen.length===3);assert.equal(s.seen[2],'c');s.release.splice(0).forEach(r=>r());await until(()=>s.seen.length===4);s.release.splice(0).forEach(r=>r());await until(()=>q.stats().active===0);assert.equal(q.stats().queued,0);assert.equal(s.counts.a,1);
});
test('hidden/offline/manual pause stops new speculative work and resumes the same queue',async t=>{
 const s=await site(t,{hold:true});let allowed=false,limit=2;const q=R.createBackgroundQueue({manager:s.manager,canRun:()=>allowed,limit:()=>limit});t.after(()=>q.destroy());q.enqueue('a',90);q.enqueue('b',90);q.enqueue('c',90);await new Promise(r=>setTimeout(r,20));assert.equal(s.seen.length,0);allowed=true;q.pump();await until(()=>s.seen.length===2);allowed=false;limit=1;s.release.splice(0).forEach(r=>r());await until(()=>q.stats().active===0);assert.equal(s.seen.length,2);allowed=true;q.pump();await until(()=>s.seen.length===3);s.release.splice(0).forEach(r=>r());await until(()=>q.stats().active===0);assert.equal(q.stats().queued,0);
});
test('a failed background file stays retryable and saved files are not downloaded twice',async t=>{
 const s=await site(t,{failOnce:true}),q=R.createBackgroundQueue({manager:s.manager});t.after(()=>q.destroy());q.enqueue('a',80);await until(()=>q.stats().failed===1);q.retry();await until(()=>s.manager.available('a'));q.enqueue('a',80);await until(()=>q.stats().active===0);assert.equal(s.counts.a,2);assert.equal(q.stats().failed,0);
});

test('resume during cancellation retries the unwinding download without another reconnect',async t=>{
 const s=await site(t,{hold:true}),q=R.createBackgroundQueue({manager:s.manager,limit:()=>1});t.after(()=>q.destroy());q.enqueue('a',80);await until(()=>s.seen.length===1);s.manager.pause();s.manager.resume();q.retry();await until(()=>s.seen.length===2);s.release.splice(0).forEach(r=>r());await until(()=>s.manager.available('a'));assert.equal(q.stats().failed,0);
});

test('disk eviction after memory eviction is reconciled and automatic admission repairs it',async t=>{
 const s=await site(t),cache=new Cache(),m=R.create({host:globalThis,base:s.manager.base,manifest:s.manager.manifest,cache,memoryBudgetBytes:4});t.after(()=>m.destroy());await m.fetchAsset('a');await m.fetchAsset('b');cache.data.delete(m.base+'a');await m.reconcile?.();assert.equal(m.available('a'),false,'Evicted disk and session bytes must not count as cached');assert.equal(m.progress(['a','b']).availableBytes,4);const q=R.createBackgroundQueue({manager:m});t.after(()=>q.destroy());q.enqueue('a');await until(()=>s.counts.a===2);await until(()=>m.available('a'));assert.equal(q.stats().failed,0);
});
test('cache read access loss removes historical persistence even if later writes succeed',async t=>{
 const s=await site(t),cache=new Cache(),m=R.create({host:globalThis,base:s.manager.base,manifest:s.manager.manifest,cache,memoryBudgetBytes:0});t.after(()=>m.destroy());await m.fetchAsset('a');cache.keys=async()=>{throw Error('access denied');};cache.match=async()=>{throw Error('access denied');};await m.reconcile?.();assert.equal(m.available('a'),false);assert.equal(m.cacheMode,'online');await m.fetchAsset('b');assert.equal(m.available('b'),false,'Unreadable storage must not become available merely after put');
});
test('explicit storage retry can restore persistent preparation after quota is freed',async t=>{
 const s=await site(t),cache=new Cache(),put=cache.put;cache.put=async()=>{throw Error('quota');};const m=R.create({host:globalThis,base:s.manager.base,manifest:s.manager.manifest,cache,memoryBudgetBytes:0});t.after(()=>m.destroy());await m.fetchAsset('a');assert.equal(m.cacheMode,'online');cache.put=put;await m.reconcile?.({retryStorage:true});await m.fetchAsset('b');assert.equal(m.cacheMode,'persistent');assert.equal(m.available('b'),true);
});
test('a foreground recovery clears a stale background-failed status without a separate retry',async t=>{
 const s=await site(t,{failOnce:true}),q=R.createBackgroundQueue({manager:s.manager});t.after(()=>q.destroy());q.enqueue('a');await until(()=>q.stats().failed===1);await s.manager.fetchAsset('a');assert.equal(q.stats().failed,0,'Successfully recovered room must not still report a failed download');
});

test('automatic availability polling does not retry a failed file until an explicit retry',async t=>{
 const s=await site(t,{failOnce:true}),q=R.createBackgroundQueue({manager:s.manager});t.after(()=>q.destroy());q.enqueue('a');await until(()=>q.stats().failed===1);q.enqueue('a');await new Promise(r=>setTimeout(r,25));assert.equal(s.counts.a,1,'Availability polling must not spin failed transfers');q.retry();await until(()=>s.manager.available('a'));
});

test('a recovery audit waits for a fresh snapshot if an older cache audit is already running',async t=>{
 const s=await site(t),cache=new Cache(),m=R.create({host:globalThis,base:s.manager.base,manifest:s.manager.manifest,cache,memoryBudgetBytes:0});t.after(()=>m.destroy());await m.fetchAsset('a');let release,started=false,first=true;const held=new Promise(r=>release=r);cache.keys=async()=>{const snapshot=[...cache.data.keys()];if(first){first=false;started=true;await held;}return snapshot;};const old=m.reconcile();await until(()=>started);cache.data.delete(m.base+'a');const recovery=m.reconcile({retryStorage:true});release();await Promise.all([old,recovery]);assert.equal(m.available('a'),false,'A recovery boundary must not reuse an audit started before eviction');
});
