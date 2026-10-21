const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { generateMap, validateMap } = require('../src/map-rng.js');
const root = path.resolve(__dirname, '..');
function assert(value, message) { if (!value) throw new Error(message); }
const registry = JSON.parse(fs.readFileSync(path.join(root, 'data/seed-registry.json'), 'utf8'));
assert(registry.seeds.length === 100 && new Set(registry.seeds).size === 100, '100 distinct seeds required');
let maps = 0;
const layouts = new Set();
for (const stage of [1, 2]) {
  const data = JSON.parse(fs.readFileSync(path.join(root, `data/maps.stage-${stage}.json`), 'utf8'));
  assert(data.maps.length === 100, '100 maps per stage required');
  for (const map of data.maps) {
    assert(validateMap(map).valid, `Invalid map: ${map.seed}/${stage}`);
    assert(JSON.stringify(generateMap(map.seed, { stage })) === JSON.stringify(map), 'Snapshot mismatch');
    layouts.add(JSON.stringify({ nodes: map.nodes.map(n => [n.level, n.column, n.type]), edges: map.edges }));
    maps++;
  }
}
assert(layouts.size === 200, '200 unique layouts required');
const assets = path.join(root, 'assets/map-icons');
const manifest = JSON.parse(fs.readFileSync(path.join(assets, 'manifest.json'), 'utf8'));
assert(manifest.icons.length === 6, 'Six icon types required');
let pngs = 0;
for (const icon of manifest.icons) for (const output of icon.outputs) {
  const bytes = fs.readFileSync(path.join(assets, output.file));
  assert(bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])), 'PNG signature invalid');
  assert(bytes.readUInt32BE(16) === output.width && bytes.readUInt32BE(20) === output.height, 'PNG dimensions changed');
  assert(bytes[25] === 6, 'RGBA PNG required');
  assert(crypto.createHash('sha256').update(bytes).digest('hex') === output.sha256, 'PNG hash mismatch');
  pngs++;
}
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file); else files.push(file);
  }
}
walk(root);
assert(!files.some(file => /\.html?$/i.test(file)), 'This source package must not contain HTML files');
for (const name of ['00_READ_FIRST.md','01_MAP_RNG.md','02_MAP_ICONS.md','03_MAP_INTEGRATION.md']) {
  assert(fs.statSync(path.join(root, 'SOR', name)).size > 0, 'Missing SOR: ' + name);
}
console.log(JSON.stringify({ seeds: 100, maps, uniqueLayouts: layouts.size, pngs, pngHashes: 'passed', sorFiles: 4, htmlFiles: 0 }));
