'use strict';
// Heuristic decision values are policy weights, not card CP or gameplay changes.
const passiveWeights={'Blazing Spirit':8,'Growing Flame':6,'Swift Step':7,'Battle Rhythm':6,'Rune Armor':8,'Lasting Shield':5,'Grimoire Ward':6,'Ember Core':6,'Clear Mind':7,'Last Ember':5};
function planValue(view,p){
 if(!p.legal)return -Infinity;
 let score=p.damage+1.15*Math.min(p.block,view.neededBlock);
 if(p.damage>=view.enemyHp&&p.damage>0)score+=100;
 score+=p.draw*2.5+p.selection*2+p.delayed*1.4;
 score+=p.weak*Math.min(2,view.neededBlock)+p.vulnerable*(view.energy>p.energy?1.8:.5)+p.thorns*(view.incoming>0?1.5:0);
 if(p.category==='passive')score+=(passiveWeights[p.name]||5)*(view.enemyHp>12?1:.3);
 if(p.category==='passive'&&view.active.length>=3){const worst=Math.min(...view.active.map(c=>passiveWeights[c.name]||5));if((passiveWeights[p.name]||5)<=worst)return -Infinity;}
 return score;
}
function chooseCombatAction(view){
 const choices=[];
 for(const card of view.cards)for(const p of [card.normal,card.focused].filter(Boolean)){
  const score=planValue(view,p)-(p.focus?.5:0);
  if(score>0)choices.push({kind:'play',uid:card.uid,focus:!!p.focus,score});
 }
 choices.sort((a,b)=>b.score-a.score||Number(a.focus)-Number(b.focus)||a.uid.localeCompare(b.uid));
 return choices[0]||{kind:'endTurn'};
}
module.exports={chooseCombatAction,planValue,passiveWeights};
