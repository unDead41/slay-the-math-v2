'use strict';
const fs=require('node:fs'),path=require('node:path');
const {hash}=require('../map/structure.cjs');
const {writeJson}=require('../map/export.cjs');
const {sha}=require('../map/source-audit.cjs');
class Journal{
 constructor(dir,context,{resume=false,shardBytes=4194304}={}){
  this.dir=dir;this.context=context;this.contextId=hash(context);this.shardBytes=shardBytes;this.records=[];this.ids=new Set();fs.mkdirSync(dir,{recursive:true});
  const file=path.join(dir,'context.json');
  if(fs.existsSync(file)){
   if(!resume)throw Error('Output exists; use --resume or a fresh directory.');
   if(hash(JSON.parse(fs.readFileSync(file)))!==this.contextId)throw Error('Resume context changed; use a fresh output directory.');
  }else{
   if(fs.readdirSync(dir).some(f=>/^trial-\d+\.jsonl$/.test(f)))throw Error('Journal has no context.');
   writeJson(file,context,true);
  }
  const files=fs.readdirSync(dir).filter(f=>/^trial-\d{4}\.jsonl$/.test(f)).sort();
  for(const name of files)for(const line of fs.readFileSync(path.join(dir,name),'utf8').split('\n').filter(Boolean)){
   let r;try{r=JSON.parse(line);}catch{throw Error('Journal integrity: incomplete or corrupt JSONL; no trials silently dropped.');}
   const {recordHash,...data}=r;if(data.contextId!==this.contextId||hash(data)!==recordHash||this.ids.has(data.task.id))throw Error('Journal hash/integrity mismatch.');
   this.ids.add(data.task.id);this.records.push(r);
  }
  this.part=files.length||1;this.bytes=files.length?fs.statSync(path.join(dir,files.at(-1))).size:0;
 }
 append(record){
  if(this.ids.has(record.task.id))throw Error('Duplicate trial '+record.task.id);
  const payload={...record,contextId:this.contextId},saved={...payload,recordHash:hash(payload)},line=JSON.stringify(saved)+'\n',bytes=Buffer.byteLength(line);
  if(bytes>this.shardBytes)throw Error('Single trial exceeds shard size; refuse oversized output.');
  if(this.bytes&&this.bytes+bytes>this.shardBytes){this.part++;this.bytes=0;}
  fs.appendFileSync(path.join(this.dir,'trial-'+String(this.part).padStart(4,'0')+'.jsonl'),line);this.bytes+=bytes;this.records.push(saved);this.ids.add(record.task.id);return saved;
 }
 index(){return fs.readdirSync(this.dir).filter(f=>/^trial-\d{4}\.jsonl$/.test(f)).sort().map(file=>({file,bytes:fs.statSync(path.join(this.dir,file)).size,sha256:sha(fs.readFileSync(path.join(this.dir,file)))}));}
}
module.exports={Journal};
