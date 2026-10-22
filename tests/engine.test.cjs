const {legacyRun}=require('./helpers/legacy-run.cjs');
const {claimArtifact,completeTrial,completeBrowserTrial}=require('./helpers/education.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../dist/config.js');
const E = require('../dist/engine.js');
const M = require('../dist/math.js');

function battle(seed = 112, enemy = 'wisp') {
  const r = legacyRun(seed);
  delete r.route; // Standalone combat fixture also covers original v1 saves.
  E.startBattle(r, enemy);
  return r;
}
function restored(r) { return JSON.parse(JSON.stringify(r)); }
function answerExactly(r) {
  const q = E.forecast(r);
  return E.answer(r, `${q.n}/${q.d}`);
}
function allCards(r) {
  const b = r.battle;
  return [...b.draw, ...b.hand, ...b.discard, ...b.exhaust];
}
function assertConserved(r) {
  assert.deepEqual(allCards(r).map(c => c.uid).sort(), r.deck.map(c => c.uid).sort());
  assert.equal(new Set(allCards(r).map(c => c.uid)).size, r.deck.length);
  assert.ok(E.validate(r));
}

// Enumerate physical-card outcomes, independently of the formula implementation.
function enumeratedProbability(source, kind) {
  const guard = c => c.role === 'guard';
  const attack = c => c.role === 'attack';
  const fire = c => c.element === 'fire';
  if (['single', 'exclusive', 'overlap'].includes(kind)) {
    const matches = source.filter(c => kind === 'single' ? guard(c) :
      kind === 'exclusive' ? attack(c) || guard(c) : fire(c) || attack(c));
    return matches.length / source.length;
  }
  let favorable = 0, total = 0;
  for (let i = 0; i < source.length; i++) {
    for (let j = 0; j < source.length; j++) {
      if (kind !== 'pairWith' && i === j) continue;
      total++;
      if (kind === 'atLeast' ? guard(source[i]) || guard(source[j]) : guard(source[i]) && guard(source[j])) favorable++;
    }
  }
  return favorable / total;
}

test('all forecast formulas match physical-card enumeration across varied sources', () => {
  const variants = ['strike', 'ember', 'guard', 'flameguard', 'filter', 'clarity'];
  for (let n = 2; n <= 12; n++) {
    for (let sample = 0; sample < 24; sample++) {
      let state = (n * 1721 + sample * 1777) >>> 0;
      const source = Array.from({length:n}, (_, i) => {
        state = (Math.imul(state, 1103515245) + 12345) >>> 0;
        return {uid: 'p' + i, ...C.cards[variants[(state >>> 16) % variants.length]]};
      });
      for (const kind of ['single', 'exclusive', 'overlap', 'pairWithout', 'pairWith', 'atLeast']) {
        const q = M.makeQuestion(source, kind);
        assert.ok(Math.abs(q.value - enumeratedProbability(source, kind)) < 1e-12, `${n}/${sample}/${kind}`);
        assert.ok(Number.isInteger(q.n) && Number.isInteger(q.d) && q.d > 0);
        assert.ok(q.n >= 0 && q.n <= q.d);
      }
    }
  }
});

test('starter state, draw/discard recycling and serialization conserve every physical card', () => {
  const r = battle();
  assert.equal(r.hp, 60);
  assert.equal(r.deck.length, 12);
  assert.equal(r.battle.hand.length, 4);
  assert.equal(r.battle.energy, 3);
  assertConserved(r);
  for (let t = 0; t < 4 && r.scene === 'battle'; t++) {
    for (const c of [...r.battle.hand]) {
      if (!E.canPlay(r, c) && !E.definition(c).filter) E.playCard(r, c.uid);
      if (r.scene !== 'battle') break;
    }
    assertConserved(r);
    if (r.scene === 'battle') { E.endTurn(r); assertConserved(r); }
  }
  assert.ok(E.validate(restored(r)));
});

