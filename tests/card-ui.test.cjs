'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const K=require('../dist/card-kit.js');
let UI;
try { UI=require('../dist/card-ui.js'); } catch(error) { if(error.code!=='MODULE_NOT_FOUND')throw error; }
let JSDOM;
try { ({JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom')); } catch {}

const context={energy:3,strength:2,agility:2,focusStock:3,handAfterPlay:0,availableDrawCards:30,discardCount:5};
const render=(plan,options={})=>{assert.equal(typeof UI?.view,'function','the card presentation renderer is available');return UI.view(plan,options);};
function surface(html){
 const dom=new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{pretendToBeVisual:true});
 return {dom,doc:dom.window.document,win:dom.window};
}

test('card UI renders a native article and isolates actions from rich text',{skip:!JSDOM},()=>{
 const plan=K.preparePlay('stm.attack.rune_strike',context,true);
 const {dom,doc}=surface(render(plan,{action:'play',uid:'hand-1',extra:'data-uid="unit-1" data-key="slash" data-index="2" aria-pressed="true" disabled'}));
 try {
  const card=doc.querySelector('article.playing-card.package-card'),button=card.querySelector('button[data-action="play"]');
  assert.ok(card);assert.ok(button);assert.equal(card.querySelectorAll('button').length,1);
  assert.equal(button.type,'button');assert.equal(button.disabled,true);
  for(const [key,value]of Object.entries({'data-uid':'unit-1','data-key':'slash','data-index':'2','aria-pressed':'true'})){
   assert.equal(button.getAttribute(key),value);assert.equal(card.hasAttribute(key),false);
  }
  assert.equal(button.querySelector('[tabindex],button,a,input,select,textarea'),null,'an action button cannot contain a focusable token');
  assert.ok(card.querySelectorAll('.stm-rt').length>0);
  for(const token of card.querySelectorAll('.stm-rt'))assert.equal(token.closest('button,[data-action]'),null);
  assert.ok(doc.getElementById(button.getAttribute('aria-describedby')),'the action points to its description');
 }finally{dom.window.close();}
});

test('all 40 cards preserve supplied frames, localized text and snapshot values in every focus state',{skip:!JSDOM},()=>{
 assert.equal(K.data.cards.length,40);
 const {dom,doc}=surface('');
 const states=[
  [false,{}],[true,{}],[true,{focusStock:0}],[true,{focusUsed:true}],
  [true,{energy:0,hasTarget:false}],[true,{handAfterPlay:10,availableDrawCards:0}]
 ];
 try {
  for(const card of K.data.cards)for(const lang of ['en','ms'])for(const [request,overrides]of states){
   const plan=K.preparePlay(card.id,{...context,...overrides},request),before=JSON.stringify(plan);
   doc.body.innerHTML=render(plan,{lang,action:'select',uid:card.id,extra:{'data-id':card.id}});
   const node=doc.querySelector('.package-card'),frame=node.querySelector('.package-card-frame'),description=node.querySelector('.package-card-description');
   assert.equal(node.dataset.cardId,card.id);assert.equal(node.dataset.focus,String(plan.focused));
   assert.match(frame.getAttribute('src'),new RegExp('card_frame_'+card.category+'_'+(plan.focused?'focus':'normal')+'\\.(?:png|webp)$'));
   assert.equal(frame.width,1280);assert.equal(frame.height,1920);
   assert.equal(node.querySelector('.card-title').textContent,lang==='en'?card.display_name.en:card.display_name.bm);
   assert.equal(description.textContent,K.renderPlain(plan,lang));
   assert.equal(node.querySelector('.package-card-art img').getAttribute('src'),K.assetPath(card.icon));
   assert.equal(node.querySelectorAll('.stm-rt').length,node.querySelectorAll('.stm-rt[data-tooltip][tabindex="0"]').length);
   assert.equal(node.querySelector('button .stm-rt'),null);assert.equal(node.querySelectorAll('button').length,1);
   assert.equal(JSON.stringify(plan),before,'rendering cannot change '+card.id+' or its snapshot');
  }
 }finally{dom.window.close();}
});

test('preview numbers and calculation tooltips use the supplied snapshot and reject false Focus',{skip:!JSDOM},()=>{
 const {dom,doc}=surface('');
 try {
  const cases=[
   ['stm.attack.rune_strike',{},true,'Deal 11 damage.',['Base: 6 + Strength: 2 + Focus: 3 = 11']],
   ['stm.attack.rune_strike',{focusStock:0},true,'Deal 8 damage.',['Base: 6 + Strength: 2 + Focus: 0 = 8']],
   ['stm.attack.rune_strike',{focusUsed:true},true,'Deal 8 damage.',['Base: 6 + Strength: 2 + Focus: 0 = 8']],
   ['stm.attack.rune_strike',{hasTarget:false},true,'Deal 8 damage.',['Base: 6 + Strength: 2 + Focus: 0 = 8']],
   ['stm.attack.twin_shot',{},true,'Deal 8, then 5 damage to one enemy.',['Base: 3 + Strength: 2 + Focus: 3 = 8','Base: 3 + Strength: 2 = 5']],
   ['stm.skill.mana_reading',{energy:2},true,'Draw 3 cards now; draw 1 next turn. Exhaust.',['Base: 2 + Focus: 1 = 3']],
   ['stm.skill.quick_study',{handAfterPlay:10},true,'Draw 2 cards.',['Base: 2 + Focus: 0 = 2']]
  ];
  for(const [id,overrides,requested,plain,formulas]of cases){
   const plan=K.preparePlay(id,{...context,...overrides},requested);doc.body.innerHTML=render(plan);
   assert.equal(doc.querySelector('.package-card-description').textContent,plain);
   const tips=[...doc.querySelectorAll('.stm-rt-calculation')].map(x=>x.dataset.tooltip);
   for(const formula of formulas)assert.ok(tips.some(tip=>tip.startsWith(formula)),id+' '+formula);
   if(overrides.focusStock===0||overrides.focusUsed||overrides.hasTarget===false||overrides.handAfterPlay===10){
    assert.equal(doc.querySelector('.package-card').dataset.focus,'false');
    assert.match(doc.querySelector('.package-card-frame').getAttribute('src'),/_normal\.(?:png|webp)$/);
   }
  }
  const bm=K.preparePlay('stm.attack.rune_strike',context,true);doc.body.innerHTML=render(bm,{lang:'ms-MY'});
  assert.equal(doc.querySelector('.package-card-description').textContent,'Beri 11 kerosakan.');
  assert.match(doc.querySelector('.stm-rt-calculation').dataset.tooltip,/Asas: 6 \+ Kekuatan: 2 \+ Fokus: 3 = 11/);
 }finally{dom.window.close();}
});

test('metadata and extra attributes cannot create markup or event handlers',{skip:!JSDOM},()=>{
 const plan=structuredClone(K.preparePlay('stm.attack.rune_strike',context,true));
 plan.card.display_name.en='<img src=x onerror="bad()"> & "Rune"';
 plan.card.text.en=[{type:'text',text:'<script>bad()</script> & '},{type:'calculation',ref:'damage'}];
 const {dom,doc}=surface(render(plan,{action:'select" onclick="bad()',uid:'x"><svg>',extra:{'data-id':'<img "test">','aria-pressed':'true','onclick':'bad()','style':'display:none','disabled':false}}));
 try {
  const card=doc.querySelector('.package-card'),button=card.querySelector('button');
  assert.equal(card.querySelector('.card-title').textContent,plan.card.display_name.en);
  assert.equal(card.querySelector('.package-card-description').textContent,'<script>bad()</script> & 11');
  assert.equal(doc.querySelector('script,svg,img[onerror]'),null);
  assert.equal(button.hasAttribute('onclick'),false);assert.equal(button.hasAttribute('style'),false);
  assert.equal(button.dataset.id,'<img "test">');assert.equal(button.disabled,false);
  assert.equal(button.dataset.action,'select" onclick="bad()');
  doc.body.innerHTML=render(plan,{action:'select',extra:'data-id="&lt;img&gt;" onclick="bad()" aria-pressed="false"'});
  assert.equal(doc.querySelector('button').dataset.id,'<img>');assert.equal(doc.querySelector('[onclick]'),null);
 }finally{dom.window.close();}
});

test('asset aliases resolve without changing the common padded canvas',{skip:!JSDOM},()=>{
 const old=globalThis.STM_CARD_ASSETS;
 const plan=K.preparePlay('stm.attack.rune_strike',context,true);
 globalThis.STM_CARD_ASSETS={[plan.card.icon]:'assets/card-icon.webp',[K.framePath(plan.card,true)]:'assets/card-focus.webp'};
 const {dom,doc}=surface(render(plan));
 try {
  assert.equal(doc.querySelector('.package-card-art img').getAttribute('src'),'assets/card-icon.webp');
  const frame=doc.querySelector('.package-card-frame');assert.equal(frame.getAttribute('src'),'assets/card-focus.webp');
  assert.equal(frame.width,1280);assert.equal(frame.height,1920);
 }finally{globalThis.STM_CARD_ASSETS=old;dom.window.close();}
});

test('repeated card instances describe their own copy even when callers reuse an ID',{skip:!JSDOM},()=>{
 const plan=K.preparePlay('stm.attack.rune_strike',context,true);
 const {dom,doc}=surface(render(plan,{action:'select',uid:'same-card'})+render(plan,{action:'select',uid:'same-card'}));
 try {
  const buttons=[...doc.querySelectorAll('button')],ids=buttons.map(button=>button.getAttribute('aria-describedby'));
  assert.equal(new Set(ids).size,2);
  for(const button of buttons)assert.equal(doc.getElementById(button.getAttribute('aria-describedby')).closest('article'),button.closest('article'));
 }finally{dom.window.close();}
});

test('collection comparison tokens outside the card still open the shared card tooltip',{skip:!JSDOM},()=>{
 const plan=K.preparePlay('stm.attack.rune_strike',context,true);
 const {dom,doc}=surface('<div class="card-detail-compare"><div>'+K.renderHTML(plan,'en')+'</div></div>');
 try {
  UI.bind(doc);doc.querySelector('.stm-rt').focus();
  assert.match(doc.querySelector('[role="tooltip"]').textContent,/Base: 6 \+ Strength: 2 \+ Focus: 3 = 11/);
 }finally{UI.hide();dom.window.close();}
});

test('tooltip hover, focus, keyboard and taps never dispatch a card action',{skip:!JSDOM},()=>{
 const {dom,doc,win}=surface(render(K.preparePlay('stm.attack.rune_strike',context,true),{action:'play',uid:'tooltip-card'}));
 try {
  const controller=UI.bind(doc);assert.equal(UI.bind(doc),controller,'binding the same document must not double-register');
  const token=doc.querySelector('.stm-rt-calculation');let actions=0,escapes=0;
  doc.addEventListener('click',event=>{if(event.target.closest('[data-action]'))actions++;});
  doc.addEventListener('keydown',event=>{if(event.key==='Escape')escapes++;});
  token.setAttribute('aria-describedby','persistent-help');
  token.dispatchEvent(new win.MouseEvent('pointerover',{bubbles:true}));
  let tip=doc.querySelector('[role="tooltip"]');assert.ok(tip);assert.equal(tip.textContent.includes('Base: 6 + Strength: 2 + Focus: 3 = 11'),true);
  assert.ok(token.getAttribute('aria-describedby').split(/\s+/).includes(tip.id));
  const escape=new win.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true});token.dispatchEvent(escape);
  assert.equal(escape.defaultPrevented,true);assert.equal(escapes,0);assert.equal(doc.querySelector('[role="tooltip"]'),null);
  assert.equal(token.getAttribute('aria-describedby'),'persistent-help');
  token.focus();assert.ok(doc.querySelector('[role="tooltip"]'));
  for(const key of ['Enter',' ']){
   const event=new win.KeyboardEvent('keydown',{key,bubbles:true,cancelable:true});token.dispatchEvent(event);assert.equal(event.defaultPrevented,true);
  }
  token.dispatchEvent(new win.MouseEvent('click',{bubbles:true,cancelable:true}));assert.ok(doc.querySelector('[role="tooltip"]'));
  token.dispatchEvent(new win.MouseEvent('click',{bubbles:true,cancelable:true}));assert.equal(doc.querySelector('[role="tooltip"]'),null,'a second tap closes a pinned tooltip');
  assert.equal(actions,0);
  doc.querySelector('[data-action]').click();assert.equal(actions,1,'the native action remains usable');
  doc.dispatchEvent(new win.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));assert.equal(escapes,1,'Escape resumes modal handling after dismissal');
 }finally{UI.hide();dom.window.close();}
});

