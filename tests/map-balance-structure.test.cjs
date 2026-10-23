const test=require('node:test');
const assert=require('node:assert/strict');
const {enumerateRoutes,analyzeMap}=require('../tools/balance/map/structure.cjs');
const {riskScore,pressureDebt}=require('../tools/balance/map/score.cjs');
const config=require('../tools/balance/map/config.json');
const G=require('../dist/map-rng.js');
const registry=require('../modules/map/data/seed-registry.json');

test('merged branches preserve distinct routes and uniform-exit probabilities',()=>{
 const map={nodes:[{id:'a',level:1},{id:'b',level:1},{id:'c',level:2},{id:'d',level:2},{id:'z',level:3}],edges:[{from:'a',to:'c'},{from:'a',to:'d'},{from:'b',to:'d'},{from:'c',to:'z'},{from:'d',to:'z'}]};
 const routes=enumerateRoutes(map);
 assert.deepEqual(routes.map(r=>r.nodeIds),[['a','c','z'],['a','d','z'],['b','d','z']]);
 assert.deepEqual(routes.map(r=>r.probability),[.25,.25,.5]);
 assert.equal(routes.reduce((s,r)=>s+r.probability,0),1);
});
test('cycle and dead-end graphs fail rather than silently truncate coverage',()=>{
 assert.throws(()=>enumerateRoutes({nodes:[{id:'a',level:1},{id:'z',level:2}],edges:[{from:'a',to:'a'}]}));
});
test('all registered stage routes preserve mandatory levels and total 5500',()=>{
 let total=0;
 for(const seed of registry.seeds)for(const stage of [1,2]){
  const m=G.generateMap(seed,{stage}),rs=enumerateRoutes(m),by=new Map(m.nodes.map(n=>[n.id,n]));
  assert.equal(rs.length,G.validateMap(m).routeCount);
  assert.ok(Math.abs(rs.reduce((n,r)=>n+r.probability,0)-1)<1e-12);
  for(const r of rs){assert.equal(r.nodeIds.length,10);assert.equal(by.get(r.nodeIds[4]).type,'mystery');assert.equal(by.get(r.nodeIds[8]).type,'rest');assert.equal(by.get(r.nodeIds[9]).type,'boss');}
  total+=rs.length;
 }
 assert.equal(total,5500);
});
test('recovery preserves an earlier peak deficit instead of hiding it at the finish',()=>{
 assert.deepEqual(pressureDebt([20,20,-12,4]),{peak:40,final:32,gross:44,recovery:12});
 assert.deepEqual(pressureDebt([-12,5]),{peak:5,final:5,gross:5,recovery:0});
});
test('catalogue seed has exactly three reachable roster offset combinations',()=>{
 const r=analyzeMap('STM-001',1,config);
 assert.deepEqual(r.summary.rosterClasses.map(x=>[x.normalOffset,x.eliteOffset]),[[0,0],[1,0],[2,0]]);
 assert.equal(r.routes.length,24);
 assert.ok(r.routes.every(x=>x.combatPower===null && x.scoreKind==='ESTIMATED_PRESSURE'));
 assert.ok(r.routes.every(x=>x.variants.length===3));
 assert.equal(r.summary.easiestRouteId,r.routes.slice().sort((a,b)=>a.estimatedPressure-b.estimatedPressure||a.id.localeCompare(b.id))[0].id);
});
test('win-risk scores have fixed scale, honest zero-trial null and uncertainty',()=>{
 assert.equal(riskScore(0,0).combatPower,null);
 const a=riskScore(9,10),b=riskScore(5,10);
 assert.ok(a.combatPower<b.combatPower);
 assert.ok(a.winInterval95[0]<.9 && a.winInterval95[1]>.9);
 assert.ok(a.combatPowerInterval95[0]<a.combatPowerInterval95[1]);
 assert.throws(()=>riskScore(11,10));
});
test('Wilson endpoints preserve exact zero/all-win boundary meaning',()=>{
 const zero=riskScore(0,3),all=riskScore(3,3);
 assert.equal(zero.winInterval95[0],0);assert.equal(zero.cpUpperUnbounded,true);assert.equal(zero.combatPowerInterval95[1],null);
 assert.equal(all.winInterval95[1],1);assert.equal(all.combatPowerInterval95[0],0);
});
