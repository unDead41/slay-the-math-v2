const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.QA_CHROMIUM_EXECUTABLE||'/tmp/chromium',headless:true,args:['--no-sandbox','--disable-gpu']});
 const report={checks:[],externalRequests:[],errors:[]};
 try{
  const page=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'});
  page.on('pageerror',e=>report.errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url())||r.url().startsWith('file:')&&!r.url().endsWith('/MAIN-SEKARANG.html'))report.externalRequests.push(r.url());});
  await page.addInitScript(()=>{localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true}));});
  await page.goto('file://'+path.join(__dirname,'../MAIN-SEKARANG.html'),{waitUntil:'domcontentloaded',timeout:60000});
  const click=a=>page.locator('[data-action="'+a+'"]:visible').first().click();
  await click('new');await click('start-challenge');await page.locator('[data-action=select-artifact]').first().click();await click('claim-artifact');
  const pending=await page.evaluate(()=>{const r=JSON.parse(localStorage.getItem('duel-cube-math.v1'));return {id:DCEducation.current(r).id,correct:DCEducation.current(r).correctChoiceId};});
  assert.equal(await page.locator('[data-question-id]').getAttribute('data-question-id'),pending.id);
  await click('education-hint');await click('education-basics');assert.equal(await page.locator('.foundation-check').count(),2);await click('close');
  await page.locator('[data-action=education-select][data-id="'+pending.correct+'"]').click({position:{x:20,y:20}});await click('education-check');await click('education-steps');assert.equal(await page.locator('#education-steps li').count(),3);await click('education-continue');
  await page.locator('.route-legend img').first().evaluate(im=>im.decode());assert.ok(await page.locator('.atlas-scroll').evaluate(el=>el.scrollHeight>el.clientHeight));
  assert.match(await page.locator('.dungeon-atlas').evaluate(el=>getComputedStyle(el).backgroundImage),/data:image\/webp;base64/);
  await page.locator('.dungeon-room.available').first().click();assert.equal(await page.locator('.artifact-live-hud .art-icon-button').count(),1);await click('library');await page.locator('[data-action=collection-tab][data-kind=artifacts]').click();assert.equal(await page.locator('.art-codex-card').count(),31);await page.locator('.art-codex-card:not(.art-locked) img').first().evaluate(im=>im.decode());
  await page.locator('.art-codex-card:not(.art-locked)').first().click();const help=page.locator('.art-codex-detail [data-richtext-kind]').first();if(await help.count()){await help.focus();assert.equal(await page.locator('[role=tooltip]').count(),1);await page.keyboard.press('Escape');}
  report.checks.push('The actual generated portable HTML opens a Challenge, rich trial/Hint/Basics/worked steps, explicit Claim, parchment map, legal combat and Artifact Codex with embedded art and the single tooltip hub.');
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.externalRequests,[]);
  report.checks.push('Zero HTTP or dependent local asset requests from file://.');
  const output=process.env.QA_REPORT||path.join(__dirname,'../../qa-map-integration/offline-report.json');fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
