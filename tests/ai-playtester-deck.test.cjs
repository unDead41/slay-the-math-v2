'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {loadMaster}=require('../tools/balance/master/loader.cjs');
const S='stm.';
function fixture(keys){const x=loadMaster({difficulty:'medium'}),r=x.E.newRun(42,'learn');r.deck=keys.map(k=>x.E.card(r,S+k));const p=require('../tools/ai-playtester/deck-policy.cjs').createDeckPolicy(x);return {x,r,p};}
test('reward values Shield Shot synergy in a Block deck and skips duplicate unique Passive',()=>{
 const guards=fixture([...Array(8).fill('defend.rune_guard'),...Array(4).fill('attack.rune_strike')]);
 assert.equal(guards.p.reward(guards.r,[S+'attack.rune_strike',S+'attack.shield_shot'],false).key,S+'attack.shield_shot');
 const duplicate=fixture(['passive.blazing_spirit',...Array(11).fill('attack.rune_strike')]);assert.equal(duplicate.p.reward(duplicate.r,[S+'passive.blazing_spirit'],false).key,null);
});
test('upgrade chooses a marginal improvement and removal protects useful synergy',()=>{
 const f=fixture(['passive.blazing_spirit','passive.blazing_spirit',...Array(5).fill('attack.rune_strike'),...Array(5).fill('defend.rune_guard')]);
 const decision=f.p.remove(f.r,f.r.deck);assert.ok(f.r.deck.slice(0,2).some(c=>c.uid===decision.uid));
 const best=f.p.upgrade(f.r,f.r.deck);assert.ok(best.uid);const card=f.r.deck.find(c=>c.uid===best.uid);assert.ok(!card.upgraded);assert.ok(best.gain>0);assert.match(best.reason,/upgrade/i);
 f.r.scene='camp';f.r.hp=f.r.maxHp;const camp=f.p.camp(f.r);assert.equal(camp.action,'upgrade');assert.equal(camp.uid,best.uid);
});
test('shop uses exact engine prices and never buys an unaffordable or harmful card',()=>{
 const f=fixture([...Array(12).fill('attack.rune_strike')]);f.r.scene='shop';f.r.gold=20;f.r.shop={version:2,offers:[{key:S+'defend.rune_guard',basePrice:20,price:20,sale:false}],bought:[],ownedBefore:[],artifacts:[],artifactBought:[],removed:null};
 const before=JSON.stringify(f.r),choice=f.p.shop(f.r);assert.equal(JSON.stringify(f.r),before);assert.equal(choice.kind,'card');assert.equal(choice.index,0);f.x.E.buyCard(f.r,choice.index);assert.equal(f.r.gold,0);assert.equal(f.r.deck.at(-1).key,S+'defend.rune_guard');assert.equal(f.p.shop(f.r).kind,'leave');
 f.r.gold=19;f.r.shop.bought=[];assert.equal(f.p.shop(f.r).kind,'leave');
});
test('removal respects the actual minimum and one-removal-per-shop rule',()=>{
 const f=fixture(Array(10).fill('attack.rune_strike'));f.r.scene='shop';f.r.gold=1000;f.r.shop={version:2,offers:[],bought:[],ownedBefore:[],artifacts:[],artifactBought:[],removed:null};assert.equal(f.p.shop(f.r).kind,'leave');
 f.r.deck.push(f.x.E.card(f.r,S+'passive.blazing_spirit'),f.x.E.card(f.r,S+'passive.blazing_spirit'));const d=f.p.shop(f.r);assert.equal(d.kind,'remove');f.x.E.removeShopCard(f.r,d.uid);assert.equal(f.r.deck.length,11);assert.equal(f.p.shop(f.r).kind,'leave');
});
test('real campaigns apply the deck policy and expose a bounded acquisition explanation trace',()=>{
 const r=require('../tools/ai-playtester/experiments.cjs').experiment({mode:'campaign',seed:20,seeds:1,difficulty:'easy',skill:'intermediate',predict:'feedback'}).rows[0];
 assert.ok(['VICTORY','DEFEAT'].includes(r.status),r.error);assert.ok(r.ai.deckDecisions?.length>0);assert.ok(r.ai.deckDecisions.length<=30);assert.ok(r.ai.deckDecisions.some(d=>['reward','shop','camp','mystery'].includes(d.scene)));assert.ok(r.ai.deckDecisions.every(d=>d.reason));assert.ok(r.ai.choiceDecisions?.length>0);
});
test('upgrade ranking recognizes activation gifts and larger visible selection windows',()=>{
 for(const key of ['passive.rune_armor','passive.clear_mind','skill.read_ahead','skill.burning_page','skill.clear_choice','skill.card_search']){const f=fixture([key,...Array(6).fill('attack.rune_strike'),...Array(5).fill('defend.rune_guard')]),c=f.r.deck[0],d=f.p.upgrade(f.r,[c]);assert.equal(d.uid,c.uid);assert.ok(d.gain>0,key+' must value its actual upgrade mechanics');}
});
test('Mystery declining an unwanted offered card applies the recorded skip',()=>{
 const f=fixture([...Array(7).fill('attack.rune_sweep'),...Array(5).fill('defend.tower_shield')]),{x,r,p}=f;for(const c of r.deck)c.upgraded=true;
 const map=x.E.getMap(r),node=map.nodes.find(n=>n.type==='event'),path=[node];for(let depth=node.depth-1;depth>=0;depth--)path.unshift(map.nodes.find(n=>n.depth===depth&&n.next.includes(path[0].id)));r.depth=node.depth;r.route.path=path.slice(0,-1).map(n=>n.id);r.cleared=r.route.path.slice();x.X.ensure(r);r.mysteryState.usedEventIds=x.X.data.events.filter(e=>e.id!=='ME03').map(e=>e.id);x.E.enterNode(r,node.id);x.E.startMystery(r,[],null,r.started+1);const pending=x.X.pending(r);x.E.answerMystery(r,x.Q.catalog[pending.questionId].correctChoiceId,r.started+2);x.E.continueMystery(r);assert.equal(x.X.pending(r).phase,'reward');assert.equal(p.reward(r,x.X.pending(r).offers.learn_skill.cards,false).key,null);assert.ok(x.E.validate(r));
 // Inject a real validated room at the new-run boundary, avoiding unrelated route combats.
 const original=x.E.newRun,decisions=[];x.E.newRun=()=>r;try{const result=require('../tools/balance/map/replay.cjs').createReplay(x).runCampaign({runSeed:42,difficulty:'medium',mode:'learn',predictProfile:'skip',routePolicy:'health-recovery',deckPolicy:p,onDeckDecision:d=>decisions.push(d),limits:{maxActions:3},trace:true});assert.notEqual(result.status,'INVALID_POLICY_OR_ENGINE',result.error);assert.equal(r.deck.length,12);assert.ok(result.actions.some(a=>a.kind==='mysteryDecline'));assert.ok(decisions.some(d=>d.key===null));assert.ok(x.E.validate(r));}finally{x.E.newRun=original;}
});
