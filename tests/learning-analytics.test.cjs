'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const A=require('../dist/learning-analytics.js');
const C=require('../dist/learning-curriculum.js');
const bank=require('../dist/question-data.js');
const S=require('../dist/mechanics.js').session;
const KEY='slay-the-math.learning-analytics.v1';
const clone=value=>JSON.parse(JSON.stringify(value));
function storage(initial={}){const data=new Map(Object.entries(initial));return {get length(){return data.size;},key:index=>[...data.keys()][index]??null,getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key),data};}
function factory(prefix='id'){let n=0;return ()=>prefix+'-'+(++n);}
function store(local=storage(),extra={}){return A.createStore({storage:local,bank,curriculum:C,now:()=> '2026-10-23T10:00:00.000Z',idFactory:factory(),...extra});}
function question(id){return bank.questions.find(q=>q.id===id);}
function owner(id,actions=[]){
 const q=question(id);let session=S.reserveNext(S.createSession({seed:71}),{...bank,questions:[q]}).session,n=0;
 for(const action of actions){
  if(action==='correct'||action==='wrong')session=S.submitAnswer(session,bank,{questionId:id,choiceId:action==='correct'?q.correctChoiceId:q.choices.find(c=>c.id!==q.correctChoiceId).id,attemptId:id+':'+(++n)});
  else if(action==='reveal')session=S.revealAnswer(session,id);
  else session=S.openSupport(session,id,action);
 }
 return session;
}
function observe(target,id,actions=[],options={}){return target.capture(owner(id,actions),{scope:'gameplay',sessionId:'run-a',source:'artifact',language:'en',...options});}
function metrics(row){return Object.fromEntries(['occurrences','answered','distinctAnswered','attempts','wrongAttempts','correct','firstAttemptCorrect','independentFirstTry','correctWithSupport','correctAfterRetry','revealed','revealOnly','pending','openedOnly','firstTryAccuracy','independentFirstTryAccuracy','status'].map(key=>[key,row[key]]));}

test('curriculum binds every canonical question to the verified Form 4 SK/SP and skill/foundation owners',()=>{
 assert.equal(C.form,4);assert.equal(Object.keys(C.learningStandards).length,28);assert.equal(Object.keys(C.contentStandards).length,9);
 assert.equal(C.learningStandards['3.2.4'].ms,'Menentu dan menjustifikasikan kekuatan suatu hujah induktif dan seterusnya menentukan sama ada hujah yang kuat itu meyakinkan.');
 assert.equal(C.contentStandards['4.1'].ms,'Persilangan Set');
 assert.equal(C.contentStandards['9.2'].ms,'Peristiwa Bersandar dan Peristiwa Tak Bersandar');
 assert.deepEqual(C.learningStandards['3.2.4'].source.printedPages,[45]);
 assert.deepEqual(C.learningStandards['3.2.4'].source.pdfPages,[59]);
 const report=store().report();
 assert.equal(report.questions.length,120);assert.equal(report.topics.length,3);assert.equal(report.contentStandards.length,9);assert.equal(report.learningStandards.length,28);assert.equal(report.skills.length,30);
 assert.deepEqual(report.topics.map(r=>[r.id,r.totalQuestions]),[['PROB',40],['SET',40],['LOGIC',40]]);
 for(const q of bank.questions){
  const row=report.questions.find(r=>r.questionId===q.id);
  assert.deepEqual(row.curriculumStandards,q.curriculumStandards,q.id);assert.deepEqual(row.skillIds,q.learning.skillIds,q.id);assert.equal(row.foundationId,q.learning.foundationId,q.id);
  for(const id of q.curriculumStandards){assert.ok(C.learningStandards[id],q.id+': '+id);assert.equal(C.learningStandards[id].topicCode,q.topicCode);assert.ok(C.contentStandards[id.split('.').slice(0,2).join('.')]);}
 }
 assert.equal(report.learningStandards.find(r=>r.id==='9.3.3').totalQuestions,16);
 // 8 in 9.2.1, 15 in 9.2.3, shared PROB-039; 9.2.2 is a subset of 9.2.1.
 assert.equal(report.contentStandards.find(r=>r.id==='9.2').totalQuestions,22);
 assert.equal(report.skills.find(r=>r.id==='set.compound-sets').totalQuestions,13);
});

