'use strict';
// Explicit heuristic support units. These are neither measured CP nor a price.
function createArtifactPolicy(x){
 function futureValue(run,id){
  const a=x.A.catalog[id];if(!a||!x.A.eligible(run,a))return 0;
  const v=a.values,prefix=id.slice(0,3),plans=run.deck.map(c=>x.E.cardDisplayPlan(c));
  const fraction=category=>plans.filter(p=>p.card.category===category).length/Math.max(1,plans.length);
  const attack=fraction('attack'),guard=fraction('defend'),skill=fraction('skill'),passive=fraction('passive');
  const exhaust=plans.some(p=>p.card.lifecycle==='exhaust');
  const fights=Math.max(1,(1-run.stage)*3+(10-run.depth)*.35),turns=3;
  const discount=Math.max(0,...x.A.owned(run).map(a=>a.values.discount_percent||0));
  if(v.discount_percent)return Math.max(0,v.discount_percent-discount)*Math.max(0,run.gold)*.65/100/12;
  let value=0;
  if(v.heal&&prefix!=='s08')value+=v.heal*1.4;
  value+=(v.damage_bonus_per_card||0)*Math.min(1,attack*2)*turns*.65;
  value+=(v.block_bonus||0)*Math.min(1,guard*2)*turns*.72;
  if(v.block){
   const uses=prefix==='s11'||prefix==='e05'?Number(exhaust):prefix==='s12'?Number(passive>0):prefix==='e02'?Number(attack>0&&guard>0)*2:prefix==='e04'?1.2:prefix==='e12'?.5:1;
   value+=v.block*uses*.72;
  }
  if(v.draw){const uses=prefix==='s10'?Number(skill>0):prefix==='e05'?Number(exhaust):prefix==='e10'?Number(skill>0)*turns:prefix==='b03'?turns:1;value+=v.draw*uses*1.8;}
  value+=(v.energy||0)*(prefix==='b01'?turns:prefix==='e01'?2:1)*2;
  value+=(v.focus||0)*plans.filter(p=>p.card.focus_eligible).length/Math.max(1,plans.length);
  const growth=stat=>Math.min(v.max_artifact_contribution_each_stat||Infinity,(v[stat]||v['initial_'+stat]||0)+(v[stat+'_per_later_turn']||0)*(turns-1)/2);
  value+=growth('strength')*attack*turns*2+growth('agility')*guard*turns*1.5;
  value+=(v.retaliation_damage||0)*Math.min(1,guard*2)*turns*.5;
  if(prefix==='e03')value+=(v.faces_1_2.block*.72+v.faces_3_4.draw*1.8+v.faces_5_6.energy*2)/3;
  return value*fights;
 }
 function score(run,id,{price=0}={}){
  const a=x.A.catalog[id];if(!a||x.A.has(run,id)||!x.A.eligible(run,a))return {id,gain:-Infinity,reason:'Artifact is unavailable or has no eligible trigger.'};
  const v=a.values,maxHp=v.max_hp||0,heal=maxHp?Math.min(v.heal||0,Math.max(0,run.maxHp+maxHp-run.hp)):0;
  const units=futureValue(run,id)+maxHp*2+heal*1.4+((v.gold||0)-price)/12;
  return {id,gain:units/50,price,reason:'Compare marginal artifact effects, eligible deck triggers and actual net acquisition cost; heuristic support units.'};
 }
 function choose(run,ids,{allowSkip=false}={}){
  const choices=ids.filter(id=>x.A.catalog[id]&&!x.A.has(run,id)&&x.A.eligible(run,x.A.catalog[id])).map(id=>score(run,id)).sort((a,b)=>b.gain-a.gain||a.id.localeCompare(b.id));
  return choices[0]&&(!allowSkip||choices[0].gain>0)?choices[0]:{id:null,gain:0,reason:'Decline an optional artifact with no positive marginal value.'};
 }
 return {score,futureValue,choose};
}
module.exports={createArtifactPolicy};
