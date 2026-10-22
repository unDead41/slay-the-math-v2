(function(root){'use strict';
 const data=typeof module!=='undefined'?require('./card-data.js'):root.STMCardData;
 const catalog=Object.fromEntries(data.cards.map(c=>[c.id,c]));
 const categoryRole={attack:'attack',defend:'guard',skill:'tactic',passive:'passive'};
 const clone=x=>JSON.parse(JSON.stringify(x));
 const integer=n=>Number.isSafeInteger(n)&&n>=0;
 const categories=['attack','defend','skill','passive'];
 const id=name=>data.cards.find(c=>c.name===name).id;
 const names=Object.fromEntries(data.cards.map(c=>[c.name,c.id]));
 const base=(name,key)=>catalog[names[name]].values[key].base;
 const limit=(name,key)=>catalog[names[name]].passive.limits[key];
 const passiveIds=new Set(data.cards.filter(c=>c.category==='passive').map(c=>c.id));
 const defaultStatus=()=>({weak:0,weakUntil:0,vulnerable:0,vulnerableUntil:0});
 function initial(){return {version:1,seq:0,stats:{strength:0,agility:0,defense:0},counters:{},carry:0,queue:[],lostHpLastEnemyTurn:false,statuses:{self:defaultStatus(),enemy:defaultStatus(),thorns:0,thornsUntil:0},receipts:[]};}
 function setup(r){const b=r.battle;b.cardCombat=initial();b.active=[];b.resolving=[];b.cardChoice=null;b.strength=b.strength||0;b.agility=b.agility||0;b.defense=0;b.enemyDefense=0;}
 function state(r){return r.battle?.cardCombat||initial();}
 function get(c){return c&&catalog[c.packageId||c.key||c.id]||null;}
 function condition(key,c){return !!({lost_hp_last_enemy_turn:c.lostHpLastEnemyTurn,has_block:c.hasBlock,enemy_attacks:c.enemyAttacks,empty_hand_after_play_snapshot:c.handAfterPlay===0})[key];}
 function context(r,c,deps){const b=r.battle,s=state(r),d=get(c),bounded=['Read Ahead','Clear Choice','Burning Page','Card Search'].includes(d?.name),sources=deps.A.cardContributions(r,deps.C.cards[c.key]),firstDamage=sources.damage.filter(x=>['s02','e07'].some(k=>x.id===deps.A.id(k))),firstBlock=sources.block.filter(x=>['s03','e08'].some(k=>x.id===deps.A.id(k)));
  const upgradeField=d.category==='attack'?d.actions.find(a=>a.op==='damage')?.value:d.category==='defend'?d.actions.find(a=>a.op==='grant_block'&&!a.timing)?.value:d.category==='skill'?Object.keys(d.values).find(k=>d.values[k].focus_bonus>0):null;
  return {upgraded:!!c.upgraded,upgradeField,upgradeAmount:c.upgraded&&d.category!=='passive'?(deps.C.CARD_UPGRADES?.[d.category]||0):0,upgradeCostReduction:c.upgraded&&d.category==='passive'?(deps.C.CARD_UPGRADES?.passive||0):0,energy:b.energy,strength:b.strength||0,agility:b.agility||0,focusStock:b.focus,focusUsed:b.boostUsed,handAfterPlay:Math.max(0,b.hand.length-(b.hand.some(x=>x.uid===c.uid)?1:0)),availableDrawCards:bounded?(b.draw.length||b.discard.length):Math.max(0,b.draw.length+b.discard.length-(d?.name==='Recall'?1:0)),discardCount:b.discard.length,hasTarget:b.hp>0,lostHpLastEnemyTurn:s.lostHpLastEnemyTurn,hasBlock:b.block>0,enemyAttacks:(b.currentIntent?.damage||0)>0,activePassives:(b.active||[]).map(c=>c.key),firstDamage,firstBlock};
 }
 function compute(d,c,focused){const values={},rawValues={},calculations={};
  for(const [key,spec]of Object.entries(d.values)){let v=spec.base;const terms=[{name:'base',amount:spec.base}];
   if(spec.energy_multiplier){const n=spec.energy_multiplier*c.energy;v+=n;terms.push({name:spec.energy_multiplier+' × X('+c.energy+')',amount:n});}
   if(spec.stat){v+=c[spec.stat];terms.push({name:spec.stat,amount:c[spec.stat]});}
   if(spec.condition){const n=condition(spec.condition.key,c)?spec.condition.bonus:0;v+=n;terms.push({name:spec.condition.key,amount:n});}
   if(c.upgraded&&c.upgradeField===key){v+=c.upgradeAmount;terms.push({name:'Upgrade',amount:c.upgradeAmount});}
   if(spec.focus_bonus){const n=focused?spec.focus_bonus:0;v+=n;terms.push({name:'Focus',amount:n});}
   rawValues[key]=v;values[key]=Math.max(0,v);calculations[key]={terms,result:values[key],minimum:0};
  }
  for(const [op,sources]of [['damage',c.firstDamage],['grant_block',c.firstBlock]]){const a=d.actions.find(a=>a.op===op&&!a.timing);if(!a||!sources.length)continue;const key=a.value;
   for(const x of sources){rawValues[key]+=x.value;calculations[key].terms.push({name:x.name,amount:x.value});}
   values[key]=Math.max(0,rawValues[key]);calculations[key].result=values[key];
  }
  return {values,rawValues,calculations};
 }
 function useful(d,c){const normal=compute(d,c,false).values,focus=compute(d,c,true).values,free=10-c.handAfterPlay;
  if(d.category==='attack'||d.category==='defend')return Object.keys(d.values).some(k=>d.values[k].focus_bonus>0&&focus[k]>normal[k]);
  if(d.name==='Next Chapter')return true;
  if(d.name==='Recall')return free>normal.return+normal.extra&&c.availableDrawCards>normal.extra;
  if(d.name==='Last Page'){const n=normal.draw+(c.handAfterPlay===0?normal.emptyBonus:0);return free>n&&c.availableDrawCards>n;}
  if(['Quick Study','Deep Study','Mana Reading'].includes(d.name))return free>normal.draw&&c.availableDrawCards>normal.draw;
  if(['Read Ahead','Clear Choice'].includes(d.name))return free>0&&c.availableDrawCards>normal.look;
  if(d.name==='Card Search')return free>0&&c.availableDrawCards>normal.search;
  if(d.name==='Burning Page')return free>0&&c.availableDrawCards>normal.replace+1;
  return false;
 }
 function projectDamage(r,p,deps){const b=r.battle,s=clone(state(r).statuses),e=deps.C.enemies[b.enemyId],sealed=!!(e.boss&&b.seals<e.seals.length),floor=sealed?1:0,events=[];let hp=b.hp,block=b.enemyBlock;
  for(const action of p.actions){
   if(action.op==='remove_block')block=Math.max(0,block-action.value);
   if(action.op==='apply_status'&&action.status!=='thorns'){const target=action.target==='self'?s.self:s.enemy;target[action.status]=Math.min(3,target[action.status]+action.value);}
   if(action.op!=='damage'||action.target==='each_other_living_enemy')continue;
   for(let hit=0;hit<(action.repeat||1)&&hp>0;hit++){
    const vulnerable=s.enemy.vulnerable>0,weak=s.self.weak>0,beforeStatus=p.rawValues[action.value_ref],beforeDefense=Math.max(0,beforeStatus+(vulnerable?2:0)-(weak?2:0)),defense=b.enemyDefense||0,afterDefense=Math.max(0,beforeDefense-defense),afterSeal=sealed?Math.ceil(afterDefense/2):afterDefense,absorbed=action.ignore_block?0:Math.min(block,afterSeal),hpBefore=hp;
    if(vulnerable)s.enemy.vulnerable--;if(weak)s.self.weak--;block-=absorbed;hp=Math.max(floor,hp-afterSeal+absorbed);
    events.push({ref:action.value_ref,target:b.enemyId,random:action.target==='random_living_enemy',beforeStatus,vulnerable,weak,beforeDefense,defense,afterDefense,sealed,afterSeal,pierce:!!action.ignore_block,absorbed,hpBefore,hpAfter:hp,hpLost:hpBefore-hp});
   }
  }
  return events;
 }
 function plan(r,c,deps){const d=get(c);if(!d)return null;const b=r.battle;if(!b)return null;const ctx=context(r,c,deps),errors=[],cost=d.energy.kind==='fixed'?Math.max(0,d.energy.amount-ctx.upgradeCostReduction):ctx.energy;
  if(r.scene!=='battle')errors.push('battle_over');
  if(b.cardChoice)errors.push('choice_pending');
  if(b.question&&!b.question.solved)errors.push('prediction_pending');
  if(ctx.energy<cost||(d.energy.kind==='all_remaining'&&ctx.energy<d.energy.minimum))errors.push('insufficient_energy');
  if((d.category==='attack'||d.actions.some(a=>a.target==='selected_enemy'))&&!ctx.hasTarget)errors.push('no_living_target');
  if(d.name==='Recall'&&(!ctx.discardCount||ctx.handAfterPlay>=10))errors.push('no_legal_recall');
  if(d.category==='passive'&&ctx.activePassives.includes(d.id))errors.push('passive_already_active');
  const requestedFocus=!!b.boostArmed;let focusReason='not_requested';
  if(requestedFocus)focusReason=!d.focus_eligible?'passive_has_no_focus':errors.length?'invalid_play':ctx.focusUsed?'already_used_this_turn':!ctx.focusStock?'no_focus_stock':!useful(d,ctx)?'no_additional_benefit':'focused';
  const focused=focusReason==='focused',computed=compute(d,ctx,focused),actions=d.actions.filter(a=>!a.condition||condition(a.condition,ctx)).map(a=>{const out={...a};for(const field of ['value','look','take','limit','replacement_limit'])if(typeof out[field]==='string'&&Object.hasOwn(computed.values,out[field])){out[field+'_ref']=out[field];out[field]=computed.values[out[field]];}return out;});
  const result={card:d,displayCost:d.energy.kind==='fixed'?cost:'X',upgraded:!!c.upgraded,context:ctx,legal:!errors.length,errors,requestedFocus,focused,focusReason,...computed,actions,payEnergy:errors.length?0:cost,payFocus:focused?1:0,focusArmedAfter:requestedFocus&&!focused,focusUsedAfter:ctx.focusUsed||focused,passive:d.passive||null};result.damageEvents=projectDamage(r,result,deps);return result;
 }
 function displayPlan(c,deps){const enemyId=Object.keys(deps.C.enemies).find(id=>!deps.C.enemies[id].boss),other=Array.from({length:4},(_,i)=>({uid:'preview:'+i})),run={scene:'battle',battle:{enemyId,hp:10000,enemyBlock:0,enemyDefense:0,energy:deps.C.ENERGY,focus:0,boostArmed:false,boostUsed:false,hand:[c,...other],draw:Array(30).fill(null),discard:[],active:[],resolving:[],cardChoice:null,question:null,strength:0,agility:0,block:0,seals:0,turn:1,currentIntent:{damage:0}}};return plan(run,c,deps);}
 const messages={battle_over:'This battle is over.',choice_pending:'Finish the card choice first.',prediction_pending:'Finish or close Predict first.',fixed_package_values:'This card uses its fixed package values.',insufficient_energy:'Not enough Energy.',no_living_target:'No living enemy is available.',no_legal_recall:'Recall needs a card in the Discard Pile and space in Hand.',passive_already_active:'One copy of this Passive is already active.'};
 function error(p){return p?.errors.map(k=>messages[k]||k)[0]||'';}
 function fixed(r,n,label,deps){const b=r.battle;if(b.hp<=0)return;const enemy=deps.C.enemies[b.enemyId],sealed=enemy.boss&&b.seals<enemy.seals.length,before=b.hp;b.hp=Math.max(sealed?1:0,b.hp-n);deps.R.record(r,label,[],[deps.R.delta('Enemy HP lost','HP',before,b.hp,['Fixed HP damage: '+n,'Ignores Defense and Block.','A sealed boss remains at least 1 HP.','Enemy HP after: '+b.hp])]);}
 function checkLastEmber(r,deps){const s=state(r),counter=s.counters[names['Last Ember']];if(!counter||counter.triggers||r.hp<=0||r.hp*100>r.maxHp*base('Last Ember','threshold'))return;counter.triggers=1;counter.lastTurn=r.battle.turn;const b=r.battle,blockBefore=b.block,focusBefore=b.focus;b.block+=base('Last Ember','block');b.focus=Math.min(deps.C.FOCUS_CAP,b.focus+base('Last Ember','focus'));deps.R.record(r,'Last Ember',[],[deps.R.delta('Block gained','Block',blockBefore,b.block,['Alive and HP is at most 30% of Max HP.','Last Ember: +'+base('Last Ember','block')+' Block once per combat.']),deps.R.delta('Focus gained','Focus',focusBefore,b.focus,['Last Ember: +'+base('Last Ember','focus')+' Focus, capped at '+deps.C.FOCUS_CAP+'.'])]);}
 function addStat(r,attribute,n){const s=state(r);s.stats[attribute]+=n;r.battle[attribute]=(r.battle[attribute]||0)+n;}
 function activate(r,c,deps){const b=r.battle,s=state(r),d=get(c),counter={activatedTurn:b.turn,count:0,triggers:0,lastTurn:0};s.counters[d.id]=counter;
  if(d.name==='Blazing Spirit'){addStat(r,'strength',base('Blazing Spirit','strength'));counter.triggers=1;}
  if(d.name==='Swift Step'){addStat(r,'agility',base('Swift Step','agility'));counter.triggers=1;}
  if(d.name==='Rune Armor'){addStat(r,'defense',base('Rune Armor','defense'));counter.triggers=1;}
  if(d.name==='Last Ember')checkLastEmber(r,deps);
 }
 function afterResolved(r,d,focused,deps){const s=state(r),b=r.battle;
  for(const [role,name,attribute]of [['attack','Growing Flame','strength'],['guard','Battle Rhythm','agility']]){const counter=s.counters[names[name]];if(d.role!==role||!counter)continue;counter.count++;if(counter.count%limit(name,'every_n_cards')===0&&counter.triggers<limit(name,'max_triggers_per_combat')){counter.triggers++;addStat(r,attribute,base(name,attribute));deps.notify(r,name+': +1 '+(attribute==='strength'?'Strength':'Agility')+'.');}}
  const ward=s.counters[names['Grimoire Ward']];if(d.role==='tactic'&&ward&&ward.lastTurn!==b.turn){ward.lastTurn=b.turn;ward.triggers++;b.block+=base('Grimoire Ward','block');deps.notify(r,'Grimoire Ward: +'+base('Grimoire Ward','block')+' Block.');}
  const core=s.counters[names['Ember Core']];if(focused&&core&&core.lastTurn!==b.turn){core.lastTurn=b.turn;core.triggers++;fixed(r,base('Ember Core','damage'),'Ember Core',deps);}
 }
 function prepareWindow(r,deps){const b=r.battle;if(b.hand.length>=deps.C.HAND_LIMIT)return 0;if(!b.draw.length&&b.discard.length){b.draw=deps.shuffle(r,b.discard.splice(0));deps.notify(r,'Discard Pile shuffled into the Draw Pile.');}return b.draw.length;}
 function receipt(r){return state(r).receipts.at(-1);}
 function finish(r,deps){const b=r.battle,s=state(r),tx=receipt(r),c=b.resolving.pop();if(!c||!tx||tx.uid!==c.uid)throw Error('This card transaction is no longer active.');const d=get(c),def=deps.C.cards[c.key];b.cardChoice=null;
  if(d.category==='passive'){b.active.push(c);activate(r,c,deps);}else if(d.lifecycle==='exhaust'){b.exhaust.push(c);tx.exhausted++;}else b.discard.push(c);
  afterResolved(r,def,tx.focused,deps);
  // The complete printed discard/exhaust batch is in its destination before artifacts draw.
  deps.A.discardedByCard(r,tx.discarded,deps.artifactContext);deps.A.exhausted(r,tx.exhausted,deps.artifactContext);deps.A.cardResolved(r,def,deps.artifactContext);
  tx.status='resolved';tx.rngAfter=r.rng;
  if(s.receipts.length>64)s.receipts.splice(0,s.receipts.length-64);
  if(b.hp<=0&&r.scene==='battle')deps.win(r);return r;
 }
 function openPrechoice(r,c,p){const b=r.battle,s=state(r),kind=p.card.name==='Recall'?'recall':'card_search';b.cardChoice={id:'pick:'+(s.seq+1)+':'+c.uid,kind,sourceUid:c.uid,committed:false,candidates:kind==='recall'?clone(b.discard):[],options:kind==='recall'?b.discard.map(c=>c.uid):categories.slice()};return r;}
 function commit(r,uid,selection,deps){const b=r.battle;if(!b?.cardCombat)setup(r);if(b.cardChoice)throw Error('Finish the card choice first.');const index=b.hand.findIndex(c=>c.uid===uid);if(index<0)throw Error('This card is not in your hand.');const c=b.hand[index],p=plan(r,c,deps);if(!p?.legal)throw Error(error(p)||'This card is not available.');
  if(['Recall','Card Search'].includes(p.card.name)&&selection===undefined)return openPrechoice(r,c,p);
  if(p.card.name==='Recall'&&!b.discard.some(c=>c.uid===selection))throw Error('Choose a card from the Discard Pile.');
  if(p.card.name==='Card Search'&&!categories.includes(selection))throw Error('Choose a card category.');
  const s=state(r),tx={id:'card:'+(++s.seq),uid:c.uid,key:c.key,turn:b.turn,energyBefore:b.energy,energy:p.payEnergy,upgraded:!!c.upgraded,focus:p.payFocus,focused:p.focused,status:'resolving',rngBefore:r.rng,rngAfter:r.rng,values:clone(p.values),context:clone(p.context),selection:selection===undefined?null:selection,discarded:0,exhausted:0,randomTargets:[],damageEvents:clone(p.damageEvents)};s.receipts.push(tx);if(s.receipts.length>64)s.receipts.splice(0,s.receipts.length-64);
  b.hand.splice(index,1);b.resolving.push(c);b.energy-=p.payEnergy;r.stats.cardsPlayed=(r.stats.cardsPlayed||0)+1;
  if(p.focused){b.focus--;b.boostUsed=true;b.boostArmed=false;}
  let damageIndex=0;for(const a of p.actions){
   if(a.op==='damage'){
    if(a.target==='each_other_living_enemy')continue;
    for(let hit=0;hit<(a.repeat||1)&&b.hp>0;hit++){
     if(a.target==='random_living_enemy'){deps.rng(r);tx.randomTargets.push(b.enemyId);}
     const st=s.statuses,event=p.damageEvents[damageIndex++],lines=['Card calculation: '+p.calculations[a.value_ref].terms.map(t=>t.name+': '+(t.name==='base'||t.amount<0?'':'+')+t.amount).join('; ')];if(!event)throw Error('The saved damage snapshot is incomplete.');
     if(event.vulnerable){st.enemy.vulnerable--;if(!st.enemy.vulnerable)st.enemy.vulnerableUntil=0;lines.push('Vulnerable: +2; consume one stack.');}
     if(event.weak){st.self.weak--;if(!st.self.weak)st.self.weakUntil=0;lines.push('Weak: −2; consume one stack.');}
     lines.push('Damage before Defense: '+event.beforeDefense,'Enemy Defense: '+event.defense);const amount=event.afterDefense;
     const total=deps.deal(r,amount,!!a.ignore_block,{label:p.card.name,artifactIds:[...p.context.firstDamage].map(x=>x.id).filter(Boolean),lines});deps.notify(r,p.card.name+' gives '+total+' damage.');
    }
   }else if(a.op==='grant_block'){
    if(a.timing)s.queue.push({kind:'block',value:a.value,turn:b.turn+1,source:c.key,agility:p.context.agility});
    else{const before=b.block;b.block+=a.value;deps.R.record(r,p.card.name,[],[deps.R.delta('Block gained','Block',before,b.block,p.calculations[a.value_ref].terms.map(t=>t.name+': '+t.amount))]);deps.notify(r,p.card.name+' gives '+a.value+' Block.');}
   }else if(a.op==='draw'){
    if(a.timing)s.queue.push({kind:'draw',value:a.value,turn:b.turn+1,source:c.key,focused:p.focused,upgraded:!!c.upgraded});
    else{const before=b.hand.length,n=deps.draw(r,a.value);deps.R.record(r,p.card.name,[],[deps.R.delta('Cards drawn','cards',before,b.hand.length,['Requested draw: '+a.value,'Actual cards moved into Hand: '+n,'Hand limit: '+deps.C.HAND_LIMIT])]);deps.notify(r,'Draw '+n+' card'+(n===1?'':'s')+'.'+(n<a.value&&b.hand.length>=deps.C.HAND_LIMIT?' Hand full ('+deps.C.HAND_LIMIT+'/'+deps.C.HAND_LIMIT+').':''));}
   }else if(a.op==='remove_block')b.enemyBlock=Math.max(0,b.enemyBlock-a.value);
   else if(a.op==='apply_status'){
    if(a.status==='thorns'){s.statuses.thorns+=a.value;s.statuses.thornsUntil=b.turn;}
    else{const target=a.target==='self'?s.statuses.self:s.statuses.enemy;target[a.status]=Math.min(3,target[a.status]+a.value);target[a.status+'Until']=b.turn+(a.target==='self'?1:0);}
   }else if(a.op==='retain_block')s.carry=Math.max(s.carry,a.value);
   else if(a.op==='return_discard_card'){const i=b.discard.findIndex(c=>c.uid===selection);if(i<0||b.hand.length>=deps.C.HAND_LIMIT)throw Error('This Recall choice is no longer available.');b.hand.push(b.discard.splice(i,1)[0]);}
   else if(a.op==='search_category'){
    prepareWindow(r,deps);for(let n=0;n<a.limit&&b.draw.length&&b.hand.length<deps.C.HAND_LIMIT;n++){const candidate=b.draw.pop();if(get(candidate)?.category===selection||(!get(candidate)&&deps.C.cards[candidate.key].role===categoryRole[selection])){b.hand.push(candidate);break;}b.discard.push(candidate);tx.discarded++;}
   }else if(['look_choose_reorder','look_choose_discard','look_replace_take'].includes(a.op)){
    const available=prepareWindow(r,deps),kind=a.op==='look_choose_reorder'?'read_ahead':a.op==='look_choose_discard'?'clear_choice':'burning_page',count=kind==='burning_page'?Math.min(1,available):Math.min(a.look,available),candidates=[];for(let n=0;n<count;n++)candidates.push(b.draw.pop());
    if(!candidates.length)continue;
    if(candidates.length===1&&(kind!=='burning_page'||!b.draw.length)){b.hand.push(candidates[0]);continue;}
    b.cardChoice={id:tx.id,kind,sourceUid:c.uid,committed:true,candidates,options:kind==='burning_page'?['take','replace']:candidates.map(c=>c.uid)};
    if(kind==='burning_page')Object.assign(b.cardChoice,{replacementsRemaining:a.replacement_limit,replacementsUsed:0,windowRemaining:b.draw.length});
    tx.status='choice';tx.rngAfter=r.rng;return r;
   }else if(a.op!=='activate_unique_passive')throw Error('Unsupported card action: '+a.op);
  }
  return finish(r,deps);
 }
 function choose(r,value,deps){const b=r.battle,ch=b?.cardChoice;if(!ch||r.scene!=='battle')throw Error('No card choice is waiting.');if(value&&typeof value==='object'&&value.choiceId!==undefined&&value.choiceId!==ch.id)throw Error('This card choice has already ended.');
  if(!ch.committed){const selected=value&&typeof value==='object'?(value.value??value.uid??value.category):value;if(!ch.options.includes(selected))throw Error('Choose one of the available options.');const uid=ch.sourceUid;b.cardChoice=null;return commit(r,uid,selected,deps);}
  const tx=receipt(r);if(tx.id!==ch.id||tx.status!=='choice')throw Error('This card transaction has already ended.');
  if(ch.kind==='burning_page'){
   const selected=value&&typeof value==='object'?value.value:value;if(!['take','replace'].includes(selected))throw Error('Take the card or replace it.');
   if(selected==='replace'){
    if(ch.replacementsRemaining<1||ch.windowRemaining<1||!b.draw.length)throw Error('No replacements remain.');b.discard.push(ch.candidates.pop());tx.discarded++;ch.candidates.push(b.draw.pop());ch.replacementsRemaining--;ch.replacementsUsed++;ch.windowRemaining--;
    if(ch.replacementsRemaining>0&&ch.windowRemaining>0)return r;
   }
   b.hand.push(ch.candidates.pop());return finish(r,deps);
  }
  const selected=value&&typeof value==='object'?(value.take??value.value??value.uid):value,index=ch.candidates.findIndex(c=>c.uid===selected);if(index<0)throw Error('Choose one of the revealed cards.');
  const remaining=ch.candidates.filter(c=>c.uid!==selected);let order=remaining.map(c=>c.uid);
  if(ch.kind==='read_ahead'&&value&&typeof value==='object'&&value.order!==undefined){order=value.order;if(!Array.isArray(order)||order.length!==remaining.length||new Set(order).size!==order.length||order.some(uid=>!remaining.some(c=>c.uid===uid)))throw Error('Order every remaining card once, with the next draw first.');}
  b.hand.push(ch.candidates[index]);
  if(ch.kind==='read_ahead')for(const uid of order.slice().reverse())b.draw.push(remaining.find(c=>c.uid===uid));
  else if(ch.kind==='clear_choice'){b.discard.push(...remaining);tx.discarded+=remaining.length;}
  else throw Error('This choice is not supported.');
  return finish(r,deps);
 }
 function cancel(r){const ch=r.battle?.cardChoice;if(!ch)throw Error('No card choice is waiting.');if(ch.committed)throw Error('Resolve this committed card choice before continuing.');r.battle.cardChoice=null;return r;}
 function resetBlock(r){const b=r.battle,s=state(r),cap=Math.max(s.carry,s.counters[names['Lasting Shield']]?base('Lasting Shield','retain'):0);s.carry=0;return Math.min(b.block,cap);}
 function startTurn(r,deps){const b=r.battle,s=state(r),due=s.queue.filter(q=>q.kind==='block'&&q.turn===b.turn);for(const q of due){b.block+=q.value;deps.notify(r,'Layered Shield: +'+q.value+' delayed Block.');}s.queue=s.queue.filter(q=>!due.includes(q));}
 function drawPhase(r,deps){const b=r.battle,s=state(r),due=s.queue.filter(q=>q.kind==='draw'&&q.turn===b.turn);for(const q of due)deps.draw(r,q.value);s.queue=s.queue.filter(q=>!due.includes(q));const mind=s.counters[names['Clear Mind']];if(mind&&mind.activatedTurn<b.turn&&mind.lastTurn!==b.turn){mind.lastTurn=b.turn;mind.triggers++;deps.draw(r,base('Clear Mind','draw'));}}
 function beforeEnemy(r){const b=r.battle,s=state(r);for(const k of ['weak','vulnerable'])if(s.statuses.self[k]&&s.statuses.self[k+'Until']<=b.turn){s.statuses.self[k]=0;s.statuses.self[k+'Until']=0;}}
 function enemyDamage(r,n){const b=r.battle,s=state(r),original=n;if(n>0){if(s.statuses.enemy.weak){n-=2;s.statuses.enemy.weak--;if(!s.statuses.enemy.weak)s.statuses.enemy.weakUntil=0;}if(s.statuses.self.vulnerable){n+=2;s.statuses.self.vulnerable--;if(!s.statuses.self.vulnerable)s.statuses.self.vulnerableUntil=0;}}return {original,afterStatus:Math.max(0,n),defense:b.defense||0,amount:Math.max(0,n-(b.defense||0))};}
 function afterEnemyHit(r,hpBefore,attacked,deps){const b=r.battle,s=state(r);if(r.hp<hpBefore)checkLastEmber(r,deps);if(attacked&&r.hp>0&&s.statuses.thorns&&b.hp>0)fixed(r,s.statuses.thorns,'Thorns',deps);}
 function afterEnemy(r,hpBefore){const b=r.battle,s=state(r);s.lostHpLastEnemyTurn=r.hp<hpBefore;for(const k of ['weak','vulnerable'])if(s.statuses.enemy[k+'Until']<=b.turn){s.statuses.enemy[k]=0;s.statuses.enemy[k+'Until']=0;}if(s.statuses.thornsUntil<=b.turn){s.statuses.thorns=0;s.statuses.thornsUntil=0;}}
 function valid(r,cardOK,deps){const b=r.battle;if(!b)return true;const s=b.cardCombat;if(s===undefined)return !b.cardChoice&&!b.active?.length&&!b.resolving?.length;
  if(!s||s.version!==1||!integer(s.seq)||s.seq>100000||!s.stats||!['strength','agility','defense'].every(k=>integer(s.stats[k]))||!integer(s.carry)||s.carry>5||typeof s.lostHpLastEnemyTurn!=='boolean'||!s.counters||Array.isArray(s.counters)||!Array.isArray(s.queue)||s.queue.length>60||!Array.isArray(s.receipts)||s.receipts.length>64||!Array.isArray(b.active)||!b.active.every(c=>cardOK(c)&&passiveIds.has(c.key))||new Set(b.active.map(c=>c.key)).size!==b.active.length||!Array.isArray(b.resolving)||b.resolving.length>1||!b.resolving.every(c=>cardOK(c)&&get(c))||!integer(b.defense)||b.defense!==s.stats.defense||!integer(b.enemyDefense)||b.enemyDefense>10000)return false;
  const active=b.active.map(c=>c.key);if(Object.keys(s.counters).length!==active.length||Object.keys(s.counters).some(k=>!active.includes(k)))return false;
  const expected={strength:0,agility:0,defense:0};
  for(const key of active){const c=s.counters[key],name=catalog[key].name;if(!c||!integer(c.activatedTurn)||c.activatedTurn<1||c.activatedTurn>b.turn||!integer(c.count)||c.count>100000||!integer(c.triggers)||c.triggers>100000||!integer(c.lastTurn)||c.lastTurn>b.turn||(c.lastTurn&&c.lastTurn<c.activatedTurn))return false;
   if(['Growing Flame','Battle Rhythm'].includes(name)){if(c.triggers!==Math.min(limit(name,'max_triggers_per_combat'),Math.floor(c.count/limit(name,'every_n_cards')))||c.lastTurn!==0)return false;expected[name==='Growing Flame'?'strength':'agility']+=c.triggers;}
   else if(c.count!==0)return false;
   if(['Blazing Spirit','Swift Step','Rune Armor'].includes(name)){if(c.triggers!==1||c.lastTurn!==0)return false;expected[name==='Blazing Spirit'?'strength':name==='Swift Step'?'agility':'defense']+=base(name,name==='Blazing Spirit'?'strength':name==='Swift Step'?'agility':'defense');}
   if(name==='Lasting Shield'&&(c.triggers||c.lastTurn))return false;
   if(['Grimoire Ward','Ember Core','Clear Mind'].includes(name)&&(c.triggers>b.turn-c.activatedTurn+(name==='Clear Mind'?0:1)||!!c.triggers!==!!c.lastTurn||(name==='Clear Mind'&&c.lastTurn&&c.lastTurn<=c.activatedTurn)))return false;
   if(name==='Last Ember'&&(c.triggers>1||!!c.triggers!==!!c.lastTurn))return false;
  }
  if(['strength','agility','defense'].some(k=>s.stats[k]!==expected[k]))return false;
  if(!b.artifacts&&['strength','agility'].some(k=>b[k]!==s.stats[k]+(b.mysteryModifiers?.[k]||0)))return false;
  const status=s.statuses;if(!status||!integer(status.thorns)||status.thorns>120||!integer(status.thornsUntil)||status.thornsUntil>b.turn||!!status.thorns!==!!status.thornsUntil)return false;
  for(const who of ['self','enemy']){const st=status[who];if(!st||!['weak','vulnerable'].every(k=>integer(st[k])&&st[k]<=3&&integer(st[k+'Until'])&&st[k+'Until']<=b.turn+(who==='self'?1:0)&&!!st[k]===!!st[k+'Until']))return false;}
  for(const q of s.queue){if(!q||q.turn!==b.turn+1||!integer(q.value)||q.value>1000)return false;if(q.kind==='block'){if(q.source!==names['Layered Shield']||!Number.isSafeInteger(q.agility)||Math.abs(q.agility)>1000||q.value!==Math.max(0,base('Layered Shield','later')+q.agility))return false;}else if(q.kind==='draw'){if(q.source!==names['Next Chapter']||typeof q.focused!=='boolean'||typeof q.upgraded!=='boolean'||q.value!==(base('Next Chapter','laterDraw')+(q.upgraded?deps.C.CARD_UPGRADES.skill:0)+(q.focused?catalog[names['Next Chapter']].values.laterDraw.focus_bonus:0)))return false;}else return false;}
  let previous=0;for(const tx of s.receipts){const d=tx&&catalog[tx.key];if(!d||typeof tx.id!=='string'||!/^card:\d+$/.test(tx.id)||!integer(Number(tx.id.slice(5)))||Number(tx.id.slice(5))<=previous||Number(tx.id.slice(5))>s.seq||!r.deck.some(c=>c.uid===tx.uid&&c.key===tx.key&&c.upgraded===tx.upgraded)||!integer(tx.turn)||tx.turn<1||tx.turn>b.turn||!integer(tx.energyBefore)||tx.energyBefore>deps.A.maxEnergy({...r,battle:{...b,turn:tx.turn}})||!integer(tx.energy)||tx.energy!==(d.energy.kind==='fixed'?Math.max(0,d.energy.amount-(tx.upgraded&&d.category==='passive'?deps.C.CARD_UPGRADES.passive:0)):tx.energyBefore)||tx.energy>tx.energyBefore||!integer(tx.focus)||tx.focus>1||typeof tx.focused!=='boolean'||tx.focus!==Number(tx.focused)||(!d.focus_eligible&&tx.focused)||!['resolved','choice'].includes(tx.status)||!['rngBefore','rngAfter'].every(k=>integer(tx[k])&&tx[k]<=4294967295)||!integer(tx.discarded)||tx.discarded>60||!integer(tx.exhausted)||tx.exhausted>1||!Array.isArray(tx.randomTargets)||tx.randomTargets.length>3||tx.randomTargets.some(id=>id!==b.enemyId)||!tx.context||!tx.values||!Array.isArray(tx.damageEvents)||tx.damageEvents.length>3||tx.damageEvents.some(event=>!event||event.target!==b.enemyId||!['vulnerable','weak','sealed','pierce','random'].every(k=>typeof event[k]==='boolean')||!['beforeDefense','defense','afterDefense','afterSeal','absorbed','hpBefore','hpAfter','hpLost'].every(k=>integer(event[k]))||event.hpBefore-event.hpAfter!==event.hpLost))return false;previous=Number(tx.id.slice(5));if(typeof tx.upgraded!=='boolean'||tx.context.upgraded!==tx.upgraded||tx.context.upgradeAmount!==(tx.upgraded&&d.category!=='passive'?deps.C.CARD_UPGRADES[d.category]:0)||tx.context.upgradeCostReduction!==(tx.upgraded&&d.category==='passive'?deps.C.CARD_UPGRADES.passive:0))return false;const computed=compute(d,tx.context,tx.focused);if(JSON.stringify(tx.values)!==JSON.stringify(computed.values))return false;}
  if(s.receipts.length&&previous!==s.seq)return false;
  const ch=b.cardChoice;if(!ch)return !b.resolving.length&&!s.receipts.some(tx=>tx.status==='choice');
  if(!ch||r.scene!=='battle'||typeof ch.committed!=='boolean'||typeof ch.id!=='string'||!Array.isArray(ch.candidates)||!ch.candidates.every(cardOK)||!Array.isArray(ch.options)||new Set(ch.options).size!==ch.options.length||!['recall','card_search','read_ahead','clear_choice','burning_page'].includes(ch.kind))return false;
  const source=(ch.committed?b.resolving:b.hand).find(c=>c.uid===ch.sourceUid),d=get(source);if(!source||!d)return false;
  if(!ch.committed){if(b.resolving.length||ch.id!=='pick:'+(s.seq+1)+':'+source.uid||!['recall','card_search'].includes(ch.kind))return false;if(ch.kind==='recall')return d.name==='Recall'&&ch.candidates.length>0&&JSON.stringify(ch.candidates)===JSON.stringify(b.discard)&&JSON.stringify(ch.options)===JSON.stringify(b.discard.map(c=>c.uid));return d.name==='Card Search'&&!ch.candidates.length&&JSON.stringify(ch.options)===JSON.stringify(categories);}
  const tx=s.receipts.at(-1);if(!tx||tx.status!=='choice'||tx.id!==ch.id||tx.uid!==source.uid||b.resolving.length!==1||s.receipts.some(x=>x!==tx&&x.status==='choice')||!ch.candidates.length||new Set(ch.candidates.map(c=>c.uid)).size!==ch.candidates.length)return false;
  if(ch.kind==='burning_page')return d.name==='Burning Page'&&ch.candidates.length===1&&JSON.stringify(ch.options)===JSON.stringify(['take','replace'])&&integer(ch.replacementsRemaining)&&ch.replacementsRemaining>0&&integer(ch.replacementsUsed)&&ch.replacementsRemaining+ch.replacementsUsed===tx.values.replace&&integer(ch.windowRemaining)&&ch.windowRemaining>0&&ch.windowRemaining===b.draw.length;
  return ((ch.kind==='read_ahead'&&d.name==='Read Ahead')||(ch.kind==='clear_choice'&&d.name==='Clear Choice'))&&ch.candidates.length>=2&&ch.candidates.length<=tx.values.look&&JSON.stringify(ch.options)===JSON.stringify(ch.candidates.map(c=>c.uid));
 }
 const api={catalog,get,initial,setup,plan,displayPlan,error,commit,choose,cancel,afterResolved,resetBlock,startTurn,drawPhase,beforeEnemy,enemyDamage,afterEnemyHit,afterEnemy,valid,checkLastEmber,categoryRole};
 if(typeof module!=='undefined')module.exports=api;else root.DCCardCombat=api;
})(typeof window!=='undefined'?window:globalThis);
