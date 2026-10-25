'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{services}=require('./helpers/google-services.cjs'),bank=require('../dist/mechanics.js').data.bank;
const CLIENT='a'.repeat(48),SECOND='c'.repeat(48),SECRET='b'.repeat(64),AT='2026-10-24T10:00:00.000Z',LATER='2026-10-24T11:00:00.000Z';
function feedback(patch={}){
 const questionId=patch.questionId||'PROB-003',q=bank.questions.find(q=>q.id===questionId),bankVersion=patch.bankVersion||bank.bankVersion;
 return {id:bankVersion+':'+questionId,questionId,bankVersion,topic:q.topic,difficulty:q.difficulty,question:'Soalan kebarangkalian',categories:['hint-unclear'],comment:'Hint kurang jelas',createdAt:AT,updatedAt:AT,...patch,context:{mode:'learn',language:'ms',status:'pending',hintUsed:true,moreHintViewed:false,stepsViewed:false,...patch.context}};
}
function entry(payload=feedback(),revision=1){return {id:payload.id,revision,kind:'question-feedback',payload};}
function tombstone(payload=feedback()){return {id:payload.id,questionId:payload.questionId,bankVersion:payload.bankVersion,deleted:true,updatedAt:LATER};}
function setup(){
 const s=services(),c=s.loadReceiver();c.setupCollector_();
 const dispatch=request=>JSON.parse(JSON.stringify(c.stmEducationDispatch(JSON.parse(JSON.stringify(request)))));
 const request=(action,body=null,clientId=null)=>({protocolVersion:1,action,body,clientId,secret:clientId?SECRET:null});
 const register=(clientId=CLIENT)=>assert.equal(dispatch(request('register',{clientId,secret:SECRET})).status,200);
 register();
 const sheet=name=>[...s.books.values()][0].getSheetByName(name);
 const rows=name=>s.rows(name).slice(1).map(row=>Object.fromEntries(s.rows(name)[0].map((h,i)=>[h,row[i]??''])));
 const issue=(category='hint-unclear',questionId='PROB-003')=>rows('Issues').find(row=>row['Question ID']===questionId&&row.Category===category);
 function edit(category,values,questionId='PROB-003'){
  const sh=sheet('Issues'),headers=sh.rows[0],index=sh.rows.findIndex((row,i)=>i&&row[headers.indexOf('Question ID')]===questionId&&row[headers.indexOf('Category')]===category);
  assert.ok(index>0,'issue exists');for(const [key,value] of Object.entries(values))sh.getRange(index+1,headers.indexOf(key)+1).setValues([[value]]);
 }
 return {s,c,dispatch,request,register,sheet,rows,issue,edit,batch:(entries,clientId=CLIENT)=>dispatch(request('batch',{entries},clientId))};
}

test('private issue board is initialized on the same owner Sheet with a native status dropdown and filter',()=>{
 const {s,c,sheet}=setup();
 assert.equal(typeof c.refreshIssueBoard,'function');assert.equal(s.books.size,1);assert.ok(sheet('Issues'));assert.equal(sheet('_IssueReports').hidden,true);
 assert.equal(sheet('Issues').frozenRows,1);assert.ok(sheet('Issues').filter);
 const validation=sheet('Issues').validations.at(-1);assert.deepEqual(validation.rule.values,['Baharu','Sedang disemak','Selesai']);assert.equal(validation.rule.allowInvalid,false);
 c.setupCollector_();assert.equal(s.books.size,1);assert.equal(sheet('Issues').rows.length,1);
});

test('legacy practice/review and all gameplay report sources keep their frozen context diagnostics',()=>{
 const {batch,register,rows,issue}=setup();
 const contexts=[{mode:'learn',status:'pending'},{mode:'review',status:'revealed'},...['predict','artifact','mystery'].map(source=>({mode:'gameplay',source,status:'correct'}))];
 contexts.forEach((context,i)=>{const clientId=(i+1).toString(16).repeat(48);register(clientId);assert.equal(batch([entry(feedback({context:{...context,language:i%2?'en':'ms',hintUsed:i%2===0,moreHintViewed:i%2!==0,stepsViewed:true}}))],clientId).status,200);});
 assert.equal(issue()['Pelapor unik (peranti)'],5);assert.equal(issue()['Active reports'],5);assert.equal(issue().Sources,'artifact, learn, mystery, predict, review');assert.equal(issue().Languages,'en, ms');
 for(const row of rows('Comments')){assert.equal(row.Source,row.Mode==='gameplay'?contexts.find(c=>c.source===row.Source)?.source:row.Mode);assert.equal(typeof row['Hint used'],'boolean');assert.equal(typeof row['More Hint viewed'],'boolean');assert.equal(row['Steps viewed'],true);assert.ok(['pending','correct','revealed'].includes(row['Context status']));assert.equal(row['Created at'],AT);}
});

