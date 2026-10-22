const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom');
const E=require('../dist/engine.js'),Q=require('../dist/education.js'),K=require('../dist/card-kit.js');
const {makeBattleFixture}=require('./card-selection.test.cjs');
const dir=path.resolve(__dirname,'../dist'),html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split(/[?#]/)[0]);
function boot(r){
 const dom=new JSDOM(html,{url:'https://compact.example/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,d=w.document;
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 w.localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));w.localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true}));
 for(const file of scripts)w.eval(fs.readFileSync(path.join(dir,file),'utf8'));
 const state=()=>JSON.parse(w.localStorage.getItem('duel-cube-math.v1'));
 const click=s=>{const el=d.querySelector(s);assert.ok(el,s);assert.equal(el.disabled,false,s);el.click();};
 click('[data-action=continue]');return{dom,w,d,state,click};
}
test('compact HUD: one run header, resources hand count, relocated piles and Settings menu retain native actions',()=>{
 const {dom,d,state,click}=boot(makeBattleFixture(['Rune Strike']));
 try{
  assert.equal(d.querySelector('.battle-top'),null);assert.match(d.querySelector('#header .combat-run-status').textContent,/Room 1.*Turn 1/);
  assert.ok(d.querySelector('#header [data-action=deck]'));assert.match(d.querySelector('.resource-column .hand-count').textContent,/1 \/ 10/);
  assert.ok(d.querySelector('.combat-side .spent-piles [data-zone=discard]'));assert.ok(d.querySelector('.combat-side .spent-piles [data-zone=exhaust]'));
  assert.ok(d.querySelector('.combat-journal [data-action=log]'));const before=state();click('[data-action=saves]');assert.ok(d.querySelector('#dialog [data-action=home]'));click('#dialog [data-action=home]');assert.ok(d.querySelector('.main-menu-actions'));assert.deepEqual(state(),before);
 }finally{dom.window.close();}
});
test('Passive and status details expose real mutations without replaying card or trigger effects',()=>{
 const r=makeBattleFixture(['Blazing Spirit','Rune Strike']);r.battle.focus=2;
 const {dom,d,state,click}=boot(r);
 try{
  click('[data-action=play][data-id="'+r.battle.hand[0].uid+'"]');const before=state();
  assert.ok(d.querySelector('.combat-passives [data-action=passive-details]'));assert.match(d.querySelector('.combat-status-rack').textContent,/2.*Strength/);
  click('[data-action=status-details][data-id=strength]');assert.match(d.querySelector('#dialog').textContent,/Strength: 2.*extra damage/);assert.deepEqual(state(),before);click('#dialog [data-action=close]');
  click('[data-action=passive-details]');assert.match(d.querySelector('#dialog').textContent,/Triggered1 time/);assert.deepEqual(state(),before);click('#dialog [data-action=close]');
  click('[data-action=play][data-id="'+r.battle.hand[1].uid+'"]');click('[data-action=end-turn]');
  assert.ok([...d.querySelectorAll('.combat-journal-list strong')].some(e=>e.textContent==='Turn 1 (Prism Guard)'||/Turn 1 \(Ember Mirror\)/.test(e.textContent)));
  click('[data-action=log]');assert.match(d.querySelector('.combat-journal-list.full').textContent,/Rune Strike/);assert.ok(E.restore(state()));
 }finally{dom.window.close();}
});
test('Predict uses the authored bank, changes full question language, keeps support state and consumes abandoned exposure',()=>{
 const {dom,w,d,state,click}=boot(makeBattleFixture(['Rune Strike']));
 try{
  click('[data-action=forecast]');let p=state().battle.question,q=Q.catalog[p.questionId];
  assert.equal(p.source,'bank');assert.equal(d.querySelector('.forecast-source'),null);assert.equal(d.querySelectorAll('.forecast-bank .education-option').length,4);
  let control=d.querySelector('#question-language-select');control.value='ms';control.dispatchEvent(new w.Event('change',{bubbles:true}));
  const translated=w.DCQuestionLanguage.question(w.DCEducation.catalog[q.id],'ms');assert.equal(d.querySelector('#forecast-prompt').textContent.replace(/\s/g,''),translated.prompt.replace(/\s/g,''));
  click('[data-action=forecast-support][data-kind=hint]');assert.ok(d.querySelector('#forecast-hint'));assert.equal(d.querySelector('[data-kind=moreHint]').disabled,true);
  click('[data-action=forecast-select][data-id="'+q.choices.find(c=>c.id!==q.correctChoiceId).id+'"]');click('[data-action=forecast-check]');click('[data-action=forecast-support][data-kind=moreHint]');assert.ok(d.querySelector('#forecast-more-hint'));
  const opened=q.id;click('#dialog [data-action=close]');assert.ok(state().educationState.runUsedIds.includes(opened));assert.equal(state().battle.focus,0);assert.equal(d.querySelector('[data-action=forecast]').disabled,true);
  click('[data-action=end-turn]');click('[data-action=forecast]');assert.notEqual(state().battle.question.questionId,opened);
  q=Q.catalog[state().battle.question.questionId];click('[data-action=forecast-select][data-id="'+q.correctChoiceId+'"]');click('[data-action=forecast-check]');assert.equal(state().battle.focus,1);assert.ok(E.restore(state()));
  const before=state();click('#dialog [data-action=close]');assert.equal(state().battle.focus,before.battle.focus);
 }finally{dom.window.close();}
});
test('compact journal keeps the most recent enemy visible when Block retention logs after its action',()=>{
 const r=makeBattleFixture(['Lasting Shield','Rune Guard']),{dom,d,click,state}=boot(r);
 try{
  for(const c of r.battle.hand)click('[data-action=play][data-id="'+c.uid+'"]');
  click('[data-action=end-turn]');assert.match(d.querySelector('.combat-journal-list').textContent,/Ember Mirror/);assert.match(d.querySelector('.combat-journal-list').textContent,/Retained/);assert.ok(E.restore(state()));
 }finally{dom.window.close();}
});
