'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const {loadRuntime} = require('../tools/balance/recheck/runtime.cjs');
const {runContracts} = require('../tools/balance/recheck/contracts.cjs');
const {CONTEXTS} = require('../tools/balance/recheck/jobs.cjs');
for (const context of CONTEXTS) test('current changed-rule engine contracts: ' + context.family + '/' + context.difficulty, () => {
  const rows = runContracts(loadRuntime(context));
  assert.equal(rows.length, 29);
  assert.deepEqual(rows.filter(r => r.status !== 'PASS'), []);
});
