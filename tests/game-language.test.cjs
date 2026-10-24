const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const file=path.resolve(__dirname,'../dist/game-language.js');
const {JSDOM,VirtualConsole}=require(process.env.DOM_QA_MODULE||'jsdom');
test('loading shell uses the existing language preference before question code loads',()=>{
 const dom=new JSDOM('<body><h1>Preparing your dungeon</h1><button>Enter Game</button></body>',{url:'https://language.example/'}),w=dom.window;
 try{
  const service=require(file),key=require('../dist/question-language.js').key;
  assert.equal(service.data.preferenceKey,key);w.localStorage.setItem(key,'ms');
  const L=service.create(service.data,w),owner=L.install(w.document);
  assert.equal(w.document.documentElement.lang,'ms');assert.equal(w.document.querySelector('button').textContent,'Masuk game');
  assert.equal(L.translate('27 / 80 files · 3.2 / 9.7 MB','ms'),'27 / 80 fail · 3.2 / 9.7 MB');
  w.localStorage.setItem(key,'en');owner.refresh();assert.equal(w.document.querySelector('button').textContent,'Enter Game');owner.destroy();
 }finally{w.close();}
});
test('global UI supports simple BM while preserving established game terms and identity',()=>{
 assert.ok(fs.existsSync(file),'whole-game language module is missing');
 const L=require(file);
 assert.equal(L.translate('New Run','ms'),'Permainan baharu');
 assert.equal(L.translate('Save and Settings','ms'),'Simpanan dan tetapan');
 for(const word of ['HP','Energy','Block','Focus','Strength','Agility','Defense','Buff','Debuff','Slay the Math','Dungeon of Chance'])assert.equal(L.translate(word,'ms'),word);
 assert.equal(L.translate('New Run','en'),'New Run');
 assert.equal(L.normalize('bm'),'ms');assert.equal(L.normalize('bi'),'en');
 assert.equal(L.translate('Stage 2 · Room 9 · Turn 3','ms'),'Peringkat 2 · Bilik 9 · Giliran 3');
});
test('retained combat DOM keeps actors and restores the latest English after language changes',()=>{
 const dom=new JSDOM('<body><main></main></body>',{url:'https://language.example/',runScripts:'outside-only'}),w=dom.window;
 try{
  let lang='ms';w.DCQuestionLanguage={language:()=>lang};w.eval(fs.readFileSync(path.resolve(__dirname,'../dist/dom-patch.js'),'utf8'));
  const root=w.document.querySelector('main'),paint=n=>w.DCDomPatch.patch(root,'<section data-render-key="combat"><canvas class="actor-animation" data-actor="mc_01"></canvas><p>Turn '+n+'</p></section>');
  paint(1);const canvas=root.querySelector('canvas'),L=require(file).create(require(file).data,w);L.apply(root);assert.equal(root.querySelector('p').textContent,'Giliran 1');
  paint(2);L.apply(root);assert.equal(root.querySelector('canvas'),canvas);assert.equal(root.querySelector('p').textContent,'Giliran 2');
  lang='en';L.refresh(w.document);assert.equal(root.querySelector('p').textContent,'Turn 2');assert.equal(root.querySelector('canvas'),canvas);
 }finally{w.close();}
});
test('all current Artifact descriptions preserve every number and term binding in BM',()=>{
 const L=require(file),D=require('../dist/rich-text-data.js'),M=require('../dist/mechanics.js');
 const numbers=text=>(text.match(/(?<![A-Za-z0-9])\d+(?:\.\d+)?/g)||[]).sort();
 assert.equal(Object.keys(L.data.artifactTemplates).length,31);
 for(const [id,a]of Object.entries(D.artifacts)){
  const en=a.segments.map(s=>s.text).join(''),parts=L.artifactParts(id,en,'ms');assert.ok(parts,id);
  assert.deepEqual(numbers(parts.map(s=>s.text).join('')),numbers(en),id+' amounts');
  for(const part of parts)if(part.term)assert.ok(D.glossary[part.term],part.term);
  assert.equal(L.artifactParts(id,en,'en'),null);
 }
 for(const [id,entry]of Object.entries(M.data.artifact.glossary)){
  const model=M.shared.describeTerm('artifact',id,'ms');assert.ok(model.definition);assert.notEqual(model.definition,entry.definition,id+' must have a reviewed BM definition');
 }
 assert.doesNotMatch(D.glossary.passive.definition,/no Passive cards/);
 assert.doesNotMatch(M.data.artifact.artifacts.find(a=>a.id==='s04_clairvoyance_lens').example_snapshot.context,/pending|confirmed/i);
});
test('current card localization changes presentation only and protects authored BM card names',()=>{
 const source=require('../modules/cards/source/data/card-data.js'),adapt=require('../tools/cards/language.cjs');
 const current=require('../tools/cards/effects.cjs')(require('../tools/cards/single-target.cjs')(source)),before=JSON.stringify(current),out=adapt(current);
 for(let i=0;i<out.cards.length;i++){
  const mechanics=({text,mechanic_notes,...rest})=>rest;
  assert.deepEqual(mechanics(out.cards[i]),mechanics(current.cards[i]));
 }
 assert.equal(JSON.stringify(current),before);
 assert.equal(adapt.terms('Kekal Bertahan memberi Blok',['Kekal Bertahan']),'Kekal Bertahan memberi Block');
 for(const id of ['attack','defend','skill','passive','block','focus','energy','weak','vulnerable'])assert.equal(out.glossary[id].label.bm,out.glossary[id].label.en);
});
test('generated card presentation preserves punctuation and game words inside a BM card name',()=>{
 const vm=require('node:vm'),data=JSON.parse(JSON.stringify(require('../dist/card-data.js'))),name='Kekal (Bertahan) Asal';
 data.cards[0].display_name.bm=name;const box={STMCardData:data};
 vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../dist/card-kit.js'),'utf8'),box);
 assert.equal(box.STMCardKit.cardNotes({mechanic_notes:{bm:name+' memberi Blok.'}},'ms'),name+' memberi Block.');
});
test('late UI and explicit tutorial language scopes translate without touching model payloads',async()=>{
 const dom=new JSDOM('<body><div id="target"></div><section data-language-scope lang="en"><button>New Run</button></section><textarea>New Run</textarea></body>',{url:'https://language.example/'}),w=dom.window;
 try{
  w.DCQuestionLanguage={language:()=> 'ms',key:'language'};const L=require(file).create(require(file).data,w),c=L.install(w.document);
  const b=w.document.createElement('button');b.dataset.action='confirm';b.dataset.payload='{"label":"New Run","value":7}';b.textContent='New Run';w.document.getElementById('target').append(b);
  const picture=w.document.createElement('img');picture.alt='New Run';picture.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';w.document.getElementById('target').append(picture);
  await Promise.resolve();await Promise.resolve();assert.equal(b.textContent,'Permainan baharu');assert.equal(b.dataset.payload,'{"label":"New Run","value":7}');assert.equal(w.document.querySelector('section button').textContent,'New Run');
  assert.equal(picture.alt,'Permainan baharu');
  w.DCQuestionLanguage.language=()=> 'en';c.refresh();assert.equal(b.textContent,'New Run');assert.equal(w.document.querySelector('textarea').value,'New Run');c.destroy();
 }finally{w.close();}
});
function boot(saved,profile){
 const root=path.resolve(__dirname,'../dist'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const dom=new JSDOM(html,{url:'https://language.example/'+(profile?'?balance='+profile:''),runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:new VirtualConsole()}),w=dom.window,d=w.document;
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 w.localStorage.setItem('duel-cube-math.v1',JSON.stringify(saved));w.localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true,voiceMuted:true}));
 for(const m of html.matchAll(/<script src="([^"?]+)(?:\?[^"]*)?"/g))w.eval(fs.readFileSync(path.join(root,m[1]),'utf8'));
 const click=a=>{const el=d.querySelector('[data-action="'+a+'"]');assert.ok(el,a);assert.ok(!el.disabled,a);el.click();};if(!profile)click('continue');
 const state=()=>JSON.parse(w.localStorage.getItem('duel-cube-math.v1'));
 const change=lang=>{click('saves');const el=d.getElementById('settings-question-language-select');el.value=lang;el.dispatchEvent(new w.Event('change',{bubbles:true}));click('close');};
 return {w,d,state,change,close:()=>w.close()};
}
test('Settings language flips preserve question attempts/feedback and Mystery deadline, choices and RNG',()=>{
 const E=require('../dist/engine.js'),Q=require('../dist/education.js');
 const education=E.newRun(73,'challenge');E.chooseArtifact(education,E.artifactChoices(education)[0].id);E.selectEducation(education,Q.current(education).choices.find(c=>c.id!==Q.current(education).correctChoiceId).id);E.answerEducation(education);E.hintEducation(education);
 const mystery=require('./helpers/mystery.cjs').mysteryRoom('ME14','challenge');E.startMystery(mystery);
 for(const run of [education,mystery]){
  const b=boot(run);try{const before=b.state();b.change('ms');assert.equal(b.d.documentElement.lang,'ms');b.change('en');const after=b.state();
   for(const key of ['rng','hp','maxHp','gold','deck','battle','artifactState','mysteryState','educationState','stats'])assert.deepEqual(after[key],before[key],key);
   assert.ok(E.restore(after));
  }finally{b.close();}
 }
});
test('deck categories say Defend while Defense remains an attribute',()=>{
 const E=require('../dist/engine.js'),r=require('./helpers/legacy-run.cjs').newRun(81,'learn');delete r.route;E.startBattle(r,'wisp');const b=boot(r);
 try{const before=b.state();b.d.querySelector('[data-action="deck"]').click();const counts=b.d.querySelector('#dialog .source-counts').textContent;assert.match(counts,/\d+ Defend/);assert.doesNotMatch(counts,/\d+ Defense/);assert.deepEqual(b.state(),before);}finally{b.close();}
});
test('composed combat receipts retain every number and become stable BM text',()=>{
 const L=require(file),en='Energy −1; Focus −1; 7 enemy HP damage; 2 cards to Hand; 1 discarded; Exhaust.',ms=L.translate(en,'ms');
 assert.match(ms,/HP musuh berkurang 7/);assert.match(ms,/2 kad masuk ke Hand/);assert.match(ms,/1 kad masuk ke Discard/);
 assert.deepEqual(ms.match(/\d+/g),en.match(/\d+/g));assert.equal(L.translate(ms,'ms'),ms);assert.equal(L.translate(en,'en'),en);
 assert.equal(L.translate('Unknown card. Not enough Gold.','ms'),'Kad tidak dikenal pasti. Gold tidak cukup.');
});
test('all three Master profiles preserve all 31 current Artifact amounts in BM',()=>{
 const numbers=text=>(text.match(/(?<![A-Za-z0-9])\d+(?:\.\d+)?/g)||[]).sort();
 for(const profile of ['easy','medium','hard']){
  const b=boot(null,profile);try{b.w.DCQuestionLanguage.setLanguage('ms');
   for(const [id,a]of Object.entries(b.w.DCRichTextData.artifacts)){
    const en=a.segments.map(s=>s.text).join(''),parts=b.w.DCGameLanguage.artifactParts(id,en,'ms');assert.ok(parts,profile+' '+id);
    const ms=parts.map(s=>s.text).join('');assert.notEqual(ms,en);assert.deepEqual(numbers(ms),numbers(en),profile+' '+id);
   }
  }finally{b.close();}
 }
});
test('language presentation can return to English without touching user input or IDs',()=>{
 assert.ok(fs.existsSync(file),'whole-game language module is missing');
 const {JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom'),L=require(file);
 const dom=new JSDOM('<body><button data-action="new" title="Start a New Run">New Run</button><textarea>New Run</textarea><span data-no-translate>New Run</span><math><mi>p</mi></math></body>');
 try{const before=dom.window.document.querySelector('button').dataset.action;L.apply(dom.window.document.body,'ms');assert.equal(dom.window.document.querySelector('button').textContent,'Permainan baharu');assert.equal(dom.window.document.querySelector('textarea').value,'New Run');assert.equal(dom.window.document.querySelector('[data-no-translate]').textContent,'New Run');assert.equal(dom.window.document.querySelector('button').dataset.action,before);L.apply(dom.window.document.body,'en');assert.equal(dom.window.document.querySelector('button').textContent,'New Run');}finally{dom.window.close();}
});
test('authored question labels remain under the question language owner',()=>{
 const L=require(file),dom=new JSDOM('<body><p data-q-rich="prompt">Fire</p><span>Fire</span></body>');
 try{L.apply(dom.window.document.body,'ms');assert.equal(dom.window.document.querySelector('[data-q-rich]').textContent,'Fire');assert.equal(dom.window.document.querySelector('span').textContent,'Api');}finally{dom.window.close();}
});
test('literal gameplay errors have BM copy at the shared toast boundary',()=>{
 const L=require(file);let checked=0;
 for(const name of ['engine','card-combat','mystery','artifacts','education','map']){
  const source=fs.readFileSync(path.resolve(__dirname,'../dist/'+name+'.js'),'utf8');
  for(const match of source.matchAll(/throw (?:new )?Error\('([^'\\]+)'\)/g)){
   assert.notEqual(L.translate(match[1],'ms'),match[1],name+': '+match[1]);checked++;
  }
 }
 assert.ok(checked>80,'cover the actual gameplay error owners');
});
test('six original Predict forms localize their prose without changing frozen mathematical data',()=>{
 const MathGame=require('../dist/math.js'),C=require('../dist/config.js'),L=require(file);
 const cards=Object.values(C.cards).filter(c=>!c.packageId).slice(0,10);
 for(const kind of ['single','exclusive','overlap','pairWithout','pairWith','atLeast']){
  const q=MathGame.makeQuestion(cards,kind),before=JSON.stringify(q);
  for(const value of [q.text,q.why,q.label])assert.notEqual(L.translate(value,'ms'),value,kind+': '+value);
  assert.equal(JSON.stringify(q),before);
 }
});
