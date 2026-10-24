/* Owner setting: add the exact HTTPS origin of a hosted game here, with no path.
   Local npm start uses port 4173. Deploy a new web-app version after editing. */
const STM_ALLOWED_GAME_ORIGINS=['http://localhost:4173','http://127.0.0.1:4173'];
const STM_MAX_RECORDS=10000,STM_MAX_CLIENTS=1500;
const STM_HEADERS={
 _Clients:['Client ID','Secret SHA256','Created at'],
 _Records:['Key','Client ID','Entry ID','Revision','Kind','Payload SHA256','Received at','Payload 1','Payload 2','Payload 3','Payload 4','Payload 5'],
 Learning:['Key','Client ID','Entry ID','Revision','Question ID','Bank version','Topic','Chapter','Learning standards','Skills','Scope','Session ID','Language','Status','Answered','Wrong attempts','Independent first try','Help on first attempt','Retry success','Revealed','Hint used','More Hint viewed','Basics viewed','Steps viewed','Updated at','Received at'],
 Comments:['Key','Client ID','Entry ID','Revision','Question ID','Bank version','Topic','Difficulty','Categories','Comment','Deleted','Mode','Language','Question','Updated at','Received at']
};
const stmExact_=(value,keys)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===keys.length&&keys.every(k=>Object.prototype.hasOwnProperty.call(value,k));
const stmDate_=value=>typeof value==='string'&&value.length===24&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString()===value;
const stmText_=(value,max)=>typeof value==='string'&&value.length>0&&value.length<=max&&!/[\x00-\x1f\x7f]/.test(value);
const stmId_=value=>typeof value==='string'&&/^[A-Za-z0-9][A-Za-z0-9._:|/-]{0,299}$/.test(value);
function stmStable_(value){if(Array.isArray(value))return '['+value.map(stmStable_).join(',')+']';if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stmStable_(value[k])).join(',')+'}';return JSON.stringify(value);}
function stmBytes_(value){let n=0;for(const c of value){const cp=c.codePointAt(0);n+=cp<128?1:cp<2048?2:cp<65536?3:4;}return n;}
function stmSafeCell_(value){return typeof value==='string'&&/^[\s\uFEFF]*[=+@-]|^[\t\r]/.test(value)?"'"+value:value;}
function stmWrite_(sheet,row,values){
 if(sheet.getMaxRows()<row)sheet.insertRowsAfter(sheet.getMaxRows(),row-sheet.getMaxRows());
 if(sheet.getMaxColumns()<values.length)sheet.insertColumnsAfter(sheet.getMaxColumns(),values.length-sheet.getMaxColumns());
 sheet.getRange(row,1,1,values.length).setNumberFormat('@').setValues([values.map(stmSafeCell_)]);
}
function stmBook_(){const id=PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');if(!id)throw Error('Run owner setup first.');return SpreadsheetApp.openById(id);}
/* Select setupCollector in the editor dropdown and click Run once.
   Keep both function names unchanged before and after deployment. */
function setupCollector(){
 const activeEmail=Session.getActiveUser().getEmail();
 const effectiveEmail=Session.getEffectiveUser().getEmail();
 if(!activeEmail||!effectiveEmail||activeEmail!==effectiveEmail){
  throw Error('Owner setup only. Run setupCollector in the Apps Script editor using the Google account that owns this project.');
 }
 setupCollector_();
}
/* Private implementation: re-running setup reuses the same Sheet.
   This function cannot be invoked by google.script.run. */
function setupCollector_(){
 const lock=LockService.getScriptLock();if(!lock.tryLock(10000))throw Error('Collector is busy; retry setup.');
 try{const props=PropertiesService.getScriptProperties(),id=props.getProperty('SPREADSHEET_ID'),book=id?SpreadsheetApp.openById(id):SpreadsheetApp.create('Slay the Math — Learning & Comments');
  for(const [name,headers] of Object.entries(STM_HEADERS)){const sheet=book.getSheetByName(name)||book.insertSheet(name);if(!sheet.getLastRow())stmWrite_(sheet,1,headers);sheet.setFrozenRows(1);if(name.startsWith('_'))sheet.hideSheet();}
  SpreadsheetApp.flush();props.setProperty('SPREADSHEET_ID',book.getId());console.log('Open your private collection Sheet: '+book.getUrl());return book.getUrl();
 }finally{lock.releaseLock();}
}
function doGet(e){
 const p=e&&e.parameter||{};
 if(!/^[a-f0-9]{64}$/.test(p.stmNonce||'')||!STM_ALLOWED_GAME_ORIGINS.includes(p.stmParentOrigin))return HtmlService.createHtmlOutput('Open this collection link from Slay the Math.');
 const config=JSON.stringify({parentOrigin:p.stmParentOrigin,channel:p.stmNonce}).replace(/</g,'\\u003c');
 return HtmlService.createHtmlOutput('<!doctype html><meta charset="utf-8"><title>Slay the Math collection</title><script>const STM_BRIDGE_CONFIG='+config+';\n'+STM_BRIDGE_SOURCE_+'<\/script>').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function stmProjection_(book,key,clientId,entry,receivedAt){
 const p=entry.payload;let name,row;
 if(entry.kind==='learning-record'){
  const r=p.record,events=r.events,attempts=r.attempts,first=attempts[0],help=!!first&&(first.hintUsed||first.moreHintViewed||first.foundationViewed);
  // Canonical attempt snapshots own correctness and support, including their order.
  name='Learning';row=[key,clientId,entry.id,entry.revision,p.questionId,p.bankVersion,p.topicCode,p.chapter,p.curriculumStandards.join(', '),p.skillIds.join(', '),p.scope,p.sessionId,p.language,r.status,attempts.length?1:0,attempts.filter(a=>a.correct===false).length,!!first&&first.correct===true&&!help?1:0,help,r.status==='correct'&&attempts.length>1,r.status==='revealed',!!r.hintState.hintUsed,!!r.hintState.moreHintViewed,!!r.foundationViewed,events.some(e=>e.type==='STEPS_TOGGLED'),p.updatedAt,receivedAt];
 }else{name='Comments';row=[key,clientId,entry.id,entry.revision,p.questionId,p.bankVersion,p.topic||'',p.difficulty||'',(p.categories||[]).join(', '),p.comment||'',p.deleted===true,p.context?.mode||'',p.context?.language||'',p.question||'',p.updatedAt,receivedAt];}
 const sheet=book.getSheetByName(name),count=sheet.getLastRow()-1,keys=count?sheet.getRange(2,1,count,1).getValues().map(r=>r[0]):[],found=keys.indexOf(key);
 stmWrite_(sheet,found<0?sheet.getLastRow()+1:found+2,row);
}
function stmChunks_(value){const result=[];let rest=value;while(rest.length){let end=Math.min(15995,rest.length);if(end<rest.length&&/[\uD800-\uDBFF]/.test(rest[end-1]))end--;result.push('json:'+rest.slice(0,end));rest=rest.slice(end);}if(result.length>5)throw Error('Payload exceeds storage capacity.');while(result.length<5)result.push('');return result;}
function stmDecodeChunks_(chunks){return chunks.map(cell=>{if(cell==='')return '';if(typeof cell!=='string'||!cell.startsWith('json:'))throw Error('Invalid payload chunk.');return cell.slice(5);}).join('');}
function stmEducationDispatch(request){
 const reply=(status,body)=>({status,body});let lock=null;
 try{
  if(!stmExact_(request,['protocolVersion','action','body','clientId','secret'])||request.protocolVersion!==1||!['status','register','batch'].includes(request.action)||stmBytes_(JSON.stringify(request))>524288)return reply(400,{error:'Invalid collection request.'});
  if(request.action==='status')return reply(200,{protocolVersion:1,enabled:!!PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID')});
  lock=LockService.getScriptLock();if(!lock.tryLock(5000)){lock=null;return reply(503,{error:'Collection is busy. Retry later.'});}
  const book=stmBook_(),clients=book.getSheetByName('_Clients'),n=clients.getLastRow()-1,clientRows=n?clients.getRange(2,1,n,3).getValues():[];
  const validClient=value=>typeof value==='string'&&/^[a-f0-9]{48}$/.test(value),validSecret=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
  if(request.action==='register'){
   const body=request.body;if(!stmExact_(body,['clientId','secret'])||!validClient(body.clientId)||!validSecret(body.secret))return reply(400,{error:'Invalid device registration.'});
   const existing=clientRows.find(r=>r[0]===body.clientId),hash=DCAnalytics.fingerprint(body.secret);if(existing&&existing[1]!==hash)return reply(409,{error:'Device ID already registered.'});
   if(!existing){if(n>=STM_MAX_CLIENTS)return reply(503,{error:'Collection device limit reached.'});stmWrite_(clients,n+2,[body.clientId,hash,new Date().toISOString()]);}SpreadsheetApp.flush();return reply(200,{registered:true});
  }
  if(!validClient(request.clientId)||!validSecret(request.secret)||!clientRows.some(r=>r[0]===request.clientId&&r[1]===DCAnalytics.fingerprint(request.secret)))return reply(401,{error:'Valid device capability required.'});
  const body=request.body;if(!stmExact_(body,['entries'])||!Array.isArray(body.entries)||!body.entries.length||body.entries.length>25)return reply(400,{error:'Use 1 to 25 entries per batch.'});
  const ids=new Set(),questions=new Map(DCQuestionBank.questions.map(q=>[q.id,q])),versions=new Set([DCQuestionBank.bankVersion,'form4-review-1.0.0','form4-review-1.4.0','form4-review-1.5.0']);
  for(const entry of body.entries){const p=entry?.payload;if(!stmExact_(entry,['id','revision','kind','payload'])||!stmId_(entry.id)||ids.has(entry.id)||!Number.isSafeInteger(entry.revision)||entry.revision<1||!p||p.id!==entry.id||stmBytes_(JSON.stringify(p))>65536||!(entry.kind==='learning-record'?DCAnalytics.validateRecord(p)&&stmText_(p.sessionId,200)&&stmText_(p.source,200)&&stmDate_(p.firstCapturedAt)&&stmDate_(p.updatedAt):entry.kind==='question-feedback'&&stmValidateFeedback_(p,questions,versions,DCQuestionBank.topics)))return reply(400,{error:'Invalid education entry.'});ids.add(entry.id);}
  const sheet=book.getSheetByName('_Records'),count=sheet.getLastRow()-1,rows=count?sheet.getRange(2,1,count,7).getValues():[],byKey=new Map(rows.map((r,i)=>[r[0],{row:r,index:i+2}])),conflicts=[],writes=[];let additions=0;
  for(const entry of body.entries){const key=DCAnalytics.fingerprint(JSON.stringify([request.clientId,entry.id])),stored=byKey.get(key),payload=stmStable_(entry.payload),hash=DCAnalytics.fingerprint(payload);
   if(stored&&stored.row[3]===entry.revision&&(stored.row[4]!==entry.kind||stored.row[5]!==hash))conflicts.push({id:entry.id,revision:stored.row[3]});
   if(!stored)additions++;writes.push({entry,key,stored,payload,hash});
  }
  if(conflicts.length)return reply(409,{conflicts});if(count+additions>STM_MAX_RECORDS)return reply(503,{error:'Collection record limit reached. Export and archive the Sheet.'});
  for(const item of writes){let {entry,key,stored,payload,hash}=item;let receivedAt=new Date().toISOString();
   if(!stored||entry.revision>stored.row[3])stmWrite_(sheet,stored?stored.index:sheet.getLastRow()+1,[key,request.clientId,entry.id,entry.revision,entry.kind,hash,receivedAt,...stmChunks_(payload)]);
   else{payload=stmDecodeChunks_(sheet.getRange(stored.index,8,1,5).getValues()[0]);if(DCAnalytics.fingerprint(payload)!==stored.row[5])throw Error('Stored payload is unreadable.');entry={id:stored.row[2],revision:stored.row[3],kind:stored.row[4],payload:JSON.parse(payload)};receivedAt=stored.row[6];}
   // Repair the readable row even on identical/older replay after an interrupted write.
   stmProjection_(book,key,request.clientId,entry,receivedAt);
  }
  SpreadsheetApp.flush();return reply(200,{acknowledged:body.entries.map(({id,revision})=>({id,revision}))});
 }catch{return reply(503,{error:'Google could not save this batch. Pending entries stay on the device.'});}
 finally{if(lock)lock.releaseLock();}
}
