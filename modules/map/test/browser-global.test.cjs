const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const nodeApi = require('../src/map-rng.js');

test('browser-global API reproduces all exported maps without CommonJS', () => {
  const context = {};
  vm.runInNewContext(fs.readFileSync(path.join(root, 'src/map-rng.js'), 'utf8'), context);
  assert.ok(context.SlayMathRNG, 'normal browser scripts must expose SlayMathRNG');
  for (const stage of [1, 2]) {
    const data = JSON.parse(fs.readFileSync(path.join(root, `data/maps.stage-${stage}.json`), 'utf8'));
    assert.equal(data.maps.length, 100);
    for (const expected of data.maps) {
      const actual = context.SlayMathRNG.generateMap(expected.seed, { stage });
      assert.equal(JSON.stringify(actual), JSON.stringify(expected), 'browser-global output matches exported data');
      assert.equal(JSON.stringify(nodeApi.generateMap(expected.seed, { stage })), JSON.stringify(expected));
    }
  }
});

test('ES module API reproduces all 200 saved maps', async () => {
  const api = await import('../src/index.mjs');
  assert.equal(api.SEEDS.length, 100);
  assert.deepEqual(Object.keys(api.ICON_FILES).sort(), ['battle', 'boss', 'elite', 'mystery', 'rest', 'shop']);
  for (const stage of [1, 2]) {
    const saved = JSON.parse(fs.readFileSync(path.join(root, `data/maps.stage-${stage}.json`), 'utf8')).maps;
    for (const expected of saved) assert.deepEqual(api.generateMap(expected.seed, { stage }), expected);
  }
});

test('all original 50 seeds preserve their saved map snapshots in both stages', () => {
  const crypto = require('node:crypto');
  const baseline = require('./fixtures/original-50-layouts.json');
  assert.equal(Object.keys(baseline).length, 100);
  for (const [key, expectedHash] of Object.entries(baseline)) {
    const [stage, seed] = key.split(':');
    const map = nodeApi.generateMap(seed, { stage: Number(stage) });
    const hash = crypto.createHash('sha256').update(JSON.stringify(map)).digest('hex');
    assert.equal(hash, expectedHash, `${key} must not change`);
  }
});
