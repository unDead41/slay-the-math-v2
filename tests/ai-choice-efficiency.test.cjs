'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {loadMaster}=require('../tools/balance/master/loader.cjs'),D=require('../tools/balance/deep.cjs'),{createAgent,planningWorld}=require('../tools/ai-playtester/agent.cjs');
const S='stm.';
function fixture(keys,opening,extra={}){const x=loadMaster({difficulty:'medium'}),r=D.create(x,{seed:42,enemy:'golem',deck:keys.map(k=>S+k),openingKeys:opening.map(k=>S+k),...extra});const all=[...r.battle.hand,...r.battle.draw];r.battle.hand=[];for(const key of opening){const i=all.findIndex(c=>c.key===S+key);assert.ok(i>=0);r.battle.hand.push(all.splice(i,1)[0]);}r.battle.draw=all;assert.ok(x.E.validate(r));return {x,r,agent:createAgent(x)};}
function windowCards(f,keys){const draw=f.r.battle.draw;for(const key of keys.slice().reverse()){const i=draw.findIndex(c=>c.key===S+key);assert.ok(i>=0,key);draw.push(draw.splice(i,1)[0]);}assert.ok(f.x.E.validate(f.r));}
function play(f,key){f.x.E.playCard(f.r,f.r.battle.hand.find(c=>c.key===S+key).uid);assert.ok(f.x.E.validate(f.r));}
test('Card Search chooses a usable lethal Attack instead of Block against positive incoming damage',()=>{
 const f=fixture(['skill.card_search',...Array(6).fill('attack.rune_strike'),...Array(5).fill('defend.rune_guard')],['skill.card_search']);f.r.battle.energy=2;f.r.battle.hp=4;play(f,'skill.card_search');assert.equal(f.r.battle.cardChoice.committed,false);
 const before=JSON.stringify(f.r),value=f.agent.choose(f.r);assert.equal(value,'attack');assert.equal(JSON.stringify(f.r),before);
 f.x.E.chooseCardOption(f.r,value);const c=f.r.battle.hand.find(c=>c.key===S+'attack.rune_strike');assert.ok(c);f.x.E.playCard(f.r,c.uid);assert.notEqual(f.r.scene,'battle');assert.ok(f.x.E.validate(f.r));
});
test('Card Search accounts for its unpaid Energy before choosing a category',()=>{
 const f=fixture(['skill.card_search','skill.burning_page',...Array(5).fill('attack.rune_sweep'),...Array(5).fill('defend.rune_guard')],['skill.card_search']);f.r.battle.energy=1;play(f,'skill.card_search');
 const before=JSON.stringify(f.r);assert.equal(f.agent.choose(f.r),'skill');assert.equal(JSON.stringify(f.r),before);
});
test('Burning Page replaces an unplayable reveal using only public remaining composition',()=>{
 const f=fixture(['skill.burning_page','attack.rune_sweep',...Array(10).fill('attack.rune_strike')],['skill.burning_page']);f.r.battle.energy=1;windowCards(f,['attack.rune_sweep']);play(f,'skill.burning_page');assert.equal(f.r.battle.cardChoice.kind,'burning_page');
 const before=JSON.stringify(f.r),other=JSON.parse(before);other.battle.draw.reverse();other.rng=99;
 assert.equal(f.agent.choose(f.r),'replace');assert.equal(f.agent.choose(other),'replace');assert.equal(JSON.stringify(f.r),before);
 f.x.E.chooseCardOption(f.r,'replace');assert.equal(f.r.battle.cardChoice,null);assert.ok(f.r.battle.hand.some(c=>c.key===S+'attack.rune_strike'));assert.ok(f.x.E.validate(f.r));
});
test('Burning Page keeps a useful reveal when the unseen pool cannot improve it',()=>{
 const f=fixture(['skill.burning_page','attack.rune_strike',...Array(10).fill('attack.rune_sweep')],['skill.burning_page']);f.r.battle.energy=1;windowCards(f,['attack.rune_strike']);play(f,'skill.burning_page');assert.equal(f.agent.choose(f.r),'take');
});
test('paid Read Ahead chooses the free playable card without deducting its cost twice',()=>{
 const f=fixture(['skill.read_ahead','skill.burning_page','attack.rune_sweep',...Array(9).fill('attack.rune_strike')],['skill.read_ahead']);f.r.battle.energy=1;windowCards(f,['attack.rune_sweep','attack.rune_strike','skill.burning_page']);play(f,'skill.read_ahead');assert.equal(f.r.battle.energy,0);assert.equal(f.r.battle.cardChoice.committed,true);
 const before=JSON.stringify(f.r),v=f.agent.choose(f.r),candidate=f.r.battle.cardChoice.candidates.find(c=>c.uid===v.take);assert.equal(candidate.key,S+'skill.burning_page');assert.equal(v.order.length,2);assert.equal(new Set([v.take,...v.order]).size,3);assert.equal(JSON.stringify(f.r),before);
 f.x.E.chooseCardOption(f.r,v);assert.ok(f.x.E.validate(f.r));assert.ok(f.x.E.cardPlan(f.r,f.r.battle.hand.find(c=>c.uid===v.take)).legal);
});
test('sampled planning reconstructs unknown composition around already revealed choice cards',()=>{
 const f=fixture(['skill.read_ahead','skill.burning_page','attack.rune_sweep',...Array(9).fill('attack.rune_strike')],['skill.read_ahead']);play(f,'skill.read_ahead');const before=JSON.stringify(f.r),world=planningWorld(f.r),other=JSON.parse(before);other.battle.draw.reverse();other.rng=1;
 assert.ok(f.x.E.validate(world));assert.deepEqual(world.battle.cardChoice.candidates,f.r.battle.cardChoice.candidates);assert.deepEqual(world.battle.draw,planningWorld(other).battle.draw);assert.equal(JSON.stringify(f.r),before);
});
test('one candidate pass reuses the exact incoming projection for unchanged Attack plans',()=>{
 const f=fixture(Array(12).fill('attack.rune_strike'),Array(4).fill('attack.rune_strike'));const before=JSON.stringify(f.r),original=f.x.CC.enemyDamage;let projections=0;
 f.x.CC.enemyDamage=(...args)=>{projections++;return original(...args);};const a=f.agent.decide(f.r);assert.equal(a.kind,'play');assert.ok(projections<=1,'unchanged Attack plans should share one projection, got '+projections);assert.equal(JSON.stringify(f.r),before);
});
test('ineligible Passive definitions never request a redundant Focus plan',()=>{
 const f=fixture(['passive.blazing_spirit',...Array(11).fill('attack.rune_strike')],['passive.blazing_spirit'],{initialFocus:3}),original=f.x.E.cardPlan;let focusedPlans=0;
 f.x.E.cardPlan=(r,c)=>{focusedPlans+=Number(!!r.battle.boostArmed);return original(r,c);};const a=f.agent.decide(f.r);assert.equal(a.kind,'play');assert.equal(a.focus,false);assert.equal(focusedPlans,0);
});
