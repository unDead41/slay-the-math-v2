'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {loadMaster}=require('../tools/balance/master/loader.cjs'),D=require('../tools/balance/deep.cjs');
const S='stm.';
function fixture(keys,extra={}){
 const x=loadMaster({difficulty:'medium'}),deck=keys.map(k=>S+k),r=D.create(x,{seed:42,enemy:'wisp',deck,...extra});
 const {createEffectsTracker}=require('../tools/ai-playtester/effects.cjs'),t=createEffectsTracker(x);
 return {x,r,t,play(key){const c=r.battle.hand.find(c=>c.key===S+key);assert.ok(c,key);t.capture(r,()=>x.E.playCard(r,c.uid));},end(){t.capture(r,()=>x.E.endTurn(r));}};
}
test('actual Block is allocated once, then unused remainder expires on reset',()=>{
 const f=fixture(['defend.rune_guard','defend.tower_shield']);try{
  f.play('defend.rune_guard');f.play('defend.tower_shield');f.end();const m=f.t.snapshot();
  assert.equal(m.totals.blockGranted,20);assert.equal(m.totals.blockUsed,5);assert.equal(m.totals.blockExpired,15);
  assert.equal(m.cards[S+'defend.rune_guard'].blockUsed,5);assert.equal(m.cards[S+'defend.tower_shield'].blockExpired,14);
  assert.equal(m.totals.plays,2);assert.equal(m.totals.energySpent,3);assert.equal(m.cards[S+'defend.tower_shield'].efficiency.blockUsedPerEnergy,0);
 }finally{f.t.dispose();}
});
test('Weak and Defense report actual layered reduction and actual Block absorption',()=>{
 const f=fixture(['defend.cinder_guard','passive.rune_armor']);try{
  f.play('passive.rune_armor');f.play('defend.cinder_guard');f.end();const m=f.t.snapshot();
  assert.equal(m.totals.weakPrevented,2);assert.equal(m.totals.defensePrevented,1);assert.equal(m.totals.blockUsed,2);assert.equal(m.totals.blockExpired,3);
  assert.equal(m.cards[S+'defend.cinder_guard'].weakPrevented,2);assert.equal(m.cards[S+'passive.rune_armor'].defensePrevented,1);assert.equal(m.cards[S+'passive.rune_armor'].defenseGranted,1);
 }finally{f.t.dispose();}
});
test('delayed and Passive draw report actual cards, not printed requests',()=>{
 const keys=['skill.next_chapter','passive.clear_mind',...Array(10).fill('attack.rune_strike')],f=fixture(keys,{openingKeys:[S+'skill.next_chapter',S+'passive.clear_mind']});try{
  f.play('skill.next_chapter');f.play('passive.clear_mind');f.end();const m=f.t.snapshot();
  assert.equal(m.cards[S+'skill.next_chapter'].cardsDrawn,2);assert.equal(m.cards[S+'passive.clear_mind'].cardsDrawn,1);assert.equal(m.cards[S+'passive.clear_mind'].passiveTriggers,1);
  assert.equal(m.totals.plays,2);assert.equal(m.totals.cardsDrawn,3);assert.ok(f.x.E.validate(f.r));
 }finally{f.t.dispose();}
});
test('actual direct draw respects the Hand cap and free-card ratios stay null',()=>{
 const keys=['skill.quick_study','defend.flash_ward',...Array(10).fill('attack.rune_strike')],f=fixture(keys,{openingKeys:[S+'skill.quick_study',S+'defend.flash_ward']});try{
  while(f.r.battle.hand.length<10)f.r.battle.hand.push(f.r.battle.draw.pop());
  f.play('skill.quick_study');f.play('defend.flash_ward');const m=f.t.snapshot();
  assert.equal(m.cards[S+'skill.quick_study'].cardsDrawn,1);assert.equal(m.cards[S+'defend.flash_ward'].energySpent,0);assert.equal(m.cards[S+'defend.flash_ward'].efficiency.blockUsedPerEnergy,null);
 }finally{f.t.dispose();}
});
test('carried Block keeps its source and terminal remainder is unused',()=>{
 const f=fixture(['defend.hold_the_line','attack.rune_strike']);try{
  f.play('defend.hold_the_line');f.end();let m=f.t.snapshot();assert.equal(m.totals.blockUsed,5);assert.equal(m.totals.blockExpired,2);assert.equal(m.totals.blockRemaining,5);assert.equal(m.cards[S+'defend.hold_the_line'].blockRetained,5);
  f.r.battle.hp=1;f.play('attack.rune_strike');m=f.t.snapshot();assert.equal(m.totals.blockUnused,5);assert.equal(m.totals.blockRemaining,0);assert.equal(m.totals.blockGranted,m.totals.blockUsed+m.totals.blockExpired+m.totals.blockUnused);
 }finally{f.t.dispose();}
});
test('failed card actions and uncaptured planning never enter effects telemetry',()=>{
 const f=fixture(['attack.rune_strike','passive.blazing_spirit']);try{
  const original=f.x.L.record,before=f.t.snapshot();assert.throws(()=>f.t.capture(f.r,()=>f.x.E.playCard(f.r,'missing')));assert.deepEqual(f.t.snapshot(),before);
  require('../tools/ai-playtester/agent.cjs').createAgent(f.x,{skill:'expert'}).decide(f.r);assert.deepEqual(f.t.snapshot(),before);
  f.play('passive.blazing_spirit');f.play('attack.rune_strike');const m=f.t.snapshot();assert.equal(m.totals.plays,2);assert.equal(m.cards[S+'passive.blazing_spirit'].strengthGranted,2);assert.ok(m.cards[S+'passive.blazing_spirit'].buffedHits>0);
  f.t.dispose();assert.notEqual(f.x.L.record,original);assert.ok(f.x.E.validate(f.r));
 }finally{f.t.dispose();}
});
test('completed experiment reports actual support units alongside paid resources',()=>{
 const {experiment}=require('../tools/ai-playtester/experiments.cjs'),r=experiment({mode:'cards',cards:[S+'defend.cinder_guard'],skill:'intermediate',predict:'skip',seed:40,seeds:1});
 for(const v of r.rows){assert.ok(v.ai.effects);assert.equal(v.ai.effects.totals.plays,v.committedCardPlays);assert.equal(v.ai.effects.totals.energySpent,v.ai.energySpent);const t=v.ai.effects.totals;assert.equal(t.blockGranted,t.blockUsed+t.blockExpired+t.blockUnused+t.blockRemaining);}
 const card=r.summary.cardUsage.find(c=>c.cardId===S+'defend.cinder_guard');assert.ok(card.blockUsed>0);assert.ok(card.weakPrevented>0);assert.ok(Number.isFinite(card.efficiency.mitigationPerEnergy));
});
test('retention support credits the dominant cap without adding retained Block twice',()=>{
 const f=fixture(['defend.hold_the_line','passive.lasting_shield']);try{f.play('passive.lasting_shield');f.play('defend.hold_the_line');f.end();const m=f.t.snapshot();assert.equal(m.cards[S+'defend.hold_the_line'].blockRetained,5);assert.equal(m.cards[S+'passive.lasting_shield'].blockRetained,0);assert.equal(m.totals.blockGranted,12);assert.equal(m.totals.blockRemaining,5);}finally{f.t.dispose();}
});
test('support counters track actual Vulnerable use and Strength involvement without extra damage',()=>{
 const f=fixture(['passive.blazing_spirit','attack.weak_point','attack.rune_strike']);try{f.play('passive.blazing_spirit');f.play('attack.weak_point');f.play('attack.rune_strike');const m=f.t.snapshot();assert.equal(m.cards[S+'attack.weak_point'].vulnerableHits,1);assert.equal(m.cards[S+'attack.weak_point'].statusesConsumed,1);assert.equal(m.cards[S+'passive.blazing_spirit'].buffedHits,2);assert.equal(m.totals.hpDamage,16);}finally{f.t.dispose();}
});
test('Weak on a nonattacking turn expires without reporting prevented damage',()=>{
 const f=fixture(['defend.cinder_guard']);try{f.end();f.end();assert.equal(f.r.battle.currentIntent.damage,0);f.play('defend.cinder_guard');f.end();const c=f.t.snapshot().cards[S+'defend.cinder_guard'];assert.equal(c.statusesApplied,1);assert.equal(c.weakConsumed,0);assert.equal(c.weakPrevented,0);assert.equal(c.blockUsed,0);}finally{f.t.dispose();}
});
