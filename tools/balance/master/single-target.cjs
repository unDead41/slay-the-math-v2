'use strict';
// Bounded controlled-deck screen, kept separate from the historical power cohort.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto');
const {Worker,isMainThread,parentPort}=require('node:worker_threads');
const {ROOT,loadMaster}=require('./loader.cjs'),D=require('../deep.cjs'),B=require('../combat.cjs'),{contrast}=require('./power.cjs');
const S='stm.',ref=S+'attack.rune_strike',sha=s=>crypto.createHash('sha256').update(s).digest('hex');
function legacy(){
 const cache=new Map(),privateGlobal={};
 function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);new Function('require','module','exports','globalThis',fs.readFileSync(file,'utf8'))(name=>name.startsWith('.')?load(path.resolve(path.dirname(file),name)):require(name),m,m.exports,privateGlobal);return m.exports;}
 const x={};for(const [k,f]of Object.entries({E:'engine',C:'config',A:'artifacts',CC:'card-combat',Q:'education',R:'rich-text',L:'combat-log',data:'card-data'}))x[k]=load(path.join(ROOT,'dist/'+f+'.js'));
 x.sourceFiles=[...cache.keys()].map(p=>path.relative(ROOT,p));x.provenance={version:x.data.singleTargetVersion||'legacy-2.27.0',cardHash:sha(JSON.stringify(x.data))};return x;
}
function tasks(){
 const out=[],pairs=[['attack.rune_sweep','attack.weak_point'],['attack.fate_storm','attack.weak_point'],['attack.fate_storm','passive.blazing_spirit']],triad=['attack.fate_storm','passive.blazing_spirit','passive.growing_flame'];
 for(const mode of ['legacy','master'])for(const enemy of ['wisp','golem','dealer'])for(const seed of [7101,7102,7103]){
  for(const upgraded of [false,true]){
   for(const card of ['attack.rune_sweep','attack.fate_storm','attack.rune_strike'])out.push({mode,kind:'ICP',cards:[S+card],enemy,seed,upgraded});
   if(mode==='master')for(const cards of pairs)out.push({mode,kind:'PAIR',cards:cards.map(k=>S+k),enemy,seed,upgraded});
  }
  if(mode==='master')out.push({mode,kind:'TRIPLE',cards:triad.map(k=>S+k),enemy,seed,upgraded:false});
 }return out;
}
function measure(x,t){
 const variants=[];for(let mask=0;mask<2**t.cards.length;mask++){
  const slots=t.cards.map((key,i)=>({key:mask>>i&1?key:ref,upgraded:t.upgraded})),deck=[...slots,...B.baseDeck('mixed').slice(0,12-slots.length).map(key=>({key,upgraded:false}))];
  variants.push({mask,...D.simulate(x,{seed:t.seed,enemy:t.enemy,deck,predictProfile:'developing',reload:t.seed===7101})});
 }
 const valid=variants.every(v=>['WIN','LOSS'].includes(v.status));return {...t,provenance:x.provenance,status:valid?'MEASURED':'UNRANKED',effect:valid?contrast(variants.map(v=>v.utility),t.cards.length):null,variants};
}
function summarize(rows){
 const groups=new Map();for(const r of rows){const key=[r.mode,r.kind,r.cards.join('+'),r.enemy,r.upgraded].join('|');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r);}
 return {cases:rows.length,encounters:rows.reduce((n,r)=>n+r.variants.length,0),invalid:rows.filter(r=>r.error||r.variants.some(v=>v.status==='INVALID_POLICY_OR_ENGINE')).length,censored:rows.filter(r=>r.variants.some(v=>v.status==='BENCHMARK_LIMIT_CENSORED')).length,groups:[...groups].map(([key,rs])=>({key,n:rs.length,status:rs.every(r=>r.status==='MEASURED')?'MEASURED':'UNRANKED',meanEffect:rs.every(r=>r.status==='MEASURED')?rs.reduce((n,r)=>n+r.effect,0)/rs.length:null,winsByMask:rs[0].variants.map((_,mask)=>rs.filter(r=>r.variants[mask].status==='WIN').length)}))};
}
if(!isMainThread){const cache=new Map();parentPort.on('message',t=>{try{if(!cache.has(t.mode))cache.set(t.mode,t.mode==='master'?loadMaster({difficulty:'medium'}):legacy());parentPort.postMessage(measure(cache.get(t.mode),t));}catch(e){parentPort.postMessage({...t,error:e.stack,status:'UNRANKED',variants:[]});}});}
else if(require.main===module){
 (async()=>{
  const phase=process.argv[2];if(!['before','after'].includes(phase))throw Error('Use single-target.cjs before|after');
  const dir=path.join(ROOT,'reports/master-balance/single-target',phase);if(fs.existsSync(path.join(dir,'summary.json')))throw Error('Refusing to overwrite measured evidence');fs.mkdirSync(dir,{recursive:true});
  const plan=tasks(),x=loadMaster({difficulty:'medium'}),l=legacy(),files=new Set([...x.sourceFiles,...l.sourceFiles,'dist/balance.js','dist/balance-data.js','tools/balance/master/loader.cjs','tools/balance/master/config.json','tools/balance/master/single-target.cjs','tools/balance/master/power.cjs','tools/balance/deep.cjs','tools/balance/combat.cjs','tools/balance/candidate.cjs','tools/balance/specs/balance-spec.v1.2.json']),sources=Object.fromEntries([...files].sort().map(p=>[p,fs.readFileSync(path.join(ROOT,p),'utf8')])),snapshot=JSON.stringify(sources),sourceHash=sha(snapshot);
  fs.writeFileSync(path.join(dir,'sources.json.gz'),zlib.gzipSync(snapshot));fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify({phase,sourceHash,master:x.provenance,legacy:l.provenance,tasks:plan,context:'Controlled same-size replacement decks; three seeds, Medium Master and ordinary mode, synthetic developing Predict, wisp/golem/dealer, no artifacts. Not pupil calibration or universal CP.'},null,2)+'\n');
  let next=0;const rows=[];await Promise.all(Array.from({length:3},()=>new Promise((resolve,reject)=>{const w=new Worker(__filename);w.on('error',reject);w.on('message',r=>{rows.push(r);if(rows.length%30===0)console.log(phase+': '+rows.length+'/'+plan.length);if(next<plan.length)w.postMessage(plan[next++]);else{w.terminate();resolve();}});w.postMessage(plan[next++]);})));
  const key=r=>[r.mode,r.kind,r.cards.join('+'),r.enemy,r.seed,r.upgraded].join('|');rows.sort((a,b)=>key(a).localeCompare(key(b)));
  if(JSON.stringify(rows.map(key))!==JSON.stringify(plan.map(key).sort())||rows.some(r=>r.variants.length!==2**r.cards.length))throw Error('Raw rows do not match the exact planned factorial cells');
  const raw=rows.map(r=>JSON.stringify(r)).join('\n')+'\n',summary={phase,sourceHash,rawHash:sha(raw),...summarize(rows)};
  fs.writeFileSync(path.join(dir,'raw.jsonl.gz'),zlib.gzipSync(raw));fs.writeFileSync(path.join(dir,'summary.json'),JSON.stringify(summary,null,2)+'\n');
  console.log(JSON.stringify({phase,cases:summary.cases,encounters:summary.encounters,invalid:summary.invalid,censored:summary.censored}));if(summary.invalid||summary.censored)process.exitCode=1;
 })().catch(e=>{console.error(e);process.exitCode=1;});
}
module.exports={tasks,measure,summarize};
