(function(root){'use strict';
 const D=root.DCTutorialData,T=root.DCTutorialCore,E=root.DCEngine,C=root.DCConfig,Q=root.DCEducation,M=root.STMMechanics,L=root.DCQuestionLanguage,K=root.STMCardKit;
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function mount(host,{language='en',onclose=()=>{},timedMystery=false,legacyRules=false}={}){
  let storage;try{storage=root.localStorage;}catch(_){storage={getItem(){throw Error('Storage unavailable');},setItem(){throw Error('Storage unavailable');}};}
  const course=T.create({storage,language}),frames=new Map(),foundationAnswers={};
  let tips=null,expanded=false,resetPending=false,error='',destroyed=false,questionTab='question',foundationOpen=false;
  if(course.progress().language!==language)course.language(language);
  const gameTerms=text=>root.DCGameLanguage?.gameTerms(text)||text;
  const w=(en,ms)=>course.progress().language==='ms'?gameTerms(ms):en;
  const button=(label,action,value='',extra='')=>'<button type="button" class="btn" data-tutorial-action="'+action+'" data-value="'+esc(value)+'" '+extra+'>'+esc(label)+'</button>';
  const name=card=>K.cardName(K.data.cards.find(c=>c.id===card.key),course.progress().language);
  const replace=text=>(course.progress().language==='ms'?gameTerms(text):text).replace(/\{(energy|hand|handLimit|focusCap|passiveLimit)\}/g,(_,key)=>({energy:C.ENERGY,hand:C.HAND,handLimit:C.HAND_LIMIT,focusCap:C.FOCUS_CAP,passiveLimit:C.PASSIVE_LIMIT})[key]);
  function image(ch){
   const lang=course.progress().language,n=frames.get(ch.id)||0,f=ch.frames[n],file=D.mediaFile(f.shot,lang),src=root.DC_ASSETS?.[file]||'assets/'+file+'?v='+encodeURIComponent(root.DCRelease?.version||'current');
   return '<figure class="tutorial-figure'+(expanded?' is-expanded':'')+'" data-shot="'+file+'"><div class="tutorial-image-heading"><span>'+esc(w('LOOK · STEP ','LIHAT · LANGKAH '))+(n+1)+' / '+ch.frames.length+'</span>'+button(expanded?w('Fit image','Muatkan gambar'):w('Enlarge image','Besarkan gambar'),'zoom','','aria-expanded="'+expanded+'"')+'</div><div class="tutorial-image-scroll"><img src="'+esc(src)+'" alt="'+esc(w('Actual game: ','Game sebenar: ')+replace(f[lang]))+'" decoding="async"></div><figcaption><strong aria-live="polite">'+esc(replace(f[lang]))+'</strong><small>'+esc((legacyRules&&ch.id==='statuses'?w('Current-rule picture. For this older save, read the rule below.','Gambar peraturan semasa. Untuk save lama ini, baca peraturan di bawah.'):w('Real game capture · example values.','Tangkapan game sebenar · nilai contoh.')))+'</small></figcaption><p class="tutorial-image-fallback" role="status">'+esc(w('Picture unavailable. Follow the caption and try the practice below.','Gambar tidak tersedia. Ikut kapsyen dan cuba latihan di bawah.'))+'</p><div class="tutorial-picture-nav" role="group" aria-label="'+esc(w('Picture steps','Langkah bergambar'))+'">'+button(w('← Picture','← Gambar'),'picture',n-1,n===0?'disabled':'')+'<div class="tutorial-picture-dots">'+ch.frames.map((_,i)=>button(String(i+1),'picture',i,'aria-label="'+esc(w('Picture ','Gambar ')+(i+1))+'" aria-pressed="'+(i===n)+'"')).join('')+'</div>'+button(w('Picture →','Gambar →'),'picture',n+1,n===ch.frames.length-1?'disabled':'')+'</div></figure>';
  }
  function metrics(x){
   const r=x.run,b=x.kind==='reward'?null:r.battle,items=b?[[w('HP','HP'),r.hp+'/'+r.maxHp],['Energy',b.energy],['Block',b.block],['Focus',b.focus],[w('Enemy HP','HP musuh'),b.hp],[w('Turn','Giliran'),b.turn]]:[['HP',r.hp+'/'+r.maxHp],['Gold',r.gold],['Deck',r.deck.length]];
   if(x.kind==='boss')items.push([w('Seals open','Seal terbuka'),b.seals+'/'+C.enemies[b.enemyId].seals.length]);
   if(x.kind==='draw')for(const key of ['hand','draw','discard','exhaust'])items.push([key[0].toUpperCase()+key.slice(1),b[key].length]);
   if(x.kind==='passive')items.push([w('Active','Aktif'),b.active.length],['Strength',b.strength||0]);
   return '<dl class="tutorial-metrics">'+items.map(([label,value])=>'<div><dt>'+esc(label)+'</dt><dd>'+esc(value)+'</dd></div>').join('')+'</dl>';
  }
  function foundationHTML(q){
   if(!foundationOpen)return '';
   const source=M.data.foundations.modules.find(m=>m.id===q.learning.foundationId);if(!source)return '';
   const m=L.foundation(source,course.progress().language),rich=(key,tag='div')=>'<'+tag+' data-tutorial-rich="foundation:'+key+'"></'+tag+'>';
   return '<section class="tutorial-foundation" data-tutorial-foundation="'+esc(m.id)+'"><h4>'+esc(w('Basics · ','Asas · ')+m.title)+'</h4>'+m.cards.map((c,i)=>'<article><h5>'+esc(c.title)+'</h5>'+rich('card:'+i)+'</article>').join('')+'<h5>'+esc(w('Check your understanding','Semak kefahaman'))+'</h5>'+m.checks.map((c,i)=>'<div class="tutorial-foundation-check">'+rich('prompt:'+i)+'<div class="tutorial-practice-actions">'+c.choices.map((text,j)=>button(text,'foundation-check',i+':'+j,'aria-pressed="'+(foundationAnswers[c.id]===j)+'"')).join('')+'</div>'+(foundationAnswers[c.id]!==undefined?'<p role="status" data-tutorial-rich="foundation:feedback:'+i+'"></p>':'')+'</div>').join('')+'</section>';
  }
  function questionHTML(x){
   const r=x.run,q=L.question(Q.currentConsumer(r).question,course.progress().language),rec=Q.consumerRecord(r),view=M.session.selectLearningView(q,rec),p=r.battle.question,closed=view.closed,failed=M.session.attemptsExhausted(rec);
   const rich=(key,tag='div')=>'<'+tag+' data-tutorial-rich="'+key+'"></'+tag+'>';
   const tabs='<div class="tutorial-question-tabs" role="tablist" aria-label="'+esc(w('Question steps','Langkah soalan'))+'">'+[['question',w('1 Question','1 Soalan')],['help',w('2 Help','2 Bantuan')],['result',w('3 Result','3 Keputusan')]].map(([id,label])=>button(label,'question-tab',id,'role="tab" id="tutorial-tab-'+id+'" aria-controls="tutorial-panel-'+id+'" aria-selected="'+(questionTab===id)+'" tabindex="'+(questionTab===id?'0':'-1')+'" '+(id==='result'&&!closed?'disabled':''))).join('')+'</div>';
   return '<div class="tutorial-question education-question" data-question-id="'+esc(q.id)+'"><p class="tutorial-question-id">'+esc(q.id+' · '+q.topic)+'</p>'+tabs+
    '<div id="tutorial-panel-question" role="tabpanel" aria-labelledby="tutorial-tab-question" '+(questionTab!=='question'?'hidden':'')+'>'+rich('prompt','h4')+
    (q.harmonization?'<div class="tutorial-given">'+rich('context')+'<ul>'+q.harmonization.given.map((_,i)=>'<li data-tutorial-rich="given:'+i+'"></li>').join('')+'</ul>'+rich('asked')+'</div>':'')+
    '<div class="education-answers" role="group" aria-label="'+esc(w('Practice answers','Jawapan latihan'))+'">'+q.choices.map((c,i)=>{const wrong=p.attempts.includes(c.id)&&c.id!==q.correctChoiceId;return '<div class="education-option">'+button('ABCD'[i],'choose',c.id,'aria-label="'+esc(w('Answer ','Jawapan ')+'ABCD'[i]+': '+c.text)+'" aria-pressed="'+(p.selectedId===c.id)+'" '+(closed||wrong?'disabled':''))+'<div class="education-answer-copy" data-tutorial-rich="choice:'+esc(c.id)+'"></div></div>';}).join('')+'</div><div class="tutorial-practice-actions">'+(!closed?button(w('Check answer','Semak jawapan'),'check','',!p.selectedId?'disabled':'')+button(w('Need help?','Perlu bantuan?'),'question-tab','help'):'')+'</div></div>'+
    '<div id="tutorial-panel-help" role="tabpanel" aria-labelledby="tutorial-tab-help" '+(questionTab!=='help'?'hidden':'')+'><p>'+esc(w('Choose the help you need. Then return to Question.','Pilih bantuan yang diperlukan. Kemudian kembali ke Soalan.'))+'</p><div class="tutorial-practice-actions">'+button(w('Hint','Petunjuk'),'hint','',closed||rec.hintState.hintUsed?'disabled':'')+button(w('More Hint','Petunjuk Lanjut'),'moreHint','',closed||!rec.hintState.moreHintUnlocked||rec.hintState.moreHintViewed?'disabled':'')+button(w('Basics','Asas'),'foundation','',closed?'disabled':'')+'</div>'+
    '<p class="tutorial-hint-rule">'+esc(rec.hintState.moreHintUnlocked?w('One attempt left. Both hints are unlocked.','Tinggal satu cubaan. Kedua-dua petunjuk sudah dibuka.'):w('The first wrong answer unlocks More Hint. You have two attempts in total.','Jawapan salah pertama membuka Petunjuk Lanjut. Anda mempunyai dua cubaan keseluruhan.'))+'</p>'+
    (rec.attempts.length&&!closed?'<div class="tutorial-answer-feedback" role="status">'+esc(w('Not yet. Read the feedback and try again.','Belum tepat. Baca maklum balas dan cuba lagi.'))+rich('feedback')+'</div>':'')+
    (rec.hintState.hintUsed?'<section class="tutorial-support"><h4>'+esc(w('Hint','Petunjuk'))+'</h4>'+q.hintSteps.map(s=>rich('hint:'+s.id)).join('')+'<div data-tutorial-visual="hint"></div></section>':'')+
    (rec.hintState.moreHintViewed?'<section class="tutorial-support"><h4>'+esc(w('More Hint','Petunjuk Lanjut'))+'</h4>'+rich('moreHint')+'</section>':'')+foundationHTML(q)+button(w('← Back to Question','← Kembali ke Soalan'),'question-tab','question')+'</div>'+
    '<div id="tutorial-panel-result" role="tabpanel" aria-labelledby="tutorial-tab-result" '+(questionTab!=='result'?'hidden':'')+'>'+(closed?'<section class="tutorial-solution"><h4>'+esc(failed?w('Review, then replay','Semak, kemudian ulang'):w('Correct answer','Jawapan betul'))+'</h4>'+rich('explanation')+'<p>'+esc(w('Focus gained: ','Focus diterima: ')+(x.result?.focusGained||0)+' · '+(failed?w('No Focus or boss seal gained','Tiada Focus atau seal boss diperoleh'):x.result?.first?w('Independent answer','Jawapan kendiri'):w('Guided answer','Jawapan berbantu')))+'</p>'+button(rec.stepsViewed?w('Hide steps','Sembunyikan langkah'):w('Show steps','Tunjukkan langkah'),'steps')+(view.workedSteps?'<ol>'+view.workedSteps.map(s=>'<li data-tutorial-rich="step:'+s.id+'"></li>').join('')+'</ol>':'')+'<div data-tutorial-visual="solution"></div></section>':'')+
    (x.kind==='boss'&&p.solved&&!x.complete?button(w('End Turn → next Predict','Tamat giliran → Predict seterusnya'),'next-predict'):'')+'</div></div>';
  }
  function practice(ch){
   if(!ch.exercise)return '';
   let x;try{x=course.exercise(ch.id);}catch(_){return '<section class="tutorial-practice-panel"><p>'+esc(w('This example is unavailable. You can still read the chapter.','Contoh ini tidak tersedia. Anda masih boleh membaca bab ini.'))+'</p></section>';}
   const r=x.run,b=x.kind==='reward'?null:r.battle,card=x.cardId&&r.deck.find(c=>c.key===x.cardId),cardInHand=card&&b?.hand.find(c=>c.key===x.cardId);
   let action='',instruction='';
   if(!x.complete){
    if(['attack','draw','passive'].includes(x.kind)||x.kind==='block'&&x.step===0||x.kind==='focus'&&x.step===1||x.kind==='turn'&&x.step<2){instruction=x.kind==='turn'?w(x.step===0?'Step 1: play Defend to gain Block.':'Step 2: play Attack and check enemy HP.',x.step===0?'Langkah 1: mainkan Defend untuk mendapat Block.':'Langkah 2: mainkan Attack dan semak HP musuh.'):w('Play the example card. Check the values that change.','Mainkan kad contoh. Semak nilai yang berubah.');action=button(w('Play ','Mainkan ')+name(card),'play');}
    else if(x.kind==='block'||x.kind==='turn'){instruction=w('Protection is ready. End the turn, then check HP.','Perlindungan sudah tersedia. Tamatkan giliran, kemudian semak HP.');action=button(w('End Turn','Tamat giliran'),'end-turn');}
    else if(x.kind==='focus'){instruction=w('Arm the example Focus first.','Aktifkan Focus contoh dahulu.');action=button(w('Arm Focus','Aktifkan Focus'),'arm');}
    else if(x.kind==='map'){instruction=w('Choose one connected room to enter.','Pilih satu bilik bersambung untuk masuk.');action=E.availableNodes(r).map(n=>button(({battle:'Battle',elite:'Elite',shop:'Shop',camp:'Rest',event:'Mystery',boss:'Boss'})[n.type],'enter',n.id)).join('');}
    else if(x.kind==='reward'){instruction=w('Take one offered card, or try Skip.','Ambil satu kad ditawarkan, atau cuba Langkau.');action=r.rewards.map(id=>button(name({key:id}),'take',id)).join('')+button(w('Skip','Langkau'),'skip');}
    else if(x.kind==='shop'){instruction=w('Choose an offer. Its price uses example Gold.','Pilih tawaran. Harganya menggunakan Gold contoh.');action=r.shop.offers.map((offer,i)=>button(name(offer)+' · '+E.shopPrice(r,offer)+' Gold','buy',i)).join('');}
    else if(x.kind==='rest'){instruction=w('Choose recovery or upgrade one example card.','Pilih pemulihan atau naik taraf satu kad contoh.');action=button(w('Rest · +','Rest · +')+E.restHeal(r)+' HP','heal')+button(w('Upgrade ','Naik taraf ')+name(r.deck.find(c=>E.canUpgrade(c))),'upgrade');}
   }
   const plan=cardInHand?E.cardPlan(r,cardInHand):null,old=x.lastBefore,changed=JSON.stringify(old)!==JSON.stringify(r);
   const delta=b?[['HP',old.hp,r.hp],['Energy',old.battle.energy,b.energy],['Block',old.battle.block,b.block],[w('Enemy HP','HP musuh'),old.battle.hp,b.hp],[w('Turn','Giliran'),old.battle.turn,b.turn],['Focus',old.battle.focus,b.focus],['Strength',old.battle.strength||0,b.strength||0],[w('Active','Aktif'),old.battle.active.length,b.active.length],['Hand',old.battle.hand.length,b.hand.length]]:[['HP',old.hp,r.hp],['Gold',old.gold,r.gold],['Deck',old.deck.length,r.deck.length]];
   const comparison=changed&&delta.some(a=>a[1]!==a[2])?'<div class="tutorial-outcome"><strong>'+esc(w('What changed?','Apa yang berubah?'))+'</strong><ul>'+delta.filter(a=>a[1]!==a[2]).map(([label,a,b])=>'<li>'+esc(label+': '+a+' → '+b)+'</li>').join('')+'</ul></div>':'';
   const intent=b&&E.intent(r);
   return '<section class="tutorial-practice-panel" tabindex="-1" aria-labelledby="tutorial-practice-title"><div class="tutorial-practice-heading"><h3 id="tutorial-practice-title">'+esc(w('Try it','Cuba sendiri'))+'</h3><span>'+esc(w('Safe example','Contoh selamat'))+'</span></div><p class="tutorial-safe-note">'+esc(w('Real game rules. Your run and learning records stay separate.','Peraturan game sebenar. Permainan dan rekod pembelajaran anda berasingan.'))+'</p>'+(x.kind==='turn'?'<ol class="tutorial-turn-steps" aria-label="'+esc(w('Turn actions','Tindakan giliran'))+'">'+[w('Defend','Defend'),w('Attack','Attack'),w('End Turn','Tamat giliran')].map((s,i)=>'<li '+(x.step===i?'aria-current="step"':'')+'>'+(x.step>i?'✓ ':i+1+'. ')+esc(s)+'</li>').join('')+'</ol>':'')+metrics(x)+
    (['predict','boss'].includes(x.kind)?questionHTML(x):(intent?'<p class="tutorial-intent">'+esc(w('Enemy intent: ','Tindakan musuh: ')+intent.damage+' '+w('damage after End Turn.','kerosakan selepas Tamat giliran.'))+'</p>':'')+'<p class="tutorial-task">'+esc(instruction)+'</p>'+(plan?'<div class="tutorial-card-example">'+root.DCCardUI.view(plan,{uid:'tutorial-'+ch.id,lang:course.progress().language})+'</div>':'')+'<div class="tutorial-practice-actions">'+action+'</div>')+
    '<div data-tutorial-status role="status" aria-live="polite" tabindex="-1">'+(x.complete?'<strong data-tutorial-complete>✓ '+esc(w('Practice complete','Latihan selesai'))+'</strong>':'')+comparison+'</div>'+button(w('Replay example','Ulang contoh'),'replay')+'</section>';
  }
  function hydrate(ch){
   if(!['predict','boss'].includes(ch.exercise))return;
   const x=course.exercise(ch.id),q=L.question(Q.currentConsumer(x.run).question,course.progress().language),view=M.session.selectLearningView(q,Q.consumerRecord(x.run)),index=new Map(),panel=host.querySelector('.tutorial-question');
   if(!panel)return;
   const foundationSource=M.data.foundations.modules.find(m=>m.id===q.learning.foundationId),foundation=foundationSource&&L.foundation(foundationSource,course.progress().language);
   panel.setAttribute('data-stm-richtext','');panel.dataset.theme='dark';
   for(const el of panel.querySelectorAll('[data-tutorial-rich]')){
    const key=el.dataset.tutorialRich;let parts;
    if(key.startsWith('foundation:')){const [,kind,i]=key.split(':'),check=foundation?.checks[i];parts=kind==='card'?foundation?.cards[i]?.richText:kind==='prompt'?check?.richText:check?.feedbackRichText[foundationAnswers[check.id]];}
    else if(key==='prompt')parts=view.prompt;else if(key.startsWith('choice:'))parts=view.choices[key.slice(7)];else if(key==='feedback')parts=view.feedback?.richText;else if(key==='explanation')parts=view.explanation;else if(key==='moreHint')parts=view.moreHint;
    else if(key==='context')parts=q.harmonization?.contextRichText;else if(key==='asked')parts=q.harmonization?.askedRichText;else if(key.startsWith('given:'))parts=q.harmonization?.givenRichText[Number(key.slice(6))];else if(key.startsWith('hint:'))parts=view.hintSteps?.[key.slice(5)];else if(key.startsWith('step:'))parts=view.workedSteps?.find(s=>s.id===key.slice(5))?.richText;
    if(parts)M.renderRichText(el,parts,{glossary:M.data.glossary,allowCalculations:key.startsWith('foundation:')||view.allowCalculations,calculationIndex:index});
   }
   for(const visual of panel.querySelectorAll('[data-tutorial-visual]')){const hint=visual.dataset.tutorialVisual==='hint',value=hint?M.selectSupportVisual(q):view.visual;if(value)M.renderVisual(visual,L.visual(value,course.progress().language,q.topicCode),{glossary:M.data.glossary,allowCalculations:view.allowCalculations&&!hint,calculationIndex:index});}
   for(const span of panel.querySelectorAll('span.rt-term,span.rt-calculation')){const b=host.ownerDocument.createElement('button');b.type='button';for(const a of span.attributes)if(!['role','tabindex'].includes(a.name))b.setAttribute(a.name,a.value);while(span.firstChild)b.append(span.firstChild);span.replaceWith(b);}
   tips=M.attachRichTextTooltips(panel,{glossary:M.data.glossary,calculationIndex:index,getLanguage:()=>course.progress().language,getTheme:()=> 'dark'});
  }
  function render(focusAction=null,chapterChange=false){
   if(destroyed)return;tips?.destroy();tips=null;
   const oldFigure=host.querySelector('.tutorial-figure'),oldTop=host.querySelector('.tutorial-content')?.scrollTop||0,oldNav=host.querySelector('.tutorial-toc')?.scrollTop||0,oldLeft=host.querySelector('.tutorial-toc')?.scrollLeft||0;
   const p=course.progress(),ids=D.paths[p.route],i=ids.indexOf(p.chapter),ch=D.chapters.find(c=>c.id===p.chapter),text=D.content(ch.id,p.language,legacyRules),complete=p.completed.includes(ch.id),count=ids.filter(id=>p.completed.includes(id)).length;
   let previousGroup='';
   const toc=ids.map((id,n)=>{const c=D.chapters.find(c=>c.id===id),group=c.group!==previousGroup?'<p class="tutorial-nav-group">'+esc(D.groups[c.group][p.language])+'</p>':'';previousGroup=c.group;return group+'<button type="button" data-tutorial-action="chapter" data-value="'+c.id+'" aria-current="'+(c.id===ch.id?'step':'false')+'"><span class="tutorial-chapter-number">'+(p.completed.includes(c.id)?'✓':String(n+1).padStart(2,'0'))+'</span><span>'+esc(c[p.language].title)+'</span></button>';}).join('');
   let html='<section class="tutorial-shell" data-language-scope data-tutorial data-chapter="'+ch.id+'" lang="'+p.language+'"><header class="tutorial-top"><div><p class="tutorial-kicker">'+esc(w('LOOK · TRY · CHECK','LIHAT · CUBA · SEMAK'))+'</p><p class="tutorial-progress-label">'+count+' / '+ids.length+' '+esc(w('chapters complete','bab selesai'))+'</p><progress value="'+count+'" max="'+ids.length+'" aria-label="'+esc(w('Tutorial progress','Kemajuan tutorial'))+'"></progress></div><div class="tutorial-route" role="group" aria-label="'+esc(w('Tutorial route','Laluan tutorial'))+'">'+button(w('Basics · 10','Asas · 10'),'route','basics','aria-pressed="'+(p.route==='basics')+'"')+button(w('All chapters · 23','Semua bab · 23'),'route','all','aria-pressed="'+(p.route==='all')+'"')+'</div><div class="tutorial-language" role="group" aria-label="'+esc(w('Tutorial language','Bahasa tutorial'))+'">'+button('English','language','en','aria-pressed="'+(p.language==='en')+'"')+button('BM','language','ms','aria-label="Bahasa Melayu" aria-pressed="'+(p.language==='ms')+'"')+'</div></header>'+
    '<div class="tutorial-body"><nav class="tutorial-toc" aria-label="'+esc(w('Tutorial chapters','Bab tutorial'))+'">'+toc+'</nav><article class="tutorial-content">'+
    (timedMystery?'<p class="tutorial-timed-warning" role="alert">'+esc(w('Your timed Mystery is still running. Return to the game to finish it first.','Masa Mystery anda masih berjalan. Kembali ke game untuk menyelesaikannya dahulu.'))+'</p>':'')+
    (p.storageNotice?'<p class="tutorial-storage-note" role="status">'+esc(w('Tutorial progress could not be saved or restored. Every chapter and example still works.','Kemajuan tutorial tidak dapat disimpan atau dipulihkan. Semua bab dan contoh masih boleh digunakan.'))+'</p>':'')+
    '<p class="tutorial-kicker">'+esc(w('CHAPTER','BAB'))+' '+(i+1)+' / '+ids.length+(complete?' · ✓ '+esc(w('Complete','Selesai')):'')+'</p><h3 id="tutorial-chapter-title" tabindex="-1">'+esc(text.title)+'</h3><p class="tutorial-lead">'+esc(replace(text.lead))+'</p>'+(ch.exercise?'<div class="tutorial-jump">'+button(w('Try the practice ↓','Cuba latihan ↓'),'practice')+'</div>':'')+image(ch)+'<ol class="tutorial-steps">'+text.steps.map(s=>'<li>'+esc(replace(s))+'</li>').join('')+'</ol><aside class="tutorial-tip">'+esc(replace(text.tip))+'</aside>'+(text.details.length?'<details class="tutorial-extra" '+(legacyRules&&ch.id==='statuses'?'open':'')+'><summary>'+esc(w('More about this rule','Lanjut tentang peraturan ini'))+'</summary>'+text.details.map(s=>'<p>'+esc(replace(s))+'</p>').join('')+'</details>':'')+practice(ch)+
    '<p class="tutorial-error" role="alert">'+esc(error)+'</p>'+(!ch.exercise?button(complete?w('✓ Chapter complete','✓ Bab selesai'):w('I understand · mark complete','Saya faham · tandakan selesai'),'read','',complete?'disabled':''):'')+
    '<div class="tutorial-reset">'+(resetPending?'<p>'+esc(w('Reset tutorial progress and examples only?','Reset kemajuan dan contoh tutorial sahaja?'))+'</p>'+button(w('Reset tutorial','Reset tutorial'),'reset-confirm')+button(w('Keep progress','Kekalkan kemajuan'),'reset-cancel'):button(w('Restart tutorial','Mulakan semula tutorial'),'reset'))+'</div></article></div>'+
    '<footer class="tutorial-footer"><div>'+button(w('← Previous','← Sebelum'),'previous','',i===0?'disabled':'')+button(i===ids.length-1?w('Return to game','Kembali ke game'):w('Next chapter →','Bab seterusnya →'),i===ids.length-1?'close':'next')+'</div>'+button(w('Return to game','Kembali ke game'),'close')+'</footer></section>';
   if(root.STMHosted?.manager)html=html.replace(/src="assets\/([^"<>]+)"/g,(_,name)=>{const plain=name.split(/[?#]/)[0],key='assets/'+(root.DCIconAssets?.aliases[plain]||plain);return 'data-stm-asset="'+esc(key)+'" src="'+esc(root.STMHosted.imageURL(key))+'"';});
   host.innerHTML=html;
   const newFigure=host.querySelector('.tutorial-figure');if(oldFigure&&oldFigure.dataset.shot===newFigure.dataset.shot&&oldFigure.classList.contains('is-expanded')===expanded)newFigure.replaceWith(oldFigure);
   hydrate(ch);root.DCGameLanguage?.apply(host,p.language);const content=host.querySelector('.tutorial-content'),nav=host.querySelector('.tutorial-toc');content.scrollTop=chapterChange?0:oldTop;nav.scrollTop=oldNav;nav.scrollLeft=oldLeft;
   if(chapterChange)host.querySelector('#tutorial-chapter-title').focus({preventScroll:true});
   else if(focusAction){const target=[...host.querySelectorAll('[data-tutorial-action]')].find(el=>el.dataset.tutorialAction===focusAction.action&&el.dataset.value===focusAction.value&&!el.disabled&&!el.closest('[hidden]'));(target||host.querySelector('[data-tutorial-status]')||host.querySelector('#tutorial-chapter-title')).focus({preventScroll:true});}
  }
  function click(event){
   const el=event.target.closest('[data-tutorial-action]');if(!el||!host.contains(el)||el.disabled)return;event.preventDefault();if(event.detail>1)return;
   const action=el.dataset.tutorialAction,value=el.dataset.value,p=course.progress(),ids=D.paths[p.route],i=ids.indexOf(p.chapter);let chapterChange=false;error='';
   try{
    if(action==='close'){onclose();return;}
    if(action==='practice'){const panel=host.querySelector('.tutorial-practice-panel');panel?.scrollIntoView({block:'start'});panel?.focus({preventScroll:true});return;}
    if(action==='chapter'||action==='previous'||action==='next'){course.select(action==='chapter'?value:ids[i+(action==='next'?1:-1)]);expanded=false;resetPending=false;foundationOpen=false;questionTab='question';chapterChange=true;}
    else if(action==='route'){course.route(value);expanded=false;chapterChange=true;}
    else if(action==='language')course.language(value);
    else if(action==='read')course.completeReading();
    else if(action==='picture'){const ch=D.chapters.find(c=>c.id===p.chapter),n=Number(value);if(!Number.isInteger(n)||n<0||n>=ch.frames.length)throw Error('Unavailable picture');frames.set(ch.id,n);expanded=false;}
    else if(action==='zoom')expanded=!expanded;
    else if(action==='question-tab'){if(!['question','help','result'].includes(value))throw Error('Unavailable tab');questionTab=value;}
    else if(action==='foundation-check'){const q=Q.currentConsumer(course.exercise().run).question,m=M.data.foundations.modules.find(m=>m.id===q.learning.foundationId),[i,j]=value.split(':').map(Number);if(!m.checks[i]?.choices[j])throw Error('Unavailable check');foundationAnswers[m.checks[i].id]=j;}
    else if(action==='replay'){course.replay();foundationOpen=false;questionTab='question';}
    else if(action==='reset')resetPending=true;
    else if(action==='reset-cancel')resetPending=false;
    else if(action==='reset-confirm'){course.reset();frames.clear();resetPending=false;expanded=false;foundationOpen=false;questionTab='question';chapterChange=true;}
    else{const result=course.act(p.chapter,action==='choose'?'select':action,value);if(action==='foundation')foundationOpen=true;if(action==='check')questionTab=Q.consumerLearningView(result.run).closed?'result':'help';if(action==='next-predict')questionTab='question';}
   }catch(_){error=w('That action is unavailable. Check the steps or replay this example.','Tindakan itu tidak tersedia. Semak langkah atau ulang contoh ini.');}
   render({action,value},chapterChange);
  }
  function keydown(event){
   const tab=event.target.closest('[role="tab"][data-tutorial-action="question-tab"]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
   const tabs=[...host.querySelectorAll('[role="tab"][data-tutorial-action="question-tab"]:not(:disabled)')],i=tabs.indexOf(tab),n=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
   event.preventDefault();tabs[n].click();
  }
  function failedImage(event){if(event.target.matches('.tutorial-figure img'))event.target.closest('figure').classList.add('image-unavailable');}
  host.addEventListener('click',click);host.addEventListener('keydown',keydown);host.addEventListener('error',failedImage,true);render();
  return {destroy(){destroyed=true;tips?.destroy();host.removeEventListener('click',click);host.removeEventListener('keydown',keydown);host.removeEventListener('error',failedImage,true);}};
 }
 root.DCTutorial={mount};
})(globalThis);
