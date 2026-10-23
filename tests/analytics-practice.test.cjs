'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
let JSDOM;try{({JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom'));}catch{}
const project=path.resolve(__dirname,'..'),source=path.join(project,'modules/mechanics/source/QUESTION_BANK');
const M=require('../dist/mechanics.js');
const learningKey='slay-the-math.education-practice.v1',feedbackKey='slay-the-math.question-feedback.v1';
const clone=value=>JSON.parse(JSON.stringify(value));

// Compile the actual folio sources without running a project-wide build. The
// narrow probes below observe only analytics/transport ports; question events,
// persistence, feedback, navigation and native dialogs use production owners.
function sourceDocument(){
 const read=name=>fs.readFileSync(path.join(source,name),'utf8');
 const modules=['more-hint-state.mjs','rich_text/renderer.mjs','learning/support-visual.mjs','learning/session.mjs','learning/visual-renderer.mjs','learning/question-feedback.mjs','learning/question-feedback-ui.mjs','learning/preview.mjs'];
 const script=read('../STM_SHARED/registry.js')+'\n'+read('../STM_SHARED/rich-text.js')+'\n'+fs.readFileSync(path.join(project,'dist/question-language.js'),'utf8')+'\nconst sharedRichText=globalThis.STMSharedRichText;\n'+modules.map(read).join('\n').replace(/^import [^\n]+\n/gm,'').replace(/\bexport (?=(?:function|const|class)\b)/g,'');
 return read('learning/preview.html').replace('__STYLE__','').replace('__DATA__',()=>JSON.stringify(M.data).replace(/</g,'\\u003c')).replace('__SCRIPT__',()=>script);
}
function boot(values=new Map(),options={}){
 const errors=[],captures=[],queued=[],sessionStarts=[],downloads=[],shares=[],snapshots=new Map();
 const storage={getItem:k=>values.get(k)??null,setItem(k,v){if(options.failStorage)throw Error('quota');values.set(k,String(v));},removeItem:k=>values.delete(k)};
 const probe={storeCreated:0,clientCreated:0,starts:0,stops:0,enabledCalls:[],status:{enabled:false,pending:0,state:'on-device',error:'',sending:false,receiverAvailable:null,lastReceivedAt:null,pendingEntries:[]}};
 let revision=0,sequence=0,changed;
 const dom=new JSDOM(sourceDocument(),{url:options.srcdoc?'about:srcdoc':'https://practice.example/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  Object.defineProperty(w,'localStorage',{value:storage});
  w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
  w.HTMLElement.prototype.scrollIntoView=function(){};
  w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
  w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new w.Event('close'));};
  w.URL.createObjectURL=file=>{downloads.push(file);return 'blob:analytics';};w.URL.revokeObjectURL=()=>{};
  w.HTMLAnchorElement.prototype.click=function(){};
  w.navigator.canShare=()=>true;w.navigator.share=async payload=>{shares.push(payload);if(options.abortShare)throw new w.DOMException('Cancelled','AbortError');};
  if(options.dev)w.STMDevMode={get:()=>true};
  if(options.srcdoc){Object.defineProperty(w,'origin',{value:'https://practice.example'});Object.defineProperty(w.document,'baseURI',{value:'https://practice.example/'});Object.defineProperty(w,'parent',{value:{location:{origin:'https://practice.example',href:'https://practice.example/'},postMessage(){},...(options.devParent?{STMDevMode:{get:()=>false}}:{})}});}
  w.DC_EDUCATION_ENDPOINT='/api/education';w.DCLearningCurriculum={version:1};
  w.DCAnalytics={createStore(){probe.storeCreated++;return {
   getSessionId(scope){const key='qa.analytics.session.'+scope;let id=storage.getItem(key);if(!id){id=scope+'-'+(++sequence);try{storage.setItem(key,id);}catch{}}return id;},
   startSession(scope){const id=scope+'-'+(++sequence);sessionStarts.push({scope,id});try{storage.setItem('qa.analytics.session.'+scope,id);}catch{}return id;},
   capture(session,context){captures.push({session:clone(session),context:clone(context)});if(options.throwCapture&&Object.keys(session.records).length)throw Error('Capture fixture failed');const changedRecords=[];
    for(const record of Object.values(session.records)){if(context.questionIds&&!context.questionIds.includes(record.questionId))continue;
     const id=context.scope+':'+context.sessionId+':'+record.questionId,previous=snapshots.get(id);
     if(previous&&JSON.stringify(previous.record)===JSON.stringify(record))continue;
     const snapshot={id,schemaVersion:1,bankVersion:M.data.bank.bankVersion,questionId:record.questionId,scope:context.scope,sessionId:context.sessionId,source:context.source,language:context.language,record:clone(record)};
     snapshots.set(id,snapshot);changedRecords.push(clone(snapshot));}
    return {changed:changedRecords.length>0,changedRecords};},
   records:()=>[...snapshots.values()].map(clone),report:({scope='all'}={})=>({scope,totals:{answered:[...snapshots.values()].filter(r=>scope==='all'?r.scope!=='review':r.scope===scope).filter(r=>r.record.attempts.length).length}}),
   exportData:()=>({records:[...snapshots.values()].map(clone)}),csv:()=>'Question ID\r\nPROB-001\r\n',get error(){return options.analyticsError||'';}
  };}};
  w.DCLearningSync={createClient(config){probe.clientCreated++;changed=config.onchange;return {
   enqueue(entry){if(options.throwEnqueue)throw Error('Enqueue fixture failed');queued.push(clone(entry));probe.status.pending++;probe.status.pendingEntries.push({...clone(entry),revision:++revision});if(probe.status.enabled)probe.status.state='waiting';return {changed:true,entry:clone(entry),error:''};},
   setEnabled(enabled){probe.enabledCalls.push(enabled);probe.status.enabled=enabled;probe.status.state=enabled?'waiting':'on-device';changed?.();},
   status:()=>clone(probe.status),flush:async()=>{changed?.();},start(){probe.starts++;},stop(){probe.stops++;}
  };}};
  w.DCAnalyticsUI=options.realUI?require('../dist/analytics-ui.js'):{html:({report,status,language})=>'<p data-test-report>'+report.scope+' '+language+'</p><p role="status">'+status.state+' '+status.error+'</p><button data-analytics-action="scope" data-scope="review">Review</button><button data-analytics-action="export" data-exportformat="csv">CSV</button><button data-analytics-action="export" data-exportformat="json">JSON</button><button data-analytics-action="share">Share records</button><button data-analytics-action="sync">Send pending</button>'};
  w.addEventListener('error',event=>errors.push(event.error?.message||event.message));
 }});
 const w=dom.window,d=w.document;
 const click=id=>{const button=d.getElementById(id);assert.ok(button,'missing #'+id);button.focus();button.click();};
 const set=(id,value)=>{const node=d.getElementById(id);node.value=value;node.dispatchEvent(new w.Event(node.tagName==='TEXTAREA'?'input':'change',{bubbles:true}));};
 const question=()=>M.data.bank.questions.find(q=>q.id===d.getElementById('question-select').value);
 const answer=correct=>{const q=question();d.querySelector('#choices input[value="'+(correct?q.correctChoiceId:q.choices.find(c=>c.id!==q.correctChoiceId).id)+'"]').click();click('submit-answer');};
 const readFile=file=>new Promise((resolve,reject)=>{const reader=new w.FileReader();reader.onerror=reject;reader.onload=()=>resolve(reader.result);reader.readAsText(file);});
 return {dom,w,d,values,storage,probe,captures,queued,snapshots,sessionStarts,downloads,shares,errors,click,set,question,answer,readFile,changeStatus(next){Object.assign(probe.status,next);changed?.();}};
}

