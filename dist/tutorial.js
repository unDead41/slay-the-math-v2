(function(root){'use strict';
 const D=root.DCTutorialData,T=root.DCTutorialCore,E=root.DCEngine,C=root.DCConfig,Q=root.DCEducation,M=root.STMMechanics,L=root.DCQuestionLanguage,K=root.STMCardKit;
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function mount(host,{language='en',onclose=()=>{},timedMystery=false}={}){
  let storage;try{storage=root.localStorage;}catch(_){storage={getItem(){throw Error('Storage unavailable');},setItem(){throw Error('Storage unavailable');}};}
  const course=T.create({storage,language});let tips=null,expanded=false,resetPending=false,error='',destroyed=false;
  const w=(en,ms)=>course.progress().language==='ms'?ms:en;
  const button=(label,action,value='',extra='')=>'<button type="button" class="btn" data-tutorial-action="'+action+'" data-value="'+esc(value)+'" '+extra+'>'+esc(label)+'</button>';
  const name=card=>K.cardName(K.data.cards.find(c=>c.id===card.key),course.progress().language);
  const replace=text=>text.replace(/\{(energy|hand|handLimit|focusCap|passiveLimit)\}/g,(_,key)=>({energy:C.ENERGY,hand:C.HAND,handLimit:C.HAND_LIMIT,focusCap:C.FOCUS_CAP,passiveLimit:C.PASSIVE_LIMIT})[key]);
  function image(ch){const file='tutorial-'+ch.image+'.webp',src=root.DC_ASSETS?.[file]||'assets/'+file;
   return '<figure class="tutorial-figure'+(expanded?' is-expanded':'')+'"><div class="tutorial-image-scroll"><img src="'+esc(src)+'" alt="'+esc(w('Game screenshot: ','Gambar skrin game: ')+ch[course.progress().language].title)+'" decoding="async"></div><figcaption>'+esc(w('Actual game screenshot · example values and offers.','Gambar skrin game sebenar · nilai dan tawaran contoh.'))+' '+button(expanded?w('Fit image','Muatkan gambar'):w('Enlarge image','Besarkan gambar'),'zoom','','aria-expanded="'+expanded+'"')+'</figcaption><p class="tutorial-image-fallback">'+esc(w('The image is unavailable. The steps and practice below still work.','Gambar tidak tersedia. Langkah dan latihan di bawah masih boleh digunakan.'))+'</p></figure>';
  }
  function metrics(x){
   const r=x.run,b=r.battle,items=b?[[w('HP','HP'),r.hp+'/'+r.maxHp],[w('Energy','Energy'),b.energy],[w('Block','Block'),b.block],[w('Focus','Focus'),b.focus],[w('Enemy HP','HP musuh'),b.hp],[w('Turn','Giliran'),b.turn]]:[[w('HP','HP'),r.hp+'/'+r.maxHp],[w('Gold','Gold'),r.gold],[w('Deck','Deck'),r.deck.length]];
   if(x.kind==='boss')items.push([w('Seals open','Seal terbuka'),b.seals+'/2']);
   if(x.kind==='draw')for(const key of ['hand','draw','discard','exhaust'])items.push([key[0].toUpperCase()+key.slice(1),b[key].length]);
   if(x.kind==='passive')items.push([w('Active','Aktif'),b.active.length],[w('Strength','Strength'),b.strength||0]);
   return '<dl class="tutorial-metrics">'+items.map(([label,value])=>'<div><dt>'+esc(label)+'</dt><dd>'+esc(value)+'</dd></div>').join('')+'</dl>';
  }
  function questionHTML(x){
   const r=x.run,q=L.question(Q.currentConsumer(r).question,course.progress().language),rec=Q.consumerRecord(r),view=M.session.selectLearningView(q,rec),p=r.battle.question;
   const rich=(key,tag='div')=>'<'+tag+' data-tutorial-rich="'+key+'"></'+tag+'>';
   return '<div class="tutorial-question education-question" data-question-id="'+esc(q.id)+'"><p class="tutorial-question-id">'+esc(q.id+' · '+q.topic)+'</p>'+rich('prompt','h4')+
    (q.harmonization?'<div class="tutorial-given">'+rich('context')+'<ul>'+q.harmonization.given.map((_,i)=>'<li data-tutorial-rich="given:'+i+'"></li>').join('')+'</ul>'+rich('asked')+'</div>':'')+
    '<div class="education-answers" role="group" aria-label="'+esc(w('Practice answers','Jawapan latihan'))+'">'+q.choices.map((c,i)=>{const wrong=p.attempts.includes(c.id)&&c.id!==q.correctChoiceId;return '<div class="education-option">'+button('ABCD'[i],'choose',c.id,'aria-label="'+esc(w('Answer ','Jawapan ')+'ABCD'[i]+': '+c.text)+'" aria-pressed="'+(p.selectedId===c.id)+'" '+(p.solved||wrong?'disabled':''))+'<div class="education-answer-copy" data-tutorial-rich="choice:'+esc(c.id)+'"></div></div>';}).join('')+'</div>'+
    '<div class="tutorial-practice-actions">'+(!p.solved?button(w('Check answer','Semak jawapan'),'check','',''+(!p.selectedId?'disabled':''))+button(w('Hint','Hint'),'hint','',rec.hintState.hintUsed?'disabled':'')+button(w('More Hint','More Hint'),'moreHint','',!rec.hintState.moreHintUnlocked||rec.hintState.moreHintViewed?'disabled':''):button(rec.stepsViewed?w('Hide steps','Sembunyikan langkah'):w('Show steps','Tunjukkan langkah'),'steps'))+'</div>'+
    '<p class="tutorial-hint-rule">'+esc(p.solved?w('Read the explanation below.','Baca penerangan di bawah.'):rec.hintState.moreHintUnlocked?w('More Hint is ready.','More Hint sudah tersedia.'):rec.hintState.hintUsed?w('A wrong answer after Hint unlocks More Hint.','Jawapan salah selepas Hint membuka More Hint.'):w('Use Hint for a starting idea.','Gunakan Hint untuk idea awal.'))+'</p>'+
    (rec.attempts.length&&!p.solved?'<div class="tutorial-answer-feedback" role="status">'+esc(w('Not yet. Read the feedback and try again.','Belum tepat. Baca maklum balas dan cuba lagi.'))+rich('feedback')+'</div>':'')+
    (rec.hintState.hintUsed?'<details class="tutorial-support" open><summary>Hint</summary>'+q.hintSteps.map(s=>rich('hint:'+s.id)).join('')+'<div data-tutorial-visual="hint"></div></details>':'')+
    (rec.hintState.moreHintViewed?'<details class="tutorial-support" open><summary>More Hint</summary>'+rich('moreHint')+'</details>':'')+
    (p.solved?'<section class="tutorial-solution"><h4>'+esc(w('Correct answer','Jawapan betul'))+'</h4>'+rich('explanation')+'<p>'+esc(w('Focus gained: ','Focus diterima: ')+(x.result?.focusGained||0)+' · '+(x.result?.first?w('Independent answer','Jawapan kendiri'):w('Guided answer','Jawapan berbantu')))+'</p>'+(view.workedSteps?'<ol>'+view.workedSteps.map(s=>'<li data-tutorial-rich="step:'+s.id+'"></li>').join('')+'</ol>':'')+'<div data-tutorial-visual="solution"></div></section>':'')+
    (x.kind==='boss'&&p.solved&&!x.complete?button(w('End Turn → next Predict','End Turn → Predict seterusnya'),'next-predict'):'')+'</div>';
  }
  function practice(ch){
   if(!ch.exercise)return '';
   let x;try{x=course.exercise(ch.id);}catch(_){return '<section class="tutorial-practice-panel"><p>'+esc(w('This example is unavailable. You can still read the chapter.','Contoh ini tidak tersedia. Anda masih boleh membaca bab ini.'))+'</p></section>';}
   const r=x.run,b=r.battle,card=x.cardId&&r.deck.find(c=>c.key===x.cardId),cardInHand=card&&b?.hand.find(c=>c.key===x.cardId);
   let action='',instruction='';
   if(!x.complete){
    if(['attack','draw','passive'].includes(x.kind)||x.kind==='block'&&x.step===0||x.kind==='focus'&&x.step===1){instruction=w('Play the example card and compare the numbers.','Mainkan kad contoh dan bandingkan nilainya.');action=button(w('Play ','Mainkan ')+name(card),'play');}
    else if(x.kind==='block'){instruction=w('Block is ready. End the turn to see it absorb the enemy’s attack.','Block sudah tersedia. Tamatkan giliran untuk melihatnya menyerap serangan musuh.');action=button('End Turn','end-turn');}
    else if(x.kind==='focus'){instruction=w('Arm your example Focus first.','Aktifkan Focus contoh dahulu.');action=button(w('Arm Focus','Aktifkan Focus'),'arm');}
    else if(x.kind==='map'){instruction=w('Choose one connected room to enter.','Pilih satu bilik yang bersambung untuk masuk.');action=E.availableNodes(r).map(n=>button(({battle:'Battle',elite:'Elite',shop:'Shop',camp:'Rest',event:'Mystery',boss:'Boss'})[n.type],'enter',n.id)).join('');}
    else if(x.kind==='reward'){instruction=w('Take one offered card, or practise skipping a reward.','Ambil satu kad yang ditawarkan, atau cuba melangkau ganjaran.');action=r.rewards.map(id=>button(name({key:id}),'take',id)).join('')+button('Skip','skip');}
    else if(x.kind==='shop'){instruction=w('Choose one example offer. Its live price is deducted from example Gold.','Pilih satu tawaran contoh. Harga semasanya ditolak daripada Gold contoh.');action=r.shop.offers.map((offer,i)=>button(name(offer)+' · '+E.shopPrice(r,offer)+' Gold','buy',i)).join('');}
    else if(x.kind==='rest'){instruction=w('Choose recovery or upgrade one example card.','Pilih pemulihan atau naik taraf satu kad contoh.');action=button(w('Rest · +','Rest · +')+E.restHeal(r)+' HP','heal')+button(w('Upgrade ','Naik taraf ')+name(r.deck.find(c=>E.canUpgrade(c))),'upgrade');}
   }
   const plan=cardInHand?E.cardPlan(r,cardInHand):null;
   const comparison=x.complete?'<p class="tutorial-outcome">'+(b?esc(w('Enemy HP','HP musuh')+': '+x.before.battle.hp+' → '+b.hp+' · Energy: '+x.before.battle.energy+' → '+b.energy):esc('HP: '+x.before.hp+' → '+r.hp+' · Gold: '+x.before.gold+' → '+r.gold+' · Deck: '+x.before.deck.length+' → '+r.deck.length))+'</p>':'';
   return '<section class="tutorial-practice-panel" aria-labelledby="tutorial-practice-title"><div class="tutorial-practice-heading"><h3 id="tutorial-practice-title">'+esc(w('Try it','Cuba sendiri'))+'</h3><span>'+esc(w('Example only','Contoh sahaja'))+'</span></div><p class="tutorial-safe-note">'+esc(w('Uses the real game rules. Your run, Gold, question history and Learning Report are separate.','Menggunakan peraturan game sebenar. Run, Gold, sejarah soalan dan Learning Report anda berasingan.'))+'</p>'+metrics(x)+
    (['predict','boss'].includes(x.kind)?questionHTML(x):'<p class="tutorial-task">'+esc(instruction)+'</p>'+(plan?'<div class="tutorial-card-example">'+root.DCCardUI.view(plan,{uid:'tutorial-'+ch.id,lang:course.progress().language})+'</div>':'')+'<div class="tutorial-practice-actions">'+action+'</div>')+
    '<div data-tutorial-status role="status" aria-live="polite" tabindex="-1">'+(x.complete?'<strong data-tutorial-complete>✓ '+esc(w('Practice complete','Latihan selesai'))+'</strong>'+comparison:'')+'</div>'+button(w('Replay example','Ulang contoh'),'replay')+'</section>';
  }
  function hydrate(ch){
   if(!['predict','boss'].includes(ch.exercise))return;
   const x=course.exercise(ch.id),q=L.question(Q.currentConsumer(x.run).question,course.progress().language),view=M.session.selectLearningView(q,Q.consumerRecord(x.run)),index=new Map(),panel=host.querySelector('.tutorial-question');
   if(!panel)return;
   panel.setAttribute('data-stm-richtext','');panel.dataset.theme='dark';
   for(const el of panel.querySelectorAll('[data-tutorial-rich]')){
    const key=el.dataset.tutorialRich;let parts;
    if(key==='prompt')parts=view.prompt;else if(key.startsWith('choice:'))parts=view.choices[key.slice(7)];else if(key==='feedback')parts=view.feedback?.richText;else if(key==='explanation')parts=view.explanation;else if(key==='moreHint')parts=view.moreHint;
    else if(key==='context')parts=q.harmonization?.contextRichText;else if(key==='asked')parts=q.harmonization?.askedRichText;else if(key.startsWith('given:'))parts=q.harmonization?.givenRichText[Number(key.slice(6))];else if(key.startsWith('hint:'))parts=view.hintSteps?.[key.slice(5)];else if(key.startsWith('step:'))parts=view.workedSteps?.find(s=>s.id===key.slice(5))?.richText;
    if(parts)M.renderRichText(el,parts,{glossary:M.data.glossary,allowCalculations:view.allowCalculations,calculationIndex:index});
   }
   for(const visual of panel.querySelectorAll('[data-tutorial-visual]')){const hint=visual.dataset.tutorialVisual==='hint',value=hint?M.selectSupportVisual(q):view.visual;if(value)M.renderVisual(visual,L.visual(value,course.progress().language,q.topicCode),{glossary:M.data.glossary,allowCalculations:view.allowCalculations&&!hint,calculationIndex:index});}
   for(const span of panel.querySelectorAll('span.rt-term,span.rt-calculation')){const b=host.ownerDocument.createElement('button');b.type='button';for(const a of span.attributes)if(!['role','tabindex'].includes(a.name))b.setAttribute(a.name,a.value);while(span.firstChild)b.append(span.firstChild);span.replaceWith(b);}
   tips=M.attachRichTextTooltips(panel,{glossary:M.data.glossary,calculationIndex:index,getLanguage:()=>course.progress().language,getTheme:()=> 'dark'});
  }
  function render(focusAction=null,chapterChange=false){
   if(destroyed)return;tips?.destroy();tips=null;
   const oldFigure=host.querySelector('.tutorial-figure'),oldChapter=host.querySelector('[data-tutorial]')?.dataset.chapter;
   const oldTop=host.querySelector('.tutorial-content')?.scrollTop||0,oldNav=host.querySelector('.tutorial-toc')?.scrollTop||0,oldLeft=host.querySelector('.tutorial-toc')?.scrollLeft||0;
   const p=course.progress(),i=D.chapters.findIndex(ch=>ch.id===p.chapter),ch=D.chapters[i],text=ch[p.language],complete=p.completed.includes(ch.id);
   host.innerHTML='<section class="tutorial-shell" data-tutorial data-chapter="'+ch.id+'" lang="'+p.language+'"><header class="tutorial-top"><div><p class="tutorial-kicker">'+esc(w('PLAYER FIELD GUIDE','PANDUAN PEMAIN'))+'</p><p class="tutorial-progress-label">'+p.completed.length+' / '+D.chapters.length+' '+esc(w('chapters complete','bab selesai'))+'</p><progress value="'+p.completed.length+'" max="'+D.chapters.length+'" aria-label="'+esc(w('Tutorial progress','Kemajuan tutorial'))+'"></progress></div><div class="tutorial-language" role="group" aria-label="'+esc(w('Tutorial language','Bahasa tutorial'))+'">'+button('English','language','en','aria-pressed="'+(p.language==='en')+'"')+button('Bahasa Melayu','language','ms','aria-pressed="'+(p.language==='ms')+'"')+'</div></header>'+
    '<div class="tutorial-body"><nav class="tutorial-toc" aria-label="'+esc(w('Tutorial chapters','Bab tutorial'))+'">'+D.chapters.map((c,n)=>'<button type="button" data-tutorial-action="chapter" data-value="'+c.id+'" aria-current="'+(c.id===ch.id?'step':'false')+'"><span class="tutorial-chapter-number">'+(p.completed.includes(c.id)?'✓':String(n+1).padStart(2,'0'))+'</span><span>'+esc(c[p.language].title)+'</span></button>').join('')+'</nav><article class="tutorial-content">'+
    (timedMystery?'<p class="tutorial-timed-warning" role="alert">'+esc(w('Your timed Mystery is still running. Return to the game to finish it first.','Masa Mystery anda masih berjalan. Kembali ke game untuk menyelesaikannya dahulu.'))+'</p>':'')+
    (p.storageNotice?'<p class="tutorial-storage-note" role="status">'+esc(w('Tutorial progress could not be saved or restored. You can still use every chapter and practice.','Kemajuan tutorial tidak dapat disimpan atau dipulihkan. Semua bab dan latihan masih boleh digunakan.'))+'</p>':'')+
    '<p class="tutorial-kicker">'+esc(w('CHAPTER','BAB'))+' '+String(i+1).padStart(2,'0')+' / '+D.chapters.length+(complete?' · ✓ '+esc(w('Complete','Selesai')):'')+'</p><h3 id="tutorial-chapter-title" tabindex="-1">'+esc(text.title)+'</h3><p class="tutorial-lead">'+esc(replace(text.lead))+'</p>'+image(ch)+'<ol class="tutorial-steps">'+text.steps.map(s=>'<li>'+esc(replace(s))+'</li>').join('')+'</ol><aside class="tutorial-tip">'+esc(replace(text.tip))+'</aside>'+practice(ch)+
    '<p class="tutorial-error" role="alert">'+esc(error)+'</p>'+(!ch.exercise?button(complete?w('✓ Chapter complete','✓ Bab selesai'):w('Mark chapter complete','Tandakan bab selesai'),'read','',complete?'disabled':''):'')+
    '<div class="tutorial-reset">'+(resetPending?'<p>'+esc(w('Reset only tutorial progress and examples? Your game and learning records stay as they are.','Reset kemajuan dan contoh tutorial sahaja? Rekod game dan pembelajaran anda kekal.'))+'</p>'+button(w('Reset tutorial','Reset tutorial'),'reset-confirm')+button(w('Keep progress','Kekalkan kemajuan'),'reset-cancel'):button(w('Restart tutorial','Mulakan semula tutorial'),'reset'))+'</div></article></div>'+
    '<footer class="tutorial-footer"><div>'+button(w('← Previous','← Sebelum'),'previous','',i===0?'disabled':'')+button(i===D.chapters.length-1?w('Return to game','Kembali ke game'):w('Next chapter →','Bab seterusnya →'),i===D.chapters.length-1?'close':'next')+'</div>'+button(w('Return to game','Kembali ke game'),'close')+'</footer></section>';
   if(oldFigure&&oldChapter===ch.id&&oldFigure.classList.contains('is-expanded')===expanded)host.querySelector('.tutorial-figure').replaceWith(oldFigure);
   hydrate(ch);const content=host.querySelector('.tutorial-content'),nav=host.querySelector('.tutorial-toc');content.scrollTop=chapterChange?0:oldTop;nav.scrollTop=oldNav;nav.scrollLeft=oldLeft;
   if(chapterChange)host.querySelector('#tutorial-chapter-title').focus({preventScroll:true});
   else if(focusAction){const target=[...host.querySelectorAll('[data-tutorial-action]')].find(el=>el.dataset.tutorialAction===focusAction.action&&el.dataset.value===focusAction.value&&!el.disabled);(target||host.querySelector('[data-tutorial-status]')||host.querySelector('#tutorial-chapter-title')).focus({preventScroll:true});}
  }
  function click(event){
   const el=event.target.closest('[data-tutorial-action]');if(!el||!host.contains(el)||el.disabled)return;event.preventDefault();
   const action=el.dataset.tutorialAction,value=el.dataset.value,p=course.progress(),i=D.chapters.findIndex(c=>c.id===p.chapter);let chapterChange=false;error='';
   try{
    if(action==='close'){onclose();return;}
    if(action==='chapter'||action==='previous'||action==='next'){course.select(action==='chapter'?value:D.chapters[i+(action==='next'?1:-1)].id);expanded=false;resetPending=false;chapterChange=true;}
    else if(action==='language')course.language(value);
    else if(action==='read')course.completeReading();
    else if(action==='zoom')expanded=!expanded;
    else if(action==='replay')course.replay();
    else if(action==='reset')resetPending=true;
    else if(action==='reset-cancel')resetPending=false;
    else if(action==='reset-confirm'){course.reset();resetPending=false;expanded=false;chapterChange=true;}
    else course.act(p.chapter,action==='choose'?'select':action,value);
   }catch(_){error=w('That action is unavailable. Check the steps or replay this example.','Tindakan itu tidak tersedia. Semak langkah atau ulang contoh ini.');}
   render({action,value},chapterChange);
  }
  function failedImage(event){if(event.target.matches('.tutorial-figure img'))event.target.closest('figure').classList.add('image-unavailable');}
  host.addEventListener('click',click);host.addEventListener('error',failedImage,true);render();
  return {destroy(){destroyed=true;tips?.destroy();host.removeEventListener('click',click);host.removeEventListener('error',failedImage,true);}};
 }
 root.DCTutorial={mount};
})(globalThis);
