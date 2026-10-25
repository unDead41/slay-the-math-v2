'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url'),{webcrypto}=require('node:crypto');
const {JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom');
const root=path.resolve(__dirname,'..'),Report=require('../dist/question-report.js'),Sync=require('../dist/learning-sync.js'),M=require('../dist/mechanics.js'),E=require('../dist/engine.js'),Q=require('../dist/education.js'),F=require('../tools/dev/fixtures.js');
const feedbackKey='slay-the-math.question-feedback.v1',copy=x=>JSON.parse(JSON.stringify(x));
const ownerReady=import(pathToFileURL(path.join(root,'modules/mechanics/source/QUESTION_BANK/learning/question-feedback.mjs')).href);
function disk(){
 const values=new Map(),keys=[];let blocked=false;
 return {get length(){return keys.length;},key:i=>keys[i]??null,getItem:k=>values.get(String(k))??null,setItem(k,v){if(blocked)throw Error('Storage quota');k=String(k);if(!values.has(k))keys.push(k);values.set(k,String(v));},removeItem(k){k=String(k);if(blocked)throw Error('Storage quota');if(values.delete(k))keys.splice(keys.indexOf(k),1);},set blocked(v){blocked=v;}};
}
function reportUI(){
 const dom=new JSDOM('<button id="return">Result</button>',{url:'https://game.example/'}),w=dom.window,d=w.document,attempts=[];
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 let accepts=false,state={enabled:true,state:'received',pending:0,lastReceivedAt:'2026-10-25T00:00:00Z'};
 const controller=Report.create({document:d,storage:w.localStorage,bank:M.data.bank,enqueue:entry=>{attempts.push(copy(entry));if(!accepts)return {entry:null,error:'Queue full'};state={enabled:true,state:'waiting',pending:1};return {changed:true,entry:{id:entry.id,kind:'question-feedback',revision:1,payload:entry},error:''};},getDelivery:()=>state,onOpenSharing:()=>{}});
 const q=M.data.bank.questions[0],input={question:q,record:{questionId:q.id,status:'correct',hintState:{},events:[]},source:'predict',language:'en',focus:d.querySelector('button')};
 return {dom,d,controller,input,attempts,set accepts(v){accepts=v;},node:key=>d.querySelector('[data-report="'+key+'"]')};
}
test('reopening a refused report retains actionable delivery instead of acknowledging an unrelated receipt',()=>{
 const u=reportUI();try{
  u.controller.open(u.input);u.node('comment').value='This saved report never entered the queue';const saved=u.controller.save(),raw=u.dom.window.localStorage.getItem(feedbackKey);
  u.controller.close();u.controller.open(u.input);
  assert.match(u.node('delivery').textContent,/could not be queued/i);
  assert.equal(u.node('sharing').hidden,false);
  assert.equal(u.node('comment').value,saved.comment);
  assert.equal(u.dom.window.localStorage.getItem(feedbackKey),raw,'Opening must preserve original comment/provenance/timestamps.');
 }finally{u.controller.destroy();u.dom.window.close();}
});
test('reopening retries the original refused payload when queue capacity returns without editing feedback',()=>{
 const u=reportUI();try{
  u.controller.open(u.input);u.node('comment').value='Retry the existing report';const saved=u.controller.save(),raw=u.dom.window.localStorage.getItem(feedbackKey);
  u.controller.close();u.accepts=true;u.controller.open(u.input);
  assert.equal(u.attempts.length,2,'A saved but refused report must be offered to the queue again.');
  assert.deepEqual(u.attempts[1],saved,'Retry must not stamp a new report context, version or timestamp.');
  assert.match(u.node('delivery').textContent,/waiting|pending/i);
  assert.doesNotMatch(u.node('delivery').textContent,/acknowledged/i);
  assert.equal(u.dom.window.localStorage.getItem(feedbackKey),raw);
 }finally{u.controller.destroy();u.dom.window.close();}
});
const question={id:'PROB-003',topic:'Probability',difficulty:'Easy',prompt:'A fixed recovery question'};
const other={id:'SET-001',topic:'Sets',difficulty:'Easy',prompt:'A second recovery question'};
function store(api,storage){return api.createQuestionFeedbackStore({storage,bankVersion:'form4-review-1.6.0',questionIds:[question.id,other.id]});}
test('feedback backup merges a concurrent persisted comment with this page unsaved edit when writes fail',async()=>{
 const api=await ownerReady,storage=disk(),a=store(api,storage);a.save(question,[],'original');
 const b=store(api,storage);b.save(other,[],'other page retained');
 const raw=storage.getItem(feedbackKey);storage.blocked=true;a.save(question,[],'new memory report');
 const backup=a.exportData();
 assert.deepEqual(backup.comments.map(c=>[c.questionId,c.comment]),[['PROB-003','new memory report'],['SET-001','other page retained']]);
 assert.equal(storage.getItem(feedbackKey),raw,'Recovery export must not overwrite the stored original.');
});
test('feedback backup retains an unsaved deletion while merging a concurrent persisted comment',async()=>{
 const api=await ownerReady,storage=disk(),a=store(api,storage);a.setReviewed(question,true);
 const b=store(api,storage);b.save(other,[],'retained on disk');
 const raw=storage.getItem(feedbackKey);storage.blocked=true;a.setReviewed(question,false);
 assert.deepEqual(a.exportData().comments.map(c=>c.questionId),['SET-001']);
 assert.equal(storage.getItem(feedbackKey),raw);
});
const settle=()=>new Promise(resolve=>setImmediate(resolve));
function lifecycle(heldAction){
 const jobs=new Map(),document=new EventTarget(),events=new EventTarget(),requests=[];let sequence=0,held=false;
 document.visibilityState='visible';
 const host={crypto:webcrypto,document,AbortController,addEventListener:events.addEventListener.bind(events),removeEventListener:events.removeEventListener.bind(events),setTimeout(fn,ms){const id=++sequence;jobs.set(id,{fn,ms});return id;},clearTimeout:id=>jobs.delete(id)};
 const fetch=async(url,init)=>{const action=url.split('/').pop();requests.push(action);if(action===heldAction&&!held){held=true;return new Promise((resolve,reject)=>init.signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true}));}const body=init.body?JSON.parse(init.body):null;return {ok:true,status:200,json:async()=>action==='status'?{protocolVersion:1,enabled:true}:action==='register'?{registered:true}:{acknowledged:body.entries.map(e=>({id:e.id,revision:e.revision}))}};};
 const client=Sync.createClient({storage:disk(),host,crypto:webcrypto,online:true,fetch});client.enqueue({id:'recovery-entry',kind:'question-feedback',payload:{id:'recovery-entry',comment:'Retain until exact ACK'}});client.setEnabled(true);client.start();
 return {client,host,jobs,requests,async tick(){const [id,job]=jobs.entries().next().value||[];assert.ok(job,'Restart must own a follow-up, without requiring another browser event.');jobs.delete(id);job.fn();await client.flush();await settle();}};
}
for(const action of ['status','batch']){
 test('stop/start during held '+action+' resumes and receives the pending report without an external event',async()=>{
  const f=lifecycle(action);try{
   await settle();assert.ok(f.requests.includes(action));f.client.stop();f.client.start();await settle();await settle();
   if(f.client.status().pending)await f.tick();
   assert.equal(f.client.status().pending,0);assert.equal(f.client.status().state,'received');
  }finally{f.client.stop();}
 });
 for(const pause of ['stop','consent','hidden'])test('a restarted '+action+' request does not send while '+pause+' remains paused',async()=>{
  const f=lifecycle(action);try{
   await settle();const before=f.requests.length;f.client.stop();
   if(pause!=='stop'){f.client.start();if(pause==='consent')f.client.setEnabled(false);else f.host.document.visibilityState='hidden';}
   await settle();await settle();
   assert.equal(f.client.status().pending,1);assert.equal(f.requests.length,before);assert.equal(f.jobs.size,0);
  }finally{f.client.stop();}
 });
}
function bootCorruptFullQueue(){
 const html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8'),dom=new JSDOM(html,{url:'https://learning.example/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,d=w.document;
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 const run=F.questionSetup('PROB-003','artifact');E.selectEducation(run,Q.catalog['PROB-003'].correctChoiceId);E.answerEducation(run);
 const storage=disk(),raw='! original unreadable feedback',old=Array.from({length:5000},(_,i)=>({id:'queue-'+i,kind:'question-feedback',payload:{id:'queue-'+i,comment:'Old pending'},revision:1,acknowledgedRevision:0}));
 storage.setItem(Sync.STORAGE_KEY,JSON.stringify({schemaVersion:1,enabled:true,identity:null,entries:old,lastReceivedAt:null}));
 storage.setItem('duel-cube-math.v1',JSON.stringify(run));storage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true,voiceMuted:true}));storage.setItem(feedbackKey,raw);
 const originalSet=storage.setItem.bind(storage);storage.setItem=(k,v)=>{if(k===feedbackKey)throw Error('Feedback quota');originalSet(k,v);};Object.defineProperty(w,'localStorage',{value:storage});
 w.fetch=async()=>({ok:false,status:503,json:async()=>({})});let client;
 for(const match of html.matchAll(/<script src="([^"]+)"/g)){
  const file=match[1].split('?')[0];if(file==='app.js'){const create=w.DCLearningSync.createClient;w.DCLearningSync.createClient=(...args)=>(client=create(...args));}
  w.eval(fs.readFileSync(path.join(root,'dist',file),'utf8'));
 }
 const click=selector=>{const el=d.querySelector(selector);assert.ok(el,selector);assert.equal(el.disabled,false);el.click();};
 return {dom,w,d,storage,raw,click,get client(){return client;}};
}
test('the offered game JSON backup includes a memory-only report when feedback is corrupt and the real outbox is full',{timeout:30000},async()=>{
 const b=bootCorruptFullQueue();try{
  await settle();b.click('[data-action=continue]');const savedRun=b.storage.getItem('duel-cube-math.v1');b.click('[data-action=question-report]');
  b.d.querySelector('#question-report-dialog textarea').value='RECOVER THIS NEW MEMORY REPORT';b.click('#question-report-dialog [data-report=save]');assert.equal(b.client.status().pending,5000);
  b.click('#question-report-dialog [data-report=sharing]');const downloads=[];b.w.URL.createObjectURL=blob=>(downloads.push(blob),'blob:recovery');b.w.URL.revokeObjectURL=()=>{};b.w.HTMLAnchorElement.prototype.click=function(){};
  b.click('[data-analytics-action=export][data-exportformat=json]');assert.equal(downloads.length,1);
  const text=await new Promise((resolve,reject)=>{const reader=new b.w.FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsText(downloads[0]);}),backup=JSON.parse(text),entry=backup.comments.find(e=>e.id==='form4-review-1.6.0:PROB-003');
  assert.ok(entry,'The advertised backup must include the active reporter memory entry.');assert.equal(entry.comment,'RECOVER THIS NEW MEMORY REPORT');assert.equal(entry.context.source,'artifact');
  assert.equal(backup.pendingEntries.length,5000);assert.equal(b.storage.getItem(feedbackKey),b.raw);assert.equal(b.storage.getItem('duel-cube-math.v1'),savedRun);
 }finally{b.client?.stop();b.dom.window.close();}
});
