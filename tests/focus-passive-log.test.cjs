const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const E=require('../dist/engine.js');
const C=require('../dist/config.js');
const CC=require('../dist/card-combat.js');
const Log=require('../dist/combat-log.js');
const data=require('../dist/card-data.js');
const master=require('../modules/cards/source/data/cards.master.json');
const names=Object.fromEntries(data.cards.map(c=>[c.name,c]));
const key=name=>names[name]?.id||name;
const copy=x=>JSON.parse(JSON.stringify(x));

function fixture(list=data.cards.map(c=>c.name)){
 const r=E.newRun(1917);delete r.route;r.seq=0;
 r.deck=list.map(name=>E.card(r,key(name)));
 E.startBattle(r,'sentinel');
 Object.assign(r.battle,{hp:10000,maxHp:10000,seals:2,enemyBlock:0});
 r.battle.currentIntent.damage=0;
 return r;
}
function hand(r,list){
 const b=r.battle,pool=[...b.hand,...b.draw,...b.discard];
 b.hand=[];b.draw=pool;b.discard=[];
 for(const name of list){const index=b.draw.findIndex(c=>c.key===key(name));assert.ok(index>=0,name+' must be available');b.hand.push(b.draw.splice(index,1)[0]);}
 return b.hand;
}
function play(r,name){const c=r.battle.hand.find(c=>c.key===key(name));assert.ok(c,name);E.playCard(r,c.uid);return c;}
function finishChoices(r){
 for(let n=0;E.cardChoice(r);n++){
  assert.ok(n<8,'choices stay bounded');const ch=E.cardChoice(r);
  E.chooseCardOption(r,ch.kind==='card_search'?'attack':ch.kind==='burning_page'?'take':ch.kind==='read_ahead'?{take:ch.candidates[0].uid,order:ch.candidates.slice(1).map(c=>c.uid)}:ch.candidates[0].uid);
 }
}
function rows(r,name,kind){return Log.entries(r).filter(e=>e.source===key(name)&&(!kind||e.kind===kind));}
function view(r,name){return CC.passiveView(r).find(p=>p.id===key(name));}

test('the entire 40-card authority distinguishes Focus spending from the sole Focus grant',()=>{
 const focusIdentity=cards=>cards.map(c=>({id:c.id,category:c.category,eligible:c.focus_eligible}));
 assert.deepEqual(focusIdentity(data.cards),focusIdentity(master.cards));
 assert.equal(data.cards.length,40);
 assert.deepEqual(data.cards.filter(c=>(c.passive?.effects||[]).some(e=>e.op==='gain_focus')).map(c=>c.name),['Last Ember']);
 assert.equal(data.cards.filter(c=>c.focus_eligible).length,30);
 for(const d of data.cards){
  const r=fixture();hand(r,[d.name]);if(d.name==='Recall')r.battle.discard.push(r.battle.draw.pop());
  play(r,d.name);finishChoices(r);
  assert.equal(r.battle.focus,0,d.name+' must not invent a Focus grant above the Last Ember threshold');
  assert.equal(rows(r,d.name,'card').length,1,d.name+' records one resolved card');
  assert.ok(E.validate(r),d.name+' remains reloadable');
 }
});

test('every eligible card spends one Focus once; every Passive preserves stock and armed state',()=>{
 for(const d of data.cards){
  const r=fixture();hand(r,[d.name]);if(d.name==='Recall')r.battle.discard.push(r.battle.draw.pop());
  r.battle.focus=C.FOCUS_CAP;E.armFocus(r);
  assert.equal(E.cardPlan(r,r.battle.hand[0]).focused,d.focus_eligible,d.name);
  play(r,d.name);finishChoices(r);
  assert.equal(r.battle.focus,C.FOCUS_CAP-(d.focus_eligible?data.rules.focus_cost:0),d.name);
  assert.equal(r.battle.boostUsed,d.focus_eligible,d.name);
  assert.equal(r.battle.boostArmed,!d.focus_eligible,d.name);
  assert.equal(rows(r,d.name,'card')[0].values.focus,d.focus_eligible?data.rules.focus_cost:0,d.name);
  if(d.focus_eligible)assert.throws(()=>E.armFocus(r),/not ready/,d.name+' cannot use Focus twice this turn');
 }
});

