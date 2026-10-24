'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {loadMaster}=require('../tools/balance/master/loader.cjs');
const {createTelemetry}=require('../tools/balance/map-advanced/telemetry.cjs');
function shop(x,seed=19){const r=x.E.newRun(seed,'learn'),nodes=x.E.getMap(r).nodes,n=nodes.find(n=>n.type==='shop');let path=[n];for(let d=n.depth-1;d>=0;d--)path.unshift(nodes.find(v=>v.depth===d&&v.next.includes(path[0].id)));r.depth=n.depth;r.route.path=path.slice(0,-1).map(v=>v.id);r.cleared=r.route.path.slice();x.E.enterNode(r,n.id);return r;}
function observer(x,r){return createTelemetry({E:x.E,A:x.A,cardMerit:()=>0,hash:()=>''},r);}
test('Master artifact affordability telemetry uses the actual profile quote at a tight Gold boundary',()=>{
 for(const difficulty of ['easy','hard']){
  const x=loadMaster({difficulty}),r=shop(x);const prices=r.shop.artifacts.filter(o=>o.id).map(o=>x.E.shopPrice(r,o));
  for(const gold of [Math.min(...prices)-1,Math.min(...prices)]){r.gold=gold;const m=observer(x,r),current={enter:m.snapshot(r)};m.attachRoom(current);m.observe('enterNode',m.mark(r),r);assert.equal(current.shop.affordableArtifacts,prices.filter(p=>p<=r.gold).length,difficulty+' affordability must use checkout quotes at '+gold);}
 }
});
test('Purse purchase reports gross Gold earned and gross charge, including room and Shop totals',()=>{
 const x=loadMaster({difficulty:'medium'});let r,index;
 for(let seed=1;seed<100;seed++){r=shop(x,seed);index=r.shop.artifacts.findIndex(o=>o.id===x.A.id('s09'));if(index>=0)break;}
 assert.ok(index>=0);r.gold=500;const quote=x.E.shopPrice(r,r.shop.artifacts[index]),grant=x.A.catalog[x.A.id('s09')].values.gold,m=observer(x,r),room={enter:m.snapshot(r)};m.attachRoom(room);const before=m.mark(r);x.E.buyArtifact(r,index);m.observe('buyArtifact',before,r);
 assert.equal(m.metrics.goldEarned,grant);assert.equal(m.metrics.goldSpent,quote);assert.equal(m.metrics.shop.spent,quote);assert.equal(room.metrics.goldEarned,grant);assert.equal(room.metrics.goldSpent,quote);assert.equal(r.gold,500+grant-quote);
});
