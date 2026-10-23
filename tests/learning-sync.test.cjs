'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {webcrypto}=require('node:crypto');
const KEY='slay-the-math.learning-sync.v1';
function api(){const file=path.resolve(__dirname,'../dist/learning-sync.js');assert.ok(fs.existsSync(file),'The offline learning outbox is available');return require(file);}
function disk(initial=[]){const values=new Map(initial);return {get length(){return values.size;},key:index=>[...values.keys()][index]??null,getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value)),values};}
function feedback(comment='Keep both conditions clear.'){return {id:'form4-review-1.6.0:PROB-003',questionId:'PROB-003',bankVersion:'form4-review-1.6.0',comment};}
function entry(comment){const payload=feedback(comment);return {id:payload.id,kind:'question-feedback',payload};}
function client(storage,options={}){return api().createClient({storage,crypto:webcrypto,online:()=>false,...options});}
async function receiver(t,onBatch){const server=http.createServer(async(req,res)=>{const url=new URL(req.url,'http://localhost');let data='';for await(const chunk of req)data+=chunk;res.setHeader('Content-Type','application/json');if(url.pathname.endsWith('/status'))return res.end(JSON.stringify({protocolVersion:1,enabled:true}));if(url.pathname.endsWith('/register'))return res.end(JSON.stringify({registered:true}));if(url.pathname.endsWith('/batch'))return onBatch(JSON.parse(data),res,req);res.writeHead(404);res.end('{}');});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>new Promise(resolve=>{server.closeAllConnections();server.close(resolve);}));return 'http://127.0.0.1:'+server.address().port+'/api/education';}
function clock(){let current=0,next=1;const jobs=new Map(),events=new EventTarget();return {host:{crypto:webcrypto,addEventListener:events.addEventListener.bind(events),removeEventListener:events.removeEventListener.bind(events),setTimeout(callback,delay){const id=next++;jobs.set(id,{callback,at:current+delay});return id;},clearTimeout:id=>jobs.delete(id)},now:()=>current,get jobs(){return jobs.size;},async advance(ms){current+=ms;for(let round=0;round<50;round++){const due=[...jobs.entries()].find(([,job])=>job.at<=current);if(!due)return;jobs.delete(due[0]);due[1].callback();await new Promise(resolve=>setImmediate(resolve));}},dispatch:type=>events.dispatchEvent(new Event(type))};}

