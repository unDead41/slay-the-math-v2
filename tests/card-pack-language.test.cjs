const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('supplied card preview works with the game language and offline asset owner',()=>{
 const file=require('node:path').resolve(__dirname,'../dist/card-preview.js');
 assert.ok(fs.existsSync(file),'the game has no bilingual card pack entry');
 const api=require(file),html=api.createDocument('ms');
 assert.match(html,/STM_CARD_LANGUAGE="bm"/);
 assert.doesNotMatch(html,/<script[^>]*src=|<link[^>]*stylesheet/);
 assert.equal(Object.keys(api.assets).length,47);
 const embedded=api.createDocument('en',Object.fromEntries(Object.values(api.assets).map(n=>[n,'data:image/png;base64,TEST'])));
 assert.match(embedded,/data:image\/png;base64,TEST/);
 assert.doesNotMatch(embedded,/<script[^>]*src=/);
 const context={};vm.createContext(context);vm.runInContext(fs.readFileSync(file,'utf8'),context);
 assert.equal(typeof context.DCCardPreview.createDocument,'function');
});
test('the supplied 40 cards keep stable combat definitions while language changes',()=>{
 const file=require('node:path').resolve(__dirname,'../modules/cards/source/src/card-kit.js');
 assert.ok(fs.existsSync(file),'localized source kit is missing');
 const kit=require(file);assert.equal(kit.data.cards.length,40);
 for(const card of kit.data.cards){const p=kit.preparePlay(card.id,{energy:3},true),before=JSON.stringify(p);assert.ok(kit.renderPlain(p,'ms'));assert.ok(kit.renderHTML(p,'en'));assert.equal(JSON.stringify(p),before);}
});
