'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http');
const modulePath=path.resolve(__dirname,'../tools/dev/collection.cjs');
const valid='https://script.google.com/macros/s/DEPLOYMENT1234567890/exec';
async function fixture(t){
 assert.ok(fs.existsSync(modulePath),'The development-only collection handler is available');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'stm-collection-')),file=path.join(dir,'learning-collection-config.js'),other=path.join(dir,'player-save.json');
 fs.writeFileSync(file,"/* Public project default. */\nglobalThis.DCLearningCollectionConfig={googleScriptUrl:''};\n");fs.writeFileSync(other,'keep-player-save');
 const handle=require(modulePath).createCollectionHandler({file});const server=http.createServer((req,res)=>handle(req,res,new URL(req.url,'http://localhost').pathname));
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
 t.after(async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));fs.rmSync(dir,{recursive:true,force:true});});
 const get=()=>fetch(origin+'/__dev/education-collection');
 const post=(body,headers={})=>fetch(origin+'/__dev/education-collection',{method:'POST',headers:{origin,'content-type':'application/json',...headers},body:typeof body==='string'?body:JSON.stringify(body)});
 const rawPost=(data,host)=>new Promise((resolve,reject)=>{const payload=JSON.stringify(data),req=http.request(origin+'/__dev/education-collection',{method:'POST',headers:{Host:host,Origin:origin,'Content-Type':'application/json','Content-Length':Buffer.byteLength(payload)}},res=>{res.resume();res.on('end',()=>resolve({status:res.statusCode}));});req.on('error',reject);req.end(payload);});
 return {file,other,get,post,rawPost,origin,handle};
}
test('local developer setup saves a strict public receiver default and rejects a stale concurrent edit',async t=>{
 const f=await fixture(t),before=fs.readFileSync(f.other,'utf8');let response=await f.get();assert.equal(response.status,200);const first=await response.json();assert.equal(first.googleScriptUrl,'');assert.match(first.revision,/^[a-f0-9]{64}$/);
 response=await f.post({googleScriptUrl:valid,revision:first.revision});assert.equal(response.status,200);const saved=await response.json();assert.equal(saved.googleScriptUrl,valid);assert.notEqual(saved.revision,first.revision);assert.ok(fs.readFileSync(f.file,'utf8').includes(valid));
 response=await f.post({googleScriptUrl:'',revision:first.revision});assert.equal(response.status,409);assert.ok(fs.readFileSync(f.file,'utf8').includes(valid));assert.equal(fs.readFileSync(f.other,'utf8'),before);
 response=await f.post({googleScriptUrl:'',revision:saved.revision});assert.equal(response.status,200);assert.equal((await response.json()).googleScriptUrl,'');
});
test('cross-origin, forged-host and malformed developer writes cannot modify project configuration',async t=>{
 const f=await fixture(t),before=fs.readFileSync(f.file),state=await (await f.get()).json();
 for(const origin of ['https://evil.example','null',''])assert.equal((await f.post({googleScriptUrl:valid,revision:state.revision},{origin})).status,403);
 assert.equal((await f.rawPost({googleScriptUrl:valid,revision:state.revision},'attacker.example')).status,403);
 for(const googleScriptUrl of ['https://drive.google.com/file/d/test','https://script.google.com/macros/s/TEST1234567890123456/dev','javascript:alert(1)',7])assert.equal((await f.post({googleScriptUrl,revision:state.revision})).status,400);
 assert.equal((await f.post({googleScriptUrl:valid,revision:state.revision,path:'elsewhere'})).status,400);
 assert.equal((await f.post('{broken')).status,400);assert.equal((await f.post('x'.repeat(3000))).status,413);
 assert.equal((await f.post({googleScriptUrl:valid,revision:state.revision},{'content-type':'text/plain'})).status,415);
 assert.deepEqual(fs.readFileSync(f.file),before);
});
test('developer configuration refuses LAN callers before reading or writing a project file',async t=>{
 const f=await fixture(t),before=fs.readFileSync(f.file);let status,body;
 const req={method:'POST',headers:{host:'localhost:4174',origin:'http://localhost:4174','content-type':'application/json'},socket:{remoteAddress:'192.168.1.90',localPort:4174},resume(){}};
 const res={writeHead(value){status=value;},end(value){body=value;}};
 assert.equal(await f.handle(req,res,'/__dev/education-collection'),true);assert.equal(status,403);assert.match(body,/local|localhost/i);assert.deepEqual(fs.readFileSync(f.file),before);
});
