'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),C=require('../dist/config.js'),data=require('../dist/card-data.js');
const key=name=>data.cards.find(c=>c.name===name).id;
function fixture(){const r=E.newRun(8726);delete r.route;r.seq=0;r.deck=data.cards.map(c=>E.card(r,c.id));E.startBattle(r,'sentinel');r.battle.hp=r.battle.maxHp=10000;r.battle.seals=2;r.battle.enemyBlock=0;r.battle.currentIntent.damage=0;return r;}
function play(r,name){const b=r.battle,all=[...b.hand,...b.draw,...b.discard],i=all.findIndex(c=>c.key===key(name));assert.ok(i>=0,name);const c=all.splice(i,1)[0];b.hand=[c];b.draw=all;b.discard=[];b.energy=C.ENERGY;E.playCard(r,c.uid);return c;}

test('real Passive attributes and card Block produce actual signed hero changes',()=>{
 const V=require('../dist/status-vfx.js'),r=fixture();
 for(const [name,id]of [['Blazing Spirit','strength'],['Swift Step','agility'],['Rune Armor','defense'],['Rune Guard','block']]){const before=V.snapshot(r);play(r,name);const cue=V.effects(before,r).find(e=>e.id===id);assert.ok(cue,name);assert.equal(cue.delta,r.battle[id]-(before.values[id]||0));assert.equal(cue.kind,'up');assert.ok(V.ambient(r).some(e=>e.id===id));}
 const prior=V.snapshot(r),outgoing=r.battle.active.find(c=>c.key===key('Blazing Spirit'));play(r,'Grimoire Ward');assert.deepEqual(V.effects(prior,r),[],'Unpaid replacement does not change stats');E.chooseCardOption(r,{choiceId:E.cardChoice(r).id,value:outgoing.uid});const reduction=V.effects(prior,r).find(e=>e.id==='strength');assert.equal(reduction.kind,'down');assert.equal(reduction.delta,-prior.values.strength);assert.equal(reduction.label,'−'+prior.values.strength+' Strength');
});

test('Block impact follows the enemy receipt even when a queued shield refills to the same value',()=>{
 const V=require('../dist/status-vfx.js'),r=fixture();play(r,'Swift Step');play(r,'Layered Shield');r.battle.currentIntent.damage=4;assert.ok(E.validate(r));
 const before=V.snapshot(r);E.endTurn(r);assert.equal(r.battle.block,before.values.block);
 const cues=V.effects(before,r),impact=cues.find(e=>e.kind==='impact');assert.equal(impact.amount,4);assert.match(impact.label,/4 Block absorbed/);assert.equal(cues.some(e=>e.id==='block'&&e.kind==='up'),false,'Do not manufacture a net stat gain');
});

test('ordinary Block expiry never fabricates a blocked hit or a debuff',()=>{
 const V=require('../dist/status-vfx.js'),r=fixture();r.battle.block=8;const before=V.snapshot(r);E.endTurn(r);
 const cues=V.effects(before,r);assert.equal(r.battle.block,0);assert.equal(cues.some(e=>e.kind==='impact'),false);assert.equal(cues.find(e=>e.id==='block').kind,'expire');
});

test('player debuff gains and clears differ from enemy statuses and pending future grants',()=>{
 const V=require('../dist/status-vfx.js'),r=fixture(),before=V.snapshot(r),s=r.battle.cardCombat.statuses;
 s.self.weak=2;s.self.weakUntil=2;s.self.vulnerable=1;s.self.vulnerableUntil=2;s.enemy.weak=3;s.enemy.weakUntil=1;r.battle.cardCombat.queue.push({kind:'block',value:4,turn:2,source:key('Layered Shield'),agility:0});assert.ok(E.validate(r));
 const cues=V.effects(before,r);assert.deepEqual(cues.map(e=>[e.id,e.kind]),[['weak','down'],['vulnerable','down']]);assert.equal(V.ambient(r).some(e=>e.id==='block'),false);
 const applied=V.snapshot(r);s.self.weak=0;s.self.vulnerable=0;assert.ok(V.effects(applied,r,'ms').every(e=>e.kind==='cleanse'));assert.match(V.effects(applied,r,'ms')[0].label,/−2 Weak/);
});

