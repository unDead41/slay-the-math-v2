'use strict';
const fs=require('node:fs'),path=require('node:path'),{createCollector,DEFAULT_DATABASE_PATH}=require('./collector.cjs');
function main(args){
 const values={db:DEFAULT_DATABASE_PATH,format:'json',output:null};for(let i=0;i<args.length;i++){const key=args[i].replace(/^--/,'');if(!['db','format','output'].includes(key)||!args[i+1])throw Error('Usage: node tools/analytics/export.cjs [--db path] [--format json|csv] [--output path]');values[key]=args[++i];}
 if(!['json','csv'].includes(values.format))throw Error('Choose --format json or --format csv.');
 if(values.output&&path.resolve(values.output)===path.resolve(values.db))throw Error('The export output must differ from the database.');
 const collector=createCollector({databasePath:values.db,readOnly:true});try{const data=values.format==='csv'?collector.csv():JSON.stringify(collector.exportData(),null,2)+'\n';if(values.output){fs.writeFileSync(path.resolve(values.output),data,{encoding:'utf8',mode:0o600});process.stdout.write('Export saved: '+path.resolve(values.output)+'\n');}else process.stdout.write(data);}finally{collector.close();}
}
if(require.main===module)try{main(process.argv.slice(2));}catch(error){process.stderr.write(error.message+'\n');process.exitCode=1;}
module.exports={main};
