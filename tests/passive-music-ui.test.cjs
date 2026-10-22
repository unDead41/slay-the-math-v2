const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom');
const E=require('../dist/engine.js'),{makeBattleFixture}=require('./card-selection.test.cjs');
const dir=path.resolve(__dirname,'../dist');
function boot(r,language='en'){
 const html=fs.readFileSync(path.join(dir,'index.html'),'utf8'),scripts=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split(/[?#]/)[0]);
 const dom=new JSDOM(html,{url:'https://passive-music.example/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,d=w.document;
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 w.localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));w.localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true,voiceMuted:true}));w.localStorage.setItem('slay-the-math.question-language.v1',language);
 for(const file of scripts)w.eval(fs.readFileSync(path.join(dir,file),'utf8'));
 const state=()=>JSON.parse(w.localStorage.getItem('duel-cube-math.v1')),settings=()=>JSON.parse(w.localStorage.getItem('duel-cube-settings.v1'));
 const click=s=>{const el=d.querySelector(s);assert.ok(el,s);assert.equal(el.disabled,false,s);el.click();};click('[data-action=continue]');return{dom,w,d,state,settings,click};
}
function three(){const r=makeBattleFixture(['Blazing Spirit','Swift Step','Rune Armor','Last Ember']);for(const c of r.battle.hand.slice(0,3)){r.battle.energy=3;E.playCard(r,c.uid);}r.battle.energy=3;r.battle.focus=2;E.armFocus(r);return r;}
test('Passive UI: fourth play requests one replacement; cancelling is free and confirmation keeps exactly three',()=>{
 const r=three(),old=r.battle.active[0],incoming=r.battle.hand[0],{dom,d,state,click}=boot(r);
 try{
  const before=state().battle;click('[data-action=play][data-id="'+incoming.uid+'"]');
  assert.equal(state().battle.active.length,3);assert.equal(state().battle.cardChoice.kind,'passive_swap');assert.match(d.querySelector('#dialog-title').textContent,/Replace a Passive/);
  assert.equal(d.querySelectorAll('#dialog [data-action=card-option]').length,3);assert.equal(state().battle.energy,3);assert.equal(state().battle.focus,2);assert.ok(state().battle.boostArmed);
  click('#dialog [data-action=close]');assert.equal(state().battle.cardChoice,null);assert.deepEqual(state().battle.hand,before.hand);assert.equal(state().battle.energy,3);
  click('[data-action=play][data-id="'+incoming.uid+'"]');click('[data-action=card-option][data-value="'+old.uid+'"]');
  const after=state();assert.equal(after.battle.active.length,3);assert.ok(after.battle.active.some(c=>c.uid===incoming.uid));assert.ok(after.battle.discard.some(c=>c.uid===old.uid));assert.equal(after.battle.strength,0);assert.equal(after.battle.agility,2);assert.equal(after.battle.defense,1);assert.equal(after.battle.energy,2);assert.equal(after.battle.focus,2);assert.ok(after.battle.boostArmed);assert.match(d.querySelector('.combat-passives').textContent,/3\s*\/\s*3/);assert.ok(E.restore(after));
 }finally{dom.window.close();}
});
test('Passive UI: a legacy over-cap run stays playable and can close/reopen its saved free trim choice',()=>{
 const r=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/passive-overcap-v2.19.json'),'utf8')),{dom,d,state,click}=boot(r);
 try{
  assert.equal(state().battle.cardChoice.kind,'passive_trim');assert.equal(d.getElementById('dialog').open,true);const energy=state().battle.energy;
  click('#dialog [data-action=close]');assert.equal(d.getElementById('dialog').open,false);assert.ok(state().battle.cardChoice);assert.equal(d.querySelector('[data-action=end-turn]').disabled,true);assert.doesNotMatch(d.getElementById('toast').className,/error/);
  click('[data-action=card-choice-open]');click('#dialog [data-action=card-option]');assert.equal(state().battle.active.length,3);assert.equal(state().battle.energy,energy);assert.equal(state().battle.cardChoice,null);assert.equal(d.querySelector('[data-action=end-turn]').disabled,false);assert.ok(E.restore(state()));
 }finally{dom.window.close();}
});
test('Passive UI: closing a preserved legacy Predict opens the deferred free Passive selection',()=>{
 const r=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/passive-overcap-v2.19.json'),'utf8')),source=r.battle.draw.map(c=>({...c,...E.definition(c)}));
 r.battle.question={...require('../dist/math.js').makeQuestion(source,'single'),source,attempts:0,hinted:false,solved:false,seal:null};assert.ok(E.validate(r));
 const {dom,d,state,click}=boot(r);
 try{assert.equal(state().battle.cardChoice,null);assert.ok(state().battle.question);click('#dialog [data-action=close]');assert.equal(state().battle.question,null);assert.equal(state().battle.cardChoice.kind,'passive_trim');assert.ok(d.getElementById('dialog').open);assert.match(d.getElementById('dialog-title').textContent,/Choose 3 Passives/);}
 finally{dom.window.close();}
});
test('Passive UI: a double-click cannot deactivate the next shifted legacy Passive',()=>{
 const r=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/passive-overcap-v2.19.json'),'utf8')),card=r.battle.hand.shift();r.battle.active.push(card);r.battle.cardCombat.counters[card.key]={activatedTurn:1,count:0,triggers:0,lastTurn:0};assert.ok(E.validate(r));
 const {dom,w,d,state}=boot(r);
 try{
  d.querySelector('#dialog [data-action=card-option]').dispatchEvent(new w.MouseEvent('click',{bubbles:true,detail:1}));assert.equal(state().battle.active.length,4);
  d.querySelector('#dialog [data-action=card-option]').dispatchEvent(new w.MouseEvent('click',{bubbles:true,detail:2}));assert.equal(state().battle.active.length,4,'the second native click belongs to the previous gesture');
  d.querySelector('#dialog [data-action=card-option]').dispatchEvent(new w.MouseEvent('click',{bubbles:true,detail:1}));assert.equal(state().battle.active.length,3);
 }finally{dom.window.close();}
});
test('Audio UI: Voice volume and mute persist independently of music and Sound FX without changing the run',()=>{
 const {dom,w,d,state,settings,click}=boot(makeBattleFixture(['Rune Strike']));
 try{
  const before=state();click('[data-action=music]');const volume=d.getElementById('voice-volume');assert.ok(volume,'Voice volume control');volume.value='37';volume.dispatchEvent(new w.Event('input',{bubbles:true}));assert.equal(settings().voiceVolume,.37);assert.equal(d.getElementById('voice-volume-value').textContent,'37%');
  assert.ok(settings().voiceMuted);click('[data-action=voice-mute]');assert.equal(settings().voiceMuted,false);assert.equal(settings().musicMuted,true);assert.equal(settings().sound,false);assert.deepEqual(state(),before);
  click('#dialog [data-action=close]');click('[data-action=music]');assert.equal(d.getElementById('voice-volume').value,'37');assert.equal(d.querySelector('[data-action=voice-mute]').getAttribute('aria-pressed'),'false');
 }finally{dom.window.close();}
});
test('Audio UI: visible artifact and Shop greetings are recorded once, including while muted',()=>{
 const cases=[{run:E.newRun(71,'challenge'),speaker:'dungeonMaster',voice:'vo_dm_01',track:'mystery',rerender:'[data-action=select-artifact]'},
  {run:require('./helpers/shop.cjs').shopRoom(),speaker:'merchant',voice:'vo_shop_01',track:'bgm_shop',rerender:'[data-action=shop-tab][data-id=artifacts]'}];
 for(const item of cases){
  const {dom,w,state,click}=boot(item.run);
  try{
   const before=state();assert.equal(before.audioPresentation.visits[item.speaker],1);assert.equal(w.DCAudio.state.requested,item.track);
   const encounter=Object.values(before.audioPresentation.encounters)[0];assert.equal(encounter.voiceId,item.voice);
   click(item.rerender);assert.deepEqual(state().audioPresentation,before.audioPresentation,'UI changes retain the encounter');
   click('[data-action=home]');assert.equal(w.DCAudio.state.requested,'menu');click('[data-action=continue]');assert.deepEqual(state().audioPresentation,before.audioPresentation,'returning to the same encounter does not add visits');
   const saved=state(),restored=E.restore(saved);assert.ok(restored);assert.deepEqual(restored.audioPresentation,saved.audioPresentation);
  }finally{dom.window.close();}
 }
});
