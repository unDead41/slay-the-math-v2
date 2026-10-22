(function(){
 'use strict';
 const kit=window.STMCardKit,data=kit.data,$=s=>document.querySelector(s),esc=kit.escapeHTML,key='slay-the-math.question-language.v1';
 let initial=window.STM_CARD_LANGUAGE;if(!initial)try{initial=localStorage.getItem(key);}catch{}
 const state={lang:kit.normalizeLanguage(initial||'bm'),category:'all',focus:false,query:'',selected:null},words=()=>window.STMCardCopy[state.lang];
 function ctx(){const o={};for(const id of ['energy','strength','agility','handAfterPlay'])o[id]=Number($('#'+id).value);for(const id of ['lostHpLastEnemyTurn','hasBlock','enemyAttacks'])o[id]=$('#'+id).checked;return o;}
 function tile(card){
  const p=kit.preparePlay(card.id,ctx(),state.focus),lang=state.lang,w=words(),name=kit.cardName(card,lang),cost=card.energy.kind==='fixed'?card.energy.amount:'X';
  let label=p.focused?w.focus+' +':card.category==='passive'?w.noFocus:w.normal;
  if(state.focus&&card.focus_eligible&&!p.focused)label+=' · '+w.focusReason[p.focusReason];
  if(!p.legal)label=p.errors.map(e=>w.errors[e]).join(' ');
  return '<article class="tile '+(p.focused?'focused':'')+'" data-card-id="'+esc(card.id)+'"><div class="stage"><div class="art-window"><img src="'+esc(kit.assetPath(card.icon))+'" alt="'+esc(name+' · '+w.chosenIcon)+'" loading="lazy"></div><img class="frame" src="'+esc(kit.assetPath(kit.framePath(card,p.focused)))+'" alt="" loading="lazy"><div class="energy-label" aria-label="'+esc(cost+' '+w.energy)+'">'+cost+'</div><div class="card-title">'+esc(name)+'</div><div class="card-category">'+w[card.category]+'</div><div class="card-description" tabindex="0" aria-label="'+esc(kit.renderPlain(p,lang))+'"><div>'+kit.renderHTML(p,lang)+'</div></div></div><div class="tile-info"><p><span class="state-label">'+esc(label)+'</span>'+esc(w[card.rarity])+'</p><button class="details-button" type="button" data-detail="'+esc(card.id)+'">'+w.details+'</button></div></article>';
 }
 function renderDetails(){
  const panel=$('#card-details');if(!state.selected){panel.hidden=true;return;}
  const card=data.cards.find(c=>c.id===state.selected),lang=state.lang,w=words(),normal=kit.preparePlay(card.id,ctx(),false),focused=kit.preparePlay(card.id,ctx(),true);panel.hidden=false;
  panel.innerHTML='<button class="close" aria-label="'+w.close+'" type="button">×</button><h2>'+esc(kit.cardName(card,lang))+'</h2>'+(lang==='bm'?'<p class="mechanic-note canonical-name">'+esc(card.name)+'</p>':'')+'<p class="mechanic-note">'+w[card.category]+' · '+w[card.rarity]+'</p><div class="comparison"><div><h3>'+w.normal+'</h3>'+kit.renderHTML(normal,lang)+'</div><div><h3>'+(card.focus_eligible?w.focus:w.noFocus)+'</h3>'+kit.renderHTML(focused,lang)+'</div></div><p class="mechanic-note focus-note">'+w.focusReason[focused.focusReason]+'</p><p class="mechanic-note card-notes">'+esc(kit.cardNotes(card,lang))+'</p>'+(card.category==='passive'?'<p class="mechanic-note passive-notice">'+w.passiveNote+'</p>':'');
  panel.querySelector('.close').onclick=()=>{const id=state.selected;state.selected=null;renderDetails();document.querySelector('[data-detail="'+id+'"]')?.focus();};
 }
 function render(){
  hideTooltip();const w=words();document.documentElement.lang=state.lang==='bm'?'ms':'en';document.title=w.title;
  document.querySelectorAll('[data-copy]').forEach(e=>e.textContent=w[e.dataset.copy]);document.querySelectorAll('[data-copy-aria]').forEach(e=>e.setAttribute('aria-label',w[e.dataset.copyAria]));document.querySelectorAll('[data-copy-placeholder]').forEach(e=>e.placeholder=w[e.dataset.copyPlaceholder]);
  $('#categories').innerHTML=['all',...data.categories].map(c=>'<button type="button" data-category="'+c+'" aria-pressed="'+(c===state.category)+'">'+w[c]+'</button>').join('');
  $('#focus').setAttribute('aria-pressed',String(state.focus));$('#focus').textContent='✦ '+w.focus+' '+(state.focus?w.on:w.off);$('#en').setAttribute('aria-pressed',String(state.lang==='en'));$('#bm').setAttribute('aria-pressed',String(state.lang==='bm'));
  const query=state.query.trim().toLocaleLowerCase(),list=data.cards.filter(c=>(state.category==='all'||c.category===state.category)&&[c.name,...Object.values(c.display_name)].some(n=>n.toLocaleLowerCase().includes(query)));
  $('#cards').innerHTML=list.length?list.map(tile).join(''):'<p class="empty">'+w.empty+'</p>';$('#count').textContent=list.length+' / 40 '+w.cards.toLocaleLowerCase();$('#intro').textContent=w.intro;$('#footer-note').textContent=w.footer;$('#preview-note').textContent=w.previewNote;
  const x=ctx();$('#context-label').textContent=w.context+' · '+x.energy+' '+w.energy+', '+x.strength+' '+w.strength+', '+x.agility+' '+w.agility;renderDetails();fitDescriptions();
 }
 function fitDescriptions(){document.querySelectorAll('.card-description').forEach(box=>{box.style.fontSize='';let size=parseFloat(getComputedStyle(box).fontSize);const min=Math.max(12,box.closest('.stage').getBoundingClientRect().width*.034);for(let i=0;i<12&&box.firstElementChild.getBoundingClientRect().height>box.clientHeight&&size>min;i++){size=Math.max(min,size*.97);box.style.fontSize=size+'px';}});}
 function setLanguage(lang){state.lang=kit.normalizeLanguage(lang);try{localStorage.setItem(key,state.lang==='bm'?'ms':'en');}catch{}if(window.STM_CARD_EMBEDDED)window.parent.postMessage({type:'stm-card-language',language:state.lang==='bm'?'ms':'en'},location.origin==='null'?'*':location.origin);render();}
 $('#categories').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(b){state.category=b.dataset.category;render();document.querySelector('[data-category="'+state.category+'"]')?.focus();}});
 $('#cards').addEventListener('click',e=>{const b=e.target.closest('[data-detail]');if(b){state.selected=b.dataset.detail;renderDetails();$('#card-details').scrollIntoView({block:'nearest'});$('#card-details .close').focus();}});
 $('#focus').onclick=()=>{state.focus=!state.focus;render();};$('#en').onclick=()=>setLanguage('en');$('#bm').onclick=()=>setLanguage('bm');$('#search').addEventListener('input',e=>{state.query=e.target.value;render();});document.querySelector('.context-fields').addEventListener('input',render);
 const tooltip=$('#stm-tooltip');let current=null;
 function hideTooltip(){tooltip.hidden=true;if(current)current.removeAttribute('aria-describedby');current=null;}
 function showTooltip(target){if(!target)return;hideTooltip();current=target;tooltip.textContent=target.dataset.tooltip;tooltip.dataset.kind=target.dataset.kind;tooltip.hidden=false;target.setAttribute('aria-describedby','stm-tooltip');const b=target.getBoundingClientRect(),t=tooltip.getBoundingClientRect();tooltip.style.left=Math.max(10,Math.min(innerWidth-t.width-10,b.left+b.width/2-t.width/2))+'px';tooltip.style.top=(b.bottom+t.height+18<innerHeight?b.bottom+9:Math.max(10,b.top-t.height-9))+'px';}
 document.addEventListener('pointerover',e=>{const t=e.target.closest('.stm-rt');if(t)showTooltip(t);});document.addEventListener('pointerout',e=>{const t=e.target.closest('.stm-rt');if(t&&!t.contains(e.relatedTarget))hideTooltip();});document.addEventListener('focusin',e=>{const t=e.target.closest('.stm-rt');if(t)showTooltip(t);else hideTooltip();});document.addEventListener('focusout',hideTooltip);document.addEventListener('click',e=>{const t=e.target.closest('.stm-rt');if(t){t.focus();showTooltip(t);}else hideTooltip();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!tooltip.hidden)hideTooltip();else if(window.STM_CARD_EMBEDDED)parent.postMessage({type:'stm-card-preview-close'},location.origin==='null'?'*':location.origin);}});window.addEventListener('resize',()=>{hideTooltip();requestAnimationFrame(fitDescriptions);});window.addEventListener('scroll',hideTooltip,true);
 if(window.STM_CARD_EMBEDDED)document.body.classList.add('embedded');render();
})();
