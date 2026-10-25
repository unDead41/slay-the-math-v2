'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom'),I=require('../dist/icon-readiness.js');
test('slow and failed status images retain their usable named control and receive a local semantic fallback once',async()=>{
 const dom=new JSDOM('<button aria-label="Next Block: 6"><img data-status-icon="next-block" src="missing.webp"><b>6</b><span>Next Block</span></button>'),d=dom.window.document,api=I.install(d),im=d.querySelector('img'),button=d.querySelector('button');
 try{assert.equal(im.dataset.iconState,'pending');assert.equal(button.disabled,false);im.dispatchEvent(new dom.window.Event('error'));assert.ok(im.src.startsWith('data:image/svg+xml,'));assert.equal(im.dataset.iconFallback,'true');assert.equal(button.textContent,'6Next Block');assert.equal(button.getAttribute('aria-label'),'Next Block: 6');const fallback=im.src;im.dispatchEvent(new dom.window.Event('error'));assert.equal(im.src,fallback,'No recursive fallback requests');im.dispatchEvent(new dom.window.Event('load'));assert.equal(im.dataset.iconState,'fallback');assert.equal(I.install(d),api);
 }finally{api.destroy();dom.window.close();}
});
test('a changed icon source can load normally after a prior failure without affecting card/artifact art',async()=>{
 const dom=new JSDOM('<img data-icon="focus" src="old.webp"><img class="card-art" src="card.webp"><img class="artifact-art" src="artifact.webp">'),d=dom.window.document,api=I.install(d),im=d.querySelector('[data-icon]');
 try{im.dispatchEvent(new dom.window.Event('error'));im.src='new.webp';await Promise.resolve();assert.equal(im.dataset.iconState,'pending');assert.equal(im.dataset.iconFallback,undefined);for(const node of d.querySelectorAll('.card-art,.artifact-art')){node.dispatchEvent(new dom.window.Event('error'));assert.equal(node.dataset.iconState,undefined);}}
 finally{api.destroy();dom.window.close();}
});
test('the Publish Handler integration exposes a bounded critical-icon list, with no cards, artifacts, sounds or questions',()=>{
 const registry=require('../dist/icon-assets.js'),files=I.criticalAssets(registry);assert.equal(files.length,15);for(const p of Object.values(registry.status))assert.ok(files.includes(p));assert.equal(new Set(files).size,files.length);assert.ok(files.every(f=>f.startsWith('assets/')&&!/artifact|music|question|stm_icon_card/.test(f)));
});

test('failed registered utility and map meanings never collapse to the unknown-resource symbol',()=>{
 const R=require('../dist/icon-assets.js'),unknown=I.fallback('asset');
 for(const key of [...Object.keys(R.ui),...Object.keys(R.map)])assert.notEqual(I.fallback(key),unknown,'Missing semantic fallback: '+key);
 for(const pair of [['sword','shield'],['block','shield'],['focus','predict'],['book','skill'],['bossSealClosed','bossSealOpen'],['drawPile','discard'],['discard','exhaust']])assert.notEqual(I.fallback(pair[0]),I.fallback(pair[1]),pair.join(' and ')+' must remain distinguishable');
});

test('actual failed buttons keep names and receive distinct Sword, Rest, Coin and seal-state glyphs',()=>{
 const keys=['sword','rest','coin','bossSealClosed','bossSealOpen'],dom=new JSDOM(keys.map(key=>'<button aria-label="'+key+'"><img data-icon="'+key+'" src="missing-'+key+'.webp"><span>'+key+'</span></button>').join('')),d=dom.window.document,api=I.install(d);
 try{const fallbacks=[];for(const image of d.querySelectorAll('img')){image.dispatchEvent(new dom.window.Event('error'));fallbacks.push(image.src);assert.equal(image.dataset.iconState,'fallback');assert.equal(image.closest('button').disabled,false);assert.equal(image.closest('button').textContent,image.dataset.icon);}assert.equal(new Set(fallbacks).size,keys.length);}
 finally{api.destroy();dom.window.close();}
});

test('a map legend without an explicit semantic attribute uses the verified original source identity',async()=>{
 const R=require('../dist/icon-assets.js'),dom=new JSDOM('<div class="route-legend"><img src="pending.svg"></div>'),d=dom.window.document,image=d.querySelector('img');dom.window.DCIconAssets=R;image.dataset.stmAsset='assets/'+R.map.camp;const api=I.install(d);
 try{image.dispatchEvent(new dom.window.Event('error'));assert.notEqual(image.src,I.fallback('asset'));assert.equal(image.src,I.fallback('camp'));
  image.dataset.stmAsset='assets/'+R.map.boss;image.src='different-pending.svg';await Promise.resolve();image.dispatchEvent(new dom.window.Event('error'));assert.equal(image.src,I.fallback('boss'));assert.notEqual(image.src,I.fallback('camp'));
 }finally{api.destroy();dom.window.close();}
});
