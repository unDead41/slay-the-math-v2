(function(root){'use strict';
 const E=typeof module!=='undefined'?require('./engine.js'):root.DCEngine;
 const C=typeof module!=='undefined'?require('./config.js'):root.DCConfig;
 const Q=typeof module!=='undefined'?require('./education.js'):root.DCEducation;
 const D=typeof module!=='undefined'?require('./tutorial-data.js'):root.DCTutorialData;
 const KEY='slay-the-math.tutorial.v1',copy=x=>JSON.parse(JSON.stringify(x));
 const byId=new Map(D.chapters.map(x=>[x.id,x]));
 const keys={attack:'stm.attack.rune_strike',block:'stm.defend.rune_guard',draw:'stm.skill.quick_study',focus:'stm.attack.rune_strike',passive:'stm.passive.blazing_spirit'};
 function fresh(language='en'){return {version:1,chapter:'welcome',route:'basics',language:language==='ms'?'ms':'en',completed:[]};}
 function valid(p){return p&&p.version===1&&byId.has(p.chapter)&&(!p.route||Object.hasOwn(D.paths,p.route))&&['en','ms'].includes(p.language)&&Array.isArray(p.completed)&&p.completed.length<=D.chapters.length&&new Set(p.completed).size===p.completed.length&&p.completed.every(id=>byId.has(id));}
 function baseBattle(kind){
  const r=E.newRun(31042026,'learn');delete r.route;r.deck=[keys.attack,keys.block,keys.draw,keys.passive,...Array(8).fill(keys.attack)].map(key=>E.card(r,key));
  E.startBattle(r,kind==='boss'?'sentinel':'wisp');if(kind==='boss')r.depth=4;
  const pool=[...r.battle.hand,...r.battle.draw];r.battle.hand=[];
  for(const key of [keys.block,keys.attack,keys.draw,keys.passive]){const i=pool.findIndex(c=>c.key===key);r.battle.hand.push(pool.splice(i,1)[0]);}r.battle.draw=pool;
  if(kind==='focus')r.battle.focus=1;
  return r;
 }
 function shopRun(){
  const r=E.newRun(31042026,'learn'),nodes=E.getMap(r).nodes,target=nodes.find(n=>n.type==='shop');
  function pathTo(node){if(node.depth===0)return [];for(const p of nodes.filter(n=>n.next.includes(node.id))){const found=pathTo(p);if(found)return [...found,p.id];}return null;}
  if(!target)throw Error('No example Shop is available.');r.depth=target.depth;r.route.path=pathTo(target);r.gold=1000;E.enterNode(r,target.id);return r;
 }
 function prepare(kind){
  let r;
  if(kind==='map')r=E.newRun(31042026,'learn');
  else if(kind==='shop')r=shopRun();
  else if(kind==='rest'){r=E.newRun(31042026,'learn');delete r.route;r.scene='camp';r.depth=2;r.hp=Math.min(24,r.maxHp);}
  else{r=baseBattle(kind);if(kind==='reward'){r.battle.hp=1;E.playCard(r,r.battle.hand.find(c=>c.key===keys.attack).uid);}if(kind==='predict'||kind==='boss')E.forecast(r);}
  if(!E.validate(r))throw Error('This practice example is not available. Return to the guide and try again.');
  return {kind,run:r,step:0,complete:false,result:null,before:copy(r),lastBefore:copy(r),cardId:kind==='turn'?keys.block:keys[kind]||null};
 }
 function create({storage,language:initialLanguage='en'}={}){
  let p=fresh(initialLanguage),storageNotice='',examples=new Map();
  if(storage)try{const raw=storage.getItem(KEY);if(raw){const parsed=JSON.parse(raw);if(!valid(parsed))throw Error('Invalid tutorial progress');p={...copy(parsed),route:parsed.route||'all'};if(!D.paths[p.route].includes(p.chapter))p.route='all';}}catch(_){storageNotice='read';}
  function persist(){if(!storage)return;try{storage.setItem(KEY,JSON.stringify(p));}catch(_){storageNotice='write';}}
  function progress(){return {...copy(p),storageNotice};}
  function select(id){if(!byId.has(id))throw Error('Unknown tutorial chapter.');p.chapter=id;if(!D.paths[p.route].includes(id))p.route='all';persist();return progress();}
  function route(value){if(!Object.hasOwn(D.paths,value))throw Error('Unknown tutorial route.');p.route=value;if(!D.paths[value].includes(p.chapter))p.chapter=D.paths[value][0];persist();return progress();}
  function done(id){if(!p.completed.includes(id)){p.completed.push(id);persist();}}
  function completeReading(){if(byId.get(p.chapter).exercise)throw Error('Complete the practice action first.');done(p.chapter);return progress();}
  function language(value){if(!['en','ms'].includes(value))throw Error('Unknown tutorial language.');p.language=value;persist();return progress();}
  function reset(){p=fresh(p.language);examples.clear();persist();return progress();}
  function current(id){const ch=byId.get(id);if(!ch?.exercise)throw Error('This chapter has no practice.');if(id!==p.chapter)throw Error('Return to this chapter before practising.');return ch;}
  function exercise(id=p.chapter){const ch=current(id);if(!examples.has(id))examples.set(id,prepare(ch.exercise));return copy(examples.get(id));}
  function replay(id=p.chapter){current(id);examples.delete(id);return exercise(id);}
  function act(id,action,value){
   const ch=current(id);if(!examples.has(id))exercise(id);const old=examples.get(id);if(old.complete&&!(['predict','boss'].includes(ch.exercise)&&action==='steps'))return copy(old);
   // Work on a copy so invalid or stale actions cannot partially change practice.
   const x=copy(old),r=x.run,b=r.battle,k=ch.exercise;x.lastBefore=copy(old.run);
   const play=()=>{const card=b.hand.find(c=>c.key===x.cardId);if(!card)throw Error('This example card has already been played.');E.playCard(r,card.uid);};
   if(['attack','draw','passive'].includes(k)&&action==='play'){play();x.complete=true;}
   else if(k==='block'){
    if(action==='play'&&x.step===0){play();x.step=1;}
    else if(action==='end-turn'&&x.step===1){E.endTurn(r);x.step=2;x.complete=true;}
    else throw Error('Play the defense card before ending this practice turn.');
   }else if(k==='turn'){
    if(action==='play'&&x.step<2){play();x.step++;x.cardId=x.step===1?keys.attack:null;}
    else if(action==='end-turn'&&x.step===2){E.endTurn(r);x.step=3;x.complete=true;}
    else throw Error('Protect, attack, then end this practice turn.');
   }else if(k==='focus'){
    if(action==='arm'&&x.step===0){E.armFocus(r);x.step=1;}
    else if(action==='play'&&x.step===1&&b.boostArmed){play();x.complete=true;}
    else throw Error('Arm Focus before playing this practice card.');
   }else if(k==='predict'||k==='boss'){
    if(action==='select')E.selectForecast(r,value);
    else if(action==='check'){x.result=E.answerBankForecast(r);x.complete=x.result.correct&&(k!=='boss'||b.seals>=C.enemies[b.enemyId].seals.length);}
    else if(['hint','moreHint','steps','foundation'].includes(action))E.supportForecast(r,action);
    else if(action==='next-predict'&&k==='boss'&&b.question?.solved){E.closeForecast(r);E.endTurn(r);E.forecast(r);x.result=null;}
    else throw Error('Choose an available question action.');
   }else if(k==='map'&&action==='enter'){E.enterNode(r,value);x.complete=true;}
   else if(k==='reward'&&['take','skip'].includes(action)){E.chooseReward(r,action==='skip'?null:value);x.complete=true;}
   else if(k==='shop'&&action==='buy'){const n=Number(value);if(!Number.isInteger(n)||n<0||n>=r.shop.offers.length)throw Error('Choose an available Shop offer.');E.buyCard(r,n);x.complete=true;}
   else if(k==='rest'&&['heal','upgrade'].includes(action)){E.camp(r,action,action==='upgrade'?(value||r.deck.find(c=>E.canUpgrade(c))?.uid):undefined);x.complete=true;}
   else throw Error('This action is not part of the current practice.');
   if(!E.validate(r))throw Error('This practice action could not be completed. Replay the example.');
   examples.set(id,x);if(x.complete)done(id);return copy(x);
  }
  return {progress,select,route,completeReading,language,reset,exercise,replay,act};
 }
 const api={create,storageKey:KEY};if(typeof module!=='undefined')module.exports=api;else root.DCTutorialCore=api;
})(globalThis);
