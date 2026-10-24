'use strict';

// Fresh boundary probes against the supplied isolated runtime. Historical probe
// files and production definitions are deliberately not imported or rewritten.
const assert = require('node:assert/strict');
const D = require('../deep.cjs');
const copy = value => JSON.parse(JSON.stringify(value));

function arrange(x, r, names) {
 const b = r.battle, available = [...b.hand, ...b.draw, ...b.discard];
 b.hand = []; b.discard = [];
 for (const name of names) {
  const key = x.data.cards.find(c => c.name === name)?.id || name;
  const index = available.findIndex(c => c.key === key);
  assert.ok(index >= 0, 'Unavailable fixture card: ' + name);
  b.hand.push(available.splice(index, 1)[0]);
 }
 b.draw = available;
 assert.ok(x.E.validate(r), 'Invalid arranged fixture');
}

function snapshot(r) {
 const b = r.battle;
 return { scene: r.scene, hp: r.hp, maxHp: r.maxHp, gold: r.gold, rng: r.rng,
  artifactRng: r.artifactState?.rng, acquired: copy(r.artifactState?.acquired || []),
  ...(b ? { turn: b.turn, enemy: b.enemyId, enemyHp: b.hp, enemyBlock: b.enemyBlock,
   energy: b.energy, energyBudget: b.artifacts?.turn.energyBudget, focus: b.focus,
   block: b.block, strength: b.strength, agility: b.agility,
   artifacts: copy(b.artifacts || null),
   piles: Object.fromEntries(['hand', 'draw', 'discard', 'exhaust', 'active'].map(k => [k, (b[k] || []).length])),
   intent: copy(b.currentIntent) } : {}) };
}

function planReceipt(p) {
 return { card: p.card.id, legal: p.legal, errors: p.errors, cost: p.payEnergy,
  values: copy(p.values), calculations: copy(p.calculations), actions: copy(p.actions),
  damageEvents: copy(p.damageEvents) };
}

function checkpoint(x, r) {
 D.invariant(x, r);
 const restored = x.E.restore(copy(r));
 assert.ok(restored, 'Restore rejected probe checkpoint');
 assert.deepEqual(snapshot(restored), snapshot(r), 'Restore changed mechanical artifact state');
 return snapshot(r);
}

function play(x, r, name, choose) {
 const key = x.data.cards.find(c => c.name === name)?.id || name;
 const c = r.battle.hand.find(c => c.key === key);
 assert.ok(c, 'Missing playable fixture: ' + name);
 const p = x.E.cardPlan(r, c);
 assert.ok(p?.legal, name + ': ' + p?.errors.join(', '));
 const before = snapshot(r), count = r.stats.cardsPlayed;
 x.E.playCard(r, c.uid);
 let choices = 0;
 while (x.E.cardChoice(r)) {
  assert.ok(++choices <= 20, 'Unbounded card choice');
  const ch = x.E.cardChoice(r);
  const value = choose ? choose(ch, choices) : ch.kind === 'card_search' ? 'attack'
   : ch.kind === 'burning_page' ? 'take'
   : ch.kind === 'read_ahead' ? { take: ch.candidates[0].uid, order: ch.candidates.slice(1).map(c => c.uid) }
   : ch.candidates[0].uid;
  x.E.chooseCardOption(r, value);
 }
 assert.equal(r.stats.cardsPlayed, count + 1, 'Card did not resolve exactly once');
 const receipt = copy(r.battle.cardCombat.receipts.at(-1));
 assert.equal(receipt.uid, c.uid);
 return { before, plan: planReceipt(p), receipt, after: checkpoint(x, r) };
}

