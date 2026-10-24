'use strict';
const fs=require('node:fs'),path=require('node:path');
const {assertDifficulty,difficultyReadiness}=require('./scenarios.cjs');
const {sha}=require('../map/source-audit.cjs');
const cache=new Map(),ROOT=path.resolve(__dirname,'../../..');
function runtimeFor(config={}){
 const build=config.runtimeBuild||'legacy';
 if(build==='legacy'){assertDifficulty(config.difficulty);return null;}
 if(build!=='master'||!['easy','medium','hard'].includes(config.difficulty))throw Error('Unsupported map runtime/profile.');
 if(!cache.has(config.difficulty)){
  const runtime=require('../master/loader.cjs').loadMaster({difficulty:config.difficulty});
  const replay=require('../map/replay.cjs').createReplay(runtime);
  cache.set(config.difficulty,{...runtime,replay});
 }
 return cache.get(config.difficulty);
}
function runtimeContext(config){
 const x=runtimeFor(config);if(!x)return null;
 const probe=x.E.newRun(0,'learn'),postRunBossGrant=x.E.rewardGold({...probe,stage:1,battle:{enemyId:x.C.stages[1].boss}});
 if(config.postRunBossGrant!==postRunBossGrant)throw Error('Configured post-run Gold differs from canonical runtime.');
 const files=[...new Set([...x.sourceFiles,'dist/balance.js','dist/balance-data.js','dist/balance-config.js','package.json','tools/balance/master/config.json','tools/balance/master/loader.cjs','modules/map/src/map-rng.js','modules/map/data/seed-registry.json'])].sort();
 return {gameVersion:require('../../../package.json').version,runtimeIdentity:x.provenance,profile:x.binding.profile,postRunBossGrant,sourceHashes:Object.fromEntries(files.map(f=>[f,sha(fs.readFileSync(path.join(ROOT,f)))])),difficultyReadiness:difficultyReadiness().map(r=>({difficulty:r.difficulty,status:'IMPLEMENTED',engineTrials:0,version:x.provenance.version,definitionHash:x.provenance.definitionHash,pupilWinRateMeasured:false,targetPupilWinRate:r.targetPupilWinRate,source:'canonical integrated Master loader'}))};
}
module.exports={runtimeFor,runtimeContext};
