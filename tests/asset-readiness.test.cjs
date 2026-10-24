'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),http=require('node:http'),crypto=require('node:crypto'),fs=require('node:fs');
const file=require('node:path').join(__dirname,'../dist/asset-readiness.js');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
class MemoryCache {constructor(){this.data=new Map();} async match(key){return this.data.get(String(key))?.clone();} async put(key,response){this.data.set(String(key),response.clone());}async delete(key){return this.data.delete(String(key));}}
async function fixture(t,handler){let count=0;const server=http.createServer((req,res)=>{count++;handler(req,res,count);});await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>server.closeAllConnections());t.after(()=>server.close());return {base:'http://127.0.0.1:'+server.address().port+'/game/',count:()=>count};}
function create(options){assert.ok(fs.existsSync(file),'The resource readiness manager must exist');return require(file).create({host:globalThis,retryDelays:[1,2],...options});}
function manifest(entries,id='one'){return {schemaVersion:1,manifestId:id,entries:entries.map(([url,data,pack='core'])=>({url,bytes:Buffer.byteLength(data),sha256:sha(data),pack,required:true}))};}
test('concurrent requests share bytes and a verified disk hit avoids another download',async t=>{
 const site=await fixture(t,(_q,r)=>{setTimeout(()=>r.end('hello'),15);}),cache=new MemoryCache(),m=manifest([['a.js','hello']]);
 const a=create({base:site.base,manifest:m,cache});const [x,y]=await Promise.all([a.fetchAsset('a.js'),a.fetchAsset('a.js')]);assert.equal(await x.text(),'hello');assert.equal(await y.text(),'hello');assert.equal(site.count(),1);
 const b=create({base:site.base,manifest:m,cache});assert.equal(await (await b.fetchAsset('a.js')).text(),'hello');assert.equal(site.count(),1);a.destroy();b.destroy();
});
test('a corrupt cached response is rejected and replaced without clearing unrelated data',async t=>{
 const site=await fixture(t,(_q,r)=>r.end('valid')),cache=new MemoryCache();cache.data.set(site.base+'a.js',new Response('wrong'));cache.data.set('other-project',new Response('keep'));
 const a=create({base:site.base,manifest:manifest([['a.js','valid']]),cache});assert.equal(await (await a.fetchAsset('a.js')).text(),'valid');assert.equal(site.count(),1);assert.equal(await cache.data.get('other-project').text(),'keep');a.destroy();
});
test('transient HTTP failures retry twice but missing assets fail once and never become ready',async t=>{
 const calls={};const site=await fixture(t,(q,r)=>{const name=q.url.split('?')[0];calls[name]=(calls[name]||0)+1;if(name.endsWith('missing.js')){r.writeHead(404);r.end('missing');}else if(calls[name]<3){r.writeHead(503);r.end('busy');}else r.end('ok');});
 const a=create({base:site.base,manifest:manifest([['a.js','ok'],['missing.js','x']]),cache:new MemoryCache()});await a.prepare(['a.js']);assert.equal(calls['/game/a.js'],3);await assert.rejects(a.prepare(['missing.js']),/404/);assert.equal(calls['/game/missing.js'],1);a.destroy();
});
test('a stalled response has a bounded failure and a loading budget cancels outstanding work',async t=>{
 const site=await fixture(t,()=>{});const a=create({base:site.base,manifest:manifest([['a.js','x']]),cache:new MemoryCache(),idleTimeoutMs:1000});
 const start=Date.now();await assert.rejects(a.prepare(['a.js'],{timeoutMs:35}),/time|minute|cancel/i);assert.ok(Date.now()-start<1000);a.destroy();
});
test('foreground work precedes queued boss downloads and background concurrency stays bounded',async t=>{
 const names=[],releases=[];const site=await fixture(t,(q,r)=>{names.push(q.url.split('?')[0]);releases.push(()=>r.end('x'));});
 const a=create({base:site.base,manifest:manifest([['a','x','boss1'],['b','x','boss1'],['c','x','boss1'],['front','x']]),cache:new MemoryCache(),concurrency:2});
 const waitFor=async predicate=>{const end=Date.now()+5000;while(!predicate()){assert.ok(Date.now()<end,'Expected a bounded request to start');await new Promise(r=>setTimeout(r,5));}};
 const jobs=['a','b','c'].map(x=>a.fetchAsset(x,{priority:80}));await waitFor(()=>names.length===2);const front=a.fetchAsset('front',{priority:0});releases.shift()();await waitFor(()=>names.length===3);assert.equal(names[2],'/game/front');while(releases.length)releases.shift()();await waitFor(()=>names.length===4);while(releases.length)releases.shift()();await Promise.all([...jobs,front]);assert.ok(a.stats().maxActive<=2);a.destroy();
});
test('cache quota failure keeps downloads usable online and rejects URLs outside this manifest',async t=>{
 const site=await fixture(t,(_q,r)=>r.end('ok'));const a=create({base:site.base,manifest:manifest([['a','ok']]),cache:{async match(){},async put(){throw Error('quota');}}});
 assert.equal(await (await a.fetchAsset('a')).text(),'ok');assert.equal(a.stats().cacheMode,'online');await assert.rejects(a.fetchAsset('../private'),/manifest|asset/i);a.destroy();
});
test('an update reuses unchanged verified bytes and replaces changed bytes within the same project',async t=>{
 const site=await fixture(t,(q,r)=>r.end(q.url.includes('changed')?'new':'same')),stores=new Map();
 const caches={async keys(){return [...stores.keys()];},async open(name){if(!stores.has(name))stores.set(name,new MemoryCache());return stores.get(name);}};
 const host={fetch,crypto,Headers,Response,AbortController,setTimeout,clearTimeout,caches};
 const first=create({host,base:site.base,manifest:manifest([['same.js','same'],['changed.js','old']],'old')});
 const prior=await caches.open(first.cacheName);await prior.put(site.base+'same.js',new Response('same'));await prior.put(site.base+'changed.js',new Response('old'));
 const unrelated=await caches.open('stm-assets-%2Fother-game%2F-one');await unrelated.put(site.base+'same.js',new Response('corrupt'));
 const next=create({host,base:site.base,manifest:manifest([['same.js','same'],['changed.js','new']],'next')});
 assert.equal(await (await next.fetchAsset('same.js')).text(),'same');assert.equal(site.count(),0);
 assert.equal(await (await next.fetchAsset('changed.js')).text(),'new');assert.equal(site.count(),1);
 assert.equal(await (await prior.match(site.base+'changed.js')).text(),'old');assert.equal(await (await unrelated.match(site.base+'same.js')).text(),'corrupt');first.destroy();next.destroy();
});

