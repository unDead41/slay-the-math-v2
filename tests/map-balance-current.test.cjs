'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {runTask}=require('../tools/balance/map-advanced/worker.cjs');
const {buildCampaignTasks,makeContext}=require('../tools/balance/map-advanced/experiments.cjs');
const {summarizeScope}=require('../tools/balance/map-advanced/report.cjs');
const {loadMaster}=require('../tools/balance/master/loader.cjs');
const {createTelemetry}=require('../tools/balance/map-advanced/telemetry.cjs');
const {hash}=require('../tools/balance/map/structure.cjs');
const defaults=require('../tools/balance/map-advanced/config.json');
const {qualityGate}=require('../tools/balance/map-advanced/check.cjs');
test('current integrity gate rejects records executed under another runtime identity',()=>{
 const identity={version:'candidate',difficulty:'easy',definitionHash:'same',engineHash:'same'},summary={evaluationComplete:true,errors:0,censored:0,invalidStates:0,legacyCompatibility:{status:'NEEDS_NEW_REFERENCE'},incompleteMatchedTriplets:0,stage2Entries:0};
 const r={task:{id:'wrong-tier',batch:'campaign'},apiCalls:0,rooms:[],runtimeIdentity:{...identity,difficulty:'hard'}};
 const q=qualityGate({records:[r],bank:[],summary,context:{config:defaults,seedList:['STM-001'],runtimeIdentity:identity}});
 assert.equal(q.status,'FAIL');assert.ok(q.failures.includes('RUNTIME_IDENTITY_MISMATCH:wrong-tier'));
});
test('current worker captures real Master entries for all three bound profiles',()=>{
 for(const difficulty of ['easy','medium','hard']){
  const result=runTask({id:'entry:'+difficulty,seed:'STM-001',runSeed:2822299500,policy:'uniform-visible-v1',predictProfile:'feedback',options:{runtimeBuild:'master',difficulty,telemetry:true,captureCheckpoints:true,stopAtEntry:1}});
  assert.equal(result.status,'ENTRY_CAPTURED',result.error);
  assert.equal(result.difficulty,difficulty);assert.deepEqual(result.runtimeIdentity,loadMaster({difficulty}).provenance);
  const state=result.checkpoints[0].state;
  assert.equal(state.balanceState.difficulty,difficulty);assert.equal(state.economyState.difficulty,difficulty);
  assert.ok(loadMaster({difficulty}).E.validate(state));assert.equal(result.entryStateHash,hash(state));
 }
});
test('Master runtime choice is preserved by fixed campaign tasks and context',()=>{
 const config={...defaults,runtimeBuild:'master',difficulty:'easy',postRunBossGrant:0};
 const tasks=buildCampaignTasks(['STM-001'],config);assert.ok(tasks.every(t=>t.options.runtimeBuild==='master'));
 const context=makeContext(['STM-001'],config);assert.equal(context.runtimeIdentity.difficulty,'easy');
 assert.deepEqual(context.runtimeIdentity,loadMaster({difficulty:'easy'}).provenance);
 assert.ok(context.sourceHashes['dist/balance-data.js']);assert.ok(context.sourceHashes['modules/map/data/seed-registry.json']);assert.equal(context.difficultyReadiness.find(x=>x.difficulty==='easy').status,'IMPLEMENTED');
});
test('current worker rejects a captured entry from a different difficulty',()=>{
 const options={runtimeBuild:'master',difficulty:'easy',captureCheckpoints:true,stopAtEntry:1},base={id:'capture',seed:'STM-001',runSeed:2822299500,policy:'uniform-visible-v1',predictProfile:'feedback'};
 const first=runTask({...base,options}),entry=first.checkpoints[0];
 const result=runTask({...base,id:'wrong-profile',options:{runtimeBuild:'master',difficulty:'hard',initialState:entry.state,initialClock:entry.clock,initialRngStates:entry.policyRngStates,stopAfterStage:1}});
 assert.equal(result.status,'INVALID_POLICY_OR_ENGINE');assert.equal(result.campaignWon,null);assert.match(result.error,/captured/i);
});
test('versioned regression protocol fingerprints its actual runner and schedule',()=>{
 const config={...require('../tools/balance/map-regression/config.json'),difficulty:'easy'};
 const context=makeContext(['STM-001'],config),{sha}=require('../tools/balance/map/source-audit.cjs'),fs=require('node:fs');
 for(const file of config.additionalProtocolFiles)assert.equal(context.protocolHashes[file],sha(fs.readFileSync(require('node:path').resolve(__dirname,'..',file))));
 assert.equal(buildCampaignTasks(['STM-001'],config).length,8);
 assert.equal(config.matchedEntriesPerStage,1);
});
test('current feedback settles two wrong attempts without a third attempt or loop',()=>{
 const r=runTask({id:'two-attempt-flow',seed:'STM-001',runSeed:2822299500,policy:'health-recovery',predictProfile:'feedback',options:{runtimeBuild:'master',difficulty:'medium',telemetry:true,stopAfterStage:1}});
 assert.equal(r.error,null);assert.ok(r.metrics.predict.failed>0);assert.ok(r.metrics.predict.attempts<=2*r.metrics.predict.firstAttempts);assert.ok(r.apiCalls<10000);
});
test('artifact affordability observes the same Master quote used by a purchase',()=>{
 const x=loadMaster({difficulty:'easy'}),r=x.E.newRun(17,'learn');
 const t=createTelemetry({E:x.E,A:x.A,cardMerit:()=>0,hash},r),room={enter:t.snapshot(r)};t.attachRoom(room);const before=t.mark(r);
 const offer={id:x.A.id('s01'),price:101,basePrice:101};r.shop={offers:[],bought:[],artifacts:[offer],artifactBought:[]};r.scene='shop';
 const price=x.E.shopPrice(r,offer);assert.ok(price<=r.gold);assert.ok(x.A.price(r,offer.price)>r.gold);
 t.observe('enterNode',before,r);assert.equal(room.shop.affordableArtifacts,1);
});
test('current report does not deduct a legacy Gold grant which Master never awards',()=>{
 const r={status:'VICTORY',task:{id:'victory'},stages:[{reached:true,cleared:true},{reached:true,cleared:true}],rooms:[],metrics:{shop:{visits:0},predict:{}},final:{hp:20,gold:123}};
 assert.equal(summarizeScope([r],null,1,.7,0).meanFinalGoldExcludingPostRunBossGrant,123);
});