test('Last Ember checks living HP at activation, including the exact 30% boundary',()=>{
 for(const [hp,expected]of [[60,0],[19,0],[18,1],[1,1]]){
  const r=fixture();r.hp=hp;hand(r,['Last Ember']);play(r,'Last Ember');
  assert.equal(view(r,'Last Ember').triggeredCount,expected,'HP '+hp);
  assert.equal(r.battle.block,expected*6,'HP '+hp);
  assert.equal(r.battle.focus,expected,'HP '+hp);
  assert.equal(rows(r,'Last Ember','passive-activate').length,1);
  assert.equal(rows(r,'Last Ember','passive-trigger').length,expected);
  if(!expected){assert.match(view(r,'Last Ember').waitingCondition,/18\/60.*30%/);assert.equal(view(r,'Last Ember').status,'waiting');}
  else{assert.equal(rows(r,'Last Ember','passive-trigger')[0].values.hp,hp);assert.equal(view(r,'Last Ember').status,'complete');}
 }
});

test('Last Ember reports requested and actual capped Focus separately while granting all six Block',()=>{
 for(const [before,expected]of [[0,1],[2,1],[3,0]]){
  const r=fixture();r.hp=18;r.battle.focus=before;hand(r,['Last Ember']);play(r,'Last Ember');
  const entry=rows(r,'Last Ember','passive-trigger')[0];
  assert.equal(entry.values.requestedFocus,1);assert.equal(entry.values.focus,expected);
  assert.equal(entry.values.focusBefore,before);assert.equal(entry.values.focusAfter,before+expected);
  assert.equal(entry.values.focusCap,3);assert.equal(entry.values.block,6);
  assert.equal(r.battle.block,6);assert.equal(r.battle.focus,before+expected);
  if(!expected)assert.match(entry.summary,/\+0 Focus.*cap 3 reached/);
  assert.match(r.notice,new RegExp('\\+'+expected+' Focus'));
  const restored=E.restore(copy(r));assert.ok(restored);const seq=restored.battle.combatLog.seq;
  restored.battle.currentIntent.damage=0;E.endTurn(restored);
  assert.equal(rows(restored,'Last Ember','passive-trigger').length,1);
  assert.equal(view(restored,'Last Ember').triggeredCount,1);
  assert.ok(restored.battle.combatLog.seq>=seq);
 }
});

test('Last Ember responds to later nonlethal loss once and never revives a defeated player',()=>{
 const r=fixture();r.hp=19;hand(r,['Last Ember']);play(r,'Last Ember');
 r.battle.currentIntent.damage=1;E.endTurn(r);
 assert.equal(r.hp,18);assert.equal(r.battle.focus,1);
 assert.equal(rows(r,'Last Ember','passive-trigger').length,1);
 assert.equal(rows(r,'Last Ember','passive-trigger')[0].turn,1,'the trigger records the real enemy-hit turn');
 r.battle.currentIntent.damage=1;E.endTurn(r);
 assert.equal(rows(r,'Last Ember','passive-trigger').length,1);
 const lethal=fixture();lethal.hp=19;hand(lethal,['Last Ember']);play(lethal,'Last Ember');
 lethal.battle.currentIntent.damage=100;E.endTurn(lethal);
 assert.equal(lethal.scene,'defeat');assert.equal(lethal.hp,0);
 assert.equal(view(lethal,'Last Ember').triggeredCount,0);
 assert.equal(rows(lethal,'Last Ember','passive-trigger').length,0);
 assert.match(view(lethal,'Last Ember').waitingCondition,/0 HP/);
});

