(function(root){
 'use strict';
 const C=typeof module!=='undefined'?require('./config.js'):root.DCConfig;
 const data=typeof module!=='undefined'?require('./artifact-data.js'):root.DCArtifactData;
 const R=typeof module!=='undefined'?require('./rich-text.js'):root.DCRichText;
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
  if(key===id('s08')){
   const maxBefore=r.maxHp,hpBefore=r.hp;r.maxHp=maxHp(r);r.hp=Math.min(r.maxHp,r.hp+a.values.heal);
   R.record(r,a.name,[key],[R.delta('Max HP gained','Max HP',maxBefore,r.maxHp,[a.name+': +'+a.values.max_hp,'Max HP after: '+maxBefore+' + '+a.values.max_hp+' = '+r.maxHp]),R.healing(a.values.heal,hpBefore,r.hp,r.maxHp)]);
  }
  if(key===id('s09')){const before=r.gold;r.gold+=a.values.gold;R.record(r,a.name,[key],[R.delta('Gold gained','Gold',before,r.gold,[a.name+': +'+a.values.gold+' Gold','Gold after: '+before+' + '+a.values.gold+' = '+r.gold])]);}
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
 function priceCalculation(r,base){
  const rate=discount(r),unrounded=base*(100-rate)/100,final=Math.max(1,Math.ceil(unrounded));
  const labels=owned(r).filter(a=>a.values.discount_percent).map(a=>a.name+': '+a.values.discount_percent+'%');
  return {label:'Final price',unit:'Gold',kind:'price',value:final,before:base,after:final,lines:[
   'Original price: '+base+' Gold',...labels,'Highest discount: '+rate+'% (discounts do not add)',
   'Price before rounding: '+base+' × (100 − '+rate+') ÷ 100 = '+unrounded,
   'Final price: max(1, round up('+unrounded+')) = '+final+' Gold'
  ]};
 }
 function price(r,base){return priceCalculation(r,base).value;}
 function report(r,code,message,ctx){ctx.notify(r,get(code).name+': '+message);}
 function gain(r,code,values,ctx,context=[],initial=[]){
  const b=r.battle,notes=[],results=initial.slice(),name=get(code).name;
  if(values.block){const before=b.block;b.block+=values.block;notes.push('+'+values.block+' Block');results.push(R.delta('Block gained','Block',before,b.block,[...context,name+': +'+values.block+' Block','Block after: '+before+' + '+values.block+' = '+b.block]));}
  if(values.energy){const before=b.energy;b.energy+=values.energy;b.artifacts.turn.energyBudget+=values.energy;notes.push('+'+values.energy+' Energy');results.push(R.delta('Energy gained','Energy',before,b.energy,[...context,name+': +'+values.energy+' Energy','Energy after: '+before+' + '+values.energy+' = '+b.energy]));}
  if(values.focus){const before=b.focus;b.focus=Math.min(C.FOCUS_CAP,b.focus+values.focus);notes.push('+'+(b.focus-before)+' Focus');results.push(R.delta('Focus gained','Focus',before,b.focus,[...context,name+': +'+values.focus+' Focus','Focus cap: '+C.FOCUS_CAP,'Focus after: min('+C.FOCUS_CAP+', '+before+' + '+values.focus+') = '+b.focus]));}
  if(values.draw){const before=b.hand.length;ctx.draw(r,values.draw);notes.push('draw '+(b.hand.length-before)+(b.hand.length-before<values.draw&&b.hand.length>=C.HAND_LIMIT?' · Hand full ('+C.HAND_LIMIT+'/'+C.HAND_LIMIT+')':''));results.push(R.delta('Cards drawn','cards',before,b.hand.length,[...context,name+': draw '+values.draw,'Hand before: '+before+' cards','Actual moved into Hand: '+(b.hand.length-before),'Hand after: '+before+' + '+(b.hand.length-before)+' = '+b.hand.length,'Hand limit: '+C.HAND_LIMIT+'. A full Hand stops drawing without moving extra cards. Empty Draw Pile reshuffles Discard.']));}
  R.record(r,name,[id(code)],results);
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
   a.combat.flask=true;gain(r,'e12',{block:value('e12','block')},ctx,['Alive: '+r.hp+' > 0','HP threshold: 2 × '+r.hp+' = '+(2*r.hp)+' ≤ '+r.maxHp+' Max HP']);
  }
 }
 function startTurn(r,ctx){
  const b=r.battle,a=b.artifacts;if(!a)return;
  a.turn={energyBudget:C.ENERGY,cards:0,attack:false,guard:false,skill:false,exhaust:false,discard:false,pair:false,abacus:false,retaliation:false};
  if(has(r,'b02')&&b.turn>1){
   const next=Math.min(value('b02','max_artifact_contribution_each_stat'),a.clasp+value('b02','strength_per_later_turn'));
   b.strength+=next-a.clasp;b.agility+=next-a.clasp;a.clasp=next;
  }
  const statIds=['b02','e15','e16'].filter(code=>has(r,code));
  if(statIds.length&&(b.turn===1||has(r,'b02'))){
   const common=has(r,'b02')?['Clasp contribution: min('+value('b02','max_artifact_contribution_each_stat')+', '+value('b02','initial_strength')+' + '+b.turn+' − 1) = '+a.clasp]:[];
   const strength=has(r,'e15')?value('e15','strength'):0,agility=has(r,'e16')?value('e16','agility'):0;
   R.record(r,'Combat stat totals',statIds.map(id),[
    R.total('Total Strength','Strength',b.strength,[...common,'Crimson Sword Charm: +'+strength+' Strength','Total Strength: '+a.clasp+' + '+strength+' = '+b.strength]),
    R.total('Total Agility','Agility',b.agility,[...common,"Guardian's Armlet: +"+agility+' Agility','Total Agility: '+a.clasp+' + '+agility+' = '+b.agility])
   ]);
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
    const context=['Saved d6 result: '+a.die,'Resolved branch: '+(a.die<=2?'1–2 → 10 Block':a.die<=4?'3–4 → draw 2 cards':'5–6 → 2 Energy')];
    gain(r,'e03',values,ctx,context,[{label:'Die result',unit:'d6',kind:'roll',value:a.die,before:a.die,after:a.die,lines:context}]);report(r,'e03','rolled '+a.die+'.',ctx);
   }
  }
  checkHp(r,ctx);
 }
 function cardContributions(r,d){
  const b=r.battle,a=b?.artifacts,damage=[],block=[];
  if(!a)return {damage,block};
  const add=(list,code,key)=>{if(has(r,code))list.push({id:id(code),name:get(code).name,value:value(code,key)});};
  if(d.role==='attack'){
   add(damage,'e15','strength');if(has(r,'b02'))damage.push({id:id('b02'),name:get('b02').name,value:a.clasp});
   if(!a.turn.attack)for(const code of ['s02','e07'])add(damage,code,'damage_bonus_per_card');
  }
  if(d.role==='guard'){
   add(block,'e16','agility');if(has(r,'b02'))block.push({id:id('b02'),name:get('b02').name,value:a.clasp});
   if(!a.turn.guard)for(const code of ['s03','e08'])add(block,code,'block_bonus');
  }
  return {damage,block};
 }
 function cardBonuses(r,d){const sources=cardContributions(r,d);return {damage:sources.damage.reduce((sum,x)=>sum+x.value,0),block:sources.block.reduce((sum,x)=>sum+x.value,0)};}
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
   a.turn.retaliation=true;const hit=ctx.deal(r,value('e09','retaliation_damage'),false,{label:get('e09').name+' retaliation',artifactIds:[id('e09')],lines:['Fully blocked enemy hit: '+damage+' damage',get('e09').name+': '+value('e09','retaliation_damage')+' retaliation damage']});
   report(r,'e09','retaliated for '+hit+' damage.',ctx);
  }
 }
 function won(r,ctx){
  const a=r.battle.artifacts;if(!a||a.combat.won||r.hp<=0)return;
  a.combat.won=true;
  for(const code of ['e06','s01'])if(has(r,code)){
   const before=r.hp;r.hp=Math.min(r.maxHp,r.hp+value(code,'heal'));R.record(r,get(code).name,[id(code)],[R.healing(value(code,'heal'),before,r.hp,r.maxHp)]);report(r,code,'healed '+(r.hp-before)+' HP.',ctx);
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
 const api={catalog,codes,id,get,has,owned,eligible,pool,enable,offer,claim,choices,acquire,source,maxHp,discount,price,priceCalculation,random,cardContributions,
  startCombat,startTurn,checkHp,cardBonuses,cardResolved,exhausted,discardedByCard,beforeEnemy,fullyBlocked,won,maxEnergy,valid};
 if(typeof module!=='undefined')module.exports=api;else root.DCArtifacts=api;
})(typeof window!=='undefined'?window:globalThis);
