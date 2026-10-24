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
test('current economy audit runs the bound Master and preserves runtime source restrictions',()=>{
 let R;try{R=require('../tools/economy/recheck.cjs');}catch(e){if(e.code!=='MODULE_NOT_FOUND')throw e;}assert.ok(R,'current binding audit module exists');
 const x=loadMaster({difficulty:'easy'}),out=R.offerStudy([19],{fixtureNames:['attack_only']});assert.equal(out.checks.violations,0);assert.equal(out.rows.length,36);assert.equal(out.binding.version,x.binding.identity.version);
});

test('two-attempt Artifact failure loses the offered gift and retains a valid once-only decline',()=>{
 const R=require('../tools/economy/recheck.cjs');for(const difficulty of ['easy','medium','hard']){const x=loadMaster({difficulty}),r=x.E.newRun(19,'challenge'),gold=r.gold;const result=R.settleGift(x,r,{fail:true});assert.equal(result.attempts,2);assert.equal(result.claimed,false);assert.equal(r.gold,gold);assert.equal(r.scene,'map');assert.equal(r.artifactState.declined.length,1);assert.equal(x.E.retry(r).economyState.difficulty,difficulty);}
});
test('Master Mystery first error retries before the same deadline and exact-deadline retry fails',()=>{
 const R=require('../tools/economy/recheck.cjs');for(const difficulty of ['easy','medium','hard']){const x=loadMaster({difficulty});const a=R.eventCase(x,{id:'ME01',mode:'wrong_correct'}),b=R.eventCase(x,{id:'ME01',mode:'wrong_timeout'});assert.equal(a.outcome,'CORRECT');assert.equal(a.attempts,2);assert.equal(b.outcome,'TIMEOUT');assert.equal(b.goldDelta,0);}
});
test('current real-combat economy campaign conserves Gold through purchases and reloads',()=>{
 const R=require('../tools/economy/recheck.cjs');const r=R.campaign({seed:2000000020,difficulty:'easy',policy:'artifact_first',predict:'feedback',route:'seek-shop',sample:true});assert.ok(['VICTORY','DEFEAT'].includes(r.status),r.error);assert.equal(r.invalidStates,0);assert.ok(r.economyChecks.transactions>0);assert.ok(r.metrics.shop.visits>0);
});
test('Master Shop locks Boss stock until Stage 2 and settles one sale, discounts and paid removal exactly once',()=>{
 const R=require('../tools/economy/recheck.cjs');for(const difficulty of ['easy','medium','hard'])for(const stage of [0,1]){
  const x=loadMaster({difficulty}),r=R.room(x,'shop',19,stage);r.gold=5000;assert.equal(new Set(r.shop.offers.map(o=>o.key)).size,6);assert.equal(r.shop.offers.filter(o=>o.sale).length,1);assert.equal(r.shop.artifacts.length,6);assert.equal(r.shop.artifacts[5].id===null,stage===0);
  const frozen=JSON.stringify(r.shop.offers),sale=r.shop.offers.findIndex(o=>o.sale),price=x.E.shopPrice(r,r.shop.offers[sale]),gold=r.gold;x.E.buyCard(r,sale);assert.equal(r.gold,gold-price);let before=cloneState(r);assert.throws(()=>x.E.buyCard(r,sale));assert.deepEqual(r,before);
  x.E.buyArtifact(r,r.shop.artifacts.findIndex(o=>o.id));
  const quotedRun={economyState:r.economyState,artifactState:{owned:[x.A.id('s06'),x.A.id('e14')]}};
  assert.equal(x.Eco.quote(quotedRun,101,{sale:true,upgraded:true}).value,({easy:35,medium:39,hard:43})[difficulty]);assert.equal(JSON.stringify(r.shop.offers),frozen);assert.ok(x.E.restore(r));
  const removal=x.E.shopRemovalPrice(r),balance=r.gold;x.E.removeShopCard(r,r.deck[0].uid);assert.equal(r.gold,balance-removal);assert.equal(r.economyState.removalCount,1);before=cloneState(r);assert.throws(()=>x.E.removeShopCard(r,r.deck[0].uid));assert.deepEqual(r,before);assert.ok(x.E.restore(r));
 }
});
function cloneState(r){return JSON.parse(JSON.stringify(r));}
test('failed Boss artifact continues to Stage 2 with the selected profile recovery and checkpoint intact',()=>{
 const R=require('../tools/economy/recheck.cjs');for(const difficulty of ['easy','medium','hard']){
  const x=loadMaster({difficulty}),r=x.E.newRun(19,'challenge');R.settleGift(x,r);x.E.enterNode(r,R.place(x,r,'boss').id);r.hp=10;const b=r.battle;b.hp=1;b.enemyBlock=0;b.seals=x.C.enemies[b.enemyId].seals.length;
  let c=b.hand.find(c=>c.key==='stm.attack.rune_strike');if(!c){const i=b.draw.findIndex(c=>c.key==='stm.attack.rune_strike');[b.hand[0],b.draw[i]]=[b.draw[i],b.hand[0]];c=b.hand[0];}x.E.playCard(r,c.uid);assert.equal(r.scene,'stageclear');const hp=r.hp,max=r.maxHp;R.settleGift(x,r,{fail:true});assert.equal(r.stage,1);assert.equal(r.hp,Math.min(max,hp+x.binding.profile.stage_clear_heal));assert.ok(x.E.restore(r));assert.equal(x.E.retry(r).stage,1);
 }
});

test('bounded economy campaign retains censoring separately from loss or invalid engine state',()=>{
 const R=require('../tools/economy/recheck.cjs'),r=R.campaign({seed:19,difficulty:'easy',policy:'synergy',predict:'skip',route:'health-recovery',limits:{maxActions:1}});assert.equal(r.status,'BENCHMARK_LIMIT_CENSORED');assert.equal(r.error,null);assert.ok(r.final);assert.equal(r.invalidStates,0);
});
test('cohort reporting retains bounded cases in the denominator without calling them invalid',()=>{
 const R=require('../tools/economy/recheck-campaigns.cjs');assert.equal(typeof R.classify,'function');const s=R.classify([{status:'VICTORY'},{status:'DEFEAT'},{status:'BENCHMARK_LIMIT_CENSORED'}]);assert.equal(s.attempts,3);assert.equal(s.invalid.length,0);assert.equal(s.censored.length,1);assert.equal(s.wins,1);assert.equal(s.losses,1);
});
test('event timeout distinguishes submitted answers from attempts accepted by the education ledger',()=>{
 const R=require('../tools/economy/recheck.cjs'),x=loadMaster({difficulty:'hard'}),a=R.eventCase(x,{id:'ME01',mode:'timeout_exact'}),b=R.eventCase(x,{id:'ME01',mode:'wrong_timeout'});assert.equal(a.attempts,0);assert.equal(a.submittedAnswers,1);assert.equal(b.attempts,1);assert.equal(b.submittedAnswers,2);
});
