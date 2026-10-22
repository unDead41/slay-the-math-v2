const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),Q=require('../dist/education.js'),A=require('../dist/artifacts.js'),C=require('../dist/config.js');
const {claimArtifact}=require('./helpers/education.cjs');
const copy=x=>JSON.parse(JSON.stringify(x));
function room(id='ME01',mode='challenge',seed=7){
 const r=E.newRun(seed,mode);if(mode==='challenge')claimArtifact(r,r.artifactState.offer.ids[0]);
 const map=E.getMap(r),node=map.nodes.find(n=>n.type==='event');let path=[node];
 for(let d=node.depth-1;d>=0;d--)path.unshift(map.nodes.find(n=>n.depth===d&&n.next.includes(path[0].id)));
 r.depth=node.depth;r.route.path=path.slice(0,-1).map(n=>n.id);r.cleared=r.route.path.slice();
 assert.equal(typeof E.openMystery,'function','Mystery event integration is available');
 const X=require('../dist/mystery.js');X.ensure(r);r.mysteryState.usedEventIds=X.data.events.filter(e=>e.id!==id).map(e=>e.id);
 // The Collector requires a Starting gift; all other options use the normal starter deck.
 r.gold=1000;r.hp=Math.min(r.hp,40);E.enterNode(r,node.id);assert.equal(r.mysteryState.pending.eventId,id);assert.ok(E.validate(r));return r;
}
function start(r,now=100000){E.startMystery(r,[],null,now);assert.equal(r.mysteryState.pending.phase,'question');return Q.catalog[r.mysteryState.pending.questionId];}
function solve(r,now=100000){const q=start(r,now);E.answerMystery(r,q.correctChoiceId,now+1);assert.equal(r.mysteryState.pending.outcome,'CORRECT');E.continueMystery(r);return q;}
function claim(r,option,target){E.selectMysteryOption(r,option);if(target)E.selectMysteryTarget(r,target);E.claimMystery(r);}
test('Mystery coverage counts opening once, persists through review and settlement, and migrates legacy receipts',()=>{
 const r=room('ME01','challenge'),oldIds=Q.ids.filter(id=>id.startsWith('PROB-')).slice(0,35);
 assert.deepEqual(Q.coverage(r,oldIds),{run:1,lifetime:36,total:120});
 E.startMystery(r,oldIds,null,100000);const q=Q.catalog[r.mysteryState.pending.questionId];
 const expected={run:2,lifetime:Q.merge(oldIds,r.educationState.usedIds).length,total:120};
 assert.deepEqual(Q.coverage(r),expected);Q.mysterySupport(r,'hint');
 assert.deepEqual(Q.coverage(E.restore(copy(r))),expected);
 E.answerMystery(r,q.correctChoiceId,100001);E.continueMystery(r);
 assert.equal(r.scene,'map');assert.deepEqual(Q.coverage(r),expected);
 assert.ok(E.restore(copy(r)));delete r.educationState.runUsedIds;delete r.educationState.selectionVersion;assert.deepEqual(Q.coverage(E.restore(copy(r))),expected);
});
function battle(r){const map=E.getMap(r),node=map.nodes.find(n=>n.depth>=r.depth&&n.type==='battle')||map.nodes.find(n=>n.type==='battle');let path=[node];for(let d=node.depth-1;d>=0;d--)path.unshift(map.nodes.find(n=>n.depth===d&&n.next.includes(path[0].id)));r.depth=node.depth;r.route.path=path.slice(0,-1).map(n=>n.id);r.cleared=r.route.path.slice();E.enterNode(r,node.id);return r;}
test('all fifteen events use the active question bank, correct topic and fixed timers in both stages',()=>{
 const X=require('node:fs').existsSync(require('node:path').join(__dirname,'../dist/mystery.js'))?require('../dist/mystery.js'):null;
 assert.ok(X,'Mystery event registry exists');assert.equal(X.data.events.length,15);
 for(const e of X.data.events){const r=room(e.id);const q=start(r);assert.equal(q.topicCode,e.topicCode);assert.equal(r.mysteryState.pending.deadline-r.mysteryState.pending.startedAt,e.timeLimitSeconds*1000);assert.ok(E.restore(copy(r)));assert.ok(e.stages.includes(2));}
});
test('intro/Leave exposes no question and gives nothing; fixed event and offers survive refresh',()=>{
 const r=room(),old=copy(r),p=copy(r.mysteryState.pending),seen=copy(r.educationState.usedIds);assert.deepEqual(E.restore(copy(r)).mysteryState.pending,p);
 assert.throws(()=>E.finishNode(r));assert.deepEqual(r,old);
 E.leaveMystery(r);assert.equal(r.scene,'map');assert.equal(r.gold,old.gold);assert.equal(r.hp,old.hp);assert.deepEqual(r.educationState.usedIds,seen);assert.ok(E.restore(copy(r)));assert.throws(()=>E.leaveMystery(r));
});
test('legacy pending Mystery preserves question, support, offers and exact deadline without a run ledger',()=>{
 const r=room(),q=start(r);Q.mysterySupport(r,'hint');const pending=copy(r.mysteryState.pending),session=copy(r.educationState.session);
 delete r.educationState.runUsedIds;delete r.educationState.selectionVersion;
 const restored=E.restore(copy(r));assert.ok(restored);assert.deepEqual(restored.mysteryState.pending,pending);assert.deepEqual(restored.educationState.session,session);
 E.answerMystery(restored,q.correctChoiceId,pending.startedAt+1);E.continueMystery(restored);assert.equal(restored.scene,'map');assert.ok(E.restore(copy(restored)));
});
test('first wrong answer ends the challenge, nonlethal damage applies once after review',()=>{
 const r=room();r.hp=2;const q=start(r);E.answerMystery(r,q.choices.find(c=>c.id!==q.correctChoiceId).id,100001);assert.equal(r.hp,2);assert.equal(r.mysteryState.pending.outcome,'INCORRECT');assert.throws(()=>E.answerMystery(r,q.correctChoiceId,100002));
 const restored=E.restore(copy(r));assert.ok(restored);E.continueMystery(restored);assert.equal(restored.hp,1);assert.equal(restored.scene,'map');assert.throws(()=>E.continueMystery(restored));assert.ok(E.restore(copy(restored)));
});
test('strict deadline accepts only earlier answers; timeout and abandon share one settlement',()=>{
 for(const delta of [-1,0,1]){const r=room(),q=start(r),deadline=r.mysteryState.pending.deadline;E.answerMystery(r,q.correctChoiceId,deadline+delta);assert.equal(r.mysteryState.pending.outcome,delta<0?'CORRECT':'TIMEOUT');assert.ok(E.restore(copy(r)));}
 const r=room();start(r);const p=copy(r.mysteryState.pending);assert.deepEqual(E.restore(copy(r)).mysteryState.pending,p);E.expireMystery(r,p.deadline-1);assert.equal(r.mysteryState.pending.phase,'question');E.expireMystery(r,p.deadline);assert.equal(r.mysteryState.pending.outcome,'TIMEOUT');E.expireMystery(r,p.deadline+1);E.continueMystery(r);assert.ok(E.restore(copy(r)));
 const x=room();start(x);E.leaveMystery(x,100001);assert.equal(x.mysteryState.pending.outcome,'ABANDONED_AFTER_START');E.continueMystery(x);assert.ok(E.restore(copy(x)));
});
test('automatic gold commits once, question exposure is shared with artifacts and profile history',()=>{
 const r=room(),before=r.gold,q=solve(r);assert.equal(r.scene,'map');assert.equal(r.gold,before+40);assert.ok(r.educationState.usedIds.includes(q.id));assert.throws(()=>E.continueMystery(r));
 const profile=Q.history(r.educationState.usedIds,r.educationState.session);assert.ok(Q.validHistory(profile));const x=room('ME01','challenge',19);E.startMystery(x,profile.usedIds,profile.session,100000);assert.notEqual(x.mysteryState.pending.questionId,q.id);assert.ok(E.restore(copy(x)));
});
test('exhausted question pools skip without cost/reward/penalty and never recycle or switch topics',()=>{
 const r=room();r.educationState.runUsedIds=Q.ids.slice();r.educationState.usedIds=Q.ids.slice();r.educationState.session.exposureIds=Q.ids.slice();const old=copy(r);E.startMystery(r,[],null,100000);assert.equal(r.mysteryState.pending.phase,'empty');E.continueMystery(r);assert.equal(r.hp,old.hp);assert.equal(r.gold,old.gold);assert.equal(r.scene,'map');assert.ok(E.restore(copy(r)));
});
test('HP and Gold upgrades require full cost, target selection and explicit atomic confirmation',()=>{
 for(const [event,cost,resource]of [['ME02',5,'hp'],['ME09',35,'gold']]){const r=room(event);solve(r);const target=r.deck[0],before=r[resource];E.selectMysteryOption(r,event==='ME02'?'upgrade':'forge_upgrade');const old=copy(r);assert.throws(()=>E.claimMystery(r));assert.deepEqual(r,old);E.selectMysteryTarget(r,target.uid);E.claimMystery(r);assert.equal(r[resource],before-cost);assert.equal(r.deck.find(c=>c.uid===target.uid).upgraded,true);assert.ok(E.restore(copy(r)));}
 const r=room('ME02');solve(r);E.selectMysteryOption(r,'upgrade');E.selectMysteryTarget(r,r.deck[0].uid);r.hp=5;const old=copy(r);assert.throws(()=>E.claimMystery(r));assert.deepEqual(r,old);
});
test('Scholar gold and upgrade are one bundle and declining does not grant partial Gold',()=>{
 const r=room('ME07');solve(r);const before=r.gold;E.leaveMystery(r);assert.equal(r.gold,before);
 const x=room('ME07');solve(x);const gold=x.gold;claim(x,'scholar_reward',x.deck[0].uid);assert.equal(x.gold,gold+30);assert.ok(x.deck[0].upgraded);assert.ok(E.restore(copy(x)));
});
test('Fountain, Archive, Garden and Adventurer grant exactly one selected reward',()=>{
 for(const [event,option,amount]of [['ME05','gold',25],['ME10','gold',25],['ME12','gold',40]]){const r=room(event);solve(r);const before=r.gold,hp=r.hp,size=r.deck.length;claim(r,option);assert.equal(r.gold,before+amount);assert.equal(r.hp,hp);assert.equal(r.deck.length,size);assert.ok(E.restore(copy(r)));}
 const r=room('ME11');solve(r);const before=r.hp,gold=r.gold;claim(r,'heal');assert.equal(r.hp,Math.min(r.maxHp,before+10));assert.equal(r.gold,gold);
});
test('Skill offers are unique, persistent and category restricted; choose one card only',()=>{
 const r=room('ME03');solve(r);const offers=r.mysteryState.pending.offers.learn_skill.cards,size=r.deck.length;assert.equal(offers.length,3);assert.equal(new Set(offers).size,3);assert.ok(offers.every(k=>C.cards[k].role==='tactic'));assert.deepEqual(E.restore(copy(r)).mysteryState.pending.offers.learn_skill.cards,offers);claim(r,'learn_skill',offers[0]);assert.equal(r.deck.length,size+1);assert.equal(r.deck.at(-1).key,offers[0]);assert.ok(E.restore(copy(r)));
});
test('transform keeps category and physical instance, resets upgrade, and reopening cannot reroll',()=>{
 const r=room('ME04');r.deck[0].upgraded=true;solve(r);const c=copy(r.deck[0]);E.selectMysteryOption(r,'transform');E.selectMysteryTarget(r,c.uid);const result=r.mysteryState.pending.offers.transform.transforms[c.uid];assert.notEqual(result,c.key);assert.equal(C.cards[result].role,C.cards[c.key].role);assert.equal(E.restore(copy(r)).mysteryState.pending.offers.transform.transforms[c.uid],result);E.claimMystery(r);const transformed=r.deck.find(x=>x.uid===c.uid);assert.equal(transformed.key,result);assert.equal(transformed.upgraded,false);assert.ok(E.restore(copy(r)));
});
test('Archive removes exactly one chosen instance while respecting the existing save minimum',()=>{
 const r=room('ME10');solve(r);const c=r.deck[0],size=r.deck.length;claim(r,'remove',c.uid);assert.equal(r.deck.length,size-1);assert.ok(!r.deck.some(x=>x.uid===c.uid));assert.ok(E.restore(copy(r)));
});
test('artifact trade recalculates Max HP and retains the opening gift/question ledger',()=>{
 const r=room('ME06');const starting=r.artifactState.startingId;solve(r);const before=r.gold;claim(r,'trade',starting);assert.equal(r.gold,before-30);assert.ok(!A.has(r,starting));assert.ok(r.artifactState.consumed.some(x=>x.id===starting));assert.equal(r.maxHp,A.maxHp(r));assert.ok(E.restore(copy(r)));
});
test('Garden grants an unowned Starting artifact; Bargain pays Max HP without extra current HP loss',()=>{
 const r=room('ME11');solve(r);const offered=r.mysteryState.pending.offers.artifact.artifactId;assert.equal(A.catalog[offered].tier,'starting');claim(r,'artifact');assert.ok(A.has(r,offered));assert.ok(E.restore(copy(r)));
 const x=room('ME15');solve(x);const hp=x.hp,max=x.maxHp;claim(x,'bargain');assert.equal(x.maxHp,max-5);assert.equal(x.hp,Math.min(hp,max-5));assert.ok(E.restore(copy(x)));assert.ok(A.owned(x).some(a=>a.tier==='elite_mystery'));
});
test('Echo failure starts one stage-correct Normal combat after review, with normal rewards and one node completion',()=>{
 const r=room('ME13'),q=start(r),depth=r.depth;E.answerMystery(r,q.choices.find(c=>c.id!==q.correctChoiceId).id,100001);assert.equal(r.scene,'event');E.continueMystery(r);assert.equal(r.scene,'battle');assert.ok(C.stages[r.stage].normals.includes(r.battle.enemyId));assert.equal(r.battle.elite,false);assert.ok(E.restore(copy(r)));assert.throws(()=>E.continueMystery(r));
 r.battle.hp=1;r.battle.enemyBlock=0;const hit=[...r.battle.hand,...r.battle.draw].find(c=>C.cards[c.key].role==='attack');if(!r.battle.hand.includes(hit)){r.battle.draw.splice(r.battle.draw.indexOf(hit),1);r.battle.hand.push(hit);}E.playCard(r,hit.uid);assert.equal(r.scene,'reward');assert.ok(E.restore(copy(r)));E.chooseReward(r,null);assert.equal(r.depth,depth+1);assert.ok(E.restore(copy(r)));
});
test('Oracle Strength/Agility affect the next combat only, including saved combat reload',()=>{
 for(const stat of ['strength','agility']){const r=room('ME08');solve(r);claim(r,stat);battle(r);assert.equal(r.battle[stat],2);const c={key:stat==='strength'?'strike':'guard',upgraded:false};assert.equal(E.effectiveDefinition(r,c)[stat==='strength'?'damage':'block'],C.cards[c.key][stat==='strength'?'damage':'block']+2);assert.ok(E.restore(copy(r)));E.startBattle(r,r.battle.enemyId);assert.equal(r.battle[stat]||0,0);}
});
test('Hourglass extra draw and Energy penalty apply on first turn only and obey Hand capacity',()=>{
 const r=room('ME14');solve(r);battle(r);assert.ok(r.battle.hand.length>=6);E.endTurn(r);assert.equal(r.battle.hand.length,C.HAND);assert.ok(E.restore(copy(r)));
 const x=room('ME14');const q=start(x);E.answerMystery(x,q.choices.find(c=>c.id!==q.correctChoiceId).id,100001);E.continueMystery(x);battle(x);assert.equal(x.battle.energy,C.ENERGY-1);E.endTurn(x);assert.equal(x.battle.energy,C.ENERGY);assert.ok(E.restore(copy(x)));
});
test('Learn mode Mystery shares profile history and artifact grants remain valid',()=>{
 const r=room('ME11','learn');solve(r);claim(r,'artifact');assert.ok(A.owned(r).some(a=>a.tier==='starting'));assert.ok(E.restore(copy(r)));assert.ok(Q.validHistory(Q.history(r.educationState.usedIds,r.educationState.session)));
});
test('starting a new Artifact trial never resumes a different run\'s exposed Mystery question',()=>{
 const r=room();start(r);Q.mysterySupport(r,'hint');const history=Q.history(r.educationState.usedIds,r.educationState.session);
 const x=E.newRun(123,'challenge');E.chooseArtifact(x,x.artifactState.offer.ids[0],history.usedIds,history.session);assert.ok(Q.current(x));assert.deepEqual(x.educationState.pending.attempts,[]);assert.equal(x.educationState.pending.hinted,false);assert.ok(E.restore(copy(x)));assert.equal(r.educationState.session.pendingQuestionId,r.mysteryState.pending.questionId);assert.equal(Q.getSession(r).records[r.mysteryState.pending.questionId].hintState.hintUsed,true);
});
test('Archive protects the final card and protected instances; legitimate small decks remain loadable',()=>{
 const r=room('ME10');r.deck=r.deck.slice(0,2);solve(r);claim(r,'remove',r.deck[0].uid);assert.equal(r.deck.length,1);assert.ok(E.restore(copy(r)));
 const x=room('ME10');x.deck=x.deck.slice(0,1);solve(x);assert.throws(()=>E.selectMysteryOption(x,'remove'));E.leaveMystery(x);assert.equal(x.deck.length,1);assert.ok(E.restore(copy(x)));
});
test('damaged reward payloads are rejected on import before the renderer can use them',()=>{
 for(const [id,option]of [['ME03','learn_skill'],['ME04','transform'],['ME06','trade'],['ME11','artifact']]){const r=room(id);solve(r);r.mysteryState.pending.offers[option]={};assert.equal(E.restore(copy(r)),null,id+' missing required offer data');}
 const r=room('ME03');solve(r);r.mysteryState.pending.offers.learn_skill.cards=['draw','draw'];assert.equal(E.restore(r),null);
});
test('Oracle and artifact stat calculations show the same exact sum used in combat',()=>{
 const r=room('ME08');A.acquire(r,A.id('e15'),'fixture:charm');solve(r);claim(r,'strength');battle(r);
 const entry=require('../dist/rich-text.js').entries(r).find(x=>x.label==='Combat stat totals'),result=entry.results.find(x=>x.unit==='Strength');assert.equal(result.value,A.get('e15').values.strength+2);
 const formula=result.lines.find(x=>x.startsWith('Total Strength:')).slice('Total Strength:'.length).trim(),[left,right]=formula.split(' = ');assert.equal(left.split(' + ').map(Number).reduce((a,b)=>a+b,0),Number(right));
});
