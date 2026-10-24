'use strict';
const terminal=r=>['WIN','LOSS','VICTORY','DEFEAT'].includes(r.status),won=r=>['WIN','VICTORY'].includes(r.status);
const mean=a=>a.length?a.reduce((n,v)=>n+v,0)/a.length:null;
function counts(rows){const wins=rows.filter(won).length,losses=rows.filter(r=>terminal(r)&&!won(r)).length;return {attempts:rows.length,wins,losses,censored:rows.filter(r=>r.status==='BENCHMARK_LIMIT_CENSORED').length,invalid:rows.filter(r=>r.status==='INVALID_POLICY_OR_ENGINE').length,terminalWinRate:wins+losses?wins/(wins+losses):null,meanFinalHp:mean(rows.filter(terminal).map(r=>r.final?.hp??r.final?.playerHp??0))};}
function summarize(rows,options){
 const groups=new Map(),power=[],cardUsage=new Map();
 for(const r of rows){
  const key=r.difficulty+'/'+r.skill;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r);
  for(const [cardId,c]of Object.entries(r.ai?.cards||{})){const k=key+'/'+cardId;if(!cardUsage.has(k))cardUsage.set(k,{policy:key,cardId,plays:0,energySpent:0,focusSpent:0,hpDamage:0});const target=cardUsage.get(k);for(const field of ['plays','energySpent','focusSpent','hpDamage'])target[field]+=c[field]||0;}
 }
 if(options.mode==='cards')for(const [key,group]of groups){
  const expected=1<<options.cards.length,valid=[];
  for(let offset=0;offset<options.seeds;offset++){
   const rs=group.filter(r=>r.seed===options.seed+offset).sort((a,b)=>a.mask-b.mask);
   if(rs.length!==expected||rs.some((r,i)=>r.mask!==i||!terminal(r)||!Number.isFinite(r.utility)))continue;
   const u=rs.map(r=>r.utility);valid.push({total:u.at(-1)-u[0],individual:options.cards.map((_,i)=>u[1<<i]-u[0]),interaction:expected===4?u[3]-u[1]-u[2]+u[0]:null});
  }
  const [difficulty,skill]=key.split('/');power.push({difficulty,skill,status:valid.length?'MEASURED_EXPLORATORY':'UNMEASURED',seedsComplete:valid.length,seedsExpected:options.seeds,seedsUnscored:options.seeds-valid.length,totalDelta:mean(valid.map(v=>v.total)),individualDeltas:options.cards.map((cardId,i)=>({cardId,slot:i,delta:mean(valid.map(v=>v.individual[i]))})),interaction:expected===4?mean(valid.map(v=>v.interaction)):null,interpretation:'Contextual replacement utility versus Rune Strike; not universal Combat Power.'});
 }
 return {...counts(rows),groups:[...groups].map(([key,rs])=>({key,...counts(rs)})),power,cardUsage:[...cardUsage.values()].sort((a,b)=>b.plays-a.plays||a.cardId.localeCompare(b.cardId))};
}
function toCSV(report){
 const fields=['difficulty','skill','seed','mask','status','utility','finalHp','turns','energySpent','focusSpent','error','jobId','sourceHash','agentVersion','definitionHash','engineHash','mode','predict','cards','enemy','upgraded','jobStatus'];
 const quote=v=>{const s=v===null||v===undefined?'':String(v);return /[",\r\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
 return fields.join(',')+'\n'+report.rows.map(r=>{
  const o=report.options||{},values={...r,finalHp:r.final?.hp??r.final?.playerHp,turns:r.playerTurns??r.final?.turn,energySpent:r.energySpent??r.ai?.energySpent,focusSpent:r.focusSpent??r.ai?.focusSpent,
   jobId:report.jobId,sourceHash:report.sourceHash,agentVersion:report.agentVersion||r.policyVersion,definitionHash:r.provenance?.definitionHash,engineHash:r.provenance?.engineHash,mode:o.mode,predict:o.predict,cards:o.cards?.join('+'),enemy:o.enemy,upgraded:o.upgraded,jobStatus:report.jobStatus};
  return fields.map(k=>quote(values[k])).join(',');
 }).join('\n')+'\n';
}
module.exports={summarize,toCSV};