test('filter moves selected physical cards once, enforces draw floor and restores next battle', () => {
  const r = legacyRun(13);
  delete r.route;
  r.deck = [];
  for (let i = 0; i < 6; i++) r.deck.push(E.card(r, 'filter'));
  for (let i = 0; i < 6; i++) r.deck.push(E.card(r, 'guard'));
  E.startBattle(r, 'wisp');
  for (let attempts = 0; attempts < 4; attempts++) {
    const filter = r.battle.hand.find(c => c.key === 'filter' && E.filterLimit(r,c) > 0);
    if (!filter) break;
    const before = restored(r);
    const id = r.battle.draw[0].uid;
    assert.throws(() => E.playCard(r, filter.uid, [id, id]));
    assert.deepEqual(r, before, 'invalid selection is atomic');
    const n = E.filterLimit(r, filter);
    E.playCard(r, filter.uid, r.battle.draw.slice(0,n).map(c => c.uid));
    assert.ok(r.battle.draw.length >= 2);
    assert.ok(r.battle.draw.length + r.battle.hand.length + r.battle.discard.length >= 6);
    assertConserved(r);
    if (!r.battle.energy) break;
  }
  assert.ok(r.battle.exhaust.length > 0);
  const originalIds = r.deck.map(c => c.uid).sort();
  E.finishNode(r);
  E.startBattle(r, 'beetle');
  assert.equal(r.battle.exhaust.length, 0);
  assert.deepEqual(allCards(r).map(c => c.uid).sort(), originalIds);
  assertConserved(r);
});

test('filter also enforces six active cards after prior exhaustion', () => {
  const r = battle();
  const b = r.battle;
  // Boundary fixture: retain six active cards and put a Filter in the hand.
  const filter = allCards(r).find(c => c.key === 'filter');
  const others = allCards(r).filter(c => c !== filter);
  b.hand = [filter, ...others.slice(0,3)];
  b.draw = others.slice(3,5);
  b.discard = [];
  b.exhaust = others.slice(5);
  assert.equal(E.filterLimit(r, filter), 0);
  assert.match(E.canPlay(r, filter), /2 cards in the Draw Pile and 6 active cards/);
  assertConserved(r);
});

test('invalid probability input is not an attempt; equivalent exact first answer earns Focus once', () => {
  const r = battle();
  const q = E.forecast(r);
  for (const raw of ['', 'hello', '1/0', '-1', '101%']) {
    assert.equal(E.answer(r, raw).valid, false);
    assert.equal(q.attempts, 0);
  }
  assert.equal(E.answer(r, `${q.n * 3}/${q.d * 3}`).first, true);
  assert.equal(r.battle.focus, 1);
  assert.equal(r.stats.firstCorrect, 1);
  assert.throws(() => E.answer(r, `${q.n}/${q.d}`));
  E.closeForecast(r);
  assert.throws(() => E.forecast(r));
});

for (const assistedBy of ['hint', 'wrong']) {
  test(`${assistedBy} survives reload and disqualifies first-answer Focus`, () => {
    let r = battle();
    let q = E.forecast(r);
    if (assistedBy === 'hint') E.hint(r);
    else E.answer(r, q.value === 0 ? '1' : '0');
    r = restored(r);
    assert.ok(E.validate(r));
    q = r.battle.question;
    const answer = E.answer(r, `${q.n}/${q.d}`);
    assert.equal(answer.correct, true);
    assert.equal(answer.first, false);
    assert.equal(r.battle.focus, 0);
    assert.equal(r.stats.assisted, 1);
  });
  test(`cancelling after ${assistedBy} consumes the chance across save/reload`, () => {
    let r = battle();
    const q = E.forecast(r);
    if (assistedBy === 'hint') E.hint(r);
    else E.answer(r, q.value === 0 ? '1' : '0');
    E.closeForecast(r);
    r = restored(r);
    assert.ok(E.validate(r));
    assert.equal(r.battle.focus, 0);
    assert.throws(() => E.forecast(r));
  });
}

test('untouched forecast cancellation is reversible, and pending source is frozen over reload', () => {
  let r = battle();
  const first = restored(E.forecast(r));
  E.closeForecast(r);
  const second = E.forecast(r);
  assert.deepEqual(second.source, first.source);
  assert.equal(second.value, first.value);
  r = restored(r);
  assert.ok(E.validate(r));
  assert.deepEqual(r.battle.question.source, first.source);
  assert.equal(E.answer(r, `${first.n}/${first.d}`).first, true);
});

test('unanswered forecasts lock card mutations and turn changes', () => {
  const r = battle();
  E.forecast(r);
  const before = restored(r);
  assert.throws(() => E.playCard(r, r.battle.hand[0].uid));
  assert.throws(() => E.endTurn(r));
  assert.deepEqual(r, before);
});

