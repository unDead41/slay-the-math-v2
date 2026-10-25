'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {hostedImages,until,flush}=require('./helpers/hosted-images.cjs');

test('a visible icon overtakes queued warming while two background transfers remain held',async t=>{
 const f=await hostedImages(t,{hold:['a','b']}),w=f.window;
 const blockers=['a','b'].map(key=>f.track(f.manager.fetchAsset(key,{priority:80})));
 await until(()=>f.events.includes('a')&&f.events.includes('b'));
 const warmed=f.track(w.DCIconReadiness.warm());assert.equal(f.manager.stats().queued,1);
 w.document.body.insertAdjacentHTML('beforeend','<button aria-label="Weak: 2"><img data-status-icon="weak" data-stm-asset="weak" src="pending.svg"><b>2</b><span>Weak</span></button>');
 const image=w.document.querySelector('[data-status-icon]'),visible=f.track(w.STMHosted.imageElement(image));
 await until(()=>image.dataset.stmImageState==='ready');
 assert.equal(f.events.filter(key=>key==='weak').length,1,'Warming and visible use share one transfer');
 assert.equal(f.manager.stats().active,2,'The two held background transfers did not need to finish');
 assert.equal(f.decodes(),1,'The shared source is decoded once');
 assert.equal(image.closest('button').textContent,'2Weak');assert.equal(image.closest('button').disabled,false);
 assert.equal(image.dataset.iconState,'ready');
 f.releaseAll();await Promise.all([...blockers,warmed,visible]);
});

test('foreground promotion during an existing decode does not fetch bytes again with session retention disabled',async t=>{
 let release;const gate=new Promise(resolve=>release=resolve),f=await hostedImages(t,{decodeGate:()=>gate}),w=f.window;
 try{const warmed=f.track(w.STMHosted.prepareImage('weak',{priority:60}));await until(()=>f.decodes()===1);
  const visible=f.track(w.STMHosted.prepareImage('weak',{priority:0}));
  await flush();assert.equal(f.events.filter(key=>key==='weak').length,1);assert.equal(f.decodes(),1);
  release();assert.equal(await visible,await warmed);
  assert.equal(await w.STMHosted.prepareImage('weak',{priority:0}),await warmed);
  assert.equal(f.events.filter(key=>key==='weak').length,1);
 }finally{release();}
});
