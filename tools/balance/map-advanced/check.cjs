'use strict';
const fs=require('node:fs'),path=require('node:path');
const {hash}=require('../map/structure.cjs');
const {sha}=require('../map/source-audit.cjs');
function qualityGate({out,records,bank,summary,context}){
 const failures=[],warnings=[],entries=new Map(bank.map(e=>[e.id,e]));
 if(!summary.evaluationComplete)failures.push('INCOMPLETE_SCHEDULE');
 if(summary.errors)failures.push('POLICY_OR_ENGINE_ERRORS');if(summary.censored)failures.push('CENSORED_SCOPE_SCORES');if(summary.invalidStates)failures.push('INVALID_ENGINE_STATES');
 if(summary.legacyCompatibility.status==='FAIL')failures.push('LEGACY_REFERENCE_DRIFT');
 if(summary.legacyCompatibility.status==='NEEDS_NEW_REFERENCE')warnings.push('RUNTIME_CHANGED_REBASELINE_REQUIRED');
 if(summary.incompleteMatchedTriplets)failures.push('INCOMPLETE_MATCHED_TRIPLETS');
 for(const r of records){
  if(context.runtimeIdentity&&['version','difficulty','definitionHash','engineHash'].some(k=>r.runtimeIdentity?.[k]!==context.runtimeIdentity[k]))failures.push('RUNTIME_IDENTITY_MISMATCH:'+r.task.id);
  if(r.apiCalls>context.config.limits.maxActions)failures.push('API_LIMIT_EXCEEDED:'+r.task.id);
  if(r.task.batch==='matched'){const e=entries.get(r.task.entryId);if(!e||r.entryStateHash!==e.stateHash||r.task.entryStateHash!==e.stateHash)failures.push('MATCHED_ENTRY_CHANGED:'+r.task.id);}
  for(const room of r.rooms){if(room.metrics&&(room.metrics.hpRecovered-room.metrics.hpLost!==room.exit.hp-room.enter.hp||room.metrics.goldEarned-room.metrics.goldSpent!==room.exit.gold-room.enter.gold))failures.push('ROOM_RESOURCE_MISMATCH:'+r.task.id+':'+room.nodeId);}
 }
 if(summary.stage2Entries<context.seedList.length*context.config.matchedEntriesPerStage)warnings.push('STAGE2_BANK_IS_CONDITIONAL_AND_INCOMPLETE');
 if(!context.runtimeIdentity)warnings.push('FULL_EASY_MEDIUM_HARD_ADAPTER_UNAVAILABLE');
 warnings.push('SYNTHETIC_PREDICT_KNOWLEDGE_MODEL','SMALL_N_CP_PROVISIONAL','PUPIL_90_70_50_UNMEASURED');
 return {status:failures.length?'FAIL':'PASS',contextId:hash(context),failures:[...new Set(failures)],warnings,meaning:'PASS verifies experiment integrity, not final game balance or pupil target acceptance'};
}
function checkFiles(out){
 const manifest=JSON.parse(fs.readFileSync(path.join(out,'manifest.json'))),context=JSON.parse(fs.readFileSync(path.join(out,'context.json')));
 if(hash(context)!==manifest.contextId)throw Error('Context digest mismatch.');
 for(const [name,info] of Object.entries(manifest.files)){const bytes=fs.readFileSync(path.join(out,name));if(sha(bytes)!==info.sha256||bytes.length!==info.bytes)throw Error('Report hash mismatch '+name);}
 const index=JSON.parse(fs.readFileSync(path.join(out,'trials-index.json'))),ids=new Set();let count=0;
 if(index.contextId!==manifest.contextId)throw Error('Trial index context mismatch.');
 for(const shard of index.shards){
  const bytes=fs.readFileSync(path.join(out,shard.file));if(bytes.length!==shard.bytes||sha(bytes)!==shard.sha256)throw Error('Trial shard/index mismatch '+shard.file);
  for(const line of bytes.toString('utf8').split('\n').filter(Boolean)){const {recordHash,...record}=JSON.parse(line);if(hash(record)!==recordHash||record.contextId!==manifest.contextId||ids.has(record.task.id))throw Error('Raw trial integrity mismatch.');ids.add(record.task.id);count++;}
 }
 if(count!==index.records)throw Error('Raw record count mismatch: '+count+' / '+index.records);
 return JSON.parse(fs.readFileSync(path.join(out,'quality-gate.json')));
}
if(require.main===module){try{const out=process.argv[2]||'reports/map-balance/v1.3',q=checkFiles(out);console.log(JSON.stringify(q,null,2));if(q.status!=='PASS')process.exitCode=1;if(process.argv[3]==='--compare'){const other=process.argv[4],load=dir=>({context:JSON.parse(fs.readFileSync(path.join(dir,'context.json'))),policySummary:JSON.parse(fs.readFileSync(path.join(dir,'policy-summary.json'))),analysisProvenance:JSON.parse(fs.readFileSync(path.join(dir,'analysis-provenance.json')))});const result=require('./report.cjs').compareReports(load(other),load(out));console.log(JSON.stringify(result,null,2));if(result.status==='INCOMPATIBLE_METHOD')process.exitCode=1;}}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={qualityGate,checkFiles};
