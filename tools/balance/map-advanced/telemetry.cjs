'use strict';
// Observer only: gameplay values are never written here.
function createTelemetry({E,A,cardMerit,hash},initial){
 const metrics={minHp:initial.hp,minHpRatio:initial.hp/initial.maxHp,hpLost:0,hpRecovered:0,goldEarned:0,goldSpent:0,maxHpGain:0,restOpportunities:0,restHeals:0,restUpgrades:0,upgradeForegone:0,predict:{opportunities:0,attempts:0,firstAttempts:0,firstCorrect:0,correct:0,wrong:0,focusGained:0,skipped:0,exhausted:0,abandoned:0,failed:0},shop:{visits:0,zeroAffordableCards:0,cardPurchases:0,artifactPurchases:0,spent:0},eventHpLoss:0};
 const opportunities=new Set();let room=null;
 function mark(r){return {hp:r.hp,maxHp:r.maxHp,gold:r.gold,artifactIds:A.owned(r).map(a=>a.id),scene:r.scene,canUpgrade:r.deck.some(E.canUpgrade),attempts:r.battle?.question?.attempts?.length||0,solved:r.battle?.question?.solved,failed:r.battle?.question?.source==='bank'&&r.educationState?.session?.records[r.battle.question.questionId]?.status==='revealed'&&r.battle.question.attempts.length>=2,mysteryOutcome:r.mysteryState?.pending?.outcome||null};}
 function snapshot(r){const merits=r.deck.map(cardMerit),sum=merits.reduce((a,b)=>a+b,0);return {stage:r.stage+1,hp:r.hp,maxHp:r.maxHp,gold:r.gold,deckSize:r.deck.length,upgrades:r.deck.filter(c=>c.upgraded).length,deckFingerprint:hash(r.deck.map(c=>[c.key,c.upgraded]).sort()),artifacts:E.ownedArtifacts(r).map(a=>a.id),rng:r.rng,deckMeritSum:sum,deckMeritMean:sum/r.deck.length,meritKind:'HEURISTIC_POLICY_PROXY_NOT_CARD_CP'};}
 function attachRoom(r){room=r;room.metrics={hpLost:0,hpRecovered:0,goldEarned:0,goldSpent:0,minHp:room.enter.hp,minHpRatio:room.enter.hp/room.enter.maxHp};room.predict=Object.fromEntries(Object.keys(metrics.predict).map(k=>[k,0]));room.eventTransactions=[];}
 function predictCount(key,n=1){metrics.predict[key]+=n;if(room)room.predict[key]+=n;}
 function opportunity(r,skip){const key=[r.stage,r.route.active,r.battle.enemyId,r.battle.turn].join(':');if(!opportunities.has(key)){opportunities.add(key);predictCount('opportunities');if(skip)predictCount('skipped');}}
 function observe(kind,before,r,result){
  const acquisitionGold=A.owned(r).filter(a=>!(before.artifactIds||[]).includes(a.id)).reduce((n,a)=>n+(a.values.gold||0),0);
  // Purse can credit Gold inside a paid transaction. Keep gross flows while preserving net conservation.
  const lost=Math.max(0,before.hp-r.hp),healed=Math.max(0,r.hp-before.hp),earned=Math.max(0,r.gold-before.gold,acquisitionGold),spent=earned-(r.gold-before.gold);
  metrics.hpLost+=lost;metrics.hpRecovered+=healed;metrics.goldEarned+=earned;metrics.goldSpent+=spent;metrics.maxHpGain+=Math.max(0,r.maxHp-before.maxHp);metrics.minHp=Math.min(metrics.minHp,r.hp);metrics.minHpRatio=Math.min(metrics.minHpRatio,r.hp/r.maxHp);
  if(room){room.metrics.hpLost+=lost;room.metrics.hpRecovered+=healed;room.metrics.goldEarned+=earned;room.metrics.goldSpent+=spent;room.metrics.minHp=Math.min(room.metrics.minHp,r.hp);room.metrics.minHpRatio=Math.min(room.metrics.minHpRatio,r.hp/r.maxHp);}
  if(kind==='enterNode'&&r.scene==='camp')metrics.restOpportunities++;
  if(kind==='campHeal'){metrics.restHeals++;if(before.canUpgrade)metrics.upgradeForegone++;if(room){room.restAction='heal';room.upgradeForegone=before.canUpgrade;}}
  if(kind==='campUpgrade'){metrics.restUpgrades++;if(room)room.restAction='upgrade';}
  if(kind==='forecastAnswer'){predictCount('attempts');if(before.attempts===0)predictCount('firstAttempts');predictCount(result?.correct?'correct':'wrong');if(result?.first)predictCount('firstCorrect');predictCount('focusGained',result?.focusGained||0);}
  if(kind==='forecastAnswer'&&r.battle?.forecastUsed&&!r.battle?.question?.solved)predictCount('failed');
  if(kind==='forecastExhausted')predictCount('exhausted');
  if(kind==='forecastClose'&&!before.solved&&!before.failed)predictCount('abandoned');
  if(kind==='enterNode'&&r.scene==='shop'){
   const cardPrices=r.shop.offers.filter((o,i)=>!r.shop.bought.includes(i)).map(o=>E.shopPrice(r,o)),artifactPrices=(r.shop.artifacts||[]).filter((o,i)=>o.id&&!r.shop.artifactBought.includes(i)&&!A.has(r,o.id)).map(o=>E.shopPrice(r,o));
   const shop={gold:r.gold,offeredCards:cardPrices.length,affordableCards:cardPrices.filter(p=>p<=r.gold).length,affordableArtifacts:artifactPrices.filter(p=>p<=r.gold).length,minCardPrice:cardPrices.length?Math.min(...cardPrices):null};metrics.shop.visits++;if(shop.affordableCards===0)metrics.shop.zeroAffordableCards++;if(room)room.shop=shop;
  }
  if(kind==='buyCard')metrics.shop.cardPurchases++;
  if(kind==='buyArtifact')metrics.shop.artifactPurchases++;
  if(['buyCard','buyArtifact'].includes(kind))metrics.shop.spent+=spent;
  if(before.scene==='event'&&(lost||healed||earned||spent||before.maxHp!==r.maxHp)){
   metrics.eventHpLoss+=lost;
   if(room)room.eventTransactions.push({kind,hpDelta:r.hp-before.hp,maxHpDelta:r.maxHp-before.maxHp,goldDelta:r.gold-before.gold,outcome:r.mysteryState?.pending?.outcome||before.mysteryOutcome});
  }
 }
 return {metrics,mark,snapshot,attachRoom,detachRoom:()=>{room=null;},opportunity,observe};
}
module.exports={createTelemetry};
