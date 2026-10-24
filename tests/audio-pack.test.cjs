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

test('active pack selects all 75 normalized voices and exactly the eight unchanged supplied BGM',()=>{
 const p=require('../dist/music-data.js').assets;
 assert.equal(p.sourcePack,5);assert.equal(Object.values(p.assets).filter(a=>a.bus==='voice').length,75);
 assert.equal(p.voicePools.card_reward.length,8);assert.equal(Object.keys(p.voiceEvents).length,15);
 const source=JSON.parse(fs.readFileSync(path.join(root,'docs/audio/source-pack-4/audio-manifest.v2.json'),'utf8'));
 for(const item of source.assets){
  const a=p.assets[item.id];assert.deepEqual(a.srcs,[item.proposedRuntimePath]);assert.equal(sha(fs.readFileSync(path.join(root,'dist',a.srcs[0]))),item.packageSha256);
  assert.equal(a.playbackRate,1);assert.equal(a.clipGain,1);
  if(a.bus==='voice'){assert.ok(Math.abs(a.integratedLufs+18)<=.5);assert.ok(a.truePeakDbTP<=-1);assert.equal(a.loop,false);}
 }
 assert.equal(p.assets.menu.retainedFallback,undefined);assert.equal(p.assets.mystery.retainedFallback,true);
 assert.deepEqual(p.assets.menu.srcs,['assets/music/menu_ancient_stone_keep.mp3']);
 assert.equal(sha(fs.readFileSync(path.join(root,'dist',p.assets.menu.srcs[0]))),'9b3f06a390e3e6fecea9734e3352a5877f4eda64a4fd66829725caa121515681','Main Menu uses the newly supplied recording');
 assert.equal(p.assets.menu.loop,true);assert.equal(p.assets.menu.playbackRate,1);
});

test('MUSIC(5) retains the previous assets except the explicitly replaced Main Menu cue',()=>{
 const p=require('../dist/music-data.js').assets,old=JSON.parse(fs.readFileSync(path.join(root,'dist/assets/music/audio-pack-4.json'),'utf8'));
 const audit=JSON.parse(fs.readFileSync(path.join(root,'docs/audio/source-pack-5/audio-manifest.v3.json'),'utf8'));
 assert.equal(audit.newAssets.length,26);assert.equal(audit.sourceZip.sha256,'bfdb64a198b9b1d6c15d65c2a62f98f1b12c1a1e52dd76e016601947d62378e6');
 for(const [id,a]of Object.entries(old.assets))if(id!=='menu')assert.deepEqual(p.assets[id],a,'unchanged prior asset '+id);
 assert.deepEqual(Object.fromEntries(['question','hint','more_hint','correct','wrong'].map(g=>[g,p.voicePools[g].length])),{question:7,hint:8,more_hint:8,correct:5,wrong:9});
 for(const a of audit.newAssets){
  const asset=p.assets[a.id],bytes=fs.readFileSync(path.join(root,'dist',asset.srcs[0]));
  assert.equal(sha(bytes),a.packageSha256);assert.equal(asset.packageSha256,a.packageSha256);assert.equal(asset.playbackRate,1);assert.equal(asset.clipGain,1);assert.equal(asset.loop,false);
  assert.ok(Math.abs(a.output.integratedLufs+18)<=.5,a.id+' LUFS');assert.ok(a.output.truePeakDbTP<=-1,a.id+' peak');assert.ok(Math.abs(a.output.duration-a.input.duration)<.1,a.id+' duration');
  assert.equal(a.output.sampleRate,44100);assert.equal(a.output.channels,2);assert.ok(p.voiceSequences.alyssa.includes(a.id));
 }
 assert.equal(new Set(Object.values(p.assets).filter(a=>a.bus==='voice').map(a=>a.packageSha256)).size,75);
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
