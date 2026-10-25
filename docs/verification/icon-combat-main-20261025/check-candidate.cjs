'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),cp=require('node:child_process');
const root=path.resolve(process.argv[2]),base=process.argv[3];
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),read=p=>fs.readFileSync(path.join(root,p));
const git=(...args)=>cp.execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
const diff=(...paths)=>git('diff',base,'--name-only','--',...paths).split('\n').filter(Boolean);
const owners=['dist/assets','modules','references','source-art','reports','integrations','tools/ai-playtester','tools/balance','dist/engine.js','dist/config.js','dist/card-combat.js','dist/card-data.js','dist/app.js','dist/game-language.js','dist/question-language.js','dist/tutorial-data.js','dist/tutorial-core.js','dist/tutorial.js','dist/tutorial.css','dist/animation.js','dist/animation-data.js','dist/animation.css','dist/asset-readiness.js','dist/audio.js','dist/audio-presentation.js','dist/dom-patch.js'];
assert.deepEqual(diff(...owners),[],'Unrelated current-main owners must remain byte-identical');
const allowed=new Set(['dist/asset-manifest.json','dist/bootstrap.js','dist/icon-readiness.js','dist/combat-vfx.js','dist/combat-vfx-passive.js','dist/status-vfx.js','dist/index.html','dist/release.js']);
const protectedChanges=diff('dist');assert.ok(protectedChanges.every(p=>allowed.has(p)),protectedChanges.filter(p=>!allowed.has(p)).join(','));
const originalAssets=git('ls-tree','-r','--name-only',base,'--','dist/assets').split('\n').filter(Boolean).length;
const manifests=[];for(const dir of ['dist','release-prod']){
 const manifest=JSON.parse(read(dir+'/asset-manifest.json'));
 for(const e of manifest.entries){const bytes=read(dir+'/'+e.url);assert.equal(bytes.length,e.bytes,dir+'/'+e.url);assert.equal(hash(bytes),e.sha256,dir+'/'+e.url);}
 manifests.push({dir,version:manifest.gameVersion,id:manifest.manifestId,entries:manifest.entries.length,allHashesMatch:true});
}
const tutorial=require(path.join(root,'dist/tutorial-data.js')),media=new Set(tutorial.chapters.flatMap(ch=>ch.frames.flatMap(frame=>['en','ms'].map(lang=>tutorial.mediaFile(frame.shot,lang)))));
const tutorialScope={chapters:tutorial.chapters.length,practice:tutorial.chapters.filter(ch=>ch.exercise).length,media:media.size};assert.deepEqual(tutorialScope,{chapters:23,practice:12,media:98});
const A=require(path.join(root,'dist/animation-data.js')),holds=Object.fromEntries(Object.entries(A.hero.animations).map(([name,clip])=>[name,clip.frames.length]));assert.equal(Object.keys(holds).length,5);assert.ok(Object.values(holds).every(n=>n===15));
const oldAI=JSON.parse(cp.execFileSync('git',['show',base+':docs/balance/master/main-2.48.0/evidence.json'],{cwd:root,encoding:'utf8'}));
const aiSources=oldAI.checks.identityAndBoundaries.sourceParity;for(const entry of aiSources)assert.equal(hash(read(entry.file)),entry.sha256,entry.file);
const {loadMaster}=require(path.join(root,'tools/balance/master/loader.cjs')),{createExperience}=require(path.join(root,'tools/ai-playtester/experience.cjs'));
const models=['easy','medium','hard'].map(difficulty=>{const x=loadMaster({difficulty}),e=createExperience(x);assert.equal(e.status,'READY');assert.equal(e.id,oldAI.checks.identityAndBoundaries.profiles[0].modelId);return {difficulty,status:e.status,modelId:e.id,runtime:x.provenance};});
const files=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);e.isDirectory()?walk(file):files.push(path.relative(root,file));}}walk(path.join(root,'release-prod'));assert.ok(files.every(p=>!p.includes('ai-playtester')&&!p.includes('playtester')));
const offline=read('SLAY-THE-MATH-OFFLINE.html');for(const marker of ['sampled-turn-search-4','bounded-acquisition-priors','/__dev/ai/'])assert.equal(offline.indexOf(marker),-1,marker);
console.log(JSON.stringify({status:'PASS',candidateSHA:git('rev-parse','HEAD'),candidateTree:git('rev-parse','HEAD^{tree}'),base,gameVersion:JSON.parse(read('package.json')).version,protectedOwners:owners,protectedOwnerChanges:[],originalAssetFilesPreserved:originalAssets,protectedChanges,manifests,tutorialScope,heroExposureCounts:holds,unchangedAISourceHashes:aiSources.length,models,production:{files:files.length,aiExcluded:true,offlineBytes:offline.length,offlineSha256:hash(offline)},workingTreeStatus:git('status','--porcelain')},null,2));
