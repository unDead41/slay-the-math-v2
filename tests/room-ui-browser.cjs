'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const {chromium}=require(process.env.BROWSER_QA_MODULE||'playwright'),E=require('../dist/engine.js'),Q=require('../dist/education.js');
const {mysteryRoom}=require('./helpers/mystery.cjs'),{shopRoom}=require('./helpers/shop.cjs');
const out=process.env.QA_SCREENSHOTS||path.join(__dirname,'../../qa-room-ui-2-13-1');
const report={viewports:[],checks:[],errors:[]};
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const server=spawn(process.execPath,[path.join(__dirname,'../server.cjs')],{env:{...process.env,PORT:'4231'}});
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);});
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.QA_CHROMIUM_EXECUTABLE||'/tmp/chromium',headless:true,args:['--no-sandbox','--disable-gpu']});
  const page=await browser.newPage({viewport:{width:2048,height:1038},reducedMotion:'reduce'});
  page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url());});
  await page.goto('http://127.0.0.1:4231');
  const click=a=>page.locator('[data-action="'+a+'"]:visible').first().click();
  const tab=id=>page.locator('#shop-tab-'+id).click();
  const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')));
  async function restore(r){
   assert.ok(E.validate(r));await page.evaluate(r=>{localStorage.clear();localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true}));},r);
   await page.reload();await click('continue');
  }
  async function shot(name){await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});}
  for(const [width,height] of [[2048,1038],[1920,1080],[1280,720],[3440,1440],[3840,2160],[390,844],[320,740]]){
   await page.setViewportSize({width,height});await restore(mysteryRoom('ME02'));
   await page.locator('.mystery-art img').evaluate(i=>i.decode());
   const mystery=await page.evaluate(()=>{
    const scene=document.querySelector('.mystery-layout').getBoundingClientRect(),art=document.querySelector('.mystery-art img'),a=art.getBoundingClientRect(),p=document.querySelector('.mystery-panel').getBoundingClientRect();
    return {overflow:document.documentElement.scrollWidth>innerWidth,sceneWidth:scene.width,artWidth:a.width,artHeight:a.height,fit:getComputedStyle(art).objectFit,panelX:p.x,panelRight:p.right,panelTop:p.top-scene.top};
   });
   assert.equal(mystery.overflow,false);assert.equal(mystery.fit,'cover');assert.ok(mystery.artWidth>=width-1);
   assert.ok(mystery.panelX>=0&&mystery.panelRight<=width+1);
   if(width>1000){assert.ok(mystery.artHeight>=height-100);assert.ok(mystery.panelX>=width*.4);}
   else{assert.ok(mystery.artHeight>=300);assert.ok(mystery.panelTop>=240);}
   await shot('mystery-'+width);
   const before=await state();await page.locator('.mystery-stakes [data-category=calculation]').first().focus();
   assert.match(await page.locator('[role=tooltip]').textContent(),/40 − 5 = 35/);await page.keyboard.press('Escape');assert.deepEqual(await state(),before);
   await click('mystery-start');let r=await state(),q=Q.catalog[r.mysteryState.pending.questionId],deadline=r.mysteryState.pending.deadline;
   assert.ok(await page.locator('.mystery-question [data-category=math]').count());assert.equal(await page.locator('button button').count(),0);
   const term=page.locator('.mystery-question [data-richtext-kind=term]').first();await term.focus();assert.equal(await page.locator('[role=tooltip]').count(),1);await page.keyboard.press('Escape');
   assert.equal((await state()).mysteryState.pending.deadline,deadline);
   if(width===2048||width===390)await shot('mystery-question-'+width);
   await page.locator('[data-action=mystery-answer][data-id="'+q.correctChoiceId+'"]').click();await click('mystery-continue');
   assert.ok(await page.locator('.mystery-panel [data-category=calculation]').count());assert.equal((await state()).hp,before.hp);
   await restore(shopRoom());
   const initial=await state(),shop={};
   for(const id of ['cards','artifacts','remove']){
    await tab(id);assert.equal(await page.locator('[role=tabpanel]:visible').count(),1);
    assert.equal(await page.locator('#shop-tab-'+id).getAttribute('aria-selected'),'true');
    if(id==='remove'){assert.equal(await page.locator('.shop-detail').isVisible(),false);assert.equal(await page.locator('[data-action=buy-card]:visible,[data-action=buy-artifact]:visible').count(),0);}
    else{
     const selector=id==='cards'?'.shop-cards .playing-card':'.shop-artifact-select';
     if(id==='artifacts')await page.locator('.shop-artifact-select img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));
     const g=await page.locator(selector).evaluateAll(elements=>{const rects=elements.map(e=>e.getBoundingClientRect());return {count:rects.length,rows:new Set(rects.map(r=>Math.round(r.top))).size,columns:new Set(rects.map(r=>Math.round(r.left))).size};});
     assert.deepEqual(g,{count:6,rows:2,columns:3});shop[id]=g;
    }
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    assert.deepEqual(await state(),initial);if(width===2048||width===390)await shot('shop-'+id+'-'+width);
   }
   await page.keyboard.press('Home');assert.equal(await page.locator('#shop-tab-cards').getAttribute('aria-selected'),'true');
   await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#shop-tab-artifacts').getAttribute('aria-selected'),'true');
   await page.keyboard.press('End');assert.equal(await page.locator('#shop-tab-remove').getAttribute('aria-selected'),'true');
   assert.deepEqual(await state(),initial);report.viewports.push({width,height,mystery,shop});
  }
  await page.setViewportSize({width:1280,height:800});await restore(shopRoom('challenge'));
  let r=await state();const sale=r.shop.offers.findIndex(o=>o.sale),cost=E.shopPrice(r,r.shop.offers[sale]),size=r.deck.length,gold=r.gold;
  await page.locator('[data-action=buy-card][data-index="'+sale+'"]').click();r=await state();assert.equal(r.gold,gold-cost);assert.equal(r.deck.length,size+1);
  await tab('artifacts');const beforeArtifact=await state(),artifactCost=E.shopPrice(beforeArtifact,beforeArtifact.shop.artifacts[0]);
  await page.locator('[data-action=buy-artifact][data-index="0"]').click();r=await state();assert.equal(r.gold,beforeArtifact.gold-artifactCost);assert.equal(r.scene,'shop');
  await page.reload();await click('continue');await tab('artifacts');assert.ok(await page.locator('[data-action=buy-artifact][data-index="0"]').isDisabled());
  await tab('remove');const beforeRemoval=await state();await click('shop-remove');await page.locator('[data-action=choose-shop-remove]').first().click();await page.keyboard.press('Escape');assert.deepEqual(await state(),beforeRemoval);
  await click('shop-remove');await page.locator('[data-action=choose-shop-remove]').first().click();await click('confirm-shop-remove');assert.equal((await state()).deck.length,beforeRemoval.deck.length-1);
  await page.reload();await click('continue');await tab('remove');assert.ok(await page.locator('[data-action=shop-remove]').isDisabled());
  await click('leave-shop');assert.equal((await state()).scene,'map');assert.ok(E.restore(await state()));
  report.checks.push('Full-width Mystery artwork at all seven sizes; current HP-cost preview, green game terms and pink question terms use one shared tooltip hub without spending, starting early, changing the answer or renewing the deadline.');
  report.checks.push('Shop exposes exactly one tab panel; both 3×2 racks, removal service, native arrow/Home/End navigation, unchanged tab-only saves, paid Card/Artifact purchases, Sold refresh and removal cancel/confirm/refresh all pass.');
  assert.deepEqual(report.errors,[]);report.status='PASS';
  fs.writeFileSync(path.join(__dirname,'../docs/verification/room-ui-2-13-1-browser.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
 }finally{await browser?.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
