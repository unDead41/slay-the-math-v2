(function(root){'use strict';
 function key(node){return node.nodeType===1?(node.getAttribute('data-render-key')||node.id||(node.matches('canvas.actor-animation')?'actor:'+node.dataset.actor:null)):null;}
 function compatible(a,b){return a.nodeType===b.nodeType&&(a.nodeType!==1||(a.localName===b.localName&&a.namespaceURI===b.namespaceURI));}
 function update(node,next){
  if(node.isEqualNode(next))return;
  if(node.nodeType!==1){if(node.nodeValue!==next.nodeValue)node.nodeValue=next.nodeValue;return;}
  // The animation controller owns the canvas bitmap and these live attributes.
  const canvas=node.matches('canvas.actor-animation'),host=node.hasAttribute('data-animation-ready')&&[...node.children].some(n=>n.matches('canvas.actor-animation'));
  const oldKey=node.getAttribute('data-stm-asset'),nextKey=next.getAttribute('data-stm-asset');
  const sameImage=node.localName==='img'&&(oldKey||nextKey?oldKey===nextKey:[node.getAttribute('src'),node.getAttribute('data-icon-source')].includes(next.getAttribute('src'))),sameIcon=sameImage&&node.hasAttribute('data-icon-state');
  const owned=name=>canvas&&['data-action','data-frame','data-texture'].includes(name)||host&&name==='data-animation-ready'||sameImage&&name==='data-stm-image-state'||sameIcon&&(['data-icon-state','data-icon-source','data-icon-fallback'].includes(name)||name==='src'&&node.dataset.iconFallback==='true');
  for(const attr of [...node.attributes])if(!owned(attr.name)&&!next.hasAttribute(attr.name))node.removeAttribute(attr.name);
  for(const attr of next.attributes)if(!owned(attr.name)&&node.getAttribute(attr.name)!==attr.value)node.setAttribute(attr.name,attr.value);
  if(!canvas)children(node,next);
 }
 function children(node,next){
  const keyed=new Map([...node.childNodes].map(n=>[key(n),n]).filter(([k])=>k)),used=new Set();let cursor=node.firstChild;
  for(const desired of [...next.childNodes]){
   const k=key(desired);let current=k?keyed.get(k):cursor&&!key(cursor)?cursor:null;
   if(current&&(!compatible(current,desired)||used.has(current)))current=null;
   if(!current)current=desired.cloneNode(true);
   if(current!==cursor)node.insertBefore(current,cursor);
   update(current,desired);used.add(current);cursor=current.nextSibling;
  }
  for(const child of [...node.childNodes])if(!used.has(child))child.remove();
 }
 function patch(node,html){const template=node.ownerDocument.createElement('template');template.innerHTML=html;children(node,template.content);}
 const api={patch};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DCDomPatch=api;
})(typeof window!=='undefined'?window:globalThis);
