const {mysteryRoom}=require('./helpers/mystery.cjs');
const {shopRoom}=require('./helpers/shop.cjs');
const {completeDomTrial}=require('./helpers/education.cjs');
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const E=require('../dist/engine.js');
let JSDOM;try{({JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom'));}catch{}
const files=[...fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split(/[?#]/)[0]);
test('DOM: question menus use Ink and a bilingual legend, preserve panel scroll, and distinguish run from lifetime coverage',{skip:!JSDOM},()=>{
 const Q=require('../dist/education.js'),r=E.newRun(7,'challenge');E.chooseArtifact(r,E.artifactChoices(r)[0].id,Q.ids.slice(0,35));
 const {dom,w,click,state}=boot(r);
 try{
  click('continue');assert.equal(w.document.querySelector('.education-question').dataset.theme,'dark');
  assert.equal(w.document.querySelector('[data-question-coverage="run"]').textContent,'This run: 1 / 120');
  assert.equal(w.document.querySelector('[data-question-coverage="lifetime"]').textContent,'Lifetime: 36 / 120');
  assert.deepEqual([...w.document.querySelectorAll('.question-term-legend span')].map(e=>e.textContent),['Math term','Game term','Calculation']);
  w.document.querySelector('.education-panel').scrollTop=480;
  click('education-select',Q.current(state()).correctChoiceId);
  assert.equal(w.document.querySelector('.education-panel').scrollTop,480);
  const language=w.document.querySelector('#question-language-select');language.value='ms';language.dispatchEvent(new w.Event('change',{bubbles:true}));
  assert.equal(w.document.querySelector('.question-term-legend [data-key="math"]').textContent,'Istilah matematik');
  assert.match(w.document.querySelector('[data-question-coverage="lifetime"]').textContent,/36 \/ 120/);
  completeDomTrial(w);click('home');click('new');click('start-new');click('start-challenge');click('select-artifact',state().artifactState.offer.ids[0]);click('claim-artifact');
  assert.equal(w.document.querySelector('.education-panel').scrollTop,0);
  assert.match(w.document.querySelector('[data-question-coverage="run"]').textContent,/1 \/ 120/);
  assert.match(w.document.querySelector('[data-question-coverage="lifetime"]').textContent,/3[67] \/ 120/);
 }finally{dom.window.close();}
});
test('DOM: every Alyssa pose uses the approved right-facing art even without Canvas',{skip:!JSDOM},()=>{
 for(const [key,pose] of [[null,'idle'],['strike','attack'],['guard','defend'],['draw','skill'],['hit','damaged']]){
  const r=fixtureRun(7);E.startBattle(r,'wisp');
  const pool=[...r.battle.hand,...r.battle.draw];r.battle.hand=[];
  for(const name of ['strike','guard','draw','ember'])r.battle.hand.push(pool.splice(pool.findIndex(c=>c.key===name),1)[0]);
  r.battle.draw=pool;r.battle.enemyBlock=0;
  const {dom,w,click}=boot(r);
  try{
   click('continue');if(key==='hit')click('end-turn');else if(key)click('play',r.battle.hand.find(c=>c.key===key).uid);
   assert.match(w.document.querySelector('.player .fighter-art').src,new RegExp('/assets/alyssa-right-'+pose+'\\.webp$'));
  }finally{dom.window.close();}
 }
});
test('DOM: Motion Off keeps the right-facing idle poster when Canvas is unavailable',{skip:!JSDOM},()=>{
 const r=fixtureRun(7);E.startBattle(r,'wisp');const pool=[...r.battle.hand,...r.battle.draw];
 const attack=pool.splice(pool.findIndex(c=>c.key==='strike'),1)[0];r.battle.hand=[attack];r.battle.draw=pool;r.battle.enemyBlock=0;
 const {dom,w,click}=boot(r,false,{settings:{motion:false,sound:false,musicMuted:true}});
 try{click('continue');click('play',attack.uid);assert.match(w.document.querySelector('.player .fighter-art').src,/\/assets\/alyssa-right-idle\.webp$/);click('end-turn');assert.match(w.document.querySelector('.player .fighter-art').src,/\/assets\/alyssa-right-idle\.webp$/);}
 finally{dom.window.close();}
});
test('DOM: Alyssa reacts to resolved HP loss after automatic artifact Block, rather than a pre-turn estimate',{skip:!JSDOM},()=>{
 const A=require('../dist/artifacts.js'),r=E.newRun(7,'challenge');require('./helpers/education.cjs').claimArtifact(r,r.artifactState.offer.ids[0]);delete r.route;A.acquire(r,A.id('e04'),'fixture:balance');E.startBattle(r,'wisp');r.battle.block=2;r.battle.currentIntent.damage=8;
 const {dom,w,click,state}=boot(r);
 try{click('continue');click('end-turn');assert.equal(state().hp,r.hp);assert.equal(w.document.querySelector('.player .fighter-art').dataset.pose,'defend');assert.ok(E.validate(state()));}
 finally{dom.window.close();}
});
test('DOM: artifact terms support focus, tap and Escape without selecting or claiming a gift',{skip:!JSDOM},()=>{
 const {dom,w,click,state}=boot(E.newRun(7,'challenge'));
 try{
  click('continue');const before=state(),term=w.document.querySelector('.artifact-effect [data-rt-term]');assert.ok(term);
  assert.equal(w.document.querySelector('button button'),null);term.focus();
  const tooltip=w.document.querySelector('[role=tooltip]');assert.ok(tooltip);assert.equal(term.getAttribute('aria-describedby'),tooltip.id);
  assert.ok(tooltip.textContent.includes(w.DCRichText.data.glossary[term.dataset.rtTerm].definition));
  term.click();assert.deepEqual(state(),before);assert.equal(w.document.querySelector('[data-action=claim-artifact]').disabled,true);
  term.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));assert.equal(w.document.querySelector('[role=tooltip]'),null);
  const pick=w.document.querySelector('[data-action=select-artifact]');pick.click();assert.equal(w.document.activeElement.dataset.action,'select-artifact');assert.equal(pick.isConnected,false);
  assert.deepEqual(state(),before);
 }finally{dom.window.close();}
});
test('DOM: resolved artifact calculations and glossary use the shared dialog and never replay effects',{skip:!JSDOM},()=>{
 const A=require('../dist/artifacts.js');let r;
 for(let seed=1;seed<300;seed++){const candidate=E.newRun(seed,'challenge');if(candidate.artifactState.offer.ids.includes(A.id('s09'))){r=candidate;break;}}
 require('./helpers/education.cjs').claimArtifact(r,A.id('s09'));
 const {dom,w,click,state}=boot(r);
 try{
  click('continue');click('artifacts');assert.ok(w.document.querySelector('#dialog').open);
  assert.equal(w.document.querySelectorAll('.rt-glossary [data-rt-term]').length,55);
  const number=w.document.querySelector('.artifact-last-result .rt-calculation');assert.equal(number.textContent,'+25');const before=state();number.focus();number.click();
  assert.match(w.document.querySelector('[role=tooltip]').textContent,/80 \+ 25 = 105/);assert.deepEqual(state(),before);
  number.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));assert.ok(w.document.querySelector('#dialog').open);assert.equal(w.document.querySelector('[role=tooltip]'),null);
  w.document.querySelector('#dialog [data-action=calculations]').click();assert.match(w.document.querySelector('#dialog-title').textContent,/Calculations/);assert.match(w.document.querySelector('.rt-event').textContent,/Gold gained: \+25 Gold/);
  assert.deepEqual(state(),before);click('close');assert.equal(w.document.querySelector('#dialog').open,false);
 }finally{dom.window.close();}
});
test('DOM: mixed math/game descriptions keep separate tokens and never color ordinary text',{skip:!JSDOM},()=>{
 const {dom,w}=boot();
 try{
  const box=w.document.createElement('div');box.innerHTML=w.DCRichText.description('e12_lantern_keepers_flask');
  const terms=[...box.querySelectorAll('.rt-term')];assert.ok(terms.some(t=>t.textContent==='50%'&&t.dataset.category==='math'));
  assert.ok(terms.some(t=>t.textContent==='Max HP'&&t.dataset.category==='game'));assert.ok(terms.some(t=>t.textContent==='or less'&&t.dataset.category==='math'));
  assert.equal(box.querySelector('button button'),null);assert.match(box.textContent,/50% Max HP or less/);
 }finally{dom.window.close();}
});
test('DOM: branching map exposes connected choices and commits the exact selected entry',{skip:!JSDOM},()=>{
 const original=E.newRun(7,'learn',2);const {dom,w,click,state}=boot(original);
 try{
  click('continue');
  const rooms=[...w.document.querySelectorAll('.dungeon-room')];
  assert.equal(rooms.length,13);
  assert.equal(rooms.filter(el=>!el.disabled).length,3);
  assert.ok(rooms.filter(el=>el.disabled).every(el=>el.getAttribute('aria-label')));
  assert.ok(w.document.querySelectorAll('.dungeon-path').length>12);
  assert.equal(w.document.querySelector('.room-preview'),null);
  const mapMarkup=w.document.querySelector('[data-stm-map]').outerHTML;
  for(const enemy of Object.values(require('../dist/config.js').enemies))assert.ok(!mapMarkup.includes(enemy.name),'Map must conceal '+enemy.name+' in text and attributes');
  assert.equal(w.document.querySelector('[data-stm-map]').firstElementChild.matches('.map-overview'),true);
  const entry=E.availableNodes(original)[2];
  assert.equal(w.document.querySelector('.map-selection,.enter-room,.map-locate'),null);
  const blocked=rooms.find(el=>el.disabled),unchanged=state();blocked.click();assert.deepEqual(state(),unchanged);
  const entryButton=w.document.querySelector('.dungeon-room[data-id="'+entry.id+'"]');click('node',entry.id);
  assert.equal(state().scene,'battle');
  assert.equal(state().route.active,entry.id);
  const once=state();entryButton.click();assert.deepEqual(state(),once);
  assert.ok(E.validate(state()));
 }finally{dom.window.close();}
});
test('DOM: restored map highlights the travelled branch and disables every disconnected location',{skip:!JSDOM},()=>{
 const original=E.newRun(7,'learn',2);const entry=E.availableNodes(original).find(n=>n.next.length<3);
 E.enterNode(original,entry.id);original.battle.hp=0;original.scene='reward';original.rewards=['blast','fort','balance'];E.chooseReward(original,null);
 const {dom,w,click}=boot(original);
 try{
  click('continue');
  assert.equal(w.document.querySelectorAll('.dungeon-room.visited').length,1);
  const allowed=[...w.document.querySelectorAll('.dungeon-room:not(:disabled)')].map(el=>el.dataset.id).sort();
  assert.deepEqual(allowed,E.availableNodes(original).map(n=>n.id).sort());
  assert.ok(w.document.querySelector('.dungeon-room.visited').disabled);
 }finally{dom.window.close();}
});
function fixtureRun(seed){const run=require('./helpers/legacy-run.cjs').newRun(seed);delete run.route;return run;} // Legacy/standalone scene fixtures.
test('DOM: actual Artifact language switch keeps the pending question, attempt state and selected choice',{skip:!JSDOM},async()=>{
 const fixture=require('./fixtures/education-v1_4-pending.json'),{dom,w,click,state}=boot(fixture);
 try{
  click('continue');const before=state(),pending=before.educationState.pending,english=w.document.querySelector('#education-prompt').textContent;
  const selector=w.document.getElementById('question-language-select');selector.value='ms';selector.dispatchEvent(new w.Event('change',{bubbles:true}));
  const after=state();assert.deepEqual(after.educationState,before.educationState);assert.equal(after.gold,before.gold);assert.equal(after.hp,before.hp);assert.equal(after.educationState.pending.questionId,pending.questionId);
  assert.notEqual(w.document.querySelector('#education-prompt').textContent,english);assert.match(w.document.querySelector('.education-question').textContent,/Petunjuk/);
  const restored=w.document.getElementById('question-language-select');restored.value='en';restored.dispatchEvent(new w.Event('change',{bubbles:true}));assert.equal(w.document.querySelector('#education-prompt').textContent,english);
  await new Promise(resolve=>setImmediate(resolve));
 }finally{dom.window.close();}
});
test('DOM: Mystery language switching preserves the exact question and running deadline',{skip:!JSDOM},async()=>{
 const {dom,w,click,state}=boot(mysteryRoom('ME01'));
 try{
  click('continue');click('mystery-start');const before=state();
  const selector=w.document.getElementById('question-language-select');selector.value='ms';selector.dispatchEvent(new w.Event('change',{bubbles:true}));
  const after=state();assert.deepEqual(after.mysteryState.pending,before.mysteryState.pending);assert.deepEqual(after.educationState,before.educationState);assert.equal(w.document.querySelector('.mystery-question').lang,'ms');
  assert.match(w.document.querySelector('.mystery-question').textContent,/Petunjuk|Cari|Diberi/);
  await new Promise(resolve=>setImmediate(resolve));
 }finally{dom.window.close();}
});
test('DOM: Education Practice exit waits for the trusted folio confirmation and keeps the run intact',{skip:!JSDOM},()=>{
 const r=E.newRun(21,'challenge'),{dom,w,click,state}=boot(r);
 try{
  const before=state();click('education-practice');
  const frame=w.document.querySelector('#education-practice-frame'),sent=[];
  frame.contentWindow.postMessage=(message,origin)=>sent.push({message,origin});
  click('education-practice-back');
  assert.equal(sent[0].message.type,'stm-education-practice-request-close');assert.equal(sent[0].origin,w.location.origin);
  assert.ok(w.document.querySelector('#education-practice-frame'));
  w.dispatchEvent(new w.MessageEvent('message',{data:{type:'stm-education-practice-close'},source:w,origin:w.location.origin}));
  assert.ok(w.document.querySelector('#education-practice-frame'),'Unrelated senders cannot close practice');
  w.dispatchEvent(new w.MessageEvent('message',{data:{type:'stm-education-practice-close'},source:frame.contentWindow,origin:'https://unrelated.example'}));
  assert.ok(w.document.querySelector('#education-practice-frame'),'Unrelated origins cannot close practice');
  w.dispatchEvent(new w.MessageEvent('message',{data:{type:'stm-education-practice-close'},source:frame.contentWindow,origin:w.location.origin}));
  assert.equal(w.document.querySelector('#education-practice-frame'),null);
  assert.equal(w.document.activeElement.dataset.action,'education-practice');assert.deepEqual(state(),before);
 }finally{dom.window.close();}
});
function boot(saved,storageBroken=false,options={}){const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8'),{url:'https://game.example/',runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window;if(options.AudioContext)w.AudioContext=options.AudioContext;if(options.settings)w.localStorage.setItem('duel-cube-settings.v1',JSON.stringify(options.settings));w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};w.HTMLAnchorElement.prototype.click=function(){};if(saved)w.localStorage.setItem('duel-cube-math.v1',JSON.stringify(saved));if(storageBroken)w.Storage.prototype.setItem=function(){throw new Error('storage unavailable');};for(const f of files)w.eval(fs.readFileSync(path.join(__dirname,'../dist',f),'utf8'));const click=(action,id)=>{const sel='[data-action="'+action+'"]'+(id?'[data-id="'+id+'"]':'');const el=w.document.querySelector(sel);assert.ok(el,sel);assert.equal(el.disabled,false,sel+' disabled');el.click();};return {dom,w,click,state:()=>JSON.parse(w.localStorage.getItem('duel-cube-math.v1'))};}
test('DOM: new game, mode, tutorial, battle and bank prediction guidance are wired',{skip:!JSDOM},()=>{
 const {dom,w,click,state}=boot();
 try{
  click('new');click('start-learn');assert.match(w.document.querySelector('#dialog').textContent,/Tutorial/);click('close');
  const entry=E.availableNodes(state()).find(n=>n.type==='battle');click('node',entry.id);click('forecast');
  const q=w.DCEducation.catalog[state().battle.question.questionId],wrong=q.choices.find(c=>c.id!==q.correctChoiceId).id;
  assert.equal(w.document.querySelector('#prob-answer'),null);assert.ok(w.document.querySelector('[data-question-id="'+q.id+'"]'));
  click('forecast-support');click('forecast-select',wrong);click('forecast-check');
  assert.equal(state().battle.question.attempts.length,1);assert.equal(state().hp,60);
  const more=w.document.querySelector('[data-action=forecast-support][data-kind=moreHint]');assert.equal(more.disabled,false);more.click();assert.ok(w.document.querySelector('#forecast-more-hint'));
  click('forecast-select',q.correctChoiceId);click('forecast-check');assert.equal(state().battle.question.solved,true);assert.equal(state().battle.focus,0);assert.match(w.document.querySelector('.education-feedback').textContent,/support|retry/);
  click('close');assert.equal(state().battle.question,null);assert.equal(w.document.querySelector('[data-action=forecast]').disabled,true);click('end-turn');assert.equal(state().battle.turn,2);
 }finally{dom.window.close();}
});
test('DOM: filter selection cancels freely and commits exact selected cards',{skip:!JSDOM},()=>{const r=fixtureRun(91);E.startBattle(r,'wisp');const all=[...r.battle.hand,...r.battle.draw];const keys=['filter','draw','strike','guard'];const hand=[];for(const k of keys){const i=all.findIndex(c=>c.key===k);hand.push(all.splice(i,1)[0]);}r.battle.hand=hand;r.battle.draw=all;assert.ok(E.validate(r));const {dom,w,click,state}=boot(r);try{click('continue');const id=hand.find(c=>c.key==='filter').uid;click('play',id);click('close');assert.equal(state().battle.energy,3);click('play',id);const targets=state().battle.draw.slice(0,2).map(c=>c.uid);for(const target of targets)click('select-filter',target);click('apply-filter');assert.equal(state().battle.energy,2);assert.deepEqual(state().battle.exhaust.map(c=>c.uid).sort(),targets.sort());assert.ok(E.validate(state()));}finally{dom.window.close();}});
test('DOM: camp upgrade, Mystery intro/leave, library and save controls work',{skip:!JSDOM},()=>{const r=fixtureRun(21);r.scene='camp';r.depth=2;const {dom,w,click,state}=boot(r);try{click('continue');w.document.querySelector('[data-action=select-rest][data-value=upgrade]').click();assert.equal(state().scene,'camp');click('upgrade');click('choose-upgrade',r.deck[0].uid);assert.equal(state().deck[0].upgraded,true);assert.equal(state().depth,3);click('node');assert.ok(w.document.querySelector('[data-action=mystery-start]'));click('mystery-leave');assert.equal(state().deck.length,12);assert.equal(state().depth,4);click('home');click('library');assert.equal(w.document.querySelectorAll('#dialog .collection-cards .playing-card').length,6);click('close');click('saves');assert.ok(w.document.querySelector('[data-action=export]'));assert.ok(w.document.querySelector('[data-action=import]'));}finally{dom.window.close();}});
test('DOM: corrupted storage and unavailable storage leave a usable new-game screen',{skip:!JSDOM},()=>{for(const saved of [{version:1,deck:[]},null]){const {dom,w}=boot(saved,saved===null);try{assert.ok(w.document.querySelector('[data-action=new]'));assert.equal(w.document.querySelector('#storage-warning').hidden,false);}finally{dom.window.close();}}});
test('DOM: every terminal, reward, map and event scene renders without runtime errors',{skip:!JSDOM},()=>{for(const scene of ['map','reward','camp','event','stageclear','defeat','victory']){const r=fixtureRun(21);if(['reward','stageclear','defeat','victory'].includes(scene))E.startBattle(r,scene==='victory'?'dealer':'sentinel');r.scene=scene;if(scene==='camp')r.depth=2;if(scene==='event')r.depth=3;if(scene==='stageclear')r.depth=4;if(scene==='defeat')r.hp=0;if(scene==='victory'){r.stage=1;r.depth=4;r.battle.hp=0;r.battle.seals=2;}if(scene==='reward')r.rewards=['blast','fort','balance'];const {dom,w,click}=boot(r);try{click('continue');assert.ok(w.document.querySelector('#game').textContent.trim().length>30);assert.equal(w.document.querySelector('#game').innerHTML.includes('undefined'),false,scene);}finally{dom.window.close();}}});
test('DOM: importing a pending prediction clears unrelated success and restores exact question',{skip:!JSDOM},async()=>{
 const old=fixtureRun(1);E.startBattle(old,'wisp');const incoming=fixtureRun(2026);E.startBattle(incoming,'wisp');E.forecast(incoming);
 const {dom,w,click,state}=boot(old);
 try{
  click('continue');click('forecast');let q=w.DCEducation.catalog[state().battle.question.questionId];click('forecast-select',q.correctChoiceId);click('forecast-check');click('close');click('saves');
  const input=w.document.querySelector('#import-file');Object.defineProperty(input,'files',{configurable:true,value:[{size:JSON.stringify(incoming).length,text:async()=>JSON.stringify(incoming)}]});input.dispatchEvent(new w.Event('change',{bubbles:true}));await new Promise(resolve=>setImmediate(resolve));click('confirm-import');
  assert.equal(state().battle.question.solved,false);assert.equal(w.document.querySelector('.forecast-bank').dataset.questionId,incoming.battle.question.questionId);assert.equal(w.document.querySelector('#prob-answer'),null);assert.equal(w.document.querySelector('.education-feedback.solved'),null);assert.equal(w.document.querySelector('[data-action=forecast-check]').disabled,true);
 }finally{dom.window.close();}
});
test('DOM: retry asks before replacing the terminal run',{skip:!JSDOM},()=>{const r=fixtureRun(81);E.startBattle(r,'wisp');r.hp=0;r.scene='defeat';const {dom,w,click,state}=boot(r);try{click('continue');click('retry');assert.equal(state().scene,'defeat');assert.ok(w.document.querySelector('[data-action=confirm-retry]'));click('confirm-retry');assert.equal(state().scene,'map');assert.equal(state().hp,60);}finally{dom.window.close();}});
test('DOM: closing an untouched prediction consumes exposure and focuses End Turn',{skip:!JSDOM},()=>{const r=fixtureRun(1);E.startBattle(r,'wisp');const {dom,w,click}=boot(r);try{click('continue');w.document.querySelector('[data-action=forecast]').focus();click('forecast');click('close');assert.equal(w.document.activeElement.dataset.action,'end-turn');}finally{dom.window.close();}});
test('DOM: Music controls preserve volume, preview every track and return to game music',{skip:!JSDOM},()=>{const {dom,w,click}=boot();try{assert.equal(w.document.documentElement.lang,'en');click('music');const range=w.document.querySelector('#music-volume');range.focus();range.value='23';range.dispatchEvent(new w.Event('input',{bubbles:true}));assert.equal(w.document.activeElement,range);assert.equal(JSON.parse(w.localStorage.getItem('duel-cube-settings.v1')).musicVolume,.23);assert.equal(w.document.querySelectorAll('[data-action=preview-track]').length,10);click('music-mute');assert.equal(w.DCAudio.state.muted,true);const elite=w.document.querySelector('[data-track=stage2_elite]');elite.click();assert.equal(w.DCAudio.state.requested,'stage2_elite');assert.equal(w.DCAudio.state.muted,false);click('close');assert.equal(w.DCAudio.state.requested,'menu');assert.equal(w.DCAudio.state.preview,null);}finally{dom.window.close();}});
test('DOM: Unmute Music enables audio on that click when both channels were saved off',{skip:!JSDOM},async()=>{
 let contexts=0;const param=()=>({value:0,cancelScheduledValues(){},setValueAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;}});
 class Context{constructor(){contexts++;this.state='running';this.currentTime=0;this.destination={};}createGain(){return {gain:param(),connect(){}};}resume(){this.state='running';return Promise.resolve();}}
 const {dom,w,click}=boot(null,false,{AudioContext:Context,settings:{sound:false,musicMuted:true}});
 try{click('music');assert.equal(contexts,0);click('music-mute');await new Promise(r=>setImmediate(r));assert.equal(contexts,1);assert.equal(w.DCAudio.state.unlocked,true);assert.equal(w.DCAudio.state.muted,false);}finally{dom.window.close();}
});
test('DOM: portable HTML boots without external scripts/styles and embeds all images',{skip:!JSDOM},async()=>{const portableSource=fs.readFileSync(path.join(__dirname,'../SLAY-THE-MATH-OFFLINE.html'),'utf8');
// Verify the real bytes, then elide them only for jsdom's DOM/interaction test.
// Its HTML parser duplicates very large base64 script text; Chromium decodes
// the unmodified portable file in artifacts-browser.cjs.
for(const name of fs.readdirSync(path.join(__dirname,'../dist/assets')).filter(n=>n.startsWith('artifact-')&&n.endsWith('.webp'))){const encoded=fs.readFileSync(path.join(__dirname,'../dist/assets',name)).toString('base64');assert.ok(encoded.length>100&&portableSource.includes(encoded),name+' must be embedded');}
const html=portableSource.replace(/(data:(?:image\/(?:svg\+xml|png|webp)|audio\/mpeg);base64,)[A-Za-z0-9+/=]+/g,'$1AA==');
const dom=new JSDOM(html,{url:'https://portable.example/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};}});try{await new Promise(resolve=>setImmediate(resolve));const d=dom.window.document;assert.equal(d.querySelectorAll('script[src],link[rel=stylesheet]').length,0);assert.ok(d.querySelector('[data-action=new]'));for(const img of d.querySelectorAll('img'))assert.match(img.src,/^data:image\/(svg\+xml|png|webp);base64,/);d.querySelector('[data-action=new]').click();d.querySelector('[data-action=start-learn]').click();d.querySelector('[data-action=close]').click();d.querySelector('.dungeon-room.battle[data-action=node]').click();await new Promise(resolve=>setImmediate(resolve));assert.ok(d.querySelector('[data-action=end-turn]'));for(const img of d.querySelectorAll('img'))assert.match(img.src,/^data:image\/(svg\+xml|png|webp);base64,/);d.querySelector('[data-action=library]').click();assert.equal(d.querySelectorAll('#dialog .collection-cards .playing-card').length,6);for(const img of d.querySelectorAll('#dialog img'))assert.match(img.src,/^data:image\/(svg\+xml|png|webp);base64,/);
 d.querySelector('[data-action=close]').click();d.querySelector('[data-action=home]').click();d.querySelector('[data-action=new]').click();d.querySelector('[data-action=start-new]').click();d.querySelector('[data-action=start-challenge]').click();
 assert.equal(d.querySelectorAll('.artifact-card').length,3);for(const img of d.querySelectorAll('.artifact-encounter img'))assert.match(img.src,/^data:image\/webp;base64,/);
 d.querySelector('[data-action=select-artifact]').click();d.querySelector('[data-action=claim-artifact]').click();assert.ok(d.querySelector('[data-question-id]'));completeDomTrial(dom.window);assert.ok(d.querySelector('.dungeon-atlas'));
 assert.equal(JSON.parse(dom.window.localStorage.getItem('duel-cube-math.v1')).artifactState.owned.length,1);
 }finally{dom.window.close();}});

test('DOM: artifact preview grants nothing, Challenge confirmation commits once and inventory uses the shared dialog',{skip:!JSDOM},()=>{
 const {dom,w,click,state}=boot();try{
  click('new');click('start-challenge');const initial=state();assert.equal(initial.scene,'master');assert.equal(w.document.querySelector('#dialog').open,false);
  const chosen=initial.artifactState.offer.ids[0];click('select-artifact',chosen);assert.equal(state().artifactState.owned.length,0);assert.equal(state().gold,80);
  click('claim-artifact');assert.equal(state().scene,'education');assert.equal(state().artifactState.owned.length,0);completeDomTrial(w);assert.equal(state().scene,'map');assert.deepEqual(state().artifactState.owned,[chosen]);
  click('artifacts');assert.match(w.document.querySelector('#dialog').textContent,/Your Artifacts/);assert.equal(w.document.querySelectorAll('.owned-artifact').length,1);click('close');
  assert.ok(E.validate(state()));
 }finally{dom.window.close();}
});


test('DOM: reward preview does not claim a card until Add is pressed',{skip:!JSDOM},()=>{
 const r=fixtureRun(4);E.startBattle(r,'wisp');r.scene='reward';r.rewards=['guard','filter','strike'];const {dom,w,click,state}=boot(r);
 try{click('continue');w.document.querySelector('[data-action=select-reward][data-key=filter]').click();assert.equal(state().scene,'reward');assert.equal(state().deck.length,12);w.document.querySelector('[data-action=reward]').click();assert.equal(state().deck.length,13);assert.equal(state().deck.at(-1).key,'filter');}finally{dom.window.close();}
});
test('DOM: collection search, category, empty result, clear and pagination retain working details',{skip:!JSDOM},()=>{
 const {dom,w,click}=boot();try{click('library');assert.equal(w.document.querySelectorAll('.collection-cards .playing-card').length,6);w.document.querySelector('[data-action=library-page][data-page="1"]').click();assert.equal(w.document.querySelectorAll('.collection-cards .playing-card').length,6);let input=w.document.querySelector('#card-search');input.value='nonexistent';input.dispatchEvent(new w.Event('input',{bubbles:true}));assert.match(w.document.querySelector('.collection-cards').textContent,/No cards found/);click('clear-search');assert.equal(w.document.querySelector('#card-search').value,'');w.document.querySelector('[data-action=library-role][data-value=guard]').click();assert.equal(w.document.querySelectorAll('.collection-cards .playing-card').length,6);assert.ok(w.document.querySelector('.collection-count').textContent.includes('10 / 40'));assert.ok([...w.document.querySelectorAll('.collection-cards .playing-card')].every(el=>el.classList.contains('guard')));}finally{dom.window.close();}
});
test('DOM: tutorial practice gives feedback without changing the run or awarding Focus',{skip:!JSDOM},()=>{
 const r=E.newRun(7);const {dom,w,click,state}=boot(r);try{click('help');w.document.querySelector('[data-action=help-page][data-page="1"]').click();w.document.querySelector('[data-action=practice-answer][data-value="1/2"]').click();click('check-practice');assert.match(w.document.querySelector('.practice-feedback').textContent,/Correct/);assert.deepEqual(state(),r);}finally{dom.window.close();}
});

test('DOM: Claim opens the actual bank question, saves incorrect/hint state and resumes it before the map',{skip:!JSDOM},()=>{
 const {dom,w,click,state}=boot();let pending;
 try{
  click('new');click('start-challenge');click('select-artifact',state().artifactState.offer.ids[0]);click('claim-artifact');
  assert.equal(state().scene,'education');assert.equal(w.document.querySelector('.dungeon-atlas'),null);assert.equal(state().artifactState.owned.length,0);
  const q=w.DCEducation.current(state()),wrong=q.choices.find(c=>c.id!==q.correctChoiceId).id;
  assert.equal(w.document.querySelectorAll('[data-action=education-select]').length,4);assert.equal(w.document.querySelector('[data-question-id]').dataset.questionId,q.id);assert.ok(w.document.querySelector('#education-prompt').textContent.length>15);
  assert.equal(w.document.querySelector('[data-action=education-check]').disabled,true);click('education-select',wrong);click('education-check');click('education-hint');
  assert.match(w.document.querySelector('#education-feedback').textContent,/Not quite/);assert.equal(w.document.querySelectorAll('#education-hint [data-q-rich^="hint:"]').length,2);assert.ok(w.document.querySelector('#education-hint').textContent.length>40);pending=state();
  click('home');click('continue');assert.equal(w.document.querySelector('[data-question-id]').dataset.questionId,q.id);
 }finally{dom.window.close();}
 const again=boot(pending);
 try{again.click('continue');assert.equal(again.state().educationState.pending.hinted,true);assert.equal(again.state().educationState.pending.attempts.length,1);completeDomTrial(again.w);assert.equal(again.state().scene,'map');assert.equal(again.state().artifactState.owned.length,1);assert.equal(again.state().educationState.completed[0].first,false);assert.ok(E.validate(again.state()));}finally{again.dom.window.close();}
});

test('DOM: continue preserves an unfinished trial; New Run resets exclusion and keeps lifetime history',{skip:!JSDOM},()=>{
 const {dom,w,click,state}=boot();
 try{
  click('new');click('start-challenge');click('select-artifact',state().artifactState.offer.ids[0]);click('claim-artifact');
  const frozen=state().educationState.pending,first=frozen.questionId;
  click('home');click('continue');assert.deepEqual(state().educationState.pending,frozen);
  click('home');click('new');click('start-new');click('start-challenge');
  assert.equal(state().educationState?.runUsedIds?.length||0,0);assert.equal(state().educationState?.pending||null,null);
  click('select-artifact',state().artifactState.offer.ids[0]);click('claim-artifact');
  const id=state().educationState.pending.questionId;assert.equal(state().educationState.runUsedIds.length,1);
  completeDomTrial(w);const profile=JSON.parse(w.localStorage.getItem('duel-cube-question-history.v1'));
  assert.ok(profile.usedIds.includes(first));assert.ok(profile.usedIds.includes(id));assert.equal(profile.usedIds.length,new Set([first,id]).size);
 }finally{dom.window.close();}
});
test('DOM: import preserves the pending question and unions local and imported exposure history',{skip:!JSDOM},async()=>{
 const Q=require('../dist/education.js'),first=E.newRun(4,'challenge');E.chooseArtifact(first,E.artifactChoices(first)[0].id);
 const incoming=E.newRun(50,'challenge');E.chooseArtifact(incoming,E.artifactChoices(incoming)[0].id);assert.notEqual(Q.current(first).id,Q.current(incoming).id);
 const {dom,w,click,state}=boot(first);
 try{
  click('continue');click('saves');const file=w.document.querySelector('#import-file');Object.defineProperty(file,'files',{configurable:true,value:[{size:JSON.stringify(incoming).length,text:async()=>JSON.stringify(incoming)}]});
  file.dispatchEvent(new w.Event('change',{bubbles:true}));await new Promise(resolve=>setImmediate(resolve));click('confirm-import');
  assert.equal(state().scene,'education');assert.equal(state().educationState.pending.questionId,Q.current(incoming).id);assert.equal(w.document.querySelector('#dialog').open,false);
  const profile=JSON.parse(w.localStorage.getItem('duel-cube-question-history.v1'));assert.ok(profile.usedIds.includes(Q.current(first).id));assert.ok(profile.usedIds.includes(Q.current(incoming).id));assert.ok(state().educationState.usedIds.includes(Q.current(first).id),'Exportable run must carry pre-import local exposure IDs');
 }finally{dom.window.close();}
});

test('DOM: storage failure keeps the trial playable and warns that progress needs Export',{skip:!JSDOM},()=>{
 const {dom,w,click}=boot(null,true);
 try{
  click('new');click('start-challenge');click('select-artifact',w.document.querySelector('[data-action=select-artifact]').dataset.id);click('claim-artifact');
  const id=w.document.querySelector('[data-question-id]').dataset.questionId,q=w.DCEducation.catalog[id];
  assert.ok(q);assert.equal(w.document.querySelector('#storage-warning').hidden,false);click('education-select',q.correctChoiceId);click('education-check');click('education-continue');assert.ok(w.document.querySelector('.dungeon-atlas'));
 }finally{dom.window.close();}
});

test('DOM: corrupt question history is preserved and cannot silently reset the draw pool',{skip:!JSDOM},()=>{
 const {dom,w,click,state}=boot(E.newRun(7,'challenge'));
 try{
  const raw='{invalid-history';w.localStorage.setItem('duel-cube-question-history.v1',raw);click('continue');click('select-artifact',state().artifactState.offer.ids[0]);click('claim-artifact');
  assert.equal(state().scene,'master');assert.equal(w.document.querySelector('[data-question-id]'),null);assert.equal(w.localStorage.getItem('duel-cube-question-history.v1'),raw);assert.match(w.document.querySelector('#storage-warning').textContent,/Question history cannot be read/);
 }finally{dom.window.close();}
});

test('DOM: a full hand exposes its cap, disabled-card inspection and the tenth-card shortcut',{skip:!JSDOM},()=>{
 const r=fixtureRun(7);E.startBattle(r,'wisp');r.battle.hp=r.battle.maxHp=200;E.draw(r,6);
 const {dom,w,click,state}=boot(r);
 try{click('continue');assert.match(w.document.querySelector('.hand-count').textContent,/10 \/ 10/);
  for(const b of w.document.querySelectorAll('.hand button:disabled'))assert.equal(b.parentElement.tabIndex,0);
  const expected=E.clone(state()),tenth=expected.battle.hand[9];assert.equal(E.canPlay(expected,tenth),'');E.playCard(expected,tenth.uid);
  w.document.body.dispatchEvent(new w.KeyboardEvent('keydown',{key:'0',bubbles:true,cancelable:true}));assert.deepEqual(state(),expected);
 }finally{dom.window.close();}
});


test('DOM: artifact counters project real card resolution and opening effects without replay',{skip:!JSDOM},()=>{
 const A=require('../dist/artifacts'),r=require('./helpers/legacy-run.cjs').newRun(17,'challenge');require('./helpers/education.cjs').claimArtifact(r,E.artifactChoices(r)[0].id);delete r.route;
 for(const code of ['e01','e02','e03','e07','e08'])if(!A.has(r,code))A.acquire(r,A.id(code),'fixture:'+code);
 E.startBattle(r,'wisp');const pool=[...r.battle.hand,...r.battle.draw];r.battle.hand=[];
 for(const key of ['strike','ember','guard','draw'])r.battle.hand.push(pool.splice(pool.findIndex(c=>c.key===key),1)[0]);r.battle.draw=pool;r.battle.hp=r.battle.maxHp=200;r.battle.enemyBlock=0;
 const {dom,w,click,state}=boot(r);
 try{click('continue');const tracker=w.STMMechanicsHost.tracker;assert.equal(tracker.status(A.id('e01')).counter.current,0);assert.equal(tracker.status(A.id('e03')).state,'used');
  const q0=state().educationState.session,oldRng=state().artifactState.rng,energy=state().battle.energy;
  for(const key of ['strike','guard','ember']){const card=state().battle.hand.find(c=>c.key===key);click('play',card.uid);}
  assert.equal(tracker.status(A.id('e01')).state,'used');assert.equal(tracker.status(A.id('e02')).state,'used');assert.equal(tracker.turnCounts.cards,3);assert.equal(state().battle.energy,energy-2);assert.equal(state().artifactState.rng,oldRng);assert.deepEqual(state().educationState.session,q0);
  const resolved=state();click('artifacts');click('close');assert.deepEqual(state(),resolved);click('home');click('continue');assert.equal(tracker.turnCounts.cards,3);assert.equal(tracker.status(A.id('e01')).state,'used');assert.ok(E.validate(state()));
 }finally{dom.window.close();}
});

test('DOM: Collection tab keyboard focus survives the modal render frame',{skip:!JSDOM},async()=>{
 const {dom,w,click}=boot();try{click('library');w.document.querySelector('[data-action=collection-tab][data-kind=artifacts]').click();const tab=w.document.querySelector('#collection-tab-artifacts');tab.focus();tab.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true}));await new Promise(resolve=>w.requestAnimationFrame(resolve));assert.equal(w.document.activeElement.id,'collection-tab-cards');w.document.activeElement.dispatchEvent(new w.KeyboardEvent('keydown',{key:'End',bubbles:true,cancelable:true}));await new Promise(resolve=>w.requestAnimationFrame(resolve));assert.equal(w.document.activeElement.id,'collection-tab-artifacts');assert.equal(w.document.querySelectorAll('[role=tab][tabindex="0"]').length,1);}finally{dom.window.close();}
});

