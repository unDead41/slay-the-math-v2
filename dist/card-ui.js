/* Card presentation only: render an existing plan; never resolve or commit it. */
(function(root,factory){
 'use strict';
 const kit=typeof module!=='undefined'&&module.exports?require('./card-kit.js'):root.STMCardKit;
 const api=factory(kit);
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DCCardUI=api;
})(typeof window!=='undefined'?window:globalThis,function(K){
 'use strict';
 const esc=value=>K.escapeHTML(value??'');
 const roles={attack:'attack',defend:'guard',skill:'tactic',passive:'passive'};
 const copy={
  en:{attack:'Attack',defend:'Defend',skill:'Skill',passive:'Passive',energy:'Energy',cost:'Cost'},
  bm:{attack:'Serang',defend:'Bertahan',skill:'Kemahiran',passive:'Pasif',energy:'Tenaga',cost:'Kos'}
 };
 let renderSequence=0;

 // Legacy callers pass an attribute string; rebuild its safe attributes rather
 // than interpolating HTML. Object callers need no entity decoding.
 function decodeAttribute(value){
  return value.replace(/&(?:amp|lt|gt|quot|apos|#39|#\d+|#x[0-9a-f]+);/gi,entity=>{
   const named={'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&#39;':"'"};
   if(named[entity.toLowerCase()]!==undefined)return named[entity.toLowerCase()];
   const code=entity[2].toLowerCase()==='x'?parseInt(entity.slice(3,-1),16):parseInt(entity.slice(2,-1),10);
   return code>0&&code<=0x10ffff?String.fromCodePoint(code):'\ufffd';
  });
 }
 function attributes(extra){
  const result=new Map();
  function add(key,value,encoded=false){
   key=String(key).toLowerCase();
   if(!/^(?:data-[a-z0-9_.:-]+|aria-[a-z0-9_.:-]+|disabled)$/.test(key)||key==='data-action')return;
   if(key==='disabled'){if(value!==false&&value!==null&&value!==undefined)result.set(key,'');return;}
   if(value!==null&&value!==undefined)result.set(key,encoded?decodeAttribute(String(value)):String(value));
  }
  if(typeof extra==='string'){
   const pattern=/([^\s=<>/"'`]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
   for(const match of extra.matchAll(pattern))add(match[1],match[2]??match[3]??match[4]??'',true);
  }else if(extra&&typeof extra==='object')for(const [key,value]of Object.entries(extra))add(key,value);
  return result;
 }
 function view(plan,options={}){
  if(!plan?.card)throw new TypeError('A prepared card plan is required.');
  const card=plan.card,lang=K.normalizeLanguage(options.lang||'en'),w=copy[lang];
  const name=K.cardName(card,lang),cost=plan.displayCost??(card.energy.kind==='all_remaining'?'X':card.energy.amount);
  const extra=attributes(options.extra),disabled=extra.has('disabled'),selected=extra.get('aria-pressed')==='true';
  const id='stm-card-'+String(options.uid??card.id).replace(/[^a-zA-Z0-9_.:-]/g,'-')+'-'+(++renderSequence)+'-description';
  const plain=K.renderPlain(plan,lang),label=name+'. '+w[card.category]+'. '+w.cost+' '+cost+' '+w.energy+'. '+plain;
  const classes=['playing-card','package-card',card.category,roles[card.category],options.compact?'compact':'',options.upgraded?'upgraded':'',disabled?'is-disabled':'',selected?'is-selected':''];
  const frame=K.assetPath(K.framePath(card,plan.focused)),icon=K.assetPath(card.icon);
  const art='<span class="package-card-art" aria-hidden="true"><img src="'+esc(icon)+'" alt="" loading="lazy" decoding="async"></span>';
  const face=art+'<img class="package-card-frame" src="'+esc(frame)+'" width="1280" height="1920" alt="" aria-hidden="true" loading="lazy" decoding="async">'+
   '<span class="card-cost package-card-cost" aria-label="'+esc(w.cost+' '+cost+' '+w.energy)+'">'+esc(cost)+'</span>'+
   '<strong class="card-title package-card-title">'+esc(name)+(options.upgraded?' +':'')+'</strong>'+
   '<span class="card-role package-card-category">'+esc(w[card.category])+'</span>';
  let action='';
  if(options.action){
   if(!extra.has('aria-label'))extra.set('aria-label',label);
   if(id)extra.set('aria-describedby',[extra.get('aria-describedby'),id].filter(Boolean).join(' '));
   const forwarded=[...extra].map(([key,value])=>key==='disabled'?' disabled':' '+key+'="'+esc(value)+'"').join('');
   action='<button type="button" class="package-card-action" data-action="'+esc(options.action)+'"'+forwarded+'></button>';
  }
  return '<article class="'+[...new Set(classes.filter(Boolean))].map(esc).join(' ')+'"'+(options.uid?' data-motion-uid="'+esc(options.uid)+'"':'')+' data-card-id="'+esc(card.id)+'" data-focus="'+String(!!plan.focused)+'" data-focus-reason="'+esc(plan.focusReason||'not_requested')+'" data-rarity="'+esc(card.rarity)+'" lang="'+(lang==='bm'?'ms':'en')+'" aria-label="'+esc(name)+'">'+
   face+action+'<div class="card-description package-card-description"'+(id?' id="'+esc(id)+'"':'')+' tabindex="0" aria-label="'+esc(plain)+'"><div>'+K.renderHTML(plan,lang)+'</div></div></article>';
 }

 const bindings=new WeakMap(),visible=new Set();
 let sequence=0;
 function bind(doc){
  doc=doc?.ownerDocument||doc;
  if(!doc?.createElement)return null;
  if(bindings.has(doc))return bindings.get(doc);
  const win=doc.defaultView;let active=null;
  function tokenAt(target){
   const element=target?.nodeType===1?target:target?.parentElement;
   return element?.closest?.('.stm-rt[data-tooltip]')||null;
  }
  function close(){
   if(!active)return;
   const {anchor,popup}=active;
   const described=(anchor.getAttribute('aria-describedby')||'').split(/\s+/).filter(id=>id&&id!==popup.id);
   if(described.length)anchor.setAttribute('aria-describedby',described.join(' '));else anchor.removeAttribute('aria-describedby');
   popup.remove();active=null;visible.delete(controller);
  }
  function position(){
   if(!active)return;
   const {anchor,popup}=active;if(!anchor.isConnected){close();return;}
   const margin=8,width=win?.innerWidth||doc.documentElement.clientWidth||1024,height=win?.innerHeight||doc.documentElement.clientHeight||768;
   popup.style.maxWidth=Math.max(0,width-margin*2)+'px';popup.style.maxHeight=Math.max(0,height-margin*2)+'px';
   const a=anchor.getBoundingClientRect(),p=popup.getBoundingClientRect();
   const below=a.bottom+margin,top=below+p.height<=height-margin?below:a.top-p.height-margin;
   popup.style.left=Math.max(margin,Math.min(a.left,width-p.width-margin))+'px';
   popup.style.top=Math.max(margin,Math.min(top,height-p.height-margin))+'px';
  }
  function show(anchor,pinned=false){
   if(!anchor?.isConnected)return;
   if(active?.anchor===anchor){active.pinned=active.pinned||pinned;position();return;}
   close();
   const popup=doc.createElement('div');popup.className='stm-card-tooltip';popup.id='stm-card-tooltip-'+(++sequence);
   popup.setAttribute('role','tooltip');popup.dataset.kind=anchor.dataset.kind||'game';
   const title=doc.createElement('strong');title.className='stm-card-tooltip-title';title.textContent=anchor.textContent;
   const text=doc.createElement('p');text.textContent=anchor.getAttribute('data-tooltip');popup.append(title,text);
   (anchor.closest('dialog[open]')||doc.body).append(popup);
   anchor.setAttribute('aria-describedby',[anchor.getAttribute('aria-describedby'),popup.id].filter(Boolean).join(' '));
   active={anchor,popup,pinned};visible.add(controller);position();
  }
  function toggle(anchor){if(active?.anchor===anchor&&active.pinned)close();else show(anchor,true);}
  function consume(event){event.preventDefault();event.stopImmediatePropagation();}
  const controller=Object.freeze({hide:close});bindings.set(doc,controller);
  doc.addEventListener('pointerover',event=>{
   if(event.pointerType==='touch')return;
   const anchor=tokenAt(event.target);if(anchor&&(!active?.pinned||active.anchor===anchor))show(anchor);
  });
  doc.addEventListener('pointerout',event=>{
   if(active&&!active.pinned&&active.anchor.contains(event.target)&&!active.anchor.contains(event.relatedTarget)&&!active.popup.contains(event.relatedTarget))close();
  });
  doc.addEventListener('focusin',event=>{const anchor=tokenAt(event.target);if(anchor)show(anchor);});
  doc.addEventListener('focusout',event=>{if(active&&active.anchor.contains(event.target)&&!active.anchor.contains(event.relatedTarget))close();});
  doc.addEventListener('click',event=>{const anchor=tokenAt(event.target);if(anchor){consume(event);toggle(anchor);}},true);
  doc.addEventListener('keydown',event=>{
   if(event.key==='Escape'&&active){consume(event);close();return;}
   if(event.key!=='Enter'&&event.key!==' ')return;
   const anchor=tokenAt(event.target);if(anchor){consume(event);toggle(anchor);}
  },true);
  doc.addEventListener('cancel',event=>{if(active){consume(event);close();}},true);
  doc.addEventListener('pointerdown',event=>{if(active&&!active.anchor.contains(event.target)&&!active.popup.contains(event.target))close();},true);
  doc.addEventListener('scroll',close,true);win?.addEventListener('scroll',close,true);win?.addEventListener('resize',position);
  return controller;
 }
 function hide(){for(const controller of [...visible])controller.hide();}
 return Object.freeze({view,bind,hide});
});
