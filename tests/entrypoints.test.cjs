const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const scripts=html=>[...html.matchAll(/<script src="([^"]+)"/g)].map(x=>x[1]);
test('all game entry pages load the same current education and language modules in order',()=>{
 const canonical=scripts(read('dist/index.html'));assert.ok(canonical.includes('question-language.js'));assert.ok(canonical.includes('education-practice.js'));
 for(const name of ['MAIN-SEKARANG.html','index.html']){
  const html=read(name);assert.match(html,/<base href="dist\//);assert.deepEqual(scripts(html),canonical,name);
  for(const file of scripts(html))assert.ok(fs.existsSync(path.join(root,'dist',file)),name+' '+file);
  assert.ok(html.length<12000,'Entry page must load current sources, not a stale embedded game');
 }
});
test('versioned file entry pages preserve the original address and keep generated portable output separate',()=>{
 for(const name of ['MAIN-SEKARANG.html','index.html'])assert.doesNotMatch(read(name),/http-equiv="refresh"|location\.replace|window\.location|data:audio\/mpeg/);
 assert.match(read('build-portable.cjs'),/SLAY-THE-MATH-OFFLINE\.html/);assert.doesNotMatch(read('.gitignore'),/^\/MAIN-SEKARANG\.html$/m);
});
