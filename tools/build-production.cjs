'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=path.join(root,'release-prod');
// Remove the old artifact first. A failed build must never start a stale preview.
fs.rmSync(out,{recursive:true,force:true});
for(const script of ['tools/import-mechanics.cjs','build-portable.cjs']){
 const result=spawnSync(process.execPath,[script],{cwd:root,stdio:'inherit'});if(result.error)throw result.error;if(result.status!==0)process.exit(result.status||1);
}
fs.cpSync(path.join(root,'dist'),out,{recursive:true});
const html=fs.readFileSync(path.join(out,'index.html'),'utf8');if(html.includes('/__dev/')||fs.existsSync(path.join(out,'tools/dev')))throw Error('Developer files leaked into production.');
console.log('Production player build: '+out);
