'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom');
const root=path.resolve(__dirname,'..'),Readiness=require(path.join(root,'dist/asset-readiness.js'));
const source=fs.readFileSync(path.join(root,'dist/bootstrap.js'),'utf8');
console.log('bootstrapSHA256 '+crypto.createHash('sha256').update(source).digest('hex'));
const tick=()=>new Promise(r=>setImmediate(r));
async function until(f){for(let i=0;i<100;i++){if(f())return;await tick();}throw Error('Fixture condition did not settle');}
async function fixture(t){
 const ids=['resource-title','resource-detail','resource-count','resource-time','resource-download-status','resource-download-mode','resource-download-percent'];
 const dom=new JSDOM('<body><script></script><main id="game"></main><section id="resource-loader">'+ids.map(id=>'<span id="'+id+'"></span>').join('')+'<progress id="resource-progress"></progress><button id="resource-enter" hidden></button><button id="resource-online" hidden></button><button id="resource-retry" hidden></button></section><button id="resource-audio"></button><section id="resource-scene" hidden><strong></strong><button hidden></button></section><section id="resource-downloads" hidden><button id="resource-download-all"></button><button id="resource-download-pause"></button></section></body>',{url:'https://scene-race.example/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,d=w.document,resource='assets/late-card.webp',raf=[],errors=[];let releaseActor,rejectImage,repaired=false;
 d.getElementById('resource-downloads').prepend(d.createElement('summary'));w.addEventListener('error',event=>errors.push(event.error?.message||event.message));
 const actor=new Promise(resolve=>releaseActor=resolve),manifest={manifestId:'scene-race',scripts:[],styles:[],actors:{mc_01:{files:[]},wisp:{files:[]}},entries:[{url:resource,pack:'common',kind:'image',bytes:1,required:false}],menuAudio:'none.mp3'};
 const progress=()=>({cacheMode:'online',verifiedFiles:0,totalFiles:1,verifiedBytes:0,loadedBytes:0,totalBytes:1,availableFiles:0,availableBytes:0,active:0,queued:0});
 const manager={manifest,cacheMode:'online',resume(){},pause(){},available(){return false;},progress,stats:progress,reconcile:async()=>progress(),prepare:async(_urls,options={})=>options.onProgress?.(progress()),fetchAsset(key){return key===resource&&!repaired?new Promise((_resolve,reject)=>rejectImage=reject):Promise.resolve(new Response('verified fixture image'));}};
 Object.defineProperty(d,'currentScript',{value:d.querySelector('script')});Object.defineProperty(d,'readyState',{value:'complete'});
 w.fetch=async()=>({ok:true,json:async()=>manifest});w.STMAssetReadiness={...Readiness,create:()=>manager};
 w.DCEngine={getMap:()=>({nodes:[]})};w.DCActorAnimation={preload:()=>actor,forgetPreload(){}};
 w.URL.createObjectURL=()=> 'blob:fixture';w.URL.revokeObjectURL=()=>{};w.Image=class{naturalWidth=64;decode(){return Promise.resolve();}};w.HTMLImageElement.prototype.decode=async()=>{};
 w.requestAnimationFrame=callback=>{raf.push(callback);return raf.length;};
 w.eval(source);await until(()=>!d.getElementById('resource-online').hidden);d.getElementById('resource-online').click();
 const run={seed:1,started:1,stage:0,depth:0,scene:'battle',battle:{enemyId:'wisp'}};
 d.addEventListener('stm-retry-resources',()=>w.STMHosted.scene(run,false));
 t.after(()=>{releaseActor();w.close();});
 return {w,d,run,resource,releaseActor,raf,errors,repair(){repaired=true;},reject(){assert.equal(typeof rejectImage,'function');rejectImage(Error('deliberate current image 404'));},async finish(){releaseActor();for(let i=0;i<2;i++){await until(()=>raf.length>0);raf.shift()(w.performance.now());await tick();}await tick();}};
}
test('current image retry survives the success of an older initial actor preload',async t=>{
 const f=await fixture(t);f.w.STMHosted.scene(f.run,false);await tick();
 const image=f.d.createElement('img');image.dataset.stmAsset=f.resource;f.d.getElementById('game').append(image);
 f.w.STMHosted.scene(f.run,false);await tick();f.reject();await tick();await tick();
 const panel=f.d.getElementById('resource-scene');assert.equal(panel.hidden,false);assert.equal(panel.querySelector('button').hidden,false);
 const initialGateHeld=f.d.body.classList.contains('scene-preparing');
 await f.finish();
 assert.deepEqual(f.errors,[],'fixture must execute current bootstrap without an unrelated exception');
 console.log(JSON.stringify({case:'current image after initial actor success',initialGateHeld,panelHidden:panel.hidden,retryHidden:panel.querySelector('button').hidden,scenePreparing:f.d.body.classList.contains('scene-preparing')}));
 assert.equal(initialGateHeld,true,'a later image failure must not release initial navigation before actor decoding finishes');
 assert.equal(panel.hidden,false,'older successful actor preload must not erase a current image retry');
 assert.equal(panel.querySelector('button').hidden,false,'current failed image keeps an actionable retry');
 assert.equal(f.d.body.classList.contains('scene-preparing'),false,'the completed room must be usable under its nonblocking image retry');
 f.repair();panel.querySelector('button').click();await f.finish();assert.equal(panel.hidden,true,'explicit successful retry clears its notice');assert.equal(f.d.body.classList.contains('scene-preparing'),false);
});
test('a failed current image removed before actor settlement cannot resurrect its notice',async t=>{
 const f=await fixture(t);f.w.STMHosted.scene(f.run,false);await tick();
 const image=f.d.createElement('img');image.dataset.stmAsset=f.resource;f.d.getElementById('game').append(image);f.w.STMHosted.scene(f.run,false);await tick();f.reject();await tick();await tick();
 image.remove();f.w.STMHosted.scene(f.run,false);await f.finish();assert.deepEqual(f.errors,[]);
 assert.equal(f.d.getElementById('resource-scene').hidden,true,'a notice for a removed failed image must not survive initial settlement');assert.equal(f.d.body.classList.contains('scene-preparing'),false);
});
test('obsolete removed image cannot raise a retry after initial actor success',async t=>{
 const f=await fixture(t);f.w.STMHosted.scene(f.run,false);await tick();
 const image=f.d.createElement('img');image.dataset.stmAsset=f.resource;f.d.getElementById('game').append(image);f.w.STMHosted.scene(f.run,false);await tick();
 image.remove();f.w.STMHosted.scene(f.run,false);f.reject();await f.finish();
 assert.deepEqual(f.errors,[],'fixture must execute current bootstrap without an unrelated exception');
 const panel=f.d.getElementById('resource-scene');assert.equal(panel.hidden,true);assert.equal(f.d.body.classList.contains('scene-preparing'),false);
});
