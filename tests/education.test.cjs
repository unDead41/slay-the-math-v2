const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),Q=require('../dist/education.js'),A=require('../dist/artifacts.js');
const {completeTrial,claimArtifact}=require('./helpers/education.cjs');
const clone=x=>JSON.parse(JSON.stringify(x));
function offered(code){for(let seed=1;seed<300;seed++){const r=E.newRun(seed,'challenge');if(r.artifactState.offer.ids.includes(A.id(code)))return r;}throw new Error('No fixture offer');}

test('education: New Run resets run coverage while retaining unique lifetime history',()=>{
 const r=E.newRun(7,'challenge'),oldIds=Q.ids.slice(0,35);
 assert.deepEqual(Q.coverage?.(r,oldIds),{run:0,lifetime:35,total:120});
 E.chooseArtifact(r,E.artifactChoices(r)[0].id,oldIds);
 assert.deepEqual(Q.coverage(r),{run:1,lifetime:36,total:120});
 const q=Q.current(r);E.hintEducation(r);E.selectEducation(r,q.choices.find(c=>c.id!==q.correctChoiceId).id);E.answerEducation(r);Q.support(r,'moreHint');
 const restored=E.restore(clone(r));assert.ok(restored);assert.deepEqual(Q.coverage(restored),{run:1,lifetime:36,total:120});
 completeTrial(restored);const profile=Q.history(restored.educationState.usedIds,restored.educationState.session),next=E.newRun(8,'challenge');
 assert.deepEqual(Q.coverage(next,profile.usedIds),{run:0,lifetime:36,total:120});
 E.chooseArtifact(next,E.artifactChoices(next)[0].id,profile.usedIds,profile.session);
 assert.deepEqual(Q.coverage(next),{run:1,lifetime:37,total:120});assert.notEqual(Q.current(next).id,q.id);
});

test('education: legacy saves infer run coverage from encounter receipts without importing profile exposures',()=>{
 const r=E.newRun(7,'challenge');E.chooseArtifact(r,E.artifactChoices(r)[0].id,Q.ids.slice(0,35));
 assert.ok(E.restore(clone(r)));assert.deepEqual(Q.coverage?.(r),{run:1,lifetime:36,total:120});
 E.hintEducation(r);assert.deepEqual(Q.coverage(r),{run:1,lifetime:36,total:120});
});

