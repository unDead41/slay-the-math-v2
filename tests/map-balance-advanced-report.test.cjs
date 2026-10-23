'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {checkFiles}=require('../tools/balance/map-advanced/check.cjs');
const {hash}=require('../tools/balance/map/structure.cjs'),{sha}=require('../tools/balance/map/source-audit.cjs');
const {summarizeScope,recoveryWindows,pairedDifference,legacyDrift,resourceSummary,compareReports,routeCoverage,policyComparisons,buildDifficultyDrivers}=require('../tools/balance/map-advanced/report.cjs');
const row=(status,one,two)=>({task:{id:status,batch:'campaign'},status,stages:[{reached:true,cleared:one},{reached:one,cleared:two}],rooms:[],metrics:{shop:{visits:0,zeroAffordableCards:0},predict:{}},final:{gold:0,hp:0}});
test('stage summaries preserve conditional denominators and downstream-resolved wins',()=>{
 const a=row('DEFEAT',false,false),b=row('BENCHMARK_LIMIT_CENSORED',true,false);
 const first=summarizeScope([a,b],1,2);assert.equal(first.wins,1);assert.equal(first.trials,2);assert.equal(first.censored,0);
 const second=summarizeScope([a,b],2,2);assert.equal(second.trials,0);assert.equal(second.notReached,1);assert.equal(second.combatPower,null);
 assert.equal(summarizeScope([a],null,1).shopZeroAffordableRate,null);
});
test('failure HP windows retain death before a reachable Rest rather than inventing recovery',()=>{
 const trial={seed:'STM-001',task:{id:'penalty'},status:'DEFEAT',rooms:[{stage:1,nodeId:'m',roomType:'event',enter:{hp:30},exit:{hp:20},eventTransactions:[{hpDelta:-10,outcome:'WRONG'}]},{stage:1,nodeId:'e',roomType:'elite',result:'DEFEAT',enter:{hp:20},exit:{hp:0}}]};
 const map={nodes:[{id:'m',level:5,type:'mystery'},{id:'e',level:6,type:'elite'},{id:'b',level:7,type:'battle'},{id:'c',level:8,type:'battle'},{id:'r',level:9,type:'rest'}],edges:[{from:'m',to:'e'},{from:'e',to:'b'},{from:'b',to:'c'},{from:'c',to:'r'}]};
 const windows=recoveryWindows(trial,new Map([['STM-001:1',map]]));
 const penalty=windows.find(w=>w.kind==='mystery-failure-hp-loss');
 assert.equal(penalty.hpLost,10);assert.equal(penalty.minLegalRoomsToRest,4);assert.equal(penalty.deathBeforeRest,true);assert.equal(penalty.recoveryReached,false);assert.equal(penalty.observedRoomsToRest,null);
 const elite=windows.find(w=>w.kind==='elite');assert.equal(elite.previousRestVisited,false);assert.equal(elite.combatsSincePreviousRest,0);assert.equal(elite.roomsSincePreviousRest,1);
});
test('recovery combat load includes an observed Mystery battle but not an ordinary event',()=>{
 const trial={seed:'STM-001',task:{id:'extra-battle'},status:'DEFEAT',rooms:[{stage:1,nodeId:'r',roomType:'camp',enter:{hp:30},exit:{hp:42},metrics:{hpRecovered:12}},{stage:1,nodeId:'m',roomType:'event',enter:{hp:42},exit:{hp:39},predict:{opportunities:1},playerTurns:1},{stage:1,nodeId:'e',roomType:'elite',enter:{hp:39},exit:{hp:0},result:'DEFEAT',metrics:{hpLost:39}}]};
 const result=()=>recoveryWindows(trial,new Map()).find(w=>w.kind==='elite');
 assert.equal(result().combatsSincePreviousRest,1);
 trial.rooms[1].predict.opportunities=0;trial.rooms[1].playerTurns=0;
 assert.equal(result().combatsSincePreviousRest,0);
});
test('difficulty driver numerators use the same feedback trial population as stage entries',()=>{
 const analysis={summary:{seed:'STM-001',stage:1,forcedElite:false,noEarlyRest:true,minEstimatedPressure:10,maxEstimatedPressure:20},routes:[{maxEliteChain:1,shopCount:0,probability:1}]};
 const records=['feedback','high'].map((profile,i)=>({...row('DEFEAT',false,false),seed:'STM-001',predictProfile:profile,task:{id:profile,group:i?'predict':'route'}}));
 const windows=records.map((r,i)=>({trialId:r.task.id,seed:r.seed,stage:1,kind:'mystery-failure-hp-loss',deathBeforeRest:!!i}));
 const ranks=[{seed:'STM-001',stage:1,rank:'easiest',winRate:.5},{seed:'STM-001',stage:1,rank:'hardest',winRate:.25}];
 const driver=buildDifficultyDrivers([analysis],records,windows,ranks)[0];
 assert.equal(driver.observedStageEntries,1);assert.equal(driver.mysteryFailureHpLossWindows,1);assert.equal(driver.mysteryFailureDeathsBeforeRest,0);
});
test('route coverage keeps unvisited routes and partial adaptive paths distinct',()=>{
 const analysis={summary:{seed:'STM-001',stage:1,easiestRouteId:'a',medianRouteId:'b',hardestRouteId:'c'},routes:['a','b','c'].map(id=>({id,estimatedPressure:1,probability:1/3}))};
 const r={seed:'STM-001',task:{batch:'campaign'},plannedRoutes:{1:{id:'a',nodeIds:Array.from({length:10},(_,i)=>'n'+i)}},rooms:[{stage:1,nodeId:'n0'}]};
 const rows=routeCoverage([r],[analysis]);assert.equal(rows.length,3);assert.equal(rows[0].campaignPlans,1);assert.equal(rows[0].campaignStarts,1);assert.equal(rows[0].campaignFullVisits,0);assert.equal(rows[1].campaignPlans,0);assert.equal(rows[1].scoreStatus,'NO_MATCHED_SCORE');
});
test('matched route coverage excludes the random preplan for the stage outside replay scope',()=>{
 const analyses=[1,2].map(stage=>({summary:{seed:'STM-001',stage},routes:[{id:'a'+stage,estimatedPressure:1,probability:1}]}));
 const r={seed:'STM-001',task:{batch:'matched',targetStage:1},plannedRoutes:{1:{id:'a1',nodeIds:['n1']},2:{id:'a2',nodeIds:['n2']}},rooms:[{stage:1,nodeId:'n1'}]};
 const rows=routeCoverage([r],analyses);assert.equal(rows[0].matchedPlans,1);assert.equal(rows[1].matchedPlans,0);
});
test('matched contrasts require identical entry and keep unknown boss HP missing',()=>{
 const a={...row('STAGE_CLEARED',true,false),task:{entryId:'x',entryStateHash:'same',rank:'easiest'},entryStateHash:'same',final:{hp:20,gold:50}};
 const b={...row('DEFEAT',false,false),task:{entryId:'x',entryStateHash:'same',rank:'hardest'},entryStateHash:'same',final:{hp:0,gold:10}};
 const diff=pairedDifference(a,b,1);assert.equal(diff.winDelta,-1);assert.equal(diff.finalHpDelta,-20);assert.equal(diff.bossEntryHpDelta,null);
 assert.throws(()=>pairedDifference(a,{...b,entryStateHash:'different'},1),/entry/i);
});
test('unobserved entry in a censored comparison remains unknown rather than crashing or losing',()=>{
 const task={entryId:'x',entryStateHash:'same',rank:'easiest'};
 const a={...row('STAGE_CLEARED',true,false),task,entryStateHash:'same'},b={...row('BENCHMARK_LIMIT_CENSORED',false,false),task:{...task,rank:'hardest'},entryStateHash:undefined,final:null};
 const pair=pairedDifference(a,b,1);assert.equal(pair.winDelta,null);assert.equal(pair.pairedEntryVerified,false);
 const control={...a,seed:'STM-001',runSeed:0,campaignWon:true,task:{group:'route',policy:'uniform-visible-v1'}},candidate={...b,seed:'STM-001',runSeed:0,campaignWon:null,task:{group:'route',policy:'seek-shop'}};
 const comparisons=policyComparisons([control,candidate],{routePolicies:{'uniform-visible-v1':1,'seek-shop':1}});assert.equal(comparisons[0].unknown,1);assert.equal(comparisons[0].pairs,0);
});
test('Rest opportunity and actual HP recovery remain different measures',()=>{
 const r=row('VICTORY',true,true);r.rooms=[{roomType:'camp',enter:{hp:30,gold:40,deckSize:12,upgrades:0,artifacts:[]},exit:{hp:42,gold:40,deckSize:12,upgrades:0,artifacts:[]},metrics:{hpRecovered:12,hpLost:0},restAction:'heal'}];
 const rest=resourceSummary([r]).find(x=>x.roomType==='rest');assert.equal(rest.visits,1);assert.equal(rest.meanHpRecovered,12);assert.equal(rest.upgrades,0);
});
test('canonical reference drift cannot pass as a harmless balancing result',()=>{
 const actual=[{...row('DEFEAT',false,false),task:{referenceTrialId:'pilot:a'},traceHash:'new'}],reference=[{trialId:'pilot:a',status:'VICTORY',traceHash:'old'}];
 const check=legacyDrift(actual,reference);assert.equal(check.checked,1);assert.equal(check.mismatches.length,1);assert.equal(check.status,'FAIL');
});
test('automatic comparisons refuse changed methods instead of claiming balance regression',()=>{
 const a={context:{protocolVersion:'a',config:{samplerSeed:42},protocolHashes:{x:'old'}},policySummary:[]},b={context:{protocolVersion:'b',config:{samplerSeed:42},protocolHashes:{x:'new'}},policySummary:[]};
 assert.equal(compareReports(a,b).status,'INCOMPATIBLE_METHOD');
});
test('automatic comparisons detect changes in the legacy replay and report analysis too',()=>{
 const context={protocolVersion:'same',config:{samplerSeed:42},protocolHashes:{x:'same'},seedList:['STM-001'],sourceHashes:{x:'same'},legacyToolHashes:{replay:'old'}};
 const a={context,policySummary:[],analysisProvenance:{analysisHashes:{report:'old'}}};
 assert.equal(compareReports(a,{...a,context:{...context,legacyToolHashes:{replay:'new'}}}).status,'INCOMPATIBLE_METHOD');
 assert.equal(compareReports(a,{...a,analysisProvenance:{analysisHashes:{report:'new'}}}).status,'INCOMPATIBLE_METHOD');
});
test('compatible comparison leaves a previously unobserved cohort delta unknown',()=>{
 const context={protocolVersion:'same',config:{samplerSeed:42},protocolHashes:{x:'same'},seedList:['STM-001'],sourceHashes:{x:'same'}};
 const result=compareReports({context,policySummary:[]},{context,policySummary:[{policy:'seek-shop',predictProfile:'feedback',winRate:.5,trials:2}]});
 assert.equal(result.deltas[0].winRateDelta,null);
});
test('stage resource endpoints stop at that stage instead of using the later campaign result',()=>{
 const r=row('VICTORY',true,true);r.final={hp:4,gold:400};
 r.rooms=[{stage:1,roomType:'boss',enter:{hp:40},exit:{hp:30,gold:150},metrics:{minHpRatio:.5}},{stage:2,roomType:'boss',enter:{hp:10},exit:{hp:4,gold:400},metrics:{minHpRatio:.1}}];
 const stage=summarizeScope([r],1,1);assert.equal(stage.meanFinalHp,30);assert.equal(stage.meanFinalGold,150);
 assert.equal(stage.meanFinalGoldExcludingPostRunBossGrant,150);
});
test('file gate rejects missing raw records even when the outer manifest is internally hashed',()=>{
 const out=fs.mkdtempSync(path.join(os.tmpdir(),'stm-file-gate-'));
 try{
  const context={test:true},contextId=hash(context),payload={task:{id:'one'},contextId},raw=JSON.stringify({...payload,recordHash:hash(payload)})+'\n';
  fs.writeFileSync(path.join(out,'context.json'),JSON.stringify(context));fs.writeFileSync(path.join(out,'trial-0001.jsonl'),raw);
  fs.writeFileSync(path.join(out,'quality-gate.json'),JSON.stringify({status:'PASS',contextId}));
  fs.writeFileSync(path.join(out,'trials-index.json'),JSON.stringify({contextId,records:2,shards:[{file:'trial-0001.jsonl',bytes:Buffer.byteLength(raw),sha256:sha(raw)}]}));
  const files=Object.fromEntries(fs.readdirSync(out).map(file=>{const data=fs.readFileSync(path.join(out,file));return [file,{sha256:sha(data),bytes:data.length}];}));
  fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({contextId,files}));
  assert.throws(()=>checkFiles(out),/record count/i);
 }finally{fs.rmSync(out,{recursive:true,force:true});}
});
