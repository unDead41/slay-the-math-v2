'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {experiment}=require('../tools/ai-playtester/experiments.cjs');
const data=require('../tools/ai-playtester/experience-data.cjs');
const source={branch:'main',commit:'6c49f3980c3a832635d4d01a6c50a8df98ac4aad'},seedPlan={train:[93],validation:[701,702]};
const report=()=>experiment({mode:'cards',difficulty:'medium',skill:'intermediate',predict:'skip',seed:93,seeds:1,cards:['stm.attack.rune_strike'],enemy:'wisp',experience:'off'});
function fixture(){const r=report(),observations=data.normalizeReports([r],{domain:'combat',split:'train',source});return {observations,source,seedPlan};}
function out(t){const p=fs.mkdtempSync(path.join(os.tmpdir(),'stm-exp-'));t.after(()=>fs.rmSync(p,{recursive:true,force:true}));return path.join(p,'bundle');}
test('real paired reports survive source-bound JSONL exchange without losing cells or identity',t=>{
 const bundle=fixture(),dir=out(t);data.writeBundle(dir,bundle);const loaded=data.readBundle(dir);
 assert.equal(loaded.observations.length,1);assert.deepEqual(loaded.observations[0].cells.map(c=>c.mask),[0,1]);assert.equal(loaded.observations[0].status,'COMPLETE');assert.equal(loaded.manifest.summary.observations,1);
 assert.equal(data.runtimeKey(loaded.observations[0].runtime),data.runtimeKey(bundle.observations[0].runtime));assert.throws(()=>data.writeBundle(dir,bundle),/exist/i);
});
test('the reader rejects changed raw bytes before accepting a bundle',t=>{
 const dir=out(t);data.writeBundle(dir,fixture());fs.appendFileSync(path.join(dir,'observations.jsonl'),'{}\n');assert.throws(()=>data.readBundle(dir),/hash|digest|bytes/i);
});
test('duplicate deterministic scenarios cannot inflate model support',t=>{
 const b=fixture();b.observations.push({...b.observations[0]});assert.throws(()=>data.writeBundle(out(t),b),/duplicate/i);
});
test('incomplete factorials and mixed runtime cells cannot become measured training cases',()=>{
 const r=report();r.rows.pop();assert.throws(()=>data.normalizeReports([r],{domain:'combat',split:'train',source}),/mask|incomplete|cell/i);
 const q=report();q.rows[1].provenance={...q.rows[1].provenance,engineHash:'f'.repeat(64)};assert.throws(()=>data.normalizeReports([q],{domain:'combat',split:'train',source}),/runtime|identity/i);
});
test('censored cells retain null utility and remain visible but cannot be fitted',t=>{
 const r=report();r.rows[1]={...r.rows[1],status:'BENCHMARK_LIMIT_CENSORED',utility:null};const b={observations:data.normalizeReports([r],{domain:'combat',split:'train',source}),source,seedPlan};
 assert.equal(b.observations[0].status,'CENSORED');assert.equal(b.observations[0].cells[1].utility,null);const dir=out(t);data.writeBundle(dir,b);const model=data.fitModel(data.readBundle(dir));assert.equal(model.summary.excluded,1);assert.equal(model.summary.singleContexts,0);
});
test('fitting arithmetic uses each complete single or four-cell interaction once',()=>{
 // Hand-derived model input: one +20 single delta and a 9-2-3+0=4 pair.
 const one=fixture().observations[0];one.cards=['stm.attack.weak_point'];one.id='single';one.cells=[{mask:0,status:'WIN',utility:10},{mask:1,status:'WIN',utility:30}];
 const pair={...one,id:'pair',cards:['stm.attack.weak_point','stm.attack.fate_storm'],cells:[0,2,3,9].map((utility,mask)=>({mask,status:'WIN',utility}))};
 const model=data.fitModel({manifest:{source,seedPlan},observations:[one,pair]}),profile=model.profiles[data.runtimeKey(one.runtime)];
 assert.ok(Math.abs(profile.cards['stm.attack.weak_point:false'].adjustment-1/6)<1e-12);assert.equal(profile.cards['stm.attack.weak_point:false'].contexts,1);
 const learned=Object.values(profile.pairs)[0];assert.ok(Math.abs(learned.adjustment-1/30)<1e-12);assert.equal(learned.contexts,1);assert.equal(model.summary.singleContexts,1);assert.equal(model.summary.pairContexts,1);
});
test('validation seeds and mislabeled fitting splits are rejected instead of leaked',()=>{
 const b=fixture();assert.throws(()=>data.fitModel({manifest:{source,seedPlan:{train:[93],validation:[93]}},observations:b.observations}),/seed|overlap|validation/i);
 b.observations[0].split='validation';assert.throws(()=>data.fitModel({manifest:{source,seedPlan},observations:b.observations}),/split|train|validation/i);
});
test('wrong source digest and nonfinite labels are refused',()=>{
 const r=report();r.sourceHash='0'.repeat(64);assert.throws(()=>data.normalizeReports([r],{domain:'combat',split:'train',source}),/source|digest/i);
 const q=report();q.rows[0].utility=Infinity;assert.throws(()=>data.normalizeReports([q],{domain:'combat',split:'train',source}),/finite|utility/i);
});