test('empty and unscored observations stay unassessed without creating records or storage errors',()=>{
 const target=store();assert.deepEqual(target.capture(null,{scope:'gameplay',sessionId:'empty'}),{changed:false,changedRecords:[]});
 assert.deepEqual(target.capture(S.createSession(),{scope:'practice',sessionId:'empty'}),{changed:false,changedRecords:[]});
 assert.deepEqual(target.records(),[]);assert.equal(target.error,'');
 assert.equal(target.report().totals.status,'not-assessed');assert.equal(target.report().totals.firstTryAccuracy,null);assert.equal(target.report().totals.answered,0);
 assert.ok(target.report().questions.every(q=>q.status==='not-assessed'));
});

test('hand-counted mixed evidence has honest denominators and deduplicates multi-SP topic/SK totals',()=>{
 const target=store();
 observe(target,'PROB-001',['correct']);observe(target,'PROB-002',['hint','correct']);observe(target,'PROB-003',['wrong']);observe(target,'PROB-004',['wrong','correct']);
 observe(target,'PROB-005',['wrong','hint','correct']);observe(target,'PROB-006',['reveal']);observe(target,'PROB-007');observe(target,'PROB-008',['wrong','reveal']);observe(target,'SET-001',['correct']);
 const report=target.report();
 assert.deepEqual(metrics(report.totals),{occurrences:9,answered:7,distinctAnswered:7,attempts:9,wrongAttempts:4,correct:5,firstAttemptCorrect:3,independentFirstTry:2,correctWithSupport:2,correctAfterRetry:2,revealed:2,revealOnly:1,pending:2,openedOnly:1,firstTryAccuracy:3/7,independentFirstTryAccuracy:2/7,status:'practice-progress'});
 assert.deepEqual(metrics(report.topics[0]),{occurrences:8,answered:6,distinctAnswered:6,attempts:8,wrongAttempts:4,correct:4,firstAttemptCorrect:2,independentFirstTry:1,correctWithSupport:2,correctAfterRetry:2,revealed:2,revealOnly:1,pending:2,openedOnly:1,firstTryAccuracy:2/6,independentFirstTryAccuracy:1/6,status:'practice-progress'});
 const sk=report.contentStandards.find(r=>r.id==='9.2');assert.equal(sk.occurrences,3);assert.equal(sk.answered,3);assert.equal(sk.wrongAttempts,3);assert.equal(sk.status,'practice-progress');
 const sp=report.learningStandards.find(r=>r.id==='9.3.3');assert.equal(sp.occurrences,3);assert.equal(sp.answered,2);assert.equal(sp.correct,2);assert.equal(sp.revealOnly,1);assert.equal(sp.status,'not-enough-evidence');
 assert.equal(report.sessions.length,1);assert.equal(report.sessions[0].answered,7);
});

test('help after an attempt never retroactively changes that attempt or independent first correctness',()=>{
 const target=store();observe(target,'PROB-001',['wrong']);const before=target.records()[0].record.attempts[0];
 observe(target,'PROB-001',['wrong','hint']);const pending=target.records()[0];
 assert.deepEqual(pending.record.attempts[0],before);assert.equal(pending.record.attempts[0].hintUsed,false);assert.equal(pending.record.hintState.hintUsed,true);
 observe(target,'PROB-001',['wrong','hint','correct']);const corrected=target.records()[0].record;
 assert.equal(corrected.attempts[0].hintUsed,false);assert.equal(corrected.attempts[1].hintUsed,true);assert.equal(target.report().totals.correctWithSupport,1);assert.equal(target.report().totals.correctAfterRetry,1);
 observe(target,'PROB-002',['hint','correct']);const totals=target.report().totals;
 assert.equal(totals.firstAttemptCorrect,1);assert.equal(totals.independentFirstTry,0);assert.equal(totals.answered,2);assert.equal(totals.firstTryAccuracy,1/2);
});

