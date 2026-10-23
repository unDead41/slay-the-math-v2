'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{webcrypto}=require('node:crypto');
const file=path.resolve(__dirname,'../dist/learning-delivery.js'),URL_='https://script.google.com/macros/s/TEST_DEPLOYMENT_1234567890/exec';
const sync=require('../dist/learning-sync.js');
function api(){assert.ok(fs.existsSync(file),'Destination delivery is available');return require(file);}
function disk(){const m=new Map();return {m,get length(){return m.size;},key:i=>[...m.keys()][i]??null,getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)};}
function fake(){let created=0,closed=0;const rows=new Map();const fetch=async(url,init)=>{const route=new URL(url,'http://localhost').pathname.split('/').at(-1);const body=init.body?JSON.parse(init.body):null;if(route==='status')return {ok:true,status:200,json:async()=>({protocolVersion:1,enabled:true})};if(route==='register')return {ok:true,status:200,json:async()=>({registered:true})};for(const e of body.entries)rows.set(e.id,e);return {ok:true,status:200,json:async()=>({acknowledged:body.entries.map(e=>({id:e.id,revision:e.revision}))})};};return {rows,fetch,get created(){return created;},get closed(){return closed;},create(){created++;return {fetch,close(){closed++;}};}};}
const input=comment=>({id:'question-1',kind:'question-feedback',payload:{comment}});
function client(storage,service=fake(),extra={}){return api().createClient({storage,fetch:service.fetch,crypto:webcrypto,online:true,createGoogleTransport:()=>service.create(),...extra});}
test('default destination keeps the existing local receiver storage and exact receipts',async()=>{
 const storage=disk(),service=fake(),c=client(storage,service);c.enqueue(input('Local'));c.setEnabled(true);await c.flush();assert.equal(c.status().pending,0);assert.equal(c.status().destination.kind,'local');assert.ok(storage.getItem(sync.STORAGE_KEY));assert.equal(service.created,0);c.stop();
});
test('choosing Google pauses sharing and cannot inherit local ACKs or the local capability identity',async()=>{
 const storage=disk(),service=fake(),c=client(storage,service);c.enqueue(input('Already local'));c.setEnabled(true);await c.flush();const local=JSON.parse(storage.getItem(sync.STORAGE_KEY));
 c.setDestination(URL_);assert.equal(c.status().enabled,false);assert.equal(c.status().pending,1);assert.equal(c.status().destination.kind,'google-sheets');assert.equal(service.created,0);
 c.setEnabled(true);await c.flush();assert.equal(c.status().pending,0);assert.equal(service.created,1);
 const identities=[...storage.m.values()].map(raw=>{try{return JSON.parse(raw).identity;}catch{return null;}}).filter(Boolean);assert.ok(identities.some(i=>i.clientId!==local.identity.clientId));assert.ok(!JSON.stringify(c.status()).includes(local.identity.secret));assert.equal(JSON.parse(storage.getItem(sync.STORAGE_KEY)).entries[0].acknowledgedRevision,1);c.stop();
});
test('Google configuration and received state survive reopen without creating an iframe while paused',async()=>{
 const storage=disk(),service=fake();let c=client(storage,service);c.enqueue(input('Saved'));c.setDestination(URL_);c.setEnabled(true);await c.flush();c.setEnabled(false);c.stop();const created=service.created;
 c=client(storage,service);assert.equal(c.status().destination.url,URL_);assert.equal(c.status().pending,0);assert.equal(c.status().enabled,false);assert.equal(service.created,created);c.enqueue(input('Edited offline'));assert.equal(c.status().pending,1);assert.equal(service.created,created);c.stop();
});
test('a different Google deployment starts pending with separate consent and leaves the former journal intact',async()=>{
 const storage=disk(),c=client(storage);c.enqueue(input('First destination'));c.setDestination(URL_);c.setEnabled(true);await c.flush();const before=new Set(storage.m.keys());c.setDestination(URL_.replace('1234567890','9999999999'));assert.equal(c.status().pending,1);assert.equal(c.status().enabled,false);for(const key of before)assert.ok(storage.m.has(key));c.stop();
});
test('an invalid stored destination is preserved and blocks every send until explicitly repaired',async()=>{
 const storage=disk(),service=fake(),bad='{keep-this-invalid-config';storage.setItem(api().DESTINATION_KEY,bad);const c=client(storage,service);c.enqueue(input('Keep pending'));assert.equal(c.status().state,'save-error');assert.equal(storage.getItem(api().DESTINATION_KEY),bad);assert.throws(()=>c.setEnabled(true),/collection|destination|link/i);await c.flush();assert.equal(service.rows.size,0);c.setDestination(URL_);assert.equal(c.status().enabled,false);assert.equal(c.status().pending,1);c.stop();
});
test('site defaults apply to new browsers and an explicit local choice overrides the site default',()=>{
 const storage=disk();let c=client(storage,fake(),{googleScriptUrl:URL_});assert.equal(c.status().destination.kind,'google-sheets');assert.equal(c.status().enabled,false);c.setDestination('');c.stop();c=client(storage,fake(),{googleScriptUrl:URL_});assert.equal(c.status().destination.kind,'local');c.stop();
});
test('a cross-tab destination change pauses the old client and takes effect without a reload',()=>{
 const storage=disk(),listeners=new Map(),host={setTimeout,clearTimeout,crypto:webcrypto,addEventListener(k,fn){if(!listeners.has(k))listeners.set(k,new Set());listeners.get(k).add(fn);},removeEventListener(k,fn){listeners.get(k)?.delete(fn);}};
 const c=client(storage,fake(),{host});c.enqueue(input('Across tabs'));c.start();storage.setItem(api().DESTINATION_KEY,JSON.stringify({schemaVersion:1,googleScriptUrl:URL_}));for(const fn of [...listeners.get('storage')])fn({key:api().DESTINATION_KEY});assert.equal(c.status().destination.kind,'google-sheets');assert.equal(c.status().enabled,false);assert.equal(c.status().pending,1);c.stop();
});