test('Map and Economy envelopes retain actual resource outcomes and reject nonfinite data',t=>{
 const runtime=fixture().observations[0].runtime,base={schemaVersion:1,id:'shop',domain:'economy',kind:'transaction',source,sourceHash:'a'.repeat(64),policy:'observed-checkout',split:'train',seed:93,runtime,status:'COMPLETE',outcome:{result:'PURCHASED',goldBefore:80,goldAfter:40,goldEarned:40,goldSpent:80}};
 const dir=out(t);data.writeBundle(dir,{source,seedPlan,observations:[base]});assert.equal(data.readBundle(dir).observations[0].outcome.goldSpent,80);
 assert.throws(()=>data.validateObservation({...base,outcome:{goldSpent:Infinity}}),/finite|outcome/i);
});
test('bundle headers cannot claim another source or undeclared fitting seeds',t=>{
 const b=fixture();assert.throws(()=>data.writeBundle(out(t),{...b,source:{...source,commit:'f'.repeat(40)}}),/source/i);
 const other=fixture();other.observations[0].seed=123;assert.throws(()=>data.writeBundle(out(t),other),/seed/i);
});

test('executed difficulty cannot be relabeled by row or report scope before fitting',()=>{
 const real=experiment({mode:'cards',difficulty:'easy',skill:'intermediate',predict:'feedback',seed:93,seeds:1,cards:['stm.attack.weak_point'],enemy:'golem',experience:'off'});
 assert.notEqual(real.rows[1].utility,real.rows[0].utility,'use genuine nonzero Easy labels');
 const rowOnly=structuredClone(real);for(const row of rowOnly.rows)row.difficulty='hard';
 assert.throws(()=>data.normalizeReports([rowOnly],{domain:'combat',split:'train',source}),/difficulty|scope|provenance/i);
 const declaredOnly=structuredClone(real);declaredOnly.options.difficulty='hard';
 assert.throws(()=>data.normalizeReports([declaredOnly],{domain:'combat',split:'train',source}),/difficulty|scope|schedule/i);
 const both=structuredClone(rowOnly);both.options.difficulty='hard';
 assert.throws(()=>data.normalizeReports([both],{domain:'combat',split:'train',source}),/difficulty|provenance/i);
});
test('empty reports and absent complete seed or skill groups cannot disappear from exchange',()=>{
 const real=report(),options={domain:'combat',split:'train',source};
 const empty=structuredClone(real);empty.rows=[];assert.throws(()=>data.normalizeReports([empty],options),/missing|incomplete|planned|empty/i);
 const seed=structuredClone(real);seed.options.seeds=2;seed.total=4;assert.throws(()=>data.normalizeReports([seed],options),/missing|incomplete|planned|schedule/i);
 const skill=structuredClone(real);skill.options.skill='all';skill.total=6;assert.throws(()=>data.normalizeReports([skill],options),/missing|incomplete|planned|schedule/i);
 const total=structuredClone(real);total.total=4;assert.throws(()=>data.normalizeReports([total],options),/planned|total|schedule/i);
 assert.throws(()=>data.normalizeReports([],options),/empty|report|schedule/i);
});
test('a predeclared cohort detects a missing whole report before export and after storage',t=>{
 const a=report(),b=experiment({...a.options,seed:94}),schedule=[a.options,b.options],options={domain:'combat',split:'train',source,schedule};
 assert.throws(()=>data.normalizeReports([a],options),/missing|planned|schedule|report/i);
 const observations=data.normalizeReports([a,b],options),plan=observations.plan,dir=out(t),seeds={train:[93,94],validation:[701,702]};
 data.writeBundle(dir,{observations,source,seedPlan:seeds});const loaded=data.readBundle(dir);assert.equal(loaded.manifest.plan.scope,'PREDECLARED_COHORT');assert.equal(loaded.manifest.plan.plannedReports,2);assert.equal(loaded.manifest.plan.plannedGroups,2);assert.equal(loaded.manifest.plan.plannedCells,4);
 assert.throws(()=>data.writeBundle(out(t),{observations:observations.slice(0,1),plan,source,seedPlan:seeds}),/missing|planned|schedule|coverage/i);
 // A custom producer truncates an entire report and updates hashes/counts, but retains the frozen plan.
 const manifest=loaded.manifest,raw=JSON.stringify(observations[0])+'\n',summary={observations:1,complete:1,censored:0,invalid:0,cells:2},summaryBytes=JSON.stringify(summary,null,2)+'\n';
 fs.writeFileSync(path.join(dir,'observations.jsonl'),raw);fs.writeFileSync(path.join(dir,'summary.json'),summaryBytes);manifest.summary=summary;
 for(const [file,bytes]of [['observations.jsonl',raw],['summary.json',summaryBytes]])manifest.files[file]={sha256:data.digest(bytes),bytes:Buffer.byteLength(bytes)};
 fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest));assert.throws(()=>data.readBundle(dir),/missing|planned|schedule|coverage/i);
});
