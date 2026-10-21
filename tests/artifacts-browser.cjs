const {claimArtifact,completeTrial,completeBrowserTrial}=require('./helpers/education.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.BROWSER_QA_MODULE||'playwright');
const E=require('../dist/engine.js'),A=require('../dist/artifacts.js'),C=require('../dist/config.js');
const report={version:'2.6.0',checks:[],viewports:[],errors:[]};let server;
(async()=>{
 const options={headless:true,args:['--no-sandbox']};
 if(process.env.QA_CHROMIUM_MODULE){const chrome=require(process.env.QA_CHROMIUM_MODULE);options.executablePath=await chrome.executablePath();options.args=[...chrome.args,'--no-sandbox'];}
 if(process.env.QA_DISABLE_GPU)options.args.push('--disable-gpu');
 server=require('node:child_process').spawn(process.execPath,[path.join(__dirname,'../server.cjs')],{env:{...process.env,PORT:'4187'},stdio:['ignore','pipe','pipe']});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.stdout.once('data',resolve);server.stderr.once('data',d=>reject(new Error(String(d))));});
 const browser=await chromium.launch(options),page=await browser.newPage({viewport:{width:1920,height:1080},reducedMotion:'reduce'});
 page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url());});
 const click=a=>page.locator('[data-action='+a+']:visible').first().click();
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')));
 const decode=()=>page.evaluate(async()=>{
  for(const im of [...document.images].filter(im=>im.hasAttribute('src'))){
   try{await im.decode();}catch(e){throw new Error('Image failed: '+im.getAttribute('src').slice(0,100)+' '+e.message);}
  }
 });
 const screenshot=async name=>{if(process.env.QA_SCREENSHOTS){fs.mkdirSync(process.env.QA_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,name+'.png'),fullPage:true,animations:'disabled'});}};
 async function restore(r){await page.evaluate(r=>{localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true}));},r);await page.reload();await click('continue');await decode();}
 function offering(code){for(let seed=1;seed<300;seed++){const r=E.newRun(seed,'challenge');if(r.artifactState.offer.ids.includes(A.id(code)))return r;}throw new Error('Fixture offer missing');}
 try{
  await page.goto('http://127.0.0.1:4187/');await page.evaluate(()=>localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true})));await page.reload();
  await click('new');await click('start-challenge');await decode();
  assert.equal((await state()).scene,'master');assert.equal(await page.locator('#dialog').evaluate(d=>d.open),false);
  assert.equal(await page.locator('.artifact-card').count(),3);assert.equal(await page.locator('.dungeon-room').count(),0);
  assert.equal(await page.locator('[data-action=claim-artifact]').isDisabled(),true);
  const initial=await state(),ids=initial.artifactState.offer.ids;
  await click('home');await click('continue');assert.deepEqual((await state()).artifactState.offer.ids,ids);
  await page.reload();await click('continue');assert.deepEqual((await state()).artifactState.offer.ids,ids);
  report.checks.push('New Challenge meets the Dungeon Master before the map, with three frozen unique Starting choices, native disabled confirmation, no tutorial overlay, and stable Continue/reload offers');
  await restore(offering('s06'));const beforeTerms=await state();
  assert.equal(await page.locator('button button').count(),0);
  const mathTerm=page.locator('.artifact-effect [data-category=math]').first(),gameTerm=page.locator('.artifact-effect [data-category=game]').first();
  await mathTerm.hover();await page.locator('[role=tooltip]').waitFor();
  assert.equal(await mathTerm.evaluate(el=>getComputedStyle(el).color),'rgb(231, 161, 196)');
  assert.equal(await gameTerm.evaluate(el=>getComputedStyle(el).color),'rgb(158, 213, 176)');
  await mathTerm.focus();await page.keyboard.press('Escape');assert.equal(await page.locator('[role=tooltip]').count(),0);
  await gameTerm.focus();await page.locator('[role=tooltip]').waitFor();assert.ok(await gameTerm.getAttribute('aria-describedby'));
  await page.keyboard.press('Escape');assert.deepEqual(await state(),beforeTerms);
  assert.equal(await page.locator('[data-action=claim-artifact]').isDisabled(),true);
  await screenshot('rich-terms-desktop');
  report.checks.push('Artifact descriptions use separate pink math and green game tokens; hover and keyboard focus open escaped definitions; Escape dismisses without selection, claims, RNG changes or nested buttons');
  for(const [width,height]of [[1920,1080],[1280,720],[844,390],[390,844],[320,740],[3840,2160]]){
   await page.setViewportSize({width,height});await restore(initial);
   const boxes=await page.locator('.artifact-card').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect(),im=el.querySelector('img');return {left:r.left,right:r.right,height:r.height,loaded:im.complete&&im.naturalWidth>0};}));
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+' page overflow');
   for(const b of boxes)assert.ok(b.left>=0&&b.right<=width&&b.height>=44&&b.loaded,JSON.stringify({width,b}));
   const target=page.locator('.artifact-effect [data-rt-term]').first();await target.scrollIntoViewIfNeeded();await target.focus();await page.locator('[role=tooltip]').waitFor();
   const tip=await page.locator('[role=tooltip]').boundingBox();assert.ok(tip.x>=0&&tip.x+tip.width<=width&&tip.y>=0&&tip.y+tip.height<=height,JSON.stringify({width,tip}));
   await screenshot('master-'+width);await page.keyboard.press('Escape');report.viewports.push({width,height,noPageOverflow:true,decodedChoices:3,tooltipWithinViewport:true});
  }
  await page.setViewportSize({width:1920,height:1080});const purse=offering('s09');await restore(purse);
  const pick=page.locator('[data-action=select-artifact][data-id='+A.id('s09')+']');await pick.focus();await page.keyboard.press('Space');
  assert.equal(await pick.getAttribute('aria-pressed'),'true');assert.equal(await page.evaluate(()=>document.activeElement.dataset.id),A.id('s09'));
  assert.equal((await state()).gold,80);await click('claim-artifact');await completeBrowserTrial(page);
  assert.equal((await state()).scene,'map');assert.equal((await state()).gold,105);assert.equal((await state()).artifactState.owned.length,1);
  await page.reload();await click('continue');assert.equal((await state()).gold,105);
  await click('artifacts');assert.match(await page.locator('#dialog').innerText(),/Copper Purse/);
  const beforeInspect=await state(),number=page.locator('.artifact-last-result .rt-calculation');assert.equal(await number.innerText(),'+25');
  assert.equal(await number.evaluate(el=>getComputedStyle(el).color),'rgb(185, 163, 227)');await number.focus();
  await page.locator('[role=tooltip]').waitFor();assert.match(await page.locator('[role=tooltip]').innerText(),/80 \+ 25 = 105/);
  assert.equal(await page.locator('.rt-glossary [data-rt-term]').count(),55);await screenshot('rich-calculation-inventory');
  await page.keyboard.press('Escape');assert.equal(await page.locator('#dialog').evaluate(d=>d.open),true);
  await page.locator('#dialog [data-action=calculations]').click();assert.match(await page.locator('#dialog').innerText(),/Gold gained: \+25 Gold/);assert.deepEqual(await state(),beforeInspect);
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.action),'artifacts');
  report.checks.push('Keyboard selection preserves focus; preview grants nothing; claiming Copper Purse grants exactly 25 Gold once; ownership and inventory dialog survive reload with Escape focus restoration');
  report.checks.push('Purple calculation values show actual saved before/after arithmetic; all 55 glossary terms are available; tooltip Escape leaves the shared inventory dialog open; viewing calculations does not replay effects');

  const ration=offering('s08');claimArtifact(ration,A.id('s08'));delete ration.route;A.acquire(ration,A.id('e15'),'fixture:strength');E.startBattle(ration,'wisp');
  await restore(ration);assert.match(await page.locator('.player .fighter-stats').innerText(),/65 \/ 65/);assert.match(await page.locator('.artifact-stats').innerText(),/Strength 2/);
  const attack=ration.battle.hand.find(c=>E.definition(c).damage);assert.ok(attack);
  const before=ration.battle.hp,card=page.locator('[data-action=play][data-id='+attack.uid+']');
  assert.match(await card.innerText(),/Deal 8 damage/);await card.click();assert.equal((await state()).battle.hp,before-8);assert.ok(E.validate(await state()));
  await screenshot('artifact-combat');report.checks.push('Ration shows 65 Max HP and Strength changes both the visible Attack value and actual enemy damage');
  await click('log');assert.match(await page.locator('#dialog').innerText(),/Damage before defenses: 8 damage/);assert.match(await page.locator('#dialog').innerText(),/Enemy HP lost: −8 HP/);await page.keyboard.press('Escape');

  const boss=offering('s02');claimArtifact(boss,A.id('s02'));delete boss.route;boss.depth=4;E.startBattle(boss,'sentinel');boss.battle.seals=2;boss.battle.hp=1;
  const strike=boss.battle.hand.find(c=>E.definition(c).damage);assert.ok(strike);E.playCard(boss,strike.uid);assert.ok(E.validate(boss));
  await restore(boss);assert.equal(await page.locator('.artifact-card').count(),3);assert.equal(await page.locator('.artifact-encounter').getAttribute('data-artifact-kind'),'boss');
  await page.locator('[data-action=select-artifact][data-id='+A.id('b01')+']').click();await click('claim-artifact');await completeBrowserTrial(page);
  let current=await state();assert.equal(current.stage,1);assert.ok(current.checkpoint);assert.ok(A.has(current,'b01'));
  await click('node');assert.equal((await state()).battle.energy,4);assert.match(await page.locator('.energy').innerText(),/4\s*\/ 4/);
  report.checks.push('Boss offers all three real artifacts; Gatekeeper Core is committed before the Stage 2 checkpoint and gives 4 Energy in the next combat');

  const mystery=offering('s02');claimArtifact(mystery,A.id('s02'));delete mystery.route;mystery.scene='event';mystery.depth=3;
  await page.setViewportSize({width:390,height:844});await restore(mystery);await click('event-artifact');
  assert.equal(await page.locator('.artifact-encounter').getAttribute('data-artifact-kind'),'mystery');
  await page.locator('[data-action=select-artifact]').first().click();await click('claim-artifact');await completeBrowserTrial(page);assert.equal((await state()).artifactState.owned.length,2);assert.equal((await state()).scene,'map');
  report.checks.push('Mystery Discover Artifact uses the same preview/claim owner on phone and returns to the map with one new effect');
  const shop=offering('s06');claimArtifact(shop,A.id('s06'));A.acquire(shop,A.id('e14'),'fixture:bram');
  const nodes=E.getMap(shop).nodes,target=nodes.find(n=>n.type==='shop'),route=[target];
  for(let depth=target.depth-1;depth>=0;depth--)route.unshift(nodes.find(n=>n.depth===depth&&n.next.includes(route[0].id)));
  shop.depth=target.depth;shop.route.path=route.slice(0,-1).map(n=>n.id);shop.cleared=shop.route.path.slice();E.enterNode(shop,target.id);shop.gold=500;assert.ok(E.validate(shop));
  await page.setViewportSize({width:3440,height:1440});await restore(shop);
  const quote=page.locator('.shop-detail .rt-calculation');await quote.focus();await page.locator('[role=tooltip]').waitFor();
  assert.match(await page.locator('[role=tooltip]').innerText(),/Highest discount: 15%/);assert.ok(!(await page.locator('[role=tooltip]').innerText()).includes('20%'));
  assert.equal(await quote.innerText(),String(shop.shop.offers[0].price));await screenshot('shop-discount-uwhd');await page.keyboard.press('Escape');
  const gold=shop.gold,price=shop.shop.offers[0].price;await click('buy-card');assert.equal((await state()).gold,gold-price);
  await click('calculations');assert.match(await page.locator('#dialog').innerText(),new RegExp('Gold spent: −'+price+' Gold'));await page.keyboard.press('Escape');
  const mobile=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,reducedMotion:'reduce'}),touch=await mobile.newPage();
  await touch.goto('http://127.0.0.1:4187/');await touch.evaluate(r=>{localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true}));},offering('s06'));
  await touch.reload();await touch.locator('[data-action=continue]').tap();const touchTerm=touch.locator('.artifact-effect [data-category=math]').first();await touchTerm.tap();await touch.locator('[role=tooltip]').waitFor();
  assert.equal(await touch.locator('[data-action=claim-artifact]').isDisabled(),true);const touchBefore=await touch.evaluate(()=>localStorage.getItem('duel-cube-math.v1'));
  await touch.locator('#artifact-title').tap();assert.equal(await touch.locator('[role=tooltip]').count(),0);assert.equal(await touch.evaluate(()=>localStorage.getItem('duel-cube-math.v1')),touchBefore);await mobile.close();
  report.checks.push('Shop quotes and purchases show highest-discount-only arithmetic and separate actual Gold spending at 3440×1440; real touch taps open/dismiss definitions on phone without selecting or granting an artifact');
  await decode();const offlineRequests=[];page.on('request',req=>{if(/^https?:/.test(req.url()))offlineRequests.push(req.url());});
  await page.goto('file://'+path.join(__dirname,'../MAIN-SEKARANG.html'));
  await page.evaluate(()=>{localStorage.removeItem('duel-cube-math.v1');localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true}));});
  await page.reload();await click('new');await click('start-challenge');await decode();assert.equal(await page.locator('.artifact-card').count(),3);
  assert.ok(await page.locator('.artifact-encounter img').evaluateAll(els=>els.every(im=>im.src.startsWith('data:image/')&&im.complete&&im.naturalWidth>0)));
  assert.ok(await page.locator('.artifact-effect [data-rt-term]').count());await page.locator('.artifact-effect [data-rt-term]').first().focus();await page.locator('[role=tooltip]').waitFor();await page.keyboard.press('Escape');
  await screenshot('portable-master');await page.locator('[data-action=select-artifact]').first().click();await click('claim-artifact');await completeBrowserTrial(page);await decode();
  assert.equal((await state()).scene,'map');assert.equal((await state()).artifactState.owned.length,1);assert.deepEqual(offlineRequests,[]);
  report.checks.push('Unmodified portable HTML runs through Dungeon Master, decoded embedded artwork, claim and map without an HTTP request');
  assert.deepEqual(report.errors,[]);console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();server?.kill();}
})().catch(e=>{server?.kill();console.error(e);process.exitCode=1;});