test('Practice captures real Learning transitions once per occurrence and rotates only on explicit Learning reset',{skip:!JSDOM},()=>{
 const app=boot(new Map([['duel-cube-math.v1','keep-run'],['duel-cube-question-history.v1','keep-history']]));
 try{
  assert.equal(app.probe.storeCreated,1,'one folio analytics store');
  assert.equal(app.captures.some(c=>c.context.scope==='review'),false,'default Review render has no evidence');
  app.click('resume-learning');const id=app.question().id;
  app.click('hint-tab');app.answer(false);app.click('more-hint-tab');app.answer(true);app.click('show-steps');
  const record=[...app.snapshots.values()].find(r=>r.scope==='practice'&&r.questionId===id);
  assert.ok(record);assert.deepEqual(record.record.events.map(e=>e.type),['HINT_REVEALED','ANSWER_SUBMITTED','MORE_HINT_OPENED','ANSWER_SUBMITTED','STEPS_TOGGLED']);
  assert.equal(record.record.completion.category,'supported');assert.equal(record.record.attempts.length,2);
  assert.equal([...app.snapshots.values()].filter(r=>r.scope==='practice').length,1);
  const before=app.queued.length;app.set('language-select','ms');app.click('progress-button');app.click('learning-report');
  assert.equal(app.queued.length,before,'render/report controls do not revise owner evidence');
  app.d.getElementById('practice-analytics-dialog').dispatchEvent(new app.w.Event('cancel',{cancelable:true}));
  app.click('reset-learning');app.click('confirm-reset-learning');
  assert.ok(app.sessionStarts.some(s=>s.scope==='practice'));assert.equal([...app.snapshots.values()].filter(r=>r.scope==='practice'&&r.record.attempts.length).length,1,'prior report retained');
  assert.ok([...app.snapshots.values()].some(r=>r.scope==='practice'&&r.sessionId!==record.sessionId),'fresh Learning identity');
  assert.equal(app.values.get('duel-cube-math.v1'),'keep-run');assert.equal(app.values.get('duel-cube-question-history.v1'),'keep-history');assert.deepEqual(app.errors,[]);
 }finally{app.dom.window.close();}
});

