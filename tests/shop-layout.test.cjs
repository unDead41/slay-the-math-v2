'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {shopRoom}=require('./helpers/shop.cjs');
const E=require('../dist/engine.js');
let JSDOM;try{({JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom'));}catch{}
const root=path.join(__dirname,'../dist'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split(/[?#]/)[0]);

function boot(){
 const dom=new JSDOM(html,{url:'https://game.example/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
 w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 w.localStorage.setItem('duel-cube-math.v1',JSON.stringify(shopRoom()));
 w.localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true}));
 for(const file of scripts)w.eval(fs.readFileSync(path.join(root,file),'utf8'));
 const click=selector=>{const el=w.document.querySelector(selector);assert.ok(el,selector);assert.equal(el.disabled,false,selector+' disabled');el.click();};
 const state=()=>JSON.parse(w.localStorage.getItem('duel-cube-math.v1'));
 click('[data-action="continue"]');
 return {dom,w,d:w.document,click,state};
}

test('Shop contains scrolling in its menu and fills the scene with an independent background',{skip:!JSDOM},()=>{
 const dom=new JSDOM('<body data-scene="shop" data-artifact-choice="false"><header id="header"></header><main id="game"><section class="shop-layout situation-layout situation-shop shop-expanded shop-tabbed"><div class="situation-art"><img></div><div class="shop-hud"><div class="run-top"></div></div><div class="shop-counter ornate-panel"><section class="shop-stock"></section><footer class="shop-footer"></footer></div></section></main>'),w=dom.window,d=w.document;
 try{
  // Read Shop and its shared layout owners in their live order. Browser QA measures geometry.
  for(const file of ['style.css','dungeon.css','scene.css','shop.css']){
   const style=d.createElement('style');style.textContent=fs.readFileSync(path.join(root,file),'utf8');d.head.append(style);
  }
  const scene=d.querySelector('.shop-layout'),art=scene.querySelector('.situation-art'),panel=scene.querySelector('.shop-counter'),css=el=>w.getComputedStyle(el);
  assert.equal(css(d.body).overflow,'hidden');assert.equal(css(d.body).height,'100dvh');
  assert.equal(css(d.querySelector('#game')).minHeight,'0');
  assert.equal(css(scene).height,'100%');assert.equal(css(scene).minHeight,'0');
  assert.equal(css(art).position,'absolute');assert.equal(css(art).width,'100%');assert.equal(css(art).height,'100%');
  assert.equal(css(art.querySelector('img')).objectFit,'cover');
  assert.equal(css(panel).overflowY,'auto');assert.equal(css(panel).overscrollBehavior,'contain');
  assert.equal(css(panel).minHeight,'0');assert.equal(css(panel).maxHeight,'100%');
  assert.equal(css(panel.querySelector('.shop-footer')).flexShrink,'0');
  d.body.dataset.scene='map';assert.notEqual(css(d.body).overflow,'hidden','leaving Shop releases its document clamp');
  d.body.dataset.scene='shop';d.body.dataset.artifactChoice='true';assert.notEqual(css(d.body).overflow,'hidden','an Artifact encounter keeps its own layout owner');
 }finally{dom.window.close();}
});

test('Shop keeps its background and HUD outside one named, keyboard-focusable menu scroll region',{skip:!JSDOM},()=>{
 const {dom,d}=boot();
 try{
  const scene=d.querySelector('.shop-layout'),panel=scene.querySelector('.shop-counter'),art=scene.querySelector('.situation-art'),hud=scene.querySelector('.shop-hud');
  assert.equal(panel.getAttribute('tabindex'),'0');assert.equal(panel.getAttribute('role'),'region');
  assert.equal(d.getElementById(panel.getAttribute('aria-labelledby')).textContent,'Shop');
  assert.ok(panel.hasAttribute('data-shop-scroll'));
  assert.equal(art.parentElement,scene);assert.equal(hud?.parentElement,scene);
  assert.equal(panel.contains(art),false);assert.equal(panel.contains(hud),false);
  assert.ok(hud.querySelector('.run-top'));assert.ok(hud.querySelector('.gold-pill'));
  assert.equal(panel.querySelectorAll('[role="tabpanel"]').length,3);
  assert.equal(panel.querySelectorAll('[data-action="buy-card"]').length,6);
  assert.equal(panel.querySelectorAll('[data-action="buy-artifact"]').length,6);
  assert.ok(panel.querySelector('[data-action="shop-remove"]'));assert.ok(panel.querySelector('[data-action="leave-shop"]'));
  panel.focus();assert.equal(d.activeElement,panel);
 }finally{dom.window.close();}
});

test('Shop scroll survives a selection and paid purchase, while changing service starts at its top',{skip:!JSDOM},()=>{
 const {dom,d,click,state}=boot();
 try{
  const panel=()=>d.querySelector('.shop-counter'),art=d.querySelector('.situation-art img').getAttribute('src');
  const initial=state(),cost=E.shopPrice(initial,initial.shop.offers[1]);
  panel().scrollTop=420;click('[data-action="select-shop"][data-index="1"]');assert.equal(panel().scrollTop,420);
  click('[data-action="buy-card"][data-index="1"]');
  assert.equal(panel().scrollTop,420);assert.equal(state().gold,initial.gold-cost);assert.equal(state().deck.length,initial.deck.length+1);
  const afterCard=state();click('#shop-tab-artifacts');assert.equal(panel().scrollTop,0);assert.deepEqual(state(),afterCard);
  panel().scrollTop=280;const artifactCost=E.shopPrice(afterCard,afterCard.shop.artifacts[0]);
  click('[data-action="buy-artifact"][data-index="0"]');
  assert.equal(panel().scrollTop,280);assert.equal(state().gold,afterCard.gold-artifactCost);
  click('#shop-tab-remove');assert.equal(panel().scrollTop,0);
  assert.equal(d.querySelector('.situation-art img').getAttribute('src'),art);
  assert.ok(d.querySelector('#shop-panel-cards').hidden);assert.ok(d.querySelector('#shop-panel-artifacts').hidden);assert.equal(d.querySelector('#shop-panel-remove').hidden,false);
  click('[data-action="leave-shop"]');assert.equal(state().scene,'map');assert.equal(d.body.dataset.scene,'map');
 }finally{dom.window.close();}
});
