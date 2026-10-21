const fs=require('node:fs'),path=require('node:path');const root=__dirname;let html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
html=html.replace(/<link rel="stylesheet" href="([^"]+)">/g,(_,name)=>'<style>'+fs.readFileSync(path.join(root,'dist',name),'utf8')+'</style>');
html=html.replace(/<script src="([^"]+)"><\/script>/g,(_,name)=>'<script>'+fs.readFileSync(path.join(root,'dist',name),'utf8').replace(/<\/script/gi,'<\\/script')+'</script>');
const mime=name=>({'.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'}[path.extname(name)]);
html=html.replace(/(href=")assets\/([^"<>]+)(")/g,(_,a,file,z)=>a+'data:'+mime(file)+';base64,'+fs.readFileSync(path.join(root,'dist/assets',file)).toString('base64')+z);
const retiredHero=/^ground-alyssa-(?:standing|attack|defend|skill|damage)\.webp$/;
const images={};for(const name of fs.readdirSync(path.join(root,'dist/assets')).filter(n=>mime(n)&&!retiredHero.test(n)))images[name]='data:'+mime(name)+';base64,'+fs.readFileSync(path.join(root,'dist/assets',name)).toString('base64');
html=html.replace(/url\(['"]?assets\/([^)'"]+)['"]?\)/g,(_,file)=>images[file]?'url("'+images[file]+'")':_);
const music={};const musicDir=path.join(root,'dist/assets/music');
for(const name of fs.readdirSync(musicDir).filter(n=>n.endsWith('.mp3')))music[path.basename(name,'.mp3')]='data:audio/mpeg;base64,'+fs.readFileSync(path.join(musicDir,name)).toString('base64');
if(Object.keys(music).length!==10)throw new Error('Build requires all 10 soundtrack loops');
html=html.replace('<body>','<body><script>window.DC_ASSETS='+JSON.stringify(images)+';window.DC_MUSIC='+JSON.stringify(music)+';</script>');
// Dynamic src attributes are produced by app.js. Resolve local asset names to embedded bytes.
const out=path.join(root,'MAIN-SEKARANG.html');fs.writeFileSync(out,html);console.log('Portable game generated: '+fs.statSync(out).size+' bytes');
