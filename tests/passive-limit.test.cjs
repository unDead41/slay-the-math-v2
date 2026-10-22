const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),C=require('../dist/config.js'),A=require('../dist/artifacts.js'),CC=require('../dist/card-combat.js'),data=require('../dist/card-data.js');
const key=name=>data.cards.find(c=>c.name===name).id,copy=E.clone;
function fixture(names=data.cards.map(c=>c.name)){const r=E.newRun(2301);delete r.route;r.seq=0;r.deck=names.map(name=>E.card(r,key(name)));E.startBattle(r,'sentinel');r.battle.hp=r.battle.maxHp=10000;r.battle.seals=2;r.battle.enemyBlock=0;r.battle.currentIntent.damage=0;return r;}
function hand(r,name){const b=r.battle,all=[...b.hand,...b.draw,...b.discard],i=all.findIndex(c=>c.key===key(name));assert.ok(i>=0,name+' is available');const c=all.splice(i,1)[0];b.hand=[c];b.draw=all;b.discard=[];b.energy=C.ENERGY;return c;}
function play(r,name){const c=hand(r,name);E.playCard(r,c.uid);return c;}
function choose(r,uid){const ch=E.cardChoice(r);assert.ok(ch,'a choice is waiting');E.chooseCardOption(r,{choiceId:ch.id,value:uid});}
function active(r,name){return r.battle.active.find(c=>c.key===key(name));}
function conserved(r){const b=r.battle,all=[...b.draw,...b.hand,...b.discard,...b.exhaust,...b.active,...b.resolving,...(b.cardChoice?.committed?b.cardChoice.candidates:[])];assert.deepEqual(all.map(c=>c.uid).sort(),r.deck.map(c=>c.uid).sort());assert.equal(new Set(all.map(c=>c.uid)).size,r.deck.length);assert.ok(E.validate(r),'state validates');assert.ok(E.restore(copy(r)),'state restores');}

// Catches committing a fourth Passive before a replacement is chosen.
test('fourth Passive waits for a free persisted replacement choice and cancel preserves armed Focus',()=>{
 let r=fixture();for(const name of ['Blazing Spirit','Swift Step','Rune Armor'])play(r,name);
 const incoming=hand(r,'Grimoire Ward');r.battle.focus=2;E.armFocus(r);const before=copy(r);
 E.playCard(r,incoming.uid);const ch=E.cardChoice(r);
 assert.equal(ch?.kind,'passive_swap');assert.equal(ch.committed,false);assert.equal(ch.sourceUid,incoming.uid);
 assert.deepEqual(ch.candidates.map(c=>c.uid),r.battle.active.map(c=>c.uid));assert.deepEqual(ch.options,ch.candidates.map(c=>c.uid));
 assert.equal(r.battle.active.length,3);assert.equal(r.battle.energy,3);assert.equal(r.stats.cardsPlayed,3);assert.equal(r.battle.cardCombat.seq,3);assert.equal(r.rng,before.rng);
 assert.equal(r.battle.boostArmed,true);assert.equal(r.battle.focus,2);conserved(r);
 r=E.restore(copy(r));E.cancelCardChoice(r);assert.deepEqual(r,before);
});

// Catches retaining the outgoing stat contribution, spending twice, or duplicating a physical card.
test('replacement pays the incoming card once, removes outgoing stats, and records the actual change',()=>{
 let r=fixture();for(const name of ['Blazing Spirit','Swift Step','Rune Armor'])play(r,name);
 const outgoing=active(r,'Blazing Spirit'),incoming=play(r,'Grimoire Ward');const ch=copy(E.cardChoice(r)),pending=copy(r);
 assert.throws(()=>E.chooseCardOption(r,{choiceId:ch.id,value:'c999'}));assert.deepEqual(r,pending);
 r=E.restore(copy(r));choose(r,outgoing.uid);
 assert.equal(r.battle.energy,2);assert.equal(r.stats.cardsPlayed,4);assert.equal(r.battle.cardCombat.seq,4);
 assert.equal(r.battle.strength,0);assert.equal(r.battle.agility,2);assert.equal(r.battle.defense,1);
 assert.equal(r.battle.active.length,3);assert.ok(active(r,'Grimoire Ward'));assert.ok(!active(r,'Blazing Spirit'));
 assert.ok(r.battle.discard.some(c=>c.uid===outgoing.uid));assert.ok(!r.battle.hand.some(c=>c.uid===incoming.uid));
 const entry=r.battle.combatLog.entries.find(e=>e.kind==='passive-replace');assert.ok(entry);assert.equal(entry.values.removedStrength,2);assert.equal(entry.values.removedAgility,0);assert.equal(entry.values.removedDefense,0);assert.equal(entry.values.outgoingUid,outgoing.uid);assert.equal(entry.values.incomingUid,incoming.uid);
 const done=copy(r);assert.throws(()=>E.chooseCardOption(r,{choiceId:ch.id,value:outgoing.uid}));assert.deepEqual(r,done);conserved(r);
});

