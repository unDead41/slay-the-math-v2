/** Pure learning-session owner. The ordered event log owns attempts and support.
 * No combat RNG, timers, rewards, settings or player-save files are modified.
 */
import {createHintState,reduceHintState} from '../more-hint-state.mjs';
import {selectQuestionView} from '../rich_text/renderer.mjs';
import {selectSupportVisual} from './support-visual.mjs';

export const LEARNING_POLICY=Object.freeze({minimumEvidence:3,recentWindow:3,
  mediumThreshold:0.55,hardThreshold:0.8,assistedCredit:0.6,retryCredit:0.4});
const levels={Easy:1,Medium:2,Hard:3};
const getQuestion=(bank,id)=>bank.questions.find(q=>q.id===id);
const unique=values=>[...new Set(values)];

export function createSession({seed=1}={}) {
  if(!Number.isSafeInteger(seed))throw new Error('A numeric question seed is required');
  return {version:1,bankVersion:null,rngState:(seed>>>0)||1,runIndex:1,
    exposureIds:[],records:{},archivedRecords:{},pendingQuestionId:null,lastQuestionId:null};
}

function projectRecord(question,events) {
  const r={questionId:question.id,choiceOrder:question.choices.map(c=>c.id),sourceSeed:question.seed,
    events:[],attempts:[],hintState:createHintState(question.id),foundationViewed:false,
    stepsViewed:false,status:'pending',completion:null,lastChoiceId:null};
  const attemptIds=new Set();
  for(const event of events) {
    if(!event || typeof event.type!=='string')throw new Error('Invalid learning event');
    if(event.type==='STEPS_TOGGLED') {
      if(r.status!=='pending'){r.stepsViewed=!r.stepsViewed;r.events.push({type:event.type});}
      continue;
    }
    if(r.status!=='pending')continue;
    if(event.type==='HINT_REVEALED') {
      if(!r.hintState.hintUsed){r.hintState=reduceHintState(r.hintState,{type:event.type,questionId:question.id});r.events.push({type:event.type});}
    } else if(event.type==='MORE_HINT_OPENED') {
      if(r.hintState.moreHintUnlocked&&!r.hintState.moreHintViewed){r.hintState=reduceHintState(r.hintState,{type:event.type,questionId:question.id});r.events.push({type:event.type});}
    } else if(event.type==='FOUNDATION_OPENED') {
      if(!r.foundationViewed){r.foundationViewed=true;r.events.push({type:event.type});}
    } else if(event.type==='FINAL_REVEALED') {
      r.status='revealed';r.completion={category:'revealed',correct:false};r.events.push({type:event.type});
    } else if(event.type==='ANSWER_SUBMITTED') {
      if(typeof event.attemptId!=='string'||!event.attemptId.trim())throw new Error('A unique attempt ID is required');
      if(attemptIds.has(event.attemptId))continue;
      if(!question.choices.some(c=>c.id===event.choiceId))throw new Error('Unknown choice ID');
      attemptIds.add(event.attemptId);
      const correct=event.choiceId===question.correctChoiceId;
      const supported=r.foundationViewed||r.hintState.hintUsed||r.hintState.moreHintViewed;
      r.attempts.push({id:event.attemptId,choiceId:event.choiceId,correct,
        hintUsed:r.hintState.hintUsed,moreHintViewed:r.hintState.moreHintViewed,foundationViewed:r.foundationViewed});
      r.lastChoiceId=event.choiceId;
      r.hintState=reduceHintState(r.hintState,{type:event.type,questionId:question.id,correct});
      r.events.push({type:event.type,attemptId:event.attemptId,choiceId:event.choiceId});
      if(correct){r.status='correct';r.completion={correct:true,
        category:supported?'supported':r.attempts.length===1?'independent':'retry',
        firstAttemptCorrect:r.attempts.length===1};}
    } else throw new Error('Unknown learning event: '+event.type);
  }
  return r;
}

function commit(session,question,event) {
  const previous=session.records[question.id];
  if(!previous)throw new Error('Question has not been reserved');
  const record=projectRecord(question,[...previous.events,event]);
  return {...session,records:{...session.records,[question.id]:record},
    pendingQuestionId:session.pendingQuestionId===question.id?(record.status==='pending'?question.id:null):session.pendingQuestionId,
    lastQuestionId:session.pendingQuestionId&&session.pendingQuestionId!==question.id?session.lastQuestionId:question.id};
}

