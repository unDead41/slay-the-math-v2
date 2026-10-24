'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {loadMaster}=require('../tools/balance/master/loader.cjs'),D=require('../tools/balance/deep.cjs');
const ordinary={E:require('../dist/engine.js'),C:require('../dist/config.js'),A:require('../dist/artifacts.js'),CC:require('../dist/card-combat.js'),data:require('../dist/card-data.js')};
const saved=require('./fixtures/card-tuning-v1.json'),K=require('../dist/card-kit.js');
function fixture(x,names,upgraded=false){
 const ids=names.map(n=>x.data.cards.find(c=>c.name===n).id),r=D.create(x,{seed:941,enemy:'sentinel',deck:[...ids.map((key,i)=>({key,upgraded:i===0&&upgraded})),...Array(12-ids.length).fill('stm.attack.rune_strike')],openingKeys:ids});
 const all=[...r.battle.hand,...r.battle.draw];r.battle.hand=[];
 for(const id of ids){const i=all.findIndex(c=>c.key===id);r.battle.hand.push(all.splice(i,1)[0]);}r.battle.draw=all;return r;
}
function play(x,r,name){const id=x.data.cards.find(c=>c.name===name).id,c=r.battle.hand.find(c=>c.key===id);assert.ok(c,name);x.E.playCard(r,c.uid);return c;}
function valid(x,r){assert.ok(x.E.validate(r));assert.ok(x.E.restore(x.E.clone(r)));}
for(const [mode,make]of [['ordinary',()=>ordinary],['Master',()=>loadMaster()]]){
 for(const [upgraded,focus,want]of [[false,false,2],[true,false,3],[false,true,3],[true,true,4]])test(mode+': Last Page draws useful cards before the last-card condition, '+upgraded+'/'+focus,()=>{
  const x=make(),r=fixture(x,['Last Page','Rune Strike'],upgraded);r.battle.focus=1;r.battle.boostArmed=focus;play(x,r,'Last Page');assert.equal(r.battle.hand.length,1+want);assert.equal(r.battle.energy,2);assert.equal(r.battle.cardCombat.receipts.at(-1).focus,Number(focus));valid(x,r);
 });
 test(mode+': Last Page keeps all four empty-Hand draw ceilings',()=>{for(const [upgraded,focus,want]of [[false,false,3],[true,false,4],[false,true,4],[true,true,5]]){
  const x=make(),r=fixture(x,['Last Page'],upgraded);r.battle.focus=1;r.battle.boostArmed=focus;play(x,r,'Last Page');assert.equal(r.battle.hand.length,want);assert.equal(r.battle.energy,2);valid(x,r);
 }});
 test(mode+': Last Page respects Hand capacity and preserves unusable armed Focus',()=>{
  const x=make(),r=fixture(x,['Last Page',...Array(9).fill('Rune Strike')]);r.battle.focus=1;r.battle.boostArmed=true;play(x,r,'Last Page');assert.equal(r.battle.hand.length,10);assert.equal(r.battle.focus,1);assert.equal(r.battle.cardCombat.receipts.at(-1).focus,0);valid(x,r);
 });
 test(mode+': Recall works at zero Energy and returns the selected real UID only once',()=>{
  const x=make(),r=fixture(x,['Recall','Rune Guard','Rune Strike','Rune Strike']);const guard=play(x,r,'Rune Guard');play(x,r,'Rune Strike');play(x,r,'Rune Strike');assert.equal(r.battle.energy,0);
  const recall=play(x,r,'Recall');assert.equal(r.battle.cardChoice.kind,'recall');x.E.chooseCardOption(r,guard.uid);assert.equal(r.battle.cardCombat.receipts.at(-1).energy,0);
  assert.equal(r.battle.energy,0);assert.equal(r.battle.hand[0].uid,guard.uid);assert.ok(r.battle.exhaust.some(c=>c.uid===recall.uid));assert.equal(r.stats.cardsPlayed,4);valid(x,r);
  const before=x.E.clone(r);assert.throws(()=>x.E.chooseCardOption(r,guard.uid));assert.deepEqual(r,before);
 });
 test(mode+': free Recall still requires Discard and cannot cycle itself',()=>{
  const x=make(),r=fixture(x,['Recall']);r.battle.energy=0;const before=x.E.clone(r);assert.throws(()=>play(x,r,'Recall'));assert.deepEqual(r,before);valid(x,r);
 });
 test(mode+': upgraded focused Recall adds only real available draws',()=>{
  const x=make(),r=fixture(x,['Recall','Rune Guard'],true),guard=play(x,r,'Rune Guard');r.battle.focus=1;r.battle.boostArmed=true;play(x,r,'Recall');x.E.chooseCardOption(r,guard.uid);
  assert.equal(r.battle.energy,2);assert.equal(r.battle.hand.length,3);assert.equal(r.battle.focus,0);assert.equal(r.battle.exhaust.length,1);valid(x,r);
 });
}
test('ordinary Mana Barrier spends each positive X for seven Block per Energy',()=>{for(const [energy,want]of [[1,7],[2,14],[3,21]]){
 const r=fixture(ordinary,['Mana Barrier']);r.battle.energy=energy;play(ordinary,r,'Mana Barrier');assert.equal(r.battle.block,want);assert.equal(r.battle.energy,0);valid(ordinary,r);
}});
test('Mana Barrier keeps ordinary and Master Focus/upgrade allocation and rejects X zero',()=>{for(const [make,want]of [[()=>ordinary,27],[()=>loadMaster(),28]]){
 const x=make(),r=fixture(x,['Mana Barrier'],true);r.battle.focus=1;r.battle.boostArmed=true;play(x,r,'Mana Barrier');assert.equal(r.battle.block,want);assert.equal(r.battle.energy,0);valid(x,r);
 const zero=fixture(x,['Mana Barrier']);zero.battle.energy=0;const before=x.E.clone(zero);assert.throws(()=>play(x,zero,'Mana Barrier'));assert.deepEqual(zero,before);
}});
test('v1 Last Page receipts load unchanged beside the new ordinary generation',()=>{
 const r=ordinary.E.restore(ordinary.E.clone(saved.lastPage));assert.ok(r);assert.equal(r.cardRulesVersion,'card-effects-1');assert.deepEqual(r.battle.cardCombat.receipts,saved.lastPage.battle.cardCombat.receipts);assert.equal(r.rng,saved.lastPage.rng);
 assert.equal(ordinary.E.newRun(941).cardRulesVersion,'card-effects-2');assert.equal(ordinary.E.cardDisplayPlan('stm.skill.last_page',r).values.draw,1);assert.equal(ordinary.E.cardDisplayPlan('stm.skill.last_page').values.draw,2);valid(ordinary,r);
});
test('v1 pending Recall still charges its original one Energy exactly once on confirmation',()=>{
 const r=ordinary.E.restore(ordinary.E.clone(saved.pendingRecall));assert.ok(r);assert.equal(r.battle.cardChoice.committed,false);const energy=r.battle.energy,uid=r.battle.cardChoice.candidates[0].uid;
 ordinary.E.chooseCardOption(r,uid);assert.equal(r.battle.energy,energy-1);assert.ok(r.battle.hand.some(c=>c.uid===uid));assert.equal(r.battle.cardCombat.receipts.at(-1).energy,1);valid(ordinary,r);
 const before=ordinary.E.clone(r);assert.throws(()=>ordinary.E.chooseCardOption(r,uid));assert.deepEqual(r,before);
});
test('v1 paid Read Ahead choice preserves the original payment after reload',()=>{
 const r=ordinary.E.restore(ordinary.E.clone(saved.pendingReadAhead));assert.ok(r);assert.equal(r.battle.cardChoice.committed,true);const energy=r.battle.energy,ch=r.battle.cardChoice;
 ordinary.E.chooseCardOption(r,{take:ch.candidates[0].uid,order:ch.candidates.slice(1).map(c=>c.uid)});assert.equal(r.battle.energy,energy);assert.equal(r.battle.cardCombat.receipts.at(-1).energy,1);valid(ordinary,r);
});
function atShop(seed){const E=ordinary.E,r=E.newRun(seed),map=E.getMap(r),node=map.nodes.find(n=>n.type==='shop');let route=[node];for(let d=node.depth-1;d>=0;d--)route.unshift(map.nodes.find(n=>n.depth===d&&n.next.includes(route[0].id)));r.depth=node.depth;r.route.path=route.slice(0,-1).map(n=>n.id);r.cleared=r.route.path.slice();E.enterNode(r,node.id);return r;}
test('v1 Shop stock and future quotes use original Recall metadata while new offers use the existing free-card band',()=>{
 const old=ordinary.E.restore(ordinary.E.clone(saved.shop));assert.ok(old);assert.deepEqual(old.shop.offers,saved.shop.shop.offers);assert.equal(ordinary.E.definition({key:'stm.skill.recall',upgraded:false},old).cost,1);assert.equal(old.shop.offers.find(o=>o.key==='stm.skill.recall').basePrice,45);
 const fresh=atShop(saved.shop.seed);assert.equal(ordinary.E.definition({key:'stm.skill.recall',upgraded:false},fresh).cost,0);assert.equal(fresh.shop.offers.find(o=>o.key==='stm.skill.recall').basePrice,60);valid(ordinary,old);valid(ordinary,fresh);
});
test('old v1 preview, retry and a rejected archive request cannot leak into a new run',()=>{
 const r=ordinary.E.restore(ordinary.E.clone(saved.lastPage));assert.ok(r);for(const lang of ['en','bm']){const old=K.renderPlain(ordinary.E.cardDisplayPlan('stm.skill.last_page',r),lang),fresh=K.renderPlain(ordinary.E.cardDisplayPlan('stm.skill.last_page'),lang);assert.match(old,lang==='en'?/Draw(?: cards:)? 1/:/Draw(?: kad:)? 1/);assert.match(fresh,lang==='en'?/Draw 2/:/Draw 2/);}
 r.hp=0;r.scene='defeat';r.finished=Math.max(Date.now(),r.started);assert.ok(ordinary.E.validate(r));assert.equal(ordinary.E.retry(r).cardRulesVersion,'card-effects-1');assert.equal(ordinary.E.newRun(941).cardRulesVersion,'card-effects-2');
 const unknown=ordinary.E.clone(saved.lastPage);unknown.cardRulesVersion='__proto__';assert.equal(ordinary.E.restore(unknown),null);assert.equal(ordinary.E.definition({key:'stm.skill.recall',upgraded:false}).cost,0);
});
test('the complete v1 card definitions remain frozen and prior Master storage has a distinct identity',()=>{
 const archive=ordinary.data.archivedEffectsData?.['card-effects-1'];assert.ok(archive);assert.equal(crypto.createHash('sha256').update(JSON.stringify(archive.cards)).digest('hex'),saved.cardDefinitionsHash);
 const x=loadMaster();assert.notEqual(x.binding.saveKey,saved.master4SaveKey);assert.equal(x.E.restore(x.E.clone(saved.master4)),null);
});
for(const [mode,make]of [['ordinary',()=>ordinary],['Master',()=>loadMaster()]])for(const lang of ['en','bm'])test(mode+' Last Page preserves the three accessible Draw/Hand glossary targets in '+lang,()=>{
 const {JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom'),x=make(),plan=x.E.cardDisplayPlan('stm.skill.last_page'),dom=new JSDOM(K.renderHTML(plan,lang));
 try{const targets=[...dom.window.document.querySelectorAll('[data-kind=game]')];assert.equal(targets.length,3);assert.deepEqual(targets.map(n=>n.textContent),lang==='en'?['Draw','Hand','Draw']:['Draw','Hand','Draw']);
  for(const n of targets){assert.equal(n.tabIndex,0);assert.ok(n.getAttribute('aria-label'));assert.ok(n.dataset.tooltip);assert.match(n.dataset.tooltip,/10/);}
  assert.match(dom.window.document.body.textContent,lang==='en'?/Draw 2/:/Draw 2/);
 }finally{dom.window.close();}
});
