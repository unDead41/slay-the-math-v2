(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.STMArtifactCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const counts=()=>({cards:0,attack:0,defend:0,skill:0,passive:0,exhaust:0,discard:0});
const short=id=>id.split('_')[0];
const role=x=>({attack:'attack',defend:'defend',defense:'defend',guard:'defend',skill:'skill',tactic:'skill',passive:'passive'}[String(x||'').toLowerCase()]);
class ArtifactTracker{
 constructor(catalog,options={}){
  this.catalog=new Map(catalog.map(a=>[a.id,clone(a)]));this.ownedIds=new Set();this.discovered=new Map();this.collected=new Set();this.listeners=new Set();
  this.state={};this.battleId=null;this.turn=0;this.turnCounts=counts();this.combatCounts=counts();this.turnUsed=new Set();this.combatUsed=new Set();this.runUsed=new Set();this.eventIds=new Set();this.contributions={};this.setOwned(options.ownedIds||[]);
 }
 subscribe(fn){this.listeners.add(fn);return()=>this.listeners.delete(fn);}
 emit(e){for(const fn of this.listeners){try{fn(e);}catch(error){if(typeof console!=='undefined')console.error('Artifact UI listener failed',error);}}}
 known(id){return this.catalog.has(id);}
 setOwned(ids){this.ownedIds=new Set(ids.filter(id=>this.known(id)));for(const id of this.ownedIds){if(!this.discovered.has(id))this.discovered.set(id,'Collected');this.collected.add(id);}this.emit({type:'update'});}
 acquire(id,source='Reward'){if(!this.known(id)||this.ownedIds.has(id))return false;this.ownedIds.add(id);this.discover(id,source);this.collected.add(id);this.emit({type:'update'});return true;}
 discover(id,source='Encountered'){if(!this.known(id))return false;if(!this.discovered.has(id)){this.discovered.set(id,String(source));this.emit({type:'update'});}return true;}
 newRun(){this.ownedIds.clear();this.battleId=null;this.turn=0;this.turnUsed.clear();this.combatUsed.clear();this.runUsed.clear();this.eventIds.clear();this.turnCounts=counts();this.combatCounts=counts();this.contributions={};this.state={};this.emit({type:'update'});}
 sync(snapshot){this.state=clone(snapshot||{});this.emit({type:'update'});}
 startCombat(id){if(!id||id===this.battleId)return;this.battleId=String(id);this.turn=0;this.turnCounts=counts();this.combatCounts=counts();this.combatUsed.clear();this.turnUsed.clear();this.contributions={};this.emit({type:'update'});}
 startTurn(n){if(!Number.isSafeInteger(n)||n<1)throw Error('Turn must be a positive integer');if(n===this.turn)return;this.turn=n;this.turnCounts=counts();this.turnUsed.clear();this.emit({type:'update'});}
 cardResolved(e){if(!e||e.resolved!==true||e.from!=='hand')return false;this.turnCounts.cards++;this.combatCounts.cards++;const k=role(e.type);if(k){this.turnCounts[k]++;this.combatCounts[k]++;}this.emit({type:'update'});return true;}
 cardExhausted(e){if(e?.ownedByPlayer===false)return false;this.turnCounts.exhaust++;this.combatCounts.exhaust++;this.emit({type:'update'});return true;}
 cardDiscarded(e){if(e?.from!=='hand'||e?.cause!=='card_effect')return false;this.turnCounts.discard++;this.combatCounts.discard++;this.emit({type:'update'});return true;}
 scope(a){if(a.limit.includes('persistent'))return 'persistent';if(a.limit.includes('once_per_run'))return 'run';if(a.limit.includes('once_per_combat'))return 'combat';return 'turn';}
 usedSet(a){return this.scope(a)==='run'?this.runUsed:this.scope(a)==='combat'?this.combatUsed:this.turnUsed;}
 status(id){
  const a=this.catalog.get(id);if(!a||!this.ownedIds.has(id))return{state:'unowned',label:'Not owned',counter:null};
  const code=short(id),scope=this.scope(a),used=this.usedSet(a).has(id),s=this.state,t=this.turnCounts,c=this.combatCounts;
  if(scope==='persistent'){
   const best=this.discount([...this.ownedIds]);const lower=(a.values.discount_percent||0)<best;
   return{state:lower?'superseded':'active',label:lower?'Higher discount active':'Active',counter:null};
  }
  if(used)return{state:'used',label:scope==='run'?'Applied this run':scope==='combat'?'Used this combat':'Used this turn',counter:null};
  if(code==='e01')return{state:t.cards>=3?'ready':'waiting',label:t.cards>=3?'Ready':`Cards played: ${Math.min(3,t.cards)}/3`,counter:{current:Math.min(3,t.cards),target:3}};
  if(code==='e02'){const n=Math.min(1,t.attack)+Math.min(1,t.defend);return{state:n===2?'ready':'waiting',label:n===2?'Ready':`Attack ${Math.min(1,t.attack)}/1 · Defend ${Math.min(1,t.defend)}/1`,counter:{current:n,target:2}};}
  if(code==='e13')return{state:t.discard>0?'ready':'waiting',label:t.discard>0?'Ready':'Needs a card-effect Discard',counter:null};
  if(code==='e12'){const ok=finite(s.hp)&&finite(s.maxHp)&&s.hp>0&&2*s.hp<=s.maxHp;return{state:ok?'ready':'waiting',label:ok?'Ready':'Waiting for half HP',counter:null};}
  if(code==='e04')return{state:(s.energy||0)>=1?'ready':'waiting',label:(s.energy||0)>=1?'Ready at End Turn':'Needs 1 unspent Energy',counter:null};
  if(code==='b02'){const value=this.contributions[id]||0;return{state:value>=6?'capped':'ready',label:value>=6?'Contribution cap reached':`Contribution: ${value}/6`,counter:{current:value,target:6}};}
  if(code==='s08'||code==='s09')return{state:'waiting',label:'Apply when obtained',counter:null};
  if(code==='s01'||code==='e06')return{state:'waiting',label:'After victory',counter:null};
  if(code==='e09')return{state:'waiting',label:'Waiting for a fully blocked hit',counter:null};
  const first=a.trigger.includes('first_');
  if(first&&a.trigger.includes('exhaust'))return{state:(scope==='combat'?c.exhaust:t.exhaust)>0?'ready':'waiting',label:'First Exhaust',counter:null};
  if(first&&a.trigger.includes('skill'))return{state:(scope==='combat'?c.skill:t.skill)>0?'ready':'waiting',label:'First Skill',counter:null};
  if(first&&a.trigger.includes('passive'))return{state:c.passive>0?'ready':'waiting',label:'First Passive',counter:null};
  if(first&&a.trigger.includes('attack_card'))return{state:t.attack===1?'ready':'waiting',label:t.attack>1?'First Attack passed':'First Attack',counter:null};
  if(first&&a.trigger.includes('defend_card'))return{state:t.defend===1?'ready':'waiting',label:t.defend>1?'First Defend passed':'First Defend',counter:null};
  if(a.trigger.includes('first_player_turn'))return{state:this.turn===1?'ready':'waiting',label:this.turn===1?'Ready':'Opening turn only',counter:null};
  return{state:'ready',label:'Ready',counter:null};
 }
 recordActivation(e){
  const a=this.catalog.get(e?.artifactId);if(!a||!this.ownedIds.has(a.id)||typeof e.eventId!=='string'||!e.eventId||this.eventIds.has(e.eventId)||!Array.isArray(e.changes))return false;
  const used=this.usedSet(a);if(this.scope(a)!=='persistent'&&used.has(a.id))return false;
  const changes=e.changes.filter(x=>typeof x.stat==='string'&&finite(x.before)&&finite(x.after)).map(x=>({...clone(x),delta:x.after-x.before}));
  if(!changes.length)return false;
  this.eventIds.add(e.eventId);if(this.scope(a)!=='persistent')used.add(a.id);
  if(short(a.id)==='b02'){const increment=changes.find(x=>x.stat==='strength')?.delta||0;this.contributions[a.id]=Math.min(6,finite(e.artifactContribution)?e.artifactContribution:(this.contributions[a.id]||0)+increment);}
  if(changes.some(x=>x.delta!==0))this.emit({type:'activation',eventId:e.eventId,artifactId:a.id,name:a.name,battleId:this.battleId,turn:this.turn,changes,steps:Array.isArray(e.steps)?e.steps.map(String):[]});
  this.emit({type:'update'});return true;
 }
 discount(ids){return Math.max(0,...ids.map(id=>this.catalog.get(id)?.values.discount_percent||0));}
 synergies(candidateId){
  const groups=[{codes:['s06','e14'],text:'Highest discount only: 15%. Discounts do not add.'},{codes:['s02','e07'],text:'First Attack artifact bonus: +4 damage, once per card.'},{codes:['s03','e08'],text:'First Defend artifact bonus: +8 Block after the card calculation.'},{codes:['s01','e06'],text:'After victory: heal up to 7 HP, limited by Max HP.'},{codes:['e15','b02'],text:'Start combat with +5 Strength. The Clasp cap applies to its own contribution.'},{codes:['e16','b02'],text:'Start combat with +5 Agility. The Clasp cap applies to its own contribution.'},{codes:['s11','e05'],text:'The first Exhaust each combat can trigger both artifact bonuses.'},{codes:['s10','e10'],text:'The first Skill each combat can trigger both draw bonuses.'}];
  const available=new Set([...this.ownedIds,candidateId]);return groups.filter(g=>g.codes.some(c=>short(candidateId)===c)).map(g=>({...g,ids:g.codes.map(c=>[...this.catalog.keys()].find(id=>short(id)===c))})).filter(g=>g.ids.every(id=>available.has(id)));
 }
 preview(id,state={},options={}){
  const a=this.catalog.get(id);if(!a)throw Error('Unknown artifact');const v=a.values,code=short(id),owned=this.ownedIds.has(id),all=[...this.ownedIds,...(owned?[]:[id])];
  const p={artifactId:id,owned,results:[],synergies:this.synergies(id),timing:a.trigger.replaceAll('_',' '),notes:[],discount:null,price:null};
  if(options.kind==='buy'&&finite(options.price))p.purchasePrice=Math.max(1,Math.ceil(options.price*(100-this.discount([...this.ownedIds]))/100));
  const row=(stat,before,after,steps=[],timing)=>p.results.push({stat,before,after,delta:after-before,steps,timing:timing||p.timing});
  const add=(stat,n)=>{if(finite(state[stat]))row(stat,state[stat],state[stat]+n,[`${state[stat]} + ${n} = ${state[stat]+n}`]);else row(stat,0,n,[`Artifact bonus: +${n}`],'Artifact bonus; current stat not supplied');};
  if(v.discount_percent){const before=this.discount([...this.ownedIds]),after=this.discount(all);p.discount={before,after};row('discount',before,after,[`Highest owned discount: ${before}%`,`With this artifact: max(${before}%, ${v.discount_percent}%) = ${after}%`],'Shop purchases');if(finite(options.price)&&options.price>=0){const b=Math.max(1,Math.ceil(options.price*(100-before)/100)),n=Math.max(1,Math.ceil(options.price*(100-after)/100));p.price={before:b,after:n};row('price',b,n,[`Original price: ${options.price} Gold`,`Discount: ${options.price} × ${after} ÷ 100 = ${options.price*after/100} Gold`,`Round up final price: ${options.price*(100-after)/100} → ${n} Gold`],'Final Shop price');}}
  if(code==='s08'&&finite(state.maxHp)&&finite(state.hp)){row('maxHp',state.maxHp,state.maxHp+v.max_hp,[`${state.maxHp} + ${v.max_hp} = ${state.maxHp+v.max_hp}`],'When obtained');const after=Math.min(state.maxHp+v.max_hp,state.hp+v.heal);row('hp',state.hp,after,[`Max HP increases first to ${state.maxHp+v.max_hp}`,`${state.hp} + ${v.heal} = ${after}`],'When obtained');}
  else if(v.heal&&finite(state.hp)&&finite(state.maxHp)){const n=all.reduce((s,k)=>s+(this.catalog.get(k)?.trigger==='combat_won'?this.catalog.get(k).values.heal||0:0),0);const amount=n||v.heal;row('hp',state.hp,Math.min(state.maxHp,state.hp+amount),[`Requested healing: ${amount} HP`,`Available room: ${state.maxHp} − ${state.hp} = ${state.maxHp-state.hp}`,`Actual heal: min(${amount}, ${state.maxHp-state.hp}) = ${Math.min(amount,state.maxHp-state.hp)}`],'After victory');}
  if(v.gold)add('gold',v.gold);
  if(v.strength||v.agility||code==='b02'){
   for(const stat of ['strength','agility']){if(!v[stat]&&code!=='b02')continue;const total=ids=>ids.reduce((n,k)=>{const x=this.catalog.get(k);if(short(k)==='b02')return n+Math.min(6,3+Math.max(0,(options.turn||1)-1));return n+(x?.values[stat]||0);},0);row(stat,total([...this.ownedIds]),total(all),[...all.filter(k=>this.catalog.get(k)?.values[stat]||short(k)==='b02').map(k=>`${this.catalog.get(k).name}: +${short(k)==='b02'?Math.min(6,3+Math.max(0,(options.turn||1)-1)):this.catalog.get(k).values[stat]}`)],'Combat-start bonuses; not an immediate mid-combat stat change');}
  }
  if(v.block||v.block_bonus){const n=v.block||v.block_bonus;if(code==='e04'&&(state.energy||0)<1)p.notes.push('Needs at least 1 Energy at End Turn.');else add('block',n);}
  if(v.energy)add('energy',v.energy);
  if(v.draw){if(finite(state.handCount)&&finite(state.handLimit)&&finite(state.drawable)){const n=Math.max(0,Math.min(v.draw,state.handLimit-state.handCount,state.drawable));row('cards',state.handCount,state.handCount+n,[`Requested draw: ${v.draw}`,`Actual draw: min(${v.draw}, ${Math.max(0,state.handLimit-state.handCount)}, ${state.drawable}) = ${n}`]);}else p.notes.push(`Draw ${v.draw} extra card(s) when triggered; actual gain uses the core Hand and draw rules.`);}
  if(v.damage_bonus_per_card)row('damageBonus',0,v.damage_bonus_per_card,[`Artifact bonus: +${v.damage_bonus_per_card} damage once per eligible card`],'First eligible Attack; not final HP loss');
  if(v.retaliation_damage)p.notes.push('Retaliation starts at 6 damage; final enemy HP loss comes from the core damage resolver.');
  if(code==='e12'&&finite(state.maxHp))row('threshold',0,state.maxHp/2,[`50 ÷ 100 × ${state.maxHp} = ${state.maxHp/2}`,`Requires living HP at or below this threshold`],'Half-HP threshold');
  if(v.focus){if(finite(state.focus)&&finite(state.focusCap))row('focus',state.focus,Math.min(state.focusCap,state.focus+v.focus),[`${state.focus} + ${v.focus}, capped at ${state.focusCap}`]);else p.notes.push('Focus function/cap must be supplied by the active game.');}
  if(code==='e03')p.notes.push('One d6 roll per combat. Show only the actual rolled result; preview never rolls the die.');
  return p;
 }
 codex(){return[...this.catalog.values()].map(a=>({...clone(a),discovered:this.discovered.has(a.id),collected:this.collected.has(a.id),owned:this.ownedIds.has(a.id),foundAt:this.discovered.get(a.id)||null}));}
 save(){return clone({version:1,ownedIds:[...this.ownedIds],discovered:[...this.discovered],collected:[...this.collected],battleId:this.battleId,turn:this.turn,turnCounts:this.turnCounts,combatCounts:this.combatCounts,turnUsed:[...this.turnUsed],combatUsed:[...this.combatUsed],runUsed:[...this.runUsed],eventIds:[...this.eventIds],contributions:this.contributions,state:this.state});}
 restore(s){
  if(!s||s.version!==1||!Array.isArray(s.ownedIds))return false;
  for(const key of ['discovered','collected','turnUsed','combatUsed','runUsed','eventIds'])if(s[key]!==undefined&&!Array.isArray(s[key]))return false;
  for(const key of ['turnCounts','combatCounts'])if(s[key]!==undefined&&(!s[key]||Array.isArray(s[key])||typeof s[key]!=='object'||Object.values(s[key]).some(v=>!Number.isSafeInteger(v)||v<0)))return false;
  if(s.turn!==undefined&&(!Number.isSafeInteger(s.turn)||s.turn<0))return false;
  if(s.state!==undefined&&(!s.state||typeof s.state!=='object'||Array.isArray(s.state)))return false;
  if(s.contributions!==undefined&&(!s.contributions||typeof s.contributions!=='object'||Array.isArray(s.contributions)||Object.values(s.contributions).some(v=>!finite(v)||v<0||v>6)))return false;
  this.ownedIds=new Set(s.ownedIds.filter(x=>this.known(x)));this.discovered=new Map((s.discovered||[]).filter(x=>Array.isArray(x)&&this.known(x[0])));this.collected=new Set((s.collected||[]).filter(x=>this.known(x)));this.battleId=s.battleId||null;this.turn=s.turn||0;this.turnCounts={...counts(),...s.turnCounts};this.combatCounts={...counts(),...s.combatCounts};for(const k of ['turnUsed','combatUsed','runUsed'])this[k]=new Set((s[k]||[]).filter(x=>this.known(x)));this.eventIds=new Set((s.eventIds||[]).filter(x=>typeof x==='string'));this.contributions=clone(s.contributions||{});this.state=clone(s.state||{});return true;
 }
}
return{ArtifactTracker,version:'1.0.0'};
});
