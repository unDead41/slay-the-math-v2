'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const E=require('../dist/engine.js'),S=require('../dist/combat-status.js'),V=require('../dist/status-vfx.js'),fixture=require('./helpers/icon-status.cjs');
test('all ten effects have complete BM names, effect, units, timing and descriptions without mutating gameplay',()=>{
 const r=fixture(),before=JSON.stringify(r),en=S.view(r,'player'),bm=S.view(r,'player','ms');assert.equal(bm.length,10);
 const labels=['Weak','Vulnerable','Strength','Agility','Defense','Block','Thorns','Draw seterusnya','Block Seterusnya','Simpan Block'];
 for(const x of bm){assert.ok(labels.includes(x.label),x.label);assert.ok(x.summary&&x.measure&&x.timing&&x.description);assert.equal(x.value,en.find(a=>a.id===x.id).value);}
 assert.match(bm.find(x=>x.id==='weak').summary,/−25%/);assert.match(bm.find(x=>x.id==='weak').measure,/2 fasa serangan/);assert.match(bm.find(x=>x.id==='weak').inlineMeasure,/−25%.*2 fasa/);assert.match(bm.find(x=>x.id==='vulnerable').summary,/\+50%/);assert.match(bm.find(x=>x.id==='retain-block').summary,/baki Block/);assert.equal(JSON.stringify(r),before);
});
test('the same status ID explains archived hit stacks and current phase durations separately',()=>{
 const r=E.restore(E.clone(require('./fixtures/card-effects-legacy.json').vulnerable)),old=S.view(r,'enemy','ms').find(x=>x.id==='vulnerable'),current=S.view(fixture(),'player','ms').find(x=>x.id==='vulnerable');
 assert.match(old.measure,/tindanan/);assert.match(old.summary,/\+2/);assert.doesNotMatch(old.summary,/%/);assert.match(old.description,/satu tindanan/);assert.match(current.measure,/fasa/);assert.match(current.summary,/50%/);
});
test('status auras and numeric labels use the exact shared BM badge names',()=>{
 const r=fixture(),before=V.snapshot(r);r.battle.strength++;r.battle.agility++;r.battle.defense++;r.battle.block++;r.battle.cardCombat.statuses.self.weak++;r.battle.cardCombat.statuses.self.vulnerable++;r.battle.cardCombat.statuses.thorns++;
 for(const cue of V.effects(before,r,'ms'))assert.ok(cue.label.endsWith(S.name(cue.id,'ms')),cue.label);
});
test('Strength wording follows the card preview instead of assuming one universal multi-hit allocation',()=>{
 const master=require('../tools/balance/master/loader.cjs').loadMaster(),m=master.E.newRun(7);delete m.route;m.deck=master.data.cards.map(c=>master.E.card(m,c.id));master.E.startBattle(m,'sentinel');
 function hand(r,key){const b=r.battle,all=[...b.hand,...b.draw,...b.discard],i=all.findIndex(c=>c.key===key);assert.ok(i>=0);b.hand=[all.splice(i,1)[0]];b.draw=all;b.discard=[];}
 hand(m,'stm.passive.blazing_spirit');master.E.playCard(m,m.battle.hand[0].uid);assert.ok(master.E.validate(m));
 for(const [engine,r,expected]of [[E,fixture(),[2,2]],[master.E,m,[2,0]]]){hand(r,'stm.attack.twin_shot');const b=r.battle,plan=engine.cardPlan(r,b.hand[0]),zero=engine.clone(r);zero.battle.strength=0;const without=engine.cardPlan(zero,zero.battle.hand[0]);assert.deepEqual(plan.damageEvents.map((e,i)=>e.beforeStatus-without.damageEvents[i].beforeStatus),expected);assert.match(S.view(r,'player').find(x=>x.id==='strength').description,/card preview/);assert.match(S.view(r,'player','ms').find(x=>x.id==='strength').description,/Pratonton kad/);}
});
test('phase expiry and queued grants remain canonical rather than becoming permanent display entries',()=>{
 const r=fixture();E.endTurn(r);for(const id of ['next-draw','next-block','retain-block','thorns'])assert.equal(S.view(r,'player','ms').some(x=>x.id===id),false);assert.equal(S.view(r,'player').find(x=>x.id==='weak').value,1);assert.ok(E.validate(r));
});
test('approved variants retain exact transparent padding and have verified native/export provenance',async()=>{
 const sharp=require(process.env.IMAGE_QA_MODULE||'sharp'),base=path.resolve(__dirname,'..'),manifest=require('../references/status-polish/manifest.json');assert.equal(manifest.assets.length,3);
 for(const x of manifest.assets){const bytes=fs.readFileSync(path.join(base,'dist/assets',x.file));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),x.sha256);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(base,'references/status-polish',x.source))).digest('hex'),x.sourceSHA256);
  for(const [file,size,pad]of [[path.join(base,'dist/assets',x.file),512,40],...Object.values(x.exports).map(e=>[path.join(base,'references/status-polish',e.file),e.canvas[0],e.padding])]){const meta=await sharp(file).metadata();assert.equal(meta.width,size);assert.equal(meta.height,size);assert.ok(meta.hasAlpha);for(const rect of [{left:0,top:0,width:size,height:pad},{left:0,top:size-pad,width:size,height:pad},{left:0,top:0,width:pad,height:size},{left:size-pad,top:0,width:pad,height:size}]){const raw=await sharp(file).extract(rect).ensureAlpha().raw().toBuffer();for(let n=3;n<raw.length;n+=4)assert.equal(raw[n],0,x.id+' transparent padding');}}
 }
});
