'use strict';
// Local-only seeded saves. This launcher is never copied into production.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const E=require('../../dist/engine.js'),C=require('../../dist/config.js'),D=require('../../dist/card-data.js');
const key=name=>D.cards.find(c=>c.name===name).id;
function fixture(){const r=E.newRun(8726,'learn');delete r.route;r.seq=0;r.deck=D.cards.map(c=>E.card(r,c.id));E.startBattle(r,'sentinel');r.battle.hp=r.battle.maxHp=10000;r.battle.seals=2;r.battle.enemyBlock=0;r.battle.currentIntent.damage=4;return r;}
function play(r,name){const b=r.battle,all=[...b.hand,...b.draw,...b.discard],i=all.findIndex(c=>c.key===key(name));assert.ok(i>=0,name);const c=all.splice(i,1)[0];b.hand=[c];b.draw=all;b.discard=[];b.energy=C.ENERGY;E.playCard(r,c.uid);}
function hand(r,names=['Rune Strike','Rune Guard','Ember Wall','Cinder Guard','Fate Storm']){const b=r.battle,all=[...b.hand,...b.draw,...b.discard];b.hand=names.map(name=>{const i=all.findIndex(c=>c.key===key(name));assert.ok(i>=0,name);return all.splice(i,1)[0];});b.draw=all;b.discard=[];b.energy=C.ENERGY;}
const names=['Blazing Spirit','Growing Flame','Swift Step','Battle Rhythm','Rune Armor','Lasting Shield','Grimoire Ward','Ember Core','Clear Mind','Last Ember'];
const scenarios=[];
function add(id,label,setup){const r=fixture();setup(r);hand(r);assert.ok(E.validate(r),label+' is a loadable save');scenarios.push({id,label,run:r});}
add('triple','Three triggered Passives',r=>{play(r,'Blazing Spirit');play(r,'Rune Armor');play(r,'Swift Step');});
add('ordered','Trigger order differs from equip order',r=>{play(r,'Growing Flame');play(r,'Rune Armor');play(r,'Blazing Spirit');for(let i=0;i<3;i++)play(r,'Rune Strike');});
add('shield','Shield and Thorns lifecycle',r=>{play(r,'Ember Wall');play(r,'Rune Guard');});
add('body','All body effects, no Passive floor (seeded status fixture)',r=>{
 const b=r.battle,s=b.cardCombat;b.block=12;s.statuses.thorns=2;s.statuses.thornsUntil=b.turn;
 for(const side of ['self','enemy']){s.statuses[side].weak=1;s.statuses[side].weakUntil=b.turn;s.statuses[side].vulnerable=1;s.statuses[side].vulnerableUntil=b.turn;}
 b.enemyBlock=15;b.enemyDefense=2;
});
for(const [id,name]of names.entries())add('passive-'+id,name,r=>{
 if(name==='Last Ember')r.hp=1;play(r,name);
 if(['Growing Flame','Battle Rhythm'].includes(name))for(let i=0;i<3;i++)play(r,name==='Battle Rhythm'?'Rune Guard':'Rune Strike');
 if(['Lasting Shield','Clear Mind'].includes(name)){r.battle.block=5;E.endTurn(r);}
 if(name==='Grimoire Ward')play(r,'Quick Study');
 if(name==='Ember Core'){r.battle.focus=1;E.armFocus(r);play(r,'Rune Strike');}
 assert.ok(r.battle.cardCombat.counters[key(name)].triggers>0);
});
assert.ok(process.argv[2],'Usage: node tools/qa/build-live-vfx.cjs /absolute/qa-output [source-build]');
const out=path.resolve(process.argv[2]),json=JSON.stringify(scenarios).replace(/</g,'\\u003c');
assert.ok(!['dist','release-prod'].some(name=>out===path.resolve(__dirname,'../..',name)),'Use a separate QA copy, not a production directory.');fs.mkdirSync(out,{recursive:true});
// The managed HTTP preview is not a secure context for Web Crypto. This
// test shell loads unchanged runtime modules/styles, as the DOM suite does.
// It deliberately does not claim to test the production resource bootstrap.
const shell=fs.readFileSync(path.resolve(process.argv[3]||path.resolve(__dirname,'../../dist'),'index.html'),'utf8')
 .replace(/<section id="resource-loader"[\s\S]*?<\/section>/,'')
 .replace(/<script src="bootstrap\.js[^\"]*"><\/script>/,'')
 .replace(/ type="application\/stm-runtime"/g,'').replace(/ media="not all" data-stm-style/g,'');
fs.writeFileSync(path.join(out,'vfx-game-shell.html'),shell);
fs.writeFileSync(path.join(out,'vfx-qa.html'),`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Live combat VFX QA</title>
<style>body{margin:0;background:#0d101a;color:#eee;font:14px system-ui}header{padding:10px}button,select{margin:3px;padding:7px;background:#24283a;color:#fff;border:1px solid #59617c;border-radius:5px}iframe{display:block;border:0;width:100%;height:900px}pre{white-space:pre-wrap;font-size:11px;padding:8px}#frames{overflow:auto}</style>
<header><b>Live game VFX QA — local fixtures</b><br><label>Scenario <select id="scenario"></select></label><button id="load">Load saved combat</button><button id="phone">390px phone</button><button id="desktop">Desktop</button><button id="low">Low quality</button><button id="full">Full quality</button><button id="capture">Read VFX state</button><output id="status"></output></header>
<div id="frames"><iframe id="game" title="Actual game" src="about:blank"></iframe></div><pre id="report"></pre>
<script>const scenarios=${json},select=document.querySelector('#scenario'),game=document.querySelector('#game');for(const s of scenarios){const o=document.createElement('option');o.value=s.id;o.textContent=s.label;select.append(o);}let quality='full';
function load(){localStorage.setItem('duel-cube-math.v1',JSON.stringify(scenarios.find(s=>s.id===select.value).run));localStorage.setItem('duel-cube-settings.v1',JSON.stringify({motion:true,sound:false,musicMuted:true,voiceMuted:true,combatEffects:quality}));game.src='./vfx-game-shell.html?qa='+Date.now();document.querySelector('#status').textContent='Choose Continue in the game. Runtime module harness; resource bootstrap excluded.';}
document.querySelector('#load').onclick=load;document.querySelector('#phone').onclick=()=>{game.style.width='390px';game.style.height='844px';};document.querySelector('#desktop').onclick=()=>{game.style.width='100%';game.style.height='900px';};for(const q of ['low','full'])document.querySelector('#'+q).onclick=()=>{quality=q;load();};
document.querySelector('#capture').onclick=()=>{const d=game.contentDocument;document.querySelector('#report').textContent=JSON.stringify([...d.querySelectorAll('.combat-vfx-canvas')].map(c=>(()=>{const enemy=c.closest('.enemy'),data=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let lit=0,floorAlpha=0;const floor=Math.ceil(c.height*(enemy?1000:1100)/1200);for(let i=3;i<data.length;i+=4){if(data[i])lit++;if(i>=floor*c.width*4)floorAlpha+=data[i];}return {role:enemy?'enemy':'player',width:c.width,height:c.height,...c.dataset,lit,floorAlpha};})()),null,2);};
<\/script>`);
console.log('Local QA launcher: '+path.join(out,'vfx-qa.html')+' ('+scenarios.length+' seeded combats)');
