const test=require('node:test');
const assert=require('node:assert/strict');
const {csv,aggregateTrials}=require('../tools/balance/map/export.cjs');
const {sampleRunSeeds}=require('../tools/balance/map/audit.cjs');

test('CSV quotes embedded separators/newlines and distinguishes null from zero in JSON inputs',()=>{
 const data=[{id:'STM-001',note:'A,"B"\nC',score:null,n:0},{id:'STM-002',note:'=1+1',score:3,n:1}];
 const out=csv(data,['id','note','score','n']);
 assert.ok(out.includes('"A,""B""\nC",,0'));
 assert.ok(out.includes("'=1+1"));assert.equal(data[0].score,null);assert.equal(data[0].n,0);
});
test('sampler is repeatable and stays in the complete legal uint32 catalogue class',()=>{
 const a=sampleRunSeeds('STM-100',100,42),b=sampleRunSeeds('STM-100',100,42);
 assert.deepEqual(a,b);assert.ok(a.every(s=>Number.isSafeInteger(s)&&s>=0&&s<=4294967295&&s%100===99));
 assert.equal(new Set(a.map(x=>x%3)).size,3);
});
test('engine errors or censored cases block a final-looking pilot score',()=>{
 const trials=[{status:'VICTORY',stages:[{reached:true,cleared:true},{reached:true,cleared:true}]},{status:'INVALID_POLICY_OR_ENGINE',stages:[{reached:true,cleared:false},{reached:false,cleared:false}]}];
 const a=aggregateTrials(trials);assert.equal(a.combatPower,null);assert.equal(a.errors,1);assert.equal(a.scoreStatus,'UNSCORABLE');
 const b=aggregateTrials([{status:'BENCHMARK_LIMIT_CENSORED',stages:[]}]);assert.equal(b.combatPower,null);assert.equal(b.censored,1);
 const c=aggregateTrials(trials.slice(0,1));assert.ok(c.combatPower>0);assert.equal(c.scoreStatus,'PROVISIONAL');
});
test('stage 2 uses a reached-stage denominator and reports missing coverage explicitly',()=>{
 const a=aggregateTrials([{status:'DEFEAT',stages:[{reached:true,cleared:false},{reached:false,cleared:false}]}],2);
 assert.equal(a.trials,0);assert.equal(a.combatPower,null);assert.equal(a.notReached,1);
});
test('a resolved stage survives downstream campaign censoring and errors',()=>{
 const trials=['BENCHMARK_LIMIT_CENSORED','INVALID_POLICY_OR_ENGINE'].map(status=>({status,stages:[{reached:true,cleared:true},{reached:true,cleared:false}]}));
 const first=aggregateTrials(trials,1);
 assert.equal(first.trials,2);assert.equal(first.wins,2);assert.equal(first.errors,0);assert.equal(first.censored,0);
 assert.equal(first.campaignErrors,1);assert.equal(first.campaignCensored,1);assert.ok(first.combatPower>0);
 const second=aggregateTrials(trials,2);assert.equal(second.combatPower,null);assert.equal(second.errors,1);assert.equal(second.censored,1);
});
test('aggregation honours the configured score reference probability',()=>{
 const trials=[{status:'VICTORY'},{status:'DEFEAT'}];
 const a=aggregateTrials(trials,null,2,.7),b=aggregateTrials(trials,null,2,.9);
 assert.ok(b.combatPower>a.combatPower);
});
