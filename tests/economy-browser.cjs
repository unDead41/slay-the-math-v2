'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),{spawn}=require('node:child_process');
const {chromium}=require(process.env.BROWSER_QA_MODULE||'playwright');
const {room,event,winBattle}=require('./helpers/economy.cjs');
const root=path.resolve(__dirname,'..'),port=4196,url='http://127.0.0.1:'+port,report={checks:[],errors:[]};
const server=spawn(process.execPath,['server.cjs'],{cwd:root,env:{...process.env,PORT:String(port)},stdio:'ignore'});
const ping=()=>new Promise(resolve=>http.get(url,r=>{r.resume();resolve(true);}).on('error',()=>resolve(false)));
(async()=>{let browser;try{
 for(let i=0;i<100;i++){if(await ping())break;await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:process.env.QA_CHROMIUM_EXECUTABLE||'/tmp/chromium',headless:true,args:['--no-sandbox']});
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const context=await browser.newContext({viewport});const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  async function load(r){await page.goto(url);await page.evaluate(run=>{localStorage.setItem('duel-cube-math.v1',JSON.stringify(run));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true,voiceMuted:true}));},r);await page.reload();await page.locator('[data-action=continue]').click();await page.locator('#game').waitFor();report.release=await page.evaluate(()=>window.DCRelease);}
  const shop=room('shop','medium');shop.gold=1000;await load(shop);assert.equal(await page.locator('.shop-cards .shop-slot').count(),6);assert.equal(await page.locator('.sale-badge').count(),1);
  await page.locator('[data-action=shop-tab][data-id=artifacts]').click();const boss=page.locator('.shop-artifact-slot').nth(5);assert.match(await boss.innerText(),/Stage 2/);assert.equal(await boss.locator('[data-action=buy-artifact]').isDisabled(),true);report.checks.push({viewport,name:'six_cards_one_sale_boss_locked',passed:true});
  await page.locator('[data-action=shop-tab][data-id=cards]').click();const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')).gold);await page.locator('[data-action=buy-card]').first().click();const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')).gold);assert.ok(after<before);await page.reload();await page.locator('[data-action=continue]').click();assert.equal(await page.locator('[data-action=buy-card]').first().isDisabled(),true);report.checks.push({viewport,name:'paid_purchase_persists_once',passed:true});
  const camp=room('camp','easy');camp.hp=20;await load(camp);assert.match(await page.locator('#game').innerText(),/Heal 20 HP/);await page.locator('[data-action=rest]').click();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')).hp),40);report.checks.push({viewport,name:'actual_easy_recovery',passed:true});
  const reward=room('battle','easy');winBattle(reward);await load(reward);assert.match(await page.locator('#game').innerText(),/\+30 GOLD/);report.checks.push({viewport,name:'actual_reward_amount',passed:true});
  await load(event('ME02','easy'));assert.match(await page.locator('#game').innerText(),/60 SECONDS/);assert.match(await page.locator('#game').innerText(),/Pay 3 HP/);await page.locator('[data-action=mystery-start]').click();const deadline=await page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')).mysteryState.pending.deadline);await page.reload();await page.locator('[data-action=continue]').click();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')).mysteryState.pending.deadline),deadline);report.checks.push({viewport,name:'profile_preview_and_deadline_reload',passed:true});
  await context.close();
 }
 assert.deepEqual(report.errors,[]);report.status='PASS';
 }catch(e){report.status='FAIL';report.errors.push(e.stack);process.exitCode=1;}finally{if(browser)await browser.close();server.kill();fs.writeFileSync(path.join(root,'docs/economy/evidence/browser-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));}})();
