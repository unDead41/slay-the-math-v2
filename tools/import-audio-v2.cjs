'use strict';
// Import the verified normalized package. Original backups are never runtime inputs.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function importAudioV2(archive,root=path.join(__dirname,'..')){
 const read=name=>execFileSync('unzip',['-p',archive,name],{maxBuffer:10*1024*1024});
 const manifest=JSON.parse(read('docs/audio/audio-manifest.v2.json'));
 if(manifest.schemaVersion!==2||manifest.assets.length!==57)throw Error('Expected MUSIC(4) normalized manifest');
 const old=JSON.parse(fs.readFileSync(path.join(root,'dist/assets/music/audio-pack-3.json')));
 const prepared=manifest.assets.map(a=>{
  const dest=a.proposedRuntimePath;
  if(!/^assets\/(music|audio\/voice)\/[a-z0-9_/]+\.mp3$/.test(dest)||!a.packagePath.startsWith('MUSIC/'))throw Error('Unsafe runtime asset path');
  const bytes=read(a.packagePath);if(sha(bytes)!==a.packageSha256)throw Error('Package hash differs: '+a.id);
  if(a.bus==='voice'&&(Math.abs(a.integratedLufs+18)>.5||a.truePeakDbTP> -1))throw Error('Unmastered voice: '+a.id);
  return {a,dest,bytes};
 });
 const assets={},aliases={...old.aliases},voicePools={},voiceEvents={};
 for(const {a,dest,bytes}of prepared){
  const target=path.join(root,'dist',dest);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);
  if(sha(fs.readFileSync(target))!==a.packageSha256)throw Error('Written audio hash differs: '+a.id);
  const bus=a.bus==='music'?'bgm':'voice',label=old.assets[a.id]?.label||a.usage;
  assets[a.id]={id:a.id,bus,srcs:[dest],title:label,label,duration:a.durationSeconds,loop:bus==='bgm',playbackRate:1,clipGain:1,sourceSha256:a.sourceSha256,packageSha256:a.packageSha256,group:a.group,...(bus==='voice'?{integratedLufs:a.integratedLufs,truePeakDbTP:a.truePeakDbTP,transcriptVerified:false}:{loopAuditionVerified:false})};
  aliases[a.id]=a.id;
  if(bus==='voice'){(voicePools[a.group]??=[]).push(a);if(a.eventId)voiceEvents[a.eventId]=a.id;}
 }
 for(const group of Object.keys(voicePools))voicePools[group]=voicePools[group].sort((a,b)=>a.variantIndex-b.variantIndex).map(a=>a.id);
 for(const id of ['menu','mystery'])assets[id]=old.assets[id];
 const out={version:1,sourcePack:4,assets,aliases,voicePools,voiceEvents,voiceSequences:{dungeonMaster:voicePools.dungeon_master,merchant:voicePools.merchant,alyssa:manifest.assets.filter(a=>a.bus==='voice'&&a.speaker==='Alyssa').map(a=>a.id)}};
 if(Object.values(assets).filter(a=>a.bus==='voice').length!==49)throw Error('Expected 49 normalized voices');
 fs.writeFileSync(path.join(root,'dist/assets/music/audio-pack-4.json'),JSON.stringify(out,null,2)+'\n');
 const docs=path.join(root,'docs/audio/source-pack-4');fs.mkdirSync(docs,{recursive:true});
 for(const name of ['STM_AUDIO_SOR_v2.md','VOICE_VOLUME_STANDARD_v2.md','AUDIO_USAGE_v2.md','audio-manifest.v2.json','audio-cues.v2.csv','source-audit.v2.json','volume-audit.v2.json','VERIFICATION_v2.json','IMPLEMENTATION_CHECKLIST_v2.md'])fs.writeFileSync(path.join(docs,name),read('docs/audio/'+name));
 fs.writeFileSync(path.join(docs,'import-audit.json'),JSON.stringify({sourceArchive:{name:path.basename(archive),sha256:sha(fs.readFileSync(archive))},assets:prepared.map(({a,dest,bytes})=>({id:a.id,runtimePath:dest,sha256:sha(bytes),sizeBytes:bytes.length})),normalization:'49 voices from verified -18 LUFS package; 8 BGM unchanged',auditionVerified:false,loopSeamVerified:false},null,2)+'\n');
 return out;
}
if(require.main===module){if(!process.argv[2])throw Error('Usage: node tools/import-audio-v2.cjs <normalized MUSIC(4).zip>');importAudioV2(path.resolve(process.argv[2]));console.log('Imported 49 normalized voices and 8 unchanged BGM; retained Menu/Mystery music.');}
module.exports={importAudioV2};
