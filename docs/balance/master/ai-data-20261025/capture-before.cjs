'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=process.cwd(),{experiment}=require(path.join(root,'tools/ai-playtester/experiments.cjs'));
const historical='reports/master-balance/refresh-20261024/final/ai-current.jsonl.gz';
const prior=zlib.gunzipSync(fs.readFileSync(historical)).toString().trim().split('\n').map(JSON.parse);
const curriculum=prior.filter(r=>r.options.mode==='cards'&&r.options.skill==='intermediate').map(r=>r.options);
fs.writeFileSync('docs/balance/master/ai-data-20261025/curriculum.json',JSON.stringify({sourceFile:historical,sourceFileSha256:crypto.createHash('sha256').update(fs.readFileSync(historical)).digest('hex'),purpose:'Scenario recipes only; replay on current source before fitting.',trainingSeed:93,validationSeeds:[701,702],cases:curriculum},null,2)+'\n');
const out='reports/ai-playtester/data-20261025/before';fs.mkdirSync(out,{recursive:true});assert.ok(!fs.existsSync(out+'/raw.jsonl.gz'));
const keys=['attack.weak_point','attack.fate_storm','defend.cinder_guard','defend.mana_barrier','skill.burning_page','skill.card_search','passive.blazing_spirit','passive.clear_mind'].map(k=>'stm.'+k),pairs=[['attack.weak_point','attack.fate_storm'],['defend.tower_shield','passive.lasting_shield'],['skill.recall','skill.deep_study'],['passive.swift_step','attack.shield_shot']].map(v=>v.map(k=>'stm.'+k)),jobs=[];
for(const difficulty of ['easy','medium','hard']){
 for(const key of keys)for(const upgraded of [false,true])jobs.push({mode:'cards',difficulty,skill:'intermediate',predict:'feedback',seed:701,seeds:1,cards:[key],upgraded,enemy:'golem'});
 for(const pair of pairs)jobs.push({mode:'cards',difficulty,skill:'intermediate',predict:'feedback',seed:702,seeds:1,cards:pair,upgraded:false,enemy:'dealer'});
 for(const seed of [701,702])jobs.push({mode:'campaign',difficulty,skill:'intermediate',predict:'feedback',route:'health-recovery',seed,seeds:1});
}
fs.writeFileSync(out+'/schedule.json',JSON.stringify(jobs,null,2)+'\n');const raw=[],summary=[];
for(let i=0;i<jobs.length;i++){const t=performance.now(),r=experiment(jobs[i]);raw.push(JSON.stringify(r));summary.push({options:r.options,...r.summary,power:r.summary.power,elapsedMs:performance.now()-t});if((i+1)%10===0)console.log(JSON.stringify({completed:i+1,total:jobs.length,invalid:r.summary.invalid,censored:r.summary.censored}));}
fs.writeFileSync(out+'/raw.jsonl.gz',zlib.gzipSync(raw.join('\n')+'\n'));fs.writeFileSync(out+'/summary.json',JSON.stringify({agentVersion:'sampled-turn-search-3',sourceMain:'6c49f3980c3a832635d4d01a6c50a8df98ac4aad',jobs:jobs.length,rows:summary.reduce((n,g)=>n+g.attempts,0),invalid:summary.reduce((n,g)=>n+g.invalid,0),censored:summary.reduce((n,g)=>n+g.censored,0),groups:summary},null,2)+'\n');console.log('Baseline captured '+jobs.length+' reports.');
