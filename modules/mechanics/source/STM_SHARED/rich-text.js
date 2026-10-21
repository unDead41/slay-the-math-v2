(function(root,factory){
 'use strict';
 const registry=root.STMSharedGlossary;
 if(!registry)throw Error('Load STM_SHARED/registry.js before the shared rich-text service.');
 if(root.STMSharedRichText){
  if(root.STMSharedRichText.registryId!==registry.registryId||root.STMSharedRichText.version!=='1.0.0')throw Error('Mixed shared rich-text versions. Extract the matched category packages.');
 }else root.STMSharedRichText=factory(registry);
 if(typeof module==='object'&&module.exports)module.exports=root.STMSharedRichText;
})(globalThis,function(registry){
 'use strict';
 const MATH_NS='http://www.w3.org/1998/Math/MathML';
 const TAGS=new Set(['math','mrow','mi','mn','mo','mtext','mfrac','msup']);
 const ATTRS=new Set(['mathvariant','data-term-id','data-glossary-id','data-category']);
 const ORIGINS=new Set(['question-solution','resolved','preview','example']);
 const hubs=new WeakMap(),liveHubs=new Set();let sequence=0;
 const config={getLanguage:()=> 'en',getTheme:()=> 'dark'};
 function freeze(value){if(value&&typeof value==='object'){for(const item of Object.values(value))freeze(item);Object.freeze(value);}return value;}
 freeze(registry);
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function resolveTerm(domain,id){
  const key=registry.domains[domain]?.[id];
  if(!key)throw Error('Unknown rich-text term '+domain+':'+id);
  return registry.entries[key];
 }
 function assertDomain(domain,supplied){
  const expected=registry.sourceSignatures[domain],entries=supplied?.entries||supplied;
  if(!expected||!entries||Object.keys(entries).length!==Object.keys(expected).length)throw Error('Rich-text registry mismatch for '+domain+'. Use its matched presentation glossary.');
  for(const [id,signature] of Object.entries(expected))for(const field of ['label','definition','category'])if(entries[id]?.[field]!==signature[field])throw Error('Rich-text term drift at '+domain+':'+id+'. Reconcile the source before updating the shared registry.');
  return {domain,terms:Object.keys(expected).length,registryId:registry.registryId};
 }
 function describeTerm(domain,id,language='en'){
  const entry=resolveTerm(domain,id),lang=language==='ms'?'ms':'en';
  return {canonicalId:entry.id,category:entry.category,title:entry.label,
   definition:lang==='ms'?(entry.definition_ms||entry.definition):entry.definition,
   example:domain==='question-bank'?entry.example?.[lang]||entry.example?.en||null:null,
   labelParts:entry.mathText?.label,definitionParts:entry.mathText?.definition?.[lang],
   exampleParts:domain==='question-bank'?entry.mathText?.example?.[lang]||entry.mathText?.example?.en:null};
 }
 function decorateTerm(node,domain,id){
  const entry=resolveTerm(domain,id);
  node.setAttribute('class','rt-term');node.setAttribute('data-richtext-kind','term');
  node.setAttribute('data-richtext-scope',domain);node.setAttribute('data-glossary-id',id);
  node.setAttribute('data-category',entry.category);node.setAttribute('role','button');node.setAttribute('tabindex','0');
 }
 function termHTML(domain,text,id){
  const entry=resolveTerm(domain,id);
  return '<button type="button" class="rt-term" data-richtext-kind="term" data-richtext-scope="'+esc(domain)+'" data-glossary-id="'+esc(id)+'" data-category="'+entry.category+'">'+esc(text)+'</button>';
 }
 function renderMathML(xml,{interactive=true,domain='question-bank',document:doc=globalThis.document}={}){
  const Parser=doc?.defaultView?.DOMParser||globalThis.DOMParser;
  if(!doc||!Parser)throw Error('A DOM document is required to render MathML.');
  const parsed=new Parser().parseFromString(xml,'application/xml');
  if(parsed.querySelector('parsererror')||parsed.documentElement.localName!=='math')throw Error('Invalid MathML');
  function clone(source){
   if(source.nodeType===3)return doc.createTextNode(source.textContent);
   if(source.nodeType!==1||source.namespaceURI!==MATH_NS||!TAGS.has(source.localName))throw Error('Unsafe MathML element');
   const node=doc.createElementNS(MATH_NS,source.localName);
   for(const attr of source.attributes){
    if(attr.name==='xmlns')continue;
    if(!ATTRS.has(attr.name))throw Error('Unsafe MathML attribute');
    if(interactive&&attr.name!=='data-term-id'||attr.name==='mathvariant')node.setAttribute(attr.name,attr.value);
   }
   for(const child of source.childNodes)node.append(clone(child));
   return node;
  }
  const math=clone(parsed.documentElement);
  if(interactive)for(const node of math.querySelectorAll('[data-glossary-id]')){
   if(node.querySelector('[data-glossary-id]'))continue;
   const id=node.getAttribute('data-glossary-id'),entry=resolveTerm(domain,id);
   decorateTerm(node,domain,id);node.setAttribute('aria-label',node.textContent+' — '+entry.label);
  }
  return math;
 }
 function calculation(input){
  if(!input||!ORIGINS.has(input.origin))throw Error('A calculation requires an explicit supported origin.');
  if(typeof input.value!=='number'&&typeof input.value!=='string')throw Error('A calculation requires its resolved display value.');
  const value=String(input.value);
  if(!/^[+−-]?(?:\d+(?:\.\d+)?|\d+\/\d+)%?$/.test(value)||typeof input.value==='number'&&!Number.isFinite(input.value))throw Error('A calculation display value must be finite and numeric.');
  if(typeof input.unit!=='string'||!Array.isArray(input.steps)||!input.steps.every(s=>typeof s==='string'))throw Error('A calculation requires an explicit unit and text steps.');
  if(!input.steps.length)throw Error('A calculation requires source working; do not invent it from a final number.');
  return {origin:input.origin,value,unit:input.unit,label:input.label||'Calculation',steps:[...input.steps],
   sources:Array.isArray(input.sources)?input.sources.filter(s=>typeof s==='string'):[],mathSteps:input.mathSteps||null,
   before:input.before??null,rounding:input.rounding||null,caps:input.caps||null};
 }
 function questionCalculation(token){
  if(!token?.tooltip||!token?.result)throw Error('Question calculation is missing authored working.');
  return calculation({origin:'question-solution',value:token.result.value,unit:token.result.unit,
   label:token.tooltip.label,steps:token.tooltip.steps,sources:token.tooltip.sources,mathSteps:token.tooltip.mathSteps,
   before:token.tooltip.value_before,rounding:token.tooltip.rounding,caps:token.tooltip.caps});
 }
 function appendParts(parent,text,parts){
  const doc=parent.ownerDocument;
  if(!parts){parent.textContent=String(text??'');return;}
  for(const part of parts)parent.append(part.math?renderMathML(part.math.mathml,{interactive:false,document:doc}):doc.createTextNode(part.text||''));
 }
 function hubFor(doc){
  if(hubs.has(doc))return hubs.get(doc);
  const win=doc.defaultView||globalThis,leases=new Set(),listeners=[];let active=null,closeTimer=null;
  const listen=(node,type,fn,capture=false)=>{node.addEventListener(type,fn,capture);listeners.push(()=>node.removeEventListener(type,fn,capture));};
  function close(){clearTimeout(closeTimer);if(active){active.anchor.removeAttribute('aria-describedby');active.popup.remove();active=null;}}
  function pick(target){
   const element=target?.closest?.('[data-richtext-kind],[data-stm-tip]');if(!element)return null;
   const scope=element.getAttribute('data-richtext-scope');let found=null;
   for(const lease of leases)if(lease.root.contains(element)&&(!scope||scope===lease.options.domain)){
    if(!found||found.root.contains(lease.root))found=lease;
   }
   return found?{anchor:element,lease:found}:null;
  }
  function getModel(anchor,lease){
   const o=lease.options,kind=anchor.getAttribute('data-richtext-kind')||anchor.getAttribute('data-stm-tip');
   if(kind==='term')return {kind:'term',...describeTerm(o.domain,anchor.getAttribute('data-glossary-id')||anchor.getAttribute('data-term'),(o.getLanguage||config.getLanguage)())};
   if(kind==='calculation'){
    if(o.domain==='question-bank'){
     const token=o.calculationIndex?.get(anchor.getAttribute('data-calculation-id'));if(!token)return null;
     return {kind:'calculation',category:'calculation',...questionCalculation(token)};
    }
    const encoded=anchor.getAttribute('data-rt-calculation');if(!encoded)return null;
    const token=calculation(JSON.parse(encoded));
    if(token.origin==='question-solution')throw Error('Artifact calculations cannot use a question-solution origin.');
    return {kind:'calculation',category:'calculation',...token};
   }
   const custom=o.resolveCustom?.(anchor);return custom?{kind:'custom',category:'game',...custom}:null;
  }
  function position(){
   if(!active)return;
   if(active.anchor.isConnected===false){close();return;}
   const {anchor,popup}=active,b=anchor.getBoundingClientRect();popup.style.left='8px';popup.style.top='8px';
   const p=popup.getBoundingClientRect(),width=win.innerWidth||1024,height=win.innerHeight||768;
   popup.style.left=Math.max(8,Math.min(b.left,width-p.width-8))+'px';
   const below=b.bottom+8;popup.style.top=Math.max(8,Math.min(below+p.height<=height-8?below:b.top-p.height-8,height-p.height-8))+'px';
  }
  function syncTheme(lease){
   if(lease.options.manageTheme&&lease.root.nodeType===1)lease.root.setAttribute('data-theme',(lease.options.getTheme||config.getTheme)()==='light'?'light':'dark');
  }
  function show(anchor,lease,pinned=false){
   if(anchor.isConnected===false){close();return null;}
   clearTimeout(closeTimer);const model=getModel(anchor,lease);if(!model){close();return null;}
   close();const popup=doc.createElement('div');popup.className='rt-popover stm-shared-tooltip';
   syncTheme(lease);
   const theme=lease.options.getTheme?lease.options.getTheme():anchor.closest('[data-theme]')?.getAttribute('data-theme')||config.getTheme();
   popup.setAttribute('role','tooltip');popup.setAttribute('data-stm-richtext','');popup.setAttribute('data-theme',theme==='light'?'light':'dark');
   popup.setAttribute('data-richtext-owner','STM_SHARED');popup.setAttribute('data-category',model.category);
   popup.id='stm-shared-tooltip-'+(++sequence);
   function line(text,cls,parts){const p=doc.createElement('p');if(cls)p.className=cls;appendParts(p,text,parts);popup.append(p);return p;}
   if(model.kind==='term'){
    const p=line(model.title,'rt-tip-title',model.labelParts);p.setAttribute('data-category',model.category);
    line(model.definition,null,model.definitionParts);
    if(model.example){const p=line('','rt-tip-example');p.append(doc.createTextNode('Example: '));const span=doc.createElement('span');appendParts(span,model.example,model.exampleParts);p.append(span);}
   }else if(model.kind==='calculation'){
    line(model.label,'rt-tip-title').setAttribute('data-category','calculation');
    const originLabels={'question-solution':'Question solution','resolved':'Resolved game event','preview':'Preview using the current snapshot','example':'Example snapshot · teaching only'};
    line(originLabels[model.origin],'rt-tip-origin');
    for(const source of model.sources)line(source);
    model.steps.forEach((step,index)=>line(step,'rt-equation',model.mathSteps?.[index]));
    if(model.before!==null)line('Before: '+model.before);
    line('Result: '+model.value+' '+model.unit);
    if(model.rounding)line(model.rounding,'rt-tip-example');if(model.caps)line(model.caps,'rt-tip-example');
   }else{
    line(model.title||'Artifact','rt-tip-title').setAttribute('data-category',model.category);
    for(const text of model.lines||[])line(text);
   }
   const portal=anchor.closest('dialog[open]')||doc.body;portal.append(popup);anchor.setAttribute('aria-describedby',popup.id);
   active={anchor,lease,popup,pinned};
   popup.addEventListener('pointerenter',()=>clearTimeout(closeTimer));
   popup.addEventListener('pointerleave',()=>{if(active&&!active.pinned)closeTimer=setTimeout(close,180);});
   position();return popup;
  }
  function delayClose(){if(active&&!active.pinned){clearTimeout(closeTimer);closeTimer=setTimeout(close,180);}}
  listen(doc,'pointerover',e=>{const found=pick(e.target);if(found){clearTimeout(closeTimer);if(!active?.pinned||active.anchor===found.anchor)show(found.anchor,found.lease,!!active?.pinned);}else if(active?.popup.contains(e.target))clearTimeout(closeTimer);});
  listen(doc,'pointerout',e=>{if(active&&!active.anchor.contains(e.relatedTarget)&&!active.popup.contains(e.relatedTarget))delayClose();});
  listen(doc,'focusin',e=>{const found=pick(e.target);if(found)show(found.anchor,found.lease);});
  listen(doc,'focusout',e=>{if(active&&!active.popup.contains(e.relatedTarget))delayClose();});
  listen(doc,'click',e=>{const found=pick(e.target);if(!found)return;e.preventDefault();e.stopPropagation();if(active?.anchor===found.anchor&&active.pinned)close();else show(found.anchor,found.lease,true);},true);
  listen(doc,'keydown',e=>{
   if(e.key==='Escape'&&active){e.preventDefault();e.stopPropagation();close();return;}
   if(e.key!=='Enter'&&e.key!==' ')return;const found=pick(e.target);if(!found)return;
   e.preventDefault();e.stopPropagation();if(active?.anchor===found.anchor&&active.pinned)close();else show(found.anchor,found.lease,true);
  },true);
  listen(doc,'pointerdown',e=>{if(active&&!active.anchor.contains(e.target)&&!active.popup.contains(e.target)&&!pick(e.target))close();},true);
  listen(win,'resize',position);listen(win,'scroll',position,true);
  const hub={attach(root,options){
   const lease={root,options};leases.add(lease);syncTheme(lease);
   return {close(){if(active?.lease===lease)close();},show(anchor,pin=false){if(!root.contains(anchor))throw Error('Tooltip target is outside its surface.');return show(anchor,lease,pin);},
    destroy(){if(active?.lease===lease)close();leases.delete(lease);if(!leases.size){for(const off of listeners)off();hubs.delete(doc);liveHubs.delete(hub);}}};
  },refresh(){for(const lease of leases)syncTheme(lease);if(active)show(active.anchor,active.lease,active.pinned);},diagnostics(){return {controllers:leases.size,visibleTooltips:active?1:0,domain:active?.lease.options.domain||null};}};
  hubs.set(doc,hub);liveHubs.add(hub);return hub;
 }
 function attachTooltips(root,options){
  if(!root||!registry.domains[options?.domain])throw Error('A rich-text surface and domain are required.');
  if(options.glossary)assertDomain(options.domain,options.glossary);
  const doc=root.ownerDocument||root;if(!doc.createElement)throw Error('A DOM document is required for tooltips.');
  return hubFor(doc).attach(root,options);
 }
 function configure(options={}){
  for(const key of ['getLanguage','getTheme'])if(key in options){if(typeof options[key]!=='function')throw Error(key+' must read the existing settings owner.');config[key]=options[key];}
  for(const hub of liveHubs)hub.refresh();
 }
 return Object.freeze({version:'1.0.0',registryId:registry.registryId,resolveTerm,describeTerm,assertDomain,
  decorateTerm,termHTML,renderMathML,calculation,questionCalculation,attachTooltips,configure,
  refresh(){for(const hub of liveHubs)hub.refresh();},
  diagnostics(doc=globalThis.document){return hubs.get(doc)?.diagnostics()||{controllers:0,visibleTooltips:0,domain:null};}});
});
