'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom'),E=require('../dist/engine.js'),CS=require('../dist/combat-status.js'),I=require('../dist/icon-assets.js'),fixture=require('./helpers/icon-status.cjs');
const root=path.resolve(__dirname,'../dist'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),scripts=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);
function boot(run=fixture()){
 const dom=new JSDOM(html,{url:'https://icon-audit.example/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,d=w.document;
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 w.localStorage.setItem('duel-cube-math.v1',JSON.stringify(run));w.localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true,voiceMuted:true}));
 for(const file of scripts)w.eval(fs.readFileSync(path.join(root,file),'utf8'));
 const click=selector=>{const el=d.querySelector(selector);assert.ok(el,selector);assert.equal(el.disabled,false,selector);el.click();};
 click('[data-action=continue]');return{dom,w,d,click,state:()=>JSON.parse(w.localStorage.getItem('duel-cube-math.v1'))};
}
test('all statuses are named, ordered by immediate risk, and available for comparison without changing a save',()=>{
 const run=fixture(),{dom,d,click,state}=boot(run);
 try{
  const rack=d.querySelector('[data-status-owner=player] .combat-status-rack');assert.equal(rack.children.length,10);assert.equal(rack.children[0].dataset.id,'weak');assert.equal(rack.children[1].dataset.id,'vulnerable');
  for(const status of CS.view(run,'player')){const node=rack.querySelector('[data-id="'+status.id+'"]');assert.equal(node.querySelector('.status-name').textContent,status.label);assert.equal(node.querySelector('b').textContent,String(status.value));}
  const before=state();click('[data-action=statuses][data-who=player]');assert.equal(d.querySelectorAll('.status-overview-grid .combat-status-badge').length,10);
  assert.equal(new Set([...d.querySelectorAll('.status-overview-grid img')].map(im=>im.getAttribute('src'))).size,10);
  assert.deepEqual([...d.querySelectorAll('.status-overview-grid .status-kind')].reduce((n,x)=>(n[x.textContent]=(n[x.textContent]||0)+1,n),{}),{Debuff:2,Buff:5,'Next turn':3});
  click('#dialog [data-action=status-details][data-id=retain-block]');assert.match(d.querySelector('#dialog').textContent,/retention cap, not extra Block/);click('#dialog [data-action=statuses]');
  assert.equal(d.querySelectorAll('.status-overview-grid .combat-status-badge').length,10);assert.deepEqual(state(),before);
  click('#dialog [data-action=close]');click('[data-action=statuses][data-who=enemy]');assert.match(d.querySelector('#dialog-title').textContent,/Twin Sigil Guardian/);assert.equal(d.querySelectorAll('.status-overview-grid .combat-status-badge').length,CS.view(run,'enemy').length);assert.deepEqual(state(),before);
 }finally{dom.window.close();}
});
test('the status comparison never invents entries when queues expire or combat has no effects',()=>{
 const r=fixture();E.endTurn(r);const {dom,d,click}=boot(r);
 try{click('[data-action=statuses][data-who=player]');for(const id of ['next-draw','next-block','retain-block','thorns'])assert.equal(d.querySelector('.status-overview-grid [data-id="'+id+'"]'),null);}
 finally{dom.window.close();}
});
test('utility artwork has explicit semantic keys; soundtrack and deck actions use the correct existing picture',()=>{
 const {dom,d,click}=boot();
 try{
  assert.equal(d.querySelector('[data-icon-missing]'),null);assert.ok(d.querySelector('.hand-count [data-icon=hand]'));
  click('[data-action=music]');for(const [track,expected]of [['bgm_rest',I.map.camp],['bgm_shop',I.map.shop],['mystery',I.map.event]]){const image=d.querySelector('[data-track="'+track+'"] img.icon');assert.ok(image,track);assert.equal(image.getAttribute('src'),'assets/'+expected);}
  assert.equal(d.querySelector('[data-icon-missing]'),null);click('#dialog [data-action=close]');
 }finally{dom.window.close();}
});
test('a Block-only preview is labelled Block, not zero damage or a made-up Skill',()=>{
 const r=fixture();r.battle.currentIntent={damage:0,block:4,label:'Guard',rage:0};const {dom,d}=boot(r);
 try{assert.match(d.querySelector('.enemy .intent strong').textContent,/4 BLOCK/);assert.equal(d.querySelector('.enemy .intent img').dataset.icon,'shield');assert.doesNotMatch(d.querySelector('.enemy .intent strong').textContent,/DAMAGE/);}
 finally{dom.window.close();}
});
