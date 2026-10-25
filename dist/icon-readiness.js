/* Functional-icon readiness only. No scene gate, save, cache or gameplay writes. */
(function(root){'use strict';
 const selector='img[data-status-icon],img[data-icon],img.icon,img.topic-icon,.pile-art img,.route-legend img,.room-seal img,.dungeon-room img',installed=new WeakMap();
 const paths={block:'M12 3 21 7v6c0 6-9 9-9 9S3 19 3 13V7Z','next-block':'M6 3h12M6 21h12M7 3c0 7 10 11 10 18M17 3c0 7-10 11-10 18','retain-block':'M20 8a9 9 0 1 0 0 9M20 3v6h-6',strength:'m4 20 14-16 3 3L7 22M3 15l7 7',agility:'m4 18 8-2 5-11 3 2-4 12H4Z',defense:'m7 3 5 3 5-3 4 5-4 4v9H7v-9L3 8Z',weak:'m4 20 6-7-2-3 6-4 6-3-4 6-4 3 1 3-6 7',vulnerable:'M12 3 21 7v6c0 6-9 9-9 9S3 19 3 13V7ZM13 5l-4 7 5 1-4 8',thorns:'m12 3 3 7 6-3-3 8 4 4-8-1-3 4-2-7-7-2 7-3Z','next-draw':'M3 4h11v14H3ZM8 8h11v13H8M15 3h6m-3-2 3 2-3 2',heart:'M12 21 3 12C-2 4 7 0 12 7 17 0 26 4 21 12Z',bolt:'m14 2-10 12h7l-1 8L21 9h-8Z',focus:'M2 12q10-14 20 0-10 14-20 0Zm10-4a4 4 0 1 0 0 8 4 4 0 0 0 0-8',predict:'M5 22h14M7 19h10M12 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16',close:'m5 5 14 14M19 5 5 19',shield:'M12 3 21 7v6c0 6-9 9-9 9S3 19 3 13V7Z',arrow:'M3 12h18m-7-7 7 7-7 7',cards:'M3 5h13v16H3ZM7 2h14v16',hand:'M4 13V9q0-3 2 0v4-9q0-3 2 0v8-10q0-3 2 0v10-8q0-3 2 0v9l4-3q4 0 1 4l-6 7H6Z',clock:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4v7l5 3',volume:'M2 9h5l6-5v16l-6-5H2Zm15-3q8 6 0 12',muted:'M2 9h5l6-5v16l-6-5H2Zm14 0 6 6m0-6-6 6',settings:'M9 2h6l1 4 4 1 2 6-4 3v4l-6 2-4-3-4 1-2-6 4-3V7Zm3 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8'};
 // Small emergency glyphs share the normal semantic keys, not the bitmap art.
 Object.assign(paths,{
  drawPile:'M3 3h11v14H3Zm4 17h10M17 7h4v10m-3-3 3 3 3-3',
  discard:'M3 3h10v13H3Zm2 6h6M16 10l5 5-5 5m-3-5h8',
  exhaust:'M3 3h10v15H3Zm13 18c-5-2-3-7 0-10 0 4 5 4 5 7 0 2-2 3-5 3Z',
  sword:'m4 20 2-5L18 3l3 3L9 18l-5 2Zm1-8 7 7M3 21l3-3',
  shield:'M12 3 21 7v6c0 6-9 9-9 9S3 19 3 13V7Zm0 5v8m-4-4h8',
  book:'M12 6Q7 2 2 5v15q5-3 10 0 5-3 10 0V5q-5-3-10 1Zm0 0v14M5 8l4 1m6 0 4-1',
  filter:'M3 4h18l-7 8v8l-4-2v-6Z',
  star:'m12 2 3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1Z',
  map:'m2 5 7-3 6 3 7-3v17l-7 3-6-3-7 3Zm7-3v17m6-14v17',
  chance:'M4 3h16l1 18H3ZM7 7h1m8 0h1m-6 5h1m-6 5h1m8 0h1',
  search:'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 7 7',
  flame:'M12 2c1 6 8 7 8 13a8 8 0 0 1-16 0c0-4 3-6 5-8-1 4 1 5 2 5 3-2 0-6 1-10Zm0 12c-4 3-4 7 0 7s4-4 0-7Z',
  check:'m3 12 6 7L21 5',
  moon:'M17 3a10 10 0 1 0 4 15A10 10 0 0 1 17 3Z',
  orb:'M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm0-4v2m0 18v2M1 12h2m18 0h2',
  leaf:'M3 21C0 8 9 2 22 2c0 13-6 22-19 19Zm0 0L17 7m-8 8V9m0 6h6',
  balance:'M12 3v18M6 21h12M3 7h18M6 7l-4 8h8Zm12 0-4 8h8Z',
  elite:'m12 3 8 9-8 9-8-9Zm-3 9 3-4 3 4-3 4Z',
  crown:'m3 6 5 5 4-8 4 8 5-5-2 14H5Zm2 10h14',
  coin:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm3 5h-4a3 3 0 0 0 0 6h2a3 3 0 0 1 0 6H9m3-14v16',
  bossSealClosed:'m12 2 9 5v7l-9 8-9-8V7Zm-4 9V8a4 4 0 0 1 8 0v3M7 11h10v7H7Zm5 3v2',
  bossSealOpen:'m12 2 9 5v7l-9 8-9-8V7Zm2 9V7a4 4 0 0 1 8 0M7 11h10v7H7Zm5 3v2',
  intentAttackBlock:'M2 4h9v7c0 4-4 6-4 6S2 15 2 11Zm9 17 9-17 3 3-9 16m-5-8 8 5',
  skill:'M5 3h14v18H5Zm3 0v18m6-16v6l2-2 2 2V5M11 16h5',
  save:'M3 3h15l3 3v15H3Zm4 0v7h10V3M7 21v-8h10v8M14 5v2',
  exportSave:'M3 15v6h18v-6M12 17V3m-5 5 5-5 5 5',
  importSave:'M3 15v6h18v-6M12 3v13m-5-5 5 5 5-5',
  topicProbability:'M2 3h12v12H2ZM6 7h1m3 4h1m7-2h4v12H10v-3m7-5h1m-4 4h1',
  topicSets:'M9 5a7 7 0 1 0 0 14A7 7 0 0 0 9 5Zm6 0a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z',
  topicLogic:'M2 3h6v6H2Zm14 0h6v6h-6ZM9 16h6v6H9ZM8 6h8m-3-3 3 3-3 3M5 9v4h14V9m-7 4v3',
  battle:'m3 3 18 18m-4-1 4 1-1-4M21 3 3 21m1-4-1 4 4-1M3 3l1 5 4-4Zm18 0-1 5-4-4Z',
  boss:'m4 10-2-7 7 5m11 2 2-7-7 5M12 6a8 8 0 0 0-8 8v4l4 1 1 3h6l1-3 4-1v-4a8 8 0 0 0-8-8Zm-5 7 3 1m4 0 3-1m-5 4v2',
  shop:'M3 9h18l-2-6H5Zm0 0v3q2 3 4 0 2 3 5 0 2 3 5 0 2 3 4 0V9M5 14v7h14v-7M9 21v-5h6v5',
  camp:'m4 22 16-3M4 19l16 3M12 2c0 5 7 6 7 11a7 7 0 0 1-14 0c0-3 3-5 5-7-1 4 1 4 2 5 2-3-1-5 0-9Z',
  event:'m12 2 10 10-10 10L2 12Zm-4 7c0-5 8-5 8 0 0 3-4 3-4 6m0 3v1'
 });
 paths.rest=paths.camp;
 function fallback(key){const glyph=Object.prototype.hasOwnProperty.call(paths,key)?paths[key]:'m12 3 10 18H2ZM12 8v6m0 3v1';return 'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="-3 -3 30 30"><circle cx="12" cy="12" r="14" fill="#102334" stroke="#e8c77a"/><path d="'+glyph+'" fill="none" stroke="#fff4d4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>');}
 function install(doc){
  if(!doc||installed.has(doc))return installed.get(doc);
  const records=new WeakMap(),win=doc.defaultView;
  function semanticKey(im){
   if(im.dataset.statusIcon||im.dataset.icon)return im.dataset.statusIcon||im.dataset.icon;
   const original=String(im.dataset.stmAsset||im.dataset.iconSource||im.getAttribute('src')||''),filename=original.split(/[?#]/)[0].split('/').pop(),registry=win.DCIconAssets||root.DCIconAssets,embedded=win.DC_ASSETS||root.DC_ASSETS;
   for(const group of ['status','ui','map'])for(const [key,source]of Object.entries(registry?.[group]||{})){const file=String(source).split('/').pop();if(file===filename||original.startsWith('data:')&&embedded?.[file]===original)return key;}
   return 'asset';
  }
  function watch(im){if(!im.matches?.(selector))return;const src=im.getAttribute('src');if(!src)return;let r=records.get(im);if(r?.fallback===src)return;if(!r||r.source!==src){r={source:src};records.set(im,r);delete im.dataset.iconFallback;im.dataset.iconSource=src;}im.dataset.iconState=im.dataset.stmImageState==='pending'?'pending':im.complete&&im.naturalWidth?'ready':'pending';im.decoding='async';im.fetchPriority='high';}
  function scan(node){if(node.nodeType!==1&&node.nodeType!==9)return;watch(node);for(const im of node.querySelectorAll(selector))watch(im);}
  function failed(event){const im=event.target;if(!im.matches?.(selector))return;watch(im);const r=records.get(im);if(!r||r.fallback)return;r.fallback=fallback(semanticKey(im));im.dataset.iconState='fallback';im.dataset.iconFallback='true';im.src=r.fallback;}
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
