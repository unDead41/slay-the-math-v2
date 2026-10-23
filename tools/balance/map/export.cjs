'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {riskScore}=require('./score.cjs');
function csv(rows,columns){
 const field=v=>{if(v===null||v===undefined)return '';let s=typeof v==='object'?JSON.stringify(v):String(v);if(typeof v==='string'&&/^\s*[=+@-]/.test(v))s="'"+s;return /[",\r\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
 return [columns.join(','),...rows.map(r=>columns.map(k=>field(r[k])).join(','))].join('\n')+'\n';
}
function aggregateTrials(all,stage=null,expectedTrials=all.length,pReference=.7){
 const selected=stage?all.filter(r=>r.stages?.[stage-1]?.reached):all;
 const unresolved=stage?all.filter(r=>!r.stages?.[stage-1]?.cleared):all;
 const errors=unresolved.filter(r=>r.status==='INVALID_POLICY_OR_ENGINE').length,censored=unresolved.filter(r=>r.status==='BENCHMARK_LIMIT_CENSORED').length;
 const campaignErrors=all.filter(r=>r.status==='INVALID_POLICY_OR_ENGINE').length,campaignCensored=all.filter(r=>r.status==='BENCHMARK_LIMIT_CENSORED').length;
 const terminal=selected.filter(r=>stage&&r.stages[stage-1].cleared||['VICTORY','DEFEAT'].includes(r.status));
 const wins=terminal.filter(r=>stage?r.stages[stage-1].cleared:r.status==='VICTORY').length;
 const score=errors||censored?riskScore(0,0,pReference):riskScore(wins,terminal.length,pReference);
 return {plannedTrials:expectedTrials,completedCampaignTrials:all.length,trials:terminal.length,wins,losses:terminal.length-wins,notReached:all.length-selected.length,errors,censored,campaignErrors,campaignCensored,
  ...score,scoreStatus:errors||censored?'UNSCORABLE':terminal.length?'PROVISIONAL':'NOT_SIMULATED',evaluationComplete:all.length===expectedTrials&&!errors&&!censored};
}
function writeJson(file,data,pretty=false){fs.writeFileSync(file,JSON.stringify(data,null,pretty?2:undefined)+'\n');}
function atomicJson(file,data){const tmp=file+'.tmp';writeJson(tmp,data);fs.renameSync(tmp,file);}
function safeOutput(root,out){const p=path.resolve(root,out);for(const d of ['dist','release-prod']){const forbidden=path.join(root,d);if(p===forbidden||p.startsWith(forbidden+path.sep))throw Error('Audit output cannot be inside player build: '+d);}fs.mkdirSync(p,{recursive:true});return p;}
module.exports={csv,aggregateTrials,writeJson,atomicJson,safeOutput};
