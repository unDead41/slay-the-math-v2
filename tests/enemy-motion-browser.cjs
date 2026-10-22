'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.BROWSER_QA_MODULE||'playwright');
const E=require('../dist/engine.js'),C=require('../dist/config.js'),D=require('../dist/animation-data.js');
const report={version:'2.10.0',status:'RUNNING',checks:[],actors:[],viewports:[],errors:[]};let browser,server;
const actors=Object.entries(D.actors),port=process.env.QA_ENEMY_PORT||'4200',url='http://127.0.0.1:'+port+'/';
const phases=new Set((process.env.QA_ENEMY_PHASES||'clips,intents,lifecycle,fit,fallback,offline').split(','));
function fixture(id,stage=D.actors[id]?.stage??0,turn=1){
 const r=E.newRun(7);delete r.route;r.stage=stage;E.startBattle(r,id,C.stages[stage].elites.includes(id));r.battle.hp=r.battle.maxHp=200;
 const pool=[...r.battle.hand,...r.battle.draw];r.battle.hand=['strike','guard','draw','ember'].map(key=>pool.splice(pool.findIndex(c=>c.key===key),1)[0]);r.battle.draw=pool;
 r.battle.turn=turn;r.battle.currentIntent=null;r.battle.currentIntent=E.intent(r);r.battle.enemyBlock=0;assert.ok(E.validate(r));return r;
}
(async()=>{
 try{
  server=require('node:child_process').spawn(process.execPath,[path.join(__dirname,'../server.cjs')],{env:{...process.env,PORT:port},stdio:['ignore','pipe','pipe']});
  await new Promise((ok,no)=>{server.stdout.once('data',ok);server.once('error',no);server.stderr.once('data',d=>no(Error(String(d))));});
  const opts={headless:true,args:['--no-sandbox','--disable-gpu']};if(process.env.QA_CHROMIUM_EXECUTABLE)opts.executablePath=process.env.QA_CHROMIUM_EXECUTABLE;
  browser=await chromium.launch(opts);const context=await browser.newContext({viewport:{width:1920,height:1080}}),page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));
  const start=new Date('2026-10-22T02:00:00Z');await page.clock.install({time:start});await page.clock.pauseAt(new Date(start.getTime()+60000));await page.goto(url);
  const click=action=>page.locator('[data-action="'+action+'"]').first().evaluate(el=>el.click());
  const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')));
  const canvas=()=>page.locator('.enemy .actor-animation');
  async function ready(action='idle'){try{await page.waitForFunction(action=>{const c=document.querySelector('.enemy .actor-animation');return c?.parentElement.dataset.animationReady==='true'&&c.dataset.action===action;},action,{polling:25});}catch(e){console.error('Ready diagnostic '+JSON.stringify(await page.evaluate(()=>{const c=document.querySelector('.enemy .actor-animation'),im=document.querySelector('.enemy .fighter-art');return {canvas:c?.outerHTML,host:c?.parentElement.dataset,image:im&&{src:im.src,loaded:im.complete,width:im.naturalWidth},reduced:matchMedia('(prefers-reduced-motion: reduce)').matches};})));throw e;}}
  async function hash(selector='.enemy .actor-animation'){return page.locator(selector).evaluate(async c=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',c.getContext('2d').getImageData(0,0,c.width,c.height).data))).join(','));}
  async function changed(first,selector){for(let i=0;i<4;i++){await page.clock.runFor(90);if(await hash(selector)!==first)return;}throw Error('No changing pixels: '+selector);}
  async function restore(r,motion=true){await page.evaluate(({r,motion})=>{localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion,sound:false,musicMuted:true}));},{r,motion});await page.reload();await click('continue');if(D.actors[r.battle.enemyId]?.stage===r.stage)await ready();}
  async function reducedMotion(value){
   // Chromium delivers MediaQueryList change asynchronously. Wait for the real
   // event before sampling pixels, so resetting to Idle 0 is not mistaken for motion.
   await page.evaluate(value=>{const q=matchMedia('(prefers-reduced-motion: reduce)');window.__qaMediaChange=q.matches===(value==='reduce')?Promise.resolve():new Promise(resolve=>q.addEventListener('change',()=>resolve(),{once:true}));},value);
   await page.emulateMedia({reducedMotion:value});await page.evaluate(()=>window.__qaMediaChange);await ready();
   if(value==='reduce')assert.equal(await canvas().getAttribute('data-frame'),'0');
  }
  async function shot(name){if(process.env.QA_SCREENSHOTS){fs.mkdirSync(process.env.QA_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,name+'.jpg'),type:'jpeg',quality:85,timeout:30000});}}
  if(phases.has('clips')){
  for(const [id,a]of actors){
   console.error('Checking actor '+id);
   await restore(fixture(id));const before=await state(),idle=await hash();await changed(idle);assert.deepEqual(await state(),before);
   const expected=E.clone(before),strike=expected.battle.hand.find(c=>c.key==='strike');E.playCard(expected,strike.uid);
   await page.locator('[data-action=play][data-id="'+strike.uid+'"]').evaluate(el=>el.click());await ready('damaged');assert.deepEqual(await state(),expected);await changed(await hash());await page.clock.fastForward(700);await ready();assert.deepEqual(await state(),expected);
   // Exercise every source clip without resolving additional gameplay.
   await page.evaluate(({id,stage})=>{const host=document.createElement('div');host.id='qa-enemy-host';host.style.cssText='position:fixed;left:-10000px;top:0';const c=document.createElement('canvas');c.id='qa-enemy-canvas';c.width=1600;c.height=1200;host.append(c);document.body.append(host);window.__enemyQA=DCActorAnimation.mount(c,stage,id);},{id,stage:a.stage});
   const clipChecks=[];
   for(const action of ['idle','attack','defend','skill','damaged']){
    await page.evaluate(action=>__enemyQA.play(action),action);await page.waitForFunction(action=>document.querySelector('#qa-enemy-canvas').dataset.action===action&&document.querySelector('#qa-enemy-host').dataset.animationReady==='true',action,{polling:25});
    await changed(await hash('#qa-enemy-canvas'),'#qa-enemy-canvas');
    assert.equal(await page.locator('#qa-enemy-canvas').getAttribute('data-texture'),a.animations[action].image);
    await page.clock.fastForward(1300);if(action!=='idle')assert.equal(await page.locator('#qa-enemy-canvas').getAttribute('data-action'),'idle');clipChecks.push(action);
   }
   await page.evaluate(()=>{__enemyQA.destroy();document.querySelector('#qa-enemy-host').remove();delete window.__enemyQA;});assert.deepEqual(await state(),expected);
   report.actors.push({id,stage:a.stage+1,actions:clipChecks,exactEngineState:true});await shot(id+'-idle');
  }
  report.checks.push('All 10 canonical Normal/Elite actors animate real canvas pixels for all 50 clips, play once/return to Idle, and resolve native player attacks once with exact saved engine state.');
  }
  if(phases.has('intents')){
  for(const [id,a]of actors.filter(([,a])=>a.stage===1))for(let turn=1;turn<=3;turn++){
   console.error('Checking intent '+id+'/'+turn);
   await restore(fixture(id,1,turn));const before=await state(),it=E.intent(before),expected=E.clone(before);E.endTurn(expected);const action=await page.evaluate(({id,it})=>DCActorAnimation.intentAction(1,id,it),{id,it});
   await click('end-turn');await ready(action);assert.deepEqual(await state(),expected);await changed(await hash());await page.clock.fastForward(1000);await ready();assert.deepEqual(await state(),expected);
  }
  report.checks.push('All five Stage 2 enemies use Attack, Defend and Skill for their resolved three-intent cycle; HP, Block, Energy, draws, RNG and logs exactly match the unmodified engine.');
  }
  if(phases.has('lifecycle')){
  console.error('Checking lifecycle');
  const blocked=fixture('golem');blocked.battle.enemyBlock=100;await restore(blocked);await page.locator('[data-action=play][data-id="'+blocked.battle.hand[0].uid+'"]').evaluate(el=>el.click());await ready('defend');assert.equal((await state()).battle.hp,blocked.battle.hp);
  await restore(fixture('golem'));await page.clock.runFor(200);await click('saves');const frozen=await hash();await page.clock.fastForward(1400);assert.equal(await hash(),frozen);await click('close');await changed(frozen);
  await restore(fixture('golem'),false);const still=await hash();await page.clock.fastForward(1000);assert.equal(await hash(),still);assert.equal(await canvas().getAttribute('data-frame'),'0');
  await restore(fixture('reaper'));await reducedMotion('reduce');const reduced=await hash();await page.clock.fastForward(1000);assert.equal(await hash(),reduced);await reducedMotion('no-preference');
  await page.reload();await click('continue');await ready();assert.equal(await canvas().getAttribute('data-actor'),'reaper');
  report.checks.push('A blocked player hit uses Defend; dialogs pause/resume, Motion Off and OS reduced motion are static, and refresh resumes the exact Stage 2 actor.');
  }
  if(phases.has('fit')){
  const audit=JSON.parse(fs.readFileSync(path.join(__dirname,'../docs/animations/stage2-v2/import-audit.json'),'utf8'));
  for(const [width,height]of [[1920,1080],[3440,1440],[3840,2160],[390,844],[320,740]]){
   console.error('Checking viewport '+width);await page.setViewportSize({width,height});
   for(const [id,a]of actors.filter(([,a])=>a.stage===1)){
    console.error('Checking fit '+id+'/'+width);await restore(fixture(id));const g=await canvas().evaluate(c=>{const b=c.getBoundingClientRect(),s=c.closest('.combatant').querySelector('.ground-shadow').getBoundingClientRect(),arena=c.closest('.battle-theatre').getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height,floor:b.y+b.height*1100/1200,shadow:(s.top+s.bottom)/2,arena:{x:arena.x,y:arena.y,right:arena.right,bottom:arena.bottom},overflow:document.documentElement.scrollWidth>innerWidth};});
    assert.equal(g.overflow,false);assert.ok(Math.abs(g.w/g.h-4/3)<.02);if(id!=='weaver')assert.ok(Math.abs(g.floor-g.shadow)<3,JSON.stringify({width,id,g}));
    const frames=audit.actors.find(a=>a.id===id).animations.flatMap(c=>c.frames.map(f=>({action:c.action,...f})));
    const clipped=frames.filter(f=>g.x+f.canvas[0]/1600*g.w<g.arena.x-1||g.x+f.canvas[2]/1600*g.w>g.arena.right+1||g.y+f.canvas[1]/1200*g.h<g.arena.y-1||g.y+f.canvas[3]/1200*g.h>g.arena.bottom+1).map(f=>({action:f.action,frame:f.frame}));
    report.viewports.push({width,height,id,floorError:g.floor-g.shadow,overflow:g.overflow,clipped});
    assert.deepEqual(clipped,[],JSON.stringify({width,id,g,clipped}));
   }
   await shot('stage2-fit-'+width);
  }
  report.checks.push('All 135 Stage 2 frame bounds stay inside the arena at desktop/UWHD/4K and two phone widths; grounded actors retain the common floor and Chain Weaver retains its authored hover.');
  }
  if(phases.has('fallback')){
  for(const mode of ['no-canvas','failed-atlases']){
   console.error('Checking fallback '+mode);const fc=await browser.newContext({viewport:{width:1280,height:800}});if(mode==='no-canvas')await fc.addInitScript(()=>{window.CanvasRenderingContext2D=undefined;});else await fc.route('**/motion-s2-*.webp',r=>r.abort());
   const p=await fc.newPage();p.on('pageerror',e=>report.errors.push(e.message));await p.clock.install({time:start});await p.clock.pauseAt(new Date(start.getTime()+60000));await p.goto(url);
   const native=action=>p.locator('[data-action="'+action+'"]').first().evaluate(el=>el.click());
   async function load(r,motion=true){await p.evaluate(({r,motion})=>{localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion,sound:false,musicMuted:true}));},{r,motion});await p.reload();await native('continue');}
   async function poster(id,action){const name=D.actors[id].posters[action];await p.waitForFunction(name=>{const im=document.querySelector('.enemy .fighter-art');return im?.complete&&im.naturalWidth===1600&&im.src.endsWith('/assets/'+name);},name,{polling:25});assert.equal(await p.locator('.enemy .fighter-art').isVisible(),true);}
   for(const [id,a]of actors.filter(([,a])=>a.stage===1)){
    await load(fixture(id));await poster(id,'idle');const uid=(await p.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')))).battle.hand[0].uid;await p.locator('[data-action=play][data-id="'+uid+'"]').evaluate(el=>el.click());await poster(id,'damaged');
    for(let turn=1;turn<=3;turn++){const r=fixture(id,1,turn),it=E.intent(r),action=a.intentActions[it.label];await load(r);await native('end-turn');await poster(id,action);}
   }
   await load(fixture('golem'),false);await native('end-turn');await poster('golem','idle');await fc.close();
  }
  report.checks.push('All 25 Stage 2 pose fallbacks use new left-facing source posters when Canvas or every atlas fails; Motion Off keeps Idle and never restores the old Chain Golem model.');
  }
  if(phases.has('offline')){
  for(const [id,stage]of [['sentinel',0],['dealer',1],['knight',1]]){await restore(fixture(id,stage));assert.equal(await canvas().count(),0);assert.equal(await page.locator('.enemy .fighter-art').isVisible(),true);}
  // Release the repeated live-page fixtures before parsing the large portable file.
  await context.close();
  const off=await browser.newContext(),p=await off.newPage(),requests=[];p.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});p.on('pageerror',e=>report.errors.push(e.message));
  await p.clock.install({time:start});await p.clock.pauseAt(new Date(start.getTime()+60000));await p.goto('file://'+path.join(__dirname,'../SLAY-THE-MATH-OFFLINE.html'),{waitUntil:'domcontentloaded',timeout:60000});await p.evaluate(r=>{localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:true,sound:false,musicMuted:true}));},fixture('golem'));await p.reload({waitUntil:'domcontentloaded',timeout:60000});await p.locator('[data-action=continue]').evaluate(el=>el.click());await p.waitForFunction(()=>document.querySelector('.enemy .fighter-anchor')?.dataset.animationReady==='true',null,{polling:25,timeout:60000});
  assert.equal(await p.evaluate(()=>Object.keys(DC_ASSETS).filter(k=>/^motion-s[12]-/.test(k)).length),50);assert.equal(await p.evaluate(()=>Object.keys(DC_ASSETS).filter(k=>/^poster-s2-/.test(k)).length),25);assert.deepEqual(requests,[]);await off.close();
  report.checks.push('Both bosses and legacy cross-stage encounters retain their renderer. The portable build embeds all 50 enemy clips and 25 new posters and runs Stage 2 offline without HTTP requests.');
  }
  assert.deepEqual(report.errors,[]);report.status='PASS';console.log(JSON.stringify(report,null,2));
 }finally{if(report.status!=='PASS')report.status='FAIL';if(process.env.QA_ENEMY_REPORT)fs.writeFileSync(process.env.QA_ENEMY_REPORT,JSON.stringify(report,null,2)+'\n');await browser?.close();server?.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
