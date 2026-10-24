const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
module.exports=function buildGameLanguage(root=path.resolve(__dirname,'..')){
 const source=path.join(root,'modules/localization');
 const data=JSON.parse(fs.readFileSync(path.join(source,'game.ms.json'),'utf8'));
 data.gameTermAliases=require('./cards/language.cjs').aliases;
 const names=require(path.join(root,'dist/card-data.js')).cards.map(c=>c.display_name.bm);
 for(const key of Object.keys(data.strings))data.strings[key]=require('./cards/language.cjs').terms(data.strings[key],names);
 // Alias archived supplier prose to the current description owner, not its values.
 data.artifactAliases={};
 const catalog=JSON.parse(fs.readFileSync(path.join(root,'modules/mechanics/source/ARTIFACT/artifact_catalog.json'),'utf8'));
 const rich=JSON.parse(fs.readFileSync(path.join(root,'modules/mechanics/source/ARTIFACT/rich_text/artifact_richtext.json'),'utf8'));
 for(const a of catalog.artifacts)if(a.effect_en)data.artifactAliases[a.effect_en]=a.id;
 for(const a of rich.artifacts||[])if(a.description_segments)data.artifactAliases[a.description_segments.map(s=>s.text).join('')]=a.id;
 const runtime=fs.readFileSync(path.join(source,'runtime.mjs'),'utf8').replace(/^export /gm,'');
 const code='/* Generated from modules/localization. Display only; never game state. */\n(function(root){"use strict";\n'+runtime+'\nconst data='+JSON.stringify(data).replace(/</g,'\\u003c')+';const api=createGameLanguageService(data,root);api.create=createGameLanguageService;if(typeof module!=="undefined")module.exports=api;else root.DCGameLanguage=api;\n})(globalThis);\n';
 fs.writeFileSync(path.join(root,'dist/game-language.js'),code);
 return {bytes:Buffer.byteLength(code),strings:Object.keys(data.strings).length,sha256:crypto.createHash('sha256').update(code).digest('hex')};
};
if(require.main===module)console.log(module.exports());
