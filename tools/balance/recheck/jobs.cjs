'use strict';

const selected = require('../specs/selected-combo-tests.json');
const B = require('../combat.cjs');
const F = require('../decks.cjs');
const {loadRuntime} = require('./runtime.cjs');
const S = 'stm.', ref = S + 'attack.rune_strike';
const CONTEXTS = [{family: 'ordinary', difficulty: 'medium'}, ...['easy', 'medium', 'hard'].map(difficulty => ({family: 'master', difficulty}))];
const POWER = [CONTEXTS[0], CONTEXTS[2]];
const BASE_SEED = 261024100;
const keys = loadRuntime().data.cards.map(c => c.id);
const extra = [
  ['attack.weak_point', 'attack.rune_strike'], ['attack.weak_point', 'attack.fate_storm'],
  ['attack.weak_point', 'attack.weak_point'], ['defend.cinder_guard', 'defend.layered_shield'],
  ['defend.cinder_guard', 'defend.cinder_guard'], ['skill.mana_reading', 'skill.deep_study'],
  ['passive.rune_armor', 'passive.last_ember'], ['passive.growing_flame', 'passive.growing_flame'],
  ['passive.battle_rhythm', 'passive.battle_rhythm']
].map(p => p.map(k => S + k));
const pairs = [...selected.pairs.map(p => [p.a, p.b]), ...extra];
const revisions = ['Weak Point', 'Cinder Guard', 'Growing Flame', 'Battle Rhythm', 'Mana Reading', 'Deep Study',
  'Burning Page', 'Rune Armor', 'Clear Mind', 'Card Search', 'Last Ember', 'Twin Shot'];

