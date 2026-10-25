const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
test('the manifest defers Practice and boss art, includes current menu audio, and changes for same-version assets',()=>{
 const file=path.join(__dirname,'../tools/build-asset-manifest.cjs');assert.ok(fs.existsSync(file),'Asset manifest builder must exist');const build=require(file);
 const root=path.resolve(__dirname,'..'),out=build(root,{write:false});
 const get=name=>out.entries.find(e=>e.url===name);assert.equal(get('education-practice.js').pack,'practice');assert.notEqual(get('assets/motion-sentinel-idle.webp')?.pack,'core');assert.equal(get('assets/music/menu_ancient_stone_keep.mp3').pack,'core');
 assert.ok(out.entries.filter(e=>e.pack==='core').reduce((s,e)=>s+e.bytes,0)<30*1024*1024,'Core must not download the whole game');
 assert.ok(get('assets/menu-corridor.webp'));assert.ok(out.actors.mc_01.idle);assert.ok(out.actors.sentinel.files.length>1);
 const copy=JSON.parse(JSON.stringify(out));copy.entries[0].sha256='a'.repeat(64);assert.notEqual(build.contentId(copy.entries),out.manifestId);
 for(const e of out.entries)assert.equal(e.sha256,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'dist',e.url))).digest('hex'));
});

test('the actual startup package prioritizes the hero and Stage1 while deferring late packs',()=>{
 const m=require('../tools/build-asset-manifest.cjs')(path.resolve(__dirname,'..'),{write:false});assert.ok(m.startup?.urls?.length,'Build must publish the important package');
 const selected=new Set(m.startup.urls);assert.ok(selected.has(m.actors.mc_01.idle));assert.ok(selected.has(m.actors.wisp.idle));assert.equal(m.entries.some(e=>selected.has(e.url)&&['boss1','boss2','stage2','practice'].includes(e.pack)),false);
 const p=require('../dist/asset-readiness.js').startupPlan(m);assert.ok(p.selectedBytes>=Math.ceil(p.totalBytes*.75));assert.ok(m.entries.filter(e=>e.pack==='core'&&e.required).every(e=>p.beforeMenu.includes(e.url)));
});