function recordCredit(r) {
  if(r.completion?.category==='independent')return 1;
  if(r.completion?.category==='supported')return LEARNING_POLICY.assistedCredit;
  if(r.completion?.category==='retry')return LEARNING_POLICY.retryCredit;
  return 0;
}

export function skillProgress(session,bank) {
  const catalog=bank.learningSupport?.features?.skills || [];
  const ids=unique([...catalog.map(s=>s.id),...bank.questions.flatMap(q=>q.learning?.skillIds||[])]);
  return ids.map(skillId=>{
    const qs=bank.questions.filter(q=>q.learning?.skillIds.includes(skillId));
    const rows=qs.map(q=>session.records[q.id]).filter(Boolean);
    const closed=rows.filter(r=>r.status!=='pending');
    const count=category=>closed.filter(r=>r.completion?.category===category).length;
    return {skillId,label:catalog.find(s=>s.id===skillId)?.label||skillId,totalQuestions:qs.length,
      seen:qs.filter(q=>session.exposureIds.includes(q.id)).length,completed:closed.length,correct:closed.filter(r=>r.status==='correct').length,
      independentFirstTry:count('independent'),correctWithSupport:count('supported'),correctAfterRetry:count('retry'),revealed:count('revealed'),
      firstAttemptCorrect:closed.filter(r=>r.completion?.firstAttemptCorrect).length,
      wrongAttempts:rows.reduce((n,r)=>n+r.attempts.filter(a=>!a.correct).length,0),
      evidenceScore:closed.length?closed.reduce((n,r)=>n+recordCredit(r),0)/closed.length:null,
      status:closed.length<LEARNING_POLICY.minimumEvidence?'Building evidence':'Practice progress'};
  });
}

function dedicatedRandom(state) {
  const next=(state+0x6D2B79F5)>>>0;
  let t=next;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);
  return {state:next,value:((t^(t>>>14))>>>0)/4294967296};
}

export function reserveNext(session,bank,{topicCode=null}={}) {
  if(session.pendingQuestionId){
    const question=getQuestion(bank,session.pendingQuestionId);
    if(!question)throw new Error('Pending question is missing from this bank');
    return {session,question,reason:'resume'};
  }
  const used=new Set(session.exposureIds);
  const available=bank.questions.filter(q=>!used.has(q.id)&&(!topicCode||q.topicCode===topicCode));
  if(!available.length)return {session,question:null,reason:'exhausted'};
  const recent=session.exposureIds.map(id=>session.records[id]).filter(r=>r&&r.status!=='pending'&&(!topicCode||getQuestion(bank,r.questionId)?.topicCode===topicCode)).slice(-LEARNING_POLICY.recentWindow);
  const score=recent.length?recent.reduce((n,r)=>n+recordCredit(r),0)/recent.length:0;
  const desired=recent.length<LEARNING_POLICY.minimumEvidence?1:score>=LEARNING_POLICY.hardThreshold?3:score>=LEARNING_POLICY.mediumThreshold?2:1;
  const progress=new Map(skillProgress(session,bank).map(p=>[p.skillId,p]));
  const ranked=available.map(q=>{
    const skillIds=q.learning?.skillIds||[];
    const weakness=skillIds.length?skillIds.reduce((n,id)=>n+(1-(progress.get(id)?.evidenceScore??0.5)),0)/skillIds.length:0.5;
    return {q,distance:Math.abs(levels[q.difficulty]-desired),weakness};
  });
  const distance=Math.min(...ranked.map(x=>x.distance));
  const near=ranked.filter(x=>x.distance===distance);
  const weakness=Math.max(...near.map(x=>x.weakness));
  const candidates=near.filter(x=>Math.abs(x.weakness-weakness)<1e-9);
  const random=dedicatedRandom(session.rngState);
  const question=candidates[Math.floor(random.value*candidates.length)].q;
  const record=projectRecord(question,[]);
  const next={...session,bankVersion:bank.bankVersion,rngState:random.state,
    exposureIds:[...session.exposureIds,question.id],records:{...session.records,[question.id]:record},
    pendingQuestionId:question.id,lastQuestionId:question.id};
  return {session:next,question,reason:'new',targetDifficulty:['Easy','Medium','Hard'][desired-1]};
}

