'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),zlib=require('node:zlib');
const {loadMaster}=require('../tools/balance/master/loader.cjs'),D=require('../tools/balance/deep.cjs');
const legacy={E:require('../dist/engine.js'),C:require('../dist/config.js'),A:require('../dist/artifacts.js'),CC:require('../dist/card-combat.js'),Q:require('../dist/education.js'),data:require('../dist/card-data.js')};
const S='stm.attack.',copy=x=>JSON.parse(JSON.stringify(x));
function hand(r,key){const b=r.battle,all=[...b.hand,...b.draw,...b.discard],i=all.findIndex(c=>c.key===key);assert.ok(i>=0);b.hand=[all.splice(i,1)[0]];b.draw=all;b.discard=[];return b.hand[0];}
function fixture(x,key,upgraded=false,focused=false){const r=D.create(x,{seed:280028,enemy:'wisp',deck:[{key,upgraded},...Array(11).fill('stm.defend.rune_guard')]});r.battle.hp=r.battle.maxHp=10000;r.battle.enemyBlock=0;r.battle.enemyDefense=0;const c=hand(r,key);if(focused){r.battle.focus=1;x.E.armFocus(r);}return {r,c};}
for(const mode of ['legacy','easy','medium','hard']){
 const runtime=()=>mode==='legacy'?legacy:loadMaster({difficulty:mode});
 test(mode+': Rune Sweep resolves one meaningful single-target hit in all four forms',()=>{
  for(const [upgraded,focused,damage]of [[false,false,12],[false,true,16],[true,false,15],[true,true,19]]){
   const x=runtime(),{r,c}=fixture(x,S+'rune_sweep',upgraded,focused),plan=x.E.cardPlan(r,c);
   assert.deepEqual(plan.damageEvents.map(e=>e.hpLost),[damage]);assert.equal(plan.actions.length,1);assert.equal(plan.actions[0].target,'selected_enemy');
   x.E.playCard(r,c.uid);assert.equal(10000-r.battle.hp,damage);assert.equal(r.battle.energy,1);assert.ok(x.E.restore(copy(r)));
   const saved=copy(r);assert.throws(()=>x.E.playCard(r,c.uid));assert.deepEqual(r,saved);
  }
 });
 test(mode+': Fate Storm hits the same enemy without target RNG and reload cannot replay it',()=>{
  for(const [upgraded,focused,hits]of [[false,false,[5,5,5]],[false,true,[9,5,5]],[true,false,[8,5,5]],[true,true,[12,5,5]]]){
   const x=runtime(),{r,c}=fixture(x,S+'fate_storm',upgraded,focused),before=r.rng,plan=x.E.cardPlan(r,c);
   assert.deepEqual(plan.damageEvents.map(e=>e.hpLost),hits);assert.ok(plan.actions.every(a=>a.target==='selected_enemy'));
   x.E.playCard(r,c.uid);const tx=r.battle.cardCombat.receipts.at(-1);
   assert.equal(r.rng,before);assert.deepEqual(tx.randomTargets,[]);assert.ok(tx.damageEvents.every(e=>!e.random&&e.target==='wisp'));
   const restored=x.E.restore(copy(r));assert.ok(restored);assert.equal(restored.battle.hp,r.battle.hp);assert.equal(restored.rng,before);assert.throws(()=>x.E.playCard(restored,c.uid));
  }
 });
}
test('Fate Storm retains per-hit mitigation and applies Strength and Focus once',()=>{
 for(const [x,strength,want]of [[legacy,2,[6,3,3]],[loadMaster({difficulty:'medium'}),2,[6,3,3]]]){
  const r=D.create(x,{seed:280030,enemy:'wisp',deck:['stm.passive.blazing_spirit',S+'weak_point',S+'fate_storm',...Array(9).fill('stm.defend.rune_guard')]});
  r.battle.hp=r.battle.maxHp=10000;x.E.playCard(r,hand(r,'stm.passive.blazing_spirit').uid);x.E.endTurn(r);
  x.E.playCard(r,hand(r,S+'weak_point').uid);assert.equal(r.battle.strength,strength);
  r.battle.enemyDefense=2;r.battle.enemyBlock=4;r.battle.cardCombat.statuses.self.weak=1;r.battle.cardCombat.statuses.self.weakUntil=r.battle.turn;
  r.battle.focus=1;x.E.armFocus(r);const c=hand(r,S+'fate_storm'),plan=x.E.cardPlan(r,c);assert.deepEqual(plan.damageEvents.map(e=>e.hpLost),want);
  const hp=r.battle.hp;x.E.playCard(r,c.uid);assert.equal(hp-r.battle.hp,want.reduce((a,b)=>a+b,0));assert.ok(x.E.restore(copy(r)));
 }
});
test('Fate Storm stops subsequent hits when the only enemy dies',()=>{
 const x=loadMaster({difficulty:'medium'}),{r,c}=fixture(x,S+'fate_storm');r.battle.hp=7;const before=r.rng;
 x.E.playCard(r,c.uid);assert.deepEqual(r.battle.cardCombat.receipts.at(-1).damageEvents.map(e=>e.hpLost),[5,2]);assert.equal(r.battle.hp,0);assert.equal(r.rng,before);
});
test('actual 2.27.0 ordinary-mode receipts survive the correction alongside a new receipt',()=>{
 const saved=JSON.parse(zlib.gunzipSync(fs.readFileSync(__dirname+'/fixtures/single-target-legacy-2.27.0.json.gz'))).run;
 const r=legacy.E.restore(copy(saved));assert.ok(r);assert.equal(r.rng,saved.rng);assert.equal(r.battle.hp,saved.battle.hp);assert.deepEqual(r.battle.cardCombat.receipts,saved.battle.cardCombat.receipts);
 r.battle.energy=3;r.battle.focus=0;r.battle.boostArmed=false;const c=hand(r,S+'rune_sweep'),hp=r.battle.hp;
 legacy.E.playCard(r,c.uid);assert.equal(hp-r.battle.hp,12);assert.deepEqual(r.battle.cardCombat.receipts.slice(0,8),saved.battle.cardCombat.receipts);assert.ok(legacy.E.restore(copy(r)));
});
test('a receipt with an unknown definition cannot be restored',()=>{
 const x=loadMaster({difficulty:'medium'}),{r,c}=fixture(x,S+'fate_storm');x.E.playCard(r,c.uid);r.battle.cardCombat.receipts.at(-1).definitionVersion='unknown-future';assert.equal(x.E.restore(copy(r)),null);
});
