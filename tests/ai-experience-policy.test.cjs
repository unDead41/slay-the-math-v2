'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {loadMaster}=require('../tools/balance/master/loader.cjs'),{experiment,normalizeOptions}=require('../tools/ai-playtester/experiments.cjs'),Data=require('../tools/ai-playtester/experience-data.cjs'),{createExperience}=require('../tools/ai-playtester/experience.cjs'),{createDeckPolicy}=require('../tools/ai-playtester/deck-policy.cjs');
const source={branch:'balance/master',commit:'6c49f3980c3a832635d4d01a6c50a8df98ac4aad'},seedPlan={train:[93],validation:[701,702]};
function model(pair=false){const r=experiment({mode:'cards',difficulty:'medium',skill:'intermediate',predict:'skip',seed:93,seeds:1,cards:pair?['stm.attack.weak_point','stm.attack.fate_storm']:['stm.defend.rune_guard'],enemy:'wisp'}),o=Data.normalizeReports([r],{domain:'combat',split:'train',source})[0];o.experience='off';o.cells=pair?[0,2,3,9].map((utility,mask)=>({mask,status:'WIN',utility})):[{mask:0,status:'WIN',utility:0},{mask:1,status:'WIN',utility:100}];return Data.fitModel({manifest:{source,seedPlan},observations:[o]});}
test('missing corrupt disabled or unsupported models fall back with no adjustment',()=>{
 const x=loadMaster();for(const [options,status]of [[{model:null},'MISSING_MODEL'],[{model:{}},'INVALID_MODEL'],[{enabled:false,model:{}},'DISABLED'],[{model:{schemaVersion:99}},'INVALID_MODEL']]){const e=createExperience(x,options);assert.equal(e.status,status);assert.equal(e.deckAdjustment([{key:'stm.defend.rune_guard',upgraded:false}]),0);}
});
test('exact runtime and policy identities gate a real fitted model',()=>{
 const m=model(),x=loadMaster({difficulty:'medium'});assert.equal(createExperience(x,{model:m}).status,'READY');assert.equal(createExperience(loadMaster({difficulty:'hard'}),{model:m}).status,'STALE_RUNTIME');
 const stale={...m,policySignature:'0'.repeat(64)};const {id,...body}=stale;stale.id=Data.digest(body);assert.equal(createExperience(x,{model:stale}).status,'STALE_POLICY');
});
test('bounded priors preserve actual Shop affordability and immutable decisions',()=>{
 const x=loadMaster(),r=x.E.newRun(42,'learn');r.deck=Array.from({length:12},()=>x.E.card(r,'stm.attack.rune_strike'));r.scene='shop';r.gold=20;r.shop={version:2,offers:[{key:'stm.defend.rune_guard',basePrice:20,price:20,sale:false}],bought:[],ownedBefore:[],artifacts:[],artifactBought:[],removed:null};
 const p=createDeckPolicy(x,{model:model()}),off=createDeckPolicy(x,{experience:false}),before=JSON.stringify(r),a=p.shop(r);assert.equal(p.experience.status,'READY');assert.equal(a.kind,'card');assert.equal(a.index,0);assert.equal(JSON.stringify(r),before);
 assert.ok(Math.abs((p.reward(r,['stm.defend.rune_guard']).gain-off.reward(r,['stm.defend.rune_guard']).gain)-.25/13)<1e-12);x.E.buyCard(r,a.index);assert.equal(r.gold,0);assert.equal(p.shop(r).kind,'leave');
});
test('a unique pair bonus is not multiplied by duplicate copies',()=>{
 const x=loadMaster(),m=model(true),e=createExperience(x,{model:m}),a='stm.attack.weak_point',b='stm.attack.fate_storm';
 assert.ok(Math.abs(e.deckAdjustment([{key:a},{key:b}])-1/60)<1e-12);assert.ok(Math.abs(e.deckAdjustment([{key:a},{key:a},{key:a},{key:a},{key:b}])-1/150)<1e-12);
});
test('guidance-produced observations cannot silently train their own feedback loop',()=>{
 const r=experiment({mode:'cards',difficulty:'medium',skill:'intermediate',predict:'skip',seed:93,seeds:1,cards:['stm.attack.rune_strike'],enemy:'wisp'}),rows=Data.normalizeReports([r],{domain:'combat',split:'train',source});rows[0].experience='on';assert.throws(()=>Data.fitModel({manifest:{source,seedPlan},observations:rows}),/guidance|experience|off/i);
});
test('developer experiments accept only on/off and preserve old CSV identities',()=>{
 assert.equal(normalizeOptions({experience:'off'}).experience,'off');assert.throws(()=>normalizeOptions({experience:'path/to/model'}),/experience/i);
 const r=experiment({mode:'cards',difficulty:'medium',skill:'intermediate',predict:'skip',seed:93,seeds:1,cards:['stm.attack.rune_strike'],enemy:'wisp',experience:'off'});assert.equal(r.experience.requested,'off');
 const {toCSV}=require('../tools/ai-playtester/report.cjs'),header=toCSV(r).split('\n')[0].split(',');assert.equal(header.indexOf('route'),32);assert.deepEqual(header.slice(-3),['experience','experienceStatus','experienceModelId']);
 delete r.options.experience;delete r.experience;for(const row of r.rows)if(row.ai)delete row.ai.experience;assert.doesNotThrow(()=>toCSV(r));
});
