'use strict';
// Derived structural analysis only. Does not alter or extend the engine pilot.
const fs=require('node:fs');
const path=require('node:path');
const {hash,encounterEstimate}=require('./map/structure.cjs');
const {pressureDebt}=require('./map/score.cjs');
const {sha}=require('./map/source-audit.cjs');
const {csv,writeJson,safeOutput}=require('./map/export.cjs');
const root=path.resolve(__dirname,'../..');
function campaignPairs(input='reports/map-balance/base-2800f9a',output='reports/map-balance/campaign-route-pairs'){
 const dir=path.resolve(root,input),read=name=>JSON.parse(fs.readFileSync(path.join(dir,name)));
 const parent=read('context.json'),summary=read('summary.json'),routes=read('routes.json'),maps=read('maps.json'),trials=read('trials.json');
 if(hash(parent)!==summary.contextId)throw Error('Parent context mismatch.');
 for(const [file,digest] of Object.entries({...parent.sourceHashes,...parent.toolHashes}))if(sha(fs.readFileSync(path.join(root,file)))!==digest)throw Error('Parent input changed: '+file);
 const config={...require('./map/config.json'),mode:parent.mode,referenceDamagePerTurn:parent.referenceDamagePerTurn,referenceBlockPerTurn:parent.referenceBlockPerTurn,referenceRestHeal:parent.referenceRestHeal};
 const context={kind:'STRUCTURAL_CAMPAIGN_PAIR_ESTIMATE',estimateVersion:'pressure-debt-campaign-1.0.0',parentContextId:summary.contextId,baseCommit:config.baseCommit,
  mode:parent.mode,difficulty:parent.difficulty,referenceDamagePerTurn:config.referenceDamagePerTurn,referenceBlockPerTurn:config.referenceBlockPerTurn,referenceRestHeal:config.referenceRestHeal,nominalStageClearHeal:12,
  rosterRule:'same reachable runSeed class across both stages, never Cartesian roster offsets',score:'mean of three peak cumulative nominal debts across Stage1, -12 stage heal, Stage2; never a played deck or CP',
  sourceReportHashes:Object.fromEntries(['context.json','summary.json','routes.json','maps.json','trials.json'].map(f=>[f,sha(fs.readFileSync(path.join(dir,f)))])),toolSha256:sha(fs.readFileSync(__filename)),exclusions:config.estimateExclusions};
 const contextId=hash(context),snapshots=new Map(maps.map(m=>[m.seed+':'+m.stage,m.snapshot])),values=new Map(),bySeed=new Map();
 for(const r of routes){
  const map=snapshots.get(r.seed+':'+r.stage),nodes=new Map(map.nodes.map(n=>[n.id,n]));
  values.set(r.seed+':'+r.stage+':'+r.id,r.variants.map(v=>r.nodeIds.map(id=>{const n=nodes.get(id),fight=encounterEstimate(n,r.stage,v.runSeed,config);return fight?fight.hpBurden:n.type==='rest'?-config.referenceRestHeal:0;})));
  if(!bySeed.has(r.seed))bySeed.set(r.seed,{1:[],2:[]});bySeed.get(r.seed)[r.stage].push(r);
 }
 const observed=new Map();
 for(const t of trials){const key=t.seed+':'+t.plannedRoutes[1].id+':'+t.plannedRoutes[2].id;if(!observed.has(key))observed.set(key,[]);observed.get(key).push(t);}
 const rows=[],seedSummaries=[];
 for(const [seed,stages] of bySeed){
  const group=[];
  for(const a of stages[1])for(const b of stages[2]){
   const av=values.get(seed+':1:'+a.id),bv=values.get(seed+':2:'+b.id),peaks=av.map((v,i)=>pressureDebt([...v,-context.nominalStageClearHeal,...bv[i]]).peak);
   const selected=observed.get(seed+':'+a.id+':'+b.id)||[],pilot=selected.filter(t=>t.batch==='pilot'),diagnostic=selected.filter(t=>t.batch==='diagnostic');
   group.push({seed,id:'pair-'+hash([a.id,b.id]).slice(0,16),contextId,stage1RouteId:a.id,stage2RouteId:b.id,probability:a.probability*b.probability,estimatedPressure:peaks.reduce((s,n)=>s+n,0)/3,minVariantPressure:Math.min(...peaks),maxVariantPressure:Math.max(...peaks),combatPower:null,
    pilotPlannedTrials:pilot.length,pilotCampaignWins:pilot.filter(t=>t.status==='VICTORY').length,diagnosticPlannedTrials:diagnostic.length,diagnosticCampaignWins:diagnostic.filter(t=>t.status==='VICTORY').length});
  }
  const ranked=group.slice().sort((a,b)=>a.estimatedPressure-b.estimatedPressure||a.id.localeCompare(b.id)),median=ranked[Math.floor((ranked.length-1)/2)];
  seedSummaries.push({seed,contextId,pairCount:group.length,pairProbabilitySum:group.reduce((s,r)=>s+r.probability,0),easiestPair:ranked[0],medianPair:median,hardestPair:ranked.at(-1),uniformPlannedPairExpectedPressure:group.reduce((s,r)=>s+r.probability*r.estimatedPressure,0)});
  rows.push(...group);
 }
 const out=safeOutput(root,output);if(fs.existsSync(path.join(out,'manifest.json')))throw Error('Use a fresh output directory for a derived analysis.');
 writeJson(path.join(out,'context.json'),context,true);writeJson(path.join(out,'seeds.json'),seedSummaries,true);
 const chunks=[];
 for(let i=0;i<rows.length;i+=20000){const file='pairs-'+String(chunks.length+1).padStart(3,'0')+'.json',part=rows.slice(i,i+20000);writeJson(path.join(out,file),part);chunks.push({file,rows:part.length,sha256:sha(fs.readFileSync(path.join(out,file)))});}
 writeJson(path.join(out,'pairs-index.json'),{contextId,totalRows:rows.length,chunks},true);
 fs.writeFileSync(path.join(out,'pairs.csv'),csv(rows,['seed','id','contextId','stage1RouteId','stage2RouteId','probability','estimatedPressure','minVariantPressure','maxVariantPressure','combatPower','pilotPlannedTrials','pilotCampaignWins','diagnosticPlannedTrials','diagnosticCampaignWins']));
 const files=['context.json','pairs-index.json',...chunks.map(c=>c.file),'pairs.csv','seeds.json'];writeJson(path.join(out,'manifest.json'),{contextId,parentContextId:summary.contextId,seedCount:bySeed.size,structuralPairCount:rows.length,structurePairCoverage:1,enginePairsExhaustivelySimulated:false,
  files:Object.fromEntries(files.map(f=>[f,{sha256:sha(fs.readFileSync(path.join(out,f))),bytes:fs.statSync(path.join(out,f)).size}]))},true);
 return {out,seeds:bySeed.size,pairs:rows.length,contextId};
}
if(require.main===module){try{console.log(JSON.stringify(campaignPairs(...process.argv.slice(2))));}catch(e){console.error(e.stack);process.exitCode=1;}}
module.exports={campaignPairs};
