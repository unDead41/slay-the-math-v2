'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),cp=require('node:child_process');
const root=path.resolve(process.argv[2]),base=process.argv[3];
const read=p=>fs.readFileSync(path.join(root,p)),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const git=(...args)=>cp.execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
const {loadMaster}=require(path.join(root,'tools/balance/master/loader.cjs')),{createExperience}=require(path.join(root,'tools/ai-playtester/experience.cjs'));
const {experiment}=require(path.join(root,'tools/ai-playtester/experiments.cjs'));
const expectedModel='9cca16330efe6b55cec5a10e9458490509a81a05e715546ebad10db12abec6b6';
const baseline=JSON.parse(read('docs/balance/master/ai-data-20261025/verification.json'));
const sourceParity=Object.entries(baseline.sources).map(([file,sha])=>{const actual=hash(read(file));assert.equal(actual,sha,file+' must retain reviewed AI/runtime source');return {file,sha256:actual};});
const protectedDiff=git('diff',base,'--name-only','--','dist','modules','integrations').split('\n').filter(Boolean).sort();
assert.deepEqual(protectedDiff,['dist/asset-manifest.json','dist/index.html','dist/release.js']);
const profiles=['easy','medium','hard'].map(difficulty=>{
 const x=loadMaster({difficulty}),ready=createExperience(x);assert.equal(ready.status,'READY');assert.equal(ready.id,expectedModel);
 const fallbacks=[createExperience(x,{enabled:false}),createExperience(x,{model:null}),createExperience(x,{model:{}}),createExperience({...x,provenance:{...x.provenance,engineHash:'0'.repeat(64)}})];
 assert.deepEqual(fallbacks.map(e=>e.status),['DISABLED','MISSING_MODEL','INVALID_MODEL','STALE_RUNTIME']);
 for(const e of fallbacks)assert.equal(e.deckAdjustment([{key:'stm.attack.rune_strike',upgraded:false}]),0);
 return {runtime:x.provenance,status:ready.status,modelId:ready.id,fallbacks:fallbacks.map(e=>e.status)};
});
const tutorial=require(path.join(root,'dist/tutorial-data.js'));
const media=new Set(tutorial.chapters.flatMap(ch=>ch.frames.flatMap(frame=>['en','ms'].map(lang=>tutorial.mediaFile(frame.shot,lang)))));
const tutorialCounts={chapters:tutorial.chapters.length,practices:tutorial.chapters.filter(ch=>ch.exercise).length,media:media.size};
assert.deepEqual(tutorialCounts,{chapters:23,practices:12,media:98});
const files=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);e.isDirectory()?walk(file):files.push(path.relative(root,file));}}walk(path.join(root,'release-prod'));
assert.ok(files.every(p=>!p.includes('ai-playtester')&&!p.includes('playtester')));
const offline=read('SLAY-THE-MATH-OFFLINE.html');for(const marker of ['sampled-turn-search-4','bounded-acquisition-priors','/__dev/ai/'])assert.equal(offline.indexOf(marker),-1,marker);
const smoke=experiment({mode:'cards',difficulty:'medium',skill:'intermediate',predict:'feedback',seed:703,seeds:1,cards:['stm.attack.rune_strike'],experience:'on'});
assert.equal(smoke.summary.invalid,0);assert.equal(smoke.summary.censored,0);assert.equal(smoke.experience.byDifficulty.medium.status,'NOT_USED_IN_CARD_MODE');
for(const [file,sha]of Object.entries(smoke.sources))assert.equal(hash(read(file)),sha);
async function endpoints(mode){
 const child=cp.spawn(process.execPath,['server.cjs',...(mode==='production'?['--prod']:[])],{cwd:root,env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
 try{
  const port=await new Promise((resolve,reject)=>{let text='',errors='';const timer=setTimeout(()=>reject(Error('Server timeout '+errors)),30000);child.stdout.on('data',v=>{text+=v;const m=text.match(/Game: http:\/\/localhost:(\d+)/);if(m){clearTimeout(timer);resolve(m[1]);}});child.stderr.on('data',v=>errors+=v);child.once('error',reject);child.once('exit',code=>{clearTimeout(timer);reject(Error('Server exited '+code+' '+errors));});});
  const checks=[];for(const route of ['/__dev/ai/','/__dev/ai/catalog','/__dev/ai/jobs'])for(const method of ['GET','POST']){const r=await fetch('http://127.0.0.1:'+port+route,{method,...(method==='POST'?{headers:{'Content-Type':'application/json'},body:'{}'}:{})});assert.equal(r.status,404,mode+' '+method+' '+route);checks.push({route,method,status:r.status});}return {mode,checks};
 }finally{child.kill();}
}
(async()=>{const boundary=[];for(const mode of ['player','production'])boundary.push(await endpoints(mode));console.log(JSON.stringify({status:'PASS',candidateSHA:git('rev-parse','HEAD'),candidateTree:git('rev-parse','HEAD^{tree}'),base,version:JSON.parse(read('package.json')).version,protectedDiff,sourceParity,profiles,tutorialCounts,production:{files:files.length,aiExcluded:true,offlineBytes:offline.length,offlineSha256:hash(offline)},sourceHash:smoke.sourceHash,smoke:{seed:703,rows:smoke.rows.length,invalid:smoke.summary.invalid,censored:smoke.summary.censored,status:smoke.experience.byDifficulty.medium.status},boundary},null,2));})().catch(e=>{console.error(e);process.exitCode=1;});
