'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom'),root=path.resolve(__dirname,'..'),R=require(path.join(root,'dist/icon-assets.js'));
const source=fs.readFileSync(path.join(root,'dist/icon-readiness.js'),'utf8');console.log('iconReadinessSHA256 '+crypto.createHash('sha256').update(source).digest('hex'));
test('portable map legend keeps all six semantic glyphs when an embedded bitmap fails',()=>{
 const dom=new JSDOM('<main id="game"><div class="route-legend"></div></main>',{url:'file:///SLAY-THE-MATH-OFFLINE.html',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,d=w.document;
 try{
  w.DCIconAssets=R;w.DC_ASSETS=Object.fromEntries(Object.values(R.map).map(file=>[file,'data:image/webp;base64,'+fs.readFileSync(path.join(root,'dist/assets',file)).toString('base64')]));
  w.eval(source);w.DCIconReadiness.install(d);
  for(const [meaning,file]of Object.entries(R.map)){
   const img=d.createElement('img');img.src=w.DC_ASSETS[file];d.querySelector('.route-legend').append(img);
   img.dispatchEvent(new w.Event('error'));
   assert.equal(img.getAttribute('src'),w.DCIconReadiness.fallback(meaning),'portable '+meaning+' must retain its registered meaning after data-URL conversion');
  }
 }finally{w.DCIconReadiness?.install(d).destroy();w.close();}
});
