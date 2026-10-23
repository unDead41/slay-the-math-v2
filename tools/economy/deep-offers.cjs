'use strict';
const assert=require('node:assert/strict');
const T=require('./deep-common.cjs'),{Eco,cards,clone,describeCard}=T;
const sources=['normal','elite','shop','ME03','ME12','ME04'];
function studyOffers(seeds,{fixtureNames=T.fixtureNames,difficulties=['easy','medium','hard'],contexts=T.contexts,onProgress=()=>{}}={}){
 const rows=[],paired=[],samples=[],checks={duplicateViolations:0,sourceViolations:0,rngViolations:0,changedPlayerDecks:0,firstRarityPairMismatches:0,receiptReplayViolations:0,nonPositiveWeights:0};
 for(const fixture of fixtureNames){
  for(const difficulty of difficulties)for(const context of contexts)for(const source of sources){
   const arms=[];
   for(const support of [false,true]){
    const row={fixture,difficulty,...context,source,support,seeds:seeds.length,offers:0,slots:0,categories:{attack:0,defend:0,skill:0,passive:0},byId:{},firstRarities:[],readySlots:0,actionableSlots:0,allProxyRejected:0,missingRequirementSlots:0,redundantPassiveSlots:0,thirdCopySlots:0,upgradeOpportunities:0,conditionalSlots:0,supportedConditionalSlots:0};
    for(const [i,seed]of seeds.entries()){
     const r=T.createFixture(fixture,seed,difficulty,support,context),before=JSON.stringify({deck:r.deck,rng:r.rng,q:r.educationState});
     const original=r.deck[i%r.deck.length],opts=source==='ME04'?{nodeId:'deep-offer',category:cards[original.key].category,exclude:[original.key],ordinal:1}:{nodeId:'deep-offer'};
     const o=Eco.cards(r,source,opts);row.offers++;row.firstRarities.push(cards[o.ids[0]].rarity);
     checks.duplicateViolations+=Number(new Set(o.ids).size!==o.ids.length);
     checks.sourceViolations+=Number(source==='ME03'&&o.ids.some(id=>cards[id].category!=='skill')||source==='ME04'&&o.ids.some(id=>cards[id].category!==cards[original.key].category||id===original.key)||source==='shop'&&!(o.ids.length===6&&Number.isInteger(o.saleIndex)&&o.saleIndex>=0&&o.saleIndex<6));
     checks.nonPositiveWeights+=o.factors.filter(f=>!(f.weight>0)||f.combatPower!==null).length;
     const descriptions=o.ids.map(id=>describeCard(r,id,o));
     for(const x of descriptions){row.slots++;row.categories[x.category]++;row.byId[x.id]=(row.byId[x.id]||0)+1;row.readySlots+=Number(x.tagReady);row.actionableSlots+=Number(x.actionableProxy);row.missingRequirementSlots+=Number(!x.tagReady);row.redundantPassiveSlots+=Number(x.redundantPassive);row.thirdCopySlots+=Number(x.thirdOrLaterCopy);row.upgradeOpportunities+=Number(x.upgradeOpportunity);row.conditionalSlots+=Number(x.requirements.length>0);row.supportedConditionalSlots+=Number(x.requirements.length>0&&x.tagReady);}
     row.allProxyRejected+=Number(descriptions.every(x=>!x.actionableProxy));
     const after=JSON.stringify({deck:r.deck,rng:r.rng,q:r.educationState});checks.changedPlayerDecks+=Number(before!==after);checks.rngViolations+=Number(r.rng!==((seed^0x1234)>>>0)||r.educationState.rng!==((seed^0x5678)>>>0));
     const receipt=JSON.stringify(o);r.deck.push({uid:'c99',key:'stm.passive.clear_mind',upgraded:false});checks.receiptReplayViolations+=Number(JSON.stringify(Eco.cards(r,source,opts))!==receipt);
     if(i===0&&support&&difficulty==='medium'&&context.depth===6&&context.stage===1)samples.push({fixture,receipt:clone(o)});
    }
    arms.push(row);rows.push(row);
   }
   const [off,on]=arms;checks.firstRarityPairMismatches+=on.firstRarities.filter((x,i)=>x!==off.firstRarities[i]).length;
   paired.push({fixture,difficulty,...context,source,seeds:seeds.length,slots:on.slots,actionableDeltaPp:100*(on.actionableSlots-off.actionableSlots)/on.slots,supportedConditionalDeltaPp:100*(on.supportedConditionalSlots-off.supportedConditionalSlots)/on.slots,allRejectedDeltaPp:100*(on.allProxyRejected-off.allProxyRejected)/on.offers});
   for(const arm of arms){arm.firstRarityCounts=arm.firstRarities.reduce((a,x)=>(a[x]=(a[x]||0)+1,a),{});delete arm.firstRarities;}
  }
  onProgress({phase:'offers',fixture,rows:rows.length});
 }
 for(const [name,n]of Object.entries(checks))assert.equal(n,0,name);
 return {rows,paired,samples,checks};
}
module.exports={studyOffers,sources};
