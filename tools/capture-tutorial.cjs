/* Capture real player UI. No user browser or real records are used. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
const {chromium}=require(process.env.BROWSER_QA_MODULE||'playwright'),sharp=require(process.env.SHARP_QA_MODULE||'sharp');
const F=require('./dev/fixtures.js'),X=require('../dist/mystery.js'),root=path.resolve(__dirname,'..');
(async()=>{
 let server,browser;const manifest={version:1,sourceCommit:require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),gameVersion:require('../package.json').version,viewport:{width:1440,height:1000},method:'Playwright screenshots of the actual player UI with isolated deterministic engine fixtures; WebP encoding only.',images:[]};
 try{
  const html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8'),inputs=['index.html',...[...html.matchAll(/<(?:script src|link rel="stylesheet" href)="([^"]+)"/g)].map(m=>m[1].split(/[?#]/)[0])];
  manifest.runtimeInputs=Object.fromEntries(inputs.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'dist',file))).digest('hex')]));
  manifest.sourceWorkingTreeDirty=!!require('node:child_process').execFileSync('git',['status','--short','--untracked-files=no'],{cwd:root,encoding:'utf8'}).trim();
  server=spawn(process.execPath,['server.cjs'],{cwd:root,env:{...process.env,PORT:'4196'},stdio:['ignore','pipe','pipe']});await new Promise((resolve,reject)=>{server.once('error',reject);server.stdout.once('data',resolve);});
  const opts={headless:true,args:['--no-sandbox','--disable-gpu']};
  if(process.env.QA_CHROMIUM_MODULE){const loaded=require(process.env.QA_CHROMIUM_MODULE),c=loaded.default||loaded;opts.executablePath=await c.executablePath();opts.args=[...c.args.filter(a=>a!=='--single-process'),...opts.args];}
  browser=await chromium.launch(opts);
  const shots=[
   ['menu',null],['master',{kind:'master'}],['map',{kind:'map'}],['combat',{kind:'combat'}],['cards',{kind:'combat'},'library'],['predict',{kind:'combat'},'forecast'],
   ['focus',{kind:'combat',focus:1,focused:true}],['passive',{kind:'combat',deck:['stm.passive.blazing_spirit',...Array(11).fill('stm.attack.rune_strike')],card:'stm.passive.blazing_spirit'},'play'],
   ['rewards',{kind:'reward'}],['shop',{kind:'shop'}],['rest',{kind:'rest',hp:24}],['mystery',{kind:'event',event:Object.keys(X.catalog)[0]}],['boss',{kind:'combat',enemy:'sentinel'}],['learning',null,'education-practice'],['settings',null,'saves'],['results',{kind:'victory'}]
  ];
  for(const [id,setup,action]of shots){
   const context=await browser.newContext({viewport:manifest.viewport,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await context.addInitScript(save=>{localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true,voiceMuted:true}));if(save)localStorage.setItem('duel-cube-math.v1',JSON.stringify(save));},setup?F.create({...setup,seed:7}):null);
   await page.goto('http://127.0.0.1:4196/');if(setup)await page.locator('[data-action=continue]:visible').first().click();
   if(action)await page.locator('[data-action='+action+']:visible').first().click();
   if(id==='learning')await page.frameLocator('#education-practice-frame').locator('#question-prompt').waitFor();
   await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(i=>i.offsetParent!==null).map(i=>i.decode().catch(()=>{})));});
   const target=action==='library'||action==='forecast'||action==='saves'?page.locator('#dialog'):page.locator('#game');
   const png=await target.screenshot({animations:'disabled'}),file='tutorial-'+id+'.webp',out=path.join(root,'dist/assets',file);
   await sharp(png).webp({quality:82}).toFile(out);const bytes=fs.readFileSync(out),meta=await sharp(bytes).metadata();
   if(errors.length)throw Error(id+': '+errors.join('; '));manifest.images.push({id,file,width:meta.width,height:meta.height,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),setup:setup||'Main Menu',action:action||null});console.log(id+': '+bytes.length+' bytes');await context.close();
  }
  fs.mkdirSync(path.join(root,'docs/tutorial'),{recursive:true});fs.writeFileSync(path.join(root,'docs/tutorial/screenshots.json'),JSON.stringify(manifest,null,2)+'\n');
 }finally{await browser?.close();server?.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