test('a first wrong pending answer counts while reveal-only and opened-only records do not count as incorrect',()=>{
 const target=store();observe(target,'PROB-001',['wrong']);observe(target,'PROB-002',['reveal']);observe(target,'PROB-003');
 const totals=target.report().totals;assert.equal(totals.answered,1);assert.equal(totals.firstTryAccuracy,0);assert.equal(totals.wrongAttempts,1);assert.equal(totals.revealOnly,1);assert.equal(totals.openedOnly,1);assert.equal(totals.status,'not-enough-evidence');
});

test('a supported correction after an earlier wrong answer is also a correction after retry',()=>{
 const target=store();observe(target,'PROB-001',['wrong','hint','correct']);
 const totals=target.report().totals;
 assert.equal(totals.answered,1);assert.equal(totals.correct,1);assert.equal(totals.correctWithSupport,1);assert.equal(totals.correctAfterRetry,1);
 assert.equal(target.records()[0].record.completion.category,'supported');
});

test('closing worked Steps never erases the fact that Steps were opened from report or CSV',()=>{
 const target=store();observe(target,'PROB-001',['correct','steps','steps']);
 assert.equal(target.records()[0].record.stepsViewed,false);assert.equal(target.records()[0].record.events.filter(e=>e.type==='STEPS_TOGGLED').length,2);
 assert.equal(target.report().totals.stepsViewed,1);assert.ok(target.csv().endsWith(',"false","false","false","true"\r\n'));
});

test('Review is independently filterable and excluded from the default combined evidence',()=>{
 const target=store();observe(target,'PROB-001',['wrong'],{scope:'gameplay'});observe(target,'PROB-002',['correct'],{scope:'practice'});observe(target,'PROB-003',['correct'],{scope:'review'});
 assert.equal(target.records().length,3);assert.equal(target.report().totals.answered,2);assert.equal(target.report().totals.firstTryAccuracy,1/2);
 assert.equal(target.report({scope:'gameplay'}).totals.answered,1);assert.equal(target.report({scope:'practice'}).totals.answered,1);assert.equal(target.report({scope:'review'}).totals.answered,1);
 assert.deepEqual(target.report().sessions.map(r=>r.scope).sort(),['gameplay','practice']);
});

test('three occurrences of one stable question are still only one distinct piece of evidence',()=>{
 const target=store();for(const sessionId of ['one','two','three'])observe(target,'PROB-001',['wrong'],{sessionId});
 const totals=target.report().totals;assert.equal(totals.answered,3);assert.equal(totals.distinctAnswered,1);assert.equal(totals.status,'not-enough-evidence');assert.deepEqual(target.report().recommendations,[]);
});

test('recommendations require three distinct answered items and link to the canonical skill and Basics',()=>{
 const target=store();observe(target,'PROB-003',['wrong']);observe(target,'PROB-004',['wrong']);
 assert.deepEqual(target.report().recommendations,[]);
 observe(target,'PROB-005',['correct']);const recommendation=target.report().recommendations.find(r=>r.skillId==='prob.event-probability');
 assert.ok(recommendation);assert.equal(recommendation.foundationId,'fraction-basics');assert.equal(recommendation.topicCode,'PROB');assert.ok(recommendation.questionIds.includes('PROB-003'));
 const skill=target.report().skills.find(r=>r.id==='prob.event-probability');assert.equal(skill.distinctAnswered,3);assert.equal(skill.firstTryAccuracy,1/3);
 assert.equal(target.report({language:'ms'}).topics[0].label,'Kebarangkalian Peristiwa Bergabung');
});

