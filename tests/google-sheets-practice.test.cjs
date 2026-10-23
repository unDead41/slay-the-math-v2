'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom'),P=require('../dist/education-practice.js'),M=require('../dist/mechanics.js');
function boot(options={}){
 const errors=[],previous=globalThis.DCLearningCollectionConfig;globalThis.DCLearningCollectionConfig={googleScriptUrl:options.defaultURL||''};const html=P.createDocument(M.data);globalThis.DCLearningCollectionConfig=previous;const dom=new JSDOM(html,{url:options.file?'file:///game.html':'https://practice.example/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  if(options.dev)w.STMDevMode={get:()=>true};w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.HTMLElement.prototype.scrollIntoView=function(){};w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};w.fetch=async()=>{throw Error('offline');};w.addEventListener('error',e=>errors.push(e.message));
 }});const w=dom.window,d=w.document;return {dom,w,d,errors,click:s=>{const el=d.querySelector(s);assert.ok(el,s);assert.equal(el.disabled,false);el.click();}};
}
test('actual generated Practice configures Google through the same paused destination and retains typing on status updates',()=>{
 const b=boot();try{assert.deepEqual(b.errors,[]);b.click('#learning-report');const input=b.d.querySelector('[data-analytics-google-url]');assert.ok(input);input.value='https://script.google.com/macros/s/DEPLOYMENT1234567890/exec';b.click('[data-analytics-action=destination-save]');assert.equal(JSON.parse(b.w.localStorage.getItem('slay-the-math.learning-destination.v1')).googleScriptUrl,input.value);assert.equal(b.d.querySelector('[data-analytics-action=share]').getAttribute('aria-pressed'),'false');assert.equal(b.d.querySelector('iframe[title="Education collection"]'),null);
 const draft=b.d.querySelector('[data-analytics-google-url]');draft.focus();draft.value='unfinished draft';b.w.dispatchEvent(new b.w.StorageEvent('storage',{key:'slay-the-math.learning-sync.v1'}));assert.equal(b.d.querySelector('[data-analytics-google-url]').value,'unfinished draft');assert.equal(b.d.activeElement,b.d.querySelector('[data-analytics-google-url]'));
 }finally{b.w.close();}
});
test('developer and offline-file Practice disable Google setup and collection controls',()=>{
 for(const options of [{dev:true},{file:true}]){const b=boot(options);try{assert.deepEqual(b.errors,[]);b.click('#learning-report');for(const el of b.d.querySelectorAll('[data-analytics-google-url],[data-analytics-action=destination-save],[data-analytics-action=destination-local],[data-analytics-action=share]'))assert.equal(el.disabled,true);assert.ok(b.d.querySelector('[data-analytics-google-url]'));assert.equal(b.d.querySelector('iframe[title="Education collection"]'),null);}finally{b.w.close();}}
});

test('operator site default reaches generated Practice and remains paused until consent',()=>{
 const url='https://script.google.com/macros/s/DEFAULT_DEPLOYMENT1234567890/exec',b=boot({defaultURL:url});try{assert.deepEqual(b.errors,[]);b.click('#learning-report');assert.equal(b.d.querySelector('[data-analytics-google-url]').value,url);assert.equal(b.d.querySelector('[data-analytics-action=share]').getAttribute('aria-pressed'),'false');assert.equal(b.d.querySelector('iframe[title="Education collection"]'),null);}finally{b.w.close();}
});
