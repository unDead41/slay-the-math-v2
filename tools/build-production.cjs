'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=path.join(root,'release-prod');
// Remove the old artifact first. A failed build must never start a stale preview.
fs.rmSync(out,{recursive:true,force:true});
function assertNoPrivateData(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())assertNoPrivateData(file);else if(/\.(?:sqlite|db)(?:-(?:wal|shm))?$/i.test(entry.name))throw Error('Private database found in public game files. Move it outside dist before building production.');}}
assertNoPrivateData(path.join(root,'dist'));
for(const script of ['tools/import-mechanics.cjs','build-portable.cjs']){
 const result=spawnSync(process.execPath,[script],{cwd:root,stdio:'inherit'});if(result.error)throw result.error;if(result.status!==0)process.exit(result.status||1);
}
fs.cpSync(path.join(root,'dist'),out,{recursive:true});
const html=fs.readFileSync(path.join(out,'index.html'),'utf8');if(html.includes('/__dev/')||fs.existsSync(path.join(out,'tools/dev')))throw Error('Developer files leaked into production.');
require('./dev/build-production.cjs')(out);
require('./build-asset-manifest.cjs')(root,{output:out});
console.log('Production player build: '+out);
