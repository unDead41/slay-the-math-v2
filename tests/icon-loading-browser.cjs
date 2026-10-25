'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.BROWSER_QA_MODULE||'playwright');
const {pathToFileURL}=require('node:url');
const R=require('../dist/icon-assets.js'),E=require('../dist/engine.js'),statusFixture=require('./helpers/icon-status.cjs'),F=require('../tools/dev/fixtures.js');
const root=path.resolve(__dirname,'..'),dir=path.join(root,process.env.QA_PRODUCTION==='1'?'release-prod':'dist'),out=process.env.QA_OUTPUT||path.join(root,'docs/verification/icon-loading-20261025');
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.mp3':'audio/mpeg'};
const known=new Set([...Object.values(R.status),...Object.values(R.ui),...Object.values(R.map)].map(file=>file.replace(/^assets\//,'')));
const server=http.createServer((q,r)=>{const url=new URL(q.url,'http://localhost'),file=path.resolve(dir,'.'+url.pathname.replace(/^\/game/,'').replace(/\/$/,'/index.html'));if(!file.startsWith(dir+'/')){r.writeHead(403);return r.end();}fs.readFile(file,(error,bytes)=>{r.writeHead(error?404:200,{'content-type':types[path.extname(file)]||'application/octet-stream'});r.end(error?'missing':bytes);});});
const report={version:require('../package.json').version,checks:[],errors:[],gallery:[]};
async function open(browser,save,{language='en',large=false}={}){
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}),page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));
 await page.addInitScript(({save,language,large})=>{
  Object.defineProperty(window,'caches',{value:{open:async()=>{throw Error('Intentional quota denial');},keys:async()=>[]}});
  localStorage.setItem('duel-cube-math.v1',JSON.stringify(save));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true,voiceMuted:true,statusSize:large?'large':'normal'}));localStorage.setItem('slay-the-math.question-language.v1',language);
 },{save,language,large});return {context,page};
}
async function enter(page,base){await page.goto(base);await page.locator('#resource-enter').waitFor({state:'visible',timeout:30000});await page.locator('#resource-enter').click();}

