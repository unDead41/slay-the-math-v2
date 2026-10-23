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
  click('[data-action=forecast-check]');assert.equal(w.DCAudio.voiceSurface?.group,'hint','wrong answer does not claim More Hint');
  click('[data-action=forecast-support][data-kind=moreHint]');assert.equal(w.DCAudio.voiceSurface?.group,'more_hint');
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
test('Practice accepts only its current frame and origin and never writes the active run',()=>{
 const {dom,w,d,click}=boot(F.create({kind:'combat'}));
 try{
  click('[data-action=home]');const before=w.localStorage.getItem('duel-cube-math.v1');click('[data-action=education-practice]');
  const frame=d.getElementById('education-practice-frame').contentWindow,data={type:'stm-education-practice-audio',questionId:Q.questions[0].id,key:'review:q1',closed:false,hintUsed:false,moreHintViewed:false};
  w.dispatchEvent(new w.MessageEvent('message',{origin:'https://forged.example',source:frame,data}));assert.equal(w.DCAudio.voiceSurface,null);
  w.dispatchEvent(new w.MessageEvent('message',{origin:w.location.origin,source:frame,data}));assert.equal(w.DCAudio.voiceSurface?.group,'question');
  w.dispatchEvent(new w.MessageEvent('message',{origin:w.location.origin,source:frame,data:{...data,hintUsed:true}}));assert.equal(w.DCAudio.voiceSurface?.group,'hint');
  assert.equal(w.localStorage.getItem('duel-cube-math.v1'),before);
 }finally{dom.window.close();}
});
