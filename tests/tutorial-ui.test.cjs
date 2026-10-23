'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom'),F=require('../tools/dev/fixtures.js');
const dir=path.resolve(__dirname,'../dist');
function boot(saved=F.create({kind:'combat',seed:12,focus:1})){
 const html=fs.readFileSync(path.join(dir,'index.html'),'utf8'),dom=new JSDOM(html,{url:'https://tutorial.example/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 w.localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true,voiceMuted:true}));w.localStorage.setItem('duel-cube-math.v1',JSON.stringify(saved));
 for(const m of html.matchAll(/<script src="([^"]+)"/g))w.eval(fs.readFileSync(path.join(dir,m[1].split('?')[0]),'utf8'));
 const d=w.document,click=selector=>{const el=d.querySelector(selector);assert.ok(el,selector);assert.ok(!el.disabled,selector);el.focus();el.click();return el;};
 const snapshot=()=>Object.fromEntries(Object.keys(w.localStorage).filter(k=>k!=='slay-the-math.tutorial.v1').sort().map(k=>[k,w.localStorage.getItem(k)]));
 return {w,d,click,snapshot,close:()=>w.close()};
}
test('full tutorial opens from existing entry, practises and closes without changing host records',()=>{
 const b=boot();try{
  const before=b.snapshot(),trigger=b.click('[data-action=help]');assert.ok(b.d.querySelector('[data-tutorial]'),'the complete tutorial replaces the old four-page guide');
  b.click('[data-tutorial-action=chapter][data-value=cards]');b.click('[data-tutorial-action=play]');assert.ok(b.d.querySelector('[data-tutorial-complete]'));
  assert.deepEqual(b.snapshot(),before);b.click('[data-tutorial-action=close]');assert.equal(b.d.querySelector('#dialog').open,false);assert.equal(b.d.activeElement,trigger);
  b.click('[data-action=help]');assert.equal(b.d.querySelector('[data-tutorial]').dataset.chapter,'cards');assert.deepEqual(b.snapshot(),before);
 }finally{b.close();}
});
test('tutorial language and confirmed reset affect only tutorial progress',()=>{
 const b=boot();try{
  const before=b.snapshot();b.click('[data-action=help]');b.click('[data-tutorial-action=language][data-value=ms]');
  assert.equal(b.d.querySelector('[data-tutorial]').lang,'ms');b.click('[data-tutorial-action=chapter][data-value=cards]');assert.match(b.d.querySelector('#tutorial-chapter-title').textContent,/Baca dan mainkan kad/);
  b.click('[data-tutorial-action=play]');b.click('[data-tutorial-action=reset]');b.click('[data-tutorial-action=reset-cancel]');assert.ok(JSON.parse(b.w.localStorage.getItem('slay-the-math.tutorial.v1')).completed.includes('cards'));
  b.click('[data-tutorial-action=reset]');b.click('[data-tutorial-action=reset-confirm]');const p=JSON.parse(b.w.localStorage.getItem('slay-the-math.tutorial.v1'));assert.equal(p.chapter,'welcome');assert.deepEqual(p.completed,[]);assert.equal(p.language,'ms');assert.deepEqual(b.snapshot(),before);
 }finally{b.close();}
});
test('Predict practice keeps support, wrong answers and successful retry inside the tutorial',()=>{
 const b=boot();try{
  const before=b.snapshot();b.click('[data-action=help]');b.click('[data-tutorial-action=chapter][data-value=predict]');
  const c=b.w.DCTutorialCore.create();c.select('predict');const q=b.w.DCEducation.currentConsumer(c.exercise().run).question,wrong=q.choices.find(x=>x.id!==q.correctChoiceId).id;
  assert.ok(b.d.querySelector('[data-tutorial-action=moreHint]').disabled);b.click('[data-tutorial-action=hint]');b.click('[data-tutorial-action=choose][data-value="'+wrong+'"]');b.click('[data-tutorial-action=check]');
  b.click('[data-tutorial-action=moreHint]');b.click('[data-tutorial-action=choose][data-value="'+q.correctChoiceId+'"]');b.click('[data-tutorial-action=check]');assert.ok(b.d.querySelector('[data-tutorial-complete]'));assert.deepEqual(b.snapshot(),before);
 }finally{b.close();}
});
