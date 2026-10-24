/* Owner setting: add the exact HTTPS origin of a hosted game here, with no path.
   Local npm start uses port 4173. Deploy a new web-app version after editing. */
const STM_ALLOWED_GAME_ORIGINS=['http://localhost:4173','http://127.0.0.1:4173'];
const STM_MAX_RECORDS=10000,STM_MAX_CLIENTS=1500;
const STM_ISSUE_STATUSES=['Baharu','Sedang disemak','Selesai'];
const STM_HEADERS={
 _Clients:['Client ID','Secret SHA256','Created at'],
 _Records:['Key','Client ID','Entry ID','Revision','Kind','Payload SHA256','Received at','Payload 1','Payload 2','Payload 3','Payload 4','Payload 5'],
 Learning:['Key','Client ID','Entry ID','Revision','Question ID','Bank version','Topic','Chapter','Learning standards','Skills','Scope','Session ID','Language','Status','Answered','Wrong attempts','Independent first try','Help on first attempt','Retry success','Revealed','Hint used','More Hint viewed','Basics viewed','Steps viewed','Updated at','Received at'],
 Comments:['Key','Client ID','Entry ID','Revision','Question ID','Bank version','Topic','Difficulty','Categories','Comment','Deleted','Mode','Language','Question','Updated at','Received at','Source','Hint used','More Hint viewed','Steps viewed','Context status','Created at'],
 Issues:['Issue key','Question ID','Category','Topic','Difficulty','Status','Pelapor unik (peranti)','Active reports','Sources','Languages','Bank versions','First reported at','Latest report at','Last received at','Latest comment','Question','Developer notes','Fixed in version'],
 _IssueReports:['Key','Revision','Question ID','Categories','Evidence SHA256','Active','Metadata SHA256','Comment present']
};
const stmExact_=(value,keys)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===keys.length&&keys.every(k=>Object.prototype.hasOwnProperty.call(value,k));
const stmDate_=value=>typeof value==='string'&&value.length===24&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString()===value;
const stmText_=(value,max)=>typeof value==='string'&&value.length>0&&value.length<=max&&!/[\x00-\x1f\x7f]/.test(value);
const stmId_=value=>typeof value==='string'&&/^[A-Za-z0-9][A-Za-z0-9._:|/-]{0,299}$/.test(value);
function stmStable_(value){if(Array.isArray(value))return '['+value.map(stmStable_).join(',')+']';if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stmStable_(value[k])).join(',')+'}';return JSON.stringify(value);}
function stmBytes_(value){let n=0;for(const c of value){const cp=c.codePointAt(0);n+=cp<128?1:cp<2048?2:cp<65536?3:4;}return n;}
function stmSafeCell_(value){return typeof value==='string'&&/^[\s\uFEFF]*[=+@-]|^[\t\r]/.test(value)?"'"+value:value;}
function stmWriteCells_(sheet,row,column,values){
 if(sheet.getMaxRows()<row)sheet.insertRowsAfter(sheet.getMaxRows(),row-sheet.getMaxRows());
 const lastColumn=column+values.length-1;
 if(sheet.getMaxColumns()<lastColumn)sheet.insertColumnsAfter(sheet.getMaxColumns(),lastColumn-sheet.getMaxColumns());
 sheet.getRange(row,column,1,values.length).setNumberFormat('@').setValues([values.map(stmSafeCell_)]);
}
function stmWrite_(sheet,row,values){stmWriteCells_(sheet,row,1,values);}
function stmEnsureSheet_(book,name,headers){
 const sheet=book.getSheetByName(name)||book.insertSheet(name);
 if(!sheet.getLastRow())stmWrite_(sheet,1,headers);
 else{
  const current=sheet.getRange(1,1,1,headers.length).getValues()[0];
  if(current.some((value,i)=>value!==''&&value!==headers[i]))throw Error('Unexpected '+name+' headers. Keep the existing collection columns in order.');
  // Append missing diagnostic headers without touching existing data rows.
  for(let i=0;i<headers.length;){if(current[i]!==''){i++;continue;}const start=i;while(i<headers.length&&current[i]==='')i++;stmWriteCells_(sheet,1,start+1,headers.slice(start,i));}
 }
 sheet.setFrozenRows(1);if(name.startsWith('_'))sheet.hideSheet();return sheet;
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
  for(const [name,headers] of Object.entries(STM_HEADERS))stmEnsureSheet_(book,name,headers);
  stmRefreshIssueBoard_(book);
  SpreadsheetApp.flush();props.setProperty('SPREADSHEET_ID',book.getId());console.log('Open your private collection Sheet: '+book.getUrl());return book.getUrl();
 }finally{lock.releaseLock();}
}
/* Owner editor action only. Public collection RPCs never read or edit Issues. */
function refreshIssueBoard(){
 const activeEmail=Session.getActiveUser().getEmail(),effectiveEmail=Session.getEffectiveUser().getEmail();
 if(!activeEmail||!effectiveEmail||activeEmail!==effectiveEmail)throw Error('Owner issue refresh only. Run refreshIssueBoard in the Apps Script editor using the Google account that owns this project.');
 const lock=LockService.getScriptLock();if(!lock.tryLock(10000))throw Error('Collector is busy; retry issue refresh.');
 try{stmRefreshIssueBoard_(stmBook_());SpreadsheetApp.flush();console.log('Private issue board refreshed.');}finally{lock.releaseLock();}
}
function stmIssueRows_(sheet,width){const count=sheet.getLastRow()-1;return count>0?sheet.getRange(2,1,count,width).getValues():[];}
function stmIssueTrue_(value){return value===true||value==='true'||value==='TRUE';}
function stmIssueList_(value){return typeof value==='string'?[...new Set(value.split(',').map(v=>v.trim()).filter(Boolean))]:[];}
function stmIssueDate_(value){return stmDate_(value)?value:'';}
function stmIssueMin_(a,b){return a&&b?(a<b?a:b):a||b||'';}
function stmIssueMax_(a,b){return a&&b?(a>b?a:b):a||b||'';}
function stmIssueFormat_(sheet){
 sheet.setFrozenRows(1);
 // These are ordinary private Sheet cells, separate from a player's review tick.
 if(typeof SpreadsheetApp.newDataValidation==='function'){
  const rule=SpreadsheetApp.newDataValidation().requireValueInList(STM_ISSUE_STATUSES,true).setAllowInvalid(false).setHelpText('Developer triage: Baharu → Sedang disemak → Selesai.').build();
  sheet.getRange(2,6,Math.max(1,sheet.getMaxRows()-1),1).setDataValidation(rule);
 }
 sheet.getRange(2,17,Math.max(1,sheet.getMaxRows()-1),2).setNumberFormat('@');
 if(typeof sheet.getFilter==='function'&&!sheet.getFilter()){
  const range=sheet.getRange(1,1,sheet.getMaxRows(),STM_HEADERS.Issues.length);if(typeof range.createFilter==='function')range.createFilter();
 }
}
function stmIssueWriteComputed_(sheet,index,column,values,previous){if(values.some((value,i)=>value!==previous[column+i-1]))stmWriteCells_(sheet,index,column,values);}
/* Read only the compact Comments projection, never learning payload chunks.
   The signature table records the latest revision even after a removal. */
