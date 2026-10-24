(function(root){'use strict';const documents=new WeakMap();
function bind(doc){if(documents.has(doc))return documents.get(doc);const editable=node=>node?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[data-allow-selection]');
 const prevent=event=>{if(!editable(event.target))event.preventDefault();};
 // Delegate before the native drag gesture. A subtree observer retains replaced
 // question trees until its microtask and can exhaust memory during fast review.
 for(const el of doc.querySelectorAll('img,a'))el.draggable=false;
 const prepare=event=>{if(editable(event.target))return;const el=event.target.closest?.('img,a');if(el)el.draggable=false;};
 doc.addEventListener('pointerdown',prepare,true);
 doc.addEventListener('dragstart',prevent);doc.addEventListener('selectstart',prevent);
 const dispose=()=>{doc.removeEventListener('pointerdown',prepare,true);doc.removeEventListener('dragstart',prevent);doc.removeEventListener('selectstart',prevent);documents.delete(doc);};documents.set(doc,dispose);return dispose;
}
const api={bind};if(typeof module!=='undefined')module.exports=api;else{root.STMInputGuard=api;bind(root.document);}
})(typeof window!=='undefined'?window:globalThis);