// Catches refreshing a used once-per-combat grant by swapping it out and back in.
test('Last Ember retains its spent combat trigger when replayed and resets only in a new combat',()=>{
 const r=fixture();r.hp=18;for(const name of ['Last Ember','Swift Step','Rune Armor'])play(r,name);
 assert.equal(r.battle.focus,1);assert.equal(r.battle.block,6);
 play(r,'Blazing Spirit');choose(r,active(r,'Last Ember').uid);
 play(r,'Last Ember');choose(r,active(r,'Blazing Spirit').uid);
 assert.equal(r.battle.focus,1);assert.equal(r.battle.block,6);assert.equal(r.battle.cardCombat.counters[key('Last Ember')].triggers,1);
 assert.equal(r.battle.combatLog.entries.filter(e=>e.kind==='passive-trigger'&&e.source===key('Last Ember')).length,1);conserved(r);
 E.startBattle(r,'sentinel');r.battle.hp=r.battle.maxHp=10000;r.battle.seals=2;play(r,'Last Ember');assert.equal(r.battle.focus,1);assert.equal(r.battle.block,6);conserved(r);
});

// Catches stat farming, counting inactive cards, and resetting the three-trigger source limit.
test('Growing Flame progress pauses while inactive and its earned Strength is removed then restored once',()=>{
 const r=fixture();for(const name of ['Growing Flame','Swift Step','Rune Armor'])play(r,name);
 for(let n=0;n<4;n++)play(r,'Rune Strike');assert.equal(r.battle.strength,1);
 play(r,'Blazing Spirit');choose(r,active(r,'Growing Flame').uid);assert.equal(r.battle.strength,2);
 for(let n=0;n<3;n++)play(r,'Rune Strike');assert.equal(r.battle.strength,2);
 play(r,'Growing Flame');choose(r,active(r,'Blazing Spirit').uid);assert.equal(r.battle.strength,1);assert.equal(r.battle.cardCombat.counters[key('Growing Flame')].count,4);
 for(let n=0;n<7;n++)play(r,'Rune Strike');assert.equal(r.battle.strength,3);assert.equal(r.battle.cardCombat.counters[key('Growing Flame')].triggers,3);
 play(r,'Blazing Spirit');choose(r,active(r,'Growing Flame').uid);play(r,'Growing Flame');choose(r,active(r,'Blazing Spirit').uid);play(r,'Rune Strike');assert.equal(r.battle.strength,3);assert.equal(r.battle.cardCombat.counters[key('Growing Flame')].triggers,3);conserved(r);
});

// Catches using a Passive's inactive historical counter as an active effect.
test('swapped ongoing effects stop without undoing resolved Block, draws, Focus or damage',()=>{
 const r=fixture();for(const name of ['Grimoire Ward','Lasting Shield','Clear Mind'])play(r,name);
 play(r,'Quick Study');assert.equal(r.battle.block,3);
 play(r,'Blazing Spirit');choose(r,active(r,'Grimoire Ward').uid);play(r,'Quick Study');assert.equal(r.battle.block,3);
 play(r,'Grimoire Ward');choose(r,active(r,'Blazing Spirit').uid);play(r,'Quick Study');assert.equal(r.battle.block,3,'same-turn Ward limit survives replay');
 play(r,'Rune Armor');choose(r,active(r,'Lasting Shield').uid);r.battle.block=9;r.battle.currentIntent.damage=0;E.endTurn(r);assert.equal(r.battle.block,0,'inactive Lasting Shield no longer retains Block');
 assert.equal(r.battle.hand.length,5,'active Clear Mind still draws once');
 play(r,'Swift Step');choose(r,active(r,'Clear Mind').uid);E.endTurn(r);assert.equal(r.battle.hand.length,4,'inactive Clear Mind no longer draws');conserved(r);
});

