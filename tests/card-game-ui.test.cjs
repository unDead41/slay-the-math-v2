const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const E=require('../dist/engine.js'),K=require('../dist/card-kit.js');
const {JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom');
const root=path.resolve(__dirname,'../dist'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split(/[?#]/)[0]);
const key=name=>K.data.cards.find(c=>c.name===name).id;
function fixture(names){
 const r=E.newRun(71);delete r.route;r.deck=[...names,'Rune Guard','Tower Shield','Quick Study','Rune Strike','Weak Point'].map(name=>E.card(r,key(name)));
 E.startBattle(r,'wisp');r.battle.hp=r.battle.maxHp=300;
 const pool=[...r.battle.hand,...r.battle.draw];r.battle.hand=names.map(name=>pool.splice(pool.findIndex(c=>c.key===key(name)),1)[0]);r.battle.draw=pool;
 assert.ok(E.validate(r));return r;
}
function boot(saved,lang='en'){
 const dom=new JSDOM(html,{url:'https://cards.example/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,d=w.document;
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 w.localStorage.setItem('duel-cube-math.v1',JSON.stringify(saved));w.localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true}));w.localStorage.setItem('slay-the-math.question-language.v1',lang);
 for(const file of scripts)w.eval(fs.readFileSync(path.join(root,file),'utf8'));
 const state=()=>JSON.parse(w.localStorage.getItem('duel-cube-math.v1'));
 const click=selector=>{const el=d.querySelector(selector);assert.ok(el,selector);assert.equal(el.disabled,false,selector);el.click();};
 click('[data-action=continue]');return {dom,w,d,state,click};
}
test('game cards: Passive leaves Focus armed; preview, tooltip and actual Attack use the same current attributes',()=>{
 const r=fixture(['Blazing Spirit','Rune Strike']);r.battle.focus=2;
 const {dom,w,d,state,click}=boot(r);
 try{
  click('[data-action=focus]');const before=state(),term=d.querySelector('.package-card-description .stm-rt-game');term.click();
  assert.deepEqual(state(),before);assert.ok(d.querySelector('[role=tooltip]'));assert.equal(d.querySelector('button button'),null);
  click('[data-action=play][data-id="'+r.battle.hand[0].uid+'"]');
  assert.equal(state().battle.focus,2);assert.equal(state().battle.boostArmed,true);assert.equal(state().battle.active.length,1);
  const attack=d.querySelector('[data-card-id="'+key('Rune Strike')+'"]');assert.equal(attack.dataset.focus,'true');
  assert.equal(attack.querySelector('.stm-rt-calculation').textContent,'11');
  const hp=state().battle.hp;click('[data-action=play][data-id="'+r.battle.hand[1].uid+'"]');
  assert.equal(state().battle.hp,hp-11);assert.equal(state().battle.focus,1);assert.equal(state().battle.boostUsed,true);assert.ok(E.restore(state()));
 }finally{dom.window.close();}
});
test('game cards: closing precommit Recall costs nothing, restores controls, then selection commits once',()=>{
 const r=fixture(['Recall']),target=r.battle.draw.pop();r.battle.discard.push(target);
 const {dom,d,state,click}=boot(r);
 try{
  const before=state();click('[data-action=play][data-id="'+r.battle.hand[0].uid+'"]');
  assert.equal(state().battle.cardChoice.committed,false);assert.equal(d.querySelector('[data-action=end-turn]').disabled,true);
  click('#dialog [data-action=close]');assert.equal(state().battle.cardChoice,null);assert.equal(state().battle.energy,before.battle.energy);assert.equal(state().stats.cardsPlayed,before.stats.cardsPlayed);assert.equal(d.querySelector('[data-action=end-turn]').disabled,false);
  click('[data-action=play][data-id="'+r.battle.hand[0].uid+'"]');click('[data-action=card-option][data-value="'+target.uid+'"]');
  assert.equal(state().battle.energy,before.battle.energy-1);assert.ok(state().battle.hand.some(c=>c.uid===target.uid));assert.ok(state().battle.exhaust.some(c=>c.uid===r.battle.hand[0].uid));assert.equal(d.getElementById('dialog').open,false);assert.ok(E.restore(state()));
 }finally{dom.window.close();}
});
test('game cards: committed Read Ahead survives close/reload and the UI takes and orders the exact candidates',()=>{
 const r=fixture(['Read Ahead']);const first=boot(r);let saved;
 try{first.click('[data-action=play][data-id="'+r.battle.hand[0].uid+'"]');assert.equal(first.state().battle.cardChoice.kind,'read_ahead');assert.equal(first.state().battle.cardChoice.committed,true);first.click('#dialog [data-action=close]');saved=first.state();assert.ok(first.d.querySelector('[data-action=card-choice-open]'));assert.ok(E.restore(saved));}finally{first.dom.window.close();}
 const {dom,d,state,click}=boot(saved);
 try{
  const choice=state().battle.cardChoice,take=choice.candidates[0].uid,rest=choice.candidates.slice(1).map(c=>c.uid).reverse();
  assert.equal(d.getElementById('dialog').open,true);click('[data-action=card-option][data-value="'+take+'"]');
  for(const id of rest)click('[data-action=card-order][data-id="'+id+'"]');click('[data-action=card-order-confirm]');
  const after=state();assert.equal(after.battle.cardChoice,null);assert.ok(after.battle.hand.some(c=>c.uid===take));assert.deepEqual(after.battle.draw.slice(-rest.length).map(c=>c.uid).reverse(),rest);assert.equal(after.battle.energy,saved.battle.energy);assert.equal(after.stats.cardsPlayed,saved.stats.cardsPlayed);assert.ok(E.restore(after));
 }finally{dom.window.close();}
});
test('game cards: BM Collection contains all forty, supports Passive/name search, and leaves the run unchanged',()=>{
 const r=fixture(['Rune Strike']),{dom,w,d,state,click}=boot(r,'ms');
 try{
  const before=state();click('[data-action=library]');assert.ok(d.querySelector('.collection-count').textContent.includes('40 / 40'));
  click('[data-action=library-role][data-value=passive]');assert.ok(d.querySelector('.collection-count').textContent.includes('10 / 40'));
  click('[data-action=library-role][data-value=all]');const input=d.getElementById('card-search');input.value=K.cardName(K.data.cards.find(c=>c.name==='Rune Strike'),'ms');input.dispatchEvent(new w.Event('input',{bubbles:true}));
  assert.equal(d.querySelectorAll('.collection-cards .package-card').length,1);assert.match(d.querySelector('.collection-detail').textContent,/Rune Strike/);assert.equal(d.querySelector('button button'),null);
  const ids=[...d.querySelectorAll('[id]')].map(e=>e.id);assert.equal(new Set(ids).size,ids.length);assert.deepEqual(state(),before);
 }finally{dom.window.close();}
});
