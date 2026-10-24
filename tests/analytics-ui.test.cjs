const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom');
const F=require('../tools/dev/fixtures.js'),bank=require('../dist/question-data.js');
const dir=path.join(__dirname,'../dist'),key='slay-the-math.learning-analytics.v1';
function boot(run,storage={},options={}){
 const html=fs.readFileSync(path.join(dir,'index.html'),'utf8'),dom=new JSDOM(html,{url:'https://learning.example/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,d=w.document;
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 for(const [k,v]of Object.entries(storage))w.localStorage.setItem(k,v);
 if(run)w.localStorage.setItem('duel-cube-math.v1',JSON.stringify(run));
 w.localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true,voiceMuted:true}));
 const requests=[];w.fetch=async(...args)=>{requests.push(args);throw new Error('offline test');};
 for(const m of html.matchAll(/<script src="([^"]+)"/g)){
  const name=m[1].split('?')[0];
  if(name==='app.js'&&options.throwQueue){const create=w.DCLearningSync.createClient;w.DCLearningSync.createClient=(...args)=>{const client=create(...args);client.enqueue=()=>{throw Error('The education entry is too large.');};return client;};}
  w.eval(fs.readFileSync(path.join(dir,name),'utf8'));
  if(name==='learning-collection-config.js'&&options.siteURL)w.DCLearningCollectionConfig={googleScriptUrl:options.siteURL};
 }
 const click=s=>{const el=d.querySelector(s);assert.ok(el,s);assert.equal(el.disabled,false,s);el.click();};
 return{dom,w,d,click,requests,state:()=>JSON.parse(w.localStorage.getItem('duel-cube-math.v1')),snapshot:()=>Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)]))};
}
test('Learning Report is available from Main Menu and Settings without an active run',()=>{
 const b=boot();try{
  b.click('.main-menu-actions [data-action=analytics]');assert.equal(b.d.querySelector('#dialog-title').textContent,'Learning Report');
  assert.equal(b.d.querySelector('[data-analytics-metric=answered]').textContent,'0');
  assert.match(b.d.querySelector('.learning-report').textContent,/Not assessed|No answers/i);
  assert.equal(b.d.querySelector('[data-analytics-action=share]').getAttribute('aria-pressed'),'false');
  assert.equal(b.requests.length,0,'local report must not contact an unconfigured server');
  b.click('#dialog [data-action=close]');b.click('[data-action=saves]');b.click('#dialog [data-action=analytics]');
  assert.ok(b.d.querySelector('.learning-report'));
 }finally{b.dom.window.close();}
});
test('Real Predict wrong/Hint/retry is captured once, survives reload, and report controls preserve gameplay',()=>{
 let b=boot(F.create({kind:'combat'}));try{
  b.click('[data-action=continue]');b.click('[data-action=forecast]');
  const q=bank.questions.find(q=>q.id===b.state().battle.question.questionId),wrong=q.choices.find(c=>c.id!==q.correctChoiceId).id;
  b.click('[data-action=forecast-select][data-id="'+wrong+'"]');b.click('[data-action=forecast-check]');
  b.click('[data-action=forecast-support][data-kind=hint]');
  b.click('[data-action=forecast-select][data-id="'+q.correctChoiceId+'"]');b.click('[data-action=forecast-check]');
  b.click('#dialog [data-action=close]');b.click('[data-action=home]');
  const before=b.w.localStorage.getItem('duel-cube-math.v1');b.click('[data-action=analytics]');
  const metrics=()=>Object.fromEntries([...b.d.querySelectorAll('[data-analytics-metric]')].map(e=>[e.dataset.analyticsMetric,e.textContent]));
  assert.equal(metrics().answered,'1');assert.equal(metrics().wrongAttempts,'1');assert.equal(metrics().independentFirstTry,'0');
  assert.match(b.d.querySelector('.learning-report').textContent,/Not enough evidence|At least 3/i);
  const source=b.d.querySelector('[data-analytics-scope]');source.value='gameplay';source.dispatchEvent(new b.w.Event('change',{bubbles:true}));
  assert.equal(metrics().answered,'1');assert.equal(b.w.localStorage.getItem('duel-cube-math.v1'),before);
  const saved=b.snapshot();b.dom.window.close();b=boot(null,saved);b.click('[data-action=analytics]');
  assert.equal(b.d.querySelector('[data-analytics-metric=answered]').textContent,'1');
  const store=b.w.DCAnalytics.createStore({storage:b.w.localStorage,bank:b.w.STMMechanics.data.bank,curriculum:b.w.DCLearningCurriculum});
  assert.equal(store.records().filter(r=>r.scope==='gameplay').length,1);
  assert.equal(store.records()[0].record.attempts.length,2);
  assert.equal(b.requests.length,0);
 }finally{b.dom.window.close();}
});
test('Report language follows Settings and changes neither pending question nor RNG',()=>{
 const b=boot(F.create({kind:'combat'}));try{
  b.click('[data-action=continue]');b.click('[data-action=forecast]');b.click('#dialog [data-action=close]');
  b.click('[data-action=saves]');const before=b.state();
  const select=b.d.querySelector('#settings-question-language-select');select.value='ms';select.dispatchEvent(new b.w.Event('change',{bubbles:true}));
  b.click('#dialog [data-action=analytics]');
  assert.equal(b.d.querySelector('#dialog-title').textContent,'Laporan Pembelajaran');
  assert.match(b.d.querySelector('.learning-report').textContent,/Penaakulan Logik|Operasi Set|Kebarangkalian/);
  assert.equal(b.state().rng,before.rng);assert.deepEqual(b.state().educationState,before.educationState);
 }finally{b.dom.window.close();}
});
test('Shared report escapes stored content and explains sparse evidence without a fabricated score',()=>{
 const UI=require('../dist/analytics-ui.js');
 const report={scope:'all',minimumEvidence:3,totals:{answered:0},topics:[{id:'SET',label:'<img src=x onerror=alert(1)>',answered:0,distinctAnswered:0,status:'not-assessed'}],contentStandards:[],learningStandards:[],skills:[],sessions:[],recommendations:[],questions:[]};
 const d=new JSDOM(UI.html({report,status:{enabled:false,pending:0,state:'on-device'},language:'en'})).window.document;
 assert.equal(d.querySelector('img'),null);assert.ok(d.body.textContent.includes('<img src=x onerror=alert(1)>'));
 assert.match(d.body.textContent,/No answers|Not assessed/i);assert.doesNotMatch(d.body.textContent,/NaN|Infinity|100%/);
 const status=new JSDOM(UI.syncHTML({enabled:true,pending:2,state:'offline'},'ms')).window.document;
 assert.match(status.body.textContent,/2/);assert.match(status.body.textContent,/peranti|talian/i);
});
test('one JSON backup contains durable records and owner recovery without exposing sync credentials',async()=>{
 const b=boot(F.create({kind:'combat'}));try{
  b.click('[data-action=continue]');b.click('[data-action=forecast]');b.click('#dialog [data-action=close]');b.click('[data-action=home]');b.click('[data-action=analytics]');
  b.click('[data-analytics-action=share]');
  const secret=JSON.parse(b.w.localStorage.getItem('slay-the-math.learning-sync.v1')).identity.secret;
  const downloads=[];b.w.URL.createObjectURL=blob=>{downloads.push(blob);return 'blob:learning';};b.w.URL.revokeObjectURL=()=>{};b.w.HTMLAnchorElement.prototype.click=function(){};
  b.click('[data-analytics-action=export][data-exportformat=json]');assert.equal(b.d.querySelector('[data-exportformat=csv]'),null);
  assert.equal(downloads.length,1);assert.equal(downloads[0].type,'application/json');
  const content=await new Promise((resolve,reject)=>{const reader=new b.w.FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsText(downloads[0]);});
  const exported=JSON.parse(content);assert.ok(exported.analytics.records.length);assert.ok(exported.ownerRecovery.session.records);assert.equal(exported.ownerRecovery.scope,'gameplay');assert.ok(!content.includes(secret));assert.equal(Object.hasOwn(exported,'identity'),false);
  assert.ok(b.w.localStorage.getItem(key));
 }finally{b.dom.window.close();}
});
test('Retry retains one learning occurrence across its changed start time and a browser reload',()=>{
 const E=require('../dist/engine.js'),Q=require('../dist/education.js'),r=E.newRun(957,'challenge');
 E.chooseArtifact(r,E.artifactChoices(r)[0].id);const q=Q.current(r);E.selectEducation(r,q.correctChoiceId);E.answerEducation(r);E.continueEducation(r);E.enterNode(r,E.availableNodes(r)[0].id);r.hp=0;r.scene='defeat';r.finished=Date.now();assert.ok(E.validate(r));
 let b=boot(r);try{
  b.click('[data-action=continue]');b.click('[data-action=retry]');b.click('[data-action=confirm-retry]');
  assert.notEqual(b.state().started,r.started,'fixture must exercise newRun retry branch');
  b.click('[data-action=home]');b.click('[data-action=analytics]');
  assert.equal(b.d.querySelector('[data-analytics-metric=answered]').textContent,'1');
  const saved=b.snapshot();b.dom.window.close();b=boot(null,saved);b.click('[data-action=analytics]');
  assert.equal(b.d.querySelector('[data-analytics-metric=answered]').textContent,'1');
 }finally{b.dom.window.close();}
});
test('Report sharing updates preserve keyboard focus on the replacement consent control',()=>{
 const b=boot();try{
  b.click('[data-action=analytics]');const trigger=b.d.querySelector('[data-analytics-action=share]');trigger.focus();trigger.click();
  assert.equal(b.d.activeElement?.dataset.analyticsAction,'share');assert.equal(b.d.activeElement?.getAttribute('aria-pressed'),'true');
 }finally{b.dom.window.close();}
});

