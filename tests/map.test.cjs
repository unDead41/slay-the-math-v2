const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../dist/engine.js');
const copy = value => JSON.parse(JSON.stringify(value));

// Isolate travel rules from combat balance; campaign.test exercises real fights.
function completeRoom(run, reward = null) {
  if (run.scene === 'battle') {
    run.battle.hp = 0;
    run.scene = 'reward';
    run.rewards = ['blast', 'fort', 'balance'];
    E.chooseReward(run, reward);
  } else if (run.scene === 'camp') E.camp(run, 'heal');
  else if (run.scene === 'event') E.event(run, 'heal');
  else if (run.scene === 'shop') E.leaveShop(run);
  else assert.fail('unexpected room ' + run.scene);
}

test('every generated route branches, merges and reaches exactly one boss without changing combat RNG', () => {
  for (const seed of [0, 1, 7, 42, 2026]) for (const stage of [0, 1]) {
    const run = E.newRun(seed, 'learn', 2);
    run.stage = stage;
    const before = run.rng;
    const map = E.getMap(run);
    assert.equal(run.rng, before);
    assert.deepEqual(E.getMap(copy(run)), map);
    assert.equal(map.nodes.filter(n => n.type === 'boss').length, 1);
    assert.ok(map.nodes.some(n => n.next.length > 1), 'missing fork');
    assert.ok(map.nodes.some(n => map.nodes.filter(p => p.next.includes(n.id)).length > 1), 'missing merge');
    const reachable = new Set(map.nodes.filter(n => n.depth === 0).map(n => n.id));
    for (let depth = 0; depth < 4; depth++) for (const node of map.nodes.filter(n => n.depth === depth)) {
      assert.ok(reachable.has(node.id), 'orphan room');
      assert.ok(node.next.length, 'dead end before boss');
      for (const id of node.next) {
        const next = map.nodes.find(n => n.id === id);
        assert.equal(next.depth, node.depth + 1, 'path skips a floor');
        reachable.add(id);
      }
    }
    assert.equal(reachable.size, map.nodes.length);
  }
});

test('travel rejects skipped floors, disconnected rooms and already completed nodes without mutation', () => {
  const run = E.newRun(7, 'learn', 2);
  const map = E.getMap(run);
  const boss = map.nodes.find(n => n.type === 'boss');
  const before = copy(run);
  assert.throws(() => E.enterNode(run, boss.id));
  assert.deepEqual(run, before);
  const entry = E.availableNodes(run).find(n => n.next.length < 3);
  E.enterNode(run, entry.id);
  assert.equal(E.availableNodes(run).length, 0);
  assert.throws(() => E.enterNode(run, entry.id));
  completeRoom(run);
  assert.deepEqual(run.route.path, [entry.id]);
  assert.equal(run.depth, 1);
  const allowed = E.availableNodes(run).map(n => n.id);
  assert.deepEqual(allowed.slice().sort(), entry.next.slice().sort());
  const disconnected = map.nodes.find(n => n.depth === 1 && !allowed.includes(n.id));
  const progressed = copy(run);
  assert.throws(() => E.enterNode(run, disconnected.id));
  assert.throws(() => E.enterNode(run, entry.id));
  assert.deepEqual(run, progressed);
  assert.ok(E.validate(run));
});

test('connected rest and event rooms have their own actions on either middle floor', () => {
  const seen = new Set();
  for (const seed of [1, 7, 42]) {
    const root = E.newRun(seed, 'learn', 2);
    let frontier = [root];
    for (let depth = 0; depth < 4; depth++) {
      const next = [];
      for (const state of frontier) for (const node of E.availableNodes(state)) {
        const run = copy(state);
        E.enterNode(run, node.id);
        assert.ok(E.validate(run), node.id);
        if (node.type === 'camp' || node.type === 'event') {
          seen.add(node.depth + ':' + node.type);
          run.hp = 20;
          completeRoom(run);
          assert.equal(run.hp, node.type === 'camp' ? 32 : 28);
        } else completeRoom(run);
        assert.ok(E.validate(run));
        next.push(run);
      }
      frontier = next;
    }
  }
  assert.deepEqual([...seen].sort(), ['2:camp', '2:event', '3:camp', '3:event']);
});

test('elite risk awards an upgraded card while ordinary rewards remain unupgraded', () => {
  for (const elite of [false, true]) {
    const run = E.newRun(42, 'learn', 2);
    const map = E.getMap(run);
    const target = map.nodes.find(n => n.depth === 1 && (n.type === 'elite') === elite);
    const entry = map.nodes.find(n => n.depth === 0 && n.next.includes(target.id));
    E.enterNode(run, entry.id);
    completeRoom(run);
    E.enterNode(run, target.id);
    assert.equal(run.battle.elite, elite);
    completeRoom(run, 'blast');
    assert.equal(run.deck.at(-1).key, 'blast');
    assert.equal(run.deck.at(-1).upgraded, elite);
    assert.ok(E.validate(run));
  }
});

test('save/reload preserves the exact chosen branch and rejects a forged path or active room', () => {
  const run = E.newRun(2026, 'learn', 2);
  E.enterNode(run, E.availableNodes(run)[2].id);
  completeRoom(run);
  const saved = copy(run);
  assert.ok(E.validate(saved));
  assert.deepEqual(E.availableNodes(saved), E.availableNodes(run));
  const broken = copy(saved);
  broken.route.path[0] = E.getMap(run).nodes.find(n => n.depth === 4).id;
  assert.equal(E.validate(broken), false);
  const active = copy(saved);
  E.enterNode(active, E.availableNodes(active)[0].id);
  assert.ok(E.validate(copy(active)));
  active.route.active = 'invented-room';
  assert.equal(E.validate(active), false);
});

test('stage-two checkpoint restarts its saved map and legacy saves can still complete their route', () => {
  for (const legacy of [false, true]) {
    const run = E.newRun(81, 'learn', 2);
    if (legacy) delete run.route;
    while (run.depth < 4) {
      E.enterNode(run, E.availableNodes(run).find(n => n.type !== 'elite').id);
      completeRoom(run);
    }
    E.enterNode(run, E.availableNodes(run)[0].id);
    run.battle.hp = 0;
    run.battle.seals = 2;
    run.scene = 'stageclear';
    assert.ok(E.validate(run));
    E.nextStage(run);
    const checkpoint = copy(run);
    assert.equal(run.stage, 1);
    assert.equal(E.availableNodes(run).length, 3);
    E.enterNode(run, E.availableNodes(run)[1].id);
    run.hp = 0;
    run.scene = 'defeat';
    const retry = E.retry(copy(run));
    assert.deepEqual(E.getMap(retry), E.getMap(checkpoint));
    assert.deepEqual(retry.route, checkpoint.route);
    assert.deepEqual(E.availableNodes(retry), E.availableNodes(checkpoint));
    assert.ok(E.validate(retry));
  }
});
