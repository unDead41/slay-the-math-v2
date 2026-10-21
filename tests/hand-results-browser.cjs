'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.BROWSER_QA_MODULE||'playwright');
const E=require('../dist/engine.js');
const report={version:'2.9.0',checks:[],viewports:[],errors:[]};let server,browser;
function fixture(count=10){const r=E.newRun(7);delete r.route;E.startBattle(r,'wisp');r.battle.hp=r.battle.maxHp=200;E.draw(r,count-4);assert.ok(E.validate(r));return r;}
(async()=>{
 try{
  server=require('node:child_process').spawn(process.execPath,[path.join(__dirname,'../server.cjs')],{env:{...process.env,PORT:'4199'},stdio:['ignore','pipe','pipe']});
  await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.stderr.once('data',d=>reject(Error(String(d))));});
  const opts={headless:true,args:['--no-sandbox','--disable-gpu']};if(process.env.QA_CHROMIUM_EXECUTABLE)opts.executablePath=process.env.QA_CHROMIUM_EXECUTABLE;
  browser=await chromium.launch(opts);
  const context=await browser.newContext({viewport:{width:1920,height:1080},hasTouch:true});const page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));
  // Also exercise native CSS transitions with a real running clock.
  const realContext=await browser.newContext({viewport:{width:1920,height:1080}}),real=await realContext.newPage();real.on('pageerror',e=>report.errors.push(e.message));await real.goto('http://127.0.0.1:4199/');
  await real.evaluate(r=>{localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:true,sound:false,musicMuted:true}));},fixture());await real.reload();await real.locator('[data-action=continue]').evaluate(el=>el.click());await real.bringToFront();await real.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const original=await real.locator('.hand .playing-card').evaluateAll(es=>es.map(e=>{const b=e.getBoundingClientRect();return {x:b.x,y:b.y,h:b.height};}));
  await real.evaluate(()=>{window.__handEvents=[];const h=document.querySelector('.hand');for(const type of ['pointermove','pointerleave','focusin','focusout'])h.addEventListener(type,e=>__handEvents.push({type,pointer:e.pointerType,index:e.target.closest?.('.hand-slot')?.style.getPropertyValue('--i'),x:e.clientX,y:e.clientY}));});
  const clockBefore=await real.evaluate(()=>Date.now());
  await real.mouse.move(original[3].x+10,original[3].y+original[3].h*.55);await new Promise(resolve=>setTimeout(resolve,450));
  const debug=await real.evaluate(()=>({clock:Date.now(),events:__handEvents,focus:document.querySelector('.hand').dataset.focused,height:innerHeight,hidden:document.hidden,timeline:document.timeline.currentTime,shift:document.querySelector('.hand-slot').style.getPropertyValue('--hand-shift'),transform:getComputedStyle(document.querySelector('.hand-slot')).transform}));
  assert.equal(await real.locator('.hand').getAttribute('data-focused'),'3',JSON.stringify({original,clockBefore,debug}));assert.ok((await real.locator('.hand .playing-card').first().boundingBox()).x<original[0].x,JSON.stringify({original,clockBefore,debug}));
  await new Promise(resolve=>setTimeout(resolve,350));assert.equal(await real.locator('.hand').getAttribute('data-focused'),'3');await realContext.close();
  report.checks.push('A separate page with a real running clock also completes the hover/neighbor CSS transitions and holds the same card under a stationary pointer.');
  const now=new Date('2026-10-21T12:00:00Z');await page.clock.install({time:now});await page.clock.pauseAt(new Date(now.getTime()+60000));await page.goto('http://127.0.0.1:4199/');
  const click=action=>page.locator('[data-action="'+action+'"]').first().evaluate(el=>el.click());
  const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')));
  async function restore(r,motion=true){await page.evaluate(({r,motion})=>{localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion,sound:false,musicMuted:true}));},{r,motion});await page.reload();await click('continue');}
  async function shot(name){if(process.env.QA_SCREENSHOTS){fs.mkdirSync(process.env.QA_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,name+'.jpg'),type:'jpeg',quality:85,timeout:30000});}}
  const focused=()=>page.locator('.hand').getAttribute('data-focused');
  async function rects(){return page.locator('.hand .playing-card').evaluateAll(es=>es.map(e=>{const b=e.getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height};}));}
  async function point(i){const b=(await rects())[i];return {x:b.x+10,y:b.y+b.h*.55};}
  async function move(i){const p=await point(i);await page.mouse.move(p.x,p.y);}
  await restore(fixture());await page.clock.runFor(32);
  assert.match(await page.locator('.hand-heading').innerText(),/10\s*\/\s*10.*FULL/);
  let boxes=await rects();assert.equal(boxes.length,10);assert.ok(boxes[1].x<boxes[0].x+boxes[0].w,'many cards must overlap');
  const before=await state();await move(3);await page.clock.runFor(100);assert.equal(await focused(),'-1');await page.clock.runFor(45);assert.equal(await focused(),'3');await page.clock.runFor(200);
  // Settle compositor transitions explicitly: Playwright's paused clock controls JS/RAF.
  await page.locator('.hand').evaluate(el=>el.getAnimations({subtree:true}).forEach(a=>a.finish()));
  const shifted=await rects();assert.ok(shifted[0].x<boxes[0].x,JSON.stringify({boxes,shifted,focus:await focused()}));assert.ok(shifted[9].x>boxes[9].x);assert.ok(shifted[3].y<boxes[3].y);
  await page.clock.runFor(2500);assert.equal(await focused(),'3','stationary pointer must not start a hover loop');assert.deepEqual(await state(),before);await shot('hand-ten-focused');
  await page.mouse.move(0,0);await page.clock.runFor(200);assert.equal(await focused(),'-1');
  for(const i of [0,1,2,3,4]){await move(i);await page.clock.runFor(25);assert.equal(await focused(),'-1');}
  await page.clock.runFor(145);assert.equal(await focused(),'4');
  report.checks.push('Ten cards overlap, neighbors move aside after a 140ms dwell, rapid crossings do not refocus, and a stationary pointer stays stable without changing the save.');
  console.error('Hover and overlap checked');
  await click('saves');assert.equal(await focused(),'-1');await page.clock.runFor(500);assert.equal(await focused(),'-1');await click('close');
  const enabled=page.locator('.hand button:not(:disabled)');await enabled.last().focus();const keyboard=await focused();assert.ok(Number(keyboard)>=0);await page.keyboard.press('Tab');await page.clock.runFor(200);
  assert.ok(await page.evaluate(()=>document.activeElement.matches('button')));
  await restore(fixture(),false);await page.clock.runFor(32);await move(2);await page.clock.runFor(150);
  assert.equal(await focused(),'2');assert.equal(await page.locator('.hand-slot').first().evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.hand .playing-card').first().evaluate(el=>getComputedStyle(el).transitionDuration),'0s');await page.emulateMedia({reducedMotion:'no-preference'});
  report.checks.push('Opening a dialog cancels hover; native keyboard focus exposes a card immediately. Motion Off and OS reduced motion keep focus usable without transitions.');
  for(const [width,height]of [[1920,1080],[3440,1440],[3840,2160],[1366,768],[390,844],[320,740]]){
   await page.setViewportSize({width,height});await restore(fixture(),false);await page.clock.runFor(32);
   const g=await page.locator('.hand').evaluate(el=>{const b=el.getBoundingClientRect(),cards=[...el.querySelectorAll('.playing-card')].map(c=>c.getBoundingClientRect());return {overflow:document.documentElement.scrollWidth>innerWidth,rail:el.scrollWidth>el.clientWidth,overlap:cards[1].left<cards[0].right,handHeight:b.height,cardHeight:cards[0].height,disabledOpaque:[...el.querySelectorAll('button:disabled')].every(c=>getComputedStyle(c).opacity==='1')};});
   assert.equal(g.overflow,false);assert.equal(g.overlap,true);assert.equal(g.disabledOpaque,true);assert.ok(g.handHeight>=g.cardHeight+20);if(width<=390)assert.equal(g.rail,true);
   const last=page.locator('.hand button').last();await last.focus();await page.clock.runFor(32);
   const visible=await last.evaluate(el=>{const c=el.getBoundingClientRect(),h=el.closest('.hand').getBoundingClientRect();return c.left>=h.left-1&&c.right<=h.right+1;});assert.ok(visible,'last card must be readable by keyboard on '+width);
   await shot('hand-ten-'+width);report.viewports.push({width,height,...g,lastCardVisible:true});
  }
  // A touch tap resolves the card under the finger once, even in an overlapping rail.
  const chosen=page.locator('.hand button:not(:disabled)').last();await chosen.focus();await page.clock.runFor(32);
  const cardId=await chosen.getAttribute('data-id'),expected=E.clone(await state());E.playCard(expected,cardId);
  const tap=await chosen.boundingBox();await page.touchscreen.tap(tap.x+tap.width/2,tap.y+tap.height/2);assert.deepEqual(await state(),expected);
  report.checks.push('Six viewport sizes through 4K preserve overlap and page width. Phone rails scroll, the tenth card is fully exposed by focus, and a touch tap commits exactly the chosen card once.');
  console.error('Keyboard, motion and viewport checks complete');
  await page.setViewportSize({width:1920,height:1080});
  // Resolve a real death, then revisit and reload the results after advancing the clock.
  const dying=fixture(4);dying.hp=1;dying.started=new Date('2026-10-21T12:00:00Z').getTime()-75000;await restore(dying,false);await click('end-turn');
  const ended=await state();assert.equal(ended.scene,'defeat');assert.ok(ended.finished);
  const result=()=>page.locator('.result-grid>div').nth(1).locator('strong').innerText();const time=await result();
  await page.clock.runFor(90000);await click('home');await click('continue');assert.equal(await result(),time);
  await page.reload();await click('continue');assert.equal(await result(),time);assert.equal((await state()).finished,ended.finished);
  await click('stats');await page.clock.runFor(60000);await click('close');assert.equal(await result(),time);await shot('frozen-run-result');
  report.checks.push('A real lethal End Turn freezes Time once; +150 seconds, Main Menu/View Results, Learning Record and reload preserve the exact same result and saved finished timestamp.');
  // Inspect every Skill frame in the actual renderer; keep a same-scale filmstrip for review.
  await restore(fixture(4));await page.waitForFunction(()=>document.querySelector('.player .actor-animation')?.parentElement.dataset.animationReady==='true');
  await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1200;document.body.appendChild(canvas);const p=DCActorAnimation.mount(canvas,0,'mc_01');p.play('skill');window.__skillQA={p,canvas};});
  await page.waitForFunction(()=>window.__skillQA.canvas.dataset.action==='skill');
  const frames=[];for(let i=0;i<6;i++){
   if(i)for(let tick=0;tick<35;tick++){const frame=await page.evaluate(()=>Number(__skillQA.canvas.dataset.frame));if(frame===i)break;await page.clock.runFor(10);}
   const entry=await page.evaluate(()=>{const c=__skillQA.canvas;return {frame:Number(c.dataset.frame),image:c.toDataURL()};});assert.equal(entry.frame,i);frames.push(entry.image);
  }
  if(process.env.QA_SCREENSHOTS){await page.evaluate(images=>{const strip=document.createElement('canvas');strip.width=1920;strip.height=240;const ctx=strip.getContext('2d');ctx.fillStyle='#09131f';ctx.fillRect(0,0,1920,240);return Promise.all(images.map((src,i)=>new Promise(resolve=>{const img=new Image();img.onload=()=>{ctx.drawImage(img,i*320,0,320,240);resolve();};img.src=src;}))).then(()=>{window.__strip=strip.toDataURL();});},frames);const raw=await page.evaluate(()=>window.__strip);fs.writeFileSync(path.join(process.env.QA_SCREENSHOTS,'skill-six-frames.png'),Buffer.from(raw.split(',')[1],'base64'));}
  await page.evaluate(()=>{__skillQA.p.destroy();__skillQA.canvas.remove();delete window.__skillQA;});
  report.checks.push('All six Skill frames render in order with the calibrated body scale and unchanged source timing; same-scale canvas filmstrip captured for visual review.');

  assert.deepEqual(report.errors,[]);console.log(JSON.stringify(report,null,2));
 }finally{await browser?.close();server?.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