test('Practice restores persisted Learning with the same analytics identity while Review remains separately scoped',{skip:!JSDOM},()=>{
 const values=new Map();let expectedSession,id;
 const first=boot(values);try{first.click('resume-learning');id=first.question().id;first.answer(false);expectedSession=[...first.snapshots.values()].find(r=>r.scope==='practice').sessionId;}finally{first.dom.window.close();}
 const again=boot(values);try{
  const restored=[...again.snapshots.values()].find(r=>r.scope==='practice');assert.ok(restored,'capture persisted owner records at startup');assert.equal(restored.sessionId,expectedSession);assert.equal(restored.questionId,id);assert.equal(restored.record.attempts.length,1);
  again.set('question-select',id);again.click('hint-tab');again.answer(true);
  const review=[...again.snapshots.values()].find(r=>r.scope==='review');assert.ok(review);assert.notEqual(review.sessionId,expectedSession);assert.equal(restored.record.attempts.length,1);
  again.click('restart-review');again.answer(true);
  assert.equal([...again.snapshots.values()].filter(r=>r.scope==='review'&&r.record.attempts.length).length,2,'explicit review restart has a new occurrence');assert.deepEqual(again.errors,[]);
 }finally{again.dom.window.close();}
});

test('Practice feedback queues actual changed snapshots and deletion tombstones without altering comment text or native exit cancellation',{skip:!JSDOM},()=>{
 const app=boot();try{
  const comment='<script>inert</script> Keep my words.';app.set('feedback-comment',comment);
  const saved=app.queued.filter(e=>e.kind==='question-feedback');assert.equal(saved.length,1);assert.equal(saved[0].payload.comment,comment);
  assert.equal(saved[0].payload.id,saved[0].id);assert.equal(JSON.parse(app.values.get(feedbackKey)).comments[0].comment,comment);assert.equal(app.d.querySelector('#question-feedback script'),null);
  app.click('feedback-save');assert.equal(app.queued.filter(e=>e.kind==='question-feedback').length,1,'unchanged explicit save does not enqueue an edit');
  app.click('feedback-finish');assert.match(app.d.getElementById('feedback-exit-delivery').textContent,/not been sent automatically|on this device/i);
  app.click('feedback-exit-cancel');assert.equal(app.d.getElementById('feedback-comment').value,comment);assert.equal(app.d.activeElement.id,'feedback-finish');
  app.d.querySelector('#question-feedback [data-feedback-export="csv"]').click();assert.equal(app.downloads.length,1);assert.match(app.downloads[0].name,/comments.*\.csv$/);
  app.set('feedback-comment','');const deleted=app.queued.filter(e=>e.kind==='question-feedback').at(-1);assert.equal(deleted.id,saved[0].id);assert.equal(deleted.payload.deleted,true);assert.equal(deleted.payload.questionId,saved[0].payload.questionId);assert.equal(JSON.parse(app.values.get(feedbackKey)).comments.length,0);assert.deepEqual(app.errors,[]);
 }finally{app.dom.window.close();}
});

