'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'../..'),POLICY_FILES=['tools/ai-playtester/agent.cjs','tools/ai-playtester/choice-policy.cjs','tools/ai-playtester/experiments.cjs'];
const digest=v=>crypto.createHash('sha256').update(typeof v==='string'||Buffer.isBuffer(v)?v:JSON.stringify(v)).digest('hex');
const hash=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v),card=v=>typeof v==='string'&&/^stm\.(attack|defend|skill|passive)\.[a-z_]+$/.test(v),terminal=s=>['WIN','LOSS','VICTORY','DEFEAT'].includes(s),uint=v=>Number.isInteger(v)&&v>=0&&v<=4294967295;
function runtimeKey(p){if(!p||!['easy','medium','hard'].includes(p.difficulty)||!hash(p.engineHash)||!hash(p.definitionHash)||typeof p.version!=='string'||!p.version)throw Error('Invalid runtime identity.');return digest({version:p.version,difficulty:p.difficulty,definitionHash:p.definitionHash,engineHash:p.engineHash});}
function policySignature(sources){return digest(Object.fromEntries(POLICY_FILES.map(p=>[p,sources?sources[p]||null:fs.existsSync(path.join(ROOT,p))?digest(fs.readFileSync(path.join(ROOT,p))):null])));}
function provenance(p,difficulty){if(p?.difficulty!==difficulty)throw Error('Executed provenance difficulty disagrees with row difficulty.');return {version:p.version,difficulty:p.difficulty,definitionHash:p.definitionHash,engineHash:p.engineHash};}
function reportGroups(report){
 const o=report.options;if(!o||!['cards','campaign'].includes(o.mode)||!uint(o.seed)||!Number.isSafeInteger(o.seeds)||o.seeds<1||o.seeds>20||!uint(o.seed+o.seeds-1))throw Error('Invalid declared report schedule.');
 const tiers=o.difficulty==='all'&&o.mode==='campaign'?['easy','medium','hard']:[o.difficulty],skills=o.skill==='all'?['beginner','intermediate','expert']:[o.skill];
 if(tiers.some(v=>!['easy','medium','hard'].includes(v))||skills.some(v=>!['beginner','intermediate','expert'].includes(v)))throw Error('Invalid difficulty/skill scope.');
 if(o.mode==='cards'&&(!Array.isArray(o.cards)||o.cards.length<1||o.cards.length>2))throw Error('Invalid factorial card scope.');
 const cells=o.mode==='cards'?1<<o.cards.length:1,expected=new Set(tiers.flatMap(t=>skills.flatMap(s=>Array.from({length:o.seeds},(_,i)=>[t,s,o.seed+i].join(':')))));
 if(report.total!==expected.size*cells)throw Error('Declared total disagrees with planned report schedule.');
 if(!Array.isArray(report.rows)||report.rows.length!==report.total)throw Error('Missing/incomplete planned report cells.');
 const groups=new Map();for(const r of report.rows){const key=[r.difficulty,r.skill,r.seed].join(':');if(!expected.has(key))throw Error('Row difficulty/skill/seed disagrees with declared report scope.');provenance(r.provenance,r.difficulty);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r);}
 if(groups.size!==expected.size||[...groups.values()].some(rows=>rows.length!==cells))throw Error('Missing/incomplete planned report groups or cells.');return groups;
}
function normalizeReports(reports,{domain='combat',split='train',source,schedule}={}){
 const observations=[];if(!Array.isArray(reports)||!reports.length||!source?.branch||!/^[a-f0-9]{40}$/.test(source.commit)||!['train','validation','test'].includes(split))throw Error('Nonempty reports, source and split required.');
 if(schedule!==undefined&&(!Array.isArray(schedule)||schedule.length!==reports.length||schedule.some((o,i)=>!o||typeof o!=='object'||Object.entries(o).some(([key,value])=>JSON.stringify(reports[i].options?.[key])!==JSON.stringify(value)))))throw Error('Missing report or mismatch with predeclared cohort schedule.');
 for(const report of reports){
  if(domain!=='combat'){const o={...report,domain,split,source};validateObservation(o);observations.push(o);continue;}
  if(!report.sources||digest(report.sources)!==report.sourceHash)throw Error('Report source digest mismatch.');
  const groups=reportGroups(report);
  for(const rows of groups.values()){
   const first=rows[0],runtime=provenance(first.provenance,first.difficulty),key=runtimeKey(runtime);
   if(rows.some(r=>runtimeKey(provenance(r.provenance,r.difficulty))!==key))throw Error('Mixed runtime identity in factorial cells.');
   const o=report.options,factorial=o.mode==='cards',cells=rows.map(r=>({mask:factorial?r.mask:0,status:r.status,utility:r.utility??null})).sort((a,b)=>a.mask-b.mask);
   if(factorial&&(cells.length!==1<<o.cards.length||cells.some((c,i)=>c.mask!==i)))throw Error('Incomplete or duplicate factorial masks.');
   const invalid=cells.some(c=>c.status==='INVALID_POLICY_OR_ENGINE'),censored=cells.some(c=>!terminal(c.status)),status=invalid?'INVALID':censored?'CENSORED':'COMPLETE';
   if(factorial&&cells.some(c=>terminal(c.status)?!Number.isFinite(c.utility):c.utility!==null))throw Error('Utility must be finite for terminal cells and null for unknown cells.');
   const identity={runtime:key,policy:report.agentVersion,skill:first.skill,seed:first.seed,enemy:o.enemy,cards:o.cards,upgraded:o.upgraded,experience:o.experience||'off',predict:o.predict,route:o.route,kind:factorial?'factorial-card':'campaign'};
   const observation={schemaVersion:1,id:digest(identity),domain,kind:identity.kind,source,sourceHash:report.sourceHash,policy:report.agentVersion,policySignature:policySignature(report.sources),skill:first.skill,split,seed:first.seed,runtime,status,cards:o.cards||[],upgraded:!!o.upgraded,experience:o.experience||'off',enemy:o.enemy,predict:o.predict,route:o.route,cells};
   if(!factorial)observation.outcome={result:first.status,finalHp:first.final?.hp??null,maxHp:first.final?.maxHp??null,goldEarned:first.metrics?.goldEarned??null,goldSpent:first.metrics?.goldSpent??null};
   validateObservation(observation);observations.push(observation);
  }
 }
 const plan={schemaVersion:1,scope:schedule?'PREDECLARED_COHORT':'DECLARED_REPORT_OPTIONS',scheduleHash:digest(schedule||reports.map(r=>r.options)),plannedReports:reports.length,plannedGroups:observations.length,plannedCells:observations.reduce((n,o)=>n+(o.cells?.length||0),0),groups:observations.map(o=>({id:o.id,cells:o.cells?.length||0}))};
 Object.defineProperty(observations,'plan',{value:plan});return observations;
}
function finiteTree(v,seen=new Set()){if(typeof v==='number'&&!Number.isFinite(v))throw Error('Nonfinite outcome/feature value.');if(v&&typeof v==='object'){if(seen.has(v))throw Error('Circular observation.');seen.add(v);for(const x of Object.values(v))finiteTree(x,seen);seen.delete(v);}}
function validateObservation(o){
 finiteTree(o);
 if(!o||o.schemaVersion!==1||typeof o.id!=='string'||!o.id||!['combat','map','economy'].includes(o.domain)||!['train','validation','test'].includes(o.split)||!['COMPLETE','CENSORED','INVALID'].includes(o.status)||!uint(o.seed)||!o.source?.branch||!/^[a-f0-9]{40}$/.test(o.source.commit)||!hash(o.sourceHash))throw Error('Invalid experience observation header.');
 runtimeKey(o.runtime);
 if(o.domain==='combat'&&o.kind==='factorial-card'){
  if(!Array.isArray(o.cards)||o.cards.length<1||o.cards.length>2||o.cards.some(c=>!card(c))||typeof o.upgraded!=='boolean'||!hash(o.policySignature)||typeof o.policy!=='string'||!Array.isArray(o.cells)||o.cells.length!==1<<o.cards.length)throw Error('Invalid factorial-card observation.');
  if(o.cells.some((c,i)=>c.mask!==i||!['WIN','LOSS','BENCHMARK_LIMIT_CENSORED','INVALID_POLICY_OR_ENGINE'].includes(c.status)||(terminal(c.status)?!Number.isFinite(c.utility):c.utility!==null)))throw Error('Incomplete masks or nonfinite utility.');
  const status=o.cells.some(c=>c.status==='INVALID_POLICY_OR_ENGINE')?'INVALID':o.cells.some(c=>!terminal(c.status))?'CENSORED':'COMPLETE';if(status!==o.status)throw Error('Cell status disagrees with observation.');
 }else if(!o.outcome||typeof o.outcome!=='object')throw Error('Domain outcome required.');
 return o;
}
function validateRows(rows){const ids=new Set(),contexts=new Set();for(const o of rows){validateObservation(o);if(ids.has(o.id))throw Error('Duplicate scenario identity.');ids.add(o.id);if(o.kind==='factorial-card'){const k=JSON.stringify([runtimeKey(o.runtime),o.policySignature,o.skill,o.seed,o.enemy,[...o.cards].sort(),o.upgraded,o.predict]);if(contexts.has(k))throw Error('Duplicate deterministic factorial context.');contexts.add(k);}}}
function seedCheck(seedPlan){if(!seedPlan||!Array.isArray(seedPlan.train)||!Array.isArray(seedPlan.validation)||[...seedPlan.train,...seedPlan.validation].some(s=>!uint(s))||new Set(seedPlan.train).size!==seedPlan.train.length||new Set(seedPlan.validation).size!==seedPlan.validation.length||seedPlan.train.some(s=>seedPlan.validation.includes(s)))throw Error('Invalid or overlapping train/validation seed plan.');}
function bundleRows(rows,source,seedPlan){validateRows(rows);seedCheck(seedPlan);for(const o of rows){if(o.source.branch!==source?.branch||o.source.commit!==source?.commit)throw Error('Bundle source mismatch.');if(!(o.split==='train'?seedPlan.train:o.split==='validation'?seedPlan.validation:seedPlan.test||[]).includes(o.seed))throw Error('Observation seed not in declared split.');}}
function planRows(rows,p){
 if(!p||p.schemaVersion!==1||!['PREDECLARED_COHORT','DECLARED_REPORT_OPTIONS'].includes(p.scope)||!hash(p.scheduleHash)||!Number.isSafeInteger(p.plannedReports)||p.plannedReports<1||!Number.isSafeInteger(p.plannedGroups)||p.plannedGroups<p.plannedReports||!Array.isArray(p.groups)||p.groups.length!==p.plannedGroups||!Number.isSafeInteger(p.plannedCells)||p.plannedCells<0||p.groups.some(g=>typeof g.id!=='string'||!Number.isSafeInteger(g.cells)||g.cells<0||g.cells>4)||new Set(p.groups.map(g=>g.id)).size!==p.groups.length||p.groups.reduce((n,g)=>n+g.cells,0)!==p.plannedCells)throw Error('Invalid planned cohort coverage.');
 const expected=new Map(p.groups.map(g=>[g.id,g.cells]));if(rows.length!==p.plannedGroups||rows.some(o=>expected.get(o.id)!==(o.cells?.length||0)))throw Error('Missing or unexpected observation in planned cohort coverage.');
}
function summarize(rows){return {observations:rows.length,complete:rows.filter(r=>r.status==='COMPLETE').length,censored:rows.filter(r=>r.status==='CENSORED').length,invalid:rows.filter(r=>r.status==='INVALID').length,cells:rows.reduce((n,r)=>n+(r.cells?.length||0),0)};}
function writeBundle(out,{observations,source,seedPlan,plan=observations.plan}){
 bundleRows(observations,source,seedPlan);if(plan)planRows(observations,plan);else if(observations.some(o=>o.domain==='combat'))throw Error('New Combat export requires a planned cohort.');if(fs.existsSync(out))throw Error('Output exists; choose a fresh directory.');
 const summary=summarize(observations),raw=observations.map(r=>JSON.stringify(r)).join('\n')+(observations.length?'\n':''),summaryBytes=JSON.stringify(summary,null,2)+'\n';
 const manifest={schemaVersion:1,source,seedPlan,...(plan?{plan}:{}),summary,files:{'observations.jsonl':{sha256:digest(raw),bytes:Buffer.byteLength(raw)},'summary.json':{sha256:digest(summaryBytes),bytes:Buffer.byteLength(summaryBytes)}}};
 fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'observations.jsonl'),raw,{flag:'wx'});fs.writeFileSync(path.join(out,'summary.json'),summaryBytes,{flag:'wx'});fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});return manifest;
}
function readBundle(out){
 const manifest=JSON.parse(fs.readFileSync(path.join(out,'manifest.json'),'utf8'));if(manifest.schemaVersion!==1)throw Error('Unsupported experience schema.');seedCheck(manifest.seedPlan);
 for(const file of ['observations.jsonl','summary.json']){const info=manifest.files?.[file];if(!info||!hash(info.sha256)||info.bytes>64*1024*1024)throw Error('Invalid bundle file metadata.');const b=fs.readFileSync(path.join(out,file));if(b.length!==info.bytes||digest(b)!==info.sha256)throw Error('Bundle bytes/hash mismatch: '+file);}
 const observations=fs.readFileSync(path.join(out,'observations.jsonl'),'utf8').split('\n').filter(Boolean).map(JSON.parse);bundleRows(observations,manifest.source,manifest.seedPlan);if(manifest.plan)planRows(observations,manifest.plan);if(JSON.stringify(summarize(observations))!==JSON.stringify(manifest.summary))throw Error('Bundle count/status mismatch.');return {manifest,observations};
}
function fitModel({manifest,observations}){
 seedCheck(manifest.seedPlan);validateRows(observations);if(manifest.plan)planRows(observations,manifest.plan);const profiles={},summary={singleContexts:0,pairContexts:0,excluded:0};let signature=null,policy=null;
 for(const o of observations){
  if(o.split!=='train'||!manifest.seedPlan.train.includes(o.seed)||manifest.seedPlan.validation.includes(o.seed))throw Error('Validation/split seed cannot enter training.');
  if(o.experience!=='off')throw Error('Training requires experience guidance OFF.');
  if(o.status!=='COMPLETE'||o.domain!=='combat'||o.kind!=='factorial-card'||o.skill!=='intermediate'){summary.excluded++;continue;}
  if(signature!==null&&(signature!==o.policySignature||policy!==o.policy))throw Error('Mixed training policy identities.');signature=o.policySignature;policy=o.policy;
  const k=runtimeKey(o.runtime),p=profiles[k]??={runtime:o.runtime,cards:{},pairs:{}};const add=(table,id,value,extra={})=>{const v=table[id]??={...extra,total:0,contexts:0};v.total+=value;v.contexts++;};const u=o.cells.map(c=>c.utility);
  if(o.cards.length===1){add(p.cards,o.cards[0]+':'+o.upgraded,u[1]-u[0]);summary.singleContexts++;}
  else if(o.cards[0]!==o.cards[1]){const cards=[...o.cards].sort();add(p.pairs,cards.map(c=>c+':'+o.upgraded).join('|'),u[3]-u[1]-u[2]+u[0],{cards,upgraded:o.upgraded});summary.pairContexts++;}
 }
 for(const p of Object.values(profiles))for(const table of [p.cards,p.pairs])for(const v of Object.values(table)){v.meanDelta=v.total/v.contexts;v.adjustment=Math.max(-.25,Math.min(.25,v.meanDelta/20*v.contexts/(v.contexts+5)));delete v.total;}
 const model={schemaVersion:1,kind:'bounded-acquisition-priors',trainingPolicy:policy,policySignature:signature,trainingSeeds:manifest.seedPlan.train,validationSeeds:manifest.seedPlan.validation,inputDigest:manifest.files?.['observations.jsonl']?.sha256||digest(observations),source:manifest.source,summary,profiles,interpretation:'Small contextual acquisition priors, not universal card power or pupil calibration.'};return {...model,id:digest(model)};
}
module.exports={runtimeKey,policySignature,normalizeReports,validateObservation,writeBundle,readBundle,fitModel,digest};