test('education: all original 120 fixed items have unique IDs, valid keys and 40 items per topic',()=>{
 assert.equal(Q.bank.total,120);assert.equal(Q.bank.questions.length,120);assert.equal(new Set(Q.ids).size,120);
 for(const topic of ['PROB','SET','LOGIC'])assert.equal(Q.bank.questions.filter(q=>q.topicCode===topic).length,40);
 for(const q of Q.bank.questions){assert.equal(q.choices.length,4);assert.equal(new Set(q.choices.map(c=>c.id)).size,4);assert.equal(q.choices.filter(c=>c.id===q.correctChoiceId).length,1);assert.ok(q.hint&&q.explanation&&q.prompt);}
});
test('education: Claim opens a frozen question before ownership, Gold, map entry or combat',()=>{
 const r=offered('s09'),before=clone(r),key=A.id('s09');
 E.chooseArtifact(r,key);assert.equal(r.scene,'education');assert.equal(E.artifactChoices(r).length,0);
 assert.equal(r.gold,before.gold);assert.deepEqual(r.artifactState.owned,[]);assert.equal(r.rng,before.rng);assert.equal(r.artifactState.rng,before.artifactState.rng);assert.deepEqual(r.route,before.route);
 assert.ok(E.validate(r));assert.ok(Q.current(r));assert.equal(r.educationState.usedIds.length,1);
 const frozen=clone(r);for(const action of [()=>E.chooseArtifact(r,key),()=>E.enterNode(r),()=>E.startBattle(r,'wisp'),()=>E.continueEducation(r),()=>E.skipArtifact(r),()=>E.finishNode(r),()=>E.nextStage(r)]){assert.throws(action);assert.deepEqual(r,frozen);}
 assert.deepEqual(E.restore(frozen),r);
});
test('education: incorrect choices, hint and selection resume without HP loss or another draw',()=>{
 let r=offered('s09');E.chooseArtifact(r,A.id('s09'));const q=Q.current(r),wrong=q.choices.find(c=>c.id!==q.correctChoiceId).id,original=clone(r);
 assert.throws(()=>E.answerEducation(r));E.selectEducation(r,wrong);assert.equal(E.answerEducation(r).correct,false);
 assert.equal(r.hp,original.hp);assert.equal(r.gold,original.gold);assert.equal(r.educationState.pending.selectedId,null);assert.equal(r.educationState.pending.attempts.length,1);
 assert.throws(()=>E.answerEducation(r));assert.throws(()=>E.selectEducation(r,wrong));
 E.hintEducation(r);r=E.restore(clone(r));assert.ok(r);assert.equal(r.educationState.pending.hinted,true);assert.equal(Q.current(r).id,q.id);assert.deepEqual(r.educationState.pending.choiceOrder,original.educationState.pending.choiceOrder);
 E.selectEducation(r,q.correctChoiceId);const result=E.answerEducation(r);assert.deepEqual(result,{correct:true,first:false});assert.ok(E.restore(clone(r)));
});
test('education: a correct answer unlocks one explicit claim; Purse applies +25 Gold exactly once',()=>{
 let r=offered('s09');const base=r.gold;E.chooseArtifact(r,A.id('s09'));E.selectEducation(r,Q.current(r).correctChoiceId);E.answerEducation(r);
 assert.equal(r.scene,'education');assert.equal(r.gold,base);assert.equal(r.artifactState.owned.length,0);
 r=E.restore(clone(r));E.continueEducation(r);assert.equal(r.scene,'map');assert.equal(r.gold,base+25);assert.deepEqual(r.artifactState.owned,[A.id('s09')]);assert.equal(r.educationState.completed.length,1);
 const done=clone(r);assert.throws(()=>E.continueEducation(r));assert.deepEqual(r,done);assert.deepEqual(E.restore(done),r);
});
test('education: each of the 120 items can render an answer transaction and pass strict save validation',()=>{
 for(const q of Q.bank.questions){const r=E.newRun(100,'challenge');E.chooseArtifact(r,E.artifactChoices(r)[0].id,Q.ids.filter(id=>id!==q.id));assert.equal(Q.current(r).id,q.id);assert.ok(E.validate(r),q.id);completeTrial(r);assert.ok(E.restore(clone(r)),q.id);}
});
test('education: 120 new runs using saved exposure history never repeat and cover all three topics',()=>{
 let history=[];const topics={PROB:0,SET:0,LOGIC:0};
 for(let i=0;i<120;i++){const r=E.newRun(7,'challenge');E.chooseArtifact(r,E.artifactChoices(r)[0].id,history);const q=Q.current(r);assert.ok(q);assert.ok(!history.includes(q.id));topics[q.topicCode]++;history=Q.merge(history,r.educationState.usedIds);}
 assert.equal(history.length,120);assert.deepEqual(topics,{PROB:40,SET:40,LOGIC:40});assert.ok(Q.validHistory(Q.history(history)));
});
test('education: an exhausted bank is explicit and never resets or repeats old questions',()=>{
 const r=E.newRun(7,'challenge');E.chooseArtifact(r,E.artifactChoices(r)[0].id,Q.ids);assert.equal(Q.current(r),null);assert.equal(r.scene,'education');assert.ok(E.validate(r));assert.equal(Q.ready(r),true);
 completeTrial(r);assert.equal(r.scene,'map');assert.equal(r.educationState.usedIds.length,120);assert.equal(r.educationState.completed[0].questionId,null);assert.ok(E.validate(r));
});
test('education: forged pending IDs, answer flags, history and owner fields are rejected',()=>{
 const original=E.newRun(7,'challenge');E.chooseArtifact(original,E.artifactChoices(original)[0].id);
 for(const change of [
  s=>s.educationState.pending.questionId='UNKNOWN',s=>s.educationState.bankVersion='unknown',s=>s.educationState.pending.solved=true,
  s=>s.educationState.pending.selectedId='foreign-choice',s=>s.educationState.pending.choiceOrder[1]=s.educationState.pending.choiceOrder[0],
  s=>s.educationState.usedIds.push(s.educationState.usedIds[0]),s=>s.educationState.pending.artifactId=A.id('b01'),
  s=>s.educationState.pending.kind='boss',s=>s.educationState.pending.attempts=[Q.current(s).correctChoiceId],s=>s.educationState.rng=-1,
  s=>{s.scene='map';},s=>{s.educationState.pending=null;}
 ]){const bad=clone(original);change(bad);assert.equal(E.restore(bad),null);}
});
test('education: old saves continue at their saved scene, while an unclaimed old offer uses the new gate',()=>{
 const old=E.newRun(7,'challenge');assert.equal(old.educationState,undefined);assert.ok(E.restore(clone(old)));
 const map=E.newRun(9,'challenge');delete map.artifactState;map.scene='map';assert.equal(E.restore(map).scene,'map');
 assert.equal(E.newRun(7,'learn').scene,'map');E.chooseArtifact(old,E.artifactChoices(old)[0].id);assert.equal(old.scene,'education');
});
test('education: Elite card reward and its question can be saved before the artifact is committed',()=>{
 const r=offered('s02');claimArtifact(r,A.id('s02'));delete r.route;r.depth=1;E.startBattle(r,'knight',true);
 // Construct the real lethal play using one owned Attack card.
 const all=[...r.battle.hand,...r.battle.draw],index=all.findIndex(c=>c.key==='strike');r.battle.hand=[all.splice(index,1)[0]];r.battle.draw=all;r.battle.hp=1;r.battle.enemyBlock=0;
 E.playCard(r,r.battle.hand[0].uid);assert.equal(r.scene,'reward');E.chooseReward(r,r.rewards[0]);assert.ok(E.restore(clone(r)));
 const key=E.artifactChoices(r)[0].id,owned=r.artifactState.owned.length;E.chooseArtifact(r,key);assert.ok(E.restore(clone(r)));assert.equal(r.artifactState.owned.length,owned);
 completeTrial(r);assert.equal(r.scene,'map');assert.equal(r.depth,2);assert.equal(r.artifactState.owned.length,owned+1);assert.ok(E.validate(r));
});
test('education: Mystery trial resumes its own room, then completes it once',()=>{
 const r=offered('s02');claimArtifact(r,A.id('s02'));delete r.route;r.depth=3;r.scene='event';E.event(r,'artifact');
 E.chooseArtifact(r,E.artifactChoices(r)[0].id);assert.equal(Q.context(r).scene,'event');assert.ok(E.restore(clone(r)));completeTrial(r);
 assert.equal(r.depth,4);assert.equal(r.scene,'map');assert.ok(E.validate(r));
});
test('education: Boss trial precedes its effect and checkpoint; retry restores the committed question record',()=>{
 const r=offered('s02');claimArtifact(r,A.id('s02'));delete r.route;r.depth=4;E.startBattle(r,'sentinel');r.battle.hp=0;r.battle.seals=2;r.scene='stageclear';A.offer(r,'boss');
 E.chooseArtifact(r,A.id('b01'));assert.equal(r.stage,0);assert.equal(r.checkpoint,null);assert.ok(E.restore(clone(r)));completeTrial(r);
 assert.equal(r.stage,1);assert.equal(r.scene,'map');assert.ok(A.has(r,'b01'));assert.ok(E.validate(r));assert.deepEqual(r.checkpoint.educationState,r.educationState);
 const retry=E.retry(r);assert.deepEqual(retry.educationState,r.educationState);assert.ok(E.validate(retry));E.startBattle(retry,'wisp');assert.equal(retry.battle.energy,4);
});
