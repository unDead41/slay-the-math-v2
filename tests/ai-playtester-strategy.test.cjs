'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {loadMaster}=require('../tools/balance/master/loader.cjs'),D=require('../tools/balance/deep.cjs');
const S='stm.';
function fixture(keys,opening,extra={}){const x=loadMaster({difficulty:'medium'}),r=D.create(x,{seed:42,enemy:'golem',deck:keys.map(k=>S+k),...extra}),all=[...r.battle.hand,...r.battle.draw];r.battle.hand=[];for(const key of opening){const i=all.findIndex(c=>c.key===S+key);r.battle.hand.push(all.splice(i,1)[0]);}r.battle.draw=all;r.battle.energy=1;assert.ok(x.E.validate(r));return {x,r};}
test('Expert sees the later payoff of activating Strength before future attacks',()=>{
 const {x,r}=fixture(['passive.blazing_spirit',...Array(11).fill('attack.rune_strike')],['passive.blazing_spirit','attack.rune_strike']),before=JSON.stringify(r),a=require('../tools/ai-playtester/agent.cjs').createAgent(x,{skill:'expert'}).decide(r);
 assert.equal(r.battle.hand.find(c=>c.uid===a.uid)?.key,S+'passive.blazing_spirit');assert.equal(JSON.stringify(r),before);assert.equal(a.horizonTurns,3);assert.equal(a.samples,3);
});
test('Expert reserves current Focus when a larger future benefit is available',()=>{
 const {x,r}=fixture(['attack.rune_strike',...Array(11).fill('attack.rune_sweep')],['attack.rune_strike'],{initialFocus:1}),a=require('../tools/ai-playtester/agent.cjs').createAgent(x,{skill:'expert'}).decide(r);
 assert.equal(a.kind,'play');assert.equal(a.uid,r.battle.hand[0].uid);assert.equal(a.focus,false);assert.ok(a.horizonTurns>=2);
});
test('planning samples inferred public deck composition and ignores hidden order and RNG',()=>{
 const {x,r}=fixture(['attack.rune_strike',...Array(6).fill('attack.rune_sweep'),...Array(5).fill('defend.rune_guard')],['attack.rune_strike']),{createAgent,planningWorld}=require('../tools/ai-playtester/agent.cjs'),other=JSON.parse(JSON.stringify(r));other.battle.draw.reverse();other.rng=123456;
 assert.equal(typeof planningWorld,'function');const a=planningWorld(r,0),b=planningWorld(r,1);assert.notDeepEqual(a.battle.draw.map(c=>c.uid),b.battle.draw.map(c=>c.uid));assert.deepEqual(a.battle.draw.map(c=>c.uid),planningWorld(other,0).battle.draw.map(c=>c.uid));assert.ok(x.E.validate(a));
 assert.deepEqual(createAgent(x,{skill:'expert'}).decide(r),createAgent(x,{skill:'expert'}).decide(other));
});
test('Expert actually advances cloned enemy turns and finishes only resolved cutoff states',()=>{
 const {x,r}=fixture(['skill.read_ahead',...Array(6).fill('attack.rune_strike'),...Array(5).fill('defend.rune_guard')],['skill.read_ahead']),{createAgent,LIMITS}=require('../tools/ai-playtester/agent.cjs'),original=x.E.endTurn,seen=[];
 x.E.endTurn=run=>{const result=original(run);seen.push({turn:run.battle.turn,valid:x.E.validate(run),pending:!!run.battle.cardChoice});return result;};
 const a=createAgent(x,{skill:'expert'}).decide(r);assert.ok(seen.some(s=>s.turn>=4));assert.ok(seen.every(s=>s.valid&&!s.pending));assert.ok(a.searchNodes<=LIMITS.nodes);assert.equal(a.hiddenInformationUsed,false);assert.ok(a.horizonTurns>0);assert.ok(a.sampledReveals>0);assert.match(a.explanation,/sample|turn/i);
});
test('actual Passive replacement shares the Expert policy and preserves useful Strength',()=>{
 const x=loadMaster({difficulty:'medium'}),keys=['passive.swift_step','passive.blazing_spirit','passive.rune_armor','passive.growing_flame',...Array(8).fill('attack.rune_strike')],r=D.create(x,{seed:42,enemy:'golem',deck:keys.map(k=>S+k),openingKeys:keys.slice(0,4).map(k=>S+k)});
 for(const key of keys.slice(0,3))x.E.playCard(r,r.battle.hand.find(c=>c.key===S+key).uid);x.E.endTurn(r);
 const all=[...r.battle.hand,...r.battle.draw,...r.battle.discard],g=all.splice(all.findIndex(c=>c.key===S+'passive.growing_flame'),1)[0];r.battle.hand=[g];r.battle.draw=all;r.battle.discard=[];assert.ok(x.E.validate(r));
 const agent=require('../tools/ai-playtester/agent.cjs').createAgent(x,{skill:'expert'}),a=agent.decide(r);assert.equal(a.uid,g.uid);x.E.playCard(r,a.uid);assert.equal(r.battle.cardChoice.kind,'passive_swap');assert.equal(typeof agent.choose,'function');x.E.chooseCardOption(r,agent.choose(r));assert.ok(r.battle.active.some(c=>c.key===S+'passive.blazing_spirit'));assert.ok(!r.battle.active.some(c=>c.key===S+'passive.swift_step'));assert.equal(r.battle.strength,2);assert.ok(x.E.validate(r));
});
