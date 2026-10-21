const {claimArtifact,completeTrial,completeBrowserTrial}=require('./helpers/education.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.BROWSER_QA_MODULE||'playwright');
const E=require('../dist/engine.js'),A=require('../dist/artifacts.js');
const report={checks:[],viewports:[],errors:[]};let server;
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
  for(const [width,height]of [[1920,1080],[1280,720],[844,390],[390,844],[320,740],[3840,2160]]){
   await page.setViewportSize({width,height});await restore(initial);
   const boxes=await page.locator('.artifact-card').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect(),im=el.querySelector('img');return {left:r.left,right:r.right,height:r.height,loaded:im.complete&&im.naturalWidth>0};}));
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+' page overflow');
   for(const b of boxes)assert.ok(b.left>=0&&b.right<=width&&b.height>=44&&b.loaded,JSON.stringify({width,b}));
   await screenshot('master-'+width);report.viewports.push({width,height,noPageOverflow:true,decodedChoices:3});
  }
  await page.setViewportSize({width:1920,height:1080});const purse=offering('s09');await restore(purse);
  const pick=page.locator('[data-action=select-artifact][data-id='+A.id('s09')+']');await pick.focus();await page.keyboard.press('Space');
  assert.equal(await pick.getAttribute('aria-pressed'),'true');assert.equal(await page.evaluate(()=>document.activeElement.dataset.id),A.id('s09'));
  assert.equal((await state()).gold,80);await click('claim-artifact');await completeBrowserTrial(page);
  assert.equal((await state()).scene,'map');assert.equal((await state()).gold,105);assert.equal((await state()).artifactState.owned.length,1);
  await page.reload();await click('continue');assert.equal((await state()).gold,105);
  await click('artifacts');assert.match(await page.locator('#dialog').innerText(),/Copper Purse/);await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.action),'artifacts');
  report.checks.push('Keyboard selection preserves focus; preview grants nothing; claiming Copper Purse grants exactly 25 Gold once; ownership and inventory dialog survive reload with Escape focus restoration');

  const ration=offering('s08');claimArtifact(ration,A.id('s08'));delete ration.route;A.acquire(ration,A.id('e15'),'fixture:strength');E.startBattle(ration,'wisp');
  await restore(ration);assert.match(await page.locator('.player .fighter-stats').innerText(),/65 \/ 65/);assert.match(await page.locator('.artifact-stats').innerText(),/Strength 2/);
  const attack=ration.battle.hand.find(c=>E.definition(c).damage);assert.ok(attack);
  const before=ration.battle.hp,card=page.locator('[data-action=play][data-id='+attack.uid+']');
  assert.match(await card.innerText(),/Deal 8 damage/);await card.click();assert.equal((await state()).battle.hp,before-8);assert.ok(E.validate(await state()));
  await screenshot('artifact-combat');report.checks.push('Ration shows 65 Max HP and Strength changes both the visible Attack value and actual enemy damage');

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
  await decode();const offlineRequests=[];page.on('request',req=>{if(/^https?:/.test(req.url()))offlineRequests.push(req.url());});
  await page.goto('file://'+path.join(__dirname,'../MAIN-SEKARANG.html'));
  await page.evaluate(()=>{localStorage.removeItem('duel-cube-math.v1');localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true}));});
  await page.reload();await click('new');await click('start-challenge');await decode();assert.equal(await page.locator('.artifact-card').count(),3);
  assert.ok(await page.locator('.artifact-encounter img').evaluateAll(els=>els.every(im=>im.src.startsWith('data:image/')&&im.complete&&im.naturalWidth>0)));
  await screenshot('portable-master');await page.locator('[data-action=select-artifact]').first().click();await click('claim-artifact');await completeBrowserTrial(page);await decode();
  assert.equal((await state()).scene,'map');assert.equal((await state()).artifactState.owned.length,1);assert.deepEqual(offlineRequests,[]);
  report.checks.push('Unmodified portable HTML runs through Dungeon Master, decoded embedded artwork, claim and map without an HTTP request');
  assert.deepEqual(report.errors,[]);console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();server?.kill();}
})().catch(e=>{server?.kill();console.error(e);process.exitCode=1;});