function stmRefreshIssueBoard_(book){
 const comments=stmEnsureSheet_(book,'Comments',STM_HEADERS.Comments),issues=stmEnsureSheet_(book,'Issues',STM_HEADERS.Issues),state=stmEnsureSheet_(book,'_IssueReports',STM_HEADERS._IssueReports);
 const previousReports=new Map(stmIssueRows_(state,STM_HEADERS._IssueReports.length).map((row,i)=>[row[0],{row,index:i+2,revision:Number(row[1]),questionId:row[2],categories:stmIssueList_(row[3]),hash:row[4],active:stmIssueTrue_(row[5]),metadataHash:row[6],hasComment:stmIssueTrue_(row[7])}]));
 const reports=new Map(),groups=new Map(),existing=new Map(stmIssueRows_(issues,STM_HEADERS.Issues.length).map((row,i)=>[row[0],{row,index:i+2}]));
 for(const row of stmIssueRows_(comments,STM_HEADERS.Comments.length)){
  if(!row[0]||!row[4]||!Number.isSafeInteger(Number(row[3])))continue;
  const prior=reports.get(row[0]);if(prior&&prior.revision>=Number(row[3]))continue;
  const comment=typeof row[9]==='string'?row[9].trim():'',question=typeof row[13]==='string'?row[13].replace(/^\[REVIEWED\]\s*/,''):'',labels=stmIssueList_(row[8]);
  const active=!stmIssueTrue_(row[10])&&(labels.length>0||comment.length>0),issueCategories=active?(labels.length?labels:['other']):[];
  const metadata={questionId:row[4],bankVersion:row[5],topic:row[6],difficulty:row[7],question,mode:row[11],language:row[12],source:row[16]||row[11],hintUsed:row[17],moreHintViewed:row[18],stepsViewed:row[19],status:row[20]};
  reports.set(row[0],{key:row[0],revision:Number(row[3]),clientId:row[1],questionId:row[4],bankVersion:row[5],topic:row[6],difficulty:row[7],comment,question,source:metadata.source,language:row[12],createdAt:stmIssueDate_(row[21])||stmIssueDate_(row[14]),updatedAt:stmIssueDate_(row[14]),receivedAt:stmIssueDate_(row[15]),categories:issueCategories,active,hash:DCAnalytics.fingerprint(stmStable_({...metadata,comment})),metadataHash:DCAnalytics.fingerprint(stmStable_(metadata)),hasComment:comment.length>0});
 }
 let nextStateRow=state.getLastRow()+1;const stateWrites=[];
 for(const report of reports.values()){
  const prior=previousReports.get(report.key),removalOnly=!!prior&&prior.hasComment&&!report.hasComment&&prior.metadataHash===report.metadataHash;
  for(const category of report.categories){
   const key=report.questionId+'|'+category;let group=groups.get(key);
   if(!group){group={key,questionId:report.questionId,category,devices:new Set(),reports:new Set(),topics:new Set(),difficulties:new Set(),sources:new Set(),languages:new Set(),versions:new Set(),first:'',latest:'',received:'',comment:null,question:null,newEvidence:false};groups.set(key,group);}
   group.devices.add(report.clientId);group.reports.add(report.key);
   for(const [set,value] of [[group.topics,report.topic],[group.difficulties,report.difficulty],[group.sources,report.source],[group.languages,report.language],[group.versions,report.bankVersion]])if(typeof value==='string'&&value)set.add(value);
   group.first=stmIssueMin_(group.first,report.createdAt);group.latest=stmIssueMax_(group.latest,report.updatedAt);group.received=stmIssueMax_(group.received,report.receivedAt);
   const order=report.updatedAt+'|'+report.receivedAt+'|'+report.key;
   if(report.comment&&(!group.comment||order>group.comment.order))group.comment={order,value:report.comment};
   if(report.question&&(!group.question||order>group.question.order))group.question={order,value:report.question};
   // Revisions alone, review ticks, category removal and comment-only removal
   // are not fresh evidence. A replay can never reopen a resolved issue.
   if(!prior||(report.revision>prior.revision&&(!prior.active||prior.questionId!==report.questionId||!prior.categories.includes(category)||(prior.hash!==report.hash&&!removalOnly))))group.newEvidence=true;
  }
  const values=[report.key,report.revision,report.questionId,report.categories.join(', '),report.hash,report.active,report.metadataHash,report.hasComment];
  if(!prior||report.revision>=prior.revision&&values.some((value,i)=>value!==prior.row[i]))stateWrites.push({index:prior?prior.index:nextStateRow++,values});
 }
 let nextIssueRow=issues.getLastRow()+1;
 for(const key of [...new Set([...existing.keys(),...groups.keys()])].sort()){
  const stored=existing.get(key),old=stored?stored.row:Array(STM_HEADERS.Issues.length).fill(''),group=groups.get(key),join=set=>[...set].sort().join(', ');
  const prefix=group?[key,group.questionId,group.category,join(group.topics),join(group.difficulties)]:old.slice(0,5);
  // Retain the latest diagnostic snapshot and historical dates at zero active
  // reports, alongside the owner's status, notes and fixed-version record.
  const computed=group?[group.devices.size,group.reports.size,join(group.sources),join(group.languages),join(group.versions),stmIssueMin_(stmIssueDate_(old[11]),group.first),stmIssueMax_(stmIssueDate_(old[12]),group.latest),stmIssueMax_(stmIssueDate_(old[13]),group.received),group.comment?group.comment.value:old[14],group.question?group.question.value:old[15]]:[0,0,...old.slice(8,16)];
  const status=STM_ISSUE_STATUSES.includes(old[5])?old[5]:'Baharu',nextStatus=status==='Selesai'&&group?.newEvidence?'Baharu':status;
  if(!stored)stmWrite_(issues,nextIssueRow++,[...prefix,nextStatus,...computed,'','']);
  else{stmIssueWriteComputed_(issues,stored.index,1,prefix,old);stmIssueWriteComputed_(issues,stored.index,7,computed,old);if(nextStatus!==old[5])stmWriteCells_(issues,stored.index,6,[nextStatus]);}
 }
 stmIssueFormat_(issues);
 // Make projections/status durable before remembering their signatures. A
 // failure here or below has no ACK; replay repairs the board without counts.
 if(stateWrites.length)SpreadsheetApp.flush();
 for(const item of stateWrites)stmWrite_(state,item.index,item.values);
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
 }else{name='Comments';row=[key,clientId,entry.id,entry.revision,p.questionId,p.bankVersion,p.topic||'',p.difficulty||'',(p.categories||[]).join(', '),p.comment||'',p.deleted===true,p.context?.mode||'',p.context?.language||'',p.question||'',p.updatedAt,receivedAt,p.context?.source||p.context?.mode||'',p.context?.hintUsed??'',p.context?.moreHintViewed??'',p.context?.stepsViewed??'',p.context?.status||'',p.createdAt||''];}
 const sheet=stmEnsureSheet_(book,name,STM_HEADERS[name]),count=sheet.getLastRow()-1,keys=count?sheet.getRange(2,1,count,1).getValues().map(r=>r[0]):[],found=keys.indexOf(key);
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
  stmRefreshIssueBoard_(book);SpreadsheetApp.flush();return reply(200,{acknowledged:body.entries.map(({id,revision})=>({id,revision}))});
 }catch{return reply(503,{error:'Google could not save this batch. Pending entries stay on the device.'});}
 finally{if(lock)lock.releaseLock();}
}
