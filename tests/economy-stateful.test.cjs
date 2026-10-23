'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {E,A,Eco,clone,seeds}=require('../tools/economy/deep-common.cjs'),F=require('../tools/economy/deep-flow.cjs'),V=require('../tools/economy/deep-events.cjs');
const {room,atNode}=require('./helpers/economy.cjs');
const X=require('../dist/mystery.js');
function reload(r){const saved=clone(r),restored=E.restore(saved);assert.ok(restored);assert.deepEqual(restored,saved);return restored;}
function reject(r,fn){const before=clone(r);assert.throws(fn);assert.deepEqual(r,before);}
test('long purchase reload discount removal transform sequence keeps receipts and once-only settlement',()=>{
 for(const seed of seeds(20)){
 let r=room('shop','medium',seed);r.gold=2000;const initial=clone(r.shop),rng=r.rng,q=r.educationState?clone(r.educationState):undefined,receipt=clone(r.economyState.receipts);
 const sale=r.shop.offers.findIndex(o=>o.sale);E.buyCard(r,sale);r=reload(r);reject(r,()=>E.buyCard(r,sale));
 for(const index of r.shop.artifacts.map((o,i)=>o.id?i:-1).filter(i=>i>=0)){
 const o=r.shop.artifacts[index],price=E.shopPrice(r,o),gold=r.gold,gift=A.catalog[o.id].values.gold||0;E.buyArtifact(r,index);assert.equal(r.gold,gold-price+gift);r=reload(r);reject(r,()=>E.buyArtifact(r,index));
 }
 for(let i=0;i<6;i++)if(i!==sale){const price=E.shopPrice(r,r.shop.offers[i]),gold=r.gold;E.buyCard(r,i);assert.equal(r.gold,gold-price);r=reload(r);reject(r,()=>E.buyCard(r,i));}
 assert.deepEqual(r.shop.offers,initial.offers);assert.deepEqual(r.economyState.receipts,receipt);assert.equal(r.rng,rng);assert.deepEqual(r.educationState,q);
 E.removeShopCard(r,F.removalTarget(r).uid);r=reload(r);reject(r,()=>E.removeShopCard(r,r.deck[0].uid));E.leaveShop(r);
 let node=V.placeAtNode(r,'event',1);X.ensure(r).usedEventIds=X.data.events.filter(e=>e.id!=='ME04').map(e=>e.id);E.enterNode(r,node.id);E.startMystery(r,[],null,1000);const Q=require('../dist/education.js'),question=Q.catalog[r.mysteryState.pending.questionId];E.answerMystery(r,question.correctChoiceId,1001);E.continueMystery(r);r=reload(r);
 const option=X.definition(r).success.options.find(o=>o.effects.some(e=>e.type==='TRANSFORM_CARD'));E.selectMysteryOption(r,option.id);E.selectMysteryTarget(r,F.eventTarget(r,option));r=reload(r);const deckSize=r.deck.length;E.claimMystery(r);assert.equal(r.deck.length,deckSize);r=reload(r);reject(r,()=>E.claimMystery(r));
 }
});
test('minimum deck and legacy saves survive reload without migration',()=>{
 let r=room('shop');r.gold=500;r.deck=r.deck.slice(0,10);r=reload(r);reject(r,()=>E.removeShopCard(r,r.deck[0].uid));
 const legacy=E.newRun(19);assert.equal(reload(legacy).economyState,undefined);
});
test('all event options and tight HP/Gold budgets settle and restore',()=>{
 for(const difficulty of ['easy','medium','hard'])for(const e of X.data.events)for(const option of e.success.options){
 const x=V.eventScenario({id:e.id,difficulty,seed:19,mode:'correct_fast',option:option.id,hp:40,gold:100});assert.ok(x.finalHp>=1);
 }
});
test('full deck refuses purchase atomically and free removal does not inflate paid removal count',()=>{
 let r=room('shop');r.gold=1000;while(r.deck.length<60)r.deck.push(E.card(r,'stm.attack.rune_strike'));r=reload(r);reject(r,()=>E.buyCard(r,0));
 const X=require('../dist/mystery.js'),Q=require('../dist/education.js');const node=V.placeAtNode(r,'event');X.ensure(r).usedEventIds=X.data.events.filter(e=>e.id!=='ME10').map(e=>e.id);E.enterNode(r,node.id);E.startMystery(r,[],null,1000);const question=Q.catalog[r.mysteryState.pending.questionId];E.answerMystery(r,question.correctChoiceId,1001);E.continueMystery(r);
 const option=X.definition(r).success.options.find(o=>o.effects.some(e=>e.type==='REMOVE_CARD'));assert.ok(option);E.selectMysteryOption(r,option.id);E.selectMysteryTarget(r,F.eventTarget(r,option));const count=r.economyState.removalCount;E.claimMystery(r);assert.equal(r.deck.length,59);assert.equal(r.economyState.removalCount,count);reload(r);
});
