'use strict';
const fs=require('node:fs'),path=require('node:path');
const {loadEngine,ROOT,BASE}=require('./loader.cjs'),{simulate}=require('./combat.cjs'),{spec}=require('./candidate.cjs');
const out=path.join(ROOT,'docs/balance/combat/results-final');fs.mkdirSync(out,{recursive:true});
const rows=[];
for(const difficulty of ['easy','medium','hard']){
 const x=loadEngine({build:'candidate',difficulty});
 for(const enemy of spec.enemies)for(const policy of ['strategic','beginner'])for(const seed of [810230,810231,810232]){
  const options={enemy:enemy.id,policy,seed,predict:'mixed',archetype:'mixed'};
  rows.push({difficulty,options,result:simulate(x,options)});
 }
}
fs.writeFileSync(path.join(out,'enemy-sweep.json'),JSON.stringify({baseCommit:BASE,description:'Candidate full-health encounter screen; fixed 12-card benchmark, correct Predict with mixed assistance; not campaign/student wins.',rows},null,2));
console.log(rows.length,rows.reduce((a,r)=>(a[r.result.status]=(a[r.result.status]||0)+1,a),{}));
