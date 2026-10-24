'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../../..'),{loadMaster}=require(path.join(root,'tools/balance/master/loader.cjs'));
const profiles=['easy','medium','hard'].map(difficulty=>{
 const x=loadMaster({difficulty}),r=x.E.newRun(42,'challenge'),starter={};for(const c of r.deck)starter[c.key]=(starter[c.key]||0)+1;
 return {difficulty,runtimeIdentity:x.provenance,profile:x.binding.profile,referenceStarterBeforeArtifact:starter,referenceNewRun:{hp:r.hp,maxHp:r.maxHp,gold:r.gold,deckSize:r.deck.length},stages:x.C.stages,enemyTemplates:x.C.enemies};
});
const file=path.join(root,'reports/map-balance/v1.4/runtime-inputs.json');
fs.writeFileSync(file,JSON.stringify({sourceMainCommit:'990541d57c6df96cefb21eddc7a365d1d989a74d',method:'Read canonical integrated binding/config and actual newRun before artifact. Enemy templates require the accompanying profile multipliers, phase/rage and engine rules; these are inputs, not simulated damage results.',profiles},null,2)+'\n');
console.log(JSON.stringify({file:path.relative(root,file),profiles:profiles.length,sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')}));
const config=require(path.join(root,'tools/balance/map-recheck/config.json')),seeds=require(path.join(root,'modules/map/data/seed-registry.json')).seeds;
const tasks=require(path.join(root,'tools/balance/map-advanced/experiments.cjs')).buildCampaignTasks(seeds,{...config,difficulty:'easy'}),samples=new Map();
for(const t of tasks){const key=t.seed+':'+t.repetition;if(!samples.has(key))samples.set(key,{seed:t.seed,repetition:t.repetition,runSeed:t.runSeed,profiles:['easy','medium','hard'],taskKinds:[]});const row=samples.get(key);if(row.runSeed!==t.runSeed)throw Error('Sampler differs within paired tasks');row.taskKinds.push(t.group+':'+(t.group==='predict'?t.predictProfile:t.policy));}
const rows=[...samples.values()].sort((a,b)=>a.seed.localeCompare(b.seed)||a.repetition-b.repetition);if(rows.length!==400||rows.some(r=>r.runSeed%100+1!==Number(r.seed.slice(4))))throw Error('Invalid fixed sample schedule');
const {csv}=require(path.join(root,'tools/balance/map/export.cjs'));fs.writeFileSync(path.join(path.dirname(file),'run-seeds.json'),JSON.stringify(rows)+'\n');fs.writeFileSync(path.join(path.dirname(file),'run-seeds.csv'),csv(rows,Object.keys(rows[0])));console.log(JSON.stringify({fixedSamples:rows.length,campaignTasksPerDifficulty:tasks.length}));