test('Continue, unchanged renders and different battles cannot replay historical effects',()=>{
 const V=require('../dist/status-vfx.js'),r=fixture();play(r,'Blazing Spirit');assert.deepEqual(V.effects(null,r),[]);assert.deepEqual(V.effects(V.snapshot(r),r),[]);
 const before=V.snapshot(r),other=E.clone(r);other.depth++;other.battle.strength++;assert.deepEqual(V.effects(before,other),[]);other.depth=r.depth;other.started++;assert.deepEqual(V.effects(before,other),[]);
});

test('status projection, cues and unchanged queue grants leave all saved data and RNG untouched',()=>{
 const V=require('../dist/status-vfx.js'),r=fixture(),before=V.snapshot(r);play(r,'Ember Wall');const saved=JSON.stringify(r),random=Math.random;
 try{Math.random=()=>{throw Error('Presentation must not sample randomness');};V.snapshot(r);V.ambient(r);V.effects(before,r,'ms');}finally{Math.random=random;}
 assert.equal(JSON.stringify(r),saved);assert.ok(V.ambient(r).some(e=>e.id==='thorns'));
});

function domHarness(){
 const {JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom'),fs=require('node:fs');
 const dom=new JSDOM('<div class="player"><div class="fighter-anchor"></div></div><dialog id="dialog"></dialog>',{pretendToBeVisual:true,runScripts:'outside-only'}),w=dom.window;
 let motion=true,reduced=false,quality='full';const animations=[],sounds=[];
 w.matchMedia=()=>({get matches(){return reduced;}});w.HTMLElement.prototype.animate=function(frames,timing){let finish,reject;const finished=new Promise((a,b)=>{finish=a;reject=b;}),a={finished,cancel(){reject(Error('cancelled'));},finish,element:this,timing};animations.push(a);return a;};
 w.DCCombatStatus=require('../dist/combat-status.js');w.eval(fs.readFileSync(require.resolve('../dist/status-vfx.js'),'utf8'));
 const controller=w.DCStatusVFX.create({document:w.document,motion:()=>motion,quality:()=>quality,onSound:kind=>sounds.push(kind)});
 return{dom,w,controller,animations,sounds,setMotion:v=>{motion=v;},setReduced:v=>{reduced=v;},setQuality:v=>{quality=v;}};
}

test('decorative effects respect motion/dialog policy and late completion cannot remove a replacement aura',async()=>{
 const h=domHarness(),r=fixture(),before=h.w.DCStatusVFX.snapshot(r);play(r,'Rune Guard');h.controller.mount(r);h.controller.play(before,r);await new Promise(resolve=>h.w.requestAnimationFrame(resolve));
 const host=h.w.document.querySelector('.status-vfx');assert.ok(host);assert.equal(host.getAttribute('aria-hidden'),'true');assert.equal(host.inert,true);assert.ok(host.querySelector('[data-status-effect=block]'));
 const old=h.animations.slice();h.controller.mount(r);for(const a of old)a.finish();await Promise.resolve();assert.ok(h.w.document.querySelector('[data-status-aura=block]'));
 h.w.document.querySelector('#dialog').setAttribute('open','');h.controller.sync();assert.equal(h.w.document.querySelector('.status-vfx'),null);
 h.w.document.querySelector('#dialog').removeAttribute('open');h.controller.sync();assert.ok(h.w.document.querySelector('[data-status-aura=block]'));assert.equal(h.w.document.querySelector('[data-status-effect]'),null);
 h.w.document.querySelector('#dialog').setAttribute('open','');h.controller.mount(r);h.controller.play(before,r);h.w.document.querySelector('#dialog').removeAttribute('open');h.controller.sync();await new Promise(resolve=>h.w.requestAnimationFrame(resolve));assert.ok(h.w.document.querySelector('[data-status-effect=block]'),'A confirmed native choice can close before the next presentation frame');
 h.setMotion(false);h.controller.sync();assert.equal(h.w.document.querySelector('.status-vfx'),null);h.setMotion(true);h.setReduced(true);h.controller.sync();assert.equal(h.w.document.querySelector('.status-vfx'),null);
 h.controller.destroy();h.dom.window.close();
});

test('resize, pagehide, scene exit and destruction clean transient presentation without mutating the run',()=>{
 const h=domHarness(),r=fixture(),before=h.w.DCStatusVFX.snapshot(r);play(r,'Rune Guard');const saved=JSON.stringify(r);h.controller.mount(r);h.controller.play(before,r);h.w.dispatchEvent(new h.w.Event('resize'));assert.equal(h.w.document.querySelector('[data-status-effect]'),null);assert.ok(h.w.document.querySelector('[data-status-aura=block]'));
 h.w.dispatchEvent(new h.w.Event('pagehide'));assert.equal(h.w.document.querySelector('.status-vfx'),null);h.w.dispatchEvent(new h.w.Event('pageshow'));assert.ok(h.w.document.querySelector('.status-vfx'));assert.equal(h.w.document.querySelector('[data-status-effect]'),null);
 Object.defineProperty(h.w.document,'hidden',{configurable:true,value:true});h.w.document.dispatchEvent(new h.w.Event('visibilitychange'));assert.equal(h.w.document.querySelector('.status-vfx'),null);Object.defineProperty(h.w.document,'hidden',{configurable:true,value:false});h.w.document.dispatchEvent(new h.w.Event('visibilitychange'));assert.ok(h.w.document.querySelector('[data-status-aura=block]'));assert.equal(h.w.document.querySelector('[data-status-effect]'),null);
 h.controller.mount({...r,scene:'reward'});assert.equal(h.w.document.querySelector('.status-vfx'),null);h.controller.mount(r);h.controller.destroy();h.w.dispatchEvent(new h.w.Event('pageshow'));assert.equal(h.w.document.querySelector('.status-vfx'),null);assert.equal(JSON.stringify(r),saved);h.dom.window.close();
});

test('a crowded committed interval keeps new debuffs ahead of buffs and summarizes every remaining status',()=>{
 const V=require('../dist/status-vfx.js'),Motion=require('../dist/card-motion.js'),r=fixture(),before=V.snapshot(r),cardBefore=Motion.snapshot(r);
 for(const name of ['Blazing Spirit','Swift Step','Rune Armor','Rune Guard','Ember Wall'])play(r,name);
 Object.assign(r.battle.cardCombat.statuses.self,{weak:2,weakUntil:2,vulnerable:1,vulnerableUntil:2});assert.ok(E.validate(r));
 const saved=JSON.stringify(r),p=V.plan(before,r,'en',{passives:Motion.effects(cardBefore,r)});
 assert.equal(p.cues.length,4);assert.deepEqual(p.cues.slice(0,2).map(e=>e.id),['weak','vulnerable']);
 const all=p.cues.flatMap(e=>e.items||[e]);assert.deepEqual(all.map(e=>e.id).sort(),['strength','agility','defense','block','thorns','weak','vulnerable'].sort());
 assert.equal(p.sound,'stat-down');assert.equal(JSON.stringify(r),saved);
});

test('only an exactly explained Passive delta loses its duplicate status label',async()=>{
 const V=require('../dist/status-vfx.js'),Motion=require('../dist/card-motion.js'),r=fixture(),before=V.snapshot(r),prior=Motion.snapshot(r);play(r,'Blazing Spirit');
 let p=V.plan(before,r,'en',{passives:Motion.effects(prior,r)});assert.deepEqual(p.cues[0].labelOwner,[key('Blazing Spirit')]);assert.match(p.passives[0].detail,/\+2 Strength/);
 const h=domHarness();h.controller.mount(r);h.controller.play(before,r,'en',p);await new Promise(resolve=>h.w.requestAnimationFrame(resolve));assert.ok(h.w.document.querySelector('[data-status-effect=strength]'));assert.equal(h.w.document.querySelector('.status-vfx-label'),null);h.controller.destroy();h.dom.window.close();
 const mixed=fixture();play(mixed,'Grimoire Ward');const a=V.snapshot(mixed),b=Motion.snapshot(mixed);play(mixed,'Rune Guard');play(mixed,'Quick Study');p=V.plan(a,mixed,'en',{passives:Motion.effects(b,mixed)});assert.ok(p.cues.find(e=>e.id==='block').delta>p.passives[0].changes.block);assert.equal(p.cues.find(e=>e.id==='block').labelOwner,undefined,'The unrelated card grant must remain visible');
});

test('partial absorption, exact depletion, depletion with HP loss and ordinary expiry have separate presentations',()=>{
 const V=require('../dist/status-vfx.js');
 for(const [block,damage,broken,sound]of [[8,4,false,'shield-hit'],[4,4,true,'shield-break'],[4,8,true,'shield-break']]){
  const r=fixture();r.battle.block=block;r.battle.currentIntent.damage=damage;const before=V.snapshot(r);E.endTurn(r);const p=V.plan(before,r),impact=p.cues.find(e=>e.kind==='impact');assert.equal(impact.amount,Math.min(block,damage));assert.equal(impact.broken,broken);assert.equal(p.cues.some(e=>e.id==='block'&&e.kind==='expire'),false);assert.equal(p.sound,sound);
 }
 const r=fixture();r.battle.block=8;const before=V.snapshot(r);E.endTurn(r);const p=V.plan(before,r);assert.equal(p.cues.find(e=>e.id==='block').kind,'expire');assert.equal(p.sound,'shield-expire');
});

test('one action emits one delayed SFX; a new action or dialog cancels it, while Motion Off retains sound',async()=>{
 const h=domHarness(),r=fixture(),before=h.w.DCStatusVFX.snapshot(r);play(r,'Rune Guard');const saved=JSON.stringify(r),transfers=[{from:'hand',to:'discard'}],p=h.w.DCStatusVFX.plan(before,r,'en',{transfers});
 h.controller.mount(r);h.controller.play(before,r,'en',p);await new Promise(resolve=>h.w.requestAnimationFrame(resolve));h.controller.capture(r);await new Promise(resolve=>h.w.setTimeout(resolve,210));assert.deepEqual(h.sounds,[]);
 h.controller.mount(r);h.controller.play(before,r,'en',p);await new Promise(resolve=>h.w.requestAnimationFrame(resolve));h.w.document.querySelector('#dialog').setAttribute('open','');h.controller.sync();await new Promise(resolve=>h.w.setTimeout(resolve,210));assert.deepEqual(h.sounds,[]);
 h.w.document.querySelector('#dialog').removeAttribute('open');h.setMotion(false);h.controller.mount(r);h.controller.play(before,r,'en',p);await new Promise(resolve=>h.w.setTimeout(resolve,45));assert.deepEqual(h.sounds,['shield-gain']);assert.equal(h.w.document.querySelector('.status-vfx'),null);assert.equal(JSON.stringify(r),saved);h.controller.destroy();h.dom.window.close();
});

test('Low keeps every active aura and exact delta while reducing particles and removing continuous embers',async()=>{
 const h=domHarness(),r=fixture();play(r,'Blazing Spirit');play(r,'Swift Step');play(r,'Rune Armor');const before=h.w.DCStatusVFX.snapshot(r);play(r,'Rune Guard');const saved=JSON.stringify(r);
 h.controller.mount(r);h.controller.play(before,r);await new Promise(resolve=>h.w.requestAnimationFrame(resolve));const full=h.w.document.querySelectorAll('.status-vfx-particle').length;assert.ok(h.w.document.querySelector('.status-vfx-ember'));
 h.setQuality('low');h.controller.mount(r);h.controller.play(before,r);await new Promise(resolve=>h.w.requestAnimationFrame(resolve));assert.equal(h.w.document.querySelectorAll('[data-status-aura]').length,4);assert.equal(h.w.document.querySelector('.status-vfx').dataset.quality,'low');assert.equal(h.w.document.querySelector('.status-vfx-ember'),null);assert.ok(h.w.document.querySelectorAll('.status-vfx-particle').length<full);assert.equal(JSON.stringify(r),saved);h.controller.destroy();h.dom.window.close();
});
