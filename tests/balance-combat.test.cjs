const test=require('node:test'),assert=require('node:assert/strict');
const {loadEngine}=require('../tools/balance/loader.cjs');
const key=name=>'stm.'+name;
function fixture(build='candidate',difficulty='medium',ids=['attack.rune_strike'],upgraded=false,enemy='sentinel'){
 const x=loadEngine({build,difficulty}),{E}=x,r=E.newRun(20261023,'learn');delete r.route;r.mode='challenge';
 r.deck=[...ids.map(key),...Array(12).fill(key('attack.rune_strike'))].map(k=>E.card(r,k,upgraded));
 E.startBattle(r,enemy);r.battle.hp=r.battle.maxHp=10000;r.battle.seals=2;r.battle.enemyDefense=0;r.battle.enemyBlock=0;
 const all=[...r.battle.hand,...r.battle.draw];r.battle.hand=[];r.battle.draw=all;
 for(const id of ids){const i=r.battle.draw.findIndex(c=>c.key===key(id));r.battle.hand.push(r.battle.draw.splice(i,1)[0]);}
 return {...x,r};
}
test('balance loader isolates data and keeps player defaults unchanged',()=>{
 const legacy=loadEngine({build:'baseline'}),candidate=loadEngine({build:'candidate'});
 assert.equal(legacy.C.cards[key('skill.deep_study')].cost,2);
 assert.equal(candidate.C.cards[key('skill.deep_study')].cost,1);
 assert.equal(require('../dist/config.js').cards[key('skill.deep_study')].cost,2);
 assert.equal(legacy.data.cards.length,40);assert.equal(candidate.C.PASSIVE_LIMIT,3);
});
test('explicit upgrades and Focus resolve once through the execution plan',()=>{
 for(const [id,expected]of [['attack.rune_strike',12],['attack.twin_shot',11],['attack.fate_storm',22]]){
  const {E,r}=fixture('candidate','medium',[id],true);r.battle.focus=1;E.armFocus(r);
  const c=r.battle.hand[0],p=E.cardPlan(r,c),hp=r.battle.hp;E.playCard(r,c.uid);
  assert.equal(hp-r.battle.hp,expected,id);assert.equal(r.battle.focus,0);assert.ok(E.validate(r));
  assert.equal(r.battle.cardCombat.receipts.at(-1).energy,p.payEnergy);
 }
});
test('Strength and Agility use one card budget and delayed Block remains fixed',()=>{
 const {E,r}=fixture('candidate','medium',['passive.blazing_spirit','attack.twin_shot']);
 E.playCard(r,r.battle.hand[0].uid);const hp=r.battle.hp;E.playCard(r,r.battle.hand[0].uid);assert.equal(hp-r.battle.hp,8);
 const y=fixture('candidate','medium',['passive.swift_step','defend.layered_shield']);
 y.E.playCard(y.r,y.r.battle.hand[0].uid);y.E.playCard(y.r,y.r.battle.hand[0].uid);
 assert.equal(y.r.battle.block,6);assert.equal(y.r.battle.cardCombat.queue[0].value,3);assert.ok(y.E.restore(y.E.clone(y.r)));
});
test('upgraded Passive activation gifts do not repeat through swap and restore',()=>{
 const {E,r}=fixture('candidate','medium',['passive.rune_armor','passive.clear_mind','passive.blazing_spirit','passive.swift_step'],true);
 for(let i=0;i<3;i++)E.playCard(r,r.battle.hand[0].uid);
 assert.equal(r.battle.block,3);const armor=r.battle.active.find(c=>c.key.endsWith('rune_armor'));
 E.endTurn(r);r.battle.currentIntent.damage=0;
 const step=[...r.battle.draw,...r.battle.hand,...r.battle.discard].find(c=>c.key.endsWith('swift_step'));
 for(const zone of ['hand','draw','discard'])r.battle[zone]=r.battle[zone].filter(c=>c.uid!==step.uid);r.battle.hand.push(step);
 E.playCard(r,step.uid);const before=E.clone(r);E.cancelCardChoice(r);assert.equal(r.battle.energy,before.battle.energy);
 E.playCard(r,step.uid);E.chooseCardOption(r,armor.uid);
 const armorIndex=r.battle.discard.findIndex(c=>c.uid===armor.uid);r.battle.hand.push(r.battle.discard.splice(armorIndex,1)[0]);
 const restored=E.restore(E.clone(r)),block=restored.battle.block;
 E.playCard(restored,armor.uid);E.chooseCardOption(restored,step.uid);assert.equal(restored.battle.block,block);assert.equal(restored.battle.active.length,3);assert.ok(E.validate(restored));
});
test('bounded simulator retains censored and invalid factorial variants',()=>{
 const B=require('../tools/balance/combat.cjs'),x=loadEngine({build:'candidate'});
 const c=B.simulate(x,{seed:44,enemy:'sentinel',predict:'none',maxCycles:1});
 assert.equal(c.status,'BENCHMARK_LIMIT_CENSORED');assert.equal(c.utility,-10);
 const bad=B.factorialSummary([{seed:1,mask:0,result:{status:'INVALID_POLICY_OR_ENGINE',utility:null}},{seed:1,mask:1,result:{status:'WIN',utility:101}}],1);
 assert.equal(bad.icp,null);assert.equal(bad.n,1);assert.equal(bad.status,'INVALID_POLICY_OR_ENGINE');
});
test('benchmark is deterministic and never spends unavailable Energy',()=>{
 const B=require('../tools/balance/combat.cjs'),x=loadEngine({build:'candidate'}),options={seed:71,enemy:'beetle',slots:['stm.attack.fate_storm','stm.defend.tower_shield'],openingSlots:true,order:[0,1]};
 const a=B.simulate(x,options),b=B.simulate(x,options);
 assert.deepEqual(a,b);assert.notEqual(a.status,'INVALID_POLICY_OR_ENGINE');assert.ok(a.energyMin>=0);
 assert.equal(a.order.firstTurnCompleted,false,'two 2-Energy cards cannot both be paid in 3 Energy');
 const screen=B.screen(x.data.cards);assert.equal(screen.length,820);assert.equal(screen.filter(p=>p.sameCard).length,40);assert.ok(screen.every(p=>p.icp===null&&p.ccp===null));
});
test('Spool does not mistake rejected Draw Pile candidates for hand discard',()=>{
 const B=require('../tools/balance/combat.cjs'),{resolve}=require('../tools/balance/audit.cjs');
 for(const build of ['baseline','candidate']){const x=loadEngine({build}),r=B.create(x,{seed:8,enemy:'sentinel',slots:['stm.skill.clear_choice'],artifacts:['e13'],openingSlots:true});
  x.E.playCard(r,r.battle.hand[0].uid);resolve(x.E,r);assert.equal(r.battle.artifacts.turn.discard,build==='baseline');assert.ok(x.E.validate(r));
 }
});
test('duplicate Passive with a different upgrade preserves its first activation cadence',()=>{
 const ids=['passive.growing_flame','attack.rune_strike','attack.rune_strike','passive.blazing_spirit','passive.swift_step','passive.grimoire_ward','passive.growing_flame'];
 const {E,r}=fixture('candidate','medium',ids),grow=r.battle.hand[0],up=r.battle.hand[6];
 up.upgraded=true;r.deck.find(c=>c.uid===up.uid).upgraded=true;
 const bring=uid=>{for(const zone of ['hand','draw','discard']){const i=r.battle[zone].findIndex(c=>c.uid===uid);if(i>=0){const c=r.battle[zone].splice(i,1)[0];r.battle.hand.unshift(c);return;}}throw Error('Missing fixture card');};
 const uid=suffix=>r.deck.find(c=>c.key.endsWith(suffix)).uid;
 E.playCard(r,grow.uid);E.playCard(r,r.battle.hand[0].uid);E.playCard(r,r.battle.hand[0].uid);
 assert.equal(r.battle.cardCombat.counters[grow.key].count,2);
 E.endTurn(r);r.battle.currentIntent.damage=0;
 for(const name of ['blazing_spirit','swift_step','grimoire_ward']){bring(uid(name));E.playCard(r,uid(name));if(E.cardChoice(r))E.chooseCardOption(r,grow.uid);}
 E.endTurn(r);r.battle.currentIntent.damage=0;bring(up.uid);E.playCard(r,up.uid);E.chooseCardOption(r,uid('grimoire_ward'));
 assert.equal(r.battle.cardCombat.counters[grow.key].count,2);assert.equal(r.battle.cardCombat.counters[grow.key].triggers,0);assert.ok(E.restore(E.clone(r)));
 bring(uid('rune_strike'));E.playCard(r,uid('rune_strike'));assert.equal(r.battle.cardCombat.counters[grow.key].triggers,1);
});
test('choice budget exhaustion is censored rather than invalid policy',()=>{
 const B=require('../tools/balance/combat.cjs'),x=loadEngine({build:'candidate'});
 for(let maxSteps=1;maxSteps<=25;maxSteps++){
  const r=B.simulate(x,{seed:13,enemy:'sentinel',slots:['stm.skill.clear_choice'],openingSlots:true,order:[0],predict:'none',maxSteps});
  assert.notEqual(r.status,'INVALID_POLICY_OR_ENGINE',JSON.stringify({maxSteps,error:r.error}));
 }
});
test('upgraded Passive preview shows resolved retain limit',()=>{
 const B=require('../tools/balance/combat.cjs'),x=loadEngine({build:'candidate'}),r=B.create(x,{seed:3,enemy:'sentinel',slots:['stm.passive.lasting_shield'],upgradedSlots:[0],openingSlots:true});
 x.E.playCard(r,r.battle.hand[0].uid);
 assert.equal(x.CC.passiveView(r)[0].progress.target,5);
});
