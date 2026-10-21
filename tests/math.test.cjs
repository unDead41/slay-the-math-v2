const test=require('node:test');const assert=require('node:assert/strict');const M=require('../dist/math.js');
const cards=[{role:'attack',element:'fire'},{role:'attack',element:'fire'},{role:'attack',element:'neutral'},{role:'attack',element:'neutral'},{role:'guard',element:'fire'},{role:'guard',element:'ice'},{role:'guard',element:'ice'},{role:'guard',element:'neutral'}];
test('overlapping union counts each physical card once',()=>{const q=M.makeQuestion(cards,'overlap');assert.equal(q.n,5);assert.equal(q.d,8);});
test('replacement and without-replacement are different experiments',()=>{assert.equal(M.makeQuestion(cards,'pairWithout').value,3/14);assert.equal(M.makeQuestion(cards,'pairWith').value,1/4);});
test('at least one is checked through complementary event',()=>{assert.equal(M.makeQuestion(cards,'atLeast').value,11/14);});
test('equivalent fractions, decimals and rounded percentages',()=>{const q=M.makeQuestion(cards,'atLeast');for(const v of ['11/14','22 / 28','0.7857','78.57%'])assert.ok(M.isCorrect(v,q));for(const v of ['1/0','abc','','150%','-0.5'])assert.equal(M.parseAnswer(v),null);});
test('pair questions reject insufficient source',()=>assert.equal(M.makeQuestion(cards.slice(0,1),'pairWithout'),null));
