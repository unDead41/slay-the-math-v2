/* Response-only main-menu and Settings controls. Never shipped in dist. */
{
 const mode=window.STMDevMode;
 function controls(where){
  const section=document.createElement('section');section.className='dev-mode-controls';section.dataset.devLocation=where;
  section.style.cssText='padding:10px;margin-top:8px;border:1px solid #8b795b;border-radius:8px;font:14px system-ui';
  const toggle=document.createElement('button');toggle.type='button';toggle.className='btn';toggle.dataset.devToggle=where;toggle.setAttribute('role','switch');toggle.setAttribute('aria-checked',String(mode.get()));toggle.textContent='Dev: '+(mode.get()?'ON':'OFF');
  toggle.addEventListener('click',()=>{mode.set(!mode.get());refreshControls();document.querySelector('[data-dev-toggle="'+where+'"]')?.focus();});section.append(toggle);
  if(mode.get()){const link=document.createElement('a');link.href='/__dev/';link.className='btn';link.textContent='Open Developer Hub';link.style.marginLeft='8px';section.append(link);}
  const hint=document.createElement('p');hint.style.cssText='margin:6px 0 0;font-size:12px';hint.textContent='Development session · progress is temporary';section.append(hint);return section;
 }
 function refreshControls(){
  document.querySelectorAll('.dev-mode-controls').forEach(e=>e.remove());
  const menu=document.querySelector('.main-menu-actions');if(menu)menu.append(controls('menu'));
  const panel=document.querySelector('#dialog .save-panel');if(panel)panel.prepend(controls('settings'));
  document.body.dataset.devEnabled=String(mode.get());
 }
 const baseRender=render;render=function(...args){const result=baseRender.apply(this,args);refreshControls();return result;};
 const baseSettings=showSaves;showSaves=function(...args){const result=baseSettings.apply(this,args);refreshControls();return result;};
 // Disabling access also rejects stale hub/API mutation calls.
 for(const name of ['launch','cards','testCard','motion','playback','restart','command']){const original=window.STMDevApi[name];window.STMDevApi[name]=function(...args){if(!mode.get())throw Error('Turn Dev ON in the main menu or Settings.');return original.apply(this,args);};}
}
