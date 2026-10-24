'use strict';
// Scoped to actual actions on a private runtime. No state is added to a game run.
const copy=v=>JSON.parse(JSON.stringify(v)),OTHER='__other__';
const FIELDS=['plays','energySpent','focusSpent','hpDamage','blockGranted','blockUsed','blockExpired','blockUnused','blockRetained','blockRemaining','cardsDrawn','statusesApplied','statusesConsumed','vulnerableHits','weakConsumed','weakPrevented','defensePrevented','strengthGranted','agilityGranted','defenseGranted','buffedHits','passiveTriggers','passiveDamage','retaliationDamage','focusGained'];
function efficiency(c){const ratio=n=>c.energySpent?n/c.energySpent:null;return {directDamagePerEnergy:ratio(c.hpDamage),blockUsedPerEnergy:ratio(c.blockUsed),mitigationPerEnergy:ratio(c.blockUsed+c.weakPrevented+c.defensePrevented),cardsDrawnPerEnergy:ratio(c.cardsDrawn)};}
function createEffectsTracker(x){
 let s={cards:{},block:[],weak:[],vulnerable:[],lastOrdinal:null},pending=null,disposed=false,lastCardHand=0;
 const undo=[],byName=new Map(x.data.cards.map(c=>[c.name,c.id]));
 const row=key=>s.cards[key]??=(Object.fromEntries(FIELDS.map(k=>[k,0])));
 const add=(key,field,n)=>{if(Number.isFinite(n)&&n>0)row(key||OTHER)[field]+=n;};
 const amount=ledger=>ledger.reduce((n,v)=>n+v.amount,0);
 function grant(key,n){if(n>0){add(key,'blockGranted',n);s.block.push({key:key||OTHER,amount:n});}}
 function consume(ledger,n,field,tail=false){while(n>0&&ledger.length){const i=tail?ledger.length-1:0,v=ledger[i],used=Math.min(v.amount,n);if(field)add(v.key,field,used);v.amount-=used;n-=used;if(!v.amount)ledger.splice(i,1);}return n;}
 function reconcile(run){
  if(run.scene!=='battle'||!run.battle)return;
  const b=run.battle,difference=b.block-amount(s.block);if(difference>0)grant(OTHER,difference);else if(difference<0)consume(s.block,-difference,'blockExpired',true);
  for(const status of ['weak','vulnerable']){const n=b.cardCombat?.statuses.enemy[status]||0,d=n-amount(s[status]);if(d>0)s[status].push({key:OTHER,amount:d});else if(d<0)consume(s[status],-d,null,true);}
 }
 function wrap(owner,name,make){const original=owner[name],wrapped=make(original);owner[name]=wrapped;undo.push(()=>{if(owner[name]===wrapped)owner[name]=original;});}
 function strengthSources(r,ref,key){
  if(x.CC.catalog[key]?.values[ref]?.stat!=='strength')return [];
  return r.battle.active.filter(c=>x.CC.catalog[c.key].passive?.effects.some(a=>a.op==='add_attribute'&&a.attribute==='strength')&&(r.battle.cardCombat.counters[c.key]?.triggers||0)>0).map(c=>c.key);
 }
 wrap(x.R,'record',original=>function(r,label,ids,results){
  const result=original(r,label,ids,results);if(!pending||!r.battle)return result;
  const key=byName.get(label),d=x.CC.catalog[key];
  if(d?.category!=='passive')for(const v of results)if(v.kind==='delta'&&v.unit==='Block'&&v.value>0)pending.push({kind:'block',key:key||OTHER,n:v.value});
  const tx=r.battle.cardCombat?.receipts.at(-1);
  if(d?.actions.some(a=>a.op==='damage')&&tx?.key===key&&tx.status!=='resolved'&&results.some(v=>v.label==='Enemy HP lost')){
   const index=pending.filter(v=>v.kind==='attackHit'&&v.tx===tx.id).length,e=tx.damageEvents[index];
   if(e)pending.push({kind:'attackHit',tx:tx.id,event:copy(e),sources:strengthSources(r,e.ref,key)});
  }
  return result;
 });
 wrap(x.L,'record',original=>function(r,event){
  const before=r.battle?.combatLog?.seq||0,result=original(r,event);
  if(pending&&result.id>before){const e=copy(result);if(e.kind==='card')lastCardHand=r.battle.hand.length;
   if(e.kind==='passive-activation-gift'&&e.values?.draw)e.values.actualDraw=Math.min(e.values.draw,Math.max(0,r.battle.hand.length-lastCardHand));
   pending.push({kind:'log',event:e});
  }return result;
 });
 wrap(x.CC,'enemyDamage',original=>function(r,n){
  const b=r.battle,weak=n>0&&b.cardCombat.statuses.enemy.weak>0,vulnerable=n>0&&b.cardCombat.statuses.self.vulnerable>0,defender=b.active.find(c=>x.CC.catalog[c.key].passive?.effects.some(a=>a.op==='add_attribute'&&a.attribute==='defense'))?.key;
  const result=original(r,n);if(pending)pending.push({kind:'hit',weak,weakPrevented:weak?Math.max(0,n+(vulnerable?2:0))-result.afterStatus:0,defensePrevented:Math.max(0,result.afterStatus-result.amount),defender,blocked:Math.min(result.amount,b.block)});return result;
 });
 wrap(x.CC,'resetBlock',original=>function(r){const before=r.battle.block,result=original(r);if(pending)pending.push({kind:'reset',before,retained:result});return result;});
 function apply(v){
  if(v.kind==='block')grant(v.key,v.n);
  else if(v.kind==='reset'){if(amount(s.block)<v.before)grant(OTHER,v.before-amount(s.block));consume(s.block,Math.max(0,v.before-v.retained),'blockExpired',true);}
  else if(v.kind==='hit'){
   if(v.weak){const key=s.weak[0]?.key||OTHER;consume(s.weak,1);add(key,'statusesConsumed',1);add(key,'weakConsumed',1);add(key,'weakPrevented',v.weakPrevented);}
   add(v.defender||OTHER,'defensePrevented',v.defensePrevented);if(amount(s.block)<v.blocked)grant(OTHER,v.blocked-amount(s.block));consume(s.block,v.blocked,'blockUsed');
  }else if(v.kind==='attackHit'){
   if(v.event.vulnerable){const key=s.vulnerable[0]?.key||OTHER;consume(s.vulnerable,1);add(key,'statusesConsumed',1);add(key,'vulnerableHits',1);}
   for(const key of v.sources)add(key,'buffedHits',1);
  }else if(v.kind==='log'){
   const e=v.event,a=e.values||{},key=e.source;
   if(e.kind==='status'&&a.status){add(key,'statusesApplied',a.amount);if(a.target==='enemy'&&['weak','vulnerable'].includes(a.status)&&a.amount)s[a.status].push({key,amount:a.amount});}
   if(e.kind==='card')add(key,'cardsDrawn',a.cardsToHand);
   if(['passive-trigger','passive-activation-gift','delayed'].includes(e.kind)){
    if(e.kind==='passive-trigger')add(key,'passiveTriggers',1);
    grant(key,a.block||0);add(key,'cardsDrawn',e.kind==='passive-activation-gift'?(a.actualDraw||0):a.draw);add(key,'passiveDamage',a.damage);add(key,'focusGained',a.focus);
    if(['strength','agility','defense'].includes(a.attribute))add(key,a.attribute+'Granted',a.amount);
   }
   if(a.retained)add(a.temporaryCap>a.passiveCap?byName.get('Hold the Line'):key,'blockRetained',a.retained);
   if(e.kind==='retaliation')add(key,'retaliationDamage',a.damage);
  }
 }
 function capture(run,fn){
  if(disposed)throw Error('Effects tracker is disposed.');if(pending)throw Error('Nested effects capture is not supported.');
  const before=copy(s);pending=[];lastCardHand=run.battle?.hand.length||0;
  try{
   if(s.lastOrdinal===null)s.lastOrdinal=run.stats.cardsPlayed;reconcile(run);
   const result=fn(),events=pending;pending=null;for(const v of events)apply(v);
   const tx=run.battle?.cardCombat?.receipts.at(-1),ordinal=run.stats.cardsPlayed;
   if(tx?.status==='resolved'&&ordinal!==s.lastOrdinal){if(ordinal!==s.lastOrdinal+1)throw Error('Effects observer missed a committed play.');s.lastOrdinal=ordinal;add(tx.key,'plays',1);add(tx.key,'energySpent',tx.energy);add(tx.key,'focusSpent',tx.focus);add(tx.key,'hpDamage',tx.damageEvents.reduce((n,e)=>n+e.hpLost,0));}
   if(run.scene!=='battle')consume(s.block,amount(s.block),'blockUnused');else reconcile(run);
   return result;
  }catch(error){pending=null;s=before;throw error;}
 }
 function snapshot(){const cards=copy(s.cards);for(const v of s.block){cards[v.key]??=Object.fromEntries(FIELDS.map(k=>[k,0]));cards[v.key].blockRemaining+=v.amount;}const totals=Object.fromEntries(FIELDS.map(k=>[k,0]));for(const c of Object.values(cards)){for(const k of FIELDS)totals[k]+=c[k];c.efficiency=efficiency(c);}return {version:1,blockAccounting:'FIFO source accounting; retained Block keeps original source',cards,totals,interpretation:'Observed units, not universal CP. Buff involvement, retention and status consumption are support overlays; do not add them again to damage or Block. Mitigation describes incoming damage reduction, not counterfactual surviving HP.'};}
 return {capture,snapshot,dispose(){if(!disposed){for(const restore of undo.reverse())restore();disposed=true;}}};
}
module.exports={createEffectsTracker,FIELDS,efficiency,OTHER};
