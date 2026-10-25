'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
async function fixture({corrupt=false,missing=false,launch=false}={}){
 const base='https://offline-worker.example/game/',id='1'.repeat(24),files=[['index.html','<html>verified game</html>'],['bootstrap.js','/* verified bootstrap */']].map(([url,body])=>({url,body,bytes:Buffer.byteLength(body),sha256:sha(body)})),entries=files.map(({body,...e})=>e).concat(launch?[{url:'later.png',bytes:1,sha256:sha('x')}]:[]),manifest={manifestId:id,offline:{releaseId:id,files:entries,...(launch?{launch:files.map(e=>e.url)}:{})}},text=JSON.stringify(manifest),data=new Map(files.map(e=>[base+e.url,new Response(e.body)]));
 data.set(base+'asset-manifest.json',new Response(text));data.set(base+'.__stm_offline__/'+(launch?'launch':'complete')+'.json',new Response(JSON.stringify({protocol:'stm-offline-v1',releaseId:id,manifestId:id,manifestHash:sha(text),files:entries.map(e=>[e.url,e.bytes,e.sha256]),completedAt:1})));
 if(corrupt)data.set(base+'bootstrap.js',new Response('corrupted startup code'));if(missing)data.delete(base+'bootstrap.js');
 const listeners={},cache={match:async key=>data.get(String(key))?.clone(),keys:async()=>[...data.keys()].map(url=>new Request(url))};
 const self={location:new URL(base+'sw.js'),addEventListener:(name,fn)=>listeners[name]=fn,clients:{get:async()=>({url:base+'?stm-release='+id})}};
 const context=vm.createContext({self,URL,Response,Request,TextDecoder,crypto:crypto.webcrypto,caches:{keys:async()=>['stm-assets-'+encodeURIComponent('/game/')+'-'+id],open:async()=>cache},fetch:async()=>{throw Error('network offline');}});vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/sw.js'),'utf8'),context);
 async function fetchFile(relative,mode='cors'){let response;listeners.fetch({request:{url:new URL(relative,base).href,method:'GET',mode},clientId:'cold-client',respondWith:p=>response=p});return response?await response:null;}
 return {base,id,files,fetchFile};
}
test('a restarted worker reconstructs a complete release from persistent metadata',async()=>{
 const f=await fixture(),redirect=await f.fetchFile('./','navigate');assert.equal(redirect.status,307);assert.equal(redirect.headers.get('location'),f.base+'?stm-release='+f.id);const response=await f.fetchFile('?stm-release='+f.id,'navigate');assert.equal(response.status,200);assert.equal(await response.text(),'<html>verified game</html>');assert.equal(await (await f.fetchFile('bootstrap.js?v='+f.files[1].sha256)).text(),'/* verified bootstrap */');
});
test('corrupt bootstrap bytes must produce recovery HTML before any game script executes',async()=>{
 const f=await fixture({corrupt:true}),response=await f.fetchFile('?stm-release='+f.id,'navigate');assert.equal(response.status,503);assert.match(await response.text(),/Offline preparation needed/);
});
test('a missing file cannot be hidden by a completed installation marker',async()=>{
 const f=await fixture({missing:true}),response=await f.fetchFile('?stm-release='+f.id,'navigate');assert.equal(response.status,503);
});
test('pinned requests reject other releases/hashes and never intercept API or developer paths',async()=>{
 const f=await fixture();assert.equal((await f.fetchFile('bootstrap.js?v='+'f'.repeat(64))).status,409);assert.equal((await f.fetchFile('asset-manifest.json?stm-release='+'a'.repeat(24))).status,409);assert.equal(await f.fetchFile('api/pet'),null);assert.equal(await f.fetchFile('__dev/index.html'),null);
});

test('a cold worker may launch a verified startup package without a full-install receipt',async()=>{
 const f=await fixture({launch:true});assert.equal((await f.fetchFile('./','navigate')).status,307);assert.equal((await f.fetchFile('?stm-release='+f.id,'navigate')).status,200);assert.equal((await f.fetchFile('bootstrap.js')).status,200);assert.equal((await f.fetchFile('later.png')).status,503,'Missing optional media must remain unavailable');
});
test('a startup receipt cannot hide a corrupt or missing startup script',async()=>{
 for(const value of [{launch:true,corrupt:true},{launch:true,missing:true}]){const f=await fixture(value);assert.equal((await f.fetchFile('?stm-release='+f.id,'navigate')).status,503);}
});
