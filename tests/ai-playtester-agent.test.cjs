'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {loadMaster}=require('../tools/balance/master/loader.cjs'),D=require('../tools/balance/deep.cjs');
const {createAgent}=require('../tools/ai-playtester/agent.cjs');
const x=loadMaster({difficulty:'medium'}),S='stm.';
const fixture=(keys,o={})=>D.create(x,{seed:42,enemy:'wisp',deck:keys.map(k=>S+k),...o});
test('three skills return legal real plans without mutating the run',()=>{
 for(const skill of ['beginner','intermediate','expert']){const r=fixture(['attack.rune_strike','defend.rune_guard','attack.weak_point']),before=JSON.stringify(r),a=createAgent(x,{skill}).decide(r);assert.equal(JSON.stringify(r),before);assert.ok(a.explanation.length>5);assert.ok(a.searchNodes<=300);if(a.kind==='play'){const c=r.battle.hand.find(c=>c.uid===a.uid);assert.ok(c);assert.ok(x.E.cardPlan({...r,battle:{...r.battle,boostArmed:a.focus}},c).legal);}}
});
test('expert finds Weak Point before Rune Strike and Focus lethal',()=>{
 const r=fixture(['attack.rune_strike','attack.weak_point']),a=createAgent(x,{skill:'expert'}).decide(r);assert.equal(r.battle.hand.find(c=>c.uid===a.uid).key,S+'attack.weak_point');assert.ok(a.depth>=2);
 const lethal=fixture(['attack.rune_sweep'],{initialFocus:1});lethal.battle.hp=15;const b=createAgent(x,{skill:'expert'}).decide(lethal);assert.equal(b.focus,true);x.E.armFocus(lethal);x.E.playCard(lethal,b.uid);assert.notEqual(lethal.scene,'battle');assert.ok(x.E.validate(lethal));
});
test('expert blocks visible lethal and ends turn when no legal card exists',()=>{
 const r=fixture(['attack.rune_strike','defend.rune_guard'],{initialHp:2});r.battle.energy=1;const a=createAgent(x,{skill:'expert'}).decide(r);assert.equal(r.battle.hand.find(c=>c.uid===a.uid).key,S+'defend.rune_guard');r.battle.energy=0;assert.equal(createAgent(x,{skill:'expert'}).decide(r).kind,'endTurn');
});
test('hidden pile order and gameplay RNG do not influence any skill',()=>{
 const r=fixture(['skill.quick_study','attack.rune_strike','defend.rune_guard','attack.weak_point','attack.twin_shot','defend.flash_ward','passive.blazing_spirit']),other=JSON.parse(JSON.stringify(r));other.battle.draw.reverse();other.rng=123;for(const skill of ['beginner','intermediate','expert'])assert.deepEqual(createAgent(x,{skill}).decide(r),createAgent(x,{skill}).decide(other));
});
test('expert samples unknown draws and respects its transition/turn budgets',()=>{
 const r=fixture(['skill.quick_study','attack.rune_sweep','defend.rune_guard','attack.weak_point','attack.rune_strike','attack.fate_storm']),a=createAgent(x,{skill:'expert'}).decide(r);assert.equal(a.hiddenInformationUsed,false);assert.ok(a.sampledReveals>0);assert.ok(a.searchNodes<=300);assert.ok(a.depth<=3);assert.ok(a.horizonTurns<=3);assert.equal(a.samples,3);
});
test('unknown skill and pending questions are rejected',()=>{assert.throws(()=>createAgent(x,{skill:'oracle'}));const r=fixture(['attack.rune_strike']);x.E.forecast(r);assert.throws(()=>createAgent(x,{skill:'expert'}).decide(r),/question|decision/i);});
