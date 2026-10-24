/* Local operator setup. This module is loaded only by the development server. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),{createHash,randomBytes}=require('node:crypto');
const {normalizeURL}=require('../../dist/learning-google.js');
const ROUTE='/__dev/education-collection',LIMIT=2048;
function failure(status,message){return Object.assign(Error(message),{status});}
function read(file){
 const source=fs.readFileSync(file,'utf8');
 const match=source.match(/globalThis\.DCLearningCollectionConfig\s*=\s*\{\s*["']?googleScriptUrl["']?\s*:\s*("(?:[^"\\]|\\.)*"|'[^']*')\s*\}\s*;?\s*$/);
 if(!match)throw failure(422,'The project collection setting has an unfamiliar format. Keep the file and check it before saving.');
 const value=match[1][0]==='"'?JSON.parse(match[1]):match[1].slice(1,-1);
 return {googleScriptUrl:normalizeURL(value),revision:createHash('sha256').update(source).digest('hex')};
}
function localOrigin(req){
 const address=req.socket.remoteAddress;
 if(!['127.0.0.1','::1','::ffff:127.0.0.1'].includes(address))throw failure(403,'Open developer collection setup on localhost on this computer.');
 let origin;try{origin=new URL('http://'+req.headers.host);}catch{throw failure(403,'Use the local developer address.');}
 if(!['localhost','127.0.0.1','[::1]'].includes(origin.hostname)||Number(origin.port||80)!==req.socket.localPort||origin.username||origin.password||origin.pathname!=='/'||origin.search||origin.hash)throw failure(403,'Use the local developer address.');
 if(req.headers.origin&&req.headers.origin!==origin.origin)throw failure(403,'Collection setup requires the same local origin.');
 if(req.method==='POST'&&req.headers.origin!==origin.origin)throw failure(403,'Collection setup requires the same local origin.');
}
function body(req){
 if(Number(req.headers['content-length'])>LIMIT)return Promise.reject(failure(413,'Collection setup is limited to 2 KB.'));
 return new Promise((resolve,reject)=>{
  const chunks=[];let bytes=0,done=false;
  const fail=error=>{if(done)return;done=true;reject(error);req.resume();};
  req.on('data',chunk=>{if(done)return;bytes+=chunk.length;if(bytes>LIMIT)return fail(failure(413,'Collection setup is limited to 2 KB.'));chunks.push(chunk);});
  req.on('end',()=>{if(!done){done=true;resolve(Buffer.concat(chunks).toString('utf8'));}});
  req.on('error',()=>fail(failure(400,'The request was interrupted.')));
  req.on('aborted',()=>fail(failure(400,'The request was interrupted.')));
 });
}
function save(file,url){
 const temp=path.join(path.dirname(file),'.collection-'+process.pid+'-'+randomBytes(6).toString('hex')+'.tmp');
 const source='/* Public game collection default, set through the local Developer Hub.\n   Players choose consent in Learning Report; existing browser choices are preserved. */\nglobalThis.DCLearningCollectionConfig={googleScriptUrl:'+JSON.stringify(url)+'};\n';
 try{fs.writeFileSync(temp,source,{encoding:'utf8',flag:'wx'});fs.renameSync(temp,file);}finally{try{fs.unlinkSync(temp);}catch{}}
}
function createCollectionHandler({file=path.resolve(__dirname,'../../dist/learning-collection-config.js')}={}){
 return async function collectionRequest(req,res,pathname){
  if(pathname!==ROUTE)return false;
  const reply=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value));};
  try{
   localOrigin(req);
   if(!['GET','POST'].includes(req.method))throw failure(405,'Use GET to read or POST to save collection settings.');
   if(req.method==='GET'){reply(200,read(file));return true;}
   if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||''))throw failure(415,'Send collection settings as JSON.');
   let data;try{data=JSON.parse(await body(req));}catch(error){if(error.status)throw error;throw failure(400,'Collection settings are not valid JSON.');}
   if(!data||Array.isArray(data)||Object.keys(data).sort().join(',')!=='googleScriptUrl,revision'||typeof data.googleScriptUrl!=='string'||typeof data.revision!=='string'||!/^[a-f0-9]{64}$/.test(data.revision))throw failure(400,'Use a collection link and the current project revision.');
   let url;try{url=normalizeURL(data.googleScriptUrl);}catch{throw failure(400,'Paste a deployed Google Apps Script link ending in /exec.');}
   if(read(file).revision!==data.revision)throw failure(409,'The project setting changed in another window. Reload settings before saving again.');
   save(file,url);reply(200,read(file));
  }catch(error){req.resume();reply(error.status||500,{error:error.status?error.message:'The project setting could not be saved. Keep the link and check file access.'});}
  return true;
 };
}
module.exports={createCollectionHandler};
