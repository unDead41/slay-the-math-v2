// Optional real-browser QA. Run with BROWSER_QA_MODULE pointing to Playwright.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.BROWSER_QA_MODULE || 'playwright');
const E = require('../dist/engine.js');
const url = process.env.QA_URL || 'http://127.0.0.1:4183/';
let server;
const out = process.env.QA_SCREENSHOTS;
const report = {checks: [], errors: []};
const browserOptions = {headless:true,args:['--no-sandbox']};

(async()=>{
 if(!process.env.QA_URL){
  server=require('node:child_process').spawn(process.execPath,[path.join(__dirname,'../server.cjs')],{env:{...process.env,PORT:'4183'},stdio:['ignore','pipe','pipe']});
  await new Promise((resolve,reject)=>{server.once('error',reject);server.stdout.once('data',resolve);});
 }
 if(process.env.QA_CHROMIUM_MODULE){
  const chrome=require(process.env.QA_CHROMIUM_MODULE);
  browserOptions.executablePath=await chrome.executablePath();
  browserOptions.args=[...chrome.args,'--no-sandbox'];
 }
 if(process.env.QA_DISABLE_GPU)browserOptions.args.push('--disable-gpu');
 const browser=await chromium.launch(browserOptions);
 const context=await browser.newContext({viewport:{width:1920,height:1080},reducedMotion:'reduce'});
 const page=await context.newPage();
 page.on('pageerror',e=>report.errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url());});
 const click=action=>page.locator('[data-action="'+action+'"]:visible').first().click();
 const screenshot=async name=>{if(out){fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});}};
 async function images(){
  await page.evaluate(()=>Promise.all([...document.images].filter(im=>im.hasAttribute('src')).map(im=>im.decode().catch(()=>{}))));
  assert.deepEqual(await page.locator('img').evaluateAll(ims=>ims.filter(im=>im.hasAttribute('src')&&!im.naturalWidth).map(im=>im.src)),[]);
 }
 async function restore(run){
  await page.evaluate(r=>localStorage.setItem('duel-cube-math.v1',JSON.stringify(r)),run);
  await page.reload();await click('continue');await images();
 }
 try{
  await page.goto(url);await images();
  const menu=await page.locator('.main-menu-actions').boundingBox();
  assert.ok(menu.x+menu.width<1000,'Live menu remains on the left of the source artwork');
  assert.match(await page.locator('.menu-backdrop.active').getAttribute('src'),/menu-corridor/);
  await screenshot('menu-desktop');report.checks.push('Desktop menu: illustrated Alyssa scene on the right and five live controls on the left');
  await click('motion');assert.equal(await page.locator('html').getAttribute('class'),'reduce-motion');
  await page.reload();assert.match(await page.locator('[data-action=motion]').innerText(),/Off/);
  assert.equal(await page.locator('.menu-backdrop').first().evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
  report.checks.push('Motion Off persists and disables decorative animations');
  await click('new');await click('start-learn');await click('close');await images();
  assert.match(await page.locator('.run-top').innerText(),/ROOM 1 \/ 10/);
  assert.equal(await page.locator('.atlas-coordinate').count(),10);
  assert.equal(await page.locator('.route-legend .map-room-art').count(),6);
  const scroll=await page.locator('.atlas-scroll').evaluate(el=>el.scrollTop);
  assert.ok(scroll>0,'Initial map opens at the entry rooms');
  const available=page.locator('.dungeon-room.available');
  assert.ok([3,4,5].includes(await available.count()));
  await screenshot('map-before-selection');
  if(process.env.QA_DEBUG)console.log(await available.last().evaluate(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {rect:r.toJSON(),pointer:s.pointerEvents,z:s.zIndex,transform:s.transform,hit:document.elementsFromPoint(r.x+r.width/2,r.y+r.height/2).map(e=>e.className),scroll:document.querySelector('.atlas-scroll').scrollTop};}));
  const chosenId=await available.last().getAttribute('data-id');
  await screenshot('map-desktop');
  assert.equal(await page.locator('.map-selection,.enter-room').count(),0);
  await available.last().click();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')));
  assert.equal(saved.scene,'battle');assert.equal(saved.route.active,chosenId);
  await page.reload();await click('continue');
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')).route),saved.route);
  report.checks.push('Ten-level map: all six source seals, direct icon entry, exact room and save/continue');

  let fixture;
  for(let seed=1;seed<100;seed++){
   const r=E.newRun(seed);delete r.route;E.startBattle(r,'wisp');
   if(r.battle.hand.some(c=>E.definition(c).damage)&&r.battle.hand.some(c=>E.definition(c).block)){fixture=r;break;}
  }
  await restore(fixture);
  const attack=fixture.battle.hand.find(c=>E.definition(c).damage);
  await page.locator('[data-action=play][data-id="'+attack.uid+'"]').click();
  assert.equal(await page.locator('.enemy-art').getAttribute('data-pose'),'damage');
  assert.match(await page.locator('.enemy-art').getAttribute('src'),/ground-ember_mirror-damage/);
  await page.waitForTimeout(800);
  assert.equal(await page.locator('.enemy-art').getAttribute('data-pose'),'standing');
  await click('end-turn');
  assert.equal(await page.locator('.enemy-art').getAttribute('data-pose'),'attack');
  await page.waitForTimeout(800);
  await click('end-turn');
  assert.equal(await page.locator('.enemy-art').getAttribute('data-pose'),'skill');
  await page.waitForTimeout(800);
  assert.equal(await page.locator('.enemy-art').getAttribute('data-pose'),'defend');
  assert.match(await page.locator('.enemy-art').getAttribute('src'),/ground-ember_mirror-defend/);
  await images();await screenshot('battle-desktop');
  report.checks.push('Ember Mirror: actual attack, damage, skill and guard poses; automatic idle reset; gameplay immediately saved');
  await restore(fixture); // Turn 3 can have an empty draw pile; Predict needs a source.
  await click('forecast');
  await page.locator('#prob-answer').fill('1/0');
  await page.locator('#forecast-form button[type=submit]').click();
  assert.equal(await page.locator('#prob-answer').getAttribute('aria-invalid'),'true');
  await click('hint');
  const q=await page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')).battle.question);
  await page.locator('#prob-answer').fill(q.n+'/'+q.d);
  await page.locator('#forecast-form button[type=submit]').click();
  assert.match(await page.locator('#dialog').innerText(),/guided/i);
  await page.keyboard.press('Escape');
  report.checks.push('Predict: invalid-answer recovery, guided correction, Escape and battle return');

  await click('library');await page.locator('#card-search').fill('nonexistent');
  assert.equal(await page.locator('.no-results').count(),1);
  await click('clear-search');assert.equal(await page.locator('.collection-cards .playing-card').count(),6);
  await page.keyboard.press('Escape');
  await click('home');await click('saves');await page.keyboard.press('Escape');
  await page.keyboard.press('Tab');
  assert.ok(await page.evaluate(()=>!!document.activeElement.getAttribute('data-action')));
  report.checks.push('Collection empty search/clear, dialogs, keyboard focus');

  await page.setViewportSize({width:390,height:844});await images();
  await screenshot('menu-mobile');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await restore(E.newRun(42));await images();await screenshot('map-mobile');
  if(process.env.QA_DEBUG)console.log(await page.evaluate(()=>({width:innerWidth,document:document.documentElement.scrollWidth,over:[...document.querySelectorAll('body *')].filter(el=>el.getBoundingClientRect().right>innerWidth).slice(0,18).map(el=>({class:el.className,right:el.getBoundingClientRect().right,position:getComputedStyle(el).position})),status:getComputedStyle(document.querySelector('.run-status')).display})));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const phoneMap=await page.locator('.atlas-scroll').boundingBox();assert.ok(phoneMap.width<=390);
  assert.equal(await page.locator('.dungeon-room.available').count(),E.availableNodes(E.newRun(42)).length);
  await page.locator('.dungeon-room.available').first().focus();
  await page.keyboard.press('Enter');assert.notEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')).scene),'map');assert.equal(await page.locator('[data-stm-map]').count(),0);
  report.checks.push('390px: menu/map reflow, no page overflow, source icons, keyboard room selection');
  assert.equal(await page.locator('.hero-sprite').count(),0);
  assert.deepEqual(report.errors,[]);
  console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();server?.kill();}
})().catch(e=>{server?.kill();console.error(e);process.exitCode=1;});
