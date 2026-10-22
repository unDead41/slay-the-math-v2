const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),Q=require('../dist/education.js'),C=require('../dist/config.js'),M=require('../dist/math.js');
const {completeTrial}=require('./helpers/education.cjs');
const copy=x=>JSON.parse(JSON.stringify(x));
function battle(seed=81,enemy='sentinel'){const r=E.newRun(seed);delete r.route;E.startBattle(r,enemy);return r;}
function correct(r){const q=Q.catalog[r.battle.question.questionId];E.selectForecast(r,q.correctChoiceId);return E.answerBankForecast(r);}

test('Predict reserves one real bank item independently of combat RNG and resumes it on repeated taps/reload',()=>{
 let r=battle(),before=copy(r),p=E.forecast(r);
 assert.equal(p.source,'bank');assert.ok(Q.catalog[p.questionId]);assert.equal(r.rng,before.rng);
 assert.equal(Q.coverage(r).run,1);assert.deepEqual(E.forecast(r),p);
 const q=Q.catalog[p.questionId],wrong=q.choices.find(c=>c.id!==q.correctChoiceId).id;
 E.selectForecast(r,wrong);assert.equal(E.answerBankForecast(r).correct,false);E.supportForecast(r,'hint');
 r=E.restore(copy(r));assert.ok(r);assert.equal(r.battle.question.questionId,q.id);assert.deepEqual(r.battle.question.attempts,[wrong]);
 assert.equal(Q.consumerRecord(r).hintState.hintUsed,true);assert.equal(r.battle.question.selectedId,null);
});

test('Predict first unaided answer grants capped Focus and a seal exactly once; guided answers grant no Focus',()=>{
 for(const mode of ['independent','hint','wrong','foundation']){
  let r=battle(),p=E.forecast(r),q=Q.catalog[p.questionId];r.battle.focus=2;
  if(mode==='hint')E.supportForecast(r,'hint');
  if(mode==='foundation')E.supportForecast(r,'foundation');
  if(mode==='wrong'){E.selectForecast(r,q.choices.find(c=>c.id!==q.correctChoiceId).id);E.answerBankForecast(r);}
  const result=correct(r);assert.equal(result.first,mode==='independent');assert.equal(r.battle.focus,mode==='independent'?3:2);assert.equal(r.battle.seals,1);
  const saved=copy(r);assert.throws(()=>E.answerBankForecast(r));assert.deepEqual(r,saved);r=E.restore(saved);assert.ok(r);
  assert.throws(()=>E.answerBankForecast(r));E.closeForecast(r);assert.throws(()=>E.forecast(r));
 }
});

test('abandoning an untouched Predict counts as exposed and consumes that turn without Focus or seal',()=>{
 let r=battle(),id=E.forecast(r).questionId;E.closeForecast(r);r=E.restore(copy(r));assert.ok(r);
 assert.equal(Q.coverage(r).run,1);assert.equal(r.battle.focus,0);assert.equal(r.battle.seals,0);assert.throws(()=>E.forecast(r));
 E.endTurn(r);assert.notEqual(E.forecast(r).questionId,id);assert.equal(Q.coverage(r).run,2);
});

test('all 120 reservations are unique across interleaved bank consumers and exhaustion does not repeat',()=>{
 const r=battle(),seen=new Set(),consumers=['predict','artifact','mystery'];
 for(let i=0;i<Q.bank.total;i++){
  const result=Q.reserveForConsumer(r,consumers[i%3]);assert.ok(result.question,'question '+i);assert.ok(!seen.has(result.question.id));seen.add(result.question.id);Q.retireQuestion(r,result.question.id);
 }
 assert.equal(seen.size,120);for(const topic of ['PROB','SET','LOGIC'])assert.equal([...seen].filter(id=>Q.catalog[id].topicCode===topic).length,40);assert.deepEqual(Q.coverage(r),{run:120,lifetime:120,total:120});
 assert.equal(Q.reserveForConsumer(r,'predict').question,null);assert.equal(Q.coverage(r).run,120);
});

test('all 120 bank items can complete Predict and survive strict restore with one Focus and one seal',()=>{
 for(const q of Q.bank.questions){
  const r=battle(),state=Q.ensureRunState(r);state.runUsedIds=Q.ids.filter(id=>id!==q.id);state.usedIds=state.runUsedIds.slice();state.session.exposureIds=state.usedIds.slice();
  assert.equal(E.forecast(r).questionId,q.id);assert.equal(correct(r).first,true);assert.equal(r.battle.focus,1);assert.equal(r.battle.seals,1);assert.ok(E.restore(copy(r)),q.id);
 }
});

