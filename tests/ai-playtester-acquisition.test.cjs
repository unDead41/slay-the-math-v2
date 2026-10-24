'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {loadMaster}=require('../tools/balance/master/loader.cjs');
const {createDeckPolicy}=require('../tools/ai-playtester/deck-policy.cjs');
const {createReplay}=require('../tools/balance/map/replay.cjs');
function fixture(keys){
 const x=loadMaster({difficulty:'medium'}),r=x.E.newRun(42,'learn');
 if(keys)r.deck=keys.map(key=>x.E.card(r,key));
 return {x,r,p:createDeckPolicy(x)};
}
function onlyArtifact(f,prefix){
 const {x,r}=f,id=x.A.id(prefix);r.scene='shop';r.gold=500;
 r.deck=r.deck.slice(0,10);
 r.shop={version:2,offers:[],bought:[],artifacts:[{id,price:80,basePrice:80,locked:false}],artifactBought:[],ownedBefore:[],removed:null};
 return id;
}
function own(f,prefix){
 if(!f.r.artifactState){f.x.A.enable(f.r);f.r.artifactState.offer=null;f.r.artifactState.shopOnly=true;f.r.scene='map';}
 f.x.A.acquire(f.r,f.x.A.id(prefix),'fixture:'+prefix);
}
function event(f,id){
 const {x,r}=f,map=x.E.getMap(r),node=map.nodes.find(n=>n.type==='event'),path=[node];
 for(let depth=node.depth-1;depth>=0;depth--)path.unshift(map.nodes.find(n=>n.depth===depth&&n.next.includes(path[0].id)));
 r.depth=node.depth;r.route.path=path.slice(0,-1).map(n=>n.id);r.cleared=r.route.path.slice();
 x.X.ensure(r).usedEventIds=x.X.data.events.filter(e=>e.id!==id).map(e=>e.id);
 x.E.enterNode(r,node.id);x.E.startMystery(r,[],null,r.started+1);
 const q=x.X.pending(r);x.E.answerMystery(r,x.Q.catalog[q.questionId].correctChoiceId,r.started+2);x.E.continueMystery(r);
 assert.equal(x.X.pending(r).eventId,id);assert.equal(x.X.pending(r).phase,'reward');assert.ok(x.E.validate(r));
 return x.X.pending(r);
}
test('AI leaves a Gold-only artifact whose actual price exceeds its one-time grant',()=>{
 const f=fixture();onlyArtifact(f,'s09');const before=JSON.stringify(f.r);
 assert.equal(f.x.E.shopPrice(f.r,f.r.shop.artifacts[0]),80);assert.equal(f.x.A.catalog[f.x.A.id('s09')].values.gold,40);
 assert.equal(f.p.shop(f.r).kind,'leave');assert.equal(JSON.stringify(f.r),before);
});
test('AI does not pay for a weaker discount already covered by its owned Contract',()=>{
 const f=fixture();own(f,'e14');onlyArtifact(f,'s06');
 const before=JSON.stringify(f.r);assert.equal(f.p.shop(f.r).kind,'leave');assert.equal(JSON.stringify(f.r),before);
});
test('free artifact selection recognizes Gold and maximum HP without charging a Shop price',()=>{
 const f=fixture();own(f,'e14');const before=JSON.stringify(f.r);
 assert.equal(f.p.artifact(f.r,[f.x.A.id('s06'),f.x.A.id('s09')]).id,f.x.A.id('s09'));
 const ration=f.p.artifact(f.r,[f.x.A.id('s08')]);assert.equal(ration.id,f.x.A.id('s08'));assert.ok(ration.gain>0);
 assert.equal(JSON.stringify(f.r),before);
});
test('Exhaust-trigger artifact value follows the actual zero-Energy Recall lifecycle',()=>{
 const f=fixture(Array(10).fill('stm.attack.rune_strike')),id=f.x.A.id('e05');
 assert.equal(f.p.artifact(f.r,[id]).gain,0);
 f.r.deck[0]=f.x.E.card(f.r,'stm.skill.recall');
 assert.ok(f.p.artifact(f.r,[id]).gain>0);
});
test('frozen transform compares replacements at deck ten and preserves all live card instances',()=>{
 const f=fixture(['stm.attack.rune_strike','stm.attack.fate_storm',...Array(6).fill('stm.attack.rune_strike'),...Array(2).fill('stm.defend.rune_guard')]);
 const [a,b]=f.r.deck,offers={[a.uid]:'stm.attack.fate_storm',[b.uid]:'stm.attack.rune_strike'},before=JSON.stringify(f.r);
 const d=f.p.transform(f.r,offers,[a,b]);assert.equal(d.uid,a.uid);assert.ok(d.gain>0);assert.equal(JSON.stringify(f.r),before);
});
test('transform accounts for losing an upgrade and retains a legal mandatory alternative',()=>{
 const f=fixture(Array(10).fill('stm.attack.fate_storm'));for(const c of f.r.deck)c.upgraded=true;
 const card=f.r.deck[0],offers={[card.uid]:'stm.attack.rune_strike'},before=JSON.stringify(f.r);
 assert.equal(f.p.transform(f.r,offers,[card]).uid,null);
 const required=f.p.transform(f.r,offers,[card],{allowSkip:false});assert.equal(required.uid,card.uid);assert.ok(required.gain<0);
 assert.equal(JSON.stringify(f.r),before);
});
test('optional harmful Mystery transform actually declines instead of silently falling back',()=>{
 const f=fixture(Array(10).fill('stm.attack.fate_storm'));for(const c of f.r.deck)c.upgraded=true;event(f,'ME04');
 const before=JSON.stringify(f.r),original=f.x.E.newRun;let report;
 // A captured entry must be a stage-start map. Inject this validated reward
 // fixture at new-run construction instead; every reward action stays real.
 f.x.E.newRun=()=>JSON.parse(before);
 try{report=createReplay(f.x).runCampaign({runSeed:42,mode:'learn',predictProfile:'skip',routePolicy:'health-recovery',deckPolicy:f.p,trace:true,limits:{maxActions:1}});}finally{f.x.E.newRun=original;}
 assert.notEqual(report.status,'INVALID_POLICY_OR_ENGINE',report.error);assert.equal(report.actions[0].kind,'mysteryDecline');
 assert.equal(report.final.deckSize,10);assert.equal(JSON.stringify(f.r),before);
});
test('Mystery planning chooses the real Gold alternative without changing offers or RNG',()=>{
 const f=fixture(Array(10).fill('stm.attack.rune_strike')),pending=event(f,'ME10'),before=JSON.stringify(f.r);
 const d=f.p.mystery(f.r,f.x.X.definition(f.r),pending);assert.equal(d.optionId,'gold');assert.equal(d.targetId,null);
 assert.equal(JSON.stringify(f.r),before);
});
test('actual starting artifact choice is explained by the shared acquisition policy',()=>{
 const f=fixture(),decisions=[];
 const r=createReplay(f.x).runCampaign({runSeed:19,mode:'challenge',predictProfile:'skip',routePolicy:'health-recovery',deckPolicy:f.p,onDeckDecision:d=>decisions.push(d),trace:true,limits:{maxActions:1}});
 assert.notEqual(r.status,'INVALID_POLICY_OR_ENGINE',r.error);assert.ok(decisions.some(d=>d.scene==='artifact'&&d.id===r.actions[0].id));
});
