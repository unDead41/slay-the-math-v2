'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
let F,V;try{F=require('../tools/economy/deep-flow.cjs');V=require('../tools/economy/deep-events.cjs');}catch(e){if(e.code!=='MODULE_NOT_FOUND')throw e;}
const {E,A}=require('../tools/economy/deep-common.cjs');
const {room}=require('./helpers/economy.cjs');
test('55-second correct answer earns Easy reward but times out on the Medium chest',()=>{
 assert.ok(V,'event timing experiments exist');
 const easy=V.eventScenario({id:'ME01',difficulty:'easy',seed:19,mode:'correct_55s'}),medium=V.eventScenario({id:'ME01',difficulty:'medium',seed:19,mode:'correct_55s'});
 assert.equal(easy.outcome,'CORRECT');assert.equal(easy.goldDelta,48);assert.equal(medium.outcome,'TIMEOUT');assert.equal(medium.goldDelta,0);assert.equal(medium.hpDelta,-4);
});
test('artifact model respects two answers and never claims a failed trial',()=>{
 assert.ok(F,'flow APIs exist');const r=E.newRun(19,'challenge',3,{economy:true,difficulty:'medium'}),key=r.artifactState.offer.ids[0];
 const result=F.claimGift(r,{accuracy:0,responseMs:35000});assert.equal(result.wrongAttempts,2);assert.equal(result.attempts,2);assert.equal(result.claimed,false);assert.equal(result.claimsBeforeCorrect,0);assert.equal(A.has(r,key),false);assert.equal(r.scene,'map');assert.ok(E.restore(r));assert.throws(()=>E.continueEducation(r));
 const success=E.newRun(19,'challenge',3,{economy:true,difficulty:'medium'}),gift=success.artifactState.offer.ids[0],passed=F.claimGift(success,{accuracy:1,responseMs:15000});assert.equal(passed.attempts,1);assert.equal(passed.claimed,true);assert.ok(A.has(success,gift));assert.ok(E.restore(success));assert.throws(()=>E.continueEducation(success));
});
test('adaptive Rest heals low HP and upgrades at full HP',()=>{
 assert.ok(F,'flow APIs exist');const low=room('camp','hard');low.hp=8;const a=F.restDecision(low,'tag_support');assert.equal(a.action,'heal');E.camp(low,a.action,a.uid);assert.equal(low.hp,20);
 const full=room('camp','hard');const b=F.restDecision(full,'tag_support');assert.equal(b.action,'upgrade');assert.ok(full.deck.some(c=>c.uid===b.uid));
});
test('controlled route survey returns real min/max Elite routes and adaptive pick is connected',()=>{
 assert.ok(F,'flow APIs exist');const s=F.surveyMap(19,0);assert.equal(s.minElite.path.length,10);assert.equal(s.maxElite.path.length,10);assert.ok(s.maxElite.elites>=s.minElite.elites);assert.ok(s.pathCount>=1);
 const r=E.newRun(19,'challenge',3,{economy:true,difficulty:'easy'});F.claimGift(r,{accuracy:1,responseMs:15000});const node=F.pickNode(r,'tag_support');assert.ok(E.availableNodes(r).some(x=>x.id===node.id));
});
test('sale policy buys the single sale once at its actual quote and preserves stock',()=>{
 assert.ok(F,'flow APIs exist');const r=room('shop','easy');r.gold=100;const i=r.shop.offers.findIndex(o=>o.sale),price=E.shopPrice(r,r.shop.offers[i]),key=r.shop.offers[i].key;
 const result=F.shopDecision(r,'sale_only');assert.deepEqual(result,{kind:'card',index:i,price,reason:'single_sale'});E.buyCard(r,i);assert.equal(r.gold,100-price);assert.equal(r.deck.at(-1).key,key);assert.equal(F.shopDecision(r,'sale_only'),null);
});
test('real flow records conservation and labels a depleted assumed budget without claiming game defeat',()=>{
 assert.ok(F,'flow APIs exist');const r=F.simulateFlow({seed:19,difficulty:'easy',policy:'tag_support',answer:'proficient',budget:'moderate'});
 assert.equal(r.summary.finalGold,r.summary.startGold+r.summary.goldEarned-r.summary.goldSpent);assert.ok(['MODEL_FLOW_COMPLETE','MODEL_HP_BUDGET_EXHAUSTED'].includes(r.summary.status));assert.ok(r.summary.nodes>0);
 const stopped=F.simulateFlow({seed:19,difficulty:'hard',policy:'saver',answer:'struggling',budget:{battle:100,elite:100,boss:100}});
 assert.equal(stopped.summary.status,'MODEL_HP_BUDGET_EXHAUSTED');assert.notEqual(stopped.summary.engineScene,'defeat');assert.equal(stopped.summary.completed,false);
});
test('skip before start exposes no question and exact deadline always times out',()=>{
 assert.ok(V,'event timing experiments exist');const skip=V.eventScenario({id:'ME03',difficulty:'hard',seed:71,mode:'skip_before'});assert.equal(skip.outcome,'DECLINED');assert.equal(skip.questionExposed,false);assert.equal(skip.goldDelta,0);assert.equal(skip.deckDelta,0);
 const exact=V.eventScenario({id:'ME01',difficulty:'easy',seed:71,mode:'deadline_exact'});assert.equal(exact.outcome,'TIMEOUT');assert.equal(exact.goldDelta,0);
});
test('cumulative HP and Max HP sacrifices respect floors and unavailable costs',()=>{
 assert.ok(V.studySacrifices,'cumulative owner experiments exist');const results=V.studySacrifices([19]);assert.equal(results.length,3);for(const r of results){assert.ok(r.claims>0);assert.ok(r.finalHp>=1&&r.finalMaxHp>=1);assert.ok(r.stoppedUnavailable);}
});