test('same owner observation is idempotent, pending updates preserve occurrence ID, and reload keeps capture time',()=>{
 const local=storage(),target=store(local);const session=owner('PROB-001',['wrong']);session.bankVersion='form4-review-1.4.0';
 const first=target.capture(session,{scope:'practice',sessionId:'p1',source:'practice',language:'en'});assert.equal(first.changed,true);assert.equal(first.changedRecords.length,1);
 assert.equal(first.changedRecords[0].sourceSchemaVersion,1);assert.equal(first.changedRecords[0].bankVersion,'form4-review-1.4.0');
 assert.deepEqual(target.capture(session,{scope:'practice',sessionId:'p1',source:'practice',language:'en'}),{changed:false,changedRecords:[]});
 const reloaded=store(local,{now:()=> '2026-10-23T11:00:00.000Z',idFactory:factory('reopen')});
 const changed=reloaded.capture(owner('PROB-001',['wrong','correct']),{scope:'practice',sessionId:'p1',source:'practice',language:'en'}).changedRecords[0];
 assert.equal(changed.id,first.changedRecords[0].id);assert.equal(changed.firstCapturedAt,'2026-10-23T10:00:00.000Z');assert.equal(changed.updatedAt,'2026-10-23T11:00:00.000Z');assert.equal(reloaded.records().length,1);
 reloaded.report();reloaded.csv();reloaded.exportData();assert.equal(reloaded.records()[0].record.attempts.length,2);
});

test('capture filters current-run IDs, ignores archived/lifetime records and preserves owner/bank/RNG',()=>{
 const a=owner('PROB-001',['correct']),b=owner('PROB-002',['correct']);const session={...a,exposureIds:['PROB-001','PROB-002'],records:{...a.records,...b.records},archivedRecords:{old:b.records['PROB-002']}};
 const before=clone(session),bankBefore=JSON.stringify(bank),target=store();
 const result=target.capture(session,{scope:'gameplay',sessionId:'started:seed',source:'predict',questionIds:['PROB-001'],language:'ms'});
 assert.equal(result.changedRecords.length,1);assert.equal(result.changedRecords[0].questionId,'PROB-001');assert.equal(result.changedRecords[0].language,'ms');assert.deepEqual(session,before);assert.equal(JSON.stringify(bank),bankBefore);
 result.changedRecords[0].record.attempts[0].correct=false;const listed=target.records();listed[0].curriculumStandards.push('forged');listed[0].record.events.length=0;
 assert.equal(target.records()[0].record.attempts[0].correct,true);assert.deepEqual(target.records()[0].curriculumStandards,['9.1.1']);assert.equal(target.records()[0].record.events.length,1);
 assert.equal('rngState' in target.records()[0],false);assert.equal('duration' in target.records()[0],false);assert.equal('answeredAt' in target.records()[0],false);
});

test('same-origin instances merge on reads and writes and stale owner snapshots cannot regress a correction',()=>{
 const local=storage(),a=store(local,{idFactory:factory('a')}),b=store(local,{idFactory:factory('b')});
 observe(a,'PROB-001',['wrong']);observe(b,'SET-001',['correct']);assert.equal(a.records().length,2);
 observe(b,'PROB-001',['wrong','correct']);const corrected=b.records().find(r=>r.questionId==='PROB-001');
 assert.deepEqual(observe(a,'PROB-001',['wrong']),{changed:false,changedRecords:[]});assert.equal(a.records().find(r=>r.questionId==='PROB-001').record.status,'correct');
 assert.equal(store(local).records().find(r=>r.questionId==='PROB-001').id,corrected.id);assert.equal(JSON.parse(local.getItem(KEY)).records.length,2);
});

test('interleaved cross-tab commits preserve distinct records after both writers close',()=>{
 for(const trigger of ['first-write','aggregate']){
  const local=storage(),first=store(local,{idFactory:factory('first')}),second=store(local,{idFactory:factory('second')}),commit=local.setItem;let interleave=true;
  local.setItem=(key,value)=>{if(interleave&&(trigger==='first-write'||key===KEY)){interleave=false;observe(second,'SET-001',['correct']);}commit(key,value);};
  observe(first,'PROB-001',['correct']);const reopened=store(local);
  assert.deepEqual(reopened.records().map(r=>r.questionId).sort(),['PROB-001','SET-001']);assert.equal(reopened.report().totals.answered,2);
  // An aggregate projection can be replaced by another tab; journals retain evidence.
  commit(KEY,JSON.stringify({schemaVersion:1,sessions:{},records:[]}));assert.equal(store(local).report().totals.answered,2);
 }
});

