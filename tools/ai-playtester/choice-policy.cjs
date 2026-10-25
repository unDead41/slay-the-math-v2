'use strict';
// All composition is inferred from the public deck and visible zones, never draw order.
function publicPool(run){
 const b=run.battle,known=new Set([...['hand','discard','exhaust','active','resolving'].flatMap(k=>b[k]||[]),...(b.cardChoice?.candidates||[])].map(c=>c.uid));
 const pool=run.deck.filter(c=>!known.has(c.uid)).sort((a,b)=>a.uid.localeCompare(b.uid));if(pool.length!==b.draw.length)throw Error('Cannot reconstruct unknown draw pool from public deck and zones.');return pool;
}
function chooseChoice(x,run,{immediate,incoming}){
 const b=run.battle,ch=x.E.cardChoice(run),cleared={...run,battle:{...b,cardChoice:null}};let after=cleared,sourcePlan=null;
 if(!ch.committed&&ch.kind!=='passive_trim'){
  const source=b.hand.find(c=>c.uid===ch.sourceUid);sourcePlan=x.E.cardPlan(cleared,source);
  if(!sourcePlan?.legal)throw Error('The pending source card is not legal.');
  after={...run,battle:{...cleared.battle,hand:b.hand.filter(c=>c.uid!==ch.sourceUid),energy:b.energy-sourcePlan.payEnergy,focus:b.focus-sourcePlan.payFocus,boostArmed:false,boostUsed:b.boostUsed||sourcePlan.focused}};
 }
 const baseline=incoming(x,after),future={...after,battle:{...after.battle,energy:x.C.ENERGY,boostArmed:false}};
 function merit(c,state=after){
  const visible={...state,battle:{...state.battle,cardChoice:null,boostArmed:false,hand:[...state.battle.hand.filter(v=>v.uid!==c.uid),c]}};
  const p=x.E.cardPlan(visible,c);
  if(p?.legal)return Math.max(0,immediate(x,visible,c,p,baseline));
  if(state===future)return -1;
  const later=merit(c,future);return -1+.1*Math.tanh(Math.max(0,later)/20);
 }
 if(['passive_swap','passive_trim'].includes(ch.kind)){
  // Rank the contribution being removed, not the legality of replaying an active copy.
  const rank=c=>{const visible={...run,battle:{...b,cardChoice:null,hand:[...b.hand.filter(v=>v.uid!==c.uid),c]}},p=x.E.cardPlan(visible,c);return p?immediate(x,visible,c,p,incoming(x,visible)):0;};
  return ch.candidates.slice().sort((a,b)=>rank(a)-rank(b)||a.uid.localeCompare(b.uid))[0].uid;
 }
 if(ch.kind==='card_search'){
  const pool=b.draw.length?publicPool(run):b.discard,limit=sourcePlan.actions.find(a=>a.op==='search_category')?.limit||0;
  const scores=ch.options.map(category=>{
   const group=pool.filter(c=>x.E.cardDisplayPlan(c).card.category===category);if(!group.length)return {category,score:-Infinity};
   let miss=1;for(let i=0;i<Math.min(limit,pool.length);i++)miss*=Math.max(0,pool.length-group.length-i)/(pool.length-i);
   return {category,score:(1-miss)*group.reduce((n,c)=>n+merit(c),0)/group.length};
  }).sort((a,b)=>b.score-a.score||a.category.localeCompare(b.category));return scores[0].category;
 }
 if(ch.kind==='burning_page'){
  if(ch.replacementsRemaining<1||ch.windowRemaining<1)return 'take';
  const pool=publicPool(run),current=merit(ch.candidates[0]),expected=pool.length?pool.reduce((n,c)=>n+merit(c),0)/pool.length:-Infinity;
  return expected>current+1e-9?'replace':'take';
 }
 const sorted=ch.candidates.slice().sort((a,b)=>merit(b)-merit(a)||a.uid.localeCompare(b.uid));
 if(ch.kind==='read_ahead'){
  const rest=sorted.slice(1).sort((a,b)=>merit(b,future)-merit(a,future)||a.uid.localeCompare(b.uid));return {take:sorted[0].uid,order:rest.map(c=>c.uid)};
 }
 return sorted[0].uid;
}
module.exports={publicPool,chooseChoice};
