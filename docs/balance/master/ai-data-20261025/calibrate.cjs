'use strict';
// Run from repository root. Every phase refuses existing output; no outcome-driven resampling.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const root=process.cwd(),{experiment}=require(path.join(root,'tools/ai-playtester/experiments.cjs')),D=require(path.join(root,'tools/ai-playtester/experience-data.cjs'));
const BASE='reports/ai-playtester/data-20261025',phase=process.argv[2],out=process.argv[3]||`${BASE}/${phase}`;
const seedPlan={train:[93],validation:[701,702]},source={branch:'balance/master',commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()};
const utility=r=>100*(r.status==='VICTORY')+20*r.final.hp/r.final.maxHp;
const read=p=>zlib.gunzipSync(fs.readFileSync(p)).toString().trim().split('\n').map(JSON.parse);
function replay(jobs){
 assert.ok(!fs.existsSync(out),'Choose a fresh output directory.');fs.mkdirSync(out,{recursive:true});
 const protocol={phase,source,seedPlan,policySignature:D.policySignature(),modelRule:'delta/20 * n/(n+5), clamp +/-0.25; unique pairs once / deck length',validationUtility:'100*VICTORY +20*final.hp/final.maxHp',validationRule:'Six terminal matched entries; no extra invalid/censors; total wins and utility nondecreasing.',plannedJobs:jobs.length,plannedRows:jobs.reduce((n,o)=>n+(o.mode==='cards'?1<<o.cards.length:1),0)};
 fs.writeFileSync(out+'/protocol.json',JSON.stringify(protocol,null,2)+'\n');fs.writeFileSync(out+'/schedule.json',JSON.stringify(jobs,null,2)+'\n');
 const reports=[],timings=[],partial=out+'/raw.partial.jsonl';let capsule;
 for(let i=0;i<jobs.length;i++){
  const t=performance.now(),r=experiment(jobs[i]);
  if(!capsule){capsule=Object.fromEntries(Object.keys(r.sources).map(p=>[p,fs.readFileSync(path.join(root,p),'utf8')]));for(const [p,bytes]of Object.entries(capsule))assert.equal(D.digest(bytes),r.sources[p]);fs.writeFileSync(out+'/source-capsule.json.gz',zlib.gzipSync(JSON.stringify(capsule)));}
  assert.equal(D.policySignature(r.sources),protocol.policySignature,'Policy changed during fixed replay.');
  reports.push(r);fs.appendFileSync(partial,JSON.stringify(r)+'\n');timings.push({index:i,elapsedMs:performance.now()-t});
  if((i+1)%24===0||i+1===jobs.length)console.log(JSON.stringify({phase,completed:i+1,total:jobs.length,rows:reports.reduce((n,v)=>n+v.rows.length,0)}));
 }
 fs.writeFileSync(out+'/raw.jsonl.gz',zlib.gzipSync(fs.readFileSync(partial)));fs.unlinkSync(partial);
 const rows=reports.flatMap(r=>r.rows),summary={jobs:reports.length,rows:rows.length,wins:rows.filter(r=>['WIN','VICTORY'].includes(r.status)).length,losses:rows.filter(r=>['LOSS','DEFEAT'].includes(r.status)).length,invalid:rows.filter(r=>r.status==='INVALID_POLICY_OR_ENGINE').length,censored:rows.filter(r=>r.status==='BENCHMARK_LIMIT_CENSORED').length,timings};
 assert.equal(summary.rows,protocol.plannedRows);fs.writeFileSync(out+'/summary.json',JSON.stringify(summary,null,2)+'\n');return reports;
}
if(phase==='train'){
 const curriculum=JSON.parse(fs.readFileSync('docs/balance/master/ai-data-20261025/curriculum.json','utf8'));assert.equal(curriculum.trainingSeed,93);assert.deepEqual(curriculum.validationSeeds,[701,702]);assert.equal(curriculum.cases.length,176);
 const jobs=['easy','medium','hard'].flatMap(difficulty=>curriculum.cases.map(o=>({...o,difficulty,experience:'off'}))),reports=replay(jobs);
 const observations=D.normalizeReports(reports,{domain:'combat',split:'train',source,schedule:jobs});D.writeBundle(out+'/exchange',{observations,source,seedPlan});
 const model=D.fitModel(D.readBundle(out+'/exchange'));fs.writeFileSync(out+'/candidate-model.json',JSON.stringify(model,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({modelId:model.id,summary:model.summary,profiles:Object.keys(model.profiles).length}));
}else if(phase==='validation'){
 const jobs=['easy','medium','hard'].flatMap(difficulty=>[701,702].flatMap(seed=>['off','on'].map(experience=>({mode:'campaign',difficulty,skill:'intermediate',predict:'feedback',route:'health-recovery',seed,seeds:1,experience})))),reports=replay(jobs),pairs=[];
 for(let i=0;i<reports.length;i+=2){const off=reports[i].rows[0],on=reports[i+1].rows[0];pairs.push({difficulty:off.difficulty,seed:off.seed,matchedEntry:off.entryStateHash===on.entryStateHash,off:{status:off.status,hp:off.final?.hp,maxHp:off.final?.maxHp,utility:utility(off)},on:{status:on.status,hp:on.final?.hp,maxHp:on.final?.maxHp,utility:utility(on)},guidance:on.ai.experience,traceChanged:off.traceHash!==on.traceHash});}
 const terminal=r=>['VICTORY','DEFEAT'].includes(r.status),totals=side=>({wins:pairs.filter(p=>p[side].status==='VICTORY').length,utility:pairs.reduce((n,p)=>n+p[side].utility,0),invalid:pairs.filter(p=>p[side].status==='INVALID_POLICY_OR_ENGINE').length,censored:pairs.filter(p=>p[side].status==='BENCHMARK_LIMIT_CENSORED').length}),off=totals('off'),on=totals('on');
 const gate={passed:pairs.length===6&&pairs.every(p=>p.matchedEntry&&terminal(p.off)&&terminal(p.on)&&p.guidance.status==='READY')&&on.invalid<=off.invalid&&on.censored<=off.censored&&on.wins>=off.wins&&on.utility>=off.utility,off,on,pairs,interpretation:'Fixed small synthetic nonregression gate; not pupil rates or proof of universal improvement.'};
 fs.writeFileSync(out+'/gate.json',JSON.stringify(gate,null,2)+'\n');console.log(JSON.stringify(gate));
}else if(phase==='after'){
 const jobs=JSON.parse(fs.readFileSync(BASE+'/before/schedule.json','utf8')).map(o=>({...o,experience:'off'})),after=replay(jobs),before=read(BASE+'/before/raw.jsonl.gz');assert.equal(after.length,before.length);
 const rows=after.flatMap((report,i)=>report.rows.map((r,j)=>{const b=before[i].rows[j];assert.equal(r.seed,b.seed);assert.equal(r.difficulty,b.difficulty);assert.equal(r.mask,b.mask);assert.equal(D.runtimeKey(r.provenance),D.runtimeKey(b.provenance));return {mode:report.options.mode,difficulty:r.difficulty,seed:r.seed,cards:report.options.cards,upgraded:report.options.upgraded,mask:r.mask??null,before:{status:b.status,utility:b.utility??(b.final?utility(b):null),hp:b.final?.hp??b.final?.playerHp},after:{status:r.status,utility:r.utility??(r.final?utility(r):null),hp:r.final?.hp??r.final?.playerHp}};}));
 const groups=['cards','campaign'].flatMap(mode=>['easy','medium','hard'].map(difficulty=>{const rs=rows.filter(r=>r.mode===mode&&r.difficulty===difficulty),side=s=>({wins:rs.filter(r=>['WIN','VICTORY'].includes(r[s].status)).length,invalid:rs.filter(r=>r[s].status==='INVALID_POLICY_OR_ENGINE').length,censored:rs.filter(r=>r[s].status==='BENCHMARK_LIMIT_CENSORED').length,utility:rs.reduce((n,r)=>n+(r[s].utility||0),0)});return {mode,difficulty,n:rs.length,before:side('before'),after:side('after')};}));
 fs.writeFileSync(out+'/comparison.json',JSON.stringify({rows:rows.length,groups,comparisons:rows,interpretation:'Frozen holdouts, guidance OFF in both agents; source drift retained. Small synthetic cohort, not universal accuracy.'},null,2)+'\n');console.log(JSON.stringify({groups}));
}else throw Error('Use train, validation or after.');
