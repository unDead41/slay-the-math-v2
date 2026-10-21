const E=require('../../dist/engine.js'),Q=require('../../dist/education.js');
function completeTrial(run){
 if(run.scene!=='education')throw new Error('Expected an artifact question.');
 const q=Q.current(run);
 if(q&&!run.educationState.pending.solved){E.selectEducation(run,q.correctChoiceId);E.answerEducation(run);}
 E.continueEducation(run);return run;
}
function claimArtifact(run,key){E.chooseArtifact(run,key);return completeTrial(run);}
function completeDomTrial(w){
 const run=JSON.parse(w.localStorage.getItem('duel-cube-math.v1'));
 const q=w.DCEducation.current(run);
 if(q&&!run.educationState.pending.solved){w.document.querySelector('[data-action=education-select][data-id="'+q.correctChoiceId+'"]').click();w.document.querySelector('[data-action=education-check]').click();}
 w.document.querySelector('[data-action=education-continue]').click();
}
async function completeBrowserTrial(page){
 const result=await page.evaluate(()=>{const run=JSON.parse(localStorage.getItem('duel-cube-math.v1'));return {scene:run.scene,id:window.DCEducation.current(run)?.correctChoiceId,solved:run.educationState?.pending?.solved};});
 if(result.scene!=='education')throw new Error('Expected the live education screen.');
 if(result.id&&!result.solved){await page.locator('[data-action=education-select][data-id="'+result.id+'"]').click();await page.locator('[data-action=education-check]').click();}
 await page.locator('[data-action=education-continue]').click();
}
module.exports={completeTrial,claimArtifact,completeDomTrial,completeBrowserTrial};