test('legacy Clarity and Clarity+ retain their original grants and the Focus stock cap',()=>{
 for(const upgraded of [false,true])for(const before of [0,2,3]){
  const r=fixture(['clarity',...Array(10).fill('Rune Strike')]);const [c]=hand(r,['clarity']);
  c.upgraded=upgraded;r.deck.find(x=>x.uid===c.uid).upgraded=upgraded;r.battle.focus=before;
  const requested=E.definition(c).focus;assert.equal(requested,upgraded?2:1);
  E.playCard(r,c.uid);assert.equal(r.battle.focus,Math.min(3,before+requested));
  const entry=rows(r,'clarity','card')[0];assert.ok(entry);
  assert.equal(entry.values.focusGained,Math.min(3,before+requested)-before);
  assert.equal(entry.values.focusRequested,requested);assert.equal(entry.values.focusCap,3);
  assert.match(entry.summary,/Focus gained \+\d \(requested \d, cap 3\)/);
  assert.ok(r.battle.exhaust.some(x=>x.uid===c.uid));
  assert.ok(E.restore(copy(r)));
 }
});

test('committed choices defer the card and Passive trigger history until one final resolution',()=>{
 let r=fixture();hand(r,['Grimoire Ward']);play(r,'Grimoire Ward');
 hand(r,['Read Ahead']);r.battle.focus=2;E.armFocus(r);const before=Log.entries(r);
 const c=play(r,'Read Ahead');assert.ok(E.cardChoice(r)?.committed);
 assert.deepEqual(Log.entries(r),before);assert.equal(view(r,'Grimoire Ward').triggeredCount,0);
 r=E.restore(copy(r));assert.ok(r);assert.deepEqual(Log.entries(r),before);
 finishChoices(r);
 assert.equal(rows(r,'Read Ahead','card').length,1);assert.equal(rows(r,'Read Ahead','card')[0].values.focus,1);
 assert.equal(rows(r,'Read Ahead','card')[0].values.cardsToHand,1);
 assert.equal(rows(r,'Grimoire Ward','passive-trigger').length,1);
 assert.equal(view(r,'Grimoire Ward').triggeredCount,1);
 const complete=copy(r),history=Log.entries(r);r=E.restore(copy(r));assert.deepEqual(Log.entries(r),history);
 assert.throws(()=>E.chooseCardOption(r,'take'));assert.throws(()=>E.playCard(r,c.uid));
 assert.deepEqual(r,complete,'reload/replay cannot repeat costs, results or history');
});

for(const [passive,card,attribute]of [['Growing Flame','Rune Strike','strength'],['Battle Rhythm','Rune Guard','agility']])test(passive+' exposes source-based progress and exactly four real triggers',()=>{
 const r=fixture([passive,...Array(12).fill(card)]);hand(r,[passive]);play(r,passive);
 assert.deepEqual(view(r,passive).progress,{current:0,target:3,maximum:4});
 for(let n=1;n<=13;n++){
  r.battle.energy=3;hand(r,[card]);play(r,card);
  assert.equal(view(r,passive).triggeredCount,Math.min(4,Math.floor(n/3)));
  assert.equal(r.battle[attribute],Math.min(4,Math.floor(n/3)));
 }
 assert.deepEqual(rows(r,passive,'passive-trigger').map(e=>e.values.count),[3,6,9,12]);
 assert.equal(view(r,passive).status,'complete');assert.match(view(r,passive).waitingCondition,/4\/4/);
 assert.equal(view(r,passive).lastTurn,1);assert.ok(E.restore(copy(r)));
 const before=copy(r),first=CC.passiveView(r);first[0].progress.current=999;first[0].name='Changed';
 assert.deepEqual(r,before);assert.notEqual(CC.passiveView(r)[0].name,'Changed');
 E.startBattle(r,'wisp');assert.deepEqual(CC.passiveView(r),[]);assert.deepEqual(rows(r,passive),[]);
});

