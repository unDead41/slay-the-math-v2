/* Content-verified, project-scoped downloads. No game state or random numbers. */
(function(root){'use strict';
function startupPlan(manifest){
 const entries=new Map(manifest.entries.map(e=>[e.url,e])),required=manifest.entries.filter(e=>e.pack==='core'&&e.required).map(e=>e.url);
 const urls=[...new Set([...required,...(manifest.startup?.urls||[])])].filter(url=>entries.has(url));
 const ratio=manifest.startup?.ratio===undefined?1:Math.min(1,Math.max(.75,Number(manifest.startup.ratio)||.75));
 const totalBytes=urls.reduce((sum,url)=>sum+entries.get(url).bytes,0),targetBytes=Math.ceil(totalBytes*ratio),beforeMenu=[...required];
 let selectedBytes=required.reduce((sum,url)=>sum+entries.get(url).bytes,0);const picked=new Set(required);
 for(const url of urls){if(selectedBytes>=targetBytes)break;if(!picked.has(url)){picked.add(url);beforeMenu.push(url);selectedBytes+=entries.get(url).bytes;}}
 return {urls,beforeMenu,totalBytes,targetBytes,selectedBytes,ratio};
}
// Keep only a few speculative fetches in flight. Foreground jobs use the same
// verified manager and can pass queued later-room work immediately.
function createBackgroundQueue({manager,canRun=()=>true,limit=()=>2,onChange=()=>{}}){
 const queued=new Map(),running=new Set(),failed=new Map();let dead=false,retryEpoch=0;
 function pump(){
  if(dead)return;
  while(running.size<Math.max(1,Math.min(2,limit()))){
   const next=[...queued.values()].sort((a,b)=>a.priority-b.priority).find(job=>canRun(job.priority));if(!next)break;
   queued.delete(next.url);if(manager.available(next.url))continue;running.add(next.url);const startedEpoch=retryEpoch;
   manager.fetchAsset(next.url,{priority:Math.max(50,next.priority)}).catch(()=>{if(!dead){if(startedEpoch!==retryEpoch)queued.set(next.url,next);else failed.set(next.url,next);}}).finally(()=>{running.delete(next.url);if(!dead){onChange();pump();}});
  }
  onChange();
 }
 function enqueue(url,priority=90){if(dead||running.has(url))return;if(manager.available(url)){failed.delete(url);return;}if(failed.has(url))return;const old=queued.get(url);queued.set(url,{url,priority:Math.min(priority,old?.priority??priority)});pump();}
 function stats(){for(const url of failed.keys())if(manager.available(url))failed.delete(url);return {queued:queued.size,active:running.size,failed:failed.size};}
 return {enqueue,pump,retry(){retryEpoch++;for(const job of failed.values())queued.set(job.url,job);failed.clear();pump();},stats,destroy(){dead=true;queued.clear();failed.clear();}};
}
function create(options){
 const host=options.host||root,base=new URL('.',options.base||host.document.baseURI),manifest=options.manifest;
 const entries=new Map(manifest.entries.map(e=>[new URL(e.url,base).pathname,e]));
 const queue=[],jobs=new Map(),records=new Map(),listeners=new Set(),memory=new Map(),persistent=new Set();let active=0,background=0,paused=false,dead=false,memoryBytes=0;
 const requestedBudget=Number(options.memoryBudgetBytes),memoryBudgetBytes=Number.isFinite(requestedBudget)&&requestedBudget>=0?Math.floor(requestedBudget):32*1024*1024;
 const count={requests:0,cacheHits:0,memoryHits:0,hashes:0,bytes:0,maxActive:0,cacheMode:'persistent'};
 const max=options.concurrency||4,bgMax=Math.min(max,options.backgroundConcurrency||2),delays=options.retryDelays||[1000,3000];
 const cachePrefix='stm-assets-'+encodeURIComponent(base.pathname)+'-',cacheName=cachePrefix+manifest.manifestId;
 let cachePromise,previousPromise,storageReadable=true,storageGeneration=0,reconciliation=null;
 function storageLost(){persistent.clear();storageReadable=false;count.cacheMode='online';}
 const cache=()=>cachePromise||(cachePromise=Promise.resolve().then(()=>options.cache!==undefined?options.cache:host.caches?.open(cacheName)).catch(()=>null).then(c=>{if(!c)storageLost();return c;}));
 const previous=()=>previousPromise||(previousPromise=Promise.resolve().then(async()=>options.cache!==undefined?[]:(await host.caches?.keys()||[]).filter(name=>name.startsWith(cachePrefix)&&name!==cacheName).reverse()).catch(()=>[]));
 function key(e){return new URL(e.url,base).href;}
 function memoryKey(e){return key(e)+'#'+e.sha256;}
 function trimMemory(){while(memoryBytes>memoryBudgetBytes){const victim=[...memory.entries()].find(([,v])=>v.background)||memory.entries().next().value;if(!victim)break;memory.delete(victim[0]);memoryBytes-=victim[1].blob.size;}}
 async function complete(job,response){
  if(job.cancelled||dead)throw Error('Download cancelled');
  if(memoryBudgetBytes&&job.entry.bytes<=memoryBudgetBytes){
   const blob=await response.clone().blob();if(job.cancelled||dead)throw Error('Download cancelled');
   if(blob.size<=memoryBudgetBytes){const k=memoryKey(job.entry),prior=memory.get(k);if(prior)memoryBytes-=prior.blob.size;memory.delete(k);memory.set(k,{blob,headers:[...response.headers],background:!job.foreground});memoryBytes+=blob.size;trimMemory();}
  }
  records.set(job.entry.url,{bytes:job.entry.bytes,ready:true});emit();return response;
 }
 function entry(url){const u=new URL(url,base);if(u.origin!==base.origin||!entries.has(u.pathname))throw Error('Unknown manifest asset');return entries.get(u.pathname);}
 function emit(){for(const fn of listeners)fn();}
 async function digest(bytes){count.hashes++;const hash=await host.crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(hash),v=>v.toString(16).padStart(2,'0')).join('');}
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
 async function perform(job){const e=job.entry,generation=storageGeneration,c=await cache(),remember=()=>{if(storageReadable&&generation===storageGeneration)persistent.add(e.url);};
  if(job.cancelled)throw Error('Download cancelled');
  if(c){try{const saved=await c.match(key(e));if(await valid(saved,e)){if(job.cancelled)throw Error('Download cancelled');remember();count.cacheHits++;return complete(job,saved);}persistent.delete(e.url);if(saved)await c.delete(key(e));}catch(_){if(job.cancelled)throw Error('Download cancelled');storageLost();}}
  // Reuse unchanged bytes after an update; the new digest is always authoritative.
  for(const name of await previous()){
   if(job.cancelled)throw Error('Download cancelled');
   try{const saved=await (await host.caches.open(name)).match(key(e));if(!await valid(saved,e))continue;if(job.cancelled)throw Error('Download cancelled');if(c)try{await c.put(key(e),saved.clone());remember();}catch(_){count.cacheMode='online';}count.cacheHits++;return complete(job,saved);}catch(_){if(job.cancelled)throw Error('Download cancelled');}
  }
  let response;
  for(let attempt=0;;attempt++){
   try{response=await request(e,job);break;}catch(error){if(job.cancelled||dead||attempt>=delays.length||error.retryable===false)throw error;await new Promise(resolve=>host.setTimeout(resolve,error.retryAfter||delays[attempt]));}
  }
  if(job.cancelled)throw Error('Download cancelled');
  if(c)try{await c.put(key(e),response.clone());remember();}catch(_){count.cacheMode='online';}
  return complete(job,response);
 }
 function drain(){if(paused||dead)return;queue.sort((a,b)=>a.priority-b.priority);
  while(active<max){const i=queue.findIndex(j=>j.priority<50||background<bgMax);if(i<0)return;const job=queue.splice(i,1)[0];active++;if(job.priority>=50)background++;count.maxActive=Math.max(count.maxActive,active);
   perform(job).then(job.resolve,job.reject).finally(()=>{active--;if(job.priority>=50)background--;if(jobs.get(job.entry.url)===job)jobs.delete(job.entry.url);emit();drain();});
  }
 }
 function fetchAsset(url,{priority=0}={}){
  let e;try{e=entry(url);}catch(error){return Promise.reject(error);}
  if(dead||paused)return Promise.reject(Error('Download cancelled'));
  const k=memoryKey(e),saved=memory.get(k);if(saved){memory.delete(k);if(priority<50)saved.background=false;memory.set(k,saved);count.memoryHits++;return Promise.resolve(new host.Response(saved.blob,{status:200,headers:saved.headers}));}
  let job=jobs.get(e.url);if(job?.cancelled){jobs.delete(e.url);job=null;}
  if(!job){job={entry:e,priority,foreground:priority<50,cancelled:false,controller:null};job.promise=new Promise((resolve,reject)=>{job.resolve=resolve;job.reject=reject;});jobs.set(e.url,job);queue.push(job);drain();}
  else{if(priority<50)job.foreground=true;if(priority<job.priority&&queue.includes(job)){job.priority=priority;drain();}}
  return job.promise.then(response=>response.clone());
 }
 function pause(){paused=true;for(const job of jobs.values()){job.cancelled=true;job.controller?.abort();}for(const job of queue.splice(0)){job.reject(Error('Download cancelled'));jobs.delete(job.entry.url);}}
 function available(url){const e=entry(url);return persistent.has(e.url)||memory.has(memoryKey(e));}
 function reconcile({retryStorage=false}={}){
  if(reconciliation)return retryStorage?reconciliation.then(()=>reconcile({retryStorage:true})):reconciliation;
  reconciliation=(async()=>{
   // Reopen by namespace: an old Cache handle can outlive CacheStorage.delete().
   storageGeneration++;cachePromise=null;const c=await cache();if(!c||dead)return progress();
   try{const keys=c.keys?await c.keys():await Promise.all([...records.keys()].map(async url=>await c.match(key(entry(url)))?key(entry(url)):null));
    if(dead)return progress();const present=new Set(keys.map(k=>typeof k==='string'?k:k?.url));persistent.clear();
    for(const [url,record]of records)if(record.ready&&present.has(key(entry(url))))persistent.add(url);
    storageReadable=true;if(retryStorage)count.cacheMode='persistent';
   }catch(_){storageLost();}return progress();
  })().finally(()=>{reconciliation=null;});return reconciliation;
 }
 function progress(urls=manifest.entries.map(e=>e.url)){
  const list=[...new Set(urls)].map(entry),verified=list.filter(e=>records.get(e.url)?.ready),retained=list.filter(e=>available(e.url));
  return {verifiedFiles:verified.length,totalFiles:list.length,verifiedBytes:verified.reduce((s,e)=>s+e.bytes,0),loadedBytes:list.reduce((s,e)=>s+Math.min(e.bytes,records.get(e.url)?.bytes||0),0),totalBytes:list.reduce((s,e)=>s+e.bytes,0),availableFiles:retained.length,availableBytes:retained.reduce((s,e)=>s+e.bytes,0),cacheMode:count.cacheMode};
 }
 async function prepare(urls,{onProgress=()=>{},priority=0,timeoutMs=180000}={}){
  const list=[...new Set(urls)].map(entry);let timer;
  const progress=()=>{const verified=list.filter(e=>records.get(e.url)?.ready);onProgress({state:verified.length===list.length?'ready':'downloading',verifiedFiles:verified.length,totalFiles:list.length,verifiedBytes:verified.reduce((s,e)=>s+e.bytes,0),loadedBytes:list.reduce((s,e)=>s+Math.min(e.bytes,records.get(e.url)?.bytes||0),0),totalBytes:list.reduce((s,e)=>s+e.bytes,0),cacheMode:count.cacheMode});};
  listeners.add(progress);progress();
  try{const work=Promise.all(list.map(e=>fetchAsset(e.url,{priority})));await (Number.isFinite(timeoutMs)?Promise.race([work,new Promise((_resolve,reject)=>{timer=host.setTimeout(()=>{pause();reject(Error('Loading time limit reached. Retry when your connection is ready.'));},timeoutMs);})]):work);progress();return {state:'ready',cacheMode:count.cacheMode};}
  finally{host.clearTimeout(timer);listeners.delete(progress);}
 }
 return {manifest,base:base.href,fetchAsset,prepare,progress,available,reconcile,get cacheMode(){return count.cacheMode;},preparePack:(pack,o)=>prepare(manifest.entries.filter(e=>e.pack===pack).map(e=>e.url),o),pause,resume(){paused=false;drain();},stats:()=>({...count,...progress(),active,queued:queue.length,memoryBytes,memoryEntries:memory.size,memoryBudgetBytes}),destroy(){dead=true;pause();listeners.clear();memory.clear();persistent.clear();memoryBytes=0;},cacheName};
}
const api={create,startupPlan,createBackgroundQueue};if(typeof module!=='undefined')module.exports=api;else root.STMAssetReadiness=api;
})(typeof window!=='undefined'?window:globalThis);
