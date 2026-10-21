const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { VERSION, generateMap, validateMap } = require('../src/map-rng.js');
const CATALOGUE_VERSION = '1.1.0';
const root = path.resolve(__dirname, '..');
const dataDir = path.join(root, 'data');
fs.mkdirSync(dataDir, { recursive: true });
const seeds = Array.from({ length: 100 }, (_, i) => `STM-${String(i + 1).padStart(3, '0')}`);
const save = (name, value) => fs.writeFileSync(path.join(dataDir, name), JSON.stringify(value, null, 2) + '\n');
save('seed-registry.json', { generatorVersion: VERSION, catalogueVersion: CATALOGUE_VERSION, seeds });
const catalogue = [];
const signatures = new Set();
for (const stage of [1, 2]) {
  const maps = seeds.map(seed => generateMap(seed, { stage }));
  for (const map of maps) {
    const result = validateMap(map);
    if (!result.valid) throw new Error(`${map.seed}/${stage}: ${result.errors.join('; ')}`);
    const layout = JSON.stringify({ nodes: map.nodes.map(n => [n.level, n.column, n.type]), edges: map.edges });
    const sha256 = crypto.createHash('sha256').update(layout).digest('hex');
    if (signatures.has(sha256)) throw new Error('Duplicate layout');
    signatures.add(sha256);
    catalogue.push({ seed: map.seed, stage, initialPaths: map.initialPaths, preRestPaths: map.preRestPaths,
      shop: result.counts.shop, elite: result.counts.elite, rest: result.counts.rest,
      mystery: result.counts.mystery, restGateCount: result.restGateCount, middleRestCount: result.middleRestCount,
      routeCount: result.routeCount, eliteFreeRouteCount: result.eliteFreeRouteCount,
      shopFreeRouteCount: result.shopFreeRouteCount, sha256, valid: true });
  }
  save(`maps.stage-${stage}.json`, { generatorVersion: VERSION, catalogueVersion: CATALOGUE_VERSION, stage, maps });
}
const header = Object.keys(catalogue[0]);
fs.writeFileSync(path.join(dataDir, 'seed-catalogue.csv'), header.join(',') + '\n' + catalogue.map(row => header.map(key => row[key]).join(',')).join('\n') + '\n');
save('validation-report.json', { generatorVersion: VERSION, catalogueVersion: CATALOGUE_VERSION, seedCount: seeds.length, stageCount: 2, mapCount: catalogue.length,
  uniqueLayouts: signatures.size, allValid: catalogue.every(row => row.valid),
  byInitialPaths: [3, 4, 5].map(initialPaths => ({ initialPaths, maps: catalogue.filter(m => m.initialPaths === initialPaths).length })),
  examples: {
    expands3to5: catalogue.find(m => m.initialPaths === 3 && m.preRestPaths === 5),
    contracts5to3: catalogue.find(m => m.initialPaths === 5 && m.preRestPaths === 3)
  }, maps: catalogue });
const core = fs.readFileSync(path.join(root, 'src/map-rng.js'), 'utf8');
const body = core.slice(core.indexOf("  'use strict';"), core.lastIndexOf('\n});'));
fs.writeFileSync(path.join(root, 'src/map-rng.mjs'), '// ES-module entry; the generator body is shared with map-rng.js.\nconst Rng = (() => {\n' + body + '\n})();\nexport const { VERSION, QUOTAS, STAGES, generateMap, validateMap } = Rng;\nexport default Rng;\n');
fs.writeFileSync(path.join(root, 'src/seeds.mjs'), 'export const SEEDS = Object.freeze(' + JSON.stringify(seeds, null, 2) + ');\n');
console.log(JSON.stringify({ seeds: seeds.length, maps: catalogue.length, unique: signatures.size, allValid: true }));
