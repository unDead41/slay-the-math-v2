'use strict';

// Current-rule, real-engine contracts. The caller supplies one isolated ordinary
// or Master cartridge; this file never substitutes the archived balance model.
// Fixtures arrange owned cards and refill Energy between scripted plays to make
// long exploit sequences bounded. Enemy HP/intent/status preconditions are explicit.
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const D=require('../deep.cjs');
const copy=value=>JSON.parse(JSON.stringify(value));
const hash=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

function runContracts(x){
 const {E,C,Q,L}=x,rows=[];
 const key=name=>{const d=x.data.cards.find(c=>c.name===name);assert.ok(d,'Current card exists: '+name);return d.id;};
 const entries=r=>L.entries(r);
 function mechanical(r){
  const out=copy(r);delete out.notice;delete out.textLocale;
  if(out.battle){delete out.battle.log;if(out.battle.currentIntent)delete out.battle.currentIntent.label;}
  return out;
 }
 function invariant(r,label){
  const b=r.battle,all=['hand','draw','discard','exhaust','active','resolving'].flatMap(zone=>b[zone]||[]).concat(b.cardChoice?.committed?b.cardChoice.candidates:[]);
  assert.deepEqual(all.map(c=>c.uid).sort(),r.deck.map(c=>c.uid).sort(),label+': each physical UID occurs once');
  for(const card of all)assert.ok(r.deck.some(owned=>owned.uid===card.uid&&owned.key===card.key&&owned.upgraded===card.upgraded),label+': physical identity remains owned');
  assert.ok(b.active.length<=3,label+': maximum three active Passives');
  assert.equal(new Set(b.active.map(c=>c.key)).size,b.active.length,label+': one active copy per definition');
  assert.ok(b.hand.length<=C.HAND_LIMIT,label+': Hand capacity');
  assert.ok(E.validate(r),label+': current engine validates');
 }
 function contract(id,title,fn){
  const observations=[],restores=[];
  const note=(label,actual)=>observations.push({label,actual:copy(actual)});
  const reload=(r,label)=>{
   invariant(r,label);const before=hash(mechanical(r)),next=E.restore(copy(r));
   assert.ok(next,label+': restore succeeds');assert.equal(hash(mechanical(next)),before,label+': restore preserves mechanics');
   invariant(next,label+' restored');restores.push(label);return next;
  };
  const rejects=(r,label,fn)=>{
   const before=hash(r);assert.throws(fn,label+': action is rejected');assert.equal(hash(r),before,label+': rejected action is atomic');
  };
  try{fn({note,reload,rejects});rows.push({id,title,status:'PASS',observations,restores});}
  catch(error){rows.push({id,title,status:'FAIL',error:String(error.message).slice(0,1800),observations,restores});}
 }
 function fixture(specs=[],options={}){
  const named=specs.map(v=>typeof v==='string'?{name:v}:v),deck=named.map(v=>({key:key(v.name),upgraded:!!v.upgraded}));
  while(deck.length<(options.size??36))deck.push({key:key('Rune Strike'),upgraded:false});
  const r=D.create(x,{seed:724019,enemy:'sentinel',deck,artifacts:options.artifacts||[],initialHp:options.hp});
  Object.assign(r.battle,{hp:10000,maxHp:10000,enemyDefense:0,enemyBlock:0,seals:C.enemies.sentinel.seals.length,focus:0});
  Object.assign(r.battle.currentIntent,{damage:0,hits:1});
  invariant(r,'fixture');return {r,uids:r.deck.slice(0,named.length).map(c=>c.uid)};
 }
 function available(r,uidOrName){
  const b=r.battle,all=[...b.hand,...b.draw,...b.discard],c=all.find(c=>c.uid===uidOrName)||all.find(c=>c.key===key(uidOrName));
  assert.ok(c,'An available owned card is required: '+uidOrName);return c;
 }
 function hand(r,selectors){
  const b=r.battle,all=[...b.hand,...b.draw,...b.discard],wanted=selectors.map(selector=>available(r,selector).uid);
  assert.equal(new Set(wanted).size,wanted.length,'Fixture Hand contains distinct physical cards');
  b.hand=wanted.map(uid=>all.find(c=>c.uid===uid));b.draw=all.filter(c=>!wanted.includes(c.uid));b.discard=[];b.energy=C.ENERGY;
  return b.hand;
 }
 function play(r,selector){const uid=hand(r,[selector])[0].uid;E.playCard(r,uid);return uid;}
 function swap(r,incoming,outgoing){
  play(r,incoming);const ch=E.cardChoice(r);assert.equal(ch?.kind,'passive_swap');
  E.chooseCardOption(r,{choiceId:ch.id,value:outgoing});return r;
 }
 function discard(r,selector){const c=available(r,selector),b=r.battle;for(const zone of ['hand','draw','discard'])b[zone]=b[zone].filter(v=>v.uid!==c.uid);b.discard.push(c);return c.uid;}
 function quietTurn(r){Object.assign(r.battle.currentIntent,{damage:0,hits:1});E.endTurn(r);}
 const counter=(r,name)=>r.battle.cardCombat.counters[key(name)]||r.battle.cardCombat.passiveHistory[key(name)];

 contract('percent-outgoing-order','Whole-phase modifiers combine once before per-hit Defense, seal and Block',({note,reload})=>{
  let {r}=fixture(['Weak Point','Fate Storm','Rune Strike']);
  Object.assign(r.battle.cardCombat.statuses.self,{weak:2,weakUntil:r.battle.turn+1});
  play(r,'Weak Point');Object.assign(r.battle,{enemyDefense:2,enemyBlock:3,seals:0});
  hand(r,['Fate Storm']);const plan=E.cardPlan(r,r.battle.hand[0]),hp=r.battle.hp;
  note('projected three hits',plan.damageEvents.map(e=>({beforeDefense:e.beforeDefense,afterDefense:e.afterDefense,afterSeal:e.afterSeal,absorbed:e.absorbed,hpLost:e.hpLost})));
  assert.deepEqual(plan.damageEvents.map(e=>e.beforeDefense),[5,5,5]);
  assert.deepEqual(plan.damageEvents.map(e=>e.hpLost),[0,1,2]);
  E.playCard(r,r.battle.hand[0].uid);assert.equal(hp-r.battle.hp,3);
  assert.equal(r.battle.cardCombat.statuses.self.weak,2);assert.equal(r.battle.cardCombat.statuses.enemy.vulnerable,1);
  const before=r.battle.hp;play(r,'Rune Strike');assert.equal(before-r.battle.hp,2);
  r=reload(r,'after all affected hits');quietTurn(r);
  assert.equal(r.battle.cardCombat.statuses.self.weak,1);assert.equal(r.battle.cardCombat.statuses.enemy.vulnerable,0);
  quietTurn(r);assert.equal(r.battle.cardCombat.statuses.self.weak,0);
  note('two phase boundaries',{weak:r.battle.cardCombat.statuses.self.weak,vulnerable:r.battle.cardCombat.statuses.enemy.vulnerable});reload(r,'expired outgoing status');
 });

 contract('percent-duration-cap','Reapplication caps duration at three and every enemy hit remains Weak',({note,reload})=>{
  let {r}=fixture(['Weak Point','Cinder Guard','Rune Strike']);
  for(let n=0;n<4;n++)play(r,'Weak Point');
  for(let n=0;n<4;n++)play(r,'Cinder Guard');
  assert.equal(r.battle.cardCombat.statuses.enemy.vulnerable,3);assert.equal(r.battle.cardCombat.statuses.enemy.weak,3);
  const before=r.battle.hp;play(r,'Rune Strike');assert.equal(before-r.battle.hp,9,'duration does not amplify the percentage');
  const hp=r.hp,block=r.battle.block;Object.assign(r.battle.currentIntent,{damage:12,hits:3});r=reload(r,'three-phase statuses');E.endTurn(r);
  const enemy=entries(r).filter(e=>e.kind==='enemy-turn').at(-1);
  note('three Weak hits',{initialBlock:block,hpLost:hp-r.hp,enemyReceipt:enemy.values,statuses:r.battle.cardCombat.statuses});
  assert.equal(block,16);assert.equal(hp-r.hp,11);assert.equal(enemy.values.hits,3);assert.equal(enemy.values.blockAbsorbed,16);
  assert.equal(r.battle.cardCombat.statuses.enemy.vulnerable,2);assert.equal(r.battle.cardCombat.statuses.enemy.weak,2);
  quietTurn(r);quietTurn(r);assert.equal(r.battle.cardCombat.statuses.enemy.vulnerable,0);assert.equal(r.battle.cardCombat.statuses.enemy.weak,0);reload(r,'zero-attack phases consume durations');
 });

 contract('percent-incoming-and-fixed','Incoming modifiers use one floor; fixed Thorns damage ignores both statuses',({note,reload})=>{
  let {r}=fixture(['Rune Armor','Cinder Guard','Ember Wall']);
  play(r,'Rune Armor');play(r,'Cinder Guard');play(r,'Ember Wall');
  Object.assign(r.battle.cardCombat.statuses.self,{vulnerable:2,vulnerableUntil:r.battle.turn+1});
  const hp=r.hp,enemyHp=r.battle.hp,block=r.battle.block;Object.assign(r.battle.currentIntent,{damage:7,hits:3});
  r=reload(r,'incoming modifiers and Thorns');E.endTurn(r);
  note('combined incoming and fixed retaliation',{hpLost:hp-r.hp,enemyHpLost:enemyHp-r.battle.hp,defense:r.battle.defense,remainingStatuses:r.battle.cardCombat.statuses});
  assert.equal(block,C.MASTER_BALANCE?9:10,'ordinary and Master keep their own Ember Wall value');
  assert.equal(hp-r.hp,18-block,'floor(7 × .75 × 1.5) = 7, then Defense 1 on all three hits and existing Block');
  assert.equal(enemyHp-r.battle.hp,6,'three fixed 2-HP retaliations');
  assert.equal(r.battle.cardCombat.statuses.enemy.weak,0);assert.equal(r.battle.cardCombat.statuses.self.vulnerable,1);reload(r,'incoming phase resolved');
 });

 contract('passive-paid-replacement','A fourth Passive is a free pending choice, then one atomic paid replacement',({note,reload,rejects})=>{
  let {r,uids}=fixture(['Blazing Spirit','Swift Step','Rune Armor','Grimoire Ward','Clear Mind'],{artifacts:['e15','e16']});
  const [spirit,step,armor,ward,mind]=uids,baseline={strength:r.battle.strength,agility:r.battle.agility};
  play(r,spirit);play(r,step);play(r,armor);hand(r,[ward]);r.battle.focus=2;E.armFocus(r);
  const before=hash(mechanical(r)),rng=r.rng,seq=r.battle.cardCombat.seq,played=r.stats.cardsPlayed;
  E.playCard(r,ward);let ch=copy(E.cardChoice(r));
  note('unpaid physical replacement choice',ch);
  assert.equal(ch.kind,'passive_swap');assert.equal(ch.committed,false);assert.deepEqual(ch.options,[spirit,step,armor]);
  assert.equal(r.battle.energy,3);assert.equal(r.battle.cardCombat.seq,seq);assert.equal(r.stats.cardsPlayed,played);assert.equal(r.rng,rng);
  r=reload(r,'unpaid fourth Passive');rejects(r,'invalid outgoing UID',()=>E.chooseCardOption(r,{choiceId:ch.id,value:'c999999'}));
  rejects(r,'enemy turn during replacement',()=>E.endTurn(r));rejects(r,'Predict during replacement',()=>E.forecast(r));
  E.cancelCardChoice(r);assert.equal(hash(mechanical(r)),before,'cancel restores the exact unpaid state');
  E.playCard(r,ward);ch=copy(E.cardChoice(r));r=reload(r,'reopened fourth Passive');
  E.chooseCardOption(r,{choiceId:ch.id,value:spirit});
  assert.equal(r.battle.energy,2);assert.equal(r.battle.cardCombat.seq,seq+1);assert.equal(r.stats.cardsPlayed,played+1);
  assert.equal(r.battle.strength,baseline.strength);assert.equal(r.battle.agility,baseline.agility+2);assert.equal(r.battle.defense,1);
  assert.equal(r.battle.focus,2);assert.equal(r.battle.boostArmed,true);assert.equal(r.rng,rng);
  assert.deepEqual(r.battle.active.map(c=>c.uid),[step,armor,ward]);assert.ok(r.battle.discard.some(c=>c.uid===spirit));
  note('paid replacement',{energy:r.battle.energy,focus:r.battle.focus,activeUids:r.battle.active.map(c=>c.uid),attributes:{strength:r.battle.strength,agility:r.battle.agility,defense:r.battle.defense},receipt:r.battle.cardCombat.receipts.at(-1)});
  rejects(r,'completed replacement token',()=>E.chooseCardOption(r,{choiceId:ch.id,value:step}));
  play(r,mind);const next=E.cardChoice(r);assert.notEqual(next.id,ch.id);
  rejects(r,'old token against a new live choice',()=>E.chooseCardOption(r,{choiceId:ch.id,value:step}));
  E.chooseCardOption(r,{choiceId:next.id,value:ward});reload(r,'second atomic replacement');
 });

 contract('passive-physical-copy-limit','A differently upgraded physical copy cannot become a fourth or duplicate active effect',({note,reload,rejects})=>{
  let {r,uids}=fixture([{name:'Growing Flame',upgraded:false},{name:'Growing Flame',upgraded:true},'Swift Step','Rune Armor']);
  play(r,uids[0]);play(r,uids[2]);play(r,uids[3]);hand(r,[uids[1]]);
  const plan=E.cardPlan(r,r.battle.hand[0]);assert.equal(plan.legal,false);assert.ok(plan.errors.includes('passive_already_active'));
  rejects(r,'second copy of active definition',()=>E.playCard(r,uids[1]));
  note('distinct ownership and active cap',{ownedCopies:r.deck.filter(c=>c.key===key('Growing Flame')),activeUids:r.battle.active.map(c=>c.uid),errors:plan.errors});
  r=reload(r,'duplicate physical copy rejected');assert.equal(r.battle.active.length,3);
 });

 contract('passive-replacement-affordability','A restored low-Energy replacement cannot bypass payment or lose its pending choice',({note,reload,rejects})=>{
  let {r,uids}=fixture(['Blazing Spirit','Swift Step','Rune Armor','Grimoire Ward']);
  for(const uid of uids.slice(0,3))play(r,uid);play(r,uids[3]);const pending=copy(E.cardChoice(r));
  // A bounded saved Energy value is schema-legal. Confirmation must recheck it
  // even though the original click had enough Energy to open the free choice.
  r.battle.energy=0;r=reload(r,'schema-legal low-Energy pending replacement');
  rejects(r,'unaffordable saved replacement confirmation',()=>E.chooseCardOption(r,{choiceId:pending.id,value:uids[0]}));
  assert.deepEqual(E.cardChoice(r),pending);assert.deepEqual(r.battle.active.map(c=>c.uid),uids.slice(0,3));
  note('rechecked payment',{energy:r.battle.energy,pendingSourceUid:pending.sourceUid,activeUids:r.battle.active.map(c=>c.uid),played:r.stats.cardsPlayed});
  E.cancelCardChoice(r);assert.equal(r.battle.energy,0);assert.equal(r.stats.cardsPlayed,3);reload(r,'unaffordable choice safely canceled');
 });

 for(const name of ['Growing Flame','Battle Rhythm'])for(const firstUpgraded of [false,true]){
  contract('growth-'+key(name).split('.').at(-1)+'-'+(firstUpgraded?'upgraded-first':'normal-first'),name+' preserves first cadence, cap and paused progress across mixed-copy swaps',({note,reload,rejects})=>{
   let {r,uids}=fixture([{name,upgraded:firstUpgraded},{name,upgraded:!firstUpgraded},name==='Growing Flame'?'Swift Step':'Blazing Spirit','Rune Armor','Grimoire Ward',name==='Growing Flame'?'Fate Storm':'Rune Guard']);
   const [first,second,filler,armor,ward,relevant]=uids,every=firstUpgraded?2:3,maximum=firstUpgraded?5:4,attribute=name==='Growing Flame'?'strength':'agility';
   play(r,first);play(r,filler);play(r,armor);
   for(let n=0;n<every-1;n++)play(r,relevant);
   assert.equal(counter(r,name).count,every-1,'multi-hit Attack is one relevant card');assert.equal(r.battle[attribute],0);
   r=swap(r,ward,first);r=reload(r,'inactive mixed-copy growth');
   for(let n=0;n<4;n++)play(r,relevant);
   assert.equal(counter(r,name).count,every-1,'inactive progress pauses');assert.equal(r.battle[attribute],0);
   play(r,second);const pending=E.cardChoice(r);r=reload(r,'mixed-copy growth awaiting replacement');
   E.chooseCardOption(r,{choiceId:pending.id,value:ward});play(r,relevant);
   assert.equal(r.battle[attribute],1);assert.equal(counter(r,name).triggers,1);
   let active=second;
   for(let cycle=0;cycle<4;cycle++){
    r=swap(r,ward,active);assert.equal(r.battle[attribute],0,'inactive earned stat is removed');
    const incoming=active===first?second:first;r=swap(r,incoming,ward);active=incoming;
    assert.equal(r.battle[attribute],counter(r,name).triggers,'earned stat returns once');
    for(let n=0;n<every;n++)play(r,relevant);
    r=reload(r,'growth replacement cycle '+(cycle+1));
   }
   for(let n=0;n<6;n++)play(r,relevant);
   const progress=copy(counter(r,name));note('frozen first-activation contract',{firstUpgraded,currentPhysical:r.battle.active.find(c=>c.uid===active),counter:progress,attribute:r.battle[attribute]});
   assert.equal(progress.cadence,every);assert.equal(progress.maximum,maximum);assert.equal(progress.count,every*5+6);
   assert.equal(progress.triggers,maximum);assert.equal(r.battle[attribute],maximum);
   const inactive=active===first?second:first;hand(r,[inactive]);rejects(r,'capped growth duplicate copy',()=>E.playCard(r,inactive));reload(r,'capped growth after repeated mixed-copy replacement');
  });
 }

 for(const name of ['Rune Armor','Clear Mind'])for(const firstUpgraded of [false,true]){
  contract('activation-gift-'+key(name).split('.').at(-1)+'-'+(firstUpgraded?'upgraded-first':'normal-first'),name+' only grants an upgraded gift on its first activation',({note,reload})=>{
   let {r,uids}=fixture([{name,upgraded:firstUpgraded},{name,upgraded:!firstUpgraded},'Blazing Spirit','Swift Step','Grimoire Ward']);
   const [first,second,spirit,step,ward]=uids;
   play(r,first);const firstHand=r.battle.hand.length,firstBlock=r.battle.block;
   assert.equal(firstHand,name==='Clear Mind'&&firstUpgraded?1:0);assert.equal(firstBlock,name==='Rune Armor'&&firstUpgraded?3:0);
   play(r,spirit);play(r,step);r=swap(r,ward,first);r=reload(r,'gift source inactive');
   r=swap(r,second,ward);assert.equal(r.battle.hand.length,0);assert.equal(r.battle.block,firstBlock);
   r=swap(r,ward,second);r=swap(r,first,ward);assert.equal(r.battle.hand.length,0);assert.equal(r.battle.block,firstBlock);
   const gifts=entries(r).filter(e=>e.source===key(name)&&e.kind==='passive-activation-gift');
   note('once per definition gift',{firstUpgraded,firstHand,firstBlock,giftCount:gifts.length,activeUid:r.battle.active.find(c=>c.key===key(name)).uid});
   assert.equal(gifts.length,Number(firstUpgraded));if(name==='Rune Armor')assert.equal(r.battle.defense,1);
   reload(r,'mixed-copy gift reactivation');
  });
 }

 contract('last-ember-remaining-carry','Last Ember retains only its unspent emergency Block once after a multi-hit threshold crossing',({note,reload})=>{
  let {r}=fixture(['Last Ember']);r.hp=Math.floor(r.maxHp*.3)+1;play(r,'Last Ember');
  assert.equal(counter(r,'Last Ember').triggers,0);Object.assign(r.battle.currentIntent,{damage:1,hits:3});E.endTurn(r);
  note('threshold then two later hits',{hp:r.hp,block:r.battle.block,emberCarry:r.battle.cardCombat.emberCarry,focus:r.battle.focus,counter:counter(r,'Last Ember')});
  assert.equal(r.battle.block,4);assert.equal(r.battle.cardCombat.emberCarry,0);assert.equal(r.battle.focus,1);
  r=reload(r,'unused emergency Block already carried');quietTurn(r);assert.equal(r.battle.block,0);assert.equal(counter(r,'Last Ember').triggers,1);assert.equal(r.battle.focus,1);reload(r,'emergency retention consumed once');
 });

 contract('last-ember-spent-block','Later enemy hits spend Last Ember Block without recreating it on reset or replay',({note,reload})=>{
  let {r,uids}=fixture(['Last Ember','Swift Step','Rune Armor','Grimoire Ward']);r.hp=Math.floor(r.maxHp*.3)+1;
  play(r,uids[0]);Object.assign(r.battle.currentIntent,{damage:7,hits:3});E.endTurn(r);
  assert.ok(r.hp>0);assert.equal(r.battle.block,0);assert.equal(r.battle.cardCombat.emberCarry,0);
  play(r,uids[1]);play(r,uids[2]);r=swap(r,uids[3],uids[0]);r=reload(r,'spent Last Ember inactive');
  r=swap(r,uids[0],uids[3]);note('spent trigger after replay',{hp:r.hp,block:r.battle.block,focus:r.battle.focus,counter:counter(r,'Last Ember')});
  assert.equal(r.battle.block,0);assert.equal(r.battle.focus,1);assert.equal(counter(r,'Last Ember').triggers,1);reload(r,'spent emergency trigger cannot farm');
 });

 contract('last-ember-retention-maximum','Resolved emergency carry survives replacement and combines with other retention by maximum',({note,reload})=>{
  let {r,uids}=fixture(['Last Ember','Lasting Shield','Swift Step','Blazing Spirit','Rune Armor','Hold the Line']);r.hp=Math.floor(r.maxHp*.3);
  const [ember,shield,step,spirit,armor,line]=uids;
  play(r,ember);play(r,shield);play(r,step);play(r,line);r=swap(r,spirit,ember);
  const block=r.battle.block;Object.assign(r.battle.currentIntent,{damage:4,hits:2});r=reload(r,'resolved emergency carry after Passive removal');E.endTurn(r);
  const carry=entries(r).filter(e=>e.kind==='passive-trigger'&&e.values?.emergencyCap!==undefined||e.kind==='carry').at(-1);
  note('maximum combined retention',{beforeEnemy:block,afterReset:r.battle.block,carryReceipt:carry?.values,history:counter(r,'Last Ember')});
  assert.ok(block-8>=6);assert.equal(r.battle.block,6);assert.equal(carry.values.cap,6);assert.equal(carry.values.emergencyCap,6);assert.equal(carry.values.temporaryCap,5);
  r=swap(r,armor,shield);r=reload(r,'other retention removed');quietTurn(r);assert.equal(r.battle.block,0);assert.equal(counter(r,'Last Ember').triggers,1);reload(r,'resolved carry never becomes a permanent passive');
 });

 for(const name of ['Read Ahead','Clear Choice','Burning Page']){
  contract('committed-choice-'+key(name).split('.').at(-1),name+' persists paid choices and rejects stale or duplicate completion',({note,reload,rejects})=>{
   let {r,uids}=fixture([{name,upgraded:true}]);const source=uids[0];hand(r,[source]);r.battle.focus=1;E.armFocus(r);
   const plan=E.cardPlan(r,r.battle.hand[0]),rng=r.rng;E.playCard(r,source);let ch=copy(E.cardChoice(r));
   assert.equal(ch.committed,true);assert.equal(r.battle.energy,3-plan.payEnergy);assert.equal(r.battle.focus,0);assert.equal(r.stats.cardsPlayed,1);assert.equal(r.battle.resolving[0].uid,source);
   rejects(r,'cancel paid '+name,()=>E.cancelCardChoice(r));rejects(r,'enemy turn during '+name,()=>E.endTurn(r));
   rejects(r,'stale '+name+' token',()=>E.chooseCardOption(r,{choiceId:ch.id+':old',value:ch.options[0]}));
   r=reload(r,'paid '+name+' pending');assert.deepEqual(E.cardChoice(r),ch);
   let chosen;
   if(name==='Burning Page'){
    const rejected=ch.candidates[0].uid;E.chooseCardOption(r,{choiceId:ch.id,value:'replace'});
    assert.ok(r.battle.discard.some(c=>c.uid===rejected));assert.equal(E.cardChoice(r).replacementsRemaining,ch.replacementsRemaining-1);
    r=reload(r,'paid Burning Page after replacement');ch=copy(E.cardChoice(r));chosen=ch.candidates[0].uid;
    E.chooseCardOption(r,{choiceId:ch.id,value:'take'});assert.ok(r.battle.exhaust.some(c=>c.uid===source));
   }else{
    chosen=ch.candidates.at(-1).uid;const rest=ch.candidates.filter(c=>c.uid!==chosen).map(c=>c.uid).reverse();
    E.chooseCardOption(r,{choiceId:ch.id,take:chosen,order:rest});
    if(name==='Read Ahead'){const before=r.battle.hand.length;E.draw(r,1);assert.equal(r.battle.hand.length,before+1);assert.equal(r.battle.hand.at(-1).uid,rest[0]);}
    else for(const uid of rest)assert.ok(r.battle.discard.some(c=>c.uid===uid));
    assert.ok(r.battle.discard.some(c=>c.uid===source));
   }
   assert.ok(r.battle.hand.some(c=>c.uid===chosen));assert.equal(E.cardChoice(r),null);assert.equal(r.battle.resolving.length,0);
   assert.equal(r.stats.cardsPlayed,1);assert.equal(r.battle.energy,3-plan.payEnergy);assert.equal(r.battle.cardCombat.receipts.length,1);assert.equal(r.battle.cardCombat.receipts[0].status,'resolved');assert.equal(r.rng,rng);
   note('once-only paid completion',{sourceUid:source,chosenUid:chosen,payEnergy:plan.payEnergy,payFocus:plan.payFocus,played:r.stats.cardsPlayed,lifecycle:name==='Burning Page'?'exhaust':'discard',receipt:r.battle.cardCombat.receipts[0]});
   rejects(r,'duplicate completion '+name,()=>E.chooseCardOption(r,{choiceId:ch.id,value:chosen}));reload(r,'committed '+name+' resolved');
  });
 }

 contract('recall-exhaust-isolation','Recall offers Discard UIDs only, pays once and never retrieves Exhaust after reload',({note,reload,rejects})=>{
  let {r,uids}=fixture(['Deep Study','Recall','Rune Guard']);const [study,recall,guard]=uids;
  play(r,study);assert.ok(r.battle.exhaust.some(c=>c.uid===study));hand(r,[recall]);discard(r,guard);r.battle.focus=1;E.armFocus(r);
  const before={energy:r.battle.energy,focus:r.battle.focus,played:r.stats.cardsPlayed};E.playCard(r,recall);const ch=copy(E.cardChoice(r));
  assert.equal(ch.kind,'recall');assert.equal(ch.committed,false);assert.deepEqual(ch.options,[guard]);assert.equal(r.battle.energy,before.energy);assert.equal(r.battle.focus,before.focus);
  rejects(r,'Recall Exhaust UID',()=>E.chooseCardOption(r,{choiceId:ch.id,value:study}));rejects(r,'Recall its own source UID',()=>E.chooseCardOption(r,{choiceId:ch.id,value:recall}));
  r=reload(r,'unpaid Recall excluding Exhaust');E.chooseCardOption(r,{choiceId:ch.id,value:guard});
  assert.ok(r.battle.hand.some(c=>c.uid===guard));assert.ok(r.battle.exhaust.some(c=>c.uid===study));assert.ok(r.battle.exhaust.some(c=>c.uid===recall));
  assert.equal(r.battle.energy,2);assert.equal(r.battle.focus,0);assert.equal(r.stats.cardsPlayed,before.played+1);
  rejects(r,'completed Recall token',()=>E.chooseCardOption(r,{choiceId:ch.id,value:guard}));
  for(let n=0;n<3;n++){quietTurn(r);r=reload(r,'Recall Exhaust survives reshuffle turn '+(n+1));assert.deepEqual(r.battle.exhaust.map(c=>c.uid).sort(),[study,recall].sort());}
  note('Exhaust isolation',{exhaustUids:r.battle.exhaust.map(c=>c.uid),guardUid:guard,focus:r.battle.focus,played:r.stats.cardsPlayed});
 });

 contract('recall-exhaust-only-illegal','An Exhaust-only target pool never makes Recall legal',({note,reload,rejects})=>{
  let {r,uids}=fixture(['Deep Study','Recall']);play(r,uids[0]);hand(r,[uids[1]]);
  const plan=E.cardPlan(r,r.battle.hand[0]);note('Exhaust-only Recall plan',{errors:plan.errors,exhaustUids:r.battle.exhaust.map(c=>c.uid),discard:r.battle.discard.length});
  assert.equal(plan.legal,false);assert.ok(plan.errors.includes('no_legal_recall'));rejects(r,'Recall without Discard',()=>E.playCard(r,uids[1]));r=reload(r,'illegal Recall with Exhaust only');
 });

 contract('search-paid-fallback','A failed category search commits once after reload and draws the real next fallback card',({note,reload,rejects})=>{
  let {r,uids}=fixture(['Card Search']);const source=uids[0];hand(r,[source]);const plan=E.cardPlan(r,r.battle.hand[0]),limit=plan.values.search,rng=r.rng;
  const expected=r.battle.draw.at(-(limit+1)).uid;E.playCard(r,source);const ch=copy(E.cardChoice(r));
  assert.equal(ch.committed,false);assert.equal(r.battle.energy,3);assert.equal(r.stats.cardsPlayed,0);r=reload(r,'unpaid Card Search category');
  E.chooseCardOption(r,{choiceId:ch.id,value:'passive'});
  const tx=r.battle.cardCombat.receipts.at(-1);assert.equal(r.battle.hand.length,1);assert.equal(r.battle.hand[0].uid,expected);assert.equal(tx.discarded,limit);
  assert.equal(r.battle.energy,2);assert.equal(r.stats.cardsPlayed,1);assert.equal(r.rng,rng);assert.ok(r.battle.discard.some(c=>c.uid===source));
  note('bounded fallback',{searched:limit,discarded:tx.discarded,expectedFallbackUid:expected,actualFallbackUid:r.battle.hand[0].uid,energy:r.battle.energy,rngUnchanged:r.rng===rng});
  rejects(r,'old paid category token',()=>E.chooseCardOption(r,{choiceId:ch.id,value:'passive'}));reload(r,'failed search resolved');
 });

 contract('search-real-reshuffle','Fallback at deck exhaustion uses genuine reshuffle RNG and cannot refund the failed search',({note,reload})=>{
  let {r,uids}=fixture(['Card Search','Rune Strike','Rune Strike','Rune Strike'],{size:4});hand(r,[uids[0]]);const rng=r.rng;
  E.playCard(r,uids[0]);const ch=E.cardChoice(r);r=reload(r,'small-deck Card Search');E.chooseCardOption(r,{choiceId:ch.id,value:'passive'});
  const tx=r.battle.cardCombat.receipts.at(-1);note('fallback reshuffle',{rngBefore:rng,rngAfter:r.rng,handUids:r.battle.hand.map(c=>c.uid),drawUids:r.battle.draw.map(c=>c.uid),discarded:tx.discarded,energy:r.battle.energy});
  assert.notEqual(r.rng,rng);assert.equal(r.battle.hand.length,1);assert.equal(r.battle.draw.length,2);assert.equal(tx.discarded,3);assert.equal(r.battle.energy,2);assert.equal(r.stats.cardsPlayed,1);reload(r,'small-deck paid fallback resolved');
 });

 contract('mixed-queue-once','Mixed-upgrade delayed draws and Block survive reload, cap Hand and resolve once',({note,reload})=>{
  let {r,uids}=fixture([{name:'Clear Mind',upgraded:true},{name:'Mana Reading',upgraded:false},{name:'Mana Reading',upgraded:true},'Next Chapter','Next Chapter','Layered Shield']);
  for(const uid of uids)play(r,uid);
  const queue=copy(r.battle.cardCombat.queue);note('queued mixed definitions',queue);
  assert.deepEqual(queue.filter(q=>q.source===key('Mana Reading')).map(q=>({value:q.value,upgraded:q.upgraded})),[{value:1,upgraded:false},{value:2,upgraded:true}]);
  const delayedBlock=C.MASTER_BALANCE?3:4;
  assert.equal(queue.filter(q=>q.kind==='draw').reduce((n,q)=>n+q.value,0),7);assert.equal(queue.find(q=>q.kind==='block').value,delayedBlock);
  r=reload(r,'mixed delayed effects queued');quietTurn(r);
  assert.equal(r.battle.hand.length,C.HAND_LIMIT);assert.equal(r.battle.block,delayedBlock);assert.deepEqual(r.battle.cardCombat.queue,[]);
  const delayed=entries(r).filter(e=>e.kind==='delayed');note('first due turn',{hand:r.battle.hand.length,block:r.battle.block,delayed:delayed.map(e=>({source:e.source,values:e.values}))});
  assert.equal(delayed.length,queue.length);assert.equal(delayed.filter(e=>e.values.effect==='draw').reduce((n,e)=>n+e.values.draw,0),6,'normal draw leaves six Hand spaces; excess delayed draw is consumed');
  r=reload(r,'delayed effects consumed at full Hand');quietTurn(r);assert.equal(r.battle.hand.length,C.HAND+1);assert.equal(r.battle.block,0);assert.deepEqual(r.battle.cardCombat.queue,[]);
  assert.equal(entries(r).filter(e=>e.kind==='delayed').length,queue.length);reload(r,'no duplicate queue application after reload');
 });

 contract('queued-block-stat-snapshot','Queued Block preserves its original stat snapshot after the Agility Passive is replaced',({note,reload})=>{
  let {r,uids}=fixture(['Swift Step','Rune Armor','Clear Mind','Layered Shield','Grimoire Ward']);
  const [step,armor,mind,layer,ward]=uids;
  play(r,step);play(r,armor);play(r,mind);play(r,layer);const queued=copy(r.battle.cardCombat.queue[0]);
  assert.equal(r.battle.agility,2);assert.equal(queued.value,C.MASTER_BALANCE?3:6);assert.equal(queued.agility,C.MASTER_BALANCE?0:2);
  r=swap(r,ward,step);assert.equal(r.battle.agility,0);assert.deepEqual(r.battle.cardCombat.queue,[queued]);
  r=reload(r,'queued Block after Agility replacement');quietTurn(r);
  note('snapshot survives stat removal',{queued,agilityAtResolution:r.battle.agility,actualBlock:r.battle.block,queueAfter:r.battle.cardCombat.queue});
  assert.equal(r.battle.block,queued.value);assert.deepEqual(r.battle.cardCombat.queue,[]);r=reload(r,'snapshotted Block applied');quietTurn(r);
  assert.equal(r.battle.block,0);assert.equal(entries(r).filter(e=>e.kind==='delayed'&&e.values.effect==='block').length,1);reload(r,'snapshotted Block not replayed');
 });

 contract('predict-two-wrong-limit','First wrong unlocks both support views; second wrong ends Predict across reload with no reward',({note,reload,rejects})=>{
  let {r}=fixture();r.battle.seals=0;const p=E.forecast(r),q=Q.catalog[p.questionId],wrong=q.choices.filter(c=>c.id!==q.correctChoiceId).map(c=>c.id),rng=r.rng,questionRng=r.educationState.rng;
  const locked=hash(r);E.supportForecast(r,'moreHint');assert.equal(hash(r),locked,'locked More Hint is an honest no-op');
  assert.equal(Q.consumerRecord(r).hintState.moreHintUnlocked,false);assert.equal(Q.consumerRecord(r).hintState.moreHintViewed,false);
  E.selectForecast(r,wrong[0]);r=reload(r,'selected first Predict answer');E.answerBankForecast(r);
  let rec=Q.consumerRecord(r);assert.equal(rec.hintState.moreHintUnlocked,true);assert.equal(rec.hintState.hintUsed,false);assert.equal(rec.hintState.moreHintViewed,false);assert.equal(rec.status,'pending');
  r=reload(r,'first wrong Predict answer');rejects(r,'repeated wrong answer choice',()=>E.selectForecast(r,wrong[0]));
  E.supportForecast(r,'moreHint');assert.equal(Q.consumerRecord(r).hintState.moreHintViewed,true);assert.equal(Q.consumerRecord(r).hintState.hintUsed,false);
  E.supportForecast(r,'hint');assert.equal(Q.consumerRecord(r).hintState.hintUsed,true);assert.equal(r.stats.hintsUsed,1);
  E.selectForecast(r,wrong[1]);E.answerBankForecast(r);r=reload(r,'second wrong Predict terminal review');rec=Q.consumerRecord(r);
  assert.equal(rec.status,'revealed');assert.equal(rec.attempts.length,2);assert.equal(rec.attempts[1].moreHintViewed,true);assert.equal(r.battle.forecastUsed,true);
  assert.equal(r.battle.focus,0);assert.equal(r.battle.seals,0);assert.equal(r.stats.forecasts,1);assert.equal(r.stats.failedPredictions,1);assert.equal(r.rng,rng);assert.equal(r.educationState.rng,questionRng);
  rejects(r,'third answer after two wrong',()=>E.answer(r,q.correctChoiceId));rejects(r,'selection after two wrong',()=>E.selectForecast(r,q.correctChoiceId));
  note('two-attempt terminal evidence',{questionId:q.id,attempts:rec.attempts,hintState:rec.hintState,focus:r.battle.focus,seals:r.battle.seals,failedPredictions:r.stats.failedPredictions});
  E.closeForecast(r);rejects(r,'same-turn Predict reopen',()=>E.forecast(r));r=reload(r,'failed Predict closed');
  assert.equal(entries(r).filter(e=>e.kind==='predict-failed').length,1);quietTurn(r);const next=E.forecast(r);assert.notEqual(next.questionId,q.id);reload(r,'next turn distinct Predict question');
 });

 contract('predict-independent-once','A saved first-correct selection grants Focus and a boss seal exactly once',({note,reload,rejects})=>{
  let {r}=fixture();r.battle.seals=0;const pending=E.forecast(r),q=Q.catalog[pending.questionId];E.selectForecast(r,q.correctChoiceId);r=reload(r,'selected independent correct answer');
  const result=E.answerBankForecast(r);assert.equal(result.first,true);assert.equal(result.focusGained,1);assert.equal(result.sealOpened,true);
  assert.equal(r.battle.focus,1);assert.equal(r.battle.seals,1);assert.equal(r.stats.firstCorrect,1);assert.equal(r.stats.forecasts,1);
  rejects(r,'duplicate correct Predict submit',()=>E.answerBankForecast(r));r=reload(r,'correct Predict reward committed');
  note('independent reward',{questionId:q.id,result,focus:r.battle.focus,seals:r.battle.seals,completion:Q.consumerRecord(r).completion});
  E.closeForecast(r);rejects(r,'same-turn independent Predict repeat',()=>E.forecast(r));reload(r,'independent Predict closed');
 });

 contract('predict-retry-no-focus','A correct retry opens one seal and records guided success without Focus',({note,reload,rejects})=>{
  let {r}=fixture();r.battle.seals=0;const pending=E.forecast(r),q=Q.catalog[pending.questionId],wrong=q.choices.find(c=>c.id!==q.correctChoiceId).id;
  E.answer(r,wrong);r=reload(r,'wrong then retry Predict');const result=E.answer(r,q.correctChoiceId);
  assert.equal(result.first,false);assert.equal(result.focusGained,0);assert.equal(result.sealOpened,true);assert.equal(r.battle.focus,0);assert.equal(r.battle.seals,1);assert.equal(r.stats.assisted,1);
  assert.equal(Q.consumerRecord(r).completion.category,'retry');rejects(r,'duplicate guided Predict reward',()=>E.answer(r,q.correctChoiceId));
  note('guided retry reward',{questionId:q.id,result,focus:r.battle.focus,seals:r.battle.seals,completion:Q.consumerRecord(r).completion});reload(r,'guided retry committed');
 });
 return rows;
}

module.exports={runContracts};
