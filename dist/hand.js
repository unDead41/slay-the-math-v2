/* Presentation only. Stable pointer movement + dwell prevents layout-triggered hover loops. */
(function(root){'use strict';
 const HOVER_DELAY=140;
 function mount(hand){
  if(!hand)return null;
  const fan=hand.querySelector('.hand-fan'),slots=[...hand.querySelectorAll('.hand-slot')];
  if(!fan||!slots.length)return null;
  let timer=null,pending=-1,active=-1,dead=false;
  function cancel(){clearTimeout(timer);timer=null;pending=-1;}
  function paint(index){
   if(dead)return;hand.dataset.focused=String(index);
   slots.forEach((slot,i)=>{slot.classList.toggle('is-focused',i===index);slot.style.setProperty('--hand-shift',index<0||i===index?'0px':(i<index?-1:1)*Number(fan.dataset.spread||0)+'px');});
  }
  function select(index){if(dead)return;cancel();active=index;paint(index);}
  function clear(){select(-1);}
  function layout(){
   if(dead)return;
   const width=slots[0].offsetWidth;
   if(!width)return;
   // Card width supplies the resolved responsive scale.
   const scale=Math.max(1,width/210),available=Math.max(0,hand.clientWidth-20*scale),n=slots.length;
   const overlap=n*width+(n-1)*12*scale>available;
   const spread=overlap?Math.min(width*.35,64*scale):8*scale;
   const step=n===1?0:overlap?Math.max(44*scale,(available-width-2*spread)/(n-1)):width+12*scale;
   fan.style.width=(width+(n-1)*step+2*spread)+'px';fan.dataset.spread=String(overlap?spread:0);
   fan.style.height=(slots[0].offsetHeight+38*scale)+'px';
   slots.forEach((slot,i)=>{slot.style.setProperty('--hand-x',(spread+i*step)+'px');slot.style.setProperty('--hand-angle',(n<6?(i-(n-1)/2)*.65:0)+'deg');});
   // An initial/late ResizeObserver callback must not cancel a pointer dwell in progress.
   paint(active);
  }
  function indexOf(target){return slots.indexOf(target.closest?.('.hand-slot'));}
  function move(event){
   if(event.pointerType==='touch')return;
   const index=indexOf(event.target);
   if(index===active){cancel();return;}if(index===pending)return;
   cancel();pending=index;
   timer=setTimeout(()=>{if(!dead)select(index);},HOVER_DELAY);
  }
  function focus(event){const index=indexOf(event.target);if(index<0)return;select(index);event.target.scrollIntoView?.({block:'nearest',inline:'nearest',behavior:'instant'});}
  function blur(event){if(!hand.contains(event.relatedTarget))clear();}
  hand.addEventListener('pointermove',move);hand.addEventListener('pointerleave',clear);
  hand.addEventListener('focusin',focus);hand.addEventListener('focusout',blur);
  const observer=typeof root.ResizeObserver==='function'?new root.ResizeObserver(layout):null;
  observer?.observe(hand);root.addEventListener('resize',layout);layout();
  return {clear,destroy(){clear();dead=true;observer?.disconnect();root.removeEventListener('resize',layout);hand.removeEventListener('pointermove',move);hand.removeEventListener('pointerleave',clear);hand.removeEventListener('focusin',focus);hand.removeEventListener('focusout',blur);}};
 }
 const api={mount,HOVER_DELAY};if(typeof module!=='undefined')module.exports=api;else root.DCHand=api;
})(typeof window!=='undefined'?window:globalThis);
