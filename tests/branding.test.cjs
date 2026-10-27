'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {JSDOM,VirtualConsole}=require(process.env.DOM_QA_MODULE||'jsdom');
const root=path.resolve(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
const name='Mathematics Slayer',saveKey='duel-cube-math.v1';
const files=[...read('dist/index.html').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split(/[?#]/)[0]);
function boot(language){
 const dom=new JSDOM(read('dist/index.html'),{url:'https://branding.example/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:new VirtualConsole()}),w=dom.window;
 const saved=require('./helpers/legacy-run.cjs').newRun(7351,'learn');
 w.localStorage.setItem(saveKey,JSON.stringify(saved));
 w.localStorage.setItem('slay-the-math.question-language.v1',language);
 w.localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true,voiceMuted:true}));
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
 w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 const blobs=[],downloads=[];
 w.URL.createObjectURL=blob=>{blobs.push(blob);return 'blob:branding-'+blobs.length;};w.URL.revokeObjectURL=()=>{};
 w.HTMLAnchorElement.prototype.click=function(){downloads.push({filename:this.download,blob:blobs.at(-1)});};
 for(const file of files)w.eval(read('dist/'+file));
 const click=selector=>{const el=w.document.querySelector(selector);assert.ok(el,selector);assert.equal(el.disabled,false);el.click();};
 return {dom,w,saved,downloads,click,state:()=>JSON.parse(w.localStorage.getItem(saveKey))};
}
function hashFile(file){return new Promise((resolve,reject)=>{const hash=crypto.createHash('sha256'),stream=fs.createReadStream(file);stream.on('data',data=>hash.update(data));stream.on('error',reject);stream.on('end',()=>resolve(hash.digest('hex')));});}
function blobText(w,blob){return new Promise((resolve,reject)=>{const reader=new w.FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsText(blob);});}
test('current launchers and loading/Practice pages expose the approved game name',()=>{
 for(const file of ['dist/index.html','index.html','MAIN-SEKARANG.html']){
  const dom=new JSDOM(read(file));try{assert.equal(dom.window.document.title,name);assert.equal(dom.window.document.querySelector('#resource-loader small').textContent,'MATHEMATICS SLAYER');assert.match(dom.window.document.querySelector('noscript').textContent,/Mathematics Slayer/);}finally{dom.window.close();}
 }
 const practice=new JSDOM(read('modules/mechanics/source/QUESTION_BANK/learning/preview.html'));
 try{assert.equal(practice.window.document.title,name+' — The Question Folio');assert.match(practice.window.document.querySelector('.page-footnote').textContent,/Mathematics Slayer/);}finally{practice.window.close();}
});
test('the new portable filename and the retained old file URL contain identical current releases',async()=>{
 const canonical=path.join(root,'MATHEMATICS-SLAYER-OFFLINE.html'),legacy=path.join(root,'SLAY-THE-MATH-OFFLINE.html');
 assert.ok(fs.statSync(canonical).size>1000000);assert.equal(fs.statSync(canonical).size,fs.statSync(legacy).size);
 assert.equal(await hashFile(canonical),await hashFile(legacy));
 const fd=fs.openSync(canonical,'r'),prefix=Buffer.alloc(2048);try{fs.readSync(fd,prefix,0,prefix.length,0);assert.match(prefix.toString(),/<title>Mathematics Slayer<\/title>/);}finally{fs.closeSync(fd);}
});
test('both languages show the new name while resuming the exact legacy deck and RNG',()=>{
 for(const language of ['en','ms']){
  const {dom,w,saved,click,state}=boot(language);
  try{
   assert.equal(w.document.title,name);assert.equal(w.document.querySelector('.home-title h1').textContent.replace(/\s+/g,' ').trim(),name);
   assert.equal(w.document.querySelector('.home-subtitle'),null);assert.equal(w.document.querySelector('[data-action=continue]').disabled,false);
   assert.deepEqual(state(),saved);click('[data-action=continue]');
   assert.equal(w.document.querySelector('.brand').getAttribute('aria-label'),name+(language==='ms'?', Menu utama':', Main Menu'));
   assert.ok(w.document.title.endsWith(' · '+name));assert.deepEqual(state(),saved);assert.equal(state().deck.length,12);
   assert.equal(Object.keys(w.localStorage).some(key=>/mathematics[- ]slayer/i.test(key)),false);
  }finally{dom.window.close();}
 }
});
test('real Save and Learning Backup exports use new labels without changing save/schema identity',async()=>{
 const {dom,w,saved,click,state,downloads}=boot('en');
 try{
  click('.main-menu-actions [data-action=saves]');click('#dialog [data-action=export]');
  assert.equal(downloads.length,1);assert.equal(downloads[0].filename,'mathematics-slayer-save.json');
  assert.deepEqual(JSON.parse(await blobText(w,downloads[0].blob)),saved);
  click('#dialog [data-action=close]');click('.main-menu-actions [data-action=analytics]');
  click('#dialog [data-analytics-action=export][data-exportformat=json]');
  assert.equal(downloads.length,2);assert.equal(downloads[1].filename,'mathematics-slayer-learning-backup.json');
  const backup=JSON.parse(await blobText(w,downloads[1].blob));assert.equal(backup.schemaVersion,1);assert.equal(backup.game,name);assert.equal(backup.analytics.schemaVersion,1);assert.equal(backup.analytics.game,name);
  assert.deepEqual(state(),saved);assert.equal(Object.keys(w.localStorage).some(key=>/mathematics[- ]slayer/i.test(key)),false);
 }finally{dom.window.close();}
});
