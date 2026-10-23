'use strict';
const PROFILES={feedback:{targetFirstCorrect:null,oracle:false,retry:true},high:{targetFirstCorrect:.85,oracle:true,retry:false},low:{targetFirstCorrect:.25,oracle:true,retry:false},skip:{targetFirstCorrect:null,oracle:false,retry:false}};
function predictDecision(question,profile,random){
 const p=PROFILES[profile];if(!p)throw Error('Unknown Predict profile '+profile);
 if(profile==='skip')return {kind:'skip',syntheticOracleUsed:false};
 const available=question.choiceOrder.filter(id=>!(question.attempts||[]).includes(id));
 if(!available.length)throw Error('No available Predict answer.');
 if(profile==='feedback')return {kind:'answer',choiceId:available[Math.floor(random()*available.length)],syntheticOracleUsed:false};
 if(!available.includes(question.correctChoiceId))throw Error('Canonical Predict key missing from available choices.');
 const knows=random()<p.targetFirstCorrect,wrong=available.filter(id=>id!==question.correctChoiceId);
 return {kind:'answer',choiceId:knows?question.correctChoiceId:wrong[Math.floor(random()*wrong.length)],syntheticOracleUsed:true};
}
module.exports={PROFILES,predictDecision};
