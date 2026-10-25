'use strict';
const assert=require('node:assert/strict'),{chromium}=require(process.env.BROWSER_QA_MODULE||'playwright');
(async()=>{const browser=await chromium.launch({executablePath:process.env.QA_CHROMIUM_EXECUTABLE||'/tmp/chromium',headless:true,args:['--no-sandbox']});
 try{const page=await browser.newPage();await page.clock.install();await page.setContent('<main>Clock API contract</main>');
  const target=await page.evaluate(()=>Date.now());await page.clock.setFixedTime(target);
  await page.evaluate(()=>new Promise(resolve=>setTimeout(resolve,150))); // Intentional delay exceeds the old 50ms deadline.
  await page.clock.pauseAt(target);await page.clock.setSystemTime(target);
  const before=await page.evaluate(()=>{window.fired=false;setTimeout(()=>window.fired=true,100);return {date:Date.now(),performance:performance.now()};});
  await new Promise(resolve=>setTimeout(resolve,150)); // Prove real waiting does not advance the paused fake clock.
  const paused=await page.evaluate(()=>({date:Date.now(),performance:performance.now(),fired:window.fired}));assert.equal(paused.date,before.date);assert.equal(paused.performance,before.performance);assert.equal(paused.fired,false);
  await page.clock.runFor(100);const advanced=await page.evaluate(()=>({date:Date.now(),performance:performance.now(),fired:window.fired}));assert.equal(advanced.date,before.date+100);assert.equal(advanced.performance,before.performance+100);assert.equal(advanced.fired,true);
  console.log(JSON.stringify({status:'PASS',pattern:['setFixedTime(target)','pauseAt(target)','setSystemTime(target)'],deliberateCrossProcessDelayMs:150,paused,advanced,manualDeltaMs:100}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
