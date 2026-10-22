'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const M=require('../dist/mechanics'),L=require('../dist/question-language');
const plain=runs=>(runs||[]).map(s=>s.text||'').join('');
test('all 120 BM questions preserve canonical identity, choice bindings, verified answers and numerical data',()=>{
 const before=JSON.stringify(M.data.bank);
 for(const source of M.data.bank.questions){
  const q=L.question(source,'ms');
  assert.notEqual(q.prompt,source.prompt,source.id+' prompt');
  for(const k of ['id','seed','topicId','topicCode','chapter','correctChoiceId','correctLabel','verification','curriculumStandards'])assert.deepEqual(q[k],source[k],source.id+' '+k);
  assert.deepEqual(q.choices.map(c=>[c.id,c.label]),source.choices.map(c=>[c.id,c.label]));
  assert.equal(plain(q.themedRichText.prompt),q.prompt,source.id+' rich prompt');
  assert.equal(plain(q.themedRichText.moreHint),q.moreHint,source.id+' more hint');
  assert.equal(plain(q.themedRichText.explanation),q.explanation,source.id+' explanation');
  for(const c of q.choices)assert.equal(plain(q.themedRichText.choices[c.id]),c.text,source.id+' '+c.id);
  for(const step of q.learning.workedSteps){assert.match(step.label,/^Langkah /);assert.equal(plain(step.richText),step.text);}
  for(const feedback of Object.values(q.learning.optionFeedback))assert.equal(plain(feedback.richText),feedback.text);
  for(const runs of Object.values(q.themedRichText).filter(Array.isArray))for(const segment of runs)if(segment.type==='term')assert.equal(M.data.glossary.entries[segment.glossary_id].category,segment.category);
  assert.equal(L.question(source,'en'),source);
 }
 assert.equal(JSON.stringify(M.data.bank),before,'Locale projection cannot change the canonical bank');
});
test('all reviewed editorial strings, flow nodes and SVG prose have authored coverage',()=>{
 const base=path.resolve(__dirname,'../modules/mechanics/source/QUESTION_BANK/localization');
 for(const topic of ['PROB','SET','LOGIC']){
  const locale=JSON.parse(fs.readFileSync(path.join(base,topic.toLowerCase()+'.ms.json'),'utf8'));
  assert.ok(locale.sourceReview);
  for(const q of M.data.bank.questions.filter(q=>q.topicCode===topic)){
   for(const text of [q.prompt,q.hint,q.moreHint,q.explanation,...q.hintSteps.map(x=>x.text),...q.choices.map(x=>x.text),...Object.values(q.learning.optionFeedback).map(x=>x.text),...q.learning.workedSteps.map(x=>x.text),q.harmonization.asked,...q.harmonization.given])assert.ok(Object.hasOwn(locale.strings,text),q.id+' missing '+text);
   for(const kind of ['hint','solution'])for(const text of q.learning.visual[kind].nodes||[])assert.ok(Object.hasOwn(locale.strings,text),q.id+' flow node');
  }
 }
});
test('school terminology follows source review and exposes honest local notation',()=>{
 assert.match(L.question(M.data.bank.questions[0],'ms').prompt,/muka gambar/);
 assert.match(L.data.support.termDefinitions['qb:converse'],/Akas/);
 assert.equal(L.data.support.termLabels['qb:complement'],'Pelengkap');
 assert.equal(L.t('More Hint','ms'),'Petunjuk Lanjut');
 const set=M.data.bank.questions.find(q=>q.id==='SET-017'),hint=M.session.selectLearningView(L.question(set,'ms'),M.session.reserveNext(M.session.createSession({seed:1}),{...M.data.bank,questions:[set]}).session.records[set.id]);
 assert.equal(hint.answer,null);
});
test('all 7 foundations and 14 checks localize without changing check indices or counts',()=>{
 let checks=0;
 for(const m of M.data.foundations.modules){const bm=L.foundation(m,'ms');assert.notEqual(bm.title,m.title);assert.equal(bm.id,m.id);for(let i=0;i<m.checks.length;i++){assert.equal(bm.checks[i].correctIndex,m.checks[i].correctIndex);assert.notEqual(bm.checks[i].prompt,m.checks[i].prompt);assert.equal(plain(bm.checks[i].richText),bm.checks[i].prompt);checks++;}}
 assert.equal(checks,14);
});
test('language preference uses an independent key and still works if persistence is unavailable',()=>{
 const values=new Map([['duel-cube-math.v1','keep']]),storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
 assert.deepEqual(L.setLanguage('ms',storage),{language:'ms',saved:true});assert.equal(L.language(storage),'ms');assert.equal(values.get('duel-cube-math.v1'),'keep');
 const broken={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
 assert.equal(L.setLanguage('en',broken).saved,false);assert.equal(L.language(broken),'en');L.setLanguage('en',storage);
});
