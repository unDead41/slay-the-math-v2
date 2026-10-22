(function(root){'use strict';
 const C=typeof module!=='undefined'?require('./config.js'):root.DCConfig;
 const Q=typeof module!=='undefined'?require('./education.js'):root.DCEducation;
 const S=(typeof module!=='undefined'?require('./mechanics.js'):root.STMMechanics).session;
 const Log=typeof module!=='undefined'?require('./combat-log.js'):root.DCCombatLog;
 const integer=n=>Number.isSafeInteger(n)&&n>=0;
 function pending(r){const p=r.battle?.question;if(r.scene!=='battle'||p?.source!=='bank')throw Error('No active bank prediction.');return p;}
 function forecast(r,seen=[],profile=null){
  if(r.scene!=='battle')throw Error('No active battle.');const b=r.battle;
  if(b.cardChoice)throw Error('Finish the card choice first.');if(b.question)return b.question;
  if(b.forecastUsed)throw Error('Predict was already used this turn.');
  const result=Q.reserveForConsumer(r,'predict',seen,profile),q=result.question,e=C.enemies[b.enemyId];
  b.question={source:'bank',questionId:q?.id||null,choiceOrder:q?q.choices.map(c=>c.id):[],selectedId:null,attempts:[],hinted:false,solved:false,first:false,seal:e.boss&&b.seals<e.seals.length?b.seals:null,exhausted:!q,unscored:!q};
  return b.question;
 }
 function select(r,id){const p=pending(r);if(p.exhausted||p.solved||!p.choiceOrder.includes(id)||p.attempts.includes(id))throw Error('Choose an answer that is still available.');p.selectedId=id;return r;}
 function answer(r,ctx){
  const p=pending(r),q=Q.catalog[p.questionId],b=r.battle;
  if(!q||p.solved||!p.selectedId||p.attempts.includes(p.selectedId))throw Error('Select an answer before checking it.');
  r.educationState.session=S.submitAnswer(Q.getSession(r),Q.bank,{questionId:q.id,choiceId:p.selectedId,attemptId:q.id+':predict:'+(p.attempts.length+1)});
  p.attempts.push(p.selectedId);p.solved=p.selectedId===q.correctChoiceId;
  if(!p.solved){r.stats.wrong++;p.selectedId=null;return {valid:true,correct:false,scored:true,first:false,message:'Try again. Check the question and use Hint if needed.'};}
  p.first=Q.consumerRecord(r).completion.category==='independent';b.forecastUsed=true;r.stats.forecasts++;
  const st=r.stats.concepts[q.topicCode]||(r.stats.concepts[q.topicCode]={total:0,first:0,assisted:0});st.total++;
  const before=b.focus;if(p.first){b.focus=Math.min(C.FOCUS_CAP,b.focus+1);r.stats.firstCorrect++;st.first++;}else{r.stats.assisted++;st.assisted++;}
  const opened=p.seal!==null&&p.seal===b.seals;if(opened)b.seals++;
  const message=p.first?'Correct! +'+(b.focus-before)+' Focus'+(b.focus===C.FOCUS_CAP?' (cap '+C.FOCUS_CAP+')':'')+'.':'Correct. Saved as a guided answer.';
  ctx.notify(r,message);Log?.record(r,{actor:'player',kind:'predict',source:q.id,label:'Predict',summary:message+(opened?' Boss seal opened.':''),key:'predict:'+b.turn,values:{questionId:q.id,first:p.first,focusGained:b.focus-before,sealOpened:opened,scored:true}});
  return {valid:true,correct:true,first:p.first,scored:true,focusGained:b.focus-before,sealOpened:opened,message};
 }
 function support(r,kind){
  const p=pending(r);if(p.exhausted)throw Error('All 120 questions have been seen in this run.');
  const before=Q.consumerRecord(r)?.hintState.hintUsed;r.educationState.session=S.openSupport(Q.getSession(r),p.questionId,kind);
  p.hinted=!!Q.consumerRecord(r)?.hintState.hintUsed;
  if(!before&&p.hinted)r.stats.hintsUsed=(r.stats.hintsUsed||0)+1;return r;
 }
 function completeExhausted(r,ctx){
  const p=pending(r),b=r.battle;if(!p.exhausted||p.solved)throw Error('No bank-exhaustion completion is waiting.');
  p.solved=true;b.forecastUsed=true;const opened=p.seal!==null&&p.seal===b.seals;if(opened)b.seals++;
  const message='All 120 questions have been seen in this run. Unscored completion'+(opened?' opened one boss seal':'')+'; no Focus or learning credit.';
  ctx.notify(r,message);Log?.record(r,{actor:'player',kind:'predict-exhausted',source:'question-bank',label:'Predict',summary:message,key:'predict:'+b.turn,values:{exhausted:true,scored:false,focusGained:0,sealOpened:opened}});
  return {valid:true,correct:false,first:false,scored:false,exhausted:true,unscored:true,focusGained:0,sealOpened:opened,message};
 }
 function close(r){const p=pending(r);if(!p.solved){if(p.questionId)Q.retireQuestion(r,p.questionId);Log?.record(r,{actor:'player',kind:'predict-abandoned',source:p.questionId||'question-bank',label:'Predict',summary:'Predict closed without a reward or boss seal.',key:'predict:'+r.battle.turn,values:{scored:false,focusGained:0,sealOpened:false}});}r.battle.forecastUsed=true;r.battle.question=null;return r;}
 function valid(r){
  const b=r.battle,p=b?.question;if(p?.source!=='bank')return true;const e=C.enemies[b.enemyId];
  if(!e||!Array.isArray(p.choiceOrder)||!Array.isArray(p.attempts)||p.attempts.length>4||new Set(p.attempts).size!==p.attempts.length||!['hinted','solved','first','exhausted','unscored'].every(k=>typeof p[k]==='boolean')||(p.seal!==null&&(!integer(p.seal)||!e.boss||p.seal>=e.seals.length))||p.solved!==b.forecastUsed)return false;
  if(p.exhausted)return p.unscored&&p.questionId===null&&(r.educationState?.runUsedIds||[]).length===Q.bank.total&&!p.choiceOrder.length&&!p.attempts.length&&p.selectedId===null&&!p.hinted&&!p.first&&(p.seal===null||b.seals===p.seal+(p.solved?1:0));
  const q=Q.catalog[p.questionId],rec=r.educationState?.session?.records[p.questionId];
  if(p.unscored||!q||!rec||!r.educationState.runUsedIds?.includes(q.id)||JSON.stringify(p.choiceOrder)!==JSON.stringify(q.choices.map(c=>c.id))||JSON.stringify(p.attempts)!==JSON.stringify(rec.attempts.map(a=>a.choiceId))||p.hinted!==rec.hintState.hintUsed||p.solved!==(rec.status==='correct')||rec.status==='revealed'||p.first!==(rec.completion?.category==='independent')||(p.selectedId!==null&&!p.choiceOrder.includes(p.selectedId)))return false;
  return p.solved?p.selectedId===q.correctChoiceId&&(p.seal===null||b.seals===p.seal+1):!p.attempts.includes(p.selectedId)&&(p.seal===null||b.seals===p.seal);
 }
 const api={forecast,select,answer,support,completeExhausted,close,valid};if(typeof module!=='undefined')module.exports=api;else root.DCCombatPredict=api;
})(typeof globalThis!=='undefined'?globalThis:this);
