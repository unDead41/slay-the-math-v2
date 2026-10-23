const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),C=require('../dist/config.js'),data=require('../dist/card-data.js');
const key=name=>data.cards.find(c=>c.name===name).id;
function fixture(names=data.cards.map(c=>c.name)){
 const r=E.newRun(7268);delete r.route;r.seq=0;r.deck=names.map(n=>E.card(r,key(n)));E.startBattle(r,'sentinel');
 r.battle.hp=r.battle.maxHp=10000;r.battle.seals=2;r.battle.enemyBlock=0;r.battle.currentIntent.damage=0;return r;
}
function arrange(r,names){const b=r.battle,all=[...b.hand,...b.draw,...b.discard];b.hand=[];b.discard=[];for(const name of names){const i=all.findIndex(c=>c.key===key(name));assert.ok(i>=0,name);b.hand.push(all.splice(i,1)[0]);}b.draw=all;b.energy=C.ENERGY;}
function capture(r,fn){const Flow=require('../dist/card-flow.js'),token=Flow.begin(r);try{fn();return Flow.end(token);}catch(err){Flow.end(token,false);throw err;}}

test('the same physical card can be discarded, shuffled and drawn within one End Turn',()=>{
 const r=fixture(['Rune Guard','Rune Guard','Rune Guard','Rune Guard']),old=r.battle.hand.map(c=>c.uid);
 const moves=capture(r,()=>E.endTurn(r));
 for(const uid of old){const route=moves.filter(m=>m.card.uid===uid).map(m=>m.from+'>'+m.to);assert.deepEqual(route,['hand>discard','discard>draw','draw>hand']);}
 assert.equal(moves.filter(m=>m.to==='hand').length,4);assert.ok(E.validate(r));
});

test('capture preserves costs, RNG, receipts and the complete saved result',()=>{
 const r=fixture();arrange(r,['Quick Study']);const baseline=E.clone(r),uid=r.battle.hand[0].uid;
 const moves=capture(r,()=>E.playCard(r,uid));E.playCard(baseline,uid);
 assert.deepEqual(r,baseline);assert.ok(moves.some(m=>m.card.uid===uid&&m.from==='hand'&&m.to==='resolving'));
 assert.ok(moves.some(m=>m.card.uid===uid&&m.from==='resolving'&&m.to==='discard'));
 assert.equal(moves.filter(m=>m.to==='hand').length,2);assert.ok(E.restore(E.clone(r)));
});

test('Exhaust, Recall and rejected choices report only actual committed transfers',()=>{
 const r=fixture();arrange(r,['Flash Ward']);const uid=r.battle.hand[0].uid;
 const moves=capture(r,()=>E.playCard(r,uid));assert.ok(moves.some(m=>m.card.uid===uid&&m.to==='exhaust'));assert.ok(r.battle.exhaust.some(c=>c.uid===uid));
 arrange(r,['Recall']);const recalled=r.battle.draw.pop();r.battle.discard.push(recalled);
 assert.deepEqual(capture(r,()=>E.playCard(r,r.battle.hand[0].uid)),[],'prechoice has not paid or moved a card');
 const token=require('../dist/card-flow.js').begin(r),saved=E.clone(r);assert.throws(()=>E.chooseCardOption(r,'missing'));
 assert.deepEqual(require('../dist/card-flow.js').end(token),[]);assert.deepEqual(r,saved);
 const returned=capture(r,()=>E.chooseCardOption(r,recalled.uid));assert.ok(returned.some(m=>m.card.uid===recalled.uid&&m.from==='discard'&&m.to==='hand'));
});

test('revealed choices and hidden category searches keep their different visibility',()=>{
 const r=fixture();arrange(r,['Clear Choice']);capture(r,()=>E.playCard(r,r.battle.hand[0].uid));
 const ch=E.cardChoice(r),selected=ch.candidates[0].uid,discarded=ch.candidates.slice(1).map(c=>c.uid);
 const moves=capture(r,()=>E.chooseCardOption(r,selected));assert.ok(moves.some(m=>m.card.uid===selected&&m.from==='choice'&&m.to==='hand'&&m.revealed));
 assert.ok(discarded.every(uid=>moves.some(m=>m.card.uid===uid&&m.to==='discard'&&m.revealed)));
 const search=fixture(['Card Search',...Array(8).fill('Rune Strike')]);arrange(search,['Card Search']);capture(search,()=>E.playCard(search,search.battle.hand[0].uid));
 const skipped=capture(search,()=>E.chooseCardOption(search,'passive')).filter(m=>m.from==='draw'&&m.to==='discard');assert.equal(skipped.length,4);assert.ok(skipped.every(m=>!m.revealed));
});

test('failed child transactions are discarded and never leak into later captures',()=>{
 const Flow=require('../dist/card-flow.js'),r=fixture(),child=E.clone(r),token=Flow.begin(r),fork=Flow.fork(r,child);
 Flow.move(child,child.battle.hand[0],'hand','discard',true);Flow.end(fork,false);assert.deepEqual(Flow.end(token),[]);
 const clean=Flow.begin(r);assert.deepEqual(Flow.end(clean),[]);Flow.move(r,r.battle.hand[0],'hand','discard',true);
 assert.deepEqual(capture(r,()=>{}),[]);
});

test('a real post-transfer validation rejection rolls back the save and the observed journal',()=>{
 const Flow=require('../dist/card-flow.js'),r=fixture();arrange(r,['Quick Study']);r.battle.cardCombat.seq=100000;
 assert.ok(E.validate(r));const saved=E.clone(r),token=Flow.begin(r);
 assert.throws(()=>E.playCard(r,r.battle.hand[0].uid),/could not be saved/);
 assert.deepEqual(Flow.end(token),[]);assert.deepEqual(r,saved);
});

module.exports={fixture,arrange,capture,key};
