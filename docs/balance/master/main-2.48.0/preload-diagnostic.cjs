'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{createRequire}=require('node:module');
const source=path.join(process.cwd(),'tests/automatic-preload-browser.cjs'),original=fs.readFileSync(source,'utf8');
const needle='assert.equal(complete.q.failed,0);';assert.equal(original.split(needle).length,2);
const injection=`console.log('PRELOAD_DIAGNOSTIC '+JSON.stringify({complete,inspection:await p.evaluate(async()=>{const m=STMHosted.manager,c=await caches.open(m.cacheName),all=m.manifest.entries.filter(e=>e.pack!=='practice'&&!m.available(e.url)),before={q:STMHosted.downloads(),stats:m.stats()},missing=await Promise.all(all.map(async e=>({entry:e,inPersistentCache:!!await c.match(new URL(e.url,m.base).href)})));await m.reconcile({retryStorage:true});return {before,missing,afterReconcile:{q:STMHosted.downloads(),stats:m.stats(),missing:m.manifest.entries.filter(e=>e.pack!=='practice'&&!m.available(e.url)).map(e=>e.url)}};})}));`;
const code=original.replace(needle,injection+needle);const out=process.env.QA_DIAGNOSTIC_SOURCE||'/tmp/stm-preload-diagnostic-executed.cjs';fs.writeFileSync(out,code);
new Function('require','module','exports','__dirname','__filename',code)(createRequire(source),module,exports,path.dirname(source),source);
