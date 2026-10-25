'use strict';
// Transparent acquisition heuristics, deliberately separate from measured card power.
function createDeckPolicy(x,{experience=true,model}={}){
 const evidence=require('./experience.cjs').createExperience(x,{enabled:experience,model});
 const artifacts=require('./artifact-policy.cjs').createArtifactPolicy(x);
 const cache=new Map(),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function profile(c){
  const key=c.key+':'+!!c.upgraded;if(cache.has(key))return cache.get(key);
  const p=x.E.cardDisplayPlan(c),d=p.card,v={id:c.key,name:d.name,category:d.category,cost:p.payEnergy,damage:0,hits:0,block:0,draw:0,delayedBlock:0,delayedDraw:0,selection:0,selectionWindow:0,weak:0,vulnerable:0,thorns:0,retain:0,attributes:{},passive:d.passive,values:p.values,activation:c.upgraded?d.upgrade?.activation||{}:{},focused:d.focus_eligible};
  for(const a of p.actions){if(a.op==='damage'){v.damage+=a.value*(a.repeat||1);v.hits+=a.repeat||1;}if(a.op==='grant_block')v[a.timing?'delayedBlock':'block']+=a.value;if(a.op==='draw')v[a.timing?'delayedDraw':'draw']+=a.value;if(a.op==='apply_status')v[a.status]+=a.value;if(a.op==='retain_block')v.retain=Math.max(v.retain,a.value);if(['search_category','look_choose_reorder','look_choose_discard','look_replace_take','return_discard_card'].includes(a.op)){v.selection++;v.selectionWindow+=a.look||a.limit||a.replacement_limit||0;}}
  for(const a of d.passive?.effects||[])if(a.op==='add_attribute')v.attributes[a.attribute]=p.values[a.value];
  v.cadence=c.upgraded?(d.upgrade?.limits?.every_n_cards??d.passive?.limits.every_n_cards):d.passive?.limits.every_n_cards;
  cache.set(key,v);return v;
 }
 function quality(deck){
  if(!deck.length)return -100;
  const ps=deck.map(profile),unique=[...new Map(ps.map(p=>[p.id,p])).values()],n=ps.length,attack=ps.filter(p=>p.category==='attack').length/n,guard=ps.filter(p=>p.category==='defend').length/n,skills=ps.filter(p=>p.category==='skill').length/n,counts={},ward=ps.some(p=>p.name==='Grimoire Ward'),core=ps.some(p=>p.name==='Ember Core'),strength=unique.reduce((s,p)=>s+(p.attributes.strength||0),0),agility=unique.reduce((s,p)=>s+(p.attributes.agility||0),0),blockAccess=clamp(guard*1.8+(ward?skills*.6:0),0,.95);
  let total=0;
  for(const p of ps){
   const duplicate=p.category==='passive'&&(counts[p.id]||0)>0;counts[p.id]=(counts[p.id]||0)+1;
   let value=.95*p.damage+.72*p.block+1.8*p.draw+.45*p.delayedBlock+1.15*p.delayedDraw+2*p.selection+.25*p.selectionWindow+1.7*p.weak+1.5*p.vulnerable+.65*p.thorns+.32*p.retain*blockAccess;
   if(p.category==='attack')value+=.65*strength*Math.min(1,p.hits);
   if(p.category==='defend')value+=.5*agility;
   if(p.name==='Shield Shot')value+=2.85*blockAccess;
   if(p.category==='skill'&&ward)value+=1.8;
   if(p.focused&&core)value+=.7;
   if(p.category==='passive'){
    value+=.72*(p.activation.block||0)+1.8*(p.activation.draw||0);
    const trigger=p.passive.trigger,cadence=p.cadence||1,uses=trigger==='on_activation'?1:Math.min(p.passive.limits.max_triggers_per_combat||3,7*(trigger==='after_attack_card_resolved'?attack:guard)/cadence);
    value+=.75*(p.attributes.strength||0)*uses*(2+5*attack)+.6*(p.attributes.agility||0)*uses*(2+5*guard)+(p.attributes.defense||0)*5;
    if(p.name==='Grimoire Ward')value+=p.values.block*Math.min(2.5,skills*6)*.8;
    if(p.name==='Ember Core')value+=p.values.damage*1.5;
    if(p.name==='Clear Mind')value+=p.values.draw*3.6;
    if(p.name==='Lasting Shield')value+=p.values.retain*blockAccess*1.6;
    if(p.name==='Last Ember')value+=p.values.block*.45+(p.values.focus||0)*.8;
    if(duplicate)value=.3;
   }
   total+=value/(1+.24*p.cost);
  }
  return evidence.deckAdjustment(deck)+total/n-14*Math.max(0,.22-guard)-12*Math.max(0,.3-attack)-Math.max(0,n-18)*.035;
 }
 function marginal(run,c){return quality([...run.deck,c])-quality(run.deck);}
 function reward(run,keys,upgraded=false,{allowSkip=true}={}){
  const choices=keys.map(key=>({key,gain:marginal(run,{key,upgraded})})).sort((a,b)=>b.gain-a.gain||a.key.localeCompare(b.key));const best=choices[0];
  return best&&(best.gain>.01||!allowSkip)&&run.deck.length<60?{...best,reason:best.gain>.01?'Add '+x.C.cards[best.key].name+' for deck synergy, coverage and Energy curve.':'Choose the least harmful required card reward.'}:{key:null,gain:0,reason:'Skip: offered cards dilute this deck or duplicate a unique Passive.'};
 }
 function upgrade(run,candidates=run.deck){
  const base=quality(run.deck),choices=candidates.filter(c=>x.E.canUpgrade(c)).map(c=>({uid:c.uid,gain:quality(run.deck.map(v=>v.uid===c.uid?{...v,upgraded:true}:v))-base})).sort((a,b)=>b.gain-a.gain||a.uid.localeCompare(b.uid));
  return choices[0]?{...choices[0],reason:'Upgrade the largest marginal improvement for this deck.'}:{uid:null,gain:0,reason:'No legal upgrade remains.'};
 }
 function remove(run,candidates=run.deck){
  if(run.deck.length<=x.C.ECONOMY.shop.minimumDeck)return {uid:null,gain:0,reason:'Keep the engine minimum deck size.'};
  const base=quality(run.deck),choices=candidates.map(c=>({uid:c.uid,gain:quality(run.deck.filter(v=>v.uid!==c.uid))-base})).sort((a,b)=>b.gain-a.gain||a.uid.localeCompare(b.uid));
  return choices[0]?{...choices[0],reason:'Remove the card with the best resulting deck quality; preserve useful synergy.'}:{uid:null,gain:0,reason:'No removal target.'};
 }
 function camp(run){const best=upgrade(run);return run.hp<=run.maxHp-8||!best.uid?{action:'heal',reason:'Recover HP before the next encounter.'}:{...best,action:'upgrade'};}
 function transform(run,transforms,candidates=run.deck,{allowSkip=true}={}){
  const base=quality(run.deck),choices=candidates.filter(c=>x.C.cards[transforms[c.uid]]).map(c=>({uid:c.uid,gain:quality(run.deck.map(v=>v.uid===c.uid?{...v,key:transforms[c.uid],upgraded:false}:v))-base})).sort((a,b)=>b.gain-a.gain||a.uid.localeCompare(b.uid));
  return choices[0]&&(!allowSkip||choices[0].gain>0)?{...choices[0],reason:'Compare the frozen replacement with the current card, including loss of its upgrade.'}:{uid:null,gain:0,reason:'Decline a transform which reduces deck quality.'};
 }
 function mystery(run,event,pending){
  const choices=[],owned=new Set(x.A.owned(run).map(a=>a.id));
  for(const option of event.success.options.filter(o=>x.X.actionable(run,o))){
   const offer=pending.offers[option.id],targets=x.X.targets(run,option).filter(id=>!offer.cards||offer.cards.includes(id));
   for(const targetId of targets.length?targets:[null]){
    const after=JSON.parse(JSON.stringify(run));x.E.selectMysteryOption(after,option.id);if(targetId!==null)x.E.selectMysteryTarget(after,targetId);x.E.claimMystery(after);
    if(!x.E.validate(after))throw Error('Invalid counterfactual Mystery reward.');
    const nextOwned=new Set(x.A.owned(after).map(a=>a.id));
    let gain=50*(quality(after.deck)-quality(run.deck))+1.4*(after.hp-run.hp)+2*(after.maxHp-run.maxHp)+(after.gold-run.gold)/12;
    for(const id of nextOwned)if(!owned.has(id))gain+=artifacts.futureValue(run,id);
    for(const id of owned)if(!nextOwned.has(id))gain-=artifacts.futureValue(after,id);
    const modifiers=after.mysteryState.nextCombat.slice(run.mysteryState.nextCombat.length);
    for(const m of modifiers)gain+=m.amount*({block:.72,energy:2,focus:1,strength:3,agility:2,draw:1.8}[String(m.stat).toLowerCase()]||0);
    choices.push({optionId:option.id,targetId,gain,reason:'Compare actual frozen Mystery outcomes, deck synergy and paid HP/Max HP/Gold on isolated copies.'});
   }
  }
  choices.sort((a,b)=>b.gain-a.gain||a.optionId.localeCompare(b.optionId)||String(a.targetId).localeCompare(String(b.targetId)));
  return choices[0]&&(!event.success.mayDecline||choices[0].gain>0)?choices[0]:{optionId:null,targetId:null,gain:0,reason:'Decline: no legal Mystery reward has positive marginal value after its costs.'};
 }
 function shop(run){
  const choices=[];
  if(run.deck.length<60)run.shop.offers.forEach((o,index)=>{const price=x.E.shopPrice(run,o),gain=marginal(run,{key:o.key,upgraded:false});if(!run.shop.bought.includes(index)&&price<=run.gold&&gain>.01)choices.push({kind:'card',index,price,gain,reason:'Buy '+x.C.cards[o.key].name+' for positive marginal deck synergy.'});});
  for(const [index,o]of (run.shop.artifacts||[]).entries())if(o.id&&!o.locked&&!run.shop.artifactBought.includes(index)&&!x.A.has(run,o.id)){
   const price=x.E.shopPrice(run,o),value=artifacts.score(run,o.id,{price});
   if(price<=run.gold&&value.gain>0)choices.push({...value,kind:'artifact',index});
  }
  if(run.shop.version===2&&!run.shop.removed){const best=remove(run),price=x.E.shopRemovalPrice(run);if(best.uid&&best.gain>.01&&price<=run.gold)choices.push({...best,kind:'remove',price});}
  const reserve=run.hp<run.maxHp*.4?20:0,eligible=choices.filter(c=>run.gold-c.price>=reserve||c.gain>=.25).sort((a,b)=>b.gain/Math.max(1,b.price)-a.gain/Math.max(1,a.price)||a.kind.localeCompare(b.kind)||(a.index||0)-(b.index||0));
  return eligible[0]||{kind:'leave',reason:reserve?'Keep Gold for recovery; no purchase justifies the cost.':'Leave: no affordable positive marginal improvement.'};
 }
 return {reward,shop,camp,upgrade,remove,transform,mystery,artifact:artifacts.choose,experience:{status:evidence.status,id:evidence.id}};
}
module.exports={createDeckPolicy};
