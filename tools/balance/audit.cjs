'use strict';
const {create}=require('./combat.cjs');
const modes=['normal','focus','upgrade','upgrade_focus'];
function resolve(E,r){let count=0;while(E.cardChoice(r)){if(++count>15)throw Error('Unbounded choice');const ch=E.cardChoice(r);E.chooseCardOption(r,ch.kind==='card_search'?'attack':ch.kind==='burning_page'?'take':ch.kind==='read_ahead'?{take:ch.candidates[0].uid,order:ch.candidates.slice(1).map(c=>c.uid)}:ch.candidates[0].uid);}}
function one(x,id,mode,extra={}){
 const up=mode.includes('upgrade'),focused=mode.includes('focus'),{E}=x;
 const r=create(x,{seed:20261023,enemy:'sentinel',slots:[id],upgradedSlots:up?[0]:[],openingSlots:true,initialFocus:focused?1:0,...extra});
 const c=r.battle.hand.find(c=>c.key===id);r.battle.enemyBlock=extra.enemyBlock??0;r.battle.enemyDefense=extra.enemyDefense??r.battle.enemyDefense;
 if(id.endsWith('.recall')&&!r.battle.discard.length)r.battle.discard.push(r.battle.draw.pop());
 if(extra.energy!==undefined)r.battle.energy=extra.energy;
 if(extra.handSize){const b=r.battle;while(b.hand.length<extra.handSize&&b.draw.length)b.hand.push(b.draw.pop());while(b.hand.length>extra.handSize)b.draw.push(b.hand.splice(b.hand.findLastIndex(c=>c.key!==id),1)[0]);}
 if(extra.emptyPiles){r.battle.hand.push(...r.battle.draw.splice(0),...r.battle.discard.splice(0));r.battle.exhaust.push(...r.battle.hand.splice(1));}
 if(focused)E.armFocus(r);
 const p=E.cardPlan(r,c),before={hp:r.battle.hp,block:r.battle.block,energy:r.battle.energy,focus:r.battle.focus,hand:r.battle.hand.length};
 const result={id,mode,context:extra,legal:p.legal,focusEligible:p.card.focus_eligible,focused:p.focused,focusReason:p.focusReason,cost:p.payEnergy,values:p.values,damageEvents:p.damageEvents,actions:p.actions};
 if(!p.legal){const snapshot=JSON.stringify(r);try{E.playCard(r,c.uid);throw Error('Illegal card committed');}catch(e){if(JSON.stringify(r)!==snapshot)throw Error('Illegal action mutated state');}return {...result,status:'REJECTED_LEGALLY',valid:E.validate(r)};}
 E.playCard(r,c.uid);resolve(E,r);const b=r.battle;
 result.actual={hpDamage:before.hp-b.hp,block:b.block-before.block,energy:before.energy-b.energy,focus:before.focus-b.focus,handChange:b.hand.length-before.hand,stats:{strength:b.strength,agility:b.agility,defense:b.defense},queue:E.clone(b.cardCombat.queue),destination:b.active.some(x=>x.uid===c.uid)?'active':b.exhaust.some(x=>x.uid===c.uid)?'exhaust':'discard'};
 result.valid=E.validate(r)&&!!E.restore(E.clone(r));if(!result.valid)throw Error('Audit state/restore failed '+id+' '+mode);
 result.status='EXECUTED_AND_RESTORED';return result;
}
function audit(x){
 const rows=[];for(const c of x.data.cards)for(const mode of modes){try{rows.push(one(x,c.id,mode));}catch(e){rows.push({id:c.id,mode,status:'ERROR',error:e.message});}}
 const boundaries=[];
 for(const energy of [0,1,2,3,4])for(const id of ['stm.attack.fate_storm','stm.defend.mana_barrier','stm.skill.mana_reading'])try{boundaries.push(one(x,id,'upgrade_focus',{energy,artifacts:['b01']}));}catch(e){boundaries.push({id,energy,status:'ERROR',error:e.message});}
 for(const handSize of [8,9,10])for(const id of ['stm.skill.quick_study','stm.skill.read_ahead','stm.skill.recall'])try{boundaries.push(one(x,id,'upgrade_focus',{handSize}));}catch(e){boundaries.push({id,handSize,status:'ERROR',error:e.message});}
 for(const id of ['stm.skill.quick_study','stm.skill.burning_page'])try{boundaries.push(one(x,id,'focus',{emptyPiles:true}));}catch(e){boundaries.push({id,status:'ERROR',error:e.message});}
 return {build:x.build,difficulty:x.difficulty,rows,boundaries};
}
module.exports={audit,one,modes,resolve};
