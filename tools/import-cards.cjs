// Build the supplied read-only card catalogue. Combat remains owned by the engine.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const project=path.resolve(__dirname,'..'),source=path.join(project,'modules/cards/source');
const read=p=>fs.readFileSync(path.join(source,p),'utf8');
require(path.join(source,'tools/build-data.cjs'));
const data=JSON.parse(read('data/cards.master.json'));
const paths=[...data.cards.map(c=>c.icon),...Object.values(data.frames.categories).flatMap(c=>[c.normal,c.focus]).filter(Boolean)];
const assets={};
for(const p of new Set(paths)){
 const name='cardpack-'+crypto.createHash('sha256').update(p).digest('hex').slice(0,14)+path.extname(p);
 assets[p]=name;fs.copyFileSync(path.join(source,p),path.join(project,'dist/assets',name));
}
let html=read('OPEN_CARD_PREVIEW.html');
html=html.replace(/<link rel="stylesheet" href="([^"]+)">/g,(_,p)=>'<style>'+read(p)+'</style>');
html=html.replace(/<script src="([^"]+)"><\/script>/g,(_,p)=>'<script>'+read(p).replace(/<\/script/gi,'<\\/script')+'</script>');
const script=`(function(root){'use strict';
const template=${JSON.stringify(html)},assets=${JSON.stringify(assets)};
function createDocument(language='en',embeddedAssets={}){
 const lang=/^(bm|ms)(-|$)/i.test(String(language))?'bm':'en';
 const mapped=Object.fromEntries(Object.entries(assets).map(([p,n])=>[p,embeddedAssets[n]||'assets/'+n]));
 const init='<script>window.STM_CARD_LANGUAGE='+JSON.stringify(lang)+';window.STM_CARD_EMBEDDED=true;window.STM_CARD_ASSETS='+JSON.stringify(mapped).replace(/</g,'\\u003c')+';<\\/script>';
 return template.replace('<head>','<head>'+init);
}
const api=Object.freeze({createDocument,assets});root.DCCardPreview=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);\n`;
fs.writeFileSync(path.join(project,'dist/card-preview.js'),script);
console.log('Card preview built: 40 bilingual cards, '+Object.keys(assets).length+' source images.');
