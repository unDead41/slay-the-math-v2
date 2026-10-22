'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const path=require('node:path'),{pathToFileURL}=require('node:url');
const moduleReady=import(pathToFileURL(path.resolve(__dirname,'../modules/mechanics/source/QUESTION_BANK/learning/question-feedback.mjs')).href);
const question={id:'PROB-003',topic:'Probability',topicCode:'PROB',difficulty:'Easy',prompt:'Heads and an even number?'};
function storage(initial){const values=new Map(initial||[]);return {getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),values};}
function setup(api,disk){return api.createQuestionFeedbackStore({storage:disk,bankVersion:'form4-review-1.6.0',questionIds:['PROB-003','SET-001']});}

test('comments keep their question/version and survive reopening without touching game or learning saves',async()=>{
 const api=await moduleReady,disk=storage([['duel-cube-math.v1','keep-run'],['slay-the-math.education-practice.v1','keep-learning']]);
 const store=setup(api,disk);
 store.save(question,['hint-unclear','question-confusing'],'Please explain the two conditions.',{mode:'review',hintUsed:true});
 const restored=setup(api,disk),comment=restored.get(question.id);
 assert.equal(comment.questionId,'PROB-003');assert.equal(comment.bankVersion,'form4-review-1.6.0');
 assert.equal(comment.comment,'Please explain the two conditions.');assert.equal(comment.context.hintUsed,true);
 assert.deepEqual(comment.categories,['hint-unclear','question-confusing']);
 assert.equal(disk.getItem('duel-cube-math.v1'),'keep-run');assert.equal(disk.getItem('slay-the-math.education-practice.v1'),'keep-learning');
 const createdAt=comment.createdAt;
 restored.save(question,['steps-unclear'],'Use numbered steps.',{mode:'learn'});
 assert.equal(restored.list().length,1);assert.equal(restored.get(question.id).createdAt,createdAt);
 assert.equal(restored.get('SET-001'),null);
});
test('separate tabs merge different questions and keep in-memory comments through a failed write',async()=>{
 const api=await moduleReady,disk=storage(),first=setup(api,disk),second=setup(api,disk);
 first.save(question,['hint-unclear'],'First comment.');
 second.save({...question,id:'SET-001'},['diagram-unclear'],'Second comment.');
 first.save(question,['hint-unclear'],'Edited first comment.');
 assert.equal(setup(api,disk).list().length,2);
 const original=disk.setItem;disk.setItem=()=>{throw Error('quota');};
 first.save(question,['question-difficult'],'Keep this while offline.');
 assert.match(first.error,/Download|download/);assert.equal(first.get(question.id).comment,'Keep this while offline.');
 disk.setItem=original;first.flush();assert.equal(first.error,'');
 assert.equal(setup(api,disk).get(question.id).comment,'Keep this while offline.');
});
test('unreadable stored comments are preserved while new comments remain exportable',async()=>{
 const api=await moduleReady,disk=storage([[api.QUESTION_FEEDBACK_KEY,'{broken']]),store=setup(api,disk);
 store.save(question,['other'],'New feedback.');
 assert.equal(disk.getItem(api.QUESTION_FEEDBACK_KEY),'{broken');assert.match(store.error,/could not be read/);
 assert.equal(store.exportData().comments[0].comment,'New feedback.');
});
test('empty comments clear only that question; invalid categories and overlong text cannot enter the report',async()=>{
 const api=await moduleReady,store=setup(api,storage());
 assert.throws(()=>store.save(question,['invented'],'text'));
 assert.throws(()=>store.save(question,['other'],'x'.repeat(2001)));
 assert.throws(()=>store.save({...question,id:'PROB-999'},['other'],'text'));
 store.save(question,['other'],'Keep initially.');
 store.save({...question,id:'SET-001'},['diagram-unclear'],'Keep sets.');
 store.save(question,[],'');assert.equal(store.list().length,1);assert.equal(store.list()[0].questionId,'SET-001');
});
test('CSV export quotes multiline comments and neutralizes spreadsheet formulas without changing stored text',async()=>{
 const api=await moduleReady,store=setup(api,storage());
 const comment='=HYPERLINK("https://example.invalid")\nPlease make this clearer, thanks.';
 store.save(question,['other'],comment);
 const csv=api.questionFeedbackCSV(store.exportData());
 assert.ok(csv.startsWith('\uFEFF'));assert.ok(csv.includes('Question ID'));
 assert.ok(csv.includes('"\'=HYPERLINK(""https://example.invalid"")\nPlease make this clearer, thanks."'));
 assert.equal(store.get(question.id).comment,comment);
 assert.equal(store.exportData().comments.length,1);
});
