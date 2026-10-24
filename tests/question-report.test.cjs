'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom');
const M=require('../dist/mechanics.js'),Q=require('../dist/education.js'),E=require('../dist/engine.js'),F=require('../tools/dev/fixtures.js'),Feedback=require('../dist/question-feedback.js'),Report=require('../dist/question-report.js');
const bank=M.data.bank,copy=x=>JSON.parse(JSON.stringify(x));
function result(source,{help=false,correct=false}={}){
 const run=F.questionSetup('PROB-002',source),q=Q.catalog['PROB-002'],wrong=q.choices.filter(c=>c.id!==q.correctChoiceId);
 const answer=id=>source==='predict'?(E.selectForecast(run,id),E.answerBankForecast(run)):source==='artifact'?(E.selectEducation(run,id),E.answerEducation(run)):E.answerMystery(run,id,run.mysteryState.pending.startedAt+1);
 answer(wrong[0].id);const pending=copy(Q.consumerRecord(run));
 if(help)(source==='predict'?E.supportForecast:source==='artifact'?Q.support:Q.mysterySupport)(run,'moreHint');
 answer(correct?q.correctChoiceId:wrong[1].id);
 return {run,q,record:Q.consumerRecord(run),pending};
}
function ui(){
 const dom=new JSDOM('<button id="return">Result</button>',{url:'https://game.example/'}),d=dom.window.document;
 dom.window.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};dom.window.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 const queued=[],store=dom.window.localStorage,controller=Report.create({document:d,storage:store,bank,enqueue:entry=>queued.push(copy(entry)),getDelivery:()=>({enabled:false})});
 return {dom,d,store,queued,controller,node:key=>d.querySelector('[data-report="'+key+'"]')};
}
for(const source of ['predict','artifact','mystery'])test(source+': finished reports freeze real language/support evidence without mutating the run',()=>{
 const x=result(source,{help:true}),before=JSON.stringify(x.run),u=ui();try{
  assert.throws(()=>Report.contextFrom(x.pending,source,'en'),/finished/);
  const context=u.controller.open({question:x.q,record:x.record,source,language:'ms',focus:u.d.getElementById('return')});
  assert.deepEqual(context,{mode:'gameplay',source,language:'ms',status:'revealed',hintUsed:false,moreHintViewed:true,stepsViewed:false});
  assert.equal(u.d.querySelector('dialog').lang,'ms');assert.equal(u.node('question-id').textContent,x.q.id);assert.match(u.node('intro').textContent,/membaca komen/);
  u.node('categories').querySelector('[value="more-hint-unclear"]').checked=true;u.node('comment').value='Petunjuk Lanjut belum jelas.';
  const saved=u.controller.save();assert.deepEqual(saved.context,context);assert.equal(u.queued.length,1);assert.equal(JSON.stringify(x.run),before);assert.ok(E.restore(x.run));
  u.controller.close();assert.equal(u.d.activeElement.id,'return');
  const restored=Feedback.createQuestionFeedbackStore({storage:u.store,bankVersion:bank.bankVersion,questionIds:bank.questions.map(q=>q.id)});assert.deepEqual(restored.get(x.q.id).context,context);
 }finally{u.controller.destroy();u.dom.window.close();}
});
test('unopened hints remain unused even when first wrong unlocked both; pending/unknown reports are rejected',()=>{
 const x=result('artifact');assert.equal(x.record.hintState.moreHintUnlocked,true);assert.equal(Report.contextFrom(x.record,'artifact','en').hintUsed,false);assert.equal(Report.contextFrom(x.record,'artifact','en').moreHintViewed,false);
 assert.throws(()=>Report.contextFrom(x.record,'shop','en'));assert.throws(()=>Report.contextFrom(x.pending,'artifact','en'));
});
test('opened then hidden worked steps remain honest report evidence without changing the record',()=>{
 const x=result('artifact');Q.support(x.run,'steps');Q.support(x.run,'steps');const record=Q.consumerRecord(x.run),before=JSON.stringify(record);assert.equal(record.stepsViewed,false);assert.ok(record.events.some(e=>e.type==='STEPS_TOGGLED'));assert.equal(Report.contextFrom(record,'artifact','en').stepsViewed,true);assert.equal(Feedback.questionFeedbackSupport(record).stepsViewed,true);assert.equal(JSON.stringify(record),before);
});
test('game reports preserve an existing Practice comment and review tick; resaving does not create new bytes',()=>{
 const x=result('predict',{correct:true}),u=ui();try{
  const owner=Feedback.createQuestionFeedbackStore({storage:u.store,bankVersion:bank.bankVersion,questionIds:bank.questions.map(q=>q.id)});
  owner.save(x.q,['hint-unclear'],'Existing comment',{mode:'review',language:'en',status:'correct'},{reviewed:true});
  u.controller.open({question:x.q,record:x.record,source:'predict',language:'en'});assert.equal(u.node('comment').value,'Existing comment');assert.equal(u.node('categories').querySelector('[value="hint-unclear"]').checked,true);
  u.node('comment').value='=A1\nUpdated from the game';const first=u.controller.save(),raw=u.store.getItem(Feedback.QUESTION_FEEDBACK_KEY),again=u.controller.save();assert.deepEqual(first,again);assert.equal(u.store.getItem(Feedback.QUESTION_FEEDBACK_KEY),raw);assert.equal(first.reviewed,true);assert.equal(first.context.source,'predict');assert.equal(first.comment,'=A1\nUpdated from the game');
  assert.equal(u.d.querySelectorAll('input[name=report-category]').length,7);assert.equal(u.d.querySelector('[data-report=reviewed]'),null);assert.equal(u.d.querySelectorAll('script').length,0);
  owner.setReviewed({...x.q,prompt:'Teks soalan dalam bahasa lain.',topic:'Kebarangkalian Peristiwa Bergabung'},false,{mode:'review',language:'ms',status:'pending',hintUsed:false,moreHintViewed:false,stepsViewed:false});const ticked=owner.get(x.q.id);assert.deepEqual(ticked.context,first.context,'a player tick must not reclassify a game report or its opened-help evidence');assert.equal(ticked.question,first.question);assert.equal(ticked.topic,first.topic);
 }finally{u.controller.destroy();u.dom.window.close();}
});
test('empty report is not saved, and a dismissed report cannot change a question or its evidence',()=>{
 const x=result('mystery'),u=ui();try{
  u.controller.open({question:x.q,record:x.record,source:'mystery',language:'en'});assert.equal(u.controller.save(),null);assert.match(u.node('status').textContent,/Choose a category/);assert.equal(u.queued.length,0);
  u.node('comment').value='Draft only';u.controller.close();assert.equal(u.controller.snapshot(),null);assert.equal(u.queued.length,0);assert.equal(JSON.parse(u.store.getItem(Feedback.QUESTION_FEEDBACK_KEY)).comments.length,0);
 }finally{u.controller.destroy();u.dom.window.close();}
});
test('storage or queue failure is reported honestly and corrupt stored feedback is kept',()=>{
 const x=result('artifact'),u=ui();try{
  const raw='{corrupt';u.store.setItem(Feedback.QUESTION_FEEDBACK_KEY,raw);
  u.controller.open({question:x.q,record:x.record,source:'artifact',language:'en'});u.node('comment').value='Keep my report';assert.ok(u.controller.save());assert.match(u.node('status').textContent,/open game/);assert.equal(u.store.getItem(Feedback.QUESTION_FEEDBACK_KEY),raw);assert.equal(u.queued.length,1);
 }finally{u.controller.destroy();u.dom.window.close();}
});
