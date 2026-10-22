'use strict';
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const project=path.resolve(__dirname,'../..'),source=path.join(project,'modules/mechanics/source');
const read=name=>fs.readFileSync(path.join(project,name),'utf8');
const json=name=>JSON.parse(fs.readFileSync(path.join(source,name),'utf8'));
const MATH_NS='http://www.w3.org/1998/Math/MathML';

async function loadSource(){
 const base=pathToFileURL(source+'/').href;
 const [renderer,visual,localization,session,support]=await Promise.all([
  import(base+'QUESTION_BANK/rich_text/renderer.mjs'),
  import(base+'QUESTION_BANK/learning/visual-renderer.mjs'),
  import(base+'QUESTION_BANK/localization/runtime.mjs'),
  import(base+'QUESTION_BANK/learning/session.mjs'),
  import(base+'QUESTION_BANK/learning/support-visual.mjs'),
 ]);
 const bank=json('QUESTION_BANK/question-bank-form4-120.json'),glossary=json('QUESTION_BANK/rich_text/glossary.json');
 const language=localization.createQuestionLanguageService({
  topics:Object.fromEntries(['PROB','SET','LOGIC'].map(id=>[id,json('QUESTION_BANK/localization/'+id.toLowerCase()+'.ms.json')])),
  support:json('QUESTION_BANK/localization/support.ms.json'),ui:json('QUESTION_BANK/localization/interface.ms.json'),
  termCategories:Object.fromEntries(Object.entries(glossary.entries).map(([id,e])=>[id,e.category])),
 });
 return {...renderer,...visual,...support,session,language,bank,glossary};
}

function styles(profile='game'){
 const files=profile==='practice'?[
  'modules/mechanics/source/STM_SHARED/rich-text.css',
  'modules/mechanics/source/QUESTION_BANK/learning/learning.css',
  'modules/mechanics/source/QUESTION_BANK/learning/preview.css',
 ]:[
  'dist/style.css','dist/dungeon.css','dist/education.css','dist/mystery.css','dist/rich-text.css',
  'modules/mechanics/source/STM_SHARED/rich-text.css',
  'modules/mechanics/source/QUESTION_BANK/rich_text/renderer.css',
  'modules/mechanics/source/QUESTION_BANK/learning/learning.css',
  'modules/mechanics/source/ARTIFACT/runtime/artifact-ui.css','dist/mechanics-host.css',
 ];
 return files.map(file=>({file,css:read(file)}));
}

function questionSurfaces(q){
 const rich=q.themedRichText,h=q.harmonization;
 return [
  ['prompt',rich.prompt],...q.choices.map(c=>['choice:'+c.id,rich.choices[c.id]]),
  ['hint',rich.hint],...q.hintSteps.map(s=>['hint:'+s.id,rich.hintSteps[s.id]]),
  ['moreHint',rich.moreHint],['explanation',rich.explanation],
  ...q.learning.workedSteps.map(s=>['step:'+s.id,s.richText]),
  ...Object.entries(q.learning.optionFeedback).map(([id,f])=>['feedback:'+id,f.richText]),
  ['context',h.contextRichText],...h.givenRichText.map((runs,i)=>['given:'+i,runs]),['asked',h.askedRichText],
 ];
}

function mathInputs(runs){
 return (runs||[]).flatMap(s=>s.math?[s.math.mathml]:(s.mathText||[]).flatMap(p=>p.math?[p.math.mathml]:[]));
}

function visualRuns(visual){
 return [...(visual.headerRichText||[]),...(visual.rowRichText||[]).flat(),...(visual.nodeRichText||[]),
  ...(visual.groups||[]).map(g=>g.labelRichText),visual.captionRichText].filter(Boolean).flat();
}

function mathShape(node){
 if(node.nodeType===3)return node.data;
 return [node.namespaceURI,node.localName,node.getAttribute('mathvariant'),...Array.from(node.childNodes,mathShape)];
}