function replacement(cards, mask, upgraded) {
  return [...cards.map((key, i) => ({key: mask >> i & 1 ? key : ref, upgraded})),
    ...B.baseDeck().slice(0, 12 - cards.length).map(key => ({key, upgraded: false}))];
}
function jobs(cohort) {
  const out = [];
  const add = (context, fields) => out.push({index: out.length, cohort, ...context, ...fields});
  if (cohort === 'icp' || cohort === 'focus') {
    for (const context of POWER) for (const enemy of ['wisp', 'dealer']) for (const key of keys) {
      if (cohort === 'focus' && key.includes('.passive.')) continue;
      for (const upgraded of [false, true]) for (let n = 0; n < 5; n++) {
        for (const focused of cohort === 'icp' ? [false, true] : [false]) add(context,
          {cards: [key], enemy, upgraded, focused, seed: BASE_SEED + n});
      }
    }
  } else if (cohort === 'pairs') {
    for (const context of POWER) for (const enemy of ['wisp', 'dealer']) for (const cards of pairs)
      for (const upgraded of [false, true]) for (const order of [[0, 1], [1, 0]]) for (let n = 0; n < 3; n++)
        add(context, {cards, enemy, upgraded, order, seed: BASE_SEED + 100 + n,
          selection: pairs.indexOf(cards) < 30 ? 'SOR Lite 30' : 'current revision risk extension'});
  } else if (cohort === 'triads' || cohort === 'triads_reverse') {
    for (const context of POWER) for (const enemy of ['wisp', 'dealer']) for (const triad of selected.triads)
      for (const upgraded of [false, true]) for (const order of cohort === 'triads' ? [[0, 1, 2]] : [[2, 1, 0]]) for (let n = 0; n < 3; n++)
        add(context, {cards: triad.ids, enemy, upgraded, order, seed: BASE_SEED + 200 + n});
  } else if (cohort === 'evolved') {
    for (const context of CONTEXTS) for (const archetype of Object.keys(F.pools)) for (const size of [10, 18, 30])
      for (const upgradeRate of [0, .75]) for (const predictProfile of ['independent', 'struggling', 'skip']) for (let n = 0; n < 3; n++)
        add(context, {enemy: 'dealer', archetype, size, upgradeRate, predictProfile, seed: BASE_SEED + 300 + n});
  } else if (cohort === 'roster') {
    for (const context of CONTEXTS) for (const enemy of Object.keys(loadRuntime(context).C.enemies))
      for (const archetype of ['attack', 'block', 'focus']) for (const predictProfile of ['independent', 'struggling']) for (let n = 0; n < 3; n++)
        add(context, {enemy, archetype, size: 18, upgradeRate: .33, predictProfile, seed: BASE_SEED + 400 + n});
  } else if (cohort === 'clusters') {
    const clusters = [
      {cluster: 'strength_multihit', archetype: 'attack', base: ['e15'], extra: 'b02'},
      {cluster: 'agility_layered_carry', archetype: 'block', base: ['e16'], extra: 'b02'},
      {cluster: 'free_exhaust_abacus', archetype: 'draw', base: ['e05', 's11', 'b01'], extra: 'e01'},
      {cluster: 'draw_ward', archetype: 'draw', base: ['s10', 'e10'], extra: 'b03'},
      {cluster: 'focus_core', archetype: 'focus', base: ['e10', 'b03'], extra: 's04'}
    ];
    for (const context of CONTEXTS) for (const c of clusters) for (const predictProfile of ['independent', 'struggling']) for (let n = 0; n < 5; n++)
      add(context, {...c, enemy: 'dealer', predictProfile, seed: BASE_SEED + 500 + n});
  } else if (cohort === 'reload') {
    for (const context of CONTEXTS) for (const archetype of Object.keys(F.pools))
      for (const predictProfile of ['independent', 'struggling']) for (let n = 0; n < 5; n++)
        add(context, {enemy: n % 2 ? 'dealer' : 'sentinel', archetype, size: [10, 18, 30][n % 3], upgradeRate: .5,
          predictProfile, seed: BASE_SEED + 600 + n});
  } else if (cohort === 'revision') {
    const cards = loadRuntime().data.cards.filter(c => revisions.includes(c.name));
    for (const context of POWER) for (const enemy of ['wisp', 'dealer']) for (const c of cards)
      for (const upgraded of [false, true]) for (let n = 0; n < 3; n++)
        add(context, {cards: [c.id], enemy, upgraded, seed: BASE_SEED + 700 + n});
  } else if (cohort === 'campaign') {
    for (const difficulty of ['easy', 'medium', 'hard']) for (const predict of ['feedback', 'high', 'low'])
      for (const route of ['health-recovery', 'seek-reward']) for (let n = 0; n < 10; n++)
        add({family: 'master', difficulty}, {skill: 'intermediate', predict, route, seed: BASE_SEED + 800 + n});
    for (const difficulty of ['medium', 'hard']) for (const skill of ['beginner', 'expert']) for (const predict of ['high', 'low'])
      for (const route of ['health-recovery', 'seek-reward']) for (let n = 0; n < 3; n++)
        add({family: 'master', difficulty}, {skill, predict, route, seed: BASE_SEED + 800 + n});
  } else if (cohort === 'artifact_gate') {
    for (const difficulty of ['medium', 'hard']) for (const predict of ['high', 'low'])
      for (const route of ['health-recovery', 'seek-reward']) for (const artifactOracle of [false, true]) for (let n = 0; n < 5; n++)
        add({family: 'master', difficulty}, {skill: 'intermediate', predict, route, artifactOracle, seed: BASE_SEED + 1300 + n});
  } else if (cohort === 'followup' || cohort === 'focus_followup') {
    const path = require('node:path'), fs = require('node:fs');
    const selectionDir = process.env.STM_RECHECK_SELECTION || process.env.STM_RECHECK_OUT || path.join(__dirname, '../../../reports/combat-recheck-2026-10-24');
    const selections = JSON.parse(fs.readFileSync(path.join(selectionDir, 'adaptive-selection.json')));
    for (const s of selections[cohort]) for (const order of cohort === 'followup' ? [[0, 1], [1, 0]] : [[0]])
      for (let n = 0; n < 50; n++) add({family: s.family, difficulty: s.difficulty},
        {...s, order, seed: BASE_SEED + (cohort === 'followup' ? 1100 : 1200) + n,
          selection: 'Adaptive pilot selection; 50 disjoint new seeds, selection bias retained'});
  } else if (cohort === 'ordinary_campaign') {
    for (const predictProfile of ['independent', 'developing', 'struggling']) for (let n = 0; n < 20; n++)
      add(CONTEXTS[0], {predictProfile, routePolicy: n % 2 ? 'safe' : 'risk', seed: BASE_SEED + 900 + n});
  } else throw Error('Unknown cohort ' + cohort);
  return out;
}

module.exports = {jobs, replacement, CONTEXTS, POWER, pairs, revisions, ref, BASE_SEED};
