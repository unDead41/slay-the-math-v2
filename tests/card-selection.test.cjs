'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const E=require('../dist/engine.js'),K=require('../dist/card-kit.js'),UI=require('../dist/card-ui.js');
let JSDOM;try{({JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom'));}catch{}
const root=path.resolve(__dirname,'../dist'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split(/[?#]/)[0]);
const styles=[...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(m=>m[1].split(/[?#]/)[0]);
const key=name=>K.data.cards.find(c=>c.name===name).id;

// Export the actual saved-run fixtures for browser geometry checks. The browser
// should progress Read Ahead through 4/3/2/1 candidates and measure the same UID.
function makeBattleFixture(names=['Read Ahead']){
 const r=E.newRun(71);delete r.route;
 r.deck=[...names,'Rune Guard','Tower Shield','Quick Study','Rune Strike','Weak Point','Scout Strike','Layered Shield'].map(name=>E.card(r,key(name)));
 E.startBattle(r,'wisp');r.battle.hp=r.battle.maxHp=300;
 const pool=[...r.battle.hand,...r.battle.draw];
 r.battle.hand=names.map(name=>pool.splice(pool.findIndex(c=>c.key===key(name)),1)[0]);r.battle.draw=pool;
 assert.ok(E.validate(r));return r;
}
function makeReadAheadFixture(focused=false){
 const r=makeBattleFixture();
 if(focused){r.battle.focus=2;assert.ok(E.armFocus(r));}
 assert.ok(E.playCard(r,r.battle.hand[0].uid));
 assert.equal(E.cardChoice(r).kind,'read_ahead');assert.equal(E.cardChoice(r).candidates.length,focused?4:3);
 assert.ok(E.restore(r));return r;
}
function makeRewardFixture(){
 const r=makeBattleFixture(['Rune Strike']);r.battle.hp=0;r.scene='reward';
 r.rewards=['Scout Strike','Quick Study','Layered Shield'].map(key);assert.ok(E.validate(r));return r;
}
module.exports={makeBattleFixture,makeReadAheadFixture,makeRewardFixture};

function loadStyles(d){
 for(const file of styles){const style=d.createElement('style');style.textContent=fs.readFileSync(path.join(root,file),'utf8');d.head.append(style);}
}
function surface(markup){
 const dom=new JSDOM('<!doctype html><html><head></head><body>'+markup+'</body></html>',{pretendToBeVisual:true});loadStyles(dom.window.document);
 return {dom,w:dom.window,d:dom.window.document};
}
function boot(saved){
 const dom=new JSDOM(html,{url:'https://card-selection.example/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,d=w.document;
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 loadStyles(d);w.localStorage.setItem('duel-cube-math.v1',JSON.stringify(saved));
 w.localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true}));
 for(const file of scripts)w.eval(fs.readFileSync(path.join(root,file),'utf8'));
 const state=()=>JSON.parse(w.localStorage.getItem('duel-cube-math.v1'));
 const click=selector=>{const el=d.querySelector(selector);assert.ok(el,selector);assert.equal(el.disabled,false,selector);el.click();};
 click('[data-action=continue]');return {dom,w,d,state,click};
}
function trackStyle(w,grid){
 const css=w.getComputedStyle(grid);
 // jsdom reports custom properties at their declaration owner, whereas the
 // browser resolves this inherited token while computing the grid tracks.
 const owner=w.getComputedStyle(grid.closest('#dialog'));
 return {columns:css.gridTemplateColumns,autoColumns:css.gridAutoColumns,flow:css.gridAutoFlow,width:owner.getPropertyValue('--card-choice-card-width'),justify:css.justifyContent,gap:css.gap,overflow:css.overflowX};
}

if(require.main===module){
 test('selected and keyboard-focused actions span the entire native visible card frame',{skip:!JSDOM},()=>{
  const plan=K.preparePlay(key('Scout Strike'),{energy:3},false);
  const {dom,w,d}=surface('<div class="reward-cards">'+UI.view(plan,{action:'select-reward',extra:{'aria-pressed':'true'}})+'</div>');
  try{
   const card=d.querySelector('.package-card'),action=card.querySelector('.package-card-action'),description=card.querySelector('.package-card-description');
   const actionCSS=w.getComputedStyle(action),descriptionCSS=w.getComputedStyle(description);
   // The supplied 1280x1920 frame has 10% padding on all four sides.
   assert.equal(actionCSS.left,'10%');assert.equal(actionCSS.top,'10%');
   assert.equal(actionCSS.width,'80%');assert.equal(actionCSS.height,'80%','selection/focus must include the parchment and lower frame');
   assert.match(actionCSS.outline,/2px solid/);action.focus();assert.match(w.getComputedStyle(action).outline,/2px solid/);
   assert.ok(Number(descriptionCSS.zIndex)>Number(actionCSS.zIndex),'scrollable text stays above the full-frame button');
   assert.equal(action.querySelector('[tabindex],button,a,input,select,textarea'),null);
   for(const token of card.querySelectorAll('.stm-rt'))assert.equal(token.closest('button,[data-action]'),null);
   assert.equal(card.querySelector('.package-card-frame').width,1280);assert.equal(card.querySelector('.package-card-frame').height,1920);
  }finally{dom.window.close();}
 });

 test('choice-card tracks keep one bounded width for 4, 3, 2 and 1 candidates and preserve other library grids',{skip:!JSDOM},()=>{
  const {dom,w,d}=surface('<dialog id="dialog" class="wide" data-kind="card-choice" open><div id="dialog-body"><div class="dialog-head"><div><h2>Read Ahead</h2></div><button class="icon-btn">Close</button></div><div class="library-grid"></div><div class="dialog-actions"><button class="btn">Reset order</button><button class="btn">Confirm order</button></div></div></dialog>');
  try{
   const dialog=d.getElementById('dialog'),grid=d.querySelector('.library-grid');let previous;
   for(const count of [4,3,2,1]){
    grid.innerHTML=Array.from({length:count},()=>UI.view(K.preparePlay(key('Rune Strike'),{energy:3},false),{action:'card-order'})).join('');
    const current=trackStyle(w,grid);
    assert.equal(current.flow,'column');assert.equal(current.columns,'none');
    assert.equal(current.autoColumns,'var(--card-choice-card-width)');assert.match(current.width,/clamp\(/);assert.match(current.width,/px/);assert.match(current.width,/vw/);
    assert.doesNotMatch(current.autoColumns,/\b(?:auto-fit|auto-fill|1fr)\b/);
    assert.equal(current.justify,'safe center');assert.equal(current.overflow,'auto');
    if(previous)assert.deepEqual(current,previous,'removing a candidate cannot change the card track');previous=current;
    for(const card of grid.children)assert.equal(w.getComputedStyle(card).aspectRatio,'2 / 3');
   }
   assert.equal(w.getComputedStyle(dialog).overflow,'auto');assert.equal(w.getComputedStyle(dialog).overscrollBehavior,'contain');
   assert.match(w.getComputedStyle(dialog).maxHeight,/100dvh/);
   assert.ok(parseFloat(w.getComputedStyle(d.querySelector('.dialog-actions .btn')).minHeight)>=44);
   assert.ok(parseFloat(w.getComputedStyle(d.querySelector('.icon-btn')).minHeight)>=44);
   dialog.dataset.kind='pile';assert.match(w.getComputedStyle(grid).gridTemplateColumns,/1fr/,'pile/camp/collection grids retain their owner');
  }finally{dom.window.close();}
 });

 test('reward terms and description scrolling preserve the native pressed choice and only its action changes selection',{skip:!JSDOM},()=>{
  const {dom,w,d,state,click}=boot(makeRewardFixture());
  try{
   const first=d.querySelector('.reward-cards [aria-pressed=true]'),second=d.querySelector('.reward-cards .package-card:nth-child(2)'),before=state();
   assert.ok(first);assert.equal(first.tagName,'BUTTON');assert.equal(d.querySelector('button button'),null);
   for(const token of second.querySelectorAll('.stm-rt')){token.focus();token.click();assert.ok(d.querySelector('[role=tooltip]'));}
   const description=second.querySelector('.package-card-description');description.click();description.dispatchEvent(new w.Event('scroll'));
   assert.equal(d.querySelector('.reward-cards [aria-pressed=true]'),first);assert.deepEqual(state(),before);
   click('.reward-cards .package-card:nth-child(2) .package-card-action');
   assert.equal(d.querySelectorAll('.reward-cards [aria-pressed=true]').length,1);
   assert.equal(d.querySelector('.reward-cards [aria-pressed=true]').closest('.package-card').dataset.cardId,key('Quick Study'));
   assert.equal(d.querySelector('[data-action=reward]').dataset.key,key('Quick Study'));assert.deepEqual(state(),before,'selection is only a preview until Add');
  }finally{dom.window.close();}
 });

 test('Read Ahead uses the same tracks through take, reorder, reset and confirm without paying twice',{skip:!JSDOM},()=>{
  for(const focused of [false,true]){
   const saved=makeReadAheadFixture(focused),{dom,w,d,state,click}=boot(saved);
   try{
    const dialog=d.getElementById('dialog'),candidates=state().battle.cardChoice.candidates,rest=candidates.slice(1).map(c=>c.uid).reverse();
    assert.equal(dialog.dataset.kind,'card-choice');const original=trackStyle(w,d.querySelector('#dialog .library-grid'));
    const term=d.querySelector('#dialog .stm-rt'),before=state();term.click();assert.deepEqual(state(),before);
    click('[data-action=card-option][data-value="'+candidates[0].uid+'"]');
    assert.equal(d.querySelector('[data-action=card-order-confirm]').disabled,true);
    for(const id of rest){
     assert.deepEqual(trackStyle(w,d.querySelector('#dialog .library-grid')),original);
     click('[data-action=card-order][data-id="'+id+'"]');
    }
    assert.equal(d.querySelector('[data-action=card-order-confirm]').disabled,false);
    click('[data-action=card-order-reset]');assert.equal(d.querySelectorAll('#dialog [data-action=card-order]').length,rest.length);
    assert.deepEqual(trackStyle(w,d.querySelector('#dialog .library-grid')),original);
    for(const id of rest)click('[data-action=card-order][data-id="'+id+'"]');
    click('[data-action=card-order-confirm]');
    const after=state();assert.equal(after.battle.cardChoice,null);assert.equal(dialog.open,false);
    assert.equal(after.battle.energy,saved.battle.energy);assert.equal(after.stats.cardsPlayed,saved.stats.cardsPlayed);
    assert.deepEqual(after.battle.draw.slice(-rest.length).map(c=>c.uid).reverse(),rest);assert.ok(E.restore(after));
   }finally{dom.window.close();}
  }
 });
}
