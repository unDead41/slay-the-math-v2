'use strict';
const POLICIES=['avoid-elite','seek-reward','seek-shop','health-recovery'];
function chooseRoute(view,policy,random){
 if(!POLICIES.includes(policy))throw Error('Unknown route policy '+policy);
 const nodes=new Map(view.nodes.map(n=>[n.id,n])),edges=new Map(view.nodes.map(n=>[n.id,[]]));
 for(const e of view.edges){if(!nodes.has(e.from)||!nodes.has(e.to)||nodes.get(e.to).level!==nodes.get(e.from).level+1)throw Error('Invalid public route graph.');edges.get(e.from).push(e.to);}
 const low=view.hp/view.maxHp<=.5,canShop=view.gold>=60,memo=new Map();
 function utility(type){
  if(policy==='avoid-elite')return {elite:-5,battle:0,shop:.05,rest:.05,mystery:0,boss:0}[type]??0;
  if(policy==='seek-reward')return {elite:4,battle:1,shop:.3,rest:.1,mystery:.2,boss:0}[type]??0;
  if(policy==='seek-shop')return {elite:-.7,battle:canShop?.3:1,shop:canShop?5:-.5,rest:.1,mystery:.1,boss:0}[type]??0;
  return (low?{rest:10,elite:-6,battle:-1,mystery:-1.5,shop:canShop?1:0,boss:0}:{rest:.4,elite:-2,battle:.2,mystery:.1,shop:canShop?2:0,boss:0})[type]??0;
 }
 function value(id){if(memo.has(id))return memo.get(id);const n=nodes.get(id);if(!n)throw Error('Unavailable route node '+id);const out=edges.get(id);const result=utility(n.type)+(out.length?.75*Math.max(...out.map(value)):0);memo.set(id,result);return result;}
 if(!view.available.length)throw Error('No legal route choices.');
 const scores=view.available.map(id=>({nodeId:id,category:nodes.get(id)?.type,score:value(id)})),best=Math.max(...scores.map(s=>s.score)),tied=scores.filter(s=>Math.abs(s.score-best)<1e-12),chosen=tied[Math.floor(random()*tied.length)];
 return {nodeId:chosen.nodeId,policy,reason:policy+(low?':low-hp':':healthy')+(canShop?':shop-budget':':low-gold'),scores};
}
module.exports={POLICIES,chooseRoute};
