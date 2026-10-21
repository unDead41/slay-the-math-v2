'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(process.env.BROWSER_QA_MODULE||'playwright');
const E=require('../dist/engine.js'),C=require('../dist/config.js');
const out=process.env.QA_SCREENSHOTS||path.join(os.tmpdir(),'slay-the-math-situations');
const report={version:require('../package.json').version,checks:[],viewports:[],cards:[],errors:[]};
let server,browser;
function room(type,stage=0){
 const r=E.newRun(7);r.stage=stage;if(stage)r.route=require('../dist/map.js').begin(stage,r.seed,3);
 const nodes=E.getMap(r).nodes,target=nodes.find(n=>n.type===type),route=[target];
 for(let depth=target.depth-1;depth>=0;depth--)route.unshift(nodes.find(n=>n.depth===depth&&n.next.includes(route[0].id)));
 r.depth=target.depth;r.route.path=route.slice(0,-1).map(n=>n.id);r.cleared=r.route.path.slice();
 E.enterNode(r,target.id);r.hp=39;r.gold=500;assert.ok(E.validate(r));return r;
}
function ending(scene){
 const r=E.newRun(7);delete r.route;r.stage=scene==='victory'?1:0;r.depth=['stageclear','victory'].includes(scene)?4:0;
 const id=scene==='victory'?'dealer':scene==='stageclear'?'sentinel':'wisp';E.startBattle(r,id);
 if(scene==='defeat'){r.hp=1;E.endTurn(r);}else{r.battle.hp=1;r.battle.seals=C.enemies[id].seals?.length||0;r.battle.enemyBlock=0;E.playCard(r,r.battle.hand.find(c=>E.definition(c).damage).uid);}
 assert.equal(r.scene,scene);assert.ok(E.validate(r));return r;
}
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 server=require('node:child_process').spawn(process.execPath,[path.join(__dirname,'../server.cjs')],{env:{...process.env,PORT:'4196'},stdio:['ignore','pipe','pipe']});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.stdout.once('data',resolve);server.stderr.once('data',d=>reject(Error(String(d))));});
 const opts={headless:true,args:['--no-sandbox']};
 if(process.env.QA_CHROMIUM_MODULE){const chrome=require(process.env.QA_CHROMIUM_MODULE);opts.executablePath=await chrome.executablePath();opts.args=[...chrome.args,...opts.args];}
 if(process.env.QA_DISABLE_GPU)opts.args.push('--disable-gpu');
 browser=await chromium.launch(opts);
 const context=await browser.newContext({viewport:{width:1920,height:1080},reducedMotion:'reduce'}),page=await context.newPage();
 page.setDefaultTimeout(12000);page.on('pageerror',e=>report.errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url());});
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')));
 const click=action=>page.locator('[data-action="'+action+'"]:visible').first().click();
 async function restore(r,p=page){
  await p.evaluate(r=>{localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true}));},r);
  await p.reload({waitUntil:'domcontentloaded'});await p.locator('[data-action=continue]').click();await p.evaluate(()=>Promise.all([...document.images].map(im=>im.decode())));
 }
 async function shot(name){if(process.env.QA_SCREENSHOTS)await page.screenshot({path:path.join(out,name+'.jpg'),type:'jpeg',quality:75,fullPage:true});}
 try{
  await page.goto('http://127.0.0.1:4196/');
  const fixtures={shop:room('shop'),camp:room('camp'),reward:ending('reward'),stageclear:ending('stageclear'),victory:ending('victory'),defeat:ending('defeat')};
  const expected={shop:'shop',camp:'rest',reward:'reward',stageclear:'reward',victory:'reward',defeat:'defeat'};
  const cases=[[1280,720],[1920,1080],[2048,1038],[2560,1080],[3440,1440],[5120,1440],[3840,2160],[1001,720],[844,390],[390,844],[320,740]];
  for(const [scene,r]of Object.entries(fixtures)){
   await restore(r);const before=await state();
   for(const [width,height]of cases){
    await page.setViewportSize({width,height});
    // Measure the resting row, rather than an incidental card hover after resize.
    await page.mouse.move(0,0);
    assert.match(await page.locator('.situation-art img').getAttribute('src'),new RegExp('situation-'+expected[scene]+'\\.webp$'));
    const g=await page.evaluate(()=>{
     const im=document.querySelector('.situation-art img'),rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
     return {overflow:document.documentElement.scrollWidth>innerWidth,fit:getComputedStyle(im).objectFit,natural:[im.naturalWidth,im.naturalHeight],art:rect(im),buttons:[...document.querySelectorAll('.situation-layout .btn,.situation-layout .choice-panel')].map(rect),cards:[...document.querySelectorAll('.situation-layout .playing-card')].map(e=>({card:rect(e),illustration:rect(e.querySelector('.math-art'))}))};
    });
    assert.equal(g.overflow,false,JSON.stringify({scene,width,g}));assert.equal(g.fit,'contain');assert.ok(g.natural[0]>1600&&g.natural[1]>900);
    assert.ok(g.art.x>=-1&&g.art.right<=width+1,'Artwork overflows the viewport');
    for(const b of g.buttons)assert.ok(b.x>=-1&&b.right<=width+1&&b.height>=44,JSON.stringify({scene,width,b}));
    for(const item of g.cards){
     assert.ok(Math.abs(item.card.y-g.cards[0].card.y)<1,'All three choices must stay in one horizontal row: '+JSON.stringify({scene,width,cards:g.cards}));
     const aspect=item.card.width/item.card.height;
     assert.ok(aspect>=.5&&aspect<=.75,'Card must remain portrait: '+JSON.stringify({scene,width,height,...item}));
     assert.ok(Math.abs(item.illustration.width/item.illustration.height-1)<.02,'Illustration must keep its square source ratio: '+JSON.stringify({scene,width,...item}));
    }
    if(g.cards.length)report.cards.push({scene,width,height,card:g.cards[0].card,illustration:g.cards[0].illustration});
    assert.deepEqual(await state(),before,'Rendering must not change the saved run');
    if(width===1920||width===390||width===2048&&scene==='reward'||width===3440&&['shop','camp','reward'].includes(scene))await shot(scene+'-'+width);
   }
  }
  report.viewports=cases.map(([width,height])=>({width,height,scenes:6,overflow:false}));
  report.checks.push('All six situations decode the correct clean artwork at eleven viewport sizes through UWHD and 4K; contained images, native 44px actions, no horizontal page overflow, exact saves preserved.');
  for(const scene of ['shop','reward']){
   const size=(w,h)=>report.cards.find(c=>c.scene===scene&&c.width===w&&c.height===h).card;
   assert.ok(Math.abs(size(1920,1080).width-size(2560,1080).width)<1,'A wider display must not widen the cards at the same height');
   assert.ok(Math.abs(size(3440,1440).width-size(5120,1440).width)<1,'Super-ultrawide space must not stretch cards');
  }
  report.checks.push('Reward and Shop cards stay portrait with square illustrations; adding ultrawide width does not enlarge cards at a fixed display height.');
  await page.setViewportSize({width:1920,height:1080});
  const shop=room('shop');await restore(shop);await page.locator('[data-action=select-shop]').nth(1).focus();await page.keyboard.press('Space');
  assert.equal(await page.locator('[data-action=select-shop]').nth(1).getAttribute('aria-pressed'),'true');
  await page.locator('[data-action=buy-card]').evaluate(el=>{el.click();el.click();});
  const bought=await state();assert.equal(bought.gold,shop.gold-shop.shop.offers[1].price);assert.equal(bought.deck.length,shop.deck.length+1);assert.deepEqual(bought.shop.bought,[1]);
  await page.reload();await click('continue');assert.deepEqual((await state()).shop,bought.shop);assert.equal(await page.locator('[data-action=select-shop]').nth(1).isDisabled(),true);assert.equal(await page.locator('.shop-price').nth(1).innerText(),'Sold');
  await click('leave-shop');assert.equal((await state()).scene,'map');assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('situation-active')),false);
  await restore(room('shop',1));assert.match(await page.locator('.shop-stock').innerText(),/VEIL/);await click('leave-shop');
  report.checks.push('Both stage shops retain actual stock and names; keyboard selection, exact price/deck update, once-only purchase, sold-state refresh and Leave work.');
  const camp=room('camp');await restore(camp);await click('rest');assert.equal((await state()).hp,Math.min(camp.maxHp,camp.hp+12));assert.equal((await state()).scene,'map');
  await restore(camp);await page.locator('[data-action=select-rest][data-value=upgrade]').click();await click('upgrade');assert.equal(await page.locator('#dialog').evaluate(e=>e.open),true);
  await page.keyboard.press('Escape');assert.equal(await page.locator('#dialog').evaluate(e=>e.open),false);await click('upgrade');await page.locator('[data-action=choose-upgrade]').first().click();
  assert.equal((await state()).scene,'map');assert.equal((await state()).deck.filter(c=>c.upgraded).length,camp.deck.filter(c=>c.upgraded).length+1);
  report.checks.push('Rest heals the live HP value once; Upgrade uses the original native card-selection dialog, Escape and actual upgrade/progression.');
  const reward=ending('reward');await restore(reward);await page.locator('[data-action=select-reward]').last().focus();await page.keyboard.press('Space');assert.deepEqual(await state(),reward);
  await click('reward');assert.equal((await state()).deck.length,reward.deck.length+1);assert.equal((await state()).deck.at(-1).key,reward.rewards[2]);assert.equal((await state()).scene,'map');
  await restore(reward);await click('skip-reward');assert.equal((await state()).deck.length,reward.deck.length);assert.equal((await state()).scene,'map');
  report.checks.push('Reward keyboard preview is presentation only; Add grants the selected real card once, while Skip preserves the deck.');
  await restore(ending('defeat'));assert.equal(await page.locator('.results-panel h1').innerText(),'Run Ended');await click('stats');assert.equal(await page.locator('#dialog').evaluate(e=>e.open),true);await page.keyboard.press('Escape');
  await click('retry');await click('confirm-retry');assert.equal((await state()).scene,'map');
  await restore(ending('stageclear'));await click('next-stage');assert.equal((await state()).stage,1);assert.ok((await state()).checkpoint);
  await restore(ending('victory'));assert.equal(await page.locator('.results-panel h1').innerText(),'Victory');
  report.checks.push('Defeat, Stage Clear and Victory retain their live summaries, learning record, confirmed Retry and actual Stage 2 checkpoint.');
  const offline=await context.newPage(),requests=[];offline.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});offline.on('pageerror',e=>report.errors.push(e.message));
  await offline.goto('file://'+path.join(__dirname,'../MAIN-SEKARANG.html'));await restore(camp,offline);
  assert.equal(await offline.locator('.situation-art img').evaluate(im=>im.src.startsWith('data:image/')&&im.naturalWidth>0),true);
  assert.equal(await offline.evaluate(()=>['shop','rest','reward','defeat'].every(id=>window.DC_ASSETS['situation-'+id+'.webp']?.startsWith('data:image/'))),true);
  await offline.locator('[data-action=rest]').click();assert.equal(await offline.locator('[data-stm-map]').count(),1);assert.deepEqual(requests,[]);await offline.close();
  report.checks.push('The generated offline build embeds all four new artworks and completes Rest to map without HTTP requests.');
  assert.deepEqual(report.errors,[]);fs.writeFileSync(path.join(out,'situation-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
 }finally{await context.close();}
})().then(async()=>{await browser?.close();server?.kill();}).catch(async e=>{console.error(e);process.exitCode=1;try{await browser?.close();}finally{server?.kill();}});
