/* The Hub does not load its preview until production access is unlocked. */
window.addEventListener('DOMContentLoaded',async()=>{
 if(!window.STMDevAccess.authorized()&&!await window.STMDevAccess.requestEnable()){location.replace(window.STMDevAccess.home);return;}
 document.getElementById('dev-hub-content').hidden=false;
 const preview=document.getElementById('preview');preview.src=preview.dataset.src;
 const lock=document.createElement('button');lock.textContent='Dev OFF · Return to Game';lock.addEventListener('click',()=>window.STMDevAccess.lock());document.querySelector('header').append(lock);
});
