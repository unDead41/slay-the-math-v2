'use strict';
const fs=require('node:fs'),path=require('node:path'),{randomUUID}=require('node:crypto'),{Worker}=require('node:worker_threads');
const {normalizeOptions}=require('../../ai-playtester/experiments.cjs'),{summarize,toCSV}=require('../../ai-playtester/report.cjs');
const HISTORY_LIMIT=5;
function createHandler(){
 const jobs=new Map();let latestId=null;
 const send=(res,status,data,type='application/json')=>{res.writeHead(status,{'Content-Type':type+'; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(type==='application/json'?JSON.stringify(data):data);};
 const snapshot=j=>({id:j.id,status:j.status,startedAt:j.startedAt,finishedAt:j.finishedAt||null,options:j.options,progress:j.progress,error:j.error||null,summary:summarize(j.rows,j.options)});
 const report=j=>({...j.metadata,...j.report,jobId:j.id,startedAt:j.startedAt,finishedAt:j.finishedAt||null,options:j.options,rows:j.rows,summary:summarize(j.rows,j.options),jobStatus:j.status,error:j.error||null,schemaVersion:3,pupilWinRatesMeasured:false});
 function local(req){if(!['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress))return false;try{const h=new URL('http://'+req.headers.host);return !h.username&&!h.password&&['localhost','127.0.0.1','[::1]'].includes(h.hostname)&&Number(h.port||80)===req.socket.localPort;}catch{return false;}}
 function read(req,res,done){
  if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||'')){send(res,415,{error:'Send application/json.'});return;}
  let text='',size=0,ended=false;
  req.on('data',part=>{if(ended)return;size+=part.length;if(size>32768){ended=true;send(res,413,{error:'Options exceed 32 KB.'});}else text+=part;});
  req.on('end',()=>{if(ended)return;try{done(JSON.parse(text));}catch(e){send(res,400,{error:e.message});}});
  req.on('error',()=>{if(!ended&&!res.writableEnded)send(res,400,{error:'Request interrupted.'});ended=true;});
 }
 function start(options){
  const j={id:randomUUID(),status:'running',startedAt:Date.now(),options,rows:[],metadata:{sourceHash:null,sourceUnavailableReason:'Cancelled before source snapshot if still empty.'},progress:{completed:0,total:options.seeds*(options.skill==='all'?3:1)*(options.difficulty==='all'?3:1)*(options.mode==='cards'?1<<options.cards.length:1)}};
  const worker=j.worker=new Worker(path.resolve(__dirname,'../../ai-playtester/worker.cjs'),{workerData:options});
  while(jobs.size>=HISTORY_LIMIT)jobs.delete(jobs.keys().next().value);
  jobs.set(j.id,j);latestId=j.id;
  const active=()=>jobs.get(j.id)===j&&j.status==='running';
  const finish=(status,error)=>{j.status=status;j.finishedAt=Date.now();if(error)j.error=error;};
  worker.on('message',m=>{
   if(!active())return;
   if(m.type==='start')j.metadata=m.metadata;
   else if(m.type==='row')j.rows.push(m.row);
   else if(m.type==='progress')j.progress={completed:m.completed,total:m.total};
   else if(m.type==='done'){j.report=m.report;finish('completed');}
   else if(m.type==='error')finish('failed',m.error);
  });
  worker.on('error',e=>{if(active())finish('failed',e.message);});
  worker.on('exit',code=>{if(active())finish('failed','Worker exited without a completed report (code '+code+').');});
  return j;
 }
 function running(){return [...jobs.values()].some(j=>j.status==='running');}
 function handler(req,res,pathname){
  if(!pathname.startsWith('/__dev/ai'))return false;
  if(!local(req)){send(res,403,{error:'Use a loopback developer connection with matching Host.'});return true;}
  const match=pathname.match(/^\/__dev\/ai\/jobs\/([a-f0-9-]+)(?:\/(cancel|report|csv))?$/),target=match?jobs.get(match[1]):null;
  if(req.method==='POST'){
   if(req.headers.origin&&req.headers.origin!=='http://'+req.headers.host||req.headers['sec-fetch-site']==='cross-site'){send(res,403,{error:'Cross-origin jobs are not allowed.'});return true;}
   if(pathname==='/__dev/ai/jobs'){
    if(running()){send(res,409,{error:'A playtest is already running.'});return true;}
    read(req,res,data=>{if(running()){send(res,409,{error:'A playtest is already running.'});return;}send(res,202,snapshot(start(normalizeOptions(data))));});return true;
   }
   if(target&&match[2]==='cancel'){
    read(req,res,data=>{if(jobs.get(target.id)!==target){send(res,409,{error:'This job has been evicted from history.'});return;}if(!data||typeof data!=='object'||Array.isArray(data)||Object.keys(data).length)throw Error('Cancel body must be {}.');if(target.status==='running'){target.status='cancelled';target.finishedAt=Date.now();target.worker.terminate();}send(res,200,snapshot(target));});return true;
   }
  }
  if(req.method!=='GET'){send(res,405,{error:'Unsupported AI method or job.'});return true;}
  const files={'/__dev/ai/':['index.html','text/html'],'/__dev/ai/app.js':['app.js','text/javascript'],'/__dev/ai/style.css':['style.css','text/css']};
  if(files[pathname]){const [file,type]=files[pathname];send(res,200,fs.readFileSync(path.join(__dirname,file),'utf8'),type);return true;}
  if(pathname==='/__dev/ai/catalog'){const data=require('../../../dist/card-data.js'),C=require('../../../dist/config.js');send(res,200,{version:require('../../../package.json').version,historyLimit:HISTORY_LIMIT,cards:data.cards.map(c=>({id:c.id,name:c.name})),enemies:Object.entries(C.enemies).map(([id,e])=>({id,name:e.name}))});return true;}
  if(pathname==='/__dev/ai/jobs'){send(res,200,{job:jobs.has(latestId)?snapshot(jobs.get(latestId)):null,history:[...jobs.values()].reverse().map(snapshot),historyLimit:HISTORY_LIMIT});return true;}
  if(target){if(!match[2])send(res,200,snapshot(target));else if(match[2]==='report')send(res,200,report(target));else if(match[2]==='csv')send(res,200,toCSV(report(target)),'text/csv');else send(res,404,{error:'AI resource not found.'});return true;}
  send(res,404,{error:'AI resource or job not found; old history may have been evicted.'});return true;
 }
 handler.close=()=>{for(const j of jobs.values())if(j.status==='running'){j.status='cancelled';j.worker.terminate();}};
 return handler;
}
module.exports={createHandler,HISTORY_LIMIT};
