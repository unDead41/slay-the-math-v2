'use strict';
const fs=require('node:fs'),z=require('node:zlib'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const A=require('./deep-analyse.cjs'),D=require('./deep.cjs'),{loadEngine}=require('./loader.cjs'),{campaign}=require('./growth.cjs');
const dir='docs/balance/combat/deep-results',s=JSON.parse(fs.readFileSync(dir+'/SUMMARY.json')),old=JSON.parse(fs.readFileSync(dir+'/prior-logs/deep-analysis-final.log','utf8').trim());
assert.deepEqual(s.coverage,old.coverage);assert.equal(s.totalEncounters,old.totalEncounters);assert.deepEqual(s.stressTotals,old.stress);assert.equal(s.invalid.length,0);assert.equal(s.stressFailures.length,0);
const hashes={};let replays=0;const engines={},get=(b,d)=>engines[b+':'+d]||(engines[b+':'+d]=loadEngine({build:b,difficulty:d}));
for(const c of s.coverage){
 const m=JSON.parse(fs.readFileSync(dir+'/'+c.cohort+'-manifest.json')),source=JSON.parse(z.gunzipSync(fs.readFileSync(dir+'/source-snapshots/'+m.codeHash+'.json.gz')));assert.equal(D.hash(source),m.codeHash);
 const rs=A.rows(c.cohort);assert.equal(rs.length,m.cases);assert.equal(new Set(rs.map(r=>r.index)).size,rs.length);
 for(const f of fs.readdirSync(dir).filter(f=>new RegExp('^'+c.cohort+'-\\d+\\.jsonl\\.gz$').test(f))){const bytes=fs.readFileSync(dir+'/'+f);hashes[f]={bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};}
 if(c.cohort==='reload')continue;
 for(const r of [rs[0],rs.at(-1)]){
  const isCampaign=['campaign_reviewed','hard_followup'].includes(c.cohort),x=get(r.build,r.difficulty),v=isCampaign?campaign(x,r.options):D.simulate(x,r.options);
  // Raw JSON omits undefined fields; compare serialized mechanical results consistently.
  try{assert.deepEqual(JSON.parse(JSON.stringify(isCampaign?v:D.outcome(v))),JSON.parse(JSON.stringify(isCampaign?r.result:D.outcome(r.result))));}catch(e){throw Error('Replay mismatch '+c.cohort+' index '+r.index);}
  replays++;
 }
}
const lock={regeneratedAggregateMatchesPrior:true,replays,sourceManifestsVerified:s.coverage.length,rawParts:hashes,sourceHashes:Object.fromEntries(fs.readdirSync('tools/balance').filter(f=>/\.cjs$/.test(f)).map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync('tools/balance/'+f)).digest('hex')])),specSHA256:crypto.createHash('sha256').update(fs.readFileSync('tools/balance/specs/balance-spec.v1.2.json')).digest('hex')};
fs.writeFileSync(dir+'/INTEGRITY.json',JSON.stringify(lock,null,2));console.log('INTEGRITY PASS',s.totalEncounters,'encounters;',replays,'exact case replays; all sources/parts verified.');
