'use strict';
// Offline screening only: these predicates and policy preferences are NOT CP.
const E=require('../../dist/engine.js'),C=require('../../dist/config.js'),K=require('../../dist/card-kit.js'),Eco=require('../../dist/economy.js'),A=require('../../dist/artifacts.js');
const cards=Object.fromEntries(K.data.cards.map(c=>[c.id,c]));
const id=(category,name)=>'stm.'+category+'.'+name;
const repeat=(key,n)=>Array(n).fill(key);
const starter=C.STARTER.flatMap(([key,n])=>repeat(key,n));
const all=K.data.cards.map(c=>c.id),category=c=>all.filter(k=>cards[k].category===c);
const fixtureDecks={
 starter,
 lean_10:[...repeat(id('attack','rune_strike'),5),...repeat(id('defend','rune_guard'),5)],
 attack_only:category('attack'),
 block_heavy:[...category('defend'),...repeat(id('attack','rune_strike'),3),...repeat(id('skill','quick_study'),3)],
 skill_focus:[...category('skill'),id('attack','rune_strike'),id('attack','shield_shot'),id('defend','rune_guard'),id('passive','ember_core')],
 passive_draw:[...repeat(id('attack','rune_strike'),4),...repeat(id('defend','rune_guard'),4),id('passive','clear_mind'),id('passive','grimoire_ward')],
 passive_saturated:[...starter,...category('passive')],
 duplicate_heavy:[...repeat(id('attack','rune_strike'),4),...repeat(id('defend','rune_guard'),4),...repeat(id('skill','quick_study'),4)],
 large_mixed:all,
 upgraded_mixed:all.slice(0,20),
 exhaust_heavy:[...starter.slice(0,6),...repeat(id('skill','next_chapter'),3),...repeat(id('skill','recall'),3)],
 passive_only:category('passive')
};
const fixtureNames=Object.keys(fixtureDecks),contexts=[{stage:0,depth:1},{stage:0,depth:6},{stage:1,depth:6}];
const clone=x=>JSON.parse(JSON.stringify(x));
function createFixture(name,seed,difficulty='medium',support=true,context={stage:0,depth:1}){
 if(!fixtureDecks[name])throw Error('Unknown deck fixture '+name);
 const deck=fixtureDecks[name].map((key,i)=>({uid:'c'+(i+1),key,upgraded:name==='upgraded_mixed'}));
 const r={seed:seed>>>0,stage:context.stage,depth:context.depth,seq:deck.length,deck,rng:(seed^0x1234)>>>0,artifactState:{owned:[]},educationState:{rng:(seed^0x5678)>>>0,runUsedIds:[]}};
 Eco.init(r,{difficulty,support});return r;
}
const hasOp=(c,op)=>c.actions?.some(a=>a.op===op)||c.passive?.effects?.some(e=>e.op===op||e.actions?.some(a=>a.op===op));
function describeCard(r,key,receipt=null){
 const c=cards[key];if(!c)throw Error('Unknown card '+key);
 const deck=r.deck.map(x=>cards[x.key]).filter(Boolean),arts=(r.artifactState?.owned||[]).map(k=>A.catalog[k]).filter(Boolean);
 const other=deck.filter(x=>x.id!==key);
 const capabilities={attack:deck.some(c=>c.category==='attack'),defend:deck.some(c=>c.category==='defend'),skill:deck.some(c=>c.category==='skill'),
  block:deck.some(c=>hasOp(c,'grant_block')||c.values?.block?.base>0)||arts.some(a=>a.values.block>0||a.values.block_bonus>0||a.values.faces_1_2?.block>0),
  focus:deck.some(c=>c.focus_eligible),discardable_other:other.some(c=>c.lifecycle==='discard_after_resolution'),
  zero_or_draw_selection:other.some(c=>c.energy.kind==='fixed'&&c.energy.amount===0||['draw','look_choose_reorder','look_replace_take','look_choose_discard','search_category'].some(op=>hasOp(c,op))),
  searchable_category:other.some(c=>['attack','defend','skill','passive'].includes(c.category))};
 const requirements=Eco.data.requirements[key]||[],missingRequirements=requirements.filter(x=>!capabilities[x]),copies=r.deck.filter(c=>c.key===key).length;
 const redundantPassive=c.category==='passive'&&copies>0,thirdOrLaterCopy=copies>=2,tagReady=missingRequirements.length===0;
 return {id:key,category:c.category,copies,requirements,missingRequirements,tagReady,redundantPassive,thirdOrLaterCopy,actionableProxy:tagReady&&!redundantPassive&&!thirdOrLaterCopy,upgradeOpportunity:!!receipt?.upgraded&&r.deck.some(c=>c.key===key&&!c.upgraded),combatPower:null,powerStatus:'UNMEASURED'};
}
function summarize(values){
 if(!values.length)return {n:0,min:null,p05:null,median:null,p95:null,max:null,mean:null};
 const xs=values.slice().sort((a,b)=>a-b),q=p=>xs[Math.max(0,Math.ceil(p*xs.length)-1)];
 return {n:xs.length,min:xs[0],p05:q(.05),median:q(.5),p95:q(.95),max:xs.at(-1),mean:xs.reduce((a,b)=>a+b,0)/xs.length};
}
function hash(seed,key){let x=(2166136261^(seed>>>0))>>>0;for(const c of key)x=Math.imul(x^c.charCodeAt(0),16777619)>>>0;return x>>>0;}
const seeds=n=>Array.from({length:n},(_,i)=>(0xed100001+Math.imul(i,104729))>>>0);
module.exports={E,C,K,Eco,A,cards,clone,fixtureNames,fixtureDecks,contexts,createFixture,describeCard,summarize,hash,seeds};
