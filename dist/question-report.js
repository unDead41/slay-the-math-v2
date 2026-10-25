/* In-game reports use the same comment owner and opt-in outbox as Practice. */
(function(root,factory){'use strict';if(typeof module==='object'&&module.exports)module.exports=factory(require('./question-feedback.js'));else root.DCQuestionReport=factory(root.DCQuestionFeedback);})(globalThis,function(Feedback){'use strict';
 const sources=new Set(['predict','artifact','mystery']);
 const labels={
  en:{title:'Report a problem',intro:'Yes, we do read your comments. Tell us which part needs improvement.',context:'Question details (filled automatically)',source:'Question from',language:'Question language',hint:'Hint opened',more:'More Hint opened',steps:'Worked steps opened',yes:'Yes',no:'No',categories:'What needs improvement?',comment:'Your comment (optional)',placeholder:'For example: I could not tell which numbers to use in More Hint.',save:'Save report',back:'Back to result',invalid:'Choose a category or write a comment.',saved:'Your report is saved on this device.',temporary:'Your report is kept for this open game. Device storage is unavailable; keep a JSON backup from Learning Report before leaving.',queueError:'Your report is kept here, but could not be queued for sharing. Open Learning Report → Sharing to retry or keep a backup.',off:'Sharing is off. You can enable it later in Learning Report → Sharing.',pending:'Sharing is enabled. Pending reports will retry when the game is open and a connection is available.',received:'The collector has acknowledged the latest queued records.',dev:'This is a temporary developer session. Reports are not sent.',local:'Reports stay on this device. A collector is not available here.',predict:'Predict',artifact:'Artifact trial',mystery:'Mystery challenge'},
  ms:{title:'Laporkan masalah',intro:'Ya, kami membaca komen anda. Beritahu kami bahagian yang perlu diperbaiki.',context:'Butiran soalan (diisi secara automatik)',source:'Soalan daripada',language:'Bahasa soalan',hint:'Petunjuk dibuka',more:'Petunjuk Lanjut dibuka',steps:'Langkah penyelesaian dibuka',yes:'Ya',no:'Tidak',categories:'Apakah yang perlu diperbaiki?',comment:'Komen anda (pilihan)',placeholder:'Contoh: Saya tidak jelas nombor mana yang perlu digunakan dalam Petunjuk Lanjut.',save:'Simpan laporan',back:'Kembali ke keputusan',invalid:'Pilih kategori atau tulis komen.',saved:'Laporan anda disimpan pada peranti ini.',temporary:'Laporan anda dikekalkan dalam permainan yang terbuka ini. Storan peranti tidak tersedia; simpan sandaran JSON melalui Laporan Pembelajaran sebelum keluar.',queueError:'Laporan anda dikekalkan di sini, tetapi belum dapat dimasukkan ke giliran perkongsian. Buka Laporan Pembelajaran → Perkongsian untuk mencuba lagi atau menyimpan sandaran.',off:'Perkongsian dijeda. Anda boleh mengaktifkannya kemudian melalui Laporan Pembelajaran → Perkongsian.',pending:'Perkongsian aktif. Laporan tertunda akan dicuba semula apabila permainan dibuka dan sambungan tersedia.',received:'Pelayan telah mengesahkan penerimaan rekod terkini dalam giliran.',dev:'Ini sesi pembangun sementara. Laporan tidak dihantar.',local:'Laporan kekal pada peranti ini. Pelayan pengumpulan tidak tersedia di sini.',predict:'Predict',artifact:'Cabaran artifak',mystery:'Cabaran misteri'}
 };
 const categoryMalay={'hint-unclear':'Petunjuk kurang jelas','more-hint-unclear':'Petunjuk Lanjut kurang jelas','question-difficult':'Soalan terlalu sukar','question-confusing':'Soalan mengelirukan','steps-unclear':'Susunan langkah penyelesaian kurang jelas','diagram-unclear':'Rajah atau jadual kurang jelas',other:'Perkara lain'};
 const copy=x=>JSON.parse(JSON.stringify(x));
 function contextFrom(record,source,language){
  if(!record||!sources.has(source)||!['correct','revealed'].includes(record.status))throw Error('Report a finished game question.');
  return {mode:'gameplay',source,language:language==='ms'?'ms':'en',status:record.status,...Feedback.questionFeedbackSupport(record)};
 }
 function create({document,storage,bank,gameVersion=document.defaultView?.DCRelease?.version,enqueue,getDelivery=()=>({enabled:false}),onOpenSharing}){
  const store=Feedback.createQuestionFeedbackStore({storage,bankVersion:bank.bankVersion,questionIds:bank.questions.map(q=>q.id),...(gameVersion&&bank.contentRevision?{provenance:{gameVersion,contentRevision:bank.contentRevision}}:{})});
  let dialog=null,active=null,returnFocus=null,queueError=false;
  const node=id=>dialog.querySelector('[data-report="'+id+'"]');
  function ensure(){
   if(dialog)return;
   dialog=document.createElement('dialog');dialog.id='question-report-dialog';dialog.className='question-report-dialog';dialog.setAttribute('aria-labelledby','question-report-title');dialog.setAttribute('aria-describedby','question-report-intro');
   dialog.innerHTML='<form><header><h2 id="question-report-title" data-report="title"></h2><p id="question-report-intro" data-report="intro"></p></header><section class="question-report-context"><h3 data-report="context-label"></h3><p data-report="question-id"></p><p data-report="prompt"></p><dl data-report="context"></dl></section><fieldset><legend data-report="categories-label"></legend><div class="question-report-categories" data-report="categories"></div></fieldset><label class="question-report-comment"><span data-report="comment-label"></span><textarea data-report="comment" rows="4" maxlength="2000"></textarea></label><p class="question-report-count" data-report="count"></p><p class="question-report-status" data-report="status" role="status" aria-live="polite"></p><p class="question-report-delivery" data-report="delivery"></p><footer><button type="submit" class="btn primary" data-report="save"></button><button type="button" class="btn subtle" data-report="back"></button></footer></form>';
   node('title').tabIndex=-1;
   const sharing=document.createElement('button');sharing.type='button';sharing.className='btn subtle';sharing.dataset.report='sharing';sharing.hidden=true;sharing.addEventListener('click',()=>{close();onOpenSharing?.();});dialog.querySelector('footer').append(sharing);
   dialog.querySelector('form').addEventListener('submit',event=>{event.preventDefault();save();});
   node('back').addEventListener('click',close);
   node('comment').addEventListener('input',()=>{node('count').textContent=node('comment').value.length+' / 2,000';});
   dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
   document.body.append(dialog);
  }
  function delivery(){
   if(!active)return;const c=labels[active.context.language],s=getDelivery()||{};
   node('delivery').textContent=Feedback.questionFeedbackDeliveryText({...s,queueError},active.context.language);
   node('sharing').textContent=active.context.language==='ms'?'Perkongsian dan sandaran':'Sharing and backup';
   node('sharing').hidden=typeof onOpenSharing!=='function'||!!s.dev||!!s.collectionDisabled||!(queueError||['unavailable','save-error'].includes(s.state));
  }
  function publish(saved){
   queueError=false;try{if(saved){const result=enqueue?.(saved);queueError=result==null||!!result.error||result.entry===null;}}catch{queueError=true;}
  }
  function open({question,record,source,language,focus}){
   const context=contextFrom(record,source,language);
   if(!bank.questions.some(q=>q.id===question?.id)||record.questionId!==question.id)throw Error('Unknown report question.');
   ensure();if(dialog.open)close();returnFocus=focus||document.activeElement;
   active={question:copy(question),context:copy(context)};queueError=false;
   store.flush();const previous=store.get(question.id),c=labels[context.language];dialog.lang=context.language;
   if(previous)publish(previous);
   for(const key of ['title','intro','save','back'])node(key).textContent=c[key];
   node('context-label').textContent=c.context;node('categories-label').textContent=c.categories;node('comment-label').textContent=c.comment;
   node('question-id').textContent=question.id;node('prompt').textContent=question.prompt;
   const rows=[[c.source,c[source]],[c.language,context.language==='ms'?'Bahasa Melayu':'English'],[c.hint,context.hintUsed?c.yes:c.no],[c.more,context.moreHintViewed?c.yes:c.no],[c.steps,context.stepsViewed?c.yes:c.no]];
   node('context').replaceChildren();for(const [name,value]of rows){const group=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=name;dd.textContent=value;group.append(dt,dd);node('context').append(group);}
   node('categories').replaceChildren();for(const category of Feedback.QUESTION_FEEDBACK_CATEGORIES){const label=document.createElement('label'),input=document.createElement('input'),text=document.createElement('span');input.type='checkbox';input.name='report-category';input.value=category.id;input.checked=!!previous?.categories.includes(category.id);text.textContent=context.language==='ms'?categoryMalay[category.id]:category.label;label.append(input,text);node('categories').append(label);}
   node('comment').value=previous?.comment||'';node('comment').placeholder=c.placeholder;node('count').textContent=node('comment').value.length+' / 2,000';node('status').textContent=store.error?c.temporary:'';delivery();
   dialog.showModal();node('title').focus({preventScroll:true});dialog.scrollTop=0;return copy(active.context);
  }
  function save(){
   if(!active)return null;const c=labels[active.context.language],categories=[...node('categories').querySelectorAll('input:checked')].map(el=>el.value),comment=node('comment').value.trim();
   if(!categories.length&&!comment){node('status').textContent=c.invalid;node('comment').focus();return null;}
   store.flush();const before=store.get(active.question.id);
   const unchanged=before&&before.comment===comment&&JSON.stringify(before.categories)===JSON.stringify(categories)&&JSON.stringify(before.context)===JSON.stringify(active.context);
   const saved=unchanged?before:store.save(active.question,categories,comment,active.context);
   publish(saved);
   node('status').textContent=store.error?c.temporary:queueError?Feedback.questionFeedbackDeliveryText({queueError:true},active.context.language):c.saved;delivery();return saved;
  }
  function close(){if(dialog?.open)dialog.close();active=null;const focus=returnFocus;returnFocus=null;if(focus?.isConnected)focus.focus({preventScroll:true});}
  function destroy(){close();dialog?.remove();dialog=null;}
  return {open,save,close,destroy,refresh:delivery,exportData:()=>store.exportData(),snapshot:()=>active?copy(active.context):null};
 }
 return {contextFrom,create};
});