test('Practice report is a named native dialog, preserves keyboard focus and exports data while native comment sharing still works',{skip:!JSDOM},async()=>{
 const app=boot(new Map(),{abortShare:true});try{
  app.click('learning-report');const dialog=app.d.getElementById('practice-analytics-dialog');assert.equal(dialog.open,true);assert.equal(dialog.getAttribute('aria-labelledby'),'practice-analytics-title');
  app.d.querySelector('[data-analytics-action="scope"]').click();assert.match(app.d.querySelector('[data-test-report]').textContent,/review/);
  app.d.querySelector('[data-analytics-action="export"]').focus();app.changeStatus({state:'offline'});assert.equal(app.d.activeElement.dataset.analyticsAction,'export','transport refresh keeps the current keyboard action');
  app.d.querySelector('[data-analytics-action="export"]').click();assert.equal(app.downloads.length,1);assert.match(app.downloads[0].name,/learning.*\.csv$/);
  dialog.dispatchEvent(new app.w.Event('cancel',{cancelable:true}));assert.equal(dialog.open,false);assert.equal(app.d.activeElement.id,'learning-report');
  app.set('feedback-comment','Share this exact comment.');app.d.querySelector('#question-feedback [data-feedback-share]').click();await new Promise(resolve=>setImmediate(resolve));assert.equal(app.shares.length,1);assert.match(app.shares[0].files[0].name,/comments/);assert.equal(app.d.getElementById('feedback-comment').value,'Share this exact comment.');assert.match(app.d.getElementById('feedback-status').textContent,/Sharing cancelled/);assert.deepEqual(app.errors,[]);
 }finally{app.dom.window.close();}
});

test('Practice collection stays off by default, reports waiting until exact acknowledgement, and never starts in Dev',{skip:!JSDOM},()=>{
 const app=boot();try{
  assert.equal(app.probe.clientCreated,1);assert.equal(app.probe.status.enabled,false);app.set('feedback-comment','Keep pending.');app.click('learning-report');
  app.d.querySelector('[data-analytics-action="share"]').click();assert.deepEqual(app.probe.enabledCalls,[true]);
  app.changeStatus({enabled:true,pending:1,state:'offline'});app.click('feedback-finish');assert.doesNotMatch(app.d.getElementById('feedback-exit-delivery').textContent,/have been sent|received by/i);assert.match(app.d.getElementById('feedback-exit-delivery').textContent,/offline|waiting|pending/i);
  app.changeStatus({enabled:true,pending:0,state:'received',lastReceivedAt:'2026-10-23T12:00:00.000Z'});assert.match(app.d.getElementById('feedback-exit-delivery').textContent,/received|acknowledged/i);assert.deepEqual(app.errors,[]);
 }finally{app.dom.window.close();}
 const dev=boot(new Map(),{dev:true});try{dev.click('learning-report');dev.d.querySelector('[data-analytics-action="share"]').click();dev.d.querySelector('[data-analytics-action="sync"]').click();assert.equal(dev.probe.starts,0);assert.equal(dev.probe.enabledCalls.includes(true),false);assert.deepEqual(dev.errors,[]);}finally{dev.dom.window.close();}
});

