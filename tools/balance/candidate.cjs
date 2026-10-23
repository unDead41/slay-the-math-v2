'use strict';
const spec=require('./specs/balance-spec.v1.2.json');
const copy=x=>JSON.parse(JSON.stringify(x));
function cards(data){
 const out=copy(data);out.balanceVersion='sor-v1.2-experiment';out.rules.thorns_cap=6;out.rules.artifact_discard_scope='hand_only';
 for(const c of out.cards){
  const s=spec.cards.find(x=>x.id===c.id),p=s.numeric_patch,v=c.values;
  c.energy=s.proposed_energy==='X'?{kind:'all_remaining',minimum:1}:{kind:'fixed',amount:s.proposed_energy};
  c.upgrade={values:{},limits:{},costReduction:0};
  const set=(field,base,focus,upgrade=0)=>{v[field]={...v[field],base,focus_bonus:focus};if(upgrade)c.upgrade.values[field]=upgrade;};
  if(c.category==='attack'){
   if(c.name==='Twin Shot'){set('first',3,p.focus_first_hit,p.upgrade_first_hit);set('second',3,0);}
   else if(c.name==='Fate Storm'){set('first',5,p.focus_first_hit,p.upgrade_first_hit);set('other',5,0);}
   else if(c.name==='Rune Sweep'){set('damage',12,p.focus_damage_main,p.upgrade_damage_main);set('other',12,0);}
   else set('damage',p.damage,p.focus_damage,p.upgrade_damage);
   const primary=c.actions.find(a=>a.op==='damage')?.value;
   for(const [field,value]of Object.entries(v))if(value.stat==='strength'&&field!==primary)delete value.stat;
  }else if(c.category==='defend'){
   set('block',p.block??p.block_now??0,p.focus_block??p.focus_block_now??3,p.upgrade_block??p.upgrade_block_now);
   if(c.name==='Mana Barrier'){v.block.energy_multiplier=p.block_per_energy;v.block.focus_formula={cap:6,energy_add:2};}
   if(c.name==='Layered Shield'){set('later',p.block_later,0);delete v.later.stat;}
  }else if(c.category==='skill'){
   if(['Quick Study','Deep Study','Last Page'].includes(c.name))set('draw',p.draw,p.focus_draw,p.upgrade_draw);
   if(c.name==='Mana Reading'){
    set('draw',2,1);delete v.draw.energy_multiplier;set('laterDraw',1,0,1);
    c.actions.push({op:'draw',value:'laterDraw',target:'self',timing:'next_player_turn_draw_phase',once:true});
   }
   if(['Read Ahead','Clear Choice'].includes(c.name))set('look',p.look,p.focus_look,p.upgrade_look);
   if(c.name==='Card Search')set('search',p.search,p.focus_search,p.upgrade_search);
   if(c.name==='Burning Page')set('replace',p.replacements,p.focus_replacements,p.upgrade_replacements);
   if(c.name==='Recall')set('extra',p.draw_extra,p.focus_draw_extra,p.upgrade_draw_extra);
   if(c.name==='Next Chapter')set('laterDraw',p.draw_later,p.focus_draw_later,p.upgrade_draw_later);
  }else{
   for(const field of ['strength','agility','defense','block','damage','retain'])if(p[field]!==undefined)set(field,p[field],0,p['upgrade_'+field]);
   if(['Growing Flame','Battle Rhythm'].includes(c.name)){
    const attr=c.name==='Growing Flame'?'strength':'agility';set(attr,1,0);
    c.upgrade.limits.every_n_cards=2;c.upgrade.values.every=-1;
   }
   if(p.upgrade_first_activation_block)c.upgrade.activation={block:p.upgrade_first_activation_block};
   if(p.upgrade_first_activation_draw)c.upgrade.activation={draw:p.upgrade_first_activation_draw};
  }
  if(p.exhaust)c.lifecycle='exhaust';
 }
 return out;
}
function artifacts(data){
 const out=copy(data);
 for(const a of out.artifacts){const s=spec.artifacts.find(x=>x.id===a.id);if(s&&!['s06','s09','e14'].some(k=>a.id.startsWith(k)))a.values=copy(s.proposed_values);}
 return out;
}
function config(C,difficulty){
 const profile=spec.profiles[difficulty];if(!profile)throw Error('Unknown benchmark difficulty '+difficulty);
 C.MAX_HP=profile.starting_max_hp;
 C.COMBAT_BALANCE={version:'sor-v1.2-experiment',difficulty,profile:copy(profile),brooch_requires_block:true};
 for(const e of spec.enemies){const old=C.enemies[e.id];C.enemies[e.id]={...old,hp:e.hp,defense:e.defense,tier:e.tier,patterns:e.patterns.map((p,i)=>({damage:p.damage_per_hit,hits:p.hits,block:p.block,label:old.patterns[i]?.label||'Intent '+(i+1)}))};}
 return C;
}
module.exports={cards,artifacts,config,spec};
