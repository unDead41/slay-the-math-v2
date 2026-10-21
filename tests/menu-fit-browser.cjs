// Real-browser menu geometry, scene lifecycle and saved-run regression checks.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.BROWSER_QA_MODULE||'playwright');
const E=require('../dist/engine.js');
const out=process.env.QA_SCREENSHOTS||path.join(__dirname,'../qa-menu');
fs.mkdirSync(out,{recursive:true});
const report={version:'2.5.1',viewports:[],checks:[],errors:[]};
let server,browser;
const url='http://127.0.0.1:4194/';
const cases=[[1280,720],[1920,1080],[2560,1440],[2560,1080],[3440,1440],[3413,1740],[3840,2160],[5120,1440],[844,390],[390,844],[320,740]];
(async()=>{
 server=require('node:child_process').spawn(process.execPath,[path.join(__dirname,'../server.cjs')],{env:{...process.env,PORT:'4194'},stdio:['ignore','pipe','pipe']});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.stdout.once('data',resolve);server.stderr.once('data',d=>reject(new Error(String(d))));});
 const opts={headless:true,args:['--no-sandbox']};
 if(process.env.QA_CHROMIUM_MODULE){const chrome=require(process.env.QA_CHROMIUM_MODULE);opts.executablePath=await chrome.executablePath();opts.args=[...chrome.args,...opts.args];}
 if(process.env.QA_DISABLE_GPU)opts.args.push('--disable-gpu');
 browser=await chromium.launch(opts);
 const context=await browser.newContext({viewport:{width:1920,height:1080},reducedMotion:'reduce'});
 const page=await context.newPage();
 page.setDefaultTimeout(9000);
 page.on('pageerror',e=>report.errors.push(e.message));
 const click=a=>page.locator('[data-action="'+a+'"]:visible').first().click();
 const ready=()=>page.evaluate(()=>Promise.all([...document.images].map(im=>im.decode())));
 const active=()=>page.locator('.illustrated-home').getAttribute('data-art');
 const shot=name=>page.screenshot({path:path.join(out,name+'.jpg'),type:'jpeg',quality:70,fullPage:true,animations:'disabled'});
 const geometry=()=>page.evaluate(()=>{
  const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
  const im=document.querySelector('.menu-backdrop.active'),r=rect(im),s=getComputedStyle(im);
  const left=parseFloat(s.paddingLeft),right=parseFloat(s.paddingRight),top=parseFloat(s.paddingTop),bottom=parseFloat(s.paddingBottom);
  const width=r.width-left-right,height=r.height-top-bottom,scale=Math.min(width/im.naturalWidth,height/im.naturalHeight);
  return {width:innerWidth,height:innerHeight,docWidth:document.documentElement.scrollWidth,docHeight:document.documentElement.scrollHeight,
   fit:s.objectFit,natural:[im.naturalWidth,im.naturalHeight],
   art:{x:r.x+left+(width-im.naturalWidth*scale)/2,y:r.y+top+(height-im.naturalHeight*scale)/2,width:im.naturalWidth*scale,height:im.naturalHeight*scale},
   menu:rect(document.querySelector('.main-menu-actions')),title:rect(document.querySelector('.home-title h1')),
   footer:rect(document.querySelector('.dungeon-home-footer')),
   buttons:[...document.querySelectorAll('.main-menu-actions>button')].map(e=>({...rect(e),label:e.textContent})),
   picker:[...document.querySelectorAll('.scene-choice')].map(rect)};
 });
 try{
  await page.goto(url);await ready();
  assert.equal(await page.locator('.menu-continue').isDisabled(),true);
  assert.equal(await page.locator('.main-menu-actions>button').count(),5);
  assert.equal(await page.locator('.menu-backdrop').count(),5);
  assert.equal(await page.locator('.menu-ambience').count(),5);
  const sources=await page.locator('.menu-backdrop').evaluateAll(es=>es.map(e=>e.getAttribute('src')));
  const box=await page.locator('.main-menu-actions').boundingBox();
  for(const [i,id] of ['corridor','campfire','archive','map','door'].entries()){
   await page.locator('.scene-choice').nth(i).click();
   await page.waitForFunction(id=>document.querySelector('.illustrated-home').dataset.art===id,id);
   assert.deepEqual(await page.locator('.main-menu-actions').boundingBox(),box);
   assert.equal(await page.locator('.menu-backdrop.active').count(),1);
   assert.equal(await page.locator('.menu-ambience.active').count(),1);
   assert.equal(await page.locator('.scene-choice[aria-pressed=true]').count(),1);
   assert.deepEqual(await page.locator('.menu-backdrop').evaluateAll(es=>es.map(e=>e.getAttribute('src'))),sources);
  }
  report.checks.push('Five decoded scenes retain fixed sources, aligned ambience, stable controls and one selected native scene button.');
  let laptop,large;
  for(const [width,height] of cases){
   await page.setViewportSize({width,height});await page.evaluate(()=>scrollTo(0,0));
   const g=await geometry();
   assert.ok(g.docWidth<=width+1,'Menu root overflow at '+width);
   assert.equal(g.fit,'contain');assert.ok(g.natural[0]>0&&g.natural[1]>0);
   assert.ok(g.art.x>=-1&&g.art.x+g.art.width<=width+1,'Artwork cut horizontally');
   assert.ok(g.art.y>=-1&&g.art.y+g.art.height<=g.docHeight+1,'Artwork cut vertically');
   assert.ok(g.art.height<=(width<=600?height:height*.95)+1,'Artwork has no safety margin');
   assert.ok(g.title.x>=-1&&g.title.right<=width+1,'Title outside display');
   for(const b of [...g.buttons,...g.picker])assert.ok(b.x>=-1&&b.right<=width+1&&b.height>=44,'Unreachable/undersized control at '+width+': '+JSON.stringify(b));
   if(width>=1280&&height>=720){
    assert.ok(g.footer.bottom<=height+1,'Footer needs unnecessary desktop scrolling');
    assert.ok(g.buttons.every(b=>b.y>=0&&b.bottom<=height+1),'Desktop menu clipped');
   }
   await shot('menu-'+width+'x'+height);
   await click('saves');
   const dialog=await page.locator('#dialog').evaluate(e=>{
    const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom,scroll:e.scrollHeight,client:e.clientHeight,font:getComputedStyle(e).fontSize};
   });
   assert.ok(dialog.x>=-1&&dialog.right<=width+1&&dialog.y>=-1&&dialog.bottom<=height+1,'Settings dialog outside viewport');
   assert.ok(await page.locator('#motion-toggle').isVisible());
   await shot('settings-'+width+'x'+height);
   await page.keyboard.press('Escape');
   assert.equal(await page.evaluate(()=>document.activeElement.dataset.action),'saves');
   await click('new');
   assert.equal(await page.locator('#dialog').getAttribute('data-kind'),'mode');
   assert.ok(await page.locator('[data-action=start-learn]').isVisible());
   assert.ok(await page.locator('[data-action=start-challenge]').isVisible());
   const mode=await page.locator('#dialog').boundingBox();
   assert.ok(mode.x>=-1&&mode.x+mode.width<=width+1&&mode.y>=-1&&mode.y+mode.height<=height+1);
   await page.keyboard.press('Escape');
   if(width===1280)laptop={menu:g.menu.width,dialog:dialog.width};
   if(width===3840)large={menu:g.menu.width,dialog:dialog.width};
   report.viewports.push({width,height,art:g.art,menu:g.menu,dialog});
  }
  assert.ok(large.menu>laptop.menu*1.7&&large.dialog>laptop.dialog*1.7,'Large displays did not scale menu and Settings');
  report.checks.push('11 viewports: whole foreground image, responsive title/menu/dialogs, 44px targets, desktop footer, phone/short-screen scrolling and Escape focus.');

  await page.setViewportSize({width:1920,height:1080});
  await click('help');assert.equal(await page.locator('#dialog').evaluate(e=>e.open),true);await page.keyboard.press('Escape');
  await click('library');await page.locator('#card-search').fill('no-such-card');assert.equal(await page.locator('.no-results').count(),1);await click('close');
  report.checks.push('Tutorial and collection search/empty state still use the shared working dialogs.');

  await page.clock.install({time:new Date('2030-01-01T00:00:00Z')});
   await page.clock.pauseAt(new Date('2030-01-01T00:00:00Z'));
   await page.emulateMedia({reducedMotion:'no-preference'});
  await page.locator('.scene-choice').last().click();await page.waitForFunction(()=>document.querySelector('.illustrated-home').dataset.art==='door');
  await page.locator('.scene-choice').last().blur();await page.mouse.move(1900,100);
  assert.equal(await page.locator('.menu-backdrop.active').evaluate(e=>getComputedStyle(e).transitionDuration),'5s');
  await page.clock.runFor(4999);assert.equal(await active(),'door');
  await page.clock.runFor(1);await page.waitForFunction(()=>document.querySelector('.illustrated-home').dataset.art==='corridor');
  let art=await active();await page.locator('[data-action=new]').focus();await page.clock.runFor(5001);assert.equal(await active(),art);
  await page.locator('[data-action=new]').blur();await page.locator('[data-action=new]').hover();await page.clock.runFor(5001);assert.equal(await active(),art);
  await page.mouse.move(1900,100);await click('saves');art=await active();await page.clock.runFor(15001);assert.equal(await active(),art);await page.keyboard.press('Escape');
  await page.locator('.main-menu-actions [data-action=saves]').blur();await page.mouse.move(1900,100);
  await click('motion');art=await active();await page.clock.runFor(15001);assert.equal(await active(),art);
  await page.locator('.scene-choice').nth(2).click();await page.waitForFunction(()=>document.querySelector('.illustrated-home').dataset.art==='archive');
  assert.equal(await page.locator('.menu-backdrop.active').evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
  await click('motion');await page.emulateMedia({reducedMotion:'reduce'});art=await active();await page.clock.runFor(15001);assert.equal(await active(),art);
  report.checks.push('Exactly 5s autoplay with 5s fade; hover/focus/dialog pause; Motion Off and OS reduction stop autoplay while manual selection remains usable.');

  const failure=await context.newPage();
  await failure.route('**/assets/menu-door.webp',route=>route.abort());
  await failure.goto(url,{waitUntil:'domcontentloaded'});
  await failure.locator('.menu-backdrop.active').evaluate(e=>e.decode());
  await failure.locator('.scene-choice').last().click();
  await failure.waitForFunction(()=>document.querySelector('#toast').textContent.includes('Artwork could not be loaded'));
  assert.equal(await failure.locator('.illustrated-home').getAttribute('data-art'),'corridor');
  assert.equal(await failure.locator('.menu-backdrop.active').getAttribute('data-scene-index'),'0');
  assert.equal(await failure.locator('.main-menu-actions>button').count(),5);
  await failure.close();
  report.checks.push('Failed artwork decode retains the prior image and all usable menu controls.');

  let release;
  const gate=new Promise(resolve=>{release=resolve;});
  const slow=await context.newPage();
  await slow.route('**/assets/menu-archive.webp',async route=>{await gate;await route.continue();});
  await slow.goto(url,{waitUntil:'domcontentloaded'});
  await slow.locator('.menu-backdrop.active').evaluate(e=>e.decode());
  await slow.locator('.scene-choice').nth(2).click();await slow.locator('.scene-choice').last().click();
  await slow.waitForFunction(()=>document.querySelector('.illustrated-home').dataset.art==='door');
  release();await slow.locator('.menu-backdrop[data-scene-index="2"]').evaluate(e=>e.decode());
  await slow.waitForTimeout(100);
  assert.equal(await slow.locator('.illustrated-home').getAttribute('data-art'),'door');
  await slow.close();
  report.checks.push('A late decode cannot overwrite a newer manual scene selection.');
  let releaseCancel;
  const cancelGate=new Promise(resolve=>{releaseCancel=resolve;});
  const cancel=await context.newPage();
  await cancel.route('**/assets/menu-archive.webp',async route=>{await cancelGate;await route.continue();});
  await cancel.goto(url,{waitUntil:'domcontentloaded'});
  await cancel.locator('.menu-backdrop.active').evaluate(e=>e.decode());
  await cancel.locator('.scene-choice').nth(2).click();await cancel.locator('.scene-choice').first().click();
  releaseCancel();await cancel.locator('.menu-backdrop[data-scene-index="2"]').evaluate(e=>e.decode());await cancel.waitForTimeout(100);
  assert.equal(await cancel.locator('.illustrated-home').getAttribute('data-art'),'corridor');
  await cancel.close();
  report.checks.push('Choosing the current scene cancels any older pending decode.');


  const saved=await browser.newContext({viewport:{width:3440,height:1440},reducedMotion:'reduce'});
  await saved.addInitScript(r=>{localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true}));},E.newRun(7,'learn',2));
  const savedPage=await saved.newPage();await savedPage.goto(url);
  const snapshot=await savedPage.evaluate(()=>localStorage.getItem('duel-cube-math.v1'));
  assert.equal(await savedPage.locator('.menu-continue').isEnabled(),true);
  for(let i=0;i<5;i++){await savedPage.locator('.scene-choice').nth(i).click();await savedPage.waitForFunction(i=>Number(document.querySelector('.menu-backdrop.active').dataset.sceneIndex)===i,i);}
  assert.equal(await savedPage.evaluate(()=>localStorage.getItem('duel-cube-math.v1')),snapshot);
  await savedPage.locator('[data-action=continue]').click();assert.equal(await savedPage.locator('[data-stm-map]').count(),1);
  await saved.close();
  report.checks.push('Scene selection preserves the exact saved run; Continue still resumes its map.');

  await click('new');await click('start-challenge');
  await page.locator('[data-action=select-artifact]').first().click();await click('claim-artifact');
  assert.equal(await page.locator('[data-question-id]').count(),1);
  assert.equal(await page.locator('[data-action=education-select]').count(),4);
  report.checks.push('Responsive mode selection still starts Challenge, offers artifacts and opens the actual bank question.');
  assert.deepEqual(report.errors,[]);
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
  if(process.env.QA_PREVIEW_LOG)for(const name of ['menu-1280x720','menu-3440x1440','settings-3840x2160'])console.log('STM_MENU_PREVIEW:'+name+':'+fs.readFileSync(path.join(out,name+'.jpg')).toString('base64'));
 }finally{await context.close();}
})().then(async()=>{await browser?.close();server?.kill();}).catch(async error=>{console.error(error);process.exitCode=1;try{await browser?.close();}finally{server?.kill();}});
