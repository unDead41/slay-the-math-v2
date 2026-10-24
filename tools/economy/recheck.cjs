'use strict';
// Current Master binding only. Policy/tag scores remain heuristics, never measured CP.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib');
const {loadMaster,ROOT}=require('../balance/master/loader.cjs');
const T=require('./deep-common.cjs'),{createReplay}=require('../balance/map/replay.cjs'),{createDeckPolicy}=require('../ai-playtester/deck-policy.cjs'),{createAgent}=require('../ai-playtester/agent.cjs');
const clone=x=>JSON.parse(JSON.stringify(x)),difficulties=['easy','medium','hard'],policies=['synergy','sale_only','artifact_first','removal_first','reserve','saver'];
const sources=['normal','elite','shop','ME03','ME12','ME04'],modes=['correct_fast','wrong_correct','wrong_wrong','correct_55s','timeout_exact','wrong_timeout','abandon','skip_before','decline'];
const OUT=path.join(ROOT,'docs/economy/recheck-20261024');
function save(name,value){fs.mkdirSync(OUT,{recursive:true});const bytes=Buffer.from(JSON.stringify(value,null,2)+'\n');fs.writeFileSync(path.join(OUT,name),name.endsWith('.gz')?zlib.gzipSync(bytes,{mtime:0}):bytes);}
function place(x,r,type,stage=0){r.stage=stage;r.route=x.G.begin(stage,r.seed,3);r.scene='map';r.battle=null;r.shop=null;r.rewards=[];const nodes=x.E.getMap(r).nodes,n=nodes.find(n=>n.type===type);assert.ok(n,'fixture node '+type);let p=[n];for(let d=n.depth-1;d>=0;d--)p.unshift(nodes.find(v=>v.depth===d&&v.next.includes(p[0].id)));r.depth=n.depth;r.route.path=p.slice(0,-1).map(v=>v.id);r.cleared=r.route.path.slice();return n;}
function settleGift(x,r,{wrongFirst=false,fail=false,key=x.E.artifactChoices(r)[0]?.id}={}){
 const before=clone(r.artifactState.owned);x.E.chooseArtifact(r,key);const q=x.Q.current(r);let attempts=0;
 if(q){const wrong=q.choices.filter(c=>c.id!==q.correctChoiceId);if(wrongFirst||fail){x.E.selectEducation(r,wrong[0].id);x.E.answerEducation(r);attempts++;assert.equal(x.Q.ready(r),false);assert.ok(x.E.restore(r));}
  x.E.selectEducation(r,fail?wrong[1].id:q.correctChoiceId);x.E.answerEducation(r);attempts++;assert.deepEqual(r.artifactState.owned,before);assert.ok(x.E.restore(r));}
 x.E.continueEducation(r);assert.equal(x.A.has(r,key),!fail);assert.ok(x.E.restore(r));assert.throws(()=>x.E.continueEducation(r));return {key,attempts,claimed:!fail};
}
function room(x,type,seed=19,stage=0){const r=x.E.newRun(seed,'learn');x.E.enterNode(r,place(x,r,type,stage).id);return r;}
function offerStudy(seeds,{fixtureNames=T.fixtureNames}={}){
 const rows=[],samples=[],checks={violations:0,offers:0,slots:0,receiptReplays:0,firstRarityComparisons:0};let binding;
 for(const difficulty of difficulties){const x=loadMaster({difficulty});binding??=x.binding.identity;const data=Object.fromEntries(x.data.cards.map(c=>[c.id,c]));
 for(const fixture of fixtureNames)for(const source of sources){const rarityOff=[];
 for(const support of [false,true]){
  const row={difficulty,fixture,source,support,offers:0,slots:0,actionableSlots:0,allProxyRejected:0,conditionalSlots:0,supportedConditionalSlots:0,thirdCopySlots:0,ownedPassiveSlots:0,upgradeOpportunities:0,firstRarity:{},categories:{},byCard:{}};
  for(const [ci,ctx]of T.contexts.entries())for(const [i,seed]of seeds.entries()){
   const r={seed,stage:ctx.stage,depth:ctx.depth,seq:T.fixtureDecks[fixture].length,deck:T.fixtureDecks[fixture].map((key,j)=>({uid:'c'+(j+1),key,upgraded:fixture==='upgraded_mixed'})),rng:(seed^0x1234)>>>0,artifactState:{owned:[]},educationState:{rng:(seed^0x5678)>>>0,runUsedIds:[]}};x.Eco.init(r,{difficulty,support});
   const original=r.deck[i%r.deck.length],options=source==='ME04'?{nodeId:'current-offer',category:data[original.key].category,exclude:[original.key],ordinal:1}:{nodeId:'current-offer'};
   const before=JSON.stringify({deck:r.deck,rng:r.rng,q:r.educationState}),o=x.Eco.cards(r,source,options);assert.equal(new Set(o.ids).size,o.ids.length);assert.ok(x.Eco.valid(r));
   if(source==='ME03')assert.ok(o.ids.every(id=>data[id].category==='skill'));
   if(source==='ME04')assert.ok(o.ids.every(id=>data[id].category===data[original.key].category&&id!==original.key));
   if(source==='shop')assert.ok(o.ids.length===6&&Number.isInteger(o.saleIndex)&&o.saleIndex>=0&&o.saleIndex<6);
   const rarity=data[o.ids[0]].rarity,ix=ci*seeds.length+i;if(!support)rarityOff[ix]=rarity;else{assert.equal(rarity,rarityOff[ix]);checks.firstRarityComparisons++;}
   let useful=0;for(const id of o.ids){const c=data[id],f=o.factors.find(f=>f.id===id),copies=r.deck.filter(v=>v.key===id).length,ownedPassive=c.category==='passive'&&copies>0,ready=!f.requirements.length||f.supportScore===1,actionable=ready&&!ownedPassive&&copies<2;
    useful+=Number(actionable);row.slots++;row.actionableSlots+=Number(actionable);row.conditionalSlots+=Number(f.requirements.length>0);row.supportedConditionalSlots+=Number(f.requirements.length>0&&ready);row.thirdCopySlots+=Number(copies>=2);row.ownedPassiveSlots+=Number(ownedPassive);row.upgradeOpportunities+=Number(o.upgraded&&r.deck.some(v=>v.key===id&&!v.upgraded));row.categories[c.category]=(row.categories[c.category]||0)+1;row.byCard[id]=(row.byCard[id]||0)+1;assert.ok(f.weight>0);assert.equal(f.combatPower,null);
   }
   row.firstRarity[rarity]=(row.firstRarity[rarity]||0)+1;row.offers++;row.allProxyRejected+=Number(!useful);assert.equal(JSON.stringify({deck:r.deck,rng:r.rng,q:r.educationState}),before);
   const frozen=clone(o);r.deck.push({uid:'c99',key:'stm.passive.clear_mind',upgraded:false});assert.deepEqual(x.Eco.cards(r,source,options),frozen);checks.receiptReplays++;if(i===0&&ci===2&&difficulty==='medium'&&support)samples.push(o);
  }
  checks.offers+=row.offers;checks.slots+=row.slots;rows.push(row);
 }
 }}return {binding,checks,rows,samples,interpretation:'Requirement/ownership proxy, not CP; current Master cards/requirements and source filtering. Contexts='+JSON.stringify(T.contexts)};
}
function eventCase(x,{id,seed=19,mode='correct_fast',option=null,hp=40,gold=100}){
 const r=x.E.newRun(seed,'challenge');settleGift(x,r);r.hp=Math.min(hp,r.maxHp);r.gold=gold;const n=place(x,r,'event');x.X.ensure(r).usedEventIds=x.X.data.events.filter(e=>e.id!==id).map(e=>e.id);x.E.enterNode(r,n.id);const before={hp:r.hp,maxHp:r.maxHp,gold:r.gold,deck:r.deck.length,artifacts:x.A.owned(r).length,exposures:r.educationState.runUsedIds.length};const row={difficulty:x.difficulty,id,seed,mode,requestedOption:option,inputHp:r.hp,inputGold:gold,option:null,outcome:'DECLINED',attempts:0,questionId:null,durationMs:null};
 if(r.mysteryState.pending.phase==='empty'){row.outcome='UNAVAILABLE';x.E.continueMystery(r);}else if(mode==='skip_before'){x.E.leaveMystery(r);}else{
  const now=100000;x.E.startMystery(r,[],null,now);const p=r.mysteryState.pending;row.durationMs=p.deadline-now;const q=x.Q.catalog[p.questionId];row.questionId=q.id;const wrong=q.choices.filter(c=>c.id!==q.correctChoiceId);
  if(mode==='abandon')x.E.leaveMystery(r,now+1000);
  else if(['wrong_correct','wrong_wrong','wrong_timeout'].includes(mode)){
   x.E.answerMystery(r,wrong[0].id,now+1000);row.attempts++;assert.equal(r.mysteryState.pending.phase,'question');const restored=x.E.restore(r);assert.ok(restored);assert.equal(restored.mysteryState.pending.deadline,p.deadline);
   x.E.answerMystery(r,mode==='wrong_wrong'?wrong[1].id:q.correctChoiceId,mode==='wrong_timeout'?p.deadline:now+2000);row.attempts++;
  }else{x.E.answerMystery(r,q.correctChoiceId,mode==='timeout_exact'?p.deadline:now+(mode==='correct_55s'?55000:1000));row.attempts++;}
  row.outcome=r.mysteryState.pending.outcome;assert.ok(row.outcome);x.E.continueMystery(r);
  if(r.scene==='event'&&r.mysteryState.pending.phase==='reward'){
   const allowed=x.X.definition(r).success.options.filter(o=>x.X.actionable(r,o)),o=option?allowed.find(o=>o.id===option):allowed[0];
   if(!o||mode==='decline')x.E.leaveMystery(r);else{
    row.option=o.id;x.E.selectMysteryOption(r,o.id);let targets=x.X.targets(r,o);const offer=r.mysteryState.pending.offers[o.id];if(offer.cards)targets=targets.filter(t=>offer.cards.includes(t));if(targets.length)x.E.selectMysteryTarget(r,targets[0]);x.E.claimMystery(r);
   }
  }
 }
 row.submittedAnswers=row.attempts;row.attempts=row.questionId?x.Q.getSession(r).records[row.questionId].attempts.length:0;row.goldDelta=r.gold-before.gold;row.hpDelta=r.hp-before.hp;row.maxHpDelta=r.maxHp-before.maxHp;row.deckDelta=r.deck.length-before.deck;row.artifactDelta=x.A.owned(r).length-before.artifacts;row.exposed=r.educationState.runUsedIds.length-before.exposures;row.scene=r.scene;row.modifiers=clone(r.mysteryState.nextCombat);assert.ok(x.E.restore(r));const once=clone(r);assert.throws(()=>x.E.claimMystery(r));assert.deepEqual(r,once);return row;
}
function eventStudy(seeds){const rows=[],bounds=[],profiles={},events=[],prices=[];
 for(const difficulty of difficulties){const x=loadMaster({difficulty}),r=x.E.newRun(19,'learn');profiles[difficulty]=clone(r.economyState.profile);
 for(const e of x.X.data.events){events.push({difficulty,id:e.id,definition:x.Eco.eventDefinition(r,e)});
  for(const mode of modes)for(const seed of seeds){for(const option of mode==='correct_fast'?e.success.options.map(o=>o.id):[null])rows.push(eventCase(x,{id:e.id,mode,seed,option}));}
  for(const hp of [1,10,r.maxHp-1,r.maxHp])for(const gold of [0,30,100])for(const seed of seeds.slice(0,2))bounds.push(eventCase(x,{id:e.id,hp,gold,seed}));
 }
 for(const [rarity,base]of Object.entries(x.Eco.data.economy.card_prices_by_rarity))for(const sale of [false,true])prices.push({difficulty,kind:'card',rarity,base,sale,price:x.Eco.quote(r,base,{sale}).value});
 for(const [tier,base]of Object.entries(x.Eco.data.economy.artifact_prices))prices.push({difficulty,kind:'artifact',tier,base,price:x.Eco.quote(r,base).value});
 }return {rows,bounds,events,profiles,prices};
}
function spendingPolicy(x,name){const base=createDeckPolicy(x);return {...base,shop(r){
 if(name==='saver')return {kind:'leave',reason:'saver'};
 if(name==='sale_only'){const i=r.shop.offers.findIndex((o,i)=>o.sale&&!r.shop.bought.includes(i)&&x.E.shopPrice(r,o)<=r.gold);return i>=0&&r.deck.length<60?{kind:'card',index:i,reason:'single_sale'}:{kind:'leave',reason:'no_affordable_sale'};}
 if(name==='removal_first'&&!r.shop.removed&&r.deck.length>10&&x.E.shopRemovalPrice(r)<=r.gold){const d=base.remove(r);if(d.uid)return {...d,kind:'remove',reason:'paid_removal_first'};}
 if(name==='artifact_first'&&r.shop.artifactBought.length===0){const options=r.shop.artifacts.map((o,index)=>({o,index,price:o.id?x.E.shopPrice(r,o):Infinity})).filter(v=>v.o.id&&!x.A.has(r,v.o.id)&&v.price<=r.gold).sort((a,b)=>a.price-b.price||a.index-b.index);if(options[0])return {kind:'artifact',index:options[0].index,reason:'lowest_affordable_artifact_first'};}
 const d=base.shop(r);if(name==='reserve'&&d.kind!=='leave'){const price=d.kind==='remove'?x.E.shopRemovalPrice(r):x.E.shopPrice(r,(d.kind==='card'?r.shop.offers:r.shop.artifacts)[d.index]);if(r.gold-price<(r.stage===0?80:35))return {kind:'leave',reason:'stage_gold_reserve'};}
 return d;
 }};}
