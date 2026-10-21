const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.BROWSER_QA_MODULE||'playwright');
const E=require('../dist/engine.js'),Q=require('../dist/education.js'),A=require('../dist/artifacts.js');
const {completeBrowserTrial}=require('./helpers/education.cjs');
const report={checks:[],viewports:[],topics:[],errors:[]};let server;
(async()=>{
 const options={headless:true,args:['--no-sandbox']};
 if(process.env.QA_CHROMIUM_MODULE){const chrome=require(process.env.QA_CHROMIUM_MODULE);options.executablePath=await chrome.executablePath();options.args=[...chrome.args,'--no-sandbox'];}
 if(process.env.QA_DISABLE_GPU)options.args.push('--disable-gpu');
 server=require('node:child_process').spawn(process.execPath,[path.join(__dirname,'../server.cjs')],{env:{...process.env,PORT:'4190'},stdio:['ignore','pipe','pipe']});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.stdout.once('data',resolve);server.stderr.once('data',d=>reject(new Error(String(d))));});
 const browser=await chromium.launch(options),page=await browser.newPage({viewport:{width:1920,height:1080},reducedMotion:'reduce'});
 page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url());});
 const click=a=>page.locator('[data-action='+a+']:visible').first().click();
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1')));
 const shot=async name=>{if(process.env.QA_SCREENSHOTS){fs.mkdirSync(process.env.QA_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,name+'.png'),fullPage:true,animations:'disabled'});}};
 async function restore(r,clearHistory=true){await page.evaluate(({r,clearHistory})=>{localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));if(clearHistory)localStorage.removeItem('duel-cube-question-history.v1');localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true}));},{r,clearHistory});await page.reload();await click('continue');await page.locator('.artifact-scene-art img').evaluate(im=>im.decode());}
 function offering(code){for(let seed=1;seed<300;seed++){const r=E.newRun(seed,'challenge');if(r.artifactState.offer.ids.includes(A.id(code)))return r;}throw new Error('No offer fixture');}
 function question(id){const r=E.newRun(7,'challenge');E.chooseArtifact(r,E.artifactChoices(r)[0].id,Q.ids.filter(x=>x!==id));return r;}
 try{
  await page.goto('http://127.0.0.1:4190/');await restore(offering('s09'));
  await page.locator('[data-action=select-artifact][data-id="'+A.id('s09')+'"]').click();
  await page.locator('[data-action=claim-artifact]').evaluate(el=>{el.click();el.click();});
  let run=await state();const q=Q.current(run),initial=JSON.parse(JSON.stringify(run));
  assert.equal(run.scene,'education');assert.equal(run.gold,80);assert.equal(run.artifactState.owned.length,0);assert.equal(await page.locator('.dungeon-atlas').count(),0);assert.equal(await page.locator('[data-action=education-select]').count(),4);assert.equal(await page.locator('#education-prompt').textContent(),q.prompt);assert.equal(await page.locator('[data-action=education-check]').isDisabled(),true);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'education-title');
  report.checks.push('The real Claim & Choose Your Path button opens one saved question from the original bank, before ownership, Gold or map entry; double activation cannot reroll it');

  const wrong=q.choices.find(c=>c.id!==q.correctChoiceId).id;
  await page.locator('[data-action=education-select][data-id="'+wrong+'"]').focus();await page.keyboard.press('Space');
  assert.equal(await page.locator('[data-action=education-select][data-id="'+wrong+'"]').getAttribute('aria-pressed'),'true');
  await page.locator('[data-action=education-check]').evaluate(el=>{el.click();el.click();});
  assert.equal((await state()).educationState.pending.attempts.length,1);assert.match(await page.locator('#education-feedback').innerText(),/Not quite/);await click('education-hint');
  assert.equal(await page.locator('#education-hint p').textContent(),q.hint);await click('home');await click('continue');
  await page.reload();await click('continue');run=await state();assert.equal(run.educationState.pending.questionId,q.id);assert.deepEqual(run.educationState.pending.choiceOrder,initial.educationState.pending.choiceOrder);assert.equal(run.educationState.pending.hinted,true);assert.equal(run.hp,initial.hp);assert.equal(run.gold,80);assert.ok(E.validate(run));await shot('trial-hint');
  await page.locator('[data-action=education-select][data-id="'+q.correctChoiceId+'"]').click();await click('education-check');
  assert.match(await page.locator('#education-feedback').innerText(),/Correct/);assert.ok((await page.locator('#education-feedback').textContent()).includes(q.explanation));assert.equal((await state()).gold,80);
  await page.reload();await click('continue');assert.equal((await state()).educationState.pending.solved,true);await shot('trial-solved');
  await page.locator('[data-action=education-continue]').evaluate(el=>{el.click();el.click();});assert.equal((await state()).scene,'map');assert.equal((await state()).gold,105);assert.deepEqual((await state()).artifactState.owned,[A.id('s09')]);await page.reload();await click('continue');assert.equal((await state()).gold,105);
  report.checks.push('Keyboard answers, incorrect choice, Hint, Menu/Continue, refresh, correct explanation and solved-state refresh work; the final claim grants exactly 25 Gold once without an HP penalty');

  for(const [width,height]of [[1920,1080],[1280,720],[844,390],[390,844],[320,740],[3840,2160]]){
   await page.setViewportSize({width,height});await restore(question('LOGIC-037'));
   const geometry=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,answers:[...document.querySelectorAll('.education-answer')].map(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,height:r.height};}),images:[...document.querySelectorAll('.education-encounter img')].every(im=>im.complete&&im.naturalWidth>0),scrollHeight:document.documentElement.scrollHeight}));
   assert.equal(geometry.overflow,false,JSON.stringify({width,geometry}));assert.equal(geometry.answers.length,4);for(const box of geometry.answers)assert.ok(box.left>=0&&box.right<=width&&box.height>=44,JSON.stringify({width,box}));assert.equal(geometry.images,true);
   await shot('trial-'+width);report.viewports.push({width,height,...geometry});
   await completeBrowserTrial(page);assert.equal((await state()).scene,'map');assert.ok(E.validate(await state()));
  }
  report.checks.push('Six actual viewport sizes from 320px to 4K: full questions and four native answer targets fit, artwork decodes, document scrolling remains usable and the trial reaches the map');

  await page.setViewportSize({width:1280,height:900});
  for(const id of ['PROB-035','SET-038','LOGIC-040']){
   const r=question(id);await restore(r);assert.equal(await page.locator('[data-question-id]').getAttribute('data-question-id'),id);assert.equal(await page.locator('#education-prompt').textContent(),Q.catalog[id].prompt);await shot('topic-'+id);await completeBrowserTrial(page);report.topics.push(id);
  }
  report.checks.push('Probability, Sets and Logic display the original prompts/options and resolve their original exact answer keys');

  // Isolated QA fixture: start an empty profile, then abandon ten shown trials normally.
  await page.evaluate(()=>{localStorage.removeItem('duel-cube-question-history.v1');localStorage.removeItem('duel-cube-math.v1');});await page.reload();const seen=new Set();
  for(let i=0;i<10;i++){
   if(i){await click('home');await click('new');await click('start-new');}else await click('new');
   await click('start-challenge');await page.locator('[data-action=select-artifact]').first().click();await click('claim-artifact');const id=(await state()).educationState.pending.questionId;assert.ok(!seen.has(id));seen.add(id);
   const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-question-history.v1')));assert.equal(saved.usedIds.length,i+1);
   if(i===4){await page.reload();await click('continue');assert.equal((await state()).educationState.pending.questionId,id);}
  }
  report.checks.push('Ten replaced New Runs and an intervening refresh preserve exposure history: every shown ID is unique, even when its question was never answered');

  const exhausted=E.newRun(77,'challenge');E.chooseArtifact(exhausted,E.artifactChoices(exhausted)[0].id,Q.ids);await restore(exhausted);assert.match(await page.locator('.education-question').innerText(),/all 120/);assert.equal(await page.locator('[data-action=education-select]').count(),0);await click('education-continue');assert.equal((await state()).educationState.usedIds.length,120);assert.equal((await state()).scene,'map');
  report.checks.push('Exhaustion is explicit: no question is repeated or silently recycled, and the journey remains playable');

  const offline=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),requests=[];
  offline.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});offline.on('pageerror',e=>report.errors.push(e.message));
  await offline.goto('file://'+path.join(__dirname,'../MAIN-SEKARANG.html'));await offline.locator('[data-action=new]').click();await offline.locator('[data-action=start-challenge]').click();await offline.locator('[data-action=select-artifact]').first().click();await offline.locator('[data-action=claim-artifact]').click();
  assert.equal(await offline.locator('[data-action=education-select]').count(),4);await offline.locator('.artifact-scene-art img').evaluate(im=>im.decode());assert.equal(await offline.evaluate(()=>window.DCEducation.bank.questions.length),120);await completeBrowserTrial(offline);assert.equal(await offline.locator('.map-rail').count(),1);await offline.locator('.dungeon-room.available').first().click();assert.deepEqual(requests,[]);await offline.close();
  report.checks.push('Unmodified offline HTML embeds all 120 questions and the supplied Master artwork; Claim, answer, effect, map and room entry work with zero HTTP requests');
  assert.deepEqual(report.errors,[]);console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();server?.kill();}
})().catch(e=>{server?.kill();console.error(e);process.exitCode=1;});