test('DOM: a corrupt Artifact Codex profile is preserved while the core run stays playable',{skip:!JSDOM},()=>{
 const {dom,w,click,state}=boot(E.newRun(7,'challenge'));try{const bad='{broken-codex';w.localStorage.setItem('slay-the-math.artifact-codex.v1',bad);click('continue');click('select-artifact',state().artifactState.offer.ids[0]);assert.equal(w.localStorage.getItem('slay-the-math.artifact-codex.v1'),bad);assert.ok(E.validate(state()));}finally{dom.window.close();}
});

// The live event controls share the question rich-text renderer and never nest
// a tooltip trigger inside an answer-selection button.
test('DOM: Mystery Hint, one answer, final review, card removal and profile exposure survive restore',{skip:!JSDOM},()=>{
 const r=mysteryRoom('ME10'),{dom,w,click,state}=boot(r);
 try{click('continue');click('mystery-start');assert.equal(w.document.activeElement.id,'mystery-title');let saved=state(),p=saved.mysteryState.pending,q=w.DCEducation.catalog[p.questionId];assert.ok(w.document.querySelector('#mystery-countdown'));assert.equal(w.document.querySelector('button button'),null);
 const term=w.document.querySelector('.mystery-question button[data-richtext-kind]');if(term){term.focus();assert.ok(w.document.querySelector('[role=tooltip]'));assert.equal(state().mysteryState.pending.phase,'question');}
 w.document.querySelector('[data-action=mystery-support][data-kind=hint]').click();assert.ok(w.document.querySelector('.education-hint'));
 click('mystery-answer',q.correctChoiceId);assert.equal(state().mysteryState.pending.phase,'review');assert.equal(w.document.querySelector('.mystery-review strong').textContent,q.choices.find(c=>c.id===q.correctChoiceId).text);assert.ok(w.document.querySelector('[data-q-rich=explanation]').textContent.trim().length>20);assert.equal(w.document.querySelectorAll('[data-action=mystery-answer]:not(:disabled)').length,0);
 click('mystery-continue');click('mystery-option','remove');assert.equal(w.document.activeElement.dataset.action,'mystery-option');click('mystery-target',r.deck[0].uid);assert.equal(w.document.activeElement.dataset.action,'mystery-target');click('mystery-claim');saved=state();assert.equal(saved.scene,'map');assert.equal(saved.deck.length,r.deck.length-1);assert.ok(E.restore(saved));
 const history=JSON.parse(w.localStorage.getItem('duel-cube-question-history.v1'));assert.ok(history.usedIds.includes(q.id));assert.ok(w.DCEducation.validHistory(history));
 }finally{dom.window.close();}
});

