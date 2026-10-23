'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto');
const {Worker,isMainThread,parentPort,workerData}=require('node:worker_threads');
const {loadEngine,ROOT,BASE}=require('./loader.cjs'),D=require('./deep.cjs'),F=require('./decks.cjs'),{campaign}=require('./growth.cjs');
const OUT=path.join(ROOT,'docs/balance/combat/deep-results');
const cleanDeck=()=>Array.from({length:18},(_,i)=>({key:'stm.'+['attack.rune_strike','attack.weak_point','attack.scout_strike','defend.rune_guard','defend.cinder_guard','skill.quick_study'][i%6],upgraded:false}));
const selectedRisks=[{target:'stm.passive.ember_core',predictProfile:'independent',upgraded:true},{target:'stm.passive.growing_flame',predictProfile:'developing',upgraded:true},{target:'stm.passive.blazing_spirit',predictProfile:'independent',upgraded:true}];
function jobs(cohort){
 const all=[],kinds=Object.keys(F.pools),profiles=['independent','developing','struggling','skip'],seeds=Array.from({length:10},(_,i)=>930230+i);
 const add=(build,difficulty,options,meta={})=>all.push({index:all.length,cohort,build,difficulty,options,meta});
 if(cohort==='evolved'){
  for(const build of ['baseline','candidate'])for(const difficulty of build==='baseline'?['medium']:['easy','medium','hard'])for(const archetype of kinds)for(const size of [10,18,30])for(const predictProfile of profiles)for(const seed of seeds)add(build,difficulty,{seed,enemy:'dealer',deck:F.deck(archetype,size,.33),artifacts:F.packs[archetype],predictProfile},{archetype,size,upgradeRate:.33});
 }else if(cohort==='resource'){
  for(const difficulty of ['easy','medium','hard'])for(const archetype of kinds)for(const predictProfile of profiles.slice(0,3))for(const seed of seeds)add('candidate',difficulty,{seed,enemy:'dealer',deck:F.deck(archetype,18,.33),artifacts:F.packs[archetype],predictProfile,hpRatio:.5},{archetype,size:18,hpRatio:.5});
  for(const archetype of kinds)for(const size of [10,18,30])for(const upgradeRate of [0,.75])for(const predictProfile of ['independent','developing'])for(const seed of seeds)add('candidate','medium',{seed,enemy:'dealer',deck:F.deck(archetype,size,upgradeRate),artifacts:F.packs[archetype],predictProfile},{archetype,size,upgradeRate});
 }else if(['setup','setup_clean'].includes(cohort)){
  const cards=loadEngine({build:'candidate'}).data.cards.filter(c=>c.category==='passive'||['Layered Shield','Mana Reading','Next Chapter'].includes(c.name));
  for(const c of cards)for(const enemy of ['wisp','dealer'])for(const predictProfile of ['independent','developing','assisted'])for(const upgraded of [false,true])for(const seed of seeds)for(const mask of [0,1]){
   const deck=cohort==='setup'?F.deck('attack',18,0):cleanDeck();deck[0]={key:mask?c.id:'stm.attack.rune_strike',upgraded};add('candidate','medium',{seed,enemy,deck,predictProfile,initialFocus:1},{target:c.id,enemy,predictProfile,upgraded,mask});
  }
 }else if(cohort==='campaign_reviewed'){
  for(const build of ['baseline','candidate'])for(const difficulty of build==='baseline'?['medium']:['easy','medium','hard'])for(const archetype of kinds)for(const predictProfile of profiles.slice(0,3))for(const seed of seeds)add(build,difficulty,{seed,archetype,predictProfile,routePolicy:seed%2?'safe':'risk'},{archetype,routePolicy:seed%2?'safe':'risk'});
 }else if(cohort==='hard_followup'){
  for(const difficulty of ['medium','hard'])for(const policy of ['strategic','beginner'])for(let i=0;i<50;i++){const archetype=kinds[i%kinds.length],seed=1000230+i;add('candidate',difficulty,{seed,archetype,predictProfile:'independent',policy,routePolicy:i%2?'safe':'risk'},{archetype,policy,routePolicy:i%2?'safe':'risk',reason:'Hard pilot 0/150; matched new seed follow-up'});}
 }else if(cohort==='reload'){
  for(const build of ['baseline','candidate'])for(const archetype of kinds)for(const predictProfile of ['independent','developing'])for(let i=0;i<10;i++){const seed=940230+i,options={seed,enemy:i%2?'dealer':'sentinel',deck:F.deck(archetype,[10,18,30][i%3],.5),artifacts:F.packs[archetype],predictProfile,policy:i%3===0?'random':'strategic'};add(build,'medium',options,{archetype,pair:all.length});}
 }else if(cohort==='dilution'){
  for(const archetype of kinds)for(const size of [12,24,36])for(const predictProfile of ['independent','developing'])for(let i=0;i<20;i++){const deck=F.deck(archetype,12,.33);let k=0;while(deck.length<size)deck.push({key:'stm.'+(k++%2?'defend.rune_guard':'attack.rune_strike'),upgraded:false});add('candidate','medium',{seed:990230+i,enemy:'dealer',deck,artifacts:F.packs[archetype],predictProfile},{archetype,size,baseSize:12,fixedBaseUpgrades:4,added:'alternating unupgraded Rune Strike/Rune Guard'});}
 }else if(cohort==='risk_followup'){
  for(const select of selectedRisks)for(const enemy of ['wisp','dealer'])for(let i=0;i<50;i++)for(const mask of [0,1]){const deck=cleanDeck();deck[0]={key:mask?select.target:'stm.attack.rune_strike',upgraded:select.upgraded};add('candidate','medium',{seed:970230+i,enemy,deck,predictProfile:select.predictProfile,initialFocus:1},{...select,enemy,mask,selectedFrom:'setup_clean largest absolute paired U; winner-selection bias'});}
 }else if(cohort==='cluster'){
  const cases=[{id:'strength_multihit',kind:'attack',base:['e15'],extra:'b02'},{id:'agility_layered_carry',kind:'block',base:['e16'],extra:'b02'},{id:'free_exhaust_abacus',kind:'draw',base:['e05','s11','b01'],extra:'e01'},{id:'skill_draw_ward',kind:'draw',base:['s10','e10'],extra:'b03'},{id:'focus_core',kind:'focus',base:['e10','b03'],extra:'s04'}];
  for(const c of cases)for(const predictProfile of ['independent','struggling'])for(let i=0;i<50;i++)for(const mask of [0,1]){const deck=F.deck(c.kind,18,.33);if(c.id==='skill_draw_ward')deck[0]={key:'stm.passive.grimoire_ward',upgraded:true};add('candidate','medium',{seed:980230+i,enemy:'dealer',deck,predictProfile,artifacts:[...c.base,...(mask?[c.extra]:[])]},{cluster:c.id,extraArtifact:c.extra,predictProfile,mask});}
 }else throw Error('Unknown cohort');return all;
}
if(!isMainThread){
 const engines={},get=j=>engines[j.build+':'+j.difficulty]||(engines[j.build+':'+j.difficulty]=loadEngine(j));
 const file=path.join(OUT,workerData.cohort+'-'+workerData.worker+'.jsonl.gz'),partial=file+'.pending';
 fs.writeFileSync(partial,'');let buffer=[],count=0;const outcomes={};
 const flush=()=>{if(buffer.length){fs.appendFileSync(partial,zlib.gzipSync(buffer.join('\n')+'\n',{level:9}));buffer=[];}};
 for(const job of workerData.jobs){const x=get(job);let result;
  if(['campaign_reviewed','hard_followup'].includes(job.cohort))result=campaign(x,job.options);
  else if(job.cohort==='reload'){const a=D.simulate(x,job.options),b=D.simulate(x,{...job.options,reload:true});result={status:a.status==='INVALID_POLICY_OR_ENGINE'||b.status==='INVALID_POLICY_OR_ENGINE'?'INVALID_POLICY_OR_ENGINE':JSON.stringify(D.outcome(a))===JSON.stringify(D.outcome(b))?'MATCH':'MISMATCH',uninterrupted:a,reloaded:b};}
  else result=D.simulate(x,job.options);
  buffer.push(JSON.stringify({...job,result}));count++;outcomes[result.status]=(outcomes[result.status]||0)+1;
  if(count%50===0){flush();parentPort.postMessage({done:50});}
 }
 flush();fs.renameSync(partial,file);parentPort.postMessage({file,count,outcomes,provenance:Object.values(engines).map(x=>x.provenance)});
}else if(require.main===module){
 const cohort=process.argv[2]||'evolved',js=jobs(cohort),n=Math.min(Number(process.env.STM_WORKERS||4),js.length);fs.mkdirSync(OUT,{recursive:true});
 const names=['deep.cjs','decks.cjs','growth.cjs','deep-run.cjs','combat.cjs','candidate.cjs','loader.cjs'],sources=Object.fromEntries(names.map(p=>[p,fs.readFileSync(path.join(__dirname,p),'utf8')])),codeHash=D.hash(sources);fs.mkdirSync(path.join(OUT,'source-snapshots'),{recursive:true});fs.writeFileSync(path.join(OUT,'source-snapshots',codeHash+'.json.gz'),zlib.gzipSync(JSON.stringify(sources)));
 fs.writeFileSync(path.join(OUT,cohort+'-manifest.json'),JSON.stringify({cohort,baseCommit:BASE,codeHash,node:process.version,cases:js.length,generated:new Date().toISOString(),recovery:'Regenerated after workspace maintenance from recovered baseline and reviewed harness; compare prior retained aggregate logs.'},null,2));
 console.log(cohort,'starting',js.length,'jobs',n,'workers');let done=0;const totals={};
 Promise.all(Array.from({length:n},(_,worker)=>new Promise((resolve,reject)=>{const w=new Worker(__filename,{workerData:{cohort,worker,jobs:js.filter((_,i)=>i%n===worker)}});w.on('message',m=>{if(m.done){done+=m.done;if(done%200===0)console.log(cohort,'progress',done);}else{for(const[k,v]of Object.entries(m.outcomes))totals[k]=(totals[k]||0)+v;resolve(m);}});w.on('error',reject);w.on('exit',code=>{if(code)reject(Error('worker exit '+code));});}))).then(parts=>{fs.writeFileSync(path.join(OUT,cohort+'-parts.json'),JSON.stringify(parts,null,2));console.log(cohort,'DONE',totals);}).catch(e=>{console.error(e);process.exitCode=1;});
}
module.exports={jobs,cleanDeck};
