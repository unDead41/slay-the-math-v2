'use strict';
const assert=require('node:assert/strict');
const T=require('./deep-common.cjs'),{E,Eco,A,clone}=T,F=require('./deep-flow.cjs');
const Q=require('../../dist/education.js'),X=require('../../dist/mystery.js'),G=require('../../dist/map.js');
function placeAtNode(r,type,stage=r.stage){
 r.stage=stage;r.route=G.begin(stage,r.seed,3);r.scene='map';r.battle=null;r.shop=null;r.rewards=[];
 const nodes=E.getMap(r).nodes,node=nodes.find(n=>n.type===type);assert.ok(node,'fixture room exists');let path=[node];
 for(let d=node.depth-1;d>=0;d--)path.unshift(nodes.find(n=>n.depth===d&&n.next.includes(path[0].id)));
 r.depth=node.depth;r.route.path=path.slice(0,-1).map(n=>n.id);r.cleared=r.route.path.slice();return node;
}
function eventRoom(id,difficulty,seed,{hp=40,gold=100,stage=0}={}){
 const r=E.newRun(seed,'challenge',3,{economy:true,difficulty});F.claimGift(r,{accuracy:1,responseMs:15000},r.artifactState.offer.ids.find(id=>id===A.id('s01'))||r.artifactState.offer.ids[0]);
 r.hp=Math.min(hp,r.maxHp);r.gold=gold;const node=placeAtNode(r,'event',stage);X.ensure(r).usedEventIds=X.data.events.filter(e=>e.id!==id).map(e=>e.id);E.enterNode(r,node.id);assert.ok(E.validate(r));return r;
}
const modes=['correct_fast','wrong_fast','correct_35s','correct_55s','correct_75s','deadline_minus1','deadline_exact','abandon','skip_before','decline_after_correct'];
function eventScenario({id,difficulty,seed,mode='correct_fast',option=null,hp=40,gold=100,stage=0}){
 let r=eventRoom(id,difficulty,seed,{hp,gold,stage});const before={gold:r.gold,hp:r.hp,max:r.maxHp,deck:r.deck.length,art:A.owned(r).length,questions:r.educationState.runUsedIds.length};
 const result={id,difficulty,seed,mode,requestedOption:option,inputHp:hp,inputGold:gold,stage:stage+1,outcome:'EMPTY',chosenOption:null,questionExposed:false,deadline:null,responseMs:0,forcedBattle:false};
 let p=r.mysteryState.pending;
 if(p.phase==='empty')E.continueMystery(r);
 else if(mode==='skip_before'){E.leaveMystery(r);result.outcome='DECLINED';}
 else {
  assert.equal(p.eventId,id);const now=100000;E.startMystery(r,[],null,now);r=E.restore(r);assert.ok(r,'exact deadline restores');p=r.mysteryState.pending;result.deadline=p.deadline;result.durationMs=p.deadline-now;
  const q=Q.catalog[p.questionId];let responseMs=mode==='deadline_minus1'?p.deadline-now-1:mode==='deadline_exact'?p.deadline-now:mode==='correct_35s'?35000:mode==='correct_55s'?55000:mode==='correct_75s'?75000:15000;
  result.responseMs=responseMs;
  if(mode==='abandon')E.leaveMystery(r,now+responseMs);else E.answerMystery(r,mode==='wrong_fast'?q.choices.find(c=>c.id!==q.correctChoiceId).id:q.correctChoiceId,now+responseMs);
  if(mode==='wrong_fast'&&r.mysteryState.pending.phase==='question')E.answerMystery(r,q.choices.filter(c=>c.id!==q.correctChoiceId)[1].id,now+responseMs+1);
  result.outcome=r.mysteryState.pending.outcome;E.continueMystery(r);
  if(r.scene==='event'&&r.mysteryState.pending.phase==='reward'){
   const options=X.definition(r).success.options.filter(o=>X.actionable(r,o)),o=option?options.find(o=>o.id===option):options[0];
   if(!o||mode==='decline_after_correct'){E.leaveMystery(r);result.chosenOption='DECLINED';}
   else {result.chosenOption=o.id;E.selectMysteryOption(r,o.id);const target=F.eventTarget(r,o);if(target)E.selectMysteryTarget(r,target);E.claimMystery(r);}
  }
 }
 result.questionExposed=r.educationState.runUsedIds.length>before.questions;result.goldDelta=r.gold-before.gold;result.hpDelta=r.hp-before.hp;result.maxHpDelta=r.maxHp-before.max;result.deckDelta=r.deck.length-before.deck;result.artifactDelta=A.owned(r).length-before.art;result.forcedBattle=r.scene==='battle';result.pendingModifiers=clone(r.mysteryState.nextCombat);result.finalHp=r.hp;result.finalMaxHp=r.maxHp;result.finalGold=r.gold;result.scene=r.scene;
 assert.ok(r.hp>=1&&r.maxHp>=1);assert.ok(E.restore(r),id+' '+mode+' final save');const once=clone(r);assert.throws(()=>E.claimMystery(r));assert.deepEqual(r,once);return result;
}
function studyEvents(seeds,{onProgress=()=>{}}={}){
 const rows=[],boundary=[],rest=[];
 for(const difficulty of ['easy','medium','hard']){
  for(const e of X.data.events)for(const mode of modes){
   const options=mode==='correct_fast'?e.success.options.map(o=>o.id):[null];
   for(const option of options)for(const seed of seeds)rows.push(eventScenario({id:e.id,difficulty,seed,mode,option}));
  }
  for(const e of X.data.events)for(const hp of [1,3,10,40,60])for(const gold of [0,30,100])for(const seed of seeds.slice(0,8))boundary.push(eventScenario({id:e.id,difficulty,seed,mode:'correct_fast',hp,gold}));
  for(const hp of [1,15,45,59,60])for(const action of ['heal','upgrade'])for(const seed of seeds.slice(0,8)){
   const r=E.newRun(seed,'learn',3,{economy:true,difficulty}),node=placeAtNode(r,'camp');r.hp=hp;E.enterNode(r,node.id);const before={hp:r.hp,deck:r.deck.length,upgraded:r.deck.filter(c=>c.upgraded).length},requested=E.restHeal(r),target=F.upgradeTarget(r);E.camp(r,action,target?.uid);
   rest.push({difficulty,seed,inputHp:hp,action,requestedHeal:action==='heal'?requested:0,actualHeal:r.hp-before.hp,wastedHeal:action==='heal'?requested-(r.hp-before.hp):0,upgradeDelta:r.deck.filter(c=>c.upgraded).length-before.upgraded,deckDelta:r.deck.length-before.deck});assert.ok(E.restore(r));
  }
  onProgress({phase:'events',difficulty,cases:rows.length,boundaryCases:boundary.length,restCases:rest.length});
 }
 return {rows,boundary,rest};
}
module.exports={placeAtNode,eventRoom,eventScenario,studyEvents,modes};


