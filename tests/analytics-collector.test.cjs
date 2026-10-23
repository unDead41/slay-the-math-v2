'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),http=require('node:http');
const {spawnSync}=require('node:child_process'),{webcrypto}=require('node:crypto');
const M=require('../dist/mechanics.js'),bank=M.data.bank;
const CLIENT='a'.repeat(48),SECRET='b'.repeat(64),SECOND='c'.repeat(48),SECOND_SECRET='d'.repeat(64);
function moduleApi(){const file=path.resolve(__dirname,'../tools/analytics/collector.cjs');assert.ok(fs.existsSync(file),'The SQLite learning collector is available');return require(file);}
function feedback(comment='Please explain both conditions.'){return {id:'form4-review-1.6.0:PROB-003',questionId:'PROB-003',bankVersion:bank.bankVersion,topic:'Probability of Combined Events',difficulty:'Easy',question:'Heads and an even number?',categories:['hint-unclear'],comment,createdAt:'2026-10-23T10:00:00.000Z',updatedAt:'2026-10-23T10:00:00.000Z',context:{mode:'learn',language:'en',status:'pending',hintUsed:true,moreHintViewed:false,stepsViewed:false}};}
function entry(payload=feedback(),revision=1){return {id:payload.id,revision,kind:'question-feedback',payload};}
function learning(){let session=M.session.createSession({seed:8});session=M.session.reserveNext(session,bank,{topicCode:'PROB',selectionPolicy:'random'}).session;const q=bank.questions.find(q=>q.id===session.pendingQuestionId);return {id:'33333333-3333-4333-8333-333333333333',schemaVersion:1,sourceSchemaVersion:1,bankVersion:bank.bankVersion,questionId:q.id,topicCode:q.topicCode,chapter:q.chapter,curriculumStandards:q.curriculumStandards.slice(),skillIds:q.learning.skillIds.slice(),foundationId:q.learning.foundationId,scope:'practice',sessionId:'practice-session',source:'practice',language:'en',firstCapturedAt:'2026-10-23T10:00:00.000Z',updatedAt:'2026-10-23T10:00:00.000Z',record:session.records[q.id]};}
async function setup(t,{dropResponse=false}={}){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'stm-analytics-')),databasePath=path.join(dir,'education.sqlite');let owner=moduleApi().createCollector({databasePath,bank}),drop=dropResponse;const server=http.createServer(async(req,res)=>{if(drop&&req.url.endsWith('/batch')){const original=res.end;res.end=function(...args){if(this.statusCode===200){drop=false;this.destroy();return this;}return original.apply(this,args);};}try{if(!await owner.handler(req,res)){res.writeHead(404);res.end();}}catch(err){res.writeHead(500);res.end(err.message);}});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(async()=>{await new Promise(resolve=>{server.closeAllConnections();server.close(resolve);});owner.close();fs.rmSync(dir,{recursive:true,force:true});});return {databasePath,base:'http://127.0.0.1:'+server.address().port+'/api/education',get owner(){return owner;},reopen(){owner.close();owner=moduleApi().createCollector({databasePath,bank});}};}
function request(base,route,body,{clientId=CLIENT,secret=SECRET,headers={},method='POST'}={}){return fetch(base+route,{method,headers:{'Content-Type':'application/json','X-STM-Client-Id':clientId,Authorization:'Bearer '+secret,...headers},body:method==='GET'?undefined:JSON.stringify(body)});}
async function register(base,clientId=CLIENT,secret=SECRET){const response=await request(base,'/register',{clientId,secret});assert.equal(response.status,200);return response;}

