const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../dist/engine');
const Q = require('../dist/education');
const M = require('../dist/mechanics');
const copy = value => JSON.parse(JSON.stringify(value));

test('harmonized bank provides teaching definitions and curriculum references for every active question', () => {
  assert.equal(M.shared.teachingExplanations, true);
  assert.equal(M.validateQuestionBankBundle(M.data).questions, 120);
  for (const q of Q.bank.questions) {
    assert.ok(q.harmonization.sources.length, q.id);
    assert.ok(q.harmonization.given.length, q.id);
    assert.ok(q.harmonization.asked, q.id);
  }
  assert.match(M.data.glossary.entries['qb:common-denominator'].teaching.definition.en, /bottom number/);
});

test('Hint 1 contains every ordered pair immediately, without placeholder cells or answer marks', () => {
  const q = Q.catalog['PROB-001'];
  let s = M.session.reserveNext(M.session.createSession({seed:1}), {...Q.bank,questions:[q]}).session;
  s = M.session.openSupport(s, q.id, 'hint');
  const hint = M.session.selectLearningView(q, s.records[q.id]);
  assert.equal(hint.visual.rows[0][1].text, '(H,1)');
  assert.equal(hint.visual.rows[1][4].text, '(T,4)');
  assert.ok(hint.visual.rows.flat().every(cell=>cell!=='?'&&!cell?.selected));
  assert.equal(hint.answer, null);
  s = M.session.submitAnswer(s, Q.bank, {questionId:q.id, choiceId:q.choices.find(c=>c.id!==q.correctChoiceId).id, attemptId:'grid-wrong'});
  s = M.session.openSupport(s, q.id, 'moreHint');
  const more = M.session.selectLearningView(q, s.records[q.id]);
  assert.equal(more.visual.rows[0][1].text, '(H,1)');
  assert.equal(more.visual.rows[0][2].text, '(H,2)');
  assert.equal(more.answer, null);
  assert.equal(more.explanation, null);
  assert.equal(q.learning.visual.hint.rows[0][1], '?');
});

test('every table and Venn Hint contains values while unspecified regions stay honest', () => {
  for(const q of Q.bank.questions){
    let s=M.session.reserveNext(M.session.createSession({seed:1}),{...Q.bank,questions:[q]}).session;
    s=M.session.openSupport(s,q.id,'hint');
    const v=M.session.selectLearningView(q,s.records[q.id]);
    if(!['table','venn'].includes(v.visual.kind))continue;
    assert.ok(v.visual.rows.flat().every(c=>c!=='?'&&c?.text!=='?'&&!c?.selected),q.id);
    assert.equal(v.answer,null,q.id);
    if(v.visual.kind==='venn')assert.equal(v.visual.headers.length,2,q.id);
  }
  const q=Q.catalog['SET-009'];
  let s=M.session.reserveNext(M.session.createSession({seed:1}),{...Q.bank,questions:[q]}).session;
  s=M.session.openSupport(s,q.id,'hint');
  assert.equal(M.session.selectLearningView(q,s.records[q.id]).visual.rows[0][1],'Not given');
  const target=Q.catalog['SET-017'];
  let scaffold=M.session.reserveNext(M.session.createSession({seed:1}),{...Q.bank,questions:[target]}).session;
  scaffold=M.session.openSupport(scaffold,target.id,'hint');
  const reference=M.session.selectLearningView(target,scaffold.records[target.id]).visual;
  assert.deepEqual(reference.rows.slice(0,3),[['n(A)','13'],['n(B)','11'],['n(A ∩ B)','5']]);
  assert.equal(reference.rows[3][1],'13 + 11 − 5');
  assert.ok(!reference.rows.flat().includes('19'),'the requested computed union must remain for the learner');
});

test('a real pre-harmonization pending trial and profile resume without losing attempts or unlocking a claim', () => {
  const fixture = require('./fixtures/education-v1_4-pending.json');
  const restored = E.restore(copy(fixture));
  assert.ok(restored);
  assert.deepEqual(restored.educationState.pending, fixture.educationState.pending);
  assert.ok(Q.validHistory({version:1,bankVersion:'form4-review-1.4.0',usedIds:fixture.educationState.usedIds,session:fixture.educationState.session}));
  assert.throws(() => E.continueEducation(restored));
  const q = Q.current(restored);
  E.selectEducation(restored, q.correctChoiceId);
  E.answerEducation(restored);
  assert.ok(E.restore(copy(restored)));
  E.continueEducation(restored);
  assert.equal(restored.artifactState.owned.length, 1);
  assert.throws(() => E.continueEducation(restored));
});