async function createAuditDom({JSDOM,profile='game',ids=null,languages=['en','ms']}={}){
 const M=await loadSource(),dom=new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>',{url:'https://math-display.example/',runScripts:'outside-only'});
 const w=dom.window,doc=w.document,previous={document:globalThis.document,DOMParser:globalThis.DOMParser};
 globalThis.document=doc;globalThis.DOMParser=w.DOMParser;
 const surfaces=[],counts={questions:0,surfaces:0,visuals:0,math:0,mfrac:0,msup:0,setGroups:0,termWrappers:0,calculationWrappers:0};
 try{
  for(const {file,css} of styles(profile)){const style=doc.createElement('style');style.dataset.file=file;style.textContent=css;doc.head.append(style);}
  const main=doc.createElement('main');main.id=profile==='practice'?'preview':'game';main.dataset.stmRichtext='';main.dataset.theme='dark';doc.body.append(main);
  const bankBefore=JSON.stringify(M.bank);
  for(const lang of languages)for(const original of M.bank.questions.filter(q=>!ids||ids.includes(q.id))){
   const q=M.language.question(original,lang),article=doc.createElement('article');article.className='education-question math-audit-question';article.dataset.questionId=q.id;article.lang=lang;article.dataset.stmRichtext='';
   article.innerHTML='<h2>'+q.id+' · '+lang+'</h2>';main.append(article);counts.questions++;
   for(const [key,runs] of questionSurfaces(q)){
    const section=doc.createElement('section');section.className=key.startsWith('choice:')?'education-answer-copy':'math-audit-surface';section.dataset.surface=key;
    const heading=doc.createElement('h3');heading.textContent=key;const body=doc.createElement('div');body.dataset.qRich=key;section.append(heading,body);article.append(section);
    M.renderRichText(body,runs,{glossary:M.glossary,allowCalculations:true});
    surfaces.push({questionId:q.id,lang,key,body,inputs:mathInputs(runs)});counts.surfaces++;
   }
   for(const [key,visual] of [['hint-visual',M.selectSupportVisual(q)],['solution-visual',q.learning.visual.solution]]){
    const body=doc.createElement('figure');body.className='learning-visual';body.dataset.surface=key;article.append(body);
    M.renderVisual(body,visual,{glossary:M.glossary,allowCalculations:key==='solution-visual'});
    surfaces.push({questionId:q.id,lang,key,body,inputs:mathInputs(visualRuns(visual))});counts.visuals++;
   }
  }
  counts.math=doc.querySelectorAll('math').length;counts.mfrac=doc.querySelectorAll('math mfrac').length;
  counts.msup=doc.querySelectorAll('math msup').length;counts.setGroups=doc.querySelectorAll('math mrow[data-glossary-id="qb:set"]').length;
  counts.termWrappers=doc.querySelectorAll('span.rt-term').length;counts.calculationWrappers=doc.querySelectorAll('span.rt-calculation').length;
  return {dom,w,doc,M,surfaces,counts,bankBefore};
 }catch(error){dom.window.close();throw error;}
 finally{globalThis.document=previous.document;globalThis.DOMParser=previous.DOMParser;}
}

// Audit selectors against real rendered native nodes. jsdom has no MathML
// geometry, so this reports the author CSS that could replace native layout.
function mathLayoutOverrides(doc){
 const violations=[];
 function visit(rules,file){
  for(const rule of rules){
   if(rule.cssRules){visit(rule.cssRules,file);continue;}
   if(!rule.selectorText||!rule.style?.getPropertyValue('display'))continue;
   const display=rule.style.getPropertyValue('display').trim();if(['math','inline math','block math'].includes(display))continue;
   for(const node of doc.querySelectorAll(rule.selectorText))if(node.namespaceURI===MATH_NS){
    const q=node.closest('[data-question-id]');
    violations.push({file,selector:rule.selectorText,display,tag:node.localName,questionId:q?.dataset.questionId,language:q?.lang,surface:node.closest('[data-surface]')?.dataset.surface,text:node.textContent.slice(0,80)});
   }
  }
 }
 for(const style of doc.querySelectorAll('style'))if(style.sheet)visit(style.sheet.cssRules,style.dataset.file||'inline');
 return violations;
}

module.exports={MATH_NS,createAuditDom,loadSource,styles,questionSurfaces,mathInputs,mathShape,mathLayoutOverrides};
