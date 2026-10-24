'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),C=require('../dist/config.js'),cards=require('../dist/card-data.js');
const V=require('../dist/status-vfx.js');
const key=name=>cards.cards.find(c=>c.name===name).id;
function fixture(){const r=E.newRun(8726);delete r.route;r.seq=0;r.deck=cards.cards.map(c=>E.card(r,c.id));E.startBattle(r,'sentinel');r.battle.hp=r.battle.maxHp=10000;r.battle.seals=2;r.battle.enemyBlock=0;r.battle.currentIntent.damage=0;return r;}
function play(r,name){const b=r.battle,all=[...b.hand,...b.draw,...b.discard],i=all.findIndex(c=>c.key===key(name));assert.ok(i>=0,name);const card=all.splice(i,1)[0];b.hand=[card];b.draw=all;b.discard=[];b.energy=C.ENERGY;E.playCard(r,card.uid);return card;}

test('live projection includes actual enemy effects without painting future player grants',()=>{
 const r=fixture(),b=r.battle;b.enemyBlock=12;b.enemyDefense=2;b.cardCombat.statuses.enemy.weak=1;b.cardCombat.statuses.enemy.weakUntil=1;
 b.cardCombat.queue.push({kind:'block',value:4,turn:2,source:key('Layered Shield'),agility:0});
 const saved=JSON.stringify(r),state=V.snapshot(r);
 assert.deepEqual(state.actors?.enemy?.values,{defense:2,block:12,weak:1});
 assert.deepEqual(state.actors.player.values,{});
 assert.equal(JSON.stringify(r),saved);
});

test('live Passive layers follow committed trigger order rather than equipped-card order',()=>{
 const r=fixture();play(r,'Blazing Spirit');play(r,'Rune Armor');play(r,'Growing Flame');r.battle.active.reverse();
 const saved=JSON.stringify(r),state=V.snapshot(r);
 assert.deepEqual(state.actors?.player?.passives?.map(p=>p.source),[key('Blazing Spirit'),key('Rune Armor')]);
 assert.deepEqual(state.actors.player.passives.map(p=>p.id),[0,4]);
 assert.deepEqual(state.actors.enemy.passives,[]);
 assert.equal(JSON.stringify(r),saved);
});

test('Continue retains already-triggered Passives after old combat-log entries are trimmed',()=>{
 const r=fixture();play(r,'Blazing Spirit');play(r,'Growing Flame');
 r.battle.combatLog.entries=[];
 const saved=JSON.stringify(r),state=V.snapshot(r);
 assert.deepEqual(state.actors.player.passives.map(p=>p.id),[0]);
 assert.equal(JSON.stringify(r),saved);
});

test('all ten Passive motifs are projected only after their actual engine trigger',()=>{
 const names=['Blazing Spirit','Growing Flame','Swift Step','Battle Rhythm','Rune Armor','Lasting Shield','Grimoire Ward','Ember Core','Clear Mind','Last Ember'];
 for(const [id,name] of names.entries()){
  const r=fixture();if(name==='Last Ember')r.hp=1;
  play(r,name);
  if(['Growing Flame','Battle Rhythm'].includes(name))for(let i=0;i<3;i++)play(r,name==='Battle Rhythm'?'Rune Guard':'Rune Strike');
  if(['Lasting Shield','Clear Mind'].includes(name)){r.battle.block=5;E.endTurn(r);}
  if(name==='Grimoire Ward')play(r,'Quick Study');
  if(name==='Ember Core'){r.battle.focus=1;E.armFocus(r);play(r,'Rune Strike');}
  assert.equal(r.battle.cardCombat.counters[key(name)].triggers>0,true,name+' really triggered');
  assert.deepEqual(V.snapshot(r).actors.player.passives.map(p=>p.id),[id],name);
 }
});

test('an enemy shield hit comes from actual damage receipts and a spent shield can break',()=>{
 const r=fixture();r.battle.enemyBlock=12;const before=V.snapshot(r);play(r,'Rune Strike');
 const partial=V.plan(before,r).visuals?.enemy?.filter(e=>e.id==='block').map(e=>e.event);
 assert.deepEqual(partial,['hit']);
 const second=V.snapshot(r);play(r,'Fate Storm');
 assert.deepEqual(V.plan(second,r).visuals.enemy.filter(e=>e.id==='block').map(e=>e.event),['break']);
});

test('a real Thorns retaliation plays its radial hit before its same-action expiry',()=>{
 const r=fixture();play(r,'Ember Wall');r.battle.currentIntent.damage=4;const before=V.snapshot(r);E.endTurn(r);
 assert.deepEqual(V.plan(before,r).visuals?.player?.filter(e=>e.id==='thorns').map(e=>e.event),['hit','expire']);
});

test('status creation and expiry use the affected actor and never create a shield hit',()=>{
 const r=fixture(),before=V.snapshot(r);play(r,'Cinder Guard');
 assert.deepEqual(V.plan(before,r).visuals?.enemy?.filter(e=>e.id==='weak').map(e=>e.event),['gain']);
 const applied=V.snapshot(r);E.endTurn(r);
 assert.deepEqual(V.plan(applied,r).visuals.enemy.filter(e=>e.id==='weak').map(e=>e.event),['expire']);
 const player=fixture();player.battle.block=8;const blockBefore=V.snapshot(player);E.endTurn(player);
 assert.deepEqual(V.plan(blockBefore,player).visuals.player.filter(e=>e.id==='block').map(e=>e.event),['expire']);
});

test('a smaller positive enemy intent shield remains active rather than expiring and reappearing',()=>{
 const r=fixture();r.battle.enemyBlock=15;const before=V.snapshot(r);E.endTurn(r);
 assert.ok(r.battle.enemyBlock>0&&r.battle.enemyBlock<15);
 assert.deepEqual(V.plan(before,r).visuals.enemy.filter(e=>e.id==='block'),[]);
});

test('incremental combat patching keeps VFX canvas buffers and their live phase',()=>{
 const {JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom'),P=require('../dist/dom-patch.js');
 const dom=new JSDOM('<main><canvas class="combat-vfx-canvas" data-render-key="vfx-player-front" data-vfx-clock="7.2" width="640" height="480"></canvas></main>');
 try{const d=dom.window.document,canvas=d.querySelector('canvas');P.patch(d.querySelector('main'),'<canvas class="combat-vfx-canvas" data-render-key="vfx-player-front" width="1" height="1"></canvas>');
  assert.equal(d.querySelector('canvas'),canvas);assert.equal(canvas.width,640);assert.equal(canvas.height,480);assert.equal(canvas.dataset.vfxClock,'7.2');
 }finally{dom.window.close();}
});
