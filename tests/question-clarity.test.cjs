'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
const M=require('../dist/mechanics.js'),L=require('../dist/question-language.js'),baseline=require('./fixtures/question-clarity-baseline.json'),bank=M.data.bank;
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex'),plain=runs=>(runs||[]).map(x=>x.text).join('');
test('editorial clarity keeps all120 facts, choices, correct bindings and full EN/BM solutions unchanged',()=>{
 assert.equal(bank.bankVersion,baseline.bankVersion);assert.equal(bank.contentRevision,'clarity-2026-10-24.1');assert.equal(bank.questions.length,120);
 for(const before of baseline.items){const q=bank.questions.find(q=>q.id===before.id),bm=L.question(q,'ms');assert.equal(hash([q.id,q.seed,q.prompt,q.choices,q.correctChoiceId,q.correctLabel,q.verification,q.curriculumStandards,q.learning.workedSteps,q.learning.visual.solution]),before.identity,q.id+' canonical identity/solution');assert.equal(hash([bm.prompt,bm.choices,bm.explanation,bm.learning.workedSteps,bm.learning.visual.solution]),before.malaySolution,q.id+' BM facts/solution');}
});
test('all120 bilingual guidance sequences have complete concepts and operational steps with matching rich text',()=>{
 const ids=new Set();let references=0;
 for(const topic of ['PROB','SET','LOGIC']){const audit=JSON.parse(fs.readFileSync(path.join(__dirname,'../docs/verification/question-clarity-'+topic+'.json'),'utf8'));assert.equal(audit.items.length,40);assert.equal(audit.sourceReview.length,3);
  for(const item of audit.items){assert.ok(!ids.has(item.id));ids.add(item.id);const original=bank.questions.find(q=>q.id===item.id);
   for(const language of ['en','ms']){const q=L.question(original,language),review=language==='ms'?item.malay:item.english;assert.equal(q.hint,review.hint);assert.equal(q.moreHint,review.moreHint);assert.equal(q.hintSteps.map(s=>s.text).join(' '),q.hint);assert.ok(q.hintSteps.every(s=>s.text.trim()),q.id+' empty concept/next step');assert.notEqual(q.hint,q.moreHint);assert.equal(plain(q.themedRichText.hint),q.hint);assert.equal(plain(q.themedRichText.moreHint),q.moreHint);assert.doesNotMatch(q.moreHint,/(?:correct answer|answer is|choose option)\s*[:=]?\s*[A-D](?=[\s.])/i);}
   if(item.hintReference){references++;assert.equal(original.learning.visual.hint.reviewedReference,true);}
  }
 }
 assert.equal(ids.size,120);assert.equal(references,63);
});
test('reviewed pre-answer references show filled given facts and setup, without selected solution cells or final outputs',()=>{
 for(const source of bank.questions)for(const language of ['en','ms']){const q=L.question(source,language);let session=M.session.reserveNext(M.session.createSession({seed:9}),{...bank,questions:[source]}).session;session=M.session.openSupport(session,q.id,'hint');const view=M.session.selectLearningView(q,session.records[q.id]);assert.equal(view.answer,null);assert.equal(view.explanation,null);assert.equal(view.workedSteps,null);
  if(!source.learning.visual.hint.reviewedReference)continue;const v=view.visual;assert.equal(v.kind,'table');assert.ok(v.headers.length&&v.rows.length);assert.equal(v.headerRichText.length,v.headers.length);for(let r=0;r<v.rows.length;r++){assert.equal(v.rows[r].length,v.headers.length);for(let c=0;c<v.headers.length;c++){assert.notEqual(v.rows[r][c].trim(),'?');assert.equal(plain(v.rowRichText[r][c]),v.rows[r][c]);}}assert.ok(!v.rows.flat().some(cell=>typeof cell==='object'&&cell.selected));
 }
 const q=bank.questions.find(q=>q.id==='SET-018');assert.ok(!q.learning.visual.hint.rows.flat().includes('7'),'computed intersection must not be printed as a reference result');
 const implication=bank.questions.find(q=>q.id==='LOGIC-023');assert.ok(!implication.learning.visual.hint.headers.includes(implication.choices.find(c=>c.id===implication.correctChoiceId).text),'equivalent answer must not label a pre-answer table column');
});
test('native math structures and accessible Venn names remain safe in pre-answer guidance',()=>{
 const {JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom'),dom=new JSDOM('<div id="visual"></div><div id="text"></div>'),previous={document:global.document,DOMParser:global.DOMParser,XMLSerializer:global.XMLSerializer};
 Object.assign(global,{document:dom.window.document,DOMParser:dom.window.DOMParser,XMLSerializer:dom.window.XMLSerializer});try{
  for(const language of ['en','ms']){const source=bank.questions.find(q=>q.id==='SET-007'),q=L.question(source,language);let session=M.session.reserveNext(M.session.createSession({seed:1}),{...bank,questions:[source]}).session;session=M.session.openSupport(session,q.id,'hint');const v=M.session.selectLearningView(q,session.records[q.id]).visual,target=document.getElementById('visual');M.renderVisual(target,v,{glossary:L.installGlossary(M.data.glossary)});assert.equal(target.querySelector('svg title').textContent,v.title);assert.equal(target.querySelectorAll('rect[mask]').length,0);}
  const q=bank.questions.find(q=>q.id==='PROB-015'),target=document.getElementById('text');M.renderRichText(target,q.themedRichText.moreHint,{glossary:M.data.glossary});assert.ok(target.querySelectorAll('mfrac').length>=2,'partial multiplication still uses real fraction bars');assert.equal(target.querySelectorAll('script').length,0);
 }finally{Object.assign(global,previous);dom.window.close();}
});
