'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib');
const {loadEngine,ROOT,BASE}=require('./loader.cjs'),B=process.env.STM_BALANCE_REPLAY_MEASURED==='1'?(()=>{const m={exports:{}};new Function('require','module','exports',fs.readFileSync(path.join(__dirname,'snapshots/measured-harness.cjs'),'utf8'))(require,m,m.exports);return m.exports;})():require('./combat.cjs'),{audit,modes}=require('./audit.cjs');
const selected=require('./specs/selected-combo-tests.json');
const out=process.env.STM_BALANCE_OUTPUT||path.join(ROOT,'docs/balance/combat/results');
function run(build='candidate'){
 fs.mkdirSync(out,{recursive:true});const engines={},cache=new Map(),records=[],summaries=[],individual=[],focus=[],orders=[],artifacts=[];
 const get=d=>engines[d]||(engines[d]=loadEngine({build,difficulty:d}));
 const sample=(difficulty,options)=>{
  const key=JSON.stringify({build,difficulty,...options});if(cache.has(key))return cache.get(key);
  const result=B.simulate(get(difficulty),options),id=crypto.createHash('sha256').update(key).digest('hex').slice(0,20);
  const row={id,build,difficulty,options,result};cache.set(key,row);records.push(row);return row;
 };
 const seeds=Array.from({length:10},(_,i)=>610230+i),five=seeds.slice(0,5);
 function factorial(ids,context,batch,seedList=seeds){
  const rows=[],refs=B.REF.slice(0,ids.length),{difficulty='medium',...ctx}=context;
  for(const seed of seedList)for(let mask=0;mask<(1<<ids.length);mask++){
   const slots=ids.map((id,i)=>mask&(1<<i)?id:refs[i]),row=sample(difficulty,{seed,slots,predict:'mixed',focus:'best',...ctx});
   rows.push({seed,mask,record:row.id,result:row.result});
  }
  const s={build,batch,ids,context,seedList,summary:B.factorialSummary(rows,ids.length),records:rows.map(({seed,mask,record})=>({seed,mask,record}))};summaries.push(s);return s;
 }
 console.log(build,'audit');const contracts=audit(get('medium'));
 if([...contracts.rows,...contracts.boundaries].some(r=>r.status==='ERROR'))throw Error('Contract audit failed');
 const screen=B.screen(get('medium').data.cards);fs.writeFileSync(path.join(out,build+'-audit.json'),JSON.stringify(contracts,null,2));
 console.log(build,'Lite primary');for(const p of selected.pairs)factorial([p.a,p.b],{difficulty:'medium',enemy:'knight',archetype:'mixed'},'lite_primary');
 if(build==='candidate')for(const difficulty of ['easy','hard'])for(const p of selected.pairs.slice(0,12))factorial([p.a,p.b],{difficulty,enemy:'knight',archetype:'mixed'},'lite_followup');
 if(build!=='cards_only'){
  console.log(build,'Lite triples');for(const t of selected.triads)factorial(t.ids,{difficulty:'medium',enemy:'knight',archetype:'mixed'},'lite_triples');
  console.log(build,'40 duplicate UID factorials');for(const c of get('medium').data.cards)factorial([c.id,c.id],{difficulty:'medium',enemy:'knight',archetype:'mixed'},'duplicate_uid_screen',seeds.slice(0,1));
  console.log(build,'40-card ICP, all four modes, two contexts');
  for(const c of get('medium').data.cards)for(const mode of modes)for(const context of [{enemy:'wisp',archetype:'mixed'},{enemy:'dealer',archetype:'block'}]){
   const rows=[],up=mode.includes('upgrade'),focused=mode.includes('focus');
   for(const seed of five)for(let mask=0;mask<2;mask++){
    const row=sample('medium',{seed,enemy:context.enemy,archetype:context.archetype,slots:[mask?c.id:B.REF[0]],upgradedSlots:mask&&up?[0]:[],initialFocus:focused?1:0,predict:'guided',focus:focused?(c.focus_eligible?'target':'best'):'never'});
    rows.push({seed,mask,record:row.id,result:row.result});
   }
   individual.push({build,id:c.id,mode,focusEligible:c.focus_eligible,context,seedList:five,summary:B.factorialSummary(rows,1),records:rows.map(({seed,mask,record})=>({seed,mask,record}))});
  }
  console.log(build,'marginal Focus opportunity');
  for(const c of get('medium').data.cards.filter(c=>c.focus_eligible))for(const enemy of ['knight','dealer']){
   const deltas=[],pairs=[];
   for(const seed of five){
    const o={seed,enemy,archetype:'mixed',slots:[c.id,B.REF[1]],initialFocus:1,predict:'guided'};
    const spend=sample('medium',{...o,focus:'target'}),save=sample('medium',{...o,focus:'save'});
    pairs.push({seed,spend:spend.id,save:save.id,targetExposed:spend.result.targetSeen&&save.result.targetSeen});
    if(spend.result.utility!==null&&save.result.utility!==null)deltas.push(spend.result.utility-save.result.utility);
   }
   const all=pairs.flatMap(p=>[records.find(r=>r.id===p.spend),records.find(r=>r.id===p.save)]),valid=all.every(r=>['WIN','LOSS'].includes(r.result.status));
   focus.push({build,id:c.id,enemy,initialFocus:1,predict:'guided',description:'Spend on target versus reserve until target resolved, then best current marginal legal opportunity',n:five.length,exposedPairs:pairs.filter(p=>p.targetExposed).length,value:valid?B.interval(deltas):null,status:valid?'MEASURED_EXPLORATORY':'RANKING_WITHHELD',pairs});
  }
  console.log(build,'ordered pairs/triples');
  for(const p of selected.pairs)for(const order of [[0,1],[1,0]])for(const seed of five){const row=sample('medium',{seed,enemy:'knight',archetype:'mixed',slots:[p.a,p.b],openingSlots:true,order,predict:'guided',initialFocus:1,focus:'best'});orders.push({ids:[p.a,p.b],order,seed,record:row.id,actual:row.result.order,status:row.result.status});}
  const permutations=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
  for(const t of selected.triads)for(const order of permutations)for(const seed of five.slice(0,2)){const row=sample('medium',{seed,enemy:'knight',archetype:'mixed',slots:t.ids,openingSlots:true,order,predict:'guided',initialFocus:1,focus:'best'});orders.push({ids:t.ids,order,seed,record:row.id,actual:row.result.order,status:row.result.status});}
  console.log(build,'all artifacts and risk clusters');
  for(const a of Object.values(get('medium').A.catalog))for(const seed of five){
   const row=sample('medium',{seed,enemy:'dealer',archetype:'mixed',slots:['stm.passive.blazing_spirit','stm.defend.layered_shield','stm.skill.clear_choice'],artifacts:[a.id],predict:'mixed'});artifacts.push({id:a.id,seed,record:row.id});
  }
  for(const owned of [['e15','b02'],['e16','b02'],['e01','e05','b01'],['e09','e08'],['s01','e06'],['b03','e10'],['e13','s10']])for(const seed of seeds){const row=sample('medium',{seed,enemy:'dealer',archetype:'mixed',slots:['stm.passive.blazing_spirit','stm.defend.layered_shield','stm.skill.clear_choice'],artifacts:owned,predict:'mixed'});artifacts.push({ids:owned,seed,record:row.id});}
  const risk=summaries.filter(s=>s.batch==='lite_primary'&&s.summary.interaction).sort((a,b)=>Math.abs(b.summary.interaction.mean)-Math.abs(a.summary.interaction.mean)).slice(0,2);
  console.log(build,'50-seed risk expansion',risk.map(r=>r.ids));
  const fifty=Array.from({length:50},(_,i)=>710230+i);
  for(const riskCase of risk)for(const context of [{enemy:'knight',archetype:'block'},{enemy:'dealer',archetype:'attack'}])factorial(riskCase.ids,{difficulty:'medium',...context},'risk_expansion_50',fifty);
 }
 const summary={baseCommit:BASE,build,node:process.version,seeds,provenance:Object.values(engines).map(x=>x.provenance),screenCount:screen.length,distinctPairs:780,duplicatePairs:40,logicalFactorialEncounters:summaries.reduce((s,x)=>s+x.records.length,0),uniqueEngineEncounters:records.length,outcomes:records.reduce((s,r)=>(s[r.result.status]=(s[r.result.status]||0)+1,s),{}),invalid:records.filter(r=>r.result.status==='INVALID_POLICY_OR_ENGINE'),summaries,individual,focus,orders,artifacts};
 fs.writeFileSync(path.join(out,build+'-summary.json'),JSON.stringify(summary,null,2));
 fs.writeFileSync(path.join(out,build+'-encounters.jsonl.gz'),zlib.gzipSync(records.map(r=>JSON.stringify(r)).join('\n')+'\n',{level:9}));
 if(build==='candidate')fs.writeFileSync(path.join(out,'pair-screen-820.json'),JSON.stringify(screen,null,2));
 console.log(build,'DONE',summary.uniqueEngineEncounters,summary.outcomes);
 return summary;
}
if(require.main===module)run(process.argv[2]||'candidate');
module.exports={run};
