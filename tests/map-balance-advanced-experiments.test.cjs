'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {buildCampaignTasks,buildEntryBank,buildMatchedTasks,runPool}=require('../tools/balance/map-advanced/experiments.cjs');
const {Journal}=require('../tools/balance/map-advanced/storage.cjs');
const {runTask}=require('../tools/balance/map-advanced/worker.cjs');
const {runCampaign}=require('../tools/balance/map/replay.cjs');
const {analyzeMap,hash}=require('../tools/balance/map/structure.cjs');
const config=require('../tools/balance/map-advanced/config.json');

test('fixed campaign matrix pairs common seeds without duplicating feedback controls',()=>{
 const tasks=buildCampaignTasks(['STM-001','STM-002'],config);
 assert.equal(tasks.length,60);assert.equal(new Set(tasks.map(t=>t.id)).size,60);
 const first=tasks.filter(t=>t.seed==='STM-001');
 assert.equal(first.filter(t=>t.policy==='uniform-visible-v1').length,8);
 assert.equal(first.filter(t=>t.group==='predict').length,6);
 for(const rep of [0,1])assert.equal(new Set(first.filter(t=>t.repetition===rep).map(t=>t.runSeed)).size,1);
});
test('matched route triplets preserve captured state/clock/RNG and never invent Stage 2 entries',()=>{
 const result=runCampaign({runSeed:0,captureCheckpoints:true,stopAtEntry:1});
 const bank=buildEntryBank([{task:{id:'reference',group:'route',policy:'uniform-visible-v1'},...result}],config);
 assert.equal(bank.length,1);assert.equal(bank[0].stage,1);
 const analyses=[1,2].map(stage=>analyzeMap('STM-001',stage,require('../tools/balance/map/config.json')));
 const tasks=buildMatchedTasks(bank,analyses);
 assert.equal(tasks.length,3);assert.deepEqual(tasks.map(t=>t.rank),['easiest','median','hardest']);
 assert.ok(tasks.every(t=>t.targetStage===1&&hash(t.options.initialState)===bank[0].stateHash));
 assert.equal(new Set(tasks.map(t=>JSON.stringify(t.options.initialRngStates))).size,1);
});
test('journal round trips immutable results and rejects changed context or corrupted records',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'map-v13-'));
 try{
  const j=new Journal(dir,{test:1});j.append({task:{id:'a'},status:'DEFEAT'});
  assert.equal(new Journal(dir,{test:1},{resume:true}).records.length,1);
  assert.throws(()=>new Journal(dir,{test:2},{resume:true}),/context/i);
  const file=path.join(dir,'trial-0001.jsonl');fs.writeFileSync(file,fs.readFileSync(file,'utf8').replace('DEFEAT','VICTORY'));
  assert.throws(()=>new Journal(dir,{test:1},{resume:true}),/hash|integrity/i);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('worker returns real engine censoring as an unknown outcome, not defeat',()=>{
 const t={id:'bounded',seed:'STM-001',runSeed:0,policy:'uniform-visible-v1',predictProfile:'skip',options:{mode:'learn',limits:{maxActions:1}}};
 const r=runTask(t);assert.equal(r.status,'BENCHMARK_LIMIT_CENSORED');assert.equal(r.campaignWon,null);assert.equal(r.apiCalls,1);assert.equal(r.task.id,'bounded');
});
test('worker pool returns bounded canonical outcomes and closes its workers',async()=>{
 const results=[],task={id:'pool',seed:'STM-001',runSeed:0,policy:'uniform-visible-v1',predictProfile:'skip',options:{mode:'learn',limits:{maxActions:1}}};
 const pool=await runPool([task],{workers:2,deadline:performance.now()+10000,timeoutMs:5000,onResult:r=>results.push(r)});
 assert.equal(pool.completed,1);assert.equal(results[0].status,'BENCHMARK_LIMIT_CENSORED');
});
test('a timed-out worker is replaced so remaining scheduled tasks are not silently omitted',async()=>{
 const results=[],tasks=['timeout-a','timeout-b'].map(id=>({id,seed:'STM-001',runSeed:0,policy:'uniform-visible-v1',predictProfile:'skip',options:{limits:{maxActions:1}}}));
 const pool=await runPool(tasks,{workers:1,deadline:performance.now()+10000,timeoutMs:1,onResult:r=>results.push(r)});
 assert.equal(pool.completed,2);assert.deepEqual(results.map(r=>r.task.id),tasks.map(t=>t.id));
 assert.ok(results.every(r=>r.status==='BENCHMARK_LIMIT_CENSORED'&&r.campaignWon===null));
});