test('Practice keeps unreadable original progress/comments and exportable new observations when browser storage fails',{skip:!JSDOM},()=>{
 const values=new Map([[learningKey,'{broken-learning'],[feedbackKey,'{broken-comments']]);const app=boot(values,{failStorage:true,analyticsError:'Learning report could not be saved. Export before leaving.'});
 try{
  app.click('resume-learning');app.answer(false);app.set('feedback-comment','New feedback remains here.');app.click('learning-report');
  assert.equal(values.get(learningKey),'{broken-learning');assert.equal(values.get(feedbackKey),'{broken-comments');assert.ok([...app.snapshots.values()].some(r=>r.record.attempts.length===1));
  assert.match(app.d.getElementById('feedback-storage-warning').textContent,/could not be read|could not be saved/);assert.match(app.d.getElementById('practice-analytics-content').textContent,/Export before leaving|could not be saved/);assert.deepEqual(app.errors,[]);
 }finally{app.dom.window.close();}
});

test('Practice permits the real inherited HTTP srcdoc origin while every Dev iframe remains local',{skip:!JSDOM},()=>{
 const app=boot(new Map(),{srcdoc:true});try{assert.equal(app.probe.starts,1,'HTTP srcdoc can resume opted-in work');app.click('learning-report');assert.equal(app.d.querySelector('[data-analytics-action="share"]').disabled,false);assert.deepEqual(app.errors,[]);}finally{app.dom.window.close();}
 const dev=boot(new Map(),{srcdoc:true,devParent:true});try{dev.click('learning-report');assert.equal(dev.probe.starts,0);assert.equal(dev.d.querySelector('[data-analytics-action="share"]').disabled,true);assert.match(dev.d.getElementById('practice-analytics-content').textContent,/Developer practice/);assert.deepEqual(dev.errors,[]);}finally{dev.dom.window.close();}
});

test('Practice preserves a receiver failure as unavailable rather than labelling it a local save failure',{skip:!JSDOM},()=>{
 const app=boot(new Map(),{realUI:true});try{
  app.set('language-select','ms');app.changeStatus({enabled:true,pending:1,state:'unavailable',error:'The receiver is unavailable.'});app.click('learning-report');
  const state=app.d.querySelector('.analytics-sync-state').textContent;assert.match(state,/Pelayan penerima belum tersedia/);assert.doesNotMatch(state,/Simpanan memerlukan perhatian/);assert.deepEqual(app.errors,[]);
 }finally{app.dom.window.close();}
});

test('Practice capture and enqueue exceptions cannot block owner saving or JSON recovery export',{skip:!JSDOM},async()=>{
 const blocked=[];
 for(const failure of ['throwCapture','throwEnqueue']){
  const app=boot(new Map(),{[failure]:true});try{
   app.click('resume-learning');if(!app.values.get(learningKey)){blocked.push(failure);continue;}
   const id=app.question().id;app.answer(false);const saved=app.values.get(learningKey),owner=JSON.parse(saved);assert.equal(owner.records[id].attempts.length,1);assert.equal(app.d.getElementById('question-heading').textContent,id);
   app.click('learning-report');assert.match(app.d.getElementById('practice-analytics-content').textContent,/export.*before leaving/i);
   app.d.querySelector('[data-analytics-action="export"][data-exportformat="json"]').click();const exported=JSON.parse(await app.readFile(app.downloads.at(-1)));
   assert.equal(exported.ownerRecovery.schemaVersion,1);assert.equal(exported.ownerRecovery.scope,'practice');assert.deepEqual(exported.ownerRecovery.session,owner);assert.equal(app.values.get(learningKey),saved,'recovery export leaves the owner unchanged');assert.equal(JSON.stringify(exported).includes('"secret"'),false);assert.equal(JSON.stringify(exported).includes('"clientId"'),false);assert.equal(app.queued.some(entry=>entry.payload.ownerRecovery),false);assert.deepEqual(app.errors,[]);
  }finally{app.dom.window.close();}
 }
 assert.deepEqual(blocked,[],'analytics failures cannot block Practice persistence');
});

