/* Canonical supplier files stay unchanged; the current single-enemy correction
 * is applied before generating the runtime and portable player data. */
const fs=require('node:fs'),path=require('node:path');
module.exports=function importCards(root=path.resolve(__dirname,'..')){
 const source=path.join(root,'modules/cards/source');
 const current=require('./cards/effects.cjs')(require('./cards/single-target.cjs')(require(path.join(source,'data/card-data.js'))));
 fs.writeFileSync(path.join(root,'dist/card-data.js'),'/* Generated current cards; supplier input preserved in modules/cards/source. */\n(function(root){const data='+JSON.stringify(current)+';if(typeof module!==\'undefined\')module.exports=data;else root.STMCardData=data;})(globalThis);\n');
 fs.writeFileSync(path.join(root,'dist/card-kit.js'),fs.readFileSync(path.join(source,'src/card-kit.js'),'utf8')
  .replace("require('../data/card-data.js')","require('./card-data.js')")
  // Host upgrade extension can give Normal Recall a positive extra draw.
  .replace("plan.card.name === 'Recall' && !plan.focused", "plan.card.name === 'Recall' && !plan.focused && !(plan.values.extra > 0)")
  .replace('return plan.card.text[lang] || plan.card.text.en;',`const tokens=plan.card.text[lang] || plan.card.text.en,gift=plan.upgraded&&plan.card.upgrade?.activation;
    if(!gift)return tokens;
    const effects=[gift.block?(lang==='bm'?'dapat '+gift.block+' Blok':'gain '+gift.block+' Block'):'',gift.draw?(lang==='bm'?'ambil '+gift.draw+' kad':'draw '+gift.draw+' card'):''].filter(Boolean).join(lang==='bm'?' dan ':' and ');
    return [...tokens,{type:'text',text:(lang==='bm'?' Pada pengaktifan pertama combat ini, ':' On first activation this combat, ')+effects+'.'}];`));
 const kitPath=path.join(root,'dist/card-kit.js');
 fs.writeFileSync(kitPath,fs.readFileSync(kitPath,'utf8')
  .replace('const card = byId.get(id);', 'const card = typeof id==="string"?byId.get(id):id;')
  .replace('return {card,context:ctx,legal:', 'return {card,glossary:raw.glossary||data.glossary,context:ctx,legal:')
  .replace('const term=data.glossary[t.ref];', 'const term=(plan.glossary||data.glossary)[t.ref];')
  .replace('data.glossary[t.ref].label[lang]', '(plan.glossary||data.glossary)[t.ref].label[lang]'));
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'dist/assets/card-assets.json'),'utf8'));
 // The selected source artwork and native frames are authoritative. UI/status
 // icon imports must never replace card illustrations during a normal build.
 const runtimePaths=manifest.runtimePaths;
 fs.writeFileSync(path.join(root,'dist/card-assets.js'),'/* Runtime paths for lossless derivatives; provenance in assets/card-assets.json. */\n(function(root){root.STM_CARD_ASSETS='+JSON.stringify(runtimePaths)+';})(globalThis);\n');
};
if(require.main===module)module.exports();