test('categories form separate issues, uncategorized comments use other, and reviewed-only/deleted rows stay out',()=>{
 const {batch,rows,issue}=setup();
 assert.equal(batch([
  entry(feedback({categories:['hint-unclear','steps-unclear']})),
  entry(feedback({questionId:'PROB-004',categories:[],comment:'Other issue'})),
  entry(feedback({questionId:'PROB-005',categories:[],comment:'  ',question:'[REVIEWED] Soalan'})),
  entry(tombstone(feedback({questionId:'PROB-006'})))
 ]).status,200);
 assert.equal(rows('Issues').length,3);for(const category of ['hint-unclear','steps-unclear']){assert.equal(issue(category)['Active reports'],1);assert.equal(issue(category)['Pelapor unik (peranti)'],1);}
 assert.equal(issue('other','PROB-004')['Latest comment'],'Other issue');assert.equal(issue('other','PROB-005'),undefined);
});

test('unique device counts deduplicate versions while counting distinct active report entries honestly',()=>{
 const {batch,register,issue,rows}=setup();register(SECOND);
 const old=feedback({bankVersion:'form4-review-1.5.0'});
 assert.equal(batch([entry(),entry(old)]).status,200);assert.equal(batch([entry()],SECOND).status,200);
 assert.equal(issue()['Pelapor unik (peranti)'],2);assert.equal(issue()['Active reports'],3);assert.equal(issue()['Bank versions'],['form4-review-1.5.0',bank.bankVersion].sort().join(', '));
 assert.equal(rows('Comments').length,3);assert.equal(rows('_IssueReports').length,3);
});

test('exact/older retries and review/timestamp-only revisions preserve developer triage and notes',()=>{
 const {batch,issue,edit,sheet}=setup(),original=feedback();assert.equal(batch([entry(original,3)]).status,200);
 edit('hint-unclear',{Status:'Sedang disemak','Developer notes':"'=Developer formula text",'Fixed in version':'2.38.0'});
 assert.equal(batch([entry(original,3)]).status,200);assert.equal(issue().Status,'Sedang disemak');edit('hint-unclear',{Status:'Selesai'});
 const before=sheet('Issues').writes.length;
 assert.equal(batch([entry(feedback({comment:'Older evidence'}),1)]).status,200);assert.equal(batch([entry(original,3)]).status,200);
 assert.equal(batch([entry(feedback({question:'[REVIEWED] '+original.question,updatedAt:LATER}),4)]).status,200);
 const row=issue();assert.equal(row.Status,'Selesai');assert.equal(row['Active reports'],1);assert.equal(row['Developer notes'],"'=Developer formula text");assert.equal(row['Fixed in version'],'2.38.0');
 const headers=sheet('Issues').rows[0],notes=headers.indexOf('Developer notes')+1,version=headers.indexOf('Fixed in version')+1;
 assert.ok(sheet('Issues').writes.slice(before).every(w=>w.col+w.width<=notes||w.col>version),'refresh never writes the developer note/version cells');
});

test('new active evidence reopens resolved issues, while category/comment removals and tombstones do not',()=>{
 const {batch,issue,edit,rows}=setup(),initial=feedback({categories:['hint-unclear','steps-unclear']});assert.equal(batch([entry(initial)]).status,200);
 for(const category of initial.categories)edit(category,{Status:'Selesai','Developer notes':'Keep history','Fixed in version':'2.38.0'});
 const reduced=feedback({categories:['hint-unclear'],updatedAt:LATER});assert.equal(batch([entry(reduced,2)]).status,200);
 assert.equal(issue('hint-unclear').Status,'Selesai');assert.equal(issue('steps-unclear').Status,'Selesai');assert.equal(issue('steps-unclear')['Active reports'],0);
 const noComment=feedback({categories:['hint-unclear'],comment:'',updatedAt:LATER});assert.equal(batch([entry(noComment,3)]).status,200);assert.equal(issue().Status,'Selesai');
 assert.equal(batch([entry(tombstone(initial),4)]).status,200);assert.equal(rows('Issues').length,2);
 for(const category of initial.categories){assert.equal(issue(category)['Active reports'],0);assert.equal(issue(category).Status,'Selesai');assert.equal(issue(category)['Developer notes'],'Keep history');}
 assert.equal(batch([entry(feedback({comment:'Still wrong after the fix',updatedAt:LATER}),5)]).status,200);assert.equal(issue().Status,'Baharu');assert.equal(issue()['Active reports'],1);assert.equal(issue()['Fixed in version'],'2.38.0');assert.equal(issue('steps-unclear').Status,'Selesai');
 edit('hint-unclear',{Status:'Selesai'});assert.equal(batch([entry(feedback({comment:'Still wrong after the fix',context:{stepsViewed:true},updatedAt:LATER}),6)]).status,200);assert.equal(issue().Status,'Baharu');
});

