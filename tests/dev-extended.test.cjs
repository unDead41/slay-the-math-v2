const test=require('node:test'),assert=require('node:assert/strict'),F=require('../tools/dev/fixtures.js'),E=require('../dist/engine.js'),C=require('../dist/config.js'),D=require('../dist/card-data.js'),X=require('../dist/mystery.js'),RT=require('../tools/dev/runtime-tools.js');
test('teleport reaches every node on both stage maps without mutating the original preview',()=>{
 for(const seed of [7,18,42]){const source=F.create({kind:'map',seed}),saved=JSON.stringify(source);for(const stage of [0,1])for(const node of F.mapNodes(source,stage)){const r=F.teleport(source,stage,node.id);assert.equal(r.route.active,node.id);assert.equal(r.depth,node.depth);assert.equal(r.stage,stage);assert.ok(E.validate(r),node.id);assert.deepEqual(r.deck,source.deck);assert.equal(r.hp,source.hp);assert.equal(r.gold,source.gold);assert.equal(JSON.stringify(source),saved);}}
});
test('all 40 cards can be added as physical combat/deck cards with upgrades and enforced limits',()=>{
 for(const c of D.cards)for(const upgraded of [false,true]){const source=F.create({kind:'combat'}),r=F.addCards(source,c.id,1,upgraded,'hand');assert.ok(E.validate(r),c.id);assert.equal(r.deck.length,source.deck.length+1);assert.equal(r.battle.hand.at(-1).key,c.id);assert.equal(r.battle.hand.at(-1).upgraded,upgraded);assert.equal(r.deck.at(-1).uid,r.battle.hand.at(-1).uid);assert.equal(source.deck.length,12);}
 const source=F.create({kind:'map'}),all=D.cards.reduce((r,c)=>F.addCards(r,c.id),source);assert.equal(all.deck.length,52);assert.ok(E.validate(all));assert.throws(()=>F.addCards(all,D.cards[0].id,9),/60/);assert.throws(()=>F.addCards(source,'missing'),/Unknown/);
 assert.throws(()=>F.addCards(F.create({kind:'combat'}),D.cards[0].id,C.HAND_LIMIT,true,'hand'),/space/);
});
test('automatic fixtures expose all 15 event intros and start their real questions',()=>{
 assert.equal(Object.keys(X.catalog).length,15);for(const id of Object.keys(X.catalog)){const r=F.eventSetup(id,{stage:0});assert.equal(r.mysteryState.pending.eventId,id);assert.ok(E.validate(r));E.startMystery(r,[],null,Date.now());assert.equal(r.mysteryState.pending.phase,'question');assert.ok(E.validate(r));assert.throws(()=>F.teleport(r,0,F.mapNodes(r,0)[0].id),/pending/);}
});
test('God mode prevents lethal and repeated HP loss through real enemy turns, then OFF allows defeat',()=>{
 let enabled=true;const god=RT.godMode(()=>enabled),r=F.create({kind:'combat',enemy:'sentinel',hp:1});
 r.battle.currentIntent={label:'Lethal QA',damage:999,rage:0};god.action(r,()=>E.endTurn(r));assert.equal(r.hp,1);assert.equal(r.scene,'battle');assert.ok(E.validate(r));
 for(let i=0;i<8;i++){r.battle.currentIntent={label:'Lethal QA',damage:999,rage:0};god.action(r,()=>E.endTurn(r));assert.equal(r.hp,1);assert.equal(r.scene,'battle');assert.ok(E.validate(r));}
 // A transactional engine action may replace own properties; protection survives.
 god.action(r,()=>{delete r.hp;Object.assign(r,{hp:0});});assert.equal(r.hp,1);assert.ok(E.validate(r));enabled=false;r.battle.currentIntent={label:'Lethal QA',damage:999,rage:0};E.endTurn(r);assert.equal(r.hp,0);assert.equal(r.scene,'defeat');assert.ok(E.validate(r));
});
