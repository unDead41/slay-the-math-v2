const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const file=path.join(__dirname,'../dist/audio-presentation.js');
const api=fs.existsSync(file)?require(file):{};
function observe(run,surface='artifact',visible=true){assert.equal(typeof api.observe,'function','presentation adapter is available');return api.observe(run,{surface,visible});}
const gift=source=>({stage:0,scene:'master',rng:123,artifactState:{offer:{source,ready:true,ids:['s01']}},deck:[{key:'strike',uid:'c1'}]});

test('distinct visible gifts use per-run Dungeon Master order and same gift stays frozen',()=>{
 const r=gift('starting'),before=JSON.stringify(r);let result=observe(r);
 assert.deepEqual(result.encounter,{key:'artifact:starting',speaker:'dungeonMaster',visitNumber:1,voiceId:'vo_dm_01'});
 assert.equal(result.changed,true);
 assert.equal(observe(r).changed,false);
 for(const [source,id] of [['elite:0:a','vo_dm_02'],['mystery:0:b','vo_dm_03'],['boss:0:c','vo_dm_04'],['elite:1:a','vo_dm_04']]){
  r.artifactState.offer.source=source;assert.equal(observe(r).encounter.voiceId,id);
 }
 assert.equal(r.audioPresentation.visits.dungeonMaster,5);
 assert.equal(r.audioPresentation.visits.merchant,0);
 const gameplay=structuredClone(r);delete gameplay.audioPresentation;gameplay.artifactState.offer.source='starting';
 assert.equal(JSON.stringify(gameplay),before,'audio observation changes no gameplay or RNG');
});

test('merchant visit order is independent across stages and tabs do not add visits',()=>{
 const r=gift('starting');observe(r);
 for(const [stage,node,id]of [[0,'node-a','vo_shop_01'],[0,'node-b','vo_shop_02'],[1,'node-a','vo_shop_03'],[1,'node-b','vo_shop_03']]){
  r.stage=stage;r.scene='shop';r.route={active:node};r.shop={tab:'cards'};
  assert.equal(observe(r,'shop').encounter.voiceId,id);r.shop.tab='artifacts';
  assert.equal(observe(r,'shop').changed,false);
 }
 assert.deepEqual(r.audioPresentation.visits,{dungeonMaster:1,merchant:4});
 const next=gift('starting');assert.equal(observe(next).encounter.voiceId,'vo_dm_01');
});

test('hidden or ineligible surfaces do not reserve greetings',()=>{
 const r=gift('starting');
 assert.equal(observe(r,'artifact',false).encounter,null);
 assert.equal(observe(r,'education').encounter,null);
 r.artifactState.offer.ready=false;assert.equal(observe(r).encounter,null);
 r.artifactState.offer.ready=true;r.artifactState.offer.ids=[];assert.equal(observe(r).encounter,null);
 assert.equal(r.audioPresentation,undefined);
});

test('metadata round-trip and checkpoint snapshot preserve frozen voice without sharing objects',()=>{
 const r=gift('starting');observe(r);r.checkpoint=structuredClone({...r,checkpoint:null});
 r.artifactState.offer.source='elite:0:a';observe(r);
 const restored=JSON.parse(JSON.stringify(r));
 assert.equal(typeof api.normalizeRunAudio,'function');api.normalizeRunAudio(restored);
 assert.equal(observe(restored).encounter.voiceId,'vo_dm_02');
 const cp=restored.checkpoint;assert.equal(observe(cp).encounter.voiceId,'vo_dm_01');
 assert.notEqual(restored.audioPresentation,cp.audioPresentation);
 assert.equal(cp.audioPresentation.visits.dungeonMaster,1);
});

test('malformed optional metadata is recovered without rejecting or changing valid gameplay',()=>{
 const r=gift('starting');r.audioPresentation={version:987,visits:{merchant:999},encounters:{}};
 assert.equal(typeof api.normalizeRunAudio,'function');assert.equal(api.normalizeRunAudio(r),true);
 assert.equal(r.rng,123);assert.equal(observe(r).encounter.voiceId,'vo_dm_01');
 const json=JSON.parse('{"version":1,"visits":{"dungeonMaster":1,"merchant":2},"encounters":{"artifact:starting":{"speaker":"dungeonMaster","visitNumber":1,"voiceId":"vo_shop_01"},"__proto__":{"speaker":"merchant","visitNumber":1,"voiceId":"vo_shop_01"}}}');
 const safe=api.normalizeAudioMetadata(json);
 assert.deepEqual(Object.keys(safe.encounters),[]);
 assert.equal({}.speaker,undefined);
});

test('metadata storage has a hard bound and invalid voice/visit pairs cannot be restored',()=>{
 assert.equal(typeof api.normalizeAudioMetadata,'function');
 const bad={version:1,visits:{dungeonMaster:0,merchant:0},encounters:{}};
 for(let i=1;i<=130;i++)bad.encounters['shop:0:n'+i]={speaker:'merchant',visitNumber:i,voiceId:i===1?'vo_shop_01':i===2?'vo_shop_02':'vo_shop_03'};
 const value=api.normalizeAudioMetadata(bad);assert.ok(Object.keys(value.encounters).length<=128);
 const r=gift('starting');r.audioPresentation=value;
 const result=observe(r);assert.equal(result.encounter,null,'full optional ledger declines new greeting rather than losing duplicate protection');
 assert.ok(Object.keys(r.audioPresentation.encounters).length<=128);
});
