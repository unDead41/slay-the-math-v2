'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom');
const Readiness=require('../../dist/asset-readiness.js');
const source=name=>fs.readFileSync(path.join(__dirname,'../../dist',name),'utf8');
const flush=()=>new Promise(resolve=>setImmediate(resolve));
async function until(predicate){const end=Date.now()+2000;do{if(predicate())return;await new Promise(resolve=>setTimeout(resolve,2));}while(Date.now()<end);throw Error('Expected resource state was not reached');}

// Run the complete production bootstrap and icon controller. Only network and
// image decoding are supplied here: jsdom does not implement bitmap decoding.
async function hostedImages(t,{hold=[],decodeGate=()=>Promise.resolve()}={}){
 const dom=new JSDOM('<body><script></script><section id="resource-loader"><strong id="resource-title"></strong><span id="resource-detail"></span><progress id="resource-progress"></progress><span id="resource-count"></span><span id="resource-time"></span><button id="resource-enter" hidden></button><button id="resource-online" hidden></button><button id="resource-retry" hidden></button></section><button id="resource-audio"></button><section id="resource-scene" hidden><strong></strong><button hidden></button></section><section id="resource-downloads" hidden><summary></summary><span id="resource-download-status"></span><span id="resource-download-mode"></span><button id="resource-download-all"></button><button id="resource-download-pause"></button></section></body>',{url:'https://image-test.example/game/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,events=[],waiting=new Map(),tasks=[],urls=[];let decodes=0;
 const payload='verified image fixture',entries=['a','b','weak','audio'].map(url=>({url,bytes:Buffer.byteLength(payload),sha256:crypto.createHash('sha256').update(payload).digest('hex'),pack:'common',kind:url==='audio'?'audio':'image',required:false}));
 const manifest={manifestId:'image-contract',entries,scripts:[],actors:{},menuAudio:'audio'};
 Object.assign(w,{Headers,Response,AbortController,AbortSignal});Object.defineProperty(w,'crypto',{value:crypto.webcrypto});
 Object.defineProperty(w.document,'currentScript',{value:w.document.querySelector('script')});Object.defineProperty(w.document,'readyState',{value:'complete'});
 w.URL.createObjectURL=blob=>{const url=URL.createObjectURL(blob);urls.push(url);return url;};w.URL.revokeObjectURL=url=>URL.revokeObjectURL(url);
 w.Image=class{constructor(){this.naturalWidth=64;}async decode(){decodes++;await decodeGate();}};
 w.HTMLImageElement.prototype.decode=async function(){};
 Object.defineProperty(w.HTMLImageElement.prototype,'naturalWidth',{get(){return this.src.startsWith('blob:')?64:0;}});
 Object.defineProperty(w.HTMLImageElement.prototype,'complete',{get(){return this.src.startsWith('blob:');}});
 w.fetch=async(input,{signal}={})=>{
  const url=new URL(input),key=url.pathname.split('/').pop();
  if(key==='asset-manifest.json')return new Response(JSON.stringify(manifest),{headers:{'content-type':'application/json'}});
  events.push(key);
  if(hold.includes(key))await new Promise((resolve,reject)=>{waiting.set(key,resolve);signal?.addEventListener('abort',()=>reject(Error('Aborted fixture transfer')),{once:true});});
  return new Response(payload,{headers:{'content-type':'image/svg+xml'}});
 };
 w.STMAssetReadiness={...Readiness,create:options=>Readiness.create({...options,cache:null,memoryBudgetBytes:0})};
 w.DCIconAssets={...require('../../dist/icon-assets.js'),status:{weak:'weak'},ui:{}};
 w.eval(source('icon-readiness.js'));w.eval(source('bootstrap.js'));
 await until(()=>w.STMHosted?.manager&&!w.document.getElementById('resource-online').hidden);
 const api={window:w,events,manager:w.STMHosted.manager,decodes:()=>decodes,track(p){tasks.push(p);p.catch(()=>{});return p;},release(key){waiting.get(key)?.();},releaseAll(){for(const resolve of waiting.values())resolve();}};
 t.after(async()=>{api.releaseAll();await Promise.allSettled(tasks);api.manager.destroy();for(const url of urls)URL.revokeObjectURL(url);dom.window.close();});
 return api;
}
module.exports={hostedImages,until,flush};
