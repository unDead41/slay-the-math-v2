/* Functional-icon readiness only. No scene gate, save, cache or gameplay writes. */
(function(root){'use strict';
 const selector='img[data-status-icon],img[data-icon],img.icon,img.topic-icon,.pile-art img,.route-legend img,.room-seal img,.dungeon-room img',installed=new WeakMap();
 const paths={block:'M12 3 21 7v6c0 6-9 9-9 9S3 19 3 13V7Z','next-block':'M6 3h12M6 21h12M7 3c0 7 10 11 10 18M17 3c0 7-10 11-10 18','retain-block':'M20 8a9 9 0 1 0 0 9M20 3v6h-6',strength:'m4 20 14-16 3 3L7 22M3 15l7 7',agility:'m4 18 8-2 5-11 3 2-4 12H4Z',defense:'m7 3 5 3 5-3 4 5-4 4v9H7v-9L3 8Z',weak:'m4 20 6-7-2-3 6-4 6-3-4 6-4 3 1 3-6 7',vulnerable:'M12 3 21 7v6c0 6-9 9-9 9S3 19 3 13V7ZM13 5l-4 7 5 1-4 8',thorns:'m12 3 3 7 6-3-3 8 4 4-8-1-3 4-2-7-7-2 7-3Z','next-draw':'M3 4h11v14H3ZM8 8h11v13H8M15 3h6m-3-2 3 2-3 2',heart:'M12 21 3 12C-2 4 7 0 12 7 17 0 26 4 21 12Z',bolt:'m14 2-10 12h7l-1 8L21 9h-8Z',focus:'M2 12q10-14 20 0-10 14-20 0Zm10-4a4 4 0 1 0 0 8 4 4 0 0 0 0-8',predict:'M5 22h14M7 19h10M12 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16',close:'m5 5 14 14M19 5 5 19',shield:'M12 3 21 7v6c0 6-9 9-9 9S3 19 3 13V7Z',arrow:'M3 12h18m-7-7 7 7-7 7',cards:'M3 5h13v16H3ZM7 2h14v16',hand:'M4 13V9q0-3 2 0v4-9q0-3 2 0v8-10q0-3 2 0v10-8q0-3 2 0v9l4-3q4 0 1 4l-6 7H6Z',clock:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4v7l5 3',volume:'M2 9h5l6-5v16l-6-5H2Zm15-3q8 6 0 12',muted:'M2 9h5l6-5v16l-6-5H2Zm14 0 6 6m0-6-6 6',settings:'M9 2h6l1 4 4 1 2 6-4 3v4l-6 2-4-3-4 1-2-6 4-3V7Zm3 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8'};
 function fallback(key){return 'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="-3 -3 30 30"><circle cx="12" cy="12" r="14" fill="#102334" stroke="#e8c77a"/><path d="'+(paths[key]||'m12 3 10 18H2ZM12 8v6m0 3v1')+'" fill="none" stroke="#fff4d4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>');}
 function install(doc){
  if(!doc||installed.has(doc))return installed.get(doc);
  const records=new WeakMap(),win=doc.defaultView;
  function watch(im){if(!im.matches?.(selector))return;const src=im.getAttribute('src');if(!src)return;let r=records.get(im);if(r?.fallback===src)return;if(!r||r.source!==src){r={source:src};records.set(im,r);delete im.dataset.iconFallback;im.dataset.iconSource=src;}im.dataset.iconState=im.dataset.stmImageState==='pending'?'pending':im.complete&&im.naturalWidth?'ready':'pending';im.decoding='async';im.fetchPriority='high';}
  function scan(node){if(node.nodeType!==1&&node.nodeType!==9)return;watch(node);for(const im of node.querySelectorAll(selector))watch(im);}
  function failed(event){const im=event.target;if(!im.matches?.(selector))return;watch(im);const r=records.get(im);if(!r||r.fallback)return;const key=im.dataset.statusIcon||im.dataset.icon||'asset';r.fallback=fallback(key);im.dataset.iconState='fallback';im.dataset.iconFallback='true';im.src=r.fallback;}
  function loaded(event){const im=event.target;if(im.matches?.(selector))im.dataset.iconState=im.dataset.iconFallback?'fallback':im.dataset.stmImageState==='pending'?'pending':'ready';}
  doc.addEventListener('error',failed,true);doc.addEventListener('load',loaded,true);scan(doc);
  const observer=new win.MutationObserver(changes=>{for(const c of changes)if(c.type==='attributes')watch(c.target);else for(const n of c.addedNodes)scan(n);});observer.observe(doc.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});
  const api={scan:()=>scan(doc),refreshImage:watch,destroy(){observer.disconnect();doc.removeEventListener('error',failed,true);doc.removeEventListener('load',loaded,true);installed.delete(doc);}};installed.set(doc,api);return api;
 }
 function criticalAssets(registry=root.DCIconAssets){return [...new Set([...Object.values(registry?.status||{}),...['heart','bolt','focus','predict','hand'].map(k=>registry?.ui?.[k]).filter(Boolean).map(p=>p.startsWith('assets/')?p:'assets/'+p)])];}
 const warmed=new Map();
 function warm(){
  if(!root.Image)return Promise.resolve([]);
  return Promise.allSettled(criticalAssets().map(path=>{
   const src=root.DCIconAssets?.resolve(path.replace(/^assets\//,''),root.DC_ASSETS)||path;
   if(!warmed.has(src))warmed.set(src,root.STMHosted?.manager
    ?root.STMHosted.prepareImage(path,{priority:60}).then(url=>({src:url,loaded:true}),()=>({src,loaded:false}))
    :new Promise(resolve=>{const im=new root.Image();im.decoding='async';im.fetchPriority='high';im.onload=()=>resolve({src,loaded:true});im.onerror=()=>resolve({src,loaded:false});im.src=src;}));
   return warmed.get(src);
  }));
 }

 const api={install,fallback,criticalAssets,warm};if(typeof module!=='undefined'&&module.exports)module.exports=api;else{root.DCIconReadiness=api;install(root.document);}
})(typeof window!=='undefined'?window:globalThis);
