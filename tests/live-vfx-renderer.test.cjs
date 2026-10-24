'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom');
const P=require('../dist/combat-vfx-passive.js'),A=require('../dist/combat-vfx-orbits.js'),S=require('../dist/combat-vfx-shield.js');
function boot(){
 const dom=new JSDOM('<dialog id="dialog"></dialog>'+['player','enemy'].map(role=>'<div class="combatant '+role+'" data-enemy="sentinel">'+['back','front'].map(side=>'<canvas class="combat-vfx-canvas" data-vfx-layer="'+side+'"></canvas>').join('')+'</div>').join(''),{runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,d=w.document,pending=new Map(),calls=[];let serial=0,now=100,motion=true,quality='full';
 w.CanvasRenderingContext2D=function(){};
 w.requestAnimationFrame=fn=>{pending.set(++serial,fn);return serial;};w.cancelAnimationFrame=id=>pending.delete(id);
 w.HTMLCanvasElement.prototype.getBoundingClientRect=()=>({width:640,height:480});
 w.HTMLCanvasElement.prototype.getContext=function(){return this.ctx||(this.ctx={canvas:this,clearRect(){},setTransform(){},scale(){},save(){},restore(){},fillRect(){},drawImage(){},createLinearGradient(){return{addColorStop(){}};}});};
 w.STMPassiveField={create(){const p=P.create();return {...p,paint(ctx,t,opts){calls.push({id:'passive',time:t,...opts});}};}};
 w.STMAuraField={...A,create(){return {paint(ctx,time,id,opts){calls.push({id,time,...opts});return A.stateAt(time,id,opts);},destroy(){}};}};
 w.STMShieldField={create(){return {paint(ctx,time,event,opts){calls.push({id:'block',event,time,...opts});return S.stateAt(time,event,opts);}};}};
 w.eval(fs.readFileSync(path.join(__dirname,'../dist/combat-vfx.js'),'utf8'));
 const v=w.DCCombatVFX.create({document:d,motion:()=>motion,quality:()=>quality});
 return {w,d,v,calls,pending,step(ms=20){now+=ms;const fns=[...pending.values()];pending.clear();for(const fn of fns)fn(now);},advance(ms){for(let i=0;i<Math.ceil(ms/20);i++)this.step();},motion(value){motion=value;v.sync();},quality(value){quality=value;v.sync();},close(){v.destroy();w.close();}};
}
function state(values={},passives=[]){return {identity:'battle-1',seq:1,actors:{player:{values,equipped:passives.map(p=>p.source),passives},enemy:{values:{},equipped:[],passives:[]}}};}
const front=f=>f.d.querySelector('.player [data-vfx-layer=front]');

test('a browser without Canvas 2D retains the existing status fallback',()=>{
 const f=boot();let unsupported;try{
  delete f.w.CanvasRenderingContext2D;unsupported=f.w.DCCombatVFX.create({document:f.d});assert.equal(unsupported,null);
 }finally{unsupported?.destroy();f.close();}
});

test('the last expiry frame clears diagnostics and stops scheduling',()=>{
 const f=boot();try{
  f.v.mount(state({block:5}));f.advance(200);f.v.mount(state());f.v.play({visuals:{player:[{id:'block',event:'expire'}]}});f.advance(2000);
  assert.equal(f.pending.size,0);assert.equal(front(f).dataset.vfxState,'empty');assert.equal(front(f).dataset.vfxEffects,'');assert.deepEqual(JSON.parse(front(f).dataset.vfxEvents),[]);
 }finally{f.close();}
});
test('unrelated combat rerenders retain clock, first-trigger order and removed-slot compaction',()=>{
 const f=boot(),a={id:4,source:'armor'},b={id:0,source:'blazing'};try{
  f.v.mount(state({},[a,b]));f.advance(600);const clock=Number(front(f).dataset.vfxClock);
  const rerender=state({},[b,a]);rerender.seq++;f.v.mount(rerender);f.advance(500);
  assert.ok(Number(front(f).dataset.vfxClock)>clock);assert.deepEqual(JSON.parse(front(f).dataset.vfxPassives).map(p=>p.id),[4,0]);
  f.v.mount(state({},[b]));f.advance(1200);const layers=JSON.parse(front(f).dataset.vfxPassives);assert.deepEqual(layers.map(p=>p.id),[0]);assert.equal(layers[0].radius,P.RADII[0]);
 }finally{f.close();}
});
test('player and enemy use three disjoint stat channels even with mixed signs',()=>{
 const f=boot(),s=state({strength:2,agility:-2,defense:3});s.actors.enemy.values={strength:-1,agility:3,defense:-2};try{
  f.v.mount(s);f.advance(200);
  for(const role of ['player','enemy']){
   const canvas=f.d.querySelector('.'+role+' [data-vfx-layer=front]'),lanes=JSON.parse(canvas.dataset.vfxParticles);
   assert.deepEqual(lanes.map(v=>v.radius),[84,122,160]);assert.equal(canvas.dataset.vfxFloor,'none');
  }
  assert.ok(f.calls.some(c=>c.id==='strength-down'&&c.flow.actor==='enemy'));
  assert.ok(f.calls.some(c=>c.id==='agility-down'&&c.flow.actor==='player'));
 }finally{f.close();}
});
test('Thorns impact finishes before expiry and queued lifecycle ends without new RAF work',()=>{
 const f=boot();try{
  f.v.mount(state());f.v.play({visuals:{player:[{id:'thorns',event:'hit'},{id:'thorns',event:'expire'}]}});f.advance(900);
  assert.ok(f.calls.some(c=>c.id==='thorns-hit'));assert.ok(!f.calls.some(c=>c.id==='thorns-expire'));
  assert.ok(f.calls.filter(c=>c.id==='thorns-hit').at(-1).alpha>.5,'hold the shell until the queued retraction begins');
  f.advance(600);assert.ok(f.calls.some(c=>c.id==='thorns-expire'));f.advance(2200);assert.equal(f.pending.size,0);
 }finally{f.close();}
});
test('adding Block to an existing shield keeps its material continuously formed',()=>{
 const f=boot();try{
  f.v.mount(state({block:10}));f.advance(200);f.calls.length=0;
  f.v.mount(state({block:18}));f.v.play({visuals:{player:[{id:'block',event:'gain',from:10}]}});f.advance(200);
  assert.ok(f.calls.filter(c=>c.id==='block').every(c=>c.event==='active'));
 }finally{f.close();}
});
test('expiring effects still count towards the crowded-scene budget',()=>{
 const f=boot();try{
  f.v.mount(state());f.v.play({visuals:{player:['block','thorns','weak','vulnerable','strength','agility','defense'].map(id=>({id,event:id==='block'?'break':id==='thorns'||id==='weak'||id==='vulnerable'?'expire':'down'}))}});f.advance(100);
  assert.equal(front(f).dataset.vfxQuality,'dense');
 }finally{f.close();}
});
test('an existing shield stays visible while its impact waits for the enemy action lead',()=>{
 const f=boot();try{
  f.v.mount(state({block:5}));f.advance(200);f.calls.length=0;
  f.v.mount(state());f.v.play({leadMs:240,visuals:{player:[{id:'block',event:'break'}]}});f.advance(120);
  assert.ok(f.calls.some(c=>c.id==='block'&&c.event==='active'&&c.alpha>0));
 }finally{f.close();}
});
test('dialog, Motion Off, pagehide and destroy stop work; restoring motion resumes the same field',()=>{
 const f=boot();try{
  f.v.mount(state({strength:2}));f.advance(300);const clock=Number(front(f).dataset.vfxClock);
  f.d.querySelector('dialog').setAttribute('open','');f.step();assert.equal(f.pending.size,0);assert.equal(front(f).dataset.vfxState,'paused');
  f.d.querySelector('dialog').removeAttribute('open');f.v.sync();f.advance(200);assert.ok(Number(front(f).dataset.vfxClock)>clock);
  f.motion(false);assert.equal(f.pending.size,0);f.motion(true);f.advance(200);assert.equal(front(f).dataset.vfxState,'playing');
  f.w.dispatchEvent(new f.w.Event('pagehide'));assert.equal(f.pending.size,0);f.w.dispatchEvent(new f.w.Event('pageshow'));f.step();assert.ok(f.pending.size>0);
  f.v.destroy();assert.equal(f.pending.size,0);
 }finally{f.close();}
});
test('sustained expensive rendering lowers quality within the first twenty frames',()=>{
 const f=boot();try{
  let cost=0;Object.defineProperty(f.w.performance,'now',{value:()=>cost+=40});
  f.v.mount(state({strength:2,agility:2,defense:2}));f.advance(500);
  assert.equal(front(f).dataset.vfxQuality,'low');
  assert.ok(front(f).width*front(f).height<=400000);
 }finally{f.close();}
});
