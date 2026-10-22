'use strict';
const assert=require('node:assert/strict'),{spawn}=require('node:child_process'),{chromium}=require(process.env.BROWSER_QA_MODULE||'playwright');
const E=require('../dist/engine.js');let browser,server;
(async()=>{try{
 const port=process.env.QA_RANDOM_PORT||'4266',url='http://127.0.0.1:'+port;
 server=spawn(process.execPath,['server.cjs'],{env:{...process.env,PORT:port},stdio:['ignore','pipe','pipe']});await new Promise((ok,no)=>{server.stdout.once('data',ok);server.once('error',no);server.stderr.once('data',x=>no(Error(String(x))))});
 browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.QA_CHROMIUM_EXECUTABLE?{executablePath:process.env.QA_CHROMIUM_EXECUTABLE}:{})});
 const page=await browser.newPage({viewport:{width:1500,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url);await page.evaluate(r=>{localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true,voiceMuted:true}));},E.newRun(123,'challenge'));await page.reload();
 const click=async(action)=>page.locator('[data-action="'+action+'"]').first().evaluate(el=>el.click()),state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')));
 await click('continue');await click('select-artifact');await click('claim-artifact');let r=await state();const first=r.educationState.pending.questionId;
 const correct=await page.evaluate(()=>{const r=JSON.parse(localStorage.getItem('duel-cube-math.v1'));return DCEducation.current(r).correctChoiceId;});
 await page.locator('[data-action=education-select][data-id="'+correct+'"]').evaluate(el=>el.click());await click('education-check');await click('education-continue');
 await page.locator('[data-action=node]:not(:disabled)').first().evaluate(el=>el.click());await click('forecast');r=await state();const second=r.battle.question.questionId;assert.notEqual(second,first);assert.equal(r.educationState.runUsedIds.length,2);
 const predictionCorrect=await page.evaluate(()=>{const r=JSON.parse(localStorage.getItem('duel-cube-math.v1'));return DCEducation.catalog[r.battle.question.questionId].correctChoiceId;});await page.locator('[data-action=forecast-select][data-id="'+predictionCorrect+'"]').evaluate(el=>el.click());await click('forecast-check');await click('close');await click('end-turn');await click('forecast');r=await state();const third=r.battle.question.questionId;assert.ok(![first,second].includes(third));assert.equal(r.educationState.runUsedIds.length,3);
 await page.reload();await click('continue');r=await state();assert.equal(r.battle.question.questionId,third);assert.equal(r.educationState.runUsedIds.length,3);
 await click('close');await click('home');await click('new');await click('start-new');await click('start-challenge');r=await state();assert.equal(r.educationState?.runUsedIds?.length||0,0);assert.equal(r.scene,'master');
 assert.deepEqual(errors,[]);console.log(JSON.stringify({status:'PASS',firstArtifact:first,predict:second,nextPredict:third,reloadPreserved:true,newRunReset:true,browserErrors:errors}));
}finally{await browser?.close();server?.kill();}})().catch(e=>{console.error(e);process.exitCode=1;});
