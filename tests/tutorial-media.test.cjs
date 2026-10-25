'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),D=require('../dist/tutorial-data.js'),manifest=require('../dist/asset-manifest.json'),captures=require('../docs/tutorial/screenshots.json');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
// Compare capture provenance after only the separately tested Settings extension.
// The original snapshots/images stay unchanged; any other app edit still fails.
function captureAppSource(source){
 const start=source.indexOf('function showSaves(){'),end=source.indexOf('function showStats(){',start);assert.ok(start>=0&&end>start);
 let settings=source.slice(start,end);for(const hook of ["'+(window.STMPlayModeUI?.settingsHTML()||'')+'",'window.STMPlayModeUI?.refresh();']){assert.equal(settings.split(hook).length,2,'Only one optional Settings hook is allowed');settings=settings.replace(hook,'');}
 return source.slice(0,start)+settings+source.slice(end);
}
test('the capture compatibility guard permits only the two optional Settings hooks',()=>{
 const source=fs.readFileSync(path.join(root,'dist/app.js'),'utf8'),expected=Object.values(captures.runtimeSnapshots)[0]['app.js'];
 assert.equal(hash(Buffer.from(captureAppSource(source))),expected);
 const altered=source.replace('function showStats(){','function showStats(){/* unrelated runtime change */');assert.notEqual(altered,source);assert.notEqual(hash(Buffer.from(captureAppSource(altered))),expected);
});
test('every pictured step has real bilingual capture provenance and optional verified bytes',()=>{
 const shots=[...new Set(D.chapters.flatMap(c=>c.frames.map(f=>f.shot)))];assert.equal(captures.version,2);assert.equal(captures.images.length,shots.length*2);
 for(const shot of shots)for(const language of ['en','ms']){
  const file=D.mediaFile(shot,language),capture=captures.images.find(c=>c.id===shot&&c.language===language),entry=manifest.entries.find(e=>e.url==='assets/'+file);
  assert.ok(capture,file+' has a capture record');assert.equal(capture.file,file);assert.ok(capture.actions.length);const snapshot=captures.runtimeSnapshots[capture.inputDigest];assert.ok(snapshot,file+' resolves its original runtime input batch');assert.equal(hash(Buffer.from(JSON.stringify(snapshot))),capture.inputDigest);assert.equal(snapshot['engine.js'],hash(fs.readFileSync(path.join(root,'dist/engine.js'))));assert.equal(snapshot['app.js'],hash(Buffer.from(captureAppSource(fs.readFileSync(path.join(root,'dist/app.js'),'utf8')))));assert.ok(capture.crop.width>0&&capture.crop.height>0);assert.ok(capture.width>0&&capture.height>0);
  const bytes=fs.readFileSync(path.join(root,'dist/assets',file));assert.equal(hash(bytes),capture.sha256);assert.equal(bytes.length,capture.bytes);assert.equal(entry.sha256,capture.sha256);assert.equal(entry.pack,'tutorial');assert.equal(entry.required,false);
 }
});
test('boss picture result shows an actual changed seal state in both languages',()=>{
 for(const language of ['en','ms']){const before=captures.images.find(i=>i.id==='boss'&&i.language===language),after=captures.images.find(i=>i.id==='boss-open'&&i.language===language);assert.notEqual(before.sha256,after.sha256);assert.equal(after.selector,'.seals');assert.ok(after.actions.some(a=>a.correct===true));}
});
