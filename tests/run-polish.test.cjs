const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),A=require('../dist/artifacts.js');
function battle(){const r=E.newRun(14);delete r.route;E.startBattle(r,'wisp');return r;}
const ids=r=>['hand','draw','discard','exhaust'].flatMap(k=>r.battle[k].map(c=>c.uid)).sort();
test('draw stops at ten without consuming the next card or shuffling a full hand',()=>{
 const r=battle(),all=ids(r);E.draw(r,50);
 assert.equal(r.battle.hand.length,10);assert.deepEqual(ids(r),all);
 const before=E.clone(r);E.draw(r,2);
 assert.deepEqual(r.battle.draw,before.battle.draw);assert.equal(r.rng,before.rng);
 assert.match(r.notice,/Hand full.*10/);assert.ok(E.validate(r));
 const played=r.battle.hand.find(c=>!E.canPlay(r,c)&&!E.definition(c).filter);
 E.playCard(r,played.uid);E.draw(r,50);assert.equal(r.battle.hand.length,10);assert.deepEqual(ids(r),all);
});
test('a Draw card reports only cards actually drawn at the hand limit',()=>{
 const r=battle(),pool=[...r.battle.hand,...r.battle.draw];
 const c=pool.splice(pool.findIndex(c=>c.key==='draw'),1)[0];
 r.battle.hand=[c,...pool.splice(0,9)];r.battle.draw=pool;
 E.playCard(r,c.uid);assert.equal(r.battle.hand.length,10);assert.match(r.notice,/Draw 1 card.*Hand full/);
 assert.equal(r.calculationState.entries.at(-1).results[0].value,1);assert.ok(E.validate(r));
});
test('legacy overfull saves keep every card and RNG when normalized on restore',()=>{
 const r=battle();r.battle.hand.push(...r.battle.draw.splice(0));const before=E.clone(r),all=ids(r);
 const restored=E.restore(r);assert.ok(restored);assert.equal(restored.battle.hand.length,10);
 assert.deepEqual(ids(restored),all);assert.equal(restored.rng,before.rng);assert.deepEqual(r,before);
 assert.equal(restored.battle.draw.at(-1).uid,before.battle.hand[10].uid);assert.ok(E.validate(restored));
});
test('defeat freezes the run clock at resolution and survives serialization',()=>{
 const r=battle(),now=Date.now;let time=1700000000000;
 try{Date.now=()=>time;r.started=time-75000;r.hp=1;E.endTurn(r);
  assert.equal(r.scene,'defeat');assert.equal(r.finished,time);
  time+=600000;const resumed=E.restore(JSON.parse(JSON.stringify(r)));
  assert.equal(resumed.finished-r.started,75000);assert.ok(E.validate(resumed));
  for(const bad of [NaN,-1,'later',r.started-1]){const x=E.clone(r);x.finished=bad;assert.equal(E.validate(x),false);}
  const retry=E.retry(resumed);assert.equal(retry.finished,undefined);assert.equal(retry.started,time);
 }finally{Date.now=now;}
});
test('old result saves acquire one frozen timestamp and keep it on later restores',()=>{
 const r=battle();r.hp=0;r.scene='defeat';const first=E.restore(r);
 assert.ok(Number.isFinite(first.finished));assert.equal(r.finished,undefined);
 assert.equal(E.restore(first).finished,first.finished);
});
test('stage-clear freezes its result and continuing clears the end timestamp',()=>{
 const r=battle();r.depth=4;E.startBattle(r,'sentinel');r.battle.seals=2;r.battle.hp=1;r.battle.enemyBlock=0;
 E.draw(r,6);const c=r.battle.hand.find(c=>E.definition(c).damage);E.playCard(r,c.uid);
 assert.equal(r.scene,'stageclear');assert.ok(Number.isFinite(r.finished));
 E.nextStage(r);assert.equal(r.finished,undefined);assert.equal(r.checkpoint.finished,undefined);assert.ok(E.validate(r));
});

test('artifact draws obey the same hand limit and report actual movement',()=>{
 const r=E.newRun(7,'challenge');require('./helpers/education.cjs').claimArtifact(r,r.artifactState.offer.ids[0]);delete r.route;
 A.acquire(r,A.id('e05'),'fixture:limit');E.startBattle(r,'wisp');E.draw(r,6);
 const all=ids(r),before=r.battle.hand.length;
 A.exhausted(r,1,{draw:E.draw,deal(){},notify(run,text){run.notice=text;}});
 assert.equal(r.battle.hand.length,10);assert.equal(before,10);assert.deepEqual(ids(r),all);
 const actual=r.calculationState.entries.flatMap(e=>e.results).filter(x=>x.label==='Cards drawn').at(-1);
 assert.equal(actual.value,0);assert.match(r.notice,/Hand full/);assert.ok(E.validate(r));
});
