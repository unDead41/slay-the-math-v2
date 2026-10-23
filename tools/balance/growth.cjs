'use strict';
const D=require('./deep.cjs'),{rank,packs}=require('./decks.cjs');
function claim(x,r,id){x.E.chooseArtifact(r,id);const q=x.Q.current(r);if(q&&!r.educationState.pending.solved){x.E.selectEducation(r,q.correctChoiceId);x.E.answerEducation(r);}x.E.continueEducation(r);}
function chooseArtifact(x,r,kind){const candidates=x.E.artifactChoices(r);if(!candidates.length)return null;const order=packs[kind];return candidates.slice().sort((a,b)=>{const score=a=>order.includes(a.id.slice(0,3))?5-order.indexOf(a.id.slice(0,3)):0;return score(b)-score(a)||a.id.localeCompare(b.id);})[0].id;}
function pickNode(nodes,policy='safe'){const order=policy==='risk'?['elite','battle','shop','camp','event','boss']:['camp','shop','battle','event','elite','boss'];if(nodes.some(n=>!order.includes(n.type)))throw Error('Unknown route node type');return nodes.slice().sort((a,b)=>order.indexOf(a.type)-order.indexOf(b.type)||a.id.localeCompare(b.id))[0];}
function campaign(x,o={}){
 let r=x.E.newRun(o.seed,'challenge'),log=[],encounters=[],errors=[];let iterations=0;
 try{
  const start=chooseArtifact(x,r,o.archetype);claim(x,r,start);log.push({kind:'starting',id:start,offered:true});
  while(!['defeat','victory'].includes(r.scene)&&iterations++<100){
   if(!x.E.validate(r))throw Error('Invalid campaign state '+r.scene);
   if(r.scene==='map'){
    const nodes=x.E.availableNodes(r),node=pickNode(nodes,o.routePolicy);if(!node)throw Error('No connected route');
    log.push({kind:'enter',stage:r.stage,depth:r.depth,node:node.id,type:node.type,hp:r.hp,deck:r.deck.length,upgrades:r.deck.filter(c=>c.upgraded).length,artifacts:x.A.owned(r).map(a=>a.id)});x.E.enterNode(r,node.id);
   }else if(r.scene==='battle'){
    const policySeed=Math.imul(o.seed^(r.stage*17+r.depth),2654435761)>>>0,result=D.simulate(x,{...o,seed:policySeed,fromRun:r,returnRun:true});const {run,...metrics}=result;encounters.push(metrics);r=run;
    if(!r||result.status==='INVALID_POLICY_OR_ENGINE')throw Error(result.error||'Encounter returned no run');
    if(result.status==='BENCHMARK_LIMIT_CENSORED')return {status:result.status,log,encounters,errors,finalHp:r.hp,stage:r.stage};
   }else if(r.scene==='reward'){
    if(r.artifactState?.offer?.ready){const id=chooseArtifact(x,r,o.archetype);log.push({kind:'artifact',id,offered:r.artifactState.offer.ids.includes(id)});claim(x,r,id);}
    else{const key=r.rewards.slice().sort((a,b)=>rank(x,r,b,o.archetype)-rank(x,r,a,o.archetype)||a.localeCompare(b))[0];log.push({kind:'card',key,offered:r.rewards.includes(key),upgraded:r.battle.elite});x.E.chooseReward(r,key);}
   }else if(r.scene==='stageclear'){
    const id=chooseArtifact(x,r,o.archetype);if(id){log.push({kind:'boss-artifact',id,offered:r.artifactState.offer.ids.includes(id)});claim(x,r,id);}else x.E.nextStage(r);
   }else if(r.scene==='camp'){
    const target=r.deck.filter(c=>!c.upgraded).sort((a,b)=>rank(x,r,b.key,o.archetype)-rank(x,r,a.key,o.archetype))[0],action=r.hp<r.maxHp*.7||!target?'heal':'upgrade';log.push({kind:'camp',action,hp:r.hp,uid:action==='upgrade'?target.uid:null});x.E.camp(r,action,target?.uid);
   }else if(r.scene==='shop'){
    const choices=r.shop.offers.map((v,i)=>({...v,i,quote:x.E.shopPrice(r,v)})).filter(v=>v.quote<=r.gold).sort((a,b)=>rank(x,r,b.key,o.archetype)-rank(x,r,a.key,o.archetype)||a.quote-b.quote);
    if(choices.length){const c=choices[0];log.push({kind:'buy',key:c.key,price:c.quote,gold:r.gold});x.E.buyCard(r,c.i);}x.E.leaveShop(r);
   }else if(r.scene==='event'){log.push({kind:'mystery-declined',id:r.mysteryState?.pending?.eventId});x.E.leaveMystery(r);}
   else throw Error('Unsupported campaign scene '+r.scene);
  }
  if(iterations>=100)throw Error('Campaign scene loop limit');
  return {status:r.scene==='victory'?'WIN':'LOSS',log,encounters,finalHp:r.hp,maxHp:r.maxHp,stage:r.stage,depth:r.depth,deck:r.deck.map(c=>({key:c.key,upgraded:c.upgraded})),artifacts:x.A.owned(r).map(a=>a.id),errors,questionsSeen:r.educationState?.runUsedIds?.length||0,validFinal:x.E.validate(r)};
 }catch(e){return {status:'INVALID_POLICY_OR_ENGINE',error:e.message,log,encounters,scene:r?.scene,stage:r?.stage,depth:r?.depth,errors};}
}
module.exports={campaign,claim,chooseArtifact,pickNode};
