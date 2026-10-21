'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.BROWSER_QA_MODULE||'playwright');
const E=require('../dist/engine.js'),D=require('../dist/animation-data.js');
const report={version:'2.7.0',checks:[],viewports:[],actors:[],errors:[]};let server,browser;
function fixture(id,stage=0){const r=E.newRun(7);delete r.route;r.stage=stage;E.startBattle(r,id);r.battle.hp=r.battle.maxHp=200;r.battle.enemyBlock=0;const cards=[...r.battle.hand,...r.battle.draw],hand=[];for(const key of ['strike','guard','draw','ember'])hand.push(cards.splice(cards.findIndex(c=>c.key===key),1)[0]);r.battle.hand=hand;r.battle.draw=cards;assert.ok(E.validate(r));return r;}
(async()=>{
 const opts={headless:true,args:['--no-sandbox']};if(process.env.QA_CHROMIUM_MODULE){const chrome=require(process.env.QA_CHROMIUM_MODULE);opts.executablePath=await chrome.executablePath();opts.args=[...chrome.args,'--no-sandbox'];}if(process.env.QA_DISABLE_GPU)opts.args.push('--disable-gpu');
 server=require('node:child_process').spawn(process.execPath,[path.join(__dirname,'../server.cjs')],{env:{...process.env,PORT:'4197'},stdio:['ignore','pipe','pipe']});await new Promise((r,j)=>{server.stdout.once('data',r);server.once('error',j);server.stderr.once('data',d=>j(Error(String(d))));});
 browser=await chromium.launch(opts);const page=await browser.newPage({viewport:{width:1920,height:1080},reducedMotion:'no-preference'});page.setDefaultTimeout(30000);
 page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url());});
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1'))),click=a=>page.locator('[data-action="'+a+'"]:visible').first().click();
 const canvas=()=>page.locator('.enemy .actor-animation');
 async function ready(action='idle'){await page.waitForFunction(action=>{const c=document.querySelector('.enemy .actor-animation');return c?.parentElement.dataset.animationReady==='true'&&c.dataset.action===action;},action);}
 async function hash(){return canvas().evaluate(async c=>{const bytes=c.getContext('2d').getImageData(0,0,c.width,c.height).data;return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');});}
 async function restore(r){await page.evaluate(r=>{localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:true,sound:false,musicMuted:true}));},r);await page.reload();await click('continue');if(D.actors[r.battle?.enemyId]&&r.stage===0)await ready();}
 async function shot(name){if(process.env.QA_SCREENSHOTS){fs.mkdirSync(process.env.QA_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,name+'.jpg'),type:'jpeg',quality:80,timeout:30000});}}
 try{
  const start=new Date('2026-10-21T12:00:00Z');await page.clock.install({time:start});await page.goto('http://127.0.0.1:4197/');await page.clock.pauseAt(new Date(start.getTime()+60000));
  for(const id of Object.keys(D.actors)){
   await restore(fixture(id));const before=await state(),first=await hash();await page.clock.runFor(220);const second=await hash();assert.notEqual(second,first,id+' idle pixels must change');assert.deepEqual(await state(),before);
   const expected=E.clone(before),strike=expected.battle.hand.find(c=>c.key==='strike');E.playCard(expected,strike.uid);await page.locator('[data-action=play][data-id="'+strike.uid+'"]').click();await ready('damaged');assert.deepEqual(await state(),expected);
   const hit=await hash();await page.clock.runFor(180);assert.notEqual(await hash(),hit,id+' damaged pixels must change');await page.clock.runFor(450);await ready();assert.deepEqual(await state(),expected);
   report.actors.push({id,idlePixelsChange:true,damagedPixelsChange:true,exactEngineState:true});await shot(id+'-idle');
  }
  report.checks.push('All five supplied Stage 1 actors paint different real pixels as Idle and Damaged frames advance; native Attack resolves exact engine damage before presentation and the saved run never changes with animation time.');
  for(const [id,action,prepare]of [['wisp','attack',r=>{}],['beetle','defend',r=>{}],['wisp','skill',r=>E.endTurn(r)]]){
   const r=fixture(id);prepare(r);await restore(r);const expected=E.clone(await state());E.endTurn(expected);await click('end-turn');await ready(action);assert.deepEqual(await state(),expected);const first=await hash();await page.clock.runFor(210);assert.notEqual(await hash(),first);await shot(id+'-'+action);await page.clock.runFor(800);await ready();assert.deepEqual(await state(),expected);
  }
  report.checks.push('Native End Turn uses Attack, Defend for actual Block intents, or Skill for the existing burst intent. Each source clip finishes once and returns to idle without changing HP, draws, Energy, RNG or logs.');
  await restore(fixture('knight'));const before=await state();await page.clock.runFor(200);await click('saves');const frozen=await hash();await page.clock.runFor(1500);assert.equal(await hash(),frozen);await click('close');await page.clock.runFor(230);assert.notEqual(await hash(),frozen);assert.deepEqual(await state(),before);
  await click('saves');await page.locator('#motion-toggle').uncheck();await click('close');await ready();const noMotion=await hash();await page.clock.runFor(2000);assert.equal(await hash(),noMotion);assert.equal(await canvas().getAttribute('data-frame'),'0');
  await click('saves');await page.locator('#motion-toggle').check();await click('close');await ready();await page.emulateMedia({reducedMotion:'reduce'});await ready();const reduced=await hash();await page.clock.runFor(1000);assert.equal(await hash(),reduced);assert.equal(await canvas().getAttribute('data-frame'),'0');await page.emulateMedia({reducedMotion:'no-preference'});
  report.checks.push('The live player freezes behind the shared dialog, resumes without counting paused time, and paints a static supplied idle frame for Game Motion Off and OS Reduced Motion.');
  for(const [width,height]of [[1920,1080],[3440,1440],[390,844],[320,740]]){
   await page.setViewportSize({width,height});
   for(const id of ['beetle','knight','shard']){
    await restore(fixture(id));const g=await canvas().evaluate(c=>{const box=c.getBoundingClientRect(),shadow=c.closest('.combatant').querySelector('.ground-shadow').getBoundingClientRect();return {floor:box.y+box.height*1100/1200,shadow:(shadow.top+shadow.bottom)/2,canvasWidth:box.width,canvasHeight:box.height,overflow:document.documentElement.scrollWidth>innerWidth};});
    assert.ok(Math.abs(g.floor-g.shadow)<3,JSON.stringify({width,id,g}));assert.ok(Math.abs(g.canvasWidth/g.canvasHeight-4/3)<.02);assert.equal(g.overflow,false);
   }
   await shot('grounding-'+width);report.viewports.push({width,height,groundedActors:3,overflow:false});
  }
  report.checks.push('Prism Guard, Mirror Knight and Shard Beast share the exact registered arena floor at desktop, UWHD and two phone widths, without stretched frames or page overflow.');
  for(const [id,stage]of [['sentinel',0],['dealer',1],['knight',1],['weaver',1]]){await restore(fixture(id,stage));assert.equal(await canvas().count(),0);assert.equal(await page.locator('.enemy .fighter-art').isVisible(),true);assert.match(await page.locator('.enemy .fighter-art').getAttribute('src'),/^assets\/ground-/);}
  report.checks.push('Both bosses and Stage 2/legacy encounters retain their original model renderer. No unavailable Alyssa file is used.');
  const offline=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'no-preference'}),requests=[];offline.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});offline.on('pageerror',e=>report.errors.push(e.message));
  await offline.goto('file://'+path.join(__dirname,'../MAIN-SEKARANG.html'));await offline.evaluate(r=>{localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:true,sound:false,musicMuted:true}));},fixture('shard'));await offline.reload();await offline.locator('[data-action=continue]').click();await offline.waitForFunction(()=>document.querySelector('.enemy .fighter-anchor')?.dataset.animationReady==='true');
  assert.equal(await offline.evaluate(()=>Object.keys(window.DC_ASSETS).filter(n=>n.startsWith('motion-s1-')).length),25);assert.deepEqual(requests,[]);await offline.close();report.checks.push('The generated portable HTML embeds all 25 native atlas derivatives and paints the new animation with zero HTTP requests.');
  assert.deepEqual(report.errors,[]);console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();server.kill();}
})().catch(e=>{server?.kill();console.error(e);process.exitCode=1;});
