const {test}=require('node:test');
const assert=require('node:assert/strict');
const kit=require('../src/card-kit.js');
const data=kit.data;

test('every card has a BM and English display name without changing canonical identity',()=>{
  assert.equal(typeof kit.cardName,'function','localized display names are missing');
  for(const card of data.cards){
    assert.equal(kit.cardName(card,'en'),card.name);
    assert.ok(kit.cardName(card,'bm').length>2);
    assert.notEqual(kit.cardName(card,'bm'),card.name);
    assert.ok(kit.cardNotes(card,'en').length>20);
    assert.ok(kit.cardNotes(card,'bm').length>20);
  }
});
test('game ms and player BM/BI aliases render whole descriptions including Recall',()=>{
  for(const card of data.cards)for(const focus of [false,true]){
    const plan=kit.preparePlay(card.id,{},focus);
    assert.equal(kit.renderPlain(plan,'ms'),kit.renderPlain(plan,'bm'));
    assert.equal(kit.renderHTML(plan,'ms'),kit.renderHTML(plan,'bm'));
    assert.equal(kit.renderPlain(plan,'bi'),kit.renderPlain(plan,'en'));
    assert.equal(kit.renderHTML(plan,'unsupported'),kit.renderHTML(plan,'en'));
    assert.doesNotMatch(kit.renderHTML(plan,'bm'),/undefined|NaN|lost_hp_last_enemy_turn|empty_hand_after_play_snapshot/);
  }
});
test('language rendering preserves all original rules, IDs, card effects, timings and values',()=>{
  const original=require('./original-mechanics.json');
  const projected={cards:data.cards.map(c=>Object.fromEntries(Object.keys(original.cards.find(x=>x.id===c.id)).map(k=>[k,c[k]]))),rules:data.rules,status_definitions:data.status_definitions,design_defaults:data.design_defaults,frames:data.frames};
  assert.deepEqual(projected,original);
  for(const c of data.cards)for(const focus of [false,true]){
    const before=kit.preparePlay(c.id,{strength:2,agility:1,energy:2,handAfterPlay:0},focus);
    const frozen=JSON.stringify(before);
    for(const lang of ['en','bm','ms','bi'])kit.renderHTML(before,lang);
    assert.equal(JSON.stringify(before),frozen);
  }
});
test('math terms link to supplied curriculum sources and distinguish game rules',()=>{
  assert.ok(data.localization_sources,'source-backed language metadata is missing');
  for(const id of ['percent','random']){
    const term=data.glossary[id];
    assert.ok(term.sources.length>=2);
    for(const ref of term.sources)assert.ok(data.localization_sources.documents.some(s=>s.id===ref));
  }
  assert.match(data.glossary.percent.tooltip.bm,/100/);
  assert.match(data.glossary.percent.tooltip.bm,/18/);
  assert.match(data.glossary.random.tooltip.bm,/kad ini/);
});
test('calculations explain Focus and conditions in the chosen language',()=>{
  const p=kit.preparePlay('stm.attack.return_strike',{strength:2,lostHpLastEnemyTurn:true},true);
  const bm=kit.renderHTML(p,'bm');
  assert.match(bm,/Fokus/);
  assert.doesNotMatch(bm,/\bStrength\b|\bDefense\b|\bBlock\b|lost_hp/);
  assert.equal(p.values.damage,13);
  assert.match(kit.renderHTML(p,'en'),/Strength/);
});