test('DOM: Shop tabs reveal one inventory and support arrow, Home and End navigation without spending',{skip:!JSDOM},()=>{
 const {dom,w,click,state}=boot(shopRoom());
 try{
  click('continue');const d=w.document,before=state(),tabs=[...d.querySelectorAll('[role=tab][data-action=shop-tab]')];
  assert.deepEqual(tabs.map(t=>t.textContent.trim()),['Buy Cards','Buy Artifacts','Remove Card']);
  const active=()=>d.querySelector('[role=tab][aria-selected=true]');
  const panel=()=>d.querySelector('[role=tabpanel]:not([hidden])');
  assert.equal(active().id,'shop-tab-cards');assert.equal(panel().querySelectorAll('[data-action=buy-card]').length,6);
  assert.equal(d.querySelectorAll('[role=tabpanel]:not([hidden])').length,1);
  click('shop-tab','artifacts');assert.equal(active().id,'shop-tab-artifacts');assert.equal(d.activeElement.id,active().id);
  assert.equal(panel().querySelectorAll('[data-action=buy-artifact]').length,6);assert.equal(d.querySelector('#shop-panel-cards').hidden,true);
  active().dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));
  assert.equal(active().id,'shop-tab-remove');assert.ok(panel().querySelector('[data-action=shop-remove]'));
  active().dispatchEvent(new w.KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true}));assert.equal(active().id,'shop-tab-cards');
  active().dispatchEvent(new w.KeyboardEvent('keydown',{key:'End',bubbles:true,cancelable:true}));assert.equal(active().id,'shop-tab-remove');
  assert.equal(tabs.length,3);assert.deepEqual(state(),before);assert.equal(d.querySelector('button button'),null);
 }finally{dom.window.close();}
});

