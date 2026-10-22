const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
module.exports=function buildQuestionLanguage(project){
 const dir=path.join(project,'modules/mechanics/source/QUESTION_BANK/localization');
 const read=name=>JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'));
 const topics=Object.fromEntries(['PROB','SET','LOGIC'].map(topic=>[topic,read(topic.toLowerCase()+'.ms.json')]));
 const glossary=JSON.parse(fs.readFileSync(path.join(dir,'../rich_text/glossary.json'),'utf8'));
 const data={version:'1.0.0',topics,support:read('support.ms.json'),ui:read('interface.ms.json'),termCategories:Object.fromEntries(Object.entries(glossary.entries).map(([id,e])=>[id,e.category]))};
 const runtime=fs.readFileSync(path.join(dir,'runtime.mjs'),'utf8').replace(/^export /gm,'');
 const code='/* Generated bilingual question presentation; canonical bank and state are unchanged. */\n(function(root){"use strict";\n'+runtime+'\nconst api=createQuestionLanguageService('+JSON.stringify(data).replace(/</g,'\\u003c')+');if(typeof module!=="undefined")module.exports=api;else root.DCQuestionLanguage=api;\n})(globalThis);\n';
 fs.writeFileSync(path.join(project,'dist/question-language.js'),code);
 return {version:data.version,bytes:Buffer.byteLength(code),sha256:crypto.createHash('sha256').update(code).digest('hex'),strings:Object.fromEntries(Object.entries(topics).map(([id,value])=>[id,Object.keys(value.strings).length]))};
};
