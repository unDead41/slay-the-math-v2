const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const packPath=path.join(root,'dist/assets/music/audio-pack-3.json');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function pack(){assert.ok(fs.existsSync(packPath),'imported source-pack registry exists');return JSON.parse(fs.readFileSync(packPath,'utf8'));}

test('active pack selects all 49 normalized voices and exactly the eight unchanged supplied BGM',()=>{
 const p=require('../dist/music-data.js').assets;
 assert.equal(p.sourcePack,4);assert.equal(Object.values(p.assets).filter(a=>a.bus==='voice').length,49);
 assert.equal(p.voicePools.card_reward.length,8);assert.equal(Object.keys(p.voiceEvents).length,15);
 const source=JSON.parse(fs.readFileSync(path.join(root,'docs/audio/source-pack-4/audio-manifest.v2.json'),'utf8'));
 for(const item of source.assets){
  const a=p.assets[item.id];assert.deepEqual(a.srcs,[item.proposedRuntimePath]);assert.equal(sha(fs.readFileSync(path.join(root,'dist',a.srcs[0]))),item.packageSha256);
  assert.equal(a.playbackRate,1);assert.equal(a.clipGain,1);
  if(a.bus==='voice'){assert.ok(Math.abs(a.integratedLufs+18)<=.5);assert.ok(a.truePeakDbTP<=-1);assert.equal(a.loop,false);}
 }
 assert.equal(p.assets.menu.retainedFallback,true);assert.equal(p.assets.mystery.retainedFallback,true);
});

test('supplied audio has byte-preserved explicit paths and canonical Normal/Elite sharing',()=>{
 const p=pack();
 assert.equal(p.aliases.stage1_dungeon,'bgm_combat_stage_1');
 assert.equal(p.aliases.stage1_elite,'bgm_combat_stage_1');
 assert.equal(p.aliases.stage2_dungeon,'bgm_combat_stage_2');
 assert.equal(p.aliases.stage2_elite,'bgm_combat_stage_2');
 const supplied=Object.values(p.assets).filter(a=>a.sourceSha256);
 assert.equal(supplied.length,15);
 assert.equal(supplied.filter(a=>a.bus==='bgm').length,8);
 assert.equal(supplied.filter(a=>a.bus==='voice').length,7);
 const source=JSON.parse(fs.readFileSync(path.join(root,'docs/audio/source-pack-3/audio-manifest.v1.json'),'utf8'));
 for(const item of source.assets){
  const a=p.assets[item.id];assert.ok(a,item.id+' registered');
  assert.deepEqual(a.srcs,[item.proposedRuntimePath]);
  assert.equal(sha(fs.readFileSync(path.join(root,'dist',a.srcs[0]))),item.sourceSha256,'source bytes preserved for '+item.id);
  assert.equal(a.playbackRate,1);
  assert.equal(a.loop,item.bus==='bgm');
 }
});

test('catalog generation retains supplied mapping rather than old score metadata',()=>{
 const p=pack();
 const builder=require('../tools/build_music_catalog.cjs');
 assert.equal(typeof builder.catalogSource,'function');
 const scores=JSON.parse(fs.readFileSync(path.join(root,'dist/assets/music/scores.json'),'utf8'));
 const sandbox={};vm.runInNewContext(builder.catalogSource(scores,p),sandbox);
 const stage=sandbox.DCMusicLibrary.find(a=>a.id==='bgm_combat_stage_1');
 assert.equal(stage.duration,154.8);
 assert.equal(stage.bpm,undefined);assert.equal(stage.key,undefined);
 assert.equal(sandbox.DCAudioAssets.assets.bgm_combat_stage_1.srcs[0],'assets/music/stage1_combat.mp3');
 assert.equal(sandbox.DCMusicLibrary.length,10);
 assert.ok(sandbox.DCMusicLibrary.some(a=>a.id==='menu'));
 assert.ok(sandbox.DCMusicLibrary.some(a=>a.id==='mystery'));
 assert.equal(Object.values(sandbox.DCAudioAssets.assets).filter(a=>a.bus==='voice').length,7);
});
