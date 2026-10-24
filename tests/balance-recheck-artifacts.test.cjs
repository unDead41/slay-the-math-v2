'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadRuntime } = require('../tools/balance/recheck/runtime.cjs');
const { probeRuntime } = require('../tools/balance/recheck/artifacts.cjs');

for (const difficulty of ['easy', 'medium', 'hard']) {
 test('fresh Master ' + difficulty + ' probes cover all 31 actual artifact contracts', () => {
  const x = loadRuntime({ family: 'master', difficulty });
  const record = x.R.record, log = x.L.record, rows = probeRuntime(x);
  assert.equal(rows.length, 31); assert.equal(new Set(rows.map(row => row.id)).size, 31);
  assert.deepEqual(rows.filter(row => row.status !== 'PASS').map(row => ({ id: row.id, error: row.error })), []);
  for (const row of rows) {
   assert.deepEqual(row.values, x.A.catalog[row.id].values);
   assert.ok(row.scenarios.length > 0); assert.equal(row.validFinal, true);
  }
  const die = rows.find(row => row.id.startsWith('e03_'));
  assert.deepEqual(die.scenarios[0].faces.map(face => face.face), [1, 2, 3, 4, 5, 6]);
  const spool = rows.find(row => row.id.startsWith('e13_'));
  assert.equal(spool.positiveEffect, false); assert.equal(spool.coverage, 'negative_eligibility_and_exclusions');
  assert.equal(spool.scenarios[0].recordsAfterCleanup, 0);
  assert.equal(x.R.record, record); assert.equal(x.L.record, log);
 });
}

test('ordinary probe preserves the real Spool scope failure and its successful-save receipts', () => {
 const x = loadRuntime({ family: 'ordinary' });
 const record = x.R.record, log = x.L.record, rows = probeRuntime(x);
 assert.equal(rows.length, 31);
 const failures = rows.filter(row => row.status === 'FAIL');
 assert.deepEqual(failures.map(row => row.id), ['e13_chain_weavers_spool']);
 const spool = failures[0], scenario = spool.scenarios[0];
 assert.match(spool.error, /Clear Choice Draw-Pile discard/);
 assert.equal(spool.validFinal, true); assert.deepEqual(scenario.eligibleCards, []);
 assert.ok(scenario.clearChoice.receipt.discarded > 0);
 assert.equal(scenario.recordsAfterClearChoice, 1);
 assert.equal(scenario.recordsAfterCleanup, 1);
 assert.ok(spool.evidence[0].results.some(result => result.label === 'Block gained' && result.value === spool.values.block));
 assert.ok(spool.evidence[0].results.some(result => result.label === 'Cards drawn' && result.value === spool.values.draw));
 assert.equal(x.R.record, record); assert.equal(x.L.record, log);
});
