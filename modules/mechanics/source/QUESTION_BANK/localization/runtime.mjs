/** Display-only localization: question/choice identities and learning reducers stay canonical. */
export function createQuestionLanguageService(data){
 const key='slay-the-math.question-language.v1',copies=new WeakMap(),textOriginals=new WeakMap(),attributeOriginals=new WeakMap();
 const clone=value=>JSON.parse(JSON.stringify(value));
 const normalize=value=>/^(?:bm|ms)(?:-|$)/i.test(String(value))?'ms':'en';let volatileLanguage='en';
 function language(storage){try{const value=(storage||globalThis.localStorage).getItem(key);return ['en','ms'].includes(value)?normalize(value):volatileLanguage;}catch{return volatileLanguage;}}
 function setLanguage(value,storage){const lang=normalize(value);volatileLanguage=lang;try{(storage||globalThis.localStorage).setItem(key,lang);return {language:lang,saved:true};}catch{return {language:lang,saved:false};}}
 function t(text,lang='en',topic){if(lang!=='ms'||typeof text!=='string')return text;return data.topics?.[topic]?.strings?.[text]??data.support?.strings?.[text]??data.ui?.[text]??text;}
 const isWord=char=>!!char&&/[\p{L}\p{N}_]/u.test(char);
 function rich(text,original=[],lang='en'){
  if(lang!=='ms')return original;
  const anchors=[];
  for(const segment of original||[])if(segment.math&&['math','calculation'].includes(segment.type)&&segment.text)anchors.push({needle:segment.text,segment,math:true});
  for(const [id,label] of Object.entries(data.support?.termLabels||{}))for(const term of [label,...(data.support?.termAliases?.[id]||[])]){
   if(term.length>1&&data.termCategories[id])anchors.push({needle:term,segment:{type:'term',text:term,category:data.termCategories[id],glossary_id:id},math:false});
  }
  const matches=[];
  for(const anchor of anchors){
   let start=0,index;const hay=anchor.math?text:text.toLocaleLowerCase('ms'),needle=anchor.math?anchor.needle:anchor.needle.toLocaleLowerCase('ms');
   while((index=hay.indexOf(needle,start))!==-1){
    const end=index+needle.length;start=end;
    if(isWord(needle[0])&&isWord(text[index-1])||isWord(needle.at(-1))&&isWord(text[end]))continue;
    matches.push({index,end,...anchor});
   }
  }
  matches.sort((a,b)=>a.index-b.index||Number(b.math)-Number(a.math)||(b.end-b.index)-(a.end-a.index));
  const result=[];let offset=0;
  for(const match of matches){if(match.index<offset)continue;if(match.index>offset)result.push({type:'text',text:text.slice(offset,match.index)});const segment=clone(match.segment);segment.text=text.slice(match.index,match.end);result.push(segment);offset=match.end;}
  if(offset<text.length)result.push({type:'text',text:text.slice(offset)});
  return result.length?result:[{type:'text',text}];
 }
 const protectedKeys=new Set(['id','type','kind','topicId','topicCode','correctChoiceId','correctLabel','label','seed','curriculumStandards','verification','reviewStatus','contextKind','answerType','skillIds','foundationId','focusSkillId','choiceSourceText','alignment','changes','mathematicalCheck','validation','visibility','math','svg','sourceId','pdfPages','printedPages','standards']);
 function translatedTree(value,lang,topic){
  if(typeof value==='string')return t(value,lang,topic);
  if(Array.isArray(value))return value.map(x=>translatedTree(x,lang,topic));
  if(!value||typeof value!=='object')return value;
  return Object.fromEntries(Object.entries(value).map(([name,item])=>[name,protectedKeys.has(name)||/richtext|mathtext/i.test(name)?clone(item):translatedTree(item,lang,topic)]));
 }
 const xml=text=>text.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
 function visual(value,lang='en',topic){
  if(!value||lang!=='ms')return value;
  const localized=translatedTree(value,lang,topic);
  localized.title=t(value.title,lang,topic);localized.caption=t(value.caption,lang,topic);
  localized.captionRichText=rich(localized.caption||'',value.captionRichText,lang);
  if(value.headers)localized.headerRichText=localized.headers.map((text,i)=>rich(text,value.headerRichText?.[i],lang));
  if(value.rows)localized.rowRichText=localized.rows.map((row,r)=>row.map((cell,c)=>rich(typeof cell==='object'?cell.text:cell,value.rowRichText?.[r]?.[c],lang)));
  if(value.nodes)localized.nodeRichText=localized.nodes.map((text,i)=>rich(text,value.nodeRichText?.[i],lang));
  if(value.groups)localized.groups=localized.groups.map((group,i)=>({...group,label:t(value.groups[i].label,lang,topic),sourceLabel:value.groups[i].sourceLabel||value.groups[i].label,labelRichText:rich(t(value.groups[i].label,lang,topic),value.groups[i].labelRichText,lang)}));
  if(value.svg)localized.svg=value.svg.replace(/>([^<>]+)</g,(whole,text)=>{const next=t(text.trim(),lang,topic);return next===text.trim()?whole:'>'+xml(next)+'<';});
  localized.displayLanguage=lang;return localized;
 }
 function question(source,lang='en'){
  if(!source||lang!=='ms')return source;
  if(copies.has(source))return copies.get(source);
  const q=translatedTree(source,lang,source.topicCode),base=source.themedRichText;
  q.displayLanguage='ms';q.topic=t(source.topic,lang);q.difficulty=source.difficulty;
  q.themedRichText={prompt:rich(q.prompt,base.prompt,lang),hint:rich(q.hint,base.hint,lang),moreHint:rich(q.moreHint,base.moreHint,lang),explanation:rich(q.explanation,base.explanation,lang),
   choices:Object.fromEntries(q.choices.map((choice,i)=>[choice.id,rich(choice.text,base.choices[choice.id],lang)])),
   hintSteps:Object.fromEntries(q.hintSteps.map((step,i)=>[step.id,rich(step.text,base.hintSteps[step.id],lang)]))};
  for(const [id,feedback] of Object.entries(q.learning.optionFeedback))feedback.richText=rich(feedback.text,source.learning.optionFeedback[id].richText,lang);
  q.learning.workedSteps=q.learning.workedSteps.map((step,i)=>({...step,label:t(source.learning.workedSteps[i].label,lang,source.topicCode),richText:rich(step.text,source.learning.workedSteps[i].richText,lang)}));
  for(const kind of ['hint','solution'])q.learning.visual[kind]=visual(source.learning.visual[kind],lang,source.topicCode);
  const h=q.harmonization,old=source.harmonization;
  if(h){h.contextRichText=rich(h.contextNote||'',old.contextRichText,lang);h.askedRichText=rich(h.asked||'',old.askedRichText,lang);h.givenRichText=h.given.map((text,i)=>rich(text,old.givenRichText?.[i],lang));}
  copies.set(source,q);return q;
 }
 function foundation(source,lang='en'){
  if(lang!=='ms')return source;
  const m=translatedTree(source,lang);
  m.cards=m.cards.map((card,i)=>({...card,richText:rich(card.text,source.cards[i].richText,lang)}));
  m.checks=m.checks.map((check,i)=>({...check,richText:rich(check.prompt,source.checks[i].richText,lang),choiceRichText:check.choices.map((text,c)=>rich(text,source.checks[i].choiceRichText[c],lang)),feedbackRichText:check.feedback.map((text,c)=>rich(text,source.checks[i].feedbackRichText[c],lang))}));
  return m;
 }
 function interfaceText(text,lang){
  const direct=t(text,lang);if(direct!==text||lang!=='ms')return direct;
  const mathLabel=text.match(/^(.+) — (Variable|Fraction|Probability \/ P\(A\)|Intersection \/ ∩|Product \/ multiply)$/);
  if(mathLabel)return mathLabel[1]+' — '+t(mathLabel[2],lang);
  const patterns=[
   [/^(\d+) \/ (\d+) questions seen$/,(_,a,b)=>a+' / '+b+' soalan telah dilihat'],
   [/^Question (\d+) \/ (\d+)$/i,(_,a,b)=>'Soalan '+a+' / '+b],
   [/^(\d+) of (\d+) questions$/i,(_,a,b)=>a+' daripada '+b+' soalan'],
   [/^(\d+) questions$/i,(_,a)=>a+' soalan'],
   [/^(\d+) questions? (?:has|have) a comment$/i,(_,a)=>a+' soalan mempunyai komen'],
   [/^(\d+) \/ (\d+) finished$/i,(_,a,b)=>a+' / '+b+' selesai'],
   [/^(\d+) correct · (\d+) seen$/i,(_,a,b)=>a+' betul · '+b+' telah dilihat'],
   [/^(\d+) answers? checked$/i,(_,a)=>a+' jawapan telah disemak'],
   [/^Answer ([A-D]) · try this idea$/,(_,a)=>'Jawapan '+a+' · semak cadangan ini'],
   [/^Answer ([A-D]): $/,(_,a)=>'Jawapan '+a+': '],
   [/^Step (\d+)$/,(_,a)=>'Langkah '+a],
   [/^PDF (?:page|pages) (.+)$/,(_,a)=>'Halaman PDF '+a],
   [/^printed (?:page|pages) (.+)$/,(_,a)=>'halaman bercetak '+a],
   [/^Standards: (.+)$/,(_,a)=>'Standard: '+a],
   [/^Curriculum fit: (Core|Supporting|Enrichment)\. $/,(_,a)=>'Hubungan dengan kurikulum: '+t(a,lang)+'. '],
   [/^(\d+) questions? (?:has|have) a comment ready to share\. These comments will help improve the questions, hints, diagrams and worked steps\.$/,(_,a)=>a+' soalan mempunyai komen yang sedia dikongsi. Komen ini akan membantu menambah baik soalan, petunjuk, rajah dan langkah penyelesaian.'],
   [/^First try (\d+) · With help (\d+) · Retry (\d+)$/,(_,a,b,c)=>'Cubaan pertama '+a+' · Dengan bantuan '+b+' · Cuba semula '+c],
   [/^Not tried · (\d+) available$/,(_,a)=>'Belum dicuba · '+a+' tersedia'],
   [/^(\d+) \/ (\d+) correct · (\d+) \/ (\d+) seen$/,(_,a,b,c,d)=>a+' / '+b+' betul · '+c+' / '+d+' telah dilihat']
  ];
  for(const [pattern,replace] of patterns)if(pattern.test(text))return text.replace(pattern,replace);
  // Composite accessible labels contain canonical IDs and simple UI descriptors.
  if(/^(?:PROB|SET|LOGIC)-\d{3}[, ·]/.test(text))return text.replace(/Probability|Sets|Logic|Easy|Medium|Hard|not started|answer revealed|opened|correct/g,word=>t(word,lang));
  return text;
 }
 function applyInterface(root,lang){
  if(!root)return;
  const document=root.ownerDocument||root,walker=document.createTreeWalker(root,4),nodes=[];let node;
  while((node=walker.nextNode()))if(!node.parentElement?.closest('script,style,math,svg,textarea,[data-no-translate]'))nodes.push(node);
  for(const textNode of nodes){
   const old=textOriginals.get(textNode);
   if(lang==='en'){if(old&&textNode.data===old.ms)textNode.data=old.en;continue;}
   const en=old&&textNode.data===old.ms?old.en:textNode.data,next=interfaceText(en.trim(),'ms');
   if(next!==en.trim()){const ms=en.replace(en.trim(),next);textOriginals.set(textNode,{en,ms});if(textNode.data!==ms)textNode.data=ms;}
  }
  for(const element of root.querySelectorAll('[aria-label],[title],[placeholder]')){
   let originals=attributeOriginals.get(element);if(!originals){originals={};attributeOriginals.set(element,originals);}
   for(const name of ['aria-label','title','placeholder']){
    if(!element.hasAttribute(name))continue;const value=element.getAttribute(name),old=originals[name];
    if(lang==='en'){if(old&&value===old.ms)element.setAttribute(name,old.en);continue;}
    const en=old&&value===old.ms?old.en:value,ms=interfaceText(en,'ms');if(ms!==en){originals[name]={en,ms};element.setAttribute(name,ms);}
   }
  }
 }
 function control(id='question-language-select',lang=language()){
  const title=id==='settings-question-language-select'?(lang==='ms'?'Bahasa permainan':'Game language'):t('Question language',lang);
  return '<label class="question-language-control" for="'+id+'">'+title+' <select id="'+id+'"><option value="en" '+(lang==='en'?'selected':'')+'>English</option><option value="ms" '+(lang==='ms'?'selected':'')+'>Bahasa Melayu</option></select></label>';
 }
 function installGlossary(glossary){
  for(const [id,title] of Object.entries(data.support?.termLabels||{})){
   const entry=glossary.entries[id];if(!entry)continue;
   entry.teaching=entry.teaching||{title:entry.label,definition:{en:entry.definition,ms:entry.definition_ms||entry.definition}};
   entry.teaching.title_ms=title;
   const definition=data.support.termDefinitions?.[id];
   if(definition){entry.teaching.definition.ms=definition;if(entry.teaching.mathText)entry.teaching.mathText.definition.ms=[{text:definition}];}
  }
  return glossary;
 }
 return {data,key,language,setLanguage,t,rich,question,visual,foundation,applyInterface,interfaceText,control,installGlossary};
}
