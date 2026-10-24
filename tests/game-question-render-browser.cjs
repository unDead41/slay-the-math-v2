/* All120 through the actual Artifact question component + canonical owner.
 * Native full-app navigation/focus/timing are covered by game-questions-browser. */
'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),{spawn}=require('node:child_process'),{chromium}=require(process.env.BROWSER_QA_MODULE||'playwright');
const root=path.resolve(__dirname,'..');let browser,server;
(async()=>{try{
 server=spawn(process.execPath,[path.join(root,'server.cjs')],{cwd:root,env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});const origin=await new Promise((resolve,reject)=>{let text='';server.stdout.on('data',d=>{text+=d;const m=text.match(/Game: http:\/\/localhost:(\d+)/);if(m)resolve('http://127.0.0.1:'+m[1]);});server.once('error',reject);});
 const options={headless:true,args:['--no-sandbox','--disable-gpu']};if(process.env.QA_CHROMIUM_MODULE){let c=require(process.env.QA_CHROMIUM_MODULE);c=c.default||c;options.executablePath=await c.executablePath();options.args=[...c.args.filter(a=>a!=='--disable-web-security'),'--no-sandbox','--disable-gpu'];}browser=await chromium.launch(options);
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.text().startsWith('QA render'))console.log(m.text());});
 // The component fixture loads every real dependency/CSS and omits only the app
 // controller, so a Home carousel cannot replace the mounted test component.
 await page.route('**/app.js*',r=>r.fulfill({contentType:'text/javascript',body:'/* component fixture */'}));await page.goto(origin);
 const result=await page.evaluate(async language=>{
  const E=DCEngine,Q=DCEducation,L=DCQuestionLanguage,H=STMMechanicsHost,S=STMMechanics.session;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),button=(label,action,cls='btn',attrs='')=>'<button type="button" class="'+cls+'" data-action="'+action+'" '+attrs+'>'+label+'</button>';
  const check=(value,label)=>{if(!value)throw Error(label);};document.body.dataset.scene='education';L.setLanguage(language);let count=0,states=0;
  for(const q of Q.bank.questions){
   const r=E.newRun(7,'challenge'),state=Q.ensureRunState(r);state.runUsedIds=Q.ids.filter(id=>id!==q.id);state.usedIds=state.runUsedIds.slice();state.session.exposureIds=state.usedIds.slice();E.chooseArtifact(r,r.artifactState.offer.ids[0]);check(Q.current(r).id===q.id,q.id+' reservation');
   const draw=()=>{document.getElementById('game').innerHTML=DCArtifactUI.education(r,{esc,button});H.hydrateEducation(r);const w=document.querySelector('[data-question-workspace]');check(w.scrollWidth<=w.clientWidth+1,q.id+' workspace overflow '+JSON.stringify({size:[w.clientWidth,w.scrollWidth],wide:[...w.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.right>w.getBoundingClientRect().right+1}).slice(0,14).map(e=>({tag:e.tagName,cls:typeof e.className==='string'?e.className:'svg',width:e.getBoundingClientRect().width,text:e.textContent.slice(0,90)}))}));check(document.documentElement.scrollWidth<=innerWidth+1,q.id+' document overflow');check(!/undefined|\[object Object\]|NaN/.test(w.textContent),q.id+' malformed rendered content');states++;};
   draw();check(document.querySelectorAll('[data-action=education-select]').length===4,q.id+' choices');
   const wrong=q.choices.filter(c=>c.id!==q.correctChoiceId);E.selectEducation(r,wrong[0].id);E.answerEducation(r);Q.support(r,'moreHint');E.hintEducation(r);draw();
   check(document.querySelector('#education-hint')&&document.querySelector('#education-more-hint'),q.id+' actual support');check([...document.querySelectorAll('[data-q-visual=hint] td')].every(cell=>!cell.textContent.includes('?')),q.id+' filled hint table');
   for(const svg of document.querySelectorAll('[data-q-visual] svg'))check(svg.querySelector('title')?.textContent===svg.closest('figure').querySelector('h3')?.textContent,q.id+' reference accessible title must not inherit the solved result');
   E.selectEducation(r,wrong[1].id);E.answerEducation(r);Q.support(r,'steps');draw();check(document.querySelectorAll('[data-action=education-select]:not(:disabled)').length===0,q.id+' answer lock');check(document.querySelectorAll('#education-steps li').length===q.learning.workedSteps.length,q.id+' worked steps');check(E.validate(r),q.id+' strict save');
   count++;if(count%20===0)console.log('QA render '+count);await new Promise(resolve=>setTimeout(resolve,0));
  }
  return {questions:count,states,language,viewport:[innerWidth,innerHeight],component:'real DCArtifactUI + STMMechanicsHost; app controller omitted',checks:['All120 question choices and rich text','First-wrong Hint and More Hint with filled given/reference values and safe accessible names','Two-wrong lock and canonical worked steps','No workspace/document horizontal overflow; strict saves'],webSecurityEnabled:true};
 },process.env.QA_LANGUAGE==='en'?'en':'ms');assert.equal(result.questions,120);assert.equal(result.states,360);assert.deepEqual(errors,[]);console.log(JSON.stringify({...result,errors},null,2));
}finally{await browser?.close();server?.kill();}})().catch(e=>{console.error(e);process.exitCode=1;});
