'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom');
const dir=path.join(__dirname,'../dist');
function boot(difficulty,storage={}){
 const html=fs.readFileSync(path.join(dir,'index.html'),'utf8'),dom=new JSDOM(html,{url:'https://balance.example/index.html'+(difficulty?'?balance='+difficulty:''),runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 w.localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true,voiceMuted:true}));for(const [k,v]of Object.entries(storage))w.localStorage.setItem(k,v);
 for(const m of html.matchAll(/<script src="([^"]+)"/g))w.eval(fs.readFileSync(path.join(dir,m[1].split('?')[0]),'utf8'));
 const click=s=>{const e=w.document.querySelector(s);assert.ok(e,s);assert.ok(!e.disabled,s);e.click();};
 return {dom,w,d:w.document,click};
}
test('browser offers three explicit playtest profiles while keeping the existing save accessible',()=>{
 const legacy=boot();try{legacy.click('[data-action=new]');assert.equal(legacy.d.querySelectorAll('.balance-options a').length,3);}finally{legacy.dom.window.close();}
 for(const difficulty of ['easy','medium','hard']){
  const b=boot(difficulty,{'duel-cube-math.v1':'legacy sentinel'});try{
   b.click('[data-action=new]');assert.match(b.d.querySelector('#dialog-body').textContent,/Predict and Hints/);b.click('[data-action=start-challenge]');
   const key=b.w.STMBalance.saveKey,r=JSON.parse(b.w.localStorage.getItem(key));assert.equal(r.balanceState.difficulty,difficulty);assert.equal(r.maxHp,b.w.DCConfig.MAX_HP);assert.ok(b.w.DCEngine.validate(r));
   assert.equal(b.w.localStorage.getItem('duel-cube-math.v1'),'legacy sentinel');
   const next=boot(difficulty,{[key]:JSON.stringify(r)});try{next.click('[data-action=continue]');assert.ok(next.d.querySelector('.artifact-encounter'));}finally{next.dom.window.close();}
   b.click('[data-action=select-artifact]');b.click('[data-action=claim-artifact]');
   const live=JSON.parse(b.w.localStorage.getItem(key)),answer=b.w.DCEducation.current(live).correctChoiceId;
   b.click('[data-action=education-select][data-id="'+answer+'"]');b.click('[data-action=education-check]');b.click('[data-action=education-continue]');
   assert.doesNotMatch(b.d.querySelector('#game').textContent,/Combat baseline 2\.24\.0/,'integrated combat must not be labeled legacy');
  }finally{b.dom.window.close();}
 }
});
test('candidate card and artifact descriptions use the actual resolver values and timing',()=>{
 const b=boot('medium');try{
  const E=b.w.DCEngine,K=b.w.STMCardKit,A=b.w.DCArtifacts,R=b.w.DCRichText;
  const mana=E.cardDisplayPlan({key:'stm.skill.mana_reading',upgraded:true});assert.match(K.renderPlain(mana),/Draw 2 cards now; draw 2 next turn/);assert.match(K.renderPlain(mana),/Exhaust/);
  assert.match(R.description(A.id('s09')),/40/);assert.match(R.description(A.id('e14')),/20%/);
  assert.match(K.renderPlain(E.cardDisplayPlan({key:'stm.skill.deep_study',upgraded:false})),/Exhaust/);
  const upgraded=E.cardDisplayPlan({key:'stm.passive.clear_mind',upgraded:true});assert.match(K.renderPlain(upgraded),/activation.*draw 1/i);
 }finally{b.dom.window.close();}
});
test('ordinary and Master card descriptions explain the single enemy in English and BM',()=>{
 for(const difficulty of [null,'medium']){
  const b=boot(difficulty);try{
   const E=b.w.DCEngine,K=b.w.STMCardKit;
   for(const key of ['stm.attack.rune_sweep','stm.attack.fate_storm'])for(const upgraded of [false,true]){
    const plan=E.cardDisplayPlan({key,upgraded});
    assert.ok(plan.actions.filter(a=>a.op==='damage').every(a=>a.target==='selected_enemy'));
    for(const lang of ['en','bm']){
     const printed=K.renderPlain(plan,lang);assert.doesNotMatch(printed,/other enem|all enem|random|musuh lain|semua musuh|rawak/i);
     assert.match(printed,lang==='en'?/enemy/:/musuh/);
    }
   }
  }finally{b.dom.window.close();}
 }
});