function realBoot(values=new Map(),options={}){
 const P=require('../dist/education-practice.js'),errors=[],requests=[],downloads=[];
 const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};
 const dom=new JSDOM(P.createDocument(M.data,options),{url:options.srcdoc?'about:srcdoc':'https://practice.example/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  Object.defineProperty(w,'localStorage',{value:storage});
  if(options.srcdoc){Object.defineProperty(w,'origin',{value:'https://practice.example'});Object.defineProperty(w.document,'baseURI',{value:'https://practice.example/'});Object.defineProperty(w,'parent',{value:{location:{origin:'https://practice.example',href:'https://practice.example/'},postMessage(){}}});}
  w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.HTMLElement.prototype.scrollIntoView=function(){};
  w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new w.Event('close'));};
  w.URL.createObjectURL=file=>{downloads.push(file);return 'blob:analytics';};w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){};
  w.fetch=async(...args)=>{requests.push(args);if(options.fetch)return options.fetch(...args);throw Error('Receiver unavailable in this offline fixture.');};
  w.addEventListener('error',event=>errors.push(event.error?.message||event.message));
 }});
 const w=dom.window,d=w.document,click=id=>{const button=d.getElementById(id);assert.ok(button,'missing #'+id);button.focus();button.click();};
 const question=()=>M.data.bank.questions.find(q=>q.id===d.getElementById('question-select').value);
 const answer=correct=>{const q=question();d.querySelector('#choices input[value="'+(correct?q.correctChoiceId:q.choices.find(c=>c.id!==q.correctChoiceId).id)+'"]').click();click('submit-answer');};
 const store=()=>w.DCAnalytics.createStore({storage,bank:M.data.bank,curriculum:w.DCLearningCurriculum});
 const set=(id,value)=>{const element=d.getElementById(id);element.value=value;element.dispatchEvent(new w.Event(element.tagName==='TEXTAREA'?'input':'change',{bubbles:true}));};
 const pending=()=>w.DCLearningSync.createClient({storage,host:w}).status().pendingEntries;
 const readFile=file=>new Promise((resolve,reject)=>{const reader=new w.FileReader();reader.onerror=reject;reader.onload=()=>resolve(reader.result);reader.readAsText(file);});
 return {dom,w,d,values,errors,requests,downloads,click,question,answer,store,set,pending,readFile};
}