(async()=>{let browser;try{
 fs.mkdirSync(out,{recursive:true});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port+'/game/';
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/tmp/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 // Hold two actual optional status requests. The later Weak image must become
 // usable without releasing either background slot or fetching it twice.
 {
  const save=F.create({kind:'combat',enemy:'wisp',seed:71});Object.assign(save.battle.cardCombat.statuses.self,{weak:2,weakUntil:save.battle.turn+1});assert.ok(E.validate(save));
  const {context,page}=await open(browser,save),held=[],requested=[];
  const first=Object.values(R.status).slice(0,2).map(file=>file.split('/').pop()),weak=R.status.weak.split('/').pop();assert.ok(!first.includes(weak));
  let release;const gate=new Promise(resolve=>release=resolve);
  await page.route('**/assets/**',async route=>{const name=new URL(route.request().url()).pathname.split('/').pop();requested.push(name);if(first.includes(name)){held.push(name);await gate;}await route.continue().catch(()=>{});});
  try{await enter(page,base);assert.equal(held.length,2);const before=await page.evaluate(()=>localStorage.getItem('duel-cube-math.v1'));await page.locator('[data-action=continue]').click();
   await page.waitForFunction(()=>document.querySelector('[data-status-icon=weak]')?.dataset.stmImageState==='ready',null,{timeout:15000});
   assert.equal(requested.filter(name=>name===weak).length,1);assert.equal(held.length,2);assert.equal(await page.locator('[data-status-owner=player] [data-id=weak]').isEnabled(),true);
   assert.equal(await page.evaluate(()=>localStorage.getItem('duel-cube-math.v1')),before);
   report.checks.push('Actual visible Weak overtakes two held background status requests; one verified transfer, named enabled button, identical saved game.');
  }finally{release();await context.close();}
 }
 // Every missing functional bitmap is optional. Real comparison and map UI
 // retain names/input and derive glyphs from their original resource identity.
 for(const kind of ['combat','map']){
  const save=kind==='combat'?statusFixture():F.create({kind:'map',seed:7}),{context,page}=await open(browser,save,{language:'ms',large:true});
  try{await page.route('**/assets/**',route=>known.has(new URL(route.request().url()).pathname.split('/').pop())?route.fulfill({status:404,contentType:'text/plain',body:'Intentional functional-icon failure'}):route.continue());
   await enter(page,base);assert.equal(await page.evaluate(()=>DCQuestionLanguage.language()),'ms');await page.locator('[data-action=continue]').click();await page.waitForFunction(()=>!document.body.classList.contains('scene-preparing'));
   const before=await page.evaluate(()=>localStorage.getItem('duel-cube-math.v1'));
   if(kind==='combat'){
    await page.locator('[data-action=saves]').first().click();await page.locator('#status-size-select').selectOption('normal');assert.equal(await page.locator('body').getAttribute('data-status-size'),'normal');
    await page.locator('#settings-question-language-select').selectOption('en');assert.equal(await page.evaluate(()=>DCQuestionLanguage.language()),'en');
    await page.locator('#status-size-select').selectOption('large');await page.locator('#settings-question-language-select').selectOption('ms');assert.equal(await page.evaluate(()=>DCQuestionLanguage.language()),'ms');assert.equal(await page.locator('body').getAttribute('data-status-size'),'large');await page.keyboard.press('Escape');
    await page.locator('[data-action=statuses][data-who=player]').click();await page.waitForFunction(()=>document.querySelectorAll('.status-overview-item img[data-icon-fallback=true]').length===10);
    assert.equal(await page.locator('.status-overview-item').count(),10);assert.equal(await page.locator('.status-overview-item:disabled').count(),0);
    await page.locator('#dialog').screenshot({path:path.join(out,'fallback-statuses-bm-phone.png')});
   }else{
    await page.waitForFunction(()=>document.querySelectorAll('.route-legend img[data-icon-fallback=true]').length===6);
    const observed=await page.locator('.route-legend img').evaluateAll(images=>images.map(im=>({source:im.dataset.stmAsset,src:im.src,width:im.naturalWidth})));
    for(const [key,file]of Object.entries(R.map)){const image=observed.find(im=>im.source==='assets/'+file);assert.ok(image,'Missing actual legend '+key);assert.ok(image.width>0);assert.equal(image.src,await page.evaluate(key=>DCIconReadiness.fallback(key),key));}
    assert.equal(new Set(observed.map(im=>im.src)).size,6);await page.locator('#game').screenshot({path:path.join(out,'fallback-map-bm-phone.png')});
   }
   await page.evaluate(async()=>{await Promise.all([...document.querySelectorAll('img[data-icon-fallback=true]')].map(im=>im.decode()));});
   assert.equal(await page.evaluate(()=>localStorage.getItem('duel-cube-math.v1')),before);
   report.checks.push('Real BM/Large '+kind+' survives functional-image 404s with decoded semantic fallbacks and identical saved game.'+(kind==='combat'?' Settings Normal/English then Large/BM switching is exercised under the same failures.':''));
  }finally{await context.close();}
 }
 // Exercise the generated standalone entry rather than inferring portability
 // from the hosted path. A failed embedded icon still has a local fallback.
 {
  const context=await browser.newContext(),page=await context.newPage(),requests=[];page.on('request',request=>{if(/^https?:/.test(request.url()))requests.push(request.url());});page.on('pageerror',error=>report.errors.push(error.message));
  try{await page.goto(pathToFileURL(path.join(root,'SLAY-THE-MATH-OFFLINE.html')).href);await page.locator('[data-action=new]').waitFor({state:'visible',timeout:60000});
   const result=await page.evaluate(async()=>{const image=document.querySelector('img[data-icon]');if(!image)throw Error('No functional offline icon');image.dispatchEvent(new Event('error'));await image.decode();return {key:image.dataset.icon,fallback:image.dataset.iconFallback,width:image.naturalWidth,embedded:!!DC_ASSETS};});
   assert.equal(result.embedded,true);assert.equal(result.fallback,'true');assert.ok(result.width>0);assert.deepEqual(requests,[]);report.checks.push('Actual standalone file boots with embedded resources; a forced failed utility icon decodes its local fallback with zero HTTP requests.');
  }finally{await context.close();}
 }
 // A diagnostic gallery of the actual SVG outputs, twenty meanings per sheet;
 // this is not a game screenshot or a human recognition study.
 {
  const page=await browser.newPage();await page.setViewportSize({width:1800,height:1500});await page.setContent('<body></body>');await page.addScriptTag({path:path.join(root,'dist/icon-readiness.js')});
  const keys=[...new Set([...Object.keys(R.status),...Object.keys(R.ui),...Object.keys(R.map)])];
  for(let start=0;start<keys.length;start+=20){const pageKeys=keys.slice(start,start+20);
   await page.evaluate(keys=>{document.body.innerHTML='<style>body{margin:0;padding:100px;background:#10202d;color:#fff4d4;font:20px system-ui;display:grid;grid-template-columns:repeat(5,240px);gap:100px}section{height:230px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px}section div{display:flex;align-items:center;gap:20px}img{object-fit:contain}</style>';for(const key of keys){const box=document.createElement('section'),name=document.createElement('strong');name.textContent=key;box.append(name);const row=document.createElement('div');for(const size of [28,44,64]){const image=document.createElement('img');image.src=DCIconReadiness.fallback(key);image.width=image.height=size;row.append(image);}box.append(row);document.body.append(box);}},pageKeys);
   await page.evaluate(()=>Promise.all([...document.images].map(im=>im.decode())));const file='fallback-gallery-'+(start/20+1)+'.png';await page.screenshot({path:path.join(out,file),fullPage:true});report.gallery.push({file,keys:pageKeys});
  }await page.close();report.checks.push('All registered fallback meanings decode natively at 28/44/64px; diagnostic sheets contain at most20 meanings and100px padding/gaps.');
 }
 assert.deepEqual(report.errors,[]);fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}})().catch(error=>{console.error(error);process.exitCode=1;});
