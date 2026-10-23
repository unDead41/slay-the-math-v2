const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom');
const F=require('../tools/dev/fixtures.js'),Q=require('../dist/question-data.js');
const dir=path.join(__dirname,'../dist');
function boot(r){
 const html=fs.readFileSync(path.join(dir,'index.html'),'utf8'),dom=new JSDOM(html,{url:'https://alyssa.example/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,d=w.document;
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 if(r)w.localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));w.localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true,voiceMuted:true}));
 for(const m of html.matchAll(/<script src="([^"]+)"/g))w.eval(fs.readFileSync(path.join(dir,m[1].split('?')[0]),'utf8'));
 const click=s=>{const el=d.querySelector(s);assert.ok(el,s);assert.equal(el.disabled,false,s);el.click();};
 if(r)click('[data-action=continue]');
 return {dom,w,d,click,state:()=>JSON.parse(w.localStorage.getItem('duel-cube-math.v1'))};
}
test('real Predict controls trigger thinking, Hint and More Hint only on successful reveal',()=>{
 const {dom,w,d,click,state}=boot(F.create({kind:'combat'}));
 try{
  click('[data-action=forecast]');assert.equal(w.DCAudio.voiceSurface?.group,'question');
  const q=Q.questions.find(q=>q.id===state().battle.question.questionId),wrong=q.choices.find(c=>c.id!==q.correctChoiceId).id;
  const before=state().audioPresentation;click('[data-action=forecast-select][data-id="'+wrong+'"]');assert.deepEqual(state().audioPresentation,before);
  click('[data-action=forecast-support][data-kind=hint]');assert.equal(w.DCAudio.voiceSurface?.group,'hint');
  assert.equal(d.querySelector('[data-action=forecast-support][data-kind=hint]').disabled,true);
  click('[data-action=forecast-check]');assert.equal(w.DCAudio.voiceSurface?.group,'wrong','actual wrong submission has its own voice');
  click('[data-action=forecast-support][data-kind=moreHint]');assert.equal(w.DCAudio.voiceSurface?.group,'more_hint');
  click('[data-action=forecast-select][data-id="'+q.correctChoiceId+'"]');assert.equal(w.DCAudio.voiceSurface?.group,'more_hint','selection is silent');
  click('[data-action=forecast-check]');assert.equal(w.DCAudio.voiceSurface?.group,'correct');
  const restored=boot(state());try{assert.equal(restored.w.DCAudio.voiceSurface,null,'handled talking stays consumed after reload');}finally{restored.dom.window.close();}
  click('#dialog [data-action=close]');assert.equal(w.DCAudio.voiceSurface,null);
 }finally{dom.window.close();}
});
test('Rest selection, card reward and run defeat use their own actual UI outcomes',()=>{
 for(const kind of ['rest','reward','defeat']){
  const {dom,w,click,state}=boot(F.create({kind,hp:40}));
  try{
   if(kind==='rest'){assert.equal(w.DCAudio.voiceSurface,null);const hp=state().hp;click('[data-action=rest]');assert.equal(state().scene,'map');assert.ok(state().hp>hp);assert.equal(w.DCAudio.voiceSurface?.group,'rest');}
   else assert.equal(w.DCAudio.voiceSurface?.group,kind==='reward'?'card_reward':'defeat');
   click('[data-action=home]');assert.equal(w.DCAudio.voiceSurface,null);
  }finally{dom.window.close();}
 }
});
test('Artifact and Mystery review speak checked outcomes; Mystery expiry stays silent',()=>{
 for(const kind of ['artifact','mystery-correct','mystery-wrong','mystery-timeout']){
  const {dom,w,click,state}=boot(F.create(kind==='artifact'?{kind:'master'}:{kind:'event',event:'ME01',hp:40}));
  try{
   if(kind==='artifact'){click('[data-action=select-artifact]');click('[data-action=claim-artifact]');}
   else click('[data-action=mystery-start]');
   assert.equal(w.DCAudio.voiceSurface?.group,'question');
   const r=state(),qid=kind==='artifact'?r.educationState.pending.questionId:r.mysteryState.pending.questionId,q=Q.questions.find(q=>q.id===qid);
   if(kind==='mystery-timeout'){
    const deadline=r.mysteryState.pending.deadline;w.Date.now=()=>deadline+1;
    click('[data-action=mystery-answer][data-id="'+q.correctChoiceId+'"]');
    assert.equal(state().mysteryState.pending.outcome,'TIMEOUT');assert.equal(w.DCAudio.voiceSurface,null);
   }else if(kind==='artifact'){
    click('[data-action=education-select][data-id="'+q.choices.find(c=>c.id!==q.correctChoiceId).id+'"]');click('[data-action=education-check]');assert.equal(w.DCAudio.voiceSurface?.group,'wrong');
    click('[data-action=education-select][data-id="'+q.correctChoiceId+'"]');click('[data-action=education-check]');assert.equal(w.DCAudio.voiceSurface?.group,'correct');
   }else{
    const correct=kind==='mystery-correct',id=correct?q.correctChoiceId:q.choices.find(c=>c.id!==q.correctChoiceId).id;
    click('[data-action=mystery-answer][data-id="'+id+'"]');assert.equal(w.DCAudio.voiceSurface?.group,correct?'correct':'wrong');
   }
  }finally{dom.window.close();}
 }
});
test('Practice accepts only its current frame and origin and never writes the active run',()=>{
 const {dom,w,d,click}=boot(F.create({kind:'combat'}));
 try{
  click('[data-action=home]');const before=w.localStorage.getItem('duel-cube-math.v1');click('[data-action=education-practice]');
  const frame=d.getElementById('education-practice-frame').contentWindow,data={type:'stm-education-practice-audio',questionId:Q.questions[0].id,key:'review:q1',closed:false,hintUsed:false,moreHintViewed:false};
  w.dispatchEvent(new w.MessageEvent('message',{origin:'https://forged.example',source:frame,data}));assert.equal(w.DCAudio.voiceSurface,null);
  w.dispatchEvent(new w.MessageEvent('message',{origin:w.location.origin,source:frame,data}));assert.equal(w.DCAudio.voiceSurface?.group,'question');
  w.dispatchEvent(new w.MessageEvent('message',{origin:w.location.origin,source:frame,data:{...data,hintUsed:true}}));assert.equal(w.DCAudio.voiceSurface?.group,'hint');
  const record={status:'pending',hintState:{hintUsed:true,moreHintViewed:false},events:[{type:'HINT_REVEALED'},{type:'ANSWER_SUBMITTED',attemptId:'attempt:1'}],attempts:[{id:'attempt:1',correct:false}]};
  w.dispatchEvent(new w.MessageEvent('message',{origin:w.location.origin,source:frame,data:{...data,record:{...record,events:[{type:'FAKE_RESULT'}]}}}));assert.equal(w.DCAudio.voiceSurface?.group,'hint','invalid event payload is ignored');
  w.dispatchEvent(new w.MessageEvent('message',{origin:w.location.origin,source:frame,data:{...data,record}}));assert.equal(w.DCAudio.voiceSurface?.group,'wrong');
  const key=w.DCAudio.voiceSurface.key;
  w.dispatchEvent(new w.MessageEvent('message',{origin:w.location.origin,source:frame,data:{...data,record}}));assert.equal(w.DCAudio.voiceSurface.key,key,'same submitted attempt is not replayed');
  assert.equal(w.localStorage.getItem('duel-cube-math.v1'),before);
 }finally{dom.window.close();}
});
