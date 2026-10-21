(function(root){
 'use strict';
 const C=typeof module!=='undefined'?require('./config.js'):root.DCConfig;
 const data=typeof module!=='undefined'?require('./artifact-data.js'):root.DCArtifactData;
 const catalog=Object.fromEntries(data.artifacts.map(a=>[a.id,a]));
 const codes=Object.fromEntries(data.artifacts.map(a=>[a.id.slice(0,3),a.id]));
 const id=code=>codes[code]||code;
 const get=code=>catalog[id(code)];
 const has=(r,code)=>!!r.artifactState?.owned.includes(id(code));
 const value=(code,key)=>get(code).values[key];
 const owned=r=>(r.artifactState?.owned||[]).slice().sort().map(key=>catalog[key]);
 const integer=n=>Number.isSafeInteger(n)&&n>=0;

 function eligible(r,a){
  if(a.requires==='passive')return r.deck.some(c=>C.cards[c.key].role==='passive');
  if(a.requires==='hand_discard')return r.deck.some(c=>C.cards[c.key].discard);
  return true;
 }
 function pool(r,tier){return data.artifacts.filter(a=>a.tier===tier&&!has(r,a.id)&&eligible(r,a));}
 function random(r){const s=r.artifactState;s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;return s.rng/4294967296;}
 function source(r,kind){return kind==='starting'?'starting':kind+':'+r.stage+':'+(r.route?.active||r.depth);}
 function offer(r,kind,ready=true){
  const s=r.artifactState;if(!s||s.offer)throw new Error('An artifact choice is already waiting.');
  const tier=kind==='starting'?'starting':kind==='boss'?'boss':'elite_mystery';
  const candidates=pool(r,tier).map(a=>a.id),ids=[];
  if(kind==='boss')ids.push(...candidates);
  else while(ids.length<3&&candidates.length)ids.push(candidates.splice(Math.floor(random(r)*candidates.length),1)[0]);
  if(!ids.length)return false;
  s.offer={kind,source:source(r,kind),ids,ready};return true;
 }
 function enable(r){
  r.artifactState={version:1,rng:(r.seed^0xa741c6e5)>>>0,owned:[],acquired:[],startingId:null,offer:null};
  offer(r,'starting');r.scene='master';return r;
 }
 function maxHp(r){return C.MAX_HP+(has(r,'s08')?value('s08','max_hp'):0);}
 function acquire(r,key,event){
  const s=r.artifactState,a=catalog[key];
  if(!s||!a||has(r,key)||s.acquired.some(x=>x.source===event))throw new Error('This artifact was already claimed.');
  s.owned.push(key);s.acquired.push({id:key,source:event});
  if(key===id('s08')){r.maxHp=maxHp(r);r.hp=Math.min(r.maxHp,r.hp+a.values.heal);}
  if(key===id('s09'))r.gold+=a.values.gold;
  return a;
 }
 function claim(r,key){
  const s=r.artifactState,o=s?.offer;
  if(!o?.ready||!o.ids.includes(key))throw new Error('Choose one of the offered artifacts.');
  const a=acquire(r,key,o.source),kind=o.kind;
  if(kind==='starting')s.startingId=key;
  s.offer=null;return {artifact:a,kind};
 }
 function choices(r){return r.artifactState?.offer?.ready?r.artifactState.offer.ids.map(key=>catalog[key]):[];}
 function discount(r){return Math.max(0,...owned(r).map(a=>a.values.discount_percent||0));}
 function price(r,base){return Math.max(1,Math.ceil(base*(100-discount(r))/100));}
 function report(r,code,message,ctx){ctx.notify(r,get(code).name+': '+message);}
 function gain(r,code,values,ctx){
  const b=r.battle,notes=[];
  if(values.block){b.block+=values.block;notes.push('+'+values.block+' Block');}
  if(values.energy){b.energy+=values.energy;b.artifacts.turn.energyBudget+=values.energy;notes.push('+'+values.energy+' Energy');}
  if(values.focus){const before=b.focus;b.focus=Math.min(C.FOCUS_CAP,b.focus+values.focus);notes.push('+'+(b.focus-before)+' Focus');}
  if(values.draw){const before=b.hand.length;ctx.draw(r,values.draw);notes.push('draw '+(b.hand.length-before));}
  report(r,code,notes.join(', ')+'.',ctx);
 }
 function startCombat(r){
  if(!r.artifactState)return;
  const b=r.battle;
  b.artifacts={combat:{quill:false,pebble:false,ring:false,flask:false,won:false},turn:null,die:null,clasp:has(r,'b02')?value('b02','initial_strength'):0};
  b.strength=(has(r,'e15')?value('e15','strength'):0)+b.artifacts.clasp;
  b.agility=(has(r,'e16')?value('e16','agility'):0)+b.artifacts.clasp;
 }
 function checkHp(r,ctx){
  const b=r.battle,a=b?.artifacts;
  if(a&&has(r,'e12')&&!a.combat.flask&&r.hp>0&&r.hp*100<=r.maxHp*value('e12','hp_threshold_percent')){
   a.combat.flask=true;gain(r,'e12',{block:value('e12','block')},ctx);
  }
 }
 function startTurn(r,ctx){
  const b=r.battle,a=b.artifacts;if(!a)return;
  a.turn={energyBudget:C.ENERGY,cards:0,attack:false,guard:false,skill:false,exhaust:false,discard:false,pair:false,abacus:false,retaliation:false};
  if(has(r,'b02')&&b.turn>1){
   const next=Math.min(value('b02','max_artifact_contribution_each_stat'),a.clasp+value('b02','strength_per_later_turn'));
   b.strength+=next-a.clasp;b.agility+=next-a.clasp;a.clasp=next;
  }
  if(has(r,'b01'))gain(r,'b01',{energy:value('b01','energy')},ctx);
  // Base draw has completed; stable IDs own the additional-draw order.
  for(const item of owned(r)){
   if(item.id===id('b03')||(b.turn===1&&['s05','e11'].some(code=>item.id===id(code))))gain(r,item.id,{draw:item.values.draw},ctx);
  }
  if(b.turn===1){
   if(has(r,'s04'))gain(r,'s04',{focus:value('s04','focus')},ctx);
   if(has(r,'s07'))gain(r,'s07',{block:value('s07','block')},ctx);
   if(has(r,'e03')){
    a.die=Math.floor(random(r)*value('e03','sides'))+1;
    const values=get('e03').values[a.die<=2?'faces_1_2':a.die<=4?'faces_3_4':'faces_5_6'];
    gain(r,'e03',values,ctx);report(r,'e03','rolled '+a.die+'.',ctx);
   }
  }
  checkHp(r,ctx);
 }
 function cardBonuses(r,d){
  const b=r.battle,a=b?.artifacts;let damage=0,block=0;
  if(!a)return {damage,block};
  if(d.role==='attack'){
   damage=b.strength;
   if(!a.turn.attack)for(const code of ['s02','e07'])if(has(r,code))damage+=value(code,'damage_bonus_per_card');
  }
  if(d.role==='guard'){
   block=b.agility;
   if(!a.turn.guard)for(const code of ['s03','e08'])if(has(r,code))block+=value(code,'block_bonus');
  }
  return {damage,block};
 }
 function cardResolved(r,d,ctx){
  const a=r.battle.artifacts;if(!a)return;const t=a.turn;
  t.cards++;
  if(d.role==='attack')t.attack=true;
  if(d.role==='guard')t.guard=true;
  if(t.attack&&t.guard&&!t.pair&&has(r,'e02')){t.pair=true;gain(r,'e02',{block:value('e02','block')},ctx);}
  if(t.cards>=value('e01','cards_required')&&!t.abacus&&has(r,'e01')){t.abacus=true;gain(r,'e01',{energy:value('e01','energy')},ctx);}
  if(d.role==='tactic'){
   if(!t.skill&&has(r,'e10'))gain(r,'e10',{draw:value('e10','draw')},ctx);
   if(!a.combat.quill&&has(r,'s10')){a.combat.quill=true;gain(r,'s10',{draw:value('s10','draw')},ctx);}
   t.skill=true;
  }
  if(d.role==='passive'&&!a.combat.ring&&has(r,'s12')){a.combat.ring=true;gain(r,'s12',{block:value('s12','block')},ctx);}
 }
 function exhausted(r,count,ctx){
  const a=r.battle.artifacts;if(!a||count<1)return;
  if(!a.turn.exhaust&&has(r,'e05')){a.turn.exhaust=true;gain(r,'e05',{draw:value('e05','draw'),block:value('e05','block')},ctx);}
  if(!a.combat.pebble&&has(r,'s11')){a.combat.pebble=true;gain(r,'s11',{block:value('s11','block')},ctx);}
 }
 function discardedByCard(r,count,ctx){
  const a=r.battle.artifacts;
  if(a&&count>0&&!a.turn.discard&&has(r,'e13')){a.turn.discard=true;gain(r,'e13',{draw:value('e13','draw'),block:value('e13','block')},ctx);}
 }
 function beforeEnemy(r,ctx){
  if(r.battle.artifacts&&has(r,'e04')&&r.battle.energy>=value('e04','min_unspent_energy'))gain(r,'e04',{block:value('e04','block')},ctx);
 }
 function fullyBlocked(r,damage,ctx){
  const a=r.battle.artifacts;
  if(a&&damage>0&&!a.turn.retaliation&&has(r,'e09')){
   a.turn.retaliation=true;const hit=ctx.deal(r,value('e09','retaliation_damage'));
   report(r,'e09','retaliated for '+hit+' damage.',ctx);
  }
 }
 function won(r,ctx){
  const a=r.battle.artifacts;if(!a||a.combat.won||r.hp<=0)return;
  a.combat.won=true;
  for(const code of ['e06','s01'])if(has(r,code)){
   const before=r.hp;r.hp=Math.min(r.maxHp,r.hp+value(code,'heal'));report(r,code,'healed '+(r.hp-before)+' HP.',ctx);
  }
 }
 function maxEnergy(r){
  const b=r.battle;if(!b?.artifacts)return C.ENERGY;
  return C.ENERGY+(has(r,'b01')?value('b01','energy'):0)+(has(r,'e01')?value('e01','energy'):0)+
   (has(r,'e03')&&b.turn===1&&b.artifacts.die>=5?get('e03').values.faces_5_6.energy:0);
 }
 function valid(r){
  const s=r.artifactState;
  if(s===undefined)return r.scene!=='master';
  if(!s||s.version!==1||r.mode!=='challenge'||!integer(s.rng)||s.rng>4294967295||!Array.isArray(s.owned)||s.owned.length>31||new Set(s.owned).size!==s.owned.length||s.owned.some(key=>!catalog[key])||!Array.isArray(s.acquired)||s.acquired.length!==s.owned.length)return false;
  if(new Set(s.acquired.map(x=>x?.id)).size!==s.owned.length||new Set(s.acquired.map(x=>x?.source)).size!==s.acquired.length||s.acquired.some(x=>!x||!s.owned.includes(x.id)||typeof x.source!=='string'||!x.source||x.source.length>120))return false;
  const starters=s.owned.filter(key=>catalog[key].tier==='starting');
  if(s.startingId===null){if(r.scene!=='master'||s.owned.length||r.stage!==0||r.depth!==0||r.battle||s.offer?.kind!=='starting')return false;}
  else if(starters.length!==1||starters[0]!==s.startingId||r.scene==='master'||!s.acquired.some(x=>x.id===s.startingId&&x.source==='starting'))return false;
  if(s.offer){
   const o=s.offer,tier=o.kind==='starting'?'starting':o.kind==='boss'?'boss':'elite_mystery';
   if(!['starting','elite','mystery','boss'].includes(o.kind)||typeof o.ready!=='boolean'||!Array.isArray(o.ids)||!o.ids.length||o.ids.length>3||new Set(o.ids).size!==o.ids.length||o.source!==source(r,o.kind)||s.acquired.some(x=>x.source===o.source)||o.ids.some(key=>!catalog[key]||catalog[key].tier!==tier||has(r,key)||!eligible(r,catalog[key])))return false;
   if(o.kind==='starting'&&(r.scene!=='master'||!o.ready))return false;
   if(o.kind==='elite'&&(r.scene!=='reward'||!r.battle?.elite))return false;
   if(o.kind==='mystery'&&(r.scene!=='event'||!o.ready))return false;
   if(o.kind==='boss'&&(r.scene!=='stageclear'||r.stage!==0||!o.ready||o.ids.length!==3))return false;
  }
  if(r.battle){
   const b=r.battle,a=b.artifacts;
   if(!a||!a.combat||!a.turn||!integer(a.turn.energyBudget)||a.turn.energyBudget<C.ENERGY||a.turn.energyBudget>maxEnergy(r)||b.energy>a.turn.energyBudget||!['quill','pebble','ring','flask','won'].every(k=>typeof a.combat[k]==='boolean')||!['attack','guard','skill','exhaust','discard','pair','abacus','retaliation'].every(k=>typeof a.turn[k]==='boolean')||!integer(a.turn.cards)||a.turn.cards>200)return false;
   const clasp=has(r,'b02')?Math.min(value('b02','max_artifact_contribution_each_stat'),value('b02','initial_strength')+b.turn-1):0;
   if(a.clasp!==clasp||b.strength!==(has(r,'e15')?value('e15','strength'):0)+clasp||b.agility!==(has(r,'e16')?value('e16','agility'):0)+clasp)return false;
   if(has(r,'e03')?(!integer(a.die)||a.die<1||a.die>6):a.die!==null)return false;
  }
  return true;
 }
 const api={catalog,codes,id,get,has,owned,eligible,pool,enable,offer,claim,choices,acquire,source,maxHp,discount,price,random,
  startCombat,startTurn,checkHp,cardBonuses,cardResolved,exhausted,discardedByCard,beforeEnemy,fullyBlocked,won,maxEnergy,valid};
 if(typeof module!=='undefined')module.exports=api;else root.DCArtifacts=api;
})(typeof window!=='undefined'?window:globalThis);
