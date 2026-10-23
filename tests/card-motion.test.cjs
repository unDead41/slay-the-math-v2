const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),C=require('../dist/config.js'),data=require('../dist/card-data.js');
const key=name=>data.cards.find(c=>c.name===name).id;
function fixture(){const r=E.newRun(8726);delete r.route;r.seq=0;r.deck=data.cards.map(c=>E.card(r,c.id));E.startBattle(r,'sentinel');r.battle.hp=r.battle.maxHp=10000;r.battle.seals=2;r.battle.enemyBlock=0;r.battle.currentIntent.damage=0;return r;}
function play(r,name){const b=r.battle,all=[...b.hand,...b.draw,...b.discard],i=all.findIndex(c=>c.key===key(name));assert.ok(i>=0,name);const c=all.splice(i,1)[0];b.hand=[c];b.draw=all;b.discard=[];b.energy=C.ENERGY;E.playCard(r,c.uid);return c;}

test('all ten Passives describe only their actual, newly resolved trigger events',()=>{
 const Motion=require('../dist/card-motion.js'),seen=new Set();
 for(const name of ['Blazing Spirit','Swift Step','Rune Armor']){const r=fixture(),before=Motion.snapshot(r);play(r,name);const cues=Motion.effects(before,r);assert.equal(cues.length,1);assert.equal(cues[0].source,key(name));assert.match(cues[0].detail,/\+\d/);seen.add(name);}
 for(const [name,role]of [['Growing Flame','Rune Strike'],['Battle Rhythm','Rune Guard']]){const r=fixture();play(r,name);const before=Motion.snapshot(r);for(let n=0;n<3;n++)play(r,role);const cues=Motion.effects(before,r);assert.equal(cues.length,1);assert.match(cues[0].detail,/\+1/);seen.add(name);}
 for(const name of ['Lasting Shield','Clear Mind']){const r=fixture();play(r,name);r.battle.block=5;const before=Motion.snapshot(r);E.endTurn(r);const cues=Motion.effects(before,r);assert.equal(cues.length,1);assert.ok(cues[0].detail.length>3);seen.add(name);}
 {const r=fixture();play(r,'Grimoire Ward');const before=Motion.snapshot(r);play(r,'Quick Study');assert.equal(Motion.effects(before,r)[0].source,key('Grimoire Ward'));seen.add('Grimoire Ward');}
 {const r=fixture();play(r,'Ember Core');r.battle.focus=1;E.armFocus(r);const before=Motion.snapshot(r);play(r,'Rune Strike');assert.match(Motion.effects(before,r)[0].detail,/HP/);seen.add('Ember Core');}
 {const r=fixture();r.hp=1;r.battle.focus=C.FOCUS_CAP;const before=Motion.snapshot(r);play(r,'Last Ember');const cue=Motion.effects(before,r)[0];assert.match(cue.detail,/\+0 Focus/);seen.add('Last Ember');}
 assert.deepEqual([...seen].sort(),data.cards.filter(c=>c.category==='passive').map(c=>c.name).sort());
});

test('waiting, refreshed and ongoing Passives do not fabricate repeat triggers',()=>{
 const Motion=require('../dist/card-motion.js'),r=fixture();play(r,'Clear Mind');assert.deepEqual(Motion.effects(Motion.snapshot(r),r),[]);assert.deepEqual(Motion.effects(null,r),[]);
 play(r,'Blazing Spirit');const before=Motion.snapshot(r);E.endTurn(r);assert.ok(Motion.effects(before,r).every(e=>e.source!==key('Blazing Spirit')));
 assert.deepEqual(Motion.effects(Motion.snapshot(r),E.restore(E.clone(r))),[]);
 const other=E.clone(r);other.depth++;assert.deepEqual(Motion.effects(before,other),[]);
});

test('presentation uses actual zero draw, retained Block and capped direct HP damage',()=>{
 const Motion=require('../dist/card-motion.js');
 for(const [name,values,pattern]of [['Clear Mind',{draw:0,requestedDraw:1},/0 cards/],['Lasting Shield',{retained:2,cap:5},/2 Block/],['Ember Core',{damage:1,requestedDamage:3},/1 HP/],['Last Ember',{block:8,focus:0,requestedFocus:1},/\+0 Focus/]]){
  const cue=Motion.describe({id:1,kind:'passive-trigger',source:key(name),values,summary:'Resolved.'});assert.match(cue.detail,pattern);
 }
});

test('movement planning folds resolving into its real destination and groups hidden reshuffles',()=>{
 const Motion=require('../dist/card-motion.js'),card={uid:'a',key:key('Rune Strike'),upgraded:false},other={...card,uid:'b'};
 const moves=Motion.plan([{card,from:'hand',to:'resolving',revealed:true},{card:other,from:'draw',to:'hand',revealed:true},{card,from:'resolving',to:'discard',revealed:true},{card,from:'discard',to:'draw',revealed:false},{card:other,from:'discard',to:'draw',revealed:false},{card,from:'draw',to:'hand',revealed:true}]);
 assert.deepEqual(moves.map(m=>m.kind),['discard','draw','shuffle','draw']);assert.equal(moves[0].from,'hand');assert.equal(moves[2].count,2);assert.equal(moves[2].revealed,false);
});

test('motion descriptions and plans cannot mutate saved results or consume gameplay RNG',()=>{
 const Motion=require('../dist/card-motion.js'),r=fixture(),before=Motion.snapshot(r);play(r,'Blazing Spirit');const saved=JSON.stringify(r);Motion.effects(before,r,'ms');Motion.plan([]);assert.equal(JSON.stringify(r),saved);
});
