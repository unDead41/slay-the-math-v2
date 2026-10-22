(function(root){'use strict';
 const X=root.DCMystery,Q=root.DCEducation,M=root.STMMechanics,C=root.DCConfig,A=root.DCArtifacts,R=root.DCRichText,L=root.DCQuestionLanguage;
 const escapeText=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const words=['max_hp','hp','gold','heal','strength','agility','energy','focus','attack','defend','skill','artifact','combat','first_turn','draw','hand','block'].map(id=>[R.data.glossary[id].label.toLowerCase(),id]);
 words.push(['artifacts','artifact']);words.sort((a,b)=>b[0].length-a[0].length);
 const wordIds=new Map(words),tokens=new RegExp('([+]?\\d+)(\\s+(?:extra\\s+)?)(Max HP|HP|Gold|Strength|Agility|Energy|cards?)\\b|\\b('+words.map(([word])=>word).join('|')+')\\b','gi');
 // These are read-only previews of authored event rules, never a resolution
 // record or a teaching-pool definition applied to the player's real deck.
 function previews(r,e,kind){
  const result=new Map(),put=(amount,unit,label,steps,before=null)=>result.set(Math.abs(amount)+':'+unit.toLowerCase(),{unit,label:e.name+' · '+label,steps,before,sources:[e.id+' · '+(kind==='failure'?'Wrong answer or time up':'On success')]});
  if(kind!=='failure')for(const option of e.success.options){
   for(const cost of option.costs){
    const unit={hp:'HP',maxHp:'Max HP',gold:'Gold'}[cost.resource],before=r[cost.resource];if(!unit)continue;
    const after=before-cost.amount,steps=['Cost: '+cost.amount+' '+unit, before+' − '+cost.amount+' = '+after+' '+unit+' after the trade.'];
    if(cost.minimumAfter!==undefined)steps.push('Keep at least '+cost.minimumAfter+' '+unit+'.');
    if(cost.clampCurrentHpAfter)steps.push('Current HP after: min('+r.hp+', '+after+') = '+Math.min(r.hp,after)+' HP.');
    put(cost.amount,unit,unit+' cost',steps,before);
   }
  }
  const effects=kind==='failure'?e.failure.effects:e.success.options.flatMap(o=>o.effects);
  for(const effect of effects){
   if(effect.type==='ADD_GOLD')put(effect.amount,'Gold','Gold gained',[r.gold+' + '+effect.amount+' = '+(r.gold+effect.amount)+' Gold after claiming this reward.'],r.gold);
   else if(effect.type==='HEAL_HP')put(effect.amount,'HP','Requested healing',R.healing(effect.amount,r.hp,Math.min(r.maxHp,r.hp+effect.amount),r.maxHp).lines,r.hp);
   else if(effect.type==='DAMAGE_HP'){
    const lost=Math.min(effect.amount,Math.max(0,r.hp-1)),steps=['Requested loss: '+effect.amount+' HP','Actual loss: min('+effect.amount+', max(0, '+r.hp+' − 1)) = '+lost+' HP',r.hp+' − '+lost+' = '+(r.hp-lost)+' HP. Failure damage keeps at least 1 HP.'];
    put(lost,'HP','HP lost',steps,r.hp);if(lost!==effect.amount)put(effect.amount,'HP','Maximum HP loss',steps,r.hp);
   }else if(effect.type==='QUEUE_COMBAT_MODIFIER'){
    const unit={STRENGTH:'Strength',AGILITY:'Agility',DRAW:'cards',ENERGY:'Energy'}[effect.stat];if(!unit)continue;
    const steps=['Event modifier: '+(effect.amount>0?'+':'')+effect.amount+' '+unit+'.',effect.duration==='NEXT_COMBAT'?'Applies for the next combat, then expires.':'Applies on the first turn of the next combat only.'];
    if(effect.stat==='DRAW')steps.push('The hand limit is '+C.HAND_LIMIT+' cards. Actual extra draws depend on the free hand slots.');
    put(effect.amount,unit,effect.stat==='DRAW'?'Requested extra draw':effect.amount<0?unit+' lost':unit+' bonus',steps);
   }
  }
  return result;
 }
 function rich(text,r,e,kind='success'){
  const values=previews(r,e,kind);let html='',last=0;
  for(const match of String(text).matchAll(tokens)){
   html+=escapeText(text.slice(last,match.index));
   if(match[1]){
    const [value,space,unit]=match.slice(1,4),preview=values.get(Number(value)+':'+unit.toLowerCase());
    html+=preview?'<button type="button" class="rt-calculation" data-richtext-kind="calculation" data-richtext-scope="artifact" data-category="calculation" data-rt-calculation="'+escapeText(JSON.stringify(M.shared.calculation({origin:'preview',value,...preview})))+'" aria-label="'+escapeText(value+' '+unit+'. Show preview')+'">'+escapeText(value)+'</button>':escapeText(value);
    html+=escapeText(space)+(wordIds.has(unit.toLowerCase())?R.term(wordIds.get(unit.toLowerCase()),unit):escapeText(unit));
   }else html+=R.term(wordIds.get(match[4].toLowerCase()),match[4]);
   last=match.index+match[0].length;
  }
  return html+escapeText(text.slice(last));
 }
 function view(r,{esc,button,cardView,runTop}){
  const p=r.mysteryState.pending,e=X.definition(r),q=L.question(Q.catalog[p.questionId],L.language()),record=q?Q.getSession(r).records[q.id]:null;
  const final=p.phase!=='question',learning=q?M.session.selectLearningView(q,record,{finalReview:final}):null;
  const artwork=e?'mystery-'+e.id.toLowerCase()+(innerWidth<=760?'-small':'')+'.webp':null;
  const art=artwork?'<div class="mystery-art" aria-hidden="true"><img src="assets/'+artwork+'" width="1920" height="1080" alt="" decoding="async"></div>':'';
  let body='';
  if(p.phase==='empty')body='<h1 id="mystery-title" tabindex="-1">A quiet room</h1><p>No unused challenges available. Continue.</p>'+button('Continue','mystery-continue','btn primary');
  else if(p.phase==='intro'){
   const damage=e.failure.effects.find(x=>x.type==='DAMAGE_HP'),penalty=damage?'Lose '+Math.min(damage.amount,Math.max(0,r.hp-1))+' HP. Your HP stays at 1 or above.':e.failure.summary;
   body='<p class="eyebrow">'+esc(X.data.topics[e.topicCode].name)+' · '+e.timeLimitSeconds+' SECONDS</p><h1 id="mystery-title" tabindex="-1">'+esc(e.name)+'</h1><p class="mystery-intro">'+esc(e.intro)+'</p><dl class="mystery-stakes" data-stm-richtext><div><dt>On success</dt><dd>'+rich(e.success.summary,r,e)+'</dd></div><div><dt>Wrong answer or time up</dt><dd>'+rich(penalty,r,e,'failure')+'</dd></div></dl><p class="mystery-help">Select an underlined term for its meaning, or a purple number for a preview.</p><p>One answer. The timer starts when you open the question and keeps running if you leave this screen.</p><div class="mystery-actions">'+button('Start Challenge','mystery-start','btn primary')+button('Leave','mystery-leave','btn subtle')+'</div>';
  }else if(p.phase==='question'||p.phase==='review'){
   const correct=q.choices.find(c=>c.id===q.correctChoiceId),label=p.outcome==='CORRECT'?'Correct':p.outcome==='TIMEOUT'?'Time Up':p.outcome==='ABANDONED_AFTER_START'?'Challenge ended':'Incorrect';
   body='<p class="eyebrow">'+esc(e.name)+'</p><div class="mystery-question-heading"><h1 id="mystery-title" tabindex="-1">'+(final?label:'Solve this challenge')+'</h1>'+(!final?'<span class="mystery-countdown"><output id="mystery-countdown" role="timer" aria-live="off">'+Math.max(0,Math.ceil((p.deadline-Date.now())/1000))+'</output><span>seconds</span></span>':'')+'</div><div class="education-question mystery-question"><div class="education-meta"><span>'+esc(q.id)+' · '+esc(q.difficulty)+'</span><span>'+esc(q.topic)+'</span></div>'+root.STMMechanicsHost.coverageHTML(r)+'<p class="education-answer-help">Choose A–D to submit one answer. Underlined terms explain their meaning.</p><p id="mystery-prompt" class="education-prompt" data-q-rich="prompt">'+esc(q.prompt)+'</p>'+root.STMMechanicsHost.teachingHTML(q,final,{esc})+
    '<div class="education-answers" role="group" aria-labelledby="mystery-prompt">'+p.choiceOrder.map((id,i)=>{const c=q.choices.find(c=>c.id===id);return '<div class="education-option"><button type="button" class="education-answer'+(final&&id===q.correctChoiceId?' correct':final&&id===p.selectedId?' incorrect':'')+'" data-action="mystery-answer" data-id="'+id+'" aria-label="Answer '+'ABCD'[i]+': '+esc(c.text)+'" '+(final?'disabled':'')+'><span class="education-letter" aria-hidden="true">'+'ABCD'[i]+'</span><span class="sr-only">'+esc(c.text)+'</span></button><div class="education-answer-copy"><span data-q-rich="choice:'+id+'">'+esc(c.text)+'</span></div></div>';}).join('')+'</div>'+
    (final?'<section class="mystery-review education-feedback '+(p.outcome==='CORRECT'?'solved':'')+'" aria-live="polite"><h2>'+label+'</h2><p>Correct answer: <strong>'+esc(correct.text)+'</strong></p><p data-q-rich="explanation">'+esc(q.explanation)+'</p>'+(learning.feedback?'<p data-q-rich="feedback">'+esc(learning.feedback.text)+'</p>':'')+'<p data-stm-richtext>'+rich(p.outcome==='CORRECT'?e.success.summary:e.failure.summary,r,e,p.outcome==='CORRECT'?'success':'failure')+'</p></section>':'')+
    root.STMMechanicsHost.supportHTML(q,record,learning,{esc,kind:'mystery',singleAttempt:true})+
    '<div class="mystery-actions">'+(final?button(p.outcome==='CORRECT'&&e.success.mode!=='AUTOMATIC'?'Choose Reward':'Continue','mystery-continue','btn primary')+button(record.stepsViewed?'Hide Steps':'Show Steps','mystery-support','btn subtle','data-kind="steps"'):button(record.hintState.hintUsed?'Hint Shown':'Hint','mystery-support','btn subtle','data-kind="hint" '+(record.hintState.hintUsed?'disabled':'')))+
    (final&&learning.moreHint?button('More Hint','mystery-support','btn subtle','data-kind="moreHint" '+(record.hintState.moreHintViewed?'disabled':'')):'')+button('Basics','mystery-basics','btn subtle')+(!final?button('Leave Challenge','mystery-abandon','text-btn'):'')+'</div><span id="mystery-time-status" class="sr-only" role="status"></span></div>';
  }else if(p.phase==='reward'){
   const option=e.success.options.find(o=>o.id===p.selectedOption),offer=option&&p.offers[option.id],ids=option?X.targets(r,option):[];
   let choices='';
   if(option){
    if(offer.cards)choices='<h2>Choose one card</h2><div class="mystery-card-targets">'+offer.cards.map(key=>cardView({uid:key,key,upgraded:false},'mystery-target','data-id="'+key+'" aria-pressed="'+(p.targetId===key)+'"')).join('')+'</div>';
    else if(ids.length){const artifacts=option.effects.some(e=>e.type==='CONSUME_ARTIFACT');choices='<h2>Choose '+(artifacts?'an artifact':'a card')+'</h2><div class="mystery-target-list">'+ids.map(id=>{const item=artifacts?A.catalog[id]:r.deck.find(c=>c.uid===id),name=item?(artifacts?item.name:C.cards[item.key]?.name+(item.upgraded?' +':'')):null;if(!item||!name)return '';return button((artifacts?'<img src="assets/'+item.icon+'" width="48" height="48" alt="">':'')+'<span>'+esc(name)+'</span>','mystery-target','btn subtle','data-id="'+esc(id)+'" aria-pressed="'+(p.targetId===id)+'"');}).join('')+'</div>';}
    if(offer.artifactId){const a=A.catalog[offer.artifactId];choices+='<div class="mystery-artifact-preview"><img src="assets/'+a.icon+'" width="88" height="88" alt=""><div><h2>'+esc(a.name)+'</h2><p data-stm-richtext>'+root.DCRichText.description(a.id)+'</p></div></div>';}
    if(offer.transforms&&p.targetId)choices+='<p>Your card becomes <strong>'+esc(C.cards[offer.transforms[p.targetId]].name)+'</strong> with no upgrade.</p>';
   }
   body='<p class="eyebrow">CHALLENGE COMPLETE</p><h1 id="mystery-title" tabindex="-1">Choose your reward</h1><p data-stm-richtext>'+rich(e.success.summary,r,e)+'</p><div class="mystery-options">'+e.success.options.map(o=>button(esc(o.label),'mystery-option','btn subtle','data-id="'+o.id+'" aria-pressed="'+(o.id===p.selectedOption)+'" '+(!X.actionable(r,o)?'disabled':''))).join('')+'</div>'+choices+'<div class="mystery-actions">'+button(option?esc(option.costs.length?option.label:'Confirm Reward'):'Choose an option','mystery-claim','btn primary',!option||(ids.length&&!p.targetId)?'disabled':'')+button('Decline & Leave','mystery-leave','btn subtle')+'</div>';
  }
  return '<section class="mystery-layout" data-event-id="'+(e?.id||'empty')+'" data-phase="'+p.phase+'" aria-labelledby="mystery-title">'+art+'<div class="mystery-hud">'+runTop()+'</div><div class="mystery-panel ornate-panel" data-question-scroll="'+esc(p.key+':'+(p.questionId||'intro'))+'" tabindex="0" role="region" aria-labelledby="mystery-title" data-stm-richtext>'+body+'</div></section>';
 }
 function hydrate(r){const p=r.mysteryState?.pending,q=L.question(Q.catalog[p?.questionId],L.language()),host=document.querySelector('.mystery-question');if(host&&q)root.STMMechanicsHost.hydrateQuestion(host,q,M.session.selectLearningView(q,Q.getSession(r).records[q.id],{finalReview:p.phase!=='question'}));}
 let clockAnchor=null;
 function clock(r,onExpire){
  const p=r.mysteryState?.pending;if(p?.phase!=='question')return null;
  const key=p.key+':'+p.deadline;if(clockAnchor?.key!==key)clockAnchor={key,origin:performance.now(),wall:Date.now()};
  const {origin,wall}=clockAnchor,now=()=>Math.max(Date.now(),wall+performance.now()-origin);let last=null,stopped=false;
  const tick=()=>{if(stopped)return;const remaining=Math.max(0,Math.ceil((p.deadline-now())/1000)),el=document.querySelector('#mystery-countdown');if(el&&remaining!==last){el.textContent=String(remaining);el.parentElement.classList.toggle('urgent',remaining<=10);const live=document.querySelector('#mystery-time-status');if(live&&[10,5].includes(remaining))live.textContent=remaining+' seconds remaining.';}last=remaining;if(now()>=p.deadline){stopped=true;onExpire(Math.ceil(now()));}};
  const timer=setInterval(tick,200);queueMicrotask(tick);return {now:()=>Math.ceil(now()),destroy(){stopped=true;clearInterval(timer);}};
 }
 root.DCMysteryUI={view,hydrate,clock};
})(window);
