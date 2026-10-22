const {claimArtifact,completeTrial,completeBrowserTrial}=require('./helpers/education.cjs');
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),A=require('../dist/artifacts.js'),C=require('../dist/config.js');
const copy=x=>JSON.parse(JSON.stringify(x));
function start(code='s02',seed=1){
 for(let n=seed;n<seed+300;n++){
  const r=E.newRun(n,'challenge');
  if(r.artifactState?.offer.ids.includes(A.id(code))){claimArtifact(r,A.id(code));return r;}
 }
 throw new Error('No offer found for '+code);
}
function own(r,...codes){for(const code of codes)A.acquire(r,A.id(code),'fixture:'+code);return r;}
function battle(code='s02',extras=[],seed=1){const r=start(code,seed);delete r.route;own(r,...extras);E.startBattle(r,'sentinel');r.battle.seals=2;r.battle.hp=100;r.battle.maxHp=100;return r;}
function hand(r,keys){const b=r.battle,all=[...b.hand,...b.draw,...b.discard];b.hand=[];b.draw=all;b.discard=[];
 for(const key of keys){const i=b.draw.findIndex(c=>c.key===key);assert.ok(i>=0,key);b.hand.push(b.draw.splice(i,1)[0]);}
 return b.hand;
}
function play(r,key){const c=r.battle.hand.find(c=>c.key===key);assert.ok(c,key);E.playCard(r,c.uid);}
function win(r){r.battle.hp=1;r.battle.enemyBlock=0;r.battle.energy=3;hand(r,['strike']);play(r,'strike');}

