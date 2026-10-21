(function(root){'use strict';
const cards={
 strike:{name:'Slash',role:'attack',element:'neutral',cost:1,damage:6,up:3,icon:'sword',text:'A quick blade attack.'},
 ember:{name:'Ember',role:'attack',element:'fire',cost:1,damage:6,up:3,icon:'flame',text:'Strike with a small flame.'},
 guard:{name:'Guard',role:'guard',element:'ice',cost:1,block:5,up:3,icon:'shield',text:'Block damage this turn.'},
 flameguard:{name:'Flame Guard',role:'guard',element:'fire',cost:1,block:5,up:3,icon:'shield',text:'A Defense card with the Fire element.'},
 filter:{name:'Filter',role:'tactic',element:'neutral',cost:1,filter:2,up:1,icon:'filter',text:'Exhaust chosen cards from your Draw Pile. Leave at least 2 cards there and 6 active cards in battle.'},
 draw:{name:'Draw',role:'tactic',element:'neutral',cost:1,draw:2,up:1,icon:'cards',text:'Draw extra cards from your Draw Pile.'},
 blast:{name:'Fire Blast',role:'attack',element:'fire',cost:2,damage:15,up:5,icon:'flame',text:'Use more Energy for a strong attack.'},
 fort:{name:'Ice Wall',role:'guard',element:'ice',cost:2,block:12,up:4,icon:'shield',text:'Build a strong wall for this turn.'},
 balance:{name:'Balance',role:'attack',element:'neutral',cost:1,damage:4,block:4,up:2,icon:'balance',text:'Deal damage and gain Block. This is an Attack card.'},
 clarity:{name:'Clarity',role:'tactic',element:'ice',cost:0,focus:1,up:1,exhaust:true,icon:'orb',text:'Gain Focus. Exhaust this card after use.'},
 pierce:{name:'Pierce',role:'attack',element:'ice',cost:2,damage:12,up:4,pierce:true,icon:'sword',text:'Ignore enemy Block. Boss seals still reduce damage.'},
 renew:{name:'Heal',role:'tactic',element:'fire',cost:2,heal:6,up:3,exhaust:true,icon:'leaf',text:'Restore HP. Exhaust this card after use.'}
};
const enemies={
 wisp:{name:'Ember Mirror',title:'Burning Reflection',art:'s1_ember_mirror.webp',hp:30,patterns:[{damage:6,label:'Spark'},{damage:8,label:'Flame Burst'},{damage:5,block:3,label:'Fire Shield'}]},
 beetle:{name:'Prism Guard',title:'Crystal Sentinel',art:'s1_prism_guard.webp',hp:36,patterns:[{damage:7,block:3,label:'Shell Guard'},{damage:10,label:'Charge'},{damage:5,label:'Stalk'}]},
 knight:{name:'Mirror Knight',title:'Sigil Keep Elite',art:'s1_mirror_knight.webp',hp:44,patterns:[{damage:8,label:'Slash'},{damage:6,block:5,label:'Guard Up'},{damage:13,label:'Heavy Strike'}]},
 shade:{name:'Deck Guard',title:'Deck Tower Sentinel',art:'s2_deck_guard.webp',hp:48,patterns:[{damage:9,label:'Dark Pulse'},{damage:7,block:4,label:'Mist Shield'},{damage:14,label:'Dark Wave'}]},
 sentinel:{name:'Twin Sigil Guardian',title:'Boss · Sigil Keep',art:'s1_twin_sigil_guardian.webp',hp:70,boss:true,seals:['exclusive','overlap'],patterns:[{damage:8,label:'Stone Fist'},{damage:8,block:4,label:'Rune Shield'},{damage:12,label:'Double Strike'}]},
 dealer:{name:'Deck Lord',title:'Boss · Deck Tower',art:'s2_deck_lord.webp',hp:95,boss:true,seals:['pairWithout','pairWith'],patterns:[{damage:9,label:'Sharp Cards'},{damage:12,block:4,label:'Dark Veil'},{damage:16,label:'Rune Storm'}]}
};
enemies.bat={...enemies.wisp,name:'Rune Bat',title:'Crystal Wings',art:'s1_rune_bat.webp'};enemies.shard={...enemies.knight,name:'Shard Beast',title:'Sigil Keep Elite',art:'s1_shard_beast.webp'};enemies.weaver={...enemies.wisp,name:'Chain Weaver',title:'Chain Caster',art:'s2_chain_weaver.webp'};enemies.mimic={...enemies.shade,name:'Card Mimic',title:'A Hungry Deck',art:'s2_card_mimic.webp'};enemies.golem={...enemies.shade,name:'Chain Golem',title:'Deck Tower Elite',art:'s2_chain_golem.webp'};enemies.reaper={...enemies.shade,name:'Rune Reaper',title:'Deck Tower Elite',art:'s2_rune_reaper.webp'};
const stages=[{name:'Sigil Keep',subtitle:'Explore the dungeon. Learn how events overlap.',color:'gold',boss:'sentinel',basic:'wisp',ordinary:'beetle',elite:'knight',normals:['wisp','beetle','bat'],elites:['shard','knight']},{name:'Deck Tower',subtitle:'Climb deeper. Learn how two draws work.',color:'ice',boss:'dealer',basic:'knight',ordinary:'shade',elite:'shade',normals:['weaver','shade','mimic'],elites:['golem','reaper']}];
const C={MC:{id:'mc_01',name:'Alyssa',title:'the Clairvoyance'},ECONOMY:{start:80,battle:25,elite:40,boss:60,prices:{0:60,1:45,2:65}},VERSION:1,MAX_HP:60,ENERGY:3,HAND:4,FOCUS_CAP:3,BOOST:3,cards,enemies,stages,roles:{attack:'Attack',guard:'Defense',tactic:'Skill'},elements:{fire:'Fire',ice:'Ice',neutral:'Neutral'}};
if(typeof module!=='undefined')module.exports=C;else root.DCConfig=C;
})(typeof window!=='undefined'?window:globalThis);
