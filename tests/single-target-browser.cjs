'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {chromium}=require(process.env.BROWSER_QA_MODULE||'playwright'),{loadMaster}=require('../tools/balance/master/loader.cjs'),D=require('../tools/balance/deep.cjs');
(async()=>{
 let server,browser;const errors=[],checks=[];
 try{
  server=require('node:child_process').spawn(process.execPath,[path.join(__dirname,'../server.cjs'),'--prod'],{env:{...process.env,PORT:'4192'},stdio:['ignore','pipe','pipe']});await new Promise((resolve,reject)=>{server.once('error',reject);server.stdout.once('data',resolve);});
  const opts={headless:true,args:['--no-sandbox','--disable-gpu']};if(process.env.QA_CHROMIUM_MODULE){const imported=require(process.env.QA_CHROMIUM_MODULE),c=imported.default||imported;opts.executablePath=await c.executablePath();opts.args=[...c.args.filter(a=>a!=='--single-process'),...opts.args];}
  browser=await chromium.launch(opts);
  for(const difficulty of [null,'medium']){
   const x=difficulty?loadMaster({difficulty}):{E:require('../dist/engine.js'),C:require('../dist/config.js')};
   const sweep='stm.attack.rune_sweep',storm='stm.attack.fate_storm',r=D.create(x,{seed:280031,enemy:'wisp',deck:[sweep,storm,...Array(10).fill('stm.defend.rune_guard')],initialFocus:1});
   r.battle.hp=r.battle.maxHp=10000;
   const all=[...r.battle.hand,...r.battle.draw],first=all.splice(all.findIndex(c=>c.key===sweep),1)[0],second=all.splice(all.findIndex(c=>c.key===storm),1)[0];r.battle.hand=[first];r.battle.draw=[...all,second];assert.ok(x.E.validate(r));
   const saveKey=difficulty?x.binding.saveKey:'duel-cube-math.v1',context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();
   page.on('pageerror',e=>errors.push(e.message));page.on('response',res=>{if(res.status()>=400)errors.push(res.status()+' '+res.url());});
   await context.addInitScript(({saveKey,r})=>{if(!localStorage.getItem(saveKey))localStorage.setItem(saveKey,JSON.stringify(r));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({sound:false,motion:false,musicMuted:true,voiceMuted:true}));},{saveKey,r});
   await page.goto('http://127.0.0.1:4192/'+(difficulty?'?balance='+difficulty:''));
   await page.locator('[data-action=continue]:visible').first().click();
   const state=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),saveKey);
   await page.locator('[data-action=focus]:visible').click();const before=await state();assert.equal(before.battle.boostArmed,true);
   const firstCard=page.locator('[data-action=play][data-id="'+first.uid+'"]');assert.doesNotMatch(await firstCard.innerText(),/other enem|random/i);
   if(process.env.QA_SCREENSHOTS){fs.mkdirSync(process.env.QA_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,'single-target-'+(difficulty||'ordinary')+'.png'),fullPage:true});}
   await firstCard.click();let after=await state();assert.equal(before.battle.hp-after.battle.hp,16);assert.equal(after.battle.energy,1);assert.equal(after.battle.focus,0);assert.equal(after.rng,before.rng);
   await page.locator('[data-action=end-turn]:visible').click();const beforeStorm=await state();assert.ok(beforeStorm.battle.hand.some(c=>c.uid===second.uid));
   await page.locator('[data-action=play][data-id="'+second.uid+'"]').click();after=await state();assert.equal(beforeStorm.battle.hp-after.battle.hp,15);assert.equal(after.rng,beforeStorm.rng);assert.deepEqual(after.battle.cardCombat.receipts.at(-1).randomTargets,[]);
   await page.reload();await page.locator('[data-action=continue]:visible').first().click();const restored=await state();assert.equal(restored.battle.hp,after.battle.hp);assert.equal(restored.rng,after.rng);
   assert.equal(await page.evaluate(key=>DCEngine.validate(JSON.parse(localStorage.getItem(key))),saveKey),true);
   checks.push((difficulty||'ordinary')+': production UI, focused Rune Sweep 16, Fate Storm 5+5+5, no target RNG, save/reload');await context.close();
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,errors},null,2));
 }finally{await browser?.close();server?.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