test('DOM: Shop tab purchases and removal retain sold state, confirmation and valid return to map',{skip:!JSDOM},()=>{
 const {dom,w,click,state}=boot(shopRoom('challenge'));
 try{
  click('continue');click('shop-tab','artifacts');let r=state(),cost=E.shopPrice(r,r.shop.artifacts[0]);
  w.document.querySelector('[data-action=buy-artifact][data-index="0"]').click();
  assert.equal(state().gold,r.gold-cost);assert.equal(state().scene,'shop');assert.ok(state().shop.artifactBought.includes(0));
  assert.equal(w.document.querySelector('[role=tab][aria-selected=true]').id,'shop-tab-artifacts');
  click('shop-tab','cards');click('shop-tab','artifacts');assert.ok(w.document.querySelector('[data-action=buy-artifact][data-index="0"]').disabled);
  click('shop-tab','remove');const before=state();click('shop-remove');click('choose-shop-remove',before.deck[0].uid);click('close');assert.deepEqual(state(),before);
  click('shop-remove');click('choose-shop-remove',before.deck[0].uid);click('confirm-shop-remove');r=state();
  assert.equal(r.deck.length,before.deck.length-1);assert.ok(r.shop.removed);assert.ok(E.restore(r));assert.ok(w.document.querySelector('[data-action=shop-remove]').disabled);
  click('leave-shop');assert.equal(state().scene,'map');
 }finally{dom.window.close();}
});

