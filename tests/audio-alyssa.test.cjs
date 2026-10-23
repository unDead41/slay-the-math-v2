const test=require('node:test'),assert=require('node:assert/strict');
const AP=require('../dist/audio-presentation.js');
const run=()=>({seed:71,started:100,stage:0,depth:1,scene:'battle',rng:123,battle:{turn:1},educationState:{rng:456},mysteryState:{rng:789}});
const panel=(key,extra={})=>({surface:'question',question:{key,closed:false,hintUsed:false,moreHintViewed:false,...extra}});

test('Alyssa reacts to each visible question/help reveal once, including across save reload',()=>{
 const r=run();let a=AP.observe(r,panel('predict:q1')).encounter;
 assert.ok(a,'new interactive question has a voice');assert.equal(a.group,'question');
 assert.equal(AP.observe(r,panel('predict:q1')).encounter.voiceId,a.voiceId,'rerender retains the current receipt');
 const hint=AP.observe(r,panel('predict:q1',{hintUsed:true})).encounter;assert.equal(hint.group,'hint');assert.notEqual(hint.key,a.key);
 const more=AP.observe(r,panel('predict:q1',{hintUsed:true,moreHintViewed:true})).encounter;assert.equal(more.group,'more_hint');
 assert.equal(AP.observe(r,panel('predict:q1',{closed:true})).encounter,null,'finished question cancels talking');
 assert.equal(AP.observe(JSON.parse(JSON.stringify(r)),panel('predict:q1',{hintUsed:true,moreHintViewed:true})).encounter,null,'handled line does not replay after reload');
 assert.equal(AP.observe(r,panel('artifact:q2')).encounter.group,'question');
});

test('Alyssa shuffle bags cover every variant, avoid boundary repeats and never consume gameplay RNG',()=>{
 for(const [group,n]of [['question',3],['hint',4],['more_hint',4]]){
  const r=run(),before=[r.rng,r.educationState.rng,r.mysteryState.rng],ids=[];
  for(let i=0;i<n*3;i++)ids.push(AP.observe(r,panel('q'+i,{hintUsed:group!=='question',moreHintViewed:group==='more_hint'})).encounter.voiceId);
  for(let i=0;i<ids.length;i+=n)assert.equal(new Set(ids.slice(i,i+n)).size,n);
  for(let i=1;i<ids.length;i++)assert.notEqual(ids[i],ids[i-1]);
  assert.deepEqual([r.rng,r.educationState.rng,r.mysteryState.rng],before);
  const restored=JSON.parse(JSON.stringify(r));AP.normalizeRunAudio(restored);
  assert.equal(AP.observe(r,panel('next')).encounter.voiceId,AP.observe(restored,panel('next')).encounter.voiceId,'audio RNG/bag continue through restore');
 }
});

test('Mystery intro mapping is fixed, consumed before scheduling, and ends at Start Challenge',()=>{
 const r=run();r.scene='event';
 for(let i=1;i<=15;i++){
  const id='ME'+String(i).padStart(2,'0');r.mysteryState.pending={key:'visit:'+i,eventId:id,phase:'intro'};
  const cue=AP.observe(r,{surface:'event'}).encounter;assert.equal(cue.voiceId,'voice_alyssa_mystery_me'+String(i).padStart(2,'0')+'_entry');assert.equal(cue.delayMs,200);assert.equal(cue.startDeadlineMs,2000);
  assert.equal(AP.observe(JSON.parse(JSON.stringify(r)),{surface:'event'}).encounter,null);
  r.mysteryState.pending.phase='question';assert.equal(AP.observe(r,{surface:'event'}).encounter,null);
 }
});

test('Rest requires a committed action; reward/defeat trigger only in their actual surfaces',()=>{
 const r=run();r.scene='camp';assert.equal(AP.observe(r,{surface:'camp'}).encounter,null);
 assert.equal(typeof AP.restCommitted,'function');r.scene='map';AP.restCommitted(r,'camp:0:node-a');
 const rest=AP.observe(r,{surface:'map'}).encounter;assert.equal(rest.group,'rest');assert.equal(AP.observe(r,{surface:'map'}).encounter.key,rest.key);
 r.scene='battle';assert.equal(AP.observe(r,{surface:'battle'}).encounter,null);
 r.scene='map';assert.equal(AP.observe(r,{surface:'map'}).encounter,null,'old rest cannot resume after a battle');
 r.scene='reward';r.rewards=['strike','guard'];assert.equal(AP.observe(r,{surface:'reward'}).encounter.group,'card_reward');
 assert.equal(AP.observe(r,{surface:'artifact'}).encounter,null,'artifact gifts do not use card reward lines');
 r.scene='defeat';r.finished=1000;assert.equal(AP.observe(r,{surface:'defeat'}).encounter.group,'defeat');
 assert.equal(AP.observe(JSON.parse(JSON.stringify(r)),{surface:'defeat'}).encounter,null);
});

test('hidden observation consumes no new line and malformed optional audio recovers safely',()=>{
 const r=run();assert.equal(AP.observe(r,{...panel('q'),visible:false}).encounter,null);assert.equal(r.audioPresentation,undefined);
 AP.observe(r,panel('q'));const saved=JSON.parse(JSON.stringify(r));
 saved.audioPresentation.alyssa.bags.question={remaining:['vo_shop_01'],last:'vo_dm_01'};
 saved.audioPresentation.alyssa.handled['question:forged']={group:'question',voiceId:'vo_shop_01'};
 AP.normalizeRunAudio(saved);assert.equal(saved.audioPresentation.alyssa.handled['question:forged'],undefined);
 assert.ok(AP.observe(saved,panel('q2')).encounter.voiceId.startsWith('vo_alyssa_question_'));
 assert.equal(saved.rng,123);
});
