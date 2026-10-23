'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('playwright'),F=require('../tools/dev/fixtures.js'),Q=require('../dist/question-data.js');
const root=path.resolve(__dirname,'..'),output=process.env.QA_OUTPUT||path.join(root,'docs/verification/audio-2.24.0');
const report={version:'2.24.0',checks:[],decodedVoices:[],errors:[],limits:['Automated Chromium playback/decode, not human audition or physical Windows/device testing.','Source pack has eight card reward recordings, five correct-answer and nine wrong-answer recordings. No new SFX were supplied.']};
let browser,server;
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 server=require('node:child_process').spawn(process.execPath,[path.join(root,'server.cjs'),'--prod'],{env:{...process.env,PORT:'4196'},stdio:['ignore','pipe','pipe']});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.stdout.once('data',resolve);server.stderr.once('data',d=>reject(Error(String(d))));});
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,args:['--no-sandbox','--disable-dev-shm-usage']});
 report.browser=browser.version();
 const context=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'reduce'}),page=await context.newPage();
 page.on('pageerror',e=>report.errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url());});
 await page.goto('http://127.0.0.1:4196/');
 async function fixture(r){
  await page.evaluate(r=>{localStorage.clear();localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:false,voiceMuted:false}));},r);
  await page.reload();await page.locator('[data-action=continue]').click();
 }
 async function voice(group){await page.waitForFunction(g=>DCAudio.voiceSurface?.group===g&&!!DCAudio.state.voice,group,{timeout:6000});assert.equal(await page.evaluate(()=>DCAudio.voiceActive.source.playbackRate.value),1);}
 async function check(label,fn){await fn();report.checks.push(label);console.log('PASS '+label);}
 await check('Production registry and all 75 MP3 voices decode in native Web Audio',async()=>{
  await page.locator('.dungeon-home-footer [data-action=music]').click();
  report.decodedVoices=await page.evaluate(async()=>{
   const ctx=DCAudio.context(),out=[];
   for(const a of Object.values(DCAudioAssets.assets).filter(a=>a.bus==='voice')){
    const response=await fetch(a.srcs[0]);if(!response.ok)throw Error(a.id+' missing');
    const buffer=await ctx.decodeAudioData(await response.arrayBuffer());
    if(!(buffer.duration>0&&Math.abs(buffer.duration-a.duration)<.15))throw Error(a.id+' duration differs');
    out.push({id:a.id,duration:buffer.duration,sampleRate:buffer.sampleRate});
   }
   return out;
  });assert.equal(report.decodedVoices.length,75);
 });
 await check('Predict/Hint/More Hint use actual controls; rerender does not restart; close cancels',async()=>{
  await fixture(F.create({kind:'combat'}));await page.locator('[data-action=forecast]').click();await voice('question');
  const qid=await page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')).battle.question.questionId),q=Q.questions.find(q=>q.id===qid),wrong=q.choices.find(c=>c.id!==q.correctChoiceId).id;
  await page.evaluate(()=>window.__voiceSource=DCAudio.voiceActive.source);
  await page.locator('[data-action=forecast-select][data-id="'+wrong+'"]').click();assert.ok(await page.evaluate(()=>DCAudio.voiceActive.source===window.__voiceSource));
  await page.locator('[data-action=forecast-support][data-kind=hint]').click();await voice('hint');
  await page.locator('[data-action=forecast-check]').click();await voice('wrong');
  await page.locator('[data-action=forecast-support][data-kind=moreHint]').click();await voice('more_hint');
  await page.locator('[data-action=forecast-select][data-id="'+q.correctChoiceId+'"]').click();assert.equal(await page.evaluate(()=>DCAudio.voiceSurface.group),'more_hint');
  await page.locator('[data-action=forecast-check]').click();await voice('correct');
  const receipts=await page.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('duel-cube-math.v1')).audioPresentation.alyssa.handled).filter(k=>k.startsWith('alyssa:correct:')).length);assert.equal(receipts,1);
  await page.locator('#dialog [data-action=close]').first().click();assert.equal(await page.evaluate(()=>DCAudio.state.voice),null);assert.equal(await page.evaluate(()=>DCAudio.state.duckFactor),1);
 });
 await check('Dungeon Master normalized greeting yields to the Artifact question',async()=>{
  await fixture(F.create({kind:'master'}));await page.waitForFunction(()=>DCAudio.state.voice==='vo_dm_01');
  await page.locator('[data-action=select-artifact]').first().click();await page.locator('[data-action=claim-artifact]').click();await voice('question');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')).scene),'education');
  const qid=await page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')).educationState.pending.questionId),q=Q.questions.find(q=>q.id===qid);
  await page.locator('[data-action=education-select][data-id="'+q.choices.find(c=>c.id!==q.correctChoiceId).id+'"]').click();await page.locator('[data-action=education-check]').click();await voice('wrong');
  await page.locator('[data-action=education-select][data-id="'+q.correctChoiceId+'"]').click();await page.locator('[data-action=education-check]').click();await voice('correct');
 });
 await check('Mystery correct/wrong review uses submitted answers; timeout produces no answer voice',async()=>{
  for(const outcome of ['CORRECT','INCORRECT','TIMEOUT']){
   await fixture(F.create({kind:'event',event:'ME01',hp:40}));await page.locator('[data-action=mystery-start]').click();await voice('question');
   const p=await page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')).mysteryState.pending),q=Q.questions.find(q=>q.id===p.questionId);
   const id=outcome==='INCORRECT'?q.choices.find(c=>c.id!==q.correctChoiceId).id:q.correctChoiceId;
   if(outcome==='TIMEOUT')await page.evaluate(({deadline,id})=>{Date.now=()=>deadline+1;document.querySelector('[data-action=mystery-answer][data-id="'+id+'"]').click();},{deadline:p.deadline,id});
   else await page.locator('[data-action=mystery-answer][data-id="'+id+'"]').click();
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')).mysteryState.pending.outcome),outcome);
   if(outcome==='TIMEOUT')assert.equal(await page.evaluate(()=>DCAudio.state.voice),null);else await voice(outcome==='CORRECT'?'correct':'wrong');
  }
 });
 await check('Rest commits healing before speaking; card reward and defeat have distinct lines',async()=>{
  await fixture(F.create({kind:'rest',hp:40}));assert.equal(await page.evaluate(()=>DCAudio.state.voice),null);
  await page.locator('[data-action=rest]').click();await voice('rest');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')).hp),52);
  await fixture(F.create({kind:'reward'}));await voice('card_reward');
  await fixture(F.create({kind:'defeat'}));await voice('defeat');
  await page.locator('#header [data-action=home]').click();assert.equal(await page.evaluate(()=>DCAudio.state.voice),null);
 });
 await check('Mystery intro starts independently; Start Challenge cancels it and leaves the real timer active',async()=>{
  await fixture(F.create({kind:'event',event:'ME01',hp:40}));await page.waitForFunction(()=>DCAudio.state.voice==='voice_alyssa_mystery_me01_entry');
  await page.locator('[data-action=mystery-start]').click();await voice('question');
  assert.ok(await page.evaluate(()=>{const p=JSON.parse(localStorage.getItem('duel-cube-math.v1')).mysteryState.pending;return p.phase==='question'&&p.deadline>p.startedAt;}));
 });
 await check('Practice frame sends thinking/help to the one Voice bus and leaves saved run untouched',async()=>{
  await fixture(F.create({kind:'combat'}));await page.locator('#header [data-action=home]').click();const before=await page.evaluate(()=>localStorage.getItem('duel-cube-math.v1'));
  await page.locator('[data-action=education-practice]').click();const frame=page.frameLocator('#education-practice-frame');await frame.locator('#question-heading').waitFor();await voice('question');
  await frame.locator('#hint-tab').click();await voice('hint');
  const q=Q.questions[0],wrong=q.choices.filter(c=>c.id!==q.correctChoiceId);
  await frame.locator('input[value="'+wrong[0].id+'"]').check();await frame.locator('#submit-answer').click();await voice('wrong');
  const first=await page.evaluate(()=>DCAudio.voiceSurface.key);
  await frame.locator('#more-hint-tab').click();await voice('more_hint');
  await frame.locator('input[value="'+wrong[1].id+'"]').check();await frame.locator('#submit-answer').click();await voice('wrong');assert.notEqual(await page.evaluate(()=>DCAudio.voiceSurface.key),first);
  await frame.locator('input[value="'+q.correctChoiceId+'"]').check();await frame.locator('#submit-answer').click();await voice('correct');
  await frame.locator('#restart-review').click();await voice('question');
  await frame.locator('#reveal-answer').click();assert.equal(await page.evaluate(()=>DCAudio.state.voice),null);
  assert.equal(await page.evaluate(()=>localStorage.getItem('duel-cube-math.v1')),before);
  await page.evaluate(async()=>{await DCAudio.setHidden(true);await DCAudio.setHidden(false);});assert.equal(await page.evaluate(()=>DCAudio.state.voice),null);
 });
 await check('Portable file embeds all 75 normalized voices and plays without network',async()=>{
  const offline=await browser.newContext({offline:true,viewport:{width:1280,height:800},reducedMotion:'reduce'});
  await offline.addInitScript(r=>{localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true,voiceMuted:false}));},F.create({kind:'combat'}));
  const p=await offline.newPage();p.on('pageerror',e=>report.errors.push('offline: '+e.message));await p.goto(pathToFileURL(path.join(root,'SLAY-THE-MATH-OFFLINE.html')).href,{timeout:120000});
  assert.equal(await p.evaluate(()=>Object.keys(DC_VOICE).length),75);assert.equal(await p.evaluate(()=>DCRelease.version),'2.24.0');
  await p.locator('[data-action=continue]').click();await p.locator('[data-action=forecast]').click();await p.waitForFunction(()=>DCAudio.state.voice?.startsWith('vo_alyssa_question_'),{},{timeout:10000});
  assert.equal(await p.evaluate(()=>DCAudio.state.current),null);await offline.close();
 });
 assert.deepEqual(report.errors,[]);report.status='PASS';
})().catch(error=>{report.status='FAIL';report.failure=error.stack;console.error(error);process.exitCode=1;}).finally(async()=>{
 if(browser)await browser.close();if(server)server.kill();fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'browser-report.json'),JSON.stringify(report,null,2)+'\n');
});
