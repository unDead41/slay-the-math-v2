const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),Q=require('../dist/education.js'),A=require('../dist/artifacts.js'),S=require('../dist/mechanics.js').session;
const {mysteryRoom}=require('./helpers/mystery.cjs');
const copy=x=>JSON.parse(JSON.stringify(x));
const wrongs=q=>q.choices.filter(c=>c.id!==q.correctChoiceId).map(c=>c.id);
function prediction(){const r=E.newRun(81);delete r.route;E.startBattle(r,'sentinel');E.forecast(r);return r;}
function trial(){const r=E.newRun(7,'challenge');E.chooseArtifact(r,r.artifactState.offer.ids[0]);return r;}
const cases={
 predict:{make:prediction,q:r=>Q.catalog[r.battle.question.questionId],answer(r,id){E.selectForecast(r,id);E.answerBankForecast(r);},support:(r,k)=>E.supportForecast(r,k)},
 artifact:{make:trial,q:Q.current,answer(r,id){E.selectEducation(r,id);E.answerEducation(r);},support:Q.support},
 mystery:{make(){const r=mysteryRoom('ME01');E.startMystery(r,[],null,1000);return r;},q:r=>Q.catalog[r.mysteryState.pending.questionId],answer:(r,id)=>E.answerMystery(r,id,1100),support:Q.mysterySupport}
};
for(const [kind,c] of Object.entries(cases)){
 test(kind+': first wrong unlocks both hints honestly; second wrong locks input across reload',()=>{
  let r=c.make(),q=c.q(r),ids=wrongs(q);const rng=r.rng,questionRng=r.educationState.rng;
  c.answer(r,ids[0]);let row=Q.getSession(r).records[q.id];
  assert.equal(row.status,'pending');assert.equal(row.hintState.moreHintUnlocked,true);assert.equal(row.hintState.hintUsed,false);assert.equal(row.hintState.moreHintViewed,false);
  assert.equal(row.attempts[0].hintUsed,false);assert.equal(row.attempts[0].moreHintViewed,false);
  r=E.restore(copy(r));assert.ok(r);const before=copy(r);assert.throws(()=>c.answer(r,ids[0]));assert.deepEqual(r,before,'double click cannot spend another attempt');
  c.support(r,'moreHint');row=Q.getSession(r).records[q.id];assert.equal(row.hintState.moreHintViewed,true);assert.equal(row.hintState.hintUsed,false);
  c.answer(r,ids[1]);row=Q.getSession(r).records[q.id];assert.equal(row.status,'revealed');assert.equal(row.attempts.length,2);assert.equal(row.completion.correct,false);assert.equal(row.attempts[1].moreHintViewed,true);
  assert.equal(r.rng,rng);assert.equal(r.educationState.rng,questionRng);r=E.restore(copy(r));assert.ok(r,'terminal save must restore');
  const ended=copy(r);assert.throws(()=>c.answer(r,q.correctChoiceId));assert.deepEqual(r,ended,'third answer cannot change state');
 });
 test(kind+': correct retry is allowed and never independent',()=>{
  const r=c.make(),q=c.q(r);c.answer(r,wrongs(q)[0]);c.answer(r,q.correctChoiceId);
  assert.equal(Q.getSession(r).records[q.id].completion.category,'retry');assert.ok(E.restore(copy(r)));
 });
}
test('failed Predict consumes the turn without Focus, boss seal or duplicate failure log',()=>{
 const r=prediction(),q=cases.predict.q(r);for(const id of wrongs(q).slice(0,2))cases.predict.answer(r,id);
 assert.equal(r.battle.forecastUsed,true);assert.equal(r.battle.focus,0);assert.equal(r.battle.seals,0);assert.equal(r.stats.forecasts,1);
 E.closeForecast(r);assert.throws(()=>E.forecast(r));assert.equal(r.battle.question,null);assert.ok(E.restore(copy(r)));
});
test('failed Starting artifact continues without its effects or reopening its offer',()=>{
 const r=trial(),q=Q.current(r),gift=Q.pending(r).artifactId,oldGold=r.gold,oldHp=r.maxHp;
 for(const id of wrongs(q).slice(0,2))cases.artifact.answer(r,id);
 assert.equal(Q.ready(r),true);E.continueEducation(r);assert.equal(r.scene,'map');assert.deepEqual(r.artifactState.owned,[]);assert.equal(r.gold,oldGold);assert.equal(r.maxHp,oldHp);assert.equal(r.artifactState.offer,null);
 assert.equal(r.educationState.completed[0].failed,true);assert.equal(r.artifactState.declined[0].id,gift);assert.ok(E.restore(copy(r)));const done=copy(r);assert.throws(()=>E.continueEducation(r));assert.deepEqual(r,done);
 for(const change of [x=>x.educationState.completed[0].hinted=true,x=>x.educationState.completed[0].first=true,x=>x.artifactState.declined[0].id=A.id('b01'),x=>x.artifactState.declined[0].source='starting'+'x'.repeat(200)]){const bad=copy(r);change(bad);assert.equal(E.restore(bad),null,'a failure receipt must match real evidence and its declined source');}
});
test('event keeps the original timer/offers and applies its failure once after the second wrong',()=>{
 let r=cases.mystery.make(),q=cases.mystery.q(r),p=copy(r.mysteryState.pending),hp=r.hp;
 cases.mystery.answer(r,wrongs(q)[0]);assert.equal(r.mysteryState.pending.phase,'question');assert.equal(r.hp,hp);assert.equal(r.mysteryState.pending.deadline,p.deadline);assert.deepEqual(r.mysteryState.pending.offers,p.offers);
 cases.mystery.answer(r,wrongs(q)[1]);assert.equal(r.mysteryState.pending.phase,'review');assert.equal(r.hp,hp);assert.equal(r.mysteryState.pending.outcome,'INCORRECT');E.continueMystery(r);assert.ok(r.hp<hp);assert.ok(E.restore(copy(r)));const done=copy(r);assert.throws(()=>E.continueMystery(r));assert.deepEqual(r,done);
});
test('event timeout after first wrong terminates without fabricating a second attempt',()=>{
 const r=cases.mystery.make(),q=cases.mystery.q(r);cases.mystery.answer(r,wrongs(q)[0]);E.expireMystery(r,r.mysteryState.pending.deadline);
 assert.equal(r.mysteryState.pending.outcome,'TIMEOUT');assert.equal(Q.getSession(r).records[q.id].attempts.length,1);assert.ok(E.restore(copy(r)));
});
test('legacy Practice traces keep their original rules; game policy upgrade preserves real past support',()=>{
 let {session,question:q}=S.reserveNext(S.createSession({seed:7}),Q.bank);const ids=wrongs(q);
 for(let i=0;i<2;i++)session=S.submitAnswer(session,Q.bank,{questionId:q.id,choiceId:ids[i],attemptId:'old'+i});
 assert.equal(session.records[q.id].status,'pending');assert.equal(session.records[q.id].hintState.moreHintUnlocked,false);const before=copy(session.records[q.id]);
 let upgraded=S.applyGamePolicy(session,Q.bank,q.id);assert.equal(upgraded.records[q.id].status,'revealed');assert.deepEqual(upgraded.records[q.id].attempts,before.attempts);assert.equal(upgraded.records[q.id].hintState.hintUsed,false);assert.deepEqual(S.restoreSession(upgraded,Q.bank).records,upgraded.records);
 session=S.submitAnswer(session,Q.bank,{questionId:q.id,choiceId:q.correctChoiceId,attemptId:'old2'});assert.equal(session.records[q.id].status,'correct');assert.deepEqual(S.restoreSession(session,Q.bank).records,session.records);
});
test('all 120 game questions lock after two wrong choices, expose the canonical solution and restore exactly',()=>{
 for(const q of Q.bank.questions){
  let session=S.reserveNext(S.createSession({seed:5}),{...Q.bank,questions:[q]}).session;session=S.applyGamePolicy(session,Q.bank,q.id);
  for(const [i,id] of wrongs(q).slice(0,2).entries()){session=S.submitAnswer(session,Q.bank,{questionId:q.id,choiceId:id,attemptId:q.id+':'+i});if(i===0){assert.equal(session.records[q.id].hintState.moreHintUnlocked,true,q.id);assert.equal(S.selectLearningView(q,session.records[q.id]).answer,null,q.id);}}
  assert.equal(S.attemptsExhausted(session.records[q.id]),true,q.id);const view=S.selectLearningView(q,session.records[q.id]);assert.ok(view.answer&&view.explanation,q.id);assert.deepEqual(S.restoreSession(session,Q.bank).records,session.records,q.id);assert.throws(()=>S.submitAnswer(session,Q.bank,{questionId:q.id,choiceId:q.correctChoiceId,attemptId:q.id+':third'}));
 }
});
test('an older pending game save with two wrong answers upgrades without erasing attempts or granting a seal',()=>{
 const r=prediction(),q=cases.predict.q(r),ids=wrongs(q);cases.predict.answer(r,ids[0]);
 const old=copy(Q.getSession(r));old.records[q.id].events=old.records[q.id].events.filter(e=>e.type!=='GAME_POLICY_APPLIED');r.educationState.session=S.restoreSession(old,Q.bank);
 r.educationState.session=S.submitAnswer(r.educationState.session,Q.bank,{questionId:q.id,choiceId:ids[1],attemptId:'legacy-second'});r.battle.question.attempts.push(ids[1]);r.stats.wrong++;
 const attempts=copy(r.educationState.session.records[q.id].attempts);assert.ok(E.validate(r));const restored=E.restore(copy(r));assert.ok(restored);assert.deepEqual(Q.consumerRecord(restored).attempts,attempts);assert.equal(Q.consumerRecord(restored).hintState.hintUsed,false);assert.equal(restored.battle.forecastUsed,true);assert.equal(restored.battle.seals,0);assert.ok(E.validate(restored));assert.throws(()=>cases.predict.answer(restored,q.correctChoiceId));
});
test('failed Boss and Elite trials release their room once while preserving artifact effects and checkpoint receipts',()=>{
 const F=require('../tools/dev/fixtures.js');
 for(const kind of ['elite','boss']){
  const r=E.newRun(11,'challenge');require('./helpers/education.cjs').claimArtifact(r,r.artifactState.offer.ids[0]);delete r.route;r.depth=kind==='boss'?4:1;E.startBattle(r,kind==='boss'?'sentinel':'knight',kind==='elite');if(kind==='elite')A.offer(r,'elite',false);F.forceResult(r,'win');
  if(kind==='elite')E.chooseReward(r,null);else A.offer(r,'boss');
  assert.ok(r.artifactState.offer);const owned=r.artifactState.owned.slice(),gift=r.artifactState.offer.ids[0];E.chooseArtifact(r,gift);const q=Q.current(r);
  for(const id of wrongs(q).slice(0,2))cases.artifact.answer(r,id);assert.ok(E.restore(copy(r)));E.continueEducation(r);assert.deepEqual(r.artifactState.owned,owned);assert.equal(r.scene,'map');assert.equal(r.stage,kind==='boss'?1:0);assert.ok(E.restore(copy(r)));if(kind==='boss')assert.ok(E.restore(E.retry(r)));
 }
});
