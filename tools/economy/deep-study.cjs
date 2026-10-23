'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const T=require('./deep-common.cjs'),F=require('./deep-flow.cjs'),V=require('./deep-events.cjs'),O=require('./deep-offers.cjs');
const out=path.resolve(__dirname,'../../docs/economy/deep');fs.mkdirSync(out,{recursive:true});
const write=(n,x)=>fs.writeFileSync(path.join(out,n),JSON.stringify(x,null,2)+'\n');
const phase=process.argv[2]||'flow';
if(phase==='offers'){write('offers.json',O.studyOffers(T.seeds(128),{onProgress:console.log}));}
if(phase==='events'){write('events.json',V.studyEvents(T.seeds(8),{onProgress:console.log}));}
if(phase==='flow'){
 const file=path.join(out,'flows.jsonl');fs.writeFileSync(file,'');let count=0;
 for(const difficulty of ['easy','medium','hard'])for(const policy of F.policies){
  for(const [i,seed] of T.seeds(100).entries()){
   const answer=Object.keys(F.answerProfiles)[i%4],budget=Object.keys(F.budgets)[Math.floor(i/4)%2];
   const r=F.simulateFlow({seed,difficulty,policy,answer,budget,trace:false});fs.appendFileSync(file,JSON.stringify(r.summary)+'\n');count++;
  }
  console.log(JSON.stringify({count,difficulty,policy}));
 }
}
if(phase==='routes'){
 const surveys=[],flows=[],traces=[];
 for(const seed of T.seeds(100)){
  for(const stage of [0,1])surveys.push(F.surveyMap(seed,stage));
  for(const difficulty of ['easy','medium','hard'])for(const routeStyle of ['minElite','maxElite']){const r=F.simulateFlow({seed,difficulty,routeStyle,policy:'tag_support',answer:'proficient',budget:'moderate',trace:seed===T.seeds(1)[0]});flows.push(r.summary);if(r.trace.length)traces.push(r);}
 }
 write('routes.json',{surveys,flows,traces});console.log({surveys:surveys.length,flows:flows.length});
}
if(phase==='manifest'){
 const hashes={};for(const name of ['dist/economy.js','dist/economy-data.js','dist/engine.js','dist/mystery.js','dist/artifacts.js','tools/economy/deep-flow.cjs','tools/economy/deep-events.cjs','tools/economy/deep-offers.cjs','tools/economy/deep-common.cjs','tools/economy/deep-study.cjs','tools/economy/deep-report.py'])hashes[name]=crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname,'../..',name))).digest('hex');
 write('manifest.json',{date:'2026-10-23',base:'2800f9aeba5ed594e6ef3f991bcf4dfa498a5de7',branch:'balance/economy',offerSeeds:T.seeds(128),flowSeeds:T.seeds(100),eventSeeds:T.seeds(8),policies:F.policies,answerProfiles:F.answerProfiles,budgets:F.budgets,hashes,assumptions:['All fights are pre-won conditional fixtures after paying explicit HP costs.','HP budget exhaustion is not observed defeat.','Tag proxies and heuristic policies are not CP or optimal play.','Explore has no runtime owner at base.','No win rates for pupils are estimated.']});
}

if(phase==='traces'){
 const traces=[];for(const difficulty of ['easy','medium','hard'])for(const policy of F.policies)traces.push(F.simulateFlow({seed:T.seeds(1)[0],difficulty,policy,answer:'proficient',budget:'moderate',trace:true}));
 write('adaptive_traces.json',traces);write('cumulative_sacrifices.json',V.studySacrifices(T.seeds(8)));console.log({traces:traces.length});
}

if(phase==='normalize'){
 // Schema clarification only; values are never recalculated or tuned.
 function normalize(x){if(Array.isArray(x))return x.map(normalize);if(x&&typeof x==='object'){if(Object.hasOwn(x,'answerTimeMs')){x.scriptedAttemptTimeMs=x.answerTimeMs;delete x.answerTimeMs;}for(const v of Object.values(x))normalize(v);}return x;}
 const file=path.join(out,'flows.jsonl'),rows=fs.readFileSync(file,'utf8').trim().split('\n').map(x=>normalize(JSON.parse(x)));assertRows(rows);fs.writeFileSync(file,rows.map(x=>JSON.stringify(x)).join('\n')+'\n');
 for(const n of ['routes.json','adaptive_traces.json'])write(n,normalize(JSON.parse(fs.readFileSync(path.join(out,n),'utf8'))));
 write('schema_notes.json',{change:'answerTimeMs renamed to scriptedAttemptTimeMs; no numerical values changed',reason:'Fixed scripted attempted response times may exceed strict Mystery deadline; this is not actual elapsed play time.'});
}
function assertRows(rows){require('node:assert/strict').equal(rows.length,1800);for(const d of ['easy','medium','hard'])for(const p of F.policies)require('node:assert/strict').equal(new Set(rows.filter(r=>r.difficulty===d&&r.policy===p).map(r=>r.seed)).size,100);}