test('activation stat effects, carry caps and next-turn work have distinct actual history',()=>{
 const r=fixture();hand(r,['Blazing Spirit','Swift Step']);play(r,'Blazing Spirit');play(r,'Swift Step');
 assert.equal(rows(r,'Blazing Spirit','passive-trigger')[0].values.amount,2);
 assert.equal(rows(r,'Swift Step','passive-trigger')[0].values.amount,2);
 assert.equal(view(r,'Blazing Spirit').status,'ongoing');assert.equal(view(r,'Swift Step').lastTurn,1);
 r.battle.energy=3;hand(r,['Lasting Shield','Hold the Line']);play(r,'Lasting Shield');play(r,'Hold the Line');
 assert.equal(rows(r,'Hold the Line','queued')[0].values.cap,5);
 r.battle.currentIntent.damage=2;E.endTurn(r);
 assert.equal(r.battle.block,5);
 const carry=rows(r,'Lasting Shield','passive-trigger')[0];
 assert.equal(carry.values.retained,5);assert.equal(carry.values.cap,5);assert.equal(carry.values.passiveCap,4);
 assert.match(carry.summary,/highest carry cap 5.*Hold the Line/);
 assert.equal(view(r,'Lasting Shield').triggeredCount,1);
 hand(r,['Layered Shield']);play(r,'Layered Shield');
 assert.equal(rows(r,'Layered Shield','queued')[0].values.value,6,'Agility is snapshotted only once');
 r.battle.currentIntent.damage=0;E.endTurn(r);
 assert.equal(rows(r,'Layered Shield','delayed')[0].values.block,6);
 assert.equal(view(r,'Lasting Shield').triggeredCount,2);
 assert.ok(E.restore(copy(r)));
});

test('Clear Mind starts next turn and reports actual zero when queued draws fill Hand',()=>{
 const r=fixture(['Clear Mind','Next Chapter','Next Chapter','Next Chapter',...Array(20).fill('Rune Strike')]);
 hand(r,['Clear Mind']);play(r,'Clear Mind');assert.equal(view(r,'Clear Mind').triggeredCount,0);
 assert.match(view(r,'Clear Mind').waitingCondition,/Starts next turn/);
 r.battle.energy=3;hand(r,['Next Chapter','Next Chapter','Next Chapter']);
 for(let n=0;n<3;n++)play(r,'Next Chapter');
 assert.equal(rows(r,'Next Chapter','queued').length,3);
 r.battle.currentIntent.damage=0;E.endTurn(r);
 assert.equal(r.battle.hand.length,10);assert.equal(rows(r,'Next Chapter','delayed').length,3);
 const actual=rows(r,'Clear Mind','passive-trigger')[0];
 assert.equal(actual.values.requestedDraw,1);assert.equal(actual.values.draw,0);
 assert.match(actual.summary,/0 extra cards drawn.*capacity/);
 assert.equal(view(r,'Clear Mind').triggeredCount,1);assert.equal(view(r,'Clear Mind').lastTurn,2);
 assert.ok(E.restore(copy(r)));
});

test('Ember Core requires a real focused card and stops when that card already killed the enemy',()=>{
 const r=fixture();hand(r,['Ember Core']);play(r,'Ember Core');r.battle.energy=3;
 hand(r,['Quick Study']);play(r,'Quick Study');assert.equal(view(r,'Ember Core').triggeredCount,0);
 hand(r,['Rune Strike']);r.battle.focus=2;E.armFocus(r);play(r,'Rune Strike');
 assert.equal(rows(r,'Ember Core','passive-trigger')[0].values.damage,2);
 assert.equal(view(r,'Ember Core').triggeredCount,1);assert.match(view(r,'Ember Core').waitingCondition,/ready again next turn/);
 const lethal=fixture();hand(lethal,['Ember Core']);play(lethal,'Ember Core');
 hand(lethal,['Rune Strike']);lethal.depth=4;lethal.battle.hp=1;lethal.battle.focus=1;E.armFocus(lethal);play(lethal,'Rune Strike');
 assert.equal(lethal.scene,'stageclear');assert.equal(view(lethal,'Ember Core').triggeredCount,0);
 assert.equal(rows(lethal,'Ember Core','passive-trigger').length,0);
});

