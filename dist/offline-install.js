/* Complete, release-bound browser installation. Readiness is based on disk bytes. */
(function(root){'use strict';
const protocol='stm-offline-v1',receiptPath='.__stm_offline__/complete.json';
function create({host=root,base,manifest,manager,ensureWorker=async()=>false}){
 base=new URL('.',base).href;
 const definition=manifest.offline,Encoder=host.TextEncoder||root.TextEncoder;
 if(definition?.schemaVersion!==1||!Array.isArray(definition.files)||!definition.files.length)throw Error('This release has no complete offline package.');
 const text=JSON.stringify(manifest),encoded=new Encoder().encode(text),files=definition.files.map(e=>({...e}));
 for(const e of files){const url=new URL(e.url,base);if(url.origin!==new URL(base).origin||!url.href.startsWith(base)||e.url.startsWith('/')||e.url.includes('..')||/^(?:__dev|api|backend|tools)\//.test(e.url)||!Number.isSafeInteger(e.bytes)||e.bytes<0||!/^[a-f0-9]{64}$/.test(e.sha256))throw Error('Unsafe offline package entry.');}
 const cacheName=manager?.cacheName||'stm-assets-'+encodeURIComponent(new URL(base).pathname)+'-'+manifest.manifestId;
 const listeners=new Set(),verified=new Set(),failures=new Map(),normal=new Set(manifest.entries.map(e=>e.url));
 let operation=null,operationKind=null,paused=false,manifestHash=null;
 const state={phase:'idle',ready:false,errorCode:null,error:null,currentFile:null,persistence:'unknown',workerReady:false,lastVerifiedAt:null};
 const absolute=url=>new URL(url,base).href;
 async function digest(bytes){return [...new Uint8Array(await host.crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');}
 async function descriptors(){if(!manifestHash)manifestHash=await digest(encoded);return [...files,{url:'asset-manifest.json',bytes:encoded.byteLength,sha256:manifestHash}];}
 function snapshot(){const list=[...files,{url:'asset-manifest.json',bytes:encoded.byteLength}],remaining=list.filter(e=>!verified.has(e.url)),totalBytes=list.reduce((s,e)=>s+e.bytes,0),verifiedBytes=list.filter(e=>verified.has(e.url)).reduce((s,e)=>s+e.bytes,0);return {...state,protocol,releaseId:definition.releaseId,manifestId:manifest.manifestId,cacheName,verifiedFiles:verified.size,totalFiles:list.length,verifiedBytes,totalBytes,remainingBytes:totalBytes-verifiedBytes,remainingFiles:remaining.map(e=>e.url),percent:totalBytes?Math.floor(verifiedBytes/totalBytes*100):0,failures:[...failures.values()]};}
 function emit(){const value=snapshot();for(const fn of listeners)fn(value);if(host.dispatchEvent&&host.CustomEvent)host.dispatchEvent(new host.CustomEvent('stm-offline-change',{detail:value}));return value;}
 function fail(error,code){state.ready=false;state.phase='error';state.errorCode=code||classify(error);state.error=String(error?.message||error);return emit();}
 function classify(error){return error?.name==='QuotaExceededError'||/quota|disk.*full|storage.*full/i.test(error?.message||'')?'quota':/storage|denied|cache/i.test(error?.message||'')?'storage':/fetch|network|connection|abort/i.test(error?.message||'')?'network':'download';}
 async function open(){if(!host.caches?.open)throw Object.assign(Error('Browser offline storage is unavailable.'),{offlineCode:'storage'});try{return await host.caches.open(cacheName);}catch(_){throw Object.assign(Error('Browser offline storage is unavailable.'),{offlineCode:'storage'});}}
 async function valid(response,entry){if(!response?.ok)return false;const bytes=await response.clone().arrayBuffer();return bytes.byteLength===entry.bytes&&await digest(bytes)===entry.sha256;}
 async function scan(cache){verified.clear();for(const e of await descriptors()){state.currentFile=e.url;let ok=false;try{ok=await valid(await cache.match(absolute(e.url)),e);}catch(_){throw Object.assign(Error('Offline storage could not be read.'),{offlineCode:'storage'});}if(ok){verified.add(e.url);failures.delete(e.url);}emit();}state.currentFile=null;}
 async function receiptValid(cache){try{const saved=await cache.match(absolute(receiptPath));if(!saved?.ok)return false;const r=await saved.json(),ok=r.protocol===protocol&&r.releaseId===definition.releaseId&&r.manifestId===manifest.manifestId&&r.manifestHash===manifestHash&&JSON.stringify(r.files)===JSON.stringify(files.map(e=>[e.url,e.bytes,e.sha256]));if(ok){try{state.persistence=host.navigator?.storage?.persisted?await host.navigator.storage.persisted():typeof r.persistence==='boolean'?r.persistence:'unknown';}catch(_){state.persistence='unknown';}}return ok;}catch(_){return false;}}
 async function workerReady(){try{state.workerReady=await ensureWorker()===true;}catch(_){state.workerReady=false;}return state.workerReady;}
 async function retained(cache){const keys=new Set((await cache.keys()).map(k=>typeof k==='string'?k:k.url));for(const e of await descriptors())if(!keys.has(absolute(e.url))){verified.delete(e.url);failures.set(e.url,{url:e.url,reason:'File disappeared before offline completion.',code:'missing'});}return verified.size===files.length+1;}
 async function committed(cache){await scan(cache);return verified.size===files.length+1&&await receiptValid(cache)&&await retained(cache);}
 function exclusive(kind,work){operationKind=kind;const p=Promise.resolve().then(work).catch(e=>fail(e,e.offlineCode)).finally(()=>{if(operation===p){operation=null;operationKind=null;}});operation=p;return p;}
 function audit(){if(operation)return operation;return exclusive('audit',async()=>{
  Object.assign(state,{phase:'checking',ready:false,error:null,errorCode:null});emit();const worker=await workerReady(),c=await open();await scan(c);
  if(worker&&await committed(await open())){state.phase='ready';state.ready=true;state.lastVerifiedAt=Date.now();}
  else state.phase='partial';return emit();
 });}
 async function write(cache,e,response){if(!await valid(response,e))throw Error('Content verification failed: '+e.url);await cache.put(absolute(e.url),response.clone());if(!await valid(await cache.match(absolute(e.url)),e))throw Object.assign(Error('Offline storage did not retain '+e.url),{offlineCode:'storage'});verified.add(e.url);failures.delete(e.url);emit();}
 async function responseFor(e){
  if(e.url==='asset-manifest.json')return new host.Response(text,{headers:{'content-type':'application/json; charset=utf-8'}});
  if(normal.has(e.url))return manager.fetchAsset(e.url,{priority:70});
  const u=new URL(e.url,base);u.searchParams.set('v',e.sha256);u.searchParams.set('stm-offline-file',definition.releaseId);
  const response=await host.fetch(u.href,{cache:'no-cache',signal:host.AbortSignal.timeout(30000)});if(!response.ok)throw Error('HTTP '+response.status+' loading '+e.url);return response;
 }
 function install(){
  paused=false;if(operation)return operationKind==='install'?operation:operation.then(()=>install());
  return exclusive('install',async()=>{
   Object.assign(state,{ready:false,phase:'checking',error:null,errorCode:null});emit();
   if(!await workerReady())return fail(Error('An active offline worker is required. Reload after finishing your run, then retry.'),'worker');
   let c=await open();await scan(c);
   if(verified.size===files.length+1){c=await open();if(await committed(c)){state.phase='ready';state.ready=true;state.lastVerifiedAt=Date.now();return emit();}}
   await c.delete(absolute(receiptPath));
   let estimate;try{estimate=await host.navigator?.storage?.estimate?.();}catch(_){}
   const needed=snapshot().remainingBytes;
   if(Number.isFinite(estimate?.quota)&&Number.isFinite(estimate?.usage)&&needed>Math.max(0,estimate.quota-estimate.usage))return fail(Error('Not enough browser storage. Free space, then resume this download.'),'quota');
   try{state.persistence=host.navigator?.storage?.persist?await host.navigator.storage.persist():'unknown';}catch(_){state.persistence=false;}
   manager?.resume();state.phase='downloading';emit();
   for(const e of await descriptors()){
    if(paused)break;if(verified.has(e.url))continue;state.currentFile=e.url;emit();
    try{await write(c,e,await responseFor(e));}
    catch(error){const code=error.offlineCode||classify(error);failures.set(e.url,{url:e.url,reason:String(error.message||error),code});verified.delete(e.url);state.errorCode=code;state.error=String(error.message||error);emit();if(['quota','storage','network'].includes(code))break;}
   }
   state.currentFile=null;if(paused){state.phase='paused';return emit();}
   // A deleted Cache namespace can leave a usable but orphaned old handle.
   // Reopen and rehash the namespace that a new browser process will find.
   state.phase='checking';emit();if(!await workerReady())return fail(Error('The offline worker is not ready. Reload and retry.'),'worker');c=await open();await scan(c);
   if(verified.size!==files.length+1){state.phase=state.errorCode?'error':'partial';return emit();}
   const receipt={protocol,releaseId:definition.releaseId,manifestId:manifest.manifestId,manifestHash,files:files.map(e=>[e.url,e.bytes,e.sha256]),persistence:state.persistence,completedAt:Date.now()};
   await c.put(absolute(receiptPath),new host.Response(JSON.stringify(receipt),{headers:{'content-type':'application/json'}}));
   c=await open();if(!await committed(c)){await c.delete(absolute(receiptPath));state.phase='partial';state.errorCode='missing';return emit();}
   Object.assign(state,{phase:'ready',ready:true,error:null,errorCode:null,lastVerifiedAt:Date.now()});return emit();
  });
 }
 async function reconcile(){if(operation||!state.ready)return snapshot();try{const c=await open(),keys=new Set((await c.keys()).map(x=>typeof x==='string'?x:x.url));for(const e of await descriptors())if(!keys.has(absolute(e.url)))verified.delete(e.url);if(verified.size!==files.length+1||!await receiptValid(c)){state.ready=false;state.phase='partial';emit();}}catch(e){fail(e,e.offlineCode);}return snapshot();}
 return {protocol,cacheName,snapshot,install,audit,reconcile,get phase(){return state.phase;},get ready(){return state.ready;},pause(){paused=true;if(operationKind==='install'){state.ready=false;state.phase='paused';emit();}},subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);}};
}
const api={create,protocol,receiptPath};if(typeof module!=='undefined')module.exports=api;else root.STMOfflineInstall=api;
})(typeof window!=='undefined'?window:globalThis);
