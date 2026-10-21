(function(root){'use strict';
const EXPECTED_SHARED_REGISTRY_ID=/* STM_SHARED_REGISTRY_ID */'881ed46c93d9444d01853bf2056a09e5216a8b5278ecb3aacdb069ca21818201';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const unit={hp:'HP',maxHp:'Max HP',gold:'Gold',block:'Block',energy:'Energy',strength:'Strength',agility:'Agility',cards:'cards',damageBonus:'damage',focus:'Focus',price:'Gold',discount:'%',threshold:'HP'};
const tiers={starting:'Starting',elite_mystery:'Elite / Mystery',boss:'Boss'};
const sources={starting:'Starting artifact pool',elite_mystery:'Elite rewards and Mystery events',boss:'Boss Stage 1 reward'};
class ArtifactUI{
 constructor({tracker,data,assetRoot='',getLanguage,getTheme,motion=()=>!document.documentElement.classList.contains('reduce-motion')}){
  this.richText=root.STMSharedRichText;if(!this.richText||this.richText.version!=='1.0.0'||this.richText.registryId!==EXPECTED_SHARED_REGISTRY_ID)throw Error('Use the matched STM_SHARED service for Artifact 3.5.');
  this.richText.assertDomain('artifact',data.glossary);
  this.tracker=tracker;this.data=data;this.assetRoot=assetRoot;this.motion=motion;this.hud=null;this.pulses=new Map();this.toastQueue=[];this.liveToasts=0;this.destroyed=false;this.codexHost=null;this.tip=null;this.pinned=false;this.closeTimer=null;this.cleanups=[];
  this.rich=new Map((data.artifacts||[]).map(a=>[a.id,a]));
  this.unsubscribe=tracker.subscribe(e=>{if(e.type==='activation')this.activation(e);else this.renderHUD();});
  this.tipControllers=new Map();this.getLanguage=getLanguage;this.getTheme=getTheme;
 }
 image(a){return this.assetRoot+'icons_800/'+a.tier+'/'+a.id+'.png';}
 term(text,key){return this.data.glossary[key]?this.richText.termHTML('artifact',text,key):esc(text);}
 value(value,stat,lines=[],origin='preview'){
  const label=unit[stat]||String(stat||''),key=stat==='discount'?'percent':Object.keys(this.data.glossary).find(k=>this.data.glossary[k].label.toLowerCase()===label.toLowerCase());
  const token=this.richText.calculation({origin,value,unit:label,steps:lines});
  return '<button type="button" class="rt-calculation" data-stm-tip="calculation" data-richtext-kind="calculation" data-richtext-scope="artifact" data-category="calculation" data-rt-calculation="'+esc(JSON.stringify(token))+'">'+esc(value)+'</button> '+(key?this.term(label,key):esc(label));
 }

 description(id){const a=this.tracker.catalog.get(id),r=this.rich.get(id);return r?.description_segments?r.description_segments.map(s=>s.type==='term'?this.term(s.text,s.glossary_id):esc(s.text)).join(''):esc(a.effect_en||a.effect_ms);}
 usageExample(id){
  const example=this.rich.get(id)?.example_snapshot;if(!example)return '';
  return '<section class="art-usage-example"><h4>Usage example</h4><p class="art-muted">Example snapshot: '+esc(example.context)+'</p>'+(example.results||[]).map(r=>'<div class="art-compare-row"><span>'+esc(r.label)+'</span><span>'+(/^[+−-]?\d/.test(r.value)?this.value(r.value,r.unit,r.lines||[],'example'):esc(r.value)+' '+this.term(r.unit,Object.keys(this.data.glossary).find(k=>this.data.glossary[k].label.toLowerCase()===String(r.unit).toLowerCase())))+'</span></div>').join('')+'</section>';
 }
 bindTips(host){
  if(this.destroyed)return;
  for(const [old,controller] of this.tipControllers)if(old.isConnected===false&&!old.contains(host)){controller.destroy();this.tipControllers.delete(old);}
  if(this.tipControllers.has(host))return;
  host.setAttribute('data-stm-richtext','');
  const controller=this.richText.attachTooltips(host,{domain:'artifact',getLanguage:this.getLanguage,getTheme:this.getTheme,manageTheme:true,
   resolveCustom:button=>{if(button.dataset.stmTip!=='artifact')return null;const a=this.tracker.catalog.get(button.dataset.id);if(!a)return null;return {title:a.name,lines:[a.effect_en||a.effect_ms,this.tracker.status(a.id).label]};}});
  this.tipControllers.set(host,controller);
 }
 showTip(button,pin=false){for(const [host,controller] of this.tipControllers)if(host.contains(button)){this.tip=controller.show(button,pin);return this.tip;}}
 hideTip(){for(const controller of this.tipControllers.values())controller.close();this.tip=null;}

 mountHUD(host){this.hud=host;this.hudSignature=null;host.classList.add('stm-artifacts');host.setAttribute('data-stm-richtext','');this.bindTips(host);this.renderHUD();}
 renderHUD(){
  if(!this.hud||!this.hud.isConnected)return;const owned=[...this.tracker.ownedIds],signature=owned.join('|');
  if(signature!==this.hudSignature){this.hudSignature=signature;this.hud.innerHTML='<div class="art-hud-label">Artifacts</div><div class="art-hud-items">'+(owned.length?owned.map(id=>{const a=this.tracker.catalog.get(id);return '<div class="art-hud-item" data-artifact-id="'+id+'"><button type="button" class="art-icon-button" data-stm-tip="artifact" data-id="'+id+'"><img src="'+esc(this.image(a))+'" alt="" width="46" height="46"></button><span class="art-hud-status"></span></div>';}).join(''):'<span class="art-muted">No artifacts collected in this run.</span>')+'</div>';}
  for(const item of this.hud.querySelectorAll('[data-artifact-id]')){const id=item.dataset.artifactId,a=this.tracker.catalog.get(id),s=this.tracker.status(id),label=item.querySelector('.art-hud-status');item.classList.toggle('art-pulse',(this.pulses.get(id)||0)>Date.now());item.dataset.motion=this.motion();label.textContent=s.label;label.dataset.status=s.state;item.querySelector('.art-icon-button').setAttribute('aria-label',a.name+'. '+s.label);}
 }
 activation(event){
  this.pulses.set(event.artifactId,Date.now()+850);this.renderHUD();this.toastQueue.push(event);this.flushToasts();
  setTimeout(()=>{if(!this.destroyed)this.renderHUD();},880);
 }
 flushToasts(){
  if(this.destroyed)return;
  while(this.liveToasts<3&&this.toastQueue.length){const e=this.toastQueue.shift(),a=this.tracker.catalog.get(e.artifactId);let tray=document.getElementById('stm-artifact-activations');if(!tray){tray=document.createElement('div');tray.id='stm-artifact-activations';tray.className='stm-artifacts art-activation-tray';tray.setAttribute('aria-live','polite');document.body.append(tray);this.bindTips(tray);}
   const el=document.createElement('div');el.className='art-activation';el.dataset.motion=this.motion();el.innerHTML='<img src="'+esc(this.image(a))+'" alt="" width="42" height="42"><div><strong>'+esc(a.name)+'</strong><div>'+e.changes.filter(c=>c.delta!==0).map(c=>this.value((c.delta>0?'+':'−')+Math.abs(c.delta),c.stat,[...(e.steps||[]),`Before: ${c.before} ${unit[c.stat]||c.stat}`,`Applied change: ${c.after} − ${c.before} = ${c.delta}`,`After: ${c.after} ${unit[c.stat]||c.stat}`],'resolved')).join(' · ')+'</div></div>';
   tray.append(el);this.liveToasts++;setTimeout(()=>{el.remove();this.liveToasts--;this.flushToasts();},2600);
  }
 }
 mountCodex(host,{allKnown=false}={}){
  host.stmCodexAbort?.abort();const abort=new AbortController();host.stmCodexAbort=abort;
  this.codexHost=host;host.classList.add('stm-artifacts');host.setAttribute('data-stm-richtext','');
  host.innerHTML='<div class="art-codex-heading"><div><p class="art-kicker">COLLECTION</p><h2>Artifact Codex</h2></div><span class="art-codex-count"></span></div><div class="art-codex-controls"><label>Search artifacts<input class="art-search" type="search" placeholder="Search discovered artifacts" aria-label="Search artifacts"></label><label>Tier<select class="art-tier"><option value="all">All tiers</option><option value="starting">Starting</option><option value="elite_mystery">Elite / Mystery</option><option value="boss">Boss</option></select></label></div><div class="art-codex-layout"><div class="art-codex-grid"></div><aside class="art-codex-detail"><p>Choose an artifact to see its details.</p></aside></div>';
  const render=()=>{const list=this.tracker.codex(),q=host.querySelector('.art-search').value.toLowerCase(),tier=host.querySelector('.art-tier').value;
   host.querySelector('.art-codex-count').textContent=list.filter(a=>a.discovered).length+'/'+list.length+' discovered · '+list.filter(a=>a.collected).length+' collected';
   const visible=list.filter(a=>(tier==='all'||a.tier===tier)&&(a.discovered||allKnown?a.name.toLowerCase().includes(q):'undiscovered'.includes(q)));
   host.querySelector('.art-codex-grid').innerHTML=visible.map(a=>{const known=a.discovered||allKnown;return '<button type="button" class="art-codex-card '+(!known?'art-locked':'')+'" data-codex-id="'+a.id+'"><img src="'+esc(this.image(a))+'" alt="" width="96" height="96" loading="lazy"><strong>'+esc(known?a.name:'Undiscovered')+'</strong><span>'+esc(tiers[a.tier])+'</span><small>'+(a.owned?'Owned this run':a.collected?'Collected before':known?'Discovered':'Not found yet')+'</small></button>';}).join('')||'<p class="art-muted">No matching artifacts.</p>';
  };
  host.querySelector('.art-search').addEventListener('input',render,{signal:abort.signal});host.querySelector('.art-tier').addEventListener('change',render,{signal:abort.signal});
  host.addEventListener('click',e=>{const b=e.target.closest('[data-codex-id]');if(!b)return;e.preventDefault();e.stopPropagation();const a=this.tracker.codex().find(a=>a.id===b.dataset.codexId),known=a.discovered||allKnown,detail=host.querySelector('.art-codex-detail');
   detail.innerHTML='<img class="art-detail-image '+(!known?'art-silhouette':'')+'" src="'+esc(this.image(a))+'" alt="" width="150" height="150"><p class="art-kicker">'+esc(tiers[a.tier])+'</p><h3>'+esc(known?a.name:'Undiscovered artifact')+'</h3>'+(known?'<p class="art-effect">'+this.description(a.id)+'</p><p><strong>Where to find:</strong> '+esc(sources[a.tier])+'</p>'+(a.foundAt?'<p><strong>First seen:</strong> '+esc(a.foundAt)+'</p>':'')+this.usageExample(a.id)+'<div class="art-codex-example"></div>':'<p>Discover this artifact during a dungeon run to reveal its effect.</p>');
   if(known)this.mountComparison(detail.querySelector('.art-codex-example'),a.id,{title:'Effect preview'});
  },{signal:abort.signal});
  this.bindTips(host);render();
 }
 mountComparison(host,id,options={}){
  host.classList.add('stm-artifacts','art-comparison');host.setAttribute('data-stm-richtext','');const snapshot=this.tracker.state,p=this.tracker.preview(id,snapshot,options);
  const rows=p.results.map(r=>'<div class="art-compare-row"><span>'+esc(r.stat==='price'&&p.discount?'Future Shop price':r.stat==='price'?'Final price':r.stat==='damageBonus'?'Attack bonus':unit[r.stat]||r.stat)+'</span><span>'+esc(r.before)+' <span aria-hidden="true">→</span> '+this.value(r.after,r.stat,[...r.steps,`Before: ${r.before}`,`After: ${r.after}`,`Change: ${r.after} − ${r.before} = ${r.delta}`])+'</span></div><p class="art-timing">'+esc(r.stat==='price'&&p.discount?'After collecting this artifact; separate from its purchase price':r.timing)+'</p>').join('');
  host.innerHTML='<h4>'+esc(options.title||'Before you choose')+'</h4>'+(rows||'<p class="art-muted">'+(p.owned?'Already owned in this run.':'Read the effect and trigger below.')+'</p>')+p.notes.map(n=>'<p class="art-muted">'+esc(n)+'</p>').join('')+(p.synergies.length?'<div class="art-synergies"><strong>Works with your artifacts</strong>'+p.synergies.map(s=>'<p>'+s.ids.filter(x=>x!==id).map(x=>esc(this.tracker.catalog.get(x).name)).join(', ')+' — '+esc(s.text)+'</p>').join(''):'');this.bindTips(host);return p;
 }
 mountOffer(host,id,options={}){
  host.classList.add('stm-artifacts');host.setAttribute('data-stm-richtext','');const a=this.tracker.catalog.get(id);this.tracker.discover(id,options.kind==='buy'?'Shop offer':'Reward offer');
  host.innerHTML='<div class="art-offer-title"><img src="'+esc(this.image(a))+'" alt="" width="70" height="70"><div><h3>'+esc(a.name)+'</h3><p>'+esc(tiers[a.tier])+'</p></div></div><p>'+this.description(id)+'</p><div class="art-offer-comparison"></div><div class="art-offer-price"></div><div class="art-offer-action"></div><p class="art-offer-error" role="alert"></p>';
  const comparison=host.querySelector('.art-offer-comparison');let p=this.mountComparison(comparison,id,options);this.bindTips(host);
  if(typeof options.onConfirm==='function'){
   const price=()=>{if(options.kind==='buy'&&Number.isFinite(p.purchasePrice))host.querySelector('.art-offer-price').innerHTML='<p>Buy price: '+this.value(p.purchasePrice,'price',[`Original price: ${options.price} Gold`,`Discount already owned: ${this.tracker.discount([...this.tracker.ownedIds])}%`,`Final purchase price: ${p.purchasePrice} Gold`])+'</p>';};price();
   const button=document.createElement('button');button.type='button';button.className='art-button art-primary';button.textContent=options.kind==='buy'?'Buy artifact':'Claim artifact';button.disabled=p.owned||(options.kind==='buy'&&Number.isFinite(p.purchasePrice)&&this.tracker.state.gold<p.purchasePrice);host.querySelector('.art-offer-action').append(button);
   let committed=false,pending=false;button.addEventListener('click',async()=>{if(committed||pending)return;p=this.tracker.preview(id,this.tracker.state,options);price();if(p.owned||options.kind==='buy'&&Number.isFinite(p.purchasePrice)&&this.tracker.state.gold<p.purchasePrice){button.disabled=true;return;}pending=true;button.disabled=true;try{const ok=await options.onConfirm({artifactId:id,preview:p});if(ok===false)throw Error('This offer is no longer available.');committed=true;button.textContent=options.kind==='buy'?'Purchased':'Claimed';this.mountComparison(comparison,id,options);}catch(error){host.querySelector('.art-offer-error').textContent=error.message||'Unable to claim this artifact.';button.disabled=false;}finally{pending=false;}});
  }
 }
 destroy(){this.destroyed=true;this.unsubscribe();this.hideTip();for(const controller of this.tipControllers.values())controller.destroy();this.tipControllers.clear();this.codexHost?.stmCodexAbort?.abort();}
}
root.STMArtifactUI=ArtifactUI;
})(typeof globalThis!=='undefined'?globalThis:this);
