/* Opt-in, same-origin education delivery. Gameplay never depends on this transport. */
(function(root,factory){'use strict';if(typeof module==='object'&&module.exports)module.exports=factory(root);else root.DCLearningSync=factory(root);})(typeof globalThis==='undefined'?this:globalThis,function(root){'use strict';
 const STORAGE_KEY='slay-the-math.learning-sync.v1',MAX_PENDING=5000,MAX_PAYLOAD=65536,RETRY_DELAYS=[1000,2000,5000,15000,60000];
 const capacityMessage='The sharing queue exceeds its 5,000-entry limit. New entries are paused; all pending entries remain available to download.';
 const ENTRY_PREFIX=STORAGE_KEY+'.entry.',RECEIPT_PREFIX=STORAGE_KEY+'.receipt.';
 const fingerprint=typeof module==='object'&&module.exports?require('./learning-analytics.js').fingerprint:value=>root.DCAnalytics.fingerprint(value);
 const journalKey=(prefix,entry)=>prefix+encodeURIComponent(entry.id)+'.'+entry.revision+'.'+fingerprint(entry.kind+'\n'+entry.signature);
 const kinds=new Set(['learning-record','question-feedback']),validId=id=>typeof id==='string'&&/^[A-Za-z0-9][A-Za-z0-9._:|/-]{0,299}$/.test(id);
 const copy=value=>JSON.parse(JSON.stringify(value));
 const fields=(value,keys)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===keys.length&&keys.every(key=>Object.prototype.hasOwnProperty.call(value,key));
 function canonical(value,depth){
  if((depth||0)>30)throw Error('The education entry is too deeply nested.');
  if(value===null||typeof value==='string'||typeof value==='boolean')return JSON.stringify(value);
  if(typeof value==='number'&&Number.isFinite(value))return JSON.stringify(value);
  if(Array.isArray(value))return '['+value.map(item=>canonical(item,(depth||0)+1)).join(',')+']';
  if(value&&typeof value==='object'&&(Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null))return '{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+canonical(value[key],(depth||0)+1)).join(',')+'}';
  throw Error('Education entries must contain only JSON data.');
 }
 function normalize(input){
  if(!input||!validId(input.id)||!kinds.has(input.kind)||!input.payload||typeof input.payload!=='object'||Array.isArray(input.payload))throw Error('Invalid education entry.');
  const signature=canonical(input.payload);if(signature.length>MAX_PAYLOAD)throw Error('The education entry is too large.');
  return {id:input.id,kind:input.kind,payload:JSON.parse(signature),signature};
 }
 function parseEntry(saved){
  const normalized=normalize(saved);if(!Number.isSafeInteger(saved.revision)||saved.revision<1||!Number.isSafeInteger(saved.acknowledgedRevision)||saved.acknowledgedRevision<0||saved.acknowledgedRevision>saved.revision)throw Error('Invalid outbox revision.');
  return {...normalized,revision:saved.revision,acknowledgedRevision:saved.acknowledgedRevision};
 }
 function parse(raw){
  if(raw===null||raw===undefined)return {enabled:false,identity:null,entries:new Map(),lastReceivedAt:null};
  const value=JSON.parse(raw);if(!value||value.schemaVersion!==1||typeof value.enabled!=='boolean'||!Array.isArray(value.entries))throw Error('Invalid outbox.');
  if(value.identity!==null&&(!value.identity||!/^[a-f0-9]{48}$/.test(value.identity.clientId)||!/^[a-f0-9]{64}$/.test(value.identity.secret)))throw Error('Invalid outbox identity.');
  const entries=new Map();for(const saved of value.entries){if(entries.has(saved.id))throw Error('Invalid duplicate outbox entry.');entries.set(saved.id,parseEntry(saved));}
  if(value.lastReceivedAt!==null&&(typeof value.lastReceivedAt!=='string'||!Number.isFinite(Date.parse(value.lastReceivedAt))))throw Error('Invalid receipt date.');
  return {enabled:value.enabled,identity:value.identity,entries,lastReceivedAt:value.lastReceivedAt};
 }
 function parseJournal(raw,key){
  const saved=JSON.parse(raw);if(!fields(saved,['schemaVersion','id','kind','payload','revision','acknowledgedRevision'])||saved.schemaVersion!==1)throw Error('Invalid entry journal.');const entry=parseEntry(saved),legacy=ENTRY_PREFIX+encodeURIComponent(entry.id);if(key!==legacy&&(key!==journalKey(ENTRY_PREFIX,entry)||entry.acknowledgedRevision!==0))throw Error('Invalid entry journal key.');return entry;
 }
 function parseReceipt(raw,key){
  const saved=JSON.parse(raw);if(!fields(saved,['schemaVersion','id','revision','kind','signature','receivedAt'])||saved.schemaVersion!==1||!validId(saved.id)||!kinds.has(saved.kind)||!Number.isSafeInteger(saved.revision)||saved.revision<1||typeof saved.signature!=='string'||saved.signature.length>MAX_PAYLOAD||typeof saved.receivedAt!=='string'||!Number.isFinite(Date.parse(saved.receivedAt)))throw Error('Invalid receipt journal.');
  if(normalize({id:saved.id,kind:saved.kind,payload:JSON.parse(saved.signature)}).signature!==saved.signature||(key!==RECEIPT_PREFIX+encodeURIComponent(saved.id)&&key!==journalKey(RECEIPT_PREFIX,saved)))throw Error('Invalid receipt signature.');return saved;
 }
 function createClient(options){
  options=options||{};const host=options.host||root,storage=options.storage,fetcher=options.fetch||(host.fetch&&host.fetch.bind(host)),entropy=options.crypto===undefined?host.crypto:options.crypto;
  const now=options.now||Date.now,delay=(host.setTimeout||root.setTimeout).bind(host),cancel=(host.clearTimeout||root.clearTimeout).bind(host);
  let enabled=false,enabledDirty=false,identity=null,entries=new Map(),dirty=new Set(),receiptDirty=new Map(),lastReceivedAt=null,storageError='',securityError='',networkError='',corrupt=false,receiverAvailable=false,sending=false,started=false,timer=null,inflight=null,abort=null,failures=0,generation=0;
  function isDev(){try{if(host.STMDevMode||host.parent&&host.parent!==host&&host.parent.STMDevMode)return true;}catch{}return false;}
  function isOnline(){try{return typeof options.online==='function'?options.online():options.online===undefined?!(host.navigator&&host.navigator.onLine===false):!!options.online;}catch{return false;}}
  function isVisible(){return host.document?.visibilityState!=='hidden';}
  function timestamp(){const value=now();return new Date(typeof value==='string'?Date.parse(value):value).toISOString();}
  function journalAvailable(){return !!storage&&typeof storage.key==='function'&&Number.isSafeInteger(storage.length)&&storage.length>=0;}
  function mergeEntry(id,value){
   const local=entries.get(id);
   if(!local||value.revision>local.revision){if(dirty.has(id)&&local&&local.signature!==value.signature)entries.set(id,{...local,revision:value.revision+1,acknowledgedRevision:value.acknowledgedRevision});else entries.set(id,value);}
   else if(value.revision===local.revision){if(value.signature===local.signature&&value.kind===local.kind)local.acknowledgedRevision=Math.max(local.acknowledgedRevision,value.acknowledgedRevision);else if(dirty.has(id))entries.set(id,{...local,revision:value.revision+1,acknowledgedRevision:value.acknowledgedRevision});else entries.set(id,value);}
  }
  function mergeLatest(){
   let readProblem=false;corrupt=false;
   function problem(error){readProblem=true;corrupt=corrupt||error instanceof SyntaxError||/^Invalid|^Education entries|^The education entry/.test(error.message);storageError=corrupt?'Saved sharing data could not be read and has been kept. Download pending entries before leaving.':'Sharing data could not be saved on this device. Download pending entries before leaving.';}
   if(!storage){problem(Error('Storage unavailable'));return false;}
   try{
    const disk=parse(storage.getItem(STORAGE_KEY));
    if(!enabledDirty)enabled=disk.enabled;if(disk.identity)identity=disk.identity;
    if(disk.lastReceivedAt&&(!lastReceivedAt||disk.lastReceivedAt>lastReceivedAt))lastReceivedAt=disk.lastReceivedAt;
    for(const [id,value] of disk.entries)mergeEntry(id,value);
   }catch(error){problem(error);}
   // The aggregate is a projection. Damage to it must not hide independent,
   // healthy journal entries; preserve its bytes and keep those entries exportable.
   try{
    if(journalAvailable()){
     const keys=new Set(),receipts=[];for(let i=0;i<storage.length;i++){const key=storage.key(i);if(typeof key==='string'&&(key.startsWith(ENTRY_PREFIX)||key.startsWith(RECEIPT_PREFIX)))keys.add(key);}
     // Immutable payload journals retain every committed revision even when a
     // slower tab writes an older projection or finishes its journal write last.
     for(const key of keys){try{const raw=storage.getItem(key);if(raw===null)continue;if(key.startsWith(ENTRY_PREFIX)){const value=parseJournal(raw,key);mergeEntry(value.id,value);}else receipts.push(parseReceipt(raw,key));}catch(error){problem(error);}}
     for(const receipt of receipts){const current=entries.get(receipt.id);if(current&&current.revision===receipt.revision&&current.kind===receipt.kind&&current.signature===receipt.signature)current.acknowledgedRevision=receipt.revision;if(!lastReceivedAt||receipt.receivedAt>lastReceivedAt)lastReceivedAt=receipt.receivedAt;}
    }
   }catch(error){problem(error);}
   return !readProblem;
  }
  function pending(){return [...entries.values()].filter(e=>e.revision>e.acknowledgedRevision);}
  function persist(){
   if(!mergeLatest()||corrupt)return false;
   try{
    if(journalAvailable()){
     for(const entry of entries.values()){const key=journalKey(ENTRY_PREFIX,entry);if(storage.getItem(key)===null){const {signature,...value}=entry;storage.setItem(key,JSON.stringify({schemaVersion:1,...value,acknowledgedRevision:0}));}}
     // ACK writes never replace a payload key. A delayed ACK therefore cannot
     // erase a concurrent edit, even if it lands between our final read/write.
     for(const [id,receipt] of receiptDirty){const current=entries.get(id);if(current&&current.revision===receipt.revision&&current.kind===receipt.kind&&current.signature===receipt.signature){const key=journalKey(RECEIPT_PREFIX,receipt);if(storage.getItem(key)===null)storage.setItem(key,JSON.stringify(receipt));}}
    }
    storage.setItem(STORAGE_KEY,JSON.stringify({schemaVersion:1,enabled,identity,entries:[...entries.values()].map(({signature,...value})=>value),lastReceivedAt}));dirty.clear();receiptDirty.clear();enabledDirty=false;storageError='';return true;
   }catch{storageError='Sharing data could not be saved on this device. Download pending entries before leaving.';return false;}
  }
  function status(){
   mergeLatest();const waiting=pending(),capacityProblem=waiting.length>MAX_PENDING?capacityMessage:'',error=storageError||securityError||capacityProblem||networkError;
   const state=storageError||securityError||capacityProblem?'save-error':!enabled||isDev()?'on-device':sending?'sending':!isOnline()?'offline':networkError?'unavailable':waiting.length?'waiting':lastReceivedAt?'received':'waiting';
   return {enabled,pending:waiting.length,state,error,sending,receiverAvailable,lastReceivedAt,pendingEntries:waiting.map(({signature,acknowledgedRevision,...entry})=>copy(entry))};
  }
  function changed(){if(typeof options.onchange==='function')try{options.onchange(status());}catch{}}
  function clearRetry(){if(timer!==null){cancel(timer);timer=null;}}
  function schedule(wait){clearRetry();if(!started||!enabled||isDev()||!isOnline()||!isVisible()||!pending().length)return;timer=delay(()=>{timer=null;flush();},wait);}
  function enqueue(input){
   const value=normalize(input);mergeLatest();const previous=entries.get(value.id);
   if(previous&&previous.kind===value.kind&&previous.signature===value.signature){if(dirty.size||storageError)persist();return {changed:false,entry:copy({id:previous.id,kind:previous.kind,revision:previous.revision,payload:previous.payload}),error:storageError||(pending().length>MAX_PENDING?capacityMessage:'')};}
   if((!previous||previous.revision===previous.acknowledgedRevision)&&pending().length>=MAX_PENDING){storageError='The sharing queue is full. Download pending entries before adding more.';changed();return {changed:false,entry:null,error:storageError||(pending().length>MAX_PENDING?capacityMessage:'')};}
   if(previous&&previous.revision>=Number.MAX_SAFE_INTEGER){storageError='This sharing entry has reached its revision limit. Download pending entries.';changed();return {changed:false,entry:null,error:storageError||(pending().length>MAX_PENDING?capacityMessage:'')};}
   const next={...value,revision:previous?previous.revision+1:1,acknowledgedRevision:previous?previous.acknowledgedRevision:0};entries.set(next.id,next);dirty.add(next.id);persist();networkError='';failures=0;changed();if(started)schedule(0);return {changed:true,entry:copy({id:next.id,kind:next.kind,revision:next.revision,payload:next.payload}),error:storageError||(pending().length>MAX_PENDING?capacityMessage:'')};
  }
  function setEnabled(value){enabled=!!value;enabledDirty=true;persist();if(enabled)ensureIdentity();clearRetry();failures=0;networkError='';if(!enabled&&abort)abort.abort();if(enabled&&started)schedule(0);changed();return status();}
  function ensureIdentity(){
   if(identity)return true;
   try{if(!entropy||typeof entropy.getRandomValues!=='function')throw Error();const random=size=>{const bytes=new Uint8Array(size);entropy.getRandomValues(bytes);return [...bytes].map(value=>value.toString(16).padStart(2,'0')).join('');};identity={clientId:random(24),secret:random(32)};securityError='';return persist();}
   catch{securityError='Secure random storage is unavailable. Pending entries remain on this device.';return false;}
  }
  function baseEndpoint(){
   const endpoint=options.endpoint===undefined?'/api/education':options.endpoint;if(typeof endpoint!=='string')throw Error('Receiver address is invalid.');
   if(host.location){
    let origin=host.location.origin,documentBase=host.location.href;
    // srcdoc inherits the parent's origin even though its Location is about:.
    // A document base can choose a path, but cannot authorize another origin.
    if(/^about:(srcdoc|blank)$/.test(documentBase)&&typeof host.origin==='string'&&/^https?:\/\//.test(host.origin)){origin=new URL(host.origin).origin;documentBase=host.document&&host.document.baseURI;}
    const base=new URL(endpoint,documentBase);if(base.origin!==origin||!/^https?:$/.test(base.protocol)||base.search||base.hash)throw Error('The receiver must be on the game origin.');return base.href.replace(/\/$/,'');
   }
   if(!/^https?:\/\//.test(endpoint)&&!endpoint.startsWith('/'))throw Error('Receiver address is invalid.');return endpoint.replace(/\/$/,'');
  }
  async function request(url,init,token){
   if(!enabled||isDev()||!isOnline()||!isVisible()||token!==generation)throw Error('Delivery paused.');
   const controller=new (host.AbortController||root.AbortController)();abort=controller;const timeout=delay(()=>controller.abort(),10000);
   try{const response=await fetcher(url,{credentials:'same-origin',redirect:'error',cache:'no-store',...init,signal:controller.signal});if(!response||(!response.ok&&response.status!==409))throw Error('Receiver unavailable.');const data=await response.json();if(!enabled||isDev()||token!==generation)throw Error('Delivery paused.');if(response.status===409)throw Object.assign(Error('Receiver revision conflict.'),{status:409,body:data});return data;}finally{cancel(timeout);if(abort===controller)abort=null;}
  }
  async function deliver(token){
   mergeLatest();if(!enabled||isDev()||!isOnline()||!isVisible()||!pending().length)return status();
   if(typeof fetcher!=='function'){networkError='This browser cannot contact the receiver.';changed();return status();}
   if(!persist()||!ensureIdentity()){changed();return status();}
   sending=true;networkError='';changed();let success=false;
   try{
    const endpoint=baseEndpoint(),discovery=await request(endpoint+'/status',{method:'GET',headers:{Accept:'application/json'}},token);
    if(!discovery||discovery.protocolVersion!==1||discovery.enabled!==true)throw Error('No education receiver is configured.');receiverAvailable=true;
    const registration=await request(endpoint+'/register',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(identity)},token);
    if(!registration||registration.registered!==true)throw Error('Receiver registration failed.');
    let batch,reply;
    for(let attempt=0;attempt<2;attempt++){
     mergeLatest();batch=pending().slice(0,25).map(({signature,acknowledgedRevision,...value})=>copy(value));if(!batch.length){success=true;return status();}
     try{reply=await request(endpoint+'/batch',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json','X-STM-Client-Id':identity.clientId,Authorization:'Bearer '+identity.secret},body:JSON.stringify({entries:batch})},token);break;}
     catch(error){
      if(error.status!==409||attempt!==0)throw error;
      const conflicts=error.body&&error.body.conflicts,seen=new Set();if(!fields(error.body,['conflicts'])||!Array.isArray(conflicts)||!conflicts.length||conflicts.length>batch.length)throw Error('Receiver conflict response is invalid.');
      for(const conflict of conflicts){const sent=batch.find(entry=>entry.id===conflict?.id);if(!fields(conflict,['id','revision'])||!sent||seen.has(conflict.id)||!Number.isSafeInteger(conflict.revision)||conflict.revision<sent.revision)throw Error('Receiver conflict response is invalid.');seen.add(conflict.id);}
      mergeLatest();for(const conflict of conflicts){const current=entries.get(conflict.id);if(current&&current.revision<=conflict.revision){if(conflict.revision===Number.MAX_SAFE_INTEGER){storageError='This sharing entry has reached its revision limit. Download pending entries.';throw Error('Revision limit reached.');}entries.set(current.id,{...current,revision:conflict.revision+1});dirty.add(current.id);}}
      if(!persist())return status();changed();
     }
    }
    if(!reply||!Array.isArray(reply.acknowledged)||reply.acknowledged.length>batch.length)throw Error('Receiver acknowledgement is invalid.');
    const checked=new Set();for(const receipt of reply.acknowledged){if(!receipt||!validId(receipt.id)||!Number.isSafeInteger(receipt.revision)||!batch.some(e=>e.id===receipt.id&&e.revision===receipt.revision)||checked.has(receipt.id))throw Error('Receiver acknowledgement is invalid.');checked.add(receipt.id);}
    if(!reply.acknowledged.length)throw Error('The receiver has not acknowledged pending entries.');
    mergeLatest();const previous=new Map(),receivedAt=timestamp();for(const receipt of reply.acknowledged){const current=entries.get(receipt.id),sent=batch.find(e=>e.id===receipt.id);if(current&&current.revision===receipt.revision&&current.signature===canonical(sent.payload)){previous.set(current.id,current.acknowledgedRevision);current.acknowledgedRevision=receipt.revision;receiptDirty.set(current.id,{schemaVersion:1,id:current.id,revision:current.revision,kind:current.kind,signature:current.signature,receivedAt});}}
    const previousTime=lastReceivedAt;lastReceivedAt=receivedAt;if(!persist()){for(const [id,revision] of previous){receiptDirty.delete(id);const value=entries.get(id);if(value&&value.revision===reply.acknowledged.find(e=>e.id===id).revision)value.acknowledgedRevision=revision;}lastReceivedAt=previousTime;}else{success=true;failures=0;networkError='';}
   }catch(error){if(token===generation&&enabled&&!isDev()){networkError=error.message==='The receiver must be on the game origin.'?error.message:'The receiver is unavailable. Pending entries remain on this device.';failures++;}}
   finally{sending=false;changed();if(token===generation&&started){if(success&&pending().length)schedule(250);else if(!success&&failures)schedule(RETRY_DELAYS[Math.min(RETRY_DELAYS.length-1,failures-1)]);}}
   return status();
  }
  function flush(){if(inflight)return inflight;clearRetry();const token=generation,promise=deliver(token);inflight=promise;promise.finally(()=>{if(inflight===promise){inflight=null;if(token!==generation&&started)schedule(0);}});return promise;}
  function online(){failures=0;networkError='';clearRetry();if(started)flush();}
  function offline(){clearRetry();if(abort)abort.abort();changed();}
  function visibilityChanged(){if(isVisible())online();else offline();}
  function storageChanged(event){if(!event||event.key===null||event.key===STORAGE_KEY||typeof event.key==='string'&&(event.key.startsWith(ENTRY_PREFIX)||event.key.startsWith(RECEIPT_PREFIX))){mergeLatest();changed();if(started)schedule(0);}}
  function start(){if(started)return status();started=true;failures=0;if(host.addEventListener){host.addEventListener('online',online);host.addEventListener('offline',offline);host.addEventListener('storage',storageChanged);}host.document?.addEventListener?.('visibilitychange',visibilityChanged);flush();return status();}
  function stop(){started=false;generation++;clearRetry();if(abort)abort.abort();if(host.removeEventListener){host.removeEventListener('online',online);host.removeEventListener('offline',offline);host.removeEventListener('storage',storageChanged);}host.document?.removeEventListener?.('visibilitychange',visibilityChanged);return status();}
  mergeLatest();return {enqueue,setEnabled,status,flush,start,stop};
 }
 return {STORAGE_KEY,createClient};
});
