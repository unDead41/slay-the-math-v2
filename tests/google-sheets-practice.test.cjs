'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom'),P=require('../dist/education-practice.js'),M=require('../dist/mechanics.js');
function boot(options={}){
 const errors=[],previous=globalThis.DCLearningCollectionConfig;globalThis.DCLearningCollectionConfig={googleScriptUrl:options.defaultURL||''};const html=P.createDocument(M.data);globalThis.DCLearningCollectionConfig=previous;const dom=new JSDOM(html,{url:options.file?'file:///game.html':'https://practice.example/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  if(options.dev)w.STMDevMode={get:()=>true};w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.HTMLElement.prototype.scrollIntoView=function(){};w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};w.fetch=async()=>{throw Error('offline');};w.addEventListener('error',e=>errors.push(e.message));
 }});const w=dom.window,d=w.document;return {dom,w,d,errors,click:s=>{const el=d.querySelector(s);assert.ok(el,s);assert.equal(el.disabled,false);el.focus();el.click();}};
}
test('generated Practice opens Sharing from comments and keeps a single JSON backup instead of CSV actions',()=>{
 const b=boot();try{
  assert.ok(b.d.querySelector('#question-feedback [data-feedback-sharing]'));
  assert.equal(b.d.querySelector('[data-feedback-export],[data-feedback-share]'),null);
  b.click('#question-feedback [data-feedback-sharing]');assert.equal(b.d.querySelector('#practice-analytics-dialog').open,true);assert.equal(b.d.querySelector('[data-analytics-panel=sharing]').hidden,false);
  assert.equal(b.d.querySelectorAll('[data-analytics-action=export]').length,1);assert.equal(b.d.querySelector('[data-exportformat=csv]'),null);assert.equal(b.d.querySelector('[data-analytics-google-url]'),null);
  b.click('#close-practice-analytics');assert.equal(b.d.activeElement.dataset.feedbackSharing,'');assert.deepEqual(b.errors,[]);
 }finally{b.w.close();}
});
test('generated Practice keeps the configured receiver out of the report and preserves search through storage updates',()=>{
 const b=boot({defaultURL:'https://script.google.com/macros/s/DEPLOYMENT1234567890/exec'});try{
  assert.deepEqual(b.errors,[]);b.click('#learning-report');assert.equal(b.d.querySelector('[data-analytics-google-url]'),null);b.click('[data-analytics-action=view][data-view=details]');
  const filter=b.d.querySelector('[data-analytics-question-filter]');filter.value='all';filter.dispatchEvent(new b.w.Event('change',{bubbles:true}));
  const search=b.d.querySelector('[data-analytics-search]');search.focus();search.value='SET-';search.dispatchEvent(new b.w.Event('input',{bubbles:true}));
  search.setSelectionRange(1,3,'backward');
  const table=b.d.querySelector('.analytics-question-record .analytics-table-scroll');table.scrollTop=140;table.scrollLeft=25;
  const standards=b.d.querySelector('[data-report-disclosure=sk]');standards.open=true;standards.querySelector('.analytics-table-scroll').scrollTop=60;
  b.w.dispatchEvent(new b.w.StorageEvent('storage',{key:'slay-the-math.learning-sync.v1'}));assert.equal(b.d.querySelector('[data-analytics-search]').value,'SET-');assert.equal(b.d.activeElement,b.d.querySelector('[data-analytics-search]'));assert.equal(b.d.querySelector('[data-analytics-panel=details]').hidden,false);assert.equal(b.d.querySelectorAll('[data-analytics-question]:not([hidden])').length,40);assert.equal(b.d.querySelector('iframe[title="Education collection"]'),null);
  const restored=b.d.querySelector('[data-analytics-search]');assert.deepEqual([restored.selectionStart,restored.selectionEnd,restored.selectionDirection],[1,3,'backward']);
  const restoredTable=b.d.querySelector('.analytics-question-record .analytics-table-scroll');assert.deepEqual([restoredTable.scrollTop,restoredTable.scrollLeft],[140,25]);assert.equal(b.d.querySelector('[data-report-disclosure=sk]').open,true);assert.equal(b.d.querySelector('[data-report-disclosure=sk] .analytics-table-scroll').scrollTop,60);
 }finally{b.w.close();}
});
test('developer and offline-file Practice disable Google setup and collection controls',()=>{
 for(const options of [{dev:true},{file:true}]){const b=boot(options);try{assert.deepEqual(b.errors,[]);b.click('#learning-report');for(const el of b.d.querySelectorAll('[data-analytics-action=share],[data-analytics-action=sync]'))assert.equal(el.disabled,true);assert.equal(b.d.querySelector('[data-analytics-google-url]'),null);assert.equal(b.d.querySelector('iframe[title="Education collection"]'),null);}finally{b.w.close();}}
});

test('operator site default reaches generated Practice and remains paused until consent',()=>{
 const url='https://script.google.com/macros/s/DEFAULT_DEPLOYMENT1234567890/exec',b=boot({defaultURL:url});try{assert.deepEqual(b.errors,[]);b.click('#learning-report');assert.equal(b.d.querySelector('[data-analytics-google-url]'),null);assert.equal(b.d.querySelector('.learning-report').innerHTML.includes(url),false);assert.equal(b.d.querySelector('[data-analytics-action=share]').getAttribute('aria-pressed'),'false');assert.equal(b.d.querySelector('iframe[title="Education collection"]'),null);}finally{b.w.close();}
});
