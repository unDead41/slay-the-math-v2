'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
let JSDOM;try{({JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom'));}catch{}
const M=require('../dist/mechanics.js'),P=require('../dist/education-practice.js');
const L=require('../dist/question-language.js');
const feedbackKey='slay-the-math.question-feedback.v1';
function boot(values=new Map(),options={}){
 const errors=[],downloads=[],shares=[];
 const storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>{if(options.failComments&&k===feedbackKey)throw Error('Quota exceeded');values.set(k,v);}};
 const dom=new JSDOM(P.createDocument(M.data),{url:'https://practice.example/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  Object.defineProperty(w,'localStorage',{value:storage});
  w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
  w.HTMLElement.prototype.scrollIntoView=function(){};
  w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
  w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
  w.URL.createObjectURL=file=>{downloads.push(file);return 'blob:comments';};w.URL.revokeObjectURL=()=>{};
  w.HTMLAnchorElement.prototype.click=function(){};
  if(options.share){w.navigator.canShare=()=>true;w.navigator.share=async payload=>{shares.push(payload);if(options.abort)throw new w.DOMException('Cancelled','AbortError');};}
  w.addEventListener('error',e=>errors.push(e.error?.message||e.message));
 }});
 const w=dom.window,d=w.document;
 const select=id=>{d.getElementById('question-select').value=id;d.getElementById('question-select').dispatchEvent(new w.Event('change',{bubbles:true}));};
 const write=text=>{d.getElementById('feedback-comment').value=text;d.getElementById('feedback-comment').dispatchEvent(new w.Event('input',{bubbles:true}));};
 return {dom,w,d,values,errors,downloads,shares,select,write};
}
test('DOM: all 120 questions switch between authored BM and English, with translated guidance and unchanged answer identities',{skip:!JSDOM},()=>{
 const {dom,w,d,select,errors}=boot();
 const lang=value=>{d.getElementById('language-select').value=value;d.getElementById('language-select').dispatchEvent(new w.Event('change',{bubbles:true}));};
 try{
  for(const q of M.data.bank.questions){
   select(q.id);lang('en');const english=d.getElementById('question-prompt').textContent;
   lang('ms');assert.equal(d.documentElement.lang,'ms');assert.notEqual(d.getElementById('question-prompt').textContent,english,q.id);
   assert.equal(d.querySelector('label[for="language-select"]').textContent,'Bahasa soalan');
   assert.deepEqual([...d.querySelectorAll('#choices input')].map(x=>x.value),q.choices.map(c=>c.id));
   d.getElementById('hint-tab').click();assert.match(d.getElementById('more-hint-rule').textContent,/Petunjuk/);
   assert.equal([...d.querySelectorAll('#hint-visual td')].filter(c=>c.textContent.trim()==='?').length,0,q.id);
   d.querySelector('#choices input[value="'+q.choices.find(c=>c.id!==q.correctChoiceId).id+'"]').click();d.getElementById('submit-answer').click();
   d.getElementById('more-hint-tab').click();assert.ok(d.getElementById('more-hint-text').textContent.length);
   const activeTab=d.getElementById('more-hint-tab').getAttribute('aria-selected');
   lang('en');assert.equal(d.getElementById('question-prompt').textContent,english,q.id+' English restored');assert.equal(d.getElementById('more-hint-tab').getAttribute('aria-selected'),activeTab);
   lang('ms');d.querySelector('#choices input[value="'+q.correctChoiceId+'"]').click();d.getElementById('submit-answer').click();d.getElementById('show-steps').click();
   assert.equal(d.getElementById('worked-steps').children.length,3);assert.equal(d.getElementById('answer-panel').hidden,false);
  }
  assert.deepEqual(errors,[]);
 }finally{dom.window.close();}
});
test('DOM: language changes keep selection, learning reservation, open guidance and comments, and restore the preference',{skip:!JSDOM},()=>{
 const {dom,w,d,values,write,errors}=boot();
 const lang=value=>{d.getElementById('language-select').value=value;d.getElementById('language-select').dispatchEvent(new w.Event('change',{bubbles:true}));};
 let id;
 try{
  d.getElementById('resume-learning').click();id=d.getElementById('question-select').value;
  const input=d.querySelector('#choices input');input.click();const choice=input.value;
  d.getElementById('hint-tab').click();const learning=values.get('slay-the-math.education-practice.v1');
  lang('ms');assert.equal(d.getElementById('question-select').value,id);assert.equal(d.querySelector('#choices input:checked').value,choice);assert.equal(d.getElementById('hint-tab').getAttribute('aria-selected'),'true');assert.equal(values.get('slay-the-math.education-practice.v1'),learning);
  write('Petunjuk ini boleh ditambah contoh.');assert.equal(JSON.parse(values.get(feedbackKey)).comments[0].context.language,'ms');
  lang('en');assert.equal(d.getElementById('feedback-comment').value,'Petunjuk ini boleh ditambah contoh.');
  lang('ms');assert.deepEqual(errors,[]);
 }finally{dom.window.close();}
 const reopened=boot(values);try{assert.equal(reopened.d.getElementById('language-select').value,'ms');reopened.d.getElementById('resume-learning').click();assert.equal(reopened.d.getElementById('question-select').value,id);assert.equal(reopened.d.getElementById('feedback-comment').value,'Petunjuk ini boleh ditambah contoh.');assert.deepEqual(reopened.errors,[]);}finally{reopened.dom.window.close();}
});
test('DOM: every question has its own editable persistent comment, unaffected by Hint, review reset or learning reset',{skip:!JSDOM},()=>{
 const state=boot(new Map([['duel-cube-math.v1','keep-run'],['duel-cube-question-history.v1','keep-rewarded']]));
 const {dom,d,select,write,values,errors}=state;
 try{
  assert.equal(d.querySelectorAll('.atlas-question').length,120);
  const ids=M.data.bank.questions.map(q=>q.id);
  for(const id of ids){select(id);assert.equal(d.getElementById('feedback-question-id').textContent,id);assert.equal(d.getElementById('feedback-comment').value,'');write('Improve '+id);}
  assert.equal(JSON.parse(values.get(feedbackKey)).comments.length,120);
  select('PROB-003');d.querySelector('input[value="hint-unclear"]').click();
  d.getElementById('hint-tab').click();assert.equal(d.getElementById('feedback-comment').value,'Improve PROB-003');
  d.getElementById('restart-review').click();assert.equal(d.getElementById('feedback-comment').value,'Improve PROB-003');
  d.getElementById('reset-learning').click();d.getElementById('confirm-reset-learning').click();
  assert.equal(JSON.parse(values.get(feedbackKey)).comments.length,120);
  assert.equal(values.get('duel-cube-math.v1'),'keep-run');assert.equal(values.get('duel-cube-question-history.v1'),'keep-rewarded');
  assert.deepEqual(errors,[]);
 }finally{dom.window.close();}
 const reopened=boot(values);try{reopened.select('PROB-003');assert.equal(reopened.d.getElementById('feedback-comment').value,'Improve PROB-003');assert.equal(reopened.d.querySelector('input[value="hint-unclear"]').checked,true);assert.deepEqual(reopened.errors,[]);}finally{reopened.dom.window.close();}
});
test('DOM: comments stay inert and their shared settings keep cancellation and saved text',{skip:!JSDOM},()=>{
 const {dom,d,write,downloads,errors}=boot();try{
  d.getElementById('feedback-save').click();assert.match(d.getElementById('feedback-status').textContent,/Choose/);
  write('<img src=x onerror="alert(1)">Please number the steps.');d.getElementById('feedback-save').click();assert.equal(d.querySelector('#question-feedback img'),null);assert.match(d.getElementById('feedback-status').textContent,/Saved on this device/);
  d.getElementById('feedback-finish').click();assert.equal(d.getElementById('feedback-exit-dialog').open,true);assert.match(d.getElementById('feedback-exit-summary').textContent,/1 question/);assert.match(d.getElementById('feedback-exit-delivery').textContent,/Sharing is off|on this device/i);
  assert.equal(d.querySelector('[data-feedback-export],[data-feedback-share]'),null);d.querySelector('#feedback-exit-dialog [data-feedback-sharing]').click();assert.equal(d.getElementById('feedback-exit-dialog').open,false);assert.equal(d.getElementById('practice-analytics-dialog').open,true);assert.equal(d.querySelector('[data-analytics-panel=sharing]').hidden,false);assert.equal(downloads.length,0);
  d.getElementById('close-practice-analytics').click();assert.match(d.getElementById('feedback-comment').value,/Please number/);assert.deepEqual(errors,[]);
 }finally{dom.window.close();}
});
test('DOM: leaving sharing settings preserves comments without invoking native file sharing',{skip:!JSDOM},()=>{
 const {dom,d,write,shares,values,errors}=boot(new Map(),{share:true});try{
  write('The diagram labels need more space.');d.querySelector('#question-feedback [data-feedback-sharing]').click();assert.equal(shares.length,0);d.getElementById('practice-analytics-dialog').dispatchEvent(new dom.window.Event('cancel',{cancelable:true}));assert.equal(JSON.parse(values.get(feedbackKey)).comments.length,1);assert.equal(d.getElementById('feedback-comment').value,'The diagram labels need more space.');assert.deepEqual(errors,[]);
 }finally{dom.window.close();}
});
test('DOM: comment-only storage failure stays truthful at exit and offers the in-memory comment in shared JSON recovery',{skip:!JSDOM},async()=>{
 for(const language of ['en','ms']){
  const {dom,w,d,write,values,downloads,errors}=boot(new Map(),{failComments:true});try{
   const select=d.getElementById('language-select');select.value=language;select.dispatchEvent(new w.Event('change',{bubbles:true}));
   write('Keep this unsaved comment.');assert.equal(values.has(feedbackKey),false);d.getElementById('feedback-finish').click();
   assert.doesNotMatch(d.getElementById('feedback-exit-summary').textContent,/comment saved on this device|komen yang disimpan pada peranti/i);
   assert.match(d.getElementById('feedback-exit-summary').textContent,language==='ms'?/halaman terbuka/:/open page/);
   d.querySelector('#feedback-exit-dialog [data-feedback-sharing]').click();assert.equal(d.querySelector('[data-analytics-delivery-state]').dataset.analyticsDeliveryState,'save-error');
   const backup=d.querySelector('.analytics-backup');backup.open=true;backup.querySelector('[data-analytics-action=export]').click();assert.equal(downloads.length,1);
   const contents=await new Promise((resolve,reject)=>{const reader=new w.FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsText(downloads[0]);});assert.equal(JSON.parse(contents).questionFeedback.comments[0].comment,'Keep this unsaved comment.');assert.deepEqual(errors,[]);
   d.getElementById('close-practice-analytics').click();d.getElementById('feedback-finish').click();d.getElementById('feedback-exit-confirm').click();assert.match(d.getElementById('feedback-status').textContent,language==='ms'?/halaman terbuka/:/open page/);
  }finally{dom.window.close();}
 }
});
