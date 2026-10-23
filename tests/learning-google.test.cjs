'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom'),{webcrypto}=require('node:crypto'),{MessageChannel}=require('node:worker_threads');
const file=path.resolve(__dirname,'../dist/learning-google.js'),URL_='https://script.google.com/macros/s/TEST_DEPLOYMENT_1234567890/exec';
function api(){assert.ok(fs.existsSync(file),'Google transport is available');return require(file);}
function setup(t){const dom=new JSDOM('<!doctype html><body></body>',{url:'https://game.example/',pretendToBeVisual:true}),w=dom.window;Object.defineProperty(w,'crypto',{value:webcrypto});w.MessageChannel=MessageChannel;const transport=api().createTransport({url:URL_,host:w,timeoutMs:120});t.after(()=>{transport.close();dom.window.close();});return {w,transport};}
function ready(w,peer,{origin='https://n-test-script.googleusercontent.com',nonce}={}){const frame=w.document.querySelector('iframe'),channel=nonce||new URL(frame.src).searchParams.get('stmNonce');w.dispatchEvent(new w.MessageEvent('message',{origin,source:peer,data:{type:'stm-google-ready',protocolVersion:1,channel}}));}
function peerFor(responder){return {postMessage(message,origin,ports){assert.equal(message.type,'stm-google-connect');assert.match(origin,/^https:\/\//);const port=ports[0];port.onmessage=event=>{const m=event.data;if(m.type==='stm-google-request')responder(m,reply=>port.postMessage({type:'stm-google-reply',protocolVersion:1,requestId:m.requestId,response:reply}));};port.postMessage({type:'stm-google-connected',protocolVersion:1});}};}
test('Google URL validation accepts deployed web apps and rejects lookalikes, credentials and Drive links',()=>{
 const A=api();assert.equal(A.normalizeURL('  '+URL_+'  '),URL_);assert.equal(A.normalizeURL(''),'');
 for(const value of ['http://script.google.com/macros/s/TEST_DEPLOYMENT_1234567890/exec',URL_+'?x=1',URL_+'#secret',URL_.replace('/exec','/dev'),'https://script.google.com.evil.test/macros/s/TEST_DEPLOYMENT_1234567890/exec','https://user:pass@script.google.com/macros/s/TEST_DEPLOYMENT_1234567890/exec','https://docs.google.com/spreadsheets/d/id','https://drive.google.com/folders/id'])assert.throws(()=>A.normalizeURL(value),/Google|deployment|web.app|exec/i,value);
});
test('transport stays lazy, authenticates a nested Google frame, and sends credentials through the port only',async t=>{
 const {w,transport}=setup(t);assert.equal(w.document.querySelector('iframe'),null);
 let observed;const pending=transport.fetch('https://game.example/api/education/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({clientId:'a'.repeat(48),secret:'b'.repeat(64)})});
 const frame=w.document.querySelector('iframe');assert.ok(frame);assert.ok(!frame.src.includes('b'.repeat(64)));assert.equal(new URL(frame.src).searchParams.get('stmParentOrigin'),'https://game.example');
 ready(w,peerFor((m,reply)=>{observed=m.request;reply({status:200,body:{registered:true}});}));
 const response=await pending;assert.equal(response.status,200);assert.deepEqual(await response.json(),{registered:true});assert.equal(observed.action,'register');assert.equal(observed.body.secret,'b'.repeat(64));
});
test('unsolicited origin/nonce readiness cannot start the private transport',async t=>{
 const {w,transport}=setup(t);let connected=false;const peer={postMessage(){connected=true;}};
 const pending=transport.fetch('https://game.example/api/education/status',{method:'GET'});const rejected=assert.rejects(pending,/unavailable|timed out|timeout/i);
 ready(w,peer,{origin:'https://attacker.example'});ready(w,peer,{nonce:'0'.repeat(64)});assert.equal(connected,false);await rejected;
});
test('abort and page cleanup retain no waiting request or credential-bearing iframe',async t=>{
 const {w,transport}=setup(t),controller=new AbortController();const pending=transport.fetch('https://game.example/api/education/status',{method:'GET',signal:controller.signal});const rejected=assert.rejects(pending,/abort|paused|closed/i);controller.abort();await rejected;transport.close();assert.equal(w.document.querySelector('iframe'),null);
 await assert.rejects(transport.fetch('https://game.example/api/education/status',{method:'GET'}),/closed/i);
});
test('malformed private replies fail rather than manufacturing an acknowledgement',async t=>{
 const {w,transport}=setup(t);const pending=transport.fetch('https://game.example/api/education/batch',{method:'POST',headers:{Authorization:'Bearer '+'c'.repeat(64),'X-STM-Client-Id':'a'.repeat(48)},body:'{"entries":[]}'});
 ready(w,peerFor((m,reply)=>{assert.equal(m.request.secret,'c'.repeat(64));reply({status:'200',body:{acknowledged:[]}});}));await assert.rejects(pending,/invalid|malformed/i);
});
test('adapter rejects an unrelated request address before loading Google',async t=>{
 const {w,transport}=setup(t);await assert.rejects(transport.fetch('https://attacker.example/api/education/status',{method:'GET'}),/origin|address|route/i);assert.equal(w.document.querySelector('iframe'),null);
});
