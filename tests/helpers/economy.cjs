const E=require('../../dist/engine.js'),G=require('../../dist/map.js'),X=require('../../dist/mystery.js');
function candidate(difficulty='medium',seed=19,mode='learn',support=true){return E.newRun(seed,mode,3,{economy:true,difficulty,support});}
function atNode(r,type,stage=r.stage){
 r.stage=stage;r.route=G.begin(stage,r.seed,3);r.scene='map';r.battle=null;r.shop=null;r.rewards=[];
 const map=E.getMap(r),node=map.nodes.find(n=>n.type===type);if(!node)throw Error('No '+type+' in map');let path=[node];
 for(let depth=node.depth-1;depth>=0;depth--)path.unshift(map.nodes.find(n=>n.depth===depth&&n.next.includes(path[0].id)));
 r.depth=node.depth;r.route.path=path.slice(0,-1).map(n=>n.id);r.cleared=r.route.path.slice();return node;
}
function room(type='shop',difficulty='medium',seed=19,stage=0){const r=candidate(difficulty,seed),node=atNode(r,type,stage);E.enterNode(r,node.id);return r;}
function event(id='ME01',difficulty='medium',seed=19,stage=0){const r=candidate(difficulty,seed),node=atNode(r,'event',stage);X.ensure(r).usedEventIds=X.data.events.filter(e=>e.id!==id).map(e=>e.id);if(id==='ME06'){const A=require('../../dist/artifacts.js');r.artifactState={version:1,shopOnly:true,rng:(r.seed^0xa741c6e5)>>>0,owned:[],acquired:[],startingId:null,offer:null};A.acquire(r,A.id('s01'),'shop:'+stage+':fixture:0');}r.hp=40;E.enterNode(r,node.id);return r;}
function winBattle(r){const b=r.battle;b.hp=1;b.enemyBlock=0;b.seals=require('../../dist/config.js').enemies[b.enemyId].seals?.length||0;if(!b.hand.some(c=>c.key==='stm.attack.rune_strike')){const i=b.draw.findIndex(c=>c.key==='stm.attack.rune_strike');[b.hand[0],b.draw[i]]=[b.draw[i],b.hand[0]];}E.playCard(r,b.hand.find(c=>c.key==='stm.attack.rune_strike').uid);return r;}
module.exports={candidate,atNode,room,event,winBattle};
