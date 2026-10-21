// ES-module entry; the generator body is shared with map-rng.js.
const Rng = (() => {
  'use strict';

  const VERSION = '1.0.0';
  const QUOTAS = Object.freeze({
    3: Object.freeze({ shop: 1, elite: 4, rest: 2 }),
    4: Object.freeze({ shop: 2, elite: 6, rest: 3 }),
    5: Object.freeze({ shop: 3, elite: 7, rest: 4 })
  });
  const STAGES = Object.freeze({
    1: Object.freeze({ name: 'Sigil Keep', bossId: 's1_twin_sigil_guardian', bossName: 'Twin Sigil Guardian' }),
    2: Object.freeze({ name: 'Deck Tower', bossId: 's2_deck_lord', bossName: 'Deck Lord' })
  });
  const TYPES = ['battle', 'elite', 'shop', 'rest', 'mystery', 'boss'];
  const REST_LEVELS = [4, 6, 7, 8, 9];
  const SHOP_LEVELS = [1, 2, 3, 4, 6, 7, 8];
  const ELITE_LEVELS = [2, 3, 4, 6, 7, 8];

  function randomStream(text) {
    // FNV-1a on JS UTF-16 code units followed by Mulberry32.
    let state = 2166136261;
    for (let i = 0; i < text.length; i++) state = Math.imul(state ^ text.charCodeAt(i), 16777619) >>> 0;
    const next = () => {
      state = (state + 0x6D2B79F5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const int = (min, max) => min + Math.floor(next() * (max - min + 1));
    const shuffle = list => {
      const result = [...list];
      for (let i = result.length - 1; i > 0; i--) { const j = int(0, i); [result[i], result[j]] = [result[j], result[i]]; }
      return result;
    };
    return { next, int, shuffle };
  }

  function connectRows(from, to, rng, allowExtras) {
    const links = [];
    const add = (a, b) => links.push({ from: from[a].id, to: to[b].id, a, b });
    // Ordered covering: all nodes get a parent and child without crossings.
    if (to.length >= from.length) {
      for (let b = 0; b < to.length; b++) add(Math.floor(b * from.length / to.length), b);
    } else {
      for (let a = 0; a < from.length; a++) add(a, Math.floor(a * to.length / from.length));
    }
    if (allowExtras) {
      const candidates = [];
      for (let a = 0; a < from.length; a++) for (let b = 0; b < to.length; b++) {
        if (Math.abs(from[a].x - to[b].x) <= 0.4) candidates.push({ a, b });
      }
      let remaining = rng.int(0, 2);
      for (const { a, b } of rng.shuffle(candidates)) {
        if (!remaining) break;
        if (links.some(e => e.a === a && e.b === b)) continue;
        if (links.filter(e => e.a === a).length >= 2 || links.filter(e => e.b === b).length >= 2) continue;
        if (links.some(e => (e.a - a) * (e.b - b) < 0)) continue;
        add(a, b); remaining--;
      }
    }
    return links.map(({ from: source, to: target }) => ({ from: source, to: target }));
  }

  function generateMap(seed, options = {}) {
    if (!((typeof seed === 'string' && seed.trim()) || (typeof seed === 'number' && Number.isSafeInteger(seed)))) {
      throw new TypeError('seed must be a non-empty string or a safe integer');
    }
    if (!options || typeof options !== 'object' || Array.isArray(options)) throw new TypeError('options must be an object');
    const stage = options.stage === undefined ? 1 : options.stage;
    if (![1, 2].includes(stage)) throw new RangeError('stage must be 1 or 2');
    if (options.initialPaths !== undefined && ![3, 4, 5].includes(options.initialPaths)) throw new RangeError('initialPaths must be 3, 4, or 5');
    seed = String(seed).trim();
    const rng = randomStream(JSON.stringify([VERSION, seed, stage, options.initialPaths ?? 'auto']));
    const initialPaths = options.initialPaths ?? rng.int(3, 5);
    const quota = QUOTAS[initialPaths];
    const widths = [initialPaths];
    for (let level = 2; level <= 8; level++) {
      const roll = rng.next();
      const change = roll < 0.32 ? -1 : roll > 0.68 ? 1 : 0;
      widths.push(Math.max(3, Math.min(5, widths.at(-1) + change)));
    }
    const preRestPaths = widths[7];
    const restGates = rng.int(1, Math.min(quota.rest, preRestPaths));
    widths.push(restGates, 1);
    const rows = widths.map((width, index) => Array.from({ length: width }, (_, column) => ({
      id: `s${stage}-l${String(index + 1).padStart(2, '0')}-n${column + 1}`,
      level: index + 1, column,
      x: width === 1 ? 0.5 : Number((0.12 + 0.76 * column / (width - 1)).toFixed(6)),
      type: index === 4 ? 'mystery' : index === 8 ? 'rest' : index === 9 ? 'boss' : 'battle'
    })));
    const nodes = rows.flat();
    const edges = [];
    for (let i = 0; i < rows.length - 1; i++) edges.push(...connectRows(rows[i], rows[i + 1], rng, i < 7));
    const place = (type, count, levels) => {
      const candidates = rng.shuffle(nodes.filter(n => n.type === 'battle' && levels.includes(n.level)));
      if (candidates.length < count) throw new Error(`No space for ${type} quota`);
      for (const node of candidates.slice(0, count)) node.type = type;
    };
    place('rest', quota.rest - restGates, REST_LEVELS.filter(n => n !== 9));
    place('shop', quota.shop, SHOP_LEVELS);
    place('elite', quota.elite, ELITE_LEVELS);
    for (const node of nodes) if (node.type === 'battle' && node.level !== 1 && rng.next() < 0.16) node.type = 'mystery';
    const map = {
      generatorVersion: VERSION, rulesVersion: VERSION, seed, stage,
      stageName: STAGES[stage].name, bossId: STAGES[stage].bossId, bossName: STAGES[stage].bossName,
      initialPaths, preRestPaths, quotas: { ...quota },
      levels: rows.map((row, i) => ({ level: i + 1, nodeIds: row.map(n => n.id) })),
      nodes, edges
    };
    const result = validateMap(map);
    if (!result.valid) throw new Error(`Generated invalid map: ${result.errors.join('; ')}`);
    return map;
  }

  function validateMap(map) {
    const errors = [];
    const counts = Object.fromEntries(TYPES.map(type => [type, 0]));
    const finish = metrics => ({ valid: errors.length === 0, errors, counts, ...metrics });
    if (!map || typeof map !== 'object' || !Array.isArray(map.nodes) || !Array.isArray(map.edges)) {
      errors.push('A map needs nodes and edges arrays'); return finish({});
    }
    if (![3, 4, 5].includes(map.initialPaths)) errors.push('Initial paths must be 3–5');
    if (![1, 2].includes(map.stage)) errors.push('Unknown stage');
    if (map.generatorVersion !== VERSION || map.rulesVersion !== VERSION) errors.push('Unsupported generator/rules version');
    const byId = new Map(), rows = Array.from({ length: 10 }, () => []);
    for (const node of map.nodes) {
      if (!node || typeof node.id !== 'string' || !node.id || byId.has(node.id)) { errors.push('Missing or duplicate node ID'); continue; }
      byId.set(node.id, node);
      if (!Number.isInteger(node.level) || node.level < 1 || node.level > 10) { errors.push('Node outside levels 1–10'); continue; }
      rows[node.level - 1].push(node);
      if (!Number.isInteger(node.column) || node.column < 0 || !Number.isFinite(node.x) || node.x < 0 || node.x > 1) errors.push('Invalid node position');
      if (!TYPES.includes(node.type)) errors.push('Unknown room type'); else counts[node.type]++;
      if (node.type === 'rest' && !REST_LEVELS.includes(node.level)) errors.push('Rest is too early or on a reserved level');
      if (node.type === 'shop' && !SHOP_LEVELS.includes(node.level)) errors.push('Shop on a reserved level');
      if (node.type === 'elite' && !ELITE_LEVELS.includes(node.level)) errors.push('Elite on a reserved level');
      if (node.type === 'boss' && node.level !== 10) errors.push('Boss must be at level 10');
    }
    for (let i = 0; i < 10; i++) {
      const row = rows[i];
      if (!row.length) errors.push(`Missing level ${i + 1}`);
      if (i < 8 && (row.length < 3 || row.length > 5)) errors.push('Levels 1–8 need 3–5 corridors');
      const columns = new Set(row.map(n => n.column));
      if (columns.size !== row.length || row.some(n => n.column >= row.length)) errors.push('Invalid columns in a level');
    }
    if (rows[0].length !== map.initialPaths || rows[7].length !== map.preRestPaths) errors.push('Path metadata does not match map');
    if (rows[4].some(n => n.type !== 'mystery')) errors.push('Level 5 must be all Mystery');
    if (rows[8].some(n => n.type !== 'rest')) errors.push('Level 9 must be all Rest');
    if (rows[9].length !== 1 || rows[9][0]?.type !== 'boss' || counts.boss !== 1) errors.push('Exactly one boss at level 10 is required');
    if (STAGES[map.stage] && map.bossId !== STAGES[map.stage].bossId) errors.push('Wrong boss for stage');
    const quota = QUOTAS[map.initialPaths];
    if (quota) for (const type of ['shop', 'elite', 'rest']) {
      if (counts[type] !== quota[type]) errors.push(`Expected ${quota[type]} ${type}, found ${counts[type]}`);
      if (map.quotas?.[type] !== quota[type]) errors.push('Quota metadata mismatch');
    }
    if (!Array.isArray(map.levels) || map.levels.length !== 10) errors.push('Missing level index');
    else for (let i = 0; i < 10; i++) {
      const entry = map.levels[i];
      const expected = rows[i].map(n => n.id).sort();
      if (entry?.level !== i + 1 || !Array.isArray(entry.nodeIds) || JSON.stringify([...entry.nodeIds].sort()) !== JSON.stringify(expected)) errors.push('Level index mismatch');
    }
    const incoming = new Map([...byId.keys()].map(id => [id, []]));
    const outgoing = new Map([...byId.keys()].map(id => [id, []]));
    const edgeKeys = new Set(), levelEdges = Array.from({ length: 9 }, () => []);
    for (const edge of map.edges) {
      const from = byId.get(edge?.from), to = byId.get(edge?.to);
      if (!from || !to) { errors.push('Edge endpoint missing'); continue; }
      const key = JSON.stringify([edge.from, edge.to]);
      if (edgeKeys.has(key)) errors.push('Duplicate edge'); edgeKeys.add(key);
      if (to.level !== from.level + 1 || from.level < 1 || from.level > 9) { errors.push('Edge must lead to the immediately next level'); continue; }
      outgoing.get(from.id).push(to.id); incoming.get(to.id).push(from.id);
      levelEdges[from.level - 1].push({ from, to });
    }
    for (const node of byId.values()) {
      if (node.level < 10 && !outgoing.get(node.id).length) errors.push('Dead-end room');
      if (node.level > 1 && !incoming.get(node.id).length) errors.push('Unreachable room');
      if (node.level < 9 && outgoing.get(node.id).length > 2) errors.push('Too many connections from a room');
    }
    for (const links of levelEdges) for (let i = 0; i < links.length; i++) for (let j = i + 1; j < links.length; j++) {
      if ((links[i].from.column - links[j].from.column) * (links[i].to.column - links[j].to.column) < 0) errors.push('Crossed paths between levels');
    }
    const reached = new Set(rows[0].map(n => n.id));
    const canReachBoss = new Set(rows[9].map(n => n.id));
    const routeCounts = new Map(), noElite = new Map(), noShop = new Map();
    for (const row of rows) for (const node of row) {
      const parents = incoming.get(node.id) || [];
      if (parents.some(id => reached.has(id))) reached.add(node.id);
      const sum = state => node.level === 1 ? 1 : parents.reduce((total, id) => total + (state.get(id) || 0), 0);
      routeCounts.set(node.id, sum(routeCounts));
      noElite.set(node.id, node.type === 'elite' ? 0 : sum(noElite));
      noShop.set(node.id, node.type === 'shop' ? 0 : sum(noShop));
    }
    for (const row of [...rows].reverse()) for (const node of row) if ((outgoing.get(node.id) || []).some(id => canReachBoss.has(id))) canReachBoss.add(node.id);
    if (reached.size !== byId.size || canReachBoss.size !== byId.size) errors.push('Not every room lies on a complete start-to-boss route');
    const boss = rows[9][0]?.id;
    return finish({
      routeCount: routeCounts.get(boss) || 0, eliteFreeRouteCount: noElite.get(boss) || 0,
      shopFreeRouteCount: noShop.get(boss) || 0, restGateCount: rows[8].length,
      middleRestCount: counts.rest - rows[8].length
    });
  }

  return Object.freeze({ VERSION, QUOTAS, STAGES, generateMap, validateMap });
})();
export const { VERSION, QUOTAS, STAGES, generateMap, validateMap } = Rng;
export default Rng;
