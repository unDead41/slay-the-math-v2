'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto');
const {Worker,isMainThread,parentPort}=require('node:worker_threads');
const {loadMaster,ROOT}=require('./loader.cjs'),{createReplay}=require('../map/replay.cjs');
function trial(task,cache=new Map()){
 if(!cache.has(task.difficulty)){const x=loadMaster(task);cache.set(task.difficulty,{x,replay:createReplay(x)});}
 const {x,replay}=cache.get(task.difficulty);
 return {...task,provenance:x.provenance,...replay.runCampaign(task)};
}
function interval(w,n){if(!n)return null;const z=1.96,d=1+z*z/n,c=(w/n+z*z/(2*n))/d,h=z*Math.sqrt(w/n*(1-w/n)/n+z*z/(4*n*n))/d;return [c-h,c+h];}
function summarize(rows){
 const groups={};for(const r of rows){const key=[r.difficulty,r.predictProfile,r.routePolicy].join('/');const g=groups[key]??={n:0,wins:0,losses:0,censored:0,invalid:0,stage2:0,rooms:0,apiCalls:0,finalHp:0,finalGold:0};g.n++;g.wins+=r.status==='VICTORY';g.losses+=r.status==='DEFEAT';g.censored+=r.status==='BENCHMARK_LIMIT_CENSORED';g.invalid+=r.status==='INVALID_POLICY_OR_ENGINE';g.stage2+=!!r.stages?.[1]?.reached;g.rooms+=r.rooms?.length||0;g.apiCalls+=r.apiCalls||0;g.finalHp+=r.final?.hp||0;g.finalGold+=r.final?.gold||0;}
 for(const g of Object.values(groups)){g.winRate=g.wins/g.n;g.descriptiveWilson95=interval(g.wins,g.n);g.allCaseWinBounds=[g.wins/g.n,(g.wins+g.censored+g.invalid)/g.n];g.meanFinalHp=g.finalHp/g.n;g.meanFinalGold=g.finalGold/g.n;}
 return {attempts:rows.length,errors:rows.filter(r=>r.status==='INVALID_POLICY_OR_ENGINE').map(r=>({seed:r.runSeed,difficulty:r.difficulty,predict:r.predictProfile,route:r.routePolicy,error:r.error})),groups,pupilWinRatesMeasured:false,interpretation:'Synthetic policy scenarios; paired seeds and different choices are not independent pupil observations. Wilson intervals describe each bot-policy cohort only.'};
}
if(!isMainThread){const cache=new Map();parentPort.on('message',task=>{try{parentPort.postMessage(trial(task,cache));}catch(e){parentPort.postMessage({...task,status:'INVALID_POLICY_OR_ENGINE',error:e.stack});}});}
else if(require.main===module){
 (async()=>{
  const args=Object.fromEntries(process.argv.slice(2).map(s=>s.replace(/^--/,'').split('='))),n=Number(args.seeds||10),offset=Number(args.offset||0),count=Number(args.workers||4),label=args.label||'pilot';
  if(!Number.isInteger(n)||n<1||n>100||!Number.isInteger(offset)||offset<0||offset+n>100||!Number.isInteger(count)||count<1||count>8||!/^[a-z0-9-]+$/.test(label))throw Error('Invalid experiment arguments.');
  const dir=path.join(ROOT,'reports/master-balance',label);if(fs.existsSync(path.join(dir,'summary.json')))throw Error('Refusing to overwrite an existing measured cohort.');fs.mkdirSync(dir,{recursive:true});
  const tasks=[];for(let i=offset;i<offset+n;i++)for(const difficulty of ['easy','medium','hard'])for(const predictProfile of (args.predict||'feedback,high,low').split(','))for(const routePolicy of (args.routes||'health-recovery,seek-reward').split(','))tasks.push({runSeed:2000000000+i,difficulty,predictProfile,routePolicy,mode:'challenge',telemetry:true});
  const x=loadMaster({difficulty:'medium'}),files=new Set([...x.sourceFiles,'tools/balance/master/config.json','tools/balance/master/run.cjs','tools/balance/master/loader.cjs','dist/balance.js','dist/balance-data.js',...['replay.cjs','policy.cjs','config.json','structure.cjs'].map(p=>'tools/balance/map/'+p),...['route-policy.cjs','question-policy.cjs','scenarios.cjs','telemetry.cjs'].map(p=>'tools/balance/map-advanced/'+p)]),sources={};
  for(const file of files){const full=path.resolve(ROOT,file);sources[path.relative(ROOT,full)]=fs.readFileSync(full,'utf8');}
  const snapshot=JSON.stringify(sources),sourceHash=crypto.createHash('sha256').update(snapshot).digest('hex');fs.writeFileSync(path.join(dir,'sources.json.gz'),zlib.gzipSync(snapshot));
  fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify({label,sourceHash,definitionHash:x.provenance.definitionHash,version:x.provenance.version,tasks,policy:'visible-greedy-feedback-v1; actual Mystery, purchases, carry and connected routing; no pre-awarded victories'},null,2)+'\n');
  let next=0,done=0;const results=[],workers=[];
  await Promise.all(Array.from({length:Math.min(count,tasks.length)},()=>new Promise((resolve,reject)=>{const worker=new Worker(__filename);workers.push(worker);worker.on('error',reject);worker.on('message',r=>{results.push(r);done++;if(done%30===0)console.log(done+'/'+tasks.length);if(next<tasks.length)worker.postMessage(tasks[next++]);else{worker.terminate();resolve();}});worker.postMessage(tasks[next++]);})));
  results.sort((a,b)=>a.runSeed-b.runSeed||a.difficulty.localeCompare(b.difficulty)||a.predictProfile.localeCompare(b.predictProfile)||a.routePolicy.localeCompare(b.routePolicy));
  fs.writeFileSync(path.join(dir,'campaigns.jsonl.gz'),zlib.gzipSync(results.map(r=>JSON.stringify(r)).join('\n')+'\n'));
  const summary={label,sourceHash,...summarize(results)};fs.writeFileSync(path.join(dir,'summary.json'),JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary,null,2));if(summary.errors.length)process.exitCode=1;
 })().catch(e=>{console.error(e);process.exitCode=1;});
}
module.exports={trial,summarize,interval};
