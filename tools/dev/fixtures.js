/* Development-only fixtures. Rules and renderers remain owned by dist/. */
(function(root,factory){
 const api=typeof module!=='undefined'?factory(require('../../dist/engine.js'),require('../../dist/config.js'),require('../../dist/mystery.js'),require('../../dist/map.js')):factory(root.DCEngine,root.DCConfig,root.DCMystery,root.DCMap);
 if(typeof module!=='undefined')module.exports=api;else root.STMDevFixtures=api;
})(globalThis,function(E,C,X,G){
 'use strict';
 const copy=x=>JSON.parse(JSON.stringify(x));
 function integer(v,min,max,label){const n=Number(v);if(!Number.isSafeInteger(n)||n<min||n>max)throw Error(label+' must be an integer from '+min+' to '+max+'.');return n;}
 function room(r,type){
  r.route=G.begin(r.stage,r.seed,2);const nodes=G.get(r).nodes,target=nodes.find(n=>n.type===type);
  if(!target)throw Error('Room unavailable.');
  function pathTo(n){if(n.depth===0)return [];for(const p of nodes.filter(p=>p.next.includes(n.id))){const path=pathTo(p);if(path)return [...path,p.id];}return null;}
  r.depth=target.depth;r.route.path=pathTo(target);r.route.active=null;E.enterNode(r,target.id);return r;
 }
 function create(o={}){
  const seed=integer(o.seed??7,0,4294967295,'Seed'),r=E.newRun(seed,o.mode==='challenge'?'challenge':'learn');
  // Standalone fixtures use the engine's supported original route format.
  delete r.route;delete r.artifactState;r.scene='map';r.stage=integer(o.stage??0,0,1,'Stage');
  r.started=o.started===undefined?Date.now():integer(o.started,0,8640000000000000,'Start time');r.hp=integer(o.hp??C.MAX_HP,1,C.MAX_HP,'Player HP');r.gold=integer(o.gold??500,0,100000,'Gold');
  if(o.deck?.length){if(o.deck.length>60)throw Error('Maximum deck size is 60.');r.deck=o.deck.map(c=>{const key=typeof c==='string'?c:c.key;if(!Object.hasOwn(C.cards,key))throw Error('Unknown card: '+key);return E.card(r,key,!!c.upgraded);});}
  if(o.artifacts?.length){if(!Array.isArray(o.artifacts)||o.artifacts.length>31)throw Error('Choose at most 31 artifacts.');const A=typeof module!=='undefined'?require('../../dist/artifacts.js'):globalThis.DCArtifacts;r.artifactState={version:1,shopOnly:true,rng:(seed^0xa741c6e5)>>>0,owned:[],acquired:[],startingId:null,offer:null};for(const [i,id] of [...new Set(o.artifacts)].entries())A.acquire(r,id,'shop:'+r.stage+':dev:'+i);r.hp=Math.min(r.hp,r.maxHp);}
  const requested=o.kind||'combat',kind=['reward','victory','defeat'].includes(requested)?'combat':requested;
  if(requested==='victory')r.stage=1;
  if(kind==='combat'){
   const enemy=requested==='victory'?C.stages[1].boss:requested==='reward'?C.stages[r.stage].basic:o.enemy||C.stages[r.stage].basic;if(!C.enemies[enemy])throw Error('Unknown enemy.');
   E.startBattle(r,enemy,!!o.elite);
   if(o.enemyHp!==undefined&&o.enemyHp!=='')r.battle.hp=r.battle.maxHp=integer(o.enemyHp,1,100000,'Enemy HP');
   if(o.energy!==undefined)r.battle.energy=integer(o.energy,0,C.ENERGY,'Energy');
   r.battle.focus=integer(o.focus??0,0,C.FOCUS_CAP,'Focus');r.battle.boostArmed=!!o.focused&&r.battle.focus>0;
   if(o.intent!==undefined&&o.intent!==''){
    const p=C.enemies[enemy].patterns[integer(o.intent,0,C.enemies[enemy].patterns.length-1,'Intent')];
    r.battle.currentIntent={...p,damage:Math.ceil((p.damage+(o.elite?2:0))*(r.mode==='learn'?.7:1)),rage:0};r.battle.enemyBlock=p.block||0;
   }
   if(o.card){const pool=[...r.battle.hand,...r.battle.draw],index=pool.findIndex(c=>c.key===o.card);if(index<0)throw Error('Test card must be in the deck.');const c=pool.splice(index,1)[0];r.battle.hand=[c,...pool.splice(0,C.HAND-1)];r.battle.draw=pool;}
  }else if(kind==='shop')room(r,'shop');
  else if(kind==='rest'){r.depth=2;r.scene='camp';}
  else if(kind==='event'){
   r.depth=3;r.scene='event';const event=X.catalog[o.event];if(!event)throw Error('Choose a Mystery event.');
   if(!event.stages.includes(r.stage+1))throw Error('This event does not support the selected stage.');
   // Force appearance only. Choice costs/eligibility still use the actual rules.
   X.ensure(r).usedEventIds=Object.keys(X.catalog).filter(id=>id!==event.id);E.openMystery(r);
   if(r.mysteryState.pending.eventId!==event.id)throw Error('Event has no eligible options for this setup. Lower HP, add Gold or choose another event.');
  }else if(kind==='master'){
   if(r.stage!==0)throw Error('The opening Dungeon Master is in Stage 1.');
   const fresh=E.newRun(seed,'challenge');Object.assign(r,fresh);r.started=o.started===undefined?Date.now():integer(o.started,0,8640000000000000,'Start time');
  }else if(kind==='map'){r.route=G.begin(r.stage,r.seed,3);}
  else throw Error('Unknown scene.');
  if(['reward','victory','defeat'].includes(requested))forceResult(r,requested==='defeat'?'lose':'win');
  if(o.visit!==undefined){const visit=integer(o.visit,1,4,'Voice visit');r.audioPresentation={version:1,visits:{dungeonMaster:visit-1,merchant:visit-1},encounters:{}};}
  if(!E.validate(r))throw Error('The engine rejected this setup. No session was changed.');return r;
 }
 function forceResult(r,result){
  if(r.scene!=='battle'||r.battle.cardChoice||r.battle.question)throw Error('Finish any pending choice before forcing a result.');
  if(result==='lose'){r.hp=0;r.scene='defeat';r.finished=Math.max(r.started,Date.now());}
  else{r.battle.hp=0;r.battle.seals=C.enemies[r.battle.enemyId].seals?.length||0;if(C.enemies[r.battle.enemyId].boss){r.depth=4;r.scene=r.stage===1?'victory':'stageclear';r.finished=Math.max(r.started,Date.now());}else{r.scene='reward';r.rewards=E.shuffle(r,(C.CARD_POOL||Object.keys(C.cards)).slice()).slice(0,3);}}
  if(!E.validate(r))throw Error('Forced result was rejected by the engine.');return r;
 }
 function cardSetup(id,upgraded=false,focused=false,extra={}){
  if(!Object.hasOwn(C.cards,id))throw Error('Unknown card.');
  return create({...extra,kind:'combat',deck:[{key:id,upgraded},...Array.from({length:11},()=>({key:'strike',upgraded:false}))],card:id,focus:focused?3:0,focused});
 }
 function mapReady(source){
  const r=copy(source);
  if(r.scene==='education'||r.artifactState?.offer||r.battle?.question||r.battle?.cardChoice||r.mysteryState?.pending?.phase==='question')throw Error('Finish the pending question or card/artifact choice before teleporting.');
  r.scene='map';r.battle=null;r.shop=null;r.rewards=[];r.checkpoint=null;delete r.finished;
  if(r.mysteryState){r.mysteryState.pending=null;r.mysteryState.nextCombat=[];}
  if(r.hp===0)r.hp=r.maxHp;
  if(r.route)r.route.active=null;
  if(!E.validate(r))throw Error('Cannot return this preview to the map.');return r;
 }
 function mapNodes(source,stage){const r=copy(source);r.stage=integer(stage,0,1,'Stage');if(!r.route||source.stage!==r.stage)r.route=G.begin(r.stage,r.seed,3);return G.get(r).nodes;}
 function teleport(source,stage,id){
  const r=mapReady(source);stage=integer(stage,0,1,'Stage');if(!r.route||r.stage!==stage)r.route=G.begin(stage,r.seed,3);r.stage=stage;
  const nodes=G.get(r).nodes,target=nodes.find(n=>n.id===id);if(!target)throw Error('Unknown map node.');
  function before(n){if(n.depth===0)return [];for(const p of nodes.filter(p=>p.next.includes(n.id))){const prefix=before(p);if(prefix)return [...prefix,p.id];}return null;}
  const prefix=before(target);if(!prefix)throw Error('No valid map prefix for this node.');
  r.depth=target.depth;r.route.path=prefix;r.route.active=null;E.enterNode(r,id);
  if(!E.validate(r))throw Error('Teleport was rejected; preview is unchanged.');return r;
 }
 function addCards(source,id,count=1,upgraded=false,destination='draw'){
  if(!Object.hasOwn(C.cards,id))throw Error('Unknown card.');count=integer(count,1,60,'Card count');if(!['draw','hand'].includes(destination))throw Error('Choose Draw pile or Hand.');
  const r=copy(source);if(r.deck.length+count>60)throw Error('Keep the deck at or below 60 cards.');if(r.battle?.question||r.battle?.cardChoice||r.scene==='education'||r.artifactState?.offer||r.mysteryState?.pending?.phase==='question')throw Error('Finish the pending question or choice before adding cards.');
  if(r.scene==='battle'&&destination==='hand'&&r.battle.hand.length+count>C.HAND_LIMIT)throw Error('Not enough space in Hand; choose Draw pile or add fewer cards.');
  for(let i=0;i<count;i++){const c=E.card(r,id,!!upgraded);r.deck.push(c);if(r.scene==='battle')r.battle[destination].push(copy(c));}
  if(!E.validate(r))throw Error('Card addition was rejected; preview is unchanged.');return r;
 }
 function eventSetup(id,options={}){
  const e=X.catalog[id];if(!e)throw Error('Unknown Mystery event.');const A=typeof module!=='undefined'?require('../../dist/artifacts.js'):globalThis.DCArtifacts;
  const starting=Object.values(A.catalog).find(a=>a.tier==='starting').id;
  const setup={...options,kind:'event',event:id,stage:e.stages.includes(Number(options.stage)+1)?Number(options.stage):e.stages[0]-1,hp:20,gold:500,artifacts:[starting],deck:[]};return create(setup);
 }
 function questionSetup(id,consumer='predict',options={}){
  const Q=typeof module!=='undefined'?require('../../dist/education.js'):globalThis.DCEducation,q=Q.catalog[id];if(!q)throw Error('Unknown question ID.');
  if(!['predict','artifact','mystery'].includes(consumer))throw Error('Unknown question preview context.');
  const original=Q.bank.questions;let r;
  try{Q.bank.questions=[q];
   if(consumer==='predict'){r=create({...options,kind:'combat'});E.forecast(r);}
   else if(consumer==='artifact'){r=create({...options,kind:'master',stage:0});E.chooseArtifact(r,E.artifactChoices(r)[0].id);}
   else{const event=Object.values(X.catalog).find(e=>e.topicCode===q.topicCode);if(!event)throw Error('No event uses this topic.');r=eventSetup(event.id,options);E.startMystery(r,[],null,Date.now());}
  }finally{Q.bank.questions=original;}
  const chosen=consumer==='predict'?r.battle.question.questionId:consumer==='artifact'?r.educationState.pending.questionId:r.mysteryState.pending.questionId;
  if(chosen!==id||!E.validate(r))throw Error('The engine rejected this question preview.');return r;
 }
 function setStatus(source,who,status,value,duration='native'){
  const r=copy(source);if(r.scene!=='battle'||r.battle.question||r.battle.cardChoice)throw Error('Open combat and finish pending questions/choices first.');if(!['player','enemy'].includes(who))throw Error('Choose Player or Enemy.');value=integer(value,0,10000,'Status value');
  const b=r.battle,s=b.cardCombat?.statuses;if(!s)throw Error('Card status engine is unavailable.');
  if(['weak','vulnerable'].includes(status)){
   if(value>3)throw Error('Weak and Vulnerable allow at most 3 stacks.');if(!['native','current'].includes(duration))throw Error('Use the native expiry or current turn.');
   const target=s[who==='player'?'self':'enemy'];target[status]=value;target[status+'Until']=value?b.turn+(who==='player'&&duration==='native'?1:0):0;
  }else{if(duration!=='native')throw Error('This status uses its native lifetime.');
   if(status==='block')b[who==='player'?'block':'enemyBlock']=value;
   else if(status==='thorns'&&who==='player'){const data=typeof module!=='undefined'?require('../../dist/card-data.js'):globalThis.STMCardData;if(value>(data.rules.thorns_cap??120))throw Error('Thorns exceeds the native cap.');s.thorns=value;s.thornsUntil=value?b.turn:0;}
   else if(status==='defense'&&who==='enemy')b.enemyDefense=value;
   else if(['strength','agility'].includes(status)&&who==='player'){
    if(value>30)throw Error('Strength/Agility debug modifiers allow at most 30.');const state=X.ensure(r);b.mysteryModifiers||={combatId:++state.combatSeq,strength:0,agility:0,draw:0,energy:0};const before=b.mysteryModifiers[status];b.mysteryModifiers[status]=value;b[status]+=value-before;
   }else throw Error('This target/status combination is not supported.');
  }
  if(!E.validate(r))throw Error('Status change was rejected; preview is unchanged.');return r;
 }
 function scenario(id,options={}){
  if(!['lowHp','fullHand','emptyDraw','threePassives'].includes(id))throw Error('Unknown built-in scenario.');
  const data=typeof module!=='undefined'?require('../../dist/card-data.js'):globalThis.STMCardData;
  const passives=data.cards.filter(c=>c.category==='passive').slice(0,3).map(c=>c.id),deck=id==='threePassives'?[...passives,...Array(9).fill('strike')]:[];
  const r=create({...options,kind:'combat',hp:id==='lowHp'?1:options.hp,deck});
  if(id==='fullHand'){while(r.battle.hand.length<C.HAND_LIMIT&&r.battle.draw.length)r.battle.hand.push(r.battle.draw.shift());if(r.battle.hand.length!==C.HAND_LIMIT)throw Error('Not enough cards to fill the Hand.');}
  if(id==='emptyDraw')r.battle.discard.push(...r.battle.draw.splice(0));
  if(id==='threePassives')for(const key of passives){const b=r.battle;let c=b.hand.find(c=>c.key===key);if(!c){const i=b.draw.findIndex(c=>c.key===key);c=b.draw.splice(i,1)[0];if(b.hand.length>=C.HAND_LIMIT)b.discard.push(b.hand.shift());b.hand.push(c);}b.energy=C.ENERGY;E.playCard(r,c.uid);}
  if(!E.validate(r))throw Error('Built-in scenario rejected.');return r;
 }
 function restorePlayerSave(text){if(typeof text!=='string'||text.length>2000000)throw Error('Choose a JSON player save under 2 MB.');let next;try{next=E.restore(JSON.parse(text));}catch{}if(!next||!E.validate(next))throw Error('Invalid player save or different balance profile. Open Dev from the same player profile.');return next;}
 function validatePreset(p){if(!p||p.version!==1||typeof p.name!=='string'||!p.name.trim()||p.name.length>80||!p.setup||typeof p.setup!=='object')throw Error('Invalid preset format.');create(p.setup);return copy(p);}
 return {create,forceResult,cardSetup,validatePreset,copy,mapReady,mapNodes,teleport,addCards,eventSetup,questionSetup,setStatus,scenario,restorePlayerSave};
});
