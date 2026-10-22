(function(root){'use strict';
 const C=typeof module!=='undefined'?require('./config.js'):root.DCConfig;
 const A=typeof module!=='undefined'?require('./artifacts.js'):root.DCArtifacts;
 const Q=typeof module!=='undefined'?require('./education.js'):root.DCEducation;
 const R=typeof module!=='undefined'?require('./rich-text.js'):root.DCRichText;
 const data=typeof module!=='undefined'?require('./mystery-data.js'):root.DCMysteryData;
 const catalog=Object.fromEntries(data.events.map(e=>[e.id,e]));
 const category={Attack:'attack',Defend:'guard',Skill:'tactic',Passive:'passive'};
 const tiers={STARTING:'starting',ELITE_MYSTERY:'elite_mystery'};
 const integer=n=>Number.isSafeInteger(n)&&n>=0,copy=x=>JSON.parse(JSON.stringify(x));
 const nodeId=r=>r.route?.active||r.stage+':'+r.depth;
 function ensure(r){return r.mysteryState||(r.mysteryState={version:2,configVersion:data.packageVersion,eventRng:(r.seed^0x4d595354)>>>0,rewardRng:(r.seed^0x52455744)>>>0,usedEventIds:[],settled:[],pending:null,nextCombat:[],combatSeq:0,hpSacrificed:0});}
 function random(s,key){s[key]=(Math.imul(s[key],1664525)+1013904223)>>>0;return s[key]/4294967296;}
 function choose(s,values){return values[Math.floor(random(s,'rewardRng')*values.length)];}
 function definition(r){return catalog[r.mysteryState?.pending?.eventId]||null;}
 function pending(r){const p=r.mysteryState?.pending;if(r.scene!=='event'||!p||p.committed)throw Error('No Mystery challenge is waiting.');return p;}
 function cardPool(effect,legacy=false){return (legacy?Object.keys(C.cards):C.CARD_POOL||Object.keys(C.cards)).filter(k=>!effect.category||C.cards[k].role===category[effect.category]);}
 function artifactPool(r,effect){return Object.values(A.catalog).filter(a=>effect.tiers.map(t=>tiers[t]).includes(a.tier)&&!A.has(r,a.id)&&A.eligible(r,a));}
 function targets(r,option){
  const e=option.effects.find(e=>['UPGRADE_CARD','REMOVE_CARD','TRANSFORM_CARD','CONSUME_ARTIFACT','CHOOSE_CARD_REWARD'].includes(e.type));
  if(!e)return [];
  if(e.type==='CONSUME_ARTIFACT')return A.owned(r).filter(a=>a.tier===tiers[e.tier]).map(a=>a.id);
  if(e.type==='CHOOSE_CARD_REWARD')return cardPool(e);
  return r.deck.filter(c=>!c.protected&&(!e.categories||e.categories.map(x=>category[x]).includes(C.cards[c.key].role))&&
   (e.type!=='UPGRADE_CARD'||!c.upgraded)&&(e.type!=='REMOVE_CARD'||r.deck.length>1)&&
   (e.type!=='TRANSFORM_CARD'||Object.keys(C.cards).some(k=>k!==c.key&&C.cards[k].role===C.cards[c.key].role))).map(c=>c.uid);
 }
 function actionable(r,option){
  for(const c of option.costs)if(!['hp','maxHp','gold'].includes(c.resource)||r[c.resource]-c.amount<c.minimumAfter)return false;
  for(const c of option.requires){
   if(!['HAS_MISSING_HP','HAS_OWNED_ARTIFACT','HAS_UNOWNED_ARTIFACT','HAS_UPGRADABLE_CARD','HAS_CARD_REWARD_CANDIDATE','HAS_TRANSFORMABLE_CARD','HAS_REMOVABLE_CARD'].includes(c.type))return false;
   if(c.type==='HAS_MISSING_HP'&&r.hp>=r.maxHp)return false;
   if(c.type==='HAS_OWNED_ARTIFACT'&&!A.owned(r).some(a=>a.tier===tiers[c.tier]))return false;
   if(c.type==='HAS_UNOWNED_ARTIFACT'&&!artifactPool(r,c).length)return false;
  }
  for(const e of option.effects){
   if(['UPGRADE_CARD','REMOVE_CARD','TRANSFORM_CARD','CONSUME_ARTIFACT','CHOOSE_CARD_REWARD'].includes(e.type)&&!targets(r,option).length)return false;
   if(e.type==='CHOOSE_CARD_REWARD'&&r.deck.length>=60)return false;
   if(e.type==='GRANT_ARTIFACT'&&!artifactPool(r,e).length)return false;
   if(e.type==='HEAL_HP'&&r.hp>=r.maxHp)return false;
  }
  return true;
 }
 function makeOffers(r,event){
  const s=ensure(r),offers={};
  for(const option of event.success.options){const offer=offers[option.id]={};
   for(const e of option.effects){
    if(e.type==='GRANT_ARTIFACT')offer.artifactId=choose(s,artifactPool(r,e).map(a=>a.id))||null;
    if(e.type==='CHOOSE_CARD_REWARD'){const pool=cardPool(e);offer.cards=[];while(pool.length&&offer.cards.length<e.offerCount){const key=choose(s,pool);offer.cards.push(key);pool.splice(pool.indexOf(key),1);}}
    if(e.type==='TRANSFORM_CARD'){offer.transforms={};for(const uid of targets(r,option)){const c=r.deck.find(c=>c.uid===uid);offer.transforms[uid]=choose(s,(C.CARD_POOL||Object.keys(C.cards)).filter(k=>k!==c.key&&C.cards[k].role===C.cards[c.key].role));}}
   }
  }
  return offers;
 }
 function enter(r,seen=[],profile=null){
  if(r.scene!=='event'||r.artifactState?.offer)throw Error('Enter a Mystery room first.');
  const s=ensure(r);if(s.pending)return r;Q.syncMystery(r,seen,profile);
  const candidates=data.events.filter(e=>e.stages.includes(r.stage+1)&&!s.usedEventIds.includes(e.id)&&e.success.options.some(o=>actionable(r,o))&&Q.bank.questions.some(q=>q.topicCode===e.topicCode&&!r.educationState.usedIds.includes(q.id)));
  const event=candidates[Math.floor(random(s,'eventRng')*candidates.length)];
  s.pending={key:r.seed+':'+r.started+':'+r.stage+':'+nodeId(r)+':'+(event?.id||'empty'),stage:r.stage,nodeId:nodeId(r),eventId:event?.id||null,bankVersion:Q.bank.version,phase:event?'intro':'empty',questionId:null,choiceOrder:[],selectedId:null,startedAt:null,deadline:null,outcome:null,offers:event?makeOffers(r,event):{},selectedOption:null,targetId:null,committed:false};
  if(event)s.usedEventIds.push(event.id);return r;
 }
 function start(r,seen=[],profile=null,now=Date.now()){
  const p=pending(r),event=definition(r);if(p.phase!=='intro'||!integer(now))throw Error('This challenge has already started.');
  const result=Q.reserveMystery(r,event,seen,profile),q=result.question;
  if(!q){p.phase='empty';return r;}
  p.phase='question';p.questionId=q.id;p.choiceOrder=q.choices.map(c=>c.id);p.preferred=result.preferred;p.startedAt=now;p.deadline=now+event.timeLimitSeconds*1000;return r;
 }
 function resolve(r,choiceId,now,abandoned=false){
  const p=pending(r);if(p.phase!=='question')throw Error('This challenge has already ended.');
  const q=Q.catalog[p.questionId];if(!integer(now)||now<p.startedAt||(!abandoned&&choiceId!==null&&!p.choiceOrder.includes(choiceId)))throw Error('Choose one of the displayed answers.');
  const outcome=now>=p.deadline?'TIMEOUT':abandoned?'ABANDONED_AFTER_START':choiceId===q.correctChoiceId?'CORRECT':'INCORRECT';
  Q.resolveMystery(r,q.id,['CORRECT','INCORRECT'].includes(outcome)?choiceId:null);
  p.selectedId=['CORRECT','INCORRECT'].includes(outcome)?choiceId:null;p.outcome=outcome;p.phase='review';p.resolvedAt=Math.max(now,p.startedAt);
  if(outcome!=='CORRECT'&&definition(r).failure.effects.some(e=>e.type==='START_COMBAT'))p.encounter={enemyId:choose(ensure(r),C.stages[r.stage].normals),seed:Math.floor(random(ensure(r),'rewardRng')*4294967296)};
  return r;
 }
 function expire(r,now=Date.now()){const p=r.mysteryState?.pending;if(r.scene==='event'&&p?.phase==='question'&&now>=p.deadline)resolve(r,null,now);return r;}
 function selectOption(r,id){const p=pending(r),o=definition(r)?.success.options.find(o=>o.id===id);if(p.phase!=='reward'||!o||!actionable(r,o))throw Error('This reward is not available.');p.selectedOption=id;p.targetId=null;return r;}
 function selectTarget(r,id){const p=pending(r),o=definition(r)?.success.options.find(o=>o.id===p.selectedOption);if(p.phase!=='reward'||!o||!targets(r,o).includes(id)||(p.offers[o.id].cards&&!p.offers[o.id].cards.includes(id)))throw Error('Choose one of the available targets.');p.targetId=id;return r;}
 function acquire(r,id,source){if(!r.artifactState)r.artifactState={version:1,shopOnly:true,rng:(r.seed^0xa741c6e5)>>>0,owned:[],acquired:[],startingId:null,offer:null};A.acquire(r,id,source);}
 function applyEffects(r,effects,offer,target,ctx,source){
  for(const e of effects){
   if(e.type==='ADD_GOLD')r.gold+=e.amount;
   else if(e.type==='HEAL_HP')r.hp=Math.min(r.maxHp,r.hp+e.amount);
   else if(e.type==='DAMAGE_HP')r.hp=Math.max(1,r.hp-e.amount);
   else if(e.type==='UPGRADE_CARD')r.deck.find(c=>c.uid===target).upgraded=true;
   else if(e.type==='TRANSFORM_CARD')Object.assign(r.deck.find(c=>c.uid===target),{key:offer.transforms[target],upgraded:false});
   else if(e.type==='REMOVE_CARD')r.deck.splice(r.deck.findIndex(c=>c.uid===target),1);
   else if(e.type==='CHOOSE_CARD_REWARD')r.deck.push(ctx.card(r,target));
   else if(e.type==='CONSUME_ARTIFACT'){
    const s=r.artifactState,record=s.acquired.find(x=>x.id===target);s.owned.splice(s.owned.indexOf(target),1);s.acquired.splice(s.acquired.indexOf(record),1);(s.consumed||(s.consumed=[])).push({...record,consumedBy:source});r.maxHp=A.maxHp(r);r.hp=Math.min(r.hp,r.maxHp);
   }else if(e.type==='GRANT_ARTIFACT')acquire(r,offer.artifactId,source);
   else if(e.type==='QUEUE_COMBAT_MODIFIER')ensure(r).nextCombat.push({source,stat:e.stat,amount:e.amount,duration:e.duration});
   else if(e.type!=='START_COMBAT')throw Error('Unknown Mystery effect.');
  }
 }
 function finish(r,ctx,status){
  const s=ensure(r),p=pending(r);if(s.settled.some(x=>x.key===p.key))throw Error('This event was already settled.');
  s.settled.push({key:p.key,eventId:p.eventId,questionId:p.questionId,outcome:status,stage:p.stage,nodeId:p.nodeId,optionId:p.selectedOption,targetId:p.targetId});p.committed=true;
  if(p.encounter&&status!=='DECLINED'){
   p.phase='combat';ctx.startBattle(r,p.encounter.enemyId);r.battle.mysteryEncounter={key:p.key,enemyId:p.encounter.enemyId,seed:p.encounter.seed};return r;
  }
  s.pending=null;return ctx.finishNode(r);
 }
 function commit(r,ctx){
  const p=pending(r),e=definition(r),option=e.success.options.find(o=>o.id===p.selectedOption);
  if(p.phase!=='reward'||!option||!actionable(r,option))throw Error('This reward is not available. No payment was taken.');
  const ids=targets(r,option),offer=p.offers[option.id];if(ids.length&&!ids.includes(p.targetId))throw Error('Choose a target before confirming.');
  if(offer.cards&&!offer.cards.includes(p.targetId))throw Error('Choose an offered card.');
  if(offer.artifactId&&!artifactPool(r,option.effects.find(e=>e.type==='GRANT_ARTIFACT')).some(a=>a.id===offer.artifactId))throw Error('This artifact is no longer available. No payment was taken.');
  const before={hp:r.hp,maxHp:r.maxHp,gold:r.gold,cards:r.deck.length};
  for(const cost of option.costs){r[cost.resource]-=cost.amount;if(cost.resource==='maxHp'){ensure(r).hpSacrificed+=cost.amount;r.hp=Math.min(r.hp,r.maxHp);}}
  applyEffects(r,option.effects,offer,p.targetId,ctx,'mystery:'+r.stage+':'+p.nodeId+':'+p.eventId);
  const after={hp:r.hp,maxHp:r.maxHp,gold:r.gold,cards:r.deck.length},results=[];
  for(const [key,unit]of [['hp','HP'],['maxHp','Max HP'],['gold','Gold'],['cards','cards']])if(before[key]!==after[key])results.push(R.delta(unit+' changed',unit,before[key],after[key],[e.name,option.label,'Before: '+before[key]+' '+unit,'After all costs and rewards: '+after[key]+' '+unit]));
  R.record(r,e.name,[],results);return finish(r,ctx,'CORRECT');
 }
 function proceed(r,ctx){
  const p=pending(r),e=definition(r);if(p.phase==='empty')return finish(r,ctx,'EMPTY');
  if(p.phase!=='review')throw Error('Review the answer first.');
  if(p.outcome!=='CORRECT'){const hp=r.hp;applyEffects(r,e.failure.effects,{},null,ctx,'mystery:'+r.stage+':'+p.nodeId+':'+p.eventId);if(r.hp!==hp)R.record(r,e.name,[],[R.delta('HP lost','HP',hp,r.hp,['Outside combat: Block and Defense do not apply.','Nonlethal penalty: HP stays at least 1.','HP after: '+r.hp])]);return finish(r,ctx,p.outcome);}
  p.phase='reward';if(e.success.mode==='AUTOMATIC'){p.selectedOption=e.success.options[0].id;return commit(r,ctx);}return r;
 }
 function leave(r,ctx,now=Date.now()){
  const p=pending(r);if(p.phase==='question')return resolve(r,null,now,true);
  if(['review','reward'].includes(p.phase)&&!(p.outcome==='CORRECT'&&definition(r).success.mayDecline))throw Error('Continue after reviewing the answer.');
  return finish(r,ctx,'DECLINED');
 }
 function combatStart(r){const s=r.mysteryState;if(!s)return;const mods=s.nextCombat.splice(0);r.battle.mysteryModifiers={combatId:++s.combatSeq,strength:0,agility:0,draw:0,energy:0};
  const m=r.battle.mysteryModifiers;for(const e of mods)m[e.stat.toLowerCase()]+=e.amount;
  r.battle.strength=(r.battle.strength||0)+m.strength;r.battle.agility=(r.battle.agility||0)+m.agility;
 }
 function firstTurn(r,ctx){const b=r.battle,m=b.mysteryModifiers;if(!m||b.turn!==1)return;
  if(m.draw){const before=b.hand.length;ctx.draw(r,m.draw);R.record(r,'Hourglass opening draw',[],[R.delta('Cards drawn','cards',before,b.hand.length,['Requested: '+m.draw+' extra cards','Hand limit: '+C.HAND_LIMIT,'Actual drawn: '+(b.hand.length-before)])]);}
  if(m.energy){const before=b.energy;b.energy=Math.max(0,b.energy+m.energy);if(b.artifacts)b.artifacts.turn.energyBudget+=b.energy-before;R.record(r,'Hourglass opening Energy',[],[R.delta('Energy changed','Energy',before,b.energy,['First turn only: '+m.energy+' Energy','Energy after: max(0, '+before+' + '+m.energy+') = '+b.energy])]);}
 }
 function valid(r){
  const s=r.mysteryState;if(s===undefined)return true;
  if(!s||s.version!==2||s.configVersion!==data.packageVersion||!['eventRng','rewardRng'].every(k=>integer(s[k])&&s[k]<=4294967295)||!integer(s.combatSeq)||!integer(s.hpSacrificed)||s.hpSacrificed>5||!Array.isArray(s.usedEventIds)||new Set(s.usedEventIds).size!==s.usedEventIds.length||s.usedEventIds.some(id=>!catalog[id])||!Array.isArray(s.settled)||s.settled.length>25||new Set(s.settled.map(x=>x.key)).size!==s.settled.length||!Array.isArray(s.nextCombat)||s.nextCombat.some(x=>!['STRENGTH','AGILITY','DRAW','ENERGY'].includes(x.stat)||!Number.isInteger(x.amount)||Math.abs(x.amount)>2||!['NEXT_COMBAT','NEXT_COMBAT_FIRST_TURN'].includes(x.duration)))return false;
  const b=r.battle,m=b?.mysteryModifiers;if(m&&(!integer(m.combatId)||m.combatId>s.combatSeq||!['strength','agility','draw','energy'].every(k=>Number.isInteger(m[k])&&Math.abs(m[k])<=30)))return false;
  const p=s.pending;if(!p)return r.scene!=='event'||!!r.artifactState?.offer;
  if(!p||p.stage!==r.stage||p.nodeId!==nodeId(r)||typeof p.key!=='string'||p.key.length>150||p.bankVersion!==Q.bank.version||!['intro','empty','question','review','reward','combat'].includes(p.phase)||typeof p.committed!=='boolean'||!Array.isArray(p.choiceOrder))return false;
  if(p.phase==='combat')return p.committed&&s.settled.some(x=>x.key===p.key)&&!!p.encounter&&b?.mysteryEncounter?.key===p.key&&b.enemyId===p.encounter.enemyId&&C.stages[r.stage].normals.includes(b.enemyId)&&!b.elite&&['battle','reward','defeat'].includes(r.scene);
  if(r.scene!=='event'||p.committed||s.settled.some(x=>x.key===p.key))return false;
  if(p.phase==='empty')return p.questionId===null&&p.choiceOrder.length===0;
  const event=catalog[p.eventId];if(!event||!s.usedEventIds.includes(p.eventId)||!event.stages.includes(r.stage+1)||!p.offers||Object.keys(p.offers).length!==event.success.options.length)return false;
  if(p.selectedOption!==null&&!event.success.options.some(o=>o.id===p.selectedOption))return false;
  if(p.targetId!==null){const option=event.success.options.find(o=>o.id===p.selectedOption);if(!option||!targets(r,option).includes(p.targetId)||(p.offers[option.id].cards&&!p.offers[option.id].cards.includes(p.targetId)))return false;}
  for(const o of event.success.options){const offer=p.offers[o.id];if(!offer||typeof offer!=='object'||Array.isArray(offer))return false;
   const cardEffect=o.effects.find(e=>e.type==='CHOOSE_CARD_REWARD'),artifactEffect=o.effects.find(e=>e.type==='GRANT_ARTIFACT'),transform=o.effects.some(e=>e.type==='TRANSFORM_CARD');
   if(cardEffect){const pool=cardPool(cardEffect,true);if(!Array.isArray(offer.cards)||offer.cards.length!==Math.min(cardEffect.offerCount,pool.length)||new Set(offer.cards).size!==offer.cards.length||offer.cards.some(k=>!pool.includes(k)))return false;}
   else if(offer.cards!==undefined)return false;
   if(artifactEffect){if(!Object.hasOwn(offer,'artifactId'))return false;const pool=artifactPool(r,artifactEffect);if(offer.artifactId===null?pool.length>0:!pool.some(a=>a.id===offer.artifactId))return false;}
   else if(offer.artifactId!==undefined)return false;
   if(transform){if(!offer.transforms||typeof offer.transforms!=='object'||Array.isArray(offer.transforms)||Object.keys(offer.transforms).length!==targets(r,o).length)return false;for(const uid of targets(r,o)){const key=offer.transforms[uid],c=r.deck.find(c=>c.uid===uid);if(!c||!C.cards[key]||key===c.key||C.cards[key].role!==C.cards[c.key].role)return false;}}
   else if(offer.transforms!==undefined)return false;
  }
  if(p.phase==='intro')return p.questionId===null&&p.deadline===null;
  const q=Q.catalog[p.questionId],rec=r.educationState?.session?.records[p.questionId];
  if(!q||q.topicCode!==event.topicCode||!r.educationState.usedIds.includes(q.id)||JSON.stringify(p.choiceOrder)!==JSON.stringify(q.choices.map(c=>c.id))||!integer(p.startedAt)||p.deadline!==p.startedAt+event.timeLimitSeconds*1000||!rec)return false;
  if(p.phase==='question')return p.outcome===null&&p.selectedId===null&&rec.status==='pending'&&rec.attempts.length===0;
  if(!['CORRECT','INCORRECT','TIMEOUT','ABANDONED_AFTER_START'].includes(p.outcome)||!integer(p.resolvedAt)||p.resolvedAt<p.startedAt)return false;
  if(p.outcome==='CORRECT')return p.resolvedAt<p.deadline&&p.selectedId===q.correctChoiceId&&rec.status==='correct'&&rec.attempts.length===1;
  if(p.outcome==='INCORRECT'&&(!p.choiceOrder.includes(p.selectedId)||p.selectedId===q.correctChoiceId||p.resolvedAt>=p.deadline||rec.attempts.length!==1))return false;
  return p.phase==='review'&&rec.status==='revealed'&&(p.outcome!=='TIMEOUT'||p.resolvedAt>=p.deadline);
 }
 const api={data,catalog,category,ensure,definition,pending,targets,actionable,enter,start,resolve,expire,selectOption,selectTarget,commit,proceed,leave,combatStart,firstTurn,valid};
 if(typeof module!=='undefined')module.exports=api;else root.DCMystery=api;
})(typeof window!=='undefined'?window:globalThis);
