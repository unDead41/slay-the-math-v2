(function(root){'use strict';
const C=typeof module!=='undefined'?require('./config.js'):root.DCConfig,M=typeof module!=='undefined'?require('./math.js'):root.DCMath,G=typeof module!=='undefined'?require('./map.js'):root.DCMap,A=typeof module!=='undefined'?require('./artifacts.js'):root.DCArtifacts,Q=typeof module!=='undefined'?require('./education.js'):root.DCEducation,R=typeof module!=='undefined'?require('./rich-text.js'):root.DCRichText;
const clone=x=>JSON.parse(JSON.stringify(x));
const X=typeof module!=='undefined'?require('./mystery.js'):root.DCMystery;
const CC=typeof module!=='undefined'?require('./card-combat.js'):root.DCCardCombat;
const P=typeof module!=='undefined'?require('./combat-predict.js'):root.DCCombatPredict;
const Log=typeof module!=='undefined'?require('./combat-log.js'):root.DCCombatLog;
const artifactContext={draw,deal,notify};
const mysteryContext={card,draw,startBattle,finishNode};
const cardContext={C,A,R,draw,deal,rng,shuffle,notify,win,artifactContext};
function cardAction(r,fn){if(!validate(r))throw Error('This card action cannot start from an invalid save. Your progress is unchanged.');const next=clone(r);fn(next);if(!validate(next))throw Error('This card action could not be saved. Your progress is unchanged.');for(const key of Object.keys(r))delete r[key];Object.assign(r,next);return r;}
function cardPlan(r,c){if(typeof c==='string')c=r?.battle?.hand.find(x=>x.uid===c)||r?.deck.find(x=>x.uid===c)||{key:c,upgraded:false};return CC.get(c)?(r?.battle?CC.plan(r,c,cardContext):CC.displayPlan(c,cardContext)):null;}
function cardDisplayPlan(c){if(typeof c==='string')c={key:c,upgraded:false};return CC.get(c)?CC.displayPlan(c,cardContext):null;}
function cardChoice(r){return r.battle?.cardChoice||null;}
function chooseCardOption(r,value){return cardAction(r,x=>CC.choose(x,value,cardContext));}
function cancelCardChoice(r){return cardAction(r,x=>CC.cancel(x));}
function canUpgrade(c){return !!c&&!c.upgraded;}
function mysteryAction(r,fn){const next=clone(r);fn(next);if(!validate(next))throw Error('This Mystery action could not be saved. Your progress is unchanged.');for(const key of Object.keys(r))delete r[key];Object.assign(r,next);return r;}
function openMystery(r,seen=[],profile=null){return mysteryAction(r,x=>X.enter(x,seen,profile));}
function startMystery(r,seen=[],profile=null,now=Date.now()){return mysteryAction(r,x=>X.start(x,seen,profile,now));}
function answerMystery(r,id,now=Date.now()){return mysteryAction(r,x=>X.resolve(x,id,now));}
function expireMystery(r,now=Date.now()){return mysteryAction(r,x=>X.expire(x,now));}
function continueMystery(r){return mysteryAction(r,x=>X.proceed(x,mysteryContext));}
function leaveMystery(r,now=Date.now()){return mysteryAction(r,x=>X.leave(x,mysteryContext,now));}
function selectMysteryOption(r,id){return mysteryAction(r,x=>X.selectOption(x,id));}
function selectMysteryTarget(r,id){return mysteryAction(r,x=>X.selectTarget(x,id));}
function claimMystery(r){return mysteryAction(r,x=>X.commit(x,mysteryContext));}
function rng(r){r.rng=(Math.imul(r.rng,1664525)+1013904223)>>>0;return r.rng/4294967296;}
function shuffle(r,a){for(let i=a.length-1;i>0;i--){const j=Math.floor(rng(r)*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function card(r,key,upgraded=false){return {uid:'c'+(++r.seq),key,upgraded};}
function definition(c){const d=C.cards[c.key];if(!d)throw new Error('Unknown card.');const v={...d};if(c.upgraded&&CC.get(c)?.category==='passive')v.cost=Math.max(0,v.cost-C.CARD_UPGRADES.passive);if(c.upgraded&&!CC.get(c)){for(const k of ['damage','block','filter','draw','heal','focus'])if(v[k])v[k]+=d.up;}return v;}
function notify(r,s){r.notice=s;if(r.battle){r.battle.log.unshift(s);r.battle.log=r.battle.log.slice(0,8);}return r;}
function newRun(seed=Date.now(),mode='learn',routeVersion=3){const r={version:1,textLocale:'en',mode,rng:seed>>>0,seed:seed>>>0,seq:0,stage:0,depth:0,hp:C.MAX_HP,maxHp:C.MAX_HP,deck:[],cleared:[],route:G.begin(0,seed,routeVersion),scene:'map',battle:null,rewards:[],checkpoint:null,started:Date.now(),gold:C.ECONOMY.start,shop:null,stats:{cardsPlayed:0,hintsUsed:0,battles:0,turns:0,forecasts:0,firstCorrect:0,assisted:0,wrong:0,concepts:{}},notice:''};for(const [key,n] of (C.STARTER||[['strike',3],['ember',3],['guard',2],['flameguard',2],['filter',1],['draw',1]]))for(let i=0;i<n;i++)r.deck.push(card(r,key));if(mode==='challenge')A.enable(r);return r;}
function draw(r,n){
 const b=r.battle;let drawn=0;
 // Check capacity before touching either pile or the shuffle RNG.
 while(drawn<n&&b.hand.length<C.HAND_LIMIT){
  if(!b.draw.length&&b.discard.length){b.draw=shuffle(r,b.discard.splice(0));notify(r,'Discard Pile shuffled into the Draw Pile.');}
  if(!b.draw.length)break;b.hand.push(b.draw.pop());drawn++;
 }
 if(drawn<n&&b.hand.length>=C.HAND_LIMIT)notify(r,'Hand full ('+C.HAND_LIMIT+'/'+C.HAND_LIMIT+'). Play a card before drawing more.');
 return drawn;
}
function intent(r){const b=r.battle;if(!b)return null;if(b.currentIntent)return {...b.currentIntent};const e=C.enemies[b.enemyId],p=e.patterns[(b.turn-1)%e.patterns.length],rage=Math.floor((b.turn-1)/6)*2+(b.enemyId==='dealer'&&b.hp<=b.maxHp/2?2:0)+(b.elite?2:0);return {...p,damage:Math.ceil((p.damage+rage)*(r.mode==='learn'?.7:1)),rage};}
function turnStart(r){const b=r.battle,retained=b.cardCombat?CC.resetBlock(r):0;b.turn++;b.energy=C.ENERGY;b.block=retained;b.forecastUsed=false;b.question=null;b.boostArmed=false;b.boostUsed=false;b.currentIntent=null;if(b.cardCombat)CC.startTurn(r,cardContext);draw(r,C.HAND);if(b.cardCombat)CC.drawPhase(r,cardContext);A.startTurn(r,artifactContext);X.firstTurn(r,mysteryContext);b.currentIntent=intent(r);b.enemyBlock=b.currentIntent.block||0;notify(r,'Turn '+b.turn+' · Enemy intent: '+b.currentIntent.label+'.');}
function startBattle(r,enemyId,elite=false){if(r.scene==='master'||r.scene==='education')throw new Error('Finish the Dungeon Master encounter before entering the dungeon.');const e=C.enemies[enemyId];if(!e)throw Error('This encounter is not available.');r.scene='battle';r.battle={enemyId,elite,hp:e.hp+(elite?10:0),maxHp:e.hp+(elite?10:0),turn:0,energy:0,block:0,enemyBlock:0,focus:0,boostArmed:false,boostUsed:false,seals:0,draw:shuffle(r,clone(r.deck)),hand:[],discard:[],exhaust:[],question:null,forecastUsed:false,log:[]};A.startCombat(r);X.combatStart(r);CC.setup(r);turnStart(r);return r;}
function enterNode(r,choice='normal',seen=[],profile=null){
 if(r.scene!=='map')throw new Error('Return to the Map first.');
 const options=G.available(r);
 const node=choice==='normal'?(options.find(n=>n.type!=='elite')||options[0]):choice==='elite'?options.find(n=>n.type==='elite'):options.find(n=>n.id===choice);
 if(!node)throw new Error('This room is not connected to your path. Choose a glowing room.');
 if(node.type==='event')return mysteryAction(r,x=>{if(x.route)x.route.active=node.id;x.nodeChoice='normal';x.scene='event';X.enter(x,seen,profile);});
 if(r.route)r.route.active=node.id;
 r.nodeChoice=node.type==='elite'?'elite':'normal';
 if(node.type==='shop'){r.scene='shop';r.shop=createShop(r,node.id);}else if(node.type==='camp'||node.type==='event'){r.scene=node.type;if(node.type==='event')X.enter(r,seen,profile);}
 else startBattle(r,node.enemyId,node.type==='elite');
 return r;
}
function finishNode(r){
 if(r.educationState?.pending)throw new Error('Finish your artifact question first.');
 if(r.artifactState?.offer)throw new Error('Finish your artifact choice first.');
 if(r.mysteryState?.pending&&!r.mysteryState.pending.committed)throw new Error('Finish your Mystery encounter first.');
 let id=r.stage+':'+r.depth;
 if(r.route){
  const node=G.get(r).nodes.find(n=>n.id===r.route.active&&n.depth===r.depth);
  if(!node||node.type==='boss')throw new Error('This room is not active.');
  id=node.id;r.route.path.push(id);r.route.active=null;
 }
 if(r.mysteryState?.pending?.phase==='combat')r.mysteryState.pending=null;
 r.cleared.push(id);r.depth++;r.battle=null;r.shop=null;r.rewards=[];r.scene='map';return r;
}
function win(r){
 const b=r.battle;A.won(r,artifactContext);r.stats.battles++;
 r.gold=(r.gold||0)+(C.enemies[b.enemyId].boss?C.ECONOMY.boss:b.elite?C.ECONOMY.elite:C.ECONOMY.battle);
 if(C.enemies[b.enemyId].boss){
  if(r.stage===1){r.scene='victory';if(r.mysteryState)r.mysteryState.nextCombat=[];r.finished=Math.max(r.started,Date.now());return notify(r,'You cleared both dungeons!');}
  r.scene='stageclear';r.finished=Math.max(r.started,Date.now());if(r.mode==='challenge'&&r.artifactState)A.offer(r,'boss');return notify(r,'Sigil Keep cleared.');
 }
 r.scene='reward';r.rewards=shuffle(r,(C.CARD_POOL||Object.keys(C.cards)).slice()).slice(0,3);
 if(b.elite&&r.mode==='challenge'&&r.artifactState)A.offer(r,'elite',false);
 return notify(r,'Battle won. Choose one reward.');
}
function deal(r,n,pierce=false,detail=null){
 const b=r.battle,e=C.enemies[b.enemyId],before=b.hp,raw=n,sealed=e.boss&&b.seals<e.seals.length,lines=detail?.lines.slice()||[];
 if(sealed){n=Math.ceil(n/2);lines.push('Sealed boss: round up('+raw+' ÷ 2) = '+n);}
 if(!pierce){const blocked=Math.min(b.enemyBlock,n);b.enemyBlock-=blocked;lines.push('Enemy Block: '+n+' − '+blocked+' = '+(n-blocked));n-=blocked;}else lines.push('Pierce bypasses enemy Block.');
 const floor=sealed?1:0;b.hp=Math.max(floor,b.hp-n);
 lines.push('Enemy HP after: max('+floor+', '+before+' − '+n+') = '+b.hp);
 if(detail)R.record(r,detail.label,detail.artifactIds,[R.total('Damage before defenses','damage',raw,detail.lines),R.delta('Enemy HP lost','HP',before,b.hp,lines)]);
 return n;
}
function filterLimit(r,c){const b=r.battle,total=b.draw.length+b.hand.length+b.discard.length;return Math.max(0,Math.min(definition(c).filter||0,b.draw.length-2,total-6));}
function canPlay(r,c){if(r.scene!=='battle'||!r.battle)return 'This battle is over.';if(CC.get(c))return CC.error(cardPlan(r,c));if(r.scene!=='battle')return 'This battle is over.';const b=r.battle,d=definition(c);if(b.cardChoice)return 'Finish the card choice first.';if(b.question&&!b.question.solved)return 'Finish or close Predict first.';if(b.energy<d.cost)return 'Not enough Energy.';if(d.filter&&filterLimit(r,c)<1)return 'Filter must leave 2 cards in the Draw Pile and 6 active cards.';if(d.heal&&r.hp===r.maxHp)return 'HP is full.';return '';}
function effectiveDefinition(r,c){if(CC.get(c)){const p=cardPlan(r,c);return {...definition(c),plan:p};}const d=definition(c),bonus=A.cardBonuses(r,d);return {...d,...(d.damage?{damage:d.damage+bonus.damage}:{}),...(d.block?{block:d.block+bonus.block}:{})};}
function playCard(r,uid,targets=[]){
 const b=r.battle;if(!b)throw new Error('No active battle.');
 const i=b.hand.findIndex(c=>c.uid===uid);if(i<0)throw new Error('This card is not in your hand.');
 const c=b.hand[i];if(CC.get(c))return cardAction(r,x=>CC.commit(x,uid,undefined,cardContext));const d=definition(c),error=canPlay(r,c);if(error)throw new Error(error);
 if(d.filter){const limit=filterLimit(r,c);if(!targets.length||targets.length>limit||new Set(targets).size!==targets.length||targets.some(id=>!b.draw.some(x=>x.uid===id)))throw new Error('Choose 1 to '+limit+' cards from the Draw Pile.');}
 const artifactBonus=A.cardBonuses(r,d),contributions=A.cardContributions(r,d),beforeAction={energy:b.energy,enemyHp:b.hp,block:b.block,hp:r.hp,focus:b.focus,hand:b.hand.length,exhaust:b.exhaust.length};
 b.hand.splice(i,1);b.energy-=d.cost;r.stats.cardsPlayed=(r.stats.cardsPlayed||0)+1;
 let bonus=0;if((d.damage||d.block)&&b.boostArmed&&!b.boostUsed&&b.focus>0){b.focus--;b.boostUsed=true;b.boostArmed=false;bonus=C.BOOST;}
 if(d.damage){const hit=deal(r,d.damage+bonus+artifactBonus.damage,!!d.pierce,{label:d.name,artifactIds:contributions.damage.map(x=>x.id).filter(Boolean),lines:['Card damage after upgrade: '+d.damage,...contributions.damage.map(x=>x.name+': +'+x.value),'Focus boost: +'+bonus,'Damage before defenses: '+d.damage+' + '+artifactBonus.damage+' + '+bonus+' = '+(d.damage+bonus+artifactBonus.damage)]});notify(r,d.name+' gives '+hit+' damage.');}
 if(d.block){const before=b.block,focus=!d.damage?bonus:0,amount=d.block+focus+artifactBonus.block;b.block+=amount;R.record(r,d.name,contributions.block.map(x=>x.id).filter(Boolean),[R.delta('Block gained','Block',before,b.block,['Card Block after upgrade: '+d.block,...contributions.block.map(x=>x.name+': +'+x.value),'Focus boost: +'+focus,'Block gained: '+d.block+' + '+artifactBonus.block+' + '+focus+' = '+amount,'Block after: '+before+' + '+amount+' = '+b.block])]);notify(r,d.name+' gives '+amount+' Block.');}
 if(d.heal){const before=r.hp;r.hp=Math.min(r.maxHp,r.hp+d.heal);R.record(r,d.name,[],[R.healing(d.heal,before,r.hp,r.maxHp)]);notify(r,'Restore '+d.heal+' HP.');A.checkHp(r,artifactContext);}
 if(d.focus){const before=b.focus;b.focus=Math.min(C.FOCUS_CAP,b.focus+d.focus);R.record(r,d.name,[],[R.delta('Focus gained','Focus',before,b.focus,['Requested Focus: +'+d.focus,'Focus cap: '+C.FOCUS_CAP,'Focus after: min('+C.FOCUS_CAP+', '+before+' + '+d.focus+') = '+b.focus])]);notify(r,'Focus gained: +'+(b.focus-before)+' (requested '+d.focus+', cap '+C.FOCUS_CAP+').');}
 let exhaustCount=0;
 if(d.filter){for(const id of targets){const k=b.draw.findIndex(x=>x.uid===id);b.exhaust.push(b.draw.splice(k,1)[0]);exhaustCount++;}notify(r,targets.length+' cards exhausted for this battle.');}
 if(d.exhaust){b.exhaust.push(c);exhaustCount++;}else b.discard.push(c);
 if(d.draw){const before=b.hand.length,drawn=draw(r,d.draw);R.record(r,d.name,[],[R.delta('Cards drawn','cards',before,b.hand.length,['Requested draw: '+d.draw,'Hand limit: '+C.HAND_LIMIT,'Hand after: '+before+' + '+drawn+' = '+b.hand.length,'Only cards actually moved to Hand count.'])]);notify(r,'Draw '+drawn+' card'+(drawn===1?'':'s')+'.'+(drawn<d.draw&&b.hand.length>=C.HAND_LIMIT?' Hand full ('+C.HAND_LIMIT+'/'+C.HAND_LIMIT+').':''));}
 const actual={energySpent:beforeAction.energy-b.energy,enemyHpLost:beforeAction.enemyHp-b.hp,blockGained:Math.max(0,b.block-beforeAction.block),hpHealed:Math.max(0,r.hp-beforeAction.hp),focusGained:Math.max(0,b.focus-beforeAction.focus),focusSpent:Math.max(0,beforeAction.focus-b.focus),focusRequested:d.focus||0,focusCap:C.FOCUS_CAP,cardsDrawn:Math.max(0,b.hand.length-beforeAction.hand+1),cardsExhausted:Math.max(0,b.exhaust.length-beforeAction.exhaust)};
 const summary=[d.name,'Energy spent '+actual.energySpent,...(d.damage?['enemy HP lost '+actual.enemyHpLost]:[]),...(d.block?['Block gained '+actual.blockGained]:[]),...(d.heal?['HP restored '+actual.hpHealed]:[]),...(d.focus?['Focus gained +'+actual.focusGained+' (requested '+actual.focusRequested+', cap '+C.FOCUS_CAP+')']:[]),...(actual.focusSpent?['Focus spent '+actual.focusSpent]:[]),...(actual.cardsDrawn?['cards drawn '+actual.cardsDrawn]:[]),...(actual.cardsExhausted?['cards exhausted '+actual.cardsExhausted]:[])].join(' · ')+'.';
 Log.record(r,{actor:'player',kind:'card',source:c.key,label:d.name,summary,key:'legacy-card:'+b.turn+':'+r.stats.cardsPlayed,values:actual});
 // Commit the full Exhaust batch before any artifact can draw from that pile.
 if(b.cardCombat)CC.afterResolved(r,d,bonus>0,cardContext);A.exhausted(r,exhaustCount,artifactContext);A.cardResolved(r,d,artifactContext);
 if(b.hp<=0)win(r);return r;
}
function armFocus(r){const b=r.battle;if(r.scene!=='battle'||!b||b.cardChoice||b.focus<1||b.boostUsed)throw new Error('Focus is not ready this turn.');b.boostArmed=!b.boostArmed;return r;}
function forecast(r,seen=[],profile=null){return P.forecast(r,seen,profile);}
function selectForecast(r,id){return P.select(r,id);}
function answerBankForecast(r){return P.answer(r,{notify});}
function supportForecast(r,kind){return P.support(r,kind);}
function completeExhaustedForecast(r){return P.completeExhausted(r,{notify});}
function answer(r,value){const b=r.battle,q=b?.question;if(!q||q.solved)throw new Error('No active prediction.');if(q.source==='bank'){if(value!==undefined){if(!q.choiceOrder.includes(value))return {valid:false,correct:false,message:'Choose one of the displayed answers.'};P.select(r,value);}return answerBankForecast(r);}if(M.parseAnswer(value)===null)return {valid:false,correct:false,message:'Enter a fraction such as 3/8, a decimal such as 0.375, or 37.5%. The value must be from 0 to 1.'};q.attempts++;if(!M.isCorrect(value,q)){r.stats.wrong++;return {valid:true,correct:false,message:'Try again. Check the card counts and draw rule. You can use a Hint.'};}
 const first=q.attempts===1&&!q.hinted,focusBefore=b.focus;q.solved=true;q.first=first;b.forecastUsed=true;r.stats.forecasts++;const st=r.stats.concepts[q.kind]||(r.stats.concepts[q.kind]={total:0,first:0,assisted:0});st.total++;if(first){b.focus=Math.min(C.FOCUS_CAP,b.focus+1);r.stats.firstCorrect++;st.first++;}else{r.stats.assisted++;st.assisted++;}const opened=q.seal!==null&&q.seal===b.seals;if(opened)b.seals++;
 const message=first?'Correct! +'+(b.focus-focusBefore)+' Focus (cap '+C.FOCUS_CAP+').':'Correct. Saved as a guided answer.';notify(r,message);Log.record(r,{actor:'player',kind:'predict',source:'legacy:'+q.kind,label:'Predict',summary:message+(opened?' Boss seal opened.':''),key:'predict:'+b.turn,values:{first,focusGained:b.focus-focusBefore,sealOpened:opened,scored:true,legacy:true}});return {valid:true,correct:true,first,message};}
function hint(r){if(r.battle?.question?.source==='bank')return supportForecast(r,'hint');if(r.battle?.question&&!r.battle.question.solved){if(!r.battle.question.hinted)r.stats.hintsUsed=(r.stats.hintsUsed||0)+1;r.battle.question.hinted=true;}return r;}
function closeForecast(r){const b=r.battle;if(b?.question?.source==='bank')return P.close(r);if(b?.question){if(!b.question.solved&&(b.question.attempts||b.question.hinted))b.forecastUsed=true;b.question=null;}return r;}
function endTurn(r){
 if(r.scene!=='battle')throw new Error('No active battle.');const b=r.battle;
 if(b.cardChoice)throw new Error('Finish the card choice first.');if(b.question&&!b.question.solved)throw new Error('Close Predict before ending your turn.');b.question=null;b.boostArmed=false;
 if(b.cardCombat)CC.beforeEnemy(r);A.beforeEnemy(r,artifactContext);const it=intent(r),hpBefore=r.hp,enemyHpBefore=b.hp,hits=it.hits||1;let hit=0,absorbed=0,executed=0;const lines=['Enemy damage per hit: '+it.damage,'Attack hits: '+hits];
 for(let n=0;n<hits&&r.hp>0&&b.hp>0;n++){
  executed++;
  const damage=b.cardCombat?CC.enemyDamage(r,it.damage):{afterStatus:it.damage,defense:0,amount:it.damage},blocked=Math.min(damage.amount,b.block),lost=Math.max(0,damage.amount-b.block),before=r.hp;b.block-=blocked;r.hp=Math.max(0,r.hp-lost);hit+=before-r.hp;absorbed+=blocked;
  if(n<8)lines.push('Hit '+(n+1)+': after status '+damage.afterStatus+', Defense '+damage.defense+', Block '+blocked+'; HP after: max(0, '+before+' − '+lost+') = '+r.hp);
  if(b.cardCombat)CC.afterEnemyHit(r,before,it.damage>0,cardContext);
  if(r.hp>0&&lost===0&&b.hp>0)A.fullyBlocked(r,it.damage,artifactContext);
 }
 lines.push('Total Block absorbed: '+absorbed,'Actual HP lost: '+hit+'; remaining HP: '+r.hp);R.record(r,it.label,[],[R.delta('HP lost','HP',hpBefore,r.hp,lines),R.total('Remaining HP','HP',r.hp,['Remaining HP: '+hpBefore+' − '+(hpBefore-r.hp)+' = '+r.hp])]);r.stats.turns++;b.discard.push(...b.hand.splice(0));
 notify(r,it.label+': '+hit+' damage taken.');if(b.cardCombat)CC.afterEnemy(r,hpBefore);
 Log.record(r,{actor:'enemy',kind:'enemy-turn',source:b.enemyId,label:it.label,summary:it.label+' · '+executed+' hit'+(executed===1?'':'s')+' · Block absorbed '+absorbed+' · HP lost '+hit+' · HP remaining '+r.hp+'.',key:'enemy:'+b.turn,values:{hits:executed,damagePerHit:it.damage,blockAbsorbed:absorbed,hpLost:hit,remainingHp:r.hp,enemyHpLost:Math.max(0,enemyHpBefore-b.hp)}});
 if(r.hp<=0){r.scene='defeat';if(r.mysteryState)r.mysteryState.nextCombat=[];r.finished=Math.max(r.started,Date.now());return r;}
 if(b.hp<=0){win(r);return r;}
 // The next player-turn reset precedes the HP-threshold Block award.
 turnStart(r);return r;
}
function chooseReward(r,key){
 if(r.scene!=='reward'||r.artifactState?.offer?.ready)throw new Error('No card reward is available.');
 if(key&&!r.rewards.includes(key))throw new Error('Choose one of the offered cards.');
 if(key){const reward=card(r,key,!!r.battle?.elite);r.deck.push(reward);if(r.artifactState?.offer?.kind==='elite')r.battle.discard.push(clone(reward));}
 if(r.artifactState?.offer?.kind==='elite'){r.artifactState.offer.ready=true;return r;}
 return finishNode(r);
}
function chooseArtifact(r,key,seen=[],profile=null){
 r.educationState=Q.prepare(r,key,seen,profile);r.scene='education';return notify(r,'Answer the Dungeon Master’s question to claim your artifact.');
}
function continueEducation(r){
 const pending=Q.pending(r);if(!Q.ready(r))throw new Error('Answer the question correctly before continuing.');
 if(!Q.valid(r)||!A.valid(Q.context(r))||!G.valid(Q.context(r)))throw new Error('This artifact question cannot be completed. Your progress has been kept.');
 const destination=Q.context(r).scene,result=A.claim(r,pending.artifactId);Q.finish(r);r.scene=destination;notify(r,result.artifact.name+' acquired.');
 if(result.kind==='starting'){r.scene='map';return r;}
 if(result.kind==='boss')return nextStage(r);
 return finishNode(r);
}
function skipArtifact(r){
 if(r.scene==='education')throw new Error('Finish your artifact question first.');
 const o=r.artifactState?.offer;
 if(!o?.ready||!['elite','mystery'].includes(o.kind))throw new Error('Choose an artifact to continue.');
 r.artifactState.offer=null;return finishNode(r);
}
function camp(r,action,uid){if(r.scene!=='camp')throw new Error('No Rest site is active.');if(action==='heal'){const before=r.hp;r.hp=Math.min(r.maxHp,r.hp+12);R.record(r,'Rest',[],[R.healing(12,before,r.hp,r.maxHp)]);}else if(action==='upgrade'){const c=r.deck.find(x=>x.uid===uid&&canUpgrade(x));if(!c)throw new Error('Choose a card that is not upgraded.');c.upgraded=true;}else throw new Error('Choose Rest or Upgrade.');return finishNode(r);}
function event(r,action,uid){if(r.scene!=='event'||r.artifactState?.offer||r.mysteryState?.pending)throw new Error('No Mystery event is active.');if(action==='artifact'){if(r.mode!=='challenge'||!r.artifactState||!A.offer(r,'mystery'))throw new Error('No new artifacts are available.');return r;}if(action==='heal'){const before=r.hp;r.hp=Math.min(r.maxHp,r.hp+8);R.record(r,'Mystery healing',[],[R.healing(8,before,r.hp,r.maxHp)]);}else if(action==='remove'){if(r.deck.length<=10)throw new Error('Keep at least 10 cards in your deck.');const i=r.deck.findIndex(c=>c.uid===uid);if(i<0)throw new Error('Card not found.');r.deck.splice(i,1);}else if(action!=='skip')throw new Error('Choose a valid option.');return finishNode(r);}

// Shop uses a private deterministic stream. Combat and artifact RNG never reroll stock.
function shopRandom(r,nodeId){let value=(r.seed^Math.imul(r.stage+1,2246822519))>>>0;for(const ch of nodeId)value=(Math.imul(value,31)+ch.charCodeAt(0))>>>0;return ()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value;};}
function shopOffers(r,nodeId,legacy=false,oldCatalog=false){const next=shopRandom(r,nodeId),pool=(legacy||oldCatalog?Object.keys(C.cards).filter(k=>!CC.get({key:k})):(C.CARD_POOL||Object.keys(C.cards))).slice(),offers=[];for(let i=0;i<(legacy?3:6);i++){const key=pool.splice(next()%pool.length,1)[0],basePrice=C.ECONOMY.prices[C.cards[key].cost==='X'?2:C.cards[key].cost];offers.push(legacy?{key,price:A.price(r,basePrice)}:{key,basePrice,price:basePrice,sale:false});}if(!legacy){const sale=next()%offers.length;offers[sale].sale=true;offers[sale].price=Math.ceil(offers[sale].basePrice*(100-C.ECONOMY.shop.salePercent)/100);}return offers;}
function shopArtifacts(r,nodeId,ownedBefore){const next=shopRandom(r,nodeId+':artifacts'),offers=[];for(const [tier,count] of [['starting',3],['elite_mystery',2],['boss',1]]){const pool=Object.values(A.catalog).filter(a=>a.tier===tier&&!ownedBefore.includes(a.id)&&!a.requires).map(a=>a.id);for(let i=0;i<count;i++)offers.push({id:pool.length?pool.splice(next()%pool.length,1)[0]:null,tier,price:C.ECONOMY.shop.artifactPrices[tier]});}return offers;}
function createShop(r,nodeId){const ownedBefore=A.owned(r).map(a=>a.id);return {version:2,offers:shopOffers(r,nodeId),bought:[],ownedBefore,artifacts:shopArtifacts(r,nodeId,ownedBefore),artifactBought:[],removed:null};}
function shopPriceCalculation(r,offer){if(r.shop?.version!==2)return {...A.priceCalculation(r,C.ECONOMY.prices[C.cards[offer.key].cost==='X'?2:C.cards[offer.key].cost]),value:offer.price,after:offer.price};const result=A.priceCalculation(r,offer.price);if(offer.sale){result.before=offer.basePrice;result.lines.unshift('Card sale: '+C.ECONOMY.shop.salePercent+'% off '+offer.basePrice+' Gold → '+offer.price+' Gold before artifact discount.');}return result;}
function shopPrice(r,offer){return shopPriceCalculation(r,offer).value;}
function buyCard(r,index){
 if(r.scene!=='shop'||!Number.isInteger(index)||index<0||index>=r.shop.offers.length||r.shop.bought.includes(index))throw new Error('This card is no longer for sale.');
 const offer=r.shop.offers[index],price=shopPrice(r,offer);
 if(r.gold<price)throw new Error('Not enough Gold. Win battles to earn more.');if(r.deck.length>=60)throw new Error('Your deck is full.');
 const before=r.gold;r.gold-=price;r.deck.push(card(r,offer.key));r.shop.bought.push(index);
 R.record(r,C.cards[offer.key].name+' purchased',A.owned(r).filter(a=>a.values.discount_percent).map(a=>a.id),[shopPriceCalculation(r,offer),R.delta('Gold spent','Gold',before,r.gold,['Purchase price: '+price+' Gold','Gold after: '+before+' − '+price+' = '+r.gold])]);return notify(r,C.cards[offer.key].name+' purchased.');
}
function buyArtifact(r,index){
 if(r.scene!=='shop'||r.shop?.version!==2||!Number.isInteger(index)||index<0||index>=6||r.shop.artifactBought.includes(index))throw new Error('This artifact is no longer for sale.');
 const offer=r.shop.artifacts[index],price=shopPrice(r,offer),item=A.catalog[offer.id],source='shop:'+r.stage+':'+r.route.active+':'+index;
 if(!item||A.has(r,offer.id)||r.artifactState?.acquired.some(x=>x.source===source))throw new Error('This artifact is no longer for sale.');
 if(r.gold<price)throw new Error('Not enough Gold. Win battles to earn more.');
 if(!r.artifactState)r.artifactState={version:1,shopOnly:true,rng:(r.seed^0xa741c6e5)>>>0,owned:[],acquired:[],startingId:null,offer:null};
 const calculation=shopPriceCalculation(r,offer),before=r.gold;r.gold-=price;A.acquire(r,item.id,source);r.shop.artifactBought.push(index);
 R.record(r,item.name+' purchased',[item.id],[calculation,R.delta('Gold spent','Gold',before,before-price,['Purchase price: '+price+' Gold','Gold after payment: '+before+' − '+price+' = '+(before-price)])]);return notify(r,item.name+' purchased.');
}
function shopRemovalPrice(r){return A.price(r,C.ECONOMY.shop.removePrice);}
function removeShopCard(r,uid){
 if(r.scene!=='shop'||r.shop?.version!==2||r.shop.removed)throw new Error('Card removal is no longer available here.');
 if(r.deck.length<=C.ECONOMY.shop.minimumDeck)throw new Error('Keep at least '+C.ECONOMY.shop.minimumDeck+' cards in your deck.');
 const index=r.deck.findIndex(c=>c.uid===uid),price=shopRemovalPrice(r);if(index<0)throw new Error('Card not found.');if(r.gold<price)throw new Error('Not enough Gold.');
 const before=r.gold;r.gold-=price;r.shop.removed=r.deck.splice(index,1)[0];
 R.record(r,'Card removed',[],[R.delta('Gold spent','Gold',before,r.gold,['Remove '+definition(r.shop.removed).name+': '+price+' Gold'])]);return notify(r,definition(r.shop.removed).name+' removed from your deck.');
}
function validShop(r){
 const s=r.shop,indices=(a,n)=>Array.isArray(a)&&new Set(a).size===a.length&&a.every(i=>Number.isInteger(i)&&i>=0&&i<n);
 if(!s||!indices(s.bought,s.version===2?6:3))return false;
 if(s.version===undefined)return JSON.stringify(shopOffers(r,r.route.active,true))===JSON.stringify(s.offers);
 if(s.version!==2||!Array.isArray(s.ownedBefore)||new Set(s.ownedBefore).size!==s.ownedBefore.length||s.ownedBefore.some(id=>!A.has(r,id))||!indices(s.artifactBought,6))return false;
 if((JSON.stringify(s.offers)!==JSON.stringify(shopOffers(r,r.route.active))&&JSON.stringify(s.offers)!==JSON.stringify(shopOffers(r,r.route.active,false,true)))||JSON.stringify(s.artifacts)!==JSON.stringify(shopArtifacts(r,r.route.active,s.ownedBefore)))return false;
 const purchased=s.artifactBought.map(i=>s.artifacts[i].id);if(purchased.some((id,i)=>!id||!r.artifactState?.acquired.some(x=>x.id===id&&x.source==='shop:'+r.stage+':'+r.route.active+':'+s.artifactBought[i])))return false;
 if(A.owned(r).some(a=>!s.ownedBefore.includes(a.id)&&!purchased.includes(a.id)))return false;
 if(s.artifacts.some((o,i)=>!s.artifactBought.includes(i)&&o.id&&A.has(r,o.id)))return false;
 if(s.removed!==null&&(!s.removed||typeof s.removed.uid!=='string'||!/^c\d+$/.test(s.removed.uid)||!Object.hasOwn(C.cards,s.removed.key)||typeof s.removed.upgraded!=='boolean'||Number(s.removed.uid.slice(1))>r.seq||r.deck.some(c=>c.uid===s.removed.uid)))return false;
 return true;
}
function leaveShop(r){if(r.scene!=='shop')throw new Error('No Shop is active.');return finishNode(r);}

function nextStage(r){if(r.scene!=='stageclear'||r.artifactState?.offer)throw new Error('Choose your Boss artifact before entering Stage 2.');const routeVersion=r.route?.version===3?3:2;r.cleared.push(r.route?.active||'0:4');r.stage=1;r.depth=0;r.route=G.begin(1,r.seed,routeVersion);r.hp=Math.min(r.maxHp,r.hp+12);r.battle=null;r.scene='map';delete r.finished;r.checkpoint=null;r.checkpoint=clone(r);return r;}
function retry(r){if(!r.checkpoint){const out=newRun(r.seed,r.mode,r.route?.version||2);if(r.route===undefined)delete out.route;if(!r.artifactState){delete out.artifactState;out.scene='map';}return out;}const out=clone(r.checkpoint);out.checkpoint=clone({...r.checkpoint,checkpoint:null});return Q.carryRunQuestions(out,r);}
function validate(s){try{return validateState(s);}catch(_){return false;}}
function validateState(s){const nonnegative=n=>Number.isSafeInteger(n)&&n>=0;const cardOK=c=>c&&typeof c.uid==='string'&&/^c\d+$/.test(c.uid)&&Object.hasOwn(C.cards,c.key)&&typeof c.upgraded==='boolean';
 const phase=Q.context(s)?.scene;
 if(!s||typeof s!=='object'||s.version!==1||!['learn','challenge'].includes(s.mode)||!Array.isArray(s.deck)||s.deck.length<1||s.deck.length>60||!s.deck.every(cardOK)||new Set(s.deck.map(c=>c.uid)).size!==s.deck.length||![0,1].includes(s.stage)||!Number.isInteger(s.depth)||s.depth<0||s.depth>(s.route?.version===3?9:4)||!nonnegative(s.hp)||s.hp>s.maxHp||s.maxHp!==A.maxHp(s)||!nonnegative(s.rng)||s.rng>4294967295||!nonnegative(s.seed)||!nonnegative(s.seq)||s.deck.some(c=>Number(c.uid.slice(1))>s.seq)||!Array.isArray(s.cleared)||!s.cleared.every(v=>typeof v==='string')||!Number.isFinite(s.started)||!s.stats||typeof s.stats.concepts!=='object'||!['battles','turns','forecasts','firstCorrect','assisted','wrong'].every(k=>nonnegative(s.stats[k]))||s.stats.forecasts!==s.stats.firstCorrect+s.stats.assisted||!['master','education','map','battle','reward','camp','event','shop','stageclear','defeat','victory'].includes(s.scene))return false;
 if(s.finished!==undefined&&(!Number.isFinite(s.finished)||s.finished<s.started||!['stageclear','defeat','victory'].includes(phase)))return false;
 if(!CC.valid(s,cardOK,cardContext)||!R.valid(s)||!Q.valid(s)||!P.valid(s)||!Log.valid(s)||!X.valid(s)||!A.valid(Q.context(s))||!G.valid(Q.context(s)))return false;
 if(['cardsPlayed','hintsUsed'].some(k=>s.stats[k]!==undefined&&!nonnegative(s.stats[k])))return false;
 if(s.gold!==undefined&&(!nonnegative(s.gold)||s.gold>100000))return false;
 if(s.scene==='shop'&&!validShop(s))return false;

 for(const st of Object.values(s.stats.concepts))if(!st||!['total','first','assisted'].every(k=>nonnegative(st[k]))||st.total!==st.first+st.assisted)return false;
 if((!s.route&&phase==='camp'&&s.depth!==2)||(!s.route&&phase==='event'&&s.depth!==3)||(phase==='stageclear'&&(s.stage!==0||s.depth!==(s.route?.version===3?9:4)))||(phase==='victory'&&(s.stage!==1||s.depth!==(s.route?.version===3?9:4)))||(phase==='defeat'&&s.hp!==0)||(['battle','reward','stageclear','victory','defeat'].includes(phase)&&!s.battle))return false;
 if(phase==='reward'&&(!Array.isArray(s.rewards)||s.rewards.length!==3||new Set(s.rewards).size!==3||!s.rewards.every(k=>Object.hasOwn(C.cards,k))))return false;
 if(s.battle){const b=s.battle,e=C.enemies[b.enemyId];if(!e||!['draw','hand','discard','exhaust'].every(k=>Array.isArray(b[k])&&b[k].every(cardOK))||!nonnegative(b.hp)||b.hp>b.maxHp||!nonnegative(b.maxHp)||b.maxHp<1||!nonnegative(b.energy)||b.energy>A.maxEnergy(s)||!nonnegative(b.focus)||b.focus>3||!nonnegative(b.turn)||b.turn<1||!Array.isArray(b.log)||!b.log.every(v=>typeof v==='string')||!nonnegative(b.block)||!nonnegative(b.enemyBlock)||!nonnegative(b.seals)||b.seals>(e.seals?.length||0)||!['forecastUsed','boostArmed','boostUsed','elite'].every(k=>typeof b[k]==='boolean')||!b.currentIntent||!nonnegative(b.currentIntent.damage)||typeof b.currentIntent.label!=='string'||!nonnegative(b.currentIntent.rage)||(b.currentIntent.block!==undefined&&!nonnegative(b.currentIntent.block))||(b.currentIntent.hits!==undefined&&(!Number.isSafeInteger(b.currentIntent.hits)||b.currentIntent.hits<1||b.currentIntent.hits>10)))return false;
 const all=[...b.draw,...b.hand,...b.discard,...b.exhaust,...(b.active||[]),...(b.resolving||[]),...(b.cardChoice?.committed?b.cardChoice.candidates:[])];if(all.length!==s.deck.length||new Set(all.map(c=>c.uid)).size!==all.length||all.some(c=>!s.deck.some(x=>x.uid===c.uid&&x.key===c.key&&x.upgraded===c.upgraded)))return false;
 if(b.question&&b.question.source!=='bank'){const q=b.question;if(!Array.isArray(q.source)||!q.source.length||q.source.length>60||!q.source.every(c=>cardOK(c)&&['attack','guard','tactic','passive'].includes(c.role)&&['fire','ice','neutral'].includes(c.element))||!['single','exclusive','overlap','pairWithout','pairWith','atLeast'].includes(q.kind)||!nonnegative(q.attempts)||typeof q.hinted!=='boolean'||typeof q.solved!=='boolean'||(q.seal!==null&&(!nonnegative(q.seal)||q.seal>1))||(q.trial!==undefined&&(!Array.isArray(q.trial)||q.trial.length>2||q.trial.some(x=>!x||!['attack','guard','tactic','passive'].includes(x.role)||!['fire','ice','neutral'].includes(x.element)))))return false;const expected=M.makeQuestion(q.source,q.kind);if(!expected||q.n!==expected.n||q.d!==expected.d||q.value!==expected.value||q.total!==expected.total||JSON.stringify(q.counts)!==JSON.stringify(expected.counts)||typeof q.text!=='string'||q.formula!==expected.formula||typeof q.why!=='string'||!Array.isArray(q.steps)||!q.steps.every(x=>typeof x==='string'))return false;}
 }
 if(s.checkpoint){if(s.stage!==1||s.checkpoint.stage!==1||s.checkpoint.depth!==0||s.checkpoint.scene!=='map'||s.checkpoint.checkpoint)return false;const cp={...s.checkpoint,checkpoint:null};if(!validate(cp))return false;}return true;}
// Save version 1 stores some display text. Rebuild that text only after all
// mathematical values, card identities and counters have passed validation.
function restore(saved){
 if(!validate(saved))return null;
 const out=clone(saved);
 function refresh(r){
  if(['stageclear','defeat','victory'].includes(Q.context(r)?.scene)&&r.finished===undefined)r.finished=Math.max(r.started,Date.now());
  const b=r.battle;
  if(b){
   if(b.cardCombat===undefined)CC.setup(r);
   // Old uncapped hands remain loadable; preserve each excess card on top of Draw.
   if(b.hand.length>C.HAND_LIMIT)b.draw.push(...b.hand.splice(C.HAND_LIMIT).reverse());
   if(b.question&&b.question.source!=='bank'){const q=b.question,display=M.makeQuestion(q.source,q.kind);for(const key of ['text','why','label','steps'])q[key]=display[key];}
   b.currentIntent.label=C.enemies[b.enemyId].patterns[(b.turn-1)%C.enemies[b.enemyId].patterns.length].label;
   if(r.textLocale!=='en'){b.log=['Game resumed. Your progress is safe.'];r.notice='Game resumed.';}
  }
  if(r.scene==='event'&&!r.mysteryState?.pending&&!r.artifactState?.offer)X.enter(r);
  r.gold=r.gold??C.ECONOMY.start;r.stats.cardsPlayed=r.stats.cardsPlayed??0;r.stats.hintsUsed=r.stats.hintsUsed??0;r.textLocale='en';if(r.checkpoint)refresh(r.checkpoint);
 }
 refresh(out);return out;
}
const E={cardDisplayPlan,cardPlan,cardChoice,chooseCardOption,cancelCardChoice,canUpgrade,openMystery,startMystery,answerMystery,expireMystery,continueMystery,leaveMystery,selectMysteryOption,selectMysteryTarget,claimMystery,chooseArtifact,continueEducation,selectEducation:Q.select,answerEducation:Q.answer,hintEducation:Q.hint,skipArtifact,artifactChoices:r=>r.scene==='education'?[]:A.choices(r),ownedArtifacts:A.owned,effectiveDefinition,energyLimit:r=>r.battle?.artifacts?.turn.energyBudget??Math.max(0,C.ENERGY+(r.battle?.turn===1?(r.battle.mysteryModifiers?.energy||0):0)),shopOffers,shopPrice,shopPriceCalculation,shopRemovalPrice,buyCard,buyArtifact,removeShopCard,leaveShop,getMap:G.get,availableNodes:G.available,restore,newRun,definition,card,shuffle,rng,draw,intent,startBattle,enterNode,finishNode,playCard,canPlay,filterLimit,armFocus,forecast,selectForecast,answerBankForecast,supportForecast,completeExhaustedForecast,answer,hint,closeForecast,endTurn,chooseReward,camp,event,nextStage,retry,validate,clone};if(typeof module!=='undefined')module.exports=E;else root.DCEngine=E;
})(typeof window!=='undefined'?window:globalThis);
