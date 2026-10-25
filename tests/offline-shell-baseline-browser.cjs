/* Real persistent profile: normal asset completion is insufficient without HTML. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.BROWSER_QA_MODULE||'playwright'),root=path.resolve(__dirname,'..'),dir=path.join(root,'release-prod'),profile=fs.mkdtempSync(path.join(os.tmpdir(),'stm-offline-shell-'));
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg','.ogg':'audio/ogg'};
const server=http.createServer((q,r)=>{const name=new URL(q.url,'http://localhost').pathname.replace(/^\/game\//,'')||'index.html',file=path.resolve(dir,name);if(!file.startsWith(dir+'/')){r.writeHead(403);r.end();return;}fs.readFile(file,(e,b)=>{r.writeHead(e?404:200,{'content-type':mime[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});r.end(e?'missing':b);});});
function observe(page,label){page.on('pageerror',e=>console.error(label+' PAGEERROR '+e.message));page.on('crash',()=>console.error(label+' PAGE CRASH'));page.on('response',r=>{if(r.status()>=400)console.error(label+' HTTP '+r.status()+' '+r.url());});}
const options={headless:true,executablePath:process.env.QA_CHROMIUM_EXECUTABLE||'/tmp/chromium',args:['--no-sandbox','--disable-dev-shm-usage']};
(async()=>{let context;await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port+'/game/';
 try{context=await chromium.launchPersistentContext(profile,options);let page=context.pages()[0];observe(page,'online');await page.goto(url);await page.locator('#resource-enter').waitFor({state:'visible',timeout:120000});await page.locator('#resource-enter').click();
 await page.evaluate(async()=>{const m=STMHosted.manager;await m.prepare(m.manifest.entries.map(e=>e.url),{timeoutMs:Infinity});});
 assert.equal(await page.evaluate(()=>STMHosted.manager.stats().availableFiles),require('../release-prod/asset-manifest.json').entries.length);
 // This also runs against the new implementation to prove navigation needs
 // a committed installation rather than an unrelated browser HTTP cache.
 if(process.env.QA_COMPLETE_INSTALL)await page.evaluate(async()=>{await STMHosted.offline.install();if(!STMHosted.offline.snapshot().ready)throw Error(JSON.stringify(STMHosted.offline.snapshot()));});
 await context.close();context=null;await new Promise(r=>server.close(r));
 context=await chromium.launchPersistentContext(profile,options);await context.setOffline(true);page=context.pages()[0];observe(page,'cold');const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
 let response,error;try{response=await page.goto(url,{timeout:30000});}catch(e){error=e.message;}
 console.log(JSON.stringify({profile,serverStopped:true,newBrowserProcess:true,networkOffline:true,httpCacheDisabled:true,navigationStatus:response?.status()??null,error:error||null}));
 assert.ok(response?.ok(),'Cold offline navigation must load verified cached HTML after full asset preparation: '+error);
 for(let i=0;i<12&&!await page.locator('#resource-enter').isVisible();i++){console.log('COLD STATE '+JSON.stringify(await page.evaluate(()=>({title:document.getElementById('resource-title')?.textContent,detail:document.getElementById('resource-detail')?.textContent,manager:window.STMHosted?.manager?.stats(),offline:window.STMHosted?.offline?.snapshot()?.phase}))));await new Promise(r=>setTimeout(r,1000));}await page.locator('#resource-enter').waitFor({state:'visible',timeout:120000});console.log('PASS cold offline shell survives complete browser closure and stopped server');
 }finally{await context?.close();if(server.listening){server.closeAllConnections();await new Promise(r=>server.close(r));}fs.rmSync(profile,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
