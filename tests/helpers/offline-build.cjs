/* QA-only output relocation under a task-owned temp directory. Runtime unchanged. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const root=path.resolve(__dirname,'../..'),target=process.env.OFFLINE_QA_ARTIFACTS;
if(!target||!path.isAbsolute(target))throw Error('Set OFFLINE_QA_ARTIFACTS to a task-owned absolute temp directory.');
const file=path.join(root,'tools/build-production.cjs'),original=fs.readFileSync(file,'utf8'),needle="out=path.join(root,'release-prod')";
if(original.split(needle).length!==2)throw Error('Build output declaration changed; review the QA adapter.');
const code=original.replace(needle,'out='+JSON.stringify(path.join(target,'release-prod'))),loaded=new Module(file,module);loaded.filename=file;loaded.paths=Module._nodeModulePaths(path.dirname(file));loaded._compile(code,file);