test('cache denial still reuses verified bytes for sequential consumers without repeating SHA work',async t=>{
 const site=await fixture(t,(_q,r)=>r.end('verified session bytes'));let hashes=0;
 const host={fetch,Headers,Response,AbortController,setTimeout,clearTimeout,crypto:{subtle:{digest(...args){hashes++;return globalThis.crypto.subtle.digest(...args);}}}};
 const a=create({host,base:site.base,manifest:manifest([['a','verified session bytes']]),cache:null});
 await a.prepare(['a']);for(let n=0;n<3;n++)assert.equal(await(await a.fetchAsset('a')).text(),'verified session bytes');
 assert.equal(site.count(),1,'Completed consumers must reuse this session’s verified download');assert.equal(hashes,1,'Reusing immutable verified bytes must not hash them again');a.destroy();
});
test('a verified disk read is retained privately and consumers cannot mutate later responses',async t=>{
 const site=await fixture(t,(_q,r)=>r.end('network')),cache=new MemoryCache();await cache.put(site.base+'a',new Response('safe',{headers:{'Content-Type':'image/webp'}}));let hashes=0;
 const host={fetch,Headers,Response,AbortController,setTimeout,clearTimeout,crypto:{subtle:{digest(...args){hashes++;return globalThis.crypto.subtle.digest(...args);}}}};
 const a=create({host,base:site.base,manifest:manifest([['a','safe']]),cache});const first=await a.fetchAsset('a');new Uint8Array(await first.arrayBuffer()).fill(0);first.headers.set('Content-Type','text/plain');
 const next=await a.fetchAsset('a');assert.equal(await next.text(),'safe');assert.equal(next.headers.get('Content-Type'),'image/webp');assert.equal(hashes,1);assert.equal(site.count(),0);a.destroy();
});
test('the compressed byte budget evicts background entries before a foreground resource',async t=>{
 const calls={};const site=await fixture(t,(q,r)=>{const name=q.url.split('?')[0].split('/').at(-1);calls[name]=(calls[name]||0)+1;r.end('1234');});
 const a=create({base:site.base,manifest:manifest([['hot','1234'],['later1','1234'],['later2','1234']]),cache:null,memoryBudgetBytes:8});
 for(const [url,priority]of [['hot',0],['later1',80],['later2',80]])await(await a.fetchAsset(url,{priority})).text();
 assert.equal(await(await a.fetchAsset('hot')).text(),'1234');assert.equal(calls.hot,1);await(await a.fetchAsset('later1',{priority:80})).text();assert.equal(calls.later1,2);assert.equal(a.stats().memoryBytes,8);a.destroy();assert.equal(a.stats().memoryBytes,0);
});
test('oversized verified assets remain usable without exceeding the session budget',async t=>{
 const site=await fixture(t,(_q,r)=>r.end('12345'));const a=create({base:site.base,manifest:manifest([['big','12345']]),cache:null,memoryBudgetBytes:4});
 for(let n=0;n<2;n++)assert.equal(await(await a.fetchAsset('big')).text(),'12345');assert.equal(site.count(),2);assert.equal(a.stats().memoryBytes,0);a.destroy();
});
test('wrong-hash bytes never enter the trusted session cache, and a retry can populate it',async t=>{
 const site=await fixture(t,(_q,r,count)=>r.end(count===1?'wrong':'right'));const a=create({base:site.base,manifest:manifest([['a','right']]),cache:null});
 await assert.rejects(a.fetchAsset('a'),/verification/i);assert.equal(await(await a.fetchAsset('a')).text(),'right');assert.equal(await(await a.fetchAsset('a')).text(),'right');assert.equal(site.count(),2);a.destroy();
});
test('verified session reuse is isolated by manifest and still obeys pause and destroy',async t=>{
 let payload='old';const site=await fixture(t,(_q,r)=>r.end(payload));const a=create({base:site.base,manifest:manifest([['a','old']],'old'),cache:null});await(await a.fetchAsset('a')).text();payload='new';
 const b=create({base:site.base,manifest:manifest([['a','new']],'new'),cache:null});assert.equal(await(await b.fetchAsset('a')).text(),'new');assert.equal(await(await a.fetchAsset('a')).text(),'old');assert.equal(site.count(),2);
 a.pause();await assert.rejects(a.fetchAsset('a'),/cancel/i);a.resume();assert.equal(await(await a.fetchAsset('a')).text(),'old');a.destroy();await assert.rejects(a.fetchAsset('a'),/cancel/i);b.destroy();
});