test('offline observations persist opt-in and revisions across reopen without changing game saves',()=>{
 const storage=disk([['duel-cube-math.v1','untouched']]),first=client(storage);
 assert.equal(first.status().enabled,false);assert.equal(first.status().state,'on-device');
 assert.equal(first.enqueue(entry()).entry.revision,1);assert.equal(first.enqueue(entry()).changed,false);
 first.setEnabled(true);assert.equal(first.status().state,'offline');
 const reopened=client(storage);assert.equal(reopened.status().enabled,true);assert.equal(reopened.status().pending,1);
 assert.equal(reopened.enqueue(entry('Explain the intersection.')).entry.revision,2);
 assert.equal(storage.getItem('duel-cube-math.v1'),'untouched');
});
test('two same-origin clients merge different pending entries and fresh same-id edits',()=>{
 const storage=disk(),first=client(storage),second=client(storage);
 first.enqueue(entry('First comment.'));const other={...entry('Other question.'),id:'form4-review-1.6.0:SET-001',payload:{...feedback('Other question.'),id:'form4-review-1.6.0:SET-001',questionId:'SET-001'}};
 second.enqueue(other);second.enqueue(entry('Newer first comment.'));
 assert.equal(first.status().pending,2);assert.equal(first.status().pendingEntries.find(e=>e.id===entry().id).revision,2);
 assert.deepEqual(client(storage).status().pendingEntries.map(e=>e.payload.comment).sort(),['Newer first comment.','Other question.']);
});
test('corrupt and quota-failed storage preserves original bytes and exportable new observations',()=>{
 const corrupt=disk([[KEY,'{broken']]),first=client(corrupt);first.enqueue(entry());
 assert.equal(corrupt.getItem(KEY),'{broken');assert.equal(first.status().state,'save-error');assert.equal(first.status().pendingEntries[0].payload.comment,'Keep both conditions clear.');
 const storage=disk(),second=client(storage);second.enqueue(entry('Saved before quota.'));const original=storage.getItem(KEY),write=storage.setItem;
 storage.setItem=()=>{throw Error('quota');};second.enqueue(entry('Retained after quota.'));
 assert.equal(storage.getItem(KEY),original);assert.match(second.status().error,/save|storage/i);assert.equal(second.status().pendingEntries[0].payload.comment,'Retained after quota.');
 storage.setItem=write;second.enqueue(entry('Retained after quota.'));assert.equal(client(storage).status().pendingEntries[0].payload.comment,'Retained after quota.');
});
test('only acknowledged exact revisions leave the pending set and received receipts suppress rerenders',async t=>{
 let step=0;const endpoint=await receiver(t,(body,res)=>{step++;res.end(JSON.stringify({acknowledged:step===1?[{id:body.entries[0].id,revision:body.entries[0].revision}]:body.entries.map(e=>({id:e.id,revision:e.revision}))}));});
 const storage=disk(),sync=client(storage,{online:true,fetch,endpoint});sync.enqueue(entry());sync.enqueue({id:'second-entry',kind:'question-feedback',payload:{...feedback('Second'),id:'second-entry'}});sync.setEnabled(true);
 await sync.flush();assert.equal(sync.status().pending,1);assert.equal(sync.status().state,'waiting');
 await sync.flush();assert.equal(sync.status().pending,0);assert.equal(sync.status().state,'received');
 const reopened=client(storage);assert.equal(reopened.enqueue(entry()).changed,false);assert.equal(reopened.enqueue(entry('Changed after acknowledgement.')).entry.revision,2);
});
test('a new edit made while a real HTTP batch is outstanding survives the earlier revision acknowledgement',async t=>{
 let reply,observed;const received=new Promise(resolve=>observed=resolve),endpoint=await receiver(t,(body,res)=>{reply=()=>res.end(JSON.stringify({acknowledged:body.entries.map(e=>({id:e.id,revision:e.revision}))}));observed();});
 const storage=disk(),sync=client(storage,{online:true,fetch,endpoint});sync.enqueue(entry('Revision one.'));sync.setEnabled(true);const first=sync.flush(),second=sync.flush();assert.equal(first,second);await received;
 sync.enqueue(entry('Revision two.'));reply();await first;
 assert.equal(sync.status().pending,1);assert.equal(sync.status().pendingEntries[0].revision,2);assert.equal(client(storage).status().pendingEntries[0].payload.comment,'Revision two.');
});
test('malformed HTTP acknowledgement never discards pending bytes',async t=>{
 const endpoint=await receiver(t,(_body,res)=>res.end(JSON.stringify({acknowledged:[{id:entry().id,revision:1},{id:'not-submitted',revision:100}]}))),storage=disk(),sync=client(storage,{online:true,fetch,endpoint});sync.enqueue(entry());sync.setEnabled(true);const before=storage.getItem(KEY);await sync.flush();
 assert.equal(sync.status().pending,1);assert.equal(sync.status().state,'unavailable');assert.equal(storage.getItem(KEY),before);
});
test('start retries with bounded backoff, online resumes, and stop cancels owned timers',async t=>{
 let working=false;const endpoint=await receiver(t,(body,res)=>{if(!working){res.writeHead(503);return res.end('{}');}res.end(JSON.stringify({acknowledged:body.entries.map(e=>({id:e.id,revision:e.revision}))}));}),time=clock(),sync=client(disk(),{online:true,fetch,endpoint,host:time.host,now:time.now});sync.enqueue(entry());sync.setEnabled(true);sync.start();await sync.flush();
 assert.equal(sync.status().pending,1);assert.equal(time.jobs,1);await time.advance(1000);await sync.flush();assert.equal(time.jobs,1);
 working=true;time.dispatch('online');await sync.flush();assert.equal(sync.status().pending,0);sync.stop();assert.equal(time.jobs,0);
});
test('Dev sandbox and unavailable secure randomness never send observations',async t=>{
 const endpoint=await receiver(t,(_body,res)=>{res.writeHead(500);res.end('{}');}),storage=disk(),sync=client(storage,{online:true,fetch,endpoint,host:{STMDevMode:{get:()=>true},crypto:webcrypto}});sync.enqueue(entry());sync.setEnabled(true);await sync.flush();assert.equal(sync.status().pending,1);assert.equal(sync.status().receiverAvailable,false);
 const insecure=api().createClient({storage:disk(),online:true,crypto:{},fetch,endpoint});insecure.enqueue(entry());insecure.setEnabled(true);await insecure.flush();assert.equal(insecure.status().pending,1);assert.match(insecure.status().error,/secure|random/i);
});
test('a full queue refuses one more entry without evicting any unsent evidence',()=>{
 const entries=Array.from({length:5000},(_,i)=>({id:'entry-'+i,kind:'question-feedback',payload:{...feedback('Pending '+i),id:'entry-'+i},revision:1,acknowledgedRevision:0}));const raw=JSON.stringify({schemaVersion:1,enabled:false,identity:null,entries,lastReceivedAt:null}),storage=disk([[KEY,raw]]),sync=client(storage);
 const result=sync.enqueue(entry('Over capacity.'));assert.equal(result.changed,false);assert.match(result.error,/full/i);assert.equal(sync.status().pending,5000);assert.equal(storage.getItem(KEY),raw);
});
test('quota failure while saving an ACK retains the exact revision for idempotent replay',async t=>{
 let reply,observed;const received=new Promise(resolve=>observed=resolve),endpoint=await receiver(t,(body,res)=>{reply=()=>res.end(JSON.stringify({acknowledged:body.entries.map(e=>({id:e.id,revision:e.revision}))}));observed();});
 const storage=disk(),sync=client(storage,{online:true,fetch,endpoint});sync.enqueue(entry());sync.setEnabled(true);const write=storage.setItem,before=storage.getItem(KEY),pending=sync.flush();await received;storage.setItem=()=>{throw Error('quota');};reply();await pending;
 assert.equal(sync.status().pending,1);assert.equal(sync.status().state,'save-error');assert.equal(storage.getItem(KEY),before);storage.setItem=write;sync.enqueue(entry());assert.equal(client(storage).status().pending,1);
});
test('a browser client refuses a receiver at a different origin before sending capability credentials',async t=>{
 const endpoint=await receiver(t,(_body,res)=>{res.end('{}');}),sync=client(disk(),{online:true,fetch,endpoint,host:{location:{href:'https://game.example/',origin:'https://game.example'},crypto:webcrypto}});sync.enqueue(entry());sync.setEnabled(true);await sync.flush();assert.equal(sync.status().pending,1);assert.equal(sync.status().receiverAvailable,false);assert.match(sync.status().error,/origin/i);
});
test('an inherited same-origin srcdoc folio delivers through its HTTP document base',async t=>{
 const endpoint=await receiver(t,(body,res)=>res.end(JSON.stringify({acknowledged:body.entries.map(e=>({id:e.id,revision:e.revision}))}))),origin=new URL(endpoint).origin;
 const host={location:{href:'about:srcdoc',origin:'null'},origin,document:{baseURI:origin+'/practice/'},crypto:webcrypto},sync=client(disk(),{online:true,fetch,endpoint:'/api/education',host});sync.enqueue(entry());sync.setEnabled(true);await sync.flush();assert.equal(sync.status().pending,0);assert.equal(sync.status().state,'received');
});
test('automatic failed delivery stops after five attempts until an online event restarts it',async t=>{
 let batches=0;const endpoint=await receiver(t,(_body,res)=>{batches++;res.writeHead(503);res.end('{}');}),time=clock(),sync=client(disk(),{online:true,fetch,endpoint,host:time.host,now:time.now});t.after(()=>sync.stop());sync.enqueue(entry());sync.setEnabled(true);sync.start();await sync.flush();
 for(const elapsed of [1000,2000,5000,15000]){await time.advance(elapsed);for(let i=0;i<2000&&sync.status().sending;i++)await new Promise(resolve=>setTimeout(resolve,1));assert.equal(sync.status().sending,false);}
 assert.equal(batches,5);assert.equal(sync.status().pending,1);assert.equal(time.jobs,0);await time.advance(600000);assert.equal(batches,5);
 time.dispatch('online');await sync.flush();assert.equal(batches,6);assert.equal(time.jobs,1);
});
test('a conflict response retries the latest edit once without replacing a newer local revision',async t=>{
 let reply,observed,batches=0;const received=new Promise(resolve=>observed=resolve),endpoint=await receiver(t,(body,res)=>{batches++;if(batches===1){reply=()=>{res.writeHead(409);res.end(JSON.stringify({conflicts:[{id:body.entries[0].id,revision:1}]}));};observed();return;}res.end(JSON.stringify({acknowledged:body.entries.map(e=>({id:e.id,revision:e.revision}))}));}),storage=disk(),sync=client(storage,{online:true,fetch,endpoint});sync.enqueue(entry('Sent revision one.'));sync.setEnabled(true);const pending=sync.flush();await received;sync.enqueue(entry('Newer revision two.'));reply();await pending;
 assert.equal(sync.status().pending,0);assert.equal(batches,2);const saved=JSON.parse(storage.getItem(KEY)).entries[0];assert.equal(saved.revision,2);assert.equal(saved.payload.comment,'Newer revision two.');assert.equal(saved.acknowledgedRevision,2);
});
test('interleaved tab writes preserve distinct entries after both return and the game reopens',()=>{
 const storage=disk(),first=client(storage),second=client(storage),write=storage.setItem;let interleaved=false;
 const other={id:'second-logical-entry',kind:'question-feedback',payload:{...feedback('Second tab evidence.'),id:'second-logical-entry'}};
 storage.setItem=(key,value)=>{if(key===KEY&&!interleaved){interleaved=true;assert.equal(second.enqueue(other).changed,true);}write(key,value);};
 assert.equal(first.enqueue(entry('First tab evidence.')).changed,true);const reopened=client(storage);assert.equal(reopened.status().pending,2);assert.deepEqual(reopened.status().pendingEntries.map(e=>e.payload.comment).sort(),['First tab evidence.','Second tab evidence.']);
});
test('an ACK projection interleaved with another tab edit cannot erase the newer pending revision',async t=>{
 let reply,observed;const received=new Promise(resolve=>observed=resolve),endpoint=await receiver(t,(body,res)=>{reply=()=>res.end(JSON.stringify({acknowledged:body.entries.map(e=>({id:e.id,revision:e.revision}))}));observed();}),storage=disk(),first=client(storage,{online:true,fetch,endpoint});first.enqueue(entry('Sent revision one.'));first.setEnabled(true);const second=client(storage),pending=first.flush();await received;
 const write=storage.setItem;let interleaved=false;storage.setItem=(key,value)=>{if(key===KEY&&!interleaved){interleaved=true;assert.equal(second.enqueue(entry('Concurrent revision two.')).entry.revision,2);}write(key,value);};reply();await pending;
 const reopened=client(storage);assert.equal(reopened.status().pending,1);assert.equal(reopened.status().pendingEntries[0].revision,2);assert.equal(reopened.status().pendingEntries[0].payload.comment,'Concurrent revision two.');assert.equal(first.status().pending,1);
});
test('a delayed payload journal write cannot replace a higher revision committed by another tab',()=>{
 const storage=disk(),first=client(storage),second=client(storage),write=storage.setItem;let interleaved=false;
 storage.setItem=(key,value)=>{if(key.startsWith(KEY+'.entry.')&&!interleaved){interleaved=true;assert.equal(second.enqueue(entry('Second tab revision one.')).entry.revision,1);assert.equal(second.enqueue(entry('Second tab revision two.')).entry.revision,2);}write(key,value);};
 first.enqueue(entry('Delayed first tab revision one.'));const reopened=client(storage),pending=reopened.status().pendingEntries;assert.equal(pending.length,1);assert.equal(pending[0].revision,2);assert.equal(pending[0].payload.comment,'Second tab revision two.');assert.equal(first.status().pendingEntries[0].payload.comment,'Second tab revision two.');
});
test('old mutable entry and receipt journals remain readable when immutable journaling is introduced',()=>{
 const payload={bankVersion:'form4-review-1.6.0',comment:'Old journal comment.',id:'form4-review-1.6.0:PROB-003',questionId:'PROB-003'},id=payload.id;
 const storage=disk([[KEY,JSON.stringify({schemaVersion:1,enabled:false,identity:null,entries:[],lastReceivedAt:null})],[KEY+'.entry.'+encodeURIComponent(id),JSON.stringify({schemaVersion:1,id,kind:'question-feedback',payload,revision:3,acknowledgedRevision:0})],[KEY+'.receipt.'+encodeURIComponent(id),JSON.stringify({schemaVersion:1,id,revision:3,kind:'question-feedback',signature:JSON.stringify(payload),receivedAt:'2026-10-23T10:00:00.000Z'})]]),sync=client(storage);
 assert.equal(sync.status().pending,0);assert.equal(sync.enqueue(entry('Edited after journal migration.')).entry.revision,4);const reopened=client(storage);assert.equal(reopened.status().pending,1);assert.equal(reopened.status().pendingEntries[0].revision,4);assert.equal(reopened.status().pendingEntries[0].payload.comment,'Edited after journal migration.');
});
test('concurrent final-slot admissions remain readable and exportable when the queue temporarily exceeds its bound',()=>{
 const entries=Array.from({length:4999},(_,i)=>({id:'seed-'+i,kind:'question-feedback',payload:{id:'seed-'+i},revision:1,acknowledgedRevision:0})),storage=disk([[KEY,JSON.stringify({schemaVersion:1,enabled:false,identity:null,entries,lastReceivedAt:null})]]),first=client(storage),second=client(storage),write=storage.setItem;let interleaved=false;
 const addition=id=>({id,kind:'question-feedback',payload:{id}});storage.setItem=(key,value)=>{if(key.startsWith(KEY+'.entry.')&&!interleaved){interleaved=true;assert.equal(second.enqueue(addition('second-last-slot')).changed,true);}write(key,value);};
 assert.equal(first.enqueue(addition('first-last-slot')).changed,true);first.setEnabled(false);const reopened=client(storage),state=reopened.status();assert.equal(state.pending,5001);assert.equal(state.pendingEntries.length,5001);assert.equal(new Set(state.pendingEntries.map(e=>e.id)).size,5001);assert.equal(state.state,'save-error');assert.match(state.error,/queue|5,?000|capacity/i);
 const refused=reopened.enqueue(addition('one-more-slot'));assert.equal(refused.changed,false);assert.equal(reopened.status().pending,5001);assert.match(refused.error,/full|limit/i);assert.equal(reopened.status().pendingEntries.some(e=>e.id==='first-last-slot'),true);assert.equal(reopened.status().pendingEntries.some(e=>e.id==='second-last-slot'),true);
});
test('healthy immutable journals remain exportable beside a corrupt aggregate without replacing its bytes',()=>{
 const storage=disk(),original=client(storage);original.enqueue(entry('Journal survives the broken projection.'));storage.setItem(KEY,'{broken projection');const reopened=client(storage);
 assert.equal(reopened.status().pending,1);assert.equal(reopened.status().pendingEntries[0].payload.comment,'Journal survives the broken projection.');assert.equal(reopened.status().state,'save-error');
 reopened.enqueue({id:'new-observation',kind:'question-feedback',payload:{id:'new-observation',comment:'Keep this in memory for export.'}});reopened.setEnabled(false);assert.equal(storage.getItem(KEY),'{broken projection');assert.equal(reopened.status().pending,2);assert.equal(client(storage).status().pending,1);
});
