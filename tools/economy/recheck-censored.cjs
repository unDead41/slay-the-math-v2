'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),assert=require('node:assert/strict'),R=require('./recheck.cjs');
const {loadMaster}=require('../balance/master/loader.cjs'),{createReplay}=require('../balance/map/replay.cjs'),{createAgent}=require('../ai-playtester/agent.cjs');
const rows=zlib.gunzipSync(fs.readFileSync(path.join(R.OUT,'campaigns.jsonl.gz'))).toString().trim().split('\n').map(JSON.parse),results=[];
for(const original of rows.filter(r=>r.status==='BENCHMARK_LIMIT_CENSORED')){
 const x=loadMaster({difficulty:original.difficulty}),validate=x.E.validate;let last;
 // Read-only observer: no action, state, RNG, cost or search behavior is changed.
 x.E.validate=r=>{const valid=validate(r);if(valid)last=r;return valid;};
 const cache=new Map([[original.difficulty,{x,replay:createReplay(x),agent:createAgent(x,{skill:'intermediate'})}]]),task={seed:original.runSeed,difficulty:original.difficulty,policy:original.policy,predict:original.predictProfile,route:original.routePolicy,sample:true},again=R.campaign(task,cache);
 assert.equal(again.status,original.status);assert.equal(again.traceHash,original.traceHash);assert.deepEqual(again.final,original.final);assert.deepEqual(again.metrics,original.metrics);assert.ok(x.E.restore(last));
 results.push({task,matchingTraceHash:again.traceHash,provenance:x.provenance,finalState:last,diagnostic:{enemy:last.battle.enemyId,turn:last.battle.turn,enemyHp:last.battle.hp,seals:last.battle.seals,hp:last.hp,gold:last.gold,deck:last.deck.map(c=>({key:c.key,upgraded:c.upgraded}))},interpretation:'Matched replay of a censored case. Full valid state retained for Master; not a measured loss/win.'});
}
R.save('censor-replays.json.gz',results);console.log(JSON.stringify({replays:results.length,matching:results.length}));