test('Generated folio uses real analytics modules for Learning, reopen, explicit reset and separately filtered Review',{skip:!JSDOM},()=>{
 const values=new Map([['duel-cube-math.v1','game-save-untouched']]);let originalSession,id;
 const first=realBoot(values,{reviewQuestionId:'SET-024'});try{
  assert.equal(first.question().id,'SET-024');assert.equal(first.store().records().length,0,'opening a targeted Review adds no occurrence');
  first.answer(true);assert.equal(first.store().report().totals.answered,0);assert.equal(first.store().report({scope:'review'}).totals.independentFirstTry,1);
  first.click('resume-learning');id=first.question().id;first.answer(false);first.click('hint-tab');first.answer(true);
  const report=first.store().report();assert.equal(report.totals.answered,1);assert.equal(report.totals.attempts,2);assert.equal(report.totals.correctWithSupport,1);assert.equal(report.totals.wrongAttempts,1);
  originalSession=first.store().records().find(r=>r.scope==='practice').sessionId;
  first.click('learning-report');assert.equal(first.d.querySelector('[data-analytics-metric="answered"]').textContent,'1');
  const disclosure=first.d.querySelector('.analytics-disclosure'),exportButton=first.d.querySelector('[data-analytics-action="export"][data-exportformat="csv"]');disclosure.open=true;exportButton.focus();
  const intro=first.d.querySelector('.analytics-intro'),range=first.d.createRange();range.selectNodeContents(intro);first.w.getSelection().addRange(range);const selectedText=first.w.getSelection().toString();
  first.w.dispatchEvent(new first.w.Event('offline'));assert.equal(first.d.activeElement,exportButton);assert.equal(disclosure.open,true);assert.equal(first.w.getSelection().toString(),selectedText,'asynchronous sharing status preserves report text selection');
  const before=values.get('slay-the-math.learning-sync.v1');first.d.querySelector('[data-analytics-action="export"][data-exportformat="csv"]').click();first.click('close-practice-analytics');first.set('language-select','ms');
  assert.equal(values.get('slay-the-math.learning-sync.v1'),before,'report/language/export do not create queue revisions');assert.equal(first.requests.length,0);assert.deepEqual(first.errors,[]);
 }finally{first.dom.window.close();}
 const reopened=realBoot(values);try{
  assert.equal(reopened.store().report().totals.answered,1);assert.equal(reopened.store().records().find(r=>r.scope==='practice').sessionId,originalSession);
  reopened.click('resume-learning');assert.equal(reopened.question().id,id);assert.equal(reopened.store().records().filter(r=>r.scope==='practice').length,1);
  reopened.click('reset-learning');reopened.click('confirm-reset-learning');reopened.answer(true);
  assert.equal(reopened.store().report().totals.answered,2);assert.equal(new Set(reopened.store().records().filter(r=>r.scope==='practice').map(r=>r.sessionId)).size,2);
  assert.equal(values.get('duel-cube-math.v1'),'game-save-untouched');assert.equal(reopened.requests.length,0);assert.deepEqual(reopened.errors,[]);
 }finally{reopened.dom.window.close();}
});

test('Generated folio keeps real feedback revisions and tombstones in the local outbox and exports comments without credentials',{skip:!JSDOM},async()=>{
 const app=realBoot();try{
  app.set('feedback-comment','Use a numbered example, please.');const first=app.pending().find(e=>e.kind==='question-feedback');assert.ok(first);assert.equal(first.revision,1);
  app.click('feedback-save');assert.equal(app.pending().find(e=>e.id===first.id).revision,1,'unchanged Save retains the exact revision');
  app.set('feedback-comment','');const removed=app.pending().find(e=>e.id===first.id);assert.equal(removed.revision,2);assert.equal(removed.payload.deleted,true);
  app.set('feedback-comment','My words after deletion.');assert.equal(app.pending().find(e=>e.id===first.id).revision,3);
  app.click('learning-report');app.d.querySelector('[data-analytics-action="export"][data-exportformat="json"]').click();
  const exported=JSON.parse(await app.readFile(app.downloads.at(-1)));assert.equal(exported.questionFeedback.comments[0].comment,'My words after deletion.');assert.ok(exported.collection.pendingEntries.some(e=>e.id===first.id));assert.equal(JSON.stringify(exported).includes('"secret"'),false);assert.equal(JSON.stringify(exported).includes('"clientId"'),false);
  assert.equal(exported.ownerRecovery.schemaVersion,1);assert.equal(exported.ownerRecovery.scope,'practice');assert.equal(exported.ownerRecovery.sessionId,app.store().getSessionId('practice'));assert.equal(exported.ownerRecovery.session.version,1);
  assert.equal(app.requests.length,0,'collection remains off by default');assert.deepEqual(app.errors,[]);
 }finally{app.dom.window.close();}
});

