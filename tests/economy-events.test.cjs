const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),X=require('../dist/mystery.js'),Q=require('../dist/education.js'),A=require('../dist/artifacts.js'),C=require('../dist/config.js');
const {event,atNode,winBattle}=require('./helpers/economy.cjs');const copy=x=>JSON.parse(JSON.stringify(x));
function solve(r,now=100000){E.startMystery(r,[],null,now);const q=Q.catalog[r.mysteryState.pending.questionId];E.answerMystery(r,q.correctChoiceId,now+1);E.continueMystery(r);return r;}
function claim(r,option,target){E.selectMysteryOption(r,option);if(target)E.selectMysteryTarget(r,target);E.claimMystery(r);return r;}
test('all fifteen events use profile duration, persist exact deadlines, and legacy durations stay untouched',()=>{
 for(const d of ['easy','medium','hard'])for(const e of X.data.events){let r=event(e.id,d);assert.equal(r.mysteryState.pending.eventId,e.id);assert.ok(E.validate(r));E.startMystery(r,[],null,100000);
 const base=e.timeLimitSeconds,want=({easy:{30:60,45:90,60:120},medium:{30:45,45:68,60:90},hard:{30:30,45:45,60:60}})[d][base];assert.equal(r.mysteryState.pending.deadline,100000+want*1000,e.id+' '+d);const p=copy(r.mysteryState.pending);r=E.restore(r);assert.ok(r,e.id+' '+d);assert.deepEqual(r.mysteryState.pending,p);assert.throws(()=>E.startMystery(r));}
 const old=require('./helpers/mystery.cjs').mysteryRoom('ME03');E.startMystery(old,[],null,100000);assert.equal(E.restore(old).mysteryState.pending.deadline,145000);
});
test('scaled Gold success, nonlethal failure and once-only settlement use actual engine deltas',()=>{
 for(const [d,gold,loss]of [['easy',48,0],['medium',40,4],['hard',36,5]]){
  const r=event('ME01',d),before=r.gold;solve(r);assert.equal(r.gold,before+gold);assert.ok(E.restore(r));const once=copy(r);assert.throws(()=>E.continueMystery(r));assert.deepEqual(r,once);
  const x=event('ME01',d);x.hp=2;E.startMystery(x,[],null,100000);const q=Q.catalog[x.mysteryState.pending.questionId];for(const c of q.choices.filter(c=>c.id!==q.correctChoiceId).slice(0,2))E.answerMystery(x,c.id,100001);E.continueMystery(x);assert.equal(x.hp,Math.max(1,2-loss));assert.ok(E.restore(x));
 }
});
test('profiled voluntary HP, Gold and Max HP costs enforce affordability and apply once at confirmation',()=>{
 for(const [d,hpCost,goldCost,maxCost]of [['easy',3,28,3],['medium',5,35,5],['hard',6,39,6]]){
  const r=event('ME02',d);solve(r);const before=r.hp;claim(r,'upgrade',r.deck[0].uid);assert.equal(r.hp,before-hpCost);assert.ok(r.deck[0].upgraded);assert.ok(E.restore(r));
  const forge=event('ME09',d);forge.gold=goldCost;solve(forge);claim(forge,'forge_upgrade',forge.deck[0].uid);assert.equal(forge.gold,0);assert.ok(E.restore(forge));
  const bargain=event('ME15',d);solve(bargain);const hp=bargain.hp;claim(bargain,'bargain');assert.equal(bargain.maxHp,60-maxCost);assert.equal(bargain.hp,Math.min(hp,60-maxCost));assert.ok(E.restore(bargain));
 }
});
test('Mystery removal enforces ten-card floor while Gold alternative remains usable',()=>{
 const r=event('ME10');r.deck=r.deck.slice(0,10);solve(r);const remove=X.definition(r).success.options.find(o=>o.id==='remove');assert.equal(X.actionable(r,remove),false);const before=r.gold;claim(r,'gold');assert.equal(r.gold,before+25);assert.equal(r.deck.length,10);assert.ok(E.restore(r));
});
test('event heal clamps, ME03 stays Skill-only, transforms preserve category and reset upgrade, offers remain frozen',()=>{
 for(const [d,heal]of [['easy',19],['medium',15],['hard',12]]){const r=event('ME05',d);r.hp=30;solve(r);claim(r,'heal');assert.equal(r.hp,30+heal);assert.ok(E.restore(r));}
 const skill=event('ME03');const ids=copy(skill.mysteryState.pending.offers.learn_skill.cards);assert.ok(ids.every(k=>C.cards[k].role==='tactic'));skill.deck.push(E.card(skill,'stm.passive.clear_mind'));assert.deepEqual(E.restore(skill).mysteryState.pending.offers.learn_skill.cards,ids);solve(skill);claim(skill,'learn_skill',ids[0]);assert.equal(skill.deck.at(-1).upgraded,false);assert.ok(E.restore(skill));
 const mirror=event('ME04');mirror.deck[0].upgraded=true;const uid=mirror.deck[0].uid,old=mirror.deck[0].key;solve(mirror);const result=mirror.mysteryState.pending.offers.transform.transforms[uid];claim(mirror,'transform',uid);assert.equal(mirror.deck[0].key,result);assert.notEqual(result,old);assert.equal(C.cards[result].role,C.cards[old].role);assert.equal(mirror.deck[0].upgraded,false);assert.ok(E.restore(mirror));
});
test('ME13 failure creates one Normal encounter with only Normal Gold/card reward; ME14 penalty is profile-specific',()=>{
 const r=event('ME13','easy');E.startMystery(r,[],null,100000);E.expireMystery(r,r.mysteryState.pending.deadline);const before=r.gold;E.continueMystery(r);assert.equal(r.scene,'battle');assert.equal(r.battle.elite,false);const encounter=copy(r.battle.mysteryEncounter);assert.throws(()=>E.continueMystery(r));assert.deepEqual(r.battle.mysteryEncounter,encounter);winBattle(r);assert.equal(r.gold,before+30);assert.equal(r.rewards.length,3);E.chooseReward(r,null);assert.ok(E.restore(r));
 for(const [d,energy]of [['easy',3],['medium',2],['hard',2]]){const x=event('ME14',d);E.startMystery(x,[],null,100000);E.expireMystery(x,x.mysteryState.pending.deadline);E.continueMystery(x);const n=atNode(x,'battle');E.enterNode(x,n.id);assert.equal(x.battle.energy,energy);assert.ok(E.restore(x));}
});
test('every success option of all 15 events commits the independently listed profile deltas',()=>{
 const amounts={easy:{g40:48,g30:36,g25:30,h15:19,h10:13,hp:3,forge:-28,trade:-24,max:-3},medium:{g40:40,g30:30,g25:25,h15:15,h10:10,hp:5,forge:-35,trade:-30,max:-5},hard:{g40:36,g30:27,g25:22,h15:12,h10:8,hp:6,forge:-39,trade:-33,max:-6}};
 for(const [d,a]of Object.entries(amounts))for(const raw of X.data.events)for(const original of raw.success.options){
  const r=event(raw.id,d,83),before={gold:r.gold,hp:r.hp,max:r.maxHp,size:r.deck.length,art:A.owned(r).length};solve(r);
  if(r.scene==='event'){const o=X.definition(r).success.options.find(o=>o.id===original.id);E.selectMysteryOption(r,o.id);const offer=r.mysteryState.pending.offers[o.id],target=offer.cards?.[0]||X.targets(r,o)[0];if(target)E.selectMysteryTarget(r,target);E.claimMystery(r);}
  const expectedGold=({ME01:a.g40,ME05:original.id==='gold'?a.g25:0,ME06:a.trade,ME07:a.g30,ME09:a.forge,ME10:original.id==='gold'?a.g25:0,ME12:original.id==='gold'?a.g40:0,ME13:a.g40})[raw.id]||0;
  const expectedHp=raw.id==='ME02'?-a.hp:raw.id==='ME05'&&original.id==='heal'?a.h15:raw.id==='ME11'&&original.id==='heal'?a.h10:0;
  assert.equal(r.gold-before.gold,expectedGold,d+' '+raw.id+' '+original.id+' Gold');assert.equal(r.hp-before.hp,expectedHp,d+' '+raw.id+' '+original.id+' HP');
  assert.equal(r.maxHp-before.max,raw.id==='ME15'?a.max:0);
  assert.equal(r.deck.length-before.size,raw.id==='ME03'||raw.id==='ME12'&&original.id==='card'?1:raw.id==='ME10'&&original.id==='remove'?-1:0);
  if(['ME02','ME07','ME09'].includes(raw.id))assert.ok(r.deck.some(c=>c.upgraded));
  if(raw.id==='ME08')assert.equal(r.mysteryState.nextCombat[0].amount,2);
  if(raw.id==='ME14')assert.equal(r.mysteryState.nextCombat[0].amount,2);
  if(raw.id==='ME15'||raw.id==='ME11'&&original.id==='artifact')assert.equal(A.owned(r).length,before.art+1);
  assert.ok(E.restore(r),d+' '+raw.id+' '+original.id+' save');const once=copy(r);assert.throws(()=>E.claimMystery(r));assert.deepEqual(r,once);
 }
});
test('weighted loot never changes the paired question stream or combat shuffle',()=>{
 const left=event('ME03','easy',1024);
 // Rebuild a fresh paired run before opening the event: changing a saved profile is intentionally invalid.
 const {candidate}=require('./helpers/economy.cjs'),r=candidate('easy',1024,'learn',false),node=atNode(r,'event');X.ensure(r).usedEventIds=X.data.events.filter(e=>e.id!=='ME03').map(e=>e.id);r.hp=40;E.enterNode(r,node.id);
 assert.equal(left.rng,r.rng);E.startMystery(left,[],null,100000);E.startMystery(r,[],null,100000);assert.equal(left.mysteryState.pending.questionId,r.mysteryState.pending.questionId);assert.deepEqual(left.mysteryState.pending.choiceOrder,r.mysteryState.pending.choiceOrder);assert.equal(left.rng,r.rng);assert.ok(E.restore(left));assert.ok(E.restore(r));
});
test('failure settlement for every event and difficulty charges exactly its listed penalty once',()=>{
 const hpLoss={easy:{ME01:0,ME02:0,ME10:0,ME11:0},medium:{ME01:4,ME02:2,ME10:3,ME11:3},hard:{ME01:5,ME02:3,ME10:4,ME11:4}};
 for(const difficulty of ['easy','medium','hard'])for(const e of X.data.events){const r=event(e.id,difficulty,99),before={gold:r.gold,hp:r.hp,maxHp:r.maxHp,deck:r.deck.length,artifacts:A.owned(r).length};E.startMystery(r,[],null,100000);const q=Q.catalog[r.mysteryState.pending.questionId];for(const c of q.choices.filter(c=>c.id!==q.correctChoiceId).slice(0,2))E.answerMystery(r,c.id,100001);assert.equal(r.hp,before.hp,'review precedes consequences');E.continueMystery(r);
 assert.equal(r.hp,before.hp-(hpLoss[difficulty][e.id]||0),difficulty+' '+e.id);assert.equal(r.gold,before.gold);assert.equal(r.maxHp,before.maxHp);assert.equal(r.deck.length,before.deck);assert.equal(A.owned(r).length,before.artifacts);
 if(e.id==='ME13'){assert.equal(r.scene,'battle');assert.equal(r.battle.elite,false);}else assert.equal(r.scene,'map');
 if(e.id==='ME14')assert.equal(r.mysteryState.nextCombat[0].amount,difficulty==='easy'?0:-1);
 assert.ok(E.restore(r));const once=copy(r);assert.throws(()=>E.continueMystery(r));assert.deepEqual(r,once);
 }
});
