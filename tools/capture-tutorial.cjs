/* Capture only the actual player UI in disposable local contexts. No live records/sharing. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawn,execFileSync}=require('node:child_process');
const {chromium}=require(process.env.BROWSER_QA_MODULE||'playwright'),sharp=require(process.env.SHARP_QA_MODULE||'sharp');
const F=require('./dev/fixtures.js'),T=require('../dist/tutorial-core.js'),D=require('../dist/tutorial-data.js'),E=require('../dist/engine.js'),Q=require('../dist/education.js');
const root=path.resolve(__dirname,'..'),hash=x=>crypto.createHash('sha256').update(x).digest('hex'),manifestFile=path.join(root,'docs/tutorial/screenshots.json');
const wanted=new Set(D.chapters.flatMap(c=>c.frames.map(f=>f.shot))),only=process.env.TUTORIAL_CAPTURE_GROUP;
const example=id=>{const c=T.create();c.select(id);return c.exercise().run;};
(async()=>{
 let server,browser,context,page,language,recipe,errors=[];
 const runtimeInputs=Object.fromEntries(fs.readdirSync(path.join(root,'dist')).filter(f=>/\.(?:html|js|css)$/.test(f)).map(file=>[file,hash(fs.readFileSync(path.join(root,'dist',file)))]));
 const inputDigest=hash(JSON.stringify(runtimeInputs)),prior=only&&fs.existsSync(manifestFile)?JSON.parse(fs.readFileSync(manifestFile,'utf8')):null;
 const manifest={version:2,sourceCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),gameVersion:require('../package.json').version,viewport:{width:1440,height:1000},method:'Actual player UI in isolated Chromium contexts; native actions and validated engine fixtures; actual DOM crops; WebP encoding only. English and BM rendered separately. No generated/repainted game UI.',runtimeInputs,inputDigest,runtimeSnapshots:{...(prior?.runtimeSnapshots||(prior?.inputDigest?{[prior.inputDigest]:prior.runtimeInputs}:{})),[inputDigest]:runtimeInputs},sourceWorkingTreeDirty:!!execFileSync('git',['status','--short','--untracked-files=no'],{cwd:root,encoding:'utf8'}).trim(),images:prior?.version===2?prior.images.filter(i=>i.group!==only):[]};
 async function start(group,save=null,{motion=false}={}){
  console.log('Starting '+language+' '+group);recipe=[];await context?.close();errors=[];
  context=await browser.newContext({viewport:manifest.viewport,reducedMotion:motion?'no-preference':'reduce',serviceWorkers:'block'});page=await context.newPage();page.setDefaultTimeout(20000);
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
  await context.route('**/*',route=>/^https?:\/\/(?:127\.0\.0\.1|localhost):4196\//.test(route.request().url())?route.continue():route.abort());
  await context.addInitScript(({save,language,motion})=>{localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion,sound:false,musicMuted:true,voiceMuted:true,combatEffects:'full'}));localStorage.setItem('slay-the-math.question-language.v1',language);if(save)localStorage.setItem('duel-cube-math.v1',JSON.stringify(save));},{save,language,motion});
  await page.goto('http://127.0.0.1:4196/');await page.locator('#resource-enter').waitFor({state:'visible',timeout:120000});
  recipe.push({setup:save?{scene:save.scene,seed:save.seed,mode:save.mode,sha256:hash(JSON.stringify(save))}:'Main Menu',language});
  if(group==='menu')await shot('loading','#resource-loader');
  await page.locator('#resource-enter').click();if(save)await click('[data-action=continue]');
 }
 async function click(selector){await page.locator(selector+':visible').first().click();recipe.push({click:selector});}
 async function shot(id,selector=null){
  if(!wanted.has(id))throw Error('Unused capture '+id);console.log('Capturing '+language+' '+id);await page.evaluate(async selector=>{if(!window.STMHosted)return;const scope=selector?document.querySelector(selector):document;await Promise.all([...scope.querySelectorAll('img[data-stm-asset]')].filter(im=>im.getBoundingClientRect().width>0&&im.getBoundingClientRect().height>0&&!im.closest('details:not([open])')).map(im=>STMHosted.imageElement(im)));},selector);
  await page.waitForFunction(selector=>(selector||!document.body.classList.contains('scene-preparing'))&&[...(selector?document.querySelector(selector):document).querySelectorAll('img[data-stm-asset]')].filter(im=>im.offsetParent!==null&&im.getBoundingClientRect().width>0&&im.getBoundingClientRect().height>0&&!im.closest('details:not([open])')&&(!im.matches('.menu-ambience,.menu-backdrop')||im.classList.contains('active'))).every(im=>im.dataset.stmImageState==='ready'||im.dataset.iconFallback==='true'),selector,{timeout:20000});
  await page.evaluate(async selector=>{await document.fonts.ready;const scope=selector?document.querySelector(selector):document;await Promise.race([Promise.all([...scope.querySelectorAll('img')].filter(i=>i.offsetParent!==null&&(!i.dataset.stmAsset||i.dataset.stmImageState==='ready')).map(i=>i.decode().catch(()=>{}))),new Promise((_,reject)=>setTimeout(()=>reject(Error('Image decode timeout')),10000))]);},selector);
  const target=selector?page.locator(selector).first():page,crop=selector?await target.boundingBox():{x:0,y:0,...manifest.viewport};
  const png=await target.screenshot({animations:'disabled'}),file=D.mediaFile(id,language),out=path.join(root,'dist/assets',file);
  await sharp(png).webp({quality:84}).toFile(out);const bytes=fs.readFileSync(out),meta=await sharp(bytes).metadata();
  if(errors.length)throw Error(id+': '+errors.join('; '));
  manifest.images=manifest.images.filter(i=>i.id!==id||i.language!==language);
  manifest.images.push({id,language,file,width:meta.width,height:meta.height,bytes:bytes.length,sha256:hash(bytes),inputDigest,group:currentGroup,selector,crop,actions:JSON.parse(JSON.stringify(recipe))});
  fs.mkdirSync(path.dirname(manifestFile),{recursive:true});fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2)+'\n');console.log(language+' '+id+': '+bytes.length+' bytes');
 }
 async function forecastAnswer(correct=true){
  const id=await page.locator('[data-question-workspace]').getAttribute('data-question-workspace'),q=await page.evaluate(()=>{const r=JSON.parse(localStorage.getItem('duel-cube-math.v1'));return DCEducation.currentConsumer(r).question;});
  recipe.push({question:q.id,correct});
  await click('[data-question-tab=question]');await click('[data-action=forecast-select][data-id="'+(correct?q.correctChoiceId:q.choices.find(c=>c.id!==q.correctChoiceId).id)+'"]');await click('[data-action=forecast-check]');
 }
 let currentGroup='';
 try{
  server=spawn(process.execPath,['server.cjs'],{cwd:root,env:{...process.env,PORT:'4196'},stdio:['ignore','pipe','pipe']});await new Promise((res,rej)=>{server.once('error',rej);server.stdout.once('data',res);server.stderr.once('data',b=>rej(Error(String(b))));});
  const opts={headless:true,args:['--no-sandbox','--disable-gpu']};
  if(process.env.QA_CHROMIUM_EXECUTABLE)opts.executablePath=process.env.QA_CHROMIUM_EXECUTABLE;
  if(process.env.QA_CHROMIUM_MODULE){const loaded=require(process.env.QA_CHROMIUM_MODULE),c=loaded.default||loaded;opts.executablePath=await c.executablePath();opts.args=[...c.args.filter(a=>!['--single-process','--disable-web-security'].includes(a)),...opts.args];}
  browser=await chromium.launch(opts);
  const groups={
   async menu(){
    await start('menu');await shot('menu');await click('[data-action=new]');await shot('modes','#dialog');await click('#dialog [data-action=close]');
    await click('[data-action=saves]');await shot('settings','#dialog');await click('#dialog [data-action=close]');
    await click('[data-action=music]');await shot('sound','#dialog');await click('#dialog [data-action=close]');
    await click('[data-action=library]');await shot('collection','.collection-detail');await click('[data-action=collection-tab][data-kind=artifacts]');await shot('collection-artifacts','#dialog');await click('#dialog [data-action=close]');
    await click('[data-action=analytics]');await shot('report','#dialog');await click('#dialog [data-action=close]');
    await click('[data-action=education-practice]');const f=page.frameLocator('#education-practice-frame');await f.locator('#question-prompt').waitFor();await shot('learning');
    await f.locator('#hint-tab').click();recipe.push({frameClick:'#hint-tab'});await shot('learning-help');
   },
   async map(){await start('map',F.create({kind:'map'}));await shot('map');},
   async combat(){
    const r=example('first-turn');await start('combat',r);await shot('combat');await shot('intent','.enemy');await shot('resources','.combat-dock');
    const attack=r.battle.hand.find(c=>c.key==='stm.attack.rune_strike'),guard=r.battle.hand.find(c=>c.key==='stm.defend.rune_guard');
    await shot('card','[data-action=play][data-id="'+attack.uid+'"]');await click('[data-action=play][data-id="'+guard.uid+'"]');await shot('block','.player .fighter-panel');
    await click('[data-action=play][data-id="'+attack.uid+'"]');await shot('attack-block');await shot('attack','.enemy .fighter-panel');await click('[data-action=end-turn]');await shot('turn');
    await click('[data-action=pile][data-zone=draw]');await shot('draw','#dialog');
   },
   async exhaust(){const r=F.create({kind:'combat',deck:['stm.defend.flash_ward',...Array(11).fill('stm.attack.rune_strike')],card:'stm.defend.flash_ward'});await start('exhaust',r);await click('[data-action=play][data-id="'+r.battle.hand[0].uid+'"]');await click('[data-action=pile][data-zone=exhaust]');await shot('exhaust','#dialog');},
   async predict(){
    await start('predict',example('cards'));await click('[data-action=forecast]');await shot('predict','#dialog');await click('[data-question-tab=help]');await click('[data-action=forecast-support][data-kind=hint]');await shot('help','#dialog');
    await forecastAnswer(false);await click('[data-question-tab=help]');await click('[data-action=forecast-support][data-kind=moreHint]');await shot('retry','#dialog');
    await forecastAnswer(true);await click('[data-question-tab=result]');await shot('predict-result','#dialog');await click('[data-action=question-report]');await shot('report-problem','#question-report-dialog');
   },
   async focus(){const r=example('focus');await start('focus',r);await shot('focus','.combat-dock');await click('[data-action=focus]');await shot('focus-armed','.combat-dock');await click('[data-action=play][data-id="'+r.battle.hand.find(c=>c.key==='stm.attack.rune_strike').uid+'"]');await shot('focus-hit','.enemy .fighter-panel');},
   async passive(){const r=example('passive');await start('passive',r,{motion:true});await click('[data-action=play][data-id="'+r.battle.hand.find(c=>c.key==='stm.passive.blazing_spirit').uid+'"]');await shot('passive');await click('[data-action=passive-details]');await shot('passive-detail','#dialog');},
   async statuses(){const r=require('../tests/helpers/icon-status.cjs')();await start('statuses',r);await shot('statuses','.player');await click('.status-overview-trigger[data-who=player]');await click('#dialog [data-id=weak]');await shot('status-detail','#dialog');},
   async rewards(){const r=F.create({kind:'reward'});await start('rewards',r);await shot('rewards','.reward-main');await click('[data-action=select-reward]');await click('[data-action=reward]');await click('[data-action=deck]');await shot('reward-taken','#dialog');},
   async shop(){await start('shop',F.create({kind:'shop'}));await click('[data-action=select-shop][data-index="0"]');await shot('shop','.shop-counter');await click('[data-action=buy-card]');await shot('shop-bought','.shop-counter');await click('[data-action=shop-tab][data-id=artifacts]');await shot('shop-artifacts','.shop-counter');await click('[data-action=shop-tab][data-id=remove]');await shot('shop-remove','.shop-counter');},
   async rest(){await start('rest',F.create({kind:'rest',hp:24}));await shot('rest','.room-panel');await click('[data-action=select-rest][data-value=upgrade]');await click('[data-action=upgrade]');await shot('rest-upgrade','#dialog');},
   async mystery(){await start('mystery',F.create({kind:'event',event:'ME01'}));await shot('mystery','.mystery-panel');await click('[data-action=mystery-start]');await shot('mystery-question','.mystery-panel');},
   async boss(){await start('boss',F.create({kind:'combat',enemy:'sentinel'}));await shot('boss','.seals');await click('[data-action=forecast]');await forecastAnswer(true);await click('#dialog [data-action=close]');await shot('boss-open','.seals');},
   async master(){await start('master',F.create({kind:'master'}));await click('[data-action=select-artifact]');await shot('master','.artifact-choice-panel');await click('[data-action=claim-artifact]');await shot('artifact-question','.education-panel');const q=await page.evaluate(()=>DCEducation.currentConsumer(JSON.parse(localStorage.getItem('duel-cube-math.v1'))).question);await click('[data-action=education-select][data-id="'+q.correctChoiceId+'"]');await click('[data-action=education-check]');await click('[data-question-tab=result]');await shot('artifact-result','.education-panel');},
   async results(){await start('results',F.create({kind:'victory'}));await shot('results');}
  };
  for(language of ['en','ms'])for(const [id,run]of Object.entries(groups)){if(only&&id!==only)continue;currentGroup=id;try{await run();}catch(e){console.error('GROUP FAILED '+language+' '+id+': '+e.message);console.error((await page.locator('button:visible').allTextContents()).join(' | ').slice(0,1800));await page.screenshot({path:'/tmp/tutorial-capture-'+language+'-'+id+'-failed.png'}).catch(()=>{});}}
  if(!only){for(const lang of ['en','ms'])for(const id of wanted)if(!manifest.images.some(i=>i.id===id&&i.language===lang))throw Error('Missing '+lang+' '+id);}
  console.log(JSON.stringify({images:manifest.images.length,bytes:manifest.images.reduce((n,i)=>n+i.bytes,0),manifest:manifestFile}));
 }catch(error){if(page){console.error((await page.locator('button:visible').allTextContents()).join(' | ').slice(0,2000));await page.screenshot({path:'/tmp/tutorial-capture-failed.png'}).catch(()=>{});}throw error;
 }finally{await context?.close();await browser?.close();server?.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