function campaign(task,cache=new Map()){
 if(!cache.has(task.difficulty)){const x=loadMaster(task);cache.set(task.difficulty,{x,replay:createReplay(x),agent:createAgent(x,{skill:'intermediate'})});}
 const {x,replay,agent}=cache.get(task.difficulty);let transactions=0,reloads=0,lastRun;
 const result=replay.runCampaign({runSeed:task.seed,difficulty:task.difficulty,predictProfile:task.predict,routePolicy:task.route,telemetry:true,trace:task.sample,limits:task.limits,deckPolicy:spendingPolicy(x,task.policy),combatAgent:r=>agent.decide(r),combatChoice:r=>agent.choose(r),agentVersion:agent.version,observeAction(r,fn){
  const s=r?.scene,shop=s==='shop'?clone(r.shop):null,before=s==='shop'?{gold:r.gold,prices:shop.offers.map(o=>x.E.shopPrice(r,o)),artifactPrices:shop.artifacts.map(o=>o.id?x.E.shopPrice(r,o):null),owned:x.A.owned(r).map(a=>a.id),removal:x.E.shopRemovalPrice(r),rng:r.rng,q:r.educationState?.rng}:null;
  const out=fn();lastRun=r;if(before&&r.shop){
   const cards=r.shop.bought.filter(i=>!shop.bought.includes(i)),arts=r.shop.artifactBought.filter(i=>!shop.artifactBought.includes(i)),removed=!shop.removed&&r.shop.removed;
   if(cards.length||arts.length||removed){let spent=cards.reduce((n,i)=>n+before.prices[i],0)+arts.reduce((n,i)=>n+before.artifactPrices[i],0)+(removed?before.removal:0),earned=x.A.owned(r).filter(a=>!before.owned.includes(a.id)).reduce((n,a)=>n+(a.values.gold||0),0);assert.equal(r.gold-before.gold,earned-spent);assert.deepEqual(r.shop.offers,shop.offers);assert.deepEqual(r.shop.artifacts,shop.artifacts);assert.equal(r.rng,before.rng);assert.equal(r.educationState?.rng,before.q);assert.ok(x.E.restore(r));transactions++;reloads++;}
  }return out;
 }});
 assert.ok(['VICTORY','DEFEAT','BENCHMARK_LIMIT_CENSORED'].includes(result.status),result.error||result.status);assert.ok(x.E.validate(lastRun),'final engine state including censored cases');assert.equal(result.invalidStates,0);assert.equal(result.final.gold,x.binding.profile.starting_gold+result.metrics.goldEarned-result.metrics.goldSpent);
 return {...task,provenance:x.provenance,...result,economyChecks:{transactions,reloads},interpretation:'Real combat/resolver and official intermediate agent; declared acquisition policies; synthetic answers and no pupil calibration.'};
}
function manifest(){const x=loadMaster({difficulty:'medium'}),files=new Set([...x.sourceFiles,'dist/balance.js','dist/balance-data.js','tools/balance/master/config.json','tools/balance/master/loader.cjs','tools/economy/recheck.cjs',...['replay.cjs','policy.cjs','structure.cjs','config.json'].map(n=>'tools/balance/map/'+n),...['telemetry.cjs','route-policy.cjs','question-policy.cjs'].map(n=>'tools/balance/map-advanced/'+n),'tools/ai-playtester/agent.cjs','tools/ai-playtester/deck-policy.cjs']),hashes={};for(const f of [...files].sort())hashes[f]=crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,f))).digest('hex');return {mainAtStart:'50d3af423cdc2240e949f4ddf29e023865304b65',previousEconomy:'df53579593937c2d71fcb6bb96409036ad575070',date:'2026-10-24',binding:x.binding.identity,hashes,offerSeeds:T.seeds(128),campaignSeeds:T.seeds(100),eventSeeds:T.seeds(8),policies,pupilWinRatesMeasured:false};}
if(require.main===module){const phase=process.argv[2];if(phase==='offers'){save('offers.json.gz',offerStudy(T.seeds(128)));console.log('offer study complete');}else if(phase==='events'){save('events.json.gz',eventStudy(T.seeds(8)));console.log('event study complete');}else if(phase==='manifest')save('manifest.json',manifest());else throw Error('Use offers/events/manifest; campaign runner uses Worker task API.');}
module.exports={offerStudy,eventStudy,eventCase,settleGift,room,place,spendingPolicy,campaign,manifest,policies,difficulties,sources,modes,save,OUT};