test('same-revision conflicts and invalid contexts cannot change counts or developer edits',()=>{
 const {batch,issue,edit,rows}=setup();assert.equal(batch([entry()]).status,200);edit('hint-unclear',{Status:'Selesai'});
 assert.equal(batch([entry(feedback({comment:'Conflict'}))]).status,409);
 assert.equal(batch([entry(feedback({questionId:'PROB-004'})),entry(feedback({context:{mode:'learn',source:'predict'}}),2)]).status,400);
 assert.equal(rows('Issues').length,1);assert.equal(issue().Status,'Selesai');assert.equal(issue()['Active reports'],1);assert.equal(rows('Comments').length,1);
});

test('owner editor refresh rejects anonymous/other accounts and public dispatch exposes no issue actions',()=>{
 const {s,c,dispatch,request,batch,issue,edit}=setup();assert.equal(batch([entry()]).status,200);edit('hint-unclear',{Status:'Selesai'});
 for(const email of ['', 'player@example.com']){c.Session={getActiveUser:()=>({getEmail:()=>email}),getEffectiveUser:()=>({getEmail:()=>'owner@example.com'})};assert.throws(()=>c.refreshIssueBoard(),/Owner.*only/);}
 for(const action of ['issues','refreshIssueBoard','setIssueStatus','deleteIssue']){const result=dispatch(request(action,{status:'Selesai'},CLIENT));assert.equal(result.status,400);assert.equal(JSON.stringify(result).includes('docs.google.com'),false);}
 c.Session={getActiveUser:()=>({getEmail:()=>'owner@example.com'}),getEffectiveUser:()=>({getEmail:()=>'owner@example.com'})};
 s.holdLock(true);assert.throws(()=>c.refreshIssueBoard(),/busy/);s.holdLock(false);assert.equal(c.refreshIssueBoard(),undefined);assert.equal(issue().Status,'Selesai');assert.equal(s.locked,false);
});

test('interrupted projections/board/state/flush return no ACK and replay repairs the current evidence',()=>{
 for(const [failure,occurrence] of [['Comments',1],['Issues',2],['_IssueReports',1],['flush',1]]){
  const {s,batch,issue,edit,rows}=setup();assert.equal(batch([entry()]).status,200);edit('hint-unclear',{Status:'Selesai','Developer notes':'Keep me','Fixed in version':'2.38.0'});
  const newer=entry(feedback({comment:'New evidence',updatedAt:LATER}),3);s.failOnce(failure,occurrence);
  const failed=batch([newer]);assert.equal(failed.status,503,failure);assert.equal(failed.body.acknowledged,undefined);
  const retry=batch([entry(feedback({comment:'Old retry'}),1)]);assert.equal(retry.status,200,failure);assert.deepEqual(retry.body.acknowledged,[{id:feedback().id,revision:1}]);
  assert.equal(issue().Status,'Baharu');assert.equal(issue()['Latest comment'],'New evidence');assert.equal(issue()['Active reports'],1);assert.equal(issue()['Developer notes'],'Keep me');assert.equal(issue()['Fixed in version'],'2.38.0');assert.equal(rows('_IssueReports').length,1);assert.equal(rows('_IssueReports')[0].Revision,3);assert.equal(s.locked,false);
 }
});

test('aggregation runs after every batch projection and once per batch, without reading learning payload chunks',()=>{
 const {s,c,batch,sheet,rows}=setup(),comments=sheet('Comments'),raw=sheet('_Records');
 const first=entry(),second=entry(feedback({questionId:'PROB-004'}));s.failOnce('Comments',2);assert.equal(batch([first,second]).status,503);assert.equal(rows('Issues').length,0);
 comments.reads.length=0;raw.reads.length=0;assert.equal(batch([first,second]).status,200);assert.equal(rows('Issues').length,2);
 assert.equal(comments.reads.filter(r=>r.row===2&&r.width===comments.rows[0].length).length,1);
 raw.reads.length=0;c.stmRefreshIssueBoard_([...s.books.values()][0]);assert.equal(raw.reads.length,0,'aggregation never reads canonical payload chunks');
});

