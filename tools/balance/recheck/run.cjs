'use strict';

const fs = require('node:fs'), path = require('node:path'), z = require('node:zlib');
const {Worker, isMainThread, parentPort, workerData} = require('node:worker_threads');
const {ROOT, MAIN, loadRuntime, sha256} = require('./runtime.cjs');
const {jobs, CONTEXTS} = require('./jobs.cjs');
const {execute, encounters} = require('./execute.cjs');
const assert = require('node:assert/strict');
const DEFAULT_OUT = path.join(ROOT, 'reports/combat-recheck-2026-10-24');

function captureSources() {
  const files = {};
  const runtimes = CONTEXTS.map(loadRuntime);
  for (const x of runtimes) for (const [p, code] of Object.entries(x.sources)) files[p] = code;
  function walk(dir) {
    for (const e of fs.readdirSync(path.join(ROOT, dir), {withFileTypes: true})) {
      const p = dir + '/' + e.name;
      if (e.isDirectory()) walk(p);
      else if (/\.(cjs|js|json|md)$/.test(p)) files[p] = fs.readFileSync(path.join(ROOT, p), 'utf8');
    }
  }
  walk('tools/balance'); walk('tools/ai-playtester');
  const sources = Object.fromEntries(Object.entries(files).sort());
  return {sources, hash: sha256(JSON.stringify(sources)), provenance: runtimes.map(x => x.provenance)};
}
if (!isMainThread) {
  const {tasks, output, cohort, worker} = workerData;
  const cache = new Map(), get = task => {
    const key = [task.family, task.difficulty, task.ref || 'current'].join(':');
    if (!cache.has(key)) cache.set(key, loadRuntime(task));
    return cache.get(key);
  };
  const file = path.join(output, cohort + '-' + worker + '.jsonl.gz'), pending = file + '.pending';
  const fd = fs.openSync(pending, 'wx');
  let lines = [], count = 0, nEncounters = 0, invalid = 0, censored = 0, mismatches = 0;
  const statuses = {};
  const flush = () => {
    if (lines.length) fs.writeSync(fd, z.gzipSync(lines.join('\n') + '\n', {level: 9}));
    lines = [];
  };
  for (const task of tasks) {
    const result = execute(task, get), es = encounters(result);
    lines.push(JSON.stringify({...task, result})); count++; nEncounters += es.length;
    invalid += result.status === 'INVALID_POLICY_OR_ENGINE' ? 1 : es.filter(v => v.status === 'INVALID_POLICY_OR_ENGINE').length;
    censored += result.status === 'BENCHMARK_LIMIT_CENSORED' ? 1 : es.filter(v => v.status === 'BENCHMARK_LIMIT_CENSORED').length;
    mismatches += result.status === 'MISMATCH';
    statuses[result.status || 'PAIRED'] = (statuses[result.status || 'PAIRED'] || 0) + 1;
    if (count % 20 === 0) {flush(); parentPort.postMessage({progress: 20});}
  }
  flush(); fs.fsyncSync(fd); fs.closeSync(fd); fs.renameSync(pending, file);
  const finalBytes = fs.readFileSync(file), finalLines = z.gunzipSync(finalBytes).toString('utf8').trim().split('\n');
  assert.equal(finalLines.length, count, 'Final gzip lost accepted records');
  assert.equal(new Set(finalLines.map(line => JSON.parse(line).index)).size, count, 'Duplicate final index');
  parentPort.postMessage({done: true, file: path.basename(file), count, nEncounters, invalid, censored, mismatches,
    statuses, bytes: fs.statSync(file).size, sha256: sha256(fs.readFileSync(file)),
    provenance: [...cache.values()].map(x => x.provenance)});
} else if (require.main === module) {
  (async () => {
    const cohort = process.argv[2], tasks = jobs(cohort);
    const output = path.resolve(process.env.STM_RECHECK_OUT || DEFAULT_OUT);
    fs.mkdirSync(output, {recursive: true});
    const manifestFile = path.join(output, cohort + '-manifest.json');
    if (fs.existsSync(manifestFile)) throw Error('Evidence exists; choose a new output, do not overwrite.');
    const snap = captureSources(), sourceFile = 'sources-' + snap.hash + '.json.gz';
    if (!fs.existsSync(path.join(output, sourceFile))) fs.writeFileSync(path.join(output, sourceFile), z.gzipSync(JSON.stringify(snap.sources), {level: 9}));
    fs.writeFileSync(manifestFile, JSON.stringify({schemaVersion: 1, cohort, main: MAIN, oldRemoteCombat: '1bf66320ed275755d25734ad907395443f71176f',
      sourceHash: snap.hash, sourceFile, provenance: snap.provenance, node: process.version, tasks,
      policy: 'recheck-visible-phase-greedy-1; actual engine plans/damage; forced legal physical-slot orders only where declared',
      utility: '100*win+20*terminalHP/maxHP-min(10,turns/2); null when censored/invalid; support units separate',
      generated: new Date().toISOString(), pupilWinRatesMeasured: false}, null, 2) + '\n');
    const n = Math.min(Number(process.env.STM_WORKERS || 3), tasks.length), parts = [];
    let completed = 0;
    console.log(cohort, tasks.length, 'tasks;', n, 'workers; source', snap.hash);
    await Promise.all(Array.from({length: n}, (_, worker) => new Promise((resolve, reject) => {
      const w = new Worker(__filename, {resourceLimits: {maxOldGenerationSizeMb: 256},
        workerData: {cohort, output, worker, tasks: tasks.filter(t => t.index % n === worker)}});
      w.on('error', reject);
      w.on('message', m => {
        if (m.progress) {completed += m.progress; if (completed % 200 === 0) console.log(cohort, completed + '/' + tasks.length);}
        else if (m.done) {parts.push(m); resolve();}
      });
      w.on('exit', code => {if (code) reject(Error('Worker exit ' + code));});
    })));
    parts.sort((a, b) => a.file.localeCompare(b.file));
    fs.writeFileSync(path.join(output, cohort + '-parts.json'), JSON.stringify(parts, null, 2) + '\n');
    const summary = Object.fromEntries(['count', 'nEncounters', 'invalid', 'censored', 'mismatches'].map(k => [k, parts.reduce((n, p) => n + p[k], 0)]));
    console.log(cohort, 'DONE', JSON.stringify(summary));
    if (summary.invalid || summary.mismatches) process.exitCode = 1;
  })().catch(error => {console.error(error); process.exitCode = 1;});
}

module.exports = {DEFAULT_OUT, captureSources};