test('tooltip stays inside the viewport, uses text content and closes on scroll and focusout',{skip:!JSDOM},()=>{
 const {dom,doc,win}=surface('<dialog open>'+render(K.preparePlay('stm.attack.rune_strike',context,true),{action:'play'})+'</dialog>');
 try {
  Object.defineProperty(win,'innerWidth',{value:320,configurable:true});Object.defineProperty(win,'innerHeight',{value:180,configurable:true});
  const nativeRect=win.HTMLElement.prototype.getBoundingClientRect;
  win.HTMLElement.prototype.getBoundingClientRect=function(){return this.getAttribute('role')==='tooltip'?{left:0,top:0,right:280,bottom:100,width:280,height:100}:nativeRect.call(this);};
  UI.bind(doc);const token=doc.querySelector('.stm-rt');token.dataset.tooltip='<img src=x onerror="bad()">';
  token.getBoundingClientRect=()=>({left:300,right:319,top:150,bottom:170,width:19,height:20});
  token.focus();let tip=doc.querySelector('[role="tooltip"]');assert.ok(tip);
  assert.equal(tip.closest('dialog'),doc.querySelector('dialog'),'a tooltip in a dialog must share its top layer');
  assert.equal(tip.querySelector('img'),null);assert.ok(tip.textContent.includes('<img src=x onerror="bad()">'));
  assert.ok(parseFloat(tip.style.left)>=8&&parseFloat(tip.style.left)<=32);assert.ok(parseFloat(tip.style.top)>=8&&parseFloat(tip.style.top)<=72);
  doc.querySelector('.package-card-description').dispatchEvent(new win.Event('scroll',{bubbles:false}));assert.equal(doc.querySelector('[role="tooltip"]'),null);
  token.dispatchEvent(new win.MouseEvent('pointerover',{bubbles:true}));assert.ok(doc.querySelector('[role="tooltip"]'));
  token.dispatchEvent(new win.FocusEvent('focusout',{bubbles:true,relatedTarget:doc.body}));assert.equal(doc.querySelector('[role="tooltip"]'),null);
  token.dispatchEvent(new win.MouseEvent('click',{bubbles:true,cancelable:true}));assert.ok(doc.querySelector('[role="tooltip"]'));
  UI.hide();assert.equal(doc.querySelector('[role="tooltip"]'),null);
 }finally{UI.hide();dom.window.close();}
});