function studySacrifices(seeds){
 const results=[];
 for(const difficulty of ['easy','medium','hard'])for(const seed of seeds){
  let r=eventRoom('ME02',difficulty,seed,{hp:20});const trace=[];let claims=0;
  for(const [stage,id] of [[0,'ME02'],[1,'ME15']]){
   if(stage){const node=placeAtNode(r,'event',stage);X.ensure(r).usedEventIds=X.data.events.filter(e=>e.id!==id).map(e=>e.id);E.enterNode(r,node.id);}
   E.startMystery(r,[],null,1000);const q=Q.catalog[r.mysteryState.pending.questionId];E.answerMystery(r,q.correctChoiceId,1001);E.continueMystery(r);
   const option=X.definition(r).success.options[0];assert.ok(X.actionable(r,option));E.selectMysteryOption(r,option.id);const target=F.eventTarget(r,option);if(target)E.selectMysteryTarget(r,target);
   const before={hp:r.hp,maxHp:r.maxHp};E.claimMystery(r);claims++;trace.push({id,before,after:{hp:r.hp,maxHp:r.maxHp},cost:clone(option.costs)});r=E.restore(r);assert.ok(r);const once=clone(r);assert.throws(()=>E.claimMystery(r));assert.deepEqual(r,once);
  }
  const forged=clone(r);forged.mysteryState.hpSacrificed*=2;forged.maxHp=A.maxHp(forged);forged.hp=Math.min(forged.hp,forged.maxHp);assert.equal(E.restore(forged),null,'second MaxHP sacrifice cannot bypass event nonrepeat cap');
  results.push({difficulty,seed,claims,finalHp:r.hp,finalMaxHp:r.maxHp,stoppedUnavailable:true,trace,fixture:'cumulative HP then MaxHP at two stage nodes; repeated MaxHP forged save rejected by cumulative cap'});
 }
 return results;
}
module.exports.studySacrifices=studySacrifices;