export function submitAnswer(session,bank,{questionId,choiceId,attemptId}) {
  const q=getQuestion(bank,questionId);if(!q)throw new Error('Unknown question ID');
  const r=session.records[questionId];
  if(r?.attempts.some(a=>a.id===attemptId))return session;
  if(session.pendingQuestionId!==questionId)throw new Error('Only the pending question accepts an answer');
  return commit(session,q,{type:'ANSWER_SUBMITTED',choiceId,attemptId});
}

export function openSupport(session,questionId,kind) {
  const record=session.records[questionId];if(!record)throw new Error('Unknown reserved question');
  const types={hint:'HINT_REVEALED',moreHint:'MORE_HINT_OPENED',foundation:'FOUNDATION_OPENED',steps:'STEPS_TOGGLED'};
  if(!types[kind])throw new Error('Unknown support kind');
  if(record.status==='pending' && session.pendingQuestionId!==questionId)throw new Error('Support belongs to a different pending question');
  // No source bank is needed for support-only transitions; existing choice IDs remain frozen.
  const q={id:questionId,seed:record.sourceSeed,choices:record.choiceOrder.map(id=>({id})),
    correctChoiceId:record.attempts.find(a=>a.correct)?.choiceId??null};
  return commit(session,q,{type:types[kind]});
}

export function revealAnswer(session,questionId) {
  const record=session.records[questionId];
  if(!record || session.pendingQuestionId!==questionId)throw new Error('Only the pending question can be retired');
  const q={id:questionId,seed:record.sourceSeed,choices:record.choiceOrder.map(id=>({id})),correctChoiceId:null};
  return commit(session,q,{type:'FINAL_REVEALED'});
}

export function startNewRun(session){return {...session,runIndex:session.runIndex+1};}

export function restoreSession(saved,bank) {
  if(!saved||saved.version!==1||!Array.isArray(saved.exposureIds)||!saved.records||typeof saved.records!=='object')throw new Error('Unsupported or damaged learning save; preserve the original save');
  if(!saved.exposureIds.every(id=>typeof id==='string'&&id))throw new Error('Invalid exposure history');
  if(!Number.isSafeInteger(saved.rngState)||saved.rngState<0||saved.rngState>0xFFFFFFFF)throw new Error('Invalid question RNG state');
  const session={...createSession({seed:saved.rngState}),bankVersion:bank.bankVersion,
    rngState:saved.rngState,exposureIds:unique(saved.exposureIds),runIndex:Number.isSafeInteger(saved.runIndex)&&saved.runIndex>0?saved.runIndex:1,
    archivedRecords:{...(saved.archivedRecords||{})},lastQuestionId:saved.lastQuestionId||null};
  for(const [id,row] of Object.entries(saved.records)) {
    const q=getQuestion(bank,id);
    if(!q){session.archivedRecords[id]=row;continue;}
    if(!session.exposureIds.includes(id)||!Array.isArray(row.events)||row.events.length>10000)throw new Error('Invalid learning event history');
    if(JSON.stringify(row.choiceOrder)!==JSON.stringify(q.choices.map(c=>c.id))||row.sourceSeed!==q.seed)throw new Error('Saved choices do not match the current question');
    session.records[id]=projectRecord(q,row.events);
  }
  const pending=Object.values(session.records).filter(r=>r.status==='pending');
  if(pending.length>1)throw new Error('More than one pending question in the saved history');
  if(saved.pendingQuestionId&&!getQuestion(bank,saved.pendingQuestionId))throw new Error('The saved pending question is unavailable');
  session.pendingQuestionId=pending[0]?.questionId||null;
  return session;
}

export function selectLearningView(question,record,{finalReview=false}={}) {
  const valid=record?.questionId===question.id;
  const closed=valid&&record.status!=='pending';
  const base=selectQuestionView(question,valid?record.hintState:null,{finalReview:finalReview||closed});
  return {...base,feedback:valid&&record.lastChoiceId?question.learning.optionFeedback[record.lastChoiceId]:null,
    workedSteps:(closed||finalReview)&&record?.stepsViewed?question.learning.workedSteps:null,
    visual:closed||finalReview?question.learning.visual.solution:valid&&record.hintState.hintUsed?selectSupportVisual(question):null,
    closed:closed||finalReview};
}
