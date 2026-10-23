/* Economy candidate only. No combat actions, question sampling or secret pile inspection. */
(function(root){'use strict';
const D=typeof module!=='undefined'?require('./economy-data.js'):root.STMEconomyData;
const K=typeof module!=='undefined'?require('./card-kit.js'):root.STMCardKit;
const C=typeof module!=='undefined'?require('./config.js'):root.DCConfig;
const AD=typeof module!=='undefined'?require('./artifact-data.js'):root.DCArtifactData;
const clone=x=>JSON.parse(JSON.stringify(x)),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const catalog=Object.fromEntries(K.data.cards.map(c=>[c.id,c]));
const artifactCatalog=Object.fromEntries(AD.artifacts.map(a=>[a.id,a]));
const uint=n=>Number.isInteger(n)&&n>=0&&n<=4294967295;
const active=r=>r?.economyState?.version===D.version;
function init(r,{difficulty='medium',support=true}={}){
 if(r.economyState||!Object.hasOwn(D.profiles,difficulty)||typeof support!=='boolean')throw Error('Invalid economy profile.');
 r.economyState={version:D.version,combatVersion:C.MASTER_BALANCE?.version||'legacy-2.24.0',difficulty,profile:clone(D.profiles[difficulty]),support,removalCount:0,receipts:{}};
 r.gold=r.economyState.profile.starting_gold;return r;
}
function profile(r){return active(r)?r.economyState.profile:null;}
function snapshot(r){return {seed:r.seed,stage:r.stage,depth:r.depth,deck:r.deck.map(c=>({uid:c.uid,key:c.key,upgraded:c.upgraded})),artifacts:(r.artifactState?.owned||[]).slice().sort()};}
function random(seed){let value=seed>>>0;return {next(){value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;},state(){return value;}};}
function derive(seed,key){let value=(2166136261^(seed>>>0))>>>0;for(const ch of D.version+'|'+key)value=Math.imul(value^ch.charCodeAt(0),16777619)>>>0;return value;}
function weighted(list,weight,rng){const total=list.reduce((n,x)=>n+weight(x),0);let roll=rng.next()*total;for(const x of list){roll-=weight(x);if(roll<0)return x;}return list.at(-1);}
function hasOp(c,op){return c.actions?.some(a=>a.op===op)||c.passive?.effects?.some(e=>e.op===op||e.actions?.some(a=>a.op===op));}
function capabilities(s,id){
 const cards=s.deck.map(c=>catalog[c.key]).filter(Boolean),arts=s.artifacts.map(k=>artifactCatalog[k]).filter(Boolean);
 return {attack:cards.some(c=>c.category==='attack'),defend:cards.some(c=>c.category==='defend'),skill:cards.some(c=>c.category==='skill'),
 block:cards.some(c=>hasOp(c,'grant_block')||c.values?.block?.base>0)||arts.some(a=>a.values.block>0||a.values.block_bonus>0||a.values.faces_1_2?.block>0),
 focus:cards.some(c=>c.focus_eligible),discardable_other:cards.some(c=>c.id!==id&&c.lifecycle==='discard_after_resolution'),
 zero_or_draw_selection:cards.some(c=>c.id!==id&&(c.energy.kind==='fixed'&&c.energy.amount===0||['draw','look_choose_reorder','look_replace_take','look_choose_discard','search_category'].some(op=>hasOp(c,op)))),
 searchable_category:cards.some(c=>c.id!==id&&['attack','defend','skill','passive'].includes(c.category))};
}
function factors(s,difficulty,support,ids){
 return ids.map(id=>{const c=catalog[id],requirements=D.requirements[id]||[],caps=capabilities(s,id),supportScore=requirements.length?requirements.filter(k=>caps[k]).length/requirements.length:0;
  const count=s.deck.filter(c=>c.key===id).length,duplicateFactor=c.category==='passive'&&count>0?0.15:count>=2?0.35:count===1?0.65:1;
  const setup=D.setupPassives.includes(id.split('.').at(-1)),stageSuitability=setup?(s.stage===1?1.1:s.depth<4?.85:1):1;
  return {id,rarity:c.rarity,category:c.category,requirements,supportScore,stageSuitability,duplicateFactor,weight:stageSuitability*(1+(support?D.alpha[difficulty]:0)*supportScore)*duplicateFactor,combatPower:null,powerStatus:'UNMEASURED'};
 });
}
function cardPolicy(source,options,stage){
 const sources={normal:[3,'normal'],elite:[3,'elite'],shop:[6,'shop'],ME03:[3,'normal'],ME12:[3,'normal'],ME04:[1,'normal']};
 const policy=sources[source];if(!policy)throw Error('Unknown loot source.');
 const category=source==='ME03'?'skill':source==='ME04'?options.category:null;
 if(source==='ME04'&&!['attack','defend','skill','passive'].includes(category))throw Error('Transform requires the original category.');
 return {count:policy[0],pool:policy[1]+'_s'+(stage+1),category,exclude:source==='ME04'?(options.exclude||[]).slice().sort():[]};
}
function cardReceipt(context,source,options,difficulty,support,key){
 const policy=cardPolicy(source,options,context.stage),ids=K.data.cards.filter(c=>(!policy.category||c.category===policy.category)&&!policy.exclude.includes(c.id)).map(c=>c.id);
 const candidates=factors(context,difficulty,support,ids),remaining=candidates.slice(),seed=derive(context.seed,key),rng=random(seed),selected=[],rolls=[];
 while(selected.length<policy.count&&remaining.length){
  const tiers=Object.keys(D.economy.rarity_weights[policy.pool]).filter(t=>remaining.some(c=>c.rarity===t));
  const rarity=weighted(tiers,t=>D.economy.rarity_weights[policy.pool][t],rng),c=weighted(remaining.filter(c=>c.rarity===rarity),c=>c.weight,rng);
  selected.push(c.id);rolls.push({id:c.id,rarity});remaining.splice(remaining.indexOf(c),1);
 }
 const saleIndex=source==='shop'?Math.floor(rng.next()*selected.length):null;
 return {kind:'card',key,source,options,context,difficulty,support,seed,finalRng:rng.state(),pool:policy.pool,ids:selected,upgraded:source==='elite',saleIndex,factors:candidates,rolls};
}
function lookup(r,kind,source,options={}){const key=[kind,source,r.stage,String(options.nodeId??r.route?.active??r.depth),options.ordinal??0].join('|');return r.economyState?.receipts?.[key]||null;}
function getReceipt(r,kind,source,options,create){
 if(!active(r))throw Error('An economy candidate run is required.');
 const nodeId=String(options.nodeId??r.route?.active??r.depth),ordinal=options.ordinal??0;
 if(!Number.isSafeInteger(ordinal)||ordinal<0||nodeId.length>120)throw Error('Invalid loot identity.');
 const key=[kind,source,r.stage,nodeId,ordinal].join('|'),saved=r.economyState.receipts[key];if(saved)return saved;
 const receipt=create(snapshot(r),key);r.economyState.receipts[key]=receipt;return receipt;
}
function cards(r,source,options={}){
 return getReceipt(r,'card',source,options,(s,key)=>cardReceipt(s,source,{category:options.category||null,exclude:options.exclude||[],nodeId:String(options.nodeId??r.route?.active??r.depth),ordinal:options.ordinal??0},r.economyState.difficulty,r.economyState.support,key));
}
function artifactEligible(s,a){
 if(a.requires==='passive')return s.deck.some(c=>catalog[c.key]?.category==='passive');
 if(a.requires==='hand_discard')return s.deck.some(c=>C.cards[c.key]?.discard||catalog[c.key]?.actions?.some(a=>a.op==='discard_from_hand'));
 return !a.requires;
}
function artifactReceipt(context,source,tier,count,options,key){
 const eligible=AD.artifacts.filter(a=>a.tier===tier&&!context.artifacts.includes(a.id)&&artifactEligible(context,a)).map(a=>a.id).sort();
 const seed=derive(context.seed,key),rng=random(seed),pool=eligible.slice(),ids=[];
 while(ids.length<count&&pool.length)ids.push(pool.splice(Math.floor(rng.next()*pool.length),1)[0]);
 return {kind:'artifact',key,source,tier,count,options,context,seed,finalRng:rng.state(),eligible,ids};
}
function artifacts(r,source,tier,count,options={}){
 if(!['starting','elite_mystery','boss'].includes(tier)||!Number.isInteger(count)||count<0||count>3)throw Error('Invalid artifact pool.');
 return getReceipt(r,'artifact',source,options,(s,key)=>artifactReceipt(s,source,tier,count,{nodeId:String(options.nodeId??r.route?.active??r.depth),ordinal:options.ordinal??0},key));
}
function discount(r){return Math.max(0,...(r.artifactState?.owned||[]).map(id=>artifactCatalog[id]?.values.discount_percent||0));}
function quote(r,base,{upgraded=false,sale=false}={}){
 if(!Number.isSafeInteger(base)||base<0)throw Error('Invalid base price.');
 const p=profile(r),rate=discount(r),upgradePct=upgraded?120:100,shopPct=p?Math.round(p.shop_price_mult*100):100,salePct=sale?40:100;
 const numerator=base*upgradePct*shopPct*salePct*(100-rate),raw=numerator/100000000,value=Math.max(1,Math.ceil(raw));
 return {label:'Final price',unit:'Gold',kind:'price',value,before:base,after:value,lines:['Base: '+base+' Gold','Upgrade ×'+upgradePct/100,'Economy profile ×'+shopPct/100,'Sale ×'+salePct/100,'Highest owned artifact discount: '+rate+'% (not added)','Round up once: '+raw+' → '+value+' Gold']};
}
const scale=(n,m,round)=>Math[round](n*Math.round(m*100)/100);
function effectText(e){
 const text={ADD_GOLD:()=>e.amount+' Gold',HEAL_HP:()=>'Heal '+e.amount+' HP',DAMAGE_HP:()=>'Lose up to '+e.amount+' HP (nonlethal)',UPGRADE_CARD:()=>'Upgrade one card',REMOVE_CARD:()=>'Remove one card (keep at least 10)',TRANSFORM_CARD:()=>'Transform one card into the same category',CHOOSE_CARD_REWARD:()=>'Choose one of up to '+e.offerCount+' '+(e.category||'')+' cards',CONSUME_ARTIFACT:()=>'Trade one Starting artifact',GRANT_ARTIFACT:()=>'Gain one random '+(e.tiers[0]==='STARTING'?'Starting':'Elite/Mystery')+' artifact',START_COMBAT:()=>'Enter one Normal combat (Normal rewards only)',QUEUE_COMBAT_MODIFIER:()=>e.stat==='ENERGY'?(e.amount?'Lose '+Math.abs(e.amount)+' Energy next combat, first turn':'No Energy loss'):e.stat==='DRAW'?'Draw '+e.amount+' extra next combat, first turn':'Gain '+e.amount+' '+e.stat+' next combat'};
 return text[e.type]?text[e.type]():'Unknown effect';
}
function eventDefinition(r,base){
 const p=profile(r);if(!p||!base)return base;const event=clone(base);
 event.timeLimitSeconds=scale(base.timeLimitSeconds,p.event_time_mult,'ceil');
 for(const o of event.success.options){
  for(const c of o.costs)c.amount=c.resource==='maxHp'?p.event_max_hp_cost:scale(c.amount,c.resource==='gold'?p.event_gold_cost_mult:p.event_hp_cost_mult,'ceil');
  for(const e of o.effects){if(e.type==='ADD_GOLD')e.amount=scale(e.amount,p.event_gold_reward_mult,'floor');if(e.type==='HEAL_HP')e.amount=scale(e.amount,p.event_heal_mult,'ceil');if(e.type==='REMOVE_CARD')e.minimumDeckAfter=10;}
  const costs=o.costs.map(c=>'Pay '+c.amount+' '+({hp:'HP',maxHp:'Max HP',gold:'Gold'})[c.resource]);
  o.label=[...costs,...o.effects.map(effectText)].join(' + ');
 }
 for(const e of event.failure.effects){if(e.type==='DAMAGE_HP')e.amount=scale(e.amount,p.event_failure_hp_mult,'ceil');if(e.type==='QUEUE_COMBAT_MODIFIER'&&e.stat==='ENERGY')e.amount=p.event_next_energy_loss;}
 event.success.summary=event.success.options.map(o=>o.label).join(' OR ')+'.';
 event.failure.summary=event.failure.effects.length?event.failure.effects.map(effectText).join(' + ')+'. No event reward.':'No penalty. No reward.';
 return event;
}
function valid(r){try{
 const s=r.economyState;if(s===undefined)return !C.MASTER_BALANCE;
 if(C.MASTER_BALANCE&&s.difficulty!==C.MASTER_BALANCE.difficulty)return false;
 if(!active(r)||s.combatVersion!==(C.MASTER_BALANCE?.version||'legacy-2.24.0')||!Object.hasOwn(D.profiles,s.difficulty)||!same(s.profile,D.profiles[s.difficulty])||typeof s.support!=='boolean'||!Number.isSafeInteger(s.removalCount)||s.removalCount<0||s.removalCount>20||!s.receipts||Array.isArray(s.receipts)||Object.keys(s.receipts).length>512)return false;
 for(const [key,o]of Object.entries(s.receipts)){
  const x=o.context;if(!x||x.seed!==r.seed||![0,1].includes(x.stage)||!Number.isInteger(x.depth)||x.depth<0||x.depth>9||!Array.isArray(x.deck)||x.deck.length>60||x.deck.some(c=>!C.cards[c.key]||typeof c.upgraded!=='boolean'||!/^c\d+$/.test(c.uid))||!Array.isArray(x.artifacts)||new Set(x.artifacts).size!==x.artifacts.length||x.artifacts.some(id=>!artifactCatalog[id])||!o.options||!Number.isInteger(o.options.ordinal)||o.options.ordinal<0||typeof o.options.nodeId!=='string'||o.options.nodeId.length>120)return false;
  if(key!==[o.kind,o.source,x.stage,o.options.nodeId,o.options.ordinal].join('|'))return false;
  const expected=o.kind==='card'?cardReceipt(x,o.source,o.options,s.difficulty,s.support,key):o.kind==='artifact'?artifactReceipt(x,o.source,o.tier,o.count,o.options,key):null;
  if(!expected||!same(expected,o))return false;
 }
 return true;
 }catch(_){return false;}}
const api={data:D,active,init,profile,snapshot,lookup,cards,artifacts,quote,discount,eventDefinition,effectText,valid};
if(typeof module!=='undefined')module.exports=api;else root.STMEconomy=api;
})(typeof window!=='undefined'?window:globalThis);