test('Artifact and Mystery reserve from the same current-run ledger as Predict',()=>{
 const r=E.newRun(48,'challenge');E.chooseArtifact(r,r.artifactState.offer.ids[0]);const artifact=Q.current(r).id;completeTrial(r);
 delete r.route;E.startBattle(r,'sentinel');const predict=E.forecast(r).questionId;assert.notEqual(predict,artifact);E.closeForecast(r);
 r.scene='event';r.depth=3;r.battle=null;E.openMystery(r);E.startMystery(r,[],null,1000);
 const mystery=r.mysteryState.pending.questionId;assert.ok(mystery);assert.ok(![artifact,predict].includes(mystery));assert.equal(Q.coverage(r).run,3);assert.ok(E.restore(copy(r)));
});

test('a new run can reuse all lifetime IDs and never inherits an old pending reservation or question RNG',()=>{
 const old=battle(1);E.forecast(old);const q=Q.catalog[old.battle.question.questionId];E.supportForecast(old,'hint');
 const profile=Q.mergeRunHistory(old,Q.history(Q.ids)),fresh=battle(1),control=battle(1);
 const p=E.forecast(fresh,profile.usedIds,profile.session),expected=E.forecast(control);
 assert.ok(p.questionId);assert.ok(expected.questionId);assert.equal(fresh.educationState.rng,control.educationState.rng);assert.deepEqual(p.attempts,[]);assert.equal(p.hinted,false);
 assert.equal(Q.coverage(fresh).run,1);assert.equal(Q.coverage(fresh).lifetime,120);assert.ok(E.restore(copy(fresh)));
 assert.equal(old.battle.question.questionId,q.id);assert.equal(old.battle.question.hinted,true);
});

test('reusing a stable ID in a new run preserves prior mastery and starts a fresh independently rewarded attempt',()=>{
 const old=battle(1);E.forecast(old);correct(old);const id=old.battle.question.questionId,profile=Q.mergeRunHistory(old);
 const fresh=battle(2),state=Q.ensureRunState(fresh);state.runUsedIds=Q.ids.filter(x=>x!==id);state.usedIds=state.runUsedIds.slice();state.session.exposureIds=state.usedIds.slice();
 E.forecast(fresh,profile.usedIds,profile.session);assert.equal(fresh.battle.question.questionId,id);assert.deepEqual(fresh.battle.question.attempts,[]);
 const rec=Q.getSession(fresh).records[id];assert.equal(rec.status,'pending');assert.ok(Object.values(Q.getSession(fresh).archivedRecords).some(r=>r.questionId===id&&r.status==='correct'));
 assert.ok(Q.progress(fresh).some(row=>row.correct>0),'opening a repeat must preserve prior mastery evidence');
 const activeHistory=Q.mergeRunHistory(fresh,profile);assert.equal(activeHistory.session.pendingQuestionId,id);assert.equal(activeHistory.session.records[id].status,'pending');
 const reread=Q.mergeSessions(activeHistory.session,profile.session);assert.equal(reread.pendingQuestionId,id,'rereading older saved history cannot replace the newer pending attempt');assert.equal(reread.records[id].status,'pending');
 assert.equal(correct(fresh).first,true);assert.equal(fresh.battle.focus,1);const saved=Q.mergeRunHistory(fresh,profile);assert.ok(Q.validHistory(saved));assert.equal(saved.session.records[id].status,'correct');
});

test('retrying a Stage 2 checkpoint keeps every question exposed in the current run',()=>{
 const r=battle();r.stage=1;r.depth=0;r.scene='map';r.battle=null;r.checkpoint=copy(r);
 E.startBattle(r,'wisp');const id=E.forecast(r).questionId;E.closeForecast(r);
 const retry=E.retry(r);assert.equal(retry.scene,'map');assert.equal(Q.coverage(retry).run,1);assert.ok(retry.educationState.runUsedIds.includes(id));
 E.startBattle(retry,'wisp');assert.notEqual(E.forecast(retry).questionId,id);assert.ok(E.restore(copy(retry)));
});

