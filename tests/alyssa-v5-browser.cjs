/* Actual production game, real verified resources and source-driven V5 checks. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
const {chromium}=require(process.env.BROWSER_QA_MODULE||'playwright');
const F=require('../tools/dev/fixtures.js'),E=require('../dist/engine.js'),D=require('../dist/animation-data.js'),audit=require('../docs/animations/alyssa-v5/import-audit.json');
const root=path.resolve(__dirname,'..'),output=process.env.QA_REPORT||path.join(root,'docs/audits/alyssa-motion/browser-validation.json'),screens=process.env.QA_SCREENSHOTS;
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');let server,browser;
const report={version:require('../package.json').version,sourceSha256:audit.source_sha256,checks:[],clips:{},viewports:[],errors:[],legacyRequests:[]};
const hero=p=>p.locator('.player .actor-animation');
async function pixels(p){return hero(p).evaluate(c=>{const a=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let hash=2166136261,visible=0;for(let i=0;i<a.length;i+=4){hash=Math.imul(hash^a[i],16777619);hash=Math.imul(hash^a[i+3],16777619);if(a[i+3]>128)visible++;}return {hash:hash>>>0,visible};});}
async function ready(p,action='idle'){await p.waitForFunction(a=>{const c=document.querySelector('.player .actor-animation');return c?.parentElement.dataset.animationReady==='true'&&c.dataset.action===a;},action);}
async function enter(p){await p.waitForFunction(()=>['resource-enter','resource-online'].some(id=>{const el=document.getElementById(id);return el&&!el.hidden;}),null,{timeout:120000});const normal=await p.locator('#resource-enter').isVisible();await p.locator(normal?'#resource-enter':'#resource-online').click();}
async function shot(p,id){if(screens){fs.mkdirSync(screens,{recursive:true});await p.screenshot({path:path.join(screens,id+'.jpg'),type:'jpeg',quality:86});}}
function fixture(card,extra={}){return card?F.cardSetup(card,false,false,{seed:7,enemyHp:999,...extra}):F.create({kind:'combat',seed:7,enemyHp:999,...extra});}
async function restore(p,run,{clock=true,expectReady=true}={}){
 if(clock)await p.clock.resume();
 await p.evaluate(r=>{localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:true,sound:false,musicMuted:true,voiceMuted:true}));},run);
 await p.reload();await enter(p);await p.locator('[data-action=continue]:visible').first().click();
 if(expectReady){await ready(p);await p.waitForFunction(()=>!document.body.classList.contains('scene-preparing'));}
 if(clock){const now=await p.evaluate(()=>Date.now());await p.clock.setFixedTime(now);await p.clock.pauseAt(now);await p.clock.setSystemTime(now);}
}
const saved=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')));
async function expectedCard(p,key){return p.evaluate(key=>{const r=JSON.parse(localStorage.getItem('duel-cube-math.v1')),c=r.battle.hand.find(c=>c.key===key),expected=DCEngine.clone(r);DCEngine.playCard(expected,c.uid);return{expected,uid:c.uid};},key);}
async function play(p,key){const e=await expectedCard(p,key);await p.locator(`[data-action=play][data-id="${e.uid}"]`).evaluate(el=>el.click());return e.expected;}
async function collect(p,action){
 const seen=new Map();for(let n=0;n<450;n++){
  const a=await hero(p).getAttribute('data-action'),i=Number(await hero(p).getAttribute('data-frame'));
  if(a!==action){assert.equal(a,'idle');break;}
  if(!seen.has(i)){const value=await pixels(p);assert(value.visible>1000);seen.set(i,value.hash);}
  if(action==='idle'&&seen.size===15&&new Set(seen.values()).size>=8)break;
  if(action==='idle'&&seen.has(i))seen.set(i,(await pixels(p)).hash);
  await p.clock.runFor(10);
 }
 const order=[...seen.keys()],start=action==='idle'?order[0]:0;
 assert.deepEqual(order,Array.from({length:15},(_,i)=>(start+i)%15),action+' must render every approved exposure in source order');
 const count=new Set(seen.values()).size;assert(count>=(action==='idle'?8:15));return {frameSlots:seen.size,nonemptyDistinctRenderedSamples:count};
}
(async()=>{try{
 const opts={headless:true,args:['--no-sandbox','--disable-dev-shm-usage']};if(process.env.QA_CHROMIUM_EXECUTABLE)opts.executablePath=process.env.QA_CHROMIUM_EXECUTABLE;
 server=spawn(process.execPath,['server.cjs','--prod'],{cwd:root,env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
 const port=await new Promise((resolve,reject)=>{let out='';server.stdout.on('data',b=>{out+=b;const m=out.match(/Game: http:\/\/localhost:(\d+)/);if(m)resolve(m[1]);});server.once('error',reject);server.once('exit',c=>reject(Error('Production server exited '+c)));});
 browser=await chromium.launch(opts);const page=await browser.newPage({viewport:{width:1366,height:900},reducedMotion:'no-preference'});page.setDefaultTimeout(45000);
 page.on('pageerror',e=>report.errors.push(e.message));page.on('request',r=>{if(/\/ground-alyssa-/.test(r.url()))report.legacyRequests.push(r.url());});
 await page.goto('http://127.0.0.1:'+port+'/');await enter(page);await page.clock.install();
 for(const [key,action]of [[null,'idle'],['stm.attack.rune_strike','attack'],['stm.defend.rune_guard','defend'],['stm.skill.quick_study','skill']]){
  await restore(page,fixture(key));await page.evaluate(()=>{window.__v5Canvases=[...document.querySelectorAll('.actor-animation')];});
  const expected=key?await play(page,key):await saved(page);await ready(page,action);report.clips[action]=await collect(page,action);console.error('Verified '+action+' / 15 exposures');
  if(key)await ready(page);assert.deepEqual(await saved(page),expected,'animation must not change exact engine/save/RNG results');
  assert.equal(await page.evaluate(()=>__v5Canvases.every((c,i)=>c===document.querySelectorAll('.actor-animation')[i])),true);
  if(key){await restore(page,fixture(key));await play(page,key);await ready(page,action);await page.clock.runFor(200);}await shot(page,action);
 }
 await restore(page,fixture());const expectedHit=await page.evaluate(()=>{const r=DCEngine.clone(JSON.parse(localStorage.getItem('duel-cube-math.v1')));DCEngine.endTurn(r);return r;});
 await page.locator('[data-action=end-turn]').click();await ready(page,'damaged');report.clips.damaged=await collect(page,'damaged');assert.deepEqual(await saved(page),expectedHit);console.error('Verified damaged / 15 exposures');
 const blocked=fixture();blocked.battle.block=100;await restore(page,blocked);const expectedBlock=await page.evaluate(()=>{const r=DCEngine.clone(JSON.parse(localStorage.getItem('duel-cube-math.v1')));DCEngine.endTurn(r);return r;});await page.locator('[data-action=end-turn]').click();await ready(page,'defend');assert.deepEqual(await saved(page),expectedBlock);assert.equal(expectedBlock.hp,blocked.hp);
 report.checks.push('All 75 exposures rendered by actual production actor canvases; real current-package cards and damage/blocked hits match the independent engine outcome, RNG and save. Existing hero/enemy canvases survive rerenders.');
 await restore(page,fixture());await page.locator('[data-action=saves]:visible').click();const frozen=await pixels(page);await page.clock.runFor(1600);assert.deepEqual(await pixels(page),frozen);await page.locator('[data-action=close]:visible').click();
 await page.locator('[data-action=saves]:visible').click();await page.locator('#motion-toggle').uncheck();await page.locator('[data-action=close]:visible').click();await ready(page);const still=await pixels(page);await page.clock.runFor(2000);assert.deepEqual(await pixels(page),still);assert.equal(await hero(page).getAttribute('data-frame'),'0');
 await page.locator('[data-action=saves]:visible').click();await page.locator('#motion-toggle').check();await page.locator('[data-action=close]:visible').click();await page.emulateMedia({reducedMotion:'reduce'});await ready(page);const reduced=await pixels(page);await page.clock.runFor(1600);assert.deepEqual(await pixels(page),reduced);await page.emulateMedia({reducedMotion:'no-preference'});report.checks.push('Dialog pause, Motion Off and OS Reduced Motion retain the approved V5 Idle fallback without advancing.');
 for(const [enemy,stage]of [['wisp',0],['golem',1],['sentinel',0],['dealer',1]]){await restore(page,fixture(null,{enemy,stage}));assert.equal(await page.locator('.actor-animation').count(),2);assert.equal(await hero(page).getAttribute('data-actor'),'mc_01');}
 for(const [width,height]of [[1366,900],[1920,1080],[3440,1440],[3840,2160],[390,844],[320,740],[844,390]]){
  await page.setViewportSize({width,height});const g=await hero(page).evaluate(c=>{const b=c.getBoundingClientRect(),s=c.closest('.combatant').querySelector('.ground-shadow').getBoundingClientRect(),a=c.closest('.battle-theatre').getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height,arenaTop:a.top,arenaBottom:a.bottom,floor:b.y+b.height*1100/1200,shadow:(s.top+s.bottom)/2,overflow:document.documentElement.scrollWidth>innerWidth};});
  assert(Math.abs(g.floor-g.shadow)<3);assert(Math.abs(g.width/g.height-4/3)<.02);assert.equal(g.overflow,false);
  const mapped=audit.animations.flatMap(c=>c.frames.map(f=>{const b=f.canvas_bounds;return[g.x+b[0]*g.width/1600,g.y+b[1]*g.height/1200,g.x+b[2]*g.width/1600,g.y+b[3]*g.height/1200];}));
  assert(mapped.every(b=>b[0]>=-1&&b[2]<=width+1),'every complete approved effect must fit horizontally');
  assert(mapped.every(b=>b[1]>=g.arenaTop-1&&b[3]<=g.arenaBottom+1),JSON.stringify({width,height,g,highest:Math.min(...mapped.map(b=>b[1])),lowest:Math.max(...mapped.map(b=>b[3]))}));
  report.viewports.push({width,height,floorAligned:true,horizontalOverflow:false,all75BoundsFit:true,topClearance:Math.min(...mapped.map(b=>b[1]))-g.arenaTop});await shot(page,'grounding-'+width);
 }
 report.checks.push('Both stages, both bosses and phone/FHD/UWHD/4K floor registration; all 75 projected alpha bounds are checked against the native canvas and horizontal viewport.');
 for(const mode of ['no-canvas','failed-atlases']){
  const p=await browser.newPage({viewport:{width:1280,height:800},serviceWorkers:'block'});p.on('pageerror',e=>report.errors.push(e.message));console.error('Checking fallback '+mode);
  if(mode==='no-canvas')await p.addInitScript(()=>Object.defineProperty(window,'CanvasRenderingContext2D',{value:undefined,configurable:true}));
  else await p.route(/\/motion-alyssa-[^/?]+\.webp(?:\?|$)/,r=>r.abort());
  await p.goto('http://127.0.0.1:'+port+'/');await enter(p);await restore(p,fixture(),{clock:false,expectReady:false});
  await p.waitForFunction(()=>{const i=document.querySelector('.player .fighter-art');return i?.naturalWidth===1600&&i.dataset.stmImageState==='ready';});
  await p.locator('.player .fighter-art').waitFor({state:'visible',timeout:60000});
  assert.match(await p.locator('.player .fighter-art').getAttribute('data-stm-asset'),/alyssa-right-idle\.webp$/);assert.equal(await p.locator('.player .fighter-art').isVisible(),true);await p.close();
 }
 report.checks.push('Real verified V5 posters remain visible with Canvas unavailable and hero atlases deliberately failed.');
 const offline=await browser.newPage({viewport:{width:1280,height:800}}),requests=[];offline.on('pageerror',e=>report.errors.push(e.message));offline.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});await offline.route(/^https?:/,r=>r.abort());
 await offline.goto('file://'+path.join(root,'SLAY-THE-MATH-OFFLINE.html'),{timeout:120000});await offline.waitForFunction(()=>window.DCEngine,null,{timeout:60000});
 await offline.evaluate(r=>{localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:true,sound:false,musicMuted:true}));},fixture());await offline.reload({timeout:120000});await offline.locator('[data-action=continue]').click();await ready(offline);
 assert.equal(await offline.evaluate(()=>Object.keys(DC_ASSETS).filter(n=>/^motion-alyssa-/.test(n)).length),5);assert.equal(await offline.evaluate(()=>DCAnimationData.hero.animations.damaged.frames.length),15);assert.deepEqual(requests,[]);await offline.close();report.checks.push('Fresh portable game embeds all five V5 atlases/posters and animates offline without HTTP requests.');
 report.texture=await page.evaluate(()=>DCActorAnimation.cacheStats());report.runtimeHashes=Object.fromEntries(['animation-data.js','animation.js','combat-vfx.js','asset-manifest.json'].map(f=>[f,sha(fs.readFileSync(path.join(root,'release-prod',f)))]));
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.legacyRequests,[]);report.passed=true;fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
 }finally{await browser?.close();server?.kill();}})().catch(e=>{console.error(e);process.exitCode=1;});
