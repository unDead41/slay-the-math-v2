(function(root){'use strict';
 const M=root.STMMechanics,Q=root.DCEducation,A=root.DCArtifacts,C=root.DCConfig,R=root.DCRichText;
 const PROFILE='slay-the-math.artifact-codex.v1',clone=x=>JSON.parse(JSON.stringify(x));
 let tracker=null,artUI=null,runKey=null,questionTips=null,dialogTips=null,lastEvent=0,profileWritable=true;
 function disposeQuestion(){questionTips?.destroy();questionTips=null;}
 function disposeDialog(){dialogTips?.destroy();dialogTips=null;}
 function renderParts(host,parts,allow=false,index=new Map()){
  M.renderRichText(host,parts,{glossary:M.data.glossary,allowCalculations:allow,calculationIndex:index});
  // Native HTML term buttons; MathML/SVG keep the supplier's keyboard targets.
  for(const span of host.querySelectorAll('span.rt-term,span.rt-calculation')){
   const b=host.ownerDocument.createElement('button');b.type='button';for(const a of span.attributes)if(!['role','tabindex'].includes(a.name))b.setAttribute(a.name,a.value);while(span.firstChild)b.append(span.firstChild);span.replaceWith(b);
  }
 }
 function hydrateEducation(run){
  const q=Q.current(run);hydrateQuestion(document.querySelector('.education-question'),q,q?Q.learningView(run):null);
 }
 function teachingHTML(q,closed,{esc}){
  const h=q?.harmonization;if(!h)return '';
  const context=h.contextNote?'<h3>In this question</h3><p data-q-rich="context">'+esc(h.contextNote)+'</p>':'';
  const given=h.given?.length?'<h3>Given</h3><ul>'+h.given.map((text,i)=>'<li data-q-rich="given:'+i+'">'+esc(text)+'</li>').join('')+'</ul>':'';
  const asked=h.asked?'<h3>Find</h3><p data-q-rich="asked">'+esc(h.asked)+'</p>':'';
  return '<section class="education-teaching" aria-label="Question guide">'+context+given+asked+'</section>'+
   '<details class="education-sources"><summary>Sources &amp; curriculum fit</summary><p>'+esc(h.alignment)+' · Form 4</p>'+h.sources.map(s=>{
    const ref=M.data.bank.sourceRegistry[s.sourceId];
    return '<article><strong>'+esc(ref.title)+'</strong><p>'+esc(s.section)+' · PDF pages '+esc(s.pdfPages.join(', '))+' · Printed pages '+esc(s.printedPages)+'</p>'+(closed?'<p>'+esc(s.basis)+'</p>':'')+'</article>';
   }).join('')+(closed?'<p>'+esc(h.alignmentNote)+'</p>':'<p>Authoring notes appear after the question is finished.</p>')+'</details>';
 }
 function hydrateQuestion(host,q,view){
  disposeQuestion();if(!host||!q||!view)return;host.setAttribute('data-stm-richtext','');
  const index=new Map();
  for(const el of host.querySelectorAll('[data-q-rich]')){
   const key=el.dataset.qRich;let parts;
   if(key==='prompt')parts=view.prompt;
   else if(key.startsWith('choice:'))parts=view.choices[key.slice(7)];
   else if(key==='feedback')parts=view.feedback?.richText;
   else if(key==='explanation')parts=view.explanation;
   else if(key==='moreHint')parts=view.moreHint;
   else if(key==='context')parts=q.harmonization?.contextRichText;
   else if(key==='asked')parts=q.harmonization?.askedRichText;
   else if(key.startsWith('given:'))parts=q.harmonization?.givenRichText[Number(key.slice(6))];
   else if(key.startsWith('hint:'))parts=view.hintSteps?.[key.slice(5)];
   else if(key.startsWith('step:'))parts=view.workedSteps?.find(s=>s.id===key.slice(5))?.richText;
   if(parts)renderParts(el,parts,view.allowCalculations,index);
  }
  const visual=host.querySelector('[data-q-visual]');if(visual&&view.visual)M.renderVisual(visual,view.visual,{glossary:M.data.glossary,allowCalculations:view.allowCalculations,calculationIndex:index});
  questionTips=M.attachRichTextTooltips(host,{glossary:M.data.glossary,calculationIndex:index,getTheme:()=> 'dark'});
 }
 function createArtifacts(warn){
  if(tracker)return;
  tracker=new M.ArtifactCore.ArtifactTracker(M.data.catalog.artifacts);
  try{const raw=localStorage.getItem(PROFILE);if(raw){const saved=JSON.parse(raw);if(!tracker.restore(saved))throw Error('Invalid Artifact Codex save');}}
  catch(_){profileWritable=false;warn?.('Artifact Codex history could not be read. The original history has been kept.');}
  artUI=new M.ArtifactUI({tracker,data:M.data.artifact,getTheme:()=> 'dark',motion:()=>!document.documentElement.classList.contains('reduce-motion')});
  artUI.image=a=>root.DC_ASSETS?.[A.catalog[a.id].icon]||'assets/'+A.catalog[a.id].icon;
  // The existing app owns toast announcements. Only pulse the source HUD here;
  // actual resolved values remain available in the canonical Calculations log.
  artUI.activation=e=>{artUI.pulses.set(e.artifactId,Date.now()+850);artUI.renderHUD();setTimeout(()=>{if(!artUI.destroyed)artUI.renderHUD();},880);};
 }
 function syncArtifacts(run,{warn,visible=true,announce}={}){
  createArtifacts(warn);const key=run?run.seed+':'+run.started:null;
  if(key!==runKey){tracker.newRun();artUI.pulses.clear();runKey=key;lastEvent=run?.calculationState?.nextId||0;
   if(run?.stmArtifactUI&&!tracker.restore(run.stmArtifactUI))warn?.('Artifact display state could not be restored. Core run progress is unchanged.');
  }
  // Merge profile discovery only. Run ownership/counters always come from the engine.
  try{const profile=JSON.parse(localStorage.getItem(PROFILE)||'null');if(profile){for(const pair of profile.discovered||[])if(Array.isArray(pair)&&tracker.known(pair[0]))tracker.discovered.set(pair[0],String(pair[1]));for(const id of profile.collected||[])if(tracker.known(id))tracker.collected.add(id);}}catch(_){profileWritable=false;warn?.('Artifact Codex history could not be read. The original history has been kept.');}
  tracker.setOwned(run?.artifactState?.owned||[]);
  if(visible)for(const id of run?.artifactState?.offer?.ids||[])tracker.discover(id,'Stage '+(run.stage+1)+' · '+run.artifactState.offer.kind);
  const b=run?.battle,a=b?.artifacts;
  if(run&&b){tracker.startCombat(run.seed+':'+run.stage+':'+run.depth+':'+b.enemyId);tracker.startTurn(b.turn);
   const turn=a?.turn||{},combat=a?.combat||{};
   Object.assign(tracker.turnCounts,{cards:turn.cards||0,attack:+!!turn.attack,defend:+!!turn.guard,skill:+!!turn.skill,exhaust:+!!turn.exhaust,discard:+!!turn.discard});
   Object.assign(tracker.combatCounts,{skill:+!!combat.quill,exhaust:+!!combat.pebble,passive:+!!combat.ring});
   const flags={s02:turn.attack,s03:turn.guard,s10:combat.quill,s11:combat.pebble,e01:turn.abacus,e02:turn.pair,e05:turn.exhaust,e07:turn.attack,e08:turn.guard,e09:turn.retaliation,e10:turn.skill,e12:combat.flask,e13:turn.discard,s01:combat.won,e06:combat.won,s04:true,s05:true,s07:true,e03:!!a?.die,e11:true,e15:true,e16:true,b01:true,b03:true};
   for(const [code,used] of Object.entries(flags)){const id=A.id(code),item=tracker.catalog.get(id),set=tracker.usedSet(item);if(used&&tracker.ownedIds.has(id))set.add(id);else set.delete(id);}
   tracker.contributions[A.id('b02')]=a?.clasp||0;
  }
  for(const id of [A.id('s08'),A.id('s09')])if(tracker.ownedIds.has(id))tracker.runUsed.add(id);
  tracker.sync(run?{hp:run.hp,maxHp:run.maxHp,gold:run.gold,block:b?.block||0,energy:b?.energy||0,strength:b?.strength||0,agility:b?.agility||0,focus:b?.focus||0,focusCap:C.FOCUS_CAP,handCount:b?.hand.length||0,handLimit:C.HAND_LIMIT,drawable:(b?.draw.length||0)+(b?.discard.length||0),die:a?.die||null}:{});
  if(run){
   const events=R.entries(run).filter(e=>e.id>lastEvent).reverse();
   for(const e of events)for(const id of e.artifactIds){const changes=e.results.filter(x=>x.kind==='delta'&&x.value!==0).map(x=>({stat:({'HP':'hp','Max HP':'maxHp','Block':'block','Energy':'energy','Focus':'focus','cards':'cards','Gold':'gold','Strength':'strength','Agility':'agility'})[x.unit]||x.unit,before:x.before,after:x.after}));
    const eventId=run.seed+':'+run.started+':'+e.id+':'+id,seen=tracker.eventIds.has(eventId);tracker.eventIds.add(eventId);
    if(changes.length&&visible&&!seen){artUI.activation({artifactId:id,changes});announce?.(A.catalog[id].name+' activated. '+e.results.map(x=>x.label+': '+(x.kind==='delta'&&x.value>0?'+':'')+x.value+' '+x.unit).join(' · '));}}
   lastEvent=run.calculationState?.nextId||0;if(run.artifactState)run.stmArtifactUI=tracker.save();
  }
  try{if(profileWritable)localStorage.setItem(PROFILE,JSON.stringify(tracker.save()));}catch(_){warn?.('Artifact Codex history could not be saved. Use Export before closing.');}
  const resources=visible&&run?.scene==='battle'&&document.querySelector('.combat-resources');
  if(resources&&tracker.ownedIds.size){const host=document.createElement('div');host.className='artifact-live-hud';resources.append(host);artUI.mountHUD(host);}
 }
 function mountCodex(host){
  createArtifacts();artUI.mountCodex(host);const search=host.querySelector('.art-search'),clear=document.createElement('button');clear.type='button';clear.className='art-search-clear';clear.textContent='Clear';clear.setAttribute('aria-label','Clear artifact search');clear.hidden=!search.value;search.after(clear);
  clear.addEventListener('click',()=>{search.value='';search.dispatchEvent(new Event('input',{bubbles:true}));search.focus();});search.addEventListener('input',()=>{clear.hidden=!search.value;});
 }
 function comparison(host,id){if(host&&id){createArtifacts();artUI.mountComparison(host,id,{title:'Effect preview · current run',turn:tracker.turn||1});}}
 function basicsHTML(id,checks,{esc,button}){
  const modules=M.data.foundations.modules,m=modules.find(m=>m.id===id)||modules[0];
  return '<div class="basics-layout" data-foundation="'+m.id+'"><nav class="basics-nav" aria-label="Basics topics">'+modules.map(x=>button(esc(x.title),'foundation-module','btn subtle','data-id="'+x.id+'" aria-current="'+(x.id===m.id?'page':'false')+'"')).join('')+'</nav><section class="basics-content"><p class="eyebrow">OPTIONAL BASICS · UNSCORED</p><h3>'+esc(m.title)+'</h3>'+m.cards.map((c,i)=>'<article><h4>'+esc(c.title)+'</h4><div data-basic-rich="card:'+i+'">'+esc(c.text)+'</div></article>').join('')+'<h3>Try it yourself</h3><p>These checks do not change your trial answer, rewards or learning score.</p>'+m.checks.map((c,i)=>'<section class="foundation-check"><h4 data-basic-rich="prompt:'+i+'">'+esc(c.prompt)+'</h4><div class="foundation-choices">'+c.choices.map((text,j)=>button(esc(text),'foundation-check','btn subtle','data-module="'+m.id+'" data-check="'+i+'" data-choice="'+j+'" aria-pressed="'+(checks[c.id]===j)+'"')).join('')+'</div>'+(checks[c.id]!==undefined?'<p role="status" class="foundation-feedback" data-basic-rich="feedback:'+i+'">'+esc(c.feedback[checks[c.id]])+'</p>':'')+'</section>').join('')+'</section></div>';
 }
 function hydrateBasics(host,checks){
  disposeDialog();host.setAttribute('data-stm-richtext','');const m=M.data.foundations.modules.find(m=>m.id===host.querySelector('[data-foundation]')?.dataset.foundation);if(!m)return;const index=new Map();
  for(const el of host.querySelectorAll('[data-basic-rich]')){const [kind,i]=el.dataset.basicRich.split(':'),c=m.checks[i];const parts=kind==='card'?m.cards[i].richText:kind==='prompt'?c.richText:c.feedbackRichText[checks[c.id]];renderParts(el,parts,true,index);}
  dialogTips=M.attachRichTextTooltips(host,{glossary:M.data.glossary,calculationIndex:index,getTheme:()=> 'dark'});
 }
 function progressHTML(run,{esc}){const rows=Q.progress(run);return '<p>Practice evidence from the Master’s trials. Fewer than 3 completed items is “Building evidence”; these local records are not a mastery certificate.</p><div class="learning-progress">'+rows.map(p=>'<article><h3>'+esc(p.label)+'</h3><p>'+p.completed+' / '+p.totalQuestions+' completed · '+esc(p.status)+'</p><dl><div><dt>Independent first try</dt><dd>'+p.independentFirstTry+'</dd></div><div><dt>With support</dt><dd>'+p.correctWithSupport+'</dd></div><div><dt>After retry</dt><dd>'+p.correctAfterRetry+'</dd></div></dl></article>').join('')+'</div>';}
 root.STMMechanicsHost={teachingHTML,hydrateEducation,hydrateQuestion,disposeQuestion,disposeDialog,syncArtifacts,mountCodex,comparison,basicsHTML,hydrateBasics,progressHTML,get tracker(){return tracker;}};
})(window);
