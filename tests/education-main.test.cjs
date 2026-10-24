'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const E=require('../dist/engine.js'),Q=require('../dist/education.js'),M=require('../dist/mechanics.js'),T=require('../dist/tutorial-core.js'),F=require('../tools/dev/fixtures.js');
test('tutorial failed Predict locks input honestly, supports review and replay without completing the chapter',()=>{
 const c=T.create();c.select('predict');const q=Q.currentConsumer(c.exercise().run).question,wrong=q.choices.filter(x=>x.id!==q.correctChoiceId);
 c.act('predict','select',wrong[0].id);let x=c.act('predict','check');assert.equal(Q.consumerRecord(x.run).hintState.moreHintUnlocked,true);assert.equal(Q.consumerRecord(x.run).hintState.hintUsed,false);
 c.act('predict','moreHint');c.act('predict','select',wrong[1].id);x=c.act('predict','check');assert.equal(M.session.attemptsExhausted(Q.consumerRecord(x.run)),true);assert.equal(x.complete,false);assert.equal(c.progress().completed.includes('predict'),false);assert.equal(x.run.battle.focus,0);
 assert.throws(()=>c.act('predict','select',q.correctChoiceId));assert.deepEqual(c.exercise(),x);x=c.act('predict','steps');assert.ok(Q.consumerLearningView(x.run).workedSteps);assert.ok(E.validate(x.run));
 x=c.replay();assert.equal(Q.consumerRecord(x.run).attempts.length,0);c.act('predict','select',Q.currentConsumer(x.run).question.correctChoiceId);assert.equal(c.act('predict','check').complete,true);
});
test('exact developer question fixtures use the same two-attempt policy in all three consumers',()=>{
 for(const consumer of ['predict','artifact','mystery']){
  const r=F.questionSetup('PROB-002',consumer),q=Q.catalog['PROB-002'],wrong=q.choices.filter(c=>c.id!==q.correctChoiceId);
  const answer=id=>consumer==='predict'?(E.selectForecast(r,id),E.answerBankForecast(r)):consumer==='artifact'?(E.selectEducation(r,id),E.answerEducation(r)):E.answerMystery(r,id,r.mysteryState.pending.startedAt+1);
  answer(wrong[0].id);assert.equal(Q.consumerRecord(r).hintState.moreHintUnlocked,true);answer(wrong[1].id);assert.equal(M.session.attemptsExhausted(Q.consumerRecord(r)),true);assert.throws(()=>answer(q.correctChoiceId));assert.ok(E.restore(r));
 }
});
test('production Hub retains diagnostics while collection setup is local-only and has its script',t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'stm-education-prod-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 fs.writeFileSync(path.join(dir,'app.js'),'(()=>{function render(){}\nrender();\n})();\n');fs.writeFileSync(path.join(dir,'index.html'),'<!doctype html><html><head></head><body><script src="app.js"></script></body></html>');require('../tools/dev/build-production.cjs')(dir);
 const html=fs.readFileSync(path.join(dir,'__dev/index.html'),'utf8');assert.match(html,/id="questions"/);assert.match(html,/id="collection" data-collection-static/);assert.match(html,/collection\.js/);assert.equal(fs.existsSync(path.join(dir,'__dev/collection.js')),true);assert.equal(fs.existsSync(path.join(dir,'__dev/report.js')),true);assert.equal(fs.existsSync(path.join(dir,'__dev/education-collection')),false);
});
test('AI feedback card screens stop at the real attempt limit instead of submitting a third answer',()=>{
 const {loadMaster}=require('../tools/balance/master/loader.cjs'),{createAgent}=require('../tools/ai-playtester/agent.cjs'),{combat,normalizeOptions}=require('../tools/ai-playtester/experiments.cjs');
 const x=loadMaster({difficulty:'easy'}),original=x.E.answerBankForecast;let failed=0,maxAttempts=0;
 x.E.answerBankForecast=r=>{const result=original(r);maxAttempts=Math.max(maxAttempts,r.battle.question.attempts.length);if(r.battle.forecastUsed&&!r.battle.question.solved)failed++;return result;};
 for(let seed=20;seed<25&&!failed;seed++){const o=normalizeOptions({mode:'cards',cards:['stm.attack.rune_strike'],seed,seeds:1,difficulty:'easy',skill:'beginner',predict:'feedback',enemy:'wisp'}),result=combat(x,o,seed,0,createAgent(x,{skill:'beginner'}));assert.notEqual(result.status,'INVALID_POLICY_OR_ENGINE',result.error);assert.equal(result.validFinal,true);}
 assert.ok(failed>0,'exercise a real failed Predict');assert.equal(maxAttempts,2);
});
