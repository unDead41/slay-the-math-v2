'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),Q=require('../dist/education.js');
let T;try{T=require('../dist/tutorial-core.js');}catch(e){if(e.code!=='MODULE_NOT_FOUND')throw e;}
function course(options){assert.equal(typeof T?.create,'function','The complete tutorial controller must be available');return T.create(options);}
function storage(initial={}){const values=new Map(Object.entries(initial));return {values,getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};}
test('a new tutorial inherits the supplied language and then respects its own saved choice',()=>{
 const s=storage(),c=course({storage:s,language:'ms'});assert.equal(c.progress().language,'ms');c.language('en');assert.equal(course({storage:s,language:'ms'}).progress().language,'en');
});
test('reading progress resumes, resets only its own key and rejects unknown chapters',()=>{
 const s=storage({'duel-cube-math.v1':'player save','duel-cube-question-history.v1':'question history'}),c=course({storage:s});
 c.completeReading();c.select('shop');c.language('ms');const next=course({storage:s});
 assert.equal(next.progress().chapter,'shop');assert.equal(next.progress().language,'ms');assert.ok(next.progress().completed.includes('welcome'));
 assert.throws(()=>next.select('missing'));next.reset();assert.deepEqual(next.progress().completed,[]);assert.equal(s.values.get('duel-cube-math.v1'),'player save');assert.equal(s.values.get('duel-cube-question-history.v1'),'question history');
 assert.deepEqual([...s.values.keys()].sort(),['duel-cube-math.v1','duel-cube-question-history.v1','slay-the-math.tutorial.v1']);
});
test('invalid and unavailable storage keep the course usable without touching other records',()=>{
 for(const s of [storage({'slay-the-math.tutorial.v1':'bad json'}),{getItem(){throw Error('denied');},setItem(){throw Error('quota');}}]){
  const c=course({storage:s});assert.equal(c.progress().chapter,'welcome');c.select('cards');c.act('cards','play');assert.ok(c.progress().completed.includes('cards'));assert.ok(c.progress().storageNotice);
 }
 const c=course({storage:storage({'slay-the-math.tutorial.v1':JSON.stringify({version:1,chapter:'bad',language:'bad',completed:['bad','welcome','welcome']})})});assert.equal(c.progress().chapter,'welcome');assert.deepEqual(c.progress().completed,[]);
});
test('Attack and draw lessons commit actual engine effects once and replay safely',()=>{
 const c=course();c.select('cards');let before=c.exercise('cards');const after=c.act('cards','play');
 assert.equal(after.run.battle.hp,before.run.battle.hp-6);assert.equal(after.run.battle.energy,before.run.battle.energy-1);assert.equal(after.complete,true);assert.ok(E.validate(after.run));
 assert.deepEqual(c.act('cards','play').run,after.run,'a repeated completed action cannot charge Energy again');
 const replay=c.replay('cards');assert.equal(replay.run.battle.hp,before.run.battle.hp);assert.equal(replay.complete,false);
 c.select('piles');before=c.exercise('piles');const drawn=c.act('piles','play');assert.equal(drawn.run.battle.hand.length,before.run.battle.hand.length+1);assert.equal(drawn.run.battle.draw.length,before.run.battle.draw.length-2);assert.ok(E.validate(drawn.run));
});
test('Block lesson requires playing defense before End Turn and observes the real enemy phase',()=>{
 const c=course();c.select('combat');const before=c.exercise('combat');assert.throws(()=>c.act('combat','end-turn'));
 const guarded=c.act('combat','play');assert.equal(guarded.run.battle.block,6);assert.equal(guarded.complete,false);
 const ended=c.act('combat','end-turn');assert.equal(ended.complete,true);assert.equal(ended.run.hp,before.run.hp);assert.equal(ended.run.battle.turn,2);assert.ok(E.validate(ended.run));
});
test('Predict uses canonical wrong/help/retry events without changing any host state',()=>{
 const player=E.newRun(777,'challenge'),bytes=JSON.stringify(player),s=storage({'duel-cube-math.v1':bytes}),c=course({storage:s});c.select('predict');
 const view=c.exercise('predict'),q=Q.currentConsumer(view.run).question,wrong=q.choices.find(x=>x.id!==q.correctChoiceId).id;
 c.act('predict','hint');c.act('predict','select',wrong);let result=c.act('predict','check');assert.equal(result.complete,false);assert.equal(Q.consumerRecord(result.run).hintState.moreHintUnlocked,true);
 c.act('predict','moreHint');c.act('predict','select',q.correctChoiceId);result=c.act('predict','check');assert.equal(result.complete,true);assert.equal(result.run.battle.focus,0,'helped completion is not independent Focus');assert.ok(E.validate(result.run));
 assert.equal(JSON.stringify(player),bytes);assert.equal(s.values.get('duel-cube-math.v1'),bytes);assert.deepEqual([...s.values.keys()].sort(),['duel-cube-math.v1','slay-the-math.tutorial.v1']);
});
test('Focus and Passive practice use real plans and never allow an out-of-order action',()=>{
 const c=course();c.select('focus');assert.throws(()=>c.act('focus','play'));c.act('focus','arm');const focused=c.act('focus','play');assert.equal(focused.run.battle.hp,21);assert.equal(focused.run.battle.focus,0);assert.equal(focused.run.battle.boostUsed,true);
 c.select('passive');const passive=c.act('passive','play');assert.equal(passive.run.battle.active.length,1);assert.equal(passive.run.battle.strength,2);assert.ok(E.validate(passive.run));
 assert.throws(()=>c.act('focus','play'),'stale controls from another chapter are rejected');assert.throws(()=>c.completeReading(),'practice completion cannot be marked read');
});
test('map, rewards, Shop and Rest teach real transactions with reloadable examples',()=>{
 const c=course();c.select('map');let r=c.exercise('map').run;assert.throws(()=>c.act('map','enter','invalid'));let v=c.act('map','enter',E.availableNodes(r)[0].id);assert.ok(v.complete);assert.ok(E.validate(v.run));
 c.select('rewards');r=c.exercise('rewards').run;v=c.act('rewards','take',r.rewards[0]);assert.equal(v.run.deck.length,r.deck.length+1);assert.ok(E.validate(v.run));assert.deepEqual(c.act('rewards','take',r.rewards[0]).run,v.run);
 c.select('shop');r=c.exercise('shop').run;const price=E.shopPrice(r,r.shop.offers[0]);v=c.act('shop','buy','0');assert.equal(v.run.gold,r.gold-price);assert.equal(v.run.deck.length,r.deck.length+1);assert.ok(E.validate(v.run));
 c.select('rest');r=c.exercise('rest').run;v=c.act('rest','heal');assert.equal(v.run.hp,Math.min(r.maxHp,r.hp+E.restHeal(r)));assert.ok(E.validate(v.run));
});
test('boss practice opens two seals across separate turns using actual Predict',()=>{
 const c=course();c.select('boss');for(let i=0;i<2;i++){
  const q=Q.currentConsumer(c.exercise('boss').run).question;c.act('boss','select',q.correctChoiceId);const v=c.act('boss','check');assert.equal(v.run.battle.seals,i+1);assert.equal(v.complete,i===1);assert.ok(E.validate(v.run));if(i===0)c.act('boss','next-predict');
 }
 assert.ok(c.progress().completed.includes('boss'));
});
test('a completed Predict can show worked steps without repeating its reward',()=>{
 const c=course();c.select('predict');const q=Q.currentConsumer(c.exercise().run).question;c.act('predict','select',q.correctChoiceId);const before=c.act('predict','check');
 const after=c.act('predict','steps');assert.equal(Q.consumerRecord(after.run).stepsViewed,true);assert.equal(after.run.battle.focus,before.run.battle.focus);assert.equal(after.run.stats.forecasts,1);
});
test('every practical chapter works with each loaded Master profile and its own amounts',()=>{
 const fs=require('node:fs'),{loadMaster}=require('../tools/balance/master/loader.cjs');
 for(const difficulty of ['easy','medium','hard']){
  const x=loadMaster({difficulty}),root={DCEngine:x.E,DCConfig:x.C,DCEducation:x.Q,DCTutorialData:require('../dist/tutorial-data.js')};
  new Function('globalThis',fs.readFileSync(require.resolve('../dist/tutorial-core.js'),'utf8'))(root);const c=root.DCTutorialCore.create();
  for(const [id,action]of [['cards','play'],['piles','play'],['passive','play'],['rest','heal']]){c.select(id);const result=c.act(id,action);assert.equal(result.complete,true,difficulty+' '+id);assert.ok(x.E.validate(result.run));}
  c.select('focus');const before=c.exercise().run;c.act('focus','arm');const card=c.exercise().run.battle.hand.find(c=>c.key==='stm.attack.rune_strike'),plan=x.E.cardPlan(c.exercise().run,card);const after=c.act('focus','play');assert.equal(after.run.battle.hp,before.battle.hp-plan.damageEvents[0].hpLost);assert.ok(x.E.validate(after.run));
  c.select('combat');c.act('combat','play');assert.ok(c.act('combat','end-turn').complete);
  c.select('first-turn');c.act('first-turn','play');c.act('first-turn','play');assert.ok(c.act('first-turn','end-turn').complete);assert.ok(x.E.validate(c.exercise().run));
  c.select('map');assert.ok(c.act('map','enter',x.E.availableNodes(c.exercise().run)[0].id).complete);
  c.select('rewards');assert.ok(c.act('rewards','skip').complete);
  c.select('shop');assert.ok(c.act('shop','buy','0').complete);
  for(const id of ['predict','boss']){c.select(id);for(let i=0;i<(id==='boss'?2:1);i++){const q=x.Q.currentConsumer(c.exercise().run).question;c.act(id,'select',q.correctChoiceId);const v=c.act(id,'check');assert.ok(x.E.validate(v.run));if(id==='boss'&&i===0)c.act(id,'next-predict');}assert.equal(c.exercise().complete,true);}
 }
});

