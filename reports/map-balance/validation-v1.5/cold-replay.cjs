'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..'),source=path.resolve(process.argv[2]);
const {makeContext,buildCampaignTasks}=require(path.join(source,'tools/balance/map-advanced/experiments.cjs'));
const {hash}=require(path.join(source,'tools/balance/map/structure.cjs'));
const {runTask}=require(path.join(source,'tools/balance/map-advanced/worker.cjs'));
const cases=[];
for(const difficulty of ['easy','medium','hard']){
 const out=path.join(root,'reports/map-balance/v1.5',difficulty),context=JSON.parse(fs.readFileSync(path.join(out,'context.json')));
 const restored=makeContext(context.seedList,context.config);assert.deepEqual(restored,context);
 const task=buildCampaignTasks(context.seedList,context.config).find(t=>t.id==='route:STM-001:uniform-visible-v1:0');
 let expected;
 for(const {file} of JSON.parse(fs.readFileSync(path.join(out,'trials-index.json'))).shards){
  for(const line of fs.readFileSync(path.join(out,file),'utf8').split('\n').filter(Boolean)){
   const r=JSON.parse(line);if(r.task.id===task.id){const {contextId,recordHash,...data}=r;expected=data;break;}
  }
  if(expected)break;
 }
 assert.ok(expected);const actual=runTask(task);assert.deepEqual(actual,expected);
 cases.push({difficulty,contextId:hash(context),taskId:task.id,status:actual.status,traceHash:actual.traceHash,entryStateHash:actual.entryStateHash,runtimeIdentity:actual.runtimeIdentity});
}
const proof={status:'PASS',contextsIdentical:3,fullTrialReplays:3,exactMatches:3,additionalUniqueScoredCampaigns:0,cases};
fs.writeFileSync(path.join(__dirname,'cold-source-proof.json'),JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(proof));
