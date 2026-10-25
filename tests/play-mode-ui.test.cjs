'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom');
test('one Settings mode group controls pet permission and begins offline preparation without changing saves',async()=>{
 const file=path.join(__dirname,'../dist/play-mode-ui.js');assert.ok(fs.existsSync(file),'Settings must expose one mode control');
 const dom=new JSDOM('<body><main></main></body>',{url:'https://settings.example/game/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 try{w.localStorage.setItem('duel-cube-math.v1','unchanged');w.eval(fs.readFileSync(path.join(__dirname,'../dist/play-mode.js'),'utf8'));w.eval(fs.readFileSync(path.join(__dirname,'../dist/pet-help.js'),'utf8'));let installs=0;
 w.STMHosted={offline:{install:async()=>{installs++;},pause(){},snapshot:()=>({phase:'partial',ready:false,totalFiles:5,verifiedFiles:2,totalBytes:100,verifiedBytes:20,remainingBytes:80,percent:20,failures:[]})}};
 w.eval(fs.readFileSync(file,'utf8'));w.document.querySelector('main').innerHTML=w.STMPlayModeUI.settingsHTML();w.STMPlayModeUI.refresh();
 assert.equal(w.document.querySelectorAll('[name=stm-play-mode]').length,2);assert.equal(w.STMPlayMode.canUsePetAPI(),false);
 w.document.querySelector('[data-stm-mode=online]').click();assert.equal(w.STMPlayMode.canUsePetAPI(),true,'Clicking the already-selected default explicitly permits Online');
 w.document.querySelector('[data-stm-mode=offline]').click();await Promise.resolve();assert.equal(w.STMPlayMode.snapshot().mode,'offline');assert.equal(installs,1);
 w.document.querySelector('[data-stm-mode=online]').click();assert.equal(w.STMPlayMode.canUsePetAPI(),true);assert.equal(w.localStorage.getItem('duel-cube-math.v1'),'unchanged');
 let release;w.STMPetHelp.setTransport(()=>new Promise(r=>release=r));w.document.getElementById('stm-pet-question').value='Block';w.document.querySelector('[data-stm-pet-ask]').click();await Promise.resolve();await Promise.resolve();assert.match(w.document.getElementById('stm-pet-answer').textContent,/Preparing/);w.document.querySelector('[data-stm-mode=offline]').click();assert.doesNotMatch(w.document.getElementById('stm-pet-answer').textContent,/Preparing/);assert.equal(w.document.getElementById('stm-pet-answer').dataset.source,'local');release?.({answer:'stale remote reply'});
 }finally{w.close();}
});
