import {sharedRichText,configureRichText} from '../../STM_SHARED/index.mjs';
export {configureRichText};
/** One integration entry. Uses the existing session owner and the game's save callback. */
import {
  createSession, restoreSession, reserveNext, submitAnswer, openSupport,
  revealAnswer, startNewRun, skillProgress, selectLearningView
} from '../learning/session.mjs';
export {renderRichText, attachRichTextTooltips} from '../rich_text/renderer.mjs';
export {renderVisual} from '../learning/visual-renderer.mjs';
export {LEARNING_POLICY} from '../learning/session.mjs';

const EXPECTED_SHARED_REGISTRY_ID=/* STM_SHARED_REGISTRY_ID */'881ed46c93d9444d01853bf2056a09e5216a8b5278ecb3aacdb069ca21818201';
export const PACKAGE_VERSION='1.5.0';
const copy=value=>JSON.parse(JSON.stringify(value));
const isObject=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const SUPPORT_KINDS=new Set(['hint','moreHint','foundation','steps']);

export function validateQuestionBankBundle({bank,glossary,foundations}={}) {
  const issues=[];
  const require=(condition,message)=>{if(!condition)issues.push(message);};
  require(bank?.schemaVersion===1,'The bank must use schemaVersion 1.');
  require(Array.isArray(bank?.questions)&&bank.questions.length>0,'Load question-bank-form4-120.json.');
  require(isObject(glossary?.entries),'Load rich_text/glossary.json, the presentation registry.');
  require(Array.isArray(foundations?.modules),'Load learning/foundations.json.');
  const questions=Array.isArray(bank?.questions)?bank.questions:[];
  const modules=Array.isArray(foundations?.modules)?foundations.modules:[];
  const suppliedSkills=bank?.learningSupport?.features?.skills;
  const skills=Array.isArray(suppliedSkills)?suppliedSkills:[];
  require(skills.length>0,'The bank is missing learning features. Use the consolidated bank instead of the 1.0 bank.');
  require(bank?.totalQuestions===questions.length,'totalQuestions does not match the question list.');
  const moduleIds=new Set(modules.map(m=>m?.id)),skillIds=new Set((skills||[]).map(s=>s?.id));
  require(moduleIds.size===modules.length,'Duplicate foundation IDs.');
  require(skillIds.size===(skills||[]).length,'Duplicate skill IDs.');
  const ids=new Set(),choiceIds=new Set();
  for(const q of questions) {
    if(!isObject(q)){issues.push('Invalid question record.');continue;}
    require(typeof q.id==='string'&&!ids.has(q.id),'Missing or duplicate question ID: '+q.id);ids.add(q.id);
    require(Number.isSafeInteger(q.seed),q.id+': invalid source seed.');
    require(bank?.topics?.[q.topicCode]?.topicId===q.topicId,q.id+': topic ID/code mismatch.');
    const choices=Array.isArray(q.choices)?q.choices.filter(isObject):[];
    require(choices.length===4,q.id+': four choices are required.');
    for(const c of choices){require(typeof c.id==='string'&&!choiceIds.has(c.id),q.id+': duplicate choice ID.');choiceIds.add(c.id);}
    const correct=choices.find(c=>c.id===q.correctChoiceId);
    require(!!correct&&correct.label===q.correctLabel,q.id+': answer ID/letter mismatch.');
    require(Array.isArray(q.themedRichText?.prompt)&&isObject(q.themedRichText?.choices),q.id+': artifact rich text is missing.');
    require(Array.isArray(q.hintSteps)&&q.hintSteps.length===2&&typeof q.moreHint==='string',q.id+': Hint/More Hint is missing.');
    for(const id of q.themedGlossaryIds||[])require(!!glossary?.entries?.[id],q.id+': unknown presentation term '+id);
    const learning=q.learning;
    require(!!learning,q.id+': learning extension is missing.');
    if(!learning)continue;
    require(moduleIds.has(learning.foundationId),q.id+': unknown foundation.');
    require(Array.isArray(learning.skillIds)&&learning.skillIds.length>0&&learning.skillIds.every(id=>skillIds.has(id)),q.id+': unknown skill.');
    require(Array.isArray(learning.workedSteps)&&learning.workedSteps.length===3,q.id+': three worked steps are required.');
    require(isObject(learning.optionFeedback)&&Object.keys(learning.optionFeedback).length===choices.length,q.id+': feedback choice coverage differs.');
    for(const c of choices){
      const feedback=learning.optionFeedback?.[c.id];
      require(feedback?.choiceSourceText===c.text&&feedback.kind===(c.id===q.correctChoiceId?'correct':'retry'),q.id+': feedback binding differs for '+c.id);
      require(Array.isArray(q.themedRichText?.choices?.[c.id]),q.id+': missing choice rich text.');
    }
    for(const phase of ['hint','solution'])require(['venn','table','flow','pool'].includes(learning.visual?.[phase]?.kind),q.id+': missing '+phase+' visual.');
  }
  for(const module of modules){
    require(typeof module?.id==='string'&&Array.isArray(module.cards)&&module.cards.length===3,'Invalid foundation cards.');
    require(Array.isArray(module?.checks)&&module.checks.length===2,'Invalid foundation practice checks.');
    for(const check of module?.checks||[])require(Array.isArray(check.choices)&&Number.isInteger(check.correctIndex)&&check.correctIndex>=0&&check.correctIndex<check.choices.length,'Invalid practice answer in '+module.id);
  }
  if(issues.length){const error=new Error('Question bank preflight failed: '+issues.slice(0,12).join(' '));error.code='QB_INVALID_BUNDLE';error.issues=issues;throw error;}
  return {packageVersion:PACKAGE_VERSION,bankVersion:bank.bankVersion,questions:questions.length,
    skills:skillIds.size,foundationModules:moduleIds.size,presentationTerms:Object.keys(glossary.entries).length};
}