// Hand-authored old state: the pre-limit schema allowed all ten distinct Passives.
function legacyOvercap(count=10){const r=fixture(),b=r.battle;delete b.cardCombat.passiveRule;delete b.cardCombat.passiveHistory;delete b.cardCombat.passiveTrimPending;const names=['Blazing Spirit','Growing Flame','Swift Step','Battle Rhythm','Rune Armor','Lasting Shield','Grimoire Ward','Ember Core','Clear Mind','Last Ember'].slice(0,count);for(const name of names){const c=hand(r,name);b.hand=[];b.active.push(c);const stat=({ 'Blazing Spirit':'strength','Swift Step':'agility','Rune Armor':'defense'})[name];b.cardCombat.counters[c.key]={activatedTurn:1,count:0,triggers:stat?1:0,lastTurn:stat?1:0};if(stat){b.cardCombat.stats[stat]+=stat==='defense'?1:2;b[stat]+=stat==='defense'?1:2;}}return r;}
function asOldOvercap(r,count=4){const b=r.battle;delete b.cardCombat.passiveRule;delete b.cardCombat.passiveHistory;delete b.cardCombat.passiveTrimPending;for(const name of ['Blazing Spirit','Growing Flame','Swift Step','Battle Rhythm'].slice(0,count)){const all=[...b.hand,...b.draw,...b.discard],i=all.findIndex(c=>c.key===key(name)),c=all.splice(i,1)[0];b.hand=b.hand.filter(x=>x.uid!==c.uid);b.draw=b.draw.filter(x=>x.uid!==c.uid);b.discard=b.discard.filter(x=>x.uid!==c.uid);b.active.push(c);const stat=({'Blazing Spirit':'strength','Swift Step':'agility'})[name];b.cardCombat.counters[c.key]={activatedTurn:1,count:0,triggers:stat?1:0,lastTurn:stat?1:0};if(stat){b.cardCombat.stats[stat]+=2;b[stat]+=2;}}return r;}

// Catches dropping a legacy run or leaving four-to-ten active effects usable silently.
test('legacy overcap saves offer free repeatable trim choices until three and retain every owned card',()=>{
 for(const count of [4,10]){const legacy=legacyOvercap(count);assert.ok(E.validate(legacy));let r=E.restore(copy(legacy));assert.ok(r);const energy=r.battle.energy,rng=r.rng,cards=r.stats.cardsPlayed;
  assert.equal(E.cardChoice(r)?.kind,'passive_trim');assert.equal(E.cardChoice(r).committed,false);assert.equal(E.cardChoice(r).sourceUid,null);
  assert.throws(()=>E.cancelCardChoice(r),/three|3|limit|trim/i);
  while(r.battle.active.length>3){const ch=E.cardChoice(r);assert.equal(ch.kind,'passive_trim');const picked=ch.candidates[0];r=E.restore(copy(r));choose(r,picked.uid);conserved(r);}
  assert.equal(E.cardChoice(r),null);assert.equal(r.battle.energy,energy);assert.equal(r.stats.cardsPlayed,cards);assert.equal(r.rng,rng);assert.equal(r.battle.strength,0);assert.equal(r.battle.agility,count===4?2:0);assert.equal(r.battle.defense,count===4?0:0);assert.equal(r.deck.length,40);conserved(r);
 }
});

// Catches accepting forged migration/history metadata or mismatched active candidate snapshots.
test('current save validation rejects a forged cap, inactive history or pending replacement',()=>{
 const r=fixture();for(const name of ['Blazing Spirit','Swift Step','Rune Armor'])play(r,name);play(r,'Grimoire Ward');
 assert.equal(E.cardChoice(r)?.kind,'passive_swap');
 for(const mutate of [x=>x.battle.cardChoice.candidates.reverse(),x=>x.battle.cardChoice.sourceUid=x.battle.active[0].uid,x=>x.battle.cardCombat.passiveRule=2,x=>x.battle.cardCombat.passiveHistory={[key('Swift Step')]:copy(x.battle.cardCombat.counters[key('Swift Step')])},x=>x.battle.cardCombat.passiveTrimPending=true]){const bad=copy(r);mutate(bad);assert.equal(E.restore(bad),null);}
 const before=copy(r);CC.passiveView(Object.freeze(r));assert.deepEqual(r,before);conserved(r);
});

// Catches replacing a pending saved card session with trim, or making the precommit session impossible to finish.
test('legacy overcap migration finishes saved precommit and committed card choices before trimming',()=>{
 for(const name of ['Recall','Card Search','Read Ahead','Clear Choice','Burning Page'])for(const cancel of [false,...(['Recall','Card Search'].includes(name)?[true]:[])]){
  let r=fixture();const source=hand(r,name),b=r.battle;b.draw=[...b.draw.filter(c=>C.cards[c.key].role==='passive'),...b.draw.filter(c=>C.cards[c.key].role!=='passive')];if(name==='Recall')b.discard.push(b.draw.pop());E.playCard(r,source.uid);
  asOldOvercap(r);if(E.cardChoice(r).kind==='burning_page')r.battle.cardChoice.windowRemaining=r.battle.draw.length;const savedChoice=copy(E.cardChoice(r));assert.ok(E.validate(r),name+' old pending '+cancel);r=E.restore(copy(r));assert.deepEqual(E.cardChoice(r),savedChoice);assert.equal(r.battle.active.length,4);
  if(cancel)E.cancelCardChoice(r);else{const ch=E.cardChoice(r);E.chooseCardOption(r,{choiceId:ch.id,value:ch.kind==='card_search'?'attack':ch.kind==='burning_page'?'take':ch.candidates[0].uid});}
  assert.equal(E.cardChoice(r)?.kind,'passive_trim',name+' defers trim until its own choice ends');assert.equal(r.battle.active.length,4);conserved(r);
  choose(r,r.battle.active[0].uid);assert.equal(r.battle.active.length,3);assert.equal(E.cardChoice(r),null);conserved(r);
 }
});

