'use strict';
const assert=require('node:assert/strict'),{loadEngine}=require('./loader.cjs'),D=require('./deep.cjs');
const key=(x,name)=>x.data.cards.find(c=>c.name===name).id;
function arrange(r,keys){const b=r.battle,all=[...b.hand,...b.draw,...b.discard];b.hand=[];b.discard=[];for(const k of keys){const i=all.findIndex(c=>c.key===k);if(i<0)throw Error('Unavailable fixture card '+k);b.hand.push(all.splice(i,1)[0]);}b.draw=all;}
function play(x,r,name){const c=r.battle.hand.find(c=>c.key===key(x,name));assert.ok(c,'Missing '+name);x.E.playCard(r,c.uid);while(x.E.cardChoice(r)){const ch=x.E.cardChoice(r),value=ch.kind==='card_search'?'attack':ch.kind==='burning_page'?'take':ch.kind==='read_ahead'?{take:ch.candidates[0].uid,order:ch.candidates.slice(1).map(c=>c.uid)}:ch.candidates[0].uid;x.E.chooseCardOption(r,value);}assert.ok(x.E.restore(x.E.clone(r)),'Restore after '+name);}
function probeAll(build='candidate'){
 const x=loadEngine({build}),{E,A}=x,rows=[];let observed=[];const record=x.R.record;x.R.record=function(...args){const e=record(...args);if(e)observed.push(E.clone(e));return e;};
 for(const a of Object.values(A.catalog)){
  observed=[];const code=a.id.slice(0,3),classification=['s06','e14'].includes(code)?'noncombat_quote':['s08','s09'].includes(code)?'acquisition':code==='e13'?'unsupported_hand_discard':'combat';let notes=[],r;
  try{
   r=D.create(x,{seed:42,enemy:'sentinel',deck:x.data.cards.map(c=>c.id),artifacts:[code],hpRatio:code==='e12'?.4:1});const named=names=>arrange(r,names.map(n=>key(x,n))),own=()=>observed.filter(e=>e.artifactIds.includes(a.id));
   if(['s06','e14'].includes(code)){const quote=A.price(r,101);assert.equal(quote,Math.ceil(101*(1-a.values.discount_percent/100)));notes.push({base:101,actual:quote});}
   else if(code==='s08'){assert.equal(r.maxHp,x.C.MAX_HP+a.values.max_hp);assert.throws(()=>A.acquire(r,a.id,'shop:0:duplicate'));assert.equal(E.restore(E.clone(r)).maxHp,r.maxHp);}
   else if(code==='s09'){assert.equal(r.gold,x.C.ECONOMY.start+a.values.gold);assert.throws(()=>A.acquire(r,a.id,'shop:0:duplicate'));assert.equal(E.restore(E.clone(r)).gold,r.gold);}
   else if(['s02','e07'].includes(code)){named(['Rune Strike','Weak Point']);assert.equal(E.cardPlan(r,r.battle.hand[0]).damageEvents[0].beforeDefense,6+a.values.damage_bonus_per_card);play(x,r,'Rune Strike');assert.equal(E.cardPlan(r,r.battle.hand[0]).damageEvents[0].beforeDefense,4);play(x,r,'Weak Point');}
   else if(['s03','e08'].includes(code)){named(['Rune Guard','Cinder Guard']);const b=r.battle.block;play(x,r,'Rune Guard');assert.equal(r.battle.block-b,6+a.values.block_bonus);play(x,r,'Cinder Guard');assert.equal(r.battle.block-b,11+a.values.block_bonus);notes.push({type:'engine-plan-and-resolved-block',actualTotal:r.battle.block-b,receipts:E.clone(r.battle.cardCombat.receipts)});}
   else if(code==='s04'){assert.equal(r.battle.focus,a.values.focus);E.endTurn(r);assert.equal(r.battle.focus,a.values.focus);}
   else if(['s05','e11'].includes(code)){assert.equal(r.battle.hand.length,4+a.values.draw);E.endTurn(r);assert.equal(r.battle.hand.length,4);}
   else if(code==='s07'){assert.equal(r.battle.block,a.values.block);E.endTurn(r);assert.equal(r.battle.block,0);}
   else if(['s10','e10'].includes(code)){named(['Quick Study','Read Ahead']);play(x,r,'Quick Study');play(x,r,'Read Ahead');assert.equal(own().length,1);if(code==='e10'){E.endTurn(r);named(['Clear Choice']);play(x,r,'Clear Choice');assert.equal(own().length,2);}}
   else if(['s11','e05'].includes(code)){named(['Rune Strike','Flash Ward','Recall']);play(x,r,'Rune Strike');play(x,r,'Flash Ward');play(x,r,'Recall');assert.equal(own().length,1);assert.equal(r.battle.artifacts[code==='s11'?'combat':'turn'][code==='s11'?'pebble':'exhaust'],true);}
   else if(code==='s12'){named(['Blazing Spirit','Swift Step']);const b=r.battle.block;play(x,r,'Blazing Spirit');play(x,r,'Swift Step');assert.equal(r.battle.block-b,a.values.block);assert.equal(own().length,1);assert.ok(A.eligible(r,a));}
   else if(code==='e01'){named(['Rune Strike','Rune Guard','Quick Study','Cinder Guard']);play(x,r,'Rune Strike');play(x,r,'Rune Guard');play(x,r,'Quick Study');assert.equal(r.battle.energy,1);play(x,r,'Cinder Guard');assert.equal(r.battle.energy,0);assert.equal(own().length,1);}
   else if(code==='e02'){named(['Rune Strike','Rune Guard','Cinder Guard']);play(x,r,'Rune Strike');play(x,r,'Rune Guard');play(x,r,'Cinder Guard');assert.equal(own().length,1);assert.equal(r.battle.block,11+a.values.block);}
   else if(code==='e03'){const seen=new Set([r.battle.artifacts.die]);for(let i=1;i<=120&&seen.size<6;i++){const seed=Math.imul(i,0x9e3779b9)>>>0,t=D.create(x,{seed,enemy:'sentinel',deck:x.data.cards.map(c=>c.id),artifacts:[code]}),n=t.battle.artifacts.die;seen.add(n);assert.equal(E.restore(E.clone(t)).battle.artifacts.die,n);if(n<=2)assert.equal(t.battle.block,a.values.faces_1_2.block);else if(n<=4)assert.equal(t.battle.hand.length,4+a.values.faces_3_4.draw);else assert.equal(t.battle.energy,3+a.values.faces_5_6.energy);}assert.equal(seen.size,6);notes.push({faces:[...seen].sort()});}
   else if(code==='e04'){E.endTurn(r);assert.equal(own().length,1);assert.equal(own()[0].results[0].value,a.values.block);}
   else if(['s01','e06'].includes(code)){const result=D.simulate(x,{seed:18,enemy:'wisp',deck:Array(12).fill('stm.attack.rune_strike'),artifacts:[code],hpRatio:.6,predictProfile:'independent',returnRun:true});assert.equal(result.status,'WIN',result.error);r=result.run;const e=own().filter(e=>e.results.some(v=>v.label==='HP restored'));assert.equal(e.length,1);assert.equal(e[0].results[0].value,a.values.heal);}
   else if(code==='e09'){named(['Tower Shield']);play(x,r,'Tower Shield');const hp=r.battle.hp;E.endTurn(r);assert.ok(r.battle.hp<hp);assert.equal(own().length,1);assert.equal(r.battle.artifacts.turn.retaliation,false);}
   else if(code==='e12'){assert.ok(r.battle.artifacts.combat.flask);assert.equal(r.battle.block,a.values.block);E.endTurn(r);assert.equal(own().length,1);}
   else if(code==='e13'){assert.equal(A.eligible(r,a),false);named(['Clear Choice']);play(x,r,'Clear Choice');assert.equal(own().length,0,'pile selection is not hand discard');notes.push('No current card exposes hand discard; negative exclusion only.');}
   else if(code==='e15'){assert.equal(r.battle.strength,a.values.strength);named(['Rune Strike']);assert.equal(E.cardPlan(r,r.battle.hand[0]).damageEvents[0].beforeDefense,6+a.values.strength);play(x,r,'Rune Strike');}
   else if(code==='e16'){assert.equal(r.battle.agility,a.values.agility);named(['Rune Guard']);play(x,r,'Rune Guard');assert.equal(r.battle.block,6+a.values.agility);}
   else if(code==='b01'){for(let i=0;i<3;i++){assert.equal(r.battle.energy,3+a.values.energy);E.endTurn(r);}assert.equal(own().length,4);}
   else if(code==='b02'){for(let i=1;i<=5;i++){assert.equal(r.battle.strength,Math.min(a.values.max_artifact_contribution_each_stat,a.values.initial_strength+i-1));assert.equal(r.battle.agility,r.battle.strength);if(i<5)E.endTurn(r);}}
   else if(code==='b03'){for(let i=0;i<3;i++){assert.equal(r.battle.hand.length,4+a.values.draw);E.endTurn(r);}assert.equal(own().length,4);}
   else throw Error('No probe for '+code);
   assert.ok(E.validate(r));assert.ok(E.restore(E.clone(r)));const evidence=[...own(),...notes.filter(n=>n?.type==='engine-plan-and-resolved-block')];if(classification==='combat')assert.ok(evidence.length,'Artifact was not exposed');rows.push({id:a.id,name:a.name,build,classification,status:'PASS',notes,evidence,validFinal:true});
  }catch(e){rows.push({id:a.id,name:a.name,build,classification,status:'FAIL',error:e.message,notes,evidence:observed.filter(e=>e.artifactIds.includes(a.id))});}
 }return rows;
}
module.exports={probeAll,arrange,play};
