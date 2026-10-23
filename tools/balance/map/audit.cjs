'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {performance}=require('node:perf_hooks');
const configBase=require('./config.json');
const registry=require('../../../modules/map/data/seed-registry.json');
const {analyzeMap,hash}=require('./structure.cjs');
const {runCampaign,stream}=require('./replay.cjs');
const {csv,aggregateTrials,writeJson,atomicJson,safeOutput}=require('./export.cjs');
const {sourceAudit,sha}=require('./source-audit.cjs');
const root=path.resolve(__dirname,'../../..');
function sampleRunSeeds(seed,count,samplerSeed=42){
 const base=Number(seed.slice(4))-1;if(!registry.seeds.includes(seed)||!Number.isSafeInteger(count)||count<0)throw Error('Invalid seed/sample size.');
 const random=stream(samplerSeed,'map-sampler:'+seed),span=Math.floor((4294967295-base)/100)+1,limit=Math.floor(4294967296/span)*span;
 const values=[];while(values.length<count){const n=Math.floor(random()*4294967296);if(n<limit)values.push(base+100*(n%span));}return values;
}
function parseArgs(args){
 const o={out:'reports/map-balance/base-2800f9a',trialsPerSeed:configBase.pilotTrialsPerSeed,seedLimit:registry.seeds.length,maxSeconds:1800,diagnosticReplays:3,samplerSeed:42,resume:false};
 const flags={'--out':'out','--trials-per-seed':'trialsPerSeed','--seed-limit':'seedLimit','--max-seconds':'maxSeconds','--diagnostic-replays':'diagnosticReplays','--sampler-seed':'samplerSeed'};
 for(let i=0;i<args.length;i++){if(args[i]==='--resume'){o.resume=true;continue;}const key=flags[args[i]];if(!key||args[i+1]===undefined)throw Error('Unknown/incomplete option '+args[i]);o[key]=key==='out'?args[++i]:Number(args[++i]);}
 for(const k of ['trialsPerSeed','seedLimit','maxSeconds','diagnosticReplays','samplerSeed'])if(!Number.isSafeInteger(o[k])||o[k]<0)throw Error('Invalid '+k);
 if(o.trialsPerSeed<1||o.trialsPerSeed>8192||o.seedLimit<1||o.seedLimit>registry.seeds.length||o.maxSeconds<1||o.diagnosticReplays>3)throw Error('Audit budget outside supported range.');
 return o;
}
function compactTrial(t){return {...t,plannedRoutes:Object.fromEntries(Object.entries(t.plannedRoutes).map(([stage,r])=>[stage,{id:r.id,nodeIds:r.nodeIds,probability:r.probability}]))};}
function traversedRoute(t,stage){return t.plannedRoutes[stage].nodeIds.every(id=>t.rooms.some(r=>r.stage===stage&&r.nodeId===id));}
function audit(options){
 const start=performance.now(),config={...configBase,pilotTrialsPerSeed:options.trialsPerSeed},input=sourceAudit(),seeds=registry.seeds.slice(0,options.seedLimit),analyses=[];
 for(const seed of seeds)for(const stage of [1,2])analyses.push(analyzeMap(seed,stage,config));
 const context={reportVersion:config.reportVersion,estimateVersion:config.estimateVersion,scoringVersion:config.scoringVersion,mode:config.mode,difficulty:config.difficulty,playerPolicyVersion:config.playerPolicyVersion,questionPolicy:'uniform-untried-visible-feedback',routePolicy:config.routePolicyVersion,samplerVersion:config.samplerVersion,samplerSeed:options.samplerSeed,inputPackage:input.inputPackage,sourceHashes:input.sourceHashes,toolHashes:input.toolHashes,referenceDamagePerTurn:config.referenceDamagePerTurn,referenceBlockPerTurn:config.referenceBlockPerTurn,referenceRestHeal:config.referenceRestHeal,scoringReference:config.referenceWinProbability,pilotTrialsPerSeed:options.trialsPerSeed,diagnosticReplays:options.diagnosticReplays,seedList:seeds,limits:config.limits,entrySet:'actual-new-run-and-campaign-carry'};
 const contextId=hash(context),out=safeOutput(root,options.out),checkpoint=path.join(out,'checkpoint.json');
 let trials=[];
 if(options.resume&&fs.existsSync(checkpoint)){const old=JSON.parse(fs.readFileSync(checkpoint));if(old.contextId!==contextId)throw Error('Checkpoint context changed; use a fresh output directory.');trials=old.trials;}
 else if(fs.existsSync(checkpoint))throw Error('Output already has a checkpoint; use --resume or a fresh directory.');
 const completed=new Set(trials.map(t=>t.trialId)),tasks=[];
 for(const seed of seeds){
  sampleRunSeeds(seed,options.trialsPerSeed,options.samplerSeed).forEach((runSeed,i)=>tasks.push({trialId:'pilot:'+seed+':'+i,batch:'pilot',seed,runSeed}));
  for(let rank=0;rank<options.diagnosticReplays;rank++){
   const key=['easiestRouteId','medianRouteId','hardestRouteId'][rank],forcedRoutes={};
   for(const stage of [1,2]){const a=analyses.find(a=>a.summary.seed===seed&&a.summary.stage===stage);forcedRoutes[stage]=a.routes.find(r=>r.id===a.summary[key]).nodeIds;}
   tasks.push({trialId:'diagnostic:'+seed+':'+rank,batch:'diagnostic',rank:['easiest','median','hardest'][rank],seed,runSeed:Number(seed.slice(4))-1+rank*100,forcedRoutes});
  }
 }
 let budgetExhausted=false;
 for(const task of tasks){
  if(completed.has(task.trialId))continue;
  if((performance.now()-start)/1000>=options.maxSeconds){budgetExhausted=true;break;}
  const result=runCampaign({runSeed:task.runSeed,mode:config.mode,forcedRoutes:task.forcedRoutes,limits:config.limits,trace:task.trialId==='pilot:'+seeds[0]+':0'});
  trials.push(compactTrial({...result,trialId:task.trialId,batch:task.batch,rank:task.rank||null,contextId}));
  if(trials.length%25===0){atomicJson(checkpoint,{contextId,trials});process.stdout.write(JSON.stringify({completed:trials.length,planned:tasks.length,last:task.trialId,status:result.status})+'\n');}
 }
 atomicJson(checkpoint,{contextId,trials});
 const pilot=trials.filter(t=>t.batch==='pilot'),diagnostic=trials.filter(t=>t.batch==='diagnostic'),routeRows=[],seedRows=[],nodeRows=[];
 for(const a of analyses){
  const {seed,stage}=a.summary,group=pilot.filter(t=>t.seed===seed),stageScore=aggregateTrials(group,stage,options.trialsPerSeed,config.referenceWinProbability);
  const enteredBoss=group.flatMap(t=>t.rooms.filter(r=>r.stage===stage&&r.roomType==='boss'));
  const reached=trials.filter(t=>t.seed===seed&&t.stages[stage-1].reached);
  for(const r of a.routes){
   const selected=reached.filter(t=>t.plannedRoutes[stage].id===r.id),pg=selected.filter(t=>t.batch==='pilot'),dg=selected.filter(t=>t.batch==='diagnostic'),resolved=aggregateTrials(pg,stage,pg.length,config.referenceWinProbability);
   routeRows.push({...r,contextId,variants:r.variants.map(v=>{const {encounters,...rest}=v;return rest;}),simulationTrials:pg.length,simulationWins:pg.filter(t=>t.stages[stage-1].cleared).length,
    simulationErrors:resolved.errors,simulationCensored:resolved.censored,fullyTraversedTrials:pg.filter(t=>traversedRoute(t,stage)).length,
    diagnosticTrials:dg.length,diagnosticWins:dg.filter(t=>t.stages[stage-1].cleared).length,diagnosticFullyTraversedTrials:dg.filter(t=>traversedRoute(t,stage)).length,pilotCombatPower:null,
    scope:stage===1?'stage_standardized':'stage_campaign_conditional'});
  }
  const simRoutes=new Set(reached.map(t=>t.plannedRoutes[stage].id));
  const fullRoutes=new Set(reached.filter(t=>traversedRoute(t,stage)).map(t=>t.plannedRoutes[stage].id));
  seedRows.push({...a.summary,...stageScore,contextId,scope:stage===1?'stage_standardized':'stage_campaign_conditional',simulatedUniqueRoutes:simRoutes.size,simulatedRouteCoverage:simRoutes.size/a.routes.length,fullyTraversedUniqueRoutes:fullRoutes.size,fullyTraversedRouteCoverage:fullRoutes.size/a.routes.length,bossEntries:enteredBoss.length,meanBossEntryHp:enteredBoss.length?enteredBoss.reduce((s,r)=>s+r.enter.hp,0)/enteredBoss.length:null,meanBossEntryDeckSize:enteredBoss.length?enteredBoss.reduce((s,r)=>s+r.enter.deckSize,0)/enteredBoss.length:null,balanceStatus:'PENDING_MASTER'});
  for(const n of a.map.nodes){
   const rooms=pilot.filter(t=>t.seed===seed).flatMap(t=>t.rooms.filter(r=>r.stage===stage&&r.nodeId===n.id)),resolved=rooms.filter(r=>['CLEARED','VICTORY','DEFEAT'].includes(r.result)),dead=resolved.filter(r=>r.result==='DEFEAT');
   nodeRows.push({seed,stage,nodeId:n.id,level:n.level,type:n.type,contextId,entries:rooms.length,resolvedEntries:resolved.length,deaths:dead.length,unresolved:rooms.length-resolved.length,conditionalFailureRate:resolved.length?dead.length/resolved.length:null,meanEntryHp:rooms.length?rooms.reduce((s,r)=>s+r.enter.hp,0)/rooms.length:null,meanExitHp:resolved.length?resolved.reduce((s,r)=>s+r.exit.hp,0)/resolved.length:null});
  }
 }
 const campaignRows=seeds.map(seed=>({seed,contextId,scope:'campaign',mode:config.mode,difficulty:config.difficulty,...aggregateTrials(pilot.filter(t=>t.seed===seed),null,options.trialsPerSeed,config.referenceWinProbability)}));
 const summary={contextId,requestedSeedCount:registry.seeds.length,seedCount:seeds.length,mapCount:analyses.length,structureRoutes:routeRows.length,structureCoverage:seeds.length===registry.seeds.length?1:seeds.length/registry.seeds.length,
  forcedEliteMaps:seedRows.filter(s=>s.forcedElite).length,noEarlyRestMaps:seedRows.filter(s=>s.noEarlyRest).length,
  plannedPilotTrials:seeds.length*options.trialsPerSeed,actualPilotTrials:pilot.length,plannedDiagnosticTrials:seeds.length*options.diagnosticReplays,actualDiagnosticTrials:diagnostic.length,
  pilotVictories:pilot.filter(t=>t.status==='VICTORY').length,pilotDefeats:pilot.filter(t=>t.status==='DEFEAT').length,pilotErrors:pilot.filter(t=>t.status==='INVALID_POLICY_OR_ENGINE').length,pilotCensored:pilot.filter(t=>t.status==='BENCHMARK_LIMIT_CENSORED').length,
  diagnosticErrors:diagnostic.filter(t=>t.status==='INVALID_POLICY_OR_ENGINE').length,diagnosticCensored:diagnostic.filter(t=>t.status==='BENCHMARK_LIMIT_CENSORED').length,
  simulatedUniqueStageRoutes:seedRows.reduce((s,r)=>s+r.simulatedUniqueRoutes,0),fullyTraversedUniqueStageRoutes:seedRows.reduce((s,r)=>s+r.fullyTraversedUniqueRoutes,0),budgetExhausted,evaluationComplete:trials.length===tasks.length,studentPlaytests:0,implementedCandidateDifficulties:[],
  campaignPilot:aggregateTrials(pilot,null,seeds.length*options.trialsPerSeed,config.referenceWinProbability),stage1Pilot:aggregateTrials(pilot,1,seeds.length*options.trialsPerSeed,config.referenceWinProbability),stage2ConditionalPilot:aggregateTrials(pilot,2,seeds.length*options.trialsPerSeed,config.referenceWinProbability),
  simulationCoverageDefinition:'Distinct selected stage route IDs with at least one node entered, including partial traversals; fullyTraversed counts require entry to all ten planned nodes. Both include pilot and diagnostics; node risk and boss-entry means use pilot only.',
  estimateDefinition:'Mean across three reachable roster classes of peak cumulative nominal HP burden after nominal Rest credit; fixed abstract 12 damage/6 Block, not a played deck or combat CP.',
  routeMedianDefinition:'Lower unweighted median complete route, ordered by estimatedPressure then stable route ID; not a player-policy-weighted median.',
  simulationScope:'Current-runtime Challenge campaign pilot; uniform visible exits, visible greedy combat and feedback-only answers; synthetic policy, not pupil win rate.',
  untested:['candidate Easy/Medium/Hard tuning','student cohorts','exhaustive card/event/RNG combinations','matched-deck card ICP/CCP','final calibrated map CP','browser/UI interaction'],actualEngineCalls:trials.reduce((s,t)=>s+t.apiCalls,0)};
 writeJson(path.join(out,'context.json'),context,true);writeJson(path.join(out,'source-differences.json'),input,true);writeJson(path.join(out,'summary.json'),summary,true);
 writeJson(path.join(out,'seeds.json'),seedRows);writeJson(path.join(out,'routes.json'),routeRows);writeJson(path.join(out,'campaigns.json'),campaignRows);writeJson(path.join(out,'trials.json'),trials);writeJson(path.join(out,'nodes.json'),nodeRows);
 writeJson(path.join(out,'maps.json'),analyses.map(a=>({seed:a.summary.seed,stage:a.summary.stage,mapHash:a.summary.mapHash,contextId,snapshot:a.map})));
 const seedCols=['seed','stage','scope','contextId','mode','difficulty','structureStatus','routeCount','forcedElite','noEarlyRest','easiestRouteId','medianRouteId','hardestRouteId','minEstimatedPressure','medianEstimatedPressure','maxEstimatedPressure','uniformExitExpectedPressure','simulatedUniqueRoutes','simulatedRouteCoverage','fullyTraversedUniqueRoutes','fullyTraversedRouteCoverage','plannedTrials','trials','wins','losses','notReached','errors','censored','campaignErrors','campaignCensored','combatPower','winRate','winInterval95','combatPowerInterval95','cpUpperUnbounded','scoreStatus','bossEntries','meanBossEntryHp','meanBossEntryDeckSize'];
 const routeCols=['seed','stage','id','contextId','scope','mode','difficulty','scoreKind','estimateVersion','nodeIds','probability','estimatedPressure','minVariantPressure','maxVariantPressure','battleCount','eliteCount','shopCount','restCount','mysteryCount','firstRestLevel','earlyRest','maxEliteChain','maxCombatsSinceRest','combatPower','simulationTrials','simulationWins','simulationErrors','simulationCensored','fullyTraversedTrials','diagnosticTrials','diagnosticWins','diagnosticFullyTraversedTrials'];
 fs.writeFileSync(path.join(out,'seeds.csv'),csv(seedRows,seedCols));fs.writeFileSync(path.join(out,'routes.csv'),csv(routeRows,routeCols));
 fs.writeFileSync(path.join(out,'campaigns.csv'),csv(campaignRows,['seed','contextId','mode','difficulty','scope','plannedTrials','trials','wins','losses','errors','censored','combatPower','winRate','winInterval95','combatPowerInterval95','cpUpperUnbounded','scoreStatus']));
 const files=fs.readdirSync(out).filter(f=>f!=='manifest.json'&&f!=='checkpoint.json').sort();
 writeJson(path.join(out,'manifest.json'),{reportVersion:config.reportVersion,contextId,generatedAt:new Date().toISOString(),requestedBase:config.baseCommit,sourceCheckoutHead:input.sourceCheckoutHead,files:Object.fromEntries(files.map(f=>[f,{sha256:sha(fs.readFileSync(path.join(out,f))),bytes:fs.statSync(path.join(out,f)).size}]))},true);
 process.stdout.write(JSON.stringify({output:out,...summary})+'\n');return {out,summary};
}
if(require.main===module){try{audit(parseArgs(process.argv.slice(2)));}catch(e){process.stderr.write(e.stack+'\n');process.exitCode=1;}}
module.exports={sampleRunSeeds,parseArgs,audit};
