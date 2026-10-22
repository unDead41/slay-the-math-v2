const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const E=require('../dist/engine.js'),C=require('../dist/config.js'),data=require('../dist/card-data.js'),Status=require('../dist/combat-status.js');
const key=name=>data.cards.find(c=>c.name===name).id;
function fixture(){const r=E.newRun(867);delete r.route;r.seq=0;r.deck=data.cards.map(c=>E.card(r,c.id));E.startBattle(r,'sentinel');r.battle.hp=r.battle.maxHp=10000;r.battle.seals=2;r.battle.enemyBlock=0;r.battle.currentIntent.damage=0;return r;}
function play(r,name){const b=r.battle,all=[...b.hand,...b.draw,...b.discard],i=all.findIndex(c=>c.key===key(name));assert.ok(i>=0,name+' is available');const c=all.splice(i,1)[0];b.hand=[c];b.draw=all;b.discard=[];b.energy=C.ENERGY;E.playCard(r,c.uid);return c;}
function values(r,who='player'){return Object.fromEntries(Status.view(r,who).map(s=>[s.id,s.value]));}
function freeze(value){if(value&&typeof value==='object'){Object.freeze(value);for(const child of Object.values(value))freeze(child);}return value;}

test('badges read canonical resolved card values and never re-add Agility or Focus',()=>{
 const r=fixture();
 for(const name of ['Blazing Spirit','Swift Step','Rune Armor','Layered Shield','Ember Wall','Next Chapter','Cinder Guard','Weak Point'])play(r,name);
 assert.deepEqual(values(r),{strength:2,agility:2,defense:1,block:21,thorns:2,'next-draw':2,'next-block':6});
 assert.deepEqual(values(r,'enemy'),{weak:1,vulnerable:1});
 const before=JSON.stringify(r),first=Status.view(freeze(r),'player'),second=Status.view(r,'player');
 assert.deepEqual(first,second);assert.equal(JSON.stringify(r),before);
 assert.ok(first.every(s=>['buff','debuff','queued'].includes(s.kind)&&typeof s.description==='string'&&s.description.length>20));
 assert.equal(first.some(s=>s.id==='focus'),false,'resource Focus remains in its existing HUD');
 assert.match(first.find(s=>s.id==='next-block').description,/Agility is already included/);
 first[0].value=99;first.push({id:'invented'});assert.equal(values(r).strength,2,'returned records are disposable view data');
});

test('once-only delayed grants and temporary statuses disappear after their real resolution',()=>{
 const r=fixture();for(const name of ['Swift Step','Layered Shield','Ember Wall','Next Chapter','Cinder Guard','Weak Point'])play(r,name);
 r.battle.currentIntent.damage=3;r.battle.currentIntent.hits=2;
 assert.ok(values(r).thorns);assert.ok(values(r,'enemy').weak);assert.ok(values(r,'enemy').vulnerable);
 E.endTurn(r);
 assert.deepEqual(values(r),{agility:2,block:6});
 assert.equal(values(r,'enemy').weak,undefined);assert.equal(values(r,'enemy').vulnerable,undefined);assert.equal(values(r,'enemy').block,r.battle.enemyBlock);
 assert.equal(r.battle.cardCombat.queue.length,0);assert.ok(E.validate(r));
});

test('Weak and Vulnerable badges track per-hit stack consumption for the correct side',()=>{
 const r=fixture();play(r,'Weak Point');
 const st=r.battle.cardCombat.statuses;st.enemy.vulnerable=2;st.self.weak=1;st.self.weakUntil=r.battle.turn+1;
 assert.match(Status.view(r,'enemy').find(s=>s.id==='vulnerable').description,/2 stacks/);
 assert.match(Status.view(r,'player').find(s=>s.id==='weak').description,/before the enemy phase of turn 2/);
 assert.match(Status.view(r,'enemy').find(s=>s.id==='vulnerable').description,/after the enemy phase of turn 1/);
 play(r,'Twin Shot');
 assert.equal(values(r).weak,undefined);assert.equal(values(r,'enemy').vulnerable,undefined);assert.ok(E.validate(r));
});

test('saved focused and upgraded queues are added once without showing unrelated or stale grants',()=>{
 const r=fixture(),b=r.battle;b.focus=1;
 const all=[...b.hand,...b.draw],c=all.find(c=>c.key===key('Next Chapter'));c.upgraded=true;r.deck.find(x=>x.uid===c.uid).upgraded=true;
 E.armFocus(r);play(r,'Next Chapter');
 assert.equal(values(r)['next-draw'],4);assert.equal(r.battle.focus,0);
 const saved=E.restore(E.clone(r));assert.ok(saved);assert.equal(values(saved)['next-draw'],4);
 saved.battle.cardCombat.queue.push({kind:'draw',value:2,turn:saved.battle.turn+1},{kind:'draw',value:99,turn:saved.battle.turn},{kind:'block',value:3,turn:saved.battle.turn+2},{kind:'draw',value:'7',turn:saved.battle.turn+1},{kind:'energy',value:3,turn:saved.battle.turn+1});
 assert.equal(values(saved)['next-draw'],6);assert.equal(values(saved)['next-block'],undefined);assert.deepEqual(values(saved,'enemy'),{});
});

