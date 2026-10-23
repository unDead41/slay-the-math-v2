'use strict';
const {spec}=require('./candidate.cjs');
const S='stm.',REF=[S+'attack.rune_strike',S+'defend.rune_guard',S+'skill.quick_study'];
const mean=a=>a.reduce((s,n)=>s+n,0)/a.length;
function interval(a){if(!a.length)return null;const m=mean(a);if(a.length===1)return {mean:m,low:null,high:null,n:1};const sd=a.length>1?Math.sqrt(a.reduce((s,n)=>s+(n-m)**2,0)/(a.length-1)):0,z=({2:12.706,3:4.303,4:3.182,5:2.776,6:2.571,7:2.447,8:2.365,9:2.306,10:2.262})[a.length]||(a.length>=50?2.01:2.101);return {mean:m,low:m-z*sd/Math.sqrt(a.length),high:m+z*sd/Math.sqrt(a.length),n:a.length};}
function screen(cards){const out=[];for(let i=0;i<cards.length;i++)for(let j=i;j<cards.length;j++){
 const a=cards[i],b=cards[j],tags=[];
 if([a,b].some(c=>c.category==='passive'))tags.push('persistent_setup');
 if([a,b].some(c=>c.actions.some(x=>x.op==='damage'&&(x.repeat||c.actions.filter(y=>y.op==='damage').length>1))))tags.push('multi_hit');
 if([a,b].some(c=>c.energy.amount===0))tags.push('zero_energy');
 if([a,b].some(c=>c.category==='skill'))tags.push('draw_or_selection');
 if([a,b].some(c=>c.lifecycle==='exhaust'))tags.push('exhaust');
 out.push({a:a.id,b:b.id,sameCard:i===j,tags,screenStatus:'STATIC_RULE_SCREEN_ONLY',icp:null,ccp:null,interaction:null});
 }return out;
}
function factorialSummary(rows,k){
 const seeds=[...new Set(rows.map(r=>r.seed))],n=seeds.length,expected=1<<k;
 const invalid=rows.some(r=>r.result.status==='INVALID_POLICY_OR_ENGINE')||rows.length!==n*expected||seeds.some(seed=>{const masks=rows.filter(r=>r.seed===seed).map(r=>r.mask);return new Set(masks).size!==expected||masks.some(m=>!Number.isInteger(m)||m<0||m>=expected);});
 const censored=rows.some(r=>r.result.status==='BENCHMARK_LIMIT_CENSORED');
 if(invalid)return {n,status:'INVALID_POLICY_OR_ENGINE',icp:null,ccp:null,interaction:null};
 const groups=seeds.map(seed=>rows.filter(r=>r.seed===seed).sort((a,b)=>a.mask-b.mask).map(r=>r.result.utility));
 const total=groups.map(u=>u[expected-1]-u[0]);
 const interaction=groups.map(u=>k===1?u[1]-u[0]:k===2?u[3]-u[1]-u[2]+u[0]:u[7]-u[6]-u[5]-u[3]+u[4]+u[2]+u[1]-u[0]);
 const bounded={ccp:interval(total),interaction:interval(interaction)};
 if(k===3)bounded.totalSynergy=interval(groups.map(u=>u[7]-u[1]-u[2]-u[4]+2*u[0]));
 const partial=Array.from({length:k},(_,i)=>interval(groups.map(u=>u[1<<i]-u[0])));
 return {n,status:censored?'EXPLORATORY_CENSORED':'MEASURED_EXPLORATORY',icp:censored?null:partial,ccp:censored?null:bounded.ccp,interaction:censored?null:bounded.interaction,totalSynergy:censored?null:bounded.totalSynergy,boundedEstimate:bounded,censoredVariants:rows.filter(r=>r.result.status==='BENCHMARK_LIMIT_CENSORED').length,winsByMask:Array.from({length:expected},(_,m)=>rows.filter(r=>r.mask===m&&r.result.status==='WIN').length)};
}
function instrument(x){
 if(x.instrumented)return;x.instrumented=true;
 for(const [owner,name]of [[x.A,'beforeEnemy'],[x.CC,'startTurn'],[x.CC,'afterEnemyHit'],[x.A,'startTurn']]){
  const original=owner[name];owner[name]=function(r,...args){const before=r.battle?.block||0,v=original(r,...args);if(x.meter)x.meter.blockCreated+=Math.max(0,(r.battle?.block||0)-before);return v;};
 }
 const reset=x.CC.resetBlock;x.CC.resetBlock=function(r){const before=r.battle.block,retained=reset(r);if(x.meter){x.meter.blockExpired+=before-retained;x.meter.blockCarried+=retained;}return retained;};
}
function baseDeck(archetype='mixed'){
 const attack=[S+'attack.rune_strike',S+'attack.weak_point',S+'attack.twin_shot'];
 const guard=[S+'defend.rune_guard',S+'defend.cinder_guard',S+'defend.flash_ward'];
 const skill=[S+'skill.quick_study',S+'skill.read_ahead',S+'skill.clear_choice'];
 return archetype==='block'?[...guard,...guard,...attack,...skill]:archetype==='attack'?[...attack,...attack,...guard,...skill]:[...attack,...guard,...skill,S+'attack.rune_strike',S+'defend.rune_guard',S+'attack.weak_point'];
}
function create(x,o){
 const {E,A,C}=x,r=E.newRun(o.seed,'learn');delete r.route;r.mode='challenge';r.seq=0;
 const slots=o.slots||REF.slice(0,2),keys=[...slots,...baseDeck(o.archetype).slice(0,12-slots.length)];
 r.deck=keys.map((k,i)=>E.card(r,k,!!o.upgradedSlots?.includes(i)));r.stage=(spec.enemies.find(e=>e.id===o.enemy)?.stage||1)-1;r.depth=C.enemies[o.enemy].boss?4:0;
 if(o.artifacts?.length){r.artifactState={version:1,shopOnly:true,rng:(r.seed^0xa741c6e5)>>>0,owned:[],acquired:[],startingId:null,offer:null};for(const code of o.artifacts)A.acquire(r,A.id(code),'shop:'+r.stage+':benchmark:'+code);}
 r.hp=o.initialHp??Math.ceil(r.maxHp*(o.hpRatio??1));E.startBattle(r,o.enemy);
 if(o.initialFocus!==undefined)r.battle.focus=o.initialFocus;
 if(o.openingSlots){const b=r.battle,size=b.hand.length,all=[...b.draw,...b.hand];b.hand=[];for(const c of r.deck.slice(0,slots.length)){const i=all.findIndex(v=>v.uid===c.uid);b.hand.push(all.splice(i,1)[0]);}while(b.hand.length<size)b.hand.push(all.pop());b.draw=all;}
 if(!E.validate(r))throw Error('Invalid benchmark initialization');return r;
}
// These are policy priorities, never CP scores. No hidden pile identities/order are read.
function priority(x,r,c,p){
 const damage=p.damageEvents.reduce((s,e)=>s+e.hpLost,0),incoming=(r.battle.currentIntent.damage||0)*(r.battle.currentIntent.hits||1),need=Math.max(0,incoming-r.battle.block);
 let block=p.actions.filter(a=>a.op==='grant_block'&&!a.timing).reduce((s,a)=>s+a.value,0);
 let draw=p.actions.filter(a=>a.op==='draw'&&!a.timing).reduce((s,a)=>s+a.value,0);
 let value=damage+Math.min(need,block)*(r.hp<=incoming?3:1.35)+Math.max(0,block-need)*.08+Math.min(draw,10-p.context.handAfterPlay)*(p.context.energy>p.payEnergy?2.5:.5);
 if(p.card.category==='passive')value+=(r.battle.hp>20?8:1)+(p.card.name==='Rune Armor'?3:0);
 if(p.actions.some(a=>['look_choose_reorder','look_choose_discard','look_replace_take','search_category','return_discard_card'].includes(a.op)))value+=p.context.energy>p.payEnergy?4:1;
 if(p.actions.some(a=>a.op==='apply_status'&&a.status==='weak'))value+=Math.min(need,2)*1.5;
 if(p.actions.some(a=>a.op==='apply_status'&&a.status==='vulnerable'))value+=1.5;
 if(p.actions.some(a=>a.timing))value+=2;
 if(damage>=r.battle.hp)value+=1000;
 return value-.15*p.payEnergy;
}
function choose(x,r,steps){
 const {E}=x,ch=E.cardChoice(r);if(!ch)return;
 const rank=c=>{const p=E.cardPlan(r,c);return p?priority(x,r,c,p):0;};
 if(ch.kind==='card_search'){const damage=(r.battle.currentIntent.damage||0)*(r.battle.currentIntent.hits||1);E.chooseCardOption(r,damage>r.battle.block+3?'defend':'attack');}
 else if(ch.kind==='burning_page')E.chooseCardOption(r,'take');
 else{
  const list=ch.candidates.slice().sort((a,b)=>rank(b)-rank(a)||a.uid.localeCompare(b.uid));
  if(ch.kind==='passive_swap'||ch.kind==='passive_trim')E.chooseCardOption(r,list.at(-1).uid);
  else if(ch.kind==='read_ahead')E.chooseCardOption(r,{take:list[0].uid,order:list.slice(1).map(c=>c.uid)});
  else E.chooseCardOption(r,list[0].uid);
 }steps.count++;
}
function predict(x,r,o,m){
 if(o.predict==='none')return;
 const {E,Q}=x,q=E.forecast(r);m.apiSteps++;
 if(q.exhausted)E.completeExhaustedForecast(r);
 else{
  const guided=o.predict==='guided'||(o.predict==='mixed'&&((Math.imul(o.seed^r.battle.turn,2654435761)>>>0)%10>=7));
  if(guided)E.hint(r);
  E.answer(r,Q.catalog[q.questionId].correctChoiceId);m.predictions++;if(guided)m.guidedPredictions++;
 }
 E.closeForecast(r);
}
function simulate(x,input={}){
 instrument(x);const o={seed:1,enemy:'wisp',policy:'strategic',predict:'mixed',focus:'best',maxCycles:100,maxPlays:500,maxSteps:10000,...input};
 const m={blockCreated:0,blockUsed:0,blockExpired:0,blockCarried:0,cardsToHand:0,energySpent:0,energyUnspent:0,focusSpent:0,focusEarned:0,focusUnused:0,apiSteps:0,predictions:0,guidedPredictions:0,damage:0,cycles:0,plays:0,choices:0,energyMin:Infinity,order:{requested:o.order||null,played:[],firstTurnCompleted:false},passiveTriggers:0};
 x.meter=m;let r,lastAction='create',steps={count:0},targetSeen=false;
 try{
  r=create(x,o);const initial={hp:r.hp,maxHp:r.maxHp,focus:r.battle.focus,energy:r.battle.energy,deck:r.deck.map(c=>({key:c.key,upgraded:c.upgraded})),artifacts:x.A.owned(r).map(a=>a.id)};
  const targetUid=r.deck[o.targetSlot??0].uid,orderUids=(o.order||[]).map(i=>r.deck[i].uid);
  const limit=()=>m.cycles>=o.maxCycles||m.plays>=o.maxPlays||steps.count>=o.maxSteps;
  let status=null,lastPredictionTurn=0;
  while(r.scene==='battle'){
   if(limit()){status='BENCHMARK_LIMIT_CENSORED';break;}
   if(lastPredictionTurn!==r.battle.turn){lastAction='predict';const before=r.battle.focus;predict(x,r,o,m);m.focusEarned+=Math.max(0,r.battle.focus-before);lastPredictionTurn=r.battle.turn;}
   const b=r.battle;let choices=[];
   for(const c of b.hand){const p=x.E.cardPlan(r,c);steps.count++;if(p?.legal)choices.push({c,p,priority:priority(x,r,c,p)});}
   if(o.policy==='beginner')choices.sort((a,b)=>a.c.uid.localeCompare(b.c.uid));else choices.sort((a,b)=>b.priority-a.priority||a.c.uid.localeCompare(b.c.uid));
   const next=orderUids.find(uid=>!m.order.played.some(e=>e.uid===uid));
   if(next){const i=choices.findIndex(v=>v.c.uid===next);if(i>=0)choices.unshift(choices.splice(i,1)[0]);}
   if(!choices.length){
    lastAction='endTurn';m.energyUnspent+=b.energy;const hp=b.hp,logBefore=b.combatLog?.seq||0;
    Eend();
    function Eend(){x.E.endTurn(r);}
    m.cycles++;steps.count++;m.damage+=Math.max(0,hp-r.battle.hp);
    for(const entry of r.battle.combatLog?.entries||[])if(entry.id>logBefore&&entry.kind==='enemy-turn')m.blockUsed+=entry.values.blockAbsorbed;
    if(r.scene==='battle')m.cardsToHand+=r.battle.hand.length;
    continue;
   }
   const selected=choices[0];
   // Choose the best current marginal opportunity, or reserve the same stock for later.
   if(b.focus>0&&!b.boostUsed&&!b.boostArmed){
    const allow=o.focus==='best'||o.focus==='target'&&selected.c.uid===targetUid||o.focus==='save'&&targetSeen&&selected.c.uid!==targetUid;
    if(allow){const was=b.boostArmed;b.boostArmed=true;const p=x.E.cardPlan(r,selected.c);b.boostArmed=was;steps.count++;
     if(p.focused){
      let best=true;
      if(o.focus!=='target')for(const other of choices){const armed=b.boostArmed;b.boostArmed=true;const f=x.E.cardPlan(r,other.c);b.boostArmed=armed;steps.count++;if(f.focused&&priority(x,r,other.c,f)-other.priority>priority(x,r,selected.c,p)-selected.priority+.001)best=false;}
      if(best)x.E.armFocus(r);
     }
    }
   }
   const before={hand:new Set(b.hand.map(c=>c.uid)),energy:b.energy,block:b.block,hp:b.hp,focus:b.focus,plays:r.stats.cardsPlayed,log:b.combatLog?.seq||0,turn:b.turn};
   lastAction='play:'+selected.c.key;x.E.playCard(r,selected.c.uid);steps.count+=1+selected.p.actions.length+selected.p.damageEvents.length;
   while(x.E.cardChoice(r)){if(steps.count>=o.maxSteps)throw Error('Committed choice exceeded evaluator budget');choose(x,r,steps);m.choices++;}
   const after=r.battle;m.plays+=r.stats.cardsPlayed-before.plays;m.energySpent+=after.cardCombat.receipts.at(-1)?.energy||0;m.energyMin=Math.min(m.energyMin,after.energy);
   m.blockCreated+=Math.max(0,after.block-before.block);m.damage+=Math.max(0,before.hp-after.hp);
   m.cardsToHand+=after.hand.filter(c=>!before.hand.has(c.uid)).length;
   const receipt=after.cardCombat.receipts.at(-1);m.focusSpent+=receipt?.focus||0;m.focusEarned+=Math.max(0,after.focus-before.focus+(receipt?.focus||0));
   for(const e of after.combatLog?.entries||[])if(e.id>before.log&&e.kind==='passive-trigger')m.passiveTriggers++;
   if(selected.c.uid===targetUid)targetSeen=true;
   if(orderUids.includes(selected.c.uid)&&!m.order.played.some(e=>e.uid===selected.c.uid))m.order.played.push({uid:selected.c.uid,turn:before.turn,key:selected.c.key,energy:receipt?.energy||0});
   if(m.order.played.length===orderUids.length&&orderUids.length)m.order.firstTurnCompleted=m.order.played.every(e=>e.turn===1);
  }
  status=status||(r.scene==='defeat'?'LOSS':'WIN');m.focusUnused=r.battle.focus;m.energyMin=Number.isFinite(m.energyMin)?m.energyMin:r.battle.energy;m.apiSteps+=steps.count;
  const turns=r.battle.turn,utility=status==='BENCHMARK_LIMIT_CENSORED'?-10:100*(status==='WIN')+20*(status==='LOSS'?0:r.hp/r.maxHp)-Math.min(10,turns/2);
  return {status,utility,finalHp:r.hp,maxHp:r.maxHp,playerTurns:turns,...m,initial,finalRng:r.rng,artifactState:r.battle.artifacts||null,phase:r.battle.phase2?2:1,seals:r.battle.seals,targetSeen,validFinal:x.E.validate(r)};
 }catch(error){return {status:'INVALID_POLICY_OR_ENGINE',utility:null,error:error.message,lastAction,seed:o.seed,enemy:o.enemy,...m,validFinal:r?x.E.validate(r):null};}
 finally{x.meter=null;}
}
module.exports={simulate,create,screen,factorialSummary,interval,REF,baseDeck};
