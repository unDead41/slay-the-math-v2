'use strict';

const fs = require('node:fs'), path = require('node:path'), z = require('node:zlib');
const assert = require('node:assert/strict');
const {sha256, loadRuntime} = require('./runtime.cjs');
const {DEFAULT_OUT} = require('./run.cjs');
const {interval} = require('../combat.cjs');
const {encounters} = require('./execute.cjs');
const COHORTS = ['icp', 'focus', 'pairs', 'triads', 'triads_reverse', 'evolved', 'roster', 'clusters', 'reload', 'revision', 'campaign', 'ordinary_campaign', 'followup', 'focus_followup', 'artifact_gate'];
const json = (dir, name) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
const context = r => r.family === 'ordinary' ? 'ordinary' : 'master/' + r.difficulty;
const terminal = r => ['WIN', 'LOSS', 'VICTORY', 'DEFEAT'].includes(r.status);
const win = r => ['WIN', 'VICTORY'].includes(r.status);
const field = value => value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : value;
function csv(dir, name, rows) {
  if (!rows.length) return;
  const keys = [...new Set(rows.flatMap(Object.keys))];
  const esc = v => '"' + String(field(v)).replaceAll('"', '""') + '"';
  fs.writeFileSync(path.join(dir, name), [keys.map(esc).join(','), ...rows.map(r => keys.map(k => esc(r[k])).join(','))].join('\n') + '\n');
}
function readRows(dir, cohort, consume) {
  const manifest = json(dir, cohort + '-manifest.json'), parts = json(dir, cohort + '-parts.json');
  const source = JSON.parse(z.gunzipSync(fs.readFileSync(path.join(dir, manifest.sourceFile))));
  assert.equal(sha256(JSON.stringify(source)), manifest.sourceHash, 'Source snapshot integrity');
  const indices = new Set();
  for (const part of parts) {
    const bytes = fs.readFileSync(path.join(dir, part.file));
    assert.equal(sha256(bytes), part.sha256, part.file);
    assert.equal(bytes.length, part.bytes, 'Raw byte count');
    const lines = z.gunzipSync(bytes).toString('utf8').trim().split('\n');
    assert.equal(lines.length, part.count);
    const actual = {nEncounters: 0, invalid: 0, censored: 0, mismatches: 0};
    for (const line of lines) {
      const r = JSON.parse(line), {result, ...task} = r;
      assert.ok(!indices.has(r.index)); indices.add(r.index);
      assert.deepEqual(task, manifest.tasks[r.index], 'Task does not match manifest');
      const es = encounters(result);
      actual.nEncounters += es.length;
      actual.invalid += result.status === 'INVALID_POLICY_OR_ENGINE' ? 1 : es.filter(v => v.status === 'INVALID_POLICY_OR_ENGINE').length;
      actual.censored += result.status === 'BENCHMARK_LIMIT_CENSORED' ? 1 : es.filter(v => v.status === 'BENCHMARK_LIMIT_CENSORED').length;
      actual.mismatches += result.status === 'MISMATCH';
      for (const v of es) if (terminal(v)) {assert.ok(Number.isFinite(v.utility));assert.notEqual(v.validFinal, false);}
      consume(r);
    }
    for (const [k, value] of Object.entries(actual)) assert.equal(value, part[k], 'Worker counter ' + part.file + ':' + k);
  }
  assert.equal(indices.size, manifest.tasks.length);
  return {cohort, tasks: indices.size, encounters: parts.reduce((n, p) => n + p.nEncounters, 0),
    invalid: parts.reduce((n, p) => n + p.invalid, 0), censored: parts.reduce((n, p) => n + p.censored, 0),
    mismatches: parts.reduce((n, p) => n + p.mismatches, 0), sourceHash: manifest.sourceHash};
}
function contrast(u) {
  const k = Math.log2(u.length);
  return u.reduce((sum, v, mask) => sum + (mask.toString(2).replaceAll('0', '').length % 2 === k % 2 ? v : -v), 0);
}
function measured(rs) {
  const ok = rs.every(v => v.valid);
  return {n: rs.length, status: ok ? 'CONTEXTUAL_MEASURED' : 'UNRANKED_CENSORED_OR_INVALID',
    total: ok ? interval(rs.map(v => v.total)) : null, interaction: ok ? interval(rs.map(v => v.interaction)) : null,
    thirdOrder: ok && rs[0].thirdOrder != null ? interval(rs.map(v => v.thirdOrder)) : null,
    totalSynergy: ok && rs[0].totalSynergy != null ? interval(rs.map(v => v.totalSynergy)) : null,
    invalidOrCensoredSeeds: rs.filter(v => !v.valid).length};
}
function wilson(w, n) {
  if (!n) return null;
  const a = 1.96 ** 2, d = 1 + a / n, c = (w / n + a / (2 * n)) / d;
  const h = 1.96 * Math.sqrt(w / n * (1 - w / n) / n + a / (4 * n * n)) / d;
  return {low: c - h, high: c + h};
}

