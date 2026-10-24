/* One canonical comment owner for the game and the isolated Practice document. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
module.exports=function buildQuestionFeedback(project){
 const source=fs.readFileSync(path.join(project,'modules/mechanics/source/QUESTION_BANK/learning/question-feedback.mjs'),'utf8');
 const names=[...source.matchAll(/^export (?:const|function) (\w+)/gm)].map(x=>x[1]);
 const code='/* Generated from the shared question-feedback owner. */\n(function(root){"use strict";\n'+source.replace(/^export /gm,'')+'\nconst api={'+names.join(',')+'};if(typeof module!=="undefined")module.exports=api;else root.DCQuestionFeedback=api;\n})(globalThis);\n';
 fs.writeFileSync(path.join(project,'dist/question-feedback.js'),code);
};
