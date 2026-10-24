/* Shared controls injected into dev responses and the production build copy. */
{
 const mode=window.STMDevMode;
 function controls(where){
  const section=document.createElement('section');section.className='dev-mode-controls';section.dataset.devLocation=where;
  section.style.cssText='padding:10px;margin-top:8px;border:1px solid #8b795b;border-radius:8px;font:14px system-ui';
  const toggle=document.createElement('button');toggle.type='button';toggle.className='btn';toggle.dataset.devToggle=where;toggle.setAttribute('role','switch');toggle.setAttribute('aria-checked',String(mode.get()));toggle.textContent='Dev: '+(mode.get()?'ON':'OFF');
  toggle.addEventListener('click',async()=>{if(mode.get())mode.set(false);else if(mode.requestEnable){await mode.requestEnable();}else mode.set(true);render();refreshControls();document.querySelector('[data-dev-toggle="'+where+'"]')?.focus();});section.append(toggle);
  if(mode.get()){const link=document.createElement('a');link.href=mode.hubUrl||'/__dev/';link.className='btn';link.textContent='Open Developer Hub';link.style.marginLeft='8px';section.append(link);if(mode.production&&!window.STMDevApi){const copy=document.createElement('button');copy.type='button';copy.className='btn';copy.id='dev-copy-player-'+where;copy.textContent='Copy Player Run to Dev';copy.addEventListener('click',()=>{try{location.href=window.STMDevAccess.copySave(SAVE,location.search);}catch(error){toast(error.message,true);}});section.append(copy);}}

  const hint=document.createElement('p');hint.style.cssText='margin:6px 0 0;font-size:12px';hint.textContent=mode.production?'Player saves stay separate from temporary Dev previews.':'Development session · progress is temporary';section.append(hint);return section;
 }
 function refreshControls(){
  document.querySelectorAll('.dev-mode-controls').forEach(e=>e.remove());
  const panel=document.querySelector('#dialog .save-panel');if(panel)panel.prepend(controls('settings'));
  document.body.dataset.devEnabled=String(mode.get());
 }
 const baseRender=render;render=function(...args){const result=baseRender.apply(this,args);refreshControls();return result;};
 const baseSettings=showSaves;showSaves=function(...args){const result=baseSettings.apply(this,args);refreshControls();return result;};
 // Disabling access also rejects stale hub/API mutation calls.
 if(window.STMDevApi)for(const name of ['launch','cards','testCard','motion','playback','restart','command','loadRun','godMode','freeMap','teleport','returnMap','addCards','openEvent','question','setStatus','scenario','loadPlayerRun']){const original=window.STMDevApi[name];window.STMDevApi[name]=function(...args){if(!mode.get())throw Error('Turn Dev ON in Settings.');return original.apply(this,args);};}
}
