'use strict';

const {simulate, comparable} = require('./combat.cjs');
const {replacement} = require('./jobs.cjs');
const F = require('../decks.cjs');
const {PRE_EFFECTS} = require('./runtime.cjs');

function execute(job, get) {
  const x = get(job), c = job.cohort;
  if (c === 'artifact_gate') return require('./artifact-gate.cjs').trial(x, job);
  if (c === 'focus_followup') return {variants: ['never', 'target', 'elsewhere'].map(policy => ({policy,
    result: simulate(x, {seed: job.seed, enemy: job.enemy, deck: replacement(job.cards, 1, job.upgraded),
      order: [0], initialFocus: 1, predictProfile: 'assisted', focusPolicy: policy})}))};
  if (['icp', 'pairs', 'triads', 'triads_reverse', 'revision', 'followup'].includes(c)) {
    const variants = [], order = job.order || [0];
    for (const revision of c === 'revision' ? ['before', 'after'] : ['after']) {
      const runtime = revision === 'before' ? get({...job, ref: PRE_EFFECTS}) : x;
      for (let mask = 0; mask < 2 ** job.cards.length; mask++) {
        const focusPolicy = c === 'icp' ? job.focused ? 'target' : 'elsewhere' : 'best';
        variants.push({mask, revision, result: simulate(runtime, {
          seed: job.seed, enemy: job.enemy, deck: replacement(job.cards, mask, job.upgraded), order,
          focusPolicy, initialFocus: c === 'icp' ? 1 : 0,
          predictProfile: c === 'icp' ? 'assisted' : 'developing'
        })});
      }
    }
    return {status: variants.every(v => ['WIN', 'LOSS'].includes(v.result.status)) ? 'MEASURED' : 'UNRANKED', variants};
  }
  if (c === 'focus') return simulate(x, {seed: job.seed, enemy: job.enemy, order: [0],
    deck: replacement(job.cards, 1, job.upgraded), initialFocus: 1, predictProfile: 'assisted', focusPolicy: 'never'});
  if (c === 'campaign') {
    const r = require('../../ai-playtester/experiments.cjs').experiment({mode: 'campaign', difficulty: job.difficulty,
      seed: job.seed, seeds: 1, skill: job.skill, predict: job.predict, route: job.route});
    return r.rows[0];
  }
  if (c === 'ordinary_campaign') return require('./ordinary-campaign.cjs').campaign(x, job);
  const options = {seed: job.seed, enemy: job.enemy, deck: F.deck(job.archetype, job.size || 18, job.upgradeRate ?? .33),
    predictProfile: job.predictProfile, artifacts: F.packs[job.archetype]};
  if (c === 'roster') options.elite = x.C.stages.some(stage => stage.elites.includes(job.enemy));
  if (c === 'clusters') {
    if (job.cluster === 'draw_ward') options.deck[0] = {key: 'stm.passive.grimoire_ward', upgraded: true};
    return {variants: [0, 1].map(mask => ({mask, result: simulate(x, {...options,
      artifacts: [...job.base, ...(mask ? [job.extra] : [])]})}))};
  }
  if (c === 'reload') {
    const a = simulate(x, options), b = simulate(x, {...options, reload: true});
    return {status: JSON.stringify(comparable(a)) === JSON.stringify(comparable(b)) ? 'MATCH' : 'MISMATCH',
      uninterrupted: a, reloaded: b};
  }
  return simulate(x, options);
}

function encounters(result) {
  if (result.variants) return result.variants.flatMap(v => encounters(v.result));
  if (result.uninterrupted) return [result.uninterrupted, result.reloaded];
  if (result.encounters) return result.encounters;
  if (result.rooms) return result.rooms.filter(r => ['battle', 'elite', 'boss'].includes(r.roomType));
  return [result];
}
module.exports = {execute, encounters};