test('interleaved same-occurrence commits retain the longest owner history and one stable external ID',()=>{
 const local=storage(),first=store(local,{idFactory:factory('first')}),second=store(local,{idFactory:factory('second'),now:()=> '2026-10-23T11:00:00.000Z'}),commit=local.setItem;let interleave=true,secondResult;
 local.setItem=(key,value)=>{if(interleave){interleave=false;secondResult=observe(second,'PROB-001',['wrong','correct']);}commit(key,value);};
 const firstResult=observe(first,'PROB-001',['wrong']),reopened=store(local);
 assert.equal(reopened.records().length,1);assert.equal(reopened.records()[0].record.status,'correct');assert.equal(reopened.records()[0].record.attempts.length,2);
 assert.equal(reopened.records()[0].firstCapturedAt,'2026-10-23T10:00:00.000Z');assert.equal(reopened.records()[0].updatedAt,'2026-10-23T11:00:00.000Z');
 assert.equal(firstResult.changedRecords[0].id,secondResult.changedRecords[0].id);assert.equal(firstResult.changedRecords[0].record.status,'correct');assert.equal(reopened.report().totals.answered,1);
});

test('new occurrence IDs match independent SHA-256 reference vectors for ASCII and UTF-8 session identities',()=>{
 const target=store();const first=observe(target,'PROB-001',['correct']).changedRecords[0],second=observe(target,'SET-001',['correct'],{scope:'practice',sessionId:'sesi-你好-🧮'}).changedRecords[0];
 assert.equal(first.id,'learning:fa8663de91d9ef6c51b0ea36791aeac536a660c3505606658c3037f6a876ba23');
 assert.equal(second.id,'learning:2b1159365fe59bd7ca73cc1622ca9640bb711fbafe8584f88adc979318ff7358');
});

test('interleaved alias commits remain durable independently of the aggregate projection',()=>{
 const local=storage(),first=store(local),second=store(local),commit=local.setItem;let interleave=true;
 local.setItem=(key,value)=>{if(interleave){interleave=false;second.linkSession('gameplay','retry-b','original-b');}commit(key,value);};
 first.linkSession('gameplay','retry-a','original-a');commit(KEY,JSON.stringify({schemaVersion:1,sessions:{},records:[]}));const reopened=store(local);
 observe(reopened,'PROB-001',['correct'],{sessionId:'original-a'});observe(reopened,'PROB-001',['correct'],{sessionId:'retry-a'});observe(reopened,'SET-001',['correct'],{sessionId:'original-b'});observe(reopened,'SET-001',['correct'],{sessionId:'retry-b'});
 assert.equal(reopened.report().totals.answered,2);assert.deepEqual(reopened.exportData().sessionAliases,{gameplay:{'retry-a':'original-a','retry-b':'original-b'}});
});

test('healthy journals remain exportable when the legacy aggregate projection becomes corrupt',()=>{
 const local=storage(),first=store(local);observe(first,'PROB-001',['correct']);observe(first,'SET-001',['correct']);const corrupt='{damaged projection';local.setItem(KEY,corrupt);
 const reopened=store(local);assert.equal(reopened.records().length,2);assert.equal(reopened.exportData().records.length,2);assert.equal(local.getItem(KEY),corrupt);assert.match(reopened.error,/read|damaged|corrupt/i);
});