test('DOM: Mystery room text uses shared game terms and honest preview calculations before Start and in rewards',{skip:!JSDOM},()=>{
 const r=mysteryRoom('ME02'),{dom,w,click,state}=boot(r);
 try{
  click('continue');const d=w.document,before=state(),hp=d.querySelector('.mystery-stakes [data-glossary-id=hp]');
  assert.ok(hp,'The intro must explain game terms before starting a question');hp.focus();assert.ok(d.querySelector('[role=tooltip]'));
  assert.match(d.querySelector('[role=tooltip]').textContent,/HP|Health/);hp.click();assert.deepEqual(state(),before);
  const number=d.querySelector('.mystery-stakes [data-category=calculation]');assert.ok(number);number.focus();number.click();
  assert.match(d.querySelector('[role=tooltip]').textContent,/Preview/);assert.match(d.querySelector('[role=tooltip]').textContent,/40 − 5 = 35/);assert.deepEqual(state(),before);
  assert.equal(d.querySelector('button button'),null);assert.equal(state().mysteryState.pending.questionId,null);
  click('mystery-start');const pending=state().mysteryState.pending,q=w.DCEducation.catalog[pending.questionId];
  assert.ok(d.querySelector('.mystery-question [data-category=math]'));click('mystery-answer',q.correctChoiceId);click('mystery-continue');
  assert.ok(d.querySelector('.mystery-panel [data-glossary-id=hp]'));assert.ok(d.querySelector('.mystery-panel [data-category=calculation]'));
  assert.equal(state().hp,before.hp);assert.equal(d.querySelector('button button'),null);
 }finally{dom.window.close();}
});

