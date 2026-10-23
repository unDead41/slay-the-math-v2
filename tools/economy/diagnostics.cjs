'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const E=require('../../dist/engine.js'),G=require('../../dist/map.js'),Eco=require('../../dist/economy.js'),A=require('../../dist/artifacts.js');
const dir=path.resolve(__dirname,'../../docs/economy/evidence'),manifest=JSON.parse(fs.readFileSync(path.join(dir,'simulation_manifest.json'))),save=(name,x)=>fs.writeFileSync(path.join(dir,name),JSON.stringify(x,null,2)+'\n');
const artifactHistograms=[];
for(const stage of [0,1])for(const passive of [false,true]){
 const sources=[['elite','elite_mystery',3],['boss','boss',3],['shop_starting','starting',3],['shop_elite_mystery','elite_mystery',2],['ME06','elite_mystery',1],['ME11','starting',1],['ME15','elite_mystery',1],...(stage===0?[['starting','starting',3]]:[['shop_boss','boss',1]])];
 for(const [source,tier,count]of sources){const h={stage:stage+1,passive,source,tier,count,seeds:manifest.histogramSeeds.length,byId:{},firstId:{},eligible:null};
  for(const seed of manifest.histogramSeeds){const r=E.newRun(seed);Eco.init(r);r.stage=stage;if(passive)r.deck.push(E.card(r,'stm.passive.clear_mind'));r.artifactState={owned:[A.id('s01')]};
   const o=Eco.artifacts(r,source,tier,count,{nodeId:'artifact_histogram'});h.eligible=o.eligible;assert.equal(new Set(o.ids).size,o.ids.length);assert.ok(!o.ids.includes(A.id('s01')));assert.ok(!o.ids.includes(A.id('e13')));for(const id of o.ids)h.byId[id]=(h.byId[id]||0)+1;h.firstId[o.ids[0]]=(h.firstId[o.ids[0]]||0)+1;
  }
  const target=1/h.eligible.length,tolerance=4*Math.sqrt(target*(1-target)/h.seeds)+.01;
  for(const id of h.eligible)assert.ok(Math.abs((h.firstId[id]||0)/h.seeds-target)<=tolerance,'artifact uniform screening '+source+' '+id);
  artifactHistograms.push(h);
 }
}
save('artifact_offer_histograms.json',artifactHistograms);
const maps=[];
for(const seed of manifest.routeSeeds)for(const stage of [0,1]){const r=E.newRun(seed);r.stage=stage;r.route=G.begin(stage,seed,3);const m=E.getMap(r),byId=Object.fromEntries(m.nodes.map(n=>[n.id,n])),memo={};
 function visit(id){if(memo[id])return memo[id];const n=byId[id],best=n.next.map(visit).sort((a,b)=>a.elites-b.elites||a.path.join().localeCompare(b.path.join()))[0]||{elites:0,path:[]};return memo[id]={elites:(n.type==='elite'?1:0)+best.elites,path:[id,...best.path]};}
 const best=E.availableNodes(r).map(n=>visit(n.id)).sort((a,b)=>a.elites-b.elites)[0];maps.push({seed,stage:stage+1,minimumEliteCount:best.elites,exampleMinimumElitePath:best.path,status:best.elites?'NEEDS_INPUT_MAP_FORCED_ELITE':'NO_ELITE_PATH_EXISTS'});
}
save('map_route_inputs.json',{baseCommit:Eco.data.baseCommit,maps,forcedEliteMaps:maps.filter(m=>m.minimumEliteCount>0).length,note:'Read-only baseline graph analysis. No topology modified. Passed to Map/Master; not a CP score.'});
console.log(JSON.stringify({artifactHistogramCohorts:artifactHistograms.length,artifactOffers:artifactHistograms.reduce((n,h)=>n+h.seeds,0),mapGraphs:maps.length,forcedEliteMaps:maps.filter(m=>m.minimumEliteCount>0).length}));
