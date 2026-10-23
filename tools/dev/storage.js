/* Runs before every game module in a developer frame, including practice frames. */
(function(){'use strict';
 const key='slay-the-math.dev-enabled.v1';
 let nativeSession,enabled=false;try{nativeSession=window.sessionStorage;enabled=nativeSession.getItem(key)==='on';}catch{}
 if(location.pathname==='/__dev/sandbox/')enabled=true;
 window.STMDevMode={get:()=>enabled,set(value){enabled=!!value;try{nativeSession?.setItem(key,enabled?'on':'off');}catch{}return enabled;}};
 function memory(){const values=new Map();return {get length(){return values.size;},key:i=>[...values.keys()][i]??null,getItem:k=>values.get(String(k))??null,setItem:(k,v)=>values.set(String(k),String(v)),removeItem:k=>values.delete(String(k)),clear:()=>values.clear()};}
 // Own properties are inherited by same-origin generated practice documents via
 // their own bootstrap below. Only the developer toggle uses a native session key.
 Object.defineProperty(window,'localStorage',{value:memory(),configurable:false});
 Object.defineProperty(window,'sessionStorage',{value:memory(),configurable:false});
 window.addEventListener('DOMContentLoaded',()=>{
  const badge=document.createElement('div');badge.id='dev-sandbox-badge';badge.textContent='DEV SESSION · temporary progress';badge.style.cssText='position:fixed;bottom:4px;left:8px;z-index:99999;background:#f5cb6b;color:#111;padding:4px 10px;font:12px system-ui;pointer-events:none';document.body.append(badge);
 });
})();
