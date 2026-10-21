const test = require('node:test');
const assert = require('node:assert/strict');
const { generateMap, validateMap } = require('../src/map-rng.js');

// Wrong global room quotas, bypasses, orphan rooms, or non-seeded randomness
// would fail these behavior checks. Tests do not reuse the production validator.
const quotas = { 3: { shop: 1, elite: 4, rest: 2 }, 4: { shop: 2, elite: 6, rest: 3 }, 5: { shop: 3, elite: 7, rest: 4 } };
const seeds = Array.from({ length: 100 }, (_, i) => `STM-${String(i + 1).padStart(3, '0')}`);

function checkRules(map) {
  assert.ok(map && Array.isArray(map.nodes), 'generator must return a real map');
  const byId = new Map(map.nodes.map(n => [n.id, n]));
  assert.equal(byId.size, map.nodes.length, 'IDs are unique');
  const rows = Array.from({ length: 10 }, (_, i) => map.nodes.filter(n => n.level === i + 1));
  for (const row of rows) assert.ok(row.length > 0, 'all ten levels exist');
  assert.equal(rows.flat().length, map.nodes.length, 'no nodes outside levels 1–10');
  assert.equal(rows[0].length, map.initialPaths);
  for (const row of rows.slice(0, 8)) assert.ok(row.length >= 3 && row.length <= 5, 'ordinary levels have 3–5 corridors');
  assert.ok(rows[4].every(n => n.type === 'mystery'), 'every level-5 room is Mystery');
  assert.ok(rows[8].every(n => n.type === 'rest'), 'every approach to boss is Rest');
  assert.equal(rows[9].length, 1);
  assert.equal(rows[9][0].type, 'boss');
  assert.equal(map.nodes.filter(n => n.type === 'boss').length, 1);
  const counts = Object.fromEntries(['shop', 'elite', 'rest'].map(type => [type, map.nodes.filter(n => n.type === type).length]));
  assert.deepEqual(counts, quotas[map.initialPaths], 'exact global quotas');
  for (const node of map.nodes.filter(n => n.type === 'rest')) assert.ok([4, 6, 7, 8, 9].includes(node.level), 'no early Rest');
  for (const node of map.nodes.filter(n => n.type === 'shop')) assert.ok([1, 2, 3, 4, 6, 7, 8].includes(node.level));
  const out = new Map(map.nodes.map(n => [n.id, []]));
  const incoming = new Map(map.nodes.map(n => [n.id, []]));
  const uniqueEdges = new Set();
  for (const edge of map.edges) {
    const from = byId.get(edge.from), to = byId.get(edge.to);
    assert.ok(from && to, 'all edge endpoints exist');
    assert.equal(to.level, from.level + 1, 'cannot skip Mystery, Rest, or another level');
    const key = `${edge.from}|${edge.to}`;
    assert.ok(!uniqueEdges.has(key), 'no duplicate edges');
    uniqueEdges.add(key);
    out.get(from.id).push(to.id); incoming.get(to.id).push(from.id);
  }
  for (const node of map.nodes) {
    if (node.level < 10) assert.ok(out.get(node.id).length > 0, 'no dead ends');
    if (node.level > 1) assert.ok(incoming.get(node.id).length > 0, 'no orphan rooms');
    if (node.level < 9) assert.ok(out.get(node.id).length <= 2, 'a room cannot connect to every lane');
  }
  // Reachability in both directions proves every room is playable and can reach boss.
  const seen = new Set(rows[0].map(n => n.id));
  for (const row of rows) for (const node of row) if (seen.has(node.id)) for (const id of out.get(node.id)) seen.add(id);
  assert.equal(seen.size, map.nodes.length);
  const reachesBoss = new Set([rows[9][0].id]);
  for (const row of [...rows].reverse()) for (const node of row) if (out.get(node.id).some(id => reachesBoss.has(id))) reachesBoss.add(node.id);
  assert.equal(reachesBoss.size, map.nodes.length);
  // Monotone edges cannot visually cross between different rooms on adjacent levels.
  for (let level = 1; level <= 8; level++) {
    const links = map.edges.filter(e => byId.get(e.from).level === level);
    for (const a of links) for (const b of links) {
      const a1 = byId.get(a.from), a2 = byId.get(a.to), b1 = byId.get(b.from), b2 = byId.get(b.to);
      assert.ok(!((a1.column < b1.column) && (a2.column > b2.column)), 'non-planar crossing');
    }
  }
  assert.equal(validateMap(map).valid, true);
  return rows;
}