test('retention stays a cap separate from queued Block and is consumed at turn start',()=>{
 const r=fixture();for(const name of ['Lasting Shield','Hold the Line','Layered Shield'])play(r,name);
 assert.equal(values(r)['retain-block'],5);assert.equal(values(r)['next-block'],4);
 assert.match(Status.view(r,'player').find(s=>s.id==='retain-block').description,/retention cap, not extra Block/);
 E.endTurn(r);assert.equal(values(r)['retain-block'],undefined);assert.equal(values(r)['next-block'],undefined);assert.equal(values(r).block,9);assert.ok(E.validate(r));
});

test('enemy Block and Defense stay separate from player effects; signed combat modifiers remain debuffs',()=>{
 const r=fixture();r.battle.enemyBlock=8;r.battle.enemyDefense=2;r.battle.strength=-3;r.battle.agility=-2;
 assert.deepEqual(values(r,'enemy'),{defense:2,block:8});
 const own=Status.view(r,'player');assert.equal(own.find(s=>s.id==='strength').kind,'debuff');assert.equal(own.find(s=>s.id==='strength').value,-3);assert.equal(own.find(s=>s.id==='agility').kind,'debuff');
 assert.match(own.find(s=>s.id==='strength').description,/3 less damage/);assert.match(own.find(s=>s.id==='agility').description,/2 less Block/);
});

test('empty, legacy and malformed presentation input cannot invent statuses or expose nonnumeric counters',()=>{
 for(const run of [null,undefined,{}, {battle:null}])assert.deepEqual(Status.view(run,'player'),[]);
 assert.deepEqual(Status.view(fixture(),'spectator'),[]);assert.deepEqual(Status.view({battle:{block:4,enemyBlock:5}},'player').map(s=>[s.id,s.value]),[['block',4]]);
 const r=fixture(),b=r.battle;b.strength='2';b.agility=Infinity;b.defense=-1;b.block=NaN;b.cardCombat.statuses.self.weak='3';b.cardCombat.statuses.self.vulnerable=-1;b.cardCombat.statuses.thorns=true;b.cardCombat.carry=3.5;
 b.cardCombat.queue=[null,{kind:'draw',turn:b.turn+1,value:Infinity},{kind:'block',turn:b.turn+1,value:-5}];
 assert.deepEqual(Status.view(r,'player'),[]);
});

test('browser UMD export needs no document, listeners, clock or RNG',()=>{
 const r=fixture();play(r,'Cinder Guard');const before=JSON.stringify(r);
 const sandbox={STMCardData:data,DCConfig:C,document:new Proxy({}, {get(){throw Error('No DOM access is allowed');}}),Date:new Proxy({}, {get(){throw Error('No clock access is allowed');}}),Math:{abs:Math.abs,random(){throw Error('No RNG access is allowed');}}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../dist/combat-status.js'),'utf8'),sandbox);
 assert.equal(typeof sandbox.DCCombatStatus.view,'function');assert.equal(sandbox.DCCombatStatus.view(freeze(r),'enemy')[0].id,'weak');assert.equal(JSON.stringify(r),before);
});

test('each badge has its own self-contained vector glyph with uniform small-icon geometry',()=>{
 const metadata=require('../dist/assets/status-icons.json'),r=fixture(),b=r.battle;
 Object.assign(b,{strength:1,agility:1,defense:1,block:1});Object.assign(b.cardCombat.statuses.self,{weak:1,weakUntil:2,vulnerable:1,vulnerableUntil:2});Object.assign(b.cardCombat.statuses,{thorns:1,thornsUntil:1});b.cardCombat.carry=1;b.cardCombat.queue=[{kind:'draw',value:1,turn:2},{kind:'block',value:1,turn:2}];
 const badges=Status.view(r,'player');assert.equal(badges.length,10);assert.equal(new Set(badges.map(s=>s.icon)).size,10);assert.equal(metadata.icons.length,10);
 for(const badge of badges){const meta=metadata.icons.find(icon=>icon.id===badge.id);assert.ok(meta);assert.equal(badge.icon,'assets/'+meta.file);const svg=fs.readFileSync(path.join(__dirname,'../dist',badge.icon),'utf8');assert.match(svg,/viewBox="0 0 32 32"/);assert.match(svg,/stroke-width="2"/);assert.doesNotMatch(svg,/<(?:script|foreignObject|image|text)\b|(?:https?:)?\/\/[^w]|\bon\w+=|href=/i);assert.ok(meta.glyph.length>10);}
});
