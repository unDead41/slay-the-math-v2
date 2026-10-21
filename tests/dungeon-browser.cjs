// Release QA for scene switching and the actual, visible floor/sprite relationship.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require(process.env.BROWSER_QA_MODULE||'playwright');
const E=require('../dist/engine.js');
const C=require('../dist/config.js');
const report={checks:[],grounding:[],errors:[]};
let server;

(async()=>{
 const options={headless:true,args:['--no-sandbox']};
 if(process.env.QA_CHROMIUM_MODULE){const chrome=require(process.env.QA_CHROMIUM_MODULE);options.executablePath=await chrome.executablePath();options.args=[...chrome.args,'--no-sandbox'];}
 if(process.env.QA_DISABLE_GPU)options.args.push('--disable-gpu');
 server=require('node:child_process').spawn(process.execPath,[path.join(__dirname,'../server.cjs')],{env:{...process.env,PORT:'4185'},stdio:['ignore','pipe','pipe']});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.stdout.once('data',resolve);server.stderr.once('data',d=>reject(new Error(String(d))));});
 const browser=await chromium.launch(options);
 const page=await browser.newPage({viewport:{width:1920,height:1080},reducedMotion:'reduce'});
 page.on('pageerror',e=>report.errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url());});
 page.setDefaultTimeout(7000);
 const click=a=>page.locator('[data-action="'+a+'"]:visible').first().click();
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')));
 const images=()=>page.evaluate(()=>Promise.all([...document.images].filter(im=>im.hasAttribute('src')).map(im=>im.decode())));
 const screenshot=async name=>{if(process.env.QA_SCREENSHOTS){fs.mkdirSync(process.env.QA_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,name+'.png'),fullPage:true,animations:'disabled'});}};
 async function restore(id='beetle',stage=0,elite=false){
  const run=E.newRun(7);delete run.route;run.stage=stage;E.startBattle(run,id,elite);
  await page.evaluate(r=>{localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true}));},run);
  await page.reload();await click('continue');await images();return run;
 }
 async function grounded(id){
  assert.equal(await page.locator('.arena-backdrop').isVisible(),true,'The arena must be painted, not only loaded');
  const result=await page.evaluate(()=>{
   const arena=document.querySelector('.battle-theatre'),back=document.querySelector('.arena-backdrop'),ar=arena.getBoundingClientRect();
   const scale=Math.max(ar.width/back.naturalWidth,ar.height/back.naturalHeight);
   // The supplied six arenas have their back-wall/floor boundary before 68%.
   const position=parseFloat(getComputedStyle(back).objectPosition.split(' ')[1])/100;
   const floorStart=ar.top+back.naturalHeight*scale*.68-(back.naturalHeight*scale-ar.height)*position;
   return [...document.querySelectorAll('.combatant')].map(actor=>{
    const image=actor.querySelector('.fighter-art'),im=image.getBoundingClientRect(),shadow=actor.querySelector('.ground-shadow').getBoundingClientRect();
    const foot=im.y+im.height*11/12,ground=shadow.y+shadow.height*.45;
    const lift=actor.dataset.floating==='true'?(actor.dataset.enemy==='wisp'?(innerWidth<=600?6:9):(innerWidth<=600?18:22)):0;
    return {actor:actor.className,foot,ground,lift,floorStart,arenaBottom:ar.bottom,error:Math.abs(foot+lift-ground),canvas:[image.naturalWidth,image.naturalHeight]};
   });
  });
  for(const actor of result){
   assert.deepEqual(actor.canvas,[1600,1200]);
   assert.ok(actor.error<1.2,`${id}: foot and contact shadow drifted: ${JSON.stringify(actor)}`);
   assert.ok(actor.ground>actor.floorStart+12,`${id}: shadow is on the wall, not the floor`);
   assert.ok(actor.ground<actor.arenaBottom-55,`${id}: floor or status panel is clipped`);
  }
  report.grounding.push({id,width:await page.evaluate(()=>innerWidth),maxFootError:Math.max(...result.map(r=>r.error))});
 }
 try{
  await page.goto('http://127.0.0.1:4185/');await images();
  assert.equal(await page.locator('.main-menu-actions button').count(),5);
  assert.equal(await page.locator('.menu-continue').isDisabled(),true);
  assert.equal(await page.locator('.scene-choice').count(),5);
  const menuBox=await page.locator('.main-menu-actions').boundingBox();
  for(const [i,id] of ['corridor','campfire','archive','map','door'].entries()){
   await page.locator('.scene-choice').nth(i).click();
   await page.waitForFunction(id=>document.querySelector('.illustrated-home').dataset.art===id,id);
   await images();
   assert.deepEqual(await page.locator('.main-menu-actions').boundingBox(),menuBox,'Changing scene must not move controls');
   assert.equal(await page.locator('.scene-choice[aria-pressed=true]').count(),1);
   await screenshot('menu-'+id);
  }
  report.checks.push('Five supplied illustrated scenes; five native menu buttons; disabled Continue without a save; scene changes do not move controls');
  await click('help');assert.equal(await page.locator('#dialog').evaluate(d=>d.open),true);await page.keyboard.press('Escape');
  await click('library');await page.locator('#card-search').fill('no-such-card');assert.equal(await page.locator('.no-results').count(),1);await click('close');
  await click('saves');await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.dataset.action),'saves');
  report.checks.push('Tutorial, collection empty state, Settings and Escape/focus restoration work from the new menu');

  for(const [width,height] of [[1920,1080],[1280,720],[844,390],[390,844],[320,740]]){
   await page.setViewportSize({width,height});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Menu root overflow');
   const buttons=await page.locator('.main-menu-actions button').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,right:r.right,height:r.height};}));
   for(const r of buttons)assert.ok(r.x>=0&&r.right<=width&&r.height>=44);
   await screenshot('menu-'+width);
   await restore();await grounded('beetle');await screenshot('grounded-'+width);
   await click('home');
  }
  report.checks.push('Menu and grounded combat reflow at 1920, 1280, 844, 390 and 320px; 44px menu controls; no page overflow');
  await page.setViewportSize({width:1920,height:1080});
  for(const [stage,ids] of [[0,['wisp','beetle','bat','knight','shard','sentinel']],[1,['weaver','shade','mimic','golem','reaper','dealer']]]){
   for(const id of ids){
    const elite=['knight','shard','golem','reaper'].includes(id);
    const expected=await restore(id,stage,elite);await grounded(id);
    const kind=C.enemies[id].boss?'boss':elite?'elite':'normal';
    assert.match(await page.locator('.arena-backdrop').getAttribute('src'),new RegExp(`arena-${kind}-${stage+1}\\.webp$`));
    assert.equal((await state()).hp,expected.hp);assert.equal((await state()).battle.hp,expected.battle.hp);
    await screenshot('grounded-'+id);
   }
  }
  report.checks.push('All 12 enemies and all six stage/encounter arenas are visible; feet/shadows share the floor; exact HP retained');

  for(const id of ['wisp','beetle','bat','knight','shard']){
   const r=await restore(id,0,['knight','shard'].includes(id));
   const block=r.battle.hand.find(c=>E.definition(c).block);
   if(block){await page.locator('[data-action=play][data-id="'+block.uid+'"]').click();await images();await grounded(id);}
   const attack=r.battle.hand.find(c=>E.definition(c).damage);
   if(attack){await page.locator('[data-action=play][data-id="'+attack.uid+'"]').click();await images();await grounded(id);}
   await click('end-turn');await images();await grounded(id);
  }
  report.checks.push('Real Attack, Block and End Turn pose changes preserve the same foot pivot for all five supplied action sheets');

  await click('home');await page.emulateMedia({reducedMotion:'no-preference'});
  await page.clock.install();
  // Saved Motion Off must stop automatic scene changes even without OS reduction.
  let art=await page.locator('.illustrated-home').getAttribute('data-art');
  await page.clock.runFor(15000);assert.equal(await page.locator('.illustrated-home').getAttribute('data-art'),art);
  await click('motion');await page.locator('.scene-choice').last().click();await page.waitForFunction(()=>document.querySelector('.illustrated-home').dataset.art==='door');
  await page.locator('.scene-choice').last().blur();
  await page.mouse.move(1900,200);await page.clock.runFor(15000);await page.waitForFunction(()=>document.querySelector('.illustrated-home').dataset.art==='corridor');
  await click('saves');art=await page.locator('.illustrated-home').getAttribute('data-art');await page.clock.runFor(15000);assert.equal(await page.locator('.illustrated-home').getAttribute('data-art'),art);await page.keyboard.press('Escape');
  await page.emulateMedia({reducedMotion:'reduce'});art=await page.locator('.illustrated-home').getAttribute('data-art');await page.clock.runFor(30000);assert.equal(await page.locator('.illustrated-home').getAttribute('data-art'),art);
  report.checks.push('Autoplay advances; Motion Off, OS reduced motion and open dialogs pause it');
  assert.deepEqual(report.errors,[]);console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();server?.kill();}
})().catch(error=>{server?.kill();console.error(error);process.exitCode=1;});
