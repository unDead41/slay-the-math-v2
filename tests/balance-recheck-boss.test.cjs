'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const {loadRuntime} = require('../tools/balance/recheck/runtime.cjs');
const {CONTEXTS} = require('../tools/balance/recheck/jobs.cjs');
const D = require('../tools/balance/deep.cjs');
const {arrange} = require('../tools/balance/artifact-probes.cjs');
const key = name => 'stm.attack.' + name;
for (const context of CONTEXTS) {
  const label = context.family + '/' + context.difficulty;
  test(label + ': crossing boss half HP preserves the locked intent and has no immediate player hit', () => {
    const x = loadRuntime(context), r = D.create(x, {seed: 261024010, enemy: 'dealer', deck: x.data.cards.map(c => c.id)});
    r.battle.hp = Math.ceil(r.battle.maxHp / 2) + 1; r.battle.enemyBlock = 0; r.battle.seals = 2;
    arrange(r, [key('fate_storm')]); assert.ok(x.E.validate(r));
    const locked = x.E.clone(r.battle.currentIntent), hp = r.hp;
    x.E.playCard(r, r.battle.hand[0].uid);
    assert.ok(r.battle.hp <= r.battle.maxHp / 2 && r.battle.hp > 0);
    assert.deepEqual(r.battle.currentIntent, locked); assert.equal(r.hp, hp);
    x.E.endTurn(r);
    assert.equal(hp - r.hp, locked.damage * (locked.hits || 1));
    if (x.C.COMBAT_BALANCE) {assert.equal(r.battle.currentIntent.phase, 2);assert.equal(r.battle.phase2, true);}
    else assert.ok(r.battle.currentIntent.rage >= 2);
    assert.ok(x.E.validate(r)); assert.ok(x.E.restore(x.E.clone(r)));
  });
  test(label + ': a sealed boss survives lethal cards until two actual Predict transactions open seals', () => {
    const x = loadRuntime(context), r = D.create(x, {seed: 261024011, enemy: 'dealer', deck: x.data.cards.map(c => c.id)});
    r.battle.hp = 2; r.battle.enemyBlock = 0;
    arrange(r, [key('rune_sweep')]); x.E.playCard(r, r.battle.hand[0].uid);
    assert.equal(r.battle.hp, 1); assert.equal(r.scene, 'battle');
    const meter = D.meter();
    D.predictOne(x, r, {seed: r.seed, predictProfile: 'assisted'}, meter);
    assert.equal(r.battle.seals, 1); assert.equal(meter.predict.focus, 0);
    x.E.endTurn(r);
    D.predictOne(x, r, {seed: r.seed, predictProfile: 'assisted'}, meter);
    assert.equal(r.battle.seals, 2); assert.equal(meter.predict.seals, 2); assert.equal(meter.predict.focus, 0);
    arrange(r, [key('sure_hit')]); x.E.playCard(r, r.battle.hand[0].uid);
    assert.equal(r.battle.hp, 0); assert.equal(r.scene, 'victory');
    assert.ok(x.E.validate(r)); assert.ok(x.E.restore(x.E.clone(r)));
  });
}
