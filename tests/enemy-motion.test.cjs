const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto'),vm=require('node:vm'),fs=require('node:fs');
const C=require('../dist/config.js'),D=require('../dist/animation-data.js'),S=require('../dist/animation.js');
const mapping={weaver:'chain_weaver',shade:'deck_guard',mimic:'card_mimic',golem:'chain_golem',reaper:'rune_reaper'};
function visuals(){const window={DCConfig:C,DCAnimationData:D};vm.runInNewContext(fs.readFileSync(require.resolve('../dist/visuals.js'),'utf8'),{window});return window.DCVisuals;}
test('every canonical Normal and Elite encounter in both stages has all five source motions',()=>{
 let clips=0,frames=0;
 for(let stage=0;stage<2;stage++)for(const id of [...C.stages[stage].normals,...C.stages[stage].elites]){
  const actor=S.spec(stage,id);assert.ok(actor,`${stage}/${id}`);assert.equal(actor.facing,'left');assert.equal(S.spec(1-stage,id),null);
  for(const action of ['idle','attack','defend','skill','damaged']){const c=actor.animations[action];assert.ok(c);assert.equal(c.loop,action==='idle');clips++;frames+=c.frames.length;assert.ok(fs.existsSync(require('node:path').join(__dirname,'../dist/assets',c.image)));}
 }
 assert.equal(clips,50);assert.equal(frames,263);
 for(const [id,stem]of Object.entries(mapping)){const a=S.spec(1,id);assert.equal(a.id,stem);assert.equal(a.flipX,false);assert.equal(a.animations.damaged.frames.length,3);assert.equal(Object.values(a.animations).reduce((n,c)=>n+c.frames.length,0),27);}
 assert.equal(S.spec(0,'sentinel'),null);assert.equal(S.spec(1,'dealer'),null);
});
test('Stage 2 loading and failure posters use the same left-facing source for every reaction',()=>{
 const V=visuals();for(const [id,stem]of Object.entries(mapping))for(const [pose,action]of [['standing','idle'],['attack','attack'],['defend','defend'],['skill','skill'],['damage','damaged']]){
  assert.equal(V.enemy(id,pose,1),`poster-s2-${stem}-${action}.webp`);
  assert.equal(S.spec(1,id).posters[action],V.enemy(id,pose,1));
 }
 assert.match(V.enemy('knight','attack',1),/^ground-/,'legacy cross-stage encounters retain their renderer');
 assert.match(V.enemy('dealer','standing',1),/^ground-/);
});
test('Stage 2 resolved intents choose Attack, Defend and Skill independently of damage/RNG',()=>{
 for(const id of Object.keys(mapping)){
  const actions=C.enemies[id].patterns.map(it=>S.intentAction(1,id,it));
  assert.deepEqual(actions,id==='weaver'?['attack','skill','defend']:['attack','defend','skill']);
 }
 assert.equal(S.intentAction(0,'wisp',{label:'Flame Burst',damage:8}),'skill');
 assert.equal(S.intentAction(0,'beetle',{label:'Shell Guard',block:3}),'defend');
 assert.equal(S.intentAction(1,'dealer',{label:'Dark Veil',block:4}),'skill');
});

test('the accepted Stage 1 registry and all Alyssa frames/pivots/scales remain unchanged',()=>{
 const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
 const stage1=Object.fromEntries(Object.keys(D.actors).filter(k=>D.actors[k].stage===0).sort().map(k=>[k,D.actors[k]]));
 assert.equal(hash(stage1),'c3a0a87e67123d41807b5e88746a6e33d323bb0cb076a847ccb419cb7c17be7c');
 assert.equal(hash(D.hero),'3a19d059c43b9c9004cef55c12c4f4ae17d4b9394a402cac28ac082c9852f556');
});