function analyse(dir = DEFAULT_OUT) {
  const audit = JSON.parse(z.gunzipSync(fs.readFileSync(path.join(dir, 'audit.json.gz'))));
  const aSummary = json(dir, 'audit-summary.json'), x = loadRuntime();
  assert.equal(audit.sourceHash, aSummary.sourceHash);
  assert.equal(sha256(z.gunzipSync(fs.readFileSync(path.join(dir, aSummary.sourceFile)))), audit.sourceHash);
  const names = Object.fromEntries(x.data.cards.map(c => [c.id, c.name]));
  const summary = {audit: aSummary, coverage: [], power: [], focus: [], focusFollowup: [], outcomes: [], usage: [], reload: {pairs: 0, matches: 0, mismatches: 0, boundaries: 0},
    policies: {prepared: 'recheck-visible-phase-greedy-1', masterCampaign: 'sampled-turn-search-2/{skill}',
      ordinaryCampaign: 'recheck-visible-phase-greedy-1 + mechanic deck policy, Mystery declined'}, pupilWinRatesMeasured: false};
  const powers = new Map(), outcomes = new Map(), usage = new Map(), focus = new Map(), focusFollowup = new Map(), pairExposure = [];
  const addUsage = (r, v) => {
    const cards = v.effects?.cards || v.ai?.cards;
    if (!cards) return;
    for (const [key, data] of Object.entries(cards)) {
      const id = context(r) + '|' + key;
      if (!usage.has(id)) usage.set(id, {context: context(r), card: key, name: names[key] || key, observations: 0});
      const row = usage.get(id); row.observations++;
      for (const [k, value] of Object.entries(data)) if (Number.isFinite(value)) row[k] = (row[k] || 0) + value;
    }
  };
  const outcome = (r, v, extra = {}) => {
    const key = JSON.stringify({cohort: r.cohort, context: context(r), enemy: r.enemy, archetype: r.archetype,
      size: r.size, upgradeRate: r.upgradeRate, predict: r.predict || r.predictProfile, skill: r.skill, route: r.route || r.routePolicy,
      ...(r.artifactOracle !== undefined ? {artifactOracle: r.artifactOracle} : {}), ...extra});
    if (!outcomes.has(key)) outcomes.set(key, {...JSON.parse(key), n: 0, wins: 0, losses: 0, censored: 0, invalid: 0, turns: 0, hp: 0, enemyHp: 0, enemyHpObserved: 0, energy: 0, focus: 0, stage2: 0});
    const g = outcomes.get(key); g.n++; g.wins += win(v); g.losses += ['LOSS', 'DEFEAT'].includes(v.status);
    g.censored += v.status === 'BENCHMARK_LIMIT_CENSORED'; g.invalid += v.status === 'INVALID_POLICY_OR_ENGINE';
    // Canonical Master room.playerTurns counts completed turn resets; the
    // distinct Predict opportunities observe actual entered player turns.
    g.turns += v.encounters ? v.encounters.reduce((n, e) => n + (e.final?.turn || 0), 0)
      : v.metrics?.predict?.opportunities ?? v.final?.turn ?? v.playerTurns ?? 0;
    g.hp += v.final?.playerHp ?? v.final?.hp ?? v.finalHp ?? 0;
    if (Number.isFinite(v.final?.enemyHp)) {g.enemyHp += v.final.enemyHp;g.enemyHpObserved++;}
    g.energy += v.encounters ? v.encounters.reduce((n, e) => n + e.energySpent, 0) : v.energySpent ?? v.ai?.energySpent ?? 0;
    g.focus += v.encounters ? v.encounters.reduce((n, e) => n + e.focusSpent, 0) : v.focusSpent ?? v.ai?.focusSpent ?? 0;
    g.stage2 += !!v.stages?.[1]?.reached || v.stage === 1;
  };
  const fkey = r => [context(r), r.enemy, r.cards[0], r.upgraded, r.seed].join('|');
  for (const cohort of COHORTS) {
    const dataDir = cohort === 'focus' ? path.join(dir, 'focus-reviewed') : dir;
    if (!fs.existsSync(path.join(dataDir, cohort + '-parts.json'))) continue;
    let extraMysteryCombats = 0;
    const cover = readRows(dataDir, cohort, r => {
      const v = r.result;
      if (cohort === 'campaign' || cohort === 'artifact_gate') extraMysteryCombats += (v.rooms || []).filter(room => room.roomType === 'event' && room.predict?.opportunities > 0).length;
      if (['icp', 'pairs', 'triads', 'triads_reverse', 'revision', 'followup'].includes(cohort)) {
        if (cohort === 'revision') {
          const before = v.variants.filter(a => a.revision === 'before').map(a => a.result), after = v.variants.filter(a => a.revision === 'after').map(a => a.result);
          assert.deepEqual(v.variants.filter(a => a.revision === 'before').map(a => a.mask).sort(), [0, 1]);
          assert.deepEqual(v.variants.filter(a => a.revision === 'after').map(a => a.mask).sort(), [0, 1]);
          const valid = [...before, ...after].every(terminal), key = JSON.stringify({kind: 'revision', context: context(r), cards: r.cards, enemy: r.enemy, upgraded: r.upgraded});
          const g = powers.get(key) || {meta: JSON.parse(key), rows: []};
          g.rows.push({valid, total: valid ? after[1].utility - before[1].utility : null,
            interaction: valid ? (after[1].utility - after[0].utility) - (before[1].utility - before[0].utility) : null}); powers.set(key, g);
        } else {
          const variants = v.variants.slice().sort((a, b) => a.mask - b.mask), values = variants.map(a => a.result), u = values.map(a => a.utility);
          assert.deepEqual(variants.map(a => a.mask), Array.from({length: 2 ** r.cards.length}, (_, i) => i), 'Missing/duplicate factorial cell');
          const valid = values.every(terminal), k = r.cards.length;
          const key = JSON.stringify({kind: cohort, context: context(r), cards: r.cards, enemy: r.enemy, upgraded: r.upgraded,
            ...(cohort === 'icp' ? {focused: r.focused} : {order: r.order})});
          const g = powers.get(key) || {meta: JSON.parse(key), rows: []};
          g.rows.push({valid, total: valid ? u.at(-1) - u[0] : null, interaction: valid ? contrast(u) : null,
            ...(k === 3 ? {thirdOrder: valid ? contrast(u) : null, totalSynergy: valid ? u[7] - u[1] - u[2] - u[4] + 2 * u[0] : null} : {})}); powers.set(key, g);
          if (cohort === 'icp') {
            const f = focus.get(fkey(r)) || {...JSON.parse(key), seed: r.seed};
            f[r.focused ? 'target' : 'elsewhere'] = {status: values[1].status, utility: values[1].utility, spent: values[1].focusSpent, targetSpent: values[1].order?.[0]?.focus || 0,
              predictFocus: values[1].predict.focus, played: values[1].orderComplete}; focus.set(fkey(r), f);
          }
          if (cohort !== 'icp') pairExposure.push({kind: cohort, context: context(r), cards: r.cards, enemy: r.enemy, upgraded: r.upgraded,
            order: r.order, seed: r.seed, completedMasks: values.filter(a => a.orderComplete).length, sameTurnMasks: values.filter(a => a.sameTurnOrder).length,
            masks: values.map(a => ({complete: a.orderComplete, sameTurn: a.sameTurnOrder, order: a.order, status: a.status, hp: a.final?.playerHp, enemyHp: a.final?.enemyHp}))});
        }
        for (const a of v.variants) if (a.revision !== 'before') addUsage(r, a.result);
      } else if (cohort === 'focus') {
        const f = focus.get(fkey(r)) || {context: context(r), cards: r.cards, enemy: r.enemy, upgraded: r.upgraded, seed: r.seed};
        f.never = {status: v.status, utility: v.utility, spent: v.focusSpent, targetSpent: v.order?.[0]?.focus || 0, predictFocus: v.predict.focus}; focus.set(fkey(r), f); addUsage(r, v);
      } else if (cohort === 'focus_followup') {
        const arms = Object.fromEntries(v.variants.map(a => [a.policy, a.result]));
        const key = JSON.stringify({context: context(r), cards: r.cards, enemy: r.enemy, upgraded: r.upgraded});
        const g = focusFollowup.get(key) || {meta: JSON.parse(key), rows: []};
        g.rows.push(arms);focusFollowup.set(key, g);
      } else if (cohort === 'reload') {
        summary.reload.pairs++; summary.reload.matches += v.status === 'MATCH'; summary.reload.mismatches += v.status !== 'MATCH'; summary.reload.boundaries += v.reloaded.reloads;
      } else if (cohort === 'clusters') {
        for (const a of v.variants) {outcome(r, a.result, {cluster: r.cluster, mask: a.mask}); addUsage(r, a.result);}
        const a = v.variants.map(a => a.result), valid = a.every(terminal), key = JSON.stringify({kind: 'artifact_marginal', context: context(r), cluster: r.cluster, predict: r.predictProfile});
        const g = powers.get(key) || {meta: JSON.parse(key), rows: []};g.rows.push({valid, total: valid ? a[1].utility - a[0].utility : null, interaction: valid ? a[1].utility - a[0].utility : null});powers.set(key, g);
      } else {
        outcome(r, v); addUsage(r, v);
        if (cohort === 'ordinary_campaign') for (const e of v.encounters || []) addUsage(r, e);
      }
    });
    cover.workerCounterEncounters = cover.encounters;
    cover.extraMysteryCombats = extraMysteryCombats;
    cover.encounters += extraMysteryCombats;
    summary.coverage.push(cover);
  }
  summary.power = [...powers.values()].map(g => ({...g.meta, cardNames: g.meta.cards?.map(k => names[k]), ...measured(g.rows)}));
  const focusGroups = new Map();
  for (const row of focus.values()) {
    const key = [row.context, row.enemy, row.cards[0], row.upgraded].join('|'), g = focusGroups.get(key) || {context: row.context, enemy: row.enemy,
      card: row.cards[0], name: names[row.cards[0]], upgraded: row.upgraded, rows: []};
    g.rows.push(row);focusGroups.set(key, g);
  }
  summary.focus = [...focusGroups.values()].map(g => {
    const all = g.rows.every(r => r.target && r.elsewhere && terminal(r.target) && terminal(r.elsewhere)), nonPassive = !g.card.includes('.passive.');
    const never = nonPassive && g.rows.every(r => r.never && terminal(r.never));
    return {...Object.fromEntries(Object.entries(g).filter(([k]) => k !== 'rows')), n: g.rows.length,
      targetFocusEligible: nonPassive, status: all ? 'CONTEXTUAL_MEASURED' : 'UNRANKED_CENSORED_OR_INVALID',
      opportunityDelta: all ? interval(g.rows.map(r => r.target.utility - r.elsewhere.utility)) : null,
      targetVsNever: all && never ? interval(g.rows.map(r => r.target.utility - r.never.utility)) : null,
      reserveVsNever: all && never ? interval(g.rows.map(r => r.elsewhere.utility - r.never.utility)) : null,
      targetSpent: g.rows.map(r => r.target?.targetSpent ?? null), elsewhereSpent: g.rows.map(r => r.elsewhere?.spent ?? null),
      actualPredictFocus: g.rows.map(r => r.target?.predictFocus ?? null)};
  });
  summary.focusFollowup = [...focusFollowup.values()].map(g => {
    const valid = g.rows.every(r => Object.values(r).every(terminal));
    return {...g.meta, name: names[g.meta.cards[0]], n: g.rows.length, status: valid ? 'CONTEXTUAL_MEASURED' : 'UNRANKED_CENSORED_OR_INVALID',
      opportunityDelta: valid ? interval(g.rows.map(r => r.target.utility - r.elsewhere.utility)) : null,
      targetVsNever: valid ? interval(g.rows.map(r => r.target.utility - r.never.utility)) : null,
      targetWins: g.rows.filter(r => win(r.target)).length, reserveWins: g.rows.filter(r => win(r.elsewhere)).length,
      neverWins: g.rows.filter(r => win(r.never)).length,
      targetSpent: g.rows.reduce((n, r) => n + r.target.focusSpent, 0), reserveSpent: g.rows.reduce((n, r) => n + r.elsewhere.focusSpent, 0)};
  });
  summary.outcomes = [...outcomes.values()].map(g => ({...g, allCaseWinRate: g.wins / g.n,
    censorWinBounds: [g.wins / g.n, (g.wins + g.censored) / g.n],
    wilsonAllCases: g.censored || g.invalid ? null : wilson(g.wins, g.n), wilsonTerminalOnly: wilson(g.wins, g.wins + g.losses),
    meanTurns: g.turns / g.n, meanHp: g.hp / g.n, meanEnemyHp: g.enemyHpObserved ? g.enemyHp / g.enemyHpObserved : null, meanEnergy: g.energy / g.n, meanFocus: g.focus / g.n}));
  summary.usage = [...usage.values()];
  summary.totals = Object.fromEntries(['tasks', 'encounters', 'invalid', 'censored', 'mismatches'].map(k => [k, summary.coverage.reduce((n, c) => n + c[k], 0)]));
  fs.writeFileSync(path.join(dir, 'SUMMARY.json'), JSON.stringify(summary, null, 2) + '\n');
  fs.writeFileSync(path.join(dir, 'order-exposure.json.gz'), z.gzipSync(JSON.stringify(pairExposure), {level: 9}));
  csv(dir, 'ICP-CCP.csv', summary.power.map(r => ({...r, total_U: r.total?.mean, interaction_U: r.interaction?.mean,
    thirdOrder_U: r.thirdOrder?.mean, totalSynergy_U: r.totalSynergy?.mean})));
  csv(dir, 'Focus-value.csv', summary.focus);
  csv(dir, 'Focus-followup.csv', summary.focusFollowup);
  csv(dir, 'outcomes.csv', summary.outcomes);
  csv(dir, 'actual-support-usage.csv', summary.usage);
  csv(dir, '40-cards-before-after-all-states.csv', audit.audits.map(r => ({context: r.family === 'ordinary' ? 'ordinary' : 'master/' + r.difficulty,
    card: r.key, name: r.name, category: r.category, state: r.state, requestedFocus: r.requestedFocus, eligibleFocus: r.eligibleFocus,
    beforeEnergy: r.before.plan.payEnergy, afterEnergy: r.plan.payEnergy, beforeFocus: r.before.plan.payFocus, afterFocus: r.plan.payFocus,
    beforeValues: r.before.plan.values, afterValues: r.plan.values, beforeActions: r.before.plan.actions, afterActions: r.plan.actions,
    beforeActual: r.before.actual, afterActual: r.actual, beforeDefinition: r.before.definition, afterDefinition: r.definition, contextNotes: r.context})));
  csv(dir, 'pair-screen-820.csv', audit.screens.ordinary.map((r, i) => ({a: r.a, b: r.b, sameCard: r.sameCard,
    ordinaryTags: r.tags, masterTags: audit.screens['master/medium'][i].tags, screenStatus: 'STATIC_RULE_SCREEN_ONLY', ICP: null, CCP: null})));
  csv(dir, 'enemy-runtime-audit.csv', audit.enemies);
  console.log(JSON.stringify({totals: summary.totals, reload: summary.reload, cohorts: summary.coverage.map(c => c.cohort)}));
  return summary;
}
if (require.main === module) analyse(process.env.STM_RECHECK_OUT || DEFAULT_OUT);
module.exports = {analyse, readRows, measured, contrast, csv};
