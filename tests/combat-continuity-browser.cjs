/* Real production loader, engine commands, native painters and actor canvases. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const {chromium}=require(process.env.BROWSER_QA_MODULE||'playwright');
const E=require('../dist/engine.js'),C=require('../dist/config.js'),F=require('../tools/dev/fixtures.js'),cards=require('../dist/card-data.js');
const root=path.resolve(__dirname,'..'),out=process.env.QA_OUTPUT||'/tmp/stm-combat-continuity';
const report={version:require('../package.json').version,checks:[],observations:[],errors:[]};let server,browser;
function setup(names,passive=false){
 const r=F.create({seed:871,enemyHp:999,deck:cards.cards.map(c=>c.id)});
 function arrange(keys){const b=r.battle,all=[...b.hand,...b.draw,...b.discard];b.hand=[];b.discard=[];for(const key of keys){const i=all.findIndex(c=>c.key===key);assert(i>=0,key);b.hand.push(all.splice(i,1)[0]);}b.draw=all;}
 if(passive){arrange(['stm.passive.rune_armor']);E.playCard(r,r.battle.hand[0].uid);}
 arrange(names);r.battle.energy=C.ENERGY;r.battle.currentIntent.damage=3;assert(E.validate(r));return r;
}
async function enter(p,r){
 await p.clock.install();
 await p.addInitScript(r=>{localStorage.setItem('duel-cube-math.v1',JSON.stringify(r));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:true,sound:false,musicMuted:true,voiceMuted:true}));},r);
 await p.goto(report.url);await p.waitForFunction(()=>['resource-enter','resource-online'].some(id=>{const element=document.getElementById(id);return element&&!element.hidden;}),null,{timeout:120000});await p.locator(await p.locator('#resource-enter').isVisible()?'#resource-enter':'#resource-online').click();
 await p.evaluate(()=>{
  window.__continuity={flashes:0,shield:[],passive:[],surfaces:[...document.querySelectorAll('.actor-animation,.combat-vfx-canvas')]};
  new MutationObserver(records=>{if(records.some(r=>r.oldValue?.split(/\s+/).includes('scene-preparing'))||document.body.classList.contains('scene-preparing'))__continuity.flashes++;}).observe(document.body,{attributes:true,attributeFilter:['class'],attributeOldValue:true});
  const shield=STMShieldField.create;STMShieldField.create=function(){const f=shield();return {...f,paint(...args){const s=f.paint(...args);__continuity.shield.push({at:performance.now(),event:s.event,formation:s.formation,visibility:s.visibility,phase:s.phase});return s;}};};
  const passive=STMPassiveField.create;STMPassiveField.create=function(...options){const f=passive(...options);return {...f,paint(...args){const s=f.paint(...args);__continuity.passive.push({at:performance.now(),entrance:s.entrance});return s;}};};
 });
 await p.locator('[data-action=continue]').click();await p.waitForFunction(()=>!document.body.classList.contains('scene-preparing')&&document.querySelector('.player [data-animation-ready=true]'));
 await p.evaluate(()=>{__continuity.flashes=0;__continuity.shield=[];__continuity.passive=[];__continuity.surfaces=[...document.querySelectorAll('.actor-animation,.combat-vfx-canvas')];});
 const pauseTime=await p.evaluate(()=>Date.now());
 await p.clock.setFixedTime(pauseTime);
 await p.clock.pauseAt(pauseTime);
 await p.clock.setSystemTime(pauseTime);
 await p.clock.runFor(50);
}
async function command(p,action,key){
 const expected=await p.evaluate(({action,key})=>{const r=JSON.parse(localStorage.getItem('duel-cube-math.v1')),x=DCEngine.clone(r);if(action==='play'){const c=r.battle.hand.find(c=>c.key===key);DCEngine.playCard(x,c.uid);return {run:x,uid:c.uid};}DCEngine.endTurn(x);return {run:x};},{action,key});
 await p.locator('[data-action="'+action+'"]'+(expected.uid?'[data-id="'+expected.uid+'"]':'')).evaluate(el=>el.click());
 assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('duel-cube-math.v1'))),expected.run,'presentation must retain exact engine/save/RNG output');
}
function check(name,passed){report.checks.push({name,passed});}
(async()=>{try{
 fs.mkdirSync(out,{recursive:true});
 server=spawn(process.execPath,['server.cjs','--prod'],{cwd:root,env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
 const port=await new Promise((resolve,reject)=>{let text='';server.stdout.on('data',b=>{text+=b;const m=text.match(/Game: http:\/\/localhost:(\d+)/);if(m)resolve(m[1]);});server.once('error',reject);server.once('exit',c=>reject(Error('server exited '+c)));});report.url='http://127.0.0.1:'+port+'/';
 browser=await chromium.launch({headless:true,executablePath:process.env.QA_CHROMIUM_EXECUTABLE||'/tmp/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const width of [1366,390]){
  const p=await browser.newPage({viewport:{width,height:900},reducedMotion:'no-preference'});p.on('pageerror',e=>report.errors.push(e.message));
  await enter(p,setup(['stm.defend.rune_guard','stm.attack.rune_strike','stm.skill.quick_study']));
  await command(p,'play','stm.defend.rune_guard');await p.clock.runFor(100);
  await p.evaluate(()=>__continuity.shield=[]);await command(p,'play','stm.attack.rune_strike');await p.clock.runFor(100);
  const preserved=await p.evaluate(()=>__continuity.shield.some(s=>s.event==='gain'));check(width+': another card retains Shield formation',preserved);
  await p.clock.runFor(550);await command(p,'end-turn');await p.clock.runFor(150);
  const impact=await p.evaluate(()=>__continuity.shield.some(s=>s.event==='break'||s.event==='hit'));check(width+': enemy impact starts within 150ms',impact);
  await p.clock.runFor(850);
  const seen=await p.evaluate(()=>({flashes:__continuity.flashes,sameSurfaces:__continuity.surfaces.every((c,i)=>c===document.querySelectorAll('.actor-animation,.combat-vfx-canvas')[i]),events:JSON.parse(document.querySelector('.player [data-vfx-layer=front]').dataset.vfxEvents),actor:document.querySelector('.player .actor-animation').dataset.action,overflow:document.documentElement.scrollWidth>innerWidth}));
  report.observations.push({width,...seen});check(width+': no room-loader flash during cards/End Turn',seen.flashes===0);check(width+': no obsolete hit queue after one second',seen.events.length===0);check(width+': same actor/VFX canvases and no horizontal overflow',seen.sameSurfaces&&!seen.overflow);
  await p.screenshot({path:path.join(out,'combat-'+width+'.jpg'),type:'jpeg',quality:85});await p.close();
 }
 // The initial Rune Armor actually triggered in the engine; add a second real Passive.
 const p=await browser.newPage({viewport:{width:1366,height:900},reducedMotion:'no-preference'});p.on('pageerror',e=>report.errors.push(e.message));
 await enter(p,setup(['stm.passive.blazing_spirit','stm.attack.rune_strike'],true));await p.clock.runFor(100);
 await command(p,'play','stm.passive.blazing_spirit');await p.clock.runFor(100);
 const layer=await p.evaluate(()=>({entrances:__continuity.passive.map(s=>s.entrance),layers:JSON.parse(document.querySelector('.player [data-vfx-layer=front]').dataset.vfxPassives)}));
 report.observations.push({passive:layer});check('second Passive never dims the existing circle',layer.entrances.length>0&&layer.entrances.every(n=>n>.99));
 await p.clock.runFor(850);await p.screenshot({path:path.join(out,'passive-layers.jpg'),type:'jpeg',quality:85});
 await p.locator('[data-action=saves]').evaluate(el=>el.click());await p.clock.runFor(100);check('dialog stops all VFX surfaces',await p.evaluate(()=>[...document.querySelectorAll('.combat-vfx-canvas')].every(c=>c.dataset.vfxState==='paused')));
 await p.locator('#motion-toggle').uncheck();await p.locator('[data-action=close]:visible').evaluate(el=>el.click());await p.clock.runFor(100);check('Motion Off retains readable statuses and stops VFX',await p.evaluate(()=>[...document.querySelectorAll('.combat-vfx-canvas')].every(c=>c.dataset.vfxState==='paused')&&!!document.querySelector('.player [data-id=strength]')));
 await p.close();check('no uncaught browser exception',report.errors.length===0);assert(report.checks.every(c=>c.passed),report.checks.filter(c=>!c.passed).map(c=>c.name).join('\n'));
 }finally{fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');await browser?.close();server?.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
