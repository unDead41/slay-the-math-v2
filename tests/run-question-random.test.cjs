'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),Q=require('../dist/education.js'),X=require('../dist/mystery.js'),G=require('../dist/map.js');
const {completeTrial}=require('./helpers/education.cjs');
const copy=x=>JSON.parse(JSON.stringify(x));
function battle(seed){const r=E.newRun(seed);delete r.route;E.startBattle(r,'sentinel');return r;}

test('the opening gameplay question can reach every bank item and every difficulty',()=>{
 const found=new Set();for(let seed=1;seed<=1024;seed++){const r=E.newRun(seed,'challenge');E.chooseArtifact(r,r.artifactState.offer.ids[0]);found.add(Q.current(r).id);assert.equal(Q.coverage(r).run,1);}
 assert.deepEqual([...found].sort(),Q.ids.slice().sort());
 assert.deepEqual([...new Set([...found].map(id=>Q.catalog[id].difficulty))].sort(),['Easy','Hard','Medium']);
});
test('standalone Practice keeps its adaptive default while gameplay requests random',()=>{
 const S=require('../dist/mechanics.js').session;
 for(let seed=1;seed<=12;seed++){const result=S.reserveNext(S.createSession({seed}),Q.bank);assert.equal(result.question.difficulty,'Easy');assert.equal(result.targetDifficulty,'Easy');}
});
test('all gameplay consumers share a nonrepeating random pool through restore and exhaustion',()=>{
 const r=battle(47),seen=new Set();for(let i=0;i<120;i++){
  const result=Q.reserveForConsumer(r,['artifact','predict','mystery'][i%3]);assert.ok(result.question);assert.ok(!seen.has(result.question.id));seen.add(result.question.id);Q.retireQuestion(r,result.question.id);
  const restored=E.restore(copy(r));assert.ok(restored);Object.assign(r,restored);assert.equal(Q.coverage(r).run,i+1);
 }
 for(const consumer of ['artifact','predict','mystery'])assert.equal(Q.reserveForConsumer(r,consumer).question,null);
 assert.equal(seen.size,120);
});
test('lifetime mastery does not bias a new run or make it inherit exclusions',()=>{
 const old=battle(9);for(let i=0;i<120;i++){const {question}=Q.reserveForConsumer(old,'predict');Q.retireQuestion(old,question.id);}
 const profile=Q.mergeRunHistory(old);
 for(let seed=1;seed<=40;seed++){
  const fresh=battle(seed),control=battle(seed),actual=E.forecast(fresh,profile.usedIds,profile.session),expected=E.forecast(control);
  assert.equal(actual.questionId,expected.questionId);assert.equal(Q.coverage(fresh).run,1);assert.equal(Q.coverage(fresh).lifetime,120);assert.ok(E.restore(copy(fresh)));
 }
});
test('Mystery samples the entire unused event topic rather than its preferred subset',()=>{
 const event=X.catalog.ME01,found=new Set();for(let seed=1;seed<=256;seed++){const r=E.newRun(seed);r.scene='event';const result=Q.reserveMystery(r,event);assert.equal(result.question.topicCode,event.topicCode);found.add(result.question.id);}
 assert.equal(found.size,Q.bank.questions.filter(q=>q.topicCode===event.topicCode).length);
 assert.ok([...found].some(id=>!event.education.preferredQuestionIds.includes(id)));
});
test('Shop and Rest do not reset the run ledger before the next Predict',()=>{
 const r=E.newRun(66,'challenge');E.chooseArtifact(r,r.artifactState.offer.ids[0]);const first=Q.current(r).id;completeTrial(r);
 r.route=G.begin(0,r.seed,2);const map=E.getMap(r),shop=map.nodes.find(n=>n.type==='shop');let path=[shop];
 for(let depth=shop.depth-1;depth>=0;depth--)path.unshift(map.nodes.find(n=>n.depth===depth&&n.next.includes(path[0].id)));
 r.depth=shop.depth;r.route.path=path.slice(0,-1).map(n=>n.id);E.enterNode(r,shop.id);assert.deepEqual(Q.runIds(r),[first]);
 r.gold=500;E.buyCard(r,0);E.leaveShop(r);delete r.route;r.depth=2;r.scene='camp';E.camp(r,'heal');assert.deepEqual(Q.runIds(r),[first]);
 E.startBattle(r,'sentinel');const next=E.forecast(r).questionId;assert.notEqual(next,first);assert.equal(Q.coverage(r).run,2);assert.ok(E.restore(copy(r)));
});
test('Retry Stage 1 retains exposures; only New Run resets exclusion',()=>{
 const r=E.newRun(22,'challenge');E.chooseArtifact(r,r.artifactState.offer.ids[0]);completeTrial(r);delete r.route;E.startBattle(r,'wisp');E.forecast(r);E.closeForecast(r);
 r.hp=0;r.scene='defeat';r.finished=Math.max(r.started,Date.now());assert.ok(E.validate(r));const seen=Q.runIds(r),retry=E.retry(r);
 assert.deepEqual(Q.runIds(retry),seen);assert.ok(E.restore(copy(retry)));E.chooseArtifact(retry,retry.artifactState.offer.ids[0]);assert.ok(!seen.includes(Q.current(retry).id));
 assert.equal(Q.coverage(E.newRun(22,'challenge')).run,0);
});
test('reopening or reloading one pending question preserves its ID and answer state',()=>{
 const r=battle(31),first=E.forecast(r);E.supportForecast(r,'hint');const loaded=E.restore(copy(r));assert.ok(loaded);assert.equal(E.forecast(loaded).questionId,first.questionId);assert.equal(Q.coverage(loaded).run,1);assert.equal(loaded.battle.question.hinted,true);
});
