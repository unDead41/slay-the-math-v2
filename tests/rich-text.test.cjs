const test=require('node:test'),assert=require('node:assert/strict');
const R=require('../dist/rich-text.js'),D=require('../dist/rich-text-data.js');
const E=require('../dist/engine.js'),A=require('../dist/artifacts.js');
const {claimArtifact}=require('./helpers/education.cjs');
const copy=x=>JSON.parse(JSON.stringify(x));
function start(code='s02',extras=[]){
 for(let seed=1;seed<300;seed++){
  const r=E.newRun(seed,'challenge');
  if(!r.artifactState.offer.ids.includes(A.id(code)))continue;
  claimArtifact(r,A.id(code));delete r.route;
  for(const key of extras)A.acquire(r,A.id(key),'fixture:'+key);
  return r;
 }
 throw new Error('Missing fixture');
}
function attack(r){const b=r.battle,all=[...b.hand,...b.draw,...b.discard],i=all.findIndex(c=>c.key==='strike');b.hand=[all.splice(i,1)[0]];b.draw=all;b.discard=[];E.playCard(r,b.hand[0].uid);}
test('ZIP rich text covers all 31 artifacts and 55 terms without demo snapshots',()=>{
 assert.equal(Object.keys(D.artifacts).length,31);assert.equal(Object.keys(D.glossary).length,55);
 for(const a of Object.values(A.catalog)){
  const rich=D.artifacts[a.id];assert.ok(rich);assert.equal(rich.segments.map(s=>s.text).join(''),rich.description);
  assert.ok(!('example_snapshot' in rich));
  for(const s of rich.segments.filter(s=>s.type==='term'))assert.equal(D.glossary[s.glossary_id].category,s.category);
 }
 assert.match(D.glossary.focus.definition,/capped at 3/);assert.match(D.glossary.draw.definition,/no Hand cap/);
});
test('Ration snapshots separate Max HP from actual healing and survive refresh without replay',()=>{
 const r=start('s08'),entry=R.latest(r,A.id('s08'));
 assert.deepEqual(entry.results.map(x=>[x.label,x.value,x.unit]),[['Max HP gained',5,'Max HP'],['HP restored',5,'HP']]);
 const saved=E.restore(copy(r));assert.deepEqual(saved.calculationState,r.calculationState);assert.equal(saved.hp,65);
 assert.throws(()=>A.acquire(saved,A.id('s08'),'again'));assert.deepEqual(saved.calculationState,r.calculationState);
});
test('first Attack snapshot separates combined bonuses, enemy mitigation and capped HP loss',()=>{
 const r=start('s02',['e07','e15']);E.startBattle(r,'sentinel');r.battle.enemyBlock=2;r.battle.hp=2;
 attack(r);const e=R.latest(r,A.id('s02'));
 assert.equal(e.results[0].label,'Damage before defenses');assert.equal(e.results[0].value,12);
 assert.equal(e.results[1].label,'Enemy HP lost');assert.equal(e.results[1].value,-1);
 assert.ok(e.results[1].lines.some(s=>/Sealed boss: round up\(12 ÷ 2\) = 6/.test(s)));
 assert.ok(e.results[0].lines.some(s=>/Cinder Whetstone: \+1/.test(s)));
 assert.ok(e.results[0].lines.some(s=>/Rune-smith Tongs: \+3/.test(s)));
 assert.equal(r.battle.hp,1);assert.ok(E.validate(r));
});
test('draw and Focus snapshots show resolved counts rather than requested gains',()=>{
 const r=start('s04',['b03']);E.startBattle(r,'wisp');r.battle.hand.push(...r.battle.draw.splice(0),...r.battle.discard.splice(0));
 const ctx={draw:E.draw,notify:()=>{}};r.battle.focus=3;A.startTurn(r,ctx);
 assert.equal(R.latest(r,A.id('s04')).results[0].value,0);
 assert.equal(R.latest(r,A.id('b03')).results[0].value,0);
 assert.match(R.latest(r,A.id('s04')).results[0].lines.join('\n'),/Focus cap: 3/);
});
test('Chance Die snapshots preserve the actual branch and never roll during inspection',()=>{
 const seen=new Set();
 for(let seed=1;seed<80&&seen.size<6;seed++){
  const r=start('s02');r.artifactState.rng=seed*13001;A.acquire(r,A.id('e03'),'die');E.startBattle(r,'wisp');
  const rng=r.artifactState.rng,e=R.latest(r,A.id('e03')),face=r.battle.artifacts.die;seen.add(face);
  assert.equal(e.results[0].value,face);assert.equal(e.results[1].unit,face<=2?'Block':face<=4?'cards':'Energy');
  R.eventHTML(e);R.description(A.id('e03'));assert.equal(r.artifactState.rng,rng);
 }
 assert.equal(seen.size,6);
});
test('Clasp snapshots cap its own contribution and add other owned stat sources',()=>{
 const r=start('s02',['b02','e15','e16']);E.startBattle(r,'wisp');r.hp=60;
 for(let i=0;i<4;i++){r.battle.currentIntent.damage=0;E.endTurn(r);}
 const e=R.latest(r,A.id('b02'));assert.deepEqual(e.results.map(x=>x.value),[8,8]);
 assert.ok(e.results.every(x=>x.lines.some(s=>/Clasp contribution: min\(6, 3 \+ 5 − 1\) = 6/.test(s))));
});
test('discount snapshots use the best discount, round up the price, and keep Gold spending separate',()=>{
 const r=start('s06',['e14']);const snapshot=A.priceCalculation(r,102);
 assert.equal(snapshot.value,87);assert.match(snapshot.lines.join('\n'),/Highest discount: 15%/);assert.match(snapshot.lines.join('\n'),/round up\(86\.7\)\) = 87/);
 assert.equal(A.priceCalculation(r,1).value,1);
});
test('actual HP loss is capped at zero and is separate from remaining HP',()=>{
 const r=E.newRun(4);delete r.route;E.startBattle(r,'wisp');r.hp=4;r.battle.block=0;r.battle.currentIntent.damage=6;
 E.endTurn(r);const e=R.entries(r)[0];assert.equal(e.results[0].value,-4);assert.equal(e.results[1].value,0);
 assert.match(e.results[0].lines.join('\n'),/max\(0, 4 − 6\) = 0/);assert.equal(r.scene,'defeat');
});
test('calculation history is bounded, optional for old saves, validated and safely escaped',()=>{
 const old=E.newRun(7);assert.ok(E.restore(copy(old)));
 for(let i=0;i<100;i++)R.record(old,'<script>alert(1)</script>',[],[R.delta('Gold gained','Gold',i,i+1,['<img src=x>'])]);
 assert.equal(R.entries(old).length,64);assert.ok(E.restore(copy(old)));assert.ok(!R.eventHTML(R.entries(old)[0]).includes('<script>'));
 for(const mutate of [x=>x.calculationState.entries[0].results[0].value=NaN,x=>x.calculationState.entries[0].results[0].unit='fake',x=>x.calculationState.entries.push(...x.calculationState.entries),x=>x.calculationState.entries[0].artifactIds=['unknown']]){
  const invalid=copy(old);mutate(invalid);assert.equal(E.restore(invalid),null);
 }
});
