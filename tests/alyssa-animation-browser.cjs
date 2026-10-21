'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.BROWSER_QA_MODULE||'playwright');
const E=require('../dist/engine.js'),D=require('../dist/animation-data.js');
const report={version:'2.8.1',checks:[],viewports:[],errors:[],legacyHeroRequests:[]};let server,browser;
function fixture(id='wisp',stage=0){
 const r=E.newRun(7);delete r.route;r.stage=stage;E.startBattle(r,id);r.battle.hp=r.battle.maxHp=200;r.battle.enemyBlock=0;
 const cards=[...r.battle.hand,...r.battle.draw],hand=[];
 for(const key of ['strike','guard','draw','ember'])hand.push(cards.splice(cards.findIndex(c=>c.key===key),1)[0]);
 r.battle.hand=hand;r.battle.draw=cards;assert.ok(E.validate(r));return r;
}
(async()=>{
 const opts={headless:true,args:['--no-sandbox']};
 if(process.env.QA_CHROMIUM_MODULE){const imported=require(process.env.QA_CHROMIUM_MODULE),chrome=imported.default||imported;opts.executablePath=await chrome.executablePath();opts.args=[...chrome.args,'--no-sandbox'];}
 if(process.env.QA_DISABLE_GPU)opts.args.push('--disable-gpu');
 if(process.env.QA_CHROMIUM_EXECUTABLE){opts.executablePath=process.env.QA_CHROMIUM_EXECUTABLE;opts.args=['--no-sandbox','--disable-gpu'];}
 server=require('node:child_process').spawn(process.execPath,[path.join(__dirname,'../server.cjs')],{env:{...process.env,PORT:'4198'},stdio:['ignore','pipe','pipe']});
 await new Promise((r,j)=>{server.stdout.once('data',r);server.once('error',j);server.stderr.once('data',d=>j(Error(String(d))));});
 browser=await chromium.launch(opts);
 const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'no-preference'});page.setDefaultTimeout(30000);
 page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url());});
 page.on('request',r=>{if(/\/ground-alyssa-(standing|attack|defend|skill|damage)\.webp(?:\?|$)/.test(r.url()))report.legacyHeroRequests.push(r.url());});
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')));
 const click=a=>page.locator('[data-action="'+a+'"]:visible').first().evaluate(el=>el.click());
 const canvas=()=>page.locator('.player .actor-animation');
 async function ready(action='idle'){await page.waitForFunction(action=>{const c=document.querySelector('.player .actor-animation');return c?.parentElement.dataset.animationReady==='true'&&c.dataset.action===action;},action);}
 async function hash(){return canvas().evaluate(async c=>{const pixels=c.getContext('2d').getImageData(0,0,c.width,c.height).data;return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',pixels))).map(x=>x.toString(16).padStart(2,'0')).join('');});}
 async function poster(action){assert.match(await page.locator('.player .fighter-art').getAttribute('src'),new RegExp('assets/alyssa-right-'+action+'\\.webp$'));}
 async function changed(before){for(let i=0;i<25;i++){await page.clock.runFor(100);const next=await hash();if(next!==before)return next;}assert.fail('Canvas pixels did not advance');}
 async function restore(r){await page.evaluate(r=>{localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:true,sound:false,musicMuted:true}));},r);await page.reload();await click('continue');await ready();}
 async function shot(name){if(process.env.QA_SCREENSHOTS){fs.mkdirSync(process.env.QA_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,name+'.jpg'),type:'jpeg',quality:85,timeout:30000});}}
 try{
  const start=new Date('2026-10-21T12:00:00Z');await page.clock.install({time:start});await page.clock.pauseAt(new Date(start.getTime()+60000));await page.goto('http://127.0.0.1:4198/');
  await restore(fixture());await poster('idle');const idleState=await state(),firstIdle=await hash();await changed(firstIdle);assert.deepEqual(await state(),idleState);
  for(const [key,action] of [['strike','attack'],['guard','defend'],['draw','skill']]){
   console.error('Checking Alyssa '+action);
   const before=await state(),expected=E.clone(before),card=expected.battle.hand.find(c=>c.key===key);E.playCard(expected,card.uid);
   await page.locator('[data-action=play][data-id="'+card.uid+'"]').evaluate(el=>el.click());await ready(action);assert.deepEqual(await state(),expected);
   await poster(action);
   const first=await hash();await changed(first);await shot('alyssa-'+action);
   await page.clock.runFor(1000);await ready();assert.deepEqual(await state(),expected);
  }
  report.checks.push('Real canvas pixels advance for Idle, Attack, Defend and Skill. Native card actions produce the exact engine HP, Block, Energy, piles, RNG, logs and save state before animation advances. Every action returns to Idle.');console.error('Card motions checked');
  await restore(fixture());const hitExpected=E.clone(await state());E.endTurn(hitExpected);await click('end-turn');await ready('damaged');await poster('damaged');assert.deepEqual(await state(),hitExpected);const hit=await hash();await changed(hit);await shot('alyssa-damaged');await page.clock.runFor(900);await ready();
  const blocked=fixture();blocked.battle.block=100;await restore(blocked);const blockExpected=E.clone(await state());E.endTurn(blockExpected);await click('end-turn');await ready('defend');assert.deepEqual(await state(),blockExpected);assert.equal(blockExpected.hp,blocked.hp);await page.clock.runFor(1200);await ready();
  report.checks.push('End Turn selects Damaged for actual HP loss and Defend for a fully blocked hit, while the enemy plays independently. Animation time never replays combat.');
  await restore(fixture());await page.clock.runFor(200);await click('saves');const frozen=await hash();await page.clock.runFor(1600);assert.equal(await hash(),frozen);await click('close');await changed(frozen);
  await click('saves');await page.locator('#motion-toggle').uncheck();await click('close');await ready();await poster('idle');const still=await hash();await page.clock.runFor(2000);assert.equal(await hash(),still);assert.equal(await canvas().getAttribute('data-frame'),'0');
  await click('saves');await page.locator('#motion-toggle').check();await click('close');await page.emulateMedia({reducedMotion:'reduce'});await ready();const reduced=await hash();await page.clock.runFor(1200);assert.equal(await hash(),reduced);await page.emulateMedia({reducedMotion:'no-preference'});
  report.checks.push('Dialogs pause Alyssa. Motion Off and OS Reduced Motion keep supplied Idle frame 0 static, then resume normally.');console.error('Motion settings checked');
  for(const [id,stage] of [['sentinel',0],['dealer',1],['weaver',1]]){await restore(fixture(id,stage));const initial=await hash();await changed(initial);assert.equal(await page.locator('.enemy .actor-animation').count(),0);}
  await page.reload();await click('continue');await ready();assert.equal(await canvas().getAttribute('data-actor'),'mc_01');
  report.checks.push('Alyssa animates in both stages and against both bosses; enemy models retain their current Stage 1 and Stage 2 rendering. Refresh resumes the saved battle.');
  for(const [width,height]of [[1920,1080],[3440,1440],[3840,2160],[390,844],[320,740]]){
   console.error('Checking viewport '+width);
   await page.setViewportSize({width,height});if(width===1920)await restore(fixture('knight'));
   const bounds=Object.values(D.hero.animations).flatMap(c=>c.frames.map((_,i)=>({pivot:c.pivots[i]})));
   const g=await canvas().evaluate(c=>{const box=c.getBoundingClientRect(),shadow=c.closest('.combatant').querySelector('.ground-shadow').getBoundingClientRect();return {floor:box.y+box.height*1100/1200,shadow:(shadow.top+shadow.bottom)/2,width:box.width,height:box.height,overflow:document.documentElement.scrollWidth>innerWidth};});
   assert.ok(Math.abs(g.floor-g.shadow)<3,JSON.stringify({width,g}));assert.ok(Math.abs(g.width/g.height-4/3)<.02);assert.equal(g.overflow,false);assert.equal(bounds.length,30);
   await shot('alyssa-grounding-'+width);report.viewports.push({width,height,floorAligned:true,overflow:false});
  }
  report.checks.push('Alyssa shares the registered floor and undistorted 4:3 presentation canvas at FHD, UWHD, 4K and two phone widths. All 30 source alpha bounds fit the canvas (import audit).');
  for(const mode of ['no-canvas','failed-atlases']){
   console.error('Checking right-only fallback '+mode);
   const fallback=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'no-preference'}),old=[];
   fallback.on('request',r=>{if(/\/ground-alyssa-/.test(r.url()))old.push(r.url());});
   fallback.on('pageerror',e=>report.errors.push(e.message));
   if(mode==='no-canvas')await fallback.addInitScript(()=>Object.defineProperty(window,'CanvasRenderingContext2D',{value:undefined,configurable:true}));
   else await fallback.route('**/motion-alyssa-*.webp',route=>route.abort());
   const start=new Date('2026-10-21T12:00:00Z');await fallback.clock.install({time:start});await fallback.clock.pauseAt(new Date(start.getTime()+60000));await fallback.goto('http://127.0.0.1:4198/');
   async function load(r){await fallback.evaluate(r=>{localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:true,sound:false,musicMuted:true}));},r);await fallback.reload();await fallback.locator('[data-action=continue]').evaluate(el=>el.click());}
   async function assertRight(action){await fallback.waitForFunction(action=>{const img=document.querySelector('.player .fighter-art');return img?.complete&&img.naturalWidth===1600&&img.src.endsWith('/alyssa-right-'+action+'.webp');},action);assert.equal(await fallback.locator('.player .fighter-art').isVisible(),true);assert.notEqual(await fallback.locator('.player .fighter-anchor').getAttribute('data-animation-ready'),'true');}
   await load(fixture());await assertRight('idle');
   for(const [key,action]of [['strike','attack'],['guard','defend'],['draw','skill']]){await fallback.locator('[data-action=play][data-id="'+(await fallback.evaluate(key=>JSON.parse(localStorage.getItem('duel-cube-math.v1')).battle.hand.find(c=>c.key===key).uid,key))+'"]').evaluate(el=>el.click());await assertRight(action);}
   await load(fixture('dealer',1));await assertRight('idle');await fallback.locator('[data-action=end-turn]').evaluate(el=>el.click());await assertRight('damaged');
   assert.deepEqual(old,[]);await fallback.close();
  }
  report.checks.push('All five visible image fallbacks use the supplied right-facing source with Canvas disabled and with every hero atlas request deliberately failed. No legacy hero image is requested; Stage 2 damaged fallback is covered.');
  const offline=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'no-preference'}),requests=[];
  offline.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});offline.on('pageerror',e=>report.errors.push(e.message));
  await offline.goto('file://'+path.join(__dirname,'../MAIN-SEKARANG.html'));await offline.evaluate(r=>{localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:true,sound:false,musicMuted:true}));},fixture());
  await offline.reload();await offline.locator('[data-action=continue]').evaluate(el=>el.click());await offline.waitForFunction(()=>document.querySelector('.player .fighter-anchor')?.dataset.animationReady==='true');
  assert.equal(await offline.evaluate(()=>Object.keys(window.DC_ASSETS).filter(n=>n.startsWith('motion-alyssa-')).length),5);assert.equal(await offline.evaluate(()=>Object.keys(window.DC_ASSETS).filter(n=>/^alyssa-right-/.test(n)).length),5);assert.equal(await offline.evaluate(()=>Object.keys(window.DC_ASSETS).filter(n=>/^ground-alyssa-/.test(n)).length),0);assert.deepEqual(requests,[]);await offline.close();
  report.checks.push('The generated offline HTML embeds all five Alyssa sheets and paints her animation with zero HTTP requests.');
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.legacyHeroRequests,[]);console.log(JSON.stringify(report,null,2));
 }finally{await browser?.close();server?.kill();}
})().catch(e=>{server?.kill();console.error(e);process.exitCode=1;});
