/* Select a collection destination without sharing its consent, identity or receipts. */
(function(root,factory){'use strict';if(typeof module==='object'&&module.exports)module.exports=factory(root,require('./learning-sync.js'),require('./learning-google.js'),require('./learning-analytics.js'));else root.DCLearningDelivery=factory(root,root.DCLearningSync,root.DCLearningGoogle,root.DCAnalytics);})(globalThis,function(root,Sync,Google,Analytics){'use strict';
 const DESTINATION_KEY='slay-the-math.learning-destination.v1',BASE=Sync.STORAGE_KEY;
 const clone=value=>JSON.parse(JSON.stringify(value));
 function createClient(options={}){
  const host=options.host||root,storage=options.storage,known=new Map();let current,transport=null,url='',configError='',started=false,changing=false;
  const defaultURL=options.googleScriptUrl===undefined?(host.DCLearningCollectionConfig?.googleScriptUrl||''):options.googleScriptUrl;
  function configuration(){
   try{const raw=storage?.getItem(DESTINATION_KEY);if(raw==null)return Google.normalizeURL(defaultURL);
    const saved=JSON.parse(raw);if(!saved||saved.schemaVersion!==1||Object.keys(saved).length!==2)throw Error();return Google.normalizeURL(saved.googleScriptUrl);
   }catch{configError='The saved collection link could not be read and has been kept. Choose a collection destination again.';return '';}
  }
  function prefix(value){return value?'slay-the-math.learning-sync.google.'+Analytics.fingerprint(value)+'.v1':BASE;}
  function scoped(value){
   if(!value)return {storage,host};const physical=prefix(value),toReal=key=>key.startsWith(BASE)?physical+key.slice(BASE.length):key;
   const toLogical=key=>typeof key==='string'&&(key===physical||key.startsWith(physical+'.'))?BASE+key.slice(physical.length):null;
   const listeners=new Map();
   const facade={};for(const key of ['crypto','location','origin','document','parent','navigator','AbortController','STMDevMode'])Object.defineProperty(facade,key,{get:()=>host[key]});
   for(const key of ['setTimeout','clearTimeout'])facade[key]=(host[key]||root[key]).bind(host);
   facade.addEventListener=(name,fn)=>{const mapped=name==='storage'?event=>{const key=event?.key===null?null:toLogical(event?.key);if(key!==null||event?.key===null)fn({key});}:fn;listeners.set(fn,mapped);host.addEventListener?.(name,mapped);};
   facade.removeEventListener=(name,fn)=>{host.removeEventListener?.(name,listeners.get(fn)||fn);listeners.delete(fn);};
   return {host:facade,storage:storage?{get length(){return keys().length;},key:i=>keys()[i]??null,getItem:key=>storage.getItem(toReal(key)),setItem:(key,value)=>storage.setItem(toReal(key),value)}:undefined};
   function keys(){const found=[];for(let i=0;i<storage.length;i++){const key=toLogical(storage.key(i));if(key!==null)found.push(key);}return found;}
  }
  function remember(entry){if(!entry||!entry.payload||!Number.isSafeInteger(entry.revision))return;const before=known.get(entry.id);if(!before||entry.revision>=before.revision)known.set(entry.id,clone(entry));}
  function collect(){
   const state=current.status(),physical=prefix(url);
   // Include confirmed entries and immutable journals, so a new destination can
   // receive earlier observations and deletion tombstones after fresh consent.
   try{const raw=storage?.getItem(physical);if(raw){const saved=JSON.parse(raw);if(saved.schemaVersion===1&&Array.isArray(saved.entries))saved.entries.forEach(remember);}
    for(let i=0;storage&&i<storage.length;i++){const key=storage.key(i);if(key?.startsWith(physical+'.entry.')){try{const saved=JSON.parse(storage.getItem(key));if(saved.schemaVersion===1)remember(saved);}catch{}}}
   }catch{}
   state.pendingEntries.forEach(remember);
  }
  function closeTransport(){transport?.close();transport=null;}
  function changed(){if(!changing&&current&&typeof options.onchange==='function')try{options.onchange(status());}catch{}}
  function make(value,pause){
   const area=scoped(value);
   const fetch=value?(...args)=>{if(configError)return Promise.reject(Error(configError));if(!transport)transport=(options.createGoogleTransport||Google.createTransport)({url:value,host});return transport.fetch(...args);}:options.fetch;
   current=Sync.createClient({...options,...area,fetch,onchange:changed});
   if(pause||configError)current.setEnabled(false);
  }
  function destination(){let supplied='';try{supplied=Google.normalizeURL(defaultURL);}catch{}return {kind:url?'google-sheets':'local',url,canUseDefault:!!supplied&&(!!configError||supplied!==url)};}
  function status(){const value=current.status();return {...value,...(configError?{enabled:false,state:'save-error',error:configError}:{}),destination:destination()};}
  function apply(value,persist){
   value=Google.normalizeURL(value);collect();changing=true;
   try{
    // Persist the choice before replacing the active client; failure leaves its
    // queued data and original configuration intact.
    if(persist){if(!storage)throw Error('The collection link could not be saved on this device.');storage.setItem(DESTINATION_KEY,JSON.stringify({schemaVersion:1,googleScriptUrl:value}));}
    current.setEnabled(false);current.stop();closeTransport();url=value;configError='';make(url,true);
    const retained=[...known.values()];known.clear();for(const entry of retained)try{const result=current.enqueue({id:entry.id,kind:entry.kind,payload:entry.payload});if(result.entry)remember(result.entry);}catch{}
    if(started)current.start();
   }finally{changing=false;}
   changed();return status();
  }
  function storageChanged(event){if(event?.key!==DESTINATION_KEY&&event?.key!==null)return;const previous=configError;configError='';const value=configuration();if(configError){current.setEnabled(false);current.stop();closeTransport();changed();return;}if(value!==url||previous)apply(value,false);}
  function enqueue(input){const result=current.enqueue(input);if(result.entry)remember(result.entry);return result;}
  function setEnabled(value){if(value&&configError)throw Error(configError);const result=current.setEnabled(value);if(!value)closeTransport();return {...result,destination:destination()};}
  function flush(){return configError?Promise.resolve(status()):current.flush().then(status);}
  function start(){if(!started){started=true;host.addEventListener?.('storage',storageChanged);storageChanged({key:DESTINATION_KEY});if(!configError)current.start();}return status();}
  function stop(){started=false;host.removeEventListener?.('storage',storageChanged);current.stop();closeTransport();return status();}
  url=configuration();make(url,false);
  function useDefaultDestination(){const value=Google.normalizeURL(defaultURL);if(!value)throw Error('The organiser has not configured a Google collection link for this game.');return apply(value,true);}
  return {enqueue,setEnabled,status,flush,start,stop,setDestination:value=>apply(value,true),useDefaultDestination};
 }
 return {DESTINATION_KEY,createClient};
});