test('an older profile pending owner cannot displace a different current-run question during save merging',()=>{
 const old=battle(1);const oldId=E.forecast(old).questionId,profile=Q.mergeRunHistory(old),fresh=battle(2),state=Q.ensureRunState(fresh);
 state.runUsedIds=[oldId];state.usedIds=[oldId];state.session.exposureIds=[oldId];const p=E.forecast(fresh,profile.usedIds,profile.session);assert.notEqual(p.questionId,oldId);
 const merged=Q.mergeSessions(fresh.educationState.session,profile.session);assert.equal(merged.pendingQuestionId,p.questionId);assert.equal(merged.records[p.questionId].status,'pending');assert.ok(Q.validHistory(Q.history(merged.exposureIds,merged)));
});

test('exhausted Predict has explicit unscored completion that can open boss seals without Focus or mastery',()=>{
 const r=battle();Q.ensureRunState(r);r.educationState.runUsedIds=Q.ids.slice();r.educationState.usedIds=Q.ids.slice();r.educationState.session.exposureIds=Q.ids.slice();
 for(let i=0;i<C.enemies.sentinel.seals.length;i++){
  const p=E.forecast(r);assert.equal(p.exhausted,true);assert.equal(p.unscored,true);assert.equal(p.questionId,null);assert.equal(r.battle.seals,i);
  const result=E.completeExhaustedForecast(r);assert.equal(result.scored,false);assert.equal(result.exhausted,true);assert.equal(r.battle.seals,i+1);assert.equal(r.battle.focus,0);assert.equal(r.stats.forecasts,0);
  assert.throws(()=>E.completeExhaustedForecast(r));assert.ok(E.restore(copy(r)));E.closeForecast(r);if(i===0)E.endTurn(r);
 }
});

test('bank support order survives language projection/reload and assisted mastery uses the shared reducer',()=>{
 let r=battle();E.forecast(r);const q=Q.catalog[r.battle.question.questionId],wrong=q.choices.find(c=>c.id!==q.correctChoiceId).id;
 E.supportForecast(r,'hint');E.selectForecast(r,wrong);E.answerBankForecast(r);E.supportForecast(r,'moreHint');
 const snapshot=copy(r),QL=require('../dist/question-language.js');
 const en=QL.question(q,'en'),bm=QL.question(q,'ms');assert.notEqual(en.prompt,bm.prompt);assert.equal(bm.correctChoiceId,en.correctChoiceId);assert.deepEqual(bm.choices.map(c=>c.id),en.choices.map(c=>c.id));assert.deepEqual(r,snapshot);
 r=E.restore(snapshot);assert.ok(r);assert.equal(Q.consumerRecord(r).hintState.moreHintViewed,true);assert.equal(correct(r).first,false);E.supportForecast(r,'steps');assert.ok(Q.consumerLearningView(r).workedSteps);assert.ok(E.restore(copy(r)));
});

test('damaged bank pending state, run ledger and RNG are rejected before a reward can be committed',()=>{
 const r=battle();E.forecast(r);
 for(const mutate of [x=>x.battle.question.questionId='UNKNOWN',x=>x.battle.question.choiceOrder.reverse(),x=>x.battle.question.solved=true,x=>x.battle.question.first=true,x=>x.battle.question.hinted=true,x=>x.educationState.runUsedIds=[],x=>x.educationState.rng++,x=>x.educationState.session.records[x.battle.question.questionId].events.push({type:'FINAL_REVEALED'})]){
  const damaged=copy(r);mutate(damaged);assert.ok(E.restore(damaged)===null,mutate.toString());
 }
 E.closeForecast(r);delete r.educationState.runUsedIds;assert.equal(E.restore(r),null,'a new-format run cannot silently lose the exposure ledger');
});

test('a saved live-deck prediction keeps its frozen evaluator, attempts and reward path',()=>{
 let r=battle();const source=r.battle.draw.map(c=>({...c,...E.definition(c)})),q=M.makeQuestion(source,'single');q.seal=0;r.battle.question=q;
 E.hint(r);r=E.restore(copy(r));assert.ok(r);assert.deepEqual(r.battle.question.source,source);assert.equal(r.battle.question.source instanceof Array,true);
 assert.equal(E.answer(r,q.n+'/'+q.d).first,false);assert.equal(r.battle.seals,1);assert.equal(r.battle.focus,0);assert.ok(E.restore(copy(r)));
});
