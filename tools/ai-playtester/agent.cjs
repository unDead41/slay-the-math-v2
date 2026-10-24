'use strict';
const {priority}=require('../balance/combat.cjs');
const VERSION='visible-turn-search-1',SKILLS=['beginner','intermediate','expert'];
const LIMITS=Object.freeze({depth:3,nodes:48,width:6}),copy=v=>JSON.parse(JSON.stringify(v));
const revealing=new Set(['draw','search_category','look_choose_reorder','look_choose_discard','look_replace_take','return_discard_card']);
function planningClone(run){const r=copy(run);r.rng=0x51a7e001;r.battle.draw.sort((a,b)=>a.uid.localeCompare(b.uid));if(r.artifactState)r.artifactState.rng=0x51a7e002;return r;}
function incoming(r){
 const b=r.battle,s=b.cardCombat?.statuses,it=b.currentIntent||{};let weak=s?.enemy?.weak||0,vulnerable=s?.self?.vulnerable||0,total=0;
 for(let i=0;i<(it.hits||1);i++){total+=Math.max(0,(it.damage||0)-(weak?2:0)+(vulnerable?2:0)-(b.defense||0));weak=Math.max(0,weak-1);vulnerable=Math.max(0,vulnerable-1);}
 return Math.max(0,total-b.block);
}
function candidates(x,r){
 const out=[];
 for(const c of r.battle.hand)for(const focus of [false,true]){
  if(focus&&(!r.battle.focus||r.battle.boostUsed))continue;
  const projected={...r,battle:{...r.battle,boostArmed:focus}},p=x.E.cardPlan(projected,c);
  if(p?.legal&&(!focus||p.focused))out.push({uid:c.uid,focus,p,merit:priority(x,projected,c,p)-(focus?.7:0)});
 }
 return out.sort((a,b)=>b.merit-a.merit||Number(a.focus)-Number(b.focus)||a.uid.localeCompare(b.uid));
}
function value(root,r){
 if(r.battle.hp<=0)return 10000;
 if(r.hp<=0)return -10000;
 const threat=incoming(r),b=r.battle;
 return root.battle.hp-b.hp+1.5*(incoming(root)-threat)-(threat>=r.hp?10000:0)+.35*(b.strength-root.battle.strength)+.25*(b.agility-root.battle.agility)+.5*(b.defense-root.battle.defense)+.12*b.energy+.7*b.focus;
}
function unresolvedValue(root,r,c){const damage=c.p.damageEvents.reduce((n,e)=>n+e.hpLost,0);return damage>=r.battle.hp?10000:value(root,r)+Math.min(12,Math.max(0,c.merit))-.12*c.p.payEnergy-.7*c.p.payFocus;}
function describe(c,skill,depth){return c?`${skill}: ${c.p.card.name}${c.focus?' with Focus':''}; ${c.p.payEnergy} Energy, ${c.p.damageEvents.reduce((n,e)=>n+e.hpLost,0)} projected HP damage. `+(skill==='expert'?`Compared visible sequences up to ${depth} plays; unknown draws use a heuristic.`:'Uses current visible legal card plans.'):'End turn: no searched visible sequence improves the current position.';}
function createAgent(x,{skill='intermediate'}={}){
 if(!SKILLS.includes(skill))throw Error('Unknown AI skill: '+skill);
 return {version:VERSION+'/'+skill,decide(run){
  if(run?.scene!=='battle'||run.battle.question||run.battle.cardChoice)throw Error('AI decision requires a battle without a pending question or choice.');
  const root=planningClone(run),options=candidates(x,root);let selected=null,depth=0,nodes=0,revealStops=0;
  if(skill==='beginner'){
   const plain=options.filter(c=>!c.focus).sort((a,b)=>a.uid.localeCompare(b.uid)),n=(Math.imul((run.seed^run.battle.turn^Math.imul(run.stats.cardsPlayed+1,2654435761))>>>0,1664525)+1013904223)>>>0;
   selected=plain[n%Math.max(1,plain.length)]||null;depth=selected?1:0;
  }else if(skill==='intermediate'){selected=options.find(c=>c.merit>0)||null;depth=selected?1:0;}
  else{
   let best=value(root,root);
   function search(r,first,level){
    if(level>=LIMITS.depth||nodes>=LIMITS.nodes)return;
    for(const c of candidates(x,r).slice(0,LIMITS.width)){
     if(nodes>=LIMITS.nodes)break;nodes++;
     const start=first||c;let score,next=null,stopped=false;
     if(c.p.actions.some(a=>revealing.has(a.op))){score=unresolvedValue(root,r,c);revealStops++;stopped=true;}
     else{
      next=copy(r);const hand=new Set(next.battle.hand.map(v=>v.uid)),rng=next.rng,artifactRng=next.artifactState?.rng;
      if(!!next.battle.boostArmed!==c.focus)x.E.armFocus(next);x.E.playCard(next,c.uid);
      const hidden=next.battle.hp>0&&(next.battle.cardChoice||next.rng!==rng||next.artifactState?.rng!==artifactRng||next.battle.hand.some(v=>!hand.has(v.uid)));
      if(hidden){score=unresolvedValue(root,r,c);revealStops++;stopped=true;}else score=value(root,next);
     }
     if(score>best+1e-9){best=score;selected=start;depth=level+1;}
     if(!stopped&&next.scene==='battle')search(next,start,level+1);
    }
   }
   search(root,null,0);
  }
  return {kind:selected?'play':'endTurn',...(selected?{uid:selected.uid,focus:selected.focus}:{}),explanation:describe(selected,skill,depth),searchNodes:nodes,depth,revealStops,hiddenInformationUsed:false};
 }};
}
module.exports={createAgent,SKILLS,VERSION,LIMITS};
