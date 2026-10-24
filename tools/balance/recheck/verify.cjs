'use strict';

const fs = require('node:fs'), path = require('node:path'), z = require('node:zlib');
const cp = require('node:child_process'), assert = require('node:assert/strict');
const {ROOT, MAIN, PRE_EFFECTS, loadRuntime, sha256} = require('./runtime.cjs');
const {analyse, readRows} = require('./analyse.cjs');
const {execute} = require('./execute.cjs');
const {DEFAULT_OUT} = require('./run.cjs');
const REQUIRED = ['icp', 'focus', 'pairs', 'triads', 'triads_reverse', 'evolved', 'roster', 'clusters', 'reload', 'revision', 'campaign', 'ordinary_campaign', 'followup', 'focus_followup', 'artifact_gate'];
function verify(dir = DEFAULT_OUT) {
  const s = analyse(dir), cache = new Map();
  const get = job => {
    const key = [job.family, job.difficulty, job.ref || 'current'].join('|');
    if (!cache.has(key)) cache.set(key, loadRuntime(job));
    return cache.get(key);
  };
  assert.deepEqual(s.coverage.map(c => c.cohort).sort(), REQUIRED.slice().sort());
  assert.equal(s.totals.invalid, 0); assert.equal(s.totals.mismatches, 0);
  assert.equal(s.audit.cardFailures, 0);
  assert.ok(s.audit.contracts.every(r => !r.failures.length));
  assert.deepEqual(s.audit.artifacts.flatMap(r => r.failures.map(f => [r.context, f.id])), [['ordinary', 'e13_chain_weavers_spool']]);
  const recovery = JSON.parse(fs.readFileSync(path.join(dir, 'focus-recovery.json')));
  assert.equal(recovery.matchedAvailable, 1180); assert.equal(recovery.primaryCases, 1200); assert.equal(recovery.mismatches.length, 0);
  const historical = JSON.parse(fs.readFileSync(path.join(dir, 'historical-source-manifest.json')));
  const historicalBytes = z.gunzipSync(fs.readFileSync(path.join(dir, 'historical-source.json.gz')));
  assert.equal(sha256(historicalBytes), historical.sourceHash); assert.equal(historical.ref, PRE_EFFECTS);
  const current = get({family: 'master', difficulty: 'medium'});
  const publicationBase = cp.execFileSync('git', ['rev-parse', 'HEAD'], {cwd: ROOT, encoding: 'utf8'}).trim();
  const productionParity = [];
  for (const [p, text] of Object.entries(current.sources)) {
    const before = cp.execFileSync('git', ['show', MAIN + ':' + p], {cwd: ROOT, maxBuffer: 32 * 1024 * 1024});
    const after = cp.execFileSync('git', ['show', publicationBase + ':' + p], {cwd: ROOT, maxBuffer: 32 * 1024 * 1024});
    assert.equal(sha256(before), sha256(text), 'Audited production source changed: ' + p);
    assert.equal(sha256(after), sha256(text), 'Publication base changes a combat dependency: ' + p);
    productionParity.push({path: p, sha256: sha256(text)});
  }
  const replays = [], raw = {};
  for (const c of s.coverage) {
    const dataDir = c.cohort === 'focus' ? path.join(dir, 'focus-reviewed') : dir;
    const manifest = JSON.parse(fs.readFileSync(path.join(dataDir, c.cohort + '-manifest.json')));
    const selected = new Set([0, manifest.tasks.length - 1]);
    // One complete expensive sampled-search replay is enough here; also replay
    // a current intermediate and beginner campaign, while preserving all raw tasks.
    if (c.cohort === 'campaign') {
      let leastExpert = null;
      readRows(dataDir, c.cohort, row => {
        if (row.skill === 'expert' && row.result.ai.searchNodes > 0 && (!leastExpert || row.result.ai.searchNodes < leastExpert.nodes))
          leastExpert = {index: row.index, nodes: row.result.ai.searchNodes};
      });
      assert.ok(leastExpert);selected.clear();selected.add(0);selected.add(180);selected.add(leastExpert.index);
    }
    readRows(dataDir, c.cohort, row => {
      if (!selected.has(row.index)) return;
      const {result, ...job} = row, actual = execute(job, get);
      assert.deepEqual(JSON.parse(JSON.stringify(actual)), result, 'Exact replay failed: ' + c.cohort + '/' + row.index);
      replays.push({cohort: c.cohort, index: row.index, seed: row.seed, status: result.status || 'PAIRED'});
    });
    const parts = JSON.parse(fs.readFileSync(path.join(dataDir, c.cohort + '-parts.json')));
    for (const part of parts) {
      raw[path.relative(dir, path.join(dataDir, part.file))] = {sha256: part.sha256, cases: part.count};
      for (const p of part.provenance) {
        const runtime = get({family: p.family, difficulty: p.family === 'ordinary' ? 'medium' : p.difficulty,
          ref: p.sourceRef === MAIN ? null : p.sourceRef});
        assert.deepEqual(runtime.provenance, p, 'Cartridge provenance mismatch');
      }
    }
  }
  const integrity = {status: 'PASS', runtimeMain: MAIN, publicationBase, historicalRef: PRE_EFFECTS,
    primaryCoverage: s.coverage, primaryTotals: s.totals, exactSerializedReplays: replays,
    sourceSnapshotsVerified: s.coverage.length + 1, productionDependencyParity: productionParity,
    rawParts: raw, focusRecovery: recovery, artifactsKnownFailure: 'ordinary e13 exclusion; positive legal hand discard unavailable',
    excludedEvidence: 'excluded-focus-write is not a primary cohort; complete focus-reviewed replaces it',
    pupilWinRatesMeasured: false};
  fs.writeFileSync(path.join(dir, 'INTEGRITY.json'), JSON.stringify(integrity, null, 2) + '\n');
  console.log('INTEGRITY PASS', s.totals.encounters, 'encounters;', replays.length, 'exact replays;', productionParity.length, 'unchanged production dependencies.');
  return integrity;
}
if (require.main === module) verify(process.env.STM_RECHECK_OUT || DEFAULT_OUT);
module.exports = {verify};
