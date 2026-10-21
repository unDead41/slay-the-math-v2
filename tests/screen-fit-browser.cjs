// Regression: combat must use a large viewport rather than a small 2048px island.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.BROWSER_QA_MODULE||'playwright');
const E=require('../dist/engine.js');
let server;
(async()=>{
 const options={headless:true,args:['--no-sandbox']};
 if(process.env.QA_CHROMIUM_MODULE){const chrome=require(process.env.QA_CHROMIUM_MODULE);options.executablePath=await chrome.executablePath();options.args=[...chrome.args,'--no-sandbox'];}
 if(process.env.QA_DISABLE_GPU)options.args.push('--disable-gpu');
 server=require('node:child_process').spawn(process.execPath,[path.join(__dirname,'../server.cjs')],{env:{...process.env,PORT:'4186'},stdio:['ignore','pipe','pipe']});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.stdout.once('data',resolve);server.stderr.once('data',d=>reject(new Error(String(d))));});
 let browser;const report=[];
 try{
  for(const [width,height,dpr] of [[3413,1708,.6],[2560,1440,1],[3440,1440,1],[3840,2160,1],[1920,1080,1],[1280,720,1],[390,844,1]]){
   // The single-process QA browser needs a fresh process for each DPR context.
   browser=await chromium.launch(options);
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr,reducedMotion:'reduce'}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:4186/');
   const run=E.newRun(7);delete run.route;E.startBattle(run,'wisp');
   await page.evaluate(r=>{localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true}));},run);
   await page.reload();await page.locator('[data-action=continue]').click();
   await page.evaluate(()=>Promise.all([...document.images].map(im=>im.decode())));
   const box=await page.evaluate(()=>{
    const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
    const arena=rect('.battle-theatre'),back=document.querySelector('.arena-backdrop');
    const scale=Math.max(arena.width/back.naturalWidth,arena.height/back.naturalHeight);
    const pos=parseFloat(getComputedStyle(back).objectPosition.split(' ')[1])/100;
    const floor=arena.y+back.naturalHeight*scale*.68-(back.naturalHeight*scale-arena.height)*pos;
    const im=rect('.player .fighter-art'),shadow=rect('.player .ground-shadow');
    return {viewport:[innerWidth,innerHeight],game:rect('#game'),layout:rect('.combat-layout'),arena,header:rect('#header'),hand:rect('.combat-hand'),
     rootWidth:document.documentElement.scrollWidth,card:rect('.hand .playing-card'),end:rect('[data-action=end-turn]'),
     menuFont:parseFloat(getComputedStyle(document.querySelector('.battle-actions .btn')).fontSize),floor,
     foot:im.y+im.height*11/12,ground:shadow.y+shadow.height*.45};
   });
   if(process.env.QA_SCREENSHOTS){fs.mkdirSync(process.env.QA_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,`screen-fit-${width}-${dpr}.png`),fullPage:true});}
   report.push({width,height,dpr,...box});
   assert.ok(box.game.width>=width*.98,`Combat uses only ${(box.game.width/width*100).toFixed(1)}% of the ${width}px viewport`);
   assert.ok(box.rootWidth<=width+1,'Page overflows horizontally');
   if(width>=1920&&height>=1000){assert.ok(box.layout.bottom>=height*.88,'Large black area remains below the combat');assert.ok(box.layout.bottom<=height*1.12,'Desktop controls fall far below the viewport');}
   if(width>=3000&&height>=1400)assert.ok(box.menuFont>=27,'Desktop controls are too small for a large viewport');
   assert.ok(box.end.height>=44);assert.ok(box.hand.y>=box.arena.bottom-2);
   assert.ok(Math.abs(box.foot-box.ground)<1.2,'Player foot lost its contact shadow');
   assert.ok(box.foot>box.floor+12,'The player is standing on the background wall');
   assert.deepEqual(errors,[]);await browser.close();browser=null;
  }
  console.log(JSON.stringify({checks:report.length,viewports:report},null,2));
 }finally{await browser?.close();server?.kill();}
})().catch(e=>{server?.kill();console.error(e);process.exitCode=1;});
