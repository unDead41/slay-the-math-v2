'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const {chromium}=require(process.env.BROWSER_QA_MODULE||'playwright');
const E=require('../dist/engine.js'),I=require('../dist/icon-assets.js'),{claimArtifact}=require('./helpers/education.cjs');
const root=path.resolve(__dirname,'..'),output=process.env.QA_OUTPUT||path.join(require('node:os').tmpdir(),'stm-icons-browser'),report={checks:[],viewports:[],errors:[]};
fs.mkdirSync(output,{recursive:true});
let server,browser;
function fixture(){
 const r=E.newRun(42,'challenge');claimArtifact(r,r.artifactState.offer.ids[0]);delete r.route;E.startBattle(r,'sentinel');E.endTurn(r);r.battle.seals=1;r.battle.block=8;assert.ok(E.validate(r));return r;
}
(async()=>{
 server=spawn(process.execPath,[path.join(root,'server.cjs'),'--prod'],{env:{...process.env,PORT:'4197'},stdio:['ignore','pipe','pipe']});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.stdout.once('data',resolve);server.stderr.once('data',d=>reject(Error(d)));});
 const options={...(process.env.QA_CHROMIUM_EXECUTABLE?{executablePath:process.env.QA_CHROMIUM_EXECUTABLE}:{}),headless:true,args:['--no-sandbox','--disable-gpu']};
 if(process.env.QA_CHROMIUM_MODULE){let chrome=require(process.env.QA_CHROMIUM_MODULE);chrome=chrome.default||chrome;options.executablePath=await chrome.executablePath();options.args=[...chrome.args,'--no-sandbox','--disable-gpu'];}
 browser=await chromium.launch(options);
 const page=await browser.newPage({viewport:{width:1920,height:1080},reducedMotion:'reduce'});
 page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url());});
 await page.addInitScript(()=>{localStorage.setItem('duel-cube-settings.v1',JSON.stringify({sound:false,motion:false,musicMuted:true,voiceMuted:true}));});
 const click=a=>page.locator('[data-action="'+a+'"]:visible').first().click();
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')));
 const ready=()=>page.evaluate(()=>Promise.all([...document.images].filter(im=>im.getBoundingClientRect().width>0).map(im=>im.decode())));
 async function restore(r){await page.evaluate(r=>localStorage.setItem('duel-cube-math.v1',JSON.stringify(r)),r);await page.reload({waitUntil:'domcontentloaded'});await click('continue');await ready();}
 function art(file){return new RegExp('(?:^|/)assets/'+file.replaceAll('.','\\.')+'$');}
 await page.goto('http://localhost:4197/',{waitUntil:'domcontentloaded'});assert.equal(await page.evaluate(()=>DCRelease.version),require('../package.json').version);
 await click('music');const muted=page.locator('[data-action=music-mute] img');assert.match(await muted.getAttribute('src'),art(I.ui.muted));
 await click('music-mute');assert.match(await muted.getAttribute('src'),art(I.ui.volume));await click('music-mute');await click('close');
 await click('saves');assert.match(await page.locator('.save-status-heading img').getAttribute('src'),art(I.ui.save));assert.match(await page.locator('[data-action=import] img').getAttribute('src'),art(I.ui.importSave));await click('close');
 report.checks.push('Current production version loads; Sound mute/unmute and Save/Import retain the reviewed symbols with native actions.');
 await restore(E.newRun(17));
 const legend=await page.locator('.route-legend img').evaluateAll(images=>images.map(im=>im.getAttribute('src')));for(const file of Object.values(I.map))assert.ok(legend.some(src=>art(file).test(src)),file);
 await page.screenshot({path:path.join(output,'map-1920.png'),animations:'disabled'});report.checks.push('All six route-legend icons load from the reviewed map registry in the real production map.');
 const r=fixture();await restore(r);
 const selected=require('../dist/card-data.js').cards.find(c=>c.id===r.battle.hand[0].key),selectedFile=require('../dist/assets/card-assets.json').runtimePaths[selected.icon].replace(/^assets\//,'');
 assert.match(await page.locator('.package-card-art img').first().getAttribute('src'),art(selectedFile));assert.match(await page.locator('.artifacts-trigger img').getAttribute('src'),art(I.artifacts[r.artifactState.owned[0]]));
 assert.match(await page.locator('.seal.open img').getAttribute('src'),art(I.ui.bossSealOpen));assert.match(await page.locator('.seal:not(.open) img').getAttribute('src'),art(I.ui.bossSealClosed));assert.match(await page.locator('.enemy .intent img').getAttribute('src'),art(I.ui.intentAttackBlock));
 const before=await state();await page.locator('[data-action=status-details][data-who=player][data-id=block]').click();assert.match(await page.locator('#dialog').textContent(),/Block: 8/);assert.deepEqual(await state(),before);await page.keyboard.press('Escape');
 for(const viewport of [{width:1920,height:1080},{width:390,height:844}]){
  await page.setViewportSize(viewport);await ready();const fit=await page.evaluate(()=>({horizontal:document.documentElement.scrollWidth<=innerWidth+1,vertical:document.documentElement.scrollHeight<=innerHeight+1,target:[...document.querySelectorAll('.combat-status-badge')].every(el=>{const b=el.getBoundingClientRect();return b.width>=44&&b.height>=44;})}));assert.ok(fit.horizontal);assert.ok(fit.vertical);assert.ok(fit.target);report.viewports.push({...viewport,...fit});await page.screenshot({path:path.join(output,'combat-'+viewport.width+'.png'),animations:'disabled'});
 }
 await page.setViewportSize({width:1920,height:1080});await click('forecast');await ready();assert.ok(await page.locator('.forecast-bank .topic-label img').count());await page.keyboard.press('Escape');
 await click('library');await page.locator('[data-action=collection-tab][data-kind=artifacts]').click();await ready();const owned=r.artifactState.owned[0];assert.match(await page.locator('.art-codex-card:not(.art-locked) img').first().getAttribute('src'),art(I.artifacts[owned]));await page.screenshot({path:path.join(output,'artifact-codex.png'),animations:'disabled'});await page.keyboard.press('Escape');
 report.checks.push('Real boss seals, mixed intent, unchanged status inspection, card/Passive art and source Artifact Codex use the canonical registry; desktop/phone combat stays within the viewport with 44px status targets.');
 // Check the actual generated portable build in an isolated file:// page.
 const offline=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'}),external=[];
 offline.on('pageerror',e=>report.errors.push('offline: '+e.message));offline.on('request',r=>{if(/^https?:/.test(r.url())||r.url().startsWith('file:')&&!r.url().endsWith('/SLAY-THE-MATH-OFFLINE.html'))external.push(r.url());});
 await offline.addInitScript(r=>{localStorage.setItem('duel-cube-settings.v1',JSON.stringify({sound:false,motion:false,musicMuted:true,voiceMuted:true}));localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));},fixture());
 await offline.goto('file://'+path.join(root,'SLAY-THE-MATH-OFFLINE.html'),{waitUntil:'domcontentloaded',timeout:90000});await offline.locator('[data-action=continue]').click();
 await offline.evaluate(()=>Promise.all([...document.images].filter(im=>im.getBoundingClientRect().width>0).map(im=>im.decode())));
 for(const selector of ['.seal.open img','.seal:not(.open) img','.enemy .intent img','.combat-status-badge img','.package-card-art img','.artifacts-trigger img'])assert.match(await offline.locator(selector).first().getAttribute('src'),/^data:image\/webp;base64,/);
 for(const [selector,file]of [['.package-card-art img',selectedFile],['.artifacts-trigger img',I.artifacts[r.artifactState.owned[0]]]])assert.equal(await offline.locator(selector).first().getAttribute('src'),'data:image/webp;base64,'+fs.readFileSync(path.join(root,'dist/assets',file)).toString('base64'));
 await offline.locator('[data-action=library]').click();await offline.locator('[data-action=collection-tab][data-kind=artifacts]').click();await offline.locator('.art-codex-card:not(.art-locked) img').first().evaluate(im=>im.decode());assert.match(await offline.locator('.art-codex-card:not(.art-locked) img').first().getAttribute('src'),/^data:image\/webp;base64,/);
 assert.deepEqual(external,[]);report.checks.push('The generated portable file decodes the same boss/status/card/artifact icons including the source Codex, with zero network or dependent local asset requests.');
 assert.deepEqual(report.errors,[]);fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();server?.kill();});
