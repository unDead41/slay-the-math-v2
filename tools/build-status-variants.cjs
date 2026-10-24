'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
function apply(data,manifest){if(manifest.assets.length!==3||new Set(manifest.assets.map(x=>x.id)).size!==3)throw Error('Exactly three unique approved status variants required');for(const x of manifest.assets){if(!['block','next-block','retain-block'].includes(x.id))throw Error('Out-of-scope status asset');const old=data.status[x.id];if(old!=='assets/'+x.file)data.aliases[old.replace(/^assets\//,'')]=x.file;data.status[x.id]='assets/'+x.file;data.entries['status.'+x.id]=x.file;}return data;}
function build(root=path.resolve(__dirname,'..')){
 const file=path.join(root,'references/status-polish/manifest.json');if(!fs.existsSync(file))return;
 const manifest=JSON.parse(fs.readFileSync(file)),registry=path.join(root,'dist/icon-assets.js'),context={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(registry,'utf8'),context);const data=context.module.exports;
 for(const x of manifest.assets){const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'dist/assets',x.file))).digest('hex');if(hash!==x.sha256)throw Error('Status image hash mismatch '+x.id);}
 apply(data,manifest);
 const js='/* Generated icon registry; status variants owned by references/status-polish/manifest.json. */\n(function(root){const data='+JSON.stringify(data)+';data.resolve=function(name,embedded){const file=data.aliases[name]||name;return embedded?.[file]||"assets/"+file;};if(typeof module!=="undefined"&&module.exports)module.exports=data;else root.DCIconAssets=data;})(globalThis);\n';
 if(fs.readFileSync(registry,'utf8')!==js)fs.writeFileSync(registry,js);
 const metaFile=path.join(root,'dist/assets/status-icons.json'),meta=JSON.parse(fs.readFileSync(metaFile));meta.version=3;meta.variantSource='references/status-polish/manifest.json';for(const x of manifest.assets)meta.icons.find(i=>i.id===x.id).file=x.file;fs.writeFileSync(metaFile,JSON.stringify(meta,null,2)+'\n');
}
module.exports=build;module.exports.apply=apply;if(require.main===module)build();