test('Focus caps at three, boosts only one eligible card once per turn, then resets eligibility', () => {
  const r = battle(112, 'dealer');
  r.battle.focus = 2;
  for (let i = 0; i < 2; i++) {
    answerExactly(r);
    E.closeForecast(r);
    if (i < 1) E.endTurn(r);
  }
  assert.equal(r.battle.focus, 3);
  const c = r.battle.hand.find(c => E.definition(c).damage || E.definition(c).block);
  const b = r.battle;
  const oldFocus = b.focus;
  E.armFocus(r);
  E.playCard(r, c.uid);
  assert.equal(b.focus, oldFocus - 1);
  assert.equal(b.boostUsed, true);
  assert.throws(() => E.armFocus(r));
  E.endTurn(r);
  assert.equal(b.boostUsed, false);
  assert.doesNotThrow(() => E.armFocus(r));
});

test('both bosses enforce seal floor; guided solutions open seals without awarding Focus', () => {
  for (const enemy of ['sentinel', 'dealer']) {
    const r = battle(112, enemy);
    const b = r.battle;
    b.hp = 1;
    b.enemyBlock = 0;
    const c = b.hand.find(c => E.definition(c).damage);
    E.playCard(r, c.uid);
    assert.equal(b.hp, 1);
    assert.equal(r.scene, 'battle');
    const q = E.forecast(r);
    E.hint(r);
    assert.equal(E.answer(r, `${q.n}/${q.d}`).first, false);
    assert.equal(b.seals, 1);
    assert.equal(b.focus, 0);
    E.closeForecast(r);
    E.endTurn(r);
    answerExactly(r);
    E.closeForecast(r);
    assert.equal(b.seals, 2);
    const finisher = b.hand.find(c => E.definition(c).damage);
    assert.ok(finisher);
    b.enemyBlock = 0;
    E.playCard(r, finisher.uid);
    assert.equal(b.hp, 0);
    assert.equal(r.scene, 'stageclear');
  }
});

test('event removal floor rejects a permanent deck smaller than ten', () => {
  const r = legacyRun(3);
  delete r.route;
  r.scene = 'event'; r.depth = 3;
  E.event(r, 'remove', r.deck[0].uid);
  r.scene = 'event'; r.depth = 3;
  E.event(r, 'remove', r.deck[0].uid);
  assert.equal(r.deck.length, 10);
  r.scene = 'event'; r.depth = 3;
  const before = restored(r);
  assert.throws(() => E.event(r, 'remove', r.deck[0].uid));
  assert.deepEqual(r, before);
});

test('Dealer crossing half HP preserves the announced intent until the next turn, including reload', () => {
  let r = legacyRun(112,'challenge');
  claimArtifact(r,E.artifactChoices(r)[0].id);
  delete r.route;
  E.startBattle(r,'dealer');
  const b = r.battle;
  // Boundary fixture: both seals are already open and Dealer is just above half HP.
  b.hp = 49;
  b.seals = 2;
  b.enemyBlock = 0;
  const announced = restored(E.intent(r));
  const c = b.hand.find(c => E.definition(c).damage);
  assert.ok(c);
  E.playCard(r,c.uid);
  assert.ok(b.hp <= b.maxHp / 2);
  assert.deepEqual(E.intent(r),announced,'rage cannot retroactively change the announced attack');
  r = restored(r);
  assert.ok(E.validate(r));
  assert.deepEqual(E.intent(r),announced,'reload must preserve the announced attack');
  const hp = r.hp;
  E.endTurn(r);
  assert.equal(r.hp,hp - announced.damage);
  assert.equal(E.intent(r).rage,2,'half-HP rage begins with the following announced turn');
  assert.equal(E.intent(r).damage,14);
});

test('save validation safely rejects corrupt gameplay fields and malformed forecast sources', () => {
  const good = battle();
  E.forecast(good);
  assert.ok(E.validate(good));
  const mutations = [
    r => { r.stats.forecasts = 'broken'; },
    r => { r.battle.enemyBlock = 'broken'; },
    r => { r.battle.seals = 99; },
    r => { r.battle.seals = -1; },
    r => { delete r.battle.seals; },
    r => { r.battle.forecastUsed = 'false'; },
    r => { r.battle.question.source = [null]; },
    r => { r.battle.question.attempts = -1; },
    r => { r.battle.question.hinted = 'false'; },
    r => { r.battle.hand[0].uid = r.battle.draw[0].uid; },
    r => { r.battle.draw.pop(); },
    r => { r.stage = 4; },
    r => { r.depth = 5; },
  ];
  for (const mutate of mutations) {
    const r = restored(good);
    mutate(r);
    assert.doesNotThrow(() => E.validate(r), mutate.toString());
    assert.equal(E.validate(r), false, mutate.toString());
  }
});
