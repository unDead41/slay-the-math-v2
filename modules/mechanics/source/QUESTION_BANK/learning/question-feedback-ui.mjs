/** Accessible comments and explicit file sharing; collection is a separate opt-in owner. */
export function attachQuestionFeedback({bank,root,getQuestion,getRecord,getMode,onChange=()=>{},getDelivery=()=>null}){
 const node=id=>document.getElementById(id),feedbackOrigin=window.origin||location.origin;let disk=null;
 try{disk=globalThis.localStorage;}catch{}
 const store=createQuestionFeedbackStore({storage:disk,bankVersion:bank.bankVersion,questionIds:bank.questions.map(q=>q.id)});
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
  const status=getDelivery();
  if(status?.dev)return deliveryCopy('Your comments stay in this temporary developer session. Collection is disabled.','Komen anda kekal dalam sesi pembangun sementara ini. Pengumpulan dinyahaktifkan.');
  if(!status?.enabled)return status?.lastReceivedAt?deliveryCopy('Sharing is off. Your current comments are saved on this device. The collector previously acknowledged shared records.','Perkongsian dijeda. Komen semasa anda disimpan pada peranti ini. Pelayan pernah mengesahkan penerimaan rekod yang dikongsi.'):'Your comments are saved on this device. Download or share them with Ijamm so they can be collected for future improvements. They have not been sent automatically.';
  if(status.error)return status.error+' '+deliveryCopy('Download your comments before leaving.','Muat turun komen anda sebelum keluar.');
  if(status.state==='received'&&status.pending===0&&status.lastReceivedAt)return deliveryCopy('The collector acknowledged the latest queued learning records and comments. Your comments are also kept on this device.','Pelayan telah mengesahkan penerimaan rekod pembelajaran dan komen terkini dalam giliran. Komen anda juga disimpan pada peranti ini.');
  if(status.state==='sending')return deliveryCopy('Sending queued records and comments. They remain on this device while we wait for the collector to acknowledge them.','Rekod dan komen sedang dihantar. Semuanya kekal pada peranti ini sementara menunggu pengesahan penerimaan pelayan.');
  if(status.state==='offline')return deliveryCopy('Your comments are saved on this device. Sharing is enabled; queued records and comments are waiting for a connection. Keep the game open or reopen it to retry.','Komen anda disimpan pada peranti ini. Perkongsian aktif; rekod dan komen menunggu sambungan. Biarkan permainan terbuka atau buka semula untuk mencuba lagi.');
  if(status.state==='unavailable')return deliveryCopy('Your comments are saved on this device. The collector is unavailable; queued records and comments have not been acknowledged. Keep the game open or reopen it to retry.','Komen anda disimpan pada peranti ini. Pelayan tidak tersedia; penerimaan rekod dan komen belum disahkan. Biarkan permainan terbuka atau buka semula untuk mencuba lagi.');
  return deliveryCopy('Your comments are saved on this device. Sharing is enabled; queued records and comments are waiting for the collector. Keep the game open or reopen it to retry.','Komen anda disimpan pada peranti ini. Perkongsian aktif; rekod dan komen menunggu pelayan. Biarkan permainan terbuka atau buka semula untuk mencuba lagi.');
 }
 function controls(){
  const count=store.list().length;
  node('feedback-count').textContent=count+' '+(count===1?'question has':'questions have')+' a comment';
  node('feedback-storage-warning').hidden=!store.error;node('feedback-storage-warning').textContent=store.error;
  for(const button of root.querySelectorAll('[data-feedback-export],[data-feedback-share]'))button.disabled=count===0;
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
   for(const input of node('feedback-categories').querySelectorAll('input'))input.checked=!!comment?.categories.includes(input.value);
   node('feedback-question-id').textContent=question.id;
   announce(comment?'Your comment is saved on this device. You can edit it here.':'');
  }
  controls();
 }
 function save({explicit=false}={}){
  const categories=[...node('feedback-categories').querySelectorAll('input:checked')].map(input=>input.value),record=getRecord();
  if(explicit&&!categories.length&&!text.value.trim()){announce('Choose what needs improvement or write a comment.');text.focus();return false;}
  try{
   store.flush();
   const question=getQuestion(),previous=store.get(question.id),context={mode:getMode(),language:globalThis.DCQuestionLanguage?.language()||'en',status:record?.status||'pending',hintUsed:!!record?.hintState.hintUsed,moreHintViewed:!!record?.hintState.moreHintViewed,stepsViewed:!!record?.stepsViewed};
   const unchanged=previous&&previous.comment===text.value.trim()&&JSON.stringify(previous.categories)===JSON.stringify(categories)&&JSON.stringify(previous.context)===JSON.stringify(context);
   if(!unchanged){
    const saved=store.save(question,categories,text.value,context);
    if(saved)onChange(saved);
    else if(previous)onChange({id:previous.id,questionId:question.id,bankVersion:bank.bankVersion,deleted:true,updatedAt:new Date().toISOString()});
   }
   announce(store.error?'Comment kept for this open page. Download it before leaving.':categories.length||text.value.trim()?'Saved on this device. Share or download your comments to send them for review.':'This question has no comment.');
   controls();return true;
  }catch(e){announce(e.message);return false;}
 }
 form.addEventListener('submit',event=>{event.preventDefault();save({explicit:true});});
 text.addEventListener('input',()=>save());
 node('feedback-categories').addEventListener('change',()=>save());
 function exportFile(format){
  const report=store.exportData();controls();if(!report.comments.length)return null;
  const json=format==='json',content=json?JSON.stringify(report,null,2)+'\n':questionFeedbackCSV(report);
  return new File([content],'slay-the-math-comments-'+report.exportedAt.slice(0,10)+'.'+(json?'json':'csv'),{type:json?'application/json':'text/csv;charset=utf-8'});
 }
 function download(format='csv'){
  try{
   const file=exportFile(format);if(!file)return;
   const url=URL.createObjectURL(file),anchor=document.createElement('a');anchor.href=url;anchor.download=file.name;document.body.append(anchor);anchor.click();anchor.remove();
   setTimeout(()=>URL.revokeObjectURL(url),30000);
   announce('Download prepared. Send the comments file to Ijamm for future improvements.');
   if(dialog.open)node('feedback-exit-status').textContent='Download prepared. Send the file to Ijamm when you are ready.';
  }catch{announce('The download could not start. Keep this page open and try Share comments.');if(dialog.open)node('feedback-exit-status').textContent='The download could not start. Keep this page open and try Share comments.';}
 }
 async function share(button){
  const file=exportFile('csv');if(!file)return;
  if(!navigator.share||!navigator.canShare?.({files:[file]})){
   download('csv');const message='File sharing is unavailable here. Send the downloaded CSV to Ijamm using your preferred app.';announce(message);if(dialog.open)node('feedback-exit-status').textContent=message;return;
  }
  button.disabled=true;
  try{await navigator.share({title:'Slay the Math — question comments',text:'Feedback for future question improvements.',files:[file]});announce('Sharing finished. Your comments are also kept on this device.');if(dialog.open)node('feedback-exit-status').textContent='Sharing finished. Your comments are also kept on this device.';}
  catch(e){const message=e.name==='AbortError'?'Sharing cancelled. Your comments are still here.':'Sharing could not finish. Download the comments file and send it to Ijamm.';announce(message);if(dialog.open)node('feedback-exit-status').textContent=message;}
  finally{controls();}
 }
 for(const button of root.querySelectorAll('[data-feedback-export]'))button.addEventListener('click',()=>download(button.dataset.feedbackExport));
 for(const button of root.querySelectorAll('[data-feedback-share]'))button.addEventListener('click',()=>share(button));
 function renderExit(){
  const count=store.list().length;
  node('feedback-exit-summary').textContent=count?count+' '+(count===1?'question has':'questions have')+' a comment ready to share. These comments will help improve the questions, hints, diagrams and worked steps.':'Your feedback helps improve the questions, hints, diagrams and worked steps. You can return to any question to leave a comment.';
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
  else{announce('Thank you for testing. Share your comments with Ijamm when you are ready.');node('feedback-finish').focus();}
 });
 window.addEventListener('message',event=>{
  if(window.parent!==window&&event.source===window.parent&&event.origin===feedbackOrigin&&event.data?.type==='stm-education-practice-request-close')requestExit(true);
 });
 window.addEventListener('pagehide',()=>store.flush());
 // A reopened folio resumes delivery of saved comments without needing an edit.
 for(const comment of store.list())onChange(comment);
 return {render,requestExit,refreshDelivery:controls,exportData:()=>store.exportData()};
}