test('host journal views, source filter and question search survive asynchronous sending updates',()=>{
 const b=boot(F.create({kind:'combat'}));try{
  b.click('[data-action=analytics]');b.click('[data-analytics-action=view][data-view=details]');
  assert.equal(b.d.querySelector('[data-analytics-panel=details]').hidden,false);
  const source=b.d.querySelector('[data-analytics-scope]');source.value='review';source.dispatchEvent(new b.w.Event('change',{bubbles:true}));
  assert.equal(b.d.querySelector('.learning-report').dataset.view,'details');assert.equal(b.d.querySelector('[data-analytics-scope]').value,'review');
  const filter=b.d.querySelector('[data-analytics-question-filter]');filter.value='all';filter.dispatchEvent(new b.w.Event('change',{bubbles:true}));
  const search=b.d.querySelector('[data-analytics-search]');search.value='SET-';search.focus();search.dispatchEvent(new b.w.Event('input',{bubbles:true}));
  assert.equal(b.d.querySelectorAll('[data-analytics-question]:not([hidden])').length,40);
  const before=b.w.localStorage.getItem('duel-cube-math.v1');b.w.dispatchEvent(new b.w.StorageEvent('storage',{key:'slay-the-math.learning-sync.v1'}));
  assert.equal(b.d.activeElement,search);assert.equal(search.value,'SET-');assert.equal(b.d.querySelector('.learning-report').dataset.view,'details');assert.equal(b.w.localStorage.getItem('duel-cube-math.v1'),before);assert.equal(b.requests.length,0);
 }finally{b.dom.window.close();}
});
test('A failed analytics enqueue cannot prevent a correct answer and run progress from saving',()=>{
 const b=boot(F.create({kind:'combat'}),{},{throwQueue:true});try{
  b.click('[data-action=continue]');b.click('[data-action=forecast]');
  assert.ok(b.state().battle.question,'question reservation must still persist');
  const q=bank.questions.find(q=>q.id===b.state().battle.question.questionId);
  b.click('[data-action=forecast-select][data-id="'+q.correctChoiceId+'"]');b.click('[data-action=forecast-check]');
  const row=b.state().educationState.session.records[q.id];assert.equal(row.status,'correct');assert.equal(row.attempts.length,1);
  assert.match(b.d.querySelector('#storage-warning').textContent,/Learning|learning/i);
 }finally{b.dom.window.close();}
});
test('A restored older run is observed through confirmed current-run receipts without importing lifetime-only records',()=>{
 const fixture=require('./fixtures/education-v1_4-pending.json'),b=boot(fixture);try{
  const before=b.state().educationState;b.click('[data-action=analytics]');
  assert.equal(b.d.querySelector('[data-analytics-metric=answered]').textContent,'1');
  assert.equal(b.d.querySelector('[data-analytics-metric=wrongAttempts]').textContent,'1');
  assert.deepEqual(b.state().educationState,before,'read-only observation cannot migrate the run');
 }finally{b.dom.window.close();}
});
test('Main Menu report warns about unreadable learning storage even with no active run',()=>{
 const original='{keep-unreadable-learning',b=boot(null,{[key]:original});try{
  b.click('[data-action=analytics]');assert.equal(b.d.querySelector('[data-analytics-delivery-state]').dataset.analyticsDeliveryState,'save-error');assert.ok(b.d.querySelector('[data-analytics-action=export]'));
  assert.equal(b.w.localStorage.getItem(key),original);
 }finally{b.dom.window.close();}
});

test('host preserves an existing Google destination while keeping its address out of player controls',()=>{
 const url='https://script.google.com/macros/s/DEPLOYMENT1234567890/exec';
 const b=boot(null,{'slay-the-math.learning-destination.v1':JSON.stringify({schemaVersion:1,googleScriptUrl:url})});try{
  b.click('[data-action=analytics]');assert.equal(b.d.querySelector('[data-analytics-google-url]'),null);assert.equal(b.d.querySelector('.learning-report').innerHTML.includes(url),false);assert.equal(JSON.parse(b.w.localStorage.getItem('slay-the-math.learning-destination.v1')).googleScriptUrl,url);assert.equal(b.d.querySelector('[data-analytics-action=share]').getAttribute('aria-pressed'),'false');assert.equal(b.d.querySelector('iframe[title="Education collection"]'),null);assert.equal(b.requests.length,0);
 }finally{b.w.close();}
});
