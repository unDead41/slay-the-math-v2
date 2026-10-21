const {completeDomTrial}=require('./helpers/education.cjs');
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const E=require('../dist/engine.js');
let JSDOM;try{({JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom'));}catch{}
const files=['config.js','math.js','map-rng.js','map.js','artifact-data.js','rich-text-data.js','rich-text.js','artifacts.js','question-data.js','education.js','engine.js','music-data.js','audio.js','visuals.js','animation-data.js','animation.js','artifact-ui.js','app.js'];
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
  assert.equal(w.document.querySelector('[data-stm-map]').firstElementChild.matches('.map-rail'),true);
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
function fixtureRun(seed){const run=E.newRun(seed);delete run.route;return run;} // Legacy/standalone scene fixtures.
function boot(saved,storageBroken=false,options={}){const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8'),{url:'https://game.example/',runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window;if(options.AudioContext)w.AudioContext=options.AudioContext;if(options.settings)w.localStorage.setItem('duel-cube-settings.v1',JSON.stringify(options.settings));w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};w.HTMLAnchorElement.prototype.click=function(){};if(saved)w.localStorage.setItem('duel-cube-math.v1',JSON.stringify(saved));if(storageBroken)w.Storage.prototype.setItem=function(){throw new Error('storage unavailable');};for(const f of files)w.eval(fs.readFileSync(path.join(__dirname,'../dist',f),'utf8'));const click=(action,id)=>{const sel='[data-action="'+action+'"]'+(id?'[data-id="'+id+'"]':'');const el=w.document.querySelector(sel);assert.ok(el,sel);assert.equal(el.disabled,false,sel+' disabled');el.click();};return {dom,w,click,state:()=>JSON.parse(w.localStorage.getItem('duel-cube-math.v1'))};}
test('DOM: new game, mode, tutorial, battle and forecast error/correction are wired',{skip:!JSDOM},()=>{const {dom,w,click,state}=boot();try{click('new');click('start-learn');assert.match(w.document.querySelector('#dialog').textContent,/Tutorial/);click('close');assert.equal(state().mode,'learn');const battleEntry=E.availableNodes(state()).find(n=>n.type==='battle');assert.ok(battleEntry,'A starting battle must be available');click('node',battleEntry.id);assert.equal(state().scene,'battle');click('forecast');const input=w.document.querySelector('#prob-answer');input.value='1/0';w.document.querySelector('#forecast-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));assert.equal(state().battle.question.attempts,0);assert.equal(w.document.querySelector('#prob-answer').getAttribute('aria-invalid'),'true');click('hint');const q=state().battle.question;w.document.querySelector('#prob-answer').value=q.n+'/'+q.d;w.document.querySelector('#forecast-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));assert.equal(state().battle.question.solved,true);assert.equal(state().battle.focus,0);assert.match(w.document.querySelector('#dialog').textContent,/guided/);click('close');assert.equal(state().battle.question,null);assert.equal(w.document.querySelector('[data-action=forecast]').disabled,true);click('end-turn');assert.equal(state().battle.turn,2);}finally{dom.window.close();}});
test('DOM: filter selection cancels freely and commits exact selected cards',{skip:!JSDOM},()=>{const r=fixtureRun(91);E.startBattle(r,'wisp');const all=[...r.battle.hand,...r.battle.draw];const keys=['filter','draw','strike','guard'];const hand=[];for(const k of keys){const i=all.findIndex(c=>c.key===k);hand.push(all.splice(i,1)[0]);}r.battle.hand=hand;r.battle.draw=all;assert.ok(E.validate(r));const {dom,w,click,state}=boot(r);try{click('continue');const id=hand.find(c=>c.key==='filter').uid;click('play',id);click('close');assert.equal(state().battle.energy,3);click('play',id);const targets=state().battle.draw.slice(0,2).map(c=>c.uid);for(const target of targets)click('select-filter',target);click('apply-filter');assert.equal(state().battle.energy,2);assert.deepEqual(state().battle.exhaust.map(c=>c.uid).sort(),targets.sort());assert.ok(E.validate(state()));}finally{dom.window.close();}});
test('DOM: camp upgrade, event removal, library and save controls work',{skip:!JSDOM},()=>{const r=fixtureRun(21);r.scene='camp';r.depth=2;const {dom,w,click,state}=boot(r);try{click('continue');w.document.querySelector('[data-action=select-rest][data-value=upgrade]').click();assert.equal(state().scene,'camp');click('upgrade');click('choose-upgrade',r.deck[0].uid);assert.equal(state().deck[0].upgraded,true);assert.equal(state().depth,3);click('node');click('remove');click('choose-remove',state().deck[1].uid);assert.equal(state().deck.length,11);assert.equal(state().depth,4);click('library');assert.equal(w.document.querySelectorAll('#dialog .collection-cards .playing-card').length,6);click('close');click('saves');assert.ok(w.document.querySelector('[data-action=export]'));assert.ok(w.document.querySelector('[data-action=import]'));}finally{dom.window.close();}});
test('DOM: corrupted storage and unavailable storage leave a usable new-game screen',{skip:!JSDOM},()=>{for(const saved of [{version:1,deck:[]},null]){const {dom,w}=boot(saved,saved===null);try{assert.ok(w.document.querySelector('[data-action=new]'));assert.equal(w.document.querySelector('#storage-warning').hidden,false);}finally{dom.window.close();}}});
test('DOM: every terminal, reward, map and event scene renders without runtime errors',{skip:!JSDOM},()=>{for(const scene of ['map','reward','camp','event','stageclear','defeat','victory']){const r=fixtureRun(21);if(['reward','stageclear','defeat','victory'].includes(scene))E.startBattle(r,scene==='victory'?'dealer':'sentinel');r.scene=scene;if(scene==='camp')r.depth=2;if(scene==='event')r.depth=3;if(scene==='stageclear')r.depth=4;if(scene==='defeat')r.hp=0;if(scene==='victory'){r.stage=1;r.depth=4;r.battle.hp=0;r.battle.seals=2;}if(scene==='reward')r.rewards=['blast','fort','balance'];const {dom,w,click}=boot(r);try{click('continue');assert.ok(w.document.querySelector('#game').textContent.trim().length>30);assert.equal(w.document.querySelector('#game').innerHTML.includes('undefined'),false,scene);}finally{dom.window.close();}}});
test('DOM: importing a pending forecast clears unrelated prior success and input',{skip:!JSDOM},async()=>{const old=fixtureRun(1);E.startBattle(old,'wisp');const incoming=fixtureRun(2026);E.startBattle(incoming,'wisp');E.forecast(incoming);const {dom,w,click,state}=boot(old);try{click('continue');click('forecast');const q=state().battle.question;w.document.querySelector('#prob-answer').value=q.n+'/'+q.d;w.document.querySelector('#forecast-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));click('close');click('saves');const input=w.document.querySelector('#import-file');Object.defineProperty(input,'files',{configurable:true,value:[{size:JSON.stringify(incoming).length,text:async()=>JSON.stringify(incoming)}]});input.dispatchEvent(new w.Event('change',{bubbles:true}));await new Promise(resolve=>setImmediate(resolve));click('confirm-import');assert.equal(state().battle.question.solved,false);assert.equal(w.document.querySelector('#prob-answer').value,'');assert.equal(w.document.querySelector('#answer-feedback').textContent,'');}finally{dom.window.close();}});
test('DOM: retry asks before replacing the terminal run',{skip:!JSDOM},()=>{const r=fixtureRun(81);E.startBattle(r,'wisp');r.hp=0;r.scene='defeat';const {dom,w,click,state}=boot(r);try{click('continue');click('retry');assert.equal(state().scene,'defeat');assert.ok(w.document.querySelector('[data-action=confirm-retry]'));click('confirm-retry');assert.equal(state().scene,'map');assert.equal(state().hp,60);}finally{dom.window.close();}});
test('DOM: cancelling an untouched forecast restores its keyboard trigger',{skip:!JSDOM},()=>{const r=fixtureRun(1);E.startBattle(r,'wisp');const {dom,w,click}=boot(r);try{click('continue');w.document.querySelector('[data-action=forecast]').focus();click('forecast');click('close');assert.equal(w.document.activeElement.dataset.action,'forecast');}finally{dom.window.close();}});
test('DOM: Music controls preserve volume, preview every track and return to game music',{skip:!JSDOM},()=>{const {dom,w,click}=boot();try{assert.equal(w.document.documentElement.lang,'en');click('music');const range=w.document.querySelector('#music-volume');range.focus();range.value='23';range.dispatchEvent(new w.Event('input',{bubbles:true}));assert.equal(w.document.activeElement,range);assert.equal(JSON.parse(w.localStorage.getItem('duel-cube-settings.v1')).musicVolume,.23);assert.equal(w.document.querySelectorAll('[data-action=preview-track]').length,10);click('music-mute');assert.equal(w.DCAudio.state.muted,true);const elite=w.document.querySelector('[data-track=stage2_elite]');elite.click();assert.equal(w.DCAudio.state.requested,'stage2_elite');assert.equal(w.DCAudio.state.muted,false);click('close');assert.equal(w.DCAudio.state.requested,'menu');assert.equal(w.DCAudio.state.preview,null);}finally{dom.window.close();}});
test('DOM: Unmute Music enables audio on that click when both channels were saved off',{skip:!JSDOM},async()=>{
 let contexts=0;const param=()=>({value:0,cancelScheduledValues(){},setValueAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;}});
 class Context{constructor(){contexts++;this.state='running';this.currentTime=0;this.destination={};}createGain(){return {gain:param(),connect(){}};}resume(){this.state='running';return Promise.resolve();}}
 const {dom,w,click}=boot(null,false,{AudioContext:Context,settings:{sound:false,musicMuted:true}});
 try{click('music');assert.equal(contexts,0);click('music-mute');await new Promise(r=>setImmediate(r));assert.equal(contexts,1);assert.equal(w.DCAudio.state.unlocked,true);assert.equal(w.DCAudio.state.muted,false);}finally{dom.window.close();}
});
test('DOM: portable HTML boots without external scripts/styles and embeds all images',{skip:!JSDOM},async()=>{const portableSource=fs.readFileSync(path.join(__dirname,'../MAIN-SEKARANG.html'),'utf8');
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
 const {dom,w,click}=boot();try{click('library');assert.equal(w.document.querySelectorAll('.collection-cards .playing-card').length,6);w.document.querySelector('[data-action=library-page][data-page="1"]').click();assert.equal(w.document.querySelectorAll('.collection-cards .playing-card').length,6);let input=w.document.querySelector('#card-search');input.value='nonexistent';input.dispatchEvent(new w.Event('input',{bubbles:true}));assert.ok(w.document.querySelector('.no-results'));click('clear-search');assert.equal(w.document.querySelector('#card-search').value,'');w.document.querySelector('[data-action=library-role][data-value=guard]').click();assert.equal(w.document.querySelectorAll('.collection-cards .playing-card').length,3);assert.ok([...w.document.querySelectorAll('.collection-cards .playing-card')].every(el=>el.classList.contains('guard')));}finally{dom.window.close();}
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
  assert.equal(w.document.querySelectorAll('[data-action=education-select]').length,4);assert.equal(w.document.querySelector('#education-prompt').textContent,q.prompt);
  assert.equal(w.document.querySelector('[data-action=education-check]').disabled,true);click('education-select',wrong);click('education-check');click('education-hint');
  assert.match(w.document.querySelector('#education-feedback').textContent,/Not quite/);assert.equal(w.document.querySelector('#education-hint p').textContent,q.hint);pending=state();
  click('home');click('continue');assert.equal(w.document.querySelector('[data-question-id]').dataset.questionId,q.id);
 }finally{dom.window.close();}
 const again=boot(pending);
 try{again.click('continue');assert.equal(again.state().educationState.pending.hinted,true);assert.equal(again.state().educationState.pending.attempts.length,1);completeDomTrial(again.w);assert.equal(again.state().scene,'map');assert.equal(again.state().artifactState.owned.length,1);assert.equal(again.state().educationState.completed[0].first,false);assert.ok(E.validate(again.state()));}finally{again.dom.window.close();}
});

test('DOM: shown question IDs never repeat when new runs replace unanswered trials',{skip:!JSDOM},()=>{
 const {dom,w,click,state}=boot();const seen=new Set();
 try{
  for(let i=0;i<10;i++){
   if(i){click('home');click('new');click('start-new');}else click('new');
   click('start-challenge');click('select-artifact',state().artifactState.offer.ids[0]);click('claim-artifact');
   const id=state().educationState.pending.questionId;assert.ok(!seen.has(id));seen.add(id);
   const profile=JSON.parse(w.localStorage.getItem('duel-cube-question-history.v1'));assert.equal(profile.usedIds.length,i+1);assert.ok(profile.usedIds.includes(id));
  }
 }finally{dom.window.close();}
});

test('DOM: import preserves the pending question and unions local and imported exposure history',{skip:!JSDOM},async()=>{
 const Q=require('../dist/education.js'),first=E.newRun(4,'challenge');E.chooseArtifact(first,E.artifactChoices(first)[0].id);
 const incoming=E.newRun(50,'challenge');E.chooseArtifact(incoming,E.artifactChoices(incoming)[0].id,[Q.current(first).id]);
 const {dom,w,click,state}=boot(first);
 try{
  click('continue');click('saves');const file=w.document.querySelector('#import-file');Object.defineProperty(file,'files',{configurable:true,value:[{size:JSON.stringify(incoming).length,text:async()=>JSON.stringify(incoming)}]});
  file.dispatchEvent(new w.Event('change',{bubbles:true}));await new Promise(resolve=>setImmediate(resolve));click('confirm-import');
  assert.equal(state().scene,'education');assert.equal(state().educationState.pending.questionId,Q.current(incoming).id);assert.equal(w.document.querySelector('#dialog').open,false);
  const profile=JSON.parse(w.localStorage.getItem('duel-cube-question-history.v1'));assert.ok(profile.usedIds.includes(Q.current(first).id));assert.ok(profile.usedIds.includes(Q.current(incoming).id));
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
