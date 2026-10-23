const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom'),E=require('../dist/engine.js');
const {room,winBattle}=require('./helpers/economy.cjs');
function boot(run){const base=path.join(__dirname,'../dist'),html=fs.readFileSync(path.join(base,'index.html'),'utf8'),dom=new JSDOM(html,{url:'https://game.example/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 w.localStorage.setItem('duel-cube-math.v1',JSON.stringify(run));w.localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:false,sound:false,musicMuted:true}));
 for(const m of html.matchAll(/<script src="([^"]+)"/g))w.eval(fs.readFileSync(path.join(base,m[1].split('?')[0]),'utf8'));
 w.document.querySelector('[data-action=continue]').click();return dom;
}
test('candidate reward and Rest show the actual profile amounts',()=>{
 for(const [type,expect]of [['battle','+30 GOLD'],['camp','Heal 20 HP']]){const r=room(type,'easy');if(type==='battle')winBattle(r);const dom=boot(r);try{assert.ok(dom.window.document.body.textContent.includes(expect));assert.ok(dom.window.document.body.textContent.includes('Economy test'));}finally{dom.window.close();}}
});
test('locked Boss slot is explained and disabled in the actual Shop UI',()=>{
 const dom=boot(room('shop'));try{const w=dom.window;w.document.querySelector('[data-action=shop-tab][data-id=artifacts]').click();const slot=w.document.querySelectorAll('.shop-artifact-slot')[5];assert.match(slot.textContent,/Stage 2/);assert.equal(slot.querySelector('[data-action=buy-artifact]').disabled,true);}finally{dom.window.close();}
});
