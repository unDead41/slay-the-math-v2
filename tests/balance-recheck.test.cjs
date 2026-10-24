'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const {loadRuntime} = require('../tools/balance/recheck/runtime.cjs');
const {simulate, comparable, legalOptions} = require('../tools/balance/recheck/combat.cjs');
const D = require('../tools/balance/deep.cjs'), B = require('../tools/balance/combat.cjs');
const {cardAudit} = require('../tools/balance/recheck/audit.cjs');
const {jobs, replacement} = require('../tools/balance/recheck/jobs.cjs');

test('current ordinary and three Master cartridges stay isolated and identify their own rules', () => {
  const ordinary = loadRuntime({family: 'ordinary'}), hard = loadRuntime({difficulty: 'hard'}), easy = loadRuntime({difficulty: 'easy'});
  assert.equal(ordinary.C.MASTER_BALANCE, undefined);
  assert.equal(ordinary.E.newRun(1).cardRulesVersion, 'card-effects-1');
  assert.equal(hard.binding.identity.version, 'master-1.4.0-candidate.4');
  assert.equal(ordinary.C.MAX_HP, 60); assert.equal(easy.C.MAX_HP, 70); assert.equal(hard.C.MAX_HP, 60);
  hard.C.MAX_HP = 999;
  assert.equal(ordinary.C.MAX_HP, 60); assert.equal(easy.C.MAX_HP, 70);
});
test('requested physical opening order chooses the exact instance among duplicate keys and pays real costs', () => {
  const x = loadRuntime(), deck = replacement(['stm.attack.rune_strike', 'stm.attack.rune_strike'], 3, false);
  const a = simulate(x, {seed: 261024102, enemy: 'wisp', deck, order: [1, 0], predictProfile: 'assisted', focusPolicy: 'never'});
  assert.equal(a.status, 'WIN', a.error);
  assert.deepEqual(a.order.map(v => v.uid), ['c2', 'c1']);
  assert.ok(a.order.every(v => v.turn === 1 && v.energy === 1 && v.focus === 0));
  assert.equal(a.effects.totals.energySpent, a.energySpent);
});
test('Focus opportunity arms preserve one actual stock and do not spend on Passives', () => {
  const x = loadRuntime(), common = {seed: 261024100, enemy: 'wisp', deck: B.baseDeck().map(key => ({key, upgraded: false})),
    order: [0], predictProfile: 'assisted', initialFocus: 1};
  const target = simulate(x, {...common, focusPolicy: 'target'}), never = simulate(x, {...common, focusPolicy: 'never'});
  assert.equal(target.order[0].focus, 1); assert.equal(target.focusSpent, 1); assert.equal(never.focusSpent, 0);
  const a = cardAudit(x, 'stm.passive.rune_armor', true, true);
  assert.equal(a.eligibleFocus, false); assert.equal(a.actual.focusSpent, 0); assert.equal(a.actual.valid, true);
});
test('plan ranking is read-only and uses actual current phase calculations', () => {
  const x = loadRuntime(), r = D.create(x, {seed: 99, enemy: 'dealer'}), before = JSON.stringify(r);
  legalOptions(x, r); legalOptions(x, r);
  assert.equal(JSON.stringify(r), before);
});
test('restored current-rule choice/turn/Predict transitions exactly match uninterrupted results', () => {
  const options = {seed: 81, enemy: 'sentinel', deck: ['stm.skill.burning_page', 'stm.skill.recall', 'stm.defend.flash_ward', ...B.baseDeck().slice(0, 9)],
    predictProfile: 'struggling', artifacts: ['e01', 'e05', 's11', 'b01']};
  const a = simulate(loadRuntime(), options), b = simulate(loadRuntime(), {...options, reload: true});
  assert.notEqual(a.status, 'INVALID_POLICY_OR_ENGINE', a.error); assert.ok(b.reloads > 0);
  assert.deepEqual(comparable(a), comparable(b));
});
test('Lite retains exactly thirty original pairs and all eight original triads with complete cells', () => {
  const rs = jobs('pairs'), selected = require('../tools/balance/specs/selected-combo-tests.json');
  assert.equal(new Set(rs.filter(r => r.selection === 'SOR Lite 30').map(r => r.cards.join('|'))).size, 30);
  assert.equal(new Set(jobs('triads').map(r => r.cards.join('|'))).size, selected.triads.length);
  for (const j of rs) assert.equal(new Set(j.order).size, 2);
});
test('ordinary Elite fixtures receive the real Elite HP and damage on first initialization', () => {
  const x = loadRuntime({family: 'ordinary'});
  const v = simulate(x, {seed: 7, enemy: 'knight', elite: true, maxCycles: 1, predictProfile: 'skip'});
  assert.equal(v.initial.enemyHp, 54); assert.equal(v.initial.intent.damage, 10);
  assert.notEqual(v.status, 'INVALID_POLICY_OR_ENGINE', v.error);
});
test('outcome interaction is distinct from combined value and censored groups stay unranked', () => {
  const {contrast, measured} = require('../tools/balance/recheck/analyse.cjs');
  assert.equal(contrast([10, 2, 3, 8]), 13);
  const a = measured([{valid: true, total: -2, interaction: 13}, {valid: true, total: -4, interaction: 11}]);
  assert.equal(a.total.mean, -3); assert.equal(a.interaction.mean, 12);
  assert.equal(measured([{valid: false, total: null, interaction: null}]).total, null);
});
test('raw verifier refuses a complete-looking gzip with fewer records than the worker accepted', () => {
  const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), z = require('node:zlib');
  const {readRows} = require('../tools/balance/recheck/analyse.cjs'), {sha256} = require('../tools/balance/recheck/runtime.cjs');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stm-raw-integrity-'));
  try {
    const source = JSON.stringify({example: 'actual captured source'}), bytes = z.gzipSync(JSON.stringify({index: 0, cohort: 'probe', result: {status: 'LOSS', utility: -1, validFinal: true}}) + '\n');
    fs.writeFileSync(path.join(dir, 'source.gz'), z.gzipSync(source));
    fs.writeFileSync(path.join(dir, 'part.gz'), bytes);
    fs.writeFileSync(path.join(dir, 'probe-manifest.json'), JSON.stringify({sourceFile: 'source.gz', sourceHash: sha256(source), tasks: [{index: 0, cohort: 'probe'}, {index: 1, cohort: 'probe'}]}));
    fs.writeFileSync(path.join(dir, 'probe-parts.json'), JSON.stringify([{file: 'part.gz', count: 2, bytes: bytes.length, sha256: sha256(bytes)}]));
    assert.throws(() => readRows(dir, 'probe', () => {}), /1 !== 2/);
  } finally {fs.rmSync(dir, {recursive: true, force: true});}
});
