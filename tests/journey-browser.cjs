const {completeBrowserTrial}=require('./helpers/education.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.BROWSER_QA_MODULE||'playwright');
const E=require('../dist/engine.js'),C=require('../dist/config.js');
const report={checks:[],viewports:[],errors:[]};let server;
(async()=>{
 const options={headless:true,args:['--no-sandbox']};
 if(process.env.QA_CHROMIUM_MODULE){const chrome=require(process.env.QA_CHROMIUM_MODULE);options.executablePath=await chrome.executablePath();options.args=[...chrome.args,'--no-sandbox'];}
 if(process.env.QA_DISABLE_GPU)options.args.push('--disable-gpu');
 server=require('node:child_process').spawn(process.execPath,[path.join(__dirname,'../server.cjs')],{env:{...process.env,PORT:'4188'},stdio:['ignore','pipe','pipe']});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.stdout.once('data',resolve);server.stderr.once('data',d=>reject(new Error(String(d))));});
 const browser=await chromium.launch(options),page=await browser.newPage({viewport:{width:1920,height:1080},reducedMotion:'reduce'});
 page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url());});
 const click=a=>page.locator('[data-action='+a+']:visible').first().click();
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')));
 const decode=()=>page.evaluate(()=>Promise.all([...document.images].filter(im=>im.hasAttribute('src')).map(im=>im.decode())));
 const shot=async name=>{if(process.env.QA_SCREENSHOTS){fs.mkdirSync(process.env.QA_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,name+'.png'),fullPage:true,animations:'disabled'});}};
 async function restore(run){await page.evaluate(r=>{localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true}));},run);await page.reload();await click('continue');await decode();}
 async function concealed(){const html=await page.locator('[data-stm-map]').evaluate(el=>el.outerHTML);for(const enemy of Object.values(C.enemies))assert.ok(!html.includes(enemy.name),'Encounter identity leaked: '+enemy.name);assert.equal(await page.locator('.room-preview,.route-options').count(),0);}
 try{
  await page.goto('http://127.0.0.1:4188/');
  for(const [width,height]of [[1920,1080],[1280,720],[844,390],[390,844],[320,740],[3840,2160]]){
   await page.setViewportSize({width,height});await restore(E.newRun(1));await concealed();
   const geometry=await page.evaluate(()=>{
    const rail=document.querySelector('.map-rail').getBoundingClientRect(),scroll=document.querySelector('.atlas-scroll'),chart=scroll.getBoundingClientRect(),atlas=document.querySelector('.dungeon-atlas');
    const rooms=[...document.querySelectorAll('.dungeon-room')],first=rooms.find(n=>n.dataset.id.includes('l01-')),second=rooms.find(n=>n.dataset.id.includes('l02-'));
    const selected=document.querySelector('.dungeon-room.available').getBoundingClientRect();
    return {rootOverflow:document.documentElement.scrollWidth>innerWidth,legendLeft:rail.right<chart.left,rowGap:Math.abs(first.getBoundingClientRect().y-second.getBoundingClientRect().y),scrollTop:scroll.scrollTop,scrollLeft:scroll.scrollLeft,scrollHeight:scroll.scrollHeight,viewportHeight:scroll.clientHeight,atlasWidth:atlas.clientWidth,chartWidth:scroll.clientWidth,chartBottom:chart.bottom,railBottom:rail.bottom,selectedVisible:selected.bottom>chart.top&&selected.top<chart.bottom,legendImages:[...document.querySelectorAll('.route-legend img')].every(im=>im.naturalWidth>0)};
   });
   assert.equal(geometry.rootOverflow,false,JSON.stringify({width,geometry}));assert.equal(geometry.legendLeft,true);assert.ok(geometry.rowGap>=240);assert.ok(geometry.scrollHeight>geometry.viewportHeight+600);assert.ok(geometry.scrollTop>0);assert.equal(geometry.selectedVisible,true);assert.equal(geometry.legendImages,true);
   if(width>=1280){assert.ok(geometry.chartBottom<=height-10,'Desktop map frame must fit the window');assert.ok(geometry.railBottom<=height-10,'Desktop entry control must fit the window');}
   assert.equal(await page.locator('.map-selection,.enter-room,.map-locate,[data-action=select-node]').count(),0);
   const before=await state();await page.locator('.atlas-scroll').evaluate(el=>el.scrollTo({top:0,left:0}));
   assert.equal(await page.locator('.atlas-scroll').evaluate(el=>el.scrollTop),0);
   await page.locator('.dungeon-room.available').first().focus();assert.ok(await page.locator('.atlas-scroll').evaluate(el=>el.scrollTop)>0);
   assert.deepEqual(await state(),before,'Keyboard focus must not enter a room');
   await shot('map-'+width);report.viewports.push({width,height,...geometry});
   const chosen=E.availableNodes(E.newRun(1)).at(-1),node=page.locator('.dungeon-room[data-id="'+chosen.id+'"]');
   if(width===1280||width===320)await node.press('Enter');else await node.click();
   assert.equal((await state()).route.active,chosen.id);assert.equal((await state()).scene,'battle');
   assert.equal(await page.locator('[data-stm-map]').count(),0);assert.equal(await page.evaluate(()=>document.activeElement.id),'game');
  }
  report.checks.push('Six viewport sizes: legend stays left, no page overflow, generous level spacing, genuine map scrolling and decoded category seals');
  report.checks.push('No enemy portraits, names or stats leak through map text, tooltips, accessible labels or alternative path controls; actual entry still uses the chosen engine room');
  report.checks.push('Selected Path, Enter Room confirmation and Current level panel are absent; one click or Enter opens the exact chosen room and focuses the new scene');
  const saved=E.newRun(9);E.enterNode(saved);E.finishNode(saved);await page.setViewportSize({width:1280,height:720});await restore(saved);assert.equal(await page.locator('.dungeon-room.visited').count(),1);assert.deepEqual((await state()).route,saved.route);
  assert.deepEqual(await page.locator('.dungeon-room.available').evaluateAll(xs=>xs.map(x=>x.dataset.id).sort()),E.availableNodes(saved).map(n=>n.id).sort());
  await restore(E.newRun(7,'learn',2));assert.equal(await page.locator('.atlas-coordinate').count(),5);await concealed();assert.equal((await state()).route.version,2);
  report.checks.push('Current path and disconnected locks survive Continue, and saved five-level routes retain their topology');
  for(const type of ['battle','elite','camp','shop','event','boss']){
   let fixture,chosen;
   for(let seed=1;seed<60&&!fixture;seed++){
    const r=E.newRun(seed);
    while(r.depth<10){const available=E.availableNodes(r),target=available.find(n=>n.type===type);if(target){fixture=E.clone(r);chosen=target;break;}if(r.depth===9)break;E.enterNode(r,available[0].id);E.finishNode(r);}
   }
   assert.ok(fixture,'Reachable fixture for '+type);assert.ok(E.validate(fixture));await restore(fixture);
   await page.locator('.dungeon-room[data-id="'+chosen.id+'"]').click();const after=await state();
   assert.equal(after.route.active,chosen.id);assert.equal(after.scene,['camp','shop','event'].includes(type)?type:'battle');
   if(type==='elite')assert.equal(after.battle.elite,true);
   if(type==='boss')assert.equal(after.battle.enemyId,C.stages[0].boss);
  }
  report.checks.push('All six room categories open directly through legal map icons: Battle, Elite, Rest, Shop, Mystery and Boss');
  await restore(E.newRun(7,'challenge'));const pixels=await page.locator('.artifact-scene-art img').evaluate(im=>({width:im.naturalWidth,height:im.naturalHeight}));assert.deepEqual(pixels,{width:3840,height:2160});assert.equal(await page.locator('.artifact-card').count(),3);await shot('master-1280');report.masterPixels=pixels;
  report.checks.push('Dungeon Master scene decodes the 3840×2160 non-human entity export with the same live artifact choices');
  // Test the actual unchanged portable deliverable from file://, not a rewritten DOM fixture.
  const offline=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),requests=[];
  offline.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});offline.on('pageerror',e=>report.errors.push(e.message));
  await offline.goto('file://'+path.join(__dirname,'../MAIN-SEKARANG.html'));await offline.locator('[data-action=new]').click();await offline.locator('[data-action=start-challenge]').click();await offline.locator('.artifact-scene-art img').evaluate(im=>im.decode());assert.equal(await offline.locator('.artifact-scene-art img').evaluate(im=>im.naturalWidth),3840);
  await offline.locator('[data-action=select-artifact]').first().click();await offline.locator('[data-action=claim-artifact]').click();await completeBrowserTrial(offline);assert.equal(await offline.locator('.map-rail').count(),1);assert.ok(await offline.locator('.atlas-scroll').evaluate(el=>el.scrollHeight>el.clientHeight));
  assert.equal(await offline.locator('.map-selection,.enter-room').count(),0);await offline.locator('.dungeon-room.available').first().click();assert.equal(await offline.locator('[data-stm-map]').count(),0);assert.notEqual(await offline.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')).scene),'map');
  assert.deepEqual(requests,[]);await offline.close();
  report.checks.push('Unmodified offline HTML: 4K artwork, artifact claim and direct map entry work with zero HTTP requests');
  assert.deepEqual(report.errors,[]);console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();server?.kill();}
})().catch(e=>{server?.kill();console.error(e);process.exitCode=1;});
