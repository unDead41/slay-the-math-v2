'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom');
const root=path.resolve(__dirname,'../dist'),wait=()=>new Promise(r=>setTimeout(r,100));

test('combat image refresh reports a current failure without blanking the room and ignores obsolete failures',async()=>{
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://combat-images.example/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,d=w.document;
 let rejectImage;const resource='assets/late-card.webp',manifest={manifestId:'fixture',scripts:[],actors:{mc_01:{files:[]}},entries:[{url:resource,pack:'common',kind:'image',required:false}],menuAudio:'menu.mp3'};
 try{
  Object.defineProperty(d,'currentScript',{value:{}});
  w.fetch=async()=>({ok:true,json:async()=>manifest});
  w.DCEngine={getMap:()=>({nodes:[]})};
  w.STMAssetReadiness={create:()=>({resume(){},pause(){},prepare:async()=>{},stats:()=>({cacheMode:'online'}),fetchAsset(key){return key===resource?new Promise((_resolve,reject)=>{rejectImage=reject;}):Promise.resolve({});}})};
  w.eval(fs.readFileSync(path.join(root,'bootstrap.js'),'utf8'));await wait();
  const r={seed:1,started:1,stage:0,depth:0,scene:'shop'};w.STMHosted.scene(r,false);await wait();
  assert.equal(d.getElementById('resource-scene').hidden,true);
  const img=d.createElement('img');img.dataset.stmAsset=resource;d.getElementById('game').append(img);
  w.STMHosted.scene(r,false);await Promise.resolve();assert.equal(typeof rejectImage,'function');
  img.remove();w.STMHosted.scene(r,false);rejectImage(Error('late 404'));await wait();
  assert.equal(d.getElementById('resource-scene').hidden,true,'an obsolete image failure must not replace the current room with a retry notice');
  assert.equal(d.body.classList.contains('scene-preparing'),false);
  const current=d.createElement('img');current.dataset.stmAsset=resource;d.getElementById('game').append(current);
  w.STMHosted.scene(r,false);await Promise.resolve();rejectImage(Error('current 404'));await wait();
  assert.equal(d.getElementById('resource-scene').hidden,false,'a current failed image must expose its retry control');
  assert.equal(d.body.classList.contains('scene-preparing'),false,'a recoverable image refresh must leave combat visible');
 }finally{w.close();}
});
