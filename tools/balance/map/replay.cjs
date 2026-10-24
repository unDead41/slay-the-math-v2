'use strict';
const {createHash}=require('node:crypto');
function createReplay(runtime=null){
const suppliedRuntime=runtime;runtime=runtime||require('../../cards/legacy-runtime.cjs')();
const E=runtime?.E||require('../../../dist/engine.js');
const C=runtime?.C||require('../../../dist/config.js');
const A=runtime?.A||require('../../../dist/artifacts.js');
const Q=runtime?.Q||require('../../../dist/education.js');
const X=runtime?.X||require('../../../dist/mystery.js');
const G=runtime?.G||require('../../../dist/map.js');
const defaults=require('./config.json');
const {chooseCombatAction,passiveWeights}=require('./policy.cjs');
const {enumerateRoutes,hash}=require('./structure.cjs');
const {POLICIES,chooseRoute}=require('../map-advanced/route-policy.cjs');
const {PROFILES,predictDecision}=require('../map-advanced/question-policy.cjs');
const {assertDifficulty}=require('../map-advanced/scenarios.cjs');
const {createTelemetry}=require('../map-advanced/telemetry.cjs');
function stream(seed,label){let s=Number.parseInt(createHash('sha256').update(String(seed)+':'+label).digest('hex').slice(0,8),16)>>>0;const random=()=>{s=(s+0x6D2B79F5)>>>0;let t=Math.imul(s^(s>>>15),s|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};random.getState=()=>s;random.restore=value=>{if(!Number.isSafeInteger(value)||value<0||value>4294967295)throw Error('Invalid policy RNG state.');s=value;};return random;}
const copy=x=>JSON.parse(JSON.stringify(x));
const publicCard=c=>({uid:c.uid,key:c.key,name:C.cards[c.key]?.name||c.key,upgraded:c.upgraded});
function briefPlan(p){
 if(!p)return null;
 const sum=(op,where=()=>true)=>p.actions.filter(a=>a.op===op&&where(a)).reduce((n,a)=>n+(a.value||0),0);
 return {name:p.card.name,category:p.card.category,legal:p.legal,energy:p.payEnergy,focus:p.payFocus,
  damage:p.damageEvents.reduce((n,e)=>n+e.hpLost,0),block:sum('grant_block',a=>!a.timing),draw:sum('draw',a=>!a.timing),
  delayed:p.actions.filter(a=>a.timing).reduce((n,a)=>n+(a.value||0),0),selection:p.actions.some(a=>['look_choose_reorder','look_choose_discard','look_replace_take','search_category','return_discard_card'].includes(a.op))?1:0,
  weak:sum('apply_status',a=>a.status==='weak'),vulnerable:sum('apply_status',a=>a.status==='vulnerable'),thorns:sum('apply_status',a=>a.status==='thorns')};
}
function publicCombatView(r){
 const b=r.battle,it=E.intent(r),s=b.cardCombat?.statuses;
 let incoming=0,weak=s?.enemy?.weak||0,vuln=s?.self?.vulnerable||0;
 for(let i=0;i<(it.hits||1);i++){incoming+=Math.max(0,it.damage-(weak>0?2:0)+(vuln>0?2:0)-(b.defense||0));weak=Math.max(0,weak-1);vuln=Math.max(0,vuln-1);}
 const plain={...r,battle:{...b,boostArmed:false}},focused={...r,battle:{...b,boostArmed:true}};
 return {hp:r.hp,maxHp:r.maxHp,enemyHp:b.hp,energy:b.energy,block:b.block,incoming,neededBlock:Math.max(0,incoming-b.block),active:(b.active||[]).map(publicCard),
  cards:b.hand.map(c=>({uid:c.uid,key:c.key,normal:briefPlan(E.cardPlan(plain,c)),focused:b.focus>0&&!b.boostUsed?briefPlan(E.cardPlan(focused,c)):null}))};
}
const meritCache=new Map();
function cardMerit(c){
 const key=c.key+':'+!!c.upgraded;if(meritCache.has(key))return meritCache.get(key);
 const p=E.cardDisplayPlan(c);if(!p)return 0;
 const v=briefPlan(p);let n=(v.damage+.8*v.block+2.5*v.draw+2*v.selection+1.4*v.delayed+2*v.weak+2*v.vulnerable)/(Math.max(1,v.energy));
 if(v.category==='passive')n=passiveWeights[v.name]||5;
 meritCache.set(key,n);return n;
}
function rewardMerit(r,key,upgraded=false){
 const role=C.cards[key].role,count=r.deck.filter(c=>C.cards[c.key].role===role).length,target={attack:.4,guard:.3,tactic:.2,passive:.1}[role];
 const scarcity=Math.max(.6,Math.min(1.4,(target*r.deck.length+1)/(count+1)));
 return cardMerit({key,upgraded})*scarcity;
}
function artifactMerit(a){
 const v=a.values;
 return 6+(v.energy||0)*16+(v.draw||0)*7+(v.initial_strength||0)*3+(v.initial_agility||0)*3+(v.strength||0)*3+(v.agility||0)*3+(v.heal||0)*2+(v.max_hp||0)+(v.block||v.block_bonus||0)+(v.discount_percent||0)/2;
}
function snapshot(r){return {stage:r.stage+1,hp:r.hp,maxHp:r.maxHp,gold:r.gold,deckSize:r.deck.length,upgrades:r.deck.filter(c=>c.upgraded).length,deckFingerprint:hash(r.deck.map(c=>[c.key,c.upgraded]).sort()),artifacts:E.ownedArtifacts(r).map(a=>a.id),rng:r.rng};}
function publicRouteView(r){
 const map=r.route?.snapshot;if(!map)throw Error('Adaptive policy requires a version 3 map snapshot.');
 return {hp:r.hp,maxHp:r.maxHp,gold:r.gold,available:E.availableNodes(r).map(n=>n.id),nodes:map.nodes.map(n=>({id:n.id,level:n.level,type:n.type})),edges:map.edges.map(e=>({from:e.from,to:e.to}))};
}
function plannedRoute(runSeed,stage,routeRandom,forced){
 const snap=G.begin(stage-1,runSeed).snapshot,routes=enumerateRoutes(snap);
 if(forced){const match=routes.find(x=>JSON.stringify(x.nodeIds)===JSON.stringify(forced));if(!match)throw Error('Invalid forced route for stage '+stage);return match;}
 const by=new Map(snap.nodes.map(n=>[n.id,n])),starts=snap.nodes.filter(n=>n.level===1);let n=starts[Math.floor(routeRandom()*starts.length)],ids=[n.id];
 while(n.level<10){const out=snap.edges.filter(e=>e.from===n.id);n=by.get(out[Math.floor(routeRandom()*out.length)].to);ids.push(n.id);}
 return routes.find(x=>JSON.stringify(x.nodeIds)===JSON.stringify(ids));
}
function runCampaign(options={}){
 const {runSeed,mode=options.initialState?.mode||defaults.mode,forcedRoutes=null,trace=false,predictProfile='feedback',routePolicy=defaults.routePolicyVersion}=options;
 const difficulty=suppliedRuntime?runtime.difficulty:assertDifficulty(options.difficulty);
 if(suppliedRuntime&&(!runtime.C.MASTER_BALANCE||options.difficulty&&options.difficulty!==difficulty))throw Error('Master replay difficulty mismatch.');
 if(!Number.isSafeInteger(runSeed)||runSeed<0||runSeed>4294967295||!['learn','challenge'].includes(mode))throw Error('A uint32 runSeed and supported mode are required.');
 if(!PROFILES[predictProfile])throw Error('Unknown Predict profile '+predictProfile);
 const adaptive=POLICIES.includes(routePolicy);if(!adaptive&&routePolicy!==defaults.routePolicyVersion)throw Error('Unknown route policy '+routePolicy);
 if(adaptive&&forcedRoutes)throw Error('Forced route and adaptive policy cannot be combined.');
 for(const k of ['stopAtEntry','stopAfterStage'])if(options[k]!==undefined&&![1,2].includes(options[k]))throw Error('Invalid stage scope.');
 if(options.initialState){const s=options.initialState;if(s.seed!==runSeed||s.mode!==mode||s.scene!=='map'||s.depth!==0||s.route?.version!==3||!E.validate(s))throw Error('Invalid captured stage-entry state or seed.');if(options.stopAfterStage&&options.stopAfterStage<s.stage+1)throw Error('Stop scope precedes captured entry.');if(!options.initialRngStates||!Number.isSafeInteger(options.initialClock)||options.initialClock<s.started)throw Error('Captured entry requires clock and policy RNG states.');}
 const limits={...defaults.limits,...options.limits};for(const n of Object.values(limits))if(!Number.isSafeInteger(n)||n<1)throw Error('Positive replay limits required.');
 const routeRandom=stream(runSeed,'routes-v1'),answerRandom=stream(runSeed,'visible-answer-feedback-v1'),abilityRandom=stream(runSeed,'predict-ability-v1');
 const plans=adaptive?{1:{id:null,nodeIds:[],probability:null},2:{id:null,nodeIds:[],probability:null}}:{1:plannedRoute(runSeed,1,routeRandom,forcedRoutes?.[1]),2:plannedRoute(runSeed,2,routeRandom,forcedRoutes?.[2])};
 if(options.initialRngStates){for(const [key,random] of Object.entries({routes:routeRandom,answers:answerRandom,ability:abilityRandom}))random.restore(options.initialRngStates[key]);}
 const actions=[],rooms=[],routeDecisions=[],checkpoints=[],entryStages=new Set(),stages=[{stage:1,reached:false,cleared:false},{stage:2,reached:false,cleared:false}];
 const entryStage=options.initialState?options.initialState.stage+1:1;
 let clock=options.initialClock??defaults.clockEpoch,run,observer,entryStateHash=null,startingPlays=options.initialState?.stats.cardsPlayed||0,active=null,invalidStates=0,apiCalls=0,combatPlays=0,combatKey=null,answerAttempts=0,firstCorrect=0;
 const realNow=Date.now;Date.now=()=>clock;
 class ReplayLimit extends Error{}
 function act(kind,fn,detail={}){if(apiCalls>=limits.maxActions)throw new ReplayLimit();const before=observer?.mark(run);apiCalls++;actions.push({n:apiCalls,kind,stage:run?.stage,depth:run?.depth,...detail});const result=fn();if(observer)observer.observe(kind,before,run,result);return result;}
 const takeSnapshot=r=>observer?observer.snapshot(r):snapshot(r);
 function validate(where){if(!E.validate(run)){invalidStates++;throw Error('Invalid engine state at '+where);}}
 function finishRoom(){if(active){active.exit=takeSnapshot(run);active.result=run.scene==='defeat'?'DEFEAT':run.scene==='victory'?'VICTORY':'CLEARED';active.playerTurns=run.stats.turns-active.turnsBefore;delete active.turnsBefore;rooms.push(active);active=null;observer?.detachRoom();}}
 function reconcile(){
  if(!run)return;
  if(run.scene==='stageclear'||run.stage===1)stages[0].cleared=true;
  if(run.scene==='victory'){stages[0].cleared=true;stages[1].cleared=true;}
  if(active&&(run.stage+1!==active.stage||['stageclear','victory','defeat'].includes(run.scene)||run.scene==='map'&&run.route.active===null))finishRoom();
 }
 function pickFeedback(choices,attempts=[]){const unused=choices.filter(id=>!attempts.includes(id));if(!unused.length)throw Error('Question has no remaining answer.');return unused[Math.floor(answerRandom()*unused.length)];}
 function resolveCardChoice(){
  const ch=E.cardChoice(run),candidates=ch.candidates||[];
  let value;
  if(ch.kind==='card_search')value=E.intent(run).damage>0?'defend':'attack';
  else if(ch.kind==='burning_page')value='take';
  else if(['passive_swap','passive_trim'].includes(ch.kind))value=candidates.slice().sort((a,b)=>cardMerit(a)-cardMerit(b)||a.uid.localeCompare(b.uid))[0].uid;
  else{const sorted=candidates.slice().sort((a,b)=>cardMerit(b)-cardMerit(a)||a.uid.localeCompare(b.uid));value=ch.kind==='read_ahead'?{take:sorted[0].uid,order:sorted.slice(1).map(c=>c.uid)}:sorted[0].uid;}
  act('cardChoice',()=>E.chooseCardOption(run,value),{choiceKind:ch.kind});
 }
 function mysteryReward(){
  const event=X.definition(run),p=X.pending(run),options=event.success.options.filter(o=>X.actionable(run,o));
  const value=o=>o.effects.reduce((n,e)=>n+({HEAL_HP:Math.min(e.amount||0,run.maxHp-run.hp)*1.4,ADD_GOLD:(e.amount||0)/12,UPGRADE_CARD:6,REMOVE_CARD:run.deck.length>14?5:0,TRANSFORM_CARD:3,CHOOSE_CARD_REWARD:7,GRANT_ARTIFACT:10,QUEUE_COMBAT_MODIFIER:4}[e.type]||0),0)-o.costs.reduce((n,c)=>n+c.amount*(c.resource==='gold'?1/12:c.resource==='maxHp'?3:run.hp<run.maxHp/2?2:1),0);
  options.sort((a,b)=>value(b)-value(a)||a.id.localeCompare(b.id));
  const option=options[0];if(!option||(value(option)<0&&event.success.mayDecline)){act('mysteryDecline',()=>E.leaveMystery(run,clock));return;}
  act('mysteryOption',()=>E.selectMysteryOption(run,option.id),{id:option.id});
  let targets=X.targets(run,option);const offer=p.offers[option.id];if(offer.cards)targets=targets.filter(t=>offer.cards.includes(t));
  if(targets.length){
   const type=option.effects.find(e=>['UPGRADE_CARD','REMOVE_CARD','TRANSFORM_CARD','CONSUME_ARTIFACT','CHOOSE_CARD_REWARD'].includes(e.type)).type;
   const score=id=>type==='CONSUME_ARTIFACT'?artifactMerit(A.catalog[id]):type==='CHOOSE_CARD_REWARD'?rewardMerit(run,id):cardMerit(run.deck.find(c=>c.uid===id));
   const sign=['REMOVE_CARD','TRANSFORM_CARD','CONSUME_ARTIFACT'].includes(type)?1:-1;targets.sort((a,b)=>sign*(score(a)-score(b))||a.localeCompare(b));
   act('mysteryTarget',()=>E.selectMysteryTarget(run,targets[0]),{id:targets[0]});
  }
  act('mysteryClaim',()=>E.claimMystery(run));
 }
 try{
  run=options.initialState?copy(options.initialState):E.newRun(runSeed,mode);validate('new run');
  if(options.telemetry)observer=createTelemetry({E,A,cardMerit,hash},run);
  if(options.initialState)entryStateHash=hash(run);
  while(!['victory','defeat'].includes(run.scene)){
   reconcile();
   if(options.stopAfterStage&&stages[options.stopAfterStage-1].cleared)return result('STAGE_CLEARED');
   if(run.scene==='map'&&run.depth===0&&!entryStages.has(run.stage+1)){
    entryStages.add(run.stage+1);if(!entryStateHash)entryStateHash=hash(run);
    if(options.captureCheckpoints||options.stopAtEntry)checkpoints.push({stage:run.stage+1,runSeed,state:copy(run),stateHash:hash(run),clock,policyRngStates:{routes:routeRandom.getState(),answers:answerRandom.getState(),ability:abilityRandom.getState()}});
    if(options.stopAtEntry===run.stage+1)return result('ENTRY_CAPTURED');
   }
   if(apiCalls>=limits.maxActions)return result('BENCHMARK_LIMIT_CENSORED');
   if(run.scene==='map'){
    const plan=plans[run.stage+1];let id=plan.nodeIds[run.depth];
    if(adaptive){const view=publicRouteView(run),choice=chooseRoute(view,routePolicy,routeRandom);id=choice.nodeId;routeDecisions.push({...choice,stage:run.stage+1,level:run.depth+1,hp:run.hp,maxHp:run.maxHp,gold:run.gold,available:view.available});plan.nodeIds.push(id);if(plan.nodeIds.length===10)plan.id='route-'+hash(plan.nodeIds).slice(0,16);}
    const node=E.availableNodes(run).find(n=>n.id===id);
    if(!node)throw Error('Planned route is not connected at '+id);
    validate('before entry');stages[run.stage].reached=true;
    active={stage:run.stage+1,nodeId:id,roomType:node.type,enter:takeSnapshot(run),turnsBefore:run.stats.turns,enemyId:node.enemyId||null};
    if(observer)observer.attachRoom(active);
    act('enterNode',()=>E.enterNode(run,id),{nodeId:id});validate('after entry');combatKey=null;
   }else if(run.scene==='master'){
    const offer=E.artifactChoices(run).slice().sort((a,b)=>artifactMerit(b)-artifactMerit(a)||a.id.localeCompare(b.id))[0];
    act('artifactChoice',()=>E.chooseArtifact(run,offer.id),{id:offer.id});
   }else if(run.scene==='education'){
    const p=run.educationState.pending;
    if(Q.ready(run)){act('educationContinue',()=>E.continueEducation(run));if(run.stage===1)stages[0].cleared=true;}
    else{clock+=1000;const id=pickFeedback(p.choiceOrder,p.attempts);act('educationSelect',()=>E.selectEducation(run,id));const a=act('educationAnswer',()=>E.answerEducation(run));answerAttempts++;if(a.first)firstCorrect++;}
   }else if(run.scene==='battle'){
    const b=run.battle,key=run.stage+':'+(run.route?.active||'mystery')+':'+b.enemyId;
    if(key!==combatKey){combatKey=key;combatPlays=0;}
    if(observer)observer.opportunity(run,predictProfile==='skip');
    if(b.turn>limits.maxCombatTurns||combatPlays>=limits.maxCombatPlays)return result('BENCHMARK_LIMIT_CENSORED');
    if(b.cardChoice){resolveCardChoice();continue;}
    if(!b.forecastUsed&&predictProfile!=='skip'){
     const p=b.question||act('forecast',()=>E.forecast(run));
     if(p.exhausted)act('forecastExhausted',()=>E.completeExhaustedForecast(run));
     else if(!p.solved){
      if(predictProfile!=='feedback'&&p.attempts.length){act('forecastClose',()=>E.closeForecast(run));continue;}
      clock+=1000;const id=predictProfile==='feedback'?pickFeedback(p.choiceOrder,p.attempts):predictDecision({...p,correctChoiceId:Q.catalog[p.questionId].correctChoiceId},predictProfile,abilityRandom).choiceId;
      act('forecastSelect',()=>E.selectForecast(run,id));const a=act('forecastAnswer',()=>E.answerBankForecast(run));answerAttempts++;if(a.first)firstCorrect++;continue;
     }
    }
    if(run.battle.question){act('forecastClose',()=>E.closeForecast(run));continue;}
    const chosen=chooseCombatAction(publicCombatView(run));
    if(chosen.kind==='endTurn')act('endTurn',()=>E.endTurn(run));
    else{if(!!run.battle.boostArmed!==chosen.focus&&run.battle.focus>0&&!run.battle.boostUsed)act('focusToggle',()=>E.armFocus(run));act('playCard',()=>E.playCard(run,chosen.uid),{uid:chosen.uid});combatPlays++;}
   }else if(run.scene==='reward'){
    if(run.artifactState?.offer?.ready){const a=E.artifactChoices(run).slice().sort((a,b)=>artifactMerit(b)-artifactMerit(a)||a.id.localeCompare(b.id))[0];act('artifactChoice',()=>E.chooseArtifact(run,a.id),{id:a.id});}
    else{const choices=run.rewards.slice().sort((a,b)=>rewardMerit(run,b,!!run.battle?.elite)-rewardMerit(run,a,!!run.battle?.elite)||a.localeCompare(b));const key=run.deck.length<24?choices[0]:null;act('rewardChoice',()=>E.chooseReward(run,key),{key});}
   }else if(run.scene==='camp'){
    const card=run.deck.filter(c=>E.canUpgrade(c)).sort((a,b)=>cardMerit(b)-cardMerit(a)||a.uid.localeCompare(b.uid))[0];
    if(run.hp<=run.maxHp-8||!card)act('campHeal',()=>E.camp(run,'heal'));
    else act('campUpgrade',()=>E.camp(run,'upgrade',card.uid),{uid:card.uid});
   }else if(run.scene==='shop'){
    const options=[];
    if(run.deck.length<24)run.shop.offers.forEach((o,i)=>{const price=E.shopPrice(run,o);if(!run.shop.bought.includes(i)&&price<=run.gold)options.push({kind:'card',i,value:rewardMerit(run,o.key)/price});});
    (run.shop.artifacts||[]).forEach((o,i)=>{if(o.id&&!run.shop.artifactBought.includes(i)&&!A.has(run,o.id)){const price=run.economyState?E.shopPrice(run,o):A.price(run,o.price);if(price<=run.gold)options.push({kind:'artifact',i,value:artifactMerit(A.catalog[o.id])/price});}});
    options.sort((a,b)=>b.value-a.value||a.kind.localeCompare(b.kind)||a.i-b.i);
    if(!options.length)act('shopLeave',()=>E.leaveShop(run));
    else{const o=options[0];act(o.kind==='card'?'buyCard':'buyArtifact',()=>o.kind==='card'?E.buyCard(run,o.i):E.buyArtifact(run,o.i),{index:o.i});}
   }else if(run.scene==='event'){
    const p=X.pending(run);
    if(p.phase==='intro')act('mysteryStart',()=>E.startMystery(run,[],null,clock));
    else if(p.phase==='question'){clock+=1000;const id=pickFeedback(p.choiceOrder);act('mysteryAnswer',()=>E.answerMystery(run,id,clock),{id});answerAttempts++;if(run.mysteryState.pending.outcome==='CORRECT')firstCorrect++;}
    else if(['review','empty'].includes(p.phase))act('mysteryContinue',()=>E.continueMystery(run));
    else if(p.phase==='reward')mysteryReward();else throw Error('Unexpected Mystery phase '+p.phase);
   }else if(run.scene==='stageclear'){
    stages[0].cleared=true;
    const choices=E.artifactChoices(run).slice().sort((a,b)=>artifactMerit(b)-artifactMerit(a)||a.id.localeCompare(b.id));
    if(choices.length)act('bossArtifact',()=>E.chooseArtifact(run,choices[0].id),{id:choices[0].id});else act('nextStage',()=>E.nextStage(run));
   }else throw Error('Unhandled engine scene '+run.scene);
  }
  validate('terminal');reconcile();return result(run.scene==='victory'?'VICTORY':'DEFEAT');
 }catch(error){return error instanceof ReplayLimit?result('BENCHMARK_LIMIT_CENSORED'):result('INVALID_POLICY_OR_ENGINE',error.message);}
 finally{Date.now=realNow;}
 function result(status,error=null){
  if(status==='BENCHMARK_LIMIT_CENSORED')reconcile();
  if(active){active.exit=takeSnapshot(run);active.result=status;active.playerTurns=run.stats.turns-active.turnsBefore;delete active.turnsBefore;rooms.push(active);active=null;}
  return {runSeed,seed:'STM-'+String(runSeed%100+1).padStart(3,'0'),mode,difficulty,policyVersion:defaults.playerPolicyVersion,routePolicy:forcedRoutes?'forced-route-diagnostic':routePolicy,
   status,error,campaignWon:options.stopAfterStage||options.stopAtEntry||entryStage!==1?null:status==='VICTORY'?true:status==='DEFEAT'?false:null,entryStage,entryStateHash,stages,plannedRoutes:plans,rooms,routeDecisions,checkpoints,apiCalls,committedCardPlays:(run?.stats.cardsPlayed||0)-startingPlays,answerAttempts,firstCorrect,invalidStates,
   final:run?takeSnapshot(run):null,traceHash:hash(actions),...(trace?{actions}:{}),...(observer?{metrics:observer.metrics}:{}),predictProfile,syntheticOracleUsed:PROFILES[predictProfile].oracle,
   learningModel:predictProfile==='feedback'?'uniform untried visible choice; use feedback for Predict/artifact, one attempt for Mystery; no answer key access':'Predict '+predictProfile+' sensitivity; artifact/Mystery retain feedback policy; canonical key used only for declared high/low knowledge model',entrySet:options.initialState?'captured-valid-stage-entry':'actual-new-run-and-campaign-carry'};
 }
}
return {stream,briefPlan,publicCombatView,publicRouteView,cardMerit,rewardMerit,artifactMerit,plannedRoute,runCampaign};
}
module.exports={...createReplay(),createReplay};
