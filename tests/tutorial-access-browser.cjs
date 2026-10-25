/* Actual production input, local records, readable practice and intentional media failure. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const {chromium}=require(process.env.BROWSER_QA_MODULE||'playwright'),root=path.resolve(__dirname,'..'),out=process.env.QA_SCREENSHOTS||'/tmp/tutorial-refresh-access';
(async()=>{let server,browser;const report={checks:[],errors:[]};fs.mkdirSync(out,{recursive:true});
 try{
  server=spawn(process.execPath,['server.cjs','--prod'],{cwd:root,env:{...process.env,PORT:'4198'},stdio:['ignore','pipe','pipe']});await new Promise((res,rej)=>{server.once('error',rej);server.stdout.once('data',res);});
  const opts={headless:true,executablePath:process.env.QA_CHROMIUM_EXECUTABLE||'/tmp/chromium',args:['--no-sandbox','--disable-gpu']};browser=await chromium.launch(opts);
  async function open(viewport,lang='ms',broken=false){const context=await browser.newContext({viewport,reducedMotion:'reduce',serviceWorkers:'block'}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
   await context.addInitScript(lang=>{localStorage.setItem('slay-the-math.question-language.v1',lang);localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true,voiceMuted:true}));localStorage.setItem('slay-the-math.tutorial.v1',JSON.stringify({version:1,chapter:'cards',language:lang,completed:['welcome','cards']}));},lang);
   if(broken)await context.route('**/tutorial-shot-card-en.webp*',route=>route.fulfill({status:404,body:'Intentional tutorial media failure'}));
   await page.goto('http://127.0.0.1:4198/');await page.locator('#resource-enter').waitFor({state:'visible',timeout:120000});await page.locator('#resource-enter').click();await page.locator('.main-menu-actions [data-action=help]').waitFor();return {page,context};}
  for(const [id,viewport]of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]){
   const {page,context}=await open(viewport),snapshot=()=>page.evaluate(()=>Object.fromEntries(Object.keys(localStorage).filter(k=>k!=='slay-the-math.tutorial.v1').sort().map(k=>[k,localStorage.getItem(k)]))),before=await snapshot();
   await page.locator('.main-menu-actions [data-action=help]').click();assert.equal(await page.locator('[data-tutorial-action=chapter]').count(),23);await page.locator('[data-tutorial-action=route][data-value=basics]').click();await page.locator('[data-tutorial-action=chapter][data-value=first-turn]').click();
   await page.locator('[data-tutorial-action=practice]').click();assert.equal(await page.locator('.tutorial-practice-panel').evaluate(p=>document.activeElement===p),true);await page.locator('[data-tutorial-action=play]').click();
   assert.match(await page.locator('.tutorial-outcome').innerText(),/Block: 0 → 6/);await page.waitForFunction(()=>[...document.querySelectorAll('.tutorial-card-example img')].every(im=>im.naturalWidth>0&&(!im.dataset.stmAsset||im.dataset.stmImageState==='ready')));
   const file='first-turn-'+id+'-ms.png';await page.screenshot({path:path.join(out,file)});assert.deepEqual(await snapshot(),before);const p=await page.evaluate(()=>JSON.parse(localStorage.getItem('slay-the-math.tutorial.v1')));assert.ok(p.completed.includes('welcome')&&p.completed.includes('cards'));
   await page.locator('[data-tutorial-action=close]').click();assert.equal(await page.evaluate(()=>document.activeElement.dataset.action),'help');report.checks.push(id+': old progress kept, BM route/practice shortcut, real Block feedback, unchanged host records, close/focus');await context.close();
  }
  const {page,context}=await open({width:390,height:844},'en',true);await page.locator('.main-menu-actions [data-action=help]').click();await page.locator('.tutorial-figure.image-unavailable').waitFor();assert.equal(await page.locator('.tutorial-image-fallback').isVisible(),true);await page.locator('[data-tutorial-action=practice]').click();await page.locator('[data-tutorial-action=play]').click();assert.equal(await page.locator('[data-tutorial-complete]').count(),1);report.checks.push('intentional real media404: visible caption/fallback, complete actual card practice still works');await context.close();
  assert.deepEqual(report.errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
 }finally{await browser?.close();server?.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