test('status application records actual capped stacks and Thorns records each real retaliation',()=>{
 const r=fixture(['Cinder Guard','Cinder Guard','Cinder Guard','Cinder Guard',...Array(8).fill('Rune Strike')]);
 hand(r,['Cinder Guard','Cinder Guard','Cinder Guard','Cinder Guard']);
 r.battle.energy=3;for(let n=0;n<4;n++){if(!r.battle.energy)r.battle.energy=3;play(r,'Cinder Guard');}
 const statuses=rows(r,'Cinder Guard','status');assert.equal(statuses.length,4);
 assert.deepEqual(statuses.map(e=>e.values.amount),[1,1,1,0]);
 assert.equal(statuses.at(-1).values.after,3);assert.equal(statuses.at(-1).values.requested,1);
 const thorns=fixture();hand(thorns,['Ember Wall']);play(thorns,'Ember Wall');
 thorns.battle.currentIntent.damage=1;thorns.battle.currentIntent.hits=2;const played=thorns.stats.cardsPlayed;
 E.endTurn(thorns);const returns=rows(thorns,'Ember Wall','retaliation');
 assert.equal(returns.length,2);assert.deepEqual(returns.map(e=>e.values.damage),[2,2]);
 assert.equal(thorns.stats.cardsPlayed,played,'retaliation never becomes a played Attack');
});

test('structured history snapshots actors, remains bounded and returns independent read views',()=>{
 const r=fixture();delete r.battle.combatLog;
 for(let n=1;n<=90;n++)Log.record(r,{actor:n%2?'player':'enemy',kind:'test',source:'test',label:'Test',summary:'Action '+n,key:'test:'+n,values:{amount:n}});
 const entries=Log.entries(r);assert.equal(entries.length,80);assert.equal(entries[0].id,11);assert.equal(entries.at(-1).id,90);
 assert.equal(entries[0].actorName,C.MC.name);assert.equal(entries.at(-1).actorName,C.enemies.sentinel.name);
 const repeated=Log.record(r,{actor:'enemy',kind:'test',source:'test',label:'Test',summary:'Action 90',key:'test:90',values:{amount:90}});
 assert.equal(repeated.id,90);assert.equal(r.battle.combatLog.seq,90);assert.equal(Log.entries(r).length,80);
 entries[0].values.amount=999;entries[0].actorName='Changed';assert.equal(Log.entries(r)[0].values.amount,11);
 r.battle.enemyId='wisp';assert.equal(Log.entries(r).at(-1).actorName,C.enemies.sentinel.name);r.battle.enemyId='sentinel';
 assert.ok(Log.valid(r));assert.ok(E.restore(copy(r)));
});

test('history rejects malformed shape and imported future, duplicate or unbounded entries',()=>{
 const r=fixture();Log.record(r,{kind:'test',source:'test',label:'Test',summary:'Saved once.',values:{amount:1}});
 const before=copy(r);
 for(const event of [{kind:'test',source:'test',label:'Test',summary:'x'.repeat(801)},{kind:'test',source:'test',label:'Test',summary:'Nested',values:{nested:[]}},{actor:'other',kind:'test',source:'test',label:'Test',summary:'Unknown actor'}]){
  assert.throws(()=>Log.record(r,event));assert.deepEqual(r,before);
 }
 for(const mutate of [
  b=>b.combatLog.version=2,
  b=>b.combatLog.entries[0].turn=b.turn+1,
  b=>b.combatLog.entries[0].id=0,
  b=>b.combatLog.entries[0].values={nested:{}},
  b=>b.combatLog.entries.push(copy(b.combatLog.entries[0])),
  b=>b.combatLog.entries=Array(81).fill(b.combatLog.entries[0]),
  b=>b.combatLog.seq++
 ]){const bad=copy(r);mutate(bad.battle);assert.equal(Log.valid(bad),false);assert.equal(E.restore(bad),null);}
 const old=copy(r);delete old.battle.combatLog;assert.ok(E.validate(old));
 const restored=E.restore(old);assert.ok(restored);assert.deepEqual(Log.entries(restored),[],'old saves never invent missing history');
});

test('the browser module publishes DCCombatLog without Node or a renderer',()=>{
 const context=vm.createContext({DCConfig:copy(C)});
 vm.runInContext(fs.readFileSync(require.resolve('../dist/combat-log.js'),'utf8'),context);
 const result=vm.runInContext("const r={battle:{turn:1,enemyId:'wisp'}};DCCombatLog.record(r,{kind:'test',source:'test',label:'Test',summary:'Ready.'});JSON.stringify({valid:DCCombatLog.valid(r),entries:DCCombatLog.entries(r)})",context);
 const parsed=JSON.parse(result);assert.equal(parsed.valid,true);assert.equal(parsed.entries[0].actorName,'Alyssa');
});
