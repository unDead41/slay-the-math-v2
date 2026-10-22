'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {MATH_NS,createAuditDom,mathShape,mathLayoutOverrides}=require('./helpers/math-display.cjs');
let JSDOM;try{({JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom'));}catch{}

test('math display: annotated sets and fractions retain native layout through host and Artifact CSS',{skip:!JSDOM},async()=>{
 const audit=await createAuditDom({JSDOM,ids:['SET-024','PROB-003','LOGIC-017']});
 try{
  const {doc,w,M}=audit;
  // Exercise the actual native-button hydration path as well as span wrappers.
  w.STMMechanics={...M,data:{glossary:M.glossary}};w.DCQuestionLanguage=M.language;
  w.eval(fs.readFileSync(path.join(__dirname,'../dist/mechanics-host.js'),'utf8'));
  const q=M.bank.questions.find(q=>q.id==='SET-024'),host=doc.createElement('div');host.className='education-question stm-artifacts';
  host.innerHTML='<p data-q-rich="prompt"></p><p data-q-rich="explanation"></p>';doc.body.append(host);
  const previous=globalThis.document;globalThis.document=doc;
  try{
   w.STMMechanicsHost.hydrateQuestion(host,q,{...q.themedRichText,allowCalculations:true});
   // Cover the supported mathText branch inside an HTML term wrapper using
   // SET-024's real equation. The current bank uses prose in these wrappers.
   const term=doc.createElement('p');host.append(term);
   M.renderRichText(term,[{type:'term',text:q.themedRichText.prompt[0].text,category:'math',glossary_id:'qb:set',mathText:[{math:q.themedRichText.prompt[0].math}]}],{glossary:M.glossary});
   assert.ok(term.querySelector('span.rt-term math mrow'),'HTML term wrappers preserve nested native MathML');
  }
  finally{globalThis.document=previous;}
  assert.ok(host.querySelector('math mrow.rt-term[data-glossary-id="qb:set"]'),'SET-024 uses interactive native set groups');
  assert.ok(host.querySelector('button.rt-term'),'the actual host converts HTML term spans to buttons');
  assert.ok(doc.querySelector('mfrac.rt-term'),'the authored choices include interactive native fractions');
  assert.equal(w.getComputedStyle(host.querySelector('button.rt-term')).display,'inline','HTML controls keep their inline reset');
  assert.equal(w.getComputedStyle(doc.querySelector('span.rt-calculation')).display,'inline','HTML calculation wrappers keep their inline reset');
  const violations=mathLayoutOverrides(doc);
  assert.equal(violations.length,0,JSON.stringify(violations.slice(0,8),null,2));
 }finally{audit.w.STMMechanicsHost?.disposeQuestion();audit.dom.window.close();}
});

for(const profile of ['game','practice'])test('math display: all 120 '+profile+' questions render English/BM prompts, choices, support and working as native MathML',{skip:!JSDOM},async t=>{
 const audit=await createAuditDom({JSDOM,profile});
 try{
  const {doc,w,M,surfaces,counts}=audit;
  assert.equal(counts.questions,240);assert.equal(counts.visuals,480);
  assert.ok(counts.mfrac>100&&counts.setGroups>100&&counts.msup>0,JSON.stringify(counts));
  assert.ok(counts.termWrappers>0&&counts.calculationWrappers>0,'Exercise HTML term and calculation wrappers containing MathML');
  assert.ok(doc.querySelector('span.rt-calculation math'),'Calculation wrappers contain authored native equations');
  for(const surface of surfaces){
   const actual=[...surface.body.querySelectorAll('math')],where=surface.questionId+'/'+surface.lang+'/'+surface.key;
   assert.equal(actual.length,surface.inputs.length,where+' equations');
   for(let i=0;i<actual.length;i++){
    const expected=new w.DOMParser().parseFromString(surface.inputs[i],'application/xml').documentElement;
    assert.deepEqual(mathShape(actual[i]),mathShape(expected),where+' MathML structure '+i);
    for(const node of [actual[i],...actual[i].querySelectorAll('*')]){
     assert.equal(node.namespaceURI,MATH_NS,where+' '+node.localName+' namespace');
     if(['mfrac','msup'].includes(node.localName))assert.equal(node.children.length,2,where+' '+node.localName+' operands');
    }
   }
  }
  const violations=mathLayoutOverrides(doc);
  assert.equal(violations.length,0,JSON.stringify(violations.slice(0,8),null,2));
  assert.equal(JSON.stringify(M.bank),audit.bankBefore,'Rendering/localization cannot modify canonical question IDs, content, choices or answers');
  t.diagnostic(JSON.stringify({profile,...counts,authorLayoutOverrides:violations.length}));
 }finally{audit.dom.window.close();}
});
