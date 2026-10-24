'use strict';

const assert = require('node:assert/strict');
const D = require('../deep.cjs');
const {createAgent} = require('../../ai-playtester/agent.cjs');
const {createEffectsTracker} = require('../../ai-playtester/effects.cjs');
const copy = value => JSON.parse(JSON.stringify(value));

function incoming(x, r) {
  const projected = {...r, battle: {...r.battle, cardCombat: {...r.battle.cardCombat, statuses: copy(r.battle.cardCombat.statuses)}}};
  const it = r.battle.currentIntent;
  let n = 0;
  for (let i = 0; i < (it.hits || 1); i++) n += x.CC.enemyDamage(projected, it.damage || 0).amount;
  return Math.max(0, n - r.battle.block);
}
// An explicitly declared action heuristic, never an ICP/CCP measurement.
function merit(x, r, p, incomingNow) {
  let draw = 0, selection = 0, delayed = 0, block = 0, weak = 0;
  for (const a of p.actions) {
    if (a.op === 'grant_block' && !a.timing) block += a.value;
    if (a.op === 'apply_status' && a.status === 'weak' && a.target !== 'self') weak += a.value;
    if (a.op === 'draw' && !a.timing) draw += a.value;
    if (a.timing) delayed += a.value || 0;
    if (['search_category', 'look_choose_reorder', 'look_choose_discard', 'look_replace_take', 'return_discard_card'].includes(a.op)) selection++;
  }
  const damage = p.damageEvents.reduce((n, e) => n + e.hpLost, 0);
  let incomingAfter = Math.max(0, incomingNow - block);
  if (weak) {
    const statuses = copy(r.battle.cardCombat.statuses);
    statuses.enemy.weak = Math.min(3, statuses.enemy.weak + weak);
    incomingAfter = incoming(x, {...r, battle: {...r.battle, block: r.battle.block + block,
      cardCombat: {...r.battle.cardCombat, statuses}}});
  }
  const prevented = Math.max(0, incomingNow - incomingAfter);
  const setup = p.card.category === 'passive' ? (r.battle.hp > 20 ? 7 : 1) : 0;
  return damage + prevented * (r.hp <= incomingNow ? 3 : 1.5) + setup
    + Math.min(draw, x.C.HAND_LIMIT - p.context.handAfterPlay) * (p.context.energy > p.payEnergy ? 2.2 : .5)
    + selection * 2 + delayed * .7 - .15 * p.payEnergy - .1 * p.payFocus
    + (damage >= r.battle.hp ? 1000 : 0);
}
function legalOptions(x, r) {
  const options = [], incomingNow = incoming(x, r);
  for (const c of r.battle.hand) for (const focus of [false, true]) {
    if (focus && (!r.battle.focus || r.battle.boostUsed)) continue;
    const p = x.E.cardPlan({...r, battle: {...r.battle, boostArmed: focus}}, c);
    if (p?.legal && (!focus || p.focused)) options.push({uid: c.uid, focus, merit: merit(x, r, p, incomingNow)});
  }
  return options.sort((a, b) => b.merit - a.merit || Number(a.focus) - Number(b.focus) || a.uid.localeCompare(b.uid));
}

// Only named outcome units enter U. Support units remain separate observations.
function utility(status, r) {
  return ['WIN', 'LOSS'].includes(status)
    ? 100 * (status === 'WIN') + 20 * (status === 'LOSS' ? 0 : r.hp / r.maxHp) - Math.min(10, r.battle.turn / 2)
    : null;
}
function mechanical(r) {
  return {deck: r.deck, rng: r.rng, seq: r.seq, hp: r.hp, maxHp: r.maxHp, stats: r.stats,
    education: r.educationState, artifact: r.artifactState, economy: r.economyState,
    battle: {...r.battle, log: [], currentIntent: {...r.battle.currentIntent, label: ''}}};
}

