(function(root){
 'use strict';
 const A=root.DCArtifacts,R=root.DCRichText;
 const tierName={starting:'Starting',elite_mystery:'Elite / Mystery',boss:'Boss'};
 const sceneArt=()=>'<div class="artifact-scene-art" aria-hidden="true"><img src="assets/dungeon-master.webp" width="3840" height="2160" alt=""></div>';
 function card(item,selected,{esc,button},choice=true,run=null){
  const body='<span class="artifact-illustration"><img src="assets/'+item.icon+'" width="800" height="800" alt="" aria-hidden="true"></span>'+
   '<span class="artifact-tier">'+tierName[item.tier]+'</span><strong class="artifact-name">'+esc(item.name)+'</strong>';
  const effect='<p class="artifact-effect" id="effect-'+item.id+'" data-stm-richtext>'+R.description(item.id)+'</p>';
  const last=run&&R.latest(run,item.id);
  const result=last?'<div class="artifact-last-result" data-stm-richtext><strong>Last resolved effect · Stage '+(last.stage+1)+' · Room '+(last.depth+1)+(last.turn?' · Turn '+last.turn:'')+'</strong><div class="rt-results">'+last.results.map(x=>R.resultHTML(x,last.label)).join('')+'</div></div>':'';
  return '<article class="artifact-card'+(selected?' selected':'')+(choice?'':' owned-artifact')+'" data-id="'+item.id+'">'+
   (choice?button(body,'select-artifact','artifact-select','data-id="'+item.id+'" aria-pressed="'+selected+'" aria-describedby="effect-'+item.id+'"'):body)+effect+result+'</article>';
 }
 function render(run,selected,helpers){
  const {esc,button}=helpers,offer=run.artifactState.offer,items=A.choices(run),opening=offer.kind==='starting',boss=offer.kind==='boss';
  const valid=items.some(a=>a.id===selected),chosen=items.find(a=>a.id===selected);
  const heading=opening?'Choose your first artifact':boss?'A power for the next dungeon':'Claim a dungeon artifact';
  return '<section class="artifact-encounter" data-artifact-kind="'+offer.kind+'" aria-labelledby="artifact-title">'+
   sceneArt()+
   '<aside class="master-dialogue"><p class="eyebrow">THE DUNGEON MASTER</p><blockquote>“'+(opening?'Every path asks a different price. Choose what you carry.':boss?'One dungeon behind you. Take a greater gift into the next.':'The dungeon has yielded a gift. Make it part of your strategy.')+'”</blockquote>'+button('‹ Main Menu','home','text-btn')+'</aside>'+
   '<div class="artifact-choice-panel"><p class="eyebrow">'+(opening?'A GIFT BEFORE THE DESCENT':boss?'SIGIL KEEP CLEARED':'YOUR JOURNEY CONTINUES')+'</p><h1 id="artifact-title" tabindex="-1">'+heading+'</h1>'+
   '<p class="artifact-intro">Choose one, then answer the Master’s question to claim it. Select an underlined term to learn its meaning.</p><div class="artifact-choices" role="group" aria-label="Artifact choices">'+items.map(item=>card(item,item.id===selected,helpers)).join('')+'</div>'+
   '<p class="artifact-selection" role="status">'+(chosen?esc(chosen.name)+' selected.':'Select a gift to continue.')+'</p><div class="artifact-choice-actions">'+button(boss?'Claim & Enter Deck Tower':opening?'Claim & Choose Your Path':'Claim Artifact','claim-artifact','btn primary',valid?'':'disabled')+
   (!opening&&!boss?button('Leave Without It','skip-artifact','text-btn'):'')+'</div><p class="artifact-save-note">Your choices are saved. Returning to the menu keeps the same offers.</p></div></section>';
 }
 function education(run,{esc,button}){
  const Q=root.DCEducation,p=run.educationState.pending,q=Q.current(run),gift=A.catalog[p.artifactId];
  const destination=p.kind==='boss'?'Claim & Enter Deck Tower':p.kind==='starting'?'Claim & Choose Your Path':'Claim & Continue';
  const selected=q?.choices.find(c=>c.id===p.selectedId),correct=q?.choices.find(c=>c.id===q.correctChoiceId);
  const feedback=p.solved?'Correct. Your path is ready.':p.attempts.length?'Not quite. Try another answer or use a hint.':'Choose one answer, then check it.';
  const answers=q?'<div class="education-answers" role="group" aria-labelledby="education-prompt">'+p.choiceOrder.map((id,i)=>{
   const choice=q.choices.find(c=>c.id===id),wrong=p.attempts.includes(id)&&id!==q.correctChoiceId;
   return button('<span class="education-letter" aria-hidden="true">'+'ABCD'[i]+'</span><span>'+esc(choice.text)+(wrong?'<small>Try another answer</small>':'')+'</span>','education-select','education-answer'+(p.selectedId===id?' selected':'')+(wrong?' incorrect':'')+(p.solved&&id===q.correctChoiceId?' correct':''),'data-id="'+id+'" aria-pressed="'+(p.selectedId===id)+'" '+(p.solved||wrong?'disabled':''));
  }).join('')+'</div>':'';
  return '<section class="artifact-encounter education-encounter" data-question-id="'+(q?.id||'exhausted')+'" data-topic="'+(q?.topicCode||'')+'" aria-labelledby="education-title">'+sceneArt()+
   '<aside class="master-dialogue"><p class="eyebrow">THE DUNGEON MASTER</p><blockquote>“Knowledge opens the way. Show me what you know.”</blockquote>'+button('‹ Main Menu','home','text-btn')+'</aside>'+
   '<div class="education-panel"><p class="eyebrow">'+(q?'CHAPTER '+q.chapter+' · '+esc(q.topic):'ALL QUESTIONS SEEN')+'</p><h1 id="education-title" tabindex="-1">The Master’s trial</h1>'+
   '<div class="education-gift"><img src="assets/'+gift.icon+'" width="52" height="52" alt=""><p><span>Your chosen artifact</span><strong>'+esc(gift.name)+'</strong><small data-stm-richtext>'+R.description(gift.id)+'</small></p></div>'+
   (q?'<div class="education-question"><div class="education-meta"><span>'+esc(q.id)+' · '+esc(q.difficulty)+'</span><span>'+run.educationState.usedIds.length+' / '+Q.bank.total+' questions seen</span></div><p id="education-prompt" class="education-prompt">'+esc(q.prompt)+'</p>'+answers+
    '<div id="education-feedback" class="education-feedback'+(p.solved?' solved':'')+'" role="status" aria-live="polite"><strong>'+feedback+'</strong>'+(p.solved?'<p>Answer: '+esc(correct.text)+'</p><p>'+esc(q.explanation)+'</p>':'')+'</div>'+
    (p.hinted&&!p.solved?'<div id="education-hint" class="education-hint" tabindex="-1"><strong>Hint</strong><p>'+esc(q.hint)+'</p></div>':'')+
    '<div class="education-actions">'+(p.solved?button(destination,'education-continue','btn primary'):button('Check Answer','education-check','btn primary',selected?'':'disabled')+button(p.hinted?'Hint Shown':'Hint','education-hint','btn subtle',p.hinted?'disabled':''))+'</div></div>':
    '<div class="education-question"><h2>You have seen all 120 questions.</h2><p>The bank is complete. Your old questions will not repeat.</p>'+button(destination,'education-continue','btn primary')+'</div>')+
   '<p class="education-note">Take your time. Wrong answers do not cost HP. New runs keep your question history.</p></div></section>';
 }
 function inventory(run,helpers){
  const items=A.owned(run);
  return '<p>Artifacts work automatically throughout this run. Green terms explain the game; pink terms explain the math. Purple numbers show resolved results.</p><div class="artifact-result-actions">'+helpers.button('View Calculations','calculations','btn small')+'</div><div class="owned-artifacts-grid">'+
   (items.length?items.map(item=>card(item,false,helpers,false,run)).join(''):'<p>Your next Challenge begins with the Dungeon Master. Choose a Starting artifact before entering the map.</p>')+'</div>'+R.glossary();
 }
 root.DCArtifactUI={render,education,inventory};
})(window);
