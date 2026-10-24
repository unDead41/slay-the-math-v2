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
   (entry.reviewed!==undefined&&typeof entry.reviewed!=='boolean')||!['Easy','Medium','Hard'].includes(entry.difficulty)||!entry.context||!['learn','review'].includes(entry.context.mode)||
   !['pending','correct','revealed'].includes(entry.context.status)||
   typeof entry.createdAt!=='string'||!Number.isFinite(Date.parse(entry.createdAt))||
   typeof entry.updatedAt!=='string'||!Number.isFinite(Date.parse(entry.updatedAt)))throw Error('Invalid feedback comment');
  const id=feedbackIdentity(entry.bankVersion,entry.questionId);
  records.set(id,{...entry,id,reviewed:entry.reviewed===true,categories:[...new Set(entry.categories)]});
 }
 return records;
}
export function createQuestionFeedbackStore({storage,bankVersion,questionIds,now=()=>new Date().toISOString()}){
 const known=new Set(questionIds),dirty=new Map();let records=new Map(),error='';
 try{if(!storage)throw Error('Storage unavailable');records=feedbackParse(storage.getItem(QUESTION_FEEDBACK_KEY));}
 catch(e){error=e instanceof SyntaxError||e.message.startsWith('Invalid feedback')?feedbackReadError:feedbackWriteError;}
 function list(){return [...records.values()].sort((a,b)=>a.questionId.localeCompare(b.questionId)||a.bankVersion.localeCompare(b.bankVersion)).map(e=>({...e,categories:e.categories.slice(),context:{...e.context}}));}
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
 function get(questionId){const value=records.get(feedbackIdentity(bankVersion,questionId));return value?{...value,categories:value.categories.slice(),context:{...value.context}}:null;}
 function save(question,categories,comment,context={},options={}){
  if(!known.has(question.id))throw Error('Unknown question');
  if(typeof comment!=='string'||comment.length>2000)throw Error('Keep your comment within 2,000 characters.');
  if(!Array.isArray(categories)||categories.some(id=>!feedbackCategoryIds.has(id)))throw Error('Choose a listed feedback category.');
  if(options.reviewed!==undefined&&typeof options.reviewed!=='boolean')throw Error('Choose a valid review state.');
  const id=feedbackIdentity(bankVersion,question.id),previous=records.get(id),text=comment.trim(),chosen=[...new Set(categories)],reviewed=options.reviewed??previous?.reviewed??false;
  if(!text&&!chosen.length&&!reviewed){records.delete(id);dirty.set(id,null);flush();return null;}
  const timestamp=now(),entry={id,questionId:question.id,bankVersion,topic:question.topic||question.topicCode,difficulty:question.difficulty,
   question:question.prompt||question.themedRichText?.prompt?.map(s=>s.text||'').join('')||'',
   categories:chosen,comment:text,reviewed,createdAt:previous?.createdAt||timestamp,updatedAt:timestamp,
   context:{mode:context.mode==='learn'?'learn':'review',language:context.language==='ms'?'ms':'en',status:['correct','revealed'].includes(context.status)?context.status:'pending',
    hintUsed:!!context.hintUsed,moreHintViewed:!!context.moreHintViewed,stepsViewed:!!context.stepsViewed}};
  records.set(id,entry);dirty.set(id,entry);flush();return get(question.id);
 }
 function setReviewed(question,value,context){
  if(typeof value!=='boolean')throw Error('Choose a valid review state.');
  flush();const previous=get(question.id);return save(question,previous?.categories||[],previous?.comment||'',context??previous?.context??{},{reviewed:value});
 }
 function exportData(){flush();return {schemaVersion:1,game:'Slay the Math',purpose:'Question improvements',exportedAt:now(),comments:list()};}
 return {get,list,save,setReviewed,flush,exportData,get error(){return error;}};
}
export function questionFeedbackCSV(report){
 const labels=new Map(QUESTION_FEEDBACK_CATEGORIES.map(c=>[c.id,c.label]));
 const cell=value=>{let text=String(value??'');if(/^[\s\uFEFF]*[=+@-]|^[\t\r]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"';};
 const rows=[['Question ID','Bank version','Topic','Difficulty','Question','What needs improvement','Comment','Created at','Updated at','Practice mode','Question language','Question state','Hint opened','More Hint opened','Steps opened']];
 for(const c of report.comments)rows.push([c.questionId,c.bankVersion,c.topic,c.difficulty,c.question,c.categories.map(id=>labels.get(id)||id).join('; '),c.comment,c.createdAt,c.updatedAt,c.context.mode,c.context.language||'en',c.context.status,c.context.hintUsed,c.context.moreHintViewed,c.context.stepsViewed]);
 return '\uFEFF'+rows.map(row=>row.map(cell).join(',')).join('\r\n')+'\r\n';
}
