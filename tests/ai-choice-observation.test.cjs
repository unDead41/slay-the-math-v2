'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {loadMaster}=require('../tools/balance/master/loader.cjs'),{combat}=require('../tools/ai-playtester/experiments.cjs'),{createAgent}=require('../tools/ai-playtester/agent.cjs');
for(const name of ['Read Ahead','Clear Choice','Card Search','Recall','Burning Page'])test('AI '+name+' choice metrics equal real enemy-turn Block absorption',()=>{
 const x=loadMaster(),id=x.data.cards.find(c=>c.name===name).id,original=x.E.endTurn;let actual=0;
 x.E.endTurn=r=>{const before=r.battle.combatLog?.seq||0,result=original(r);for(const e of r.battle.combatLog.entries)if(e.id>before&&e.kind==='enemy-turn')actual+=e.values.blockAbsorbed||0;return result;};
 const r=combat(x,{cards:[id],enemy:'wisp',upgraded:false,predict:'high'},424240,1,createAgent(x,{skill:'intermediate'}));
 assert.equal(r.validFinal,true);assert.equal(r.status,'WIN');assert.ok(r.ai.choiceDecisions.length>0);assert.equal(r.ai.effects.totals.blockUsed,actual);const t=r.ai.effects.totals;assert.equal(t.blockGranted,t.blockUsed+t.blockExpired+t.blockUnused+t.blockRemaining);
});
