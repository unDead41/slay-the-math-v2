'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom');
const P=require('../dist/combat-vfx-passive.js'),A=require('../dist/combat-vfx-orbits.js'),S=require('../dist/combat-vfx-shield.js');
function boot({status=false,width=640,height=480}={}){
 const dom=new JSDOM('<dialog id="dialog"></dialog>'+['player','enemy'].map(role=>'<div class="combatant '+role+'" data-enemy="sentinel"><div class="fighter-anchor">'+['back','front'].map(side=>'<canvas class="combat-vfx-canvas" data-vfx-layer="'+side+'"></canvas>').join('')+'</div></div>').join(''),{runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,d=w.document,pending=new Map(),calls=[];let serial=0,now=100,motion=true,quality='full';
 w.CanvasRenderingContext2D=function(){};
 w.requestAnimationFrame=fn=>{pending.set(++serial,fn);return serial;};w.cancelAnimationFrame=id=>pending.delete(id);
 w.HTMLCanvasElement.prototype.getBoundingClientRect=()=>({width,height});
 w.HTMLCanvasElement.prototype.getContext=function(){return this.ctx||(this.ctx={canvas:this,matrix:[1,0,0,1,0,0],stack:[],clearRect(){},setTransform(...m){this.matrix=m;},scale(x,y){this.matrix[0]*=x;this.matrix[1]*=x;this.matrix[2]*=y;this.matrix[3]*=y;calls.push({id:'transform',x,y});},save(){this.stack.push([...this.matrix]);},restore(){this.matrix=this.stack.pop()||[1,0,0,1,0,0];},fillRect(){},drawImage(){},createLinearGradient(){return{addColorStop(){}};}});};
 w.STMPassiveField={create(options){const p=P.create(options);return {...p,paint(ctx,t,opts){calls.push({id:'passive',matrix:[...ctx.matrix],time:t,...p.snapshot(t),...opts});}};}};
 w.STMAuraField={...A,create(){return {paint(ctx,time,id,opts){calls.push({id,matrix:[...ctx.matrix],time,...opts});return A.stateAt(time,id,opts);},destroy(){}};}};
 w.STMShieldField={...S,create(){return {paint(ctx,time,event,opts){calls.push({id:'block',matrix:[...ctx.matrix],event,time,...opts});return S.stateAt(time,event,opts);}};}};
 w.eval(fs.readFileSync(path.join(__dirname,'../dist/combat-vfx.js'),'utf8'));
 if(status){w.DCCombatStatus=require('../dist/combat-status.js');w.eval(fs.readFileSync(path.join(__dirname,'../dist/status-vfx.js'),'utf8'));}
 const v=(status?w.DCStatusVFX:w.DCCombatVFX).create({document:d,motion:()=>motion,quality:()=>quality});
 return {w,d,v,calls,pending,step(ms=20){now+=ms;const fns=[...pending.values()];pending.clear();for(const fn of fns)fn(now);},advance(ms){for(let i=0;i<Math.ceil(ms/20);i++)this.step();},motion(value){motion=value;v.sync();},quality(value){quality=value;v.sync();},close(){v.destroy();w.close();}};
}
function state(values={},passives=[]){return {identity:'battle-1',seq:1,actors:{player:{values,equipped:passives.map(p=>p.source),passives},enemy:{values:{},equipped:[],passives:[]}}};}
const front=f=>f.d.querySelector('.player [data-vfx-layer=front]');

test('live materials center on Alyssa and Prism Guard bodies instead of the left registration pivot',()=>{
 const f=boot(),s=state({block:6});s.actors.enemy.values={block:8};try{
  f.w.DCAnimationData=require('../dist/animation-data.js');f.d.querySelector('.enemy').dataset.enemy='beetle';f.v.mount(s);f.advance(80);
  const positions=[...new Set(f.calls.filter(c=>c.id==='block').map(c=>Math.round(c.matrix[4])))];
  assert.deepEqual(positions,[376,384],'640px canvas: actual registered body axes are x940 and x960 in the 1600px frame');
 }finally{f.close();}
});

test('a floating Rune Bat shield follows its visible body above the floor',()=>{
 const f=boot(),s=state();s.actors.enemy.values={block:5};try{
  f.w.DCAnimationData=require('../dist/animation-data.js');f.d.querySelector('.enemy').dataset.enemy='bat';f.v.mount(s);f.advance(80);
  const m=f.calls.find(c=>c.id==='block').matrix,center=m[5]-145*m[3];
  assert.ok(Math.abs(center-240.2)<8,'actual opaque Idle body spans y222..979, not the ground at y1100');
 }finally{f.close();}
});

test('body and Passive transforms use the same source projection as a stretched actor canvas',()=>{
 const f=boot({height:360}),a={id:4,source:'armor'};try{
  f.w.DCAnimationData=require('../dist/animation-data.js');f.v.mount(state({block:5},[a]));f.advance(80);
  const shield=f.calls.find(c=>c.id==='block').matrix,seal=f.calls.find(c=>c.id==='passive').matrix;
  assert.ok(Math.abs(shield[4]-376)<.01);assert.ok(Math.abs(shield[5]-330)<.01);
  assert.ok(Math.abs(shield[0]/shield[3]-4/3)<.001,'each axis must follow its displayed canvas dimension');
  assert.ok(Math.abs(seal[4]-376)<.01&&Math.abs(seal[5]-330)<.01,'the Passive stays centered between the registered boots');
 }finally{f.close();}
});

test('an unrelated committed action cannot cancel a Shield formation already on screen',()=>{
 const E=require('../dist/engine.js'),F=require('../tools/dev/fixtures.js'),f=boot({status:true});
 const r=F.cardSetup('stm.defend.rune_guard',false,false,{enemyHp:999});try{
  f.v.mount(r);f.advance(40);const before=f.v.capture(r);E.playCard(r,r.battle.hand[0].uid);f.v.mount(r);f.v.play(before,r);f.advance(100);
  assert.ok(f.calls.some(c=>c.id==='block'&&c.event==='gain'));
  const cursor=f.calls.length,unchanged=f.v.capture(r);f.v.mount(r);f.v.play(unchanged,r);f.advance(80);
  assert.ok(f.calls.slice(cursor).some(c=>c.id==='block'&&c.event==='gain'),'capture/mount/no-op play must retain the current lifecycle');
 }finally{f.close();}
});

test('replacing the transient readout host cannot cancel the next actual Shield impact',()=>{
 const E=require('../dist/engine.js'),F=require('../tools/dev/fixtures.js'),f=boot({status:true});
 const r=F.cardSetup('stm.defend.rune_guard',false,false,{enemyHp:999});try{
  f.v.mount(r);f.advance(40);let before=f.v.capture(r);E.playCard(r,r.battle.hand[0].uid);f.v.mount(r);f.v.play(before,r);f.advance(120);
  assert.ok(f.d.querySelector('.status-vfx'));f.d.querySelector('.status-vfx').remove();
  r.battle.currentIntent.damage=3;before=f.v.capture(r);E.endTurn(r);f.v.mount(r);f.calls.length=0;f.v.play(before,r);f.advance(200);
  assert.ok(f.calls.some(c=>c.id==='block'&&['hit','break'].includes(c.event)),'recreating detached labels must not cancel the material compositor');
 }finally{f.close();}
});

test('adding a second Passive keeps the first seal visible throughout its new layer transition',()=>{
 const f=boot(),a={id:4,source:'armor'},b={id:0,source:'blazing'};try{
  f.v.mount(state());f.v.mount(state({},[a]));f.advance(1500);f.calls.length=0;
  f.v.mount(state({},[a,b]));f.advance(60);
  const draws=f.calls.filter(c=>c.id==='passive');assert.ok(draws.length);
  assert.ok(draws.every(c=>c.entrance>.99&&c.tracks.find(t=>t.id===4).weight>.99),'new ornaments must not restart the entire field introduction');
 }finally{f.close();}
});

test('the first live Passive seal finishes its introduction within 600ms',()=>{
 const f=boot(),a={id:4,source:'armor'};try{
  f.v.mount(state());f.v.mount(state({},[a]));f.advance(600);
  const c=f.calls.filter(c=>c.id==='passive').at(-1);assert.ok(c.entrance>.999&&c.tracks[0].weight>.999);
 }finally{f.close();}
});

test('Shield and every barrier finish forming within 600ms on each actor',()=>{
 const f=boot(),s=state({block:6,thorns:3,weak:1,vulnerable:1});s.actors.enemy.values={...s.actors.player.values};try{
  f.v.mount(state());f.v.mount(s);f.v.play({visuals:Object.fromEntries(['player','enemy'].map(role=>[role,['block','thorns','weak','vulnerable'].map(id=>({id,event:'gain',from:0}))]))});f.advance(600);
  for(const id of ['block','thorns','weak','vulnerable']){
   const c=f.calls.filter(c=>id==='block'?c.id===id:c.id.startsWith(id+'-')).at(-1);
   const s=id==='block'?S.stateAt(c.time,c.event,c):A.stateAt(c.time,c.id,c);
   assert.ok(s.formation>.999&&s.visibility>.999,id+' must be fully visible before the next ordinary action');
  }
 }finally{f.close();}
});

test('a fresh hit interrupts formation and repeated hits do not build an obsolete queue',()=>{
 const f=boot();try{
  f.v.mount(state({block:8}));f.v.play({visuals:{player:[{id:'block',event:'gain',from:0}]}});f.advance(100);f.calls.length=0;
  for(let i=0;i<5;i++){f.v.play({visuals:{player:[{id:'block',event:'hit'}]}});f.advance(60);}
  assert.ok(f.calls.some(c=>c.id==='block'&&c.event==='hit'),'impact must not wait behind a formation');
  f.advance(700);assert.deepEqual(JSON.parse(front(f).dataset.vfxEvents),[],'new commands cannot leave several seconds of queued old impacts');
 }finally{f.close();}
});

test('Thorns hit and retraction both finish within one second while retaining their order',()=>{
 const f=boot();try{
  f.v.mount(state());f.v.play({visuals:{player:[{id:'thorns',event:'hit'},{id:'thorns',event:'expire'}]}});f.advance(1000);
  const ids=[...new Set(f.calls.filter(c=>c.id.startsWith('thorns-')).map(c=>c.id))];
  assert.deepEqual(ids,['thorns-hit','thorns-expire']);assert.equal(f.pending.size,0,'a previous turn must not leave a long lifecycle backlog');
 }finally{f.close();}
});

test('a formed Weak chain continues its orbit without jumping at the active-loop boundary',()=>{
 const f=boot();try{
  f.v.mount(state({weak:1}));f.v.play({visuals:{player:[{id:'weak',event:'gain',from:0}]}});f.advance(2000);
  const calls=f.calls.filter(c=>c.id.startsWith('weak-')&&c.front),i=calls.findIndex((c,i)=>i>0&&c.id==='weak-active'&&calls[i-1].id==='weak-gain');assert.ok(i>0);
  const previous=A.stateAt(calls[i-1].time,calls[i-1].id,calls[i-1]),next=A.stateAt(calls[i].time,calls[i].id,calls[i]);
  assert.ok(Math.abs(next.p-previous.p)<.05,'the active loop must inherit the formed chain phase');
 }finally{f.close();}
});

test('new model registration owns VFX body size instead of the retired poster measurement',()=>{
 const f=boot();try{
  f.w.DCAnimationData={hero:{bodyHeight:700},actors:{}};f.v.mount(state({block:5}));f.advance(100);
  const large=f.calls.filter(c=>c.id==='block').at(-1).matrix[3];
  f.w.DCAnimationData.hero.bodyHeight=350;f.advance(100);const small=f.calls.filter(c=>c.id==='block').at(-1).matrix[3];
  assert.ok(Math.abs(large/small-2)<.000001,'doubling registry body height must double the projected material height');
 }finally{f.close();}
});

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
  f.v.mount(state());f.v.play({visuals:{player:[{id:'thorns',event:'hit'},{id:'thorns',event:'expire'}]}});f.advance(180);
  assert.ok(f.calls.some(c=>c.id==='thorns-hit'));assert.ok(!f.calls.some(c=>c.id==='thorns-expire'));
  assert.ok(f.calls.filter(c=>c.id==='thorns-hit').at(-1).alpha>.5,'hold the shell until the queued retraction begins');
  f.advance(360);assert.ok(f.calls.some(c=>c.id==='thorns-expire'));f.advance(1000);assert.equal(f.pending.size,0);
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
