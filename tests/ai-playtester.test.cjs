'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {normalizeOptions,experiment}=require('../tools/ai-playtester/experiments.cjs'),{summarize,toCSV}=require('../tools/ai-playtester/report.cjs');
test('strict options reject invalid numbers, unknown fields and non-string enemy IDs',()=>{
 for(const o of [{seeds:0},{seeds:21},{seed:4294967296},{seed:NaN},{seed:-1},{seeds:'2'},{skill:'oracle'},{difficulty:'missing'},{enemy:'missing'},{enemy:['wisp']},{cards:[]},{cards:['missing']},{upgraded:1},{shell:'pwd'},{mode:'cards',difficulty:'all'}])assert.throws(()=>normalizeOptions(o));
 assert.equal(normalizeOptions({seed:4294967295,seeds:1}).seed,4294967295);assert.throws(()=>normalizeOptions({seed:4294967295,seeds:2}));
});
test('actual campaign uses selected AI with real receipts and terminal outcome',()=>{
 const r=experiment({mode:'campaign',seed:20,seeds:1,difficulty:'easy',skill:'intermediate',predict:'feedback'});assert.equal(r.rows.length,1);assert.ok(['VICTORY','DEFEAT'].includes(r.rows[0].status),JSON.stringify(r.rows[0]));assert.equal(r.rows[0].policyVersion,'sampled-turn-search-4/intermediate');assert.ok(r.rows[0].ai.decisions>0);assert.ok(r.rows[0].ai.energySpent>0);assert.equal(r.summary.invalid,0);assert.equal(r.pupilWinRatesMeasured,false);assert.match(r.sourceHash,/^[a-f0-9]{64}$/);
 const cards=Object.values(r.rows[0].ai.cards);assert.equal(cards.reduce((n,c)=>n+c.plays,0),r.rows[0].committedCardPlays);assert.equal(cards.reduce((n,c)=>n+c.energySpent,0),r.rows[0].ai.energySpent);assert.equal(cards.reduce((n,c)=>n+c.focusSpent,0),r.rows[0].ai.focusSpent);
});
test('paired self-control has zero total, individual and interaction deltas',()=>{
 const r=experiment({mode:'cards',cards:['stm.attack.rune_strike','stm.attack.rune_strike'],seed:40,seeds:1,difficulty:'medium',skill:'expert',predict:'skip'});assert.equal(r.rows.length,4);assert.deepEqual(r.rows.map(r=>r.mask),[0,1,2,3]);const p=r.summary.power[0];assert.equal(p.totalDelta,0);assert.equal(p.interaction,0);assert.deepEqual(p.individualDeltas.map(c=>c.delta),[0,0]);
});
test('factorial report separates card A, card B and excess pair interaction',()=>{
 const o=normalizeOptions({mode:'cards',cards:['stm.attack.rune_strike','stm.attack.weak_point'],seed:7,seeds:1,skill:'intermediate'}),rows=[100,103,105,112].map((utility,mask)=>({difficulty:'medium',skill:'intermediate',seed:7,mask,status:'WIN',utility}));
 const p=summarize(rows,o).power[0];assert.deepEqual(p.individualDeltas.map(c=>c.delta),[3,5]);assert.equal(p.totalDelta,12);assert.equal(p.interaction,4);
 for(const broken of [rows.slice(0,3),[rows[0],rows[1],rows[2],rows[2]],rows.map((r,i)=>i===3?{...r,status:'BENCHMARK_LIMIT_CENSORED'}:r),rows.map((r,i)=>i===3?{...r,utility:null}:r),rows.map(r=>({...r,seed:8}))]){const p=summarize(broken,o).power[0];assert.equal(p.status,'UNMEASURED');assert.equal(p.totalDelta,null);assert.ok(p.individualDeltas.every(c=>c.delta===null));}
});
test('unknown outcomes retain their denominator and CSV escapes text',()=>{
 const rows=[{difficulty:'hard',skill:'expert',status:'BENCHMARK_LIMIT_CENSORED'},{difficulty:'hard',skill:'expert',status:'INVALID_POLICY_OR_ENGINE',error:'comma, "value"'}],s=summarize(rows,{mode:'campaign'});assert.equal(s.terminalWinRate,null);assert.equal(s.censored,1);assert.equal(s.invalid,1);const csv=toCSV({rows});assert.match(csv,/BENCHMARK_LIMIT_CENSORED/);assert.match(csv,/"comma, ""value"""/);
});
test('card usage totals equal actual resolved engine receipts across immutable action copies',()=>{
 const {loadMaster}=require('../tools/balance/master/loader.cjs'),{createAgent}=require('../tools/ai-playtester/agent.cjs'),{combat}=require('../tools/ai-playtester/experiments.cjs');
 const x=loadMaster({difficulty:'medium'});let live;
 for(const name of ['playCard','chooseCardOption']){const original=x.E[name];x.E[name]=(...args)=>{const out=original(...args);live=args[0];return out;};}
 const o=normalizeOptions({mode:'cards',cards:['stm.attack.rune_strike'],seed:40,seeds:1,skill:'expert',predict:'skip'}),r=combat(x,o,40,0,createAgent(x,{skill:'expert'}));
 const receipts=live.battle.cardCombat.receipts.filter(t=>t.status==='resolved'),usage=Object.values(r.ai.cards);
 assert.equal(receipts.length,live.stats.cardsPlayed);assert.equal(usage.reduce((n,c)=>n+c.plays,0),receipts.length);
 assert.equal(r.ai.energySpent,receipts.reduce((n,t)=>n+t.energy,0));assert.equal(r.ai.focusSpent,receipts.reduce((n,t)=>n+t.focus,0));
 assert.equal(usage.reduce((n,c)=>n+c.hpDamage,0),receipts.reduce((n,t)=>n+t.damageEvents.reduce((sum,e)=>sum+e.hpLost,0),0));
});
test('detached CSV carries source, policy, definition and full experiment identity',()=>{
 const report={jobId:'job-a',sourceHash:'source-a',agentVersion:'agent-a',jobStatus:'completed',options:{mode:'cards',predict:'low',route:'seek-shop',cards:['stm.attack.rune_strike','stm.attack.weak_point'],enemy:'golem',upgraded:true},rows:[{difficulty:'medium',skill:'expert',seed:7,mask:3,status:'WIN',provenance:{definitionHash:'definition-a',engineHash:'engine-a'}}]};
 const [header,line]=toCSV(report).trim().split('\n'),fields=header.split(','),values=line.split(',');
 for(const [key,value]of Object.entries({jobId:'job-a',sourceHash:'source-a',agentVersion:'agent-a',definitionHash:'definition-a',engineHash:'engine-a',mode:'cards',predict:'low',route:'seek-shop',cards:'stm.attack.rune_strike+stm.attack.weak_point',enemy:'golem',upgraded:'true',jobStatus:'completed'})){assert.ok(fields.includes(key),key);assert.equal(values[fields.indexOf(key)],value,key);}
});
test('schema 3 and detached CSV expose actual support totals with source identity',()=>{
 const r=experiment({mode:'cards',cards:['stm.defend.cinder_guard'],skill:'intermediate',predict:'skip',seed:40,seeds:1});assert.equal(r.schemaVersion,3);const [header,...lines]=toCSV(r).trim().split('\n'),fields=header.split(','),values=lines[1].split(',');
 for(const [key,value]of Object.entries({blockUsed:r.rows[1].ai.effects.totals.blockUsed,weakPrevented:r.rows[1].ai.effects.totals.weakPrevented,cardsToHand:r.rows[1].ai.effects.totals.cardsDrawn})){assert.ok(fields.includes(key));assert.equal(Number(values[fields.indexOf(key)]),value);}
});
test('support efficiency aggregates paid resources and preserves old unmeasured fields',()=>{
 const rows=[{difficulty:'easy',skill:'intermediate',status:'WIN',ai:{cards:{a:{plays:1,energySpent:1,focusSpent:0,hpDamage:0,blockUsed:3,blockGranted:6,weakPrevented:2,defensePrevented:0,cardsDrawn:0}}}},{difficulty:'easy',skill:'intermediate',status:'WIN',ai:{cards:{a:{plays:1,energySpent:2,focusSpent:0,hpDamage:0,blockUsed:6,blockGranted:6,weakPrevented:0,defensePrevented:0,cardsDrawn:0},old:{plays:1,energySpent:1,focusSpent:0,hpDamage:3}}}}];
 const s=summarize(rows,{mode:'campaign'}),a=s.cardUsage.find(c=>c.cardId==='a'),old=s.cardUsage.find(c=>c.cardId==='old');assert.equal(a.blockUsed,9);assert.equal(a.efficiency.blockUsedPerEnergy,3);assert.equal(a.efficiency.mitigationPerEnergy,11/3);assert.equal(old.blockUsed,undefined);assert.equal(old.efficiency,undefined);
});
