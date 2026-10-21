// Optional real-browser checks for the reference combat layout and live controls.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.BROWSER_QA_MODULE || 'playwright');
const E = require('../dist/engine.js');
const C = require('../dist/config.js');
const report = {checks: [], errors: [], viewports: []};
let server;

(async()=>{
 const options={headless:true,args:['--no-sandbox']};
 if(process.env.QA_CHROMIUM_MODULE){
  const chrome=require(process.env.QA_CHROMIUM_MODULE);
  options.executablePath=await chrome.executablePath();options.args=[...chrome.args,'--no-sandbox'];
 }
 if(process.env.QA_DISABLE_GPU)options.args.push('--disable-gpu');
 server=require('node:child_process').spawn(process.execPath,[path.join(__dirname,'../server.cjs')],{env:{...process.env,PORT:'4184'},stdio:['ignore','pipe','pipe']});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.stdout.once('data',resolve);server.stderr.once('data',d=>reject(new Error(d.toString())));});
 const browser=await chromium.launch(options);
 const page=await browser.newPage({viewport:{width:1920,height:1080},reducedMotion:'reduce'});
 page.on('pageerror',e=>report.errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url());});
 const click=a=>page.locator('[data-action="'+a+'"]').first().click();
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')));
 const screenshot=async name=>{
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  if(process.env.QA_SCREENSHOTS){fs.mkdirSync(process.env.QA_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,name+'.png'),fullPage:true,animations:'disabled'});}
 };
 async function restore(run){
  await page.evaluate(r=>{localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true}));},run);
  await page.reload();await click('continue');
  await page.evaluate(()=>Promise.all([...document.images].map(im=>im.decode())));
 }
 const fixture=(id='bat',stage=0)=>{
  const r=E.newRun(7);delete r.route;r.stage=stage;E.startBattle(r,id);return r;
 };
 try{
  await page.goto('http://127.0.0.1:4184/');
  const r=fixture();r.battle.focus=2;
  await restore(r);
  assert.match(await page.locator('.player').innerText(),/Alyssa.*the Clairvoyance/s);
  assert.match(await page.locator('[data-action=focus] .icon').getAttribute('src'),/ui-focus\.webp$/);
  assert.match(await page.locator('[data-action=forecast] img.icon').getAttribute('src'),/ui-predict\.png$/);
  assert.notEqual(await page.locator('[data-action=focus] .icon').getAttribute('src'),await page.locator('[data-action=forecast] .icon').getAttribute('src'));
  assert.equal(await page.locator('.combatant').count(),2);
  assert.equal(await page.locator('[data-action=end-turn]').count(),1);
  assert.equal(await page.locator('.fighter-art').first().evaluate(el=>getComputedStyle(el).animationName),'none');
  await screenshot('combat-rune-bat-desktop');
  report.checks.push('Reference layout: source Alyssa and Rune Bat, separate Focus/Predict artwork, real HP and turn, grounded idle');

  const expected=JSON.parse(JSON.stringify(r));
  await click('focus');E.armFocus(expected);
  assert.equal((await state()).battle.boostArmed,true);
  assert.equal(await page.locator('[data-action=focus]').getAttribute('aria-pressed'),'true');
  const card=expected.battle.hand.find(c=>E.definition(c).block);
  assert.ok(card,'Fixture needs a playable Defense card');
  const key=expected.battle.hand.findIndex(c=>c.uid===card.uid)+1;
  await page.keyboard.press(String(key));E.playCard(expected,card.uid);
  let actual=await state();
  assert.equal(actual.battle.block,expected.battle.block);
  assert.equal(actual.battle.focus,1);
  assert.equal(actual.battle.energy,expected.battle.energy);
  assert.equal(actual.battle.boostUsed,true);
  assert.equal(await page.locator('[data-action=focus]').isDisabled(),true);
  assert.match(await page.locator('.player .block-tag').innerText(),new RegExp(expected.battle.block+' Block'));
  assert.ok(E.validate(actual));
  await screenshot('combat-block-and-focus');
  await page.reload();await click('continue');
  assert.deepEqual(await state(),actual);
  await page.keyboard.press('e');E.endTurn(expected);
  actual=await state();
  assert.equal(actual.hp,expected.hp);assert.equal(actual.battle.turn,expected.battle.turn);
  assert.equal(actual.battle.energy,C.ENERGY);
  report.checks.push('Focus/keyboard: one boosted Block card, one spend, exact autosave/Continue and announced End Turn damage');

  for(const zone of ['draw','discard','exhaust']){
   await page.locator('[data-action=pile][data-zone='+zone+']').click();
   assert.equal(await page.locator('#dialog').evaluate(el=>el.open),true);
   await page.keyboard.press('Escape');
   assert.equal(await page.evaluate(()=>document.activeElement.dataset.zone),zone);
  }
  await page.keyboard.press('r');
  assert.equal(await page.locator('#dialog').evaluate(el=>el.open),true);
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.zone),'exhaust');
  report.checks.push('Draw/Discard/Exhaust inspect, Escape restores each trigger; R opens Predict');

  for(const [width,height] of [[1920,1080],[1280,720],[844,390],[390,844],[320,740],[3840,2160]]){
   await page.setViewportSize({width,height});await restore(r);
   const boxes=await page.evaluate(()=>{
    const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
    return {page:document.documentElement.scrollWidth,viewport:innerWidth,arena:rect('.battle-theatre'),player:rect('.player'),enemy:rect('.enemy'),hand:rect('.combat-hand'),focus:rect('[data-action=focus]'),end:rect('[data-action=end-turn]'),pile:rect('[data-zone=draw]'),turn:rect('.battle-round'),location:rect('.battle-location'),deck:rect('.battle-deck'),discard:rect('[data-zone=discard]'),exhaust:rect('[data-zone=exhaust]'),predict:rect('[data-action=forecast]')};
   });
   assert.ok(boxes.page<=width,JSON.stringify({width,boxes}));
   for(const key of ['player','enemy','focus','end','pile']){
    assert.ok(boxes[key].x>=-1&&boxes[key].right<=width+1,key+' is outside '+width+'px');
   }
   assert.ok(boxes.hand.y>=boxes.arena.bottom-1,'Hand must stay below the arena');
   assert.ok(boxes.focus.height>=44&&boxes.end.height>=44&&boxes.pile.height>=44);
   const icons=await page.evaluate(()=>{
    const size=s=>{const im=document.querySelector(s),r=im.getBoundingClientRect();return {width:r.width,height:r.height,loaded:im.tagName==='IMG'&&im.complete&&im.naturalWidth>0};};
    return {energy:size('.energy img.icon'),focus:size('.focus-btn img.icon'),predict:size('.forecast-btn img.icon'),playerHealth:size('.player .fighter-stats img.icon'),enemyHealth:size('.enemy .fighter-stats img.icon')};
   });
   for(const [name,im]of Object.entries(icons))assert.ok(im.loaded,name+' artwork failed to decode');
   const scale=Math.max(1,Math.min(width/1920,height/1080,2.25));
   assert.ok(icons.energy.width>=59*scale,'Energy artwork is too small');
   assert.ok(icons.predict.width>=39*scale,'Predict artwork is too small');
   assert.ok(icons.playerHealth.width>=23*scale&&icons.enemyHealth.width>=23*scale,'Health artwork is too small');
   assert.ok(Math.abs(icons.energy.width-icons.focus.width)<1,'Energy and Focus must have matching visual boxes');
   assert.ok(boxes.player.right<boxes.enemy.x,'Fighters must remain on opposite sides');
   const separate=(x,y)=>x.right<=y.x+1||y.right<=x.x+1||x.bottom<=y.y+1||y.bottom<=x.y+1;
   for(const pile of ['discard','exhaust'])for(const action of ['predict','end'])assert.ok(separate(boxes[pile],boxes[action]),pile+' must not overlap '+action+' at '+width+'px');
   if(width>600)assert.ok(boxes.turn.x>boxes.location.right||boxes.turn.bottom<=boxes.location.y,'Turn badge must not cover the location');
   await page.locator('[data-action=end-turn]').scrollIntoViewIfNeeded();
   assert.equal(await page.locator('[data-action=end-turn]').isVisible(),true);
   await screenshot('combat-'+width+'x'+height);
   report.viewports.push({width,height,rootOverflow:false,icons});
  }
  report.checks.push('FHD/1280 desktop, 844 landscape, 390/320 portrait and 4K: four decoded HUD icons, larger artwork, matching resource sizes, no root overflow and reachable actions');

  const empty=fixture();empty.battle.discard.push(...empty.battle.hand);empty.battle.hand=[];
  await restore(empty);
  assert.match(await page.locator('.empty-hand').innerText(),/End your turn/);
  await click('end-turn');assert.ok((await state()).battle.hand.length>0);
  report.checks.push('Empty hand explains recovery and End Turn draws real cards');
  await page.setViewportSize({width:1920,height:1080});
  for(const [id,stage] of [['sentinel',0],['dealer',1]]){
   await restore(fixture(id,stage));
   assert.equal(await page.locator('.enemy [role=meter]').getAttribute('aria-valuemax'),String(C.enemies[id].hp));
   assert.equal(await page.locator('.seal').count(),2);
   await screenshot('combat-'+id);
  }
  report.checks.push('Both source boss arenas and models load with exact configured HP and two live seals');

  const rest=E.newRun(7);delete rest.route;rest.scene='camp';rest.depth=2;rest.hp=38;
  for(const [width,height]of [[1920,1080],[390,844]]){
   await page.setViewportSize({width,height});await restore(rest);
   const heal=page.locator('[data-action=select-rest][data-value=heal]');
   assert.match(await heal.locator('img.icon').getAttribute('src'),/map-camp\.webp$/);
   assert.ok(await heal.locator('img.icon').evaluate(im=>im.complete&&im.naturalWidth>0&&im.getBoundingClientRect().width>=60));
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await heal.click();assert.equal((await state()).hp,38);
   assert.match(await heal.innerText(),/38 → 50 HP/);
   await screenshot('rest-icon-'+width);
   await click('rest');assert.equal((await state()).hp,50);
   await page.reload();await click('continue');assert.equal((await state()).hp,50);
  }
  report.checks.push('Rest choice uses the supplied blue campfire seal on desktop/phone; preview preserves HP and Confirm Rest heals exactly once across reload');
  assert.deepEqual(report.errors,[]);
  console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();server?.kill();}
})().catch(e=>{server?.kill();console.error(e);process.exitCode=1;});
