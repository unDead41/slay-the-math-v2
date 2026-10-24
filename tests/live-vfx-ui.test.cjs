'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom'),E=require('../dist/engine.js'),C=require('../dist/config.js');
const root=path.resolve(__dirname,'../dist');
function boot({canvas=true,block=0}={}){
 const run=E.newRun(71,'learn');delete run.route;E.startBattle(run,'wisp');run.battle.hp=run.battle.maxHp=999;
 run.battle.block=block;
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),dom=new JSDOM(html,{url:'https://live-vfx.example/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,d=w.document;
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 if(canvas)w.CanvasRenderingContext2D=function(){};w.HTMLCanvasElement.prototype.getContext=function(){return {clearRect(){},drawImage(){}};};
 w.Image=class{naturalWidth=512;naturalHeight=512;decode(){return Promise.resolve();}};
 w.localStorage.setItem('duel-cube-math.v1',JSON.stringify(run));w.localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:true,sound:false,musicMuted:true,voiceMuted:true}));
 for(const m of html.matchAll(/<script src="([^"]+)"/g))w.eval(fs.readFileSync(path.join(root,m[1].split('?')[0]),'utf8'));
 d.querySelector('[data-action=continue]').click();return {w,d,close(){w.dispatchEvent(new w.Event('pagehide'));w.close();}};
}
test('the actual game mounts independent front/back VFX canvases on both original actors',()=>{
 const f=boot();try{const canvases=[...f.d.querySelectorAll('.combat-vfx-canvas')];assert.equal(canvases.length,4);
  for(const side of ['player','enemy']){const own=f.d.querySelectorAll('.'+side+' .combat-vfx-canvas');assert.equal(own.length,2);assert.equal(own[0].getAttribute('aria-hidden'),'true');}
  assert.equal(f.d.querySelectorAll('.actor-animation').length,2);
 }finally{f.close();}
});
test('committed card updates keep the VFX surfaces and exact engine result',()=>{
 const f=boot();try{const before=JSON.parse(f.w.localStorage.getItem('duel-cube-math.v1')),card=before.battle.hand.find(c=>C.cards[c.key].role==='attack'&&!E.canPlay(before,c)),expected=E.clone(before),canvases=[...f.d.querySelectorAll('.combat-vfx-canvas')];
  assert.equal(canvases.length,4);E.playCard(expected,card.uid);f.d.querySelector('[data-action=play][data-id="'+card.uid+'"]').click();
  assert.deepEqual(JSON.parse(f.w.localStorage.getItem('duel-cube-math.v1')),expected);assert.ok(canvases.every((c,i)=>c===f.d.querySelectorAll('.combat-vfx-canvas')[i]));
 }finally{f.close();}
});
test('Canvas-less live combat keeps readable status badges without old decorative floor effects',()=>{
 const f=boot({canvas:false,block:6});try{
  assert.match(f.d.querySelector('.player').textContent,/Block/);
  assert.equal(f.d.querySelectorAll('[data-status-aura]').length,0);
 }finally{f.close();}
});