// Catches overcap effects continuing for an enemy turn after a saved question is solved or closed.
test('legacy overcap migration preserves bank and frozen legacy Predict until closed then requires trimming',()=>{
 const M=require('../dist/math.js'),Q=require('../dist/education.js');
 for(const bank of [true,false])for(const solve of [false,true]){
  let r=fixture();if(bank)E.forecast(r);else{const source=r.battle.draw.map(c=>({...c,...E.definition(c)})),q=M.makeQuestion(source,'single');r.battle.question={...q,source,attempts:0,hinted:false,solved:false,seal:null};}
  asOldOvercap(r);const question=copy(r.battle.question);assert.ok(E.validate(r));r=E.restore(copy(r));assert.deepEqual(r.battle.question,question);assert.equal(E.cardChoice(r),null);
  const before=copy(r);assert.throws(()=>E.endTurn(r),/Passives|choice/);assert.throws(()=>E.playCard(r,r.battle.hand[0].uid),/Passives|Predict/);assert.deepEqual(r,before);
  if(solve){if(bank){E.selectForecast(r,Q.catalog[question.questionId].correctChoiceId);E.answerBankForecast(r);}else E.answer(r,String(question.value));assert.equal(E.cardChoice(r),null,'keep the solved explanation open');}
  E.closeForecast(r);assert.equal(E.cardChoice(r)?.kind,'passive_trim');assert.equal(r.battle.active.length,4);conserved(r);choose(r,r.battle.active[0].uid);conserved(r);
 }
});

// Catches charging a canceled/illegal replacement or blocking an upgraded zero-cost Passive.
test('replacement rechecks affordability and zero-cost upgraded Passives preserve Focus and RNG',()=>{
 const r=fixture();for(const name of ['Blazing Spirit','Swift Step','Rune Armor'])play(r,name);
 const incoming=hand(r,'Grimoire Ward');r.battle.energy=0;const before=copy(r);assert.throws(()=>E.playCard(r,incoming.uid),/Energy/);assert.deepEqual(r,before);
 incoming.upgraded=true;r.deck.find(c=>c.uid===incoming.uid).upgraded=true;r.battle.focus=2;E.armFocus(r);const rng=r.rng;
 E.playCard(r,incoming.uid);assert.equal(E.cardChoice(r)?.kind,'passive_swap');choose(r,active(r,'Blazing Spirit').uid);assert.equal(r.battle.energy,0);assert.equal(r.battle.focus,2);assert.equal(r.battle.boostArmed,true);assert.equal(r.rng,rng);assert.equal(r.battle.cardCombat.receipts.at(-1).energy,0);conserved(r);
});

// Catches subtracting artifact Strength/Agility with the swapped Passive's contribution.
test('swapping static attributes preserves artifact contributions and removes Defense before the next attack',()=>{
 const r=fixture();for(const code of ['e15','e16','b02']){if(!r.artifactState)r.artifactState={version:1,shopOnly:true,rng:(r.seed^0xa741c6e5)>>>0,owned:[],acquired:[],startingId:null,offer:null};A.acquire(r,A.id(code),'shop:0:limit-fixture:'+code);}
 E.startBattle(r,'sentinel');r.battle.hp=r.battle.maxHp=10000;r.battle.seals=2;for(const name of ['Blazing Spirit','Swift Step','Rune Armor'])play(r,name);
 assert.equal(r.battle.strength,7);assert.equal(r.battle.agility,7);assert.equal(r.battle.defense,1);
 play(r,'Grimoire Ward');choose(r,active(r,'Blazing Spirit').uid);assert.equal(r.battle.strength,5);assert.equal(r.battle.agility,7);
 play(r,'Ember Core');choose(r,active(r,'Rune Armor').uid);assert.equal(r.battle.defense,0);r.battle.block=0;r.battle.currentIntent.damage=3;r.battle.currentIntent.hits=2;const hp=r.hp;E.endTurn(r);assert.equal(hp-r.hp,6);conserved(r);
});
