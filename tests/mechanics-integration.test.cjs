const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine'),Q=require('../dist/education'),M=require('../dist/mechanics');
const clone=x=>JSON.parse(JSON.stringify(x));
function trial(){const r=E.newRun(17,'challenge');E.chooseArtifact(r,E.artifactChoices(r)[0].id);return r;}
function wrong(r){const q=Q.current(r),id=q.choices.find(c=>c.id!==q.correctChoiceId&&!r.educationState.pending.attempts.includes(c.id)).id;E.selectEducation(r,id);E.answerEducation(r);}
test('integrated bank passes the supplier preflight, retaining 120 IDs and 30 skills',()=>{assert.equal(M.validateQuestionBankBundle(M.data).skills,30);assert.equal(Q.bank.version,'form4-review-1.6.0');});
test('game More Hint unlocks at the first wrong submission regardless of Hint order and survives restore',()=>{
 for(const order of ['wrong-first','hint-first']){let r=trial();if(order==='hint-first')E.hintEducation(r);wrong(r);if(order==='wrong-first')E.hintEducation(r);r=E.restore(clone(r));assert.ok(r);assert.ok(Q.learningView(r).moreHint);Q.support(r,'moreHint');assert.equal(Q.record(r).hintState.moreHintViewed,true);assert.ok(E.restore(clone(r)));assert.equal(Q.learningView(r).workedSteps,null);}
});
test('learning support cannot grant or reveal a claim, and worked steps open only after correct',()=>{
 const r=trial(),before={hp:r.hp,gold:r.gold,rng:r.rng,owned:clone(r.artifactState.owned)};
 Q.support(r,'foundation');Q.support(r,'steps');assert.equal(Q.learningView(r).workedSteps,null);assert.throws(()=>E.continueEducation(r));
 E.selectEducation(r,Q.current(r).correctChoiceId);E.answerEducation(r);Q.support(r,'steps');assert.equal(Q.learningView(r).workedSteps.length,3);
 assert.deepEqual({hp:r.hp,gold:r.gold,rng:r.rng,owned:r.artifactState.owned},before);assert.equal(Q.progress(r).reduce((n,p)=>n+p.correctWithSupport,0)>0,true);
 E.continueEducation(r);assert.equal(r.artifactState.owned.length,1);assert.throws(()=>E.continueEducation(r));
});
test('legacy pending saves retain item, shuffled choices and attempts with conservative Hint ordering',()=>{
 const r=trial();wrong(r);E.hintEducation(r);delete r.educationState.session;delete r.educationState.selectionVersion;delete r.educationState.runUsedIds;r.educationState.bankVersion='form4-review-1.0.0';
 const before=clone(r.educationState.pending),restored=E.restore(clone(r));assert.ok(restored);assert.deepEqual(restored.educationState.pending,before);
 assert.ok(Q.learningView(restored).moreHint);assert.equal(Q.record(restored).hintState.wrongAfterHint,0);assert.equal(Q.record(restored).attempts[0].hintUsed,false);assert.equal(Q.current(restored).id,before.questionId);
});
test('profile learning records and reservations persist between runs without combat RNG use',()=>{
 const r=trial();E.selectEducation(r,Q.current(r).correctChoiceId);E.answerEducation(r);E.continueEducation(r);
 const history=Q.history(r.educationState.usedIds,r.educationState.session);assert.ok(Q.validHistory(history));
 const next=E.newRun(17,'challenge'),rng=next.rng;E.chooseArtifact(next,E.artifactChoices(next)[0].id,history.usedIds,history.session);
 const control=E.newRun(17,'challenge');E.chooseArtifact(control,E.artifactChoices(control)[0].id);assert.equal(Q.current(next).id,Q.current(control).id);assert.equal(Q.coverage(next).run,1);assert.ok(next.educationState.usedIds.includes(r.educationState.completed[0].questionId));assert.equal(Q.progress(next).some(p=>p.correct>0),true);assert.equal(next.rng,rng);
 const bad=clone(next);bad.educationState.session.records[Q.current(next).id].events.push({type:'FINAL_REVEALED'});assert.equal(E.restore(bad),null);
});
test('a completed profile record cannot be downgraded by an older imported pending fork',()=>{
 const r=trial(),fork=clone(r);wrong(fork);Q.support(fork,'foundation');E.hintEducation(fork);
 E.selectEducation(r,Q.current(r).correctChoiceId);E.answerEducation(r);
 const merged=Q.mergeSessions(r.educationState.session,fork.educationState.session),id=Q.current(r).id;
 assert.equal(merged.records[id].status,'correct');assert.equal(merged.records[id].completion.category,'independent');assert.equal(merged.pendingQuestionId,null);
});
test('a hidden pending learning record cannot be imported outside its owning trial',()=>{
 const r=trial();E.selectEducation(r,Q.current(r).correctChoiceId);E.answerEducation(r);E.continueEducation(r);
 const forged=clone(r),other=trial().educationState.session;
 forged.educationState.session=other;assert.equal(E.restore(forged),null);
});
