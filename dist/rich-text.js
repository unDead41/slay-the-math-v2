(function(root){
 'use strict';
 const D=typeof module!=='undefined'?require('./rich-text-data.js'):root.DCRichTextData;
 const A=typeof module!=='undefined'?require('./artifact-data.js'):root.DCArtifactData;
 const shared=(typeof module!=='undefined'?require('./mechanics.js'):root.STMMechanics).shared;
 const ids=new Set(A.artifacts.map(a=>a.id)),units=new Set(['HP','Max HP','Block','Energy','Focus','cards','Gold','damage','Strength','Agility','d6']);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const integer=n=>Number.isSafeInteger(n)&&n>=0;
 const text=(s,max)=>typeof s==='string'&&s.length>0&&s.length<=max;
 function delta(label,unit,before,after,lines){return {label,unit,kind:'delta',value:after-before,before,after,lines};}
 function total(label,unit,value,lines){return {label,unit,kind:'total',value,before:value,after:value,lines};}
 function healing(requested,before,after,max){return delta('HP restored','HP',before,after,[
  'Requested healing: +'+requested+' HP','Room below Max HP: '+max+' − '+before+' = '+(max-before)+' HP',
  'Actual healing: min('+requested+', '+(max-before)+') = '+(after-before)+' HP',
  'HP after: '+before+' + '+(after-before)+' = '+after+' HP'
 ]);}
 function record(r,label,artifactIds,results){
  if(!results.length)return;
  const s=r.calculationState||(r.calculationState={version:1,nextId:0,entries:[]});
  const entry={id:++s.nextId,label,artifactIds:[...new Set(artifactIds)],stage:r.stage,depth:r.depth,turn:r.battle?.turn||0,results};
  s.entries.unshift(entry);s.entries.length=Math.min(s.entries.length,64);return entry;
 }
 const entries=r=>r.calculationState?.entries||[];
 const latest=(r,id)=>entries(r).find(e=>e.artifactIds.includes(id));
 function valid(r){
  const s=r.calculationState;if(s===undefined)return true;
  return !!s&&s.version===1&&integer(s.nextId)&&Array.isArray(s.entries)&&s.entries.length<=64&&
   s.entries.every((e,i)=>e&&integer(e.id)&&e.id>0&&e.id<=s.nextId&&(!i||e.id<s.entries[i-1].id)&&text(e.label,120)&&
    [0,1].includes(e.stage)&&integer(e.depth)&&e.depth<=9&&integer(e.turn)&&Array.isArray(e.artifactIds)&&e.artifactIds.length<=31&&new Set(e.artifactIds).size===e.artifactIds.length&&e.artifactIds.every(id=>ids.has(id))&&
    Array.isArray(e.results)&&e.results.length>0&&e.results.length<=4&&e.results.every(x=>x&&text(x.label,120)&&units.has(x.unit)&&['delta','total','price','roll'].includes(x.kind)&&Number.isSafeInteger(x.value)&&integer(x.before)&&integer(x.after)&&
     (x.kind==='delta'?x.value===x.after-x.before:x.value===x.after)&&Array.isArray(x.lines)&&x.lines.length>0&&x.lines.length<=12&&x.lines.every(line=>text(line,300))));
 }
 function term(id,label){
  const item=D.glossary[id];if(!item)return esc(label);
  return shared.termHTML('artifact',root.DCGameLanguage?.termLabel(id,label||item.label)||label||item.label,id).replace('data-richtext-kind=', 'data-rt-term="'+esc(id)+'" data-richtext-kind=');
 }
 function description(id){
  const item=D.artifacts[id];if(!item)return '';
  const localized=root.DCGameLanguage?.artifactParts(id,item.segments.map(s=>s.text).join(''));
  if(localized)return localized.map(s=>s.term?term(s.term,s.text):esc(s.text)).join('');
  return item.segments.map(s=>s.type==='term'?term(s.glossary_id,s.text):esc(s.text)).join('');
 }
 const unitIds={'HP':'hp','Max HP':'max_hp','Block':'block','Energy':'energy','Focus':'focus','Gold':'gold','damage':'damage','Strength':'strength','Agility':'agility','d6':'d6'};
 function resultHTML(result,source='Calculation',showLabel=true){
  const display=result.kind==='delta'?(result.value<0?'−'+Math.abs(result.value):'+'+result.value):String(result.value);
  const detail=esc(JSON.stringify({label:source+' · '+result.label,lines:result.lines}));
  const calculation=esc(JSON.stringify(shared.calculation({origin:'resolved',value:display,unit:result.unit,label:source+' · '+result.label,steps:result.lines,before:result.before})));
  return '<span class="rt-result">'+(showLabel?'<span class="rt-result-label">'+esc(result.label)+': </span>':'')+'<button type="button" class="rt-calculation" data-richtext-kind="calculation" data-richtext-scope="artifact" data-category="calculation" data-rt-calculation="'+calculation+'" data-rt-detail="'+detail+'" aria-label="'+esc(result.label+': '+display+' '+result.unit+'. Show calculation')+'">'+display+'</button> '+term(unitIds[result.unit],result.unit)+'</span>';
 }
 function eventHTML(entry){return '<article class="rt-event" data-stm-richtext><h3>'+esc(entry.label)+'</h3><p class="rt-context">Stage '+(entry.stage+1)+' · Room '+(entry.depth+1)+(entry.turn?' · Turn '+entry.turn:'')+'</p><div class="rt-results">'+entry.results.map(r=>resultHTML(r,entry.label)).join('')+'</div></article>';}
 function history(r){return '<p>Resolved results from this run. Select a purple number for its calculation, or a colored term for its meaning.</p><div class="rt-history">'+(entries(r).length?entries(r).map(eventHTML).join(''):'<p>No results yet. Calculations appear after effects resolve.</p>')+'</div>';}
 function glossary(){return '<details class="rt-glossary" data-stm-richtext><summary>Game & math glossary · 55 terms</summary><p>Green: game terms · Pink: math terms · Purple: resolved calculations</p><div>'+Object.entries(D.glossary).map(([id,item])=>'<p>'+term(id)+': '+esc(root.DCGameLanguage?.translate(item.definition,root.DCQuestionLanguage?.language())||item.definition)+'</p>').join('')+'</div></details>';}
 let controller=null;
 function bind(doc){controller?.destroy();controller=shared.attachTooltips(doc,{domain:'artifact',getLanguage:()=>root.DCQuestionLanguage?.language()||'en',getTheme:()=> 'dark'});}
 function dismiss(){controller?.close();}
 const api={data:D,delta,total,healing,record,entries,latest,valid,term,description,resultHTML,eventHTML,history,glossary,bind,hide:()=>dismiss()};
 if(typeof module!=='undefined')module.exports=api;else root.DCRichText=api;
})(typeof window!=='undefined'?window:globalThis);
