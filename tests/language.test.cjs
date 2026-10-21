const test=require('node:test');
const assert=require('node:assert/strict');
const E=require('../dist/engine.js');
const C=require('../dist/config.js');

test('an existing Malay save resumes in English without changing the battle or answer credit',()=>{
  assert.equal(typeof E.restore,'function','save presentation needs a safe restore path');
  const original=E.newRun(2026);delete original.route;E.startBattle(original,'sentinel');
  const q=E.forecast(original);E.hint(original);
  q.text='Apakah peluang mendapat Serangan ATAU Perisai dalam satu cabutan?';
  q.why='Kedua-dua peristiwa saling eksklusif.';
  q.steps=['Serangan = 4, Perisai = 2'];
  original.battle.currentIntent.label='Pukulan batu';
  const before=JSON.parse(JSON.stringify(original));
  const restored=E.restore(original);
  assert.ok(restored);assert.match(restored.battle.question.text,/chance/);
  assert.equal(restored.battle.currentIntent.label,C.enemies.sentinel.patterns[0].label);
  for(const key of ['rng','hp','stage','depth','deck','stats'])assert.deepEqual(restored[key],before[key]);
  for(const key of ['draw','hand','discard','exhaust','energy','seals','focus'])assert.deepEqual(restored.battle[key],before.battle[key]);
  assert.equal(restored.battle.question.hinted,true);
  assert.equal(restored.battle.question.attempts,0);
  assert.equal(E.answer(restored,q.n+'/'+q.d).first,false);
  assert.equal(restored.battle.focus,0);
  assert.equal(original.battle.question.text,before.battle.question.text,'restore must not mutate its input');
});

test('presentation migration still rejects corrupt probability answers and duplicate physical cards',()=>{
  assert.equal(typeof E.restore,'function');
  const r=E.newRun(7);delete r.route;E.startBattle(r,'wisp');E.forecast(r);
  r.battle.question.n+=1;assert.equal(E.restore(r),null);
  const duplicate=E.newRun(7);duplicate.deck[1].uid=duplicate.deck[0].uid;
  assert.equal(E.restore(duplicate),null);
});
