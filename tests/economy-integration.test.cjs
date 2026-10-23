const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),Eco=require('../dist/economy.js'),A=require('../dist/artifacts.js'),Q=require('../dist/education.js');
const {candidate,atNode,room,winBattle}=require('./helpers/economy.cjs');
const copy=x=>JSON.parse(JSON.stringify(x));
test('candidate is opt-in, profile is locked across retry, malformed profiles reject; legacy never migrates',()=>{
 const r=candidate('easy');assert.equal(r.gold,100);assert.ok(E.validate(r));assert.equal(r.maxHp,60);
 const retry=E.retry(r);assert.equal(retry.economyState.difficulty,'easy');assert.equal(retry.gold,100);
 const legacy=E.newRun(19);assert.equal(legacy.economyState,undefined);assert.equal(E.restore(legacy).economyState,undefined);
 const bad=copy(r);bad.economyState.profile.starting_gold=999;assert.equal(E.restore(bad),null);
});
test('shop has six frozen unique cards, exactly one sale, 3/2/locked Boss slots then Stage 2 Boss stock',()=>{
 for(const stage of [0,1]){const r=room('shop','easy',19,stage);assert.ok(r.economyState);assert.equal(new Set(r.shop.offers.map(o=>o.key)).size,6);assert.equal(r.shop.offers.filter(o=>o.sale).length,1);
 assert.equal(r.shop.artifacts.length,6);assert.equal(r.shop.artifacts[5].id===null,stage===0);assert.ok(E.restore(r));
 const old=copy(r.shop);r.deck.push(E.card(r,'stm.passive.clear_mind'));assert.deepEqual(E.restore(r).shop,old);
 const bad=copy(r);bad.shop.offers[0].basePrice++;assert.equal(E.restore(bad),null);
 }
});
test('card/artifact purchases charge once and discounts update unsold quotes without reroll; ownership rejects duplicates',()=>{
 const r=room('shop');r.gold=1000;const stock=copy(r.shop.offers),owned=copy(r.shop.artifacts),index=r.shop.offers.findIndex(o=>o.sale),before=r.gold,price=E.shopPrice(r,r.shop.offers[index]);
 E.buyCard(r,index);assert.equal(r.gold,before-price);assert.ok(E.restore(r));const once=copy(r);assert.throws(()=>E.buyCard(r,index));assert.deepEqual(r,once);
 const ai=r.shop.artifacts.findIndex(o=>o.id),id=r.shop.artifacts[ai].id;E.buyArtifact(r,ai);assert.ok(A.has(r,id));assert.ok(E.restore(r));const saved=copy(r);assert.throws(()=>E.buyArtifact(r,ai));assert.deepEqual(r,saved);
 assert.deepEqual(r.shop.offers,stock);assert.deepEqual(r.shop.artifacts,owned);
 // Find an actual Shop with a discount artifact and purchase through its real transaction.
 let found;for(let seed=1;seed<100&&!found;seed++){const x=room('shop','medium',seed);const i=x.shop.artifacts.findIndex(o=>o.id===A.id('s06')||o.id===A.id('e14'));if(i>=0)found={x,i};}
 assert.ok(found);const {x,i}=found;x.gold=1000;const initial=E.shopPrice(x,x.shop.offers[0]),identity=copy(x.shop);E.buyArtifact(x,i);
 assert.ok(E.shopPrice(x,x.shop.offers[0])<initial);assert.deepEqual(x.shop.offers,identity.offers);assert.ok(E.restore(x));
});
test('paid removal grows per run, once per Shop, never below ten; insufficient Gold is atomic',()=>{
 let r=room('shop');r.gold=1000;assert.equal(E.shopRemovalPrice(r),50);E.removeShopCard(r,r.deck[0].uid);assert.equal(r.deck.length,11);assert.equal(r.economyState.removalCount,1);
 assert.throws(()=>E.removeShopCard(r,r.deck[0].uid));E.leaveShop(r);const n=atNode(r,'shop',1);E.enterNode(r,n.id);assert.equal(E.shopRemovalPrice(r),65);E.removeShopCard(r,r.deck[0].uid);assert.equal(r.deck.length,10);
 const once=copy(r);assert.throws(()=>E.removeShopCard(r,r.deck[0].uid));assert.deepEqual(r,once);assert.ok(E.restore(r));
 const x=room('shop');x.gold=0;const old=copy(x);assert.throws(()=>E.buyCard(x,0));assert.deepEqual(x,old);
});
test('normal/elite wins use profiled Gold and separate loot stream; claim/skip settles once and Elite upgrades',()=>{
 for(const [tier,gold,upgrade]of [['battle',30,false],['elite',50,true]]){
  const r=room(tier,'easy'),before=r.gold,shuffleBefore=r.rng;winBattle(r);assert.equal(r.gold,before+gold);assert.equal(r.rng,shuffleBefore);
  assert.equal(r.rewards.length,3);assert.ok(E.restore(r));const key=r.rewards[0];E.chooseReward(r,key);assert.equal(r.deck.at(-1).key,key);assert.equal(r.deck.at(-1).upgraded,upgrade);
  const once=copy(r);assert.throws(()=>E.chooseReward(r,key));assert.deepEqual(r,once);assert.ok(E.restore(r));
 }
});
test('Rest and Stage 1 recovery apply one profile amount, cap HP and never create extra card rolls',()=>{
 for(const [d,rest,clear]of [['easy',20,20],['medium',15,12],['hard',12,8]]){
  const r=room('camp',d);r.hp=10;const receipts=copy(r.economyState.receipts);E.camp(r,'heal');assert.equal(r.hp,10+rest);assert.deepEqual(r.economyState.receipts,receipts);assert.throws(()=>E.camp(r,'heal'));
  const x=room('boss',d);x.hp=10;const before=x.gold;winBattle(x);assert.equal(x.scene,'stageclear');assert.equal(x.rewards.length,0);E.nextStage(x);assert.equal(x.hp,10+clear);assert.ok(E.restore(x));assert.equal(E.retry(x).economyState.difficulty,d);
 }
});
test('starting offers use loot stream and preserve questions and fixed 12-card starter',()=>{
 const r=candidate('easy',71,'challenge');assert.equal(r.scene,'master');assert.equal(r.deck.length,12);assert.equal(r.artifactState.offer.ids.length,3);assert.equal(r.artifactState.rng,(r.seed^0xa741c6e5)>>>0);assert.ok(E.restore(r));
 const before=r.rng;E.chooseArtifact(r,r.artifactState.offer.ids[0]);assert.ok(Q.current(r));assert.equal(r.rng,before);assert.ok(E.restore(r));
});
for(const [name,mutate]of [
 ['missing candidate checkpoint',r=>delete r.checkpoint.economyState],
 ['different checkpoint difficulty',r=>{r.checkpoint.economyState.difficulty='hard';r.checkpoint.economyState.profile=copy(Eco.data.profiles.hard);}],
 ['different checkpoint support',r=>r.checkpoint.economyState.support=false],
 ['legacy live state with candidate checkpoint',r=>delete r.economyState]
])test('restore rejects '+name+' instead of silently changing Retry rules',()=>{
 const r=room('boss','easy');winBattle(r);E.nextStage(r);assert.ok(E.restore(r));mutate(r);const before=copy(r);assert.equal(E.restore(r)===null,true);assert.deepEqual(r,before,'validation remains read-only');
});
