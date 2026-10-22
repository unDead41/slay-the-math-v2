const fs=require('node:fs'),path=require('node:path');const root=__dirname;let html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
html=html.replace(/<link rel="stylesheet" href="([^"]+)">/g,(_,name)=>'<style>'+fs.readFileSync(path.join(root,'dist',name.split(/[?#]/)[0]),'utf8')+'</style>');
html=html.replace(/<script src="([^"]+)"><\/script>/g,(_,name)=>'<script>'+fs.readFileSync(path.join(root,'dist',name.split(/[?#]/)[0]),'utf8').replace(/<\/script/gi,'<\\/script')+'</script>');
const mime=name=>({'.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'}[path.extname(name)]);
html=html.replace(/(href=")assets\/([^"<>]+)(")/g,(_,a,file,z)=>a+'data:'+mime(file)+';base64,'+fs.readFileSync(path.join(root,'dist/assets',file)).toString('base64')+z);
const retiredHero=/^ground-alyssa-(?:standing|attack|defend|skill|damage)\.webp$/;
const images={};for(const name of fs.readdirSync(path.join(root,'dist/assets')).filter(n=>mime(n)&&!retiredHero.test(n)))images[name]='data:'+mime(name)+';base64,'+fs.readFileSync(path.join(root,'dist/assets',name)).toString('base64');
html=html.replace(/url\(['"]?assets\/([^)'"]+)['"]?\)/g,(_,file)=>images[file]?'url("'+images[file]+'")':_);
const music={},voice={},registry=JSON.parse(fs.readFileSync(path.join(root,'dist/assets/music/audio-pack-3.json'),'utf8'));
for(const [id,asset]of Object.entries(registry.assets)){
 const src=asset.srcs.find(src=>src.endsWith('.mp3'));
 if(!src||!/^assets\/(music|voice)\/[a-z0-9_/]+\.mp3$/.test(src))throw new Error('Missing portable audio source: '+id);
 const target=asset.bus==='bgm'?music:asset.bus==='voice'?voice:null;
 if(!target)throw new Error('Unknown audio bus: '+id);
 target[id]='data:audio/mpeg;base64,'+fs.readFileSync(path.join(root,'dist',src)).toString('base64');
}
if(Object.keys(music).length!==10||Object.keys(voice).length!==7)throw new Error('Build requires 10 music cues and 7 character voices');
html=html.replace('<body>','<body><script>window.DC_ASSETS='+JSON.stringify(images)+';window.DC_MUSIC='+JSON.stringify(music)+';window.DC_VOICE='+JSON.stringify(voice)+';</script>');
// Dynamic src attributes are produced by app.js. Resolve local asset names to embedded bytes.
const out=path.join(root,'SLAY-THE-MATH-OFFLINE.html');fs.writeFileSync(out,html);console.log('Portable game generated: '+fs.statSync(out).size+' bytes');
