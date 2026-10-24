/* Canonical supplier files stay unchanged; the current single-enemy correction
 * is applied before generating the runtime and portable player data. */
const fs=require('node:fs'),path=require('node:path');
module.exports=function importCards(root=path.resolve(__dirname,'..')){
 const source=path.join(root,'modules/cards/source');
 const current=require('./cards/language.cjs')(require('./cards/effects.cjs')(require('./cards/single-target.cjs')(require(path.join(source,'data/card-data.js')))));
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
 const policy=require('./cards/language.cjs');
 const archivedCopy=`const presentationBM=(()=>{const aliases=${JSON.stringify(policy.aliases)},pattern=new RegExp('\\\\b('+Object.keys(aliases).join('|')+')\\\\b','g');const terms=${policy.terms.toString()};return text=>terms(text,data.cards.map(c=>c.display_name.bm));})();\n  `;
 fs.writeFileSync(kitPath,require('./cards/language.cjs').terms(fs.readFileSync(kitPath,'utf8'))
  .replace('const card = byId.get(id);', 'const card = typeof id==="string"?byId.get(id):id;')
  .replace('return {card,context:ctx,legal:', 'return {card,glossary:raw.glossary||data.glossary,context:ctx,legal:')
  .replace('const term=data.glossary[t.ref];', 'const term=(plan.glossary||data.glossary)[t.ref];')
  .replace('data.glossary[t.ref].label[lang]', '(plan.glossary||data.glossary)[t.ref].label[lang]')
  // The old rules/data remain byte-identical. Only BM display copy is projected.
  .replace('function getTokens(',()=>archivedCopy+'function getTokens(')
  .replace("const cardNotes = (card, lang='en') => card.mechanic_notes?.[normalizeLanguage(lang)] || '';", "const cardNotes = (card, lang='en') => normalizeLanguage(lang)==='bm'?presentationBM(card.mechanic_notes?.bm||''):card.mechanic_notes?.en||'';")
  .replace("if(t.type==='text') return esc(t.text);", "if(t.type==='text') return esc(lang==='bm'?presentationBM(t.text):t.text);")
  .replace('label=term.label[lang] || term.label.en; tooltip=term.tooltip[lang] || term.tooltip.en;',"label=(lang==='bm'?data.glossary[t.ref].label.bm:term.label.en); tooltip=term.tooltip[lang] || term.tooltip.en;if(lang==='bm')tooltip=presentationBM(tooltip);")
  .replace("t.type==='text'?t.text:t.type==='calculation'?plan.values[t.ref]:(plan.glossary||data.glossary)[t.ref].label[lang]", "t.type==='text'?(lang==='bm'?presentationBM(t.text):t.text):t.type==='calculation'?plan.values[t.ref]:(lang==='bm'?data.glossary[t.ref].label.bm:(plan.glossary||data.glossary)[t.ref].label.en)"));
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'dist/assets/card-assets.json'),'utf8'));
 // The selected source artwork and native frames are authoritative. UI/status
 // icon imports must never replace card illustrations during a normal build.
 const runtimePaths=manifest.runtimePaths;
 fs.writeFileSync(path.join(root,'dist/card-assets.js'),'/* Runtime paths for lossless derivatives; provenance in assets/card-assets.json. */\n(function(root){root.STM_CARD_ASSETS='+JSON.stringify(runtimePaths)+';})(globalThis);\n');
};
if(require.main===module)module.exports();
