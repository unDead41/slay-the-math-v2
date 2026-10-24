'use strict';
const fs=require('node:fs'),path=require('node:path');
const defaults=require('./config.json'),{runExperiments}=require('../map-advanced/experiments.cjs');
const {hash}=require('../map/structure.cjs'),{csv,writeJson}=require('../map/export.cjs');
const root=path.resolve(__dirname,'../../..'),tiers=['easy','medium','hard'];
function structuralCheck(){
 const G=require('../../../dist/map-rng.js'),{enumerateRoutes}=require('../map/structure.cjs'),old=require('../../../reports/map-balance/base-2800f9a/maps.json');let routes=0;
 for(const m of old){const current=G.generateMap(m.seed,{stage:m.stage}),v=G.validateMap(current);if(!v.valid||hash(current)!==m.mapHash)throw Error('Current graph differs from retained snapshot '+m.seed+':'+m.stage);routes+=enumerateRoutes(current).length;}
 return {status:'PASS',seeds:100,maps:old.length,routes,exactSnapshotMatches:old.length};
}
function args(values){
 const o={difficulty:'all'};
 for(let i=0;i<values.length;i++){if(values[i]==='--resume'){o.resume=true;continue;}const key={'--difficulty':'difficulty','--out':'out','--seed-limit':'seedLimit','--workers':'workers','--max-seconds':'maxSeconds'}[values[i]];if(!key||values[i+1]===undefined)throw Error('Unknown/incomplete argument');o[key]=['difficulty','out'].includes(key)?values[++i]:Number(values[++i]);}
 if(![...tiers,'all'].includes(o.difficulty))throw Error('Unknown difficulty');
 for(const [key,max] of [['seedLimit',100],['workers',8],['maxSeconds',7200]])if(o[key]!==undefined&&(!Number.isSafeInteger(o[key])||o[key]<1||o[key]>max))throw Error('Invalid '+key);
 return o;
}
function combine(out,structure){
 const profiles=tiers.filter(t=>fs.existsSync(path.join(out,t,'summary.json'))).map(difficulty=>({difficulty,...JSON.parse(fs.readFileSync(path.join(out,difficulty,'summary.json')))}));
 const summary={sourceMainCommit:defaults.runtimeBaseCommit,structuralCheck:structure,profiles,campaigns:profiles.reduce((s,p)=>s+p.campaignReturned,0),matchedReplays:profiles.reduce((s,p)=>s+p.matchedReturned,0),errors:profiles.reduce((s,p)=>s+p.errors,0),censored:profiles.reduce((s,p)=>s+p.censored,0),completeProfiles:profiles.filter(p=>p.evaluationComplete).map(p=>p.difficulty),pupilTargetsMeasured:false};
 writeJson(path.join(out,'summary.json'),summary,true);
 for(const name of ['policy-summary','policy-stage-summary','predict-summary','matched-route-summary','difficulty-drivers','policy-comparisons']){
  const rows=profiles.flatMap(p=>JSON.parse(fs.readFileSync(path.join(out,p.difficulty,name+'.json'))));writeJson(path.join(out,name+'.json'),rows);fs.writeFileSync(path.join(out,name+'.csv'),csv(rows,[...new Set(rows.flatMap(Object.keys))]));
 }
 return summary;
}
async function run(options){
 const structure=structuralCheck(),out=path.resolve(root,options.out||defaults.defaultOutput);fs.mkdirSync(out,{recursive:true});
 for(const difficulty of options.difficulty==='all'?tiers:[options.difficulty]){
  const result=await runExperiments({...options,out:path.join(out,difficulty),config:{...defaults,difficulty}});
  console.log(JSON.stringify({difficulty,...result.runState}));
 }
 return combine(out,structure);
}
if(require.main===module)run(args(process.argv.slice(2))).then(r=>console.log(JSON.stringify({campaigns:r.campaigns,matchedReplays:r.matchedReplays,completeProfiles:r.completeProfiles,errors:r.errors,censored:r.censored}))).catch(e=>{console.error(e.stack);process.exitCode=1;});
module.exports={run,args,structuralCheck,combine};