function simulate(x, input = {}) {
  const o = {seed: 1, enemy: 'dealer', predictProfile: 'developing', skill: 'intermediate',
    focusPolicy: 'best', maxCycles: 100, maxPlays: 500, maxWork: 10000, ...input};
  const E = x.E, m = {predict: D.meter().predict, plays: 0, energySpent: 0, focusSpent: 0,
    energyUnspent: 0, work: 0, choices: 0, reloads: 0, cards: {}, order: [], timeline: [], artifacts: {}};
  const oldNow = Date.now;
  Date.now = () => 1792800000000 + m.work * 1000;
  let r, tracker, firstTargetPlayed = false, lastTurn = 0, cycles = 0, last = 'create';
  const exhausted = new Set();
  const originalRecord = x.R.record;
  let acting = false;
  x.R.record = function (...args) {
    const event = originalRecord(...args);
    if (acting && event) for (const id of event.artifactIds) m.artifacts[id] = (m.artifacts[id] || 0) + 1;
    return event;
  };
  function act(fn) {
    m.work++;
    acting = true;
    try { return tracker ? tracker.capture(r, fn) : fn(); }
    finally { acting = false; }
  }
  function check(label) {
    const b = r.battle;
    const all = ['hand', 'draw', 'discard', 'exhaust', 'active', 'resolving'].flatMap(k => b[k] || [])
      .concat(b.cardChoice?.committed ? b.cardChoice.candidates : []);
    assert.equal(all.length, r.deck.length, 'UID conservation');
    assert.equal(new Set(all.map(c => c.uid)).size, r.deck.length, 'Duplicate UID');
    assert.ok(b.hand.length <= x.C.HAND_LIMIT && b.active.length <= x.C.PASSIVE_LIMIT);
    assert.equal(new Set(b.active.map(c => c.key)).size, b.active.length);
    assert.ok(b.energy >= 0 && b.energy <= E.energyLimit(r) && b.focus >= 0 && b.focus <= x.C.FOCUS_CAP);
    // Card transactions already validate before and after the paid commit.
    if (['start', 'predict', 'end-turn'].includes(label)) assert.ok(E.validate(r), 'Invalid ' + label);
    for (const uid of exhausted) assert.ok(r.battle.exhaust.some(c => c.uid === uid), 'Exhaust UID re-entered: ' + uid);
    for (const c of r.battle.exhaust) exhausted.add(c.uid);
    if (o.reload) {
      const saved = E.restore(copy(r));
      assert.ok(saved, 'Restore failed at ' + label);
      assert.deepEqual(mechanical(saved), mechanical(r), 'Reload changed mechanics at ' + label);
      for (const key of Object.keys(r)) delete r[key];
      Object.assign(r, saved);
      m.reloads++;
    }
  }
  try {
    // The historical fixture defaults to a non-Elite start. Route Elite flags
    // must reach the real start API on its first call (no second Die roll).
    const startBattle = E.startBattle;
    if (o.elite && !o.fromRun) E.startBattle = (run, id) => startBattle(run, id, true);
    try { r = act(() => D.create(x, o)); }
    finally { E.startBattle = startBattle; }
    if (o.order?.length) {
      const b = r.battle, handSize = Math.max(b.hand.length, o.order.length), all = [...b.hand, ...b.draw];
      b.hand = [];
      for (const slot of o.order) {
        const uid = r.deck[slot].uid, index = all.findIndex(c => c.uid === uid);
        assert.ok(index >= 0, 'Requested physical opening instance unavailable');
        b.hand.push(all.splice(index, 1)[0]);
      }
      while (b.hand.length < handSize && all.length) b.hand.push(all.pop());
      b.draw = all;
    }
    tracker = createEffectsTracker(x);
    check('start');
    const initial = D.snapshot(r), targetUid = r.deck[o.targetSlot || 0].uid;
    const orderedUids = (o.order || []).map(i => r.deck[i].uid);
    const completed = new Set();
    const agent = createAgent(x, {skill: o.skill});
    while (r.scene === 'battle') {
      if (cycles >= o.maxCycles || m.plays >= o.maxPlays || m.work >= o.maxWork) break;
      if (lastTurn !== r.battle.turn) {
        lastTurn = r.battle.turn;
        m.timeline.push(D.snapshot(r));
        last = 'predict';
        act(() => D.predictOne(x, r, o, m, check));
        check('predict');
      }
      let decision;
      // The reusable intermediate policy uses current engine incoming-damage rules.
      // Force a requested physical-card order only when legal; never grant Energy.
      if (o.skill === 'intermediate') {
        const options = legalOptions(x, r);
        m.work += r.battle.hand.length * 2;
        const focusAllowed = v => {
          if (!v.focus) return true;
          if (o.focusPolicy === 'never') return false;
          if (o.focusPolicy === 'elsewhere') return v.uid !== targetUid;
          if (o.focusPolicy === 'target' && !firstTargetPlayed) return v.uid === targetUid;
          return true;
        };
        const next = orderedUids.find(uid => !completed.has(uid));
        let legal = options.filter(focusAllowed).filter(v => !orderedUids.includes(v.uid) || completed.has(v.uid) || v.uid === next);
        const forced = next && legal.filter(v => v.uid === next);
        if (forced?.length) {
          // A requested Focus arm really spends on the first target when eligible.
          decision = o.focusPolicy === 'target' && next === targetUid && !firstTargetPlayed
            ? forced.find(v => v.focus) || forced[0] : forced[0];
        } else decision = legal.find(v => v.merit > 0);
        decision = decision ? {kind: 'play', uid: decision.uid, focus: decision.focus} : {kind: 'endTurn'};
      } else decision = agent.decide(r);
      if (decision.kind === 'endTurn') {
        last = 'end-turn';
        m.energyUnspent += r.battle.energy;
        act(() => E.endTurn(r));
        cycles++;
        check(last);
        continue;
      }
      if (!!r.battle.boostArmed !== decision.focus) act(() => E.armFocus(r));
      check('focus');
      const before = r.stats.cardsPlayed, turn = r.battle.turn;
      last = 'play:' + r.battle.hand.find(c => c.uid === decision.uid)?.key;
      act(() => E.playCard(r, decision.uid));
      check('play-or-prechoice');
      while (E.cardChoice(r)) {
        if (m.work >= o.maxWork) throw Object.assign(Error('Committed choice work limit'), {censored: true});
        const value = agent.choose(r);
        act(() => E.chooseCardOption(r, value));
        m.choices++;
        check('choice');
      }
      assert.equal(r.stats.cardsPlayed, before + 1, 'A selected card must commit exactly once');
      const tx = r.battle.cardCombat.receipts.at(-1);
      m.plays++;
      m.energySpent += tx.energy;
      m.focusSpent += tx.focus;
      const card = m.cards[tx.key] ||= {plays: 0, energy: 0, focus: 0, firstTurn: turn};
      card.plays++; card.energy += tx.energy; card.focus += tx.focus;
      if (decision.uid === targetUid) firstTargetPlayed = true;
      if (orderedUids.includes(decision.uid) && !completed.has(decision.uid)) {
        completed.add(decision.uid);
        m.order.push({uid: decision.uid, key: tx.key, turn, energy: tx.energy, focus: tx.focus});
      }
    }
    const status = r.scene === 'battle' ? 'BENCHMARK_LIMIT_CENSORED' : r.scene === 'defeat' ? 'LOSS' : 'WIN';
    const effects = tracker.snapshot();
    assert.equal(effects.totals.energySpent, m.energySpent);
    assert.equal(effects.totals.focusSpent, m.focusSpent);
    return {status, utility: utility(status, r), initial, final: D.snapshot(r), finalRng: r.rng,
      finalArtifactRng: r.artifactState?.rng, validFinal: E.validate(r), ...m, effects,
      exhaustedEver: [...exhausted], requestedOrder: o.order || [], orderComplete: completed.size === orderedUids.length,
      sameTurnOrder: completed.size === orderedUids.length && new Set(m.order.map(v => v.turn)).size === 1,
      ...(o.returnRun ? {run: copy(r)} : {})};
  } catch (error) {
    return {status: error.censored ? 'BENCHMARK_LIMIT_CENSORED' : 'INVALID_POLICY_OR_ENGINE',
      utility: null, error: error.stack, last, ...m, final: r?.battle ? D.snapshot(r) : null};
  } finally {
    tracker?.dispose();
    x.R.record = originalRecord;
    Date.now = oldNow;
  }
}

function comparable(v) {
  const {reloads, work, ...out} = v;
  return JSON.parse(JSON.stringify(out));
}

module.exports = {simulate, comparable, mechanical, utility, legalOptions};
