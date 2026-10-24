'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {loadMaster,ROOT}=require('../balance/master/loader.cjs'),{createReplay}=require('../balance/map/replay.cjs');
const {PROFILES,predictDecision}=require('../balance/map-advanced/question-policy.cjs'),{POLICIES}=require('../balance/map-advanced/route-policy.cjs');
const B=require('../balance/combat.cjs'),D=require('../balance/deep.cjs'),{createAgent,SKILLS,VERSION}=require('./agent.cjs'),{summarize}=require('./report.cjs');
const {createEffectsTracker}=require('./effects.cjs');
const {createDeckPolicy}=require('./deck-policy.cjs');
const DIFFICULTIES=['easy','medium','hard'],REFERENCE='stm.attack.rune_strike';
function normalizeOptions(input={}){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Expected an options object.');
 if(Object.keys(input).some(k=>!['mode','difficulty','skill','predict','route','seed','seeds','enemy','cards','upgraded'].includes(k)))throw Error('Unknown experiment option.');
 const o={mode:'campaign',difficulty:'medium',skill:'all',predict:'feedback',route:'health-recovery',seed:20,seeds:2,enemy:'wisp',cards:[REFERENCE],upgraded:false,...input};
 for(const [value,allowed,label]of [[o.mode,['campaign','cards'],'mode'],[o.difficulty,[...DIFFICULTIES,...(o.mode==='campaign'?['all']:[])],'difficulty'],[o.skill,[...SKILLS,'all'],'skill'],[o.predict,Object.keys(PROFILES),'Predict profile'],[o.route,POLICIES,'route policy']])if(!allowed.includes(value))throw Error('Invalid '+label);
 if(!Number.isSafeInteger(o.seeds)||o.seeds<1||o.seeds>20||!Number.isSafeInteger(o.seed)||o.seed<0||o.seed+o.seeds-1>4294967295)throw Error('Use 1..20 seeds within uint32 range.');
 if(typeof o.upgraded!=='boolean')throw Error('Invalid upgrade flag.');
 const C=require('../../dist/config.js'),data=require('../../dist/card-data.js');
 if(typeof o.enemy!=='string'||!Object.hasOwn(C.enemies,o.enemy))throw Error('Unknown enemy.');
 if(!Array.isArray(o.cards)||o.cards.length<1||o.cards.length>2||o.cards.some(k=>!data.cards.some(c=>c.id===k)))throw Error('Select one or two canonical cards.');
 return o;
}
function sourceIdentity(x){
 const files=new Set([...x.sourceFiles,'dist/balance.js','dist/balance-data.js','tools/balance/master/config.json','tools/balance/master/loader.cjs','tools/balance/combat.cjs','tools/balance/deep.cjs','tools/balance/candidate.cjs','tools/balance/specs/balance-spec.v1.2.json',...['replay.cjs','policy.cjs','config.json','structure.cjs'].map(p=>'tools/balance/map/'+p),...['route-policy.cjs','question-policy.cjs','scenarios.cjs','telemetry.cjs'].map(p=>'tools/balance/map-advanced/'+p),...['agent.cjs','experiments.cjs','effects.cjs','deck-policy.cjs','report.cjs','worker.cjs'].map(p=>'tools/ai-playtester/'+p)]);
 const sources=Object.fromEntries([...files].sort().map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,p))).digest('hex')]));
 return {sourceHash:crypto.createHash('sha256').update(JSON.stringify(sources)).digest('hex'),sources};
}
function meter(){const m={decisions:0,searchNodes:0,maxDepth:0,maxHorizonTurns:0,sampledReveals:0,truncatedRollouts:0,energySpent:0,focusSpent:0,cards:{},trace:[],choiceDecisions:[]};Object.defineProperty(m,'lastResolvedPlay',{value:0,writable:true});return m;}
function decision(agent,r,m){const a=agent.decide(r);m.decisions++;m.searchNodes+=a.searchNodes;m.maxDepth=Math.max(m.maxDepth,a.depth);m.maxHorizonTurns=Math.max(m.maxHorizonTurns,a.horizonTurns);m.sampledReveals+=a.sampledReveals;m.truncatedRollouts+=a.truncatedRollouts;m.trace.push({turn:r.battle.turn,enemy:r.battle.enemyId,...a});if(m.trace.length>30)m.trace.shift();return a;}
function choiceDecision(m,r,d){m.choiceDecisions.push({turn:r.battle.turn,...d});if(m.choiceDecisions.length>30)m.choiceDecisions.shift();}
function resolveChoice(x,r,agent,m,tracker){const kind=x.E.cardChoice(r).kind,value=agent.choose(r);tracker.capture(r,()=>x.E.chooseCardOption(r,value));choiceDecision(m,r,{kind,value});}
function paid(r,m){
 // cardAction replaces the battle object. The campaign-wide commit ordinal survives copies.
 const tx=r.battle.cardCombat.receipts.at(-1),ordinal=r.stats.cardsPlayed;
 if(!tx||tx.status!=='resolved'||ordinal===m.lastResolvedPlay)return;
 if(ordinal!==m.lastResolvedPlay+1)throw Error('AI receipt observer missed a committed card.');
 m.lastResolvedPlay=ordinal;m.energySpent+=tx.energy;m.focusSpent+=tx.focus;
 const c=m.cards[tx.key]??={plays:0,energySpent:0,focusSpent:0,hpDamage:0};c.plays++;c.energySpent+=tx.energy;c.focusSpent+=tx.focus;c.hpDamage+=tx.damageEvents.reduce((n,e)=>n+e.hpLost,0);
}
function finishEffects(m,tracker){const {cards,...effects}=tracker.snapshot();if(effects.totals.energySpent!==m.energySpent||effects.totals.focusSpent!==m.focusSpent)throw Error('AI effects and resolved receipt costs disagree.');m.cards=cards;m.effects=effects;}
function predictCombat(x,r,profile,seed){
 if(profile==='skip')return;
 const p=x.E.forecast(r),random=createReplay(x).stream(seed,'ai-predict:'+r.battle.turn);
 if(p.exhausted)x.E.completeExhaustedForecast(r);
 else{let count=0;while(!r.battle.forecastUsed&&!p.solved&&count++<12){const q={...p,...(PROFILES[profile].oracle?{correctChoiceId:x.Q.catalog[p.questionId].correctChoiceId}:{})},a=predictDecision(q,profile,random);x.E.selectForecast(r,a.choiceId);x.E.answerBankForecast(r);if(!PROFILES[profile].retry)break;}}
 x.E.closeForecast(r);
}
function combat(x,o,seed,mask,agent){
 const deck=[...o.cards.map((key,i)=>({key:mask>>i&1?key:REFERENCE,upgraded:o.upgraded})),...B.baseDeck().slice(0,12-o.cards.length).map(key=>({key,upgraded:false}))],m=meter(),tracker=createEffectsTracker(x);let r,lastTurn=0,plays=0,work=0;
 try{
  r=D.create(x,{seed,enemy:o.enemy,deck});
  while(r.scene==='battle'&&r.battle.turn<=100&&plays<500&&work++<3000){
   if(r.battle.turn!==lastTurn){lastTurn=r.battle.turn;tracker.capture(r,()=>predictCombat(x,r,o.predict,seed));}
   if(x.E.cardChoice(r)){resolveChoice(x,r,agent,m,tracker);paid(r,m);continue;}
   const a=decision(agent,r,m);
   if(a.kind==='endTurn')tracker.capture(r,()=>x.E.endTurn(r));
   else{if(!!r.battle.boostArmed!==a.focus)x.E.armFocus(r);tracker.capture(r,()=>x.E.playCard(r,a.uid));while(x.E.cardChoice(r)){if(work++>=3000)throw Object.assign(Error('Card choice limit'),{censored:true});resolveChoice(x,r,agent,m,tracker);}paid(r,m);plays++;}
  }
  const status=r.scene==='battle'?'BENCHMARK_LIMIT_CENSORED':r.scene==='defeat'?'LOSS':'WIN';finishEffects(m,tracker);
  return {status,utility:status==='BENCHMARK_LIMIT_CENSORED'?null:100*(status==='WIN')+20*(status==='LOSS'?0:r.hp/r.maxHp)-Math.min(10,r.battle.turn/2),final:D.snapshot(r),playerTurns:r.battle.turn,committedCardPlays:r.stats.cardsPlayed,validFinal:x.E.validate(r),ai:m,syntheticOracleUsed:PROFILES[o.predict].oracle};
 }catch(e){return {status:e.censored?'BENCHMARK_LIMIT_CENSORED':'INVALID_POLICY_OR_ENGINE',utility:null,error:e.message,ai:m};}finally{tracker.dispose();}
}
function experiment(input={},callbacks={}){
 const options=normalizeOptions(input),rows=[],difficulties=options.difficulty==='all'?DIFFICULTIES:[options.difficulty],skills=options.skill==='all'?SKILLS:[options.skill],masks=options.mode==='cards'?1<<options.cards.length:1,total=options.seeds*difficulties.length*skills.length*masks;let identity;
 for(const difficulty of difficulties){
  const x=loadMaster({difficulty});if(!identity){identity=sourceIdentity(x);callbacks.onStart?.({...identity,total,options,agentVersion:VERSION});}
  for(const skill of skills){const agent=createAgent(x,{skill});
   for(let n=0;n<options.seeds;n++)for(let mask=0;mask<masks;mask++){
    const seed=options.seed+n;let result;
    if(options.mode==='campaign'){const ai=meter(),tracker=createEffectsTracker(x);ai.deckDecisions=[];try{result=createReplay(x).runCampaign({runSeed:seed,difficulty,predictProfile:options.predict,routePolicy:options.route,mode:'challenge',telemetry:true,combatAgent:r=>decision(agent,r,ai),combatChoice:r=>agent.choose(r),onCombatChoice:(r,d)=>choiceDecision(ai,r,d),onCombatPlay:r=>paid(r,ai),observeAction:(r,fn)=>tracker.capture(r,fn),deckPolicy:createDeckPolicy(x),onDeckDecision:d=>{ai.deckDecisions.push(d);if(ai.deckDecisions.length>30)ai.deckDecisions.shift();},agentVersion:agent.version});finishEffects(ai,tracker);result.ai=ai;}finally{tracker.dispose();}}
    else result=combat(x,options,seed,mask,agent);
    if(result.validFinal===false)result={...result,status:'INVALID_POLICY_OR_ENGINE',utility:null,error:'Engine rejected final combat state.'};
    const row={...result,...(result.rooms?{playerTurns:result.rooms.reduce((n,r)=>n+(r.playerTurns||0),0)}:{}),seed,difficulty,skill,...(options.mode==='cards'?{mask}:{}),provenance:x.provenance};rows.push(row);callbacks.onRow?.(row);callbacks.onProgress?.({completed:rows.length,total});
   }
  }
 }
 return {schemaVersion:3,agentVersion:VERSION,jobStatus:'completed',options,...identity,rows,total,summary:summarize(rows,options),runtime:process.version,pupilWinRatesMeasured:false,interpretation:'Synthetic AI playtests; shared route and mechanic-aware deck acquisition heuristics. Contextual card measurements and actual support units, no exhaustive combinations or pupil win-rate validation.'};
}
module.exports={normalizeOptions,experiment,DIFFICULTIES,combat};
