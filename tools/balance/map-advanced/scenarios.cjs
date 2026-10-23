'use strict';
function assertDifficulty(id='runtime-baseline-no-tier'){
 if(!['baseline','runtime-baseline-no-tier'].includes(id))throw Error('NEEDS_COMBAT_MASTER_ADAPTER: '+id+' is not implemented by this runtime; economy-only profiles are insufficient.');
 return 'runtime-baseline-no-tier';
}
function difficultyReadiness(){return ['easy','medium','hard'].map(id=>({difficulty:id,status:'NEEDS_COMBAT_MASTER_ADAPTER',engineTrials:0,required:['versioned full Combat/Master engine adapter','implemented HP, enemy/stat/Focus definitions','cross-domain integration and source hashes'],economyInput:{branch:'balance/economy',commit:'04e1b7b18648a857a12680370269a9933a5f23ab',version:'economy-1.2-candidate.1',applied:false},targetPupilWinRate:{easy:.9,medium:.7,hard:.5}[id],pupilWinRateMeasured:false}));}
module.exports={assertDifficulty,difficultyReadiness};
