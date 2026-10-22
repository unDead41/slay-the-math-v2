const E=require('../../dist/engine.js');
const {claimArtifact}=require('./education.cjs');
function shopRoom(mode='learn',seed=7){
 const r=E.newRun(seed,mode);if(mode==='challenge')claimArtifact(r,r.artifactState.offer.ids[0]);
 const map=E.getMap(r),room=map.nodes.find(n=>n.type==='shop');let path=[room];
 for(let depth=room.depth-1;depth>=0;depth--)path.unshift(map.nodes.find(n=>n.depth===depth&&n.next.includes(path[0].id)));
 r.depth=room.depth;r.route.path=path.slice(0,-1).map(n=>n.id);r.cleared=r.route.path.slice();
 E.enterNode(r,room.id);r.gold=1000;return r;
}
module.exports={shopRoom};
