const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {sourceAudit,verifyReference}=require('../tools/balance/map/source-audit.cjs');
test('context fingerprints the engine dependency closure and actual input bytes',()=>{
 const a=sourceAudit();
 for(const f of ['dist/math.js','dist/rich-text.js','dist/rich-text-data.js','dist/combat-log.js'])assert.ok(a.sourceHashes[f]);
 for(const f of ['tools/balance/map/inputs/balance-v1.2-reference.json','tools/balance/map/inputs/provenance.json'])assert.ok(a.toolHashes[f]);
 const bytes=fs.readFileSync(require.resolve('../tools/balance/map/inputs/balance-v1.2-reference.json'));
 assert.equal(verifyReference(bytes,a.inputPackage),a.inputPackage.memberSha256);
 assert.throws(()=>verifyReference(Buffer.concat([bytes,Buffer.from(' ')]),a.inputPackage),/digest/i);
});
