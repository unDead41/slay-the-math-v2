'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
function load(name){const f=path.join(__dirname,'../dist/'+name+'.js');assert.ok(fs.existsSync(f),name+' must provide the shared player contract');return require(f);}
function fixture(){const values=new Map([['duel-cube-math.v1','untouched save']]),events=new EventTarget();return {values,host:{navigator:{onLine:true},localStorage:{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)},addEventListener:events.addEventListener.bind(events),removeEventListener:events.removeEventListener.bind(events),dispatchEvent:events.dispatchEvent.bind(events),CustomEvent,AbortController,setTimeout,clearTimeout}};}
test('a connection hint cannot grant pet API permission without an explicit Online choice',async()=>{
 const {host,values}=fixture(),mode=load('play-mode').create({host});let calls=0;
 assert.equal(mode.snapshot().mode,'online');assert.equal(mode.snapshot().explicit,false);assert.equal(mode.canUsePetAPI(),false);
 await assert.rejects(mode.requestOnline(()=>{calls++;return 'answer';}),/choose|select|online/i);assert.equal(calls,0);
 mode.set('online');assert.equal(await mode.requestOnline(()=>{calls++;return 'accepted';}),'accepted');assert.equal(calls,1);
 assert.equal(values.get('duel-cube-math.v1'),'untouched save');assert.equal(JSON.parse(values.get(load('play-mode').key)).mode,'online');
});
test('choosing Offline aborts an active API request and rejects a late successful response',async()=>{
 const {host}=fixture(),mode=load('play-mode').create({host});mode.set('online');let release,signal;
 const pending=mode.requestOnline(s=>{signal=s;return new Promise(r=>release=r);});pending.catch(()=>{});await Promise.resolve();mode.set('offline');
 assert.equal(signal.aborted,true);release('stale answer');await assert.rejects(pending,/offline|mode|cancel/i);assert.equal(mode.canUsePetAPI(),false);
 let called=false;await assert.rejects(mode.requestOnline(()=>called=true));assert.equal(called,false);
});
test('a corrupt preference fails closed and denied storage never re-enables API use',()=>{
 const {host,values}=fixture(),api=load('play-mode');values.set(api.key,'{broken');const mode=api.create({host});assert.equal(mode.canUsePetAPI(),false);assert.equal(values.get(api.key),'{broken');
 host.localStorage.setItem=()=>{throw Error('storage denied');};mode.set('offline');assert.equal(mode.snapshot().mode,'offline');assert.equal(mode.snapshot().persisted,false);assert.equal(mode.canUsePetAPI(),false);
});
test('a real cross-tab preference event cancels work without changing the game save',async()=>{
 const {host,values}=fixture(),api=load('play-mode'),mode=api.create({host});mode.set('online');
 const waiting=mode.requestOnline(()=>new Promise(()=>{}));waiting.catch(()=>{});const e=new Event('storage');Object.defineProperties(e,{key:{value:api.key},newValue:{value:JSON.stringify({version:1,mode:'offline',chosen:true})}});host.dispatchEvent(e);
 await assert.rejects(waiting,/offline|mode|cancel/i);assert.equal(mode.snapshot().mode,'offline');assert.equal(values.get('duel-cube-math.v1'),'untouched save');
});
test('pet API failures return local help while keeping Online as the player preference',async()=>{
 const {host}=fixture(),mode=load('play-mode').create({host});mode.set('online');let calls=0;
 const pet=load('pet-help').create({mode,transport:async()=>{calls++;throw Error('HTTP 503');}});
 const reply=await pet.ask('Block',{language:'ms'});assert.equal(calls,1);assert.equal(reply.source,'local');assert.equal(reply.api,'unavailable');assert.match(reply.answer,/Block/);assert.equal(mode.snapshot().mode,'online');
});
test('Offline pet help uses bilingual packaged FAQ and never invokes a configured transport',async()=>{
 const {host}=fixture(),mode=load('play-mode').create({host});mode.set('offline');let calls=0;const pet=load('pet-help').create({mode,transport:async()=>{calls++;return {answer:'remote'};}});
 for(const language of ['en','ms']){const reply=await pet.ask('Focus',{language});assert.equal(reply.source,'local');assert.match(reply.answer,/Focus/);}
 const unknown=await pet.ask('an unknown free-form conversation',{language:'en'});assert.equal(unknown.source,'local');assert.match(unknown.answer,/FAQ|Tutorial|Practice/);assert.equal(calls,0);
});
test('only an actual successful request establishes pet API availability',async()=>{
 const {host}=fixture(),mode=load('play-mode').create({host});mode.set('online');let calls=0;
 const pet=load('pet-help').create({mode,transport:async()=>{calls++;return {answer:'Use the visible card preview.'};}});assert.notEqual(pet.status().api,'available');
 assert.equal((await pet.ask('card',{language:'en'})).source,'api');assert.equal(calls,1);assert.equal(pet.status().api,'available');
 mode.set('offline');assert.equal((await pet.ask('card')).source,'local');assert.equal(calls,1);assert.notEqual(pet.status().api,'available');
});
test('an Offline choice before the transport microtask prevents the API call entirely',async()=>{
 const {host}=fixture(),mode=load('play-mode').create({host});mode.set('online');let calls=0;const pending=mode.requestOnline(()=>{calls++;return 'late';});pending.catch(()=>{});mode.set('offline');await assert.rejects(pending,/mode|cancel/i);assert.equal(calls,0);
});
test('a pet request timeout aborts work without silently changing the selected mode',async()=>{
 const {host}=fixture(),mode=load('play-mode').create({host,requestTimeoutMs:20});mode.set('online');let signal;await assert.rejects(mode.requestOnline(s=>{signal=s;return new Promise(()=>{});}),/timed out/i);assert.equal(signal.aborted,true);assert.equal(mode.snapshot().mode,'online');
});
