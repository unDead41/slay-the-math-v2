'use strict';
// Import MUSIC(3).zip without transcoding. .mpeg entries are MP3 containers;
// the runtime .mp3 aliases retain every original byte, including attached art.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const labels={bgm_combat_stage_1:'Stage 1 — Normal & Elite',bgm_combat_stage_2:'Stage 2 — Normal & Elite',bgm_boss_stage_1:'Stage 1 — Boss',bgm_boss_stage_2:'Stage 2 — Boss',bgm_shop:'Shop',bgm_rest:'Rest Site',bgm_map:'Dungeon Map',bgm_defeat:'Run Ended'};
function importAudio(archive,root=path.join(__dirname,'..')){
 const read=name=>execFileSync('unzip',['-p',archive,'MUSIC/'+name],{maxBuffer:8*1024*1024});
 const manifest=JSON.parse(read('docs/audio/audio-manifest.v1.json').toString('utf8'));
 if(manifest.schemaVersion!==1||manifest.assets.length!==15)throw new Error('Expected the supplied fifteen-asset source manifest');
 // Validate all records and bytes before writing any replacement assets.
 const prepared=manifest.assets.map(a=>{
  const dest=a.proposedRuntimePath;
  if(!/^assets\/(music|voice)\/[a-z0-9_/]+\.mp3$/.test(dest))throw new Error('Unsafe audio path');
  const bytes=read(a.sourcePath);
  if(bytes.length!==a.sourceSizeBytes||sha(bytes)!==a.sourceSha256)throw new Error('Source bytes differ: '+a.id);
  return {record:a,bytes,dest};
 });
 const assets={},aliases={menu:'menu',mystery:'mystery'};
 for(const {record:a,bytes,dest}of prepared){
  const target=path.join(root,'dist',dest);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);
  assets[a.id]={id:a.id,bus:a.bus,srcs:[dest],title:labels[a.id]||a.usage,label:labels[a.id]||a.usage,duration:a.sourceDurationSeconds,loop:a.bus==='bgm',playbackRate:1,sourceSha256:a.sourceSha256,sourceFileName:a.sourceFileName,loopAuditionVerified:false};
  aliases[a.id]=a.id;for(const alias of a.runtimeAliases)aliases[alias]=a.id;
 }
 const old=JSON.parse(fs.readFileSync(path.join(root,'dist/assets/music/scores.json'),'utf8'));
 for(const id of ['menu','mystery']){
  const t=(Array.isArray(old)?old:old.tracks).find(t=>t.id===id);
  if(!t)throw new Error('Missing retained cue '+id);
  assets[id]={id,bus:'bgm',srcs:['assets/music/'+id+'.ogg','assets/music/'+id+'.mp3'],title:t.title,label:id==='menu'?'Main Menu':'Mystery & Artifacts',duration:t.duration,loop:true,playbackRate:1,retainedFallback:true};
 }
 const out={version:1,sourcePack:3,assets,aliases,voiceSequences:{dungeonMaster:['vo_dm_01','vo_dm_02','vo_dm_03','vo_dm_04'],merchant:['vo_shop_01','vo_shop_02','vo_shop_03']}};
 fs.writeFileSync(path.join(root,'dist/assets/music/audio-pack-3.json'),JSON.stringify(out,null,2)+'\n');
 const docs=path.join(root,'docs/audio/source-pack-3');fs.mkdirSync(docs,{recursive:true});
 for(const name of ['audio-cues.v1.csv','audio-manifest.v1.json','IMPLEMENTATION_CHECKLIST.md','source-audit.v1.json','STM_AUDIO_SOR_v1.md','VERIFICATION_v1.json'])fs.writeFileSync(path.join(docs,name),read('docs/audio/'+name));
 fs.writeFileSync(path.join(docs,'README.md'),read('README.md'));
 const imported={sourceArchive:{name:path.basename(archive),sha256:sha(fs.readFileSync(archive)),sizeBytes:fs.statSync(archive).size},sourceDocuments:'Unmodified supplied planning documents; current user authorization supersedes planned-only/branch instructions.',runtimeImport:'Byte-preserved MP3 aliases, no trim, tempo/pitch change, stream stripping or re-encoding.',assets:prepared.map(({record:a,bytes,dest})=>({id:a.id,sourcePath:a.sourcePath,runtimePath:dest,sha256:sha(bytes),sizeBytes:bytes.length})),auditionVerified:false,loopSeamVerified:false,transcriptsSupplied:false};
 fs.writeFileSync(path.join(docs,'import-audit.json'),JSON.stringify(imported,null,2)+'\n');
 return out;
}
if(require.main===module){if(!process.argv[2])throw new Error('Usage: node tools/import-audio.cjs <MUSIC(3).zip>');const result=importAudio(path.resolve(process.argv[2]));console.log('Imported 15 original audio files; '+Object.keys(result.assets).length+' total runtime assets including retained fallbacks.');}
module.exports={importAudio};