test('capability registration is idempotent only for the same secret and persists securely in SQLite',async t=>{
 const app=await setup(t);const status=await fetch(app.base+'/status');assert.deepEqual(await status.json(),{protocolVersion:1,enabled:true});await register(app.base);await register(app.base);
 const conflict=await request(app.base,'/register',{clientId:CLIENT,secret:'e'.repeat(64)});assert.equal(conflict.status,409);
 app.reopen();await register(app.base);const stored=fs.readFileSync(app.databasePath);assert.equal(stored.includes(Buffer.from(SECRET)),false);
});
test('authenticated batches commit before ACK, stay isolated and ignore older revisions',async t=>{
 const app=await setup(t);await register(app.base);await register(app.base,SECOND,SECOND_SECRET);
 const unauthenticated=await request(app.base,'/batch',{entries:[entry()]},{secret:'0'.repeat(64)});assert.equal(unauthenticated.status,401);
 let response=await request(app.base,'/batch',{entries:[entry(feedback('Newer comment.'),2)]});assert.equal(response.status,200);assert.deepEqual(await response.json(),{acknowledged:[{id:feedback().id,revision:2}]});
 response=await request(app.base,'/batch',{entries:[entry(feedback('Older stale comment.'),1)]});assert.equal(response.status,200);
 response=await request(app.base,'/batch',{entries:[entry(feedback('Other device.'))]},{clientId:SECOND,secret:SECOND_SECRET});assert.equal(response.status,200);
 app.reopen();const rows=app.owner.exportData().records;assert.equal(rows.length,2);assert.equal(rows.find(row=>row.clientId===CLIENT).payload.comment,'Newer comment.');assert.equal(rows.find(row=>row.clientId===SECOND).payload.comment,'Other device.');
 for(const route of ['/batch','/export','/records','/clients'])assert.equal((await fetch(app.base+route)).status>=400,true);
});
test('invalid metadata, overlarge batches, content types and cross-origin writes cannot partially commit',async t=>{
 const app=await setup(t);await register(app.base);const valid=entry(),unknown=entry({...feedback(),id:'bad',questionId:'PROB-999'});
 for(const body of [{entries:[valid,unknown]},{entries:Array.from({length:26},(_,i)=>({...valid,id:'entry-'+i}))},{entries:[{...valid,revision:0}]},{entries:[{...valid,kind:'arbitrary'}]},{entries:[entry({...feedback(),comment:'x'.repeat(2001)})]}]){
  const response=await request(app.base,'/batch',body);assert.equal(response.status,400);
 }
 assert.equal((await request(app.base,'/batch',{entries:[valid]},{headers:{'Content-Type':'text/plain'}})).status,415);
 assert.equal((await request(app.base,'/batch',{entries:[valid]},{headers:{Origin:'https://other.example'}})).status,403);
 assert.equal(app.owner.exportData().records.length,0);
 const tooLarge=await fetch(app.base+'/batch',{method:'POST',headers:{'Content-Type':'application/json'},body:'x'.repeat(600000)});assert.equal(tooLarge.status,413);
});
test('canonical owner records are accepted and forged question metadata or evidence is rejected',async t=>{
 const app=await setup(t);await register(app.base);const payload=learning(),value={id:payload.id,revision:1,kind:'learning-record',payload};
 let response=await request(app.base,'/batch',{entries:[value]});assert.equal(response.status,200);
 for(const altered of [{...payload,chapter:3},{...payload,curriculumStandards:['3.1.1']},{...payload,record:{...payload.record,status:'correct'}},{...payload,fullRun:{secret:'unwanted'}}]){
  response=await request(app.base,'/batch',{entries:[{...value,revision:2,payload:altered}]});assert.equal(response.status,400);
 }
 assert.equal(app.owner.exportData().records[0].revision,1);
});
test('a lost HTTP response after durable SQLite commit is replayed once across collector and client reopen',async t=>{
 const app=await setup(t,{dropResponse:true}),{createClient}=require('../dist/learning-sync.js'),values=new Map(),storage={get length(){return values.size;},key:index=>[...values.keys()][index]??null,getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
 let sync=createClient({storage,crypto:webcrypto,fetch,endpoint:app.base,online:true});sync.enqueue({id:feedback().id,kind:'question-feedback',payload:feedback()});sync.setEnabled(true);await sync.flush();
 assert.equal(sync.status().pending,1);assert.equal(app.owner.exportData().records.length,1);sync.stop();app.reopen();
 sync=createClient({storage,crypto:webcrypto,fetch,endpoint:app.base,online:true});await sync.flush();assert.equal(sync.status().pending,0);assert.equal(sync.status().state,'received');assert.equal(app.owner.exportData().records.length,1);assert.equal(app.owner.exportData().records[0].revision,1);
});
test('operator JSON and CSV export persist tombstones and neutralize formulas without exposing capabilities',async t=>{
 const app=await setup(t);await register(app.base);await request(app.base,'/batch',{entries:[entry(feedback('=HYPERLINK("bad")\nPlease clarify.'))]});const second={id:'form4-review-1.6.0:SET-001',questionId:'SET-001',bankVersion:bank.bankVersion,deleted:true,updatedAt:'2026-10-23T10:01:00.000Z'};await request(app.base,'/batch',{entries:[entry(second)]});
 const report=app.owner.exportData();assert.equal(report.records.length,2);assert.equal(JSON.stringify(report).includes(SECRET),false);assert.equal(report.records.find(row=>row.id===second.id).payload.deleted,true);
 const csv=app.owner.csv();assert.ok(csv.startsWith('\uFEFF'));assert.ok(csv.includes('"\'=HYPERLINK(""bad"")\nPlease clarify."'));
 const output=path.join(path.dirname(app.databasePath),'operator.json'),command=spawnSync(process.execPath,[path.resolve(__dirname,'../tools/analytics/export.cjs'),'--db',app.databasePath,'--format','json','--output',output],{encoding:'utf8'});assert.equal(command.status,0,command.stderr);assert.equal(JSON.parse(fs.readFileSync(output,'utf8')).records.length,2);
});
test('optional server binds loopback, serves the game and exposes only the public endpoint hint',async t=>{
 const file=path.resolve(__dirname,'../tools/analytics/server.cjs');assert.ok(fs.existsSync(file),'The optional same-origin collector server is available');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'stm-analytics-server-')),gameRoot=path.join(dir,'game');fs.mkdirSync(gameRoot);fs.writeFileSync(path.join(gameRoot,'index.html'),'<!doctype html><html><head></head><body>Game fixture</body></html>');fs.writeFileSync(path.join(dir,'private.sqlite'),'private');
 const app=await require(file).start({port:0,databasePath:path.join(dir,'data','test.sqlite'),gameRoot});t.after(async()=>{await new Promise(resolve=>{app.server.closeAllConnections();app.server.close(resolve);});fs.rmSync(dir,{recursive:true,force:true});});
 assert.equal(app.server.address().address,'127.0.0.1');const origin='http://127.0.0.1:'+app.server.address().port,response=await fetch(origin),html=await response.text();assert.equal(response.status,200);assert.ok(html.includes('Game fixture'));assert.ok(html.includes('window.DC_EDUCATION_ENDPOINT="/api/education"'));assert.equal(html.includes('secret'),false);
 assert.deepEqual(await (await fetch(origin+'/api/education/status')).json(),{protocolVersion:1,enabled:true});assert.equal((await fetch(origin+'/%2e%2e%2fprivate.sqlite')).status,403);assert.equal((await fetch(origin+'/index.html',{method:'POST'})).status,405);
});
test('a raw secret without the Bearer authorization scheme cannot submit a batch',async t=>{
 const app=await setup(t);await register(app.base);const response=await request(app.base,'/batch',{entries:[entry()]},{headers:{Authorization:SECRET}});assert.equal(response.status,401);assert.equal(app.owner.exportData().records.length,0);
});
test('the database owner rejects public paths and symlinks before creating a public database',t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'stm-database-policy-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));const publicPath=path.resolve(__dirname,'../dist/analytics-test-private.sqlite'),folder='analytics-policy-'+path.basename(dir);t.after(()=>fs.rmSync(path.resolve(__dirname,'../dist',folder),{recursive:true,force:true}));
 assert.throws(()=>moduleApi().createCollector({databasePath:publicPath}),/outside public/i);assert.equal(fs.existsSync(publicPath),false);
 const link=path.join(dir,'public-link');fs.symlinkSync(path.resolve(__dirname,'../dist'),link,'dir');assert.throws(()=>moduleApi().createCollector({databasePath:path.join(link,folder,'private.sqlite')}),/outside public/i);assert.equal(fs.existsSync(path.resolve(__dirname,'../dist',folder)),false);
});
test('same-revision changed bytes conflict atomically while identical replay remains idempotent',async t=>{
 const app=await setup(t);await register(app.base);let response=await request(app.base,'/batch',{entries:[entry(feedback('Committed revision one.'))]});assert.equal(response.status,200);
 const other={id:'form4-review-1.6.0:SET-001',questionId:'SET-001',bankVersion:bank.bankVersion,deleted:true,updatedAt:'2026-10-23T10:01:00.000Z'};
 response=await request(app.base,'/batch',{entries:[entry(other),entry(feedback('Different bytes at revision one.'))]});assert.equal(response.status,409);assert.deepEqual(await response.json(),{conflicts:[{id:feedback().id,revision:1}]});
 assert.equal(app.owner.exportData().records.length,1);assert.equal(app.owner.exportData().records[0].payload.comment,'Committed revision one.');
 const reordered=Object.fromEntries(Object.entries(feedback('Committed revision one.')).reverse());response=await request(app.base,'/batch',{entries:[entry(reordered)]});assert.equal(response.status,200);assert.deepEqual(await response.json(),{acknowledged:[{id:feedback().id,revision:1}]});
});
test('overlapping localStorage tab writes at the same revision rebase and deliver the retained edit',async t=>{
 const app=await setup(t),{createClient}=require('../dist/learning-sync.js'),key='slay-the-math.learning-sync.v1',values=new Map(),storage={get length(){return values.size;},key:index=>[...values.keys()][index]??null,getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)},options={crypto:webcrypto,fetch,endpoint:app.base,online:true};
 const first=createClient({storage,...options});first.enqueue({id:feedback().id,kind:'question-feedback',payload:feedback('Baseline comment.')});first.setEnabled(true);await first.flush();
 const beforeEitherWrite=new Map(values);let pausedRead=false;const secondStorage={get length(){return pausedRead?beforeEitherWrite.size:storage.length;},key:index=>pausedRead?[...beforeEitherWrite.keys()][index]??null:storage.key(index),getItem:key=>pausedRead?beforeEitherWrite.get(key)??null:storage.getItem(key),setItem:storage.setItem},second=createClient({storage:secondStorage,...options});
 // Both tabs read revision one before either write. The second tab's synchronous
 // write finishes later, after the first tab has delivered its revision two.
 first.enqueue({id:feedback().id,kind:'question-feedback',payload:feedback('First concurrent edit.')});await first.flush();pausedRead=true;const changed=second.enqueue({id:feedback().id,kind:'question-feedback',payload:feedback('Second concurrent edit.')});pausedRead=false;assert.equal(changed.entry.revision,2);
 await second.flush();assert.equal(second.status().pending,0);assert.equal(second.status().state,'received');const stored=app.owner.exportData().records;assert.equal(stored.length,1);assert.equal(stored[0].revision,3);assert.equal(stored[0].payload.comment,'Second concurrent edit.');assert.equal(JSON.parse(values.get(key)).entries[0].revision,3);
});
test('genuine Bahasa Melayu feedback accepts the canonical localized topic without changing stored text',async t=>{
 const app=await setup(t);await register(app.base);const payload={...feedback('Sila jelaskan kedua-dua syarat.'),topic:bank.topics.PROB.malay,context:{...feedback().context,language:'ms'}};
 const response=await request(app.base,'/batch',{entries:[entry(payload)]});assert.equal(response.status,200);assert.equal(app.owner.exportData().records[0].payload.topic,'Kebarangkalian Peristiwa Bergabung');assert.equal(app.owner.exportData().records[0].payload.comment,'Sila jelaskan kedua-dua syarat.');
});
