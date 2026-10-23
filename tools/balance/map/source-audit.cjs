'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {createHash}=require('node:crypto');
const C=require('../../../dist/config.js');
const K=require('../../../dist/card-data.js');
const A=require('../../../dist/artifact-data.js');
const M=require('../../../dist/mystery-data.js');
const root=path.resolve(__dirname,'../../..');
function sha(bytes){return createHash('sha256').update(bytes).digest('hex');}
function verifyReference(bytes,provenance){const digest=sha(bytes);if(digest!==provenance.memberSha256)throw Error('Balance reference digest differs from verified package provenance.');return digest;}
function runtimeDependencies(){
 const seen=new Set();
 function visit(module){if(!module||seen.has(module.filename))return;seen.add(module.filename);module.children.forEach(visit);}
 for(const entry of ['dist/engine.js','dist/map-rng.js']){const file=require.resolve(path.join(root,entry));require(file);visit(require.cache[file]);}
 return [...seen].filter(f=>f.startsWith(root+path.sep)).map(f=>path.relative(root,f)).sort();
}
function sourceAudit(){
 const provenance=JSON.parse(fs.readFileSync(path.join(__dirname,'inputs/provenance.json'))),bytes=fs.readFileSync(path.join(__dirname,'inputs/balance-v1.2-reference.json'));
 verifyReference(bytes,provenance);const spec=JSON.parse(bytes);
 const files=[...new Set([...runtimeDependencies(),'dist/card-kit.js','package.json','modules/map/src/map-rng.js','modules/map/data/seed-registry.json'])].sort();
 const sourceHashes=Object.fromEntries(files.map(f=>[f,sha(fs.readFileSync(path.join(root,f)))]));
 const toolFiles=fs.readdirSync(__dirname,{recursive:true}).filter(f=>/\.(cjs|json)$/.test(f)).sort();
 const toolHashes=Object.fromEntries(toolFiles.map(f=>['tools/balance/map/'+f,sha(fs.readFileSync(path.join(__dirname,f)))]));
 const enemies=spec.enemies.map(e=>{const cur=C.enemies[e.id],elite=e.tier==='elite';return {id:e.id,name:cur.name,stage:e.stage,tier:e.tier,runtime:{baseHp:cur.hp,effectiveHp:cur.hp+(elite?10:0),defense:0,eliteDamageBonus:elite?2:0,patterns:cur.patterns},candidateMedium:{hp:e.hp,defense:e.defense,patterns:e.patterns},sameMechanicalAlias:Object.entries(C.enemies).filter(([id,v])=>id!==e.id&&JSON.stringify([v.hp,v.patterns])===JSON.stringify([cur.hp,cur.patterns])).map(([id])=>id)};});
 const cards=spec.cards.map(c=>{const cur=K.cards.find(k=>k.id===c.id);return {id:c.id,name:c.name,runtimeEnergy:cur.energy,runtimeValues:cur.values,packageSnapshotMatchesRuntime:JSON.stringify(cur.energy)===JSON.stringify(c.current_energy)&&JSON.stringify(cur.values)===JSON.stringify(c.current_values),candidateEnergy:c.proposed_energy,candidateNormal:c.normal,candidateFocus:c.focused,candidateUpgrade:c.upgrade,numericPatch:c.numeric_patch,status:'CANDIDATE_NOT_APPLIED'};});
 const artifactList=Array.isArray(A)?A:A.artifacts;
 const artifacts=spec.artifacts.map(a=>{const cur=artifactList.find(x=>x.id===a.id);return {id:a.id,name:a.name,runtimeValues:cur?.values||null,candidateValues:a.proposed_values,changed:JSON.stringify(cur?.values)!==JSON.stringify(a.proposed_values)};});
 const events=spec.events.map(e=>{const cur=M.events.find(x=>x.id===e.id);return {id:e.id,runtimeSeconds:cur.timeLimitSeconds,candidateBaseSeconds:e.base_seconds,candidateOverrides:e.overrides||{},runtimeRemovalMinimum:e.id==='ME10'?1:null,candidateRemovalMinimum:e.id==='ME10'?10:null};});
 return {requestedBaseCommit:require('./config.json').baseCommit,sourceCheckoutHead:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),gameVersion:require('../../../package.json').version,inputPackage:provenance,
  status:'RUNTIME_AUDITED_V1_2_CANDIDATES_NOT_APPLIED',sourceHashes,toolHashes,
  runtime:{modes:['learn','challenge'],difficultyProfilesImplemented:false,startingHp:C.MAX_HP,startingGold:C.ECONOMY.start,focusCap:C.FOCUS_CAP,starter:C.STARTER,upgradeRules:C.CARD_UPGRADES,economy:C.ECONOMY,restHeal:12,stage1ClearHeal:12,learnDamageMultiplier:.7,eliteHpBonus:10,eliteDamageBonus:2,loot:'uniform distinct pool; Shop seeded; no v1.2 rarity/support overlay',bossArtifactSoldInStage1:true},
  candidateProfiles:spec.profiles,candidateEconomy:spec.economy,enemies,cards,artifacts,events,
  ownerRequests:[{domain:'combat',request:'Supply an implemented/versioned Easy/Medium/Hard adapter and calibrated agent profiles before map-tier validation.'},{domain:'economy',request:'Evaluate Stage 1 Boss artifact availability, meaningful recovery and rarity/support weighting; current map replay preserves runtime offers.'},{domain:'master',request:'Decide whether forced Elite paths are acceptable per difficulty; 1.2 BAL-25 and existing global quotas must be reconciled explicitly, without silently regenerating maps.'}]};
}
module.exports={sourceAudit,sha,verifyReference};
