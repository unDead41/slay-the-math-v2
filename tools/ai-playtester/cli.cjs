'use strict';
const fs=require('node:fs'),path=require('node:path'),{experiment}=require('./experiments.cjs'),{toCSV}=require('./report.cjs');
try{
 const options={};let output;
 for(const arg of process.argv.slice(2)){const m=arg.match(/^--([a-z]+)=(.*)$/);if(!m)throw Error('Use --name=value. See docs/AI_PLAYTESTER.md.');const [,name,value]=m;if(name==='output')output=path.resolve(value);else if(['seed','seeds'].includes(name))options[name]=Number(value);else if(name==='cards')options.cards=value.split(',');else if(name==='upgraded'){if(!['true','false'].includes(value))throw Error('Use --upgraded=true or false.');options[name]=value==='true';}else options[name]=value;}
 if(output&&(fs.existsSync(output+'.json')||fs.existsSync(output+'.csv')))throw Error('Output exists; choose a new prefix.');
 const report=experiment(options,{onProgress:p=>process.stderr.write(p.completed+'/'+p.total+'\n')});
 if(output){fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output+'.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});fs.writeFileSync(output+'.csv',toCSV(report),{flag:'wx'});}
 console.log(JSON.stringify({sourceHash:report.sourceHash,summary:report.summary,...(output?{json:output+'.json',csv:output+'.csv'}:{})},null,2));if(report.summary.invalid||report.summary.censored)process.exitCode=1;
}catch(e){console.error(e.message);process.exitCode=1;}
