'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{once}=require('node:events');
const root=process.cwd(),{experiment}=require(path.join(root,'tools/ai-playtester/experiments.cjs')),{toCSV}=require(path.join(root,'tools/ai-playtester/report.cjs')),{loadMaster}=require(path.join(root,'tools/balance/master/loader.cjs'));
const out=path.join(root,'reports/master-balance/refresh-20261024/final');
(async()=>{
 fs.mkdirSync(out,{recursive:false});
 const raw=fs.createWriteStream(path.join(out,'ai-current.jsonl.gz'),{flags:'wx'}),zip=zlib.createGzip({level:6});zip.pipe(raw);
 const csv=fs.createWriteStream(path.join(out,'ai-current.csv'),{flags:'wx'}),groups=[];let header=false,source=null,rows=0,receiptChecks=0,goldChecks=0;
 const jobs=[];
 for(const difficulty of ['easy','medium','hard'])for(const skill of ['beginner','intermediate','expert'])jobs.push({mode:'campaign',difficulty,skill,route:'health-recovery',predict:'feedback',seed:61,seeds:1});
 for(const difficulty of ['easy','medium','hard'])for(const route of ['seek-shop','avoid-elite'])jobs.push({mode:'campaign',difficulty,skill:'intermediate',route,predict:'feedback',seed:61,seeds:1});
 const cards=require(path.join(root,'dist/card-data.js')).cards.map(c=>c.id);
 for(const key of cards)for(const upgraded of [false,true])for(const enemy of ['golem','dealer'])jobs.push({mode:'cards',difficulty:'medium',skill:'intermediate',predict:'feedback',seed:93,seeds:1,cards:[key],upgraded,enemy});
 const pairs=[['attack.weak_point','attack.fate_storm'],['defend.tower_shield','passive.lasting_shield'],['skill.recall','skill.deep_study'],['passive.swift_step','attack.shield_shot']].map(v=>v.map(id=>'stm.'+id));
 for(const pair of pairs)for(const upgraded of [false,true])for(const enemy of ['golem','dealer'])jobs.push({mode:'cards',difficulty:'medium',skill:'intermediate',predict:'feedback',seed:93,seeds:1,cards:pair,upgraded,enemy});
 jobs.push({mode:'cards',difficulty:'medium',skill:'expert',predict:'feedback',seed:93,seeds:1,cards:pairs[0],upgraded:false,enemy:'golem'});
 for(let i=0;i<jobs.length;i++){
  const report=experiment(jobs[i]);if(source===null)source=report.sourceHash;assert.equal(report.sourceHash,source);
  for(const [file,hash] of Object.entries(report.sources))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),hash,file);
  for(const r of report.rows){
   rows++;
   if(r.ai?.effects){const t=r.ai.effects.totals,cs=Object.values(r.ai.cards);assert.equal(cs.reduce((n,c)=>n+c.plays,0),r.committedCardPlays);assert.equal(cs.reduce((n,c)=>n+c.energySpent,0),r.ai.energySpent);assert.equal(cs.reduce((n,c)=>n+c.focusSpent,0),r.ai.focusSpent);assert.equal(t.blockGranted,t.blockUsed+t.blockExpired+t.blockUnused+t.blockRemaining);receiptChecks++;}
   if(r.metrics&&r.final){const start=loadMaster({difficulty:r.difficulty}).E.newRun(r.runSeed,'challenge').gold;assert.equal(start+r.metrics.goldEarned-r.metrics.goldSpent,r.final.gold);goldChecks++;}
  }
  const line=JSON.stringify(report)+'\n';if(!zip.write(line))await once(zip,'drain');
  const lines=toCSV(report).split('\n'),chunk=(header?lines.slice(1):lines).join('\n');header=true;if(!csv.write(chunk))await once(csv,'drain');
  groups.push({options:report.options,...report.summary,power:report.summary.power,sourceHash:report.sourceHash});
  fs.writeFileSync(path.join(out,'progress.json'),JSON.stringify({completed:i+1,total:jobs.length,rows,last:jobs[i],invalid:groups.reduce((n,g)=>n+g.invalid,0),censored:groups.reduce((n,g)=>n+g.censored,0)})+'\n');
  if(i<15||(i+1)%20===0)console.log(JSON.stringify({completed:i+1,total:jobs.length,rows,invalid:report.summary.invalid,censored:report.summary.censored}));
 }
 zip.end();csv.end();await Promise.all([once(raw,'finish'),once(csv,'finish')]);
 const compact=groups.map(({cardUsage,...g})=>g),summary={status:'COMPLETED',agentVersion:'sampled-turn-search-3',gameVersion:require(path.join(root,'package.json')).version,sourceHash:source,jobs:jobs.length,attempts:rows,campaigns:groups.filter(g=>g.options.mode==='campaign').reduce((n,g)=>n+g.attempts,0),encounters:groups.filter(g=>g.options.mode==='cards').reduce((n,g)=>n+g.attempts,0),wins:groups.reduce((n,g)=>n+g.wins,0),losses:groups.reduce((n,g)=>n+g.losses,0),invalid:groups.reduce((n,g)=>n+g.invalid,0),censored:groups.reduce((n,g)=>n+g.censored,0),receiptAndBlockChecks:receiptChecks,goldConservationChecks:goldChecks,all40BaseAndUpgradeOnTwoEnemies:true,selectedPairs:4,groups:compact,pupilTargetsMeasured:false,interpretation:'Current-source exploratory AI campaigns and replacement/factorial screens. One seed per condition; not universal CP, exhaustive combinations or pupil-rate calibration.'};
 fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify({...summary,groups:undefined}));if(summary.invalid)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