test('DOM: Mystery extra-draw preview explains the hand cap without starting a challenge',{skip:!JSDOM},()=>{
 const {dom,w,click,state}=boot(mysteryRoom('ME14'));
 try{
  click('continue');const before=state(),number=w.document.querySelector('.mystery-stakes dd [data-category=calculation]');
  assert.ok(number,'The authored 2 extra cards must expose its preview');assert.equal(number.textContent,'2');number.focus();
  assert.match(w.document.querySelector('[role=tooltip]').textContent,/hand limit is 10 cards/);
  assert.match(w.document.querySelector('[role=tooltip]').textContent,/Actual extra draws depend/);assert.deepEqual(state(),before);
 }finally{dom.window.close();}
});

test('DOM: Mystery failed review distinguishes maximum HP loss from the capped current loss',{skip:!JSDOM},()=>{
 const r=mysteryRoom('ME01');r.hp=2;const {dom,w,click,state}=boot(r);
 try{
  click('continue');click('mystery-start');const q=w.DCEducation.catalog[state().mysteryState.pending.questionId];
  click('mystery-answer',q.choices.find(c=>c.id!==q.correctChoiceId).id);const before=state(),number=w.document.querySelector('.mystery-review>p[data-stm-richtext] [data-category=calculation]');
  assert.ok(number,'The authored maximum loss must retain its preview in review');assert.equal(number.textContent,'4');number.focus();
  const popup=w.document.querySelector('[role=tooltip]').textContent;assert.match(popup,/Maximum HP loss/);assert.match(popup,/Actual loss: min\(4, max\(0, 2 − 1\)\) = 1 HP/);
  assert.deepEqual(state(),before);assert.equal(state().hp,2);
 }finally{dom.window.close();}
});


