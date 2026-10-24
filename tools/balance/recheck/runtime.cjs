'use strict';

// Private module caches keep ordinary and all Master cartridges independent.
// A historical ref reads actual Git objects, never a reconstructed rules model.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '../../..');
const MAIN = '50d3af423cdc2240e949f4ddf29e023865304b65';
const PRE_EFFECTS = 'c54ce92fdd8e43544b03a16ed995431da6fdb8f0';
const oldSources = new Map();
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');

function loadRuntime({family = 'master', difficulty = 'medium', ref = null} = {}) {
  if (!['ordinary', 'master'].includes(family)) throw Error('Unknown runtime family');
  if (family === 'ordinary' && difficulty !== 'medium') throw Error('Ordinary has no difficulty profile');
  const cache = new Map(), sources = {}, privateGlobal = {};
  let binding = null;
  function load(file) {
    file = path.resolve(file);
    if (cache.has(file)) return cache.get(file).exports;
    const relative = path.relative(ROOT, file).split(path.sep).join('/');
    let code;
    if (ref) {
      const key = ref + ':' + relative;
      if (!oldSources.has(key)) oldSources.set(key, cp.execFileSync('git', ['show', key], {
        cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024
      }));
      code = oldSources.get(key);
    } else code = fs.readFileSync(file, 'utf8');
    sources[relative] = code;
    const m = {exports: {}};
    cache.set(file, m);
    const req = name => name.startsWith('.') ? load(path.resolve(path.dirname(file), name)) : require(name);
    new Function('require', 'module', 'exports', 'globalThis', code + '\n//# sourceURL=' + file)(req, m, m.exports, privateGlobal);
    if (binding) {
      if (relative === 'dist/card-data.js') m.exports = binding.cardData();
      if (relative === 'dist/artifact-data.js') m.exports = binding.artifactData();
      if (relative === 'dist/economy-data.js') m.exports = binding.economyData(m.exports);
      if (relative === 'dist/rich-text-data.js') m.exports = binding.richTextData(m.exports);
      if (relative === 'dist/config.js') binding.configure(m.exports);
    }
    return m.exports;
  }
  if (family === 'master') binding = load(path.join(ROOT, 'dist/balance.js')).create(difficulty);
  const x = {family, build: family, difficulty, binding};
  for (const [key, file] of Object.entries({E: 'engine', C: 'config', A: 'artifacts', CC: 'card-combat',
    Q: 'education', X: 'mystery', G: 'map', R: 'rich-text', L: 'combat-log', Eco: 'economy', data: 'card-data'})) {
    x[key] = load(path.join(ROOT, 'dist/' + file + '.js'));
  }
  x.sources = sources;
  x.provenance = {
    family, difficulty: family === 'ordinary' ? 'ordinary-challenge' : difficulty,
    sourceRef: ref || MAIN, source: ref ? 'pinned Git objects' : 'working production files at audited main',
    ...(binding ? binding.identity : {version: x.data.effectsVersion || 'archived-ordinary'}),
    engineHash: sha256(JSON.stringify(Object.fromEntries(Object.entries(sources).sort()))),
    cardHash: sha256(JSON.stringify(x.data)), artifactHash: sha256(JSON.stringify(x.A.catalog)),
    pupilCalibration: false
  };
  return x;
}

module.exports = {loadRuntime, ROOT, MAIN, PRE_EFFECTS, sha256};
