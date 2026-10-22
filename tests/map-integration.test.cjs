const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../dist/engine.js');
const copy = value => JSON.parse(JSON.stringify(value));

function finish(run) {
  if (run.scene === 'battle') {
    run.battle.hp = 0;
    if (run.battle.enemyId === 'sentinel' || run.battle.enemyId === 'dealer') {
      run.battle.seals = 2;
      run.scene = run.stage ? 'victory' : 'stageclear';
    } else {
      run.scene = 'reward'; run.rewards = ['strike', 'guard', 'draw'];
      E.chooseReward(run, null);
    }
  } else if (run.scene === 'shop') E.leaveShop(run);
  else if (run.scene === 'camp') E.camp(run, 'heal');
  else if (run.scene === 'event') E.leaveMystery(run);
  else assert.fail('Unexpected room ' + run.scene);
}

test('new runs use the supplied 100-seed ten-level maps with the exact global quotas', () => {
  const quotas = {3: [1, 4, 2], 4: [2, 6, 3], 5: [3, 7, 4]};
  for (let seed = 0; seed < 100; seed++) for (let stage = 0; stage < 2; stage++) {
    const r = E.newRun(seed); r.stage = stage;
    // Stage snapshots are initialized only by newRun/nextStage, never by viewing.
    if (stage) { r.stage = 0; r.scene = 'stageclear'; E.nextStage(r); }
    assert.equal(r.route.version, 3);
    assert.ok(r.route.snapshot, 'Map snapshot must be in the saved run');
    const before = copy(r), map = E.getMap(r);
    assert.equal(map.floors, 10);
    const entries = map.nodes.filter(n => n.depth === 0).length;
    assert.deepEqual(['shop','elite','camp'].map(type => map.nodes.filter(n => n.type === type).length), quotas[entries]);
    assert.ok(map.nodes.filter(n => n.depth === 4).every(n => n.type === 'event'));
    assert.ok(map.nodes.filter(n => n.depth === 8).every(n => n.type === 'camp'));
    assert.equal(map.nodes.filter(n => n.depth === 9 && n.type === 'boss').length, 1);
    assert.deepEqual(r, before, 'Looking at the map must not mutate the save or combat RNG');
  }
});

test('all ten rooms, both bosses, save restore and the stage-two checkpoint follow the frozen graph', () => {
  let r = E.newRun(7);
  for (let stage = 0; stage < 2; stage++) {
    const snapshot = copy(r.route.snapshot);
    for (let depth = 0; depth < 10; depth++) {
      const nodes = E.availableNodes(r), target = nodes[0];
      const bad = E.getMap(r).nodes.find(n => n.depth !== depth);
      const before = copy(r);
      assert.throws(() => E.enterNode(r, bad.id));
      assert.deepEqual(r, before);
      E.enterNode(r, target.id);
      assert.ok(E.validate(r), `${stage}/${depth}/${target.type}`);
      r = E.restore(copy(r)); assert.ok(r);
      assert.deepEqual(r.route.snapshot, snapshot);
      finish(r); assert.ok(E.validate(r));
    }
    assert.equal(r.depth, 9);
    if (!stage) {
      E.nextStage(r); assert.ok(E.validate(r));
      const checkpoint = copy(r), retried = E.retry(r);
      assert.deepEqual(retried.route, checkpoint.route);
      assert.deepEqual(retried.rng, checkpoint.rng);
    }
  }
  assert.equal(r.scene, 'victory');
});

test('restoring a map rejects invalid snapshots and disconnected route progress', () => {
  const r = E.newRun(42);
  assert.ok(r.route.snapshot);
  const corrupt = copy(r); corrupt.route.snapshot.nodes[0].type = 'boss';
  assert.equal(E.restore(corrupt), null);
  const skip = copy(r); skip.route.path = [E.getMap(r).nodes.find(n => n.depth === 4).id]; skip.depth = 1;
  assert.equal(E.restore(skip), null);
  const injected=copy(r), oldId=injected.route.snapshot.nodes[0].id;
  injected.route.snapshot.nodes[0].id='" onclick="alert(1)';
  for(const edge of injected.route.snapshot.edges)if(edge.from===oldId)edge.from=injected.route.snapshot.nodes[0].id;
  for(const level of injected.route.snapshot.levels)level.nodeIds=level.nodeIds.map(id=>id===oldId?injected.route.snapshot.nodes[0].id:id);
  assert.equal(E.restore(injected),null);
});
