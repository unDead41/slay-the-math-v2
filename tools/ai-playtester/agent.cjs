'use strict';
const {publicPool,chooseChoice}=require('./choice-policy.cjs');
const VERSION='sampled-turn-search-4',SKILLS=['beginner','intermediate','expert'];
const LIMITS=Object.freeze({turns:3,samples:3,width:6,playsPerTurn:3,perRollout:14,nodes:300,choices:4}),copy=v=>JSON.parse(JSON.stringify(v));
function planningWorld(run,sample=0){
 const b=run.battle,pool=publicPool(run);
 let seed=(0x51a7e001^run.seed^Math.imul(b.turn,2654435761)^Math.imul(sample+1,2246822519))>>>0;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const r=copy({...run,checkpoint:null,rng:seed,calculationState:undefined,battle:{...b,draw:[],log:[],combatLog:undefined},...(run.artifactState?{artifactState:{...run.artifactState,rng:(seed^0x6a09e667)>>>0}}:{})});
 r.battle.draw=copy(pool);for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[r.battle.draw[i],r.battle.draw[j]]=[r.battle.draw[j],r.battle.draw[i]];}r.rng=seed;
 return r;
}
function incoming(x,r){
 const b=r.battle,it=b.currentIntent||{},projected={...r,battle:{...b,cardCombat:copy(b.cardCombat)}};let total=0;
 for(let i=0;i<(it.hits||1);i++)total+=x.CC.enemyDamage(projected,it.damage||0).amount;
 return Math.max(0,total-b.block);
}
function immediate(x,r,c,p,baseIncoming=incoming(x,r)){
 const damage=p.damageEvents.reduce((n,e)=>n+e.hpLost,0);let after=null;
 const modified=()=>after??=( {...r,battle:{...r.battle,cardCombat:{...r.battle.cardCombat,statuses:copy(r.battle.cardCombat.statuses)}}});
 let draw=0,selection=0,delayed=0,support=0;
 for(const a of p.actions){
  if(a.op==='grant_block'&&!a.timing&&a.value)modified().battle.block+=a.value;
  if(a.op==='apply_status'&&a.status==='weak'&&a.target!=='self'&&a.value){const state=modified().battle.cardCombat;state.statuses.enemy.weak=Math.min(3,state.statuses.enemy.weak+a.value);}
  if(a.op==='apply_status'&&a.status==='vulnerable')support+=1.3*a.value;
  if(a.op==='apply_status'&&a.status==='thorns')support+=a.value*Math.min(r.battle.currentIntent.hits||1,2)*.6;
  if(a.op==='draw')a.timing?delayed+=a.value*.8:draw+=a.value;
  if(a.op==='grant_block'&&a.timing)delayed+=a.value*.5;
  if(['search_category','look_choose_reorder','look_choose_discard','look_replace_take','return_discard_card'].includes(a.op))selection++;
 }
 if(p.card.category==='passive'){
  const n=r.deck.length,attack=r.deck.filter(c=>x.C.cards[c.key].role==='attack').length/n,guard=r.deck.filter(c=>x.C.cards[c.key].role==='guard').length/n,skills=r.deck.filter(c=>x.C.cards[c.key].role==='tactic').length/n;
  for(const a of p.passive.effects){const v=p.values[a.value]||0;
   if(a.op==='add_attribute')support+=v*({strength:1.2+attack*4,agility:.8+guard*4,defense:4}[a.attribute]||0);
   if(a.op==='draw')support+=v*2.8;
   if(a.op==='grant_block')support+=v*(p.card.id==='stm.passive.grimoire_ward'?skills*3:.4);
   if(a.op==='retain_block')support+=v*guard*1.5;
   if(a.op==='fixed_hp_damage')support+=v*.9;
   if(a.op==='gain_focus')support+=v*.7;
  }
 }
 const mitigation=after?Math.max(0,baseIncoming-incoming(x,after)):0,needed=Number(r.hp<=baseIncoming)*1.2;
 return damage+(1.5+needed)*mitigation+Math.min(draw,x.C.HAND_LIMIT-p.context.handAfterPlay)*(r.battle.energy>p.payEnergy?2.1:.4)+selection*(r.battle.energy>p.payEnergy?3:1)+delayed+support-.15*p.payEnergy-.7*p.payFocus+(damage>=r.battle.hp?1000:0);
}
function candidates(x,r){
 const out=[];let baseline;
 const projections=[false,true].map(focus=>({...r,battle:{...r.battle,boostArmed:focus}}));
 for(const c of r.battle.hand){
  const plain=x.E.cardPlan(projections[0],c),focusAllowed=r.battle.focus&&!r.battle.boostUsed&&plain?.card.focus_eligible!==false;
  for(const focus of focusAllowed?[false,true]:[false]){const p=focus?x.E.cardPlan(projections[1],c):plain;
   if(p?.legal&&(!focus||p.focused)){baseline??=incoming(x,r);out.push({uid:c.uid,focus,p,merit:immediate(x,projections[Number(focus)],c,p,baseline)});}
  }
 }
 return out.sort((a,b)=>b.merit-a.merit||Number(a.focus)-Number(b.focus)||a.uid.localeCompare(b.uid));
}
function choice(x,r){return chooseChoice(x,r,{immediate,incoming});}
function value(x,root,r){
 if(r.hp<=0||r.scene==='defeat')return -10000+(root.battle.hp-r.battle.hp);
 if(r.battle.hp<=0||r.scene!=='battle')return 10000+2*r.hp;
 return root.battle.hp-r.battle.hp+2.5*(r.hp-root.hp)-.35*incoming(x,r)+.2*(r.battle.strength||0)+.15*(r.battle.agility||0)+.4*(r.battle.defense||0)+.08*r.battle.energy+.5*r.battle.focus;
}
function rollout(x,run,first,sample){
 let r=planningWorld(run,sample),calls=0,reveals=0,plays=0,depth=0,started=false,truncated=false,last=copy(r);const initialTurn=r.battle.turn,states=[copy(r)];
 const invoke=fn=>{if(calls>=LIMITS.perRollout)return false;calls++;fn();return true;};
 while(r.scene==='battle'&&r.battle.turn<initialTurn+LIMITS.turns){
  if(calls>=LIMITS.perRollout){truncated=true;break;}
  const a=!started?first:plays<LIMITS.playsPerTurn?candidates(x,r).find(c=>c.merit>0):null;started=true;
  if(a){
   const cost=1+Number(!!r.battle.boostArmed!==a.focus);if(calls+cost>LIMITS.perRollout){truncated=true;break;}
   const before=new Set(r.battle.hand.map(c=>c.uid));if(!!r.battle.boostArmed!==a.focus)invoke(()=>x.E.armFocus(r));invoke(()=>x.E.playCard(r,a.uid));
   let choices=0;while(x.E.cardChoice(r)&&choices<LIMITS.choices&&calls<LIMITS.perRollout){invoke(()=>x.E.chooseCardOption(r,choice(x,r)));choices++;}
   if(x.E.cardChoice(r)){truncated=true;r=copy(last);break;}
   if(r.battle.hand.some(c=>!before.has(c.uid)))reveals++;plays++;if(r.battle.turn===initialTurn)depth=plays;last=copy(r);
  }else{
   invoke(()=>x.E.endTurn(r));plays=0;last=copy(r);states.push(copy(r));
  }
 }
 if(r.scene!=='battle'){while(states.length<=LIMITS.turns)states.push(copy(r));}
 if(!x.E.validate(r))throw Error('Invalid sampled planning transition.');
 return {states,last,nodes:calls,reveals,depth,truncated};
}
function explain(c,skill,meta){
 const action=c?c.p.card.name+(c.focus?' with Focus':'')+'; '+c.p.payEnergy+' Energy, '+c.p.payFocus+' Focus. ':'End turn. ';
 return action+(skill==='expert'?'Compared '+meta.samples+' sampled draw worlds through '+meta.horizonTurns+'/'+LIMITS.turns+' completed turns ('+meta.searchNodes+' transitions). Bounded heuristic continuations; future Predict gains are not modeled.':skill+' uses current visible legal plans and support effects.');
}
function createAgent(x,{skill='intermediate'}={}){
 if(!SKILLS.includes(skill))throw Error('Unknown AI skill: '+skill);
 return {version:VERSION+'/'+skill,choose(run){if(run?.scene!=='battle'||!x.E.cardChoice(run))throw Error('A visible card choice is required.');return choice(x,run);},decide(run){
  if(run?.scene!=='battle'||run.battle.question||run.battle.cardChoice)throw Error('AI decision requires a battle without a pending question or choice.');
  const options=candidates(x,run);let selected=null,meta={searchNodes:0,depth:0,horizonTurns:0,samples:0,sampledReveals:0,truncatedRollouts:0,hiddenInformationUsed:false};
  if(skill==='beginner'){
   const plain=options.filter(c=>!c.focus).sort((a,b)=>a.uid.localeCompare(b.uid)),n=(Math.imul((run.seed^run.battle.turn^Math.imul(run.stats.cardsPlayed+1,2654435761))>>>0,1664525)+1013904223)>>>0;selected=plain[n%Math.max(1,plain.length)]||null;meta.depth=selected?1:0;
  }else if(skill==='intermediate'){selected=options.find(c=>c.merit>0)||null;meta.depth=selected?1:0;}
  else if(options.length){
   const roots=[null,...options.slice(0,LIMITS.width)],evaluations=roots.map(c=>({c,worlds:Array.from({length:LIMITS.samples},(_,i)=>rollout(x,run,c,i))}));
   const cutoff=Math.min(LIMITS.turns,...evaluations.flatMap(e=>e.worlds.map(w=>w.states.length-1)));let best=-Infinity;
   for(const e of evaluations){const score=e.worlds.reduce((n,w)=>n+value(x,run,w.states[cutoff]),0)/LIMITS.samples;if(score>best+1e-9){best=score;selected=e.c;meta.depth=Math.max(...e.worlds.map(w=>w.depth));}
    for(const w of e.worlds){meta.searchNodes+=w.nodes;meta.sampledReveals+=w.reveals;meta.truncatedRollouts+=Number(w.truncated);}
   }
   meta.horizonTurns=cutoff;meta.samples=LIMITS.samples;
  }
  return {kind:selected?'play':'endTurn',...(selected?{uid:selected.uid,focus:selected.focus}:{}),...meta,explanation:explain(selected,skill,meta)};
 }};
}
module.exports={createAgent,planningWorld,SKILLS,VERSION,LIMITS};
