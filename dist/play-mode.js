/* One player preference. Network hints never grant permission for pet API calls. */
(function(root){'use strict';
const key='slay-the-math.play-mode.v1';
function create({host=root,requestTimeoutMs=12000}={}){
 const listeners=new Set(),requests=new Set();let epoch=0,state={mode:'online',explicit:false,persisted:false};
 function parse(raw){try{const x=JSON.parse(raw);if(x?.version===1&&['online','offline'].includes(x.mode)&&x.chosen===true)return {mode:x.mode,explicit:true,persisted:true};}catch(_){}return {mode:'online',explicit:false,persisted:false};}
 try{state=parse(host.localStorage?.getItem(key));}catch(_){}
 const canUsePetAPI=()=>state.mode==='online'&&state.explicit;
 function snapshot(){return {...state,connectionHint:host.navigator?.onLine===false?'disconnected':'unknown',petAPIAllowed:canUsePetAPI()};}
 function changed(next){state=next;epoch++;for(const r of requests){r.controller.abort();r.reject(Error('Player mode changed; pet request cancelled.'));}for(const fn of listeners)fn(snapshot());host.dispatchEvent?.(new host.CustomEvent('stm-play-mode-change',{detail:snapshot()}));return snapshot();}
 function set(mode){if(!['online','offline'].includes(mode))throw Error('Choose Online or Offline.');let persisted=false;try{host.localStorage?.setItem(key,JSON.stringify({version:1,mode,chosen:true}));persisted=!!host.localStorage;}catch(_){}return changed({mode,explicit:true,persisted});}
 function requestOnline(work){
  if(!canUsePetAPI())return Promise.reject(Error('Select Online in Settings before using the pet API.'));
  const token=epoch,controller=new host.AbortController();let timer,reject;
  const cancelled=new Promise((_resolve,no)=>reject=no),record={controller,reject};requests.add(record);
  timer=host.setTimeout(()=>{controller.abort();reject(Error('Pet API request timed out.'));},requestTimeoutMs);
  const action=Promise.resolve().then(()=>{if(epoch!==token||!canUsePetAPI())throw Error('Player mode changed; pet request cancelled.');return work(controller.signal);}).then(value=>{if(epoch!==token||!canUsePetAPI()||controller.signal.aborted)throw Error('Player mode changed; pet request cancelled.');return value;});
  return Promise.race([action,cancelled]).finally(()=>{host.clearTimeout(timer);requests.delete(record);});
 }
 host.addEventListener?.('storage',event=>{if(event.key===key)changed(parse(event.newValue));});
 return {protocol:'stm-play-mode-v1',snapshot,set,canUsePetAPI,requestOnline,subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);}};
}
const api={key,create};if(typeof module!=='undefined')module.exports=api;else root.STMPlayMode=create({host:root});
})(typeof window!=='undefined'?window:globalThis);
