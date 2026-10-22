/* Standalone browser QA fixture made from the actual source renderers and CSS.
 * DOM_QA_MODULE=/path/to/jsdom node tests/math-display-fixture.cjs /tmp/math-display.html
 * Optional: --all includes every question; default shows the reported set and fractions.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {createAuditDom,mathLayoutOverrides}=require('./helpers/math-display.cjs');
async function main(){
 const {JSDOM}=require(process.env.DOM_QA_MODULE||'jsdom'),output=process.argv[2];
 if(!output)throw Error('Supply an output HTML path.');
 const audit=await createAuditDom({JSDOM,ids:process.argv.includes('--all')?null:['SET-024','PROB-003','PROB-023','LOGIC-017']});
 try{
  const style=audit.doc.createElement('style');style.textContent='body{margin:0;padding:20px;font:16px/1.7 system-ui;background:#15212e;color:#f3ead5}.math-audit-question{max-width:1050px;padding:20px;margin:0 auto 30px;border:1px solid #917645}.math-audit-surface,.education-answer-copy{margin:12px 0;border-top:1px solid #ffffff22;padding:10px 0}.math-audit-question h2{font-size:24px}.math-audit-question h3{font:12px system-ui;color:#b8c1c7;margin:0 0 8px}.math-audit-question:target{outline:2px solid #f2d9a6}';audit.doc.head.append(style);
  for(const article of audit.doc.querySelectorAll('[data-question-id]'))article.id=article.dataset.questionId+'-'+article.lang;
  const violations=mathLayoutOverrides(audit.doc);
  fs.writeFileSync(path.resolve(output),audit.dom.serialize());
  process.stdout.write(JSON.stringify({output:path.resolve(output),...audit.counts,authorLayoutOverrides:violations.length})+'\n');
 }finally{audit.dom.window.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