test('edits on a new destination replace earlier higher local revisions when switching again',async()=>{
 const storage=disk(),c=client(storage);for(let i=0;i<8;i++)c.enqueue(input('Local '+i));c.setDestination(URL_);c.enqueue(input('Newest Google edit'));c.setDestination('');assert.equal(c.status().pendingEntries[0].payload.comment,'Newest Google edit');c.stop();
});

test('resuming a stopped client re-reads a destination changed elsewhere and requires fresh consent',async()=>{
 const storage=disk(),service=fake(),c=client(storage,service);c.enqueue(input('Before suspend'));c.setDestination(URL_);c.setEnabled(true);await c.flush();c.stop();const created=service.created;const next=URL_.replace('1234567890','9999999999');storage.setItem(api().DESTINATION_KEY,JSON.stringify({schemaVersion:1,googleScriptUrl:next}));c.start();assert.equal(c.status().destination.url,next);assert.equal(c.status().enabled,false);assert.equal(c.status().pending,1);assert.equal(service.created,created);c.stop();
});
test('resuming after stored configuration is corrupted blocks sending and preserves the original bytes',()=>{
 const storage=disk(),service=fake(),c=client(storage,service);c.enqueue(input('Suspended'));c.setEnabled(true);c.stop();storage.setItem(api().DESTINATION_KEY,'{damaged');c.start();assert.equal(c.status().state,'save-error');assert.equal(c.status().enabled,false);assert.equal(storage.getItem(api().DESTINATION_KEY),'{damaged');assert.equal(service.rows.size,0);c.stop();
});

test('explicitly adopting the organiser default preserves old journals and requires fresh consent',async()=>{
 const storage=disk(),service=fake(),other=URL_.replace('1234567890','9999999999');
 storage.setItem(api().DESTINATION_KEY,JSON.stringify({schemaVersion:1,googleScriptUrl:other}));
 const c=client(storage,service,{googleScriptUrl:URL_});c.enqueue(input('Retain this comment'));c.setEnabled(true);await c.flush();
 const oldKeys=[...storage.m.keys()],created=service.created;assert.equal(c.status().destination.canUseDefault,true);
 assert.equal(typeof c.useDefaultDestination,'function');c.useDefaultDestination();assert.equal(c.status().destination.url,URL_);assert.equal(c.status().enabled,false);assert.equal(c.status().pending,1);assert.equal(c.status().pendingEntries[0].payload.comment,'Retain this comment');assert.equal(service.created,created);
 for(const key of oldKeys)assert.ok(storage.m.has(key));assert.equal(JSON.parse(storage.getItem(api().DESTINATION_KEY)).googleScriptUrl,URL_);assert.equal(c.status().destination.canUseDefault,false);c.stop();
});
