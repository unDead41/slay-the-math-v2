'use strict';
const fs=require('node:fs'),path=require('node:path');
const defaults=require('./config.json'),{runExperiments}=require('../map-advanced/experiments.cjs');
const {args,structuralCheck}=require('../map-recheck/run.cjs');
const {csv,writeJson}=require('../map/export.cjs');
const root=path.resolve(__dirname,'../../..'),tiers=['easy','medium','hard'];
function combine(out){
 const profiles=tiers.filter(t=>fs.existsSync(path.join(out,t,'summary.json'))).map(difficulty=>({difficulty,...JSON.parse(fs.readFileSync(path.join(out,difficulty,'summary.json')))}));
 const summary={reportVersion:defaults.reportVersion,sourceMainCommit:defaults.runtimeBaseCommit,structuralCheck:structuralCheck(),sampleScope:'FIXED_REGRESSION_PILOT_ONE_PER_CONDITION_SEED',profiles,campaigns:profiles.reduce((s,p)=>s+p.campaignReturned,0),matchedReplays:profiles.reduce((s,p)=>s+p.matchedReturned,0),errors:profiles.reduce((s,p)=>s+p.errors,0),censored:profiles.reduce((s,p)=>s+p.censored,0),completeProfiles:profiles.filter(p=>p.evaluationComplete).map(p=>p.difficulty),pupilTargetsMeasured:false};
 writeJson(path.join(out,'summary.json'),summary,true);
 for(const name of ['policy-summary','policy-stage-summary','predict-summary','matched-route-summary','difficulty-drivers','policy-comparisons']){
  const rows=profiles.flatMap(p=>JSON.parse(fs.readFileSync(path.join(out,p.difficulty,name+'.json'))));writeJson(path.join(out,name+'.json'),rows);fs.writeFileSync(path.join(out,name+'.csv'),csv(rows,[...new Set(rows.flatMap(Object.keys))]));
 }
 return summary;
}
async function run(options){
 structuralCheck();const out=path.resolve(root,options.out||'reports/map-balance/v1.5');fs.mkdirSync(out,{recursive:true});
 const results=[];
 for(const difficulty of options.difficulty==='all'?tiers:[options.difficulty]){
  const result=await runExperiments({...options,out:path.join(out,difficulty),config:{...defaults,difficulty}});results.push({difficulty,...result.runState});console.log(JSON.stringify(results.at(-1)));
 }
 return options.difficulty==='all'?combine(out):results;
}
if(require.main===module)run(args(process.argv.slice(2))).then(r=>console.log(JSON.stringify(r))).catch(e=>{console.error(e.stack);process.exitCode=1;});
module.exports={run,combine};
