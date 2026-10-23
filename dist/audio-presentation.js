(function(root){
'use strict';
const sequences={dungeonMaster:['vo_dm_01','vo_dm_02','vo_dm_03','vo_dm_04'],merchant:['vo_shop_01','vo_shop_02','vo_shop_03']};
const registry=root.DCAudioAssets||(typeof module!=='undefined'?require('./music-data.js').assets:{});
const pools=registry.voicePools||{},events=registry.voiceEvents||{};
const priorities={question:40,hint:80,more_hint:80,correct:90,wrong:90,rest:50,card_reward:50,defeat:100,mystery:60};
const live=new WeakMap(),restActions=new WeakMap(),observedQuestions=new WeakMap(),legacyQuestions=new WeakMap(),MAX_ALYSSA=512;
const MAX_RECORDS=128;
const object=value=>value&&typeof value==='object'&&!Array.isArray(value);
const count=value=>Number.isSafeInteger(value)&&value>=0?value:0;
const selectedVoice=(speaker,visit)=>sequences[speaker][Math.min(visit,sequences[speaker].length)-1];
const empty=()=>({version:1,visits:{dungeonMaster:0,merchant:0},encounters:{}});
const safeKey=key=>typeof key==='string'&&key.length>0&&key.length<=360&&!/[\x00-\x1f\x7f]/.test(key);
function normalizeAlyssa(value){
 const out={rng:Number.isInteger(value?.rng)&&value.rng>=0&&value.rng<=4294967295?value.rng:0x766f6963,bags:{},handled:{}};
 if(!object(value))return out;
 for(const group of Object.keys(priorities)){
  const bag=value.bags?.[group],ids=pools[group];
  if(!object(bag)||!ids||!Array.isArray(bag.remaining)||bag.remaining.length>ids.length||new Set(bag.remaining).size!==bag.remaining.length||bag.remaining.some(id=>!ids.includes(id))||(bag.last!==null&&!ids.includes(bag.last)))continue;
  out.bags[group]={remaining:bag.remaining.slice(),last:bag.last};
 }
 if(object(value.handled))for(const [key,record]of Object.entries(value.handled)){
  if(Object.keys(out.handled).length>=MAX_ALYSSA)break;
  if(!safeKey(key)||!key.startsWith('alyssa:')||!object(record)||!Object.hasOwn(priorities,record.group)||!pools[record.group]?.includes(record.voiceId))continue;
  out.handled[key]={group:record.group,voiceId:record.voiceId};
 }
 return out;
}
function normalizeAudioMetadata(value){
 const out=empty();
 if(!object(value)||value.version!==1)return out;
 for(const speaker of Object.keys(sequences))out.visits[speaker]=count(value.visits?.[speaker]);
 if(Object.hasOwn(value,'alyssa'))out.alyssa=normalizeAlyssa(value.alyssa);
 for(const key of Object.keys(object(value.encounters)?value.encounters:{})){
  if(Object.keys(out.encounters).length>=MAX_RECORDS)break;
  const record=value.encounters[key],speaker=record?.speaker,visit=record?.visitNumber;
  if(!object(record)||!Object.hasOwn(sequences,speaker)||!Number.isSafeInteger(visit)||visit<1)continue;
  if(typeof key!=='string'||key.length>240||/[\x00-\x1f\x7f]/.test(key)||!key.startsWith(speaker==='merchant'?'shop:':'artifact:'))continue;
  if(record.voiceId!==selectedVoice(speaker,visit))continue;
  out.encounters[key]={speaker,visitNumber:visit,voiceId:record.voiceId};
  out.visits[speaker]=Math.max(out.visits[speaker],visit);
 }
 return out;
}
function normalizeRunAudio(run){
 if(!object(run))return false;
 let changed=false;
 if(Object.hasOwn(run,'audioPresentation')){
  const normalized=normalizeAudioMetadata(run.audioPresentation);
  if(JSON.stringify(run.audioPresentation)!==JSON.stringify(normalized)){run.audioPresentation=normalized;changed=true;}
 }
 // The engine's checkpoint owns an independent whole-run snapshot.
 if(object(run.checkpoint)&&run.checkpoint!==run&&Object.hasOwn(run.checkpoint,'audioPresentation')){
  const normalized=normalizeAudioMetadata(run.checkpoint.audioPresentation);
  if(JSON.stringify(run.checkpoint.audioPresentation)!==JSON.stringify(normalized)){run.checkpoint.audioPresentation=normalized;changed=true;}
 }
 return changed;
}
function restCommitted(run,key){if(object(run)&&run.scene==='map'&&safeKey(key))restActions.set(run,key);}
// The learning reducer's ordered events own precedence: a later Hint can yield
// from a wrong-answer reaction, and a later checked answer can yield from Hint.
function questionState(key,record,{closed,allowRevealedOutcome=false}={}){
 const state={key,closed:closed??(record?.status==='correct'||record?.status==='revealed'),hintUsed:!!record?.hintState?.hintUsed,moreHintViewed:!!record?.hintState?.moreHintViewed};
 const history=Array.isArray(record?.events)?record.events:[];
 for(let i=history.length-1;i>=0;i--){
  const event=history[i];
  if(event.type==='FINAL_REVEALED'){if(!allowRevealedOutcome)return {...state,closed:true};continue;}
  let group=event.type==='HINT_REVEALED'?'hint':event.type==='MORE_HINT_OPENED'?'more_hint':null;
  if(event.type==='ANSWER_SUBMITTED'){
   const attempt=record.attempts?.find(a=>a.id===event.attemptId);
   if(typeof attempt?.correct!=='boolean')return state;
   group=attempt.correct?'correct':'wrong';
  }
  if(group){state.reaction={group,sequence:i+1};break;}
 }
 return state;
}
function legacyQuestionState(owner,key,question){
 const previous=legacyQuestions.get(owner),attempts=count(question.attempts),hinted=!!question.hinted;
 let state=previous?.key===key?previous:{key,attempts:0,hinted:false,sequence:0,group:'question'};
 if(attempts!==state.attempts)state={...state,attempts,group:question.solved?'correct':'wrong',sequence:state.sequence+1};
 else if(hinted&&!state.hinted)state={...state,group:'hint',sequence:state.sequence+1};
 state={...state,hinted};legacyQuestions.set(owner,state);
 return {key,closed:!!question.solved,hintUsed:hinted,reaction:state.sequence?{group:state.group,sequence:state.sequence}:undefined};
}
function nextVoice(state,group){
 const ids=pools[group];if(!ids?.length)return null;
 const bag=state.bags[group]??={remaining:[],last:null};
 if(!bag.remaining.length){
  bag.remaining=ids.slice();
  for(let i=bag.remaining.length-1;i>0;i--){state.rng=(Math.imul(state.rng,1664525)+1013904223)>>>0;const j=Math.floor(state.rng/4294967296*(i+1));[bag.remaining[i],bag.remaining[j]]=[bag.remaining[j],bag.remaining[i]];}
  if(bag.remaining.length>1&&bag.remaining[0]===bag.last)[bag.remaining[0],bag.remaining[1]]=[bag.remaining[1],bag.remaining[0]];
 }
 bag.last=bag.remaining.shift();return bag.last;
}
function alyssaCue(run,{surface,question}){
 if(surface==='question'&&question&&safeKey(question.key)){
  const reaction=question.reaction,valid=object(reaction)&&['correct','wrong','hint','more_hint'].includes(reaction.group)&&Number.isSafeInteger(reaction.sequence)&&reaction.sequence>0&&reaction.sequence<=10000;
  const outcome=valid&&['correct','wrong'].includes(reaction.group);
  if(question.closed===true&&!outcome)return null;
  const group=valid?reaction.group:question.moreHintViewed?'more_hint':question.hintUsed?'hint':'question';
  return {group,key:'alyssa:'+group+':'+question.key+(outcome?':'+reaction.sequence:''),scope:'question:'+question.key+(valid?':'+reaction.sequence:''),...(outcome?{outcome:true}:{})};
 }
 const p=run.mysteryState?.pending;
 if(surface==='event'&&run.scene==='event'&&p?.phase==='intro'&&events[p.eventId]&&safeKey(p.key))return {group:'mystery',voiceId:events[p.eventId],key:'alyssa:mystery:'+p.key,scope:'mystery:'+p.key,delayMs:200,startDeadlineMs:2000};
 if(surface==='reward'&&run.scene==='reward'&&run.rewards?.length)return {group:'card_reward',key:'alyssa:card_reward:'+run.stage+':'+(run.route?.active??run.depth),scope:'reward:'+run.stage+':'+(run.route?.active??run.depth)};
 if(surface==='defeat'&&run.scene==='defeat')return {group:'defeat',key:'alyssa:defeat:'+run.started+':'+run.finished,scope:'defeat'};
 if(surface==='map'&&run.scene==='map'&&restActions.has(run))return {group:'rest',key:'alyssa:rest:'+restActions.get(run),scope:'rest:'+restActions.get(run)};
 return null;
}
function observeAlyssa(run,options,changed){
 if(options.surface!=='map')restActions.delete(run);
 const cue=alyssaCue(run,options),previous=live.get(run);
 const seen=observedQuestions.get(run)===options.question?.key;
 if(options.surface==='question'&&safeKey(options.question?.key))observedQuestions.set(run,options.question.key);
 if(!cue||!safeKey(cue.key)){live.delete(run);return {changed,encounter:null};}
 if(previous?.key===cue.key)return {changed,encounter:previous};
 live.delete(run);
 if(!run.audioPresentation){run.audioPresentation=empty();changed=true;}
 const state=run.audioPresentation;
 if(!state.alyssa){state.alyssa={rng:(Number(run.seed)^0x766f6963)>>>0,bags:{},handled:{}};changed=true;}
 if(Object.hasOwn(state.alyssa.handled,cue.key)||Object.keys(state.alyssa.handled).length>=MAX_ALYSSA)return {changed,encounter:null};
 const voiceId=cue.voiceId||nextVoice(state.alyssa,cue.group);if(!voiceId)return {changed,encounter:null};
 // Persist consumption before scheduling: muted, failed or late audio is never retried on reload.
 state.alyssa.handled[cue.key]={group:cue.group,voiceId};
 // Loading an older saved answer consumes its receipt without speaking it.
 // Only a question already observed in this session can produce a new result.
 if(cue.outcome&&!seen)return {changed:true,encounter:null};
 const encounter=Object.freeze({...cue,voiceId,speaker:'alyssa',priority:priorities[cue.group]});live.set(run,encounter);
 return {changed:true,encounter};
}
function observe(run,{surface,visible=true,question}={}){
 if(!object(run))return {changed:false,encounter:null};
 let changed=normalizeRunAudio(run),speaker,key;
 if(!visible){live.delete(run);restActions.delete(run);return {changed,encounter:null};}
 if(surface!=='artifact'&&surface!=='shop')return observeAlyssa(run,{surface,question},changed);
 live.delete(run);restActions.delete(run);
 if(surface==='artifact'){
  const offer=run.artifactState?.offer;
  if(!offer||offer.ready===false||!Array.isArray(offer.ids)||!offer.ids.length||typeof offer.source!=='string'||!offer.source)return {changed,encounter:null};
  speaker='dungeonMaster';key='artifact:'+offer.source;
 }else if(surface==='shop'&&run.scene==='shop'){
  const node=run.route?.active??run.depth;
  if((typeof node!=='string'&&typeof node!=='number')||node===null||node===undefined)return {changed,encounter:null};
  speaker='merchant';key='shop:'+(run.stage===1?1:0)+':'+node;
 }else return {changed,encounter:null};
 if(key.length>240||/[\x00-\x1f\x7f]/.test(key))return {changed,encounter:null};
 if(!Object.hasOwn(run,'audioPresentation')){run.audioPresentation=empty();changed=true;}
 const state=run.audioPresentation;
 if(!Object.hasOwn(state.encounters,key)){
  // Saturation cannot occur in the two-stage route. Keep duplicate protection
  // for imported oversized ledgers instead of pruning/recounting old visits.
  if(Object.keys(state.encounters).length>=MAX_RECORDS)return {changed,encounter:null};
  const visit=Math.min(Number.MAX_SAFE_INTEGER,state.visits[speaker]+1);
  state.visits[speaker]=visit;state.encounters[key]={speaker,visitNumber:visit,voiceId:selectedVoice(speaker,visit)};changed=true;
 }
 return {changed,encounter:Object.freeze({key,...state.encounters[key]})};
}
const api={observe,restCommitted,questionState,legacyQuestionState,normalizeAudioMetadata,normalizeRunAudio};
if(typeof module!=='undefined')module.exports=api;else root.DCAudioPresentation=api;
})(typeof window!=='undefined'?window:globalThis);
