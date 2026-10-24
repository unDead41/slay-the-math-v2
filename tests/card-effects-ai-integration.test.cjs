'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {loadMaster}=require('../tools/balance/master/loader.cjs'),D=require('../tools/balance/deep.cjs');
const {createAgent}=require('../tools/ai-playtester/agent.cjs'),{createEffectsTracker}=require('../tools/ai-playtester/effects.cjs');
const S='stm.';
function fixture(names,x=loadMaster()){
 const keys=names.map(n=>x.data.cards.find(c=>c.name===n).id),r=D.create(x,{seed:42,enemy:'wisp',deck:[...keys,...Array(8).fill(S+'attack.rune_strike')],openingKeys:keys}),t=createEffectsTracker(x);
 return {x,r,t,play(name){const key=x.data.cards.find(c=>c.name===name).id,c=r.battle.hand.find(c=>c.key===key);assert.ok(c,name);t.capture(r,()=>x.E.playCard(r,c.uid));},end(){t.capture(r,()=>x.E.endTurn(r));}};
}
test('AI values whole-phase Weak using the real incoming multi-hit calculation without mutating the run',()=>{
 const f=fixture(['Cinder Guard','Tower Shield']);try{
  Object.assign(f.r.battle.currentIntent,{damage:20,hits:3});const before=JSON.stringify(f.r),a=createAgent(f.x).decide(f.r);
  assert.equal(f.r.battle.hand.find(c=>c.uid===a.uid).key,S+'defend.cinder_guard');assert.equal(JSON.stringify(f.r),before);
 }finally{f.t.dispose();}
});
test('AI credits every Vulnerable hit to its phase source, with one duration used',()=>{
 const f=fixture(['Weak Point','Twin Shot','Rune Strike']);try{
  f.play('Weak Point');f.play('Twin Shot');f.play('Rune Strike');const m=f.t.snapshot(),c=m.cards[S+'attack.weak_point'];
  assert.equal(c.vulnerableHits,3);assert.equal(c.statusesConsumed,1);assert.equal(m.totals.hpDamage,23);assert.equal(f.r.battle.cardCombat.statuses.enemy.vulnerable,1);
 }finally{f.t.dispose();}
});
test('AI Weak telemetry uses percentage rounding and Vulnerable before Defense on every hit',()=>{
 const f=fixture(['Rune Armor','Cinder Guard']);try{
  f.play('Rune Armor');f.play('Cinder Guard');Object.assign(f.r.battle.currentIntent,{damage:10,hits:3});f.r.battle.cardCombat.statuses.self.vulnerable=1;f.end();const m=f.t.snapshot();
  assert.equal(m.cards[S+'defend.cinder_guard'].weakPrevented,12);assert.equal(m.totals.weakPrevented,12);assert.equal(m.totals.defensePrevented,3);assert.equal(m.totals.blockUsed,4);assert.equal(m.totals.weakConsumed,1);
 }finally{f.t.dispose();}
});
test('AI keeps extended Weak ownership through later attack phases',()=>{
 const f=fixture(['Cinder Guard','Cinder Guard']);try{
  f.play('Cinder Guard');f.play('Cinder Guard');for(let i=0;i<2;i++){Object.assign(f.r.battle.currentIntent,{damage:8,hits:2});f.end();}
  const m=f.t.snapshot(),c=m.cards[S+'defend.cinder_guard'];assert.equal(c.weakPrevented,8);assert.equal(c.weakConsumed,2);assert.equal(c.statusesConsumed,2);assert.equal(f.r.battle.cardCombat.statuses.enemy.weak,0);
 }finally{f.t.dispose();}
});
test('AI retention credits Last Ember when its emergency carry exceeds Hold the Line',()=>{
 const f=fixture(['Last Ember','Hold the Line']);try{
  f.r.hp=22;f.play('Last Ember');f.play('Hold the Line');Object.assign(f.r.battle.currentIntent,{damage:16,hits:1});f.end();const m=f.t.snapshot();
  assert.equal(f.r.battle.block,6);assert.equal(m.cards[S+'passive.last_ember'].blockRetained,6);assert.equal(m.cards[S+'defend.hold_the_line'].blockRetained,0);assert.equal(m.totals.blockRemaining,6);
 }finally{f.t.dispose();}
});
test('archived ordinary AI observation retains flat per-hit status behavior',()=>{
 const f=fixture(['Weak Point','Twin Shot'],require('../tools/cards/legacy-runtime.cjs')());try{
  f.play('Weak Point');f.play('Twin Shot');const m=f.t.snapshot();assert.equal(m.cards[S+'attack.weak_point'].vulnerableHits,1);assert.equal(m.cards[S+'attack.weak_point'].statusesConsumed,1);assert.equal(m.totals.hpDamage,12);
 }finally{f.t.dispose();}
});
test('current Master map views use phase damage while archived replay retains its original calculation',()=>{
 const {createReplay}=require('../tools/balance/map/replay.cjs');
 for(const [x,incoming]of [[loadMaster(),45],[require('../tools/cards/legacy-runtime.cjs')(),58]]){
  const f=fixture(['Cinder Guard'],x);try{
   f.play('Cinder Guard');Object.assign(f.r.battle.currentIntent,{damage:20,hits:3});f.r.battle.block=4;
   const before=JSON.stringify(f.r),view=createReplay(x).publicCombatView(f.r);assert.equal(view.incoming,incoming);assert.equal(view.neededBlock,incoming-4);assert.equal(JSON.stringify(f.r),before);
  }finally{f.t.dispose();}
 }
});
