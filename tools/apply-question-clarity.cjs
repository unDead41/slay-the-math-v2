/* Apply a reviewed editorial pass once. Normal builds read the canonical bank;
 * they never overwrite later author edits by replaying this historical audit. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),source=path.join(root,'modules/mechanics/source/QUESTION_BANK');
const file=path.join(source,'question-bank-form4-120.json'),bank=JSON.parse(fs.readFileSync(file,'utf8'));
const glossary=JSON.parse(fs.readFileSync(path.join(source,'rich_text/glossary.json'),'utf8')).entries;
const clone=x=>JSON.parse(JSON.stringify(x)),plain=runs=>(runs||[]).map(x=>x.text).join('');
const xml=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const word=c=>!!c&&/[\p{L}\p{N}_]/u.test(c);
const mathAnchors=new Map();
function walk(value){if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object'){if(value.math?.mathml&&value.text)mathAnchors.set(value.text,clone(value.math));Object.values(value).forEach(walk);}}
bank.questions.forEach(walk);
const symbols={'∪':'union','∩':'intersection','∈':'membership','∉':'not-a-member','∅':'empty-set','¬':'negation','→':'implication','↔':'equivalence'};
function mathML(text){
 const tokens=text.match(/\d+(?:\.\d+)?|[A-Za-z]+|[^\s]/g)||[];let i=0;
 const op=t=>'<mo'+(glossary['qb:'+symbols[t]]?' data-term-id="'+symbols[t]+'"':'')+'>'+xml(t)+'</mo>';
 function group(end){const nodes=[];while(i<tokens.length&&tokens[i]!==end){if(tokens[i]==='/'){i++;const numerator=nodes.pop()||'<mn>1</mn>';nodes.push('<mfrac>'+numerator+atom()+'</mfrac>');}else nodes.push(atom());}return '<mrow>'+nodes.join('')+'</mrow>';}
 function atom(){const t=tokens[i++];if(t===undefined)return '<mrow/>';
  if(['(','[','{'].includes(t)){const end={'(':')','[':']','{':'}'}[t],body=group(end);if(tokens[i]===end)i++;return '<mrow>'+op(t)+body+op(end)+'</mrow>';}
  if(/^[0-9]/.test(t))return '<mn>'+t+'</mn>';
  if(/^[A-Za-z]+$/.test(t)){let node='<mi>'+t+'</mi>';if(['n','P'].includes(t)&&tokens[i]==='(')node='<mrow>'+node+atom()+'</mrow>';return node;}
  return op(t);
 }
 return '<math xmlns="http://www.w3.org/1998/Math/MathML">'+group('')+'</math>';
}
function rich(text){
 const matches=[];
 function add(needle,segment,priority){if(!needle||!text.includes(needle))return;let from=0,index;while((index=text.indexOf(needle,from))!==-1){const end=index+needle.length;from=end;if(word(needle[0])&&word(text[index-1])||word(needle.at(-1))&&word(text[end]))continue;matches.push({index,end,segment:{...clone(segment),text:needle},priority});}}
 for(const [needle,math]of mathAnchors)add(needle,{type:'math',math},3);
 const patterns=[/\{[^{}\n]+\}/g,/[nP]\([A-Z][A-Z∩∪′'()\s]*\)(?:\s*\/\s*[nP]\([A-Z][A-Z∩∪′'()\s]*\))?/g,/[A-Z](?:′|')?(?:\s*[∩∪]\s*[A-Z](?:′|')?)+/g,/\b[A-Z]\s*[<>≤≥=]\s*\d+\b/g,/\b(?:\d+(?:\s*\/\s*\d+)?)(?:\s*[×÷+−=]\s*\d+(?:\s*\/\s*\d+)?)+\b/g,/\b\d+\s*\/\s*\d+\b/g];
 for(const pattern of patterns)for(const m of text.matchAll(pattern)){const needle=m[0];add(needle,{type:'math',math:{latex:needle,mathml:mathML(needle),plain:needle}},2);}
 for(const [id,entry]of Object.entries(glossary))for(const alias of entry.aliases||[]){if(alias.length<2)continue;const lower=text.toLocaleLowerCase('en'),needle=alias.toLocaleLowerCase('en');let from=0,index;while((index=lower.indexOf(needle,from))!==-1){const end=index+alias.length;from=end;if(word(alias[0])&&word(text[index-1])||word(alias.at(-1))&&word(text[end]))continue;matches.push({index,end,priority:1,segment:{type:'term',text:text.slice(index,end),category:entry.category,glossary_id:id}});}}
 matches.sort((a,b)=>a.index-b.index||b.priority-a.priority||(b.end-b.index)-(a.end-a.index));let offset=0;const runs=[];
 for(const m of matches){if(m.index<offset)continue;if(m.index>offset)runs.push({type:'text',text:text.slice(offset,m.index)});runs.push(m.segment);offset=m.end;}
 if(offset<text.length)runs.push({type:'text',text:text.slice(offset)});if(!runs.length)runs.push({type:'text',text});assert.equal(plain(runs),text);return runs;
}
const originalBindings=JSON.stringify(bank.questions.map(q=>[q.id,q.seed,q.prompt,q.choices,q.correctChoiceId,q.verification,q.learning.workedSteps,q.learning.visual.solution]));
const counts={items:0,hintsChanged:0,moreHintsChanged:0,references:0};
for(const topic of ['PROB','SET','LOGIC']){
 const review=JSON.parse(fs.readFileSync(path.join(root,'docs/verification/question-clarity-'+topic+'.json'),'utf8'));
 const localeFile=path.join(source,'localization',topic.toLowerCase()+'.ms.json'),locale=JSON.parse(fs.readFileSync(localeFile,'utf8'));
 const strings=locale.strings,seen=new Set();
 function translate(en,ms){assert.equal(typeof en,'string');assert.equal(typeof ms,'string');strings[en]=ms;}
 for(const item of review.items){const q=bank.questions.find(q=>q.id===item.id);assert.ok(q&&q.topicCode===topic);assert.ok(!seen.has(q.id));seen.add(q.id);counts.items++;
  assert.ok(item.checks.preservesMeaning&&item.checks.moreHintAddsSpecificStep&&item.checks.noFinalAnswerDisclosure);
  for(const field of ['hint','moreHint']){const en=item.english[field],ms=item.malay[field];assert.ok(en.trim()&&ms.trim());translate(en,ms);if(q[field]!==en){counts[field==='hint'?'hintsChanged':'moreHintsChanged']++;q[field]=en;q.themedRichText[field]=rich(en);q.richText[field]=q.themedRichText[field].map(s=>({text:s.text,...(s.type==='term'?{termId:s.glossary_id.replace(/^qb:/,'')}:{})}));q.mathText[field]=q.themedRichText[field].map(s=>({text:s.text,...(s.math?{math:s.math}:{})}));}}
  assert.equal(item.english.hintSteps.map(s=>s.text).join(' '),q.hint);
  assert.equal(item.malay.hintSteps.map(s=>s.text).join(' '),item.malay.hint);
  for(let i=0;i<item.english.hintSteps.length;i++){const step=item.english.hintSteps[i],ms=item.malay.hintSteps[i];assert.equal(step.id,ms.id);translate(step.text,ms.text);const old=q.hintSteps.find(s=>s.id===step.id);assert.ok(old);if(old.text!==step.text){old.text=step.text;q.themedRichText.hintSteps[step.id]=rich(step.text);q.richText.hintSteps[step.id]=q.themedRichText.hintSteps[step.id].map(s=>({text:s.text,...(s.type==='term'?{termId:s.glossary_id.replace(/^qb:/,'')}:{})}));q.mathText.hintSteps[step.id]=q.themedRichText.hintSteps[step.id].map(s=>({text:s.text,...(s.math?{math:s.math}:{})}));}}
  if(item.hintReference){const ref=item.hintReference;for(const field of ['title','caption'])translate(ref[field].en,ref[field].ms);ref.headers.en.forEach((t,i)=>translate(t,ref.headers.ms[i]));ref.rows.en.forEach((row,r)=>row.forEach((t,c)=>translate(t,ref.rows.ms[r][c])));
   q.learning.visual.hint={id:q.learning.visual.hint.id,kind:'table',reviewedReference:true,reference:true,title:ref.title.en,headers:ref.headers.en,headerRichText:ref.headers.en.map(rich),rows:ref.rows.en,rowRichText:ref.rows.en.map(row=>row.map(rich)),caption:ref.caption.en,captionRichText:rich(ref.caption.en)};counts.references++;
  }
 }
 assert.equal(seen.size,40);
 locale.sourceReview.clarityRevision='clarity-2026-10-24.1';fs.writeFileSync(localeFile,JSON.stringify(locale,null,2)+'\n');
}
assert.equal(counts.items,120);assert.equal(JSON.stringify(bank.questions.map(q=>[q.id,q.seed,q.prompt,q.choices,q.correctChoiceId,q.verification,q.learning.workedSteps,q.learning.visual.solution])),originalBindings,'Question facts/keys/full solutions must stay unchanged');
bank.contentRevision='clarity-2026-10-24.1';fs.writeFileSync(file,JSON.stringify(bank,null,2)+'\n');console.log(JSON.stringify(counts));
