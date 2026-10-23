'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom');
const dir=path.resolve(__dirname,'../dist'),I=require('../dist/icon-assets.js'),E=require('../dist/engine.js');
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split(/[?#]/)[0]);
function boot(run,embedded=false){
 const dom=new JSDOM(html,{url:'https://icons.example/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,d=w.document;
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 w.localStorage.setItem('duel-cube-settings.v1',JSON.stringify({sound:false,motion:false,musicMuted:true,voiceMuted:true}));
 if(run)w.localStorage.setItem('duel-cube-math.v1',JSON.stringify(run));
 if(embedded)w.DC_ASSETS=Object.fromEntries(Object.values(I.entries).map(file=>[file,'data:image/webp;base64,'+fs.readFileSync(path.join(dir,'assets',file)).toString('base64')]));
 for(const file of scripts)w.eval(fs.readFileSync(path.join(dir,file),'utf8'));
 const click=selector=>{const el=d.querySelector(selector);assert.ok(el,selector);assert.equal(el.disabled,false,selector);el.click();};
 return{dom,w,d,click,state:()=>JSON.parse(w.localStorage.getItem('duel-cube-math.v1'))};
}

test('all reviewed runtime derivatives decode with checked hashes, alpha padding and a common canvas',async()=>{
 const sharp=require(process.env.IMAGE_QA_MODULE||'sharp'),metadata=require('../dist/assets/icon-package.json');
 assert.equal(Object.keys(I.entries).length,130);assert.equal(new Set(Object.values(I.entries)).size,129);assert.equal(metadata.assets.length,129);
 for(const record of metadata.assets){
  const bytes=fs.readFileSync(path.join(dir,'assets',record.runtime));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),record.runtimeSha256,record.id);
  const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.equal(info.width,512);assert.equal(info.height,512);assert.equal(info.channels,4);
  let visible=0;
  for(let y=0;y<512;y++)for(let x=0;x<512;x++){const alpha=data[(y*512+x)*4+3];if(x<40||y<40||x>=472||y>=472)assert.equal(alpha,0,record.id+' outer padding');else if(alpha)visible++;}
  assert.ok(visible>1000,record.id+' contains visible artwork');
 }
});

test('one resolver serves host aliases, source artifact UI and portable embeds without confusing icon meanings',()=>{
 const A=require('../dist/artifact-data.js').artifacts,cards=require('../dist/card-data.js').cards;
 assert.equal(Object.keys(I.artifacts).length,31);assert.equal(Object.keys(I.cards).length,40);assert.equal(Object.keys(I.status).length,10);assert.equal(Object.keys(I.map).length,6);
 assert.notEqual(I.ui.focus,I.ui.predict);assert.notEqual(I.status.defense,I.status.block);assert.notEqual(I.status.weak,I.status.vulnerable);assert.notEqual(I.ui.bossSealOpen,I.ui.bossSealClosed);
 assert.equal(I.entries['ui.sound_asset'],I.ui.volume);assert.equal(I.ui.rest,I.map.camp);
 for(const a of A){assert.equal(I.resolve(a.icon),'assets/'+I.artifacts[a.id]);assert.equal(I.resolve(a.icon,{[I.artifacts[a.id]]:'data:verified'}),'data:verified');}
 for(const c of cards){assert.ok(I.cards[c.icon]);assert.equal(I.cards[c.icon],'assets/'+I.entries[c.id]);}
 assert.equal(I.resolve('alyssa-right-idle.webp'),'assets/alyssa-right-idle.webp','non-icon artwork retains its existing path');
});

test('regenerating the supplier card adapter preserves reviewed illustration overrides and original portrait frames',()=>{
 require('../tools/import-cards.cjs')(path.resolve(__dirname,'..'));
 const sandbox={};vm.runInNewContext(fs.readFileSync(path.join(dir,'card-assets.js'),'utf8'),sandbox);
 const original=require('../dist/assets/card-assets.json').runtimePaths;
 for(const [logical,runtime]of Object.entries(I.cards))assert.equal(sandbox.STM_CARD_ASSETS[logical],runtime);
 for(const [logical,runtime]of Object.entries(original))if(!I.cards[logical])assert.equal(sandbox.STM_CARD_ASSETS[logical],runtime);
 assert.deepEqual(require('../dist/card-data.js'),require('../modules/cards/source/data/card-data.js'),'visual integration leaves authored card values intact');
 assert.ok(scripts.indexOf('icon-assets.js')<scripts.indexOf('card-assets.js'));
});

test('live boss seals, enemy intent, status details and card art keep the same save and numeric meaning online and offline',()=>{
 for(const embedded of [false,true]){
  const r=E.newRun(42);delete r.route;E.startBattle(r,'sentinel');E.endTurn(r);r.battle.seals=1;r.battle.block=8;
  assert.ok(E.validate(r));const {dom,d,click,state}=boot(r,embedded);
  try{
   click('[data-action=continue]');const src=file=>embedded?'data:image/webp;base64,':'assets/'+file;
   for(const [selector,file]of [['.seal.open img',I.ui.bossSealOpen],['.seal:not(.open) img',I.ui.bossSealClosed],['.enemy .intent img',I.ui.intentAttackBlock],['[data-id=block][data-action=status-details] img',I.status.block.replace('assets/','')]])assert.ok(d.querySelector(selector).getAttribute('src').startsWith(src(file)),selector);
   const before=state();click('[data-action=status-details][data-id=block]');assert.match(d.querySelector('#dialog').textContent,/Block: 8.*Absorb up to 8/);assert.deepEqual(state(),before);click('#dialog [data-action=close]');
   const c=require('../dist/card-data.js').cards.find(c=>c.id===r.battle.hand[0].key);assert.ok(d.querySelector('.package-card-art img').getAttribute('src').startsWith(src(I.entries[c.id])));
  }finally{dom.window.close();}
 }
});

test('Sound, Save and topic icon states survive rerendering without changing settings semantics or adding game actions',()=>{
 const {dom,w,d,click}=boot();
 try{
  click('[data-action=music]');const icon=action=>d.querySelector('[data-action='+action+'] img').getAttribute('src');
  assert.equal(icon('music-mute'),'assets/'+I.ui.muted);assert.equal(icon('voice-mute'),'assets/'+I.ui.muted);assert.equal(icon('sound'),'assets/'+I.ui.muted);
  click('[data-action=music-mute]');assert.equal(icon('music-mute'),'assets/'+I.ui.volume);assert.equal(icon('voice-mute'),'assets/'+I.ui.muted);
  click('[data-action=voice-mute]');assert.equal(icon('voice-mute'),'assets/'+I.ui.volume);
  click('[data-action=sound]');assert.equal(icon('sound'),'assets/'+I.ui.volume);assert.equal(icon('music-mute'),'assets/'+I.ui.volume);
  click('#dialog [data-action=close]');click('[data-action=saves]');assert.equal(d.querySelector('.save-status-heading img').getAttribute('src'),'assets/'+I.ui.save);assert.equal(icon('export'),'assets/'+I.ui.exportSave);assert.equal(icon('import'),'assets/'+I.ui.importSave);assert.equal(d.querySelector('[data-action=export]').disabled,true);
  click('#dialog [data-action=close]');click('[data-action=new]');click('[data-action=start-challenge]');click('[data-action=select-artifact]');click('[data-action=claim-artifact]');
  const r=JSON.parse(w.localStorage.getItem('duel-cube-math.v1')),q=w.DCEducation.current(r);assert.equal(d.querySelector('.education-panel .topic-icon').getAttribute('src'),'assets/'+I.topics[q.topicCode]);
 }finally{dom.window.close();}
});
