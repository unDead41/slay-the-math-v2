const E=require('../../dist/engine.js'),Q=require('../../dist/education.js'),X=require('../../dist/mystery.js'),C=require('../../dist/config.js'),G=require('../../dist/map.js');
const {claimArtifact}=require('./education.cjs');
function mysteryRoom(id='ME01',mode='learn',stage=0,seed=7){
 const r=E.newRun(seed,mode);if(mode==='challenge')claimArtifact(r,r.artifactState.offer.ids[0]);
 r.stage=stage;r.route=G.begin(stage,r.seed);const map=E.getMap(r),node=map.nodes.find(n=>n.type==='event');let path=[node];
 for(let d=node.depth-1;d>=0;d--)path.unshift(map.nodes.find(n=>n.depth===d&&n.next.includes(path[0].id)));
 r.depth=node.depth;r.route.path=path.slice(0,-1).map(n=>n.id);r.cleared=r.route.path.slice();
 X.ensure(r).usedEventIds=X.data.events.filter(e=>e.id!==id).map(e=>e.id);r.gold=1000;r.hp=40;E.enterNode(r,node.id);return r;
}
function completeMystery(r){
 let p=r.mysteryState?.pending;if(!p){E.event(r,'heal');return r;}
 if(p.phase==='intro')E.startMystery(r);
 p=r.mysteryState.pending;
 if(p.phase==='question')E.answerMystery(r,Q.catalog[p.questionId].correctChoiceId);
 p=r.mysteryState.pending;if(['review','empty'].includes(p.phase))E.continueMystery(r);
 p=r.mysteryState.pending;
 if(p?.phase==='reward'){
  const options=X.definition(r).success.options.filter(o=>X.actionable(r,o)),o=options.find(o=>o.id==='heal')||options.find(o=>['strength','agility','gold','scholar_reward'].includes(o.id));
  if(o){E.selectMysteryOption(r,o.id);const targets=X.targets(r,o);if(targets.length){const uid=r.deck.filter(c=>targets.includes(c.uid)).sort((a,b)=>(C.cards[b.key].damage||0)-(C.cards[a.key].damage||0))[0]?.uid||targets[0];E.selectMysteryTarget(r,uid);}E.claimMystery(r);}else E.leaveMystery(r);
 }
 return r;
}
module.exports={mysteryRoom,completeMystery};
