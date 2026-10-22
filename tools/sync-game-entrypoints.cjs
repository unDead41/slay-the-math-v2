/* Small versioned entry pages load the current runtime, retaining each file URL
 * so existing file-based browser saves stay at their original storage location. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
module.exports=function syncGameEntrypoints(root){
 const dist=path.join(root,'dist'),version=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version;
 let html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
 if(!/<script src="release\.js(?:\?[^\"]*)?"/.test(html))html=html.replace('<script src="','<script src="release.js"></script><script src="');
 const clean=name=>name.split(/[?#]/)[0],hash=value=>crypto.createHash('sha256').update(value).digest('hex').slice(0,16);
 const resources=[...html.matchAll(/<(?:script src|link rel="stylesheet" href)="([^\"]+)"/g)].map(m=>clean(m[1]));
 const inputs=resources.filter(name=>name!=='release.js').map(name=>({name,hash:hash(fs.readFileSync(path.join(dist,name)))}));
 const release={version,build:hash(JSON.stringify({version,inputs}))};
 fs.writeFileSync(path.join(dist,'release.js'),'/* Generated from package.json and current runtime contents. */\n(function(root){root.DCRelease=Object.freeze('+JSON.stringify(release)+');})(globalThis);\n');
 const versionURL=(_,prefix,name,suffix)=>prefix+clean(name)+'?v='+hash(fs.readFileSync(path.join(dist,clean(name))))+suffix;
 html=html.replace(/(<script src=")([^\"]+)(")/g,versionURL).replace(/(<link rel="stylesheet" href=")([^\"]+)(")/g,versionURL);
 const meta='<meta name="stm-version" content="'+version+'">';
 html=/<meta name="stm-version"[^>]*>/.test(html)?html.replace(/<meta name="stm-version"[^>]*>/,meta):html.replace('<head>','<head>'+meta);
 fs.writeFileSync(path.join(dist,'index.html'),html);
 for(const name of ['MAIN-SEKARANG.html','index.html'])fs.writeFileSync(path.join(root,name),html.replace('<head>','<head><base href="dist/">'));
 return release;
};
if(require.main===module)module.exports(path.resolve(__dirname,'..'));
