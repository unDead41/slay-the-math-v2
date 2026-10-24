/* Content-verified, project-scoped downloads. No game state or random numbers. */
(function(root){'use strict';
function create(options){
 const host=options.host||root,base=new URL('.',options.base||host.document.baseURI),manifest=options.manifest;
 const entries=new Map(manifest.entries.map(e=>[new URL(e.url,base).pathname,e]));
 const queue=[],jobs=new Map(),records=new Map(),listeners=new Set();let active=0,background=0,paused=false,dead=false;
 const count={requests:0,cacheHits:0,bytes:0,maxActive:0,cacheMode:'persistent'};
 const max=options.concurrency||4,bgMax=Math.min(max,options.backgroundConcurrency||2),delays=options.retryDelays||[1000,3000];
 const cachePrefix='stm-assets-'+encodeURIComponent(base.pathname)+'-',cacheName=cachePrefix+manifest.manifestId;
 let cachePromise,previousPromise;
 const cache=()=>cachePromise||(cachePromise=Promise.resolve().then(()=>options.cache!==undefined?options.cache:host.caches?.open(cacheName)).catch(()=>null).then(c=>{if(!c)count.cacheMode='online';return c;}));
 const previous=()=>previousPromise||(previousPromise=Promise.resolve().then(async()=>options.cache!==undefined?[]:(await host.caches?.keys()||[]).filter(name=>name.startsWith(cachePrefix)&&name!==cacheName).reverse()).catch(()=>[]));
 function key(e){return new URL(e.url,base).href;}
 function entry(url){const u=new URL(url,base);if(u.origin!==base.origin||!entries.has(u.pathname))throw Error('Unknown manifest asset');return entries.get(u.pathname);}
 function emit(){for(const fn of listeners)fn();}
 async function digest(bytes){const hash=await host.crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(hash),v=>v.toString(16).padStart(2,'0')).join('');}
 async function valid(response,e){if(!response?.ok)return false;return await digest(await response.clone().arrayBuffer())===e.sha256;}
 async function request(e,job){
  const controller=new host.AbortController();job.controller=controller;let timer;
  const touch=()=>{host.clearTimeout(timer);timer=host.setTimeout(()=>controller.abort(),options.idleTimeoutMs||30000);};touch();
  try{
   count.requests++;const url=new URL(e.url,base);url.searchParams.set('v',e.sha256);
   const response=await host.fetch(url.href,{signal:controller.signal,cache:'no-cache'});
   if(!response.ok){const error=Error('HTTP '+response.status+' loading '+e.url);error.retryable=response.status===408||response.status===429||response.status>=500;const after=Number(response.headers.get('retry-after'));if(Number.isFinite(after)&&after>0)error.retryAfter=after*1000;throw error;}
   const chunks=[];let size=0;const reader=response.body?.getReader();
   if(reader){for(;;){const {done,value}=await reader.read();if(done)break;touch();chunks.push(value);size+=value.byteLength;records.set(e.url,{bytes:size,ready:false});emit();}}
   else{const value=new Uint8Array(await response.arrayBuffer());chunks.push(value);size=value.byteLength;}
   const bytes=new Uint8Array(size);let at=0;for(const c of chunks){bytes.set(c,at);at+=c.byteLength;}
   if(await digest(bytes)!==e.sha256){const error=Error('Content verification failed: '+e.url);error.retryable=false;throw error;}
   count.bytes+=size;const headers=new host.Headers(response.headers);headers.delete('content-encoding');headers.set('content-length',String(size));
   return new host.Response(bytes,{status:200,headers});
  }finally{host.clearTimeout(timer);job.controller=null;}
 }
 async function perform(job){const e=job.entry,c=await cache();
  if(job.cancelled)throw Error('Download cancelled');
  if(c){try{const saved=await c.match(key(e));if(await valid(saved,e)){if(job.cancelled)throw Error('Download cancelled');count.cacheHits++;records.set(e.url,{bytes:e.bytes,ready:true});emit();return saved;}if(saved)await c.delete(key(e));}catch(_){if(job.cancelled)throw Error('Download cancelled');count.cacheMode='online';}}
  // Reuse unchanged bytes after an update; the new digest is always authoritative.
  for(const name of await previous()){
   if(job.cancelled)throw Error('Download cancelled');
   try{const saved=await (await host.caches.open(name)).match(key(e));if(!await valid(saved,e))continue;if(job.cancelled)throw Error('Download cancelled');if(c)try{await c.put(key(e),saved.clone());}catch(_){count.cacheMode='online';}count.cacheHits++;records.set(e.url,{bytes:e.bytes,ready:true});emit();return saved;}catch(_){if(job.cancelled)throw Error('Download cancelled');}
  }
  let response;
  for(let attempt=0;;attempt++){
   try{response=await request(e,job);break;}catch(error){if(job.cancelled||dead||attempt>=delays.length||error.retryable===false)throw error;await new Promise(resolve=>host.setTimeout(resolve,error.retryAfter||delays[attempt]));}
  }
  if(job.cancelled)throw Error('Download cancelled');
  if(c)try{await c.put(key(e),response.clone());}catch(_){count.cacheMode='online';}
  records.set(e.url,{bytes:e.bytes,ready:true});emit();return response;
 }
 function drain(){if(paused||dead)return;queue.sort((a,b)=>a.priority-b.priority);
  while(active<max){const i=queue.findIndex(j=>j.priority<50||background<bgMax);if(i<0)return;const job=queue.splice(i,1)[0];active++;if(job.priority>=50)background++;count.maxActive=Math.max(count.maxActive,active);
   perform(job).then(job.resolve,job.reject).finally(()=>{active--;if(job.priority>=50)background--;if(jobs.get(job.entry.url)===job)jobs.delete(job.entry.url);emit();drain();});
  }
 }
 function fetchAsset(url,{priority=0}={}){
  let e;try{e=entry(url);}catch(error){return Promise.reject(error);}
  if(dead||paused)return Promise.reject(Error('Download cancelled'));
  let job=jobs.get(e.url);if(job?.cancelled){jobs.delete(e.url);job=null;}
  if(!job){job={entry:e,priority,cancelled:false,controller:null};job.promise=new Promise((resolve,reject)=>{job.resolve=resolve;job.reject=reject;});jobs.set(e.url,job);queue.push(job);drain();}
  else if(priority<job.priority&&queue.includes(job)){job.priority=priority;drain();}
  return job.promise.then(response=>response.clone());
 }
 function pause(){paused=true;for(const job of jobs.values()){job.cancelled=true;job.controller?.abort();}for(const job of queue.splice(0)){job.reject(Error('Download cancelled'));jobs.delete(job.entry.url);}}
 async function prepare(urls,{onProgress=()=>{},priority=0,timeoutMs=180000}={}){
  const list=[...new Set(urls)].map(entry);let timer;
  const progress=()=>{const verified=list.filter(e=>records.get(e.url)?.ready);onProgress({state:verified.length===list.length?'ready':'downloading',verifiedFiles:verified.length,totalFiles:list.length,verifiedBytes:verified.reduce((s,e)=>s+e.bytes,0),loadedBytes:list.reduce((s,e)=>s+Math.min(e.bytes,records.get(e.url)?.bytes||0),0),totalBytes:list.reduce((s,e)=>s+e.bytes,0),cacheMode:count.cacheMode});};
  listeners.add(progress);progress();
  try{const work=Promise.all(list.map(e=>fetchAsset(e.url,{priority})));await (Number.isFinite(timeoutMs)?Promise.race([work,new Promise((_resolve,reject)=>{timer=host.setTimeout(()=>{pause();reject(Error('Loading time limit reached. Retry when your connection is ready.'));},timeoutMs);})]):work);progress();return {state:'ready',cacheMode:count.cacheMode};}
  finally{host.clearTimeout(timer);listeners.delete(progress);}
 }
 return {manifest,base:base.href,fetchAsset,prepare,preparePack:(pack,o)=>prepare(manifest.entries.filter(e=>e.pack===pack).map(e=>e.url),o),pause,resume(){paused=false;drain();},stats:()=>({...count,active,queued:queue.length,verifiedFiles:[...records.values()].filter(r=>r.ready).length,verifiedBytes:[...records.entries()].filter(([,r])=>r.ready).reduce((sum,[url])=>sum+entry(url).bytes,0)}),destroy(){dead=true;pause();listeners.clear();},cacheName};
}
const api={create};if(typeof module!=='undefined')module.exports=api;else root.STMAssetReadiness=api;
})(typeof window!=='undefined'?window:globalThis);
