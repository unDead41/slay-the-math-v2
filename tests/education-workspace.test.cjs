'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom'),P=require('../dist/education-practice.js'),M=require('../dist/mechanics.js');
const feedbackKey='slay-the-math.question-feedback.v1';
function boot(values=new Map()){
 const errors=[],dom=new JSDOM(P.createDocument(M.data),{url:'https://practice.example/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
 Object.defineProperty(w,'localStorage',{value:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)}});w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.HTMLElement.prototype.scrollIntoView=function(){};w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};w.fetch=async()=>{throw Error('offline');};w.addEventListener('error',e=>errors.push(e.message));
 }}),w=dom.window,d=w.document;
 const change=(selector,value)=>{const el=d.querySelector(selector);el.value=value;el.dispatchEvent(new w.Event(el.tagName==='TEXTAREA'?'input':'change',{bubbles:true}));};
 return {dom,w,d,values,errors,change};
}
test('Practice uses a compact ink workspace with separate question/feedback views and no player CSV or URL setup',()=>{
 const b=boot();try{
 assert.ok(b.d.querySelector('.practice-heading'));assert.equal(b.d.querySelector('.hero-line,#theme-select'),null);assert.equal(b.d.querySelector('#practice-options').open,false);assert.equal(b.d.querySelector('#practice-question-view').hidden,false);assert.equal(b.d.querySelector('#question-feedback').hidden,true);
 b.d.querySelector('[data-practice-panel-toggle=feedback]').click();assert.equal(b.d.querySelector('#practice-question-view').hidden,true);assert.equal(b.d.querySelector('#question-feedback').hidden,false);assert.equal(b.d.activeElement,b.d.querySelector('#feedback-comment'));
 assert.equal(b.d.querySelectorAll('[data-review-question-id]').length,120);assert.equal(b.d.querySelector('[data-feedback-export],[data-feedback-share],[data-exportformat=csv],[data-analytics-google-url]'),null);assert.deepEqual(b.errors,[]);
 }finally{b.w.close();}
});
test('a list tick does not open that question or change learning evidence; filters and comments keep their own meaning',()=>{
 const b=boot();try{
 const id=b.d.querySelector('#question-heading').textContent,learning=b.values.get('slay-the-math.learning-analytics.v1'),run='run-sentinel';b.values.set('duel-cube-math.v1',run);
 b.d.querySelector('[data-review-question-id="SET-040"]').click();assert.equal(b.d.querySelector('#question-heading').textContent,id);assert.equal(b.values.get('slay-the-math.learning-analytics.v1'),learning);assert.equal(b.values.get('duel-cube-math.v1'),run);
 b.change('#review-status-select','reviewed');assert.equal(b.d.querySelectorAll('.atlas-question').length,1);assert.equal(b.d.querySelector('.atlas-question').dataset.questionId,'SET-040');
 b.change('#review-status-select','commented');assert.equal(b.d.querySelectorAll('.atlas-question').length,0);
 b.d.querySelector('[data-practice-panel-toggle=feedback]').click();b.change('#feedback-comment','Clearer example, please.');b.change('#review-status-select','commented');assert.equal(b.d.querySelectorAll('.atlas-question').length,1);assert.equal(b.d.querySelector('.atlas-question').dataset.questionId,id);assert.equal(b.d.querySelector('#feedback-reviewed').checked,false);
 b.d.querySelector('#feedback-reviewed').click();b.d.querySelector('#feedback-reviewed').click();assert.equal(b.d.querySelector('#feedback-comment').value,'Clearer example, please.');assert.deepEqual(b.errors,[]);
 }finally{b.w.close();}
});
test('review flags, full comments and the selected feedback view survive navigation and BM switching; reload keeps each record',()=>{
 const b=boot();let values,id;try{
 id=b.d.querySelector('#question-heading').textContent;b.d.querySelector('[data-practice-panel-toggle=feedback]').click();b.change('#feedback-comment','x'.repeat(2000));b.d.querySelector('#feedback-reviewed').click();b.change('#language-select','ms');assert.match(b.d.querySelector('#feedback-reviewed-label').textContent,/Sudah disemak/);assert.equal(b.d.querySelector('#question-feedback').hidden,false);assert.equal(b.d.querySelector('#feedback-comment').value.length,2000);
 b.change('#question-select','LOGIC-040');assert.equal(b.d.querySelector('#question-feedback').hidden,false);assert.equal(b.d.querySelector('#feedback-reviewed').checked,false);b.change('#feedback-comment','Langkah kedua kurang jelas.');b.change('#question-select',id);assert.equal(b.d.querySelector('#feedback-reviewed').checked,true);assert.equal(b.d.querySelector('#feedback-comment').value.length,2000);values=new Map(b.values);assert.deepEqual(b.errors,[]);
 }finally{b.w.close();}
 const reopened=boot(values);try{reopened.change('#question-select',id);assert.equal(reopened.d.querySelector('#feedback-reviewed').checked,true);assert.equal(reopened.d.querySelector('#feedback-comment').value.length,2000);const data=JSON.parse(reopened.values.get(feedbackKey));assert.equal(data.comments.find(q=>q.questionId==='LOGIC-040').comment,'Langkah kedua kurang jelas.');assert.deepEqual(reopened.errors,[]);}finally{reopened.w.close();}
});
