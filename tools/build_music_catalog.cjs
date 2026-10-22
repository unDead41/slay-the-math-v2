'use strict';
const fs=require('node:fs'),path=require('node:path');
function catalogSource(raw,pack){
 const tracks=Array.isArray(raw)?raw:raw.tracks;
 if(!Array.isArray(tracks))throw new Error('Invalid soundtrack manifest');
 let library,registry;
 if(pack){
  if(pack.version!==1||!pack.assets||!pack.aliases)throw new Error('Invalid imported audio registry');
  for(const [id,a]of Object.entries(pack.assets))if(a.id!==id||!['bgm','voice'].includes(a.bus)||!a.srcs?.length||a.srcs.some(src=>!/^assets\/(music|voice)\/[a-z0-9_/]+\.(mp3|ogg)$/.test(src)))throw new Error('Invalid registered audio: '+id);
  for(const id of Object.values(pack.aliases))if(!pack.assets[id])throw new Error('Missing aliased asset '+id);
  registry=pack;
  library=Object.values(pack.assets).filter(a=>a.bus==='bgm').map(({id,title,label,duration,retainedFallback})=>({id,title,label,duration,...(retainedFallback?{retainedFallback:true}:{})}));
 }else{
  library=tracks.map(({id,title,duration,bpm,key,mood})=>({id,title,duration,bpm,key,mood}));
  registry={version:1,assets:Object.fromEntries(library.map(t=>[t.id,{...t,bus:'bgm',srcs:['assets/music/'+t.id+'.ogg','assets/music/'+t.id+'.mp3'],loop:true,playbackRate:1}])),aliases:Object.fromEntries(library.map(t=>[t.id,t.id])),voiceSequences:{}};
 }
 return '// Generated from the imported audio registry; scores.json is retained fallback provenance.\n(function(root){\nroot.DCAudioAssets='+JSON.stringify(registry)+';\nroot.DCMusicLibrary='+JSON.stringify(library)+';\nif(typeof module!=="undefined")module.exports={assets:root.DCAudioAssets,library:root.DCMusicLibrary};\n})(typeof window!=="undefined"?window:globalThis);\n';
}
function buildCatalog(root=path.join(__dirname,'..')){
 const raw=JSON.parse(fs.readFileSync(path.join(root,'dist/assets/music/scores.json'),'utf8'));
 const packFile=path.join(root,'dist/assets/music/audio-pack-3.json');
 const pack=fs.existsSync(packFile)?JSON.parse(fs.readFileSync(packFile,'utf8')):null;
 const source=catalogSource(raw,pack);fs.writeFileSync(path.join(root,'dist/music-data.js'),source);
 return pack?Object.values(pack.assets).filter(a=>a.bus==='bgm').length:(Array.isArray(raw)?raw:raw.tracks).length;
}
if(require.main===module)console.log('Music catalog: '+buildCatalog()+' tracks');
module.exports={catalogSource,buildCatalog};
