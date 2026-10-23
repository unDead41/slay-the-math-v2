'use strict';
const {createHash}=require('node:crypto');
const G=require('../../../dist/map-rng.js');
const C=require('../../../dist/config.js');
const {pressureDebt}=require('./score.cjs');
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
function enumerateRoutes(map){
 if(!map?.nodes?.length||!Array.isArray(map.edges))throw Error('Map nodes/edges required.');
 const byId=new Map(map.nodes.map(n=>[n.id,n]));
 if(byId.size!==map.nodes.length)throw Error('Duplicate node ID.');
 const next=new Map(map.nodes.map(n=>[n.id,[]]));
 for(const e of map.edges){
  if(!byId.has(e.from)||!byId.has(e.to)||byId.get(e.to).level!==byId.get(e.from).level+1)throw Error('Invalid forward edge.');
  if(next.get(e.from).includes(e.to))throw Error('Duplicate edge.');next.get(e.from).push(e.to);
 }
 const start=Math.min(...map.nodes.map(n=>n.level)),end=Math.max(...map.nodes.map(n=>n.level));
 const roots=map.nodes.filter(n=>n.level===start),routes=[],reached=new Set();
 function walk(id,path,probability){
  if(path.includes(id))throw Error('Cycle.');
  reached.add(id);const node=byId.get(id),ids=path.concat(id),exits=next.get(id);
  if(node.level===end){if(exits.length)throw Error('Terminal has exits.');routes.push({id:'route-'+hash(ids).slice(0,16),nodeIds:ids,probability});return;}
  if(!exits.length)throw Error('Dead end.');
  for(const to of exits)walk(to,ids,probability/exits.length);
 }
 for(const n of roots)walk(n.id,[],1/roots.length);
 if(reached.size!==byId.size)throw Error('Unreachable node.');
 return routes;
}
function enemyId(node,stage,runSeed){
 const s=C.stages[stage-1];
 if(node.type==='boss')return s.boss;
 const roster=node.type==='elite'?s.elites:s.normals;
 return ['battle','elite'].includes(node.type)?roster[(node.level+node.column+(runSeed%roster.length))%roster.length]:null;
}
function encounterEstimate(node,stage,runSeed,config){
 const id=enemyId(node,stage,runSeed);if(!id)return null;
 const e=C.enemies[id],elite=node.type==='elite',hp=e.hp+(elite?10:0);
 const meanBlock=e.patterns.reduce((s,p)=>s+(p.block||0),0)/e.patterns.length;
 const dpt=config.referenceDamagePerTurn-meanBlock;
 const turns=dpt>0?Math.min(100,Math.max(1,Math.ceil(hp/dpt))):100;
 let hpBurden=0;
 for(let t=1;t<turns;t++){
  const p=e.patterns[(t-1)%e.patterns.length];
  const raw=(p.damage+Math.floor((t-1)/6)*2+(elite?2:0));
  const attack=Math.ceil(raw*(config.mode==='learn'?.7:1));
  hpBurden+=Math.max(0,attack*(p.hits||1)-config.referenceBlockPerTurn);
 }
 return {enemyId:id,effectiveHp:hp,estimatedPlayerTurns:turns,hpBurden};
}
function routeEstimate(route,map,runSeed,config){
 const by=new Map(map.nodes.map(n=>[n.id,n])),pressure=[],encounters=[],shops=[];
 let gold=C.ECONOMY.start,streak=0,eliteStreak=0,maxCombatChain=0,maxEliteChain=0,combatsSinceRest=0,maxCombatsSinceRest=0;
 for(const id of route.nodeIds){
  const node=by.get(id),fight=encounterEstimate(node,map.stage,runSeed,config);
  if(fight){
   pressure.push(fight.hpBurden);encounters.push({nodeId:id,...fight});
   streak++;maxCombatChain=Math.max(maxCombatChain,streak);combatsSinceRest++;maxCombatsSinceRest=Math.max(maxCombatsSinceRest,combatsSinceRest);
   eliteStreak=node.type==='elite'?eliteStreak+1:0;maxEliteChain=Math.max(maxEliteChain,eliteStreak);
   gold+=node.type==='boss'?C.ECONOMY.boss:node.type==='elite'?C.ECONOMY.elite:C.ECONOMY.battle;
  }else{
   streak=0;eliteStreak=0;
   if(node.type==='rest'){pressure.push(-config.referenceRestHeal);combatsSinceRest=0;}
   if(node.type==='shop')shops.push({nodeId:id,level:node.level,unspentNominalGold:gold});
  }
 }
 return {runSeed,normalOffset:runSeed%3,eliteOffset:runSeed%2,...pressureDebt(pressure),maxCombatChain,maxEliteChain,maxCombatsSinceRest,encounters,shops};
}
function analyzeMap(seed,stage,config){
 if(!/^STM-\d{3}$/.test(seed))throw Error('Registered catalogue seed required.');
 if(!(config.referenceDamagePerTurn>0&&config.referenceBlockPerTurn>=0&&config.referenceRestHeal>=0))throw Error('Invalid estimate baseline.');
 const map=G.generateMap(seed,{stage}),validation=G.validateMap(map);
 if(!validation.valid)throw Error(validation.errors.join('; '));
 const base=Number(seed.slice(4))-1;if(base<0||base>=100)throw Error('Seed outside registry.');
 const classes=[base,base+100,base+200],by=new Map(map.nodes.map(n=>[n.id,n]));
 const routes=enumerateRoutes(map).map(route=>{
  const ns=route.nodeIds.map(id=>by.get(id)),variants=classes.map(s=>routeEstimate(route,map,s,config));
  const count=type=>ns.filter(n=>n.type===type).length;
  return {...route,seed,stage,mode:config.mode,difficulty:config.difficulty,scoreKind:'ESTIMATED_PRESSURE',estimateVersion:config.estimateVersion,combatPower:null,
   estimatedPressure:variants.reduce((s,v)=>s+v.peak,0)/variants.length,
   minVariantPressure:Math.min(...variants.map(v=>v.peak)),maxVariantPressure:Math.max(...variants.map(v=>v.peak)),
   battleCount:count('battle'),eliteCount:count('elite'),shopCount:count('shop'),restCount:count('rest'),mysteryCount:count('mystery'),
   firstRestLevel:ns.find(n=>n.type==='rest').level,earlyRest:ns.some(n=>n.type==='rest'&&n.level<9),
   maxEliteChain:variants[0].maxEliteChain,maxCombatsSinceRest:variants[0].maxCombatsSinceRest,
   variants,simulationTrials:0,simulationWins:0,simulationErrors:0,simulationCensored:0};
 });
 const ordered=routes.slice().sort((a,b)=>a.estimatedPressure-b.estimatedPressure||a.id.localeCompare(b.id));
 const pick=q=>ordered[Math.floor((ordered.length-1)*q)];
 const summary={seed,stage,mode:config.mode,difficulty:config.difficulty,generatorVersion:G.VERSION,mapHash:hash(map),structureStatus:'VALID',nodeCount:map.nodes.length,edgeCount:map.edges.length,initialPaths:map.initialPaths,routeCount:routes.length,routeCoverage:1,
  rosterClasses:classes.map(runSeed=>({runSeed,normalOffset:runSeed%3,eliteOffset:runSeed%2})),
  forcedElite:routes.every(r=>r.eliteCount>0),noEarlyRest:routes.every(r=>!r.earlyRest),
  easiestRouteId:pick(0).id,medianRouteId:pick(.5).id,hardestRouteId:pick(1).id,
  minEstimatedPressure:pick(0).estimatedPressure,medianEstimatedPressure:pick(.5).estimatedPressure,maxEstimatedPressure:pick(1).estimatedPressure,
  uniformExitExpectedPressure:routes.reduce((s,r)=>s+r.probability*r.estimatedPressure,0),
  combatPower:null,scoreStatus:'NOT_SIMULATED',estimateExclusions:config.estimateExclusions};
 return {summary,routes,map};
}
module.exports={hash,enumerateRoutes,enemyId,encounterEstimate,routeEstimate,analyzeMap};