test('safe header migration appends diagnostics without overwriting legacy rows or developer history',()=>{
 const {s,c,batch,sheet,issue,edit}=setup(),original=feedback();assert.equal(batch([entry(original)]).status,200);
 const comments=sheet('Comments'),legacy=comments.rows[1].slice(0,16);comments.rows[0]=comments.rows[0].slice(0,16);comments.rows[1]=legacy.slice();const book=[...s.books.values()][0];book.sheets.delete('Issues');book.sheets.delete('_IssueReports');
 c.setupCollector_();assert.deepEqual(comments.rows[1],legacy);assert.ok(comments.rows[0].includes('Source'));assert.equal(issue().Sources,'learn');edit('hint-unclear',{Status:'Selesai','Developer notes':'Legacy note'});
 assert.equal(batch([entry(original)]).status,200);assert.equal(issue().Status,'Selesai');assert.equal(issue()['Developer notes'],'Legacy note');assert.equal(comments.rows[1][comments.rows[0].indexOf('Hint used')],true);c.setupCollector_();assert.equal(issue()['Developer notes'],'Legacy note');
});

test('formula-like report text is inert, notes stay plain text, and duplicated projections never inflate a board',()=>{
 const {s,batch,c,issue,edit,sheet}=setup(),p=feedback({comment:'=HYPERLINK("https://example.invalid")',question:' +SUM(1,2)'});assert.equal(batch([entry(p,2)]).status,200);
 assert.equal(issue()['Latest comment'],"'"+p.comment);assert.equal(issue().Question,"'"+p.question);edit('hint-unclear',{'Developer notes':"'=Internal text"});
 const comments=sheet('Comments');comments.rows.push(comments.rows[1].slice());const older=comments.rows[1].slice();older[3]=1;older[9]='Old comment';comments.rows.push(older);c.stmRefreshIssueBoard_([...s.books.values()][0]);
 assert.equal(issue()['Active reports'],1);assert.equal(issue()['Pelapor unik (peranti)'],1);assert.equal(issue()['Developer notes'],"'=Internal text");assert.equal(issue()['Latest comment'],"'"+p.comment);
 const notes=sheet('Issues').rows[0].indexOf('Developer notes')+1;assert.ok(sheet('Issues').formats.some(format=>format.format==='@'&&format.col<=notes&&format.col+format.width>notes));
});

test('version diagnostics append to Comments and Issues without replacing developer notes or old records',()=>{
 const {batch,rows,issue,edit,c}=setup(),provenance={gameVersion:'2.45.1-education.1',contentRevision:'clarity-2026-10-24.1'};
 assert.equal(batch([entry()]).status,200);assert.equal(rows('Comments')[0]['Game version'],'');edit('hint-unclear',{Status:'Selesai','Developer notes':'Keep this note','Fixed in version':'2.45.0'});
 c.Session={getActiveUser:()=>({getEmail:()=> 'owner@example.test'}),getEffectiveUser:()=>({getEmail:()=> 'owner@example.test'})};c.refreshIssueBoard();assert.equal(issue().Status,'Selesai');assert.equal(issue()['Game versions'],'');
 assert.equal(batch([entry(feedback({provenance,comment:'New report on this build'}),2)]).status,200);assert.equal(rows('Comments')[0]['Game version'],provenance.gameVersion);assert.equal(rows('Comments')[0]['Content revision'],provenance.contentRevision);assert.equal(issue()['Game versions'],provenance.gameVersion);assert.equal(issue()['Content revisions'],provenance.contentRevision);assert.equal(issue()['Developer notes'],'Keep this note');assert.equal(issue()['Fixed in version'],'2.45.0');assert.equal(issue().Status,'Baharu');
 edit('hint-unclear',{Status:'Selesai'});assert.equal(batch([entry(feedback({provenance,comment:'New report on this build',question:'[REVIEWED] Soalan kebarangkalian',updatedAt:LATER}),3)]).status,200);assert.equal(issue().Status,'Selesai');assert.equal(batch([entry(tombstone(),4)]).status,200);assert.equal(issue()['Active reports'],0);assert.equal(issue()['Game versions'],provenance.gameVersion);assert.equal(issue()['Developer notes'],'Keep this note');
});
