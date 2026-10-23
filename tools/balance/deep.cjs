'use strict';
const crypto=require('node:crypto');
const B=require('./combat.cjs'),{spec}=require('./candidate.cjs');
const copy=x=>JSON.parse(JSON.stringify(x));
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function meter(){return {predict:{reservations:0,correct:0,independent:0,assisted:0,wrongAttempts:0,skipped:0,exhausted:0,focus:0,seals:0},plays:0,energySpent:0,focusSpent:0,choices:0,reloads:0,work:0,turns:[],cards:{},passive:{},artifacts:{},events:[],exhaustedEver:[],enemy:{hpLost:0,blockUsed:0,hits:0}};}
function create(x,o){
 if(o.fromRun){const r=x.E.restore(copy(o.fromRun));if(!r||r.scene!=='battle')throw Error('Invalid resumed battle');return r;}
 const {E,A,C}=x,r=E.newRun(o.seed,'learn');delete r.route;r.mode='challenge';r.seq=0;
 const slots=o.slots||B.REF.slice(0,2),deck=o.deck||[...slots,...B.baseDeck(o.archetype).slice(0,12-slots.length)];
 if(!Array.isArray(deck)||!deck.length||deck.length>60)throw Error('Explicit deck requires 1..60 cards');
 r.deck=deck.map((v,i)=>{const c=typeof v==='string'?{key:v,upgraded:!!o.upgradedSlots?.includes(i)}:v;if(!C.cards[c.key])throw Error('Unknown deck card '+c.key);return E.card(r,c.key,!!c.upgraded);});
 r.stage=(spec.enemies.find(e=>e.id===o.enemy)?.stage||1)-1;r.depth=C.enemies[o.enemy].boss?4:0;
 if(o.artifacts?.length){r.artifactState={version:1,shopOnly:true,rng:(r.seed^0xa741c6e5)>>>0,owned:[],acquired:[],startingId:null,offer:null};for(const code of o.artifacts)A.acquire(r,A.id(code),'shop:'+r.stage+':deep:'+code);}
 r.hp=o.initialHp??Math.ceil(r.maxHp*(o.hpRatio??1));E.startBattle(r,o.enemy);
 if(o.initialFocus!==undefined)r.battle.focus=o.initialFocus;
 if(o.openingKeys){const b=r.battle,all=[...b.hand,...b.draw],size=Math.max(b.hand.length,o.openingKeys.length);b.hand=[];
  for(const key of o.openingKeys){const i=all.findIndex(c=>c.key===key);if(i<0)throw Error('Opening card absent '+key);b.hand.push(all.splice(i,1)[0]);}while(b.hand.length<size&&all.length)b.hand.push(all.pop());b.draw=all;
 }
 if(!x.E.validate(r))throw Error('Deep fixture invalid');return r;
}
function invariant(x,r){
 const b=r.battle,zones=['hand','draw','discard','exhaust','active','resolving'];
 const all=zones.flatMap(k=>b[k]||[]).concat(b.cardChoice?.committed?b.cardChoice.candidates:[]);
 if(all.length!==r.deck.length||new Set(all.map(c=>c.uid)).size!==r.deck.length)throw Error('UID conservation violated');
 if(b.hand.length>x.C.HAND_LIMIT||b.active.length>x.C.PASSIVE_LIMIT||new Set(b.active.map(c=>c.key)).size!==b.active.length)throw Error('Hand/Passive limit violated');
 if(b.energy<0||b.energy>x.E.energyLimit(r)||b.focus<0||b.focus>x.C.FOCUS_CAP)throw Error('Resource bounds violated');
 if(!x.E.validate(r))throw Error('Engine validator rejected boundary');
}
function checkpoint(x,r,o,m,label){
 invariant(x,r);m.work++;
 for(const uid of m.exhaustedEver)if(!r.battle.exhaust.some(c=>c.uid===uid))throw Error('An exhausted UID re-entered play: '+uid);
 for(const c of r.battle.exhaust)if(!m.exhaustedEver.includes(c.uid))m.exhaustedEver.push(c.uid);
 if(o.reload){const v=x.E.restore(copy(r));if(!v)throw Error('Restore failed at '+label);
  const mechanical=v=>({deck:v.deck,rng:v.rng,seq:v.seq,hp:v.hp,maxHp:v.maxHp,stats:v.stats,education:v.educationState,artifact:v.artifactState,battle:{...v.battle,log:[],currentIntent:{...v.battle.currentIntent,label:''}}});
  if(hash(mechanical(r))!==hash(mechanical(v)))throw Error('Restore changed mechanics at '+label);
  for(const k of Object.keys(r))delete r[k];Object.assign(r,v);m.reloads++;
 }
}
function actionFor(seed,turn,profile){
 const n=(Math.imul((seed^Math.imul(turn,0x9e3779b9))>>>0,1664525)+1013904223)>>>0,p=n%100;
 if(profile==='developing')return p<60?'independent':p<80?'retry_correct':'skip';
 if(profile==='struggling')return p<25?'independent':p<50?'retry_correct':'skip';
 if(['independent','assisted','retry_correct','wrong_only','skip'].includes(profile))return profile;
 throw Error('Unknown Predict profile '+profile);
}
function predictOne(x,r,o,m,check=()=>{}){
 const action=actionFor(o.seed,r.battle.turn,o.predictProfile||'independent');
 if(action==='skip'){m.predict.skipped++;return;}
 const {E,Q}=x,q=E.forecast(r);m.predict.reservations++;check('predict-reserved');
 if(q.exhausted){const v=E.completeExhaustedForecast(r);m.predict.exhausted++;m.predict.seals+=Number(!!v.sealOpened);}
 else{
  const question=Q.catalog[q.questionId];
  if(action==='assisted'){E.hint(r);check('predict-hint');}
  if(['wrong_only','retry_correct'].includes(action)){const wrong=question.choices.find(c=>c.id!==question.correctChoiceId).id;E.answer(r,wrong);m.predict.wrongAttempts++;check('predict-wrong');}
  if(action!=='wrong_only'){const answer=E.answer(r,question.correctChoiceId);m.predict.correct++;m.predict[answer.first?'independent':'assisted']++;m.predict.focus+=answer.focusGained||0;m.predict.seals+=Number(!!answer.sealOpened);check('predict-correct');}
 }
 E.closeForecast(r);check('predict-closed');
}
function observe(x,m){
 if(!x.deepObservers){
  const record=x.R.record;x.R.record=function(...args){const event=record(...args);if(event&&x.deepMeter){
   for(const id of event.artifactIds){const row=x.deepMeter.artifacts[id]||(x.deepMeter.artifacts[id]={records:0,positive:0,units:{},firstTurn:event.turn,labels:{}});row.records++;row.labels[event.label]=(row.labels[event.label]||0)+1;
    for(const v of event.results){if(v.kind==='delta'){row.units[v.unit]=(row.units[v.unit]||0)+v.value;if(v.value)row.positive++;}}
   }if(x.deepTrace)x.deepMeter.events.push(copy(event));
  }return event;};
  const log=x.L.record;x.L.record=function(...args){const e=log(...args);if(e&&x.deepMeter&&e.kind==='enemy-turn'){x.deepMeter.enemy.hpLost+=e.values.hpLost;x.deepMeter.enemy.blockUsed+=e.values.blockAbsorbed;x.deepMeter.enemy.hits+=e.values.hits;}
   if(e&&x.deepMeter&&['passive-trigger','passive-activation-gift'].includes(e.kind)){
    const row=x.deepMeter.passive[e.source]||(x.deepMeter.passive[e.source]={triggers:0,firstTurn:e.turn,byKind:{},values:{}});row.triggers++;for(const k of ['block','damage','amount','draw'])if(Number.isFinite(e.values?.[k]))row.values[k]=(row.values[k]||0)+e.values[k];row.byKind[e.kind]=(row.byKind[e.kind]||0)+1;
   }return e;};x.deepObservers=true;
 }x.deepMeter=m;
}
function snapshot(r){const b=r.battle;return {turn:b.turn,playerHp:r.hp,enemyHp:b.hp,energy:b.energy,focus:b.focus,block:b.block,strength:b.strength||0,agility:b.agility||0,defense:b.defense||0,seals:b.seals,phase:b.phase2?2:1,active:b.active.map(c=>c.key),piles:{hand:b.hand.length,draw:b.draw.length,discard:b.discard.length,exhaust:b.exhaust.length},intent:copy(b.currentIntent)};}
function simulate(x,input={}){
 const o={seed:1,enemy:'dealer',predictProfile:'independent',policy:'strategic',focus:'best',maxCycles:100,maxPlays:500,maxWork:10000,...input},m=meter();observe(x,m);x.deepTrace=!!o.trace;
 let r,last='create',cycles=0,lastTurn=0,initial,limitReason;
 try{
  r=create(x,o);initial=snapshot(r);const check=label=>checkpoint(x,r,o,m,label);check('start');
  while(r.scene==='battle'){
   if(cycles>=o.maxCycles||m.plays>=o.maxPlays||m.work>=o.maxWork){limitReason=cycles>=o.maxCycles?'cycles':m.plays>=o.maxPlays?'plays':'work';break;}
   if(lastTurn!==r.battle.turn){lastTurn=r.battle.turn;m.turns.push(snapshot(r));last='predict';predictOne(x,r,o,m,check);}
   if(x.E.cardChoice(r))throw Error('Unexpected unresolved choice');
   let choices=r.battle.hand.map(c=>{m.work++;const p=x.E.cardPlan(r,c);return {c,p,priority:p?B.priority(x,r,c,p):0};}).filter(v=>v.p?.legal);
   if(o.holdUntilTurn&&r.battle.turn<o.holdUntilTurn)choices=[];
   if(o.policy==='beginner')choices.sort((a,b)=>a.c.uid.localeCompare(b.c.uid));else choices.sort((a,b)=>b.priority-a.priority||a.c.uid.localeCompare(b.c.uid));
   if(o.preferKeys){const next=o.preferKeys.find(k=>!m.cards[k]);const idx=choices.findIndex(v=>v.c.key===next);if(idx>=0)choices.unshift(choices.splice(idx,1)[0]);}
   if(!choices.length){last='end-turn';x.E.endTurn(r);cycles++;check('end-turn');continue;}
   let selected=o.policy==='random'?choices[((Math.imul(o.seed^(m.plays+1),0x9e3779b9)>>>0)%choices.length)]:choices[0];
   if(o.focus!=='never'&&r.battle.focus&&!r.battle.boostUsed&&!r.battle.boostArmed){
    let best=null;for(const v of choices){r.battle.boostArmed=true;const p=x.E.cardPlan(r,v.c);r.battle.boostArmed=false;m.work++;
     const delta=p?.focused?B.priority(x,r,v.c,p)-v.priority:-Infinity;if(!best||delta>best.delta)best={...v,delta};}
    if(best&&best.delta>0){selected=best;x.E.armFocus(r);check('focus-armed');}
   }
   const before=r.stats.cardsPlayed;last='play:'+selected.c.key;x.E.playCard(r,selected.c.uid);check('play-or-prechoice');
   while(x.E.cardChoice(r)){
    if(m.work>=o.maxWork)throw Object.assign(Error('Choice work limit'),{censored:true});
    const steps={count:0};B.choose(x,r,steps);m.work+=steps.count;m.choices++;check('choice-resolved-or-next');
   }
   const tx=r.battle.cardCombat.receipts.at(-1);if(r.stats.cardsPlayed!==before+1)throw Error('Card did not commit exactly once');
   m.plays++;m.energySpent+=tx.energy;m.focusSpent+=tx.focus;
   const row=m.cards[selected.c.key]||(m.cards[selected.c.key]={plays:0,firstTurn:r.battle.turn,energy:0,focus:0,damage:0});row.plays++;row.energy+=tx.energy;row.focus+=tx.focus;row.damage+=tx.damageEvents.reduce((s,e)=>s+e.hpLost,0);
   if(o.cardTrace)m.events.push({kind:'card-receipt',tx:copy(tx),state:snapshot(r)});
  }
  const status=r.scene==='battle'?'BENCHMARK_LIMIT_CENSORED':r.scene==='defeat'?'LOSS':'WIN',utility=status==='BENCHMARK_LIMIT_CENSORED'?-10:100*(status==='WIN')+20*(status==='LOSS'?0:r.hp/r.maxHp)-Math.min(10,r.battle.turn/2);
  return {status,utility,limitReason,initial,final:snapshot(r),finalRng:r.rng,finalArtifactRng:r.artifactState?.rng,validFinal:x.E.validate(r),...m,...(o.returnRun?{run:copy(r)}:{})};
 }catch(error){return {status:error.censored?'BENCHMARK_LIMIT_CENSORED':'INVALID_POLICY_OR_ENGINE',utility:error.censored?-10:null,error:error.message,last,initial,final:r?.battle?snapshot(r):null,...m,...(o.returnRun&&r?{run:copy(r)}:{})};}
 finally{x.deepMeter=null;x.deepTrace=false;}
}
function outcome(r){return {status:r.status,utility:r.utility,final:r.final,finalRng:r.finalRng,finalArtifactRng:r.finalArtifactRng,predict:r.predict,cards:r.cards,plays:r.plays,energySpent:r.energySpent,focusSpent:r.focusSpent,passive:r.passive,artifacts:r.artifacts};}
module.exports={create,meter,predictOne,simulate,outcome,invariant,checkpoint,actionFor,hash,snapshot};
