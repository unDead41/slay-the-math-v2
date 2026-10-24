/* Static production access gate. Convenience lock, not server authentication. */
(function(){'use strict';
 const script=document.currentScript,home=new URL('./',script.src),key='slay-the-math.prod-dev-unlocked.v1';
 let session;try{session=window.sessionStorage;}catch{}
 let fallback=false,pending=null;
 const authorized=()=>{try{return session?session.getItem(key)==='on':fallback;}catch{return fallback;}};
 function set(value){fallback=!!value;try{if(value)session?.setItem(key,'on');else session?.removeItem(key);}catch{}return authorized();}
 function requestEnable(){
  if(authorized())return Promise.resolve(true);if(pending)return pending;
  pending=new Promise(resolve=>{
   const dialog=document.createElement('dialog');dialog.id='dev-password-dialog';dialog.setAttribute('aria-labelledby','dev-password-title');dialog.style.cssText='max-width:360px;width:calc(100% - 40px);box-sizing:border-box;background:#171e2b;color:#f8f2e7;border:1px solid #b99c65;border-radius:12px;padding:22px;font:16px system-ui';
   dialog.innerHTML='<form><h2 id="dev-password-title">Unlock Dev Mode</h2><p>Enter the developer password.</p><label for="dev-password">Password</label><input id="dev-password" type="password" autocomplete="off" required style="display:block;width:100%;box-sizing:border-box;margin:10px 0;padding:10px;font:inherit"><p id="dev-password-error" role="alert" hidden>Incorrect password. Try again.</p><div style="display:flex;gap:12px;margin-top:16px"><button type="button" data-dev-cancel>Cancel</button><button type="submit">Unlock</button></div></form>';
   document.body.append(dialog);const input=dialog.querySelector('input');
   function finish(ok){dialog.close();dialog.remove();pending=null;resolve(ok);}
   dialog.querySelector('form').addEventListener('submit',e=>{e.preventDefault();if(input.value==='demo41'){set(true);finish(true);}else{dialog.querySelector('[role=alert]').hidden=false;input.value='';input.focus();}});
   dialog.querySelector('[data-dev-cancel]').addEventListener('click',()=>finish(false));dialog.addEventListener('cancel',e=>{e.preventDefault();finish(false);});dialog.showModal();input.focus();
  });return pending;
 }
 window.STMDevMode={get:authorized,set,requestEnable,hubUrl:new URL('__dev/index.html',home).href,production:true};
 window.STMDevAccess={authorized,requestEnable,home:home.href,lock(){set(false);location.href=home.href;}};
})();