test('DOM: Settings owns the menu language preference and carries BM into the real Artifact trial',{skip:!JSDOM},async()=>{
 const {dom,w,click,state}=boot();
 try{
  const menu=w.document.querySelector('[data-action=education-practice]');assert.match(menu.textContent,/120 questions/);
  assert.equal(w.document.querySelector('.home-question-language'),null);
  click('saves');const language=w.document.getElementById('settings-question-language-select');assert.ok(language);language.value='ms';language.dispatchEvent(new w.Event('change',{bubbles:true}));
  assert.equal(w.document.getElementById('dialog').open,true);assert.equal(w.document.activeElement.id,'settings-question-language-select');
  assert.equal(w.document.querySelector('[data-game-version]').textContent,'v'+require('../package.json').version);click('close');
  assert.equal(w.DCQuestionLanguage.language(),'ms');assert.equal(w.localStorage.getItem('duel-cube-math.v1'),null);
  click('new');click('start-challenge');click('select-artifact',state().artifactState.offer.ids[0]);click('claim-artifact');
  const source=w.DCEducation.current(state()),expected=w.DCQuestionLanguage.question(source,'ms');
  // MathML layout omits whitespace around operators and set members. Compare
  // authored content independently of those presentation-only text boundaries.
  assert.equal(w.document.getElementById('question-language-select').value,'ms');const reference=w.document.createElement('p'),expectedView=w.STMMechanics.session.selectLearningView(expected,w.DCEducation.record(state()));w.STMMechanics.renderRichText(reference,expectedView.prompt,{glossary:w.STMMechanics.data.glossary});assert.equal(w.document.getElementById('education-prompt').textContent.replace(/\s/g,''),reference.textContent.replace(/\s/g,''));
  assert.ok(w.document.querySelector('.education-given'));assert.ok(w.document.querySelector('.education-find'));
  assert.match(w.document.querySelector('.question-hint-rule').textContent,/Petunjuk/);const before=state();
  click('home');click('saves');assert.equal(w.document.getElementById('settings-question-language-select').value,'ms');assert.deepEqual(state().educationState,before.educationState);
  await new Promise(resolve=>setImmediate(resolve));
 }finally{dom.window.close();}
});
test('DOM: in-game Hint retains the folio reference grid after solution, in both languages',{skip:!JSDOM},()=>{
 const {dom,w}=boot();
 try{
  for(const language of ['en','ms']){
   w.DCQuestionLanguage.setLanguage(language);const source=w.STMMechanics.data.bank.questions.find(q=>q.id==='PROB-001'),q=w.DCQuestionLanguage.question(source,language),M=w.STMMechanics;
   let session=M.session.reserveNext(M.session.createSession({seed:1}),{...w.DCEducation.bank,questions:[source]}).session;
   session=M.session.openSupport(session,source.id,'hint');
   session=M.session.submitAnswer(session,w.DCEducation.bank,{questionId:source.id,choiceId:source.correctChoiceId,attemptId:'parity-'+language});
   const record=session.records[source.id],view=M.session.selectLearningView(q,record),host=w.document.createElement('section');host.className='education-question';w.document.body.append(host);
   host.innerHTML=w.STMMechanicsHost.supportHTML(q,record,view,{esc:text=>String(text)});w.STMMechanicsHost.hydrateQuestion(host,q,view);
   const cells=[...host.querySelectorAll('#education-hint td')].map(c=>c.textContent.replace(/\s/g,''));assert.ok(cells.includes('(H,1)'));assert.ok(cells.includes('(T,4)'));assert.ok(!cells.includes('?'));
   assert.equal(host.querySelectorAll('#education-hint [data-q-rich^="hint:"]').length,2);assert.ok(host.querySelector('details.question-solution-visual'));host.remove();
  }
 }finally{dom.window.close();}
});
