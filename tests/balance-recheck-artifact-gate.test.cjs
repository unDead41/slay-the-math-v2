'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const {loadRuntime} = require('../tools/balance/recheck/runtime.cjs');
const {trial} = require('../tools/balance/recheck/artifact-gate.cjs');
const {experiment} = require('../tools/ai-playtester/experiments.cjs');
test('artifact sensitivity baseline exactly matches canonical gameplay and oracle scope is restored', () => {
  const options = {family: 'master', difficulty: 'medium', skill: 'intermediate', predict: 'feedback',
    route: 'health-recovery', seed: 261024900, artifactOracle: false};
  const baseline = trial(loadRuntime(options), options), canonical = experiment({mode: 'campaign', difficulty: options.difficulty,
    skill: options.skill, predict: options.predict, route: options.route, seed: options.seed, seeds: 1}).rows[0];
  for (const k of ['status', 'traceHash', 'final', 'metrics']) assert.deepEqual(baseline[k], canonical[k]);
  assert.equal(baseline.ai.energySpent, canonical.ai.energySpent); assert.equal(baseline.ai.focusSpent, canonical.ai.focusSpent);
  const x = loadRuntime(options), select = x.E.selectEducation, forecast = x.E.selectForecast;
  const oracle = trial(x, {...options, artifactOracle: true});
  assert.ok(oracle.ai.trials.length > 0);
  assert.ok(oracle.ai.trials.every(r => !r.failed && r.attempts === 1));
  assert.equal(x.E.selectEducation, select); assert.equal(x.E.selectForecast, forecast);
});
