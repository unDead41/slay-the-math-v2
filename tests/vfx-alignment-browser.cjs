/* Actual production painting matrices and pixels, checked against source-body landmarks. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
const {chromium}=require(process.env.BROWSER_QA_MODULE||'playwright');
const E=require('../dist/engine.js'),F=require('../tools/dev/fixtures.js'),data=require('../dist/card-data.js'),refs=require('./fixtures/vfx-body-reference.json');
const root=path.resolve(__dirname,'..'),out=process.env.QA_OUTPUT||'/tmp/stm-vfx-alignment',report={version:require('../package.json').version,cases:[],errors:[]};let server,browser;
function fixture(actor,passives=false){
 const r=F.create({seed:91,stage:actor.stage,enemy:actor.actor==='mc_01'?'beetle':actor.actor,enemyHp:999,deck:data.cards.map(c=>c.id)});
 if(passives)for(const key of ['stm.passive.rune_armor','stm.passive.blazing_spirit','stm.passive.swift_step']){
  const b=r.battle,all=[...b.hand,...b.draw,...b.discard],index=all.findIndex(c=>c.key===key),c=all.splice(index,1)[0];b.hand=[c];b.draw=all;b.discard=[];b.energy=3;E.playCard(r,c.uid);
 }
 Object.assign(r.battle,{block:6,enemyBlock:8,enemyDefense:1});Object.assign(r.battle.cardCombat.statuses.enemy,{vulnerable:1,vulnerableUntil:r.battle.turn+1});assert(E.validate(r));return r;
}
async function entry(p){await p.waitForFunction(()=>['resource-enter','resource-online'].some(id=>{const e=document.getElementById(id);return e&&!e.hidden;}),null,{timeout:120000});await p.locator(await p.locator('#resource-enter').isVisible()?'#resource-enter':'#resource-online').click();}
async function open(p,r,quality='full'){
 await p.clock.resume();await p.evaluate(({r,quality})=>{localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:true,combatEffects:quality,sound:false,musicMuted:true,voiceMuted:true}));},{r,quality});await p.reload();await entry(p);
 await p.evaluate(()=>{
  window.__fit={samples:{},bodies:new WeakMap(),serial:0};
  function record(ctx,kind){const owner=ctx.canvas.closest('.combatant'),role=owner?(owner.classList.contains('player')?'player':'enemy'):(__fit.bodies.get(ctx.canvas)||(__fit.serial++===0?'player':'enemy'));if(!owner)__fit.bodies.set(ctx.canvas,role);const m=ctx.getTransform();__fit.samples[role+':'+kind]={a:m.a,d:m.d,e:m.e,f:m.f,width:ctx.canvas.width,height:ctx.canvas.height};}
  for(const [api,kind]of [[STMShieldField,'shield'],[STMAuraField,'aura'],[STMPassiveField,'passive']]){const create=api.create;api.create=function(...o){const f=create(...o);return {...f,paint(ctx,...args){record(ctx,kind);return f.paint(ctx,...args);}};};}
 });
 await p.locator('[data-action=continue]').click();await p.waitForFunction(()=>!document.body.classList.contains('scene-preparing')&&[...document.querySelectorAll('.actor-animation')].every(c=>c.parentElement.dataset.animationReady==='true'));
 const t=await p.evaluate(()=>Date.now());await p.clock.setFixedTime(t);await p.clock.pauseAt(t);await p.clock.setSystemTime(t);await p.clock.runFor(400);
}
async function observe(p){return p.evaluate(()=>{
 const result={samples:__fit.samples,actors:{},noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth};
 for(const role of ['player','enemy']){const c=document.querySelector('.'+role+' .actor-animation'),r=c.getBoundingClientRect(),v=[...document.querySelectorAll('.'+role+' .combat-vfx-canvas')],id=role==='player'?'mc_01':c.dataset.actor,spec=role==='player'?DCAnimationData.hero:DCAnimationData.actors[id],floor=(spec.floorPivot||DCAnimationData.floorPivot)[1];let below=0,nonempty=0;
  for(const el of v){const a=el.getContext('2d').getImageData(0,0,el.width,el.height).data,fy=Math.ceil(el.height*floor/1200);for(let i=3;i<a.length;i+=4){if(a[i]){nonempty++;if(Math.floor((i/4)/el.width)>=fy)below++;}}}
  result.actors[role]={rect:{left:r.left,top:r.top,width:r.width,height:r.height},nonempty,belowFloor:below};
 }return result;
 });}
async function verifySourceReferences(p){
 const measured=await p.evaluate(async refs=>{
  const results=[];
  for(const ref of refs){
   const d=DCAnimationData,spec=ref.actor==='mc_01'?d.hero:d.actors[ref.actor],idle=spec.animations.idle;
   const projection={canvas:d.canvas,sourceRect:idle.frames[0],sourcePivot:idle.pivots?.[0]||spec.sourcePivot||d.sourcePivot,drawScale:(spec.drawScale??d.drawScale)*(idle.scales?.[0]??1),floor:spec.floorPivot||d.floorPivot};
   const image=new Image();image.src='assets/'+idle.image;await image.decode();
   const c=document.createElement('canvas');[c.width,c.height]=d.canvas;
   const ctx=c.getContext('2d'),r=projection.sourceRect,v=projection.sourcePivot,s=projection.drawScale,f=projection.floor;
   ctx.drawImage(image,...r,f[0]-v[0]*s,f[1]-v[1]*s,r[2]*s,r[3]*s);
   const pixels=ctx.getImageData(0,0,c.width,c.height).data;let left=c.width,top=c.height,right=-1,bottom=-1;
   for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(pixels[(y*c.width+x)*4+3]>96){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
   results.push({actor:ref.actor,projection,opaqueBounds:[left,top,right,bottom]});image.src='';c.width=c.height=1;
  }
  return results;
 },refs.actors);
 for(const actual of measured){
  const ref=refs.actors.find(a=>a.actor===actual.actor);assert.deepEqual(actual.projection,ref.projection,ref.actor+' source registration');
  assert(actual.opaqueBounds.every((value,i)=>Math.abs(value-ref.opaqueBounds[i])<=1),ref.actor+' independently rendered source bounds');
 }
 report.sourceMeasurements=measured;
}
function verify(obs,role,ref){
 const actor=obs.actors[role],m=obs.samples[role+':shield'],r=actor.rect;assert(m&&actor.nonempty>0,role+' shield pixels');
 const aura=obs.samples[role+':aura'];if(aura)for(const key of ['a','d','e','f'])assert(Math.abs(aura[key]-m[key])<.000001,role+' stat/debuff fields must share the registered body transform');
 const ux=r.width/m.width,uy=r.height/m.height,x=r.left+m.e*ux,y=r.top+(m.f-145*m.d)*uy,wantX=r.left+ref.bodyAxisX/1600*r.width,wantY=r.top+(ref.opaqueBounds[1]+ref.opaqueBounds[3])/2/1200*r.height,h=(ref.opaqueBounds[3]-ref.opaqueBounds[1])/1200*r.height;
 assert(Math.abs(x-wantX)<2,ref.actor+' body centre error '+(x-wantX));assert(Math.abs(y-wantY)<h*.06,ref.actor+' vertical centre error '+(y-wantY));
 const top=r.top+(m.f-314*m.d)*uy,head=r.top+ref.opaqueBounds[1]/1200*r.height;assert(top<=head+2,ref.actor+' shell must reach above the visible head');
 assert.equal(actor.belowFloor,0,'body-only VFX must stay above the floor');return {actor:ref.actor,horizontalErrorPx:x-wantX,verticalErrorPx:y-wantY,bodyHeightPx:h,shieldTop:top,headTop:head};
}
(async()=>{try{
 fs.mkdirSync(out,{recursive:true});for(const a of refs.actors)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'dist/assets',a.source))).digest('hex'),a.sourceSha256);
 server=spawn(process.execPath,['server.cjs','--prod'],{cwd:root,env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});const port=await new Promise((resolve,reject)=>{let s='';server.stdout.on('data',b=>{s+=b;const m=s.match(/Game: http:\/\/localhost:(\d+)/);if(m)resolve(m[1]);});server.once('error',reject);server.once('exit',c=>reject(Error('server '+c)));});
 browser=await chromium.launch({headless:true,executablePath:process.env.QA_CHROMIUM_EXECUTABLE||'/tmp/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});const page=await browser.newPage({viewport:{width:2048,height:1152},reducedMotion:'no-preference'});page.on('pageerror',e=>report.errors.push(e.message));await page.clock.install();await page.goto('http://127.0.0.1:'+port+'/');await entry(page);
 await verifySourceReferences(page);
 const hero=refs.actors.find(a=>a.actor==='mc_01'),beetle=refs.actors.find(a=>a.actor==='beetle');
 const cases=[...refs.actors.filter(a=>a.actor!=='mc_01').map(a=>({actor:a,width:1366,height:900,quality:'full'})),...[[2048,1152,'full'],[390,844,'low'],[844,390,'full'],[3840,2160,'full']].map(([width,height,quality])=>({actor:beetle,width,height,quality}))];
 for(const c of cases){await page.setViewportSize({width:c.width,height:c.height});const r=fixture(c.actor);await open(page,r,c.quality);const observed=await observe(page);assert(observed.noHorizontalOverflow);const checks=[verify(observed,'player',hero),verify(observed,'enemy',c.actor)];assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1'))),r,'VFX must not mutate the save/RNG');report.cases.push({...c,checks});
  if(c.actor.actor==='beetle'||['bat','mimic','dealer'].includes(c.actor.actor))await page.screenshot({path:path.join(out,c.actor.actor+'-'+c.width+'.jpg'),type:'jpeg',quality:86});console.error('Aligned '+c.actor.actor+' '+c.width+' / '+c.quality);
 }
 await page.setViewportSize({width:1366,height:900});const r=fixture(beetle,true);await open(page,r);await page.clock.runFor(500);const passive=await observe(page),m=passive.samples['player:passive'],rect=passive.actors.player.rect;
 assert(Math.abs(m.e/m.width*1600-hero.bodyAxisX)<2);assert(Math.abs(m.f/m.height*1200-hero.floor[1])<2);assert(passive.actors.player.belowFloor>0,'only real Passive circles own floor pixels');report.passive={threeRealTriggers:true,sourceX:m.e/m.width*1600,sourceY:m.f/m.height*1200};await page.screenshot({path:path.join(out,'three-passives.jpg'),type:'jpeg',quality:86});
 assert.deepEqual(report.errors,[]);report.passed=true;
 }finally{fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');await browser?.close();server?.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
