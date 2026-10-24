'use strict';

const fs = require('node:fs'), path = require('node:path'), z = require('node:zlib');
const {loadRuntime, PRE_EFFECTS, ROOT} = require('./runtime.cjs');
const {CONTEXTS} = require('./jobs.cjs');
const D = require('../deep.cjs'), B = require('../combat.cjs');
const {createAgent} = require('../../ai-playtester/agent.cjs');
const {DEFAULT_OUT, captureSources} = require('./run.cjs');

function cardAudit(x, key, upgraded, focus) {
  const deck = x.data.cards.map(c => ({key: c.id, upgraded: c.id === key && upgraded}));
  const r = D.create(x, {seed: 261024001, enemy: 'wisp', deck, initialFocus: 1});
  const all = [...r.battle.hand, ...r.battle.draw], uid = r.deck.find(c => c.key === key).uid;
  r.battle.hand = [all.splice(all.findIndex(c => c.uid === uid), 1)[0]];
  r.battle.draw = all;
  // Printed plan probe only: one known other card in Discard exposes Recall.
  const discarded = all.findIndex(c => c.key !== key && c.key === 'stm.attack.rune_strike');
  if (discarded >= 0) r.battle.discard.push(all.splice(discarded, 1)[0]);
  if (focus) x.E.armFocus(r);
  const p = x.E.cardPlan(r, r.battle.hand[0]);
  const before = {hp: r.battle.hp, block: r.battle.block, hand: r.battle.hand.length, energy: r.battle.energy,
    focus: r.battle.focus, rng: r.rng};
  let error = null;
  if (p.legal) try {
    x.E.playCard(r, uid);
    const agent = createAgent(x);
    for (let n = 0; x.E.cardChoice(r); n++) {
      if (n >= 30) throw Error('Audit choice exceeded bound');
      x.E.chooseCardOption(r, agent.choose(r));
    }
    D.invariant(x, r);
  } catch (e) {error = e.stack;}
  return {key, name: p.card.name, category: p.card.category, state: upgraded ? focus ? 'upgrade_focus' : 'upgrade' : focus ? 'focus' : 'normal',
    upgraded, requestedFocus: focus, eligibleFocus: !!p.focused, legal: p.legal, error,
    definition: {energy: p.card.energy, values: p.card.values, focus_rule: p.card.focus_rule, upgrade: p.card.upgrade,
      actions: p.card.actions, passive: p.card.passive, lifecycle: p.card.lifecycle},
    plan: {payEnergy: p.payEnergy, payFocus: p.payFocus, values: p.values, actions: p.actions,
      damageEvents: p.damageEvents, passive: p.passive},
    actual: {energySpent: before.energy - r.battle.energy, focusSpent: before.focus - r.battle.focus,
      hpDamage: before.hp - r.battle.hp, blockGained: r.battle.block - before.block, handAfter: r.battle.hand.length,
      exhaust: r.battle.exhaust.map(c => c.key), active: r.battle.active.map(c => c.key), queue: r.battle.cardCombat.queue,
      receipt: r.battle.cardCombat.receipts.at(-1), valid: x.E.validate(r)},
    context: 'wisp opening, 3 Energy, 1 Focus, no artifact/stats/Block; target only in Hand, other Rune Strike in Discard for Recall. Probe, not encounter CP.'};
}

function run(output = DEFAULT_OUT) {
  fs.mkdirSync(output, {recursive: true});
  if (fs.existsSync(path.join(output, 'audit.json.gz'))) throw Error('Audit evidence exists');
  const audits = [], screens = {}, contracts = [], artifacts = [], enemies = [];
  for (const context of CONTEXTS) {
    const x = loadRuntime(context), label = context.family === 'ordinary' ? 'ordinary' : 'master/' + context.difficulty;
    const before = loadRuntime({...context, ref: PRE_EFFECTS});
    for (const c of x.data.cards) for (const upgraded of [false, true]) for (const focus of [false, true])
      audits.push({family: context.family, difficulty: context.difficulty, ...cardAudit(x, c.id, upgraded, focus),
        before: cardAudit(before, c.id, upgraded, focus), provenance: x.provenance, previousProvenance: before.provenance});
    screens[label] = B.screen(x.data.cards);
    contracts.push({context: label, rows: require('./contracts.cjs').runContracts(loadRuntime(context))});
    artifacts.push({context: label, rows: require('./artifacts.cjs').probeRuntime(loadRuntime(context))});
    for (const [id, e] of Object.entries(x.C.enemies)) {
      const r = D.create(x, {seed: 261024002, enemy: id});
      enemies.push({context: label, id, name: e.name, sourceHp: e.hp, startingHp: r.battle.hp,
        defense: r.battle.enemyDefense || 0, patterns: e.patterns, lockedIntent: r.battle.currentIntent,
        seals: e.seals || [], profile: x.C.COMBAT_BALANCE?.profile || null,
        note: 'Numeric/pattern audit. Whole-run and per-enemy outcome cohorts are separate.'});
    }
  }
  const snap = captureSources();
  const result = {sourceHash: snap.hash, audits, screens, contracts, artifacts, enemies};
  fs.writeFileSync(path.join(output, 'audit.json.gz'), z.gzipSync(JSON.stringify(result), {level: 9}));
  const sourceFile = 'sources-' + snap.hash + '.json.gz';
  if (!fs.existsSync(path.join(output, sourceFile))) fs.writeFileSync(path.join(output, sourceFile), z.gzipSync(JSON.stringify(snap.sources), {level: 9}));
  fs.writeFileSync(path.join(output, 'audit-summary.json'), JSON.stringify({sourceHash: snap.hash, sourceFile,
    auditRows: audits.length, cardFailures: audits.filter(r => r.error || !r.actual.valid || r.before.error || !r.before.actual.valid).length,
    screens: Object.fromEntries(Object.entries(screens).map(([k, rs]) => [k, {distinct: rs.filter(r => !r.sameCard).length, duplicates: rs.filter(r => r.sameCard).length}])),
    contracts: contracts.map(c => ({context: c.context, count: c.rows.length, failures: c.rows.filter(r => r.status !== 'PASS')})),
    artifacts: artifacts.map(c => ({context: c.context, count: c.rows.length, failures: c.rows.filter(r => r.status !== 'PASS').map(r => ({id: r.id, name: r.name, error: r.error}))}))
  }, null, 2) + '\n');
  console.log(fs.readFileSync(path.join(output, 'audit-summary.json'), 'utf8'));
  return result;
}
if (require.main === module) run(process.env.STM_RECHECK_OUT || DEFAULT_OUT);
module.exports = {cardAudit, run};
