/** Accessible comments; sharing and JSON recovery use the common Learning Report. */
export function attachQuestionFeedback({bank,root,getQuestion,getRecord,getMode,onChange=()=>{},onUpdate=()=>{},getDelivery=()=>null,onOpenSharing=()=>{}}){
 const node=id=>document.getElementById(id),feedbackOrigin=window.origin||location.origin,queueErrors=new Set();let disk=null;
 try{disk=globalThis.localStorage;}catch{}
 const gameVersion=globalThis.DCRelease?.version,store=createQuestionFeedbackStore({storage:disk,bankVersion:bank.bankVersion,questionIds:bank.questions.map(q=>q.id),...(gameVersion&&bank.contentRevision?{provenance:{gameVersion,contentRevision:bank.contentRevision}}:{})});
 let renderedId=null,exitReturnFocus=null,closingForGame=false;
 const form=node('question-feedback-form'),text=node('feedback-comment'),dialog=node('feedback-exit-dialog');
 for(const category of QUESTION_FEEDBACK_CATEGORIES){
  const label=document.createElement('label'),input=document.createElement('input'),span=document.createElement('span');
  input.type='checkbox';input.name='feedback-category';input.value=category.id;span.textContent=category.label;
  label.className='feedback-category';label.append(input,span);node('feedback-categories').append(label);
 }
 function announce(message){message=globalThis.DCQuestionLanguage?.t(message,globalThis.DCQuestionLanguage.language())||message;if(node('feedback-status').textContent!==message)node('feedback-status').textContent=message;}
 function deliveryCopy(english,malay){return globalThis.DCQuestionLanguage?.language()==='ms'?malay:english;}
 function deliveryText(){
  if(store.error)return store.error;
  return questionFeedbackDeliveryText({...getDelivery(),queueError:queueErrors.size>0},globalThis.DCQuestionLanguage?.language()||'en');
 }
 function publish(entry){const result=onChange(entry);if(result==null||result.error||result.entry===null)queueErrors.add(entry.id);else queueErrors.delete(entry.id);return result;}
 function controls(){
  const entries=store.list().filter(e=>e.bankVersion===bank.bankVersion),count=entries.filter(e=>e.comment||e.categories.length).length,reviewed=entries.filter(e=>e.reviewed).length;
  node('feedback-count').textContent=deliveryCopy(count+' '+(count===1?'question has':'questions have')+' feedback · '+reviewed+' / '+bank.questions.length+' reviewed',count+' soalan mempunyai maklum balas · '+reviewed+' / '+bank.questions.length+' disemak');
  node('feedback-storage-warning').hidden=!store.error;node('feedback-storage-warning').textContent=store.error;
  node('feedback-character-count').textContent=text.value.length+' / 2,000';
  if(node('feedback-delivery-note'))node('feedback-delivery-note').textContent=deliveryText();
  if(dialog.open)renderExit();
  const language=globalThis.DCQuestionLanguage?.language()||'en';
  globalThis.DCQuestionLanguage?.applyInterface(node('question-feedback'),language);
  if(dialog.open)globalThis.DCQuestionLanguage?.applyInterface(dialog,language);
 }
 function render(){
  const question=getQuestion();
  if(renderedId!==question.id){
   const comment=store.get(question.id);renderedId=question.id;
   text.value=comment?.comment||'';
   node('feedback-reviewed').checked=!!comment?.reviewed;
   for(const input of node('feedback-categories').querySelectorAll('input'))input.checked=!!comment?.categories.includes(input.value);
   node('feedback-question-id').textContent=question.id;
   announce(comment?(store.error?deliveryCopy('Comment kept for this open page. Open Sharing settings to download a backup.','Komen dikekalkan pada halaman terbuka ini. Buka Tetapan perkongsian untuk memuat turun sandaran.'):comment.comment||comment.categories.length?'Your comment is saved on this device. You can edit it here.':deliveryCopy('Review mark saved on this device.','Tanda semakan disimpan pada peranti ini.')):'');
  }
  controls();
 }
 function save({explicit=false}={}){
  const categories=[...node('feedback-categories').querySelectorAll('input:checked')].map(input=>input.value),record=getRecord();
  if(explicit&&!categories.length&&!text.value.trim()&&!node('feedback-reviewed').checked){announce('Choose what needs improvement or write a comment.');text.focus();return false;}
  try{
   store.flush();
   const question=getQuestion(),previous=store.get(question.id),context={mode:getMode(),language:globalThis.DCQuestionLanguage?.language()||'en',status:record?.status||'pending',...questionFeedbackSupport(record)};
   const reviewed=node('feedback-reviewed').checked,unchanged=previous&&previous.reviewed===reviewed&&previous.comment===text.value.trim()&&JSON.stringify(previous.categories)===JSON.stringify(categories)&&(!explicit||JSON.stringify(previous.context)===JSON.stringify(context));
   if(!unchanged){
    const saved=store.save(question,categories,text.value,context,{reviewed});
    if(saved)publish(saved);
    else if(previous)publish({id:previous.id,questionId:question.id,bankVersion:bank.bankVersion,deleted:true,updatedAt:new Date().toISOString()});
   }
   else if(explicit&&previous&&queueErrors.has(previous.id))publish(previous);
   announce(store.error?deliveryCopy('Comment kept for this open page. Open Sharing settings to download a backup.','Komen dikekalkan pada halaman terbuka ini. Buka Tetapan perkongsian untuk memuat turun sandaran.'):reviewed||categories.length||text.value.trim()?deliveryCopy('Saved on this device. Open Sharing settings to choose whether to send it.','Disimpan pada peranti ini. Buka Tetapan perkongsian untuk memilih sama ada mahu menghantarnya.'):'This question has no comment.');
   controls();onUpdate();return true;
  }catch(e){announce(e.message);return false;}
 }
 form.addEventListener('submit',event=>{event.preventDefault();save({explicit:true});});
 text.addEventListener('input',()=>save());
 node('feedback-reviewed').addEventListener('change',()=>setReviewed(getQuestion().id,node('feedback-reviewed').checked));
 node('feedback-categories').addEventListener('change',()=>save());
 for(const button of root.querySelectorAll('[data-feedback-sharing]')){
  button.addEventListener('click',()=>{if(dialog.open)cancelExit();onOpenSharing();});
 }
 function renderExit(){
  const entries=store.list().filter(e=>e.bankVersion===bank.bankVersion),count=entries.filter(e=>e.comment||e.categories.length).length,reviewed=entries.filter(e=>e.reviewed).length;
  const summary=deliveryCopy(reviewed+' / '+bank.questions.length+' reviewed. '+count+' '+(count===1?'question has':'questions have')+' feedback.',reviewed+' / '+bank.questions.length+' disemak. '+count+' soalan mempunyai maklum balas.');
  node('feedback-exit-summary').textContent=summary+' '+(store.error?deliveryCopy('Kept for this open page. Open Sharing settings to download a backup before leaving.','Dikekalkan pada halaman terbuka ini. Buka Tetapan perkongsian untuk memuat turun sandaran sebelum keluar.'):deliveryCopy('Saved on this device. Shared feedback helps improve the questions, hints and worked steps.','Disimpan pada peranti ini. Maklum balas yang dikongsi membantu menambah baik soalan, petunjuk dan langkah penyelesaian.'));
  node('feedback-exit-delivery').textContent=deliveryText();
  node('feedback-exit-confirm').textContent=closingForGame?'Return to Main Menu':'Finish for now';
  globalThis.DCQuestionLanguage?.applyInterface(dialog,globalThis.DCQuestionLanguage.language());
 }
 function requestExit(forGame=window.parent!==window){
  store.flush();closingForGame=forGame;exitReturnFocus=document.activeElement;controls();renderExit();node('feedback-exit-status').textContent='';
  if(!dialog.open)dialog.showModal();node('feedback-exit-cancel').focus();
 }
 function cancelExit(){dialog.close();exitReturnFocus?.focus();}
 node('feedback-finish').addEventListener('click',()=>requestExit());
 node('feedback-exit-cancel').addEventListener('click',cancelExit);
 dialog.addEventListener('cancel',event=>{event.preventDefault();cancelExit();});
 node('feedback-exit-confirm').addEventListener('click',()=>{
  store.flush();dialog.close();
  if(closingForGame)window.parent.postMessage({type:'stm-education-practice-close'},feedbackOrigin==='null'?'*':feedbackOrigin);
  else{announce(store.error?deliveryCopy('Comment kept for this open page. Open Sharing settings to download a backup.','Komen dikekalkan pada halaman terbuka ini. Buka Tetapan perkongsian untuk memuat turun sandaran.'):deliveryCopy('Thank you for testing. Your comments are saved on this device.','Terima kasih kerana mencuba. Komen anda disimpan pada peranti ini.'));node('feedback-finish').focus();}
 });
 window.addEventListener('message',event=>{
  if(window.parent!==window&&event.source===window.parent&&event.origin===feedbackOrigin&&event.data?.type==='stm-education-practice-request-close')requestExit(true);
 });
 window.addEventListener('pagehide',()=>store.flush());
 // A reopened folio resumes delivery of saved comments without needing an edit.
 for(const comment of store.list())publish(comment);
 function setReviewed(id,value){
  const current=id===getQuestion().id,question=current?getQuestion():bank.questions.find(q=>q.id===id);if(!question)return;
  store.flush();const previous=store.get(id),record=current?getRecord():null;
  const context=current?{mode:getMode(),language:globalThis.DCQuestionLanguage?.language()||'en',status:record?.status||'pending',...questionFeedbackSupport(record)}:undefined;
  const saved=store.setReviewed(question,value,context);
  if(saved)publish(saved);else if(previous)publish({id:previous.id,questionId:id,bankVersion:bank.bankVersion,deleted:true,updatedAt:new Date().toISOString()});
  if(current){renderedId=null;render();}else controls();onUpdate();
 }
 return {render,requestExit,setReviewed,get:id=>store.get(id),list:()=>store.list(),refreshDelivery:controls,exportData:()=>store.exportData(),get error(){return store.error;}};
}
