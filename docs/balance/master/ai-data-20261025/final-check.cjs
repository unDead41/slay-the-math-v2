'use strict';
// Read-only final identity, artifact and endpoint checks; output is JSON on stdout.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{spawn,execFileSync}=require('node:child_process');
const {loadMaster}=require('../../../../tools/balance/master/loader.cjs'),{createExperience}=require('../../../../tools/ai-playtester/experience.cjs'),{experiment}=require('../../../../tools/ai-playtester/experiments.cjs');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
async function endpoints(mode){
 const server=spawn(process.execPath,['server.cjs',...(mode==='production'?['--prod']:[])],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
 try{
  const port=await new Promise((resolve,reject)=>{let text='';server.stdout.on('data',v=>{text+=v;const m=text.match(/Game: http:\/\/localhost:(\d+)/);if(m)resolve(m[1]);});server.once('error',reject);server.once('exit',code=>reject(Error('Server exited '+code)));});
  const checks=[];for(const route of ['/__dev/ai/','/__dev/ai/catalog','/__dev/ai/jobs'])for(const method of ['GET','POST']){const r=await fetch('http://127.0.0.1:'+port+route,{method,...(method==='POST'?{headers:{'Content-Type':'application/json'},body:'{}'}:{})});assert.equal(r.status,404);checks.push({route,method,status:r.status});}return {mode,checks};
 }finally{server.kill();}
}
(async()=>{
 const protectedDiff=execFileSync('git',['diff','6c49f39','--name-only','--','dist','modules','integrations'],{encoding:'utf8'}).trim().split('\n').sort();assert.deepEqual(protectedDiff,['dist/asset-manifest.json','dist/index.html','dist/release.js']);
 const profiles=['easy','medium','hard'].map(difficulty=>{const x=loadMaster({difficulty}),e=createExperience(x);assert.equal(e.status,'READY');return {runtime:x.provenance,status:e.status,modelId:e.id};});
 const files=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);e.isDirectory()?walk(p):files.push(p);}}walk('release-prod');assert.ok(files.every(p=>!p.includes('ai-playtester')&&!p.includes('playtester')));
 const offline=fs.readFileSync('SLAY-THE-MATH-OFFLINE.html','utf8');for(const marker of ['sampled-turn-search-4','bounded-acquisition-priors','/__dev/ai/'])assert.ok(!offline.includes(marker));
 const smoke=experiment({mode:'cards',difficulty:'medium',skill:'intermediate',predict:'feedback',seed:703,seeds:1,cards:['stm.attack.rune_strike'],experience:'on'});assert.equal(smoke.summary.invalid,0);assert.equal(smoke.summary.censored,0);assert.equal(smoke.experience.byDifficulty.medium.status,'NOT_USED_IN_CARD_MODE');
 for(const [p,sha]of Object.entries(smoke.sources))assert.equal(digest(fs.readFileSync(p)),sha);
 const boundary=[];for(const mode of ['player','production'])boundary.push(await endpoints(mode));
 console.log(JSON.stringify({status:'PASS',version:require('../../../../package.json').version,protectedDiff,profiles,production:{files:files.length,aiExcluded:true,offlineBytes:Buffer.byteLength(offline),offlineSha256:digest(offline)},sourceHash:smoke.sourceHash,sources:smoke.sources,smoke:{seed:703,rows:smoke.rows.length,invalid:smoke.summary.invalid,censored:smoke.summary.censored,status:smoke.experience.byDifficulty.medium.status},boundary},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
