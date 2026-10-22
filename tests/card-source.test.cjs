const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),source=require('../modules/cards/source/data/cards.master.json'),runtime=require('../dist/card-data.js'),C=require('../dist/config.js');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
test('card source: all forty canonical identities, rules and bilingual tokens survive the import; legacy IDs stay separate',()=>{
 assert.deepEqual(runtime,source);assert.equal(runtime.cards.length,40);assert.equal(new Set(C.CARD_POOL).size,40);
 const map=require('../modules/cards/runtime-id-map.json');
 assert.deepEqual(C.CARD_POOL,runtime.cards.map(c=>c.id));
 for(const c of runtime.cards){assert.equal(C.cards[c.id].packageId,c.id);assert.equal(map.cards.find(x=>x.package_id===c.id).runtime_id,c.id);}
 for(const id of ['strike','ember','guard','flameguard','filter','draw','blast','fort','balance','clarity','pierce','renew']){assert.ok(C.cards[id]);assert.equal(C.cards[id].packageId,undefined);assert.equal(C.CARD_POOL.includes(id),false);}
 assert.equal(C.STARTER.reduce((n,[,count])=>n+count,0),12);
});
test('card source: every selected icon and full Normal/Focus frame is a nonempty, verified runtime image',()=>{
 const manifest=require('../dist/assets/card-assets.json'),required=runtime.cards.map(c=>c.icon);
 for(const frame of Object.values(runtime.frames.categories))for(const state of ['normal','focus'])if(frame[state])required.push(frame[state]);
 assert.equal(manifest.assets.length,47);
 for(const input of required){
  const file=manifest.runtimePaths[input],entry=manifest.assets.find(e=>e.source===input);assert.ok(entry,input);assert.ok(file?.startsWith('assets/'));
  const bytes=fs.readFileSync(path.join(root,'dist',file));assert.ok(bytes.length>100,input+' must contain real encoded pixels');
  assert.equal(bytes.subarray(0,4).toString(),'RIFF');assert.equal(bytes.subarray(8,12).toString(),'WEBP');assert.equal(bytes.readUInt32LE(4)+8,bytes.length,input+' RIFF length');
  assert.equal(digest(bytes),entry.runtimeSha256,input+' digest');assert.deepEqual(entry.size.length,2);
 }
});
