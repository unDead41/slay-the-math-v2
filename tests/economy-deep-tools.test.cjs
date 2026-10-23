'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
let T,O;try{T=require('../tools/economy/deep-common.cjs');O=require('../tools/economy/deep-offers.cjs');}catch(e){if(e.code!=='MODULE_NOT_FOUND')throw e;}
const Eco=require('../dist/economy.js');
test('offer screening distinguishes missing block from measured card power',()=>{
 assert.ok(T,'deep experiment APIs exist');const r=T.createFixture('attack_only',19,'easy',true,{stage:0,depth:1}),o=Eco.cards(r,'normal',{nodeId:'test'});
 const shot=T.describeCard(r,'stm.attack.shield_shot',o);assert.deepEqual(shot.missingRequirements,['block']);assert.equal(shot.tagReady,false);assert.equal(shot.actionableProxy,false);assert.equal(shot.combatPower,null);
 const strike=T.describeCard(r,'stm.attack.rune_strike',o);assert.equal(strike.tagReady,true);assert.equal(strike.actionableProxy,true);
});
test('draw capability can be supplied by a real owned Passive and owned Passives stay redundant',()=>{
 assert.ok(T,'deep experiment APIs exist');const r=T.createFixture('passive_draw',19),o=Eco.cards(r,'normal',{nodeId:'test'});
 assert.equal(T.describeCard(r,'stm.skill.last_page',o).tagReady,true);
 assert.equal(T.describeCard(r,'stm.passive.clear_mind',o).redundantPassive,true);
 assert.equal(T.describeCard(r,'stm.passive.clear_mind',o).actionableProxy,false);
});
test('third duplicate and an upgraded replacement are reported separately',()=>{
 assert.ok(T,'deep experiment APIs exist');const r=T.createFixture('duplicate_heavy',19),o=Eco.cards(r,'elite',{nodeId:'test'});
 const x=T.describeCard(r,'stm.attack.rune_strike',o);assert.equal(x.copies,4);assert.equal(x.thirdOrLaterCopy,true);assert.equal(x.upgradeOpportunity,true);assert.equal(x.actionableProxy,false);
});
test('distribution quantiles retain depleted budgets and expose a completed-only sample',()=>{
 assert.ok(T,'deep experiment APIs exist');assert.deepEqual(T.summarize([0,10,20,30,100]),{n:5,min:0,p05:0,median:20,p95:100,max:100,mean:32});
 assert.deepEqual(T.summarize([]),{n:0,min:null,p05:null,median:null,p95:null,max:null,mean:null});
});
test('diverse offer experiment keeps immutable sources and paired first rarity',()=>{
 assert.ok(O,'deep offer study exists');const result=O.studyOffers([19,71],{fixtureNames:['attack_only','passive_draw'],difficulties:['easy'],contexts:[{stage:0,depth:1}]});
 assert.equal(result.rows.length,24);assert.equal(result.paired.length,12);assert.equal(result.checks.duplicateViolations,0);assert.equal(result.checks.sourceViolations,0);assert.equal(result.checks.rngViolations,0);assert.equal(result.checks.changedPlayerDecks,0);assert.equal(result.checks.firstRarityPairMismatches,0);
 assert.ok(result.rows.some(x=>x.source==='ME04'&&x.slots===2));assert.ok(result.rows.filter(x=>x.source==='ME03').every(x=>x.categories.skill===6));
});
