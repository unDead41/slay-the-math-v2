'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {instrumentApp}=require('./server.cjs');
module.exports=function buildDeveloperAccess(out){
 const read=name=>fs.readFileSync(path.join(__dirname,name),'utf8');
 const hash=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,16);
 const sourceApp=fs.readFileSync(path.join(out,'app.js'),'utf8'),originalHtml=fs.readFileSync(path.join(out,'index.html'),'utf8'),controls=read('controls.js');
 const app=instrumentApp(sourceApp,controls);fs.writeFileSync(path.join(out,'app.js'),app);
 const access=read('access.js');fs.writeFileSync(path.join(out,'dev-access.js'),access);
 const html=originalHtml.replace('<head>','<head><script src="dev-access.js?v='+hash(access)+'"></script>').replace(/src="app\.js[^\"]*"/,'src="app.js?v='+hash(app)+'"');fs.writeFileSync(path.join(out,'index.html'),html);
 const dev=path.join(out,'__dev');fs.mkdirSync(path.join(dev,'sandbox'),{recursive:true});fs.mkdirSync(path.join(dev,'game'),{recursive:true});
 for(const name of ['storage.js','fixtures.js','hub.js','style.css','hub-access.js'])fs.copyFileSync(path.join(__dirname,name),path.join(dev,name));
 const sandboxApp=instrumentApp(sourceApp,read('adapter.js')+'\n'+controls);fs.writeFileSync(path.join(dev,'app.js'),sandboxApp);
 const sandbox=originalHtml.replace('<head>','<head><base href="../../"><script src="dev-access.js?v='+hash(access)+'"></script><script src="__dev/storage.js"></script>').replace(/<script src="app\.js[^\"]*"><\/script>/,'<script src="__dev/fixtures.js"></script><script src="__dev/app.js?v='+hash(sandboxApp)+'"></script>');
 for(const folder of ['sandbox','game'])fs.writeFileSync(path.join(dev,folder,'index.html'),sandbox);
 let hub=read('index.html').replaceAll('"/__dev/','"./').replace('src="./sandbox/"','data-src="./sandbox/index.html"').replace('href="./game/"','href="./game/index.html"');
 hub=hub.replace('<head>','<head><script src="../dev-access.js?v='+hash(access)+'"></script><script src="hub-access.js"></script>').replace('<body>','<body><div id="dev-hub-content" hidden>').replace('</body>','</div></body>');fs.writeFileSync(path.join(dev,'index.html'),hub);
};
