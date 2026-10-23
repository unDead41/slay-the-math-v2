/* Smoke the actual standalone artifact with network blocked. Build first. */
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {pathToFileURL}=require('node:url'),{chromium}=require(process.env.BROWSER_QA_MODULE||'playwright');
const E=require('../dist/engine.js'),C=require('../dist/config.js'),data=require('../dist/card-data.js');
const key=name=>data.cards.find(c=>c.name===name).id;
const r=E.newRun(4817);delete r.route;r.seq=0;r.deck=data.cards.map(c=>E.card(r,c.id));E.startBattle(r,'sentinel');r.battle.hp=r.battle.maxHp=10000;r.battle.seals=2;r.battle.enemyBlock=0;r.battle.currentIntent.damage=0;
function arrange(names){const b=r.battle,all=[...b.hand,...b.draw,...b.discard];b.hand=[];b.discard=[];for(const name of names){const i=all.findIndex(c=>c.key===key(name));b.hand.push(all.splice(i,1)[0]);}b.draw=all;b.energy=C.ENERGY;}
arrange(['Ember Core']);E.playCard(r,r.battle.hand[0].uid);arrange(['Quick Study','Flash Ward','Rune Strike']);r.battle.focus=1;E.armFocus(r);
const report={artifact:'SLAY-THE-MATH-OFFLINE.html',checks:[],requests:[],errors:[]};let browser;
(async()=>{
 const options={headless:true,args:['--no-sandbox','--disable-gpu']};if(process.env.QA_CHROMIUM_MODULE){let chrome=require(process.env.QA_CHROMIUM_MODULE);chrome=chrome.default||chrome;options.executablePath=await chrome.executablePath();options.args=[...chrome.args,'--no-sandbox','--disable-gpu'];}
 browser=await chromium.launch(options);const context=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'no-preference'});
 await context.route(/^https?:/,route=>{report.requests.push(route.request().url());return route.abort();});
 await context.addInitScript(run=>{
  localStorage.setItem('duel-cube-math.v1',JSON.stringify(run));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:true,sound:false,musicMuted:true,voiceMuted:true}));
  const animate=Element.prototype.animate;Element.prototype.animate=function(...args){const a=animate.apply(this,args);if(this.closest('.card-motion-layer'))a.pause();return a;};
 },r);
 const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve(__dirname,'../SLAY-THE-MATH-OFFLINE.html')).href,{timeout:120000,waitUntil:'domcontentloaded'});await page.locator('[data-action="continue"]').click();
 await page.evaluate(()=>Promise.all([...document.querySelectorAll('.combat-layout img')].map(im=>im.decode().catch(()=>{}))));
 await page.locator('[data-action="play"][data-id="'+r.battle.hand[0].uid+'"]').click();await page.waitForSelector('[data-motion-kind="draw"]');
 await page.locator('.card-motion-passive[data-passive-source="'+key('Ember Core')+'"]').waitFor();
 const embedded=await page.locator('.card-motion-passive img,.card-motion-face img').evaluateAll(els=>els.length>0&&els.every(im=>im.src.startsWith('data:image/')));assert.ok(embedded);
 await page.evaluate(()=>Promise.all([...document.querySelectorAll('.card-motion-layer img')].map(im=>im.decode())));
 report.checks.push('Actual standalone file opens without server/network; full moving portraits and Passive icons decode from embedded image bytes.');
 const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')));assert.equal(save.battle.energy,2);assert.equal(save.battle.focus,0);assert.ok(save.battle.discard.some(c=>c.key===key('Quick Study')));assert.ok(save.battle.combatLog.entries.some(e=>e.kind==='passive-trigger'&&e.source===key('Ember Core')));
 await page.locator('[data-action="play"][data-id="'+r.battle.hand[1].uid+'"]').click();await page.waitForSelector('[data-motion-kind="exhaust"]');assert.ok(await page.locator('.card-motion-face .package-card-frame').count());
 await page.locator('[data-action="saves"]').click();assert.equal(await page.locator('.card-motion-layer').count(),0);
 report.checks.push('Focused draw, Ember Core, Exhaust and dialog cleanup use the actual offline engine/save.');
 assert.deepEqual(report.requests,[]);assert.deepEqual(report.errors,[]);
 await browser.close();if(process.env.QA_REPORT)fs.writeFileSync(process.env.QA_REPORT,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
})().catch(async error=>{console.error(error);if(process.env.QA_REPORT)fs.writeFileSync(process.env.QA_REPORT,JSON.stringify({...report,failure:error.stack},null,2)+'\n');await browser?.close().catch(()=>{});process.exitCode=1;});
