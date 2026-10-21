(function (root) {
  'use strict';
  const C = typeof module !== 'undefined' ? require('./config.js') : root.DCConfig;
  const RNG = typeof module !== 'undefined' ? require('./map-rng.js') : root.SlayMathRNG;
  const kinds = {
    battle: {label: 'Battle', icon: 'sword', detail: 'Win to choose one reward card.'},
    shop: {label:'Shop',icon:'coin',detail:'Spend Gold to buy cards. You may leave without buying.'},
    elite: {label: 'Elite', icon: 'elite', detail: 'Enemy has +10 HP and +2 base damage. Reward cards are upgraded.'},
    camp: {label: 'Rest Site', icon: 'flame', detail: 'Restore 12 HP or upgrade one card.'},
    event: {label: 'Mystery', icon: 'orb', detail: 'Restore 8 HP or remove one card from your deck.'},
    boss: {label: 'Boss', icon: 'crown', detail: 'Break two seals with Predict and beat the stage boss.'}
  };

  // A separate deterministic seed keeps route inspection independent of card RNG.
  function create(stage, seed, legacy = false, version = 1) {
    const s = C.stages[stage];
    const variant = ((seed >>> 0) ^ Math.imul(stage + 1, 2654435761)) >>> 0;
    const shift = variant % 3;
    const rows = legacy
      ? [['battle'], ['battle', 'elite'], ['camp'], ['event'], ['boss']]
      : [['battle', 'battle', 'battle'], ['battle', 'elite', 'battle'], version>=2?['camp','shop','event']:['camp', 'event', 'camp'], ['event', 'camp', 'event'], ['boss']];
    const nodes = [];
    rows.forEach((types, depth) => types.forEach((_, lane) => {
      const type = !legacy && types.length === 3 ? types[(lane + shift) % 3] : types[lane];
      const enemyId = type === 'boss' ? s.boss : type === 'elite' ? (version>=2?s.elites?.[variant%2]||s.elite:s.elite) : version>=2?(s.normals?.[depth===0?lane:(lane+1)%3]||s.basic):depth===0?s.basic:s.ordinary;
      nodes.push({
        id: 's' + stage + '-r' + depth + '-c' + lane,
        depth, lane, type,
        ...kinds[type],
        name: type === 'boss' ? C.enemies[s.boss].name : depth === 0 ? ['Ember Gate', 'Archive Steps', 'Crystal Path'][lane] : kinds[type].label,
        enemyId: ['battle', 'elite', 'boss'].includes(type) ? enemyId : null,
        x: types.length === 1 ? 50 : types.length === 2 ? 35 + lane * 30 : 19 + lane * 31,
        y: 86 - depth * 18,
        next: []
      });
    }));
    for (let depth = 0; depth < 4; depth++) {
      const row = nodes.filter(n => n.depth === depth);
      const next = nodes.filter(n => n.depth === depth + 1);
      for (const node of row) {
        if (legacy || next.length === 1) node.next = next.map(n => n.id);
        else node.next.push(next[node.lane].id);
      }
      if (!legacy && next.length === 3) {
        // One diagonal per gap; never draw opposite crossing diagonals.
        for (let gap = 0; gap < 2; gap++) {
          const leftToRight = ((variant >>> (depth * 2 + gap)) & 1) === 0;
          const from = row[gap + (leftToRight ? 0 : 1)];
          const to = next[gap + (leftToRight ? 1 : 0)];
          from.next.push(to.id);
        }
      }
    }
    return {nodes, floors: 5, legacy};
  }

  function begin(stage, seed, version = 3) {
    if (version < 3) return {version, path: [], active: null};
    const catalogueSeed = 'STM-' + String((seed >>> 0) % 100 + 1).padStart(3, '0');
    return {version: 3, path: [], active: null, catalogueSeed,
      snapshot: RNG.generateMap(catalogueSeed, {stage: stage + 1})};
  }

  function fromSnapshot(run) {
    const raw = run.route.snapshot, stage = C.stages[run.stage];
    const nodes = raw.nodes.map(n => {
      const type = n.type === 'rest' ? 'camp' : n.type === 'mystery' ? 'event' : n.type;
      const roster = type === 'elite' ? stage.elites : stage.normals;
      const enemyId = type === 'boss' ? stage.boss : ['battle','elite'].includes(type)
        ? roster[(n.level + n.column + (run.seed % roster.length)) % roster.length] : null;
      return {id: n.id, depth: n.level - 1, lane: n.column, type, ...kinds[type],
        name: enemyId ? C.enemies[enemyId].name : kinds[type].label, enemyId,
        x: n.x * 100, y: 92 - (n.level - 1) * 9.2,
        next: raw.edges.filter(e => e.from === n.id).map(e => e.to)};
    });
    return {nodes, floors: 10, legacy: false, seed: raw.seed, initialPaths: raw.initialPaths};
  }

  function get(run) {
    return run.route?.version === 3 ? fromSnapshot(run)
      : create(run.stage, run.seed, run.route === undefined,run.route?.version||1);
  }

  function available(run) {
    if (run.scene !== 'map' || run.route?.active) return [];
    const map = get(run);
    if (!run.route || !run.depth) return map.nodes.filter(n => n.depth === run.depth);
    const previous = map.nodes.find(n => n.id === run.route.path.at(-1));
    return map.nodes.filter(n => previous?.next.includes(n.id));
  }

  function valid(run) {
    if (run.route === undefined) return true; // Original v1 saves remain playable.
    const route = run.route;
    if (!route || ![1,2,3].includes(route.version) || !Array.isArray(route.path) || route.path.length !== run.depth ||
        new Set(route.path).size !== route.path.length || (route.active !== null && typeof route.active !== 'string')) return false;
    if (route.version === 3) {
      const snapshot = route.snapshot;
      if (!snapshot || snapshot.stage !== run.stage + 1 || snapshot.seed !== route.catalogueSeed ||
          route.catalogueSeed !== 'STM-' + String((run.seed >>> 0) % 100 + 1).padStart(3, '0') ||
          snapshot.nodes?.length > 50 || snapshot.edges?.length > 100 || !RNG.validateMap(snapshot).valid) return false;
      if (snapshot.nodes.some(n => n.id !== 's' + snapshot.stage + '-l' + String(n.level).padStart(2,'0') + '-n' + (n.column + 1))) return false;
    }
    const map = get(run);
    let previous;
    for (let depth = 0; depth < route.path.length; depth++) {
      const node = map.nodes.find(n => n.id === route.path[depth] && n.depth === depth);
      if (!node || (previous && !previous.next.includes(node.id))) return false;
      previous = node;
    }
    if (run.scene === 'master') return run.stage===0 && run.depth===0 && route.active===null;
    if (run.scene === 'map') return route.active === null;
    const active = map.nodes.find(n => n.id === route.active && n.depth === run.depth);
    if (!active || (previous && !previous.next.includes(active.id))) return false;
    if (run.scene === 'camp' || run.scene === 'event' || run.scene === 'shop') return active.type === run.scene && !run.battle;
    if (!['battle', 'elite', 'boss'].includes(active.type) || run.battle?.enemyId !== active.enemyId ||
        run.battle.elite !== (active.type === 'elite')) return false;
    if (run.scene === 'reward') return active.type !== 'boss';
    if (run.scene === 'stageclear' || run.scene === 'victory') return active.type === 'boss';
    return run.scene === 'battle' || run.scene === 'defeat';
  }

  const api = {begin, get, available, valid};
  if (typeof module !== 'undefined') module.exports = api;
  else root.DCMap = api;
})(typeof window !== 'undefined' ? window : globalThis);
