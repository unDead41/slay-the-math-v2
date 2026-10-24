'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {chromium}=require(process.env.BROWSER_QA_MODULE||'playwright');
(async()=>{
 let server,browser;const errors=[],checks=[];
 try{
  server=require('node:child_process').spawn(process.execPath,[path.join(__dirname,'../server.cjs')],{env:{...process.env,PORT:'4191'},stdio:['ignore','pipe','pipe']});await new Promise((resolve,reject)=>{server.once('error',reject);server.stdout.once('data',resolve);});
  const opts={headless:true,args:['--no-sandbox','--disable-gpu']};if(process.env.QA_CHROMIUM_MODULE){const imported=require(process.env.QA_CHROMIUM_MODULE),c=imported.default||imported;opts.executablePath=await c.executablePath();opts.args=[...c.args.filter(a=>a!=='--single-process'),...opts.args];}
  browser=await chromium.launch(opts);
  for(const difficulty of ['easy','medium','hard']){
   const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();
   page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
   await context.addInitScript(()=>localStorage.setItem('duel-cube-settings.v1',JSON.stringify({sound:false,motion:false,musicMuted:true,voiceMuted:true})));
   const enter=async()=>{await page.locator('#resource-enter').waitFor({state:'visible',timeout:180000});await page.locator('#resource-enter').click();await page.waitForFunction(()=>document.getElementById('resource-loader').hidden);};
   await page.goto('http://127.0.0.1:4191/?balance='+difficulty);
   await enter();
   // Hosted bootstrap now loads the game asynchronously after document load.
   await page.waitForFunction(()=>typeof window.DCEngine?.newRun==='function'&&!!document.querySelector('[data-action="new"]'),{},{timeout:180000});
   // Pin only New Run's public seed; retain real engine actions and clock.
   await page.evaluate(()=>{const original=DCEngine.newRun;DCEngine.newRun=(_seed,...args)=>original(2000000020,...args);});
   await page.evaluate(()=>{localStorage.setItem('duel-cube-math.v1','legacy sentinel');});
   const click=action=>page.locator('[data-action="'+action+'"]:visible').first().click();
   await click('new');assert.equal(await page.locator('.balance-options a').count(),3);await click('start-challenge');
   await click('select-artifact');await click('claim-artifact');
   const answer=await page.evaluate(()=>DCEducation.current(JSON.parse(localStorage.getItem(STMBalance.saveKey))).correctChoiceId);
   await page.locator('[data-action=education-select][data-id="'+answer+'"]').click();await click('education-check');await click('education-continue');
   const node=await page.evaluate(()=>DCEngine.availableNodes(JSON.parse(localStorage.getItem(STMBalance.saveKey)))[0].id);
   await page.locator('[data-action=node][data-id="'+node+'"]').click();
   await page.locator('.combat-layout').first().waitFor({state:'attached',timeout:60000});
   const state=await page.evaluate(()=>JSON.parse(localStorage.getItem(STMBalance.saveKey)));assert.equal(state.balanceState.difficulty,difficulty);assert.equal(state.scene,'battle');
   assert.equal(await page.evaluate(()=>DCEngine.validate(JSON.parse(localStorage.getItem(STMBalance.saveKey)))),true);
   await click('forecast');await page.reload();await enter();await click('continue');
   assert.equal(await page.evaluate(()=>DCEngine.validate(JSON.parse(localStorage.getItem(STMBalance.saveKey)))),true);
   assert.equal(await page.evaluate(()=>localStorage.getItem('duel-cube-math.v1')),'legacy sentinel');
   await page.evaluate(()=>Promise.all([...document.images].filter(i=>i.hasAttribute('src')).map(i=>i.decode().catch(()=>{}))));
   assert.deepEqual(await page.locator('img').evaluateAll(ims=>ims.filter(i=>i.hasAttribute('src')&&!i.naturalWidth).map(i=>i.src)),[]);
   if(process.env.QA_SCREENSHOTS){fs.mkdirSync(process.env.QA_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,'master-'+difficulty+'.png'),fullPage:true});}
   checks.push(difficulty+': real menu, gift question, route, battle, Predict, reload, valid save and original art');await context.close();
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,errors},null,2));
 }finally{await browser?.close();server?.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
