/** Question comments are independent of learning evidence and rewarded game saves. */
export const QUESTION_FEEDBACK_KEY='slay-the-math.question-feedback.v1';
export const QUESTION_FEEDBACK_CATEGORIES=Object.freeze([
 {id:'hint-unclear',label:'Hint is unclear'},
 {id:'more-hint-unclear',label:'More Hint is unclear'},
 {id:'question-difficult',label:'Question is too difficult'},
 {id:'question-confusing',label:'Question is confusing'},
 {id:'steps-unclear',label:'Worked steps need a clearer order'},
 {id:'diagram-unclear',label:'Diagram or table is unclear'},
 {id:'other',label:'Something else'}
]);
const feedbackCategoryIds=new Set(QUESTION_FEEDBACK_CATEGORIES.map(c=>c.id));
const gameplayFeedbackSources=new Set(['predict','artifact','mystery']);
const validProvenance=value=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===2&&['gameVersion','contentRevision'].every(key=>typeof value[key]==='string'&&/^[A-Za-z0-9][A-Za-z0-9._+-]{0,99}$/.test(value[key]));
/** Shared delivery copy for the isolated folio and the in-game report. */
export function questionFeedbackDeliveryText(status={},language='en'){
 const text=(en,ms)=>language==='ms'?ms:en;
 if(status.dev)return text('Your comments stay in this temporary developer session. Collection is disabled.','Komen anda kekal dalam sesi pembangun sementara ini. Pengumpulan dinyahaktifkan.');
 if(status.collectionDisabled)return text('Your comments stay on this device. Collection is unavailable in this preview.','Komen anda kekal pada peranti ini. Pengumpulan tidak tersedia dalam pratonton ini.');
 if(status.queueError)return text('Your report is saved here but could not be queued. Try saving again, or open Learning Report → Sharing for a backup.','Laporan disimpan di sini tetapi belum dapat dimasukkan ke giliran. Cuba simpan semula, atau buka Laporan Pembelajaran → Perkongsian untuk sandaran.');
 if(status.state==='save-error')return text('Your comments are kept here. Open Sharing settings to retry or download a backup.','Komen anda dikekalkan di sini. Buka Tetapan perkongsian untuk mencuba lagi atau memuat turun sandaran.');
 if(!status.enabled)return text('Your comments are saved on this device. Sharing is off. Open Sharing settings to choose whether to send them.','Komen anda disimpan pada peranti ini. Perkongsian dijeda. Buka Tetapan perkongsian untuk memilih sama ada mahu menghantarnya.');
 if(status.state==='received'&&status.pending===0&&status.lastReceivedAt)return text('The collector acknowledged the latest queued records and comments. Your comments are also kept on this device.','Pelayan telah mengesahkan penerimaan rekod dan komen terkini dalam giliran. Komen anda juga disimpan pada peranti ini.');
 if(status.state==='sending')return text('Sending queued records and comments. They stay on this device while we wait for acknowledgement.','Rekod dan komen sedang dihantar. Semuanya kekal pada peranti ini sementara menunggu pengesahan penerimaan.');
 if(status.state==='offline')return text('Your comments are saved on this device. Waiting for a connection. Keep the game open or reopen it to retry.','Komen anda disimpan pada peranti ini. Menunggu sambungan. Biarkan permainan terbuka atau buka semula untuk mencuba lagi.');
 if(status.state==='unavailable')return text('The collector is unavailable. Your comments stay here. We will retry while the game is active; open Sharing settings to retry now.','Pelayan tidak tersedia. Komen anda kekal di sini. Kami akan mencuba semula semasa permainan aktif; buka Tetapan perkongsian untuk mencuba sekarang.');
 if(status.error)return text('Your comments stay here. Open Sharing settings to retry or download a backup.','Komen anda kekal di sini. Buka Tetapan perkongsian untuk mencuba lagi atau memuat turun sandaran.');
 return text('Your comments are saved on this device. Sharing is enabled; queued records are waiting for the collector.','Komen anda disimpan pada peranti ini. Perkongsian aktif; rekod dalam giliran menunggu pelayan.');
}
/** Opening then hiding worked steps still counts as having opened that help. */
export function questionFeedbackSupport(record){
 return {hintUsed:record?.hintState?.hintUsed===true,moreHintViewed:record?.hintState?.moreHintViewed===true,stepsViewed:record?.stepsViewed===true||(record?.events||[]).some(event=>event.type==='STEPS_TOGGLED')};
}
const feedbackReadError='Saved comments could not be read and have been kept. Download new comments before leaving this page.';
const feedbackWriteError='Comments could not be saved on this device. Download your comments before leaving this page.';
function feedbackIdentity(version,id){return version+':'+id;}
function feedbackParse(raw){
 if(!raw)return new Map();
 const data=JSON.parse(raw);
 if(data?.schemaVersion!==1||!Array.isArray(data.comments)||data.comments.length>5000)throw Error('Invalid feedback record');
 const records=new Map();
 for(const entry of data.comments){
  if(!entry||typeof entry.bankVersion!=='string'||entry.bankVersion.length>100||!/^\w[\w.-]*$/.test(entry.bankVersion)||
   !/^(PROB|SET|LOGIC)-\d{3}$/.test(entry.questionId)||typeof entry.comment!=='string'||entry.comment.length>2000||
   !Array.isArray(entry.categories)||entry.categories.some(id=>!feedbackCategoryIds.has(id))||
   typeof entry.question!=='string'||entry.question.length>8000||typeof entry.topic!=='string'||entry.topic.length>200||
   (entry.reviewed!==undefined&&typeof entry.reviewed!=='boolean')||(entry.provenance!==undefined&&!validProvenance(entry.provenance))||!['Easy','Medium','Hard'].includes(entry.difficulty)||!entry.context||!['learn','review','gameplay'].includes(entry.context.mode)||
   (entry.context.mode==='gameplay'?!gameplayFeedbackSources.has(entry.context.source):entry.context.source!==undefined)||
   !['pending','correct','revealed'].includes(entry.context.status)||
   (entry.context.mode==='gameplay'&&!['correct','revealed'].includes(entry.context.status))||
   ['hintUsed','moreHintViewed','stepsViewed'].some(key=>typeof entry.context[key]!=='boolean')||
   typeof entry.createdAt!=='string'||!Number.isFinite(Date.parse(entry.createdAt))||
   typeof entry.updatedAt!=='string'||!Number.isFinite(Date.parse(entry.updatedAt)))throw Error('Invalid feedback comment');
  const id=feedbackIdentity(entry.bankVersion,entry.questionId);
  records.set(id,{...entry,id,reviewed:entry.reviewed===true,categories:[...new Set(entry.categories)]});
 }
 return records;
}
export function createQuestionFeedbackStore({storage,bankVersion,questionIds,provenance,now=()=>new Date().toISOString()}){
 if(provenance!==undefined&&!validProvenance(provenance))throw Error('Invalid feedback provenance');
 const currentProvenance=provenance?{...provenance}:undefined;
 const known=new Set(questionIds),dirty=new Map();let records=new Map(),error='';
 try{if(!storage)throw Error('Storage unavailable');records=feedbackParse(storage.getItem(QUESTION_FEEDBACK_KEY));}
 catch(e){error=e instanceof SyntaxError||e.message.startsWith('Invalid feedback')?feedbackReadError:feedbackWriteError;}
 function cloneEntry(e){return {...e,categories:e.categories.slice(),context:{...e.context},...(e.provenance?{provenance:{...e.provenance}}:{})};}
 function list(){return [...records.values()].sort((a,b)=>a.questionId.localeCompare(b.questionId)||a.bankVersion.localeCompare(b.bankVersion)).map(cloneEntry);}
 function flush(){
  try{
   if(!storage)throw Error('Storage unavailable');
   let latest;
   try{latest=feedbackParse(storage.getItem(QUESTION_FEEDBACK_KEY));}
   catch(e){error=feedbackReadError;return false;}
   for(const [id,value] of dirty){if(value)latest.set(id,value);else latest.delete(id);}
   storage.setItem(QUESTION_FEEDBACK_KEY,JSON.stringify({schemaVersion:1,comments:[...latest.values()]}));
   records=latest;dirty.clear();error='';return true;
  }catch{error=feedbackWriteError;return false;}
 }
 function get(questionId){const value=records.get(feedbackIdentity(bankVersion,questionId));return value?cloneEntry(value):null;}
 function save(question,categories,comment,context={},options={}){
  if(!known.has(question.id))throw Error('Unknown question');
  if(typeof comment!=='string'||comment.length>2000)throw Error('Keep your comment within 2,000 characters.');
  if(!Array.isArray(categories)||categories.some(id=>!feedbackCategoryIds.has(id)))throw Error('Choose a listed feedback category.');
  if(options.reviewed!==undefined&&typeof options.reviewed!=='boolean')throw Error('Choose a valid review state.');
  if(context.mode==='gameplay'&&(!gameplayFeedbackSources.has(context.source)||!['correct','revealed'].includes(context.status)))throw Error('Report a finished game question.');
  const id=feedbackIdentity(bankVersion,question.id),previous=records.get(id),text=comment.trim(),chosen=[...new Set(categories)],reviewed=options.reviewed??previous?.reviewed??false;
  if(!text&&!chosen.length&&!reviewed){records.delete(id);dirty.set(id,null);flush();return null;}
  const version=options.preserveProvenance?previous?.provenance:currentProvenance;
  const timestamp=now(),entry={id,questionId:question.id,bankVersion,...(version?{provenance:{...version}}:{}),topic:question.topic||question.topicCode,difficulty:question.difficulty,
   question:question.prompt||question.themedRichText?.prompt?.map(s=>s.text||'').join('')||'',
   categories:chosen,comment:text,reviewed,createdAt:previous?.createdAt||timestamp,updatedAt:timestamp,
   context:{mode:context.mode==='gameplay'?'gameplay':context.mode==='learn'?'learn':'review',...(context.mode==='gameplay'?{source:context.source}:{}),language:context.language==='ms'?'ms':'en',status:['correct','revealed'].includes(context.status)?context.status:'pending',
    hintUsed:!!context.hintUsed,moreHintViewed:!!context.moreHintViewed,stepsViewed:!!context.stepsViewed}};
  records.set(id,entry);dirty.set(id,entry);flush();return get(question.id);
 }
 function setReviewed(question,value,context){
  if(typeof value!=='boolean')throw Error('Choose a valid review state.');
  flush();const previous=get(question.id);
  const original=previous?{...question,prompt:previous.question,topic:previous.topic,difficulty:previous.difficulty}:question;
  return save(original,previous?.categories||[],previous?.comment||'',previous?.context??context??{},{reviewed:value,preserveProvenance:!!previous});
 }
 function exportData(){
  const persisted=flush();let comments=list();
  if(!persisted)try{
   const latest=feedbackParse(storage.getItem(QUESTION_FEEDBACK_KEY));
   for(const [id,value]of dirty){if(value)latest.set(id,value);else latest.delete(id);}
   comments=[...latest.values()].sort((a,b)=>a.questionId.localeCompare(b.questionId)||a.bankVersion.localeCompare(b.bankVersion)).map(cloneEntry);
  }catch{}
  return {schemaVersion:1,game:'Slay the Math',purpose:'Question improvements',exportedAt:now(),comments};
 }
 return {get,list,save,setReviewed,flush,exportData,get error(){return error;}};
}
export function questionFeedbackCSV(report){
 const labels=new Map(QUESTION_FEEDBACK_CATEGORIES.map(c=>[c.id,c.label]));
 const cell=value=>{let text=String(value??'');if(/^[\s\uFEFF]*[=+@-]|^[\t\r]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"';};
 const rows=[['Question ID','Bank version','Topic','Difficulty','Question','What needs improvement','Comment','Created at','Updated at','Practice mode','Question language','Question state','Hint opened','More Hint opened','Steps opened']];
 for(const c of report.comments)rows.push([c.questionId,c.bankVersion,c.topic,c.difficulty,c.question,c.categories.map(id=>labels.get(id)||id).join('; '),c.comment,c.createdAt,c.updatedAt,c.context.mode,c.context.language||'en',c.context.status,c.context.hintUsed,c.context.moreHintViewed,c.context.stepsViewed]);
 return '\uFEFF'+rows.map(row=>row.map(cell).join(',')).join('\r\n')+'\r\n';
}