function probeRuntime(x) {
 const { E, A, C, R, L } = x;
 assert.ok(E && A && C && R && L && x.data?.cards, 'An isolated current runtime is required');
 const rows = [], originalRecord = R.record, originalLog = L.record;
 let observed = [], logs = [];
 R.record = function (...args) { const event = originalRecord.apply(this, args); if (event) observed.push(copy(event)); return event; };
 L.record = function (...args) { const event = originalLog.apply(this, args); if (event) logs.push(copy(event)); return event; };
 const key = name => {
  const id = x.data.cards.find(c => c.name === name)?.id;
  assert.ok(id, 'Current card missing: ' + name); return id;
 };
 const base = (name, field) => x.CC.get({ key: key(name), upgraded: false }).values[field].base;
 const deck = x.data.cards.map(c => c.id);
 const fixture = (code, opts = {}) => D.create(x, { seed: 42, enemy: 'sentinel', deck,
  artifacts: code ? [code] : [], ...opts });
 const own = id => observed.filter(e => e.artifactIds.includes(id));
 const gains = (id, label) => own(id).flatMap(e => e.results).filter(v => v.label === label);
 const firstBlock = p => p.actions.find(a => a.op === 'grant_block' && !a.timing)?.value;
 const immediate = (name, a) => base(name, 'block') + (a || 0);

 try {
  for (const a of Object.values(A.catalog)) {
   observed = []; logs = [];
   const code = a.id.slice(0, 3), v = a.values, scenarios = [], runs = [];
   const row = { id: a.id, name: a.name, build: x.build || 'runtime', difficulty: x.difficulty || null,
    values: copy(v), classification: ['s06', 'e14'].includes(code) ? 'noncombat_quote'
     : ['s08', 's09'].includes(code) ? 'acquisition' : code === 'e13' ? 'unsupported_hand_discard' : 'combat',
    coverage: code === 'e13' ? 'negative_eligibility_and_exclusions' : 'positive_runtime_effect',
    positiveEffect: code !== 'e13', limits: [] };
   const keep = r => { runs.push(r); return r; };
   const step = (name, evidence) => scenarios.push({ name, ...evidence });
   try {
    if (['s01', 'e06'].includes(code)) {
     const r = keep(fixture(code, { enemy: 'wisp', deck: Array(12).fill(key('Rune Strike')), hpRatio: 0.6 }));
     const plays = [];
     for (let actions = 0; r.scene === 'battle' && actions < 30; actions++) {
      const c = r.battle.hand.find(c => E.cardPlan(r, c)?.legal);
      if (c) plays.push(play(x, r, c.key)); else E.endTurn(r);
     }
     assert.equal(r.scene, 'reward', 'Natural combat did not finish');
     const healing = gains(a.id, 'HP restored');
     assert.equal(healing.length, 1); assert.equal(healing[0].value, v.heal);
     assert.equal(r.battle.artifacts.combat.won, true);
     const final = checkpoint(x, r), before = copy(r);
     assert.throws(() => E.endTurn(r)); assert.deepEqual(r, before);
     step('natural-victory-heals-once', { plays, final });
     const capped = keep(fixture(code, { enemy: 'wisp', initialHp: C.MAX_HP - 1 }));
     // Synthetic low enemy HP is a fixture boundary, resolved by the actual card API.
     capped.battle.hp = 1; arrange(x, capped, ['Rune Strike']);
     const victory = play(x, capped, 'Rune Strike');
     assert.equal(capped.hp, capped.maxHp); assert.equal(gains(a.id, 'HP restored').at(-1).value, 1);
     step('healing-cap', { setup: 'Enemy HP set to 1 before an actual finishing attack.', victory });
    } else if (['s06', 'e14'].includes(code)) {
     const r = keep(fixture(code)), quotes = [1, 45, 101].map(amount => {
      const quote = A.priceCalculation(r, amount);
      assert.equal(quote.value, Math.max(1, Math.ceil(amount * (100 - v.discount_percent) / 100)));
      assert.equal(A.price(r, amount), quote.value); return quote;
     });
     const companion = code === 's06' ? 'e14' : 's06';
     A.acquire(r, A.id(companion), 'shop:0:recheck:' + companion);
     const rate = Math.max(v.discount_percent, A.get(companion).values.discount_percent), both = A.priceCalculation(r, 101);
     assert.equal(A.discount(r), rate); assert.equal(both.value, Math.ceil(101 * (100 - rate) / 100));
     step('quotes-and-best-discount', { quotes, both, final: checkpoint(x, r) });
     row.coverage = 'quote_api_only'; row.limits.push('Price calculation and best-rate stacking only; this row does not claim Shop travel, stock, purchases, or campaign spending coverage.');
    } else if (['s08', 's09'].includes(code)) {
     const r = E.newRun(42, 'learn');
     r.hp -= 10;
     r.artifactState = { version: 1, shopOnly: true, rng: (r.seed ^ 0xa741c6e5) >>> 0,
      owned: [], acquired: [], startingId: null, offer: null };
     const before = snapshot(r); A.acquire(r, a.id, 'shop:0:recheck:' + code); keep(r);
     if (code === 's08') {
      assert.equal(r.maxHp, before.maxHp + v.max_hp); assert.equal(r.hp, Math.min(r.maxHp, before.hp + v.heal));
      assert.equal(gains(a.id, 'Max HP gained')[0].value, v.max_hp); assert.equal(gains(a.id, 'HP restored')[0].value, v.heal);
     } else {
      assert.equal(r.gold, before.gold + v.gold); assert.equal(gains(a.id, 'Gold gained')[0].value, v.gold);
     }
     const after = snapshot(r), unchanged = copy(r);
     assert.throws(() => A.acquire(r, a.id, 'shop:0:recheck:duplicate')); assert.deepEqual(r, unchanged);
     const restored = E.restore(copy(r)); assert.ok(restored); assert.deepEqual(snapshot(restored), after);
     step('wounded-acquisition-and-no-reapply', { before, after, restored: snapshot(restored), duplicateRejected: true });
     row.coverage = 'acquisition_api_only'; row.limits.push('Acquisition and restoration are exercised directly; artifact trial/Shop acquisition UI is outside this row.');
    } else if (['s02', 'e07'].includes(code)) {
     const r = keep(fixture(code)); arrange(x, r, ['Rune Strike', 'Twin Shot']);
     const p = E.cardPlan(r, r.battle.hand[0]); assert.equal(p.damageEvents[0].beforeStatus, base('Rune Strike', 'damage') + v.damage_bonus_per_card);
     const first = play(x, r, 'Rune Strike'), second = play(x, r, 'Twin Shot');
     assert.equal(second.plan.damageEvents[0].beforeStatus, base('Twin Shot', 'first'));
     assert.equal(second.plan.damageEvents[1].beforeStatus, base('Twin Shot', 'second'));
     assert.equal(first.before.enemyHp - first.after.enemyHp, first.plan.damageEvents.reduce((n, hit) => n + hit.hpLost, 0));
     E.endTurn(r); arrange(x, r, ['Twin Shot']); const renewed = play(x, r, 'Twin Shot');
     assert.equal(renewed.plan.damageEvents[0].beforeStatus, base('Twin Shot', 'first') + v.damage_bonus_per_card);
     assert.equal(renewed.plan.damageEvents[1].beforeStatus, base('Twin Shot', 'second'));
     step('first-attack-per-turn-and-once-per-multihit-card', { first, second, renewed });
    } else if (['s03', 'e08'].includes(code)) {
     const r = keep(fixture(code)); arrange(x, r, ['Rune Guard', 'Cinder Guard']);
     const first = play(x, r, 'Rune Guard'), second = play(x, r, 'Cinder Guard');
     assert.equal(firstBlock(first.plan), immediate('Rune Guard', v.block_bonus));
     assert.equal(first.after.block - first.before.block, immediate('Rune Guard', v.block_bonus));
     assert.equal(firstBlock(second.plan), base('Cinder Guard', 'block'));
     assert.equal(second.after.block - second.before.block, base('Cinder Guard', 'block'));
     E.endTurn(r); arrange(x, r, ['Flash Ward', 'Rune Guard']);
     const renewed = play(x, r, 'Flash Ward'), later = play(x, r, 'Rune Guard');
     assert.equal(firstBlock(renewed.plan), immediate('Flash Ward', v.block_bonus));
     assert.equal(firstBlock(later.plan), base('Rune Guard', 'block'));
     step('first-defend-per-turn', { first, second, renewed, later });
    } else if (code === 's04') {
     const r = keep(fixture(code)), control = fixture(null), opening = checkpoint(x, r);
     assert.equal(r.battle.focus, Math.min(C.FOCUS_CAP, control.battle.focus + v.focus));
     arrange(x, r, ['Rune Strike']); E.armFocus(r); const focused = play(x, r, 'Rune Strike');
     assert.equal(focused.receipt.focus, 1); E.endTurn(r);
     assert.equal(r.battle.focus, focused.after.focus); assert.equal(own(a.id).length, 1);
     E.startBattle(r, 'sentinel'); assert.equal(own(a.id).length, 2);
     step('opening-focus-spent-and-not-refilled-next-turn', { opening, focused, nextCombat: checkpoint(x, r) });
    } else if (['s05', 'e11', 'b03'].includes(code)) {
     const r = keep(fixture(code)), turns = [];
     for (let turn = 1; turn <= 3; turn++) {
      const extra = code === 'b03' || turn === 1 ? v.draw : 0;
      assert.equal(r.battle.hand.length, Math.min(C.HAND_LIMIT, C.HAND + extra));
      turns.push(checkpoint(x, r)); if (turn < 3) E.endTurn(r);
     }
     assert.equal(own(a.id).length, code === 'b03' ? 3 : 1);
     assert.ok(gains(a.id, 'Cards drawn').every(result => result.value === v.draw));
     E.startBattle(r, 'sentinel'); assert.equal(r.battle.hand.length, C.HAND + v.draw);
     step(code === 'b03' ? 'draw-every-turn-and-combat-reset' : 'opening-draw-only-and-combat-reset', { turns, nextCombat: checkpoint(x, r) });
    } else if (code === 's07') {
     const r = keep(fixture(code)), opening = checkpoint(x, r); assert.equal(r.battle.block, v.block);
     E.endTurn(r); assert.equal(r.battle.block, 0); assert.equal(own(a.id).length, 1);
     const later = checkpoint(x, r); E.startBattle(r, 'sentinel'); assert.equal(r.battle.block, v.block); assert.equal(own(a.id).length, 2);
     step('opening-block-only-and-combat-reset', { opening, later, nextCombat: checkpoint(x, r) });
    } else if (['s10', 'e10'].includes(code)) {
     const r = keep(fixture(code)); arrange(x, r, ['Quick Study', 'Clear Choice']);
     const first = play(x, r, 'Quick Study'), second = play(x, r, 'Clear Choice'); assert.equal(own(a.id).length, 1);
     assert.equal(gains(a.id, 'Cards drawn')[0].value, v.draw);
     E.endTurn(r); arrange(x, r, ['Deep Study']); const later = play(x, r, 'Deep Study');
     assert.equal(own(a.id).length, code === 's10' ? 1 : 2);
     E.startBattle(r, 'sentinel'); arrange(x, r, ['Quick Study']); const nextCombat = play(x, r, 'Quick Study');
     assert.equal(own(a.id).length, code === 's10' ? 2 : 3);
     step('resolved-skill-draw-and-scope-reset', { first, second, later, nextCombat });
    } else if (['s11', 'e05'].includes(code)) {
     const r = keep(fixture(code, { deck: [...deck, key('Flash Ward')] }));
     arrange(x, r, ['Flash Ward', 'Flash Ward']);
     const first = play(x, r, 'Flash Ward'), second = play(x, r, 'Flash Ward');
     assert.equal(first.after.piles.exhaust - first.before.piles.exhaust, 1);
     assert.equal(first.after.block - first.before.block, base('Flash Ward', 'block') + v.block);
     assert.equal(second.after.block - second.before.block, base('Flash Ward', 'block')); assert.equal(own(a.id).length, 1);
     if (v.draw) assert.equal(gains(a.id, 'Cards drawn')[0].value, v.draw);
     E.endTurn(r); arrange(x, r, ['Deep Study']); const later = play(x, r, 'Deep Study');
     assert.equal(own(a.id).length, code === 's11' ? 1 : 2);
     E.startBattle(r, 'sentinel'); arrange(x, r, ['Flash Ward']); const nextCombat = play(x, r, 'Flash Ward');
     assert.equal(own(a.id).length, code === 's11' ? 2 : 3);
     step('real-exhaust-moves-and-turn-combat-limits', { first, second, later, nextCombat });
    } else if (code === 's12') {
     const r = keep(fixture(code)), unsupported = fixture(null, { deck: Array(12).fill(key('Rune Strike')) });
     assert.equal(A.eligible(r, a), true); assert.equal(A.eligible(unsupported, a), false);
     assert.equal(A.pool(unsupported, 'starting').some(item => item.id === a.id), false);
     arrange(x, r, ['Blazing Spirit', 'Swift Step']); const first = play(x, r, 'Blazing Spirit'), second = play(x, r, 'Swift Step');
     assert.equal(first.after.block - first.before.block, v.block); assert.equal(second.after.block - second.before.block, 0); assert.equal(own(a.id).length, 1);
     E.endTurn(r); arrange(x, r, ['Rune Armor']); const later = play(x, r, 'Rune Armor'); assert.equal(own(a.id).length, 1);
     E.startBattle(r, 'sentinel'); arrange(x, r, ['Blazing Spirit']); const nextCombat = play(x, r, 'Blazing Spirit'); assert.equal(own(a.id).length, 2);
     step('actual-passives-and-eligibility', { eligibleWithPassive: true, excludedWithoutPassive: true, first, second, later, nextCombat });
    } else if (code === 'e01') {
     const r = keep(fixture(code)); assert.equal(v.cards_required, 3, 'Probe needs an updated card sequence for the current threshold');
     arrange(x, r, ['Rune Strike', 'Rune Guard', 'Flash Ward', 'Quick Study']);
     const first = play(x, r, 'Rune Strike'), second = play(x, r, 'Rune Guard'); assert.equal(own(a.id).length, 0);
     const threshold = play(x, r, 'Flash Ward'); assert.equal(threshold.after.energy, threshold.before.energy - threshold.plan.cost + v.energy);
     const later = play(x, r, 'Quick Study'); assert.equal(own(a.id).length, 1); assert.equal(later.after.energy, later.before.energy - later.plan.cost);
     E.endTurn(r); arrange(x, r, ['Rune Strike', 'Rune Guard', 'Burning Page']);
     const renewed = ['Rune Strike', 'Rune Guard', 'Burning Page'].map(name => play(x, r, name));
     assert.equal(own(a.id).length, 2); assert.equal(gains(a.id, 'Energy gained').length, 2);
     step('third-resolved-card-once-per-turn', { first, second, threshold, later, renewed });
    } else if (code === 'e02') {
     const r = keep(fixture(code)); arrange(x, r, ['Rune Strike', 'Rune Guard', 'Cinder Guard']);
     const attack = play(x, r, 'Rune Strike'); assert.equal(own(a.id).length, 0);
     const pair = play(x, r, 'Rune Guard'); assert.equal(pair.after.block - pair.before.block, base('Rune Guard', 'block') + v.block);
     const later = play(x, r, 'Cinder Guard'); assert.equal(own(a.id).length, 1);
     E.endTurn(r); arrange(x, r, ['Rune Guard', 'Rune Strike', 'Flash Ward']);
     const reverse = ['Rune Guard', 'Rune Strike', 'Flash Ward'].map(name => play(x, r, name));
     assert.equal(own(a.id).length, 2); assert.ok(gains(a.id, 'Block gained').every(result => result.value === v.block));
     step('attack-defend-both-orders-once-per-turn', { attack, pair, later, reverse });
    } else if (code === 'e03') {
     const seen = new Set(), faces = [];
     for (let index = 1; index <= 256 && seen.size < v.sides; index++) {
      const seed = Math.imul(index, 0x9e3779b9) >>> 0, start = own(a.id).length;
      const r = fixture(code, { seed }), face = r.battle.artifacts.die;
      if (seen.has(face)) continue;
      seen.add(face); keep(r); const control = fixture(null, { seed });
      const opening = checkpoint(x, r), effect = v[face <= 2 ? 'faces_1_2' : face <= 4 ? 'faces_3_4' : 'faces_5_6'];
      assert.equal(r.battle.block, control.battle.block + (effect.block || 0));
      assert.equal(r.battle.hand.length, control.battle.hand.length + (effect.draw || 0));
      assert.equal(r.battle.energy, control.battle.energy + (effect.energy || 0));
      assert.equal(r.rng, control.rng, 'Chance Die affected the combat/deck stream');
      const saved = E.restore(copy(r)), artifactRng = r.artifactState.rng; assert.ok(saved);
      assert.equal(saved.battle.artifacts.die, face); assert.equal(saved.artifactState.rng, artifactRng);
      E.endTurn(saved); assert.equal(saved.battle.artifacts.die, face); assert.equal(saved.artifactState.rng, artifactRng);
      assert.equal(saved.battle.energy, C.ENERGY); assert.equal(own(a.id).length, start + 1);
      const later = checkpoint(x, saved); E.startBattle(saved, 'sentinel');
      assert.equal(own(a.id).length, start + 2); assert.notEqual(saved.artifactState.rng, artifactRng);
      assert.ok(saved.battle.artifacts.die >= 1 && saved.battle.artifacts.die <= v.sides);
      faces.push({ seed, face, effect: copy(effect), opening, later, nextCombat: checkpoint(x, saved) });
     }
     assert.equal(seen.size, v.sides, 'All six live d6 faces were not reached');
     step('all-six-faces-positive-branches-and-no-reroll', { faces: faces.sort((a, b) => a.face - b.face) });
    } else if (code === 'e04') {
     const r = keep(fixture(code)); arrange(x, r, ['Rune Strike', 'Rune Guard']);
     const spent = ['Rune Strike', 'Rune Guard'].map(name => play(x, r, name)); assert.equal(r.battle.energy, v.min_unspent_energy);
     const before = snapshot(r); E.endTurn(r); assert.equal(own(a.id).length, 1); assert.equal(gains(a.id, 'Block gained')[0].value, v.block);
     const positive = checkpoint(x, r); E.endTurn(r); assert.equal(own(a.id).length, 2);
     const zero = keep(fixture(code)); arrange(x, zero, ['Rune Strike', 'Rune Guard', 'Cinder Guard']);
     const exhausted = ['Rune Strike', 'Rune Guard', 'Cinder Guard'].map(name => play(x, zero, name)); assert.equal(zero.battle.energy, 0);
     E.endTurn(zero); assert.equal(own(a.id).length, 2);
     step('unspent-energy-boundary-before-enemy-damage', { spent, before, positive, zeroEnergy: { plays: exhausted, final: checkpoint(x, zero) } });
    } else if (code === 'e09') {
     const r = keep(fixture(code, { enemy: 'bat' }));
     const syntheticMultiHit = (r.battle.currentIntent.hits || 1) < 2;
     if (syntheticMultiHit) {
      // Ordinary currently has no native multi-hit enemy. This fixture changes
      // only the intent boundary; E.endTurn still owns every hit and retaliation.
      r.battle.currentIntent.hits = 2;
      r.battle.currentIntent.damage = Math.min(r.battle.currentIntent.damage, Math.floor(base('Tower Shield', 'block') / 2));
      row.limits.push('This runtime has no native opening multi-hit on Rune Bat; the once-per-cycle boundary uses a synthetic two-hit intent resolved by E.endTurn.');
     }
     arrange(x, r, ['Tower Shield']); const guard = play(x, r, 'Tower Shield');
     const before = snapshot(r); E.endTurn(r); assert.equal(r.hp, before.hp); assert.equal(before.enemyHp - r.battle.hp, v.retaliation_damage); assert.equal(own(a.id).length, 1);
     const first = checkpoint(x, r), multiHitLog = copy(logs.filter(e => e.kind === 'enemy-turn').at(-1)); assert.equal(multiHitLog.values.hits, 2);
     arrange(x, r, ['Tower Shield']); const renewed = play(x, r, 'Tower Shield'); E.endTurn(r); assert.equal(own(a.id).length, 2);
     const syntheticZeroDamage = r.battle.currentIntent.damage !== 0;
     if (syntheticZeroDamage) r.battle.currentIntent.damage = 0;
     arrange(x, r, ['Tower Shield']); play(x, r, 'Tower Shield'); E.endTurn(r); assert.equal(own(a.id).length, 2);
     const unblocked = keep(fixture(code, { enemy: 'wisp' })), hp = unblocked.hp; E.endTurn(unblocked); assert.ok(unblocked.hp < hp); assert.equal(own(a.id).length, 2);
     step('positive-fully-blocked-multihit-once-and-negatives', { syntheticMultiHit, syntheticZeroDamage, guard, before, multiHitLog, first, renewed, noBlock: checkpoint(x, unblocked), final: checkpoint(x, r) });
    } else if (code === 'e12') {
     const boundary = Math.floor(C.MAX_HP * v.hp_threshold_percent / 100);
     const low = keep(fixture(code, { initialHp: boundary })), opening = checkpoint(x, low); assert.equal(low.battle.block, v.block); assert.equal(own(a.id).length, 1);
     E.endTurn(low); assert.equal(own(a.id).length, 1); checkpoint(x, low);
     const crossing = keep(fixture(code, { initialHp: boundary + 2 })); assert.equal(crossing.battle.artifacts.combat.flask, false);
     const before = snapshot(crossing); E.endTurn(crossing); assert.ok(crossing.hp <= boundary); assert.ok(crossing.hp > 0);
     assert.equal(crossing.battle.block, v.block); assert.equal(own(a.id).length, 2);
     const crossed = checkpoint(x, crossing), dead = keep(fixture(code, { initialHp: boundary + 2 }));
     dead.battle.currentIntent.damage = dead.hp; const lethal = snapshot(dead); E.endTurn(dead);
     assert.equal(dead.scene, 'defeat'); assert.equal(dead.hp, 0); assert.equal(dead.battle.artifacts.combat.flask, false); assert.equal(own(a.id).length, 2);
     E.startBattle(crossing, 'sentinel'); assert.equal(own(a.id).length, 3); assert.equal(crossing.battle.block, v.block);
     step('start-threshold-crossing-and-no-revival', { boundary, opening, crossing: { before, after: crossed },
      nextCombat: checkpoint(x, crossing), lethal: { setup: 'Synthetic lethal intent preserves a live starting HP above the threshold.', before: lethal, after: checkpoint(x, dead) } });
    } else if (code === 'e13') {
     const r = keep(fixture(code)), unsupported = fixture(null), eligibleCards = Object.keys(C.cards).filter(id => C.cards[id].discard);
     assert.equal(eligibleCards.length, 0, 'A reachable hand-discard card now exists; add a positive engine probe');
     assert.equal(A.eligible(unsupported, a), false); assert.equal(A.pool(unsupported, a.tier).some(item => item.id === a.id), false);
     arrange(x, r, ['Clear Choice', 'Burning Page']); const clearChoice = play(x, r, 'Clear Choice');
     const recordsAfterClearChoice = own(a.id).length;
     const burningPage = play(x, r, 'Burning Page', (ch, count) => ch.kind === 'burning_page' ? count === 1 ? 'replace' : 'take' : ch.candidates[0].uid);
     row.limits.push('No current card exposes effect-caused hand discard. This probe checks eligibility exclusion, Draw-Pile discard/replacement, and End Turn cleanup; a legal positive hand-discard trigger is unreachable and unmeasured. Forced ownership is used only to expose exclusions.');
     assert.ok(clearChoice.after.piles.discard > clearChoice.before.piles.discard);
     const recordsBeforeCleanup = own(a.id).length; E.endTurn(r);
     step('ineligible-and-pile-selection-cleanup-exclusions', { eligibleCards, artifactDiscardScope: x.data.rules.artifact_discard_scope,
      forcedOwnershipForExclusions: true, clearChoice, burningPage, recordsAfterClearChoice, recordsBeforeCleanup,
      recordsAfterCleanup: own(a.id).length, final: checkpoint(x, r) });
     assert.equal(recordsAfterClearChoice, 0, 'Ineligible Spool triggered from Clear Choice Draw-Pile discard; the advertised trigger requires hand discard');
     assert.equal(recordsBeforeCleanup, 0, 'Ineligible Spool triggered from Draw-Pile replacement discard');
     assert.equal(own(a.id).length, 0, 'End Turn cleanup triggered Spool'); assert.equal(r.battle.artifacts.turn.discard, false);
    } else if (code === 'e15') {
     const r = keep(fixture(code)); assert.equal(r.battle.strength, v.strength);
     arrange(x, r, ['Twin Shot', 'Blazing Spirit', 'Rune Strike']);
     const twin = play(x, r, 'Twin Shot'), secondHitUsesStrength = x.CC.get({ key: key('Twin Shot') }).values.second.stat === 'strength';
     assert.equal(twin.plan.damageEvents[0].beforeStatus, base('Twin Shot', 'first') + v.strength);
     assert.equal(twin.plan.damageEvents[1].beforeStatus, base('Twin Shot', 'second') + (secondHitUsesStrength ? v.strength : 0));
     const passive = play(x, r, 'Blazing Spirit'), attack = play(x, r, 'Rune Strike');
     assert.equal(r.battle.strength, v.strength + base('Blazing Spirit', 'strength')); assert.equal(attack.plan.damageEvents[0].beforeStatus, base('Rune Strike', 'damage') + r.battle.strength);
     E.endTurn(r); assert.equal(r.battle.strength, attack.after.strength); E.startBattle(r, 'sentinel'); assert.equal(r.battle.strength, v.strength);
     step('strength-current-hit-contract-passive-stack-and-combat-reset', { secondHitUsesStrength, twin, passive, attack, nextCombat: checkpoint(x, r) });
    } else if (code === 'e16') {
     const r = keep(fixture(code)); assert.equal(r.battle.agility, v.agility);
     arrange(x, r, ['Rune Guard', 'Swift Step', 'Layered Shield']);
     const guard = play(x, r, 'Rune Guard'); assert.equal(firstBlock(guard.plan), base('Rune Guard', 'block') + v.agility);
     const passive = play(x, r, 'Swift Step'), layered = play(x, r, 'Layered Shield');
     assert.equal(r.battle.agility, v.agility + base('Swift Step', 'agility')); assert.equal(firstBlock(layered.plan), base('Layered Shield', 'block') + r.battle.agility);
     const delayed = layered.plan.actions.find(action => action.op === 'grant_block' && action.timing).value;
     E.endTurn(r); assert.equal(r.battle.block, delayed); const later = checkpoint(x, r);
     E.startBattle(r, 'sentinel'); assert.equal(r.battle.agility, v.agility);
     step('agility-immediate-only-passive-stack-and-reset', { guard, passive, layered, later, nextCombat: checkpoint(x, r) });
    } else if (code === 'b01') {
     const r = keep(fixture(code)), turns = [];
     for (let turn = 1; turn <= 4; turn++) {
      assert.equal(r.battle.energy, C.ENERGY + v.energy); turns.push(checkpoint(x, r)); if (turn < 4) E.endTurn(r);
     }
     assert.equal(own(a.id).length, 4); assert.ok(gains(a.id, 'Energy gained').every(result => result.value === v.energy));
     step('energy-after-base-reset-every-turn', { turns });
    } else if (code === 'b02') {
     const r = keep(fixture(code)), turns = [], cap = v.max_artifact_contribution_each_stat;
     const count = Math.ceil((cap - v.initial_strength) / v.strength_per_later_turn) + 3;
     for (let turn = 1; turn <= count; turn++) {
      const strength = Math.min(cap, v.initial_strength + (turn - 1) * v.strength_per_later_turn);
      const agility = Math.min(cap, v.initial_agility + (turn - 1) * v.agility_per_later_turn);
      assert.equal(r.battle.strength, strength); assert.equal(r.battle.agility, agility);
      arrange(x, r, ['Rune Strike', 'Rune Guard']); const attack = planReceipt(E.cardPlan(r, r.battle.hand[0])), guard = planReceipt(E.cardPlan(r, r.battle.hand[1]));
      assert.equal(attack.damageEvents[0].beforeStatus, base('Rune Strike', 'damage') + strength); assert.equal(firstBlock(guard), base('Rune Guard', 'block') + agility);
      turns.push({ ...checkpoint(x, r), attack, guard }); if (turn < count) E.endTurn(r);
     }
     E.startBattle(r, 'sentinel'); assert.equal(r.battle.strength, v.initial_strength); assert.equal(r.battle.agility, v.initial_agility);
     step('initial-ramp-cap-and-combat-reset', { turns, nextCombat: checkpoint(x, r) });
     const stacked = keep(fixture(null, { artifacts: ['b02', 'e15', 'e16'] })); arrange(x, stacked, ['Blazing Spirit', 'Swift Step']);
     const passives = ['Blazing Spirit', 'Swift Step'].map(name => play(x, stacked, name));
     for (let turn = 1; turn < count; turn++) E.endTurn(stacked);
     assert.equal(stacked.battle.strength, cap + A.get('e15').values.strength + base('Blazing Spirit', 'strength'));
     assert.equal(stacked.battle.agility, cap + A.get('e16').values.agility + base('Swift Step', 'agility'));
     step('cap-applies-only-to-clasp-contribution', { passives, final: checkpoint(x, stacked) });
    } else throw new Error('No current probe for ' + code);

    for (const r of runs) {
     if (r.battle) checkpoint(x, r); else { assert.ok(E.validate(r)); assert.ok(E.restore(copy(r))); }
    }
    if (row.positiveEffect && row.classification === 'combat') {
     assert.ok(own(a.id).length || scenarios.some(s => Object.values(s).some(value => value?.receipt)), 'No positive runtime receipt');
    }
    rows.push({ ...row, status: 'PASS', scenarios, evidence: own(a.id), logs, validFinal: true });
   } catch (error) {
    rows.push({ ...row, status: 'FAIL', error: error.message, scenarios, evidence: own(a.id), logs,
     finalStates: runs.map(snapshot), validFinal: runs.every(r => E.validate(r)) });
   }
  }
 } finally { R.record = originalRecord; L.record = originalLog; }
 return rows;
}

module.exports = { probeRuntime };
