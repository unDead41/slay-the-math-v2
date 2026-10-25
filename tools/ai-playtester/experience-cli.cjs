'use strict';
const fs=require('node:fs'),zlib=require('node:zlib'),D=require('./experience-data.cjs');
try{
 const [command,input,output,commit,scheduleFile]=process.argv.slice(2);
 if(command==='validate'){const b=D.readBundle(input);console.log(JSON.stringify({status:'PASS',coverage:b.manifest.plan?.scope||'LEGACY_NO_COHORT_PLAN',...b.manifest.summary}));}
 else if(command==='train'){if(!output||fs.existsSync(output))throw Error('Choose a fresh output model file.');const model=D.fitModel(D.readBundle(input));fs.writeFileSync(output,JSON.stringify(model,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({id:model.id,...model.summary}));}
 else if(command==='export-ai'){
  if(!input||!output||!/^[a-f0-9]{40}$/.test(commit||'')||!scheduleFile)throw Error('Use export-ai RAW.jsonl[.gz] NEW_DIRECTORY SOURCE_COMMIT PREDECLARED_SCHEDULE.json.');
  const bytes=fs.readFileSync(input),reports=(input.endsWith('.gz')?zlib.gunzipSync(bytes):bytes).toString().split('\n').filter(Boolean).map(JSON.parse),source={branch:'balance/master',commit};
  const schedule=JSON.parse(fs.readFileSync(scheduleFile,'utf8')),observations=D.normalizeReports(reports,{domain:'combat',split:'train',source,schedule});const m=D.writeBundle(output,{source,seedPlan:{train:[93],validation:[701,702]},observations});console.log(JSON.stringify(m.summary));
 }else throw Error('Use validate DIR | train DIR NEW_MODEL.json | export-ai RAW.jsonl[.gz] NEW_DIR SOURCE_COMMIT PREDECLARED_SCHEDULE.json.');
}catch(e){console.error(e.message);process.exitCode=1;}
