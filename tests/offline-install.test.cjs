'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto');
const Readiness=require('../dist/asset-readiness.js'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
class Cache {constructor(){this.data=new Map();}async match(key){return this.data.get(String(key))?.clone();}async put(key,r){this.data.set(String(key),r.clone());}async delete(key){return this.data.delete(String(key));}async keys(){return [...this.data.keys()].map(url=>({url}));}}
async function corruptCopy(cache,base){const replacement=new Cache();for(const {url} of await cache.keys())await replacement.put(url,await cache.match(url));await replacement.put(base+'a.js',new Response('garbage'));return replacement;}
function implementation(){const file=path.join(__dirname,'../dist/offline-install.js');assert.ok(fs.existsSync(file),'Persistent complete-install verifier must exist');return require(file);}
async function fixture(t){
 const calls=[],files=new Map([['a.js','runtime'],['voice.mp3','voice'],['index.html','<html>one release</html>'],['sw.js','worker']]);let missing=null;
 const server=http.createServer((q,r)=>{const name=new URL(q.url,'http://localhost').pathname.split('/').pop();calls.push(name);if(name===missing||!files.has(name)){r.writeHead(404);r.end('missing');}else r.end(files.get(name));});await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>{server.closeAllConnections();server.close();});
 const base='http://127.0.0.1:'+server.address().port+'/game/',cache=new Cache(),name='stm-assets-'+encodeURIComponent('/game/')+'-'+'1'.repeat(24),all=[...files].map(([url,data])=>({url,bytes:Buffer.byteLength(data),sha256:sha(data),pack:'core',kind:'code'}));
 const manifest={schemaVersion:1,gameVersion:'test-release',manifestId:'1'.repeat(24),entries:all.slice(0,2),scripts:[],offline:{schemaVersion:1,releaseId:'a'.repeat(24),files:all}};
 const host={fetch,Headers,Response,AbortController,AbortSignal,setTimeout,clearTimeout,crypto:crypto.webcrypto,navigator:{onLine:true,storage:{estimate:async()=>({quota:1000000,usage:0}),persist:async()=>true}},caches:{open:async n=>{assert.equal(n,name);return cache;},keys:async()=>[name]}};
 const manager=Readiness.create({host,base,manifest,memoryBudgetBytes:0,retryDelays:[]});t.after(()=>manager.destroy());
 return {base,host,manifest,manager,cache,calls,files,missing:v=>missing=v,create:()=>implementation().create({host,base,manifest,manager,ensureWorker:async()=>true})};
}
test('all historical/session-ready counters still cannot produce complete offline readiness',async t=>{
 const f=await fixture(t);await f.manager.prepare(['a.js','voice.mp3']);const installer=f.create();await installer.audit();assert.equal(installer.snapshot().ready,false);assert.ok(installer.snapshot().remainingFiles.includes('index.html'));assert.ok(installer.snapshot().remainingFiles.includes('asset-manifest.json'));
});
test('complete installation includes the exact shell and canonical manifest and reopens from stored bytes',async t=>{
 const f=await fixture(t),a=f.create();await a.install();assert.equal(a.snapshot().ready,true);assert.equal(a.snapshot().remainingFiles.length,0);assert.equal(a.snapshot().verifiedFiles,5);assert.equal(a.snapshot().percent,100);
 const before=f.calls.length,b=f.create();await b.audit();assert.equal(b.snapshot().ready,true);assert.equal(f.calls.length,before);assert.equal(await (await f.cache.match(f.base+'index.html')).text(),'<html>one release</html>');
});
test('missing and same-length corrupted disk files revoke readiness despite a completion receipt',async t=>{
 const f=await fixture(t),a=f.create();await a.install();await f.cache.delete(f.base+'voice.mp3');await a.audit();assert.equal(a.snapshot().ready,false);assert.ok(a.snapshot().remainingFiles.includes('voice.mp3'));
 await a.install();await f.cache.put(f.base+'a.js',new Response('garbage'));await a.audit();assert.equal(a.snapshot().ready,false);assert.ok(a.snapshot().remainingFiles.includes('a.js'));
});
test('Retry resumes only missing files and never reports an HTTP failure as completed',async t=>{
 const f=await fixture(t),a=f.create();f.missing('voice.mp3');await a.install();assert.equal(a.snapshot().ready,false);assert.ok(a.snapshot().failures.some(x=>x.url==='voice.mp3'));const count=f.calls.filter(x=>x==='a.js').length;
 f.missing(null);await a.install();assert.equal(a.snapshot().ready,true);assert.equal(f.calls.filter(x=>x==='a.js').length,count);
});
test('storage quota and denied cache are explicit errors rather than memory-backed readiness',async t=>{
 const f=await fixture(t);f.host.navigator.storage.estimate=async()=>({quota:10,usage:10});const a=f.create();await a.install();assert.equal(a.snapshot().ready,false);assert.equal(a.snapshot().errorCode,'quota');
 f.host.caches.open=async()=>{throw Error('denied');};const b=f.create();await b.install();assert.equal(b.snapshot().ready,false);assert.equal(b.snapshot().errorCode,'storage');
});
test('failed persistence of a verified response cannot create an offline receipt',async t=>{
 const f=await fixture(t),a=f.create(),put=f.cache.put.bind(f.cache);f.cache.put=async(key,r)=>{if(String(key).endsWith('voice.mp3'))throw Object.assign(Error('full'),{name:'QuotaExceededError'});return put(key,r);};await a.install();assert.equal(a.snapshot().ready,false);assert.equal(a.snapshot().errorCode,'quota');assert.ok(a.snapshot().remainingFiles.includes('voice.mp3'));
});
test('an incompatible worker prevents offline readiness even when all payloads could be cached',async t=>{
 const f=await fixture(t),a=implementation().create({...f,host:f.host,ensureWorker:async()=>false});await a.install();assert.equal(a.snapshot().ready,false);assert.equal(a.snapshot().errorCode,'worker');
});
test('a receipt and manifest from another release cannot satisfy the current installation',async t=>{
 const f=await fixture(t),a=f.create();await a.install();f.manifest.offline.releaseId='b'.repeat(24);const b=f.create();await b.audit();assert.equal(b.snapshot().ready,false);assert.ok(b.snapshot().remainingFiles.includes('asset-manifest.json'));
});
test('the build declares every player resource plus shell while keeping developer/API paths out',()=>{
 const build=require('../tools/build-asset-manifest.cjs'),m=build(path.resolve(__dirname,'..'),{write:false});assert.ok(m.offline?.files,'A release must publish its complete offline package');
 const urls=new Set(m.offline.files.map(e=>e.url));for(const url of ['index.html','sw.js','education-practice.js','question-data.js','question-language.js','game-language.js','pet-help.js'])assert.ok(urls.has(url),url+' missing from complete package');
 assert.ok(m.entries.every(e=>urls.has(e.url)));assert.equal(m.offline.files.some(e=>/^(?:__dev|api|tools|backend)\//.test(e.url)),false);assert.ok(m.offline.files.some(e=>e.pack==='boss2'));assert.ok(m.offline.files.some(e=>e.pack==='tutorial'));assert.ok(m.offline.files.some(e=>e.kind==='audio'));
});
test('eviction during completion receipt storage cannot leave a false Ready result',async t=>{
 const f=await fixture(t),a=f.create(),put=f.cache.put.bind(f.cache);f.cache.put=async(key,r)=>{await put(key,r);if(String(key).endsWith('/complete.json'))await f.cache.delete(f.base+'a.js');};await a.install();assert.equal(a.snapshot().ready,false);assert.ok(a.snapshot().remainingFiles.includes('a.js'));
});
test('denied storage protection stays disclosed after reopening a complete retained installation',async t=>{
 const f=await fixture(t);f.host.navigator.storage.persist=async()=>false;const a=f.create();await a.install();assert.equal(a.snapshot().ready,true);assert.equal(a.snapshot().persistence,false);const b=f.create();await b.audit();assert.equal(b.snapshot().ready,true);assert.equal(b.snapshot().persistence,false);
});
test('Pause keeps completed files and Resume finishes without refetching their bytes',async t=>{
 const f=await fixture(t),a=f.create(),put=f.cache.put.bind(f.cache);let paused=false;f.cache.put=async(key,r)=>{await put(key,r);if(!paused&&String(key).endsWith('/a.js')){paused=true;a.pause();}};await a.install();assert.equal(a.snapshot().phase,'paused');assert.equal(a.snapshot().ready,false);const count=f.calls.filter(x=>x==='a.js').length;await a.install();assert.equal(a.snapshot().ready,true);assert.equal(f.calls.filter(x=>x==='a.js').length,count);
});
test('changing only the worker changes the release cache identity',()=>{
 const root=path.resolve(__dirname,'..'),worker=path.join(root,'dist/sw.js'),original=fs.readFileSync(worker),build=require('../tools/build-asset-manifest.cjs'),before=build(root,{write:false});
 try{fs.writeFileSync(worker,Buffer.concat([original,Buffer.from('\n/* isolated release-identity test */\n')]));const after=build(root,{write:false});assert.notEqual(after.manifestId,before.manifestId);assert.deepEqual(after.entries,before.entries);}finally{fs.writeFileSync(worker,original);}
});
test('the release build rejects server-only folders before they can enter a player package',()=>{
 const root=path.resolve(__dirname,'..'),dir=path.join(root,'dist/backend'),build=require('../tools/build-asset-manifest.cjs');assert.equal(fs.existsSync(dir),false,'Unexpected real backend folder requires owner review');fs.mkdirSync(dir);fs.writeFileSync(path.join(dir,'offline-qa-probe.js'),'/* server-only probe, never a player resource */');
 try{assert.throws(()=>build(root,{write:false}),/server.only|backend|player package/i);}finally{fs.unlinkSync(path.join(dir,'offline-qa-probe.js'));fs.rmdirSync(dir);}
});
test('eviction while the worker confirms capability cannot be reported as Ready',async t=>{
 const f=await fixture(t);let calls=0;const a=implementation().create({...f,ensureWorker:async()=>{if(++calls===2)await f.cache.delete(f.base+'a.js');return true;}});await a.install();assert.equal(a.snapshot().ready,false);assert.ok(a.snapshot().remainingFiles.includes('a.js'));
});
test('a warm completion never refers to an orphaned cache after its namespace is replaced',async t=>{
 const f=await fixture(t),a=f.create();await a.install();const replacement=new Cache();const b=implementation().create({...f,ensureWorker:async()=>{f.host.caches.open=async()=>replacement;return true;}});await b.install();assert.equal(b.snapshot().ready,true);assert.equal(await (await replacement.match(f.base+'a.js'))?.text(),'runtime');assert.equal(await (await replacement.match(f.base+'index.html'))?.text(),'<html>one release</html>');
});
test('same-key corruption after receipt commit cannot produce Ready',async t=>{
 const f=await fixture(t),a=f.create(),put=f.cache.put.bind(f.cache);f.cache.put=async(key,r)=>{await put(key,r);if(String(key).endsWith('/complete.json')){const replacement=await corruptCopy(f.cache,f.base);f.host.caches.open=async()=>replacement;}};
 await a.install();assert.equal(a.snapshot().ready,false);assert.ok(a.snapshot().remainingFiles.includes('a.js'));
});
for(const action of ['audit','install'])test('warm '+action+' rehashes a same-key replacement namespace before Ready',async t=>{
 const f=await fixture(t),a=f.create();await a.install();const replacement=await corruptCopy(f.cache,f.base);let opens=0;f.host.caches.open=async()=>++opens===1?f.cache:replacement;const b=f.create();await b[action]();
 if(action==='audit'){assert.equal(b.snapshot().ready,false);assert.ok(b.snapshot().remainingFiles.includes('a.js'));}
 else{assert.equal(b.snapshot().ready,true);assert.equal(await (await replacement.match(f.base+'a.js')).text(),'runtime','Ready must refer to repaired retained bytes');}
});

test('a verified startup shell survives without claiming the complete offline package',async t=>{
 const f=await fixture(t);f.manifest.offline.launch=['a.js','index.html','sw.js'];await f.manager.prepare(['a.js']);const a=f.create();const result=await a.prepareLaunch();assert.equal(result.ready,true);assert.equal(a.ready,false);assert.equal(await f.cache.match(f.base+'.__stm_offline__/complete.json'),undefined);assert.ok(await f.cache.match(f.base+'.__stm_offline__/launch.json'));assert.ok(await f.cache.match(f.base+'asset-manifest.json'));assert.equal(f.calls.includes('voice.mp3'),false,'Startup persistence must not force optional files');
});

test('startup receipt writes rehash retained bytes and disclose failed storage',async t=>{
 const f=await fixture(t);f.manifest.offline.launch=['a.js','index.html','sw.js'];await f.manager.prepare(['a.js']);const put=f.cache.put.bind(f.cache);f.cache.put=async(key,r)=>{await put(key,r);if(String(key).endsWith('/launch.json'))await put(f.base+'a.js',new Response('garbage'));};const a=f.create();assert.equal((await a.prepareLaunch()).ready,false);assert.equal(a.ready,false);assert.match(a.launchSnapshot().error,/retained/);
});
test('a worker denial cannot claim a saved startup package',async t=>{
 const f=await fixture(t);f.manifest.offline.launch=['a.js','index.html','sw.js'];const a=implementation().create({...f,ensureWorker:async()=>false});assert.equal((await a.prepareLaunch()).ready,false);assert.equal(a.ready,false);assert.match(a.launchSnapshot().error,/worker/);
});
