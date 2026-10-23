'use strict';
// Economy projections use real transaction owners. Combat is deliberately a
// pre-won fixture with separately declared damage budgets, NEVER a win-rate bot.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const E=require('../../dist/engine.js'),C=require('../../dist/config.js'),Eco=require('../../dist/economy.js'),A=require('../../dist/artifacts.js'),Q=require('../../dist/education.js'),X=require('../../dist/mystery.js'),K=require('../../dist/card-kit.js');
const crypto=require('node:crypto');
const out=path.resolve(__dirname,'../../docs/economy/evidence');fs.mkdirSync(out,{recursive:true});
const copy=x=>JSON.parse(JSON.stringify(x)),save=(file,x)=>fs.writeFileSync(path.join(out,file),JSON.stringify(x,null,2)+'\n');
const seeds=Array.from({length:Number(process.env.ECONOMY_HISTOGRAM_SEEDS||512)},(_,i)=>(0xec000001+Math.imul(i,104729))>>>0),routeSeeds=seeds.slice(0,Number(process.env.ECONOMY_ROUTE_SEEDS||12));
const cardMap=Object.fromEntries(K.data.cards.map(c=>[c.id,c]));
function make(seed,difficulty,support=true){return difficulty==='current'?E.newRun(seed,'challenge',3):E.newRun(seed,'challenge',3,{economy:true,difficulty,support});}
function plain(seed,difficulty,support){const r={seed,stage:0,depth:1,deck:C.STARTER.flatMap(([key,n],j)=>Array.from({length:n},(_,i)=>({uid:'c'+(j*10+i+1),key,upgraded:false}))),artifactState:{owned:[]}};Eco.init(r,{difficulty,support});return r;}
function wilson(k,n){const z=1.95996398454,p=k/n,a=z*z/n,c=(p+a/2)/(1+a),h=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/(1+a);return [c-h,c+h];}
const histograms=[],samples=[];
for(const difficulty of ['easy','medium','hard'])for(const stage of [0,1])for(const source of ['normal','elite','shop','ME03','ME12'])for(const support of [false,true]){
 const h={difficulty,stage:stage+1,source,support,seeds:seeds.length,slots:0,byRarity:{common:0,uncommon:0,rare:0},firstRarity:{common:0,uncommon:0,rare:0},byCategory:{attack:0,defend:0,skill:0,passive:0},byCard:{},ownedCopies:{unowned:0,one:0,twoPlus:0},supported:0,duplicateOfferViolations:0,saleViolations:0};
 for(const [i,seed]of seeds.entries()){
  const r=plain(seed,difficulty,support);r.stage=stage;r.depth=i%2?1:6;
  // Same reference deck in both arms, including one owned Passive to exercise the .15 factor.
  r.deck.push({uid:'c99',key:'stm.passive.grimoire_ward',upgraded:false});
  const before=JSON.stringify(r.deck),o=Eco.cards(r,source,{nodeId:'histogram'});assert.equal(JSON.stringify(r.deck),before);
  assert.equal(new Set(o.ids).size,o.ids.length);assert.equal(o.ids.length,source==='shop'?6:3);
  if(source==='shop')assert.ok(Number.isInteger(o.saleIndex)&&o.saleIndex>=0&&o.saleIndex<6);
  if(source==='ME03')assert.ok(o.ids.every(id=>cardMap[id].category==='skill'));
  for(const [slot,id]of o.ids.entries()){const c=cardMap[id],factor=o.factors.find(f=>f.id===id),owned=r.deck.filter(c=>c.key===id).length;h.slots++;h.byRarity[c.rarity]++;if(slot===0)h.firstRarity[c.rarity]++;h.byCategory[c.category]++;h.byCard[id]=(h.byCard[id]||0)+1;h.ownedCopies[owned===0?'unowned':owned===1?'one':'twoPlus']++;if(factor.supportScore>0)h.supported++;assert.ok(factor.weight>0);assert.equal(factor.combatPower,null);}
  if(i===0&&support&&difficulty==='medium')samples.push(o);
 }
 const weights=Eco.data.economy.rarity_weights[(source==='shop'?'shop':source==='elite'?'elite':'normal')+'_s'+(stage+1)];
 h.firstRarityChecks=Object.entries(weights).map(([rarity,w])=>{const target=w/100,observed=h.firstRarity[rarity]/h.seeds,tolerance=4*Math.sqrt(target*(1-target)/h.seeds)+.01;assert.ok(Math.abs(observed-target)<=tolerance,JSON.stringify({difficulty,source,stage,rarity,target,observed,tolerance}));return {rarity,target,observed,wilson95:wilson(h.firstRarity[rarity],h.seeds),tolerance};});
 histograms.push(h);
}
save('offer_histograms.json',histograms);save('sample_offer_receipts.json',samples);
const ab=histograms.filter(h=>h.support).map(h=>{const unweighted=histograms.find(x=>!x.support&&x.stage===h.stage&&x.source===h.source&&x.difficulty===h.difficulty);return {difficulty:h.difficulty,stage:h.stage,source:h.source,seeds:h.seeds,supportedOfferSlotsWithWeight:h.supported,supportedOfferSlotsWithoutWeight:unweighted.supported,totalSlots:h.slots,deltaFraction:(h.supported-unweighted.supported)/h.slots,firstRarityWithWeight:h.firstRarity,firstRarityWithoutWeight:unweighted.firstRarity};});save('support_weighting_ab.json',ab);
console.log(JSON.stringify({phase:'histograms',cohorts:histograms.length,offerSeeds:seeds.length,offers:histograms.reduce((n,h)=>n+h.seeds,0),slots:histograms.reduce((n,h)=>n+h.slots,0)}));
function freeClaim(r){const ids=E.artifactChoices(r).map(a=>a.id);if(!ids.length)return;E.chooseArtifact(r,ids[0]);if(Q.current(r)){E.selectEducation(r,Q.current(r).correctChoiceId);E.answerEducation(r);}E.continueEducation(r);}
function plan(r,policy){const map=E.getMap(r),byId=Object.fromEntries(map.nodes.map(n=>[n.id,n])),memo={};
 const score=n=>n.type==='elite'?(policy==='elite_value'?20:-1000):n.type==='shop'?(policy==='saver'?-5:6):n.type==='camp'?8:0;
 function best(n){if(memo[n.id])return memo[n.id];let tail={score:0,path:[]};const choices=n.next.map(id=>best(byId[id])).sort((a,b)=>b.score-a.score||a.path.join().localeCompare(b.path.join()));if(choices.length)tail=choices[0];return memo[n.id]={score:score(n)+tail.score,path:[n.id,...tail.path]};}
 return E.availableNodes(r).map(best).sort((a,b)=>b.score-a.score||a.path.join().localeCompare(b.path.join()))[0].path;
}
const budgets={conditional_all_fights_won:{battle:0,elite:0,boss:0},moderate:{battle:4,elite:8,boss:12},severe:{battle:7,elite:14,boss:20}};
function simulate(seed,difficulty,policy,budgetName){
 const r=make(seed,difficulty),rows=[],counts={battle:0,elite:0,boss:0,shop:0,camp:0,event:0},stats={spent:0,earned:0,artifactGold:0,eventGoldNet:0,actualRecovery:0,wastedRecovery:0,modeledDamage:0,cardsBought:0,artifactsBought:0,removals:0,shopAffordability:[],freeCardPicks:0,skips:0};
 const startingGold=r.gold;let status='CONDITIONAL_FLOW_COMPLETE',stage=0;
 if(r.scene==='master'){const before=r.gold,hp=r.hp;freeClaim(r);stats.artifactGold+=r.gold-before;stats.actualRecovery+=r.hp-hp;}
 function transact(kind,fn,price=0){const before={gold:r.gold,hp:r.hp,deck:r.deck.length},oldOwned=A.owned(r).map(a=>a.id);fn();const purseGained=!oldOwned.includes(A.id('s09'))&&A.has(r,'s09')?25:0;stats.spent+=price;stats.artifactGold+=purseGained;assert.equal(r.gold-before.gold,-price+purseGained);rows.push({kind,stage:r.stage+1,node:r.route?.active,goldBefore:before.gold,goldAfter:r.gold,paid:price,purseGained,deck:r.deck.length,hp:r.hp});}
 function fight(type){
  const damage=budgets[budgetName][type],b=r.battle;stats.modeledDamage+=damage;
  if(r.hp<=damage){status='MODEL_HP_BUDGET_EXHAUSTED';rows.push({kind:'modeled_damage_stop',stage:r.stage+1,node:r.route.active,hpBefore:r.hp,assumedDamage:damage});return false;}
  r.hp-=damage;const hp=r.hp,before=r.gold;b.hp=1;b.enemyBlock=0;b.seals=C.enemies[b.enemyId].seals?.length||0;
  // Fixture settlement, not a combat policy: make a real owned Rune Strike playable.
  let card=b.hand.find(c=>c.key==='stm.attack.rune_strike');if(!card){const i=b.draw.findIndex(c=>c.key==='stm.attack.rune_strike');assert.ok(i>=0);[b.hand[0],b.draw[i]]=[b.draw[i],b.hand[0]];card=b.hand[0];}
  E.playCard(r,card.uid);stats.earned+=r.gold-before;stats.actualRecovery+=r.hp-hp;rows.push({kind:'prewon_fight_settlement',type,stage:r.stage+1,node:r.route.active,assumedDamage:damage,goldBefore:before,goldAfter:r.gold,hp:r.hp,lootIds:r.rewards.slice()});
  if(r.scene==='reward'){const pick=r.rewards.find(id=>r.deck.filter(c=>c.key===id).length<1),chosen=r.deck.length<28?(pick||null):null;E.chooseReward(r,chosen);stats[chosen?'freeCardPicks':'skips']++;if(r.artifactState?.offer?.ready)freeClaim(r);}
  return true;
 }
 function eventRoom(){
  let p=r.mysteryState.pending;if(p.phase==='empty'){E.continueMystery(r);return true;}
  const now=1000000+r.stage*100000+r.depth*1000;E.startMystery(r,[],null,now);p=r.mysteryState.pending;if(p.phase==='empty'){E.continueMystery(r);return true;}
  const q=Q.catalog[p.questionId],success=((Math.imul(seed^r.stage^r.depth,2654435761)>>>0)%100)<75;
  E.answerMystery(r,success?q.correctChoiceId:q.choices.find(c=>c.id!==q.correctChoiceId).id,now+1);
  const oldGold=r.gold,oldHp=r.hp;E.continueMystery(r);
  if(r.scene==='event'&&r.mysteryState.pending?.phase==='reward'){
   const options=X.definition(r).success.options.filter(o=>X.actionable(r,o));
   const o=options.find(o=>o.id==='heal'&&r.maxHp-r.hp>=5)||options.find(o=>['gold','scholar_reward','claim_gold','banish','time_gift','strength'].includes(o.id))||options[0];
   if(o){E.selectMysteryOption(r,o.id);const offer=r.mysteryState.pending.offers[o.id],target=offer.cards?.[0]||X.targets(r,o)[0];if(target)E.selectMysteryTarget(r,target);E.claimMystery(r);}else E.leaveMystery(r);
  }
  stats.eventGoldNet+=r.gold-oldGold;stats.actualRecovery+=Math.max(0,r.hp-oldHp);stats.modeledDamage+=Math.max(0,oldHp-r.hp);
  rows.push({kind:'event',stage:r.stage+1,eventId:p.eventId,scriptedCorrect:success,goldBefore:oldGold,goldAfter:r.gold,hpBefore:oldHp,hpAfter:r.hp});
  if(r.scene==='battle')return fight('battle');return true;
 }
 while(!['victory'].includes(r.scene)&&status==='CONDITIONAL_FLOW_COMPLETE'){
  const route=plan(r,policy);assert.equal(route.length,10);
  for(const id of route){
   const node=E.availableNodes(r).find(n=>n.id===id);assert.ok(node);counts[node.type]++;E.enterNode(r,id);
   if(r.scene==='battle'){if(!fight(node.type))break;}
   else if(r.scene==='shop'){
    const quotes=r.shop.offers.map(o=>E.shopPrice(r,o));stats.shopAffordability.push({stage:r.stage+1,node:id,gold:r.gold,cheapestCard:Math.min(...quotes),affordableCards:quotes.filter(p=>p<=r.gold).length,canAffordRemoval:r.deck.length>10&&E.shopRemovalPrice(r)<=r.gold});
    const buySale=()=>{const i=r.shop.offers.findIndex((o,i)=>o.sale&&!r.shop.bought.includes(i));if(i>=0&&E.shopPrice(r,r.shop.offers[i])<=r.gold){const price=E.shopPrice(r,r.shop.offers[i]);transact('buy_sale',()=>E.buyCard(r,i),price);stats.cardsBought++;}};
    const artifact=()=>{const i=r.shop.artifacts.map((o,i)=>({o,i})).filter(({o,i})=>o.id&&!r.shop.artifactBought.includes(i)&&E.shopPrice(r,o)<=r.gold).sort((a,b)=>({boss:3,elite_mystery:2,starting:1}[b.o.tier])-({boss:3,elite_mystery:2,starting:1}[a.o.tier]))[0]?.i;if(i!==undefined){const price=E.shopPrice(r,r.shop.artifacts[i]);transact('buy_artifact',()=>E.buyArtifact(r,i),price);stats.artifactsBought++;}};
    if(policy==='elite_value')artifact();buySale();
    if(policy!=='saver'&&r.deck.length>10&&E.shopRemovalPrice(r)<=r.gold-20){const card=r.deck.find(c=>c.key==='stm.attack.weak_point')||r.deck.find(c=>c.key!=='stm.attack.rune_strike'),price=E.shopRemovalPrice(r);transact('remove',()=>E.removeShopCard(r,card.uid),price);stats.removals++;}
    if(policy==='safe_shop')artifact();E.leaveShop(r);
   }else if(r.scene==='camp'){const hp=r.hp,amount=E.restHeal(r);E.camp(r,'heal');stats.actualRecovery+=r.hp-hp;stats.wastedRecovery+=amount-(r.hp-hp);rows.push({kind:'rest',stage:r.stage+1,node:id,hpBefore:hp,hpAfter:r.hp,requested:amount});}
   else if(r.scene==='event'&&!eventRoom())break;
   if(r.scene==='stageclear'){const hp=r.hp;if(r.artifactState?.offer?.ready)freeClaim(r);else E.nextStage(r);stats.actualRecovery+=r.hp-hp;stage++;}
   if(r.scene==='victory')break;
   assert.ok(E.validate(r),'valid after '+node.type+' '+seed+' '+difficulty);
  }
  if(status!=='CONDITIONAL_FLOW_COMPLETE'||r.scene==='victory')break;
  assert.equal(r.stage,stage);assert.equal(stage,1);
 }
 assert.equal(r.gold,startingGold+stats.earned+stats.artifactGold+stats.eventGoldNet-stats.spent,'Gold conservation');
 return {seed,difficulty,policy,budgetName,status,conditionalVictory:r.scene==='victory',startingGold,finalGold:r.gold,finalHp:r.hp,maxHp:r.maxHp,finalDeck:r.deck.length,artifacts:A.owned(r).length,counts,stats,rows};
}
const routeRuns=[];
for(const difficulty of ['current','easy','medium','hard']){
 for(const policy of ['safe_shop','elite_value','saver'])for(const budgetName of Object.keys(budgets))for(const seed of routeSeeds)routeRuns.push(simulate(seed,difficulty,policy,budgetName));
 console.log(JSON.stringify({phase:'route_projection',difficulty,cases:routeRuns.filter(r=>r.difficulty===difficulty).length}));
}
const groups=[];
for(const difficulty of ['current','easy','medium','hard'])for(const policy of ['safe_shop','elite_value','saver'])for(const budgetName of Object.keys(budgets)){
 const xs=routeRuns.filter(r=>r.difficulty===difficulty&&r.policy===policy&&r.budgetName===budgetName),mean=fn=>xs.reduce((n,x)=>n+fn(x),0)/xs.length;
 groups.push({difficulty,policy,budgetName,cases:xs.length,conditionalFlowCompleted:xs.filter(x=>x.conditionalVictory).length,modelBudgetDepleted:xs.filter(x=>x.status==='MODEL_HP_BUDGET_EXHAUSTED').length,meanFinalGold:mean(x=>x.finalGold),minFinalGold:Math.min(...xs.map(x=>x.finalGold)),maxFinalGold:Math.max(...xs.map(x=>x.finalGold)),meanSpent:mean(x=>x.stats.spent),meanRecovery:mean(x=>x.stats.actualRecovery),meanFinalHp:mean(x=>x.finalHp),meanFinalDeck:mean(x=>x.finalDeck),meanCardsBought:mean(x=>x.stats.cardsBought),meanArtifactsBought:mean(x=>x.stats.artifactsBought),meanRemovals:mean(x=>x.stats.removals),meanElites:mean(x=>x.counts.elite),shopVisits:xs.reduce((n,x)=>n+x.stats.shopAffordability.length,0),noAffordableCardVisits:xs.reduce((n,x)=>n+x.stats.shopAffordability.filter(s=>!s.affordableCards).length,0)});
}
save('route_cashflow_runs.json',routeRuns);save('route_projection_summary.json',groups);
const runtimeHashes=Object.fromEntries(['economy-data.js','economy.js','engine.js','artifacts.js','mystery.js','config.js','card-data.js','card-combat.js','education.js','map.js'].map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname,'../../dist',file))).digest('hex')]));
save('simulation_manifest.json',{runtimeFileSha256:runtimeHashes,baseCommit:Eco.data.baseCommit,economyVersion:Eco.data.version,seedGeneration:'(0xec000001 + imul(i,104729)) >>> 0',histogramSeeds:seeds,routeSeeds,budgets,routeCases:routeRuns.length,histogramCohorts:histograms.length,answerTimeMilliseconds:1,offerReferenceDeck:'fixed 12-card starter plus one owned Grimoire Ward',offerReferenceDepths:[1,6],claims:'Economy/transaction evidence only. These are not engine combat policy simulations or student win rates.',assumptions:['HP baseline 60 in every profile, baseline artifact/card/enemy effects.','Combat fixture: pay declared damage budget, set enemy HP=1, open seals and settle a real owned Rune Strike; no combat skill/turn claims.','All artifact questions scripted correct; Mystery question answers scripted 75% threshold, instant scripted answer time (1 ms).','Route policies safe_shop/elite_value/saver are fixed graph preferences, not measured Map CP.','Conditional Gold assumes every fight won; moderate/severe sensitivity stops at MODEL_HP_BUDGET_EXHAUSTED.','Event buff/card power benefits are not converted into reduced modeled damage.','Current-mode comparison retains existing offers/prices/healing and may acquire different artifacts under its RNG.']});
console.log(JSON.stringify({status:'ECONOMY_PROJECTION_COMPLETE_NOT_A_STUDENT_WIN_RATE',routeCases:routeRuns.length,seedCount:routeSeeds.length}));
