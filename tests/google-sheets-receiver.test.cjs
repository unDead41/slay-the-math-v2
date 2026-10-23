'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{services}=require('./helpers/google-services.cjs'),M=require('../dist/mechanics.js'),bank=M.data.bank;
const CLIENT='a'.repeat(48),SECRET='b'.repeat(64),at='2026-10-23T10:00:00.000Z';
function feedback(comment='Hint kurang jelas'){return {id:bank.bankVersion+':PROB-003',questionId:'PROB-003',bankVersion:bank.bankVersion,topic:bank.topics.PROB.malay,difficulty:'Easy',question:'Soalan kebarangkalian',categories:['hint-unclear'],comment,createdAt:at,updatedAt:at,context:{mode:'learn',language:'ms',status:'pending',hintUsed:true,moreHintViewed:false,stepsViewed:false}};}
function entry(payload=feedback(),revision=1,kind='question-feedback'){return {id:payload.id,revision,kind,payload};}
function request(action,body=null,secret=SECRET){return {protocolVersion:1,action,body,clientId:action==='batch'?CLIENT:null,secret:action==='batch'?secret:null};}
function setup(){const s=services(),c=s.load();c.setupCollector_();const dispatch=r=>JSON.parse(JSON.stringify(c.stmEducationDispatch(JSON.parse(JSON.stringify(r)))));assert.equal(dispatch(request('register',{clientId:CLIENT,secret:SECRET})).status,200);return {s,c,dispatch,batch:entries=>dispatch(request('batch',{entries}))};}
function learning(){let session=M.session.createSession({seed:8});session=M.session.reserveNext(session,bank,{topicCode:'PROB',selectionPolicy:'random'}).session;const q=bank.questions.find(q=>q.id===session.pendingQuestionId);const wrong=q.choices.find(c=>c.id!==q.correctChoiceId);session=M.session.submitAnswer(session,bank,{questionId:q.id,choiceId:wrong.id,attemptId:'wrong'});session=M.session.openSupport(session,q.id,'hint');session=M.session.submitAnswer(session,bank,{questionId:q.id,choiceId:q.correctChoiceId,attemptId:'retry'});return {id:'learning:canonical-test',schemaVersion:1,sourceSchemaVersion:1,bankVersion:bank.bankVersion,questionId:q.id,topicCode:q.topicCode,chapter:q.chapter,curriculumStandards:q.curriculumStandards.slice(),skillIds:q.learning.skillIds.slice(),foundationId:q.learning.foundationId,scope:'practice',sessionId:'practice-session',source:'practice',language:'ms',firstCapturedAt:at,updatedAt:at,record:session.records[q.id]};}
test('owner setup is idempotent, keeps raw/client tabs hidden and stores only hashed capabilities',()=>{
 const {s,c,dispatch}=setup();c.setupCollector_();assert.equal(s.books.size,1);assert.equal(s.books.values().next().value.getSheetByName('_Clients').hidden,true);assert.equal(s.books.values().next().value.getSheetByName('_Records').hidden,true);assert.equal(dispatch(request('register',{clientId:CLIENT,secret:SECRET})).status,200);assert.equal(dispatch(request('register',{clientId:CLIENT,secret:'c'.repeat(64)})).status,409);assert.equal(JSON.stringify([...s.books.values()].map(b=>[...b.sheets.values()].map(s=>s.rows))).includes(SECRET),false);assert.equal(s.locked,false);
});
test('real owner records and BM feedback project diagnostic metrics only after flush',()=>{
 const {s,batch}=setup(),p=learning();assert.equal(batch([entry(p,1,'learning-record'),entry()]).status,200);assert.equal(s.rows('Learning').length,2);assert.equal(s.rows('Comments')[1].includes('Hint kurang jelas'),true);const row=Object.fromEntries(s.rows('Learning')[0].map((h,i)=>[h,s.rows('Learning')[1][i]]));assert.equal(row['Wrong attempts'],1);assert.equal(row['Answered'],1);assert.equal(row['Independent first try'],0);assert.equal(row['Hint used'],true);assert.equal(row.Language,'ms');assert.ok(s.flushes>0);
});
test('invalid canonical metadata/events and unauthenticated writes cannot partially persist a batch',()=>{
 const {s,batch,dispatch}=setup(),p=learning();assert.equal(dispatch(request('batch',{entries:[entry()]},'0'.repeat(64))).status,401);
 for(const altered of [{...p,chapter:3},{...p,record:{...p.record,status:'pending'}},{...p,unexpected:'field'}])assert.equal(batch([entry(),entry(altered,1,'learning-record')]).status,400);
 assert.equal(batch([entry({...feedback(),questionId:'PROB-999'})]).status,400);assert.equal(s.rows('_Records').length,1);
});
test('same-revision conflicts prevalidate the whole batch; replay and old revisions never duplicate rows',()=>{
 const {s,batch}=setup();assert.equal(batch([entry(feedback('New'),2)]).status,200);assert.equal(batch([entry(feedback('Old'),1)]).status,200);assert.equal(batch([entry(feedback('New'),2)]).status,200);
 const tomb={id:bank.bankVersion+':SET-001',questionId:'SET-001',bankVersion:bank.bankVersion,deleted:true,updatedAt:at};assert.equal(batch([entry(tomb),entry(feedback('Conflict'),2)]).status,409);assert.equal(s.rows('_Records').length,2);assert.equal(s.rows('Comments')[1].includes('New'),true);assert.equal(batch([entry({...feedback(),deleted:true},3)]).status,400);
 assert.equal(batch([entry({id:feedback().id,questionId:'PROB-003',bankVersion:bank.bankVersion,deleted:true,updatedAt:at},3)]).status,200);assert.equal(s.rows('Comments')[1].includes(true),true);
});
test('a projection or flush interruption returns no ACK; identical retry repairs the projection',()=>{
 for(const failure of ['Comments','flush']){const {s,batch}=setup();s.failOnce(failure);const first=batch([entry()]);assert.equal(first.status,503);assert.equal(first.body.acknowledged,undefined);assert.equal(s.rows('_Records').length,2);assert.equal(batch([entry()]).status,200);assert.equal(s.rows('Comments').length,2);assert.equal(s.locked,false);}
});
test('formula-like comments stay inert and raw large Unicode payload chunks round-trip exactly',()=>{
 const {s,batch}=setup();const p={...feedback('=HYPERLINK("bad")\n'+ '🙂'.repeat(490)),question:'中'.repeat(7900)};assert.equal(batch([entry(p)]).status,200);assert.ok(s.rows('Comments')[1].includes("'"+p.comment));const chunks=s.rows('_Records')[1].slice(7).filter(Boolean).map(cell=>cell.slice(5)).join('');assert.deepEqual(JSON.parse(chunks),p);for(const cell of s.rows('_Records')[1].slice(7))assert.ok(cell.length<=16000);
});
test('HtmlService bootstrap requires a configured exact origin and nonce; lock failures remain retryable',()=>{
 const {s,c,dispatch}=setup(),nonce='e'.repeat(64);const good=c.doGet({parameter:{stmNonce:nonce,stmParentOrigin:'http://localhost:4173'}});assert.ok(good.html.includes('stm-google-ready'));assert.equal(good.mode,'ALLOWALL');for(const origin of ['https://evil.example','http://localhost:4173.evil.test'])assert.ok(!c.doGet({parameter:{stmNonce:nonce,stmParentOrigin:origin}}).html.includes(nonce));assert.ok(!c.doGet({parameter:{stmNonce:'bad',stmParentOrigin:'http://localhost:4173'}}).html.includes('stm-google-ready'));s.holdLock(true);assert.equal(dispatch(request('batch',{entries:[entry()]})).status,503);s.holdLock(false);assert.equal(dispatch(request('batch',{entries:[entry()]})).status,200);
});
module.exports={feedback,learning};

