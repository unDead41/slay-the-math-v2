'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {loadMaster}=require('../tools/balance/master/loader.cjs');
const copy=x=>JSON.parse(JSON.stringify(x));
function ready(x,seed=17){const r=x.E.newRun(seed,'challenge'),id=x.E.artifactChoices(r).find(a=>!['s08','s09','s06'].includes(a.id.slice(0,3))).id;x.E.chooseArtifact(r,id);const q=x.Q.current(r);x.E.selectEducation(r,q.correctChoiceId);x.E.answerEducation(r);x.E.continueEducation(r);return r;}

test('Master binds all three difficulties to one versioned combat/economy run',()=>{
 for(const difficulty of ['easy','medium','hard']){
  const x=loadMaster({difficulty}),r=ready(x),p=x.C.COMBAT_BALANCE.profile;
  assert.equal(r.maxHp,p.starting_max_hp);assert.equal(r.hp,r.maxHp);assert.equal(r.gold,p.starting_gold);
  assert.equal(r.balanceState.difficulty,difficulty);assert.equal(r.economyState.difficulty,difficulty);
  assert.equal(r.economyState.combatVersion,r.balanceState.version);assert.ok(x.E.validate(r));
  assert.equal(x.data.cards.length,40);assert.equal(x.C.PASSIVE_LIMIT,3);
  x.E.startBattle(r,'wisp');assert.equal(x.E.rewardGold(r),p.battle_gold);assert.equal(x.E.restHeal(r),p.rest_heal);
 }
});
test('Master saves cannot silently load under another difficulty, version or legacy engine',()=>{
 const x=loadMaster({difficulty:'medium'}),r=ready(x),easy=loadMaster({difficulty:'easy'});
 assert.ok(x.E.restore(copy(r)));assert.equal(easy.E.restore(copy(r)),null);
 for(const mutate of [r=>r.balanceState.version+='-old',r=>delete r.balanceState,r=>delete r.economyState,r=>{r.economyState.difficulty='hard';r.economyState.profile=copy(x.Eco.data.profiles.hard);},r=>r.economyState.combatVersion='legacy-2.24.0',r=>r.economyState.profile.starting_gold++]){
  const bad=copy(r);mutate(bad);assert.equal(x.E.restore(bad),null);
 }
 assert.equal(require('../dist/engine.js').restore(copy(r)),null);
 const retry=x.E.retry(r);assert.deepEqual(retry.balanceState,r.balanceState);assert.ok(x.E.validate(retry));
});
test('Master restores only the configured Thorns stack bound',()=>{
 const x=loadMaster({difficulty:'medium'}),r=require('../tools/balance/deep.cjs').create(x,{seed:78,enemy:'wisp'});
 const cap=x.data.rules.thorns_cap;r.battle.cardCombat.statuses.thorns=cap;r.battle.cardCombat.statuses.thornsUntil=r.battle.turn;
 assert.ok(x.E.restore(copy(r)));r.battle.cardCombat.statuses.thorns=cap+1;assert.equal(x.E.restore(copy(r)),null);
});
test('Master uses one enemy profile multiplier and the explicit Elite HP definition',()=>{
 const x=loadMaster({difficulty:'easy'}),r=ready(x),p=x.C.COMBAT_BALANCE.profile;
 x.E.startBattle(r,'knight',true);
 assert.equal(r.battle.maxHp,Math.ceil(x.C.enemies.knight.hp*p.enemy_hp_mult));
 assert.equal(r.battle.focus,p.starting_focus);
 const damage=x.E.intent(r).damage;delete r.battle.currentIntent;r.mode='learn';
 assert.equal(x.E.intent(r).damage,damage,'Learn must not multiply the selected difficulty again');
});
test('Master reconciles all three economy-owned artifacts with canonical quotes',()=>{
 const x=loadMaster({difficulty:'medium'}),r=ready(x),before=r.gold;
 x.A.acquire(r,x.A.id('s09'),'shop:0:test:0');assert.equal(r.gold-before,40);
 x.A.acquire(r,x.A.id('s06'),'shop:0:test:1');assert.equal(x.Eco.quote(r,101).value,91);
 x.A.acquire(r,x.A.id('e14'),'shop:0:test:2');assert.equal(x.Eco.quote(r,101).value,81);
 assert.equal(x.Eco.quote(r,101,{sale:true,upgraded:true}).value,39,'multiply before rounding once');
 assert.ok(x.E.validate(r));
});
test('Master loot stays frozen, validates after reload, and Elite has one upgrade only',()=>{
 const x=loadMaster({difficulty:'medium'}),r=ready(x),a=x.Eco.cards(r,'elite',{nodeId:'integration'});
 assert.equal(new Set(a.ids).size,3);assert.equal(a.upgraded,true);
 assert.deepEqual(x.Eco.cards(r,'elite',{nodeId:'integration'}),a);
 assert.ok(x.E.restore(copy(r)));const bad=copy(r);Object.values(bad.economyState.receipts)[0].ids.reverse();
 assert.equal(x.E.restore(bad),null);
 for(const key of a.ids){const c=x.E.card(r,key,true),p=x.E.cardDisplayPlan(c);assert.equal(c.upgraded,true);assert.ok(p);}
});
test('Master campaign carries real rewards and HP into an exactly replayable Stage 2',()=>{
 const x=loadMaster({difficulty:'easy'}),replay=require('../tools/balance/map/replay.cjs').createReplay(x);
 const full=replay.runCampaign({runSeed:2000000020,routePolicy:'seek-reward',predictProfile:'feedback',captureCheckpoints:true});
 assert.equal(full.error,null);assert.equal(full.status,'VICTORY');assert.equal(full.rooms.length>=20,true);
 const cp=full.checkpoints.find(c=>c.stage===2);assert.ok(cp);assert.ok(x.E.restore(copy(cp.state)));assert.ok(x.E.validate(x.E.retry(cp.state)));
 const boss=full.rooms.find(r=>r.stage===1&&r.roomType==='boss');
 assert.equal(cp.state.hp,Math.min(cp.state.maxHp,boss.exit.hp+x.C.COMBAT_BALANCE.profile.stage_clear_heal));
 const again=replay.runCampaign({runSeed:2000000020,routePolicy:'seek-reward',predictProfile:'feedback',initialState:cp.state,initialClock:cp.clock,initialRngStates:cp.policyRngStates});
 assert.equal(again.status,full.status);assert.deepEqual(again.final,full.final);
});
test('Master factorial score separates pair and third-order interaction',()=>{
 const {contrast}=require('../tools/balance/master/power.cjs');
 assert.equal(contrast([1,4,6,10],2),1);
 assert.equal(contrast([1,2,3,4,5,6,7,9],3),1);
});
