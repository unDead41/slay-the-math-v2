'use strict';
// Conditional financial model. Combat outcome and HP costs are declared fixtures.
const assert=require('node:assert/strict');
const T=require('./deep-common.cjs'),{E,C,Eco,A,cards,describeCard,hash}=T;
const GAME_MAX_ATTEMPTS=require('../../dist/mechanics.js').session.GAME_MAX_ATTEMPTS;
const Q=require('../../dist/education.js'),X=require('../../dist/mystery.js'),G=require('../../dist/map.js');
const policies=['sale_only','tag_support','artifact_first','removal_first','reserve','saver'];
const answerProfiles={struggling:{accuracy:.4,responseMs:55000},developing:{accuracy:.6,responseMs:35000},proficient:{accuracy:.8,responseMs:15000},strong:{accuracy:.95,responseMs:15000}};
const budgets={moderate:{battle:4,elite:8,boss:12},severe:{battle:7,elite:14,boss:20}};
function prefersArtifact(a){return a.values.discount_percent?4:a.values.heal&&a.trigger==='combat_won'?3:a.values.max_hp?2:a.values.gold?1:0;}
function giftKey(r){return E.artifactChoices(r).slice().sort((a,b)=>prefersArtifact(b)-prefersArtifact(a)||a.id.localeCompare(b.id))[0]?.id;}
function claimGift(r,answer,key=E.artifactChoices(r)[0]?.id){
 if(!key)return {attempts:0,wrongAttempts:0,claimsBeforeCorrect:0,timeMs:0,claimed:false};
 const before=A.owned(r).length;E.chooseArtifact(r,key);const q=Q.current(r);let attempts=0,wrongAttempts=0;
 if(q){
  const wrong=q.choices.filter(c=>c.id!==q.correctChoiceId).map(c=>c.id);
  for(let attempt=0;attempt<GAME_MAX_ATTEMPTS&&!Q.ready(r);attempt++){
   const correct=hash(r.seed,'artifact|'+r.stage+'|'+r.route.active+'|'+key+'|'+attempt)/4294967296<answer.accuracy;
   E.selectEducation(r,correct?q.correctChoiceId:wrong[wrongAttempts]);E.answerEducation(r);attempts++;
   assert.equal(A.owned(r).length,before,'preview/answer cannot grant gift');
   if(correct)break;wrongAttempts++;
  }
 }
 const claimed=!q||r.educationState.pending.solved;E.continueEducation(r);assert.equal(A.has(r,key),claimed);
 return {attempts,wrongAttempts,claimsBeforeCorrect:0,timeMs:attempts*answer.responseMs,claimed};
}
function removalTarget(r){
 const counts=r.deck.reduce((a,c)=>(a[c.key]=(a[c.key]||0)+1,a),{});
 return r.deck.filter(c=>!(c.key==='stm.attack.rune_strike'&&counts[c.key]===1)).sort((a,b)=>counts[b.key]-counts[a.key]||Number(a.upgraded)-Number(b.upgraded)||a.uid.localeCompare(b.uid))[0];
}
function upgradeTarget(r){return r.deck.filter(c=>E.canUpgrade(c)).sort((a,b)=>Number(cards[b.key].category==='passive')-Number(cards[a.key].category==='passive')||a.uid.localeCompare(b.uid))[0];}
function restDecision(r,policy){
 const card=upgradeTarget(r),missing=r.maxHp-r.hp,threshold=policy==='saver'?1:Math.ceil(E.restHeal(r)*.75);
 return !card||missing>=threshold||r.hp<=Math.ceil(r.maxHp*.4)?{action:'heal'}:{action:'upgrade',uid:card.uid};
}
function shopDecision(r,policy){
 if(policy==='saver')return null;
 const reserve=policy==='reserve'?(r.stage===0?80:35):policy==='tag_support'?20:0;
 const spendable=Math.max(0,r.gold-reserve);
 const removable=!r.shop.removed&&r.deck.length>10&&E.shopRemovalPrice(r)<=spendable;
 const art=r.shop.artifacts.map((o,index)=>({o,index,price:E.shopPrice(r,o),a:A.catalog[o.id]})).filter(x=>x.a&&!r.shop.artifactBought.includes(x.index)&&!A.has(r,x.o.id)&&x.price<=spendable&&!(x.a.values.gold&&x.price>=x.a.values.gold)).sort((a,b)=>prefersArtifact(b.a)-prefersArtifact(a.a)||b.price-a.price||a.index-b.index)[0];
 const candidates=r.shop.offers.map((o,index)=>({o,index,price:E.shopPrice(r,o),d:describeCard(r,o.key)})).filter(x=>!r.shop.bought.includes(x.index)&&x.price<=spendable&&r.deck.length<60);
 if(policy==='sale_only'){const x=candidates.find(x=>x.o.sale);return x?{kind:'card',index:x.index,price:x.price,reason:'single_sale'}:null;}
 if(policy==='removal_first'&&removable)return {kind:'remove',uid:removalTarget(r).uid,price:E.shopRemovalPrice(r),reason:'paid_removal_first'};
 if(policy==='artifact_first'&&art&&r.shop.artifactBought.length===0)return {kind:'artifact',index:art.index,price:art.price,reason:'economic_effect_then_tier_heuristic'};
 const counts=r.deck.reduce((a,c)=>(a[cards[c.key].category]=(a[cards[c.key].category]||0)+1,a),{}),target={attack:5,defend:5,skill:4,passive:2};
 const card=candidates.filter(x=>x.d.actionableProxy&&r.deck.length<24).sort((a,b)=>Number((counts[b.d.category]||0)<target[b.d.category])-Number((counts[a.d.category]||0)<target[a.d.category])||Number(b.d.requirements.length>0)-Number(a.d.requirements.length>0)||a.d.copies-b.d.copies||a.price-b.price||a.index-b.index)[0];
 if(card)return {kind:'card',index:card.index,price:card.price,reason:'declared_tag_category_proxy'};
 if(removable&&policy!=='reserve'&&r.deck.length>14)return {kind:'remove',uid:removalTarget(r).uid,price:E.shopRemovalPrice(r),reason:'duplicate_density_heuristic'};
 if(art&&r.shop.artifactBought.length===0)return {kind:'artifact',index:art.index,price:art.price,reason:'remaining_affordable_artifact'};
 return null;
}
function graph(r){const map=E.getMap(r);return {map,byId:Object.fromEntries(map.nodes.map(n=>[n.id,n]))};}
function surveyMap(seed,stage){
 const r=E.newRun(seed);r.stage=stage;r.route=G.begin(stage,seed,3);const {byId}=graph(r),memo={};
 function scan(id){if(memo[id])return memo[id];const node=byId[id],children=node.next.map(scan),base={elites:Number(node.type==='elite'),shops:Number(node.type==='shop'),rests:Number(node.type==='camp'),path:[id]};
  const append=tail=>({elites:base.elites+(tail?.elites||0),shops:base.shops+(tail?.shops||0),rests:base.rests+(tail?.rests||0),path:[id,...(tail?.path||[])]});
  const lo=children.map(x=>x.minElite).sort((a,b)=>a.elites-b.elites||b.rests-a.rests||a.path.join().localeCompare(b.path.join()))[0],hi=children.map(x=>x.maxElite).sort((a,b)=>b.elites-a.elites||b.shops-a.shops||a.path.join().localeCompare(b.path.join()))[0];
  return memo[id]={minElite:append(lo),maxElite:append(hi),pathCount:children.length?children.reduce((n,x)=>n+x.pathCount,0):1};
 }
 const roots=E.availableNodes(r).map(n=>scan(n.id));return {seed,stage:stage+1,pathCount:roots.reduce((n,x)=>n+x.pathCount,0),minElite:roots.map(x=>x.minElite).sort((a,b)=>a.elites-b.elites||b.rests-a.rests||a.path.join().localeCompare(b.path.join()))[0],maxElite:roots.map(x=>x.maxElite).sort((a,b)=>b.elites-a.elites||b.shops-a.shops||a.path.join().localeCompare(b.path.join()))[0]};
}
function pickNode(r,policy,routeStyle='adaptive'){
 if(routeStyle!=='adaptive'){const route=surveyMap(r.seed,r.stage)[routeStyle].path,node=E.availableNodes(r).find(n=>n.id===route[r.depth]);assert.ok(node,'controlled route must remain connected');return node;}
 const {byId}=graph(r),memo={},needHp=(r.maxHp-r.hp)/r.maxHp;
 const value=n=>n.type==='elite'?(policy==='artifact_first'&&r.hp>r.maxHp*.65?6:-12):n.type==='shop'?(policy==='saver'?-3:r.gold>=45?7:1):n.type==='camp'?3+12*needHp:0;
 function future(n){if(Object.hasOwn(memo,n.id))return memo[n.id];return memo[n.id]=value(n)+Math.max(0,...n.next.map(id=>future(byId[id])));}
 return E.availableNodes(r).slice().sort((a,b)=>future(b)-future(a)||a.id.localeCompare(b.id))[0];
}
function eventOption(r,policy){
 const options=X.definition(r).success.options.filter(o=>X.actionable(r,o));
 const viable=options.filter(o=>!o.costs.some(c=>c.resource==='hp'&&r.hp-c.amount<Math.ceil(r.maxHp*.35)||c.resource==='maxHp'&&r.hp<r.maxHp*.5||c.resource==='gold'&&policy==='reserve'&&r.gold-c.amount<35));
 return viable.find(o=>o.effects.some(e=>e.type==='HEAL_HP')&&r.maxHp-r.hp>=8)||viable.find(o=>o.effects.some(e=>e.type==='ADD_GOLD')&&(policy==='saver'||r.gold<50))||viable.find(o=>o.effects.some(e=>e.type==='CHOOSE_CARD_REWARD')&&r.deck.length<24)||viable.find(o=>o.effects.some(e=>e.type==='REMOVE_CARD')&&r.deck.length>14)||viable[0];
}
function eventTarget(r,o){const offer=r.mysteryState.pending.offers[o.id],targets=X.targets(r,o);if(offer.cards)return offer.cards.slice().sort((a,b)=>Number(describeCard(r,b).actionableProxy)-Number(describeCard(r,a).actionableProxy)||a.localeCompare(b))[0];
 if(o.effects.some(e=>e.type==='UPGRADE_CARD'))return r.deck.filter(c=>targets.includes(c.uid)&&E.canUpgrade(c)).sort((a,b)=>a.uid.localeCompare(b.uid))[0]?.uid;
 if(o.effects.some(e=>e.type==='REMOVE_CARD'||e.type==='TRANSFORM_CARD'))return targets.includes(removalTarget(r)?.uid)?removalTarget(r).uid:targets[0];
 return targets[0];
}
function eventGold(r,o){return o.effects.reduce((n,e)=>n+(e.type==='ADD_GOLD'?e.amount:e.type==='GRANT_ARTIFACT'?(A.catalog[r.mysteryState.pending.offers[o.id].artifactId]?.values.gold||0):0),0);}
function simulateFlow({seed,difficulty,policy,answer='proficient',budget='moderate',routeStyle='adaptive',trace=true}){
 assert.ok(policies.includes(policy));const profile=typeof answer==='string'?answerProfiles[answer]:answer,damage=typeof budget==='string'?budgets[budget]:budget;
 assert.ok(profile&&damage);const r=E.newRun(seed,'challenge',3,{economy:true,difficulty});
 const s={seed,difficulty,policy,answer:typeof answer==='string'?answer:'custom',budget:typeof budget==='string'?budget:'custom',routeStyle,status:'MODEL_FLOW_COMPLETE',completed:false,startGold:r.gold,goldEarned:0,goldSpent:0,recovery:0,wastedRest:0,hpFixturePaid:0,eventHpLost:0,maxHpLost:0,cardsBought:0,artifactsBought:0,removals:0,freeCards:0,cardSkips:0,upgrades:0,rests:0,nodes:0,elites:0,normalCombats:0,shops:0,noAffordableCards:0,noAffordableProxyCards:0,shopGold:[],unspentAtLastShop:null,postLastShopNetGold:0,eventCorrect:0,eventWrong:0,eventTimeout:0,eventDeclined:0,artifactAttempts:0,artifactWrong:0,scriptedAttemptTimeMs:0,firstShopDepth:null,firstShopStage:null};
 const rows=[],vector=[];let stop=false;
 function act(kind,fn,{paid=0,earned=0,...extra}={}){const b={gold:r.gold,hp:r.hp,maxHp:r.maxHp,stage:r.stage+1,node:r.route.active};fn();earned=typeof earned==='function'?earned():earned;assert.equal(r.gold-b.gold,earned-paid,'Gold delta '+kind+' '+seed);s.goldEarned+=earned;s.goldSpent+=paid;s.recovery+=Math.max(0,r.hp-b.hp);if(kind.startsWith('event'))s.eventHpLost+=Math.max(0,b.hp-r.hp);s.maxHpLost+=Math.max(0,b.maxHp-r.maxHp);if(trace)rows.push({kind,...b,goldAfter:r.gold,hpAfter:r.hp,maxHpAfter:r.maxHp,paid,earned,...extra});}
 function gift(){const key=giftKey(r);if(!key){if(r.artifactState?.offer?.kind==='elite')act('skip_empty_gift',()=>E.skipArtifact(r));return;}
  let result;act('artifact_claim',()=>{result=claimGift(r,profile,key);},{earned:()=>result.claimed?(A.catalog[key].values.gold||0):0,key});s.artifactAttempts+=result.attempts;s.artifactWrong+=result.wrongAttempts;s.scriptedAttemptTimeMs+=result.timeMs;}
 gift();
 function fight(type){
  const cost=damage[type],hp=r.hp;if(hp<=cost){s.status='MODEL_HP_BUDGET_EXHAUSTED';stop=true;if(trace)rows.push({kind:'assumption_budget_stop',hp,assumedDamage:cost,stage:r.stage+1,node:r.route.active});return;}
  r.hp-=cost;s.hpFixturePaid+=cost;const b=r.battle,mods={...(b.mysteryModifiers||{})};b.hp=1;b.enemyBlock=0;b.seals=C.enemies[b.enemyId].seals?.length||0;
  let rune=b.hand.find(c=>c.key==='stm.attack.rune_strike');if(!rune){const i=b.draw.findIndex(c=>c.key==='stm.attack.rune_strike');assert.ok(i>=0,'fixture keeps an owned Rune Strike');[b.hand[0],b.draw[i]]=[b.draw[i],b.hand[0]];rune=b.hand[0];}
  const gold=E.rewardGold(r),lootBefore=A.owned(r).length;act('prewon_fixture',()=>E.playCard(r,rune.uid),{earned:gold,type,assumedDamage:cost,modifiers:mods});
  if(type==='elite')s.elites++;if(type==='battle')s.normalCombats++;
  const v={stage:r.stage+1,type,gold,declaredHpCost:cost,cardOffers:r.rewards.length,upgradedCardsOffered:type==='elite'?r.rewards.length:0,artifactsBefore:lootBefore};
  if(r.scene==='reward'){
   const candidates=r.rewards.map(id=>({id,d:describeCard(r,id)})).filter(x=>x.d.actionableProxy).sort((a,b)=>a.d.copies-b.d.copies||a.id.localeCompare(b.id));
   const pick=r.deck.length<24?candidates[0]?.id:null;act('card_reward',()=>E.chooseReward(r,pick||null),{picked:pick||null});s[pick?'freeCards':'cardSkips']++;
   if(r.artifactState?.offer?.ready)gift();
  }
  if(r.scene==='stageclear'){if(r.artifactState?.offer?.ready)gift();else act('stage_clear',()=>E.nextStage(r));}
  v.artifactsGained=A.owned(r).length-lootBefore;vector.push(v);
 }
 function mystery(){let p=r.mysteryState.pending;
  if(p.phase==='empty'){act('event_empty',()=>E.continueMystery(r));return;}
  const now=1000000+r.stage*1000000+r.depth*200000,eventId=p.eventId;act('event_start',()=>E.startMystery(r,[],null,now));p=r.mysteryState.pending;
  const q=Q.catalog[p.questionId],wrong=q.choices.filter(c=>c.id!==q.correctChoiceId);let attempt=0;
  while(r.mysteryState.pending.phase==='question'&&attempt<2){
   const correct=hash(seed,'mystery|'+r.stage+'|'+r.depth+(attempt?'|retry':''))/4294967296<profile.accuracy;
   const tried=Q.getSession(r).records[q.id].attempts.map(a=>a.choiceId),choice=correct?q.correctChoiceId:wrong.find(c=>!tried.includes(c.id)).id;
   attempt++;act('event_answer',()=>E.answerMystery(r,choice,now+attempt*profile.responseMs),{eventId,scriptedCorrect:correct,responseMs:profile.responseMs,attempt});s.scriptedAttemptTimeMs+=profile.responseMs;
  }
  const outcome=r.mysteryState.pending.outcome;s[outcome==='CORRECT'?'eventCorrect':outcome==='TIMEOUT'?'eventTimeout':'eventWrong']++;
  const def=X.definition(r),auto=outcome==='CORRECT'&&def.success.mode==='AUTOMATIC'?def.success.options[0]:null;
  act('event_review',()=>E.continueMystery(r),{earned:auto?eventGold(r,auto):0,eventId,outcome});
  if(r.scene==='event'&&r.mysteryState.pending?.phase==='reward'){
   const o=eventOption(r,policy);if(!o){act('event_decline',()=>E.leaveMystery(r));s.eventDeclined++;}
   else {act('event_option',()=>E.selectMysteryOption(r,o.id));const target=eventTarget(r,o);if(target)act('event_target',()=>E.selectMysteryTarget(r,target));
    const paid=o.costs.filter(c=>c.resource==='gold').reduce((n,c)=>n+c.amount,0),earned=eventGold(r,o);act('event_claim',()=>E.claimMystery(r),{paid,earned,eventId,option:o.id});}
  }
  if(r.scene==='battle')fight('battle');
 }
 for(let guard=0;guard<25&&!stop&&r.scene!=='victory';guard++){
  assert.equal(r.scene,'map');const node=pickNode(r,policy,routeStyle);s.nodes++;E.enterNode(r,node.id);
  if(r.scene==='battle')fight(node.type);
  else if(r.scene==='shop'){
   s.shops++;if(s.firstShopDepth===null){s.firstShopDepth=r.depth+1;s.firstShopStage=r.stage+1;}
   const affordable=r.shop.offers.filter(o=>E.shopPrice(r,o)<=r.gold);s.noAffordableCards+=Number(affordable.length===0);s.noAffordableProxyCards+=Number(affordable.filter(o=>describeCard(r,o.key).actionableProxy).length===0);s.shopGold.push(r.gold);
   for(let i=0;i<14;i++){const d=shopDecision(r,policy);if(!d)break;
    if(d.kind==='card'){act('buy_card',()=>E.buyCard(r,d.index),{paid:d.price,reason:d.reason});s.cardsBought++;}
    else if(d.kind==='artifact'){const item=A.catalog[r.shop.artifacts[d.index].id];act('buy_artifact',()=>E.buyArtifact(r,d.index),{paid:d.price,earned:item.values.gold||0,reason:d.reason});s.artifactsBought++;}
    else {act('paid_remove',()=>E.removeShopCard(r,d.uid),{paid:d.price,reason:d.reason});s.removals++;}
   }
   s.unspentAtLastShop=r.gold;s.postLastShopNetGold=0;act('leave_shop',()=>E.leaveShop(r));
  }else if(r.scene==='camp'){
   const d=restDecision(r,policy),before=r.hp,requested=E.restHeal(r);act('rest_'+d.action,()=>E.camp(r,d.action,d.uid),{requested:d.action==='heal'?requested:0});if(d.action==='heal'){s.rests++;s.wastedRest+=requested-(r.hp-before);}else s.upgrades++;
  }else if(r.scene==='event')mystery();
  if(trace&&!stop)assert.ok(E.restore(r),'saved boundary '+node.type+' seed '+seed);
 }
 assert.ok(stop||r.scene==='victory','flow must terminate');assert.equal(r.gold,s.startGold+s.goldEarned-s.goldSpent);assert.ok(E.validate(r),'final save');
 s.completed=r.scene==='victory';s.engineScene=r.scene;s.finalGold=r.gold;s.finalHp=r.hp;s.finalMaxHp=r.maxHp;s.finalDeck=r.deck.length;s.finalArtifacts=A.owned(r).length;s.paidRemovalCount=r.economyState.removalCount;s.postLastShopNetGold=s.unspentAtLastShop===null?null:r.gold-s.unspentAtLastShop;
 s.questionExposures=r.educationState?.runUsedIds?.length||0;assert.equal(new Set(r.educationState?.runUsedIds||[]).size,s.questionExposures);
 return {summary:s,trace:rows,rewardVectors:vector};
}
module.exports={policies,answerProfiles,budgets,claimGift,giftKey,shopDecision,restDecision,removalTarget,upgradeTarget,pickNode,surveyMap,eventOption,eventTarget,eventGold,simulateFlow};
