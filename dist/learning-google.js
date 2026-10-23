/* Google-hosted receiver transport. No iframe is created until delivery begins. */
(function(root,factory){'use strict';if(typeof module==='object'&&module.exports)module.exports=factory(root);else root.DCLearningGoogle=factory(root);})(globalThis,function(root){'use strict';
 function normalizeURL(value){
  if(typeof value!=='string')throw Error('Use a Google Apps Script web-app /exec link.');
  value=value.trim();if(!value)return '';
  let url;try{url=new URL(value);}catch{throw Error('Use a Google Apps Script web-app /exec link.');}
  if(url.origin!=='https://script.google.com'||url.username||url.password||url.search||url.hash||!/^\/macros\/s\/[A-Za-z0-9_-]{10,300}\/exec$/.test(url.pathname))throw Error('Use the deployed Google Apps Script /exec link, not a Drive or spreadsheet link.');
  return url.href;
 }
 const googleOrigin=value=>typeof value==='string'&&(value==='https://script.google.com'||value==='https://script.googleusercontent.com'||/^https:\/\/[a-z0-9-]+-script\.googleusercontent\.com$/.test(value));
 function originOf(host){try{const value=/^https?:$/.test(host.location.protocol)?host.location.origin:host.origin;return /^https?:\/\//.test(value)?new URL(value).origin:null;}catch{return null;}}
 const error=(message,name)=>Object.assign(Error(message),name?{name}:{});
 function createTransport(options){
  const host=options.host||root,url=normalizeURL(options.url);if(!url)throw Error('A deployed Google collection link is required.');
  const timeoutMs=options.timeoutMs||15000,delay=host.setTimeout.bind(host),cancel=host.clearTimeout.bind(host),pending=new Map();
  let portal=host;try{if(host.top&&host.top.location.origin===originOf(host))portal=host.top;}catch{}
  const parentOrigin=originOf(portal);let frame=null,port=null,channel=null,boot=null,bootResolve=null,bootReject=null,bootTimer=null,sequence=0,closed=false,connected=false;
  function clearBootTimer(){if(bootTimer!==null){cancel(bootTimer);bootTimer=null;}}
  function failBoot(reason){clearBootTimer();portal.removeEventListener('message',onReady);bootReject?.(reason);bootResolve=null;bootReject=null;frame?.remove();frame=null;port?.close();port=null;boot=null;connected=false;}
  function onPort(event){
   const data=event.data;if(!data||data.protocolVersion!==1)return;
   if(data.type==='stm-google-connected'&&!connected){connected=true;clearBootTimer();bootResolve?.();bootResolve=null;bootReject=null;return;}
   if(!connected||data.type!=='stm-google-reply'||typeof data.requestId!=='string')return;
   const request=pending.get(data.requestId);if(!request)return;
   const response=data.response;
   if(!response||!Number.isInteger(response.status)||response.status<200||response.status>599||!response.body||typeof response.body!=='object'||Array.isArray(response.body)){request.finish(error('Google receiver returned an invalid response.'));return;}
   request.finish(null,{ok:response.status>=200&&response.status<300,status:response.status,json:async()=>JSON.parse(JSON.stringify(response.body))});
  }
  function onReady(event){
   const data=event.data;if(closed||port||!data||data.type!=='stm-google-ready'||data.protocolVersion!==1||data.channel!==channel||!googleOrigin(event.origin)||!event.source||typeof event.source.postMessage!=='function')return;
   // HtmlService has its own inner iframe: its source differs from frame.contentWindow.
   // A fresh nonce authenticates bootstrap; the transferred port authenticates replies.
   try{const pair=new (portal.MessageChannel||host.MessageChannel)();port=pair.port1;port.onmessage=onPort;port.start?.();portal.removeEventListener('message',onReady);event.source.postMessage({type:'stm-google-connect',protocolVersion:1,channel},event.origin,[pair.port2]);}catch{failBoot(error('Google receiver is unavailable.'));}
  }
  function ensureReady(){
   if(closed)return Promise.reject(error('Google delivery is closed.'));
   if(connected)return Promise.resolve();if(boot)return boot;
   if(!parentOrigin||!portal.document||host.STMDevMode||portal.STMDevMode)return Promise.reject(error('Google collection requires the ordinary HTTP game.'));
   try{const bytes=new Uint8Array(32);host.crypto.getRandomValues(bytes);channel=[...bytes].map(n=>n.toString(16).padStart(2,'0')).join('');}catch{return Promise.reject(error('Secure Google delivery is unavailable.'));}
   boot=new Promise((resolve,reject)=>{bootResolve=resolve;bootReject=reject;});const result=boot;
   portal.addEventListener('message',onReady);frame=portal.document.createElement('iframe');frame.hidden=true;frame.inert=true;frame.title='Education collection';frame.setAttribute('aria-hidden','true');frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms');
   const target=new URL(url);target.searchParams.set('stmNonce',channel);target.searchParams.set('stmParentOrigin',parentOrigin);frame.src=target.href;
   bootTimer=delay(()=>failBoot(error('Google receiver timed out. Check its deployment and game address.')),timeoutMs);
   (portal.document.body||portal.document.documentElement).appendChild(frame);return result;
  }
  function abortable(promise,signal){
   if(!signal)return promise;if(signal.aborted)return Promise.reject(error('Google delivery aborted.','AbortError'));
   return new Promise((resolve,reject)=>{const onAbort=()=>{signal.removeEventListener('abort',onAbort);reject(error('Google delivery aborted.','AbortError'));};signal.addEventListener('abort',onAbort,{once:true});promise.then(value=>{signal.removeEventListener('abort',onAbort);resolve(value);},reason=>{signal.removeEventListener('abort',onAbort);reject(reason);});});
  }
  async function fetchAdapter(address,init={}){
   if(closed)throw error('Google delivery is closed.');
   let target;try{target=new URL(address,parentOrigin);}catch{throw error('Invalid receiver address.');}
   const match=/^\/api\/education\/(status|register|batch)$/.exec(target.pathname);
   if(!match||target.origin!==parentOrigin||target.search||target.hash)throw error('Invalid receiver origin or route.');
   const action=match[1],method=(init.method||'GET').toUpperCase();if(method!==(action==='status'?'GET':'POST'))throw error('Invalid receiver method.');
   const header=name=>typeof init.headers?.get==='function'?init.headers.get(name):Object.entries(init.headers||{}).find(([key])=>key.toLowerCase()===name.toLowerCase())?.[1];
   const request={protocolVersion:1,action,body:action==='status'?null:JSON.parse(init.body),clientId:header('X-STM-Client-Id')||null,secret:/^Bearer [a-f0-9]{64}$/.test(header('Authorization')||'')?header('Authorization').slice(7):null};
   if(JSON.stringify(request).length>524288)throw error('Google collection batch is too large.');
   await abortable(ensureReady(),init.signal);if(closed)throw error('Google delivery is closed.');if(init.signal?.aborted)throw error('Google delivery aborted.','AbortError');
   return new Promise((resolve,reject)=>{
    const requestId=String(++sequence);let timer;
    const onAbort=()=>finish(error('Google delivery aborted.','AbortError'));
    function finish(reason,response){if(!pending.has(requestId))return;pending.delete(requestId);cancel(timer);init.signal?.removeEventListener('abort',onAbort);reason?reject(reason):resolve(response);}
    pending.set(requestId,{finish});timer=delay(()=>finish(error('Google receiver timed out.')),timeoutMs);init.signal?.addEventListener('abort',onAbort,{once:true});
    try{port.postMessage({type:'stm-google-request',protocolVersion:1,requestId,request});}catch{finish(error('Google receiver is unavailable.'));}
   });
  }
  function close(){if(closed)return;closed=true;for(const request of [...pending.values()])request.finish(error('Google delivery is closed.'));failBoot(error('Google delivery is closed.'));}
  return {fetch:fetchAdapter,close};
 }
 return {normalizeURL,createTransport};
});
