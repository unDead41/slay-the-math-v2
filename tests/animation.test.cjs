const test=require('node:test'),assert=require('node:assert/strict');
const S=require('../dist/animation.js'),D=require('../dist/animation-data.js');
const flush=async()=>{for(let i=0;i<5;i++)await Promise.resolve();};
function fixture(extra={}){
 let clock=0,seq=0;const frames=new Map(),draws=[];
 const context={clearRect(){},drawImage(...args){draws.push(args);},imageSmoothingEnabled:false};
 const host={dataset:{}},canvas={parentElement:host,dataset:{},getContext:()=>context};
 const player=S.create({canvas,spec:D.actors.beetle,load:async path=>({path}),requestFrame:fn=>{frames.set(++seq,fn);return seq;},cancelFrame:id=>frames.delete(id),...extra});
 return {player,canvas,host,draws,frames,async step(delta){clock+=delta;const pending=[...frames.values()];frames.clear();for(const fn of pending)fn(clock);await flush();}};
}
test('only the five Stage 1 non-boss actors use all 25 supplied clips and 128 active frames',()=>{
 assert.equal(Object.keys(D.actors).length,5);let clips=0,frames=0;
 for(const [id,actor]of Object.entries(D.actors)){
  assert.equal(S.supports(0,id),true);assert.equal(S.supports(1,id),false);assert.equal(actor.facing,'left');
  for(const [action,a]of Object.entries(actor.animations)){clips++;frames+=a.frames.length;assert.equal(a.fps,{idle:6,attack:12,defend:10,skill:10,damaged:12}[action]);assert.equal(a.loop,action==='idle');assert.ok(a.frames.every(f=>f.length===4&&f[2]===768&&f[3]===768));}
 }
 assert.equal(clips,25);assert.equal(frames,128);assert.equal(S.supports(0,'sentinel'),false);assert.equal(S.supports(1,'dealer'),false);assert.equal(S.supports(0,'hero'),false);
});
test('idle advances at source FPS; non-looping Attack completes once and returns to idle',async()=>{
 const f=fixture();await flush();await f.step(0);await f.step(170);assert.equal(f.player.snapshot().frame,1);
 f.player.play('attack');await flush();await f.step(0);await f.step(84);assert.equal(f.player.snapshot().frame,1);
 assert.match(f.draws.at(-1)[0].path,/-attack\.webp$/);assert.deepEqual(f.draws.at(-1).slice(1,5),D.actors.beetle.animations.attack.frames[1]);
 await f.step(417);assert.equal(f.player.snapshot().action,'idle');assert.equal(f.player.snapshot().frame,0);f.player.destroy();assert.equal(f.frames.size,0);
});
test('every frame uses the same floor registration and source rectangles, without per-pose recentering',async()=>{
 const f=fixture();await flush();const matrix=f.draws.at(-1).slice(5);
 assert.deepEqual(matrix,[-160,-345,1920,1920]);
 for(const action of ['attack','defend','skill','damaged']){f.player.play(action);await flush();assert.deepEqual(f.draws.at(-1).slice(5),matrix);assert.equal(f.host.dataset.animationReady,'true');}
 f.player.destroy();assert.equal(f.host.dataset.animationReady,undefined);
});
test('pause freezes the exact frame and resumes without counting hidden time',async()=>{
 const f=fixture();await flush();f.player.play('skill');await flush();await f.step(0);await f.step(210);const before=f.player.snapshot();
 f.player.configure({paused:true});assert.equal(f.frames.size,0);await f.step(9000);assert.equal(f.player.snapshot().frame,before.frame);
 f.player.configure({paused:false});await f.step(0);assert.equal(f.player.snapshot().frame,before.frame);await f.step(100);assert.equal(f.player.snapshot().frame,before.frame+1);f.player.destroy();
});
test('Motion Off uses the supplied idle frame, schedules no animation, and never replays an action',async()=>{
 const f=fixture({motion:false});await flush();assert.equal(f.frames.size,0);f.player.play('attack');await flush();assert.equal(f.player.snapshot().action,'idle');assert.equal(f.player.snapshot().frame,0);assert.equal(f.frames.size,0);
 f.player.configure({motion:true});await flush();await f.step(0);await f.step(170);assert.equal(f.player.snapshot().action,'idle');assert.equal(f.player.snapshot().frame,1);f.player.destroy();
});
test('a late action load cannot replace a newer reaction or revive a destroyed actor',async()=>{
 const resolvers={};const f=fixture({load:path=>new Promise(resolve=>{resolvers[path]=()=>resolve({path});})});
 const actor=D.actors.beetle;resolvers[actor.animations.idle.image]();await flush();
 f.player.play('attack');f.player.play('damaged');resolvers[actor.animations.damaged.image]();await flush();const count=f.draws.length;
 resolvers[actor.animations.attack.image]();await flush();assert.equal(f.player.snapshot().action,'damaged');assert.equal(f.draws.length,count);
 f.player.play('skill');f.player.destroy();resolvers[actor.animations.skill.image]();await flush();assert.equal(f.draws.length,count);assert.equal(f.frames.size,0);
});
test('missing action textures recover to idle and a missing idle leaves the original image fallback',async()=>{
 const f=fixture({load:async path=>{if(path.includes('-attack'))throw new Error('missing');return {path};}});await flush();f.player.play('attack');await flush();assert.equal(f.player.snapshot().action,'idle');assert.equal(f.host.dataset.animationReady,'true');f.player.destroy();
 const failed=fixture({load:async()=>{throw new Error('missing');}});await flush();assert.equal(failed.host.dataset.animationReady,undefined);assert.equal(failed.frames.size,0);failed.player.destroy();
});
test('variable frame durations keep windup and recovery timing and finish exactly at the source total',async()=>{
 const actor=structuredClone(D.actors.beetle);actor.animations.attack.durationsMs=[130,150,100,120,150,160];
 const f=fixture({spec:actor});await flush();f.player.play('attack');await flush();await f.step(0);
 await f.step(129);assert.equal(f.player.snapshot().frame,0);
 await f.step(1);assert.equal(f.player.snapshot().frame,1);
 await f.step(149);assert.equal(f.player.snapshot().frame,1);
 await f.step(1);assert.equal(f.player.snapshot().frame,2);
 await f.step(529);assert.equal(f.player.snapshot().frame,5);assert.equal(f.player.snapshot().action,'attack');
 await f.step(1);assert.equal(f.player.snapshot().action,'idle');f.player.destroy();
});
test('actor scale and supplied per-frame boot pivots register wide attacks at the same arena floor',async()=>{
 const actor=structuredClone(D.actors.beetle);actor.sourcePivot=[512,768];actor.drawScale=1.08;
 actor.animations.attack.pivots=actor.animations.attack.frames.map((_,i)=>[i===1?555.5:512,768]);
 const f=fixture({spec:actor});await flush();f.player.play('attack');await flush();
 assert.deepEqual(f.draws.at(-1).slice(5),[800-512*1.08,1100-768*1.08,768*1.08,768*1.08]);
 await f.step(0);await f.step(84);assert.equal(f.player.snapshot().frame,1);
 assert.equal(f.draws.at(-1)[5],800-555.5*1.08);assert.equal(f.draws.at(-1)[6],1100-768*1.08);f.player.destroy();
});
test('Alyssa animation is available in both stages while enemy animation stays Stage 1 only',()=>{
 assert.equal(S.supports(0,'mc_01'),true);assert.equal(S.supports(1,'mc_01'),true);
 assert.equal(S.supports(2,'mc_01'),false);assert.equal(S.supports(1,'beetle'),false);
 assert.equal(S.spec(0,'mc_01').facing,'right');
});
test('all six Skill body silhouettes keep the same crown-to-floor size, independently of fire effects',async()=>{
 const clip=D.hero.animations.skill,crowns=[322,329,360,349,341,335];
 const heights=crowns.map((c,i)=>(clip.pivots[i][1]-c)*(clip.scales?.[i]||1));
 assert.ok(Math.max(...heights)-Math.min(...heights)<1,JSON.stringify(heights));
 const f=fixture({spec:D.hero});await flush();f.player.play('skill');await flush();await f.step(0);
 for(let i=0;i<6;i++){
  if(i)await f.step(clip.durationsMs[i-1]);
  assert.equal(f.player.snapshot().frame,i);
  const draw=f.draws.at(-1),scale=D.hero.drawScale*clip.scales[i];
  assert.ok(Math.abs(draw[6]+clip.pivots[i][1]*scale-D.floorPivot[1])<.000001);
  assert.ok(Math.abs(draw[7]-1024*scale)<.000001);
 }
 f.player.destroy();
});
