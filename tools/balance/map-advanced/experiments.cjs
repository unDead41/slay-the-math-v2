'use strict';
const fs=require('node:fs'),path=require('node:path'),{Worker}=require('node:worker_threads'),{performance}=require('node:perf_hooks');
const defaults=require('./config.json'),registry=require('../../../modules/map/data/seed-registry.json');
const {sampleRunSeeds}=require('../map/audit.cjs');
const {analyzeMap,hash}=require('../map/structure.cjs');
const {sourceAudit,sha}=require('../map/source-audit.cjs');
const {safeOutput,writeJson}=require('../map/export.cjs');
const {difficultyReadiness,assertDifficulty}=require('./scenarios.cjs');
const {Journal}=require('./storage.cjs');
const E=require('../../../dist/engine.js');
const root=path.resolve(__dirname,'../../..');
function buildCampaignTasks(seeds,config=defaults){
 const tasks=[];
 for(const seed of seeds){
  const samples=sampleRunSeeds(seed,Math.max(...Object.values(config.routePolicies),...Object.values(config.predictProfiles)),config.samplerSeed);
  for(const [policy,count] of Object.entries(config.routePolicies))for(let repetition=0;repetition<count;repetition++)tasks.push({id:`route:${seed}:${policy}:${repetition}`,batch:'campaign',group:'route',seed,runSeed:samples[repetition],policy,predictProfile:'feedback',repetition,referenceTrialId:policy==='uniform-visible-v1'?`pilot:${seed}:${repetition}`:null,options:{mode:config.mode,difficulty:config.difficulty,telemetry:true,captureCheckpoints:policy==='uniform-visible-v1',limits:config.limits}});
  for(const [predictProfile,count] of Object.entries(config.predictProfiles))for(let repetition=0;repetition<count;repetition++)tasks.push({id:`predict:${seed}:${predictProfile}:${repetition}`,batch:'campaign',group:'predict',seed,runSeed:samples[repetition],policy:config.predictRoutePolicy,predictProfile,repetition,options:{mode:config.mode,difficulty:config.difficulty,telemetry:true,limits:config.limits}});
 }
 return tasks;
}
function buildEntryBank(records,config=defaults){
 const rows=[],seen=new Set(),counts=new Map();
 for(const r of records.filter(r=>r.task.policy==='uniform-visible-v1'&&r.task.group==='route').sort((a,b)=>a.task.id.localeCompare(b.task.id)))for(const c of r.checkpoints||[]){
  const key=[r.seed,c.stage,r.runSeed].join(':'),group=r.seed+':'+c.stage;
  if(seen.has(key)||(counts.get(group)||0)>=config.matchedEntriesPerStage)continue;
  if(c.stateHash!==hash(c.state)||c.runSeed!==r.runSeed)throw Error('Invalid captured entry fingerprint.');
  seen.add(key);counts.set(group,(counts.get(group)||0)+1);rows.push({id:'entry-'+hash([r.task.id,c.stage,c.stateHash,c.clock,c.policyRngStates]).slice(0,24),seed:r.seed,stage:c.stage,runSeed:r.runSeed,sourceTrialId:r.task.id,stateHash:c.stateHash,state:c.state,clock:c.clock,policyRngStates:c.policyRngStates});
 }
 return rows;
}
function buildMatchedTasks(bank,analyses,config=defaults){
 const lookup=new Map(analyses.map(a=>[a.summary.seed+':'+a.summary.stage,a]));
 return bank.flatMap(entry=>config.ranks.map(rank=>{
  const a=lookup.get(entry.seed+':'+entry.stage),route=a.routes.find(r=>r.id===a.summary[rank+'RouteId']);
  return {id:`matched:${entry.id}:${rank}`,batch:'matched',group:'matched',seed:entry.seed,runSeed:entry.runSeed,policy:'uniform-visible-v1',predictProfile:'feedback',entryId:entry.id,entryStateHash:entry.stateHash,targetStage:entry.stage,rank,routeId:route.id,options:{mode:config.mode,difficulty:config.difficulty,initialState:entry.state,initialClock:entry.clock,initialRngStates:entry.policyRngStates,forcedRoutes:{[entry.stage]:route.nodeIds},stopAfterStage:entry.stage,telemetry:true,limits:config.limits}};
 }));
}
async function runPool(tasks,{workers,deadline,timeoutMs,onResult}){
 if(!tasks.length)return {completed:0,budgetExhausted:false};
 let next=0,done=0,budgetExhausted=false,settled=false;const slots=[];
 await new Promise((resolve,reject)=>{
  function finish(){if(slots.every(s=>s.closed)){settled=true;resolve();}}
  function stop(s){s.closed=true;clearTimeout(s.timer);s.worker.terminate().catch(()=>{});finish();}
  function fail(error){settled=true;for(const s of slots){s.closed=true;clearTimeout(s.timer);s.worker.terminate().catch(()=>{});}reject(error);}
  function dispatch(s){
   if(next===tasks.length){stop(s);return;}
   if(performance.now()>=deadline){budgetExhausted=true;stop(s);return;}
   s.task=tasks[next++];s.timer=setTimeout(()=>{try{onResult({task:Object.fromEntries(Object.entries(s.task).filter(([k])=>k!=='options')),seed:s.task.seed,runSeed:s.task.runSeed,status:'BENCHMARK_LIMIT_CENSORED',error:'WORKER_WALL_LIMIT',campaignWon:null,rooms:[],stages:[{reached:false,cleared:false},{reached:false,cleared:false}],checkpoints:[],apiCalls:0,invalidStates:0});done++;s.task=null;s.closed=true;s.worker.terminate().catch(()=>{});if(next<tasks.length&&performance.now()<deadline)spawn();else{if(next<tasks.length)budgetExhausted=true;finish();}}catch(e){fail(e);}},timeoutMs);
   s.worker.postMessage(s.task);
  }
  function spawn(){
   const s={worker:new Worker(path.join(__dirname,'worker.cjs')),task:null,closed:false,timer:null};slots.push(s);
   s.worker.on('message',r=>{if(s.closed||settled)return;clearTimeout(s.timer);try{if(r.task.id!==s.task.id)throw Error('Worker task mismatch.');onResult(r);done++;s.task=null;dispatch(s);}catch(e){fail(e);}});
   s.worker.on('error',e=>{if(!s.closed&&!settled)fail(e);});dispatch(s);
  }
  for(let i=0;i<Math.min(workers,tasks.length);i++)spawn();
 });
 return {completed:done,budgetExhausted};
}
function makeContext(seeds,config){
 const input=sourceAudit(),files=['config.json','experiments.cjs','storage.cjs','worker.cjs','route-policy.cjs','question-policy.cjs','telemetry.cjs','scenarios.cjs'];
 return {reportVersion:config.reportVersion,protocolVersion:config.protocolVersion,config,seedList:seeds,sourceHashes:input.sourceHashes,legacyToolHashes:input.toolHashes,protocolHashes:Object.fromEntries(files.map(f=>['tools/balance/map-advanced/'+f,sha(fs.readFileSync(path.join(__dirname,f)))])),previousAuditCommit:config.previousAuditCommit,referenceRuntimeHashes:JSON.parse(fs.readFileSync(path.join(root,'reports/map-balance/base-2800f9a/context.json'))).sourceHashes,referenceHashes:Object.fromEntries(['context.json','trials.json','seeds.json','routes.json','maps.json'].map(f=>['reports/map-balance/base-2800f9a/'+f,sha(fs.readFileSync(path.join(root,'reports/map-balance/base-2800f9a',f)))])),mode:config.mode,difficulty:config.difficulty,syntheticPredictOracleProfiles:['high','low'],difficultyReadiness:difficultyReadiness(),entryPopulation:'Stage 1 post-starting-artifact; Stage 2 actual uniform-reference survivors, conditional; unique runSeed per seed/stage',rngLimitation:'Identical engine/policy RNG at entry; route divergence changes later RNG consumption. Matched estimates are bundled route effects, not isolated room causality.'};
}
async function runExperiments(options={}){
 const start=performance.now(),config={...defaults,...options.config};assertDifficulty(config.difficulty);
 const seeds=registry.seeds.slice(0,options.seedLimit||registry.seeds.length),context=makeContext(seeds,config),out=safeOutput(root,options.out||'reports/map-balance/v1.3'),journal=new Journal(out,context,{resume:!!options.resume,shardBytes:config.shardBytes});
 const analyses=seeds.flatMap(seed=>[1,2].map(stage=>analyzeMap(seed,stage,require('../map/config.json')))),campaignTasks=buildCampaignTasks(seeds,config),knownCampaigns=new Set(campaignTasks.map(t=>t.id));
 const onResult=r=>{journal.append(r);if(journal.records.length%50===0)process.stdout.write(JSON.stringify({completed:journal.records.length,last:r.task.id,status:r.status})+'\n');};
 const poolOptions={workers:options.workers||config.workers,deadline:start+(options.maxSeconds||config.maxSeconds)*1000,timeoutMs:config.workerTimeoutMs,onResult};
 const campaignRun=await runPool(campaignTasks.filter(t=>!journal.ids.has(t.id)),poolOptions),campaignComplete=campaignTasks.every(t=>journal.ids.has(t.id));
 const bank=buildEntryBank(journal.records,config),matchedTasks=buildMatchedTasks(bank,analyses,config);
 const allKnown=new Set([...knownCampaigns,...matchedTasks.map(t=>t.id)]);for(const r of journal.records)if(!allKnown.has(r.task.id))throw Error('Journal contains an unexpected task ID.');
 const matchedRun=campaignComplete?await runPool(matchedTasks.filter(t=>!journal.ids.has(t.id)),poolOptions):{completed:0,budgetExhausted:true};
 const runState={contextId:journal.contextId,campaignPlanned:campaignTasks.length,campaignReturned:journal.records.filter(r=>r.task.batch==='campaign').length,matchedPlanned:matchedTasks.length,matchedReturned:journal.records.filter(r=>r.task.batch==='matched').length,entryStates:bank.length,stage1Entries:bank.filter(e=>e.stage===1).length,stage2Entries:bank.filter(e=>e.stage===2).length,evaluationComplete:campaignComplete&&matchedTasks.every(t=>journal.ids.has(t.id)),budgetExhausted:campaignRun.budgetExhausted||matchedRun.budgetExhausted,workersUsed:options.workers||config.workers,wallBudgetSeconds:options.maxSeconds||config.maxSeconds,elapsedSeconds:(performance.now()-start)/1000};
 writeJson(path.join(out,'run-state.json'),runState,true);writeJson(path.join(out,'trials-index.json'),{contextId:journal.contextId,records:journal.records.length,shards:journal.index()},true);
 writeJson(path.join(out,'entry-bank.json'),bank.map(({state,...entry})=>({...entry,hp:state.hp,maxHp:state.maxHp,gold:state.gold,deckSize:state.deck.length,deckFingerprint:hash(state.deck.map(c=>[c.key,c.upgraded]).sort()),upgrades:state.deck.filter(c=>c.upgraded).length,artifactIds:E.ownedArtifacts(state).map(a=>a.id)})));
 if(options.report!==false){const {writeReport}=require('./report.cjs');writeReport({out,records:journal.records,bank,analyses,context,runState});}
 return {out,context,runState,records:journal.records,bank,analyses};
}
function parseArgs(args){
 const out={};for(let i=0;i<args.length;i++){const k=args[i];if(k==='--resume'){out.resume=true;continue;}const key={'--out':'out','--seed-limit':'seedLimit','--workers':'workers','--max-seconds':'maxSeconds'}[k];if(!key||args[i+1]===undefined)throw Error('Unknown/incomplete option '+k);out[key]=key==='out'?args[++i]:Number(args[++i]);}
 for(const k of ['seedLimit','workers','maxSeconds'])if(out[k]!==undefined&&(!Number.isSafeInteger(out[k])||out[k]<1))throw Error('Invalid '+k);
 if(out.seedLimit>100||out.workers>4)throw Error('Requested budget outside supported range.');return out;
}
if(require.main===module)runExperiments(parseArgs(process.argv.slice(2))).then(r=>console.log(JSON.stringify({out:r.out,...r.runState}))).catch(e=>{console.error(e.stack);process.exitCode=1;});
module.exports={buildCampaignTasks,buildEntryBank,buildMatchedTasks,runPool,makeContext,runExperiments,parseArgs};
