'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {chromium}=require(process.env.BROWSER_QA_MODULE||'playwright'),{loadMaster}=require('../tools/balance/master/loader.cjs');
const ordinary={E:require('../dist/engine.js'),data:require('../dist/card-data.js')};
function fixture(x,names,hp=null,damage=0){const {E}=x,r=E.newRun(124);delete r.route;r.seq=0;r.deck=[...names,...Array(8).fill('Rune Strike')].map(name=>E.card(r,x.data.cards.find(c=>c.name===name).id));E.startBattle(r,'sentinel');Object.assign(r.battle,{hp:100,maxHp:100,seals:2,enemyDefense:0,enemyBlock:0});r.battle.currentIntent.damage=damage;if(hp!==null)r.hp=hp;const all=[...r.battle.hand,...r.battle.draw];r.battle.hand=[];for(const name of names){const i=all.findIndex(c=>c.key===x.data.cards.find(c=>c.name===name).id);r.battle.hand.push(all.splice(i,1)[0]);}r.battle.draw=all;assert.ok(E.validate(r));return r;}
(async()=>{let server,browser;const errors=[],checks=[];
 try{
  server=require('node:child_process').spawn(process.execPath,[path.join(__dirname,'../server.cjs'),'--prod'],{env:{...process.env,PORT:'4193'},stdio:['ignore','pipe','pipe']});await new Promise((resolve,reject)=>{server.once('error',reject);server.stdout.once('data',resolve);});
  const opts={headless:true,args:['--no-sandbox','--disable-gpu']};if(process.env.QA_CHROMIUM_MODULE){const m=require(process.env.QA_CHROMIUM_MODULE),c=m.default||m;opts.executablePath=await c.executablePath();opts.args=[...c.args.filter(a=>a!=='--single-process'),...opts.args];}browser=await chromium.launch(opts);
  for(const kind of ['ordinary','master','last-ember','legacy']){
   const x=kind==='master'?loadMaster():ordinary,run=kind==='legacy'?require('./fixtures/card-effects-legacy.json').vulnerable:fixture(x,kind==='last-ember'?['Last Ember','Rune Strike']:['Weak Point','Rune Strike','Rune Strike'],kind==='last-ember'?19:null,kind==='last-ember'?1:0),saveKey=x.binding?.saveKey||'duel-cube-math.v1';
   const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
   await context.addInitScript(({run,saveKey})=>{if(!sessionStorage.getItem('effects-fixture')){sessionStorage.setItem('effects-fixture','1');localStorage.setItem(saveKey,JSON.stringify(run));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true,voiceMuted:true}));}},{run,saveKey});
   await page.goto('http://127.0.0.1:4193/'+(kind==='master'?'?balance=medium':''));await page.locator('[data-action=continue]').click();
   const read=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),saveKey),play=async uid=>{await page.locator('[data-action=play][data-id="'+uid+'"]').click();};
   if(kind==='last-ember'){await play(run.battle.hand[0].uid);await page.locator('[data-action=end-turn]').click();assert.equal((await read()).battle.block,6);}
   else if(kind==='legacy'){
    await page.locator('[data-action=library]').first().click();await page.locator('#card-search').fill('Deep Study');await page.waitForFunction(()=>document.querySelector('.collection-detail h3')?.textContent.includes('Deep Study'));assert.doesNotMatch(await page.locator('.collection-detail').innerText(),/Exhaust/);
    await page.locator('#card-search').fill('Weak Point');await page.waitForFunction(()=>document.querySelector('.collection-detail h3')?.textContent.includes('Weak Point'));const tips=await page.locator('.collection-detail [data-tooltip]').evaluateAll(nodes=>nodes.map(n=>n.dataset.tooltip).join(' '));assert.doesNotMatch(tips,/50%/);assert.match(tips,/2/);await page.locator('#dialog [data-action=close]').first().click();
    await page.locator('[data-action=help]').first().click();await page.locator('[data-tutorial-action=route][data-value=all]').click();await page.locator('[data-tutorial-action=chapter][data-value=statuses]').click();assert.doesNotMatch(await page.locator('.tutorial-content').innerText(),/50%|25%/);await page.locator('[data-tutorial-action=close]').click();
    const hp=run.battle.hp;await play(run.battle.hand[0].uid);assert.equal(hp-(await read()).battle.hp,8);
   }
   else{await play(run.battle.hand[0].uid);await page.locator('[data-action=status-details][data-who=enemy][data-id=vulnerable]').click();assert.match(await page.locator('#dialog').innerText(),/50%/);await page.locator('#dialog [data-action=close]').click();for(const c of run.battle.hand.slice(1))await play(c.uid);assert.equal(100-(await read()).battle.hp,22);assert.equal((await read()).battle.cardCombat.statuses.enemy.vulnerable,1);}
   const before=await read();await page.reload();await page.locator('[data-action=continue]').click();const after=await read();assert.equal(after.rng,before.rng);assert.equal(after.battle.hp,before.battle.hp);assert.equal(after.battle.block,before.battle.block);assert.ok(await page.evaluate(r=>DCEngine.validate(r),after));
   await page.evaluate(()=>Promise.all([...document.images].filter(i=>i.hasAttribute('src')).map(i=>i.decode().catch(()=>{}))));assert.deepEqual(await page.locator('img').evaluateAll(images=>images.filter(i=>i.hasAttribute('src')&&!i.naturalWidth).map(i=>i.src)),[]);
   if(process.env.QA_SCREENSHOTS){fs.mkdirSync(process.env.QA_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,kind+'.png'),fullPage:true});}
   checks.push(kind+': actual production UI, effects, reload, valid save, decoded original art');await context.close();
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,errors},null,2));
 }finally{await browser?.close();server?.kill();}
})().catch(error=>{console.error(error);process.exitCode=1;});
