(function(root){
 'use strict';
 const bank=typeof module!=='undefined'?require('./question-data.js'):root.DCQuestionBank;
 const catalog=Object.fromEntries(bank.questions.map(q=>[q.id,q]));
 const integer=n=>Number.isSafeInteger(n)&&n>=0;
 const copy=x=>JSON.parse(JSON.stringify(x));
 const ids=bank.questions.map(q=>q.id);
 const kinds=['starting','elite','mystery','boss'];
 function validIds(list){return Array.isArray(list)&&list.length<=bank.total&&new Set(list).size===list.length&&list.every(id=>Object.hasOwn(catalog,id));}
 function merge(...lists){for(const list of lists)if(!validIds(list))throw new Error('Question history is not valid. Your current progress has been kept.');const seen=new Set(lists.flat());return ids.filter(id=>seen.has(id));}
 function validHistory(history){return !!history&&history.version===1&&history.bankVersion===bank.version&&validIds(history.usedIds);}
 function history(usedIds=[]){return {version:1,bankVersion:bank.version,usedIds:merge(usedIds)};}
 function random(state){state.rng=(Math.imul(state.rng,1664525)+1013904223)>>>0;return state.rng/4294967296;}
 function prepare(run,artifactId,seen=[]){
  const offer=run.artifactState?.offer;
  if(run.scene==='education'||run.educationState?.pending||!offer?.ready||!offer.ids.includes(artifactId))throw new Error('Choose one of the offered artifacts.');
  const state=run.educationState?copy(run.educationState):{version:1,bankVersion:bank.version,rng:(run.seed^0x6d617468)>>>0,usedIds:[],completed:[],pending:null};
  state.usedIds=merge(state.usedIds,seen);
  const remaining=bank.questions.filter(q=>!state.usedIds.includes(q.id));
  const topics=Object.keys(bank.topics).filter(code=>remaining.some(q=>q.topicCode===code));
  let question=null,order=[];
  if(topics.length){
   const topic=topics[Math.floor(random(state)*topics.length)],pool=remaining.filter(q=>q.topicCode===topic);
   question=pool[Math.floor(random(state)*pool.length)];order=question.choices.map(c=>c.id);
   for(let i=order.length-1;i>0;i--){const j=Math.floor(random(state)*(i+1));[order[i],order[j]]=[order[j],order[i]];}
   state.usedIds=merge(state.usedIds,[question.id]);
  }
  state.pending={kind:offer.kind,source:offer.source,artifactId,questionId:question?.id||null,choiceOrder:order,selectedId:null,attempts:[],hinted:false,solved:false};
  return state;
 }
 function pending(run){if(run.scene!=='education'||!run.educationState?.pending)throw new Error('No artifact question is waiting.');return run.educationState.pending;}
 function current(run){return catalog[run.educationState?.pending?.questionId]||null;}
 function select(run,id){const p=pending(run),q=current(run);if(!q||p.solved||!p.choiceOrder.includes(id)||p.attempts.includes(id))throw new Error('Choose an answer that is still available.');p.selectedId=id;return run;}
 function answer(run){
  const p=pending(run),q=current(run);
  if(!q||p.solved||!p.selectedId||p.attempts.includes(p.selectedId))throw new Error('Select an answer before checking it.');
  p.attempts.push(p.selectedId);p.solved=p.selectedId===q.correctChoiceId;
  if(!p.solved)p.selectedId=null;
  return {correct:p.solved,first:p.solved&&p.attempts.length===1&&!p.hinted};
 }
 function hint(run){const p=pending(run);if(!current(run)||p.solved)throw new Error('No hint is needed for this question.');p.hinted=true;return run;}
 function ready(run){const p=pending(run);return p.questionId===null||p.solved;}
 function finish(run){
  const p=pending(run);if(!ready(run))throw new Error('Answer the question correctly before continuing.');
  run.educationState.completed.push({source:p.source,artifactId:p.artifactId,kind:p.kind,questionId:p.questionId,attempts:p.attempts.length,hinted:p.hinted,first:p.solved&&p.attempts.length===1&&!p.hinted});
  run.educationState.pending=null;return p;
 }
 function context(run){const p=run.educationState?.pending;return run.scene==='education'&&p?{...run,scene:{starting:'master',elite:'reward',mystery:'event',boss:'stageclear'}[p.kind]}:run;}
 function valid(run){
  const state=run.educationState;
  if(state===undefined)return run.scene!=='education';
  if(!state||state.version!==1||state.bankVersion!==bank.version||run.mode!=='challenge'||!integer(state.rng)||state.rng>4294967295||!validIds(state.usedIds)||!Array.isArray(state.completed)||state.completed.length>31)return false;
  const acquired=run.artifactState?.acquired;
  if(!Array.isArray(acquired)||new Set(state.completed.map(x=>x?.source)).size!==state.completed.length)return false;
  const completedIds=state.completed.map(x=>x?.questionId).filter(Boolean);if(new Set(completedIds).size!==completedIds.length)return false;
  for(const record of state.completed){
   if(!record||!kinds.includes(record.kind)||!acquired.some(x=>x.source===record.source&&x.id===record.artifactId)||!integer(record.attempts)||record.attempts>4||typeof record.hinted!=='boolean'||typeof record.first!=='boolean')return false;
   if(record.questionId===null){if(record.attempts||record.hinted||record.first)return false;}
   else if(!catalog[record.questionId]||!state.usedIds.includes(record.questionId)||!record.attempts||(record.first&&(record.hinted||record.attempts!==1)))return false;
  }
  if(!state.pending)return run.scene!=='education';
  const p=state.pending,offer=run.artifactState?.offer;
  if(run.scene!=='education'||!p||!kinds.includes(p.kind)||!offer?.ready||offer.kind!==p.kind||offer.source!==p.source||!offer.ids.includes(p.artifactId)||state.completed.some(x=>x.source===p.source)||typeof p.hinted!=='boolean'||typeof p.solved!=='boolean'||!Array.isArray(p.attempts)||p.attempts.length>4||new Set(p.attempts).size!==p.attempts.length||!Array.isArray(p.choiceOrder))return false;
  if(p.questionId===null)return state.usedIds.length===bank.total&&!p.choiceOrder.length&&p.selectedId===null&&!p.attempts.length&&!p.hinted&&!p.solved;
  const q=catalog[p.questionId];
  if(!q||completedIds.includes(q.id)||!state.usedIds.includes(q.id)||p.choiceOrder.length!==4||new Set(p.choiceOrder).size!==4||p.choiceOrder.some(id=>!q.choices.some(c=>c.id===id))||p.attempts.some(id=>!p.choiceOrder.includes(id))||(p.selectedId!==null&&!p.choiceOrder.includes(p.selectedId)))return false;
  const correctAt=p.attempts.indexOf(q.correctChoiceId);
  if(p.solved)return correctAt===p.attempts.length-1&&correctAt>=0&&p.selectedId===q.correctChoiceId;
  return correctAt===-1&&(p.selectedId===null||!p.attempts.includes(p.selectedId));
 }
 const api={bank,catalog,ids,validIds,merge,history,validHistory,prepare,pending,current,select,answer,hint,ready,finish,context,valid};
 if(typeof module!=='undefined')module.exports=api;else root.DCEducation=api;
})(typeof globalThis!=='undefined'?globalThis:this);
