import {sharedRichText} from '../../STM_SHARED/index.mjs';
/** Artifact rich text 1.1 reference renderer. No rewards or game state writes. */
const MATH_NS='http://www.w3.org/1998/Math/MathML';
const MATH_TAGS=new Set(['math','mrow','mi','mn','mo','mtext','mfrac','msup']);
const MATH_ATTRS=new Set(['mathvariant','data-term-id','data-glossary-id','data-category']);

export function selectQuestionView(question,state,{finalReview=false}={}) {
  const same=state?.questionId===question.id;
  const reveal=finalReview || (same && state.completed===true);
  const source=question.themedRichText;
  return {
    prompt:source.prompt,choices:source.choices,
    hintSteps:same && state.hintUsed ? source.hintSteps : null,
    moreHint:same && state.moreHintUnlocked ? source.moreHint : null,
    explanation:reveal ? source.explanation : null,
    answer:reveal ? {label:question.correctLabel,text:question.verification.expected} : null,
    allowCalculations:reveal,
  };
}

function target(node,kind,key,category) {
  node.setAttribute('class',kind==='calculation'?'rt-calculation':'rt-term');
  node.setAttribute('data-richtext-kind',kind);node.setAttribute('data-richtext-scope','question-bank');
  node.setAttribute(kind==='calculation'?'data-calculation-id':'data-glossary-id',key);
  node.setAttribute('data-category',category);
  node.setAttribute('role','button');node.setAttribute('tabindex','0');
}

function safeMath(xml,options={}) {return sharedRichText.renderMathML(xml,{...options,domain:'question-bank'});}

function readOnlyText(container,text) {
  container.append(document.createTextNode(text));
}

export function renderRichText(container,segments,{glossary,allowCalculations=false,calculationIndex=new Map()}={}) {
  container.replaceChildren();
  for(const seg of segments || []) {
    if(seg.type==='text') {readOnlyText(container,seg.text);continue;}
    if(seg.type==='term') {
      const entry=glossary.entries[seg.glossary_id];
      if(!entry || entry.category!==seg.category)throw new Error('Invalid term category');
      const el=document.createElement('span');target(el,'term',seg.glossary_id,entry.category);
      if(seg.mathText) {
        for(const part of seg.mathText) {
          if(part.math)el.append(safeMath(part.math.mathml,{interactive:false}));
          else readOnlyText(el,part.text);
        }
      } else readOnlyText(el,seg.text);
      container.append(el);continue;
    }
    if(seg.type==='math') {
      if(seg.presentation==='working'){
        if(!allowCalculations)throw new Error('Worked arithmetic requires a learning reveal');
        const math=safeMath(seg.math.mathml,{interactive:false});math.setAttribute('class','rt-equation');container.append(math);
      } else container.append(safeMath(seg.math.mathml,{glossary}));
      continue;
    }
    if(seg.type==='calculation') {
      if(!allowCalculations)throw new Error('Calculation requires answer reveal');
      const el=document.createElement('span');target(el,'calculation',seg.id,'calculation');
      el.append(safeMath(seg.math.mathml,{interactive:false}));
      el.setAttribute('aria-label',seg.result.value+' '+seg.result.unit+' — show calculation');
      calculationIndex.set(seg.id,seg);container.append(el);continue;
    }
    throw new Error('Unknown rich-text segment');
  }
  return calculationIndex;
}

export function attachRichTextTooltips(root,{glossary,calculationIndex=new Map(),getLanguage,getTheme}={}) {
  return sharedRichText.attachTooltips(root,{domain:'question-bank',glossary,calculationIndex,getLanguage,getTheme,manageTheme:typeof getTheme==='function'});
}
