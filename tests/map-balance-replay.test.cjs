const test=require('node:test');
const assert=require('node:assert/strict');
const E=require('../dist/engine.js');
const {chooseCombatAction}=require('../tools/balance/map/policy.cjs');
const {runCampaign,publicCombatView}=require('../tools/balance/map/replay.cjs');

test('visible combat policy has no access to hidden draw order and does not mutate its view',()=>{
 const r=E.newRun(0,'learn');E.enterNode(r,E.availableNodes(r).find(n=>n.type==='battle').id);
 const state=JSON.stringify(r),view=publicCombatView(r),before=JSON.stringify(view);
 assert.ok(!JSON.stringify(view).includes('correctChoiceId'));
 assert.ok(!Object.hasOwn(view,'draw') && !Object.hasOwn(view,'drawOrder'));
 const a=chooseCombatAction(view);
 assert.equal(JSON.stringify(view),before);assert.equal(JSON.stringify(r),state);
 assert.ok(['play','endTurn'].includes(a.kind));
 if(a.kind==='play')assert.ok(r.battle.hand.some(c=>c.uid===a.uid));
});
test('canonical campaign replay is reproducible and validates every entered route',()=>{
 const opts={runSeed:100,mode:'learn',limits:{maxCombatTurns:100,maxCombatPlays:500,maxActions:10000},trace:true};
 const a=runCampaign(opts),b=runCampaign(opts);
 assert.equal(a.status,b.status);assert.equal(a.traceHash,b.traceHash);
 assert.deepEqual(a.rooms,b.rooms);assert.ok(['VICTORY','DEFEAT'].includes(a.status),a.error);
 assert.ok(a.rooms.length>0);
 assert.ok(a.actions.every(x=>!['forceDamage','forceReward','setHp','setSeals'].includes(x.kind)));
 assert.equal(a.invalidStates,0);
});
test('invalid forced route is rejected before it can teleport the player',()=>{
 assert.throws(()=>runCampaign({runSeed:0,mode:'learn',forcedRoutes:{1:['missing']}}),/route/i);
});
test('benchmark action limit is censored, never counted as player defeat',()=>{
 const r=runCampaign({runSeed:0,mode:'learn',limits:{maxCombatTurns:100,maxCombatPlays:500,maxActions:1}});
 assert.equal(r.status,'BENCHMARK_LIMIT_CENSORED');
 assert.equal(r.campaignWon,null);
});
test('budget boundaries preserve completed Rest and Boss outcomes',()=>{
 const rest=runCampaign({runSeed:2822299500,limits:{maxActions:128},trace:true});
 assert.equal(rest.status,'BENCHMARK_LIMIT_CENSORED');assert.equal(rest.apiCalls,128);
 assert.equal(rest.actions.at(-1).kind,'campHeal');assert.equal(rest.rooms.at(-1).result,'CLEARED');
 assert.equal(rest.rooms.at(-1).exit.hp,Math.min(rest.rooms.at(-1).enter.maxHp,rest.rooms.at(-1).enter.hp+12));
 const boss=runCampaign({runSeed:2822299500,limits:{maxActions:347}});
 assert.equal(boss.status,'BENCHMARK_LIMIT_CENSORED');assert.equal(boss.stages[0].cleared,true);
 assert.equal(boss.rooms.at(-1).roomType,'boss');assert.equal(boss.rooms.at(-1).result,'CLEARED');
 const midPair=runCampaign({runSeed:2822299500,limits:{maxActions:2}});
 assert.equal(midPair.apiCalls,2);assert.equal(midPair.status,'BENCHMARK_LIMIT_CENSORED');
});
