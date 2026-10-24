'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const E=require('../dist/engine.js');
const {runCampaign,publicRouteView}=require('../tools/balance/map/replay.cjs');
const {chooseRoute}=require('../tools/balance/map-advanced/route-policy.cjs');
const {predictDecision}=require('../tools/balance/map-advanced/question-policy.cjs');
const {assertDifficulty}=require('../tools/balance/map-advanced/scenarios.cjs');

const view=(hp=60,gold=80)=>({hp,maxHp:60,gold,available:['a','b'],nodes:[{id:'a',level:1,type:'battle'},{id:'b',level:1,type:'elite'},{id:'z',level:2,type:'boss'}],edges:[{from:'a',to:'z'},{from:'b',to:'z'}]});
test('avoid-elite and reward policies choose different legal categories without hidden identities',()=>{
 assert.equal(chooseRoute(view(),'avoid-elite',()=>0).nodeId,'a');
 assert.equal(chooseRoute(view(),'seek-reward',()=>0).nodeId,'b');
 const r=E.newRun(0,'learn'),s=JSON.stringify(r),v=publicRouteView(r);
 assert.ok(!JSON.stringify(v).includes('enemyId'));assert.ok(!JSON.stringify(v).includes('rng'));
 assert.equal(JSON.stringify(r),s);
});
test('shop routing responds to actual Gold and recovery routing to low HP',()=>{
 const shop=view();shop.nodes[1].type='shop';
 assert.equal(chooseRoute(shop,'seek-shop',()=>0).nodeId,'b');
 shop.gold=0;assert.equal(chooseRoute(shop,'seek-shop',()=>0).nodeId,'a');
 const rest=view(15);rest.nodes[1].type='rest';
 assert.equal(chooseRoute(rest,'health-recovery',()=>0).nodeId,'b');
});
test('Predict ability model separates one-attempt high/low from skip and declares its oracle',()=>{
 const p={choiceOrder:['a','b','c','d'],correctChoiceId:'b'};
 assert.equal(predictDecision(p,'high',()=>.5).choiceId,'b');
 assert.equal(predictDecision(p,'low',()=>.5).choiceId,'c');
 assert.equal(predictDecision(p,'high',()=>.5).syntheticOracleUsed,true);
 assert.equal(predictDecision({get correctChoiceId(){throw Error('key read');}},'skip',()=>{throw Error('rng read');}).kind,'skip');
});
test('unimplemented difficulty cannot silently masquerade as the runtime baseline',()=>{
 assert.throws(()=>assertDifficulty('easy'),/NEEDS_COMBAT_MASTER_ADAPTER/);
 assert.throws(()=>runCampaign({runSeed:0,difficulty:'hard'}),/NEEDS_COMBAT_MASTER_ADAPTER/);
});
test('canonical stage entry is captured, replayed immutably and finishes only the requested scope',()=>{
 const captured=runCampaign({runSeed:2822299500,captureCheckpoints:true,stopAtEntry:1});
 assert.equal(captured.status,'ENTRY_CAPTURED');assert.equal(captured.rooms.length,0);
 const entry=captured.checkpoints[0],before=JSON.stringify(entry);
 assert.ok(E.validate(entry.state));assert.equal(entry.stage,1);
 const a=runCampaign({runSeed:entry.state.seed,initialState:entry.state,initialClock:entry.clock,initialRngStates:entry.policyRngStates,stopAfterStage:1,telemetry:true});
 const b=runCampaign({runSeed:entry.state.seed,initialState:entry.state,initialClock:entry.clock,initialRngStates:entry.policyRngStates,stopAfterStage:1,telemetry:true});
 assert.equal(a.status,'STAGE_CLEARED');assert.equal(a.campaignWon,null);assert.ok(a.stages[0].cleared);
 assert.equal(a.traceHash,b.traceHash);assert.equal(a.entryStateHash,entry.stateHash);
 assert.equal(JSON.stringify(entry),before);assert.ok(!a.rooms.some(r=>r.stage===2));
 assert.throws(()=>runCampaign({runSeed:1,initialState:entry.state}),/seed|entry/i);
});
test('two-attempt game controls reproduce the current canonical action hash',()=>{
 const r=runCampaign({runSeed:1075022600});
 assert.equal(r.status,'DEFEAT');assert.equal(r.traceHash,'d0c0ea2f0f47a80b55ac0e6e780b5b6743f1e691af58a91c305b284043a3c0f7');
});
test('adaptive recovery and Predict skip run through valid engine actions without forecasts',()=>{
 const r=runCampaign({runSeed:2822299500,routePolicy:'health-recovery',predictProfile:'skip',telemetry:true,trace:true});
 assert.ok(['VICTORY','DEFEAT'].includes(r.status),r.error);
 assert.ok(r.routeDecisions.length>0);assert.ok(r.routeDecisions.every(d=>d.available.includes(d.nodeId)));
 assert.ok(!r.actions.some(a=>a.kind==='forecast'));
 assert.equal(r.metrics.predict.attempts,0);assert.equal(r.metrics.predict.focusGained,0);
 assert.equal(r.invalidStates,0);
});
test('room resource accounting excludes later stage-transition and artifact actions',()=>{
 const r=runCampaign({runSeed:2822299500,telemetry:true});
 for(const room of r.rooms){
  assert.equal(room.metrics.hpRecovered-room.metrics.hpLost,room.exit.hp-room.enter.hp,room.nodeId);
  assert.equal(room.metrics.goldEarned-room.metrics.goldSpent,room.exit.gold-room.enter.gold,room.nodeId);
 }
});
test('high and low Predict scenarios commit at most one answer per opportunity in the actual engine',()=>{
 for(const predictProfile of ['high','low']){
  const r=runCampaign({runSeed:2822299500,predictProfile,telemetry:true});
  assert.ok(['VICTORY','DEFEAT'].includes(r.status),r.error);
  assert.equal(r.syntheticOracleUsed,true);assert.equal(r.metrics.predict.attempts,r.metrics.predict.firstAttempts);
  assert.ok(r.metrics.predict.attempts>0);assert.ok(r.metrics.predict.firstCorrect<=r.metrics.predict.firstAttempts);
 }
});
test('room-level Predict and Rest actions reconcile to campaign telemetry',()=>{
 const r=runCampaign({runSeed:2822299500,telemetry:true});
 assert.equal(r.rooms.reduce((s,x)=>s+(x.predict?.attempts||0),0),r.metrics.predict.attempts);
 assert.equal(r.rooms.filter(x=>x.restAction==='heal').length,r.metrics.restHeals);
});
