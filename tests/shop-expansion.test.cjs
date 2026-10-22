const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),A=require('../dist/artifacts.js'),C=require('../dist/config.js'),{claimArtifact}=require('./helpers/education.cjs');
function atShop(mode='learn',seed=7){const r=E.newRun(seed,mode);if(mode==='challenge')claimArtifact(r,r.artifactState.offer.ids[0]);const map=E.getMap(r),shop=map.nodes.find(n=>n.type==='shop');let path=[shop];for(let d=shop.depth-1;d>=0;d--)path.unshift(map.nodes.find(n=>n.depth===d&&n.next.includes(path[0].id)));r.depth=shop.depth;r.route.path=path.slice(0,-1).map(n=>n.id);r.cleared=r.route.path.slice();E.enterNode(r,shop.id);return r;}
const copy=x=>JSON.parse(JSON.stringify(x));
test('new stock is six unique cards, exactly one 60% sale, and a 3/2/1 unowned artifact mix, without consuming gameplay RNG',()=>{
 const sales=new Set();for(let seed=1;seed<=60;seed++){const r=atShop('challenge',seed),s=r.shop,streams=[r.rng,r.artifactState.rng];assert.equal(s.offers.length,6);assert.equal(new Set(s.offers.map(o=>o.key)).size,6);const sale=s.offers.findIndex(o=>o.sale);sales.add(sale);assert.equal(s.offers.filter(o=>o.sale).length,1);assert.equal(s.offers[sale].price,s.offers[sale].basePrice*.4);assert.deepEqual(s.artifacts.map(o=>o.tier),['starting','starting','starting','elite_mystery','elite_mystery','boss']);assert.equal(new Set(s.artifacts.map(o=>o.id)).size,6);assert.ok(s.artifacts.every(o=>!A.has(r,o.id)&&A.eligible(r,A.catalog[o.id])));assert.deepEqual(E.restore(copy(r)).shop,s);assert.deepEqual([r.rng,r.artifactState.rng],streams);}assert.equal(sales.size,6);
});
test('all six artifact and card purchases in either mode persist once; Starting purchases preserve the opening gift ledger',()=>{
 for(const mode of ['learn','challenge']){let r=atShop(mode);r.gold=10000;const startingId=r.artifactState?.startingId||null,stock=copy(r.shop),rng=r.rng;
 for(let i=0;i<6;i++){const price=E.shopPrice(r,r.shop.artifacts[i]),before=r.gold,item=A.catalog[r.shop.artifacts[i].id];E.buyArtifact(r,i);assert.equal(r.gold,before-price+(item.values.gold||0));assert.ok(A.has(r,item.id));assert.equal(r.artifactState.startingId,startingId);assert.ok(E.validate(r));const once=copy(r);assert.throws(()=>E.buyArtifact(r,i));assert.deepEqual(r,once);r=E.restore(r);assert.ok(r);}
 for(let i=0;i<6;i++){const before=r.gold,price=E.shopPrice(r,r.shop.offers[i]),size=r.deck.length;E.buyCard(r,i);assert.equal(r.gold,before-price);assert.equal(r.deck.length,size+1);assert.ok(E.restore(r));const once=copy(r);assert.throws(()=>E.buyCard(r,i));assert.deepEqual(r,once);}
 assert.deepEqual(r.shop.offers,stock.offers);assert.deepEqual(r.shop.artifacts,stock.artifacts);assert.equal(r.rng,rng);E.leaveShop(r);assert.ok(E.validate(r));E.enterNode(r);assert.ok(E.validate(r));}
});
test('artifact discount bought during a visit updates quotes through the same price owner without invalidating saved stock',()=>{
 let r;for(let seed=1;seed<100;seed++){const x=atShop('learn',seed);if(x.shop.artifacts.some(o=>A.catalog[o.id]?.values.discount_percent)){r=x;break;}}assert.ok(r);r.gold=1000;const i=r.shop.artifacts.findIndex(o=>A.catalog[o.id]?.values.discount_percent),old=copy(r.shop.offers);E.buyArtifact(r,i);assert.ok(A.discount(r)>0);for(const o of r.shop.offers)assert.equal(E.shopPrice(r,o),Math.ceil(o.price*(100-A.discount(r))/100));assert.deepEqual(r.shop.offers,old);assert.ok(E.restore(r));
});
test('paid card removal is atomic, per visit, respects physical IDs and deck floor, and cannot be replayed after refresh',()=>{
 let r=atShop();r.gold=1000;const removed=copy(r.deck[0]),before=r.gold,size=r.deck.length;E.removeShopCard(r,removed.uid);assert.equal(r.gold,before-50);assert.equal(r.deck.length,size-1);assert.deepEqual(r.shop.removed,removed);r=E.restore(r);assert.ok(r);const once=copy(r);assert.throws(()=>E.removeShopCard(r,r.deck[0].uid));assert.deepEqual(r,once);
 for(const reason of ['gold','floor','id']){const x=atShop();x.gold=reason==='gold'?0:1000;if(reason==='floor')x.deck=x.deck.slice(0,10);const old=copy(x);assert.throws(()=>E.removeShopCard(x,reason==='id'?'c999':x.deck[0].uid));assert.deepEqual(x,old);}
});
test('unaffordable/full/invalid purchases leave saves untouched; forged stock, sale, tier, price and removal state are rejected',()=>{
 for(const which of ['card','artifact']){const r=atShop();r.gold=0;const old=copy(r);assert.throws(()=>which==='card'?E.buyCard(r,0):E.buyArtifact(r,0));assert.deepEqual(r,old);}
 const changes=[r=>r.shop.offers[0].sale=!r.shop.offers[0].sale,r=>r.shop.offers[0].price=1,r=>r.shop.artifacts[0].price=1,r=>r.shop.artifacts[0].id=r.shop.artifacts[5].id,r=>r.shop.artifactBought=[0],r=>r.shop.removed=copy(r.deck[0]),r=>r.shop.ownedBefore=['not-an-artifact']];for(const change of changes){const r=atShop();change(r);assert.equal(E.restore(r),null);}
});
test('legacy three-card visits retain stock and purchases until departure; next shops use the new inventory',()=>{
 let r=atShop();r.shop={offers:E.shopOffers(r,r.route.active,true),bought:[]};r.gold=1000;const stock=copy(r.shop.offers);assert.ok(E.validate(r));E.buyCard(r,2);r=E.restore(r);assert.ok(r);assert.deepEqual(r.shop.offers,stock);assert.deepEqual(r.shop.bought,[2]);assert.throws(()=>E.buyArtifact(r,0));E.leaveShop(r);assert.ok(E.validate(r));
});
test('purchased Boss artifacts leave only unowned Boss gifts available and preserve the education gate',()=>{
 const r=E.newRun(9,'challenge');claimArtifact(r,r.artifactState.offer.ids[0]);A.acquire(r,A.id('b01'),'shop:0:fixture:5');r.scene='stageclear';r.stage=0;r.depth=9;r.route.active=E.getMap(r).nodes.find(n=>n.type==='boss').id;
 A.offer(r,'boss');assert.equal(A.choices(r).length,2);assert.equal(A.valid(r),true);assert.ok(!A.choices(r).some(a=>a.id===A.id('b01')));
});
test('legacy Challenge without an opening artifact can buy, save, and later receive normal non-starting gifts',()=>{
 const r=atShop('learn');r.mode='challenge';r.gold=1000;E.buyArtifact(r,0);assert.equal(r.artifactState.shopOnly,true);assert.ok(E.restore(r));E.leaveShop(r);assert.ok(E.validate(r));r.scene='event';assert.ok(A.offer(r,'mystery'));assert.ok(A.valid(r));
});