test('new Challenge freezes three unique working Starting choices before any map entry',()=>{
 const r=E.newRun(7,'challenge'),rng=r.rng;
 assert.equal(r.scene,'master');assert.equal(E.availableNodes(r).length,0);
 const ids=r.artifactState.offer.ids;assert.equal(new Set(ids).size,3);
 assert.ok(ids.every(key=>A.catalog[key].tier==='starting'&&!A.catalog[key].requires));
 assert.deepEqual(E.newRun(7,'challenge').artifactState.offer.ids,ids);
 assert.ok(new Set(Array.from({length:12},(_,i)=>E.newRun(i,'challenge').artifactState.offer.ids.join(','))).size>1);
 assert.throws(()=>E.enterNode(r));assert.throws(()=>E.startBattle(r,'wisp'));
 assert.deepEqual(E.restore(copy(r)).artifactState,r.artifactState);
 const before=copy(r);assert.throws(()=>claimArtifact(r,A.id('b01')));assert.deepEqual(r,before);
 claimArtifact(r,ids[0]);assert.equal(r.scene,'map');assert.equal(r.rng,rng);
 const after=copy(r);assert.throws(()=>claimArtifact(r,ids[1]));assert.deepEqual(r,after);assert.ok(E.validate(r));
});
test('Learn and existing Challenge saves retain their original flow',()=>{
 assert.equal(E.newRun(7).scene,'map');
 const old=E.newRun(7,'challenge');delete old.artifactState;old.scene='map';
 assert.ok(E.restore(old));E.enterNode(old);assert.equal(old.battle.energy,3);assert.equal(old.battle.hand.length,4);assert.ok(E.validate(old));
});
test('Ration and Purse apply once on acquisition and never on restore',()=>{
 let r=start('s08');assert.equal(r.maxHp,65);assert.equal(r.hp,65);
 r.hp=42;r=E.restore(copy(r));assert.equal(r.hp,42);assert.equal(r.maxHp,65);assert.ok(E.validate(r));
 assert.throws(()=>A.acquire(r,A.id('s08'),'duplicate'));
 let purse=start('s09');assert.equal(purse.gold,C.ECONOMY.start+25);
 purse=E.restore(copy(purse));assert.equal(purse.gold,C.ECONOMY.start+25);
 assert.throws(()=>A.acquire(purse,A.id('s09'),'again'));
});
test('first-turn Lens, Bookmark and Guard Pin reset each combat, not each render/turn',()=>{
 for(const [code,key,expected]of [['s04','focus',1],['s05','hand',5],['s07','block',3]]){
  const r=battle(code),b=r.battle;assert.equal(key==='hand'?b.hand.length:b[key],expected);
  const snapshot=copy(r);assert.deepEqual(E.restore(snapshot),r);
  E.endTurn(r);if(key==='block')assert.equal(b.block,0);if(key==='hand')assert.equal(b.hand.length,4);
  E.startBattle(r,'wisp');assert.equal(key==='hand'?r.battle.hand.length:r.battle[key],expected);
 }
});
test('Bookmark and Satchel stack opening draws and do not add cards on later turns',()=>{
 const r=battle('s05',['e11']);assert.equal(r.battle.hand.length,7);E.endTurn(r);assert.equal(r.battle.hand.length,4);
 E.startBattle(r,'wisp');assert.equal(r.battle.hand.length,7);assert.ok(E.validate(r));
});
test('first Attack bonus is per resolved card, stacks with Tongs, and refreshes per turn',()=>{
 const r=battle('s02',['e07']);hand(r,['strike','ember']);r.battle.enemyBlock=0;
 const hp=r.battle.hp;play(r,'strike');assert.equal(hp-r.battle.hp,10);
 const hp2=r.battle.hp;play(r,'ember');assert.equal(hp2-r.battle.hp,6);
 E.endTurn(r);hand(r,['strike']);r.battle.enemyBlock=0;const hp3=r.battle.hp;play(r,'strike');assert.equal(hp3-r.battle.hp,10);
 assert.ok(E.validate(r));
});
test('Buckler, Sentinel Crest and Agility apply only to Defense cards',()=>{
 const r=battle('s03',['e08','e16']);hand(r,['guard','flameguard']);play(r,'guard');assert.equal(r.battle.block,15);
 play(r,'flameguard');assert.equal(r.battle.block,22);
 assert.ok(E.validate(r));
});
test('Strength and first-Attack bonuses are applied before enemy Block and boss seals',()=>{
 const r=battle('s02',['e15']);hand(r,['strike']);r.battle.seals=0;r.battle.enemyBlock=2;
 const hp=r.battle.hp;play(r,'strike');assert.equal(hp-r.battle.hp,3); // ceil((6+1+2)/2)-2
});
test('Quill is once per combat and Bell once per turn; Skill resolution draws actual cards',()=>{
 const r=battle('s10',['e10']);hand(r,['draw','filter']);
 play(r,'draw');assert.equal(r.battle.hand.length,5); // 2-1 +2 card +1 Bell +1 Quill
 const before=r.battle.hand.length,target=r.battle.draw[0];
 const filter=r.battle.hand.find(c=>c.key==='filter');E.playCard(r,filter.uid,[target.uid]);assert.equal(r.battle.hand.length,before-1);
 E.endTurn(r);hand(r,['draw']);play(r,'draw');assert.equal(r.battle.hand.length,3); // 1-1+2+1
});
test('Exhaust triggers once at the correct combat/turn scope, after the full batch is moved',()=>{
 const r=battle('s11',['e05']);const extra=E.card(r,'filter');r.deck.push(extra);r.battle.draw.push(copy(extra));hand(r,['filter','filter']);
 const targets=r.battle.draw.slice(-2).map(c=>c.uid),uid=r.battle.hand[0].uid;
 E.playCard(r,uid,targets);assert.ok(targets.every(id=>r.battle.exhaust.some(c=>c.uid===id)));
 assert.equal(r.battle.block,8);const count=r.battle.hand.length;
 const filter=r.battle.hand.find(c=>c.key==='filter');E.playCard(r,filter.uid,[r.battle.draw[0].uid]);
 assert.equal(r.battle.block,8);assert.equal(r.battle.hand.length,count-1);assert.ok(E.validate(r));
});
test('Abacus awards once after the third resolved card; Pair works in either order',()=>{
 for(const keys of [['strike','guard','ember'],['guard','strike','ember']]){
  const r=battle('s02',['e01','e02']);hand(r,[...keys,'flameguard']);
  play(r,keys[0]);play(r,keys[1]);assert.equal(r.battle.block,11);play(r,keys[2]);assert.equal(r.battle.energy,1);
  const restored=E.restore(copy(r));assert.equal(restored.battle.energy,1);assert.ok(restored.battle.artifacts.turn.abacus);
  play(restored,'flameguard');assert.equal(restored.battle.energy,0);
 }
});
test('Chance Die uses one persisted independent roll and grants the documented face outcome',()=>{
 const seen=new Set();
 for(let seed=1;seed<=80&&seen.size<6;seed++){
  const r=start('s02',seed);delete r.route;own(r,'e03');const combatRng=r.rng;E.startBattle(r,'wisp');
  const b=r.battle,n=b.artifacts.die;seen.add(n);
  assert.equal(b.block,n<=2?10:0);assert.equal(b.hand.length,n>=3&&n<=4?6:4);assert.equal(b.energy,n>=5?5:3);
  const saved=E.restore(copy(r));assert.equal(saved.battle.artifacts.die,n);assert.equal(saved.artifactState.rng,r.artifactState.rng);
  const plain=E.newRun(r.seed);E.startBattle(plain,'wisp');assert.equal(plain.rng,r.rng);assert.equal(combatRng,r.seed);
  E.endTurn(saved);assert.equal(saved.battle.artifacts.die,n);assert.equal(saved.battle.energy,3);assert.ok(E.validate(saved));
 }
 assert.equal(seen.size,6);
});
test('Ember Balance blocks before damage; fully blocked attacks retaliate through normal mitigation',()=>{
 const r=battle('s02',['e04','e09']);r.battle.block=2;r.battle.enemyBlock=1;r.battle.currentIntent.damage=8;
 const hp=r.hp,enemy=r.battle.hp;E.endTurn(r);assert.equal(r.hp,hp);assert.equal(r.battle.hp,enemy-5);
 const zero=battle('s02',['e09']);zero.battle.block=100;zero.battle.currentIntent.damage=0;
 const before=zero.battle.hp;E.endTurn(zero);assert.equal(zero.battle.hp,before);
});
test('retaliation victory resolves once, grants healing once and does not start a phantom turn',()=>{
 const r=battle('s01',['e06','e09']);r.depth=4;r.hp=30;r.battle.block=100;r.battle.hp=4;r.battle.enemyBlock=0;
 E.endTurn(r);assert.equal(r.scene,'stageclear');assert.equal(r.hp,37);assert.equal(r.stats.battles,1);assert.equal(r.battle.turn,1);
 assert.deepEqual(E.restore(copy(r)),r);
});
test('Pendant and Feather cap healing; Lantern triggers once while alive and never revives',()=>{
 const r=battle('s01',['e06']);r.hp=58;win(r);assert.equal(r.hp,60);assert.equal(r.battle.artifacts.combat.won,true);
 const flask=battle('s02',['e12']);flask.hp=30;flask.battle.block=0;flask.battle.currentIntent.damage=1;
 E.endTurn(flask);assert.ok(flask.battle.artifacts.combat.flask);assert.equal(flask.battle.block,12); // award survives the next player-turn reset
 const low=start('s02');own(low,'e12');low.hp=30;E.startBattle(low,'wisp');assert.equal(low.battle.block,12);
 low.battle.currentIntent.damage=100;low.battle.block=0;E.endTurn(low);assert.equal(low.hp,0);assert.equal(low.scene,'defeat');
});
test('shop discounts use the best rate only, with ceil rounding and exact saved stock',()=>{
 const merchant=start('s06');for(const [base,expected]of [[1,1],[45,43],[60,57],[65,62]])assert.equal(A.price(merchant,base),expected);
 const r=start('s06');own(r,'e14');const map=E.getMap(r),shop=map.nodes.find(n=>n.type==='shop');
 let path=[shop];for(let d=shop.depth-1;d>=0;d--)path.unshift(map.nodes.find(n=>n.depth===d&&n.next.includes(path[0].id)));
 r.depth=shop.depth;r.route.path=path.slice(0,-1).map(n=>n.id);r.cleared=r.route.path.slice();E.enterNode(r,shop.id);
 for(const o of r.shop.offers)assert.equal(E.shopPrice(r,o),Math.ceil((o.sale?o.basePrice*.4:o.basePrice)*.85));
 const price=E.shopPrice(r,r.shop.offers[0]),old=r.gold;E.buyCard(r,0);assert.equal(r.gold,old-price);assert.ok(E.restore(copy(r)));
});
test('Boss artifacts add Energy/draw every turn and Clasp caps only its own stat contribution',()=>{
 const r=battle('s02',['b01','b02','b03','e15','e16']);assert.equal(r.battle.energy,4);assert.equal(r.battle.hand.length,6);
 for(const expected of [5,6,7,8,8]){
  assert.equal(r.battle.strength,expected);assert.equal(r.battle.agility,expected);assert.ok(E.restore(copy(r)));
  r.battle.block=100;E.endTurn(r);assert.equal(r.battle.energy,4);
 }
 E.startBattle(r,'wisp');assert.equal(r.battle.strength,5);assert.equal(r.battle.agility,5);
});
test('Elite card choice precedes its frozen artifact offer and double claims are rejected',()=>{
 const r=start('s02');delete r.route;r.depth=1;E.startBattle(r,'knight',true);win(r);
 const offer=copy(r.artifactState.offer);assert.equal(offer.ready,false);assert.equal(E.artifactChoices(r).length,0);
 E.chooseReward(r,r.rewards[0]);assert.equal(r.scene,'reward');assert.equal(r.artifactState.offer.ready,true);
 const before=copy(r);assert.throws(()=>E.chooseReward(r,r.rewards[1]));assert.deepEqual(r,before);
 const chosen=r.artifactState.offer.ids[0];claimArtifact(r,chosen);assert.equal(r.scene,'map');assert.ok(A.has(r,chosen));
 assert.throws(()=>claimArtifact(r,chosen));assert.ok(E.validate(r));
});
test('Mystery offers exclude owned items and cannot reroll through another event action',()=>{
 const r=start('s02');delete r.route;r.depth=3;r.scene='event';own(r,'e01');E.event(r,'artifact');
 const ids=copy(r.artifactState.offer.ids);assert.ok(ids.every(key=>key!==A.id('e01')));
 assert.throws(()=>E.event(r,'heal'));assert.deepEqual(E.restore(copy(r)).artifactState.offer.ids,ids);
 claimArtifact(r,ids[0]);assert.equal(r.scene,'map');assert.equal(r.depth,4);assert.ok(E.validate(r));
});
test('Boss choice is required before Stage 2 and the exact artifact checkpoint survives retry',()=>{
 const r=battle('s08');r.depth=4;win(r);assert.equal(r.scene,'stageclear');
 assert.equal(E.artifactChoices(r).length,3);assert.throws(()=>E.nextStage(r));
 claimArtifact(r,A.id('b01'));assert.equal(r.stage,1);assert.equal(r.scene,'map');assert.ok(r.checkpoint);
 const before=copy(r.checkpoint);r.hp=0;r.scene='defeat';const retry=E.retry(r);
 assert.deepEqual(retry.artifactState,before.artifactState);assert.equal(retry.maxHp,65);assert.ok(E.validate(retry));
});
test('unsupported Passive/discard items stay out of offers; their event hooks remain precise',()=>{
 const r=start('s02');assert.equal(A.pool(r,'starting').some(a=>a.id===A.id('s12')),false);
 assert.equal(A.pool(r,'elite_mystery').some(a=>a.id===A.id('e13')),false);
 // Isolated forward-compatible trigger contract; no new card is enabled in the game.
 const x=battle('s02');own(x,'s12','e13');const ctx={draw:E.draw,notify:()=>{}};
 const before=x.battle.block;A.cardResolved(x,{role:'tactic'},ctx);assert.equal(x.battle.block,before);
 A.cardResolved(x,{role:'passive'},ctx);A.cardResolved(x,{role:'passive'},ctx);assert.equal(x.battle.block,before+3);
 const count=x.battle.hand.length;A.discardedByCard(x,1,ctx);A.discardedByCard(x,1,ctx);
 assert.equal(x.battle.block,before+6);assert.equal(x.battle.hand.length,count+1);
});
test('invalid ownership, offer tiers, acquisition records, counters and extra Max HP are rejected',()=>{
 const r=battle('s08',['e03']);
 for(const mutate of [x=>x.artifactState.owned.push(x.artifactState.owned[0]),x=>x.artifactState.acquired=[],x=>x.battle.artifacts.die=9,x=>x.battle.strength=99,x=>x.maxHp=70,x=>x.battle.energy=20]){
  const bad=copy(r);mutate(bad);assert.equal(E.restore(bad),null);
 }
 const opening=E.newRun(1,'challenge');opening.artifactState.offer.ids[0]=A.id('b01');assert.equal(E.restore(opening),null);
});
