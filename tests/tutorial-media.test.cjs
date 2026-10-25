'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),D=require('../dist/tutorial-data.js'),manifest=require('../dist/asset-manifest.json'),captures=require('../docs/tutorial/screenshots.json');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
test('every pictured step has real bilingual capture provenance and optional verified bytes',()=>{
 const shots=[...new Set(D.chapters.flatMap(c=>c.frames.map(f=>f.shot)))];assert.equal(captures.version,2);assert.equal(captures.images.length,shots.length*2);
 for(const shot of shots)for(const language of ['en','ms']){
  const file=D.mediaFile(shot,language),capture=captures.images.find(c=>c.id===shot&&c.language===language),entry=manifest.entries.find(e=>e.url==='assets/'+file);
  assert.ok(capture,file+' has a capture record');assert.equal(capture.file,file);assert.ok(capture.actions.length);const snapshot=captures.runtimeSnapshots[capture.inputDigest];assert.ok(snapshot,file+' resolves its original runtime input batch');assert.equal(hash(Buffer.from(JSON.stringify(snapshot))),capture.inputDigest);assert.equal(snapshot['engine.js'],hash(fs.readFileSync(path.join(root,'dist/engine.js'))));assert.equal(snapshot['app.js'],hash(fs.readFileSync(path.join(root,'dist/app.js'))));assert.ok(capture.crop.width>0&&capture.crop.height>0);assert.ok(capture.width>0&&capture.height>0);
  const bytes=fs.readFileSync(path.join(root,'dist/assets',file));assert.equal(hash(bytes),capture.sha256);assert.equal(bytes.length,capture.bytes);assert.equal(entry.sha256,capture.sha256);assert.equal(entry.pack,'tutorial');assert.equal(entry.required,false);
 }
});
test('boss picture result shows an actual changed seal state in both languages',()=>{
 for(const language of ['en','ms']){const before=captures.images.find(i=>i.id==='boss'&&i.language===language),after=captures.images.find(i=>i.id==='boss-open'&&i.language===language);assert.notEqual(before.sha256,after.sha256);assert.equal(after.selector,'.seals');assert.ok(after.actions.some(a=>a.correct===true));}
});