test('Retry aliases preserve one real answer across changed run starts and reloads while New Run stays separate',()=>{
 const local=storage(),target=store(local);observe(target,'PROB-001',['correct'],{sessionId:'original-start:71'});const original=target.records()[0];
 assert.equal(target.linkSession('gameplay','retry-start:71','original-start:71'),'original-start:71');
 assert.deepEqual(observe(target,'PROB-001',['correct'],{sessionId:'retry-start:71'}),{changed:false,changedRecords:[]});assert.equal(target.report().totals.answered,1);
 const reloaded=store(local);assert.deepEqual(observe(reloaded,'PROB-001',['correct'],{sessionId:'retry-start:71'}),{changed:false,changedRecords:[]});assert.equal(reloaded.records()[0].id,original.id);assert.equal(reloaded.report().sessions.length,1);
 reloaded.linkSession('gameplay','second-retry-start:71','retry-start:71');observe(reloaded,'PROB-001',['correct'],{sessionId:'second-retry-start:71'});assert.equal(reloaded.report().totals.answered,1);
 assert.equal(JSON.parse(local.getItem(KEY)).sessionAliases.gameplay['second-retry-start:71'],'original-start:71');
 observe(reloaded,'PROB-001',['correct'],{sessionId:'genuine-new-start:71'});assert.equal(reloaded.report().totals.answered,2);assert.equal(reloaded.report().sessions.length,2);
});

test('session aliases merge across instances, stay scope-local and handle prototype-like IDs without cycles',()=>{
 const local=storage(),a=store(local,{idFactory:factory('a')}),b=store(local,{idFactory:factory('b')});
 a.linkSession('gameplay','retry-one','original');b.linkSession('gameplay','retry-two','retry-one');a.linkSession('gameplay','__proto__','retry-two');
 assert.equal(a.linkSession('gameplay','original','__proto__'),'original');
 observe(b,'PROB-001',['correct'],{sessionId:'retry-two'});observe(a,'PROB-001',['correct'],{sessionId:'__proto__'});assert.equal(a.report().totals.answered,1);
 observe(a,'PROB-001',['correct'],{scope:'practice',sessionId:'retry-two'});assert.equal(a.report().totals.answered,2);
 assert.equal(store(local).report({scope:'gameplay'}).totals.answered,1);assert.equal(Object.getPrototypeOf(JSON.parse(local.getItem(KEY)).sessionAliases.gameplay),Object.prototype);
 assert.throws(()=>a.linkSession('unknown','new','old'),/scope/i);assert.throws(()=>a.linkSession('gameplay','','old'),/session/i);
});

test('corrupt cyclic session aliases preserve original bytes and do not block new in-memory evidence',()=>{
 const original=JSON.stringify({schemaVersion:1,sessions:{},sessionAliases:{gameplay:{one:'two',two:'one'}},records:[]}),local=storage({[KEY]:original}),target=store(local);
 assert.match(target.error,/read|damaged|corrupt/i);target.linkSession('gameplay','retry','original');observe(target,'PROB-001',['correct'],{sessionId:'original'});observe(target,'PROB-001',['correct'],{sessionId:'retry'});
 assert.equal(local.getItem(KEY),original);assert.equal(target.exportData().records.length,1);assert.match(target.error,/read|damaged|corrupt/i);
});

test('session alias storage is bounded without discarding new continuity or existing links',()=>{
 const aliases=Object.fromEntries(Array.from({length:5000},(_,i)=>['retry-'+i,'original'])),original=JSON.stringify({schemaVersion:1,sessions:{},sessionAliases:{gameplay:aliases},records:[]}),local=storage({[KEY]:original}),target=store(local);
 target.linkSession('gameplay','overflow-retry','original');observe(target,'PROB-001',['correct'],{sessionId:'original'});observe(target,'PROB-001',['correct'],{sessionId:'overflow-retry'});
 assert.match(target.error,/5000|5,000|limit/i);assert.equal(local.getItem(KEY),original);assert.equal(target.exportData().records.length,1);
});

