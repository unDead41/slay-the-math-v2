'use strict';
const S='stm.';
const pools={
 attack:['attack.rune_strike','attack.weak_point','attack.twin_shot','attack.scout_strike','attack.sure_hit','attack.fate_storm','passive.blazing_spirit','passive.growing_flame','defend.rune_guard','defend.cinder_guard','skill.quick_study','skill.read_ahead'],
 block:['defend.rune_guard','defend.cinder_guard','defend.foreseen_guard','defend.layered_shield','defend.hold_the_line','defend.ember_wall','passive.swift_step','passive.battle_rhythm','passive.lasting_shield','attack.shield_shot','attack.weak_point','defend.burning_pages'],
 focus:['attack.rune_strike','attack.fate_storm','defend.tower_shield','defend.mana_barrier','skill.quick_study','skill.clear_choice','passive.ember_core','passive.last_ember','attack.weak_point','defend.cinder_guard'],
 passive:['passive.blazing_spirit','passive.growing_flame','passive.swift_step','passive.rune_armor','passive.clear_mind','passive.grimoire_ward','attack.rune_strike','attack.twin_shot','defend.rune_guard','defend.cinder_guard','skill.quick_study','skill.deep_study'],
 draw:['skill.quick_study','skill.deep_study','skill.burning_page','skill.recall','skill.read_ahead','skill.clear_choice','defend.flash_ward','attack.scout_strike','attack.fate_storm','attack.weak_point','defend.cinder_guard','passive.grimoire_ward']};
const packs={attack:['s02','e15','b02'],block:['s03','e16','b02'],focus:['s04','e10','b03'],passive:['s12','e12','b01'],draw:['s10','e05','b01']};
function deck(kind,size=18,upgradeRate=.33){const pool=pools[kind];if(!pool)throw Error('Unknown deck archetype');const out=['attack.rune_strike','attack.weak_point','defend.rune_guard','defend.cinder_guard','skill.quick_study','defend.flash_ward'];let i=0;while(out.length<size)out.push(pool[i++%pool.length]);return out.slice(0,size).map((key,index)=>({key:S+key,upgraded:(index*7%size)<Math.round(size*upgradeRate)}));}
function rank(x,r,key,kind){const d=x.C.cards[key],category=d.role;let n=(category==='attack'?3:category==='guard'?2:1);const index=pools[kind].indexOf(key.slice(4));if(index>=0)n+=3;if(category==='passive'&&r.deck.some(c=>c.key===key))n-=10;if(category==='passive'&&r.deck.filter(c=>x.C.cards[c.key].role==='passive').length>=4)n-=3;return n;}
module.exports={pools,packs,deck,rank};
