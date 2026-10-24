'use strict';
const fs=require('node:fs'),path=require('node:path');
const base=__dirname,dist=path.resolve(base,'../../dist');
function instrumentApp(source,adapter){
 const app=source.replace(/\r\n?/g,'\n'),marker='render();\n})();';
 if(!app.endsWith(marker+'\n')&&!app.endsWith(marker))throw Error('App integration marker changed; update the dev adapter.');
 return app.replace(marker,adapter+'\n'+marker);
}
module.exports=function devResponse(pathname){
 if(pathname==='/__dev/'||pathname==='/__dev/index.html')return {type:'text/html',data:fs.readFileSync(path.join(base,'index.html'))};
 if(pathname==='/'||pathname==='/__dev/sandbox/'||pathname==='/__dev/game/'||pathname==='/index.html'){
  let html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  html=html.replace('<head>','<head><base href="/"><script src="/__dev/storage.js"></script><script src="/__dev/runtime-tools.js"></script><script src="/__dev/fixtures.js"></script>');
  // Fixtures are loaded after the engine, before the app; no production file is changed.
  html=html.replace('<script src="/__dev/fixtures.js"></script>','').replace(/<script src="app\.js[^\"]*"><\/script>/,'<script src="/__dev/fixtures.js"></script><script src="/__dev/app.js"></script>');
  return {type:'text/html',data:html};
 }
 if(pathname==='/__dev/app.js'){
  return {type:'text/javascript',data:instrumentApp(fs.readFileSync(path.join(dist,'app.js'),'utf8'),fs.readFileSync(path.join(base,'adapter.js'),'utf8')+'\n'+fs.readFileSync(path.join(base,'extended.js'),'utf8')+'\n'+fs.readFileSync(path.join(base,'controls.js'),'utf8'))};
 }
 const allowed={'/__dev/report.js':'report.js','/__dev/runtime-tools.js':'runtime-tools.js','/__dev/hub.js':'hub.js','/__dev/style.css':'style.css','/__dev/storage.js':'storage.js','/__dev/fixtures.js':'fixtures.js'};
 if(allowed[pathname])return {type:pathname.endsWith('.css')?'text/css':'text/javascript',data:fs.readFileSync(path.join(base,allowed[pathname]))};
 if(pathname.startsWith('/__dev'))return {status:404,type:'text/plain',data:'Unknown developer resource.'};
 return null;
};

module.exports.instrumentApp=instrumentApp;
