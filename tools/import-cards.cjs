/* Canonical supplier data stays unchanged; runtime uses the same values and a
 * flat lossless-asset manifest compatible with the offline packager. */
const fs=require('node:fs'),path=require('node:path');
module.exports=function importCards(root=path.resolve(__dirname,'..')){
 const source=path.join(root,'modules/cards/source');
 fs.copyFileSync(path.join(source,'data/card-data.js'),path.join(root,'dist/card-data.js'));
 fs.writeFileSync(path.join(root,'dist/card-kit.js'),fs.readFileSync(path.join(source,'src/card-kit.js'),'utf8')
  .replace("require('../data/card-data.js')","require('./card-data.js')")
  // Host upgrade extension can give Normal Recall a positive extra draw.
  .replace("plan.card.name === 'Recall' && !plan.focused", "plan.card.name === 'Recall' && !plan.focused && !(plan.values.extra > 0)"));
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'dist/assets/card-assets.json'),'utf8'));
 // The selected source artwork and native frames are authoritative. UI/status
 // icon imports must never replace card illustrations during a normal build.
 const runtimePaths=manifest.runtimePaths;
 fs.writeFileSync(path.join(root,'dist/card-assets.js'),'/* Runtime paths for lossless derivatives; provenance in assets/card-assets.json. */\n(function(root){root.STM_CARD_ASSETS='+JSON.stringify(runtimePaths)+';})(globalThis);\n');
};
if(require.main===module)module.exports();