test('old tutorial progress survives the two routes and new chapters',()=>{
 const old={version:1,chapter:'rewards',language:'ms',completed:['welcome','cards','rewards']},s=storage({[T.storageKey]:JSON.stringify(old)}),c=course({storage:s});
 assert.equal(c.progress().chapter,'rewards');assert.equal(c.progress().route,'all');assert.deepEqual(c.progress().completed,old.completed);
 c.route('basics');assert.equal(c.progress().chapter,'welcome');assert.deepEqual(c.progress().completed,old.completed);
 c.select('reporting');assert.equal(c.progress().route,'all');assert.equal(c.progress().chapter,'reporting');
 assert.throws(()=>c.route('invalid'));assert.deepEqual(c.progress().completed,old.completed);
});
test('full-turn practice protects, attacks and resolves the enemy once in order',()=>{
 const c=course();c.select('first-turn');const initial=c.exercise();assert.throws(()=>c.act('first-turn','end-turn'));
 const guarded=c.act('first-turn','play');assert.equal(guarded.step,1);assert.equal(guarded.run.battle.block,6);assert.equal(guarded.run.battle.energy,2);
 assert.throws(()=>c.act('first-turn','end-turn'));const attacked=c.act('first-turn','play');assert.equal(attacked.step,2);assert.equal(attacked.run.battle.hp,initial.run.battle.hp-6);assert.equal(attacked.run.battle.block,6);assert.equal(attacked.run.battle.energy,1);
 assert.throws(()=>c.act('first-turn','play'));const ended=c.act('first-turn','end-turn');assert.equal(ended.run.hp,initial.run.hp);assert.equal(ended.run.battle.turn,2);assert.equal(ended.complete,true);assert.ok(E.validate(ended.run));assert.deepEqual(c.act('first-turn','end-turn'),ended);
});
test('two wrong practice answers award neither completion nor Focus or a boss seal',()=>{
 for(const id of ['predict','boss']){const c=course();c.select(id);const q=Q.currentConsumer(c.exercise().run).question,wrong=q.choices.filter(a=>a.id!==q.correctChoiceId);
  for(const a of wrong.slice(0,2)){c.act(id,'select',a.id);c.act(id,'check');}
  const x=c.exercise();assert.equal(x.complete,false);assert.equal(x.run.battle.focus,0);assert.equal(x.run.battle.seals,0);assert.equal(c.progress().completed.includes(id),false);assert.ok(E.validate(x.run));
  const next=c.replay();assert.equal(Q.consumerRecord(next.run).attempts.length,0);
 }
});
