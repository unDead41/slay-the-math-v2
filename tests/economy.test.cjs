const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const E=require('../dist/engine.js'),K=require('../dist/card-kit.js'),A=require('../dist/artifacts.js');
const Eco=fs.existsSync(require('node:path').join(__dirname,'../dist/economy.js'))?require('../dist/economy.js'):null;
const copy=x=>JSON.parse(JSON.stringify(x));
const run=(difficulty='medium',seed=19)=>{assert.ok(Eco,'versioned economy module is available');const r=E.newRun(seed);Eco.init(r,{difficulty});return r;};
test('single final rounding stacks sale and strongest actual discount, including upgraded cards',()=>{
 const r=run('easy');r.artifactState={owned:[A.id('s06'),A.id('e14')]};
 assert.equal(Eco.quote(r,50,{sale:true}).value,16); // 50*.9*.4*.85=15.3
 assert.equal(Eco.quote(r,75,{upgraded:true,sale:true}).value,28); // 75*1.2*.9*.4*.85=27.54
 assert.equal(Eco.quote(r,80).value,62);
});
test('source filters precede rarity selection; all offers are distinct and no Combat/question RNG moves',()=>{
 for(const source of ['normal','elite','shop','ME03','ME12']){
  const r=run('easy'),before=copy(r),o=Eco.cards(r,source,{nodeId:'fixture'});
  assert.equal(o.ids.length,source==='shop'?6:3);assert.equal(new Set(o.ids).size,o.ids.length);
  if(source==='ME03')assert.ok(o.ids.every(id=>K.data.cards.find(c=>c.id===id).category==='skill'));
  assert.equal(r.rng,before.rng);assert.deepEqual(r.educationState,before.educationState);
  assert.ok(o.factors.every(f=>f.weight>0&&f.supportScore>=0&&f.supportScore<=1));
 }
});
test('support and ownership factors are bounded and do not treat CP as measured power',()=>{
 const r=run('easy');r.deck.push(E.card(r,'stm.passive.grimoire_ward'));
 const o=Eco.cards(r,'normal',{nodeId:'bounds'}),f=id=>o.factors.find(f=>f.id===id);
 assert.equal(f('stm.attack.shield_shot').supportScore,1);
 assert.equal(f('stm.attack.rune_strike').duplicateFactor,.35);
 assert.equal(f('stm.passive.grimoire_ward').duplicateFactor,.15);
 assert.equal(f('stm.passive.grimoire_ward').stageSuitability,.85);
 assert.equal(f('stm.attack.rune_strike').supportScore,0);
 assert.ok(o.factors.every(f=>f.combatPower===null));
 const x=run();x.deck=[E.card(x,'stm.skill.recall')];
 assert.equal(Eco.cards(x,'normal',{nodeId:'empty-support'}).factors.find(f=>f.id==='stm.skill.recall').supportScore,0);
});
test('frozen receipts survive deck changes, refresh and unknown/forged snapshots are rejected',()=>{
 const r=run(),o=copy(Eco.cards(r,'shop',{nodeId:'frozen'}));r.deck.push(E.card(r,'stm.passive.ember_core'));
 assert.deepEqual(Eco.cards(r,'shop',{nodeId:'frozen'}),o);assert.ok(Eco.valid(r));
 for(const mutate of [x=>x.economyState.profile.starting_gold++,x=>Object.values(x.economyState.receipts)[0].ids[0]='bad',x=>x.economyState.version='unknown']){const x=copy(r);mutate(x);assert.equal(Eco.valid(x),false);}
});
test('transform excludes original, retains category, resets upgrade and renormalizes empty rarity tiers',()=>{
 const r=run(),o=Eco.cards(r,'ME04',{nodeId:'mirror',ordinal:1,category:'skill',exclude:['stm.skill.quick_study']});
 assert.equal(o.ids.length,1);assert.notEqual(o.ids[0],'stm.skill.quick_study');assert.equal(o.upgraded,false);
 assert.ok(o.factors.every(f=>f.category==='skill'));
 const x=run();const only=K.data.cards.filter(c=>c.id!=='stm.skill.mana_reading').map(c=>c.id);
 const rare=Eco.cards(x,'ME04',{nodeId:'rare-only',category:'skill',exclude:only});assert.deepEqual(rare.ids,['stm.skill.mana_reading']);
});
test('artifact tier draws are uniform unowned and eligibility is based on real capabilities',()=>{
 const r=run();r.deck.push(E.card(r,'stm.passive.clear_mind'));
 const o=Eco.artifacts(r,'starting','starting',3,{nodeId:'master'});assert.equal(o.ids.length,3);assert.equal(new Set(o.ids).size,3);
 assert.ok(o.eligible.includes(A.id('s12')));
 assert.ok(!Eco.artifacts(r,'elite','elite_mystery',3,{nodeId:'elite'}).eligible.includes(A.id('e13')));
});
test('real passive draw supports Last Page, while a non-draw Passive does not',()=>{
 for(const [key,expected]of [['stm.passive.clear_mind',1],['stm.passive.rune_armor',0]]){const r=run();r.deck=Array.from({length:9},()=>E.card(r,'stm.attack.rune_strike'));r.deck.push(E.card(r,key));const o=Eco.cards(r,'normal',{nodeId:'passive-draw'});assert.equal(o.factors.find(f=>f.id==='stm.skill.last_page').supportScore,expected);}
});