test('confirmed quotas and mandatory levels hold for every path count in both stages', () => {
  for (const initialPaths of [3, 4, 5]) for (const stage of [1, 2]) {
    for (const seed of seeds.slice(0, 12)) checkRules(generateMap(seed, { stage, initialPaths }));
  }
});

test('100 seeds are unique, reproducible, and include expanding and merging maps', () => {
  const signatures = new Set(), widths = new Set(), shopZones = new Set();
  let expands = false, contracts = false, hasMiddleRest = false, hasSharedRest = false;
  const originalRandom = Math.random;
  Math.random = () => { throw new Error('unseeded randomness is forbidden'); };
  try {
    for (const stage of [1, 2]) for (const seed of seeds) {
      const map = generateMap(seed, { stage });
      const rows = checkRules(map);
      assert.deepEqual(generateMap(seed, { stage }), map, 'same seed and parameters reproduce map');
      assert.equal(map.stage, stage);
      assert.equal(map.bossId, stage === 1 ? 's1_twin_sigil_guardian' : 's2_deck_lord');
      widths.add(map.initialPaths);
      const signature = JSON.stringify({ nodes: map.nodes.map(n => [n.level, n.column, n.type]), edges: map.edges });
      assert.ok(!signatures.has(signature), 'curated maps must be distinct'); signatures.add(signature);
      expands ||= map.initialPaths === 3 && rows[7].length === 5;
      contracts ||= map.initialPaths === 5 && rows[7].length === 3;
      hasMiddleRest ||= map.nodes.some(n => n.type === 'rest' && n.level < 9);
      hasSharedRest ||= rows[8].some(n => map.edges.filter(e => e.to === n.id).length > 1);
      for (const n of map.nodes.filter(n => n.type === 'shop')) shopZones.add(n.level <= 3 ? 'front' : n.level <= 6 ? 'middle' : 'back');
    }
  } finally { Math.random = originalRandom; }
  assert.deepEqual([...widths].sort(), [3, 4, 5]);
  assert.equal(signatures.size, 200);
  assert.ok(expands && contracts, 'catalogue includes 3→5 and 5→3');
  assert.ok(hasMiddleRest && hasSharedRest);
  assert.deepEqual([...shopZones].sort(), ['back', 'front', 'middle']);
});

test('validator detects broken guarantees, counts, and disconnected rooms', () => {
  const original = generateMap('STM-001', { stage: 1, initialPaths: 3 });
  const mutate = fn => { const map = structuredClone(original); fn(map); assert.equal(validateMap(map).valid, false); };
  mutate(m => { m.nodes.find(n => n.level === 5).type = 'battle'; });
  mutate(m => { m.nodes.find(n => n.level === 9).type = 'battle'; });
  mutate(m => { m.nodes.find(n => n.type === 'elite').type = 'battle'; });
  mutate(m => { const id = m.nodes.find(n => n.level === 3).id; m.edges = m.edges.filter(e => e.to !== id); });
  mutate(m => { m.edges[0].to = m.nodes.find(n => n.level === 10).id; });
  mutate(m => { m.edges.push({ ...m.edges[0] }); });
  mutate(m => { m.nodes[1].id = m.nodes[0].id; });
  mutate(m => { m.nodes.find(n => n.level === 10).type = 'rest'; });
});

test('invalid seed and options fail clearly', () => {
  for (const seed of ['', ' ', null, undefined, {}, NaN, Infinity, 1.5]) assert.throws(() => generateMap(seed));
  for (const initialPaths of [0, 2, 6, 3.5, '3']) assert.throws(() => generateMap('x', { initialPaths }));
  for (const stage of [0, 3, '1']) assert.throws(() => generateMap('x', { stage }));
  assert.equal(validateMap(null).valid, false);
});
