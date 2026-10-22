'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),F=require('../tools/dev/fixtures.js'),E=require('../dist/engine.js'),C=require('../dist/config.js'),X=require('../dist/mystery.js'),A=require('../dist/artifacts.js'),D=require('../dist/card-data.js'),devResponse=require('../tools/dev/server.cjs');
test('all registered enemies launch valid, independent combat sessions',()=>{
 for(const enemy of Object.keys(C.enemies)){const r=F.create({enemy,kind:'combat',seed:42,started:1700000000000});assert.ok(E.validate(r),enemy);assert.deepEqual(F.create({enemy,seed:42,started:1700000000000}),r);E.endTurn(r);assert.notDeepEqual(F.create({enemy,seed:42,started:1700000000000}),r);}
});
test('scene fixtures support actual purchases, rest upgrades and each eligible mystery',()=>{
 const shop=F.create({kind:'shop',gold:500});const gold=shop.gold,deck=shop.deck.length;E.buyCard(shop,0);assert.ok(shop.gold<gold);assert.equal(shop.deck.length,deck+1);assert.ok(E.validate(shop));assert.throws(()=>E.buyCard(shop,0));
 const rest=F.create({kind:'rest'}),card=rest.deck[0];E.camp(rest,'upgrade',card.uid);assert.equal(rest.deck[0].upgraded,true);assert.ok(E.validate(rest));
 const artifact=Object.values(A.catalog).find(a=>a.tier==='starting').id;
 for(const event of Object.values(X.catalog)){const r=F.create({kind:'event',event:event.id,hp:20,artifacts:[artifact]});assert.equal(r.mysteryState.pending.eventId,event.id);E.startMystery(r,[],null,Date.now());assert.equal(r.mysteryState.pending.phase,'question');assert.ok(E.validate(r));}
});
test('all supplied cards have valid state fixtures without leaking Focus to Passive',()=>{
 for(const card of D.cards)for(const up of [false,true])for(const focus of [false,true]){const r=F.cardSetup(card.id,up,focus),p=E.cardPlan(r,r.battle.hand[0]);assert.ok(E.validate(r));assert.equal(p.upgraded,up);if(card.category==='passive')assert.equal(p.focused,false);}
});
test('reject invalid numeric values, unknown content and unusable presets',()=>{
 for(const setup of [{hp:NaN},{gold:-1},{enemy:'missing'},{deck:['missing']},{kind:'event',event:'missing'},{energy:100},{stage:4}])assert.throws(()=>F.create(setup));
 assert.throws(()=>F.validatePreset({version:4,name:'bad',setup:{}}));assert.throws(()=>F.validatePreset({version:1,name:'bad',setup:{enemy:'removed'}}));
});
test('dev response injects adapter/storage only in development documents',()=>{
 const html=devResponse('/__dev/sandbox/').data;assert.match(html,/storage\.js/);assert.match(html,/__dev\/app\.js/);
 const app=devResponse('/__dev/app.js').data;assert.match(app,/window.STMDevApi/);assert.doesNotThrow(()=>new Function(app));
 const original=require('node:fs').readFileSync(require('node:path').join(__dirname,'../dist/app.js'),'utf8');assert.doesNotMatch(original,/STMDevApi|STMDevFixtures/);
 assert.equal(devResponse('/__dev/adapter.js').status,404);
});
test('result previews and voice visits are valid diagnostic states',()=>{
 for(const kind of ['reward','victory','defeat','master','map']){const r=F.create({kind,visit:3});assert.equal(r.scene,kind==='master'?'master':kind);assert.ok(E.validate(r));assert.equal(r.audioPresentation.visits.merchant,2);}
 for(const enemy of ['wisp','sentinel','dealer']){const r=F.create({enemy,stage:enemy==='dealer'?1:0});F.forceResult(r,'win');assert.ok(E.validate(r));assert.ok(['reward','stageclear','victory'].includes(r.scene));}
});
test('player server denies direct developer routes',async t=>{
 const {spawn}=require('node:child_process'),path=require('node:path');
 const server=spawn(process.execPath,[path.resolve(__dirname,'../server.cjs')],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});t.after(()=>server.kill());
 const port=await new Promise((ok,no)=>{let text='';server.stdout.on('data',chunk=>{text+=chunk;const match=text.match(/Game: http:\/\/localhost:(\d+)/);if(match)ok(match[1]);});server.once('error',no);server.stderr.once('data',x=>no(Error(String(x))));});
 for(const route of ['/__dev/','/__dev/app.js','/__dev/sandbox/','/tools/dev/hub.js'])assert.equal((await fetch('http://127.0.0.1:'+port+route)).status,404);
 const html=await (await fetch('http://127.0.0.1:'+port)).text();assert.doesNotMatch(html,/__dev/);
});
