'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const {hash}=require('../../../tools/balance/map/structure.cjs');
const {sha}=require('../../../tools/balance/map/source-audit.cjs');
const {Journal}=require('../../../tools/balance/map-advanced/storage.cjs');
const root=path.resolve(__dirname,'../../..');
for(const difficulty of ['easy','medium','hard']){
 const dir=path.join(root,'reports/map-balance/v1.5',difficulty),log=fs.readFileSync(path.join(__dirname,'run-'+difficulty+'.log'),'utf8');
 if(!log.includes('ENOSPC'))throw Error('This repair is restricted to the recorded ENOSPC interruption.');
 const context=JSON.parse(fs.readFileSync(path.join(dir,'context.json'))),contextId=hash(context);
 const files=fs.readdirSync(dir).filter(f=>/^trial-\d{4}\.jsonl$/.test(f)).sort(),last=files.at(-1),records={},proof={contextId,difficulty,reason:'ENOSPC write interruption',retainedRecords:records,shardRepair:null};
 for(const name of files){
  const file=path.join(dir,name),bytes=fs.readFileSync(file);let valid=bytes;
  if(bytes.at(-1)!==10){
   if(name!==last)throw Error('Non-final shard is incomplete.');
   const boundary=bytes.lastIndexOf(10)+1,fragment=bytes.subarray(boundary);
   let parsed;try{parsed=JSON.parse(fragment.toString());}catch{}
   if(parsed)throw Error('Complete record without newline requires separate retention review.');
   const archive=name+'.interrupted.gz';if(fs.existsSync(path.join(__dirname,difficulty+'-'+archive)))throw Error('Quarantine already exists; no repair repeated.');
   fs.writeFileSync(path.join(__dirname,difficulty+'-'+archive),zlib.gzipSync(bytes,{mtime:0}));
   valid=bytes.subarray(0,boundary);
   proof.shardRepair={file:name,originalBytes:bytes.length,originalSha256:sha(bytes),retainedPrefixBytes:valid.length,retainedPrefixSha256:sha(valid),incompleteFragmentBytes:fragment.length,incompleteFragmentSha256:sha(fragment),archive:difficulty+'-'+archive,archiveSha256:sha(fs.readFileSync(path.join(__dirname,difficulty+'-'+archive)))};
  }
  for(const line of valid.toString().split('\n').filter(Boolean)){
   const r=JSON.parse(line),{recordHash,...payload}=r;
   if(payload.contextId!==contextId||hash(payload)!==recordHash||records[r.task.id])throw Error('Complete record integrity failed.');
   records[r.task.id]=recordHash;
  }
 }
 if(!proof.shardRepair)throw Error('No trailing incomplete fragment; no repair needed.');
 // Every complete record is verified before the interrupted suffix is removed.
 const file=path.join(dir,last),bytes=fs.readFileSync(file);if(sha(bytes)!==proof.shardRepair.originalSha256)throw Error('Shard changed during repair.');
 fs.writeFileSync(file,bytes.subarray(0,proof.shardRepair.retainedPrefixBytes));
 const restored=new Journal(dir,context,{resume:true,shardBytes:context.config.shardBytes});if(restored.records.length!==Object.keys(records).length)throw Error('Retention count mismatch.');
 fs.writeFileSync(path.join(__dirname,difficulty+'-retention-before-resume.json'),JSON.stringify(proof,null,2)+'\n');
 console.log(JSON.stringify({difficulty,retainedCompleteRecords:restored.records.length,fragmentBytes:proof.shardRepair.incompleteFragmentBytes,contextId}));
}