export function createQuestionBankRuntime({bank,glossary,foundations,savedSession=null,seed=127031,persist}={}) {
  validateQuestionBankBundle({bank,glossary,foundations});
  if(sharedRichText.version!=='1.0.0'||sharedRichText.registryId!==EXPECTED_SHARED_REGISTRY_ID)throw new Error('Use the matched STM_SHARED service for Question Bank 1.5.');
  sharedRichText.assertDomain('question-bank',glossary);
  if(typeof persist!=='function')throw new Error('Pass persist(session) using the existing game save owner. It must reject if saving fails.');
  // Detach from imported JSON so callers cannot modify the active bank or save by alias.
  const source=copy(bank),foundationModules=copy(foundations.modules);
  let session=savedSession===null?createSession({seed}):restoreSession(copy(savedSession),source);
  let queue=Promise.resolve();
  const question=id=>source.questions.find(q=>q.id===id);
  const activeId=state=>state.pendingQuestionId||(state.records[state.lastQuestionId]&&question(state.lastQuestionId)?state.lastQuestionId:null);
  function view(state,id=activeId(state)) {
    if(!id)return null;
    const q=question(id),record=state.records[id];
    if(!q||!record)throw new Error('Question has not been reserved in this session: '+id);
    const visible=selectLearningView(q,record);
    return {...visible,question:{id:q.id,topicId:q.topicId,topicCode:q.topicCode,topic:q.topic,
      difficulty:q.difficulty,seed:q.seed,curriculumStandards:q.curriculumStandards,
      choices:q.choices.map(c=>({id:c.id,label:c.label,text:c.text}))},
      status:record.status,lastChoiceId:record.lastChoiceId,
      support:{hintUsed:record.hintState.hintUsed,moreHintUnlocked:record.hintState.moreHintUnlocked,
        moreHintViewed:record.hintState.moreHintViewed,foundationViewed:record.foundationViewed,stepsViewed:record.stepsViewed},
      plainText:{prompt:q.prompt,hint:record.hintState.hintUsed?q.hint:null,
        moreHint:record.hintState.moreHintUnlocked?q.moreHint:null,explanation:visible.closed?q.explanation:null}};
  }
  function transaction(reduce) {
    const operation=queue.then(async()=>{
      const {next,value}=reduce(session);
      if(JSON.stringify(next)!==JSON.stringify(session)){
        // Nothing becomes visible in memory until the game's durable commit succeeds.
        await persist(copy(next));
        session=next;
      }
      return copy(value);
    });
    queue=operation.catch(()=>{});
    return operation;
  }
  function normalizedTopic({topicCode=null,topicId=null}={}) {
    const mapped=topicId?Object.keys(source.topics).find(code=>source.topics[code].topicId===topicId):null;
    if(topicId&&!mapped)throw new Error('Unknown topic ID: '+topicId);
    if(topicCode&&!source.topics[topicCode])throw new Error('Unknown topic code: '+topicCode);
    if(topicCode&&mapped&&topicCode!==mapped)throw new Error('Topic ID and code refer to different topics.');
    return topicCode||mapped;
  }
  return Object.freeze({
    next(options={}) {
      return transaction(state=>{
        const selected=reserveNext(state,source,{topicCode:normalizedTopic(options)});
        return {next:selected.session,value:{reason:selected.reason,questionId:selected.question?.id||null,
          targetDifficulty:selected.targetDifficulty||null,view:selected.question?view(selected.session,selected.question.id):null}};
      });
    },
    submit({questionId,choiceId,attemptId}={}) {
      return transaction(state=>{
        const before=state.records[questionId];
        const duplicate=!!before?.attempts.some(a=>a.id===attemptId);
        const next=submitAnswer(state,source,{questionId,choiceId,attemptId});
        const record=next.records[questionId];
        return {next,value:{accepted:!duplicate,duplicate,correct:duplicate?null:record.attempts.at(-1).correct,
          completedNow:!duplicate&&before.status==='pending'&&record.status!=='pending',
          completion:record.completion?.category||null,view:view(next,questionId)}};
      });
    },
    openSupport({questionId,kind}={}) {
      return transaction(state=>{
        if(!SUPPORT_KINDS.has(kind))throw new Error('Unknown support kind: '+kind);
        const next=openSupport(state,questionId,kind);
        return {next,value:view(next,questionId)};
      });
    },
    reveal({questionId}={}) {
      return transaction(state=>{const next=revealAnswer(state,questionId);return {next,value:view(next,questionId)};});
    },
    startNewRun() {
      return transaction(state=>{const next=startNewRun(state);return {next,value:{runIndex:next.runIndex,view:view(next)}};});
    },
    getView(questionId){return copy(view(session,questionId));},
    getLegacyView(questionId) {
      const current=view(session,questionId);if(!current)return null;
      const q=question(current.question.id);
      return copy({...current.question,prompt:q.prompt,answerType:q.answerType,
        hint:current.plainText.hint,moreHint:current.plainText.moreHint,explanation:current.plainText.explanation,
        correctChoiceId:current.closed?q.correctChoiceId:null,correctLabel:current.closed?q.correctLabel:null,
        status:current.status});
    },
    getFoundation(questionId=activeId(session)) {
      if(!questionId)return null;
      const record=session.records[questionId];
      if(!record||(!record.foundationViewed&&record.status==='pending'))return null;
      return copy(foundationModules.find(m=>m.id===question(questionId).learning.foundationId));
    },
    progress() {
      const counts={independent:0,supported:0,retry:0,revealed:0};
      for(const record of Object.values(session.records))if(record.completion)counts[record.completion.category]++;
      return copy({seenCurrentBank:session.exposureIds.filter(id=>!!question(id)).length,
        seenHistorical:session.exposureIds.length,completed:Object.values(counts).reduce((a,b)=>a+b,0),
        counts,skills:skillProgress(session,source)});
    },
    snapshot(){return copy(session);}
  });
}
