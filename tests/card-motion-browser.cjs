/* Optional browser QA: actual engine actions, transient presentation and lifecycle. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.BROWSER_QA_MODULE||'playwright');
const E=require('../dist/engine.js'),C=require('../dist/config.js'),data=require('../dist/card-data.js');
const report={checks:[],errors:[],passives:[],viewports:[]},key=name=>data.cards.find(c=>c.name===name).id;
function arrange(r,names){const b=r.battle,all=[...b.hand,...b.draw,...b.discard];b.hand=[];b.discard=[];for(const name of names){const i=all.findIndex(c=>c.key===key(name));assert.ok(i>=0,name);b.hand.push(all.splice(i,1)[0]);}b.draw=all;b.energy=C.ENERGY;}
function prepare(r,name){arrange(r,[name]);E.playCard(r,r.battle.hand[0].uid);}
function fixture(hand,passives=[]){const r=E.newRun(8726);delete r.route;r.seq=0;r.deck=data.cards.map(c=>E.card(r,c.id));E.startBattle(r,'sentinel');r.battle.hp=r.battle.maxHp=10000;r.battle.seals=2;r.battle.enemyBlock=0;r.battle.currentIntent.damage=0;for(const name of passives)prepare(r,name);arrange(r,hand);return r;}
let server,browser;
(async()=>{
 const options={headless:true,args:['--no-sandbox']};if(process.env.QA_CHROMIUM_MODULE){let chrome=require(process.env.QA_CHROMIUM_MODULE);chrome=chrome.default||chrome;options.executablePath=await chrome.executablePath();options.args=[...chrome.args,'--no-sandbox'];}if(process.env.QA_DISABLE_GPU)options.args.push('--disable-gpu');
 server=require('node:child_process').spawn(process.execPath,[path.join(__dirname,'../server.cjs'),...(process.env.QA_PRODUCTION?['--prod']:[])],{env:{...process.env,PORT:'4189'},stdio:['ignore','pipe','pipe']});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.stdout.once('data',resolve);server.stderr.once('data',d=>reject(Error(d.toString())));});
 browser=await chromium.launch(options);const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
 page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url());});
 // Hold real Web Animations for inspection; slow QA hosts must not race a 220ms flight.
 await page.addInitScript(()=>{window.__freezeCardMotion=true;const animate=Element.prototype.animate;Element.prototype.animate=function(...args){const animation=animate.apply(this,args);if(window.__freezeCardMotion&&(this.closest('.card-motion-layer')||this.matches('.passive-badge,.pile-art')))animation.pause();return animation;};});
 await page.goto('http://127.0.0.1:4189/');
 const click=action=>page.locator('[data-action="'+action+'"]').first().click();
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')));
 const idle=async()=>{await page.evaluate(()=>{window.__freezeCardMotion=false;for(const a of document.getAnimations())if(a.playState==='paused')a.play();});await page.waitForFunction(()=>!document.querySelector('.card-motion-layer'));};
 async function restore(r,motion=true){await page.evaluate(({r,motion})=>{localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion,sound:false,musicMuted:true,voiceMuted:true}));},{r,motion});await page.reload();await click('continue');await page.evaluate(()=>Promise.all([...document.querySelectorAll('.combat-layout img')].map(im=>im.decode().catch(()=>{}))));}
 const play=(r,name)=>page.locator('[data-action="play"][data-id="'+r.battle.hand.find(c=>c.key===key(name)).uid+'"]').click();
 async function screenshot(name){if(process.env.QA_SCREENSHOTS){await page.evaluate(()=>{for(const a of document.getAnimations())if(a.playState==='paused'&&a.effect.target.closest('.card-motion-layer')){const t=a.effect.getTiming();a.currentTime=t.delay+Number(t.duration)*.45;}});fs.mkdirSync(process.env.QA_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,name+'.png')});}}
 try{
  let r=fixture(['Quick Study','Rune Guard']);await restore(r);await play(r,'Quick Study');await page.waitForSelector('[data-motion-kind="draw"]');
  assert.equal(await page.locator('[data-motion-kind="draw"]').count(),2);assert.equal((await state()).battle.energy,2);assert.equal((await state()).battle.hand.length,3);
  assert.equal(await page.locator('[data-motion-kind="draw"] .card-motion-face .package-card-frame').count(),2,'Clone the full portrait, not its transparent action button');
  assert.equal(await page.locator('.card-motion-layer').getAttribute('aria-hidden'),'true');assert.ok(await page.locator('.card-motion-layer').evaluate(el=>el.inert&&getComputedStyle(el).pointerEvents==='none'));
  assert.equal(await page.locator('.card-motion-layer [data-action]').count(),0);await page.waitForTimeout(320);await screenshot('card-draw');await idle();
  assert.ok(await page.locator('.hand [data-motion-uid]').evaluateAll(els=>els.length>0&&els.every(el=>getComputedStyle(el).visibility==='visible')));report.checks.push('Draw flies from the pile; the actual paid result is saved before motion; inert clones disappear and real cards return.');
  for(const [name,kind,zone]of [['Rune Guard','discard','discard'],['Flash Ward','exhaust','exhaust']]){r=fixture([name]);await restore(r);await play(r,name);await page.waitForSelector('[data-motion-kind="'+kind+'"]');assert.ok((await state()).battle[zone].some(c=>c.key===key(name)));await page.waitForTimeout(kind==='exhaust'?170:70);await screenshot('card-'+kind);await idle();}report.checks.push('Normal Discard and fiery Exhaust are visually distinct and use the real destination.');
  r=fixture(['Rune Guard']);r.seq=0;r.deck=Array.from({length:4},()=>E.card(r,key('Rune Guard')));E.startBattle(r,'sentinel');r.battle.hp=r.battle.maxHp=10000;r.battle.seals=2;r.battle.currentIntent.damage=0;
  await restore(r);const original=r.battle.hand.map(c=>c.uid).sort();await click('end-turn');await page.waitForSelector('[data-motion-kind="shuffle"]');assert.equal(await page.locator('.card-motion-stack-count').textContent(),'4');assert.deepEqual((await state()).battle.hand.map(c=>c.uid).sort(),original);await idle();report.checks.push('End Turn discards and redraws the same four UIDs through a face-down reshuffle.');

  for(const name of data.cards.filter(c=>c.category==='passive').map(c=>c.name)){
   const activation=['Blazing Spirit','Swift Step','Rune Armor','Last Ember'].includes(name);let hand=activation?[name]:[name==='Grimoire Ward'?'Quick Study':name==='Battle Rhythm'?'Rune Guard':'Rune Strike'];
   r=fixture(hand,activation?[]:[name]);
   if(['Growing Flame','Battle Rhythm'].includes(name)){const played=name==='Growing Flame'?'Rune Strike':'Rune Guard';prepare(r,played);prepare(r,played);arrange(r,[played]);}
   if(name==='Lasting Shield')r.battle.block=5;
   if(name==='Ember Core'){r.battle.focus=1;E.armFocus(r);}
   if(name==='Last Ember'){r.hp=1;r.battle.focus=C.FOCUS_CAP;}
   await restore(r);assert.equal(await page.locator('.card-motion-passive').count(),0,'Continue never replays saved triggers');
   if(['Lasting Shield','Clear Mind'].includes(name))await click('end-turn');else await play(r,hand[0]);
   const cue=page.locator('.card-motion-passive[data-passive-source="'+key(name)+'"]');await cue.waitFor();
   const detail=await cue.getAttribute('data-effect-detail');assert.ok(detail.length>2);if(name==='Last Ember')assert.match(detail,/\+0 Focus/);
   assert.ok(await page.locator('.passive-badge[data-id="'+key(name)+'"]').evaluate(el=>el.getAnimations().length>0));
   report.passives.push({name,detail});if(['Last Ember','Ember Core','Clear Mind'].includes(name))await screenshot('passive-'+name.toLowerCase().replaceAll(' ','-'));await idle();
  }
  report.checks.push('All ten actual Passive trigger paths pulse their own badge and show the actual named result, including capped Focus.');

  r=fixture(['Clear Mind']);await restore(r);await play(r,'Clear Mind');await page.waitForTimeout(50);assert.equal(await page.locator('.card-motion-passive').count(),0);await idle();
  r=fixture(['Recall']);const target=r.battle.draw.pop();r.battle.discard.push(target);await restore(r);await play(r,'Recall');assert.equal(await page.locator('#dialog').evaluate(el=>el.open),true);assert.equal(await page.locator('.card-motion-layer').count(),0);await page.locator('[data-action="card-option"][data-value="'+target.uid+'"]').click();await page.waitForSelector('[data-motion-kind="recall"]');assert.ok((await state()).battle.hand.some(c=>c.uid===target.uid));await idle();
  report.checks.push('Waiting Passives do not trigger; unpaid modal choices stay static and Recall animates after confirmation.');

  for(const [motion,os]of [[false,'no-preference'],[true,'reduce']]){await page.emulateMedia({reducedMotion:os});r=fixture(['Quick Study']);await restore(r,motion);await play(r,'Quick Study');await page.waitForTimeout(80);assert.equal(await page.locator('.card-motion-layer').count(),0);assert.equal((await state()).battle.energy,2);assert.equal((await state()).battle.hand.length,2);}await page.emulateMedia({reducedMotion:'no-preference'});report.checks.push('Motion Off and OS reduced motion create no overlay and preserve actual gameplay.');

  r=fixture(['Quick Study','Rune Guard']);await restore(r);await play(r,'Quick Study');await page.waitForSelector('[data-motion-kind="draw"]');await page.keyboard.press('1');await click('saves');assert.equal(await page.locator('.card-motion-layer').count(),0);assert.equal((await state()).battle.energy,1);await page.waitForTimeout(700);assert.equal(await page.locator('.card-motion-layer').count(),0);await click('close');assert.ok(await page.locator('.hand [data-motion-uid]').evaluateAll(els=>els.length>0&&els.every(el=>getComputedStyle(el).visibility==='visible')));report.checks.push('A rapid second play and Settings cancel old motion without duplicate costs, hidden cards or late ghosts.');

  for(const [width,height]of [[1920,1080],[390,844],[844,390]]){await page.setViewportSize({width,height});r=fixture(['Quick Study']);await restore(r);await play(r,'Quick Study');await page.waitForSelector('[data-motion-kind="draw"]');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await screenshot('card-motion-'+width);await page.setViewportSize({width:width-1,height});await idle();assert.ok(await page.locator('.hand [data-motion-uid]').evaluateAll(els=>els.length>0&&els.every(el=>getComputedStyle(el).visibility==='visible')));report.viewports.push({width,height,noOverflow:true,resizeCleanup:true});}
  assert.deepEqual(report.errors,[]);report.checks.push('Desktop, phone and landscape have no page overflow; resizing immediately cleans up.');
 }finally{await browser.close();server.kill();}
 if(process.env.QA_REPORT)fs.writeFileSync(process.env.QA_REPORT,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
})().catch(async error=>{console.error(error);if(process.env.QA_REPORT)fs.writeFileSync(process.env.QA_REPORT,JSON.stringify({...report,failure:error.stack},null,2)+'\n');await browser?.close().catch(()=>{});server?.kill();process.exitCode=1;});
