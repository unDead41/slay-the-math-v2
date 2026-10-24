(function(root){
 'use strict';
 const bank=typeof module!=='undefined'?require('./question-data.js'):root.DCQuestionBank;
 const M=typeof module!=='undefined'?require('./mechanics.js'):root.STMMechanics,S=M.session;
 const versions=new Set([bank.version,'form4-review-1.0.0','form4-review-1.4.0','form4-review-1.5.0']);
 const catalog=Object.fromEntries(bank.questions.map(q=>[q.id,q]));
 const integer=n=>Number.isSafeInteger(n)&&n>=0;
 const copy=x=>JSON.parse(JSON.stringify(x));
 const ids=bank.questions.map(q=>q.id);
 const kinds=['starting','elite','mystery','boss'];
 function validIds(list){return Array.isArray(list)&&list.length<=bank.total&&new Set(list).size===list.length&&list.every(id=>Object.hasOwn(catalog,id));}
 function merge(...lists){for(const list of lists)if(!validIds(list))throw new Error('Question history is not valid. Your current progress has been kept.');const seen=new Set(lists.flat());return ids.filter(id=>seen.has(id));}
 // Exposure is consumed when a gameplay question opens, including abandonment.
 // Lifetime history is evidence only; the run ledger alone excludes questions.
 function confirmedRunIds(run){const seen=new Set([...(run.educationState?.completed||[]).map(x=>x?.questionId),run.educationState?.pending?.questionId,...(run.mysteryState?.settled||[]).map(x=>x?.questionId),run.mysteryState?.pending?.questionId,run.battle?.question?.source==='bank'?run.battle.question.questionId:null].filter(Boolean));return ids.filter(id=>seen.has(id));}
 function runIds(run){return merge(run.educationState?.runUsedIds||[],confirmedRunIds(run));}
 function coverage(run,lifetime=[]){return {run:runIds(run).length,lifetime:merge(run.educationState?.usedIds||[],runIds(run),lifetime).length,total:bank.total};}
 function validHistory(history){return !!history&&history.version===1&&versions.has(history.bankVersion)&&validIds(history.usedIds)&&(!history.session||validSession(history.session,history.usedIds));}
 function history(usedIds=[],session=null){return {version:1,bankVersion:bank.version,usedIds:merge(usedIds,...(session?[session.exposureIds]:[])),...(session?{session:copy(session)}:{})};}
 function random(state){state.rng=(Math.imul(state.rng,1664525)+1013904223)>>>0;return state.rng/4294967296;}
 function currentConsumer(run){
  if(run.scene==='education'&&run.educationState?.pending)return {consumer:'artifact',pending:run.educationState.pending,question:current(run)};
  if(run.scene==='battle'&&run.battle?.question?.source==='bank'){const p=run.battle.question;return {consumer:'predict',pending:p,question:catalog[p.questionId]||null};}
  const p=run.mysteryState?.pending;if(run.scene==='event'&&p?.questionId)return {consumer:'mystery',pending:p,question:catalog[p.questionId]||null};
  return null;
 }
 function consumerRecord(run){const q=currentConsumer(run)?.question;return q?getSession(run).records[q.id]||null:null;}
 function consumerLearningView(run){const q=currentConsumer(run)?.question;return q?S.selectLearningView(q,consumerRecord(run)):null;}
 function upgradeActiveQuestion(run){const active=currentConsumer(run),state=run.educationState;if(active?.question&&state){const session=getSession(run);if(session.pendingQuestionId===active.question.id)state.session=S.applyGamePolicy(session,bank,active.question.id);}return run;}
 function failed(run){return S.attemptsExhausted(record(run));}
 function ensureRunState(run,seen=[],profile=null){
  const state=run.educationState||{version:1,bankVersion:bank.version,rng:(run.seed^0x6d617468)>>>0,usedIds:[],completed:[],pending:null};
  const local=state.session||legacySession(state),active=currentConsumer(run),activeId=active?.pending?.solved?null:active?.question?.id||null;
  const migrating=state.runUsedIds===undefined;state.runUsedIds=runIds(run);
  if(migrating&&state.session)state.rng=state.session.rngState;
  let inherited=profile?S.restoreSession(profile,bank):null;
  if(inherited&&state.profileBaseIndex===undefined){local.runIndex=Math.max(local.runIndex,inherited.runIndex+1);state.profileBaseIndex=inherited.runIndex;}
  if(inherited?.pendingQuestionId)inherited=S.revealAnswer(inherited,inherited.pendingQuestionId);
  let session=mergeSessions(inherited,local);
  // A profile can contain an earlier run's completion of the same stable ID.
  // Current-run event streams and their one pending owner always take priority.
  for(const id of state.runUsedIds)if(local.records[id])session.records[id]=copy(local.records[id]);
  if(session.pendingQuestionId&&session.pendingQuestionId!==activeId)session=S.revealAnswer(session,session.pendingQuestionId);
  session.pendingQuestionId=activeId&&session.records[activeId]?.status==='pending'?activeId:null;
  session.rngState=state.rng;
  state.usedIds=merge(state.usedIds,seen,session.exposureIds,state.runUsedIds);
  session.exposureIds=state.usedIds.slice();state.session=session;state.selectionVersion=2;state.bankVersion=bank.version;run.educationState=state;return state;
 }
 function retireQuestion(run,questionId){const state=run.educationState;if(state?.session?.pendingQuestionId===questionId)state.session=S.revealAnswer(state.session,questionId);return run;}
 function reserveForConsumer(run,consumer,seen=[],profile=null,{questions=bank.questions,topicCode=null}={}){
  if(!['predict','artifact','mystery'].includes(consumer))throw Error('Unknown question consumer.');
  const state=ensureRunState(run,seen,profile);
  if(state.session.pendingQuestionId)throw Error('Finish the active question first.');
  const selection={...state.session,exposureIds:state.runUsedIds.slice()};
  const result=S.reserveNext(selection,{...bank,questions:questions.filter(q=>!state.runUsedIds.includes(q.id))},{topicCode,selectionPolicy:'random'});
  if(result.question){const old=state.session.records[result.question.id];if(old){const prefix='previous:'+result.question.id+':';let n=1;while(result.session.archivedRecords[prefix+n])n++;result.session.archivedRecords[prefix+n]=copy(old);}}
  state.runUsedIds=merge(state.runUsedIds,result.question?[result.question.id]:[]);
  state.usedIds=merge(state.usedIds,state.runUsedIds);state.session={...result.session,exposureIds:state.usedIds.slice()};
  if(result.question)state.session=S.applyGamePolicy(state.session,bank,result.question.id);
  state.rng=state.session.rngState;
  return {...result,session:state.session};
 }
 function mergeRunHistory(run,previous=null){const used=merge(previous?.usedIds||[],run.educationState?.usedIds||[],runIds(run)),session=mergeSessions(previous?.session,run.educationState?.session);return history(used,session);}
 function carryRunQuestions(run,previous){
  if(!previous.educationState||JSON.stringify(previous.educationState)===JSON.stringify(run.educationState))return run;const state=ensureRunState(run,previous.educationState.usedIds,previous.educationState.session);
  state.runUsedIds=merge(state.runUsedIds,runIds(previous));state.rng=previous.educationState.session?.rngState??previous.educationState.rng;state.session.rngState=state.rng;state.session.runIndex=previous.educationState.session?.runIndex||state.session.runIndex;return run;
 }
 function syncMystery(run,seen=[],profile=null){
  const state=ensureRunState(run,seen,profile);
  if(state.pending)throw Error('Finish your artifact question first.');
  return state;
 }
 function reserveMystery(run,event,seen=[],profile=null){
  const state=syncMystery(run,seen,profile),available=bank.questions.filter(q=>q.topicCode===event.topicCode&&!state.runUsedIds.includes(q.id));
  const result=reserveForConsumer(run,'mystery',[],null,{questions:available,topicCode:event.topicCode});
  return {question:result.question,preferred:!!result.question&&event.education.preferredQuestionIds.includes(result.question.id)};
 }
 function resolveMystery(run,questionId,choiceId=null){
  upgradeActiveQuestion(run);let session=getSession(run);if(choiceId)session=S.submitAnswer(session,bank,{questionId,choiceId,attemptId:questionId+':mystery:'+(session.records[questionId].attempts.length+1)});
  else if(session.pendingQuestionId===questionId)session=S.revealAnswer(session,questionId);
  run.educationState.session=session;
 }
 function mysterySupport(run,kind){const p=run.mysteryState?.pending;if(run.scene!=='event'||!p?.questionId||!['question','review'].includes(p.phase))throw Error('No Mystery question is waiting.');run.educationState.session=S.openSupport(getSession(run),p.questionId,kind);return run;}
 function prepare(run,artifactId,seen=[],profile=null){
  const offer=run.artifactState?.offer;
  if(run.scene==='education'||run.educationState?.pending||!offer?.ready||!offer.ids.includes(artifactId))throw new Error('Choose one of the offered artifacts.');
  const reservation=reserveForConsumer(run,'artifact',seen,profile),state=run.educationState;
  const question=reservation.question,order=question?question.choices.map(c=>c.id):[];
  // The supplied order is frozen with each reservation. Legacy pending trials
  // retain their already-shuffled order until they finish.
  state.usedIds=merge(state.usedIds,state.session.exposureIds);
  state.pending={kind:offer.kind,source:offer.source,artifactId,questionId:question?.id||null,choiceOrder:order,selectedId:null,attempts:recordAttempts(state.session,question),hinted:!!state.session.records[question?.id]?.hintState.hintUsed,solved:false};
  return state;
 }
 function pending(run){if(run.scene!=='education'||!run.educationState?.pending)throw new Error('No artifact question is waiting.');return run.educationState.pending;}
 function current(run){return catalog[run.educationState?.pending?.questionId]||null;}
 function select(run,id){const p=pending(run),q=current(run);if(!q||p.solved||failed(run)||!p.choiceOrder.includes(id)||p.attempts.includes(id))throw new Error('Choose an answer that is still available.');p.selectedId=id;return run;}
 function answer(run){
  const p=pending(run),q=current(run);
  if(!q||p.solved||failed(run)||!p.selectedId||p.attempts.includes(p.selectedId))throw new Error('Select an answer before checking it.');
  const session=getSession(run);run.educationState.session=S.submitAnswer(session,bank,{questionId:q.id,choiceId:p.selectedId,attemptId:q.id+':'+(p.attempts.length+1)});
  p.attempts.push(p.selectedId);p.solved=p.selectedId===q.correctChoiceId;
  if(!p.solved)p.selectedId=null;
  return {correct:p.solved,first:p.solved&&record(run)?.completion?.category==='independent'};
 }
 function hint(run){const p=pending(run);if(!current(run)||p.solved||failed(run))throw new Error('This question is finished. Review its solution.');run.educationState.session=S.openSupport(getSession(run),p.questionId,'hint');p.hinted=true;return run;}
 function ready(run){const p=pending(run);return p.questionId===null||p.solved||failed(run);}
 function finish(run){
  const p=pending(run);if(!ready(run))throw new Error('Finish the question before continuing.');
  run.educationState.completed.push({source:p.source,artifactId:p.artifactId,kind:p.kind,questionId:p.questionId,attempts:p.attempts.length,hinted:p.hinted,first:p.solved&&record(run)?.completion?.category==='independent',...(failed(run)?{failed:true}:{})});
  run.educationState.pending=null;return p;
 }
 function context(run){const p=run.educationState?.pending;return run.scene==='education'&&p?{...run,scene:{starting:'master',elite:'reward',mystery:'event',boss:'stageclear'}[p.kind]}:run;}
 function valid(run){
  const state=run.educationState;
  if(state===undefined)return run.scene!=='education';
  if(!state||state.version!==1||!versions.has(state.bankVersion)||!integer(state.rng)||state.rng>4294967295||!validIds(state.usedIds)||!Array.isArray(state.completed)||state.completed.length>31)return false;
  if(state.selectionVersion!==undefined&&(state.selectionVersion!==2||!validIds(state.runUsedIds)||!state.session||state.rng!==state.session.rngState))return false;
  if(state.profileBaseIndex!==undefined&&(!integer(state.profileBaseIndex)||state.profileBaseIndex<1))return false;
  if(state.runUsedIds!==undefined&&(!validIds(state.runUsedIds)||state.runUsedIds.some(id=>!state.usedIds.includes(id))||confirmedRunIds(run).some(id=>!state.runUsedIds.includes(id))))return false;
  const acquired=[...(run.artifactState?.acquired||[]),...(run.artifactState?.consumed||[])];
  if(!Array.isArray(acquired)||new Set(state.completed.map(x=>x?.source)).size!==state.completed.length)return false;
  const completedIds=state.completed.map(x=>x?.questionId).filter(Boolean);if(new Set(completedIds).size!==completedIds.length)return false;
  for(const record of state.completed){
   if(!record||!kinds.includes(record.kind)||!integer(record.attempts)||record.attempts>4||typeof record.hinted!=='boolean'||typeof record.first!=='boolean')return false;
   if(record.failed!==undefined){const row=state.session?.records[record.questionId];if(record.failed!==true||record.first||!S.attemptsExhausted(row)||record.hinted!==row.hintState.hintUsed||record.attempts!==row.attempts.length||!(run.artifactState?.declined||[]).some(x=>x.source===record.source&&x.id===record.artifactId&&x.kind===record.kind)||acquired.some(x=>x.source===record.source))return false;}
   else if(!acquired.some(x=>x.source===record.source&&x.id===record.artifactId))return false;
   if(record.questionId===null){if(record.attempts||record.hinted||record.first)return false;}
   else if(!catalog[record.questionId]||!state.usedIds.includes(record.questionId)||!record.attempts||(record.first&&(record.hinted||record.attempts!==1)))return false;
  }
  const mystery=run.mysteryState?.pending;
  const predict=run.battle?.question?.source==='bank'?run.battle.question:null,activeId=predict&&!predict.solved&&!predict.exhausted&&!S.attemptsExhausted(state.session?.records[predict.questionId])?predict.questionId:mystery?.phase==='question'?mystery.questionId:null;
  if(state.session&&(!validSession(state.session,state.usedIds,state.pending)||(!state.pending&&state.session.pendingQuestionId!==activeId)))return false;
  if(!state.pending)return run.scene!=='education';
  const p=state.pending,offer=run.artifactState?.offer;
  if(run.scene!=='education'||!p||!kinds.includes(p.kind)||!offer?.ready||offer.kind!==p.kind||offer.source!==p.source||!offer.ids.includes(p.artifactId)||state.completed.some(x=>x.source===p.source)||typeof p.hinted!=='boolean'||typeof p.solved!=='boolean'||!Array.isArray(p.attempts)||p.attempts.length>4||new Set(p.attempts).size!==p.attempts.length||!Array.isArray(p.choiceOrder))return false;
  if(p.questionId===null)return (state.runUsedIds||state.usedIds).length===bank.total&&!p.choiceOrder.length&&p.selectedId===null&&!p.attempts.length&&!p.hinted&&!p.solved;
  const q=catalog[p.questionId];
  if(!q||completedIds.includes(q.id)||!state.usedIds.includes(q.id)||p.choiceOrder.length!==4||new Set(p.choiceOrder).size!==4||p.choiceOrder.some(id=>!q.choices.some(c=>c.id===id))||p.attempts.some(id=>!p.choiceOrder.includes(id))||(p.selectedId!==null&&!p.choiceOrder.includes(p.selectedId)))return false;
  const correctAt=p.attempts.indexOf(q.correctChoiceId);
  if(p.solved)return correctAt===p.attempts.length-1&&correctAt>=0&&p.selectedId===q.correctChoiceId;
  return correctAt===-1&&(p.selectedId===null||!p.attempts.includes(p.selectedId));
 }
 // The supplied pure reducers own the ordered support/answer events. The host
 // engine remains synchronous and owns artifact transactions and persistence.
 function recordAttempts(session,q){return q?(session.records[q.id]?.attempts||[]).map(a=>a.choiceId):[];}
 function legacySession(state){
  const s=S.createSession({seed:state.rng});s.bankVersion=bank.bankVersion;s.exposureIds=state.usedIds.slice();
  const p=state.pending,q=p&&catalog[p.questionId];
  if(q){const events=[];for(const id of p.attempts.filter(id=>id!==q.correctChoiceId))events.push({type:'ANSWER_SUBMITTED',choiceId:id,attemptId:q.id+':'+(events.length+1)});
   // Old saves cannot tell whether Hint preceded a wrong answer. Do not invent
   // that order or unlock More Hint retrospectively.
   if(p.hinted)events.push({type:'HINT_REVEALED'});
   if(p.solved)events.push({type:'ANSWER_SUBMITTED',choiceId:q.correctChoiceId,attemptId:q.id+':'+p.attempts.length});
   s.records[q.id]={choiceOrder:q.choices.map(c=>c.id),sourceSeed:q.seed,events};s.pendingQuestionId=p.solved?null:q.id;s.lastQuestionId=q.id;
  }
  return S.restoreSession(s,bank);
 }
 function getSession(run){const state=run.educationState;return state?.session||legacySession(state||{rng:run.seed,usedIds:[]});}
 function record(run){const q=current(run);return q?getSession(run).records[q.id]:null;}
 function learningView(run){const q=current(run);return q?M.session.selectLearningView(q,record(run)):null;}
 function support(run,kind){const p=pending(run);if(!current(run))throw Error('No question is waiting.');run.educationState.session=S.openSupport(getSession(run),p.questionId,kind);p.hinted=!!getSession(run).records[p.questionId].hintState.hintUsed;return run;}
 function progress(run){
  const session=getSession(run),records={...session.records},credit=row=>({independent:3,supported:2,retry:1}[row?.completion?.category]||0);
  // Reopening a stable ID in a later run cannot erase earlier mastery. Its
  // current attempt still has an independent event stream for combat rewards.
  for(const row of Object.values(session.archivedRecords))if(catalog[row?.questionId]&&credit(row)>credit(records[row.questionId]))records[row.questionId]=row;
  return S.skillProgress({...session,records},bank);
 }
 function validSession(saved,used,pendingTrial){
  try{if(!validIds(saved.exposureIds)||saved.exposureIds.some(id=>!used.includes(id))||!saved.records||Array.isArray(saved.records))return false;
   const restored=S.restoreSession(saved,bank);
   if(JSON.stringify(restored.records)!==JSON.stringify(saved.records)||restored.pendingQuestionId!==saved.pendingQuestionId)return false;
   if(pendingTrial){const r=restored.records[pendingTrial.questionId];
    if(pendingTrial.questionId===null)return !restored.pendingQuestionId;
    return !!r&&JSON.stringify(r.attempts.map(a=>a.choiceId))===JSON.stringify(pendingTrial.attempts)&&r.hintState.hintUsed===pendingTrial.hinted&&(r.status==='correct')===pendingTrial.solved&&(r.status!=='revealed'||S.attemptsExhausted(r))&&restored.pendingQuestionId===(r.status==='pending'?pendingTrial.questionId:null);
   }
   return true;
  }catch(_){return false;}
 }
 function mergeSessions(...values){
  const sessions=values.filter(Boolean).map(s=>S.restoreSession(s,bank));if(!sessions.length)return null;
  let result=copy(sessions[0]);
  for(const s of sessions.slice(1)){
   const records={...result.records};for(const [id,r] of Object.entries(s.records)){
    const old=records[id],extendsOld=old&&old.events.every((e,i)=>JSON.stringify(e)===JSON.stringify(r.events[i]));
    if(!old||s.runIndex>result.runIndex||(s.runIndex===result.runIndex&&((old.status==='pending'&&(r.status!=='pending'||r.events.length>old.events.length))||(old.status!=='pending'&&r.status!=='pending'&&extendsOld&&r.events.length>old.events.length)))){
     if(old&&!extendsOld){const prefix='previous:'+id+':';let n=1;while(result.archivedRecords[prefix+n])n++;result.archivedRecords[prefix+n]=copy(old);}
     records[id]=r;
    }
   }
   // A different abandoned run's reservation remains exposed without assessment
   // credit. Only one pending trial can own input in a session.
   const older=s.runIndex<result.runIndex,newer=s.runIndex>result.runIndex;
   const active=older?result.pendingQuestionId:newer?s.pendingQuestionId:s.pendingQuestionId||result.pendingQuestionId;
   for(const [id,r] of Object.entries(records))if(r.status==='pending'&&id!==active){result.archivedRecords['abandoned:'+id]=r;delete records[id];}
   result={...result,bankVersion:bank.bankVersion,rngState:older?result.rngState:s.rngState,runIndex:Math.max(result.runIndex,s.runIndex),exposureIds:[...new Set([...result.exposureIds,...s.exposureIds])],records,pendingQuestionId:active&&records[active]?.status==='pending'?active:null,lastQuestionId:older?result.lastQuestionId:s.lastQuestionId||result.lastQuestionId,archivedRecords:{...result.archivedRecords,...s.archivedRecords}};
  }
  return S.restoreSession(result,bank);
 }
 const api={upgradeActiveQuestion,failed,coverage,runIds,ensureRunState,reserveForConsumer,retireQuestion,currentConsumer,consumerRecord,consumerLearningView,mergeRunHistory,carryRunQuestions,syncMystery,reserveMystery,resolveMystery,mysterySupport,getSession,record,learningView,support,progress,mergeSessions,bank,catalog,ids,validIds,merge,history,validHistory,prepare,pending,current,select,answer,hint,ready,finish,context,valid};
 if(typeof module!=='undefined')module.exports=api;else root.DCEducation=api;
})(typeof globalThis!=='undefined'?globalThis:this);
