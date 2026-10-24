/** Read-only UI localization. Keys, model values, input and equations are never translated. */
export function createGameLanguageService(data,environment=globalThis){
 const normalize=value=>/^(?:bm|ms)(?:-|$)/i.test(String(value))?'ms':'en';
 const originals=new WeakMap(),attributes=new WeakMap(),documents=new WeakMap(),properNames=new Set(data.protectedTerms.map(x=>x.toLocaleLowerCase()));
 const dictionary=data.strings,folded=new Map(Object.keys(dictionary).map(k=>[k.toLocaleLowerCase(),k]));
 const patterns=data.templates.map(t=>({...t,regex:new RegExp(t.pattern,t.flags||'i')}));
 const skip='script,style,math,svg,textarea,input,code,pre,[contenteditable="true"],[data-no-translate],[data-q-rich],[data-tutorial-rich],[data-richtext-scope="question-bank"]';
 const skipRoot='script,style,textarea,code,pre,[contenteditable="true"],[data-no-translate]';
 const attributeNames=['aria-label','aria-valuetext','title','placeholder','alt','data-tooltip'];
 const attributeSelector=attributeNames.map(a=>'['+a+']').join(',');
 const unknown=new Set();let stopped=false;
 function language(){
  if(environment.DCQuestionLanguage?.language)return normalize(environment.DCQuestionLanguage.language());
  // The loading shell runs before the question module; reuse its preference.
  try{return normalize(environment.localStorage?.getItem(data.preferenceKey)||'en');}catch{return 'en';}
 }
 function rememberNames(){
  const C=environment.DCConfig,A=environment.DCArtifactData;
  for(const x of [C?.MC?.name,C?.MC?.title,...(C?.stages||[]).flatMap(s=>[s.name]),...Object.values(C?.enemies||{}).flatMap(e=>[e.name,e.title]),...(A?.artifacts||[]).map(a=>a.name)].filter(Boolean))properNames.add(String(x).toLocaleLowerCase());
 }
 function exempt(text){return !/[a-zA-Z]{2}/.test(text)||properNames.has(text.toLocaleLowerCase())||/^(?:PROB|SET|LOGIC)-\d{3}$|^v?\d+(?:\.\d+)+(?:[-+][\w.]+)?$|^https?:\/\/|^[\w.-]+\.(?:json|csv|png|webp|mp3|html)$/i.test(text);}
 function translate(text,lang='ms',depth=0){
  if(typeof text!=='string'||normalize(lang)!=='ms'||!text.trim())return text;
  const value=text.trim();if(exempt(value))return text;
  let result=dictionary[value];
  const artifactId=data.artifactAliases?.[value],artifact=environment.DCRichTextData?.artifacts?.[artifactId];
  if(artifact){const parts=artifactParts(artifactId,artifact.segments.map(s=>s.text).join(''),'ms');if(parts)result=parts.map(s=>s.text).join('');}
  if(result===undefined){const existing=environment.DCQuestionLanguage?.interfaceText?.(value,'ms');if(existing&&existing!==value)result=existing;}
  if(result===undefined){const key=folded.get(value.toLocaleLowerCase());if(key!==undefined){result=dictionary[key];if(value===value.toUpperCase())result=result.toLocaleUpperCase('ms');}}
  if(result===undefined&&depth<4){
   for(const t of patterns){const match=t.regex.exec(value);if(!match)continue;result=t.ms.replace(/\$(\d+)/g,(_,number)=>{const i=Number(number),raw=match[i]||'';return t.translateGroups?.includes(i)?translate(raw,'ms',depth+1):raw;});break;}
   if(result===undefined&&/\s·\s/.test(value)){const pieces=value.split(/(\s·\s)/);const next=pieces.map((p,i)=>i%2?p:translate(p,'ms',depth+1));if(next.some((p,i)=>p!==pieces[i]))result=next.join('');}
   if(result===undefined&&/;\s/.test(value)){const pieces=value.split(/(;\s*)/);const next=pieces.map((p,i)=>i%2?p:translate(p,'ms',depth+1));if(next.some((p,i)=>p!==pieces[i]))result=next.join('');}
   if(result===undefined&&/\.\s/.test(value)){const pieces=value.split(/((?<=\.)\s+)/);const next=pieces.map((p,i)=>i%2?p:translate(p,'ms',depth+1));if(next.some((p,i)=>p!==pieces[i]))result=next.join('');}
   if(result===undefined){const pair=value.match(/^([^:]+): (.+)$/);if(pair){const label=translate(pair[1],'ms',depth+1),body=translate(pair[2],'ms',depth+1);if(label!==pair[1]||body!==pair[2])result=label+': '+body;}}
   if(result===undefined&&value.endsWith('.')&&!value.endsWith('...')){const body=translate(value.slice(0,-1),'ms',depth+1);if(body!==value.slice(0,-1))result=body+'.';}
  }
  if(result===undefined){if(unknown.size<2000&&depth===0&&value.length<800&&!/^[\w_:/.-]+$/.test(value))unknown.add(value);return text;}
  return text.slice(0,text.indexOf(value))+result+text.slice(text.indexOf(value)+value.length);
 }
 function translatedText(node,lang){
  const old=originals.get(node);
  if(lang==='en'){if(old&&node.data===old.ms)node.data=old.en;return;}
  const en=old&&node.data===old.ms?old.en:node.data,ms=translate(en,'ms');
  if(ms!==en){originals.set(node,{en,ms});if(node.data!==ms)node.data=ms;}
 }
 function termLabel(id,fallback){return language()==='ms'?(data.termLabels[id]||fallback):fallback;}
 function gameTerms(text){
  if(typeof text!=='string')return text;
  const names=(environment.STMCardData?.cards||[]).map(c=>c.display_name.bm),known=new Set(names),escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const aliases={...data.gameTermAliases,...data.ordinaryTerms},words=[...names,...Object.keys(aliases)].sort((a,b)=>b.length-a.length);
  return words.length?text.replace(new RegExp('\\b('+words.map(escape).join('|')+')\\b','g'),word=>known.has(word)?word:aliases[word]):text;
 }
 function artifactParts(id,plain,lang=language()){
  if(normalize(lang)!=='ms')return null;
  const base=data.artifactTemplates?.[id];if(!base)return null;
  const numbers=String(plain).match(/(?<![A-Za-z0-9])\d+(?:\.\d+)?/g)||[];
  const spec=[base,...(base.variants||[])].find(s=>s.numbers===numbers.length);if(!spec)return null;
  const parts=[];let offset=0;
  for(const match of spec.text.matchAll(/\[\[(\w+)\]\]|\{(\d+)\}/g)){
   if(match.index>offset)parts.push({text:spec.text.slice(offset,match.index)});
   if(match[1])parts.push({term:match[1],text:data.termLabels[match[1]]||match[1]});
   else parts.push({text:numbers[Number(match[2])]});
   offset=match.index+match[0].length;
  }
  if(offset<spec.text.length)parts.push({text:spec.text.slice(offset)});
  return parts;
 }
 function apply(root,lang=language()){
  if(!root)return;lang=normalize(lang);rememberNames();
  const doc=root.ownerDocument||root;
  const scope=node=>normalize((node.nodeType===1?node:node.parentElement)?.closest('[data-language-scope]')?.getAttribute('lang')||lang);
  if(root.nodeType===3){if(!root.parentElement?.closest(skip))translatedText(root,scope(root));return;}
  if(root.nodeType===1&&root.closest(skipRoot))return;
  const walker=doc.createTreeWalker(root,4);let node;
  while((node=walker.nextNode()))if(!node.parentElement?.closest(skip))translatedText(node,scope(node));
  const selector=attributeSelector;
  const list=[...(root.nodeType===1&&root.matches(selector)?[root]:[]),...root.querySelectorAll(selector)];
  for(const el of list){if(el.closest('script,style,textarea,[contenteditable="true"],[data-no-translate]'))continue;
   let stored=attributes.get(el);if(!stored){stored={};attributes.set(el,stored);}
   for(const name of attributeNames){if(!el.hasAttribute(name))continue;const value=el.getAttribute(name),old=stored[name];
    if(scope(el)==='en'){if(old&&value===old.ms)el.setAttribute(name,old.en);continue;}
    const en=old&&value===old.ms?old.en:value,ms=translate(en,'ms');if(ms!==en){stored[name]={en,ms};if(value!==ms)el.setAttribute(name,ms);}
   }
  }
 }
 function refresh(doc=environment.document){
  if(!doc?.body)return;documents.get(doc)?.drain();const lang=language();doc.documentElement.lang=lang;apply(doc.body,lang);
  // The page title is presentation; the project brand itself remains unchanged.
  if(doc.querySelector('title')?.firstChild)translatedText(doc.querySelector('title').firstChild,lang);
 }
 function install(doc=environment.document){
  if(!doc?.body||documents.has(doc))return documents.get(doc);
  const win=doc.defaultView||environment,roots=new Set();let scheduled=false,disconnected=false;
  function flush(){scheduled=false;if(disconnected||stopped)return;const nodes=[...roots];roots.clear();const lang=language();for(const n of nodes)if(n.isConnected&&!nodes.some(p=>p!==n&&p.contains?.(n)))apply(n,lang);}
  function queue(root){if(!root||!root.isConnected||root.nodeType===1&&root.closest(skipRoot))return;roots.add(root);if(roots.size>64){roots.clear();roots.add(doc.body);}if(!scheduled){scheduled=true;(win.queueMicrotask||((fn)=>Promise.resolve().then(fn)))(flush);}}
  const observer=new win.MutationObserver(records=>{for(const record of records){
   if(record.type==='characterData')queue(record.target);
   else if(record.type==='attributes')queue(record.target);
   else for(const node of record.addedNodes)if(node.nodeType===3||node.nodeType===1&&(node.textContent?.trim()||attributeNames.some(name=>/[a-zA-Z]{2}/.test(node.getAttribute(name)||''))||node.childElementCount&&node.querySelector(attributeSelector)))queue(node);
  }});
  observer.observe(doc.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attributeNames});
  const storage=event=>{if(event.key===(environment.DCQuestionLanguage?.key||data.preferenceKey))refresh(doc);};win.addEventListener('storage',storage);
  const controller={flush,drain(){observer.takeRecords();roots.clear();},refresh:()=>refresh(doc),destroy(){disconnected=true;observer.disconnect();win.removeEventListener('storage',storage);documents.delete(doc);}};documents.set(doc,controller);refresh(doc);return controller;
 }
 return {data,normalize,translate,apply,install,refresh,language,exempt,termLabel,gameTerms,artifactParts,untranslated:()=>[...unknown],clearAudit:()=>unknown.clear(),stop:()=>{stopped=true;}};
}