test('bundled validator accepts all 120 real owners with ordered support, retries and reveals',()=>{
 const {batch}=setup();let session=M.session.createSession({seed:127031}),captured=0;
 for(let i=0;i<120;i++){
  const next=M.session.reserveNext(session,bank,{selectionPolicy:'random'});session=next.session;const q=bank.questions.find(q=>q.id===session.pendingQuestionId);assert.ok(q);
  if(i%3===0){session=M.session.openSupport(session,q.id,'hint');session=M.session.submitAnswer(session,bank,{questionId:q.id,choiceId:q.choices.find(c=>c.id!==q.correctChoiceId).id,attemptId:'wrong-'+i});session=M.session.openSupport(session,q.id,'moreHint');session=M.session.openSupport(session,q.id,'foundation');}
  session=i%4===0?M.session.revealAnswer(session,q.id):M.session.submitAnswer(session,bank,{questionId:q.id,choiceId:q.correctChoiceId,attemptId:'answer-'+i});session=M.session.openSupport(session,q.id,'steps');
  const p={...learning(),id:'learning:all-'+q.id,questionId:q.id,topicCode:q.topicCode,chapter:q.chapter,curriculumStandards:q.curriculumStandards,skillIds:q.learning.skillIds,foundationId:q.learning.foundationId,record:session.records[q.id]};assert.equal(batch([entry(p,1,'learning-record')]).status,200,q.id);captured++;
 }
 assert.equal(captured,120);
});
test('a stored newer revision repairs its projection even when an older retry arrives',()=>{
 const {s,batch}=setup();s.failOnce('Comments');assert.equal(batch([entry(feedback('Newest'),3)]).status,503);assert.equal(batch([entry(feedback('Old retry'),1)]).status,200);assert.equal(s.rows('Comments')[1].includes('Newest'),true);assert.equal(s.rows('_Records')[1][3],3);
});

test('canonical chunk boundaries round-trip formula prefixes, original quotes and Unicode through replay',()=>{
 const {s,c,batch}=setup();const base=M.session.reserveNext(M.session.createSession({seed:8}),bank,{topicCode:'PROB',selectionPolicy:'random'}).session,q=bank.questions.find(q=>q.id===base.pendingQuestionId),boundary=15995;
 function payload(attemptId){const owner=M.session.submitAnswer(base,bank,{questionId:q.id,choiceId:q.correctChoiceId,attemptId});return {...learning(),id:'learning:chunk-boundary',record:owner.records[q.id]};}
 let revision=0;
 for(const prefix of ['=','-',"'=abc","'",'🙂']){
  let attemptId='x'.repeat(20000),raw=c.stmStable_(payload(attemptId)),offset=boundary-raw.indexOf(attemptId);assert.ok(offset>0&&offset<attemptId.length);attemptId=attemptId.slice(0,offset)+prefix+attemptId.slice(offset+prefix.length);const p=payload(attemptId);raw=c.stmStable_(p);assert.equal(raw.slice(boundary,boundary+prefix.length),prefix);assert.ok(Buffer.byteLength(raw)>32000&&Buffer.byteLength(raw)<65536);const e=entry(p,++revision,'learning-record');assert.equal(batch([e]).status,200);assert.equal(batch([e]).status,200,'exact retry: '+prefix);
  const stored=s.rows('_Records')[1].slice(7);assert.ok(stored.filter(Boolean).length>=3);assert.ok(stored.every(cell=>cell.length<=16000));assert.ok(stored.filter(Boolean).every(cell=>cell.startsWith('json:')));assert.deepEqual(JSON.parse(stored.filter(Boolean).map(cell=>cell.slice(5)).join('')),p);
 }
});