test('Generated folio preserves earlier evidence when an unreadable Practice save starts a temporary new owner session',{skip:!JSDOM},()=>{
 const values=new Map();const first=realBoot(values);try{first.click('resume-learning');first.answer(false);assert.equal(first.store().report().totals.wrongAttempts,1);}finally{first.dom.window.close();}
 values.set(learningKey,'{unreadable-practice');
 const recovered=realBoot(values);try{
  recovered.click('resume-learning');recovered.answer(true);
  assert.equal(values.get(learningKey),'{unreadable-practice');assert.equal(recovered.store().report().totals.answered,2);assert.equal(recovered.store().report().totals.wrongAttempts,1);assert.equal(recovered.store().report().totals.independentFirstTry,1);assert.deepEqual(recovered.errors,[]);
 }finally{recovered.dom.window.close();}
});

test('Generated folio explicit Save keeps the visible comment authoritative after another tab edits the same question',{skip:!JSDOM},()=>{
 const values=new Map(),first=realBoot(values);let second;
 try{
  first.set('feedback-comment','The text still visible in this tab.');second=realBoot(values);second.set('feedback-comment','A changed comment from another tab.');
  first.click('feedback-save');assert.equal(JSON.parse(values.get(feedbackKey)).comments[0].comment,first.d.getElementById('feedback-comment').value);assert.equal(first.pending().find(e=>e.kind==='question-feedback').payload.comment,'The text still visible in this tab.');assert.deepEqual(first.errors,[]);assert.deepEqual(second.errors,[]);
 }finally{first.dom.window.close();second?.dom.window.close();}
});

test('Generated inherited-srcdoc folio uses actual consent/flush controls and waits for the exact latest revision acknowledgement',{skip:!JSDOM},async()=>{
 const replies=[];
 const fetch=async(url,init)=>{
  if(url.endsWith('/status'))return {ok:true,json:async()=>({protocolVersion:1,enabled:true})};
  if(url.endsWith('/register'))return {ok:true,json:async()=>({registered:true})};
  if(url.endsWith('/batch'))return {ok:true,json:()=>new Promise(resolve=>replies.push({entries:JSON.parse(init.body).entries,resolve}))};
  throw Error('Unexpected receiver path');
 };
 const until=async condition=>{for(let tries=0;tries<40;tries++){if(condition())return;await new Promise(resolve=>setTimeout(resolve,5));}assert.fail('Expected transport transition did not occur');};
 const app=realBoot(new Map(),{fetch,srcdoc:true});try{
  app.set('feedback-comment','First revision.');app.click('learning-report');assert.equal(app.requests.length,0);
  app.d.querySelector('[data-analytics-action="share"]').click();app.d.querySelector('[data-analytics-action="sync"]').click();await until(()=>replies.length===1);
  assert.match(app.d.querySelector('.analytics-sync-state').textContent,/Sending/);assert.doesNotMatch(app.d.querySelector('.analytics-sync-state').textContent,/^Receiver confirmed/);
  app.click('close-practice-analytics');app.set('feedback-comment','Newer revision while sending.');app.click('learning-report');
  replies[0].resolve({acknowledged:replies[0].entries.map(({id,revision})=>({id,revision}))});await until(()=>/Waiting/.test(app.d.querySelector('.analytics-sync-state').textContent));
  assert.equal(app.d.querySelector('[data-analytics-pending]').textContent,'1','old ACK cannot clear the newer edit');
  app.d.querySelector('[data-analytics-action="sync"]').click();await until(()=>replies.length===2);assert.equal(replies[1].entries[0].revision,2);
  replies[1].resolve({acknowledged:replies[1].entries.map(({id,revision})=>({id,revision}))});await until(()=>/^Receiver confirmed/.test(app.d.querySelector('.analytics-sync-state').textContent));
  assert.equal(app.d.querySelector('[data-analytics-pending]').textContent,'0');app.click('close-practice-analytics');app.click('feedback-finish');assert.match(app.d.getElementById('feedback-exit-delivery').textContent,/acknowledged/);assert.deepEqual(app.errors,[]);
 }finally{app.dom.window.close();}
});
