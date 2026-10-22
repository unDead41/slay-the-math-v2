const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),vm=require('node:vm');
const sync=require('../tools/sync-game-entrypoints.cjs');
function fixture(t){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'stm-release-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));fs.mkdirSync(path.join(root,'dist'));
 fs.writeFileSync(path.join(root,'package.json'),JSON.stringify({version:'2.17.0'}));
 fs.writeFileSync(path.join(root,'dist/index.html'),'<!doctype html><html><head><link rel="stylesheet" href="style.css"></head><body><script src="app.js"></script></body></html>');
 fs.writeFileSync(path.join(root,'dist/style.css'),'body{color:white}');fs.writeFileSync(path.join(root,'dist/app.js'),'window.gameStarted=true;');return root;
}
const url=(html,file)=>html.match(new RegExp('(?:src|href)="('+file.replaceAll('.','\\.')+'[^\"]*)"'))?.[1];
test('release build replaces cached script and stylesheet URLs when their content changes, including within the same version',t=>{
 const root=fixture(t),read=()=>fs.readFileSync(path.join(root,'dist/index.html'),'utf8');sync(root);const before=read();
 fs.writeFileSync(path.join(root,'dist/app.js'),'window.gameStarted="updated";');fs.writeFileSync(path.join(root,'dist/style.css'),'body{color:gold}');sync(root);const after=read();
 assert.notEqual(url(after,'app.js'),url(before,'app.js'));assert.notEqual(url(after,'style.css'),url(before,'style.css'));
 assert.notEqual(url(after,'release.js'),url(before,'release.js'));
 assert.deepEqual(fs.readFileSync(path.join(root,'MAIN-SEKARANG.html'),'utf8'),after.replace('<head>','<head><base href="dist/">'));
 sync(root);assert.equal(read(),after,'An unchanged rebuild must not invalidate caches again');
});
test('release build derives menu metadata from package.json and updates every launcher together',t=>{
 const root=fixture(t);sync(root);const readMeta=()=>{const context={};vm.runInNewContext(fs.readFileSync(path.join(root,'dist/release.js'),'utf8'),context);return context.DCRelease;};
 assert.equal(readMeta()?.version,'2.17.0');fs.writeFileSync(path.join(root,'package.json'),JSON.stringify({version:'2.18.0'}));sync(root);assert.equal(readMeta().version,'2.18.0');
 for(const name of ['dist/index.html','MAIN-SEKARANG.html','index.html'])assert.match(fs.readFileSync(path.join(root,name),'utf8'),/name="stm-version" content="2\.18\.0"/);
});
