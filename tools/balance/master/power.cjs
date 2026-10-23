'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto');
const {Worker,isMainThread,parentPort}=require('node:worker_threads');
const {loadMaster,ROOT}=require('./loader.cjs'),D=require('../deep.cjs'),B=require('../combat.cjs');
const S='stm.',ref=S+'attack.rune_strike';
const pairs=[['passive.blazing_spirit','attack.fate_storm'],['passive.growing_flame','attack.twin_shot'],['passive.swift_step','defend.layered_shield'],['passive.battle_rhythm','defend.flash_ward'],['passive.grimoire_ward','skill.burning_page'],['passive.clear_mind','skill.quick_study'],['passive.ember_core','defend.flash_ward'],['passive.lasting_shield','defend.tower_shield'],['skill.mana_reading','skill.last_page'],['skill.recall','skill.deep_study']].map(p=>p.map(k=>S+k));
const triads=[['passive.blazing_spirit','passive.growing_flame','attack.fate_storm'],['passive.swift_step','passive.battle_rhythm','defend.layered_shield'],['passive.grimoire_ward','skill.burning_page','skill.recall'],['passive.ember_core','passive.clear_mind','skill.mana_reading']].map(p=>p.map(k=>S+k));
function contrast(utilities,k){return utilities.reduce((n,u,mask)=>n+(Array.from({length:k},(_,i)=>mask>>i&1).reduce((a,b)=>a+b,0)%2===k%2?1:-1)*u,0);}
function measure(x,t){
 const k=t.cards.length,variants=[];
 for(let mask=0;mask<2**k;mask++){
  const slots=t.cards.map((key,i)=>({key:mask>>i&1?key:ref,upgraded:t.upgraded})),deck=[...slots,...B.baseDeck('mixed').slice(0,12-k).map(key=>({key,upgraded:false}))];
  const v=D.simulate(x,{seed:t.seed,enemy:t.enemy,predictProfile:'developing',deck,reload:t.seed===9101});
  variants.push({mask,...v});
 }
 const valid=variants.every(v=>['WIN','LOSS'].includes(v.status)),u=variants.map(v=>v.utility);
 return {...t,status:valid?'MEASURED':'UNRANKED',effect:valid?contrast(u,k):null,totalSynergy:valid&&k===3?u[7]-u[1]-u[2]-u[4]+2*u[0]:null,variants};
}
if(!isMainThread&&require.main===module){const x=loadMaster({difficulty:'medium'});parentPort.on('message',t=>{try{parentPort.postMessage(measure(x,t));}catch(e){parentPort.postMessage({...t,status:'UNRANKED',error:e.stack,variants:[]});}});}
else if(require.main===module){
 (async()=>{
  const dir=path.join(ROOT,'reports/master-balance/power');if(fs.existsSync(path.join(dir,'summary.json')))throw Error('Refusing to overwrite a measured power cohort.');fs.mkdirSync(dir,{recursive:true});
  const x=loadMaster({difficulty:'medium'}),tasks=[];
  for(const enemy of ['wisp','dealer'])for(const seed of [9101,9102,9103]){
   for(const upgraded of [false,true]){
    for(const c of x.data.cards)tasks.push({kind:'ICP',cards:[c.id],enemy,seed,upgraded});
    for(const cards of pairs)tasks.push({kind:'CCP',cards,enemy,seed,upgraded});
   }
   for(const cards of triads)tasks.push({kind:'TRIPLE',cards,enemy,seed,upgraded:false});
  }
  const sourceFiles=[...x.sourceFiles,'dist/balance.js','dist/balance-data.js','tools/balance/master/loader.cjs','tools/balance/master/config.json','tools/balance/master/power.cjs','tools/balance/deep.cjs','tools/balance/combat.cjs','tools/balance/decks.cjs','tools/balance/candidate.cjs','tools/balance/specs/balance-spec.v1.2.json'],sources=Object.fromEntries(sourceFiles.sort().map(p=>[p,fs.readFileSync(path.join(ROOT,p),'utf8')])),snapshot=JSON.stringify(sources),sourceHash=crypto.createHash('sha256').update(snapshot).digest('hex');
  fs.writeFileSync(path.join(dir,'sources.json.gz'),zlib.gzipSync(snapshot));fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify({sourceHash,provenance:x.provenance,tasks,context:'Constructed same-size 12-card replacement decks, no artifacts, Medium only, developing synthetic Predict, independent/assisted/skip. Not acquisition probability, pupil evidence or universal ratings.'},null,2)+'\n');
  let next=0;const rows=[];
  await Promise.all(Array.from({length:3},()=>new Promise((resolve,reject)=>{const w=new Worker(__filename);w.on('error',reject);w.on('message',r=>{rows.push(r);if(rows.length%60===0)console.log(rows.length+'/'+tasks.length);if(next<tasks.length)w.postMessage(tasks[next++]);else{w.terminate();resolve();}});w.postMessage(tasks[next++]);})));
  rows.sort((a,b)=>a.kind.localeCompare(b.kind)||a.cards.join().localeCompare(b.cards.join())||a.enemy.localeCompare(b.enemy)||a.seed-b.seed||Number(a.upgraded)-Number(b.upgraded));
  fs.writeFileSync(path.join(dir,'raw.jsonl.gz'),zlib.gzipSync(rows.map(r=>JSON.stringify(r)).join('\n')+'\n'));
  const summary={sourceHash,cases:rows.length,encounters:rows.reduce((n,r)=>n+r.variants.length,0),invalid:rows.filter(r=>r.error||r.variants.some(v=>v.status==='INVALID_POLICY_OR_ENGINE')).length,censored:rows.filter(r=>r.variants.some(v=>v.status==='BENCHMARK_LIMIT_CENSORED')).length,allCards:x.data.cards.map(c=>c.id),groups:[]},groups=new Map();
  for(const r of rows){const key=[r.kind,r.cards.join('+'),r.enemy,r.upgraded].join('|');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r);}
  for(const [key,rs]of groups){const ok=rs.every(r=>r.status==='MEASURED');summary.groups.push({key,n:rs.length,status:ok?'MEASURED':'UNRANKED',meanEffect:ok?rs.reduce((n,r)=>n+r.effect,0)/rs.length:null,meanTotalSynergy:ok&&rs[0].kind==='TRIPLE'?rs.reduce((n,r)=>n+r.totalSynergy,0)/rs.length:null});}
  fs.writeFileSync(path.join(dir,'summary.json'),JSON.stringify(summary,null,2)+'\n');fs.writeFileSync(path.join(dir,'scores.csv'),'kind,cards,enemy,upgraded,n,status,mean_delta_or_interaction_U\n'+summary.groups.map(g=>[...g.key.split('|'),g.n,g.status,g.meanEffect??''].join(',')).join('\n')+'\n');console.log(JSON.stringify({cases:summary.cases,encounters:summary.encounters,invalid:summary.invalid,censored:summary.censored}));if(summary.invalid)process.exitCode=1;
 })().catch(e=>{console.error(e);process.exitCode=1;});
}
module.exports={contrast,measure,pairs,triads};
