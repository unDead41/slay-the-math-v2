'use strict';
const {parentPort,isMainThread}=require('node:worker_threads');
const {runCampaign}=require('../map/replay.cjs');
const {runtimeFor}=require('./runtime.cjs');
function runTask(task){
 const {options={},...brief}=task;
 try{const x=runtimeFor(options),replay=x?x.replay.runCampaign:runCampaign;return {task:brief,...replay({...options,runSeed:task.runSeed,routePolicy:task.policy,predictProfile:task.predictProfile||'feedback'}),...(x?{runtimeIdentity:x.provenance,learningModel:'Current engine two-attempt settlement for feedback Predict, artifact and Mystery; high/low make one synthetic-knowledge Predict attempt; skip never opens Predict. No unearned success or Focus.'}:{})};}
 catch(error){return {task:brief,runSeed:task.runSeed,seed:task.seed,status:'INVALID_POLICY_OR_ENGINE',error:error.message,campaignWon:null,stages:[{stage:1,reached:false,cleared:false},{stage:2,reached:false,cleared:false}],rooms:[],checkpoints:[],routeDecisions:[],apiCalls:0,invalidStates:0};}
}
if(!isMainThread)parentPort.on('message',task=>parentPort.postMessage(runTask(task)));
module.exports={runTask};
