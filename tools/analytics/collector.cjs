'use strict';
const fs=require('node:fs'),path=require('node:path'),{createHash,timingSafeEqual}=require('node:crypto'),{isDeepStrictEqual}=require('node:util');
const PROJECT=path.resolve(__dirname,'../..'),DEFAULT_DATABASE_PATH=path.join(__dirname,'data','education.sqlite');
const PREFIX='/api/education',MAX_BODY=512*1024,MAX_ENTRY=65536;
const categories=new Set(['hint-unclear','more-hint-unclear','question-difficult','question-confusing','steps-unclear','diagram-unclear','other']);
const idValid=id=>typeof id==='string'&&/^[A-Za-z0-9][A-Za-z0-9._:|/-]{0,299}$/.test(id);
const text=(value,max)=>typeof value==='string'&&value.length>0&&value.length<=max&&!/[\x00-\x1f\x7f]/.test(value);
const exactKeys=(value,keys)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===keys.length&&keys.every(key=>Object.hasOwn(value,key));
const date=value=>typeof value==='string'&&value.length===24&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString()===value;
const hash=value=>createHash('sha256').update(value).digest();
function databasePath(value){
 if(value===':memory:')return value;const resolved=path.resolve(value||DEFAULT_DATABASE_PATH);
 // Resolve the existing ancestor as well as files: a symlink followed by a new
 // directory must not turn a nominally private path into a public game file.
 let existing=resolved;const missing=[];while(!fs.existsSync(existing)){const parent=path.dirname(existing);if(parent===existing)break;missing.unshift(path.basename(existing));existing=parent;}
 const physical=path.join(fs.realpathSync(existing),...missing);
 for(const tree of ['dist','release-prod']){const publicRoot=path.join(PROJECT,tree);if(resolved===publicRoot||resolved.startsWith(publicRoot+path.sep)||physical===publicRoot||physical.startsWith(publicRoot+path.sep))throw Error('The analytics database must be outside public game files.');}
 return resolved;
}
function validateFeedback(payload,questions,versions,topics){
 if(!payload||!questions.has(payload.questionId)||!versions.has(payload.bankVersion)||payload.id!==payload.bankVersion+':'+payload.questionId)return false;
 if(payload.deleted===true)return exactKeys(payload,['id','questionId','bankVersion','deleted','updatedAt'])&&date(payload.updatedAt);
 const keys=['id','questionId','bankVersion','topic','difficulty','question','categories','comment','createdAt','updatedAt','context',...(payload.provenance!==undefined?['provenance']:[])];
 if(payload.provenance!==undefined&&(!exactKeys(payload.provenance,['gameVersion','contentRevision'])||!['gameVersion','contentRevision'].every(key=>typeof payload.provenance[key]==='string'&&/^[A-Za-z0-9][A-Za-z0-9._+-]{0,99}$/.test(payload.provenance[key]))))return false;
 if(!exactKeys(payload,keys)||!date(payload.createdAt)||!date(payload.updatedAt)||payload.updatedAt<payload.createdAt||typeof payload.comment!=='string'||payload.comment.length>2000||typeof payload.question!=='string'||payload.question.length>8000||!Array.isArray(payload.categories)||payload.categories.length>7||new Set(payload.categories).size!==payload.categories.length||payload.categories.some(value=>!categories.has(value)))return false;
 const q=questions.get(payload.questionId),context=payload.context;
 const game=context?.mode==='gameplay',contextKeys=['mode','language','status','hintUsed','moreHintViewed','stepsViewed',...(game?['source']:[])];
 return [q.topic,q.topicCode,topics?.[q.topicCode]?.malay].some(label=>typeof label==='string'&&payload.topic===label)&&payload.difficulty===q.difficulty&&exactKeys(context,contextKeys)&&(game?['predict','artifact','mystery'].includes(context.source)&&['correct','revealed'].includes(context.status):['learn','review'].includes(context.mode))&&['en','ms'].includes(context.language)&&['pending','correct','revealed'].includes(context.status)&&['hintUsed','moreHintViewed','stepsViewed'].every(key=>typeof context[key]==='boolean');
}
function validateLearning(payload,bank){
 return require('../../dist/learning-analytics.js').validateRecord(payload,{bank})&&text(payload.sessionId,200)&&text(payload.source,200)&&date(payload.firstCapturedAt)&&date(payload.updatedAt);
}
function readJSON(req){
 return new Promise((resolve,reject)=>{const chunks=[];let size=0,done=false;const fail=(status,message)=>{if(done)return;done=true;reject(Object.assign(Error(message),{status}));};
  req.on('data',chunk=>{size+=chunk.length;if(size>MAX_BODY){chunks.length=0;fail(413,'Request body is too large.');return;}if(!done)chunks.push(chunk);});
  req.on('end',()=>{if(done)return;done=true;try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));}catch{reject(Object.assign(Error('Invalid JSON request.'),{status:400}));}});
  req.on('error',()=>fail(400,'Incomplete request.'));req.on('aborted',()=>fail(400,'Incomplete request.'));
 });
}
function createCollector(options={}){
 const version=process.versions.node.split('.').map(Number);if(version[0]<22||(version[0]===22&&version[1]<13))throw Error('Optional analytics collection requires Node.js 22.13 or later. The ordinary game server remains available.');
 const {DatabaseSync}=require('node:sqlite'),filename=databasePath(options.databasePath),readOnly=options.readOnly===true;
 if(filename!==':memory:'){if(readOnly&&!fs.existsSync(filename))throw Error('The analytics database does not exist. Start the collector before exporting.');if(!readOnly)fs.mkdirSync(path.dirname(filename),{recursive:true,mode:0o700});}
 const db=new DatabaseSync(filename,{readOnly});
 try{if(!readOnly){db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');db.exec(`
  CREATE TABLE IF NOT EXISTS clients(client_id TEXT PRIMARY KEY,secret_hash BLOB NOT NULL,created_at TEXT NOT NULL) STRICT;
  CREATE TABLE IF NOT EXISTS records(client_id TEXT NOT NULL REFERENCES clients(client_id),id TEXT NOT NULL,revision INTEGER NOT NULL CHECK(revision>0),kind TEXT NOT NULL CHECK(kind IN ('learning-record','question-feedback')),payload_json TEXT NOT NULL,received_at TEXT NOT NULL,PRIMARY KEY(client_id,id)) STRICT;
  PRAGMA user_version=1;
 `);if(filename!==':memory:')fs.chmodSync(filename,0o600);}
 }catch(error){db.close();throw error;}
 const mechanics=require('../../dist/mechanics.js'),bank=options.bank||mechanics.data.bank,questions=new Map(bank.questions.map(q=>[q.id,q])),versions=new Set([bank.bankVersion,'form4-review-1.0.0','form4-review-1.4.0','form4-review-1.5.0']);
 const now=()=>{const value=options.now?options.now():Date.now();return new Date(typeof value==='string'?Date.parse(value):value).toISOString();};
 const getClient=db.prepare('SELECT secret_hash FROM clients WHERE client_id=?'),insertClient=readOnly?null:db.prepare('INSERT INTO clients(client_id,secret_hash,created_at) VALUES(?,?,?)');
 const upsert=readOnly?null:db.prepare('INSERT INTO records(client_id,id,revision,kind,payload_json,received_at) VALUES(?,?,?,?,?,?) ON CONFLICT(client_id,id) DO UPDATE SET revision=excluded.revision,kind=excluded.kind,payload_json=excluded.payload_json,received_at=excluded.received_at WHERE excluded.revision>records.revision');
 const getRecord=db.prepare('SELECT revision,kind,payload_json FROM records WHERE client_id=? AND id=?');
 const rows=db.prepare('SELECT client_id,id,revision,kind,payload_json,received_at FROM records ORDER BY client_id,id');let closed=false;
 const reply=(res,status,data)=>{if(res.destroyed)return;res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
 function authorized(clientId,secret){if(typeof clientId!=='string'||!/^[a-f0-9]{48}$/.test(clientId)||typeof secret!=='string'||!/^[a-f0-9]{64}$/.test(secret))return false;const existing=getClient.get(clientId);return !!existing&&timingSafeEqual(Buffer.from(existing.secret_hash),hash(secret));}
 async function handler(req,res){
  let pathname;try{pathname=new URL(req.url,'http://localhost').pathname;}catch{return false;}if(pathname!==PREFIX&&!pathname.startsWith(PREFIX+'/'))return false;
  try{
   const origin=req.headers.origin,ownOrigin=options.origin||((req.socket.encrypted?'https':'http')+'://'+req.headers.host);
   if((origin&&origin!==ownOrigin)||req.headers['sec-fetch-site']==='cross-site'){reply(res,403,{error:'Same-origin requests are required.'});return true;}
   if(pathname===PREFIX+'/status'&&req.method==='GET'){reply(res,200,{protocolVersion:1,enabled:!readOnly});return true;}
   if(![PREFIX+'/register',PREFIX+'/batch'].includes(pathname)){reply(res,404,{error:'Unknown receiver route.'});return true;}
   if(req.method!=='POST'){reply(res,405,{error:'POST is required.'});return true;}
   if(readOnly){reply(res,503,{error:'The receiver is read only.'});return true;}
   if(!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(req.headers['content-type']||'')||(req.headers['content-encoding']&&req.headers['content-encoding']!=='identity')){req.resume();reply(res,415,{error:'JSON requests are required.'});return true;}
   const length=req.headers['content-length'];if(length&&(!/^\d+$/.test(length)||Number(length)>MAX_BODY)){req.resume();reply(res,413,{error:'Request body is too large.'});return true;}
   if(pathname===PREFIX+'/batch'&&(!/^Bearer [a-f0-9]{64}$/.test(req.headers.authorization||'')||!authorized(req.headers['x-stm-client-id'],req.headers.authorization.slice(7)))){req.resume();reply(res,401,{error:'A valid device capability is required.'});return true;}
   const body=await readJSON(req);
   if(pathname===PREFIX+'/register'){
    if(!exactKeys(body,['clientId','secret'])||!/^[a-f0-9]{48}$/.test(body.clientId)||!/^[a-f0-9]{64}$/.test(body.secret)){reply(res,400,{error:'Invalid device registration.'});return true;}
    const existing=getClient.get(body.clientId);if(existing&&!authorized(body.clientId,body.secret)){reply(res,409,{error:'This device ID is already registered.'});return true;}
    if(!existing)insertClient.run(body.clientId,hash(body.secret),now());reply(res,200,{registered:true});return true;
   }
   if(!exactKeys(body,['entries'])||!Array.isArray(body.entries)||body.entries.length<1||body.entries.length>25){reply(res,400,{error:'A batch must contain 1 to 25 entries.'});return true;}
   const ids=new Set();for(const entry of body.entries){if(!exactKeys(entry,['id','revision','kind','payload'])||!idValid(entry.id)||ids.has(entry.id)||!Number.isSafeInteger(entry.revision)||entry.revision<1||!entry.payload||entry.payload.id!==entry.id||Buffer.byteLength(JSON.stringify(entry.payload),'utf8')>MAX_ENTRY||!(entry.kind==='question-feedback'?validateFeedback(entry.payload,questions,versions,bank.topics):entry.kind==='learning-record'&&validateLearning(entry.payload,bank))){reply(res,400,{error:'Invalid education entry.'});return true;}ids.add(entry.id);}
   const conflicts=[];db.exec('BEGIN IMMEDIATE');try{
    for(const entry of body.entries){const stored=getRecord.get(req.headers['x-stm-client-id'],entry.id);if(stored&&stored.revision===entry.revision&&(stored.kind!==entry.kind||!isDeepStrictEqual(JSON.parse(stored.payload_json),entry.payload)))conflicts.push({id:entry.id,revision:stored.revision});}
    if(conflicts.length)db.exec('ROLLBACK');else{const receivedAt=now();for(const entry of body.entries)upsert.run(req.headers['x-stm-client-id'],entry.id,entry.revision,entry.kind,JSON.stringify(entry.payload),receivedAt);db.exec('COMMIT');}
   }catch(error){db.exec('ROLLBACK');throw error;}
   if(conflicts.length){reply(res,409,{conflicts});return true;}
   reply(res,200,{acknowledged:body.entries.map(({id,revision})=>({id,revision}))});return true;
  }catch(error){reply(res,error.status||500,{error:error.status?error.message:'The receiver could not commit this batch.'});return true;}
 }
 function exportData(){return {schemaVersion:1,protocolVersion:1,game:'Mathematics Slayer',purpose:'Diagnostic learning evidence and question improvements',exportedAt:now(),records:rows.all().map(row=>({clientId:row.client_id,id:row.id,revision:row.revision,kind:row.kind,payload:JSON.parse(row.payload_json),receivedAt:row.received_at}))};}
 function csv(){const cell=value=>{let text=String(value??'');if(/^[\s\uFEFF]*[=+@-]|^[\t\r]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"';};const output=[['Client ID','Entry ID','Revision','Kind','Question ID','Bank version','Scope','Session ID','Updated at','Received at','Comment','Deleted','Payload']];for(const row of exportData().records)output.push([row.clientId,row.id,row.revision,row.kind,row.payload.questionId,row.payload.bankVersion,row.payload.scope,row.payload.sessionId,row.payload.updatedAt,row.receivedAt,row.payload.comment,row.payload.deleted===true,JSON.stringify(row.payload)]);return '\uFEFF'+output.map(row=>row.map(cell).join(',')).join('\r\n')+'\r\n';}
 return {handler,exportData,csv,close(){if(!closed){closed=true;db.close();}}};
}
module.exports={createCollector,DEFAULT_DATABASE_PATH};