test('stable Practice identities merge across tabs, rotate on explicit reset and keep earlier sessions',()=>{
 const local=storage(),a=store(local,{idFactory:factory('a')}),b=store(local,{idFactory:factory('b')});
 const first=a.getSessionId('practice');assert.equal(b.getSessionId('practice'),first);
 observe(a,'PROB-001',['correct'],{scope:'practice',sessionId:first});const second=b.startSession('practice');assert.notEqual(second,first);assert.equal(a.getSessionId('practice'),second);
 observe(b,'PROB-001',['correct'],{scope:'practice',sessionId:second});assert.equal(store(local).records().length,2);assert.equal(store(local).report().sessions.length,2);
});

test('corrupt bytes are preserved while new observations remain readable and exportable in memory',()=>{
 const original='{broken-but-important',local=storage({[KEY]:original}),target=store(local);
 assert.match(target.error,/read|damaged|corrupt/i);observe(target,'PROB-001',['correct']);assert.equal(local.getItem(KEY),original);assert.equal(target.records().length,1);assert.equal(target.exportData().records.length,1);assert.match(target.csv(),/PROB-001/);assert.match(target.error,/read|damaged|corrupt/i);
});

test('unavailable and quota-limited storage retain new evidence without replacing existing bytes',()=>{
 const unavailable=store({getItem(){throw Error('denied');},setItem(){throw Error('denied');}});observe(unavailable,'PROB-001',['correct']);assert.equal(unavailable.exportData().records.length,1);assert.match(unavailable.error,/save|storage/i);
 const local=storage(),seed=store(local);observe(seed,'PROB-001',['correct']);const original=local.getItem(KEY);local.setItem=()=>{throw Error('quota');};
 const target=store(local);observe(target,'PROB-002',['wrong']);assert.equal(local.getItem(KEY),original);assert.equal(target.records().length,2);assert.equal(target.exportData().records.length,2);assert.match(target.error,/save|full|storage/i);
});

test('the occurrence bound preserves all persisted records and reports unsaved overflow for export',()=>{
 const seed=store();observe(seed,'PROB-001',['correct']);const record=seed.records()[0];
 const records=Array.from({length:5000},(_,i)=>({...clone(record),id:'stored-'+i,sessionId:'run-'+i})),original=JSON.stringify({schemaVersion:1,sessions:{},records}),local=storage({[KEY]:original});
 const target=store(local);observe(target,'PROB-002',['wrong']);assert.match(target.error,/5000|5,000|full|limit/i);assert.equal(local.getItem(KEY),original);assert.equal(target.records().length,5001);assert.equal(target.exportData().records.length,5001);
});

test('malformed source evidence cannot invent a score and empty entries do not damage the store',()=>{
 const target=store(),session=owner('PROB-001',['wrong']);session.records['PROB-002']=null;
 session.records['PROB-001'].sourceSeed=999999;assert.equal(target.capture(session,{scope:'gameplay',sessionId:'bad'}).changed,false);
 const bad=owner('PROB-001',['wrong']);bad.records['PROB-001'].events[0].choiceId='unknown-choice';assert.equal(target.capture(bad,{scope:'gameplay',sessionId:'bad'}).changed,false);
 assert.equal(target.records().length,0);assert.equal(target.error,'');
});

test('export is minimal immutable evidence and CSV neutralizes formulas, quotes and multiline cells',()=>{
 const target=store();observe(target,'PROB-001',['wrong'],{source:' =SUM(1,2)\n"note"'});
 const data=target.exportData();assert.equal(data.schemaVersion,1);assert.equal(data.game,'Slay the Math');assert.equal(data.records.length,1);assert.ok(A.validateRecord(data.records[0],{bank}));
 const forged=clone(data.records[0]);forged.record.attempts[0].correct=true;assert.equal(A.validateRecord(forged,{bank}),false);
 assert.equal('prompt' in data.records[0],false);assert.equal('run' in data.records[0],false);assert.equal('seed' in data.records[0],false);
 const csv=target.csv();assert.ok(csv.startsWith('\uFEFF'));assert.ok(csv.includes('"\' =SUM(1,2)\n""note"""'));assert.ok(csv.endsWith('\r\n'));
 data.records[0].record.events.length=0;assert.equal(target.records()[0].record.events.length,1);
});
