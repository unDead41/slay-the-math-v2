'use strict';
function pressureDebt(values){
 let peak=0,final=0,gross=0,recovery=0;
 for(const n of values){
  if(!Number.isFinite(n))throw Error('Pressure inputs must be finite.');
  if(n>=0){gross+=n;final+=n;peak=Math.max(peak,final);}
  else{const heal=Math.min(final,-n);final-=heal;recovery+=heal;}
 }
 return {peak,final,gross,recovery};
}
function riskScore(wins,trials,pReference=.7){
 if(!Number.isSafeInteger(wins)||!Number.isSafeInteger(trials)||wins<0||trials<0||wins>trials||!(pReference>0&&pReference<1))throw Error('Invalid win/trial counts or reference.');
 if(!trials)return {combatPower:null,winRate:null,smoothedWinProbability:null,winInterval95:null,combatPowerInterval95:null};
 const p=wins/trials,z=1.959963984540054,z2=z*z,den=1+z2/trials;
 const center=(p+z2/(2*trials))/den,half=z*Math.sqrt(p*(1-p)/trials+z2/(4*trials*trials))/den;
 const interval=[wins===0?0:Math.max(0,center-half),wins===trials?1:Math.min(1,center+half)];
 const smoothed=(wins+.5)/(trials+1),cp=x=>x<=0?null:1000*Math.log(1/x)/Math.log(1/pReference);
 return {combatPower:cp(smoothed),winRate:p,smoothedWinProbability:smoothed,winInterval95:interval,combatPowerInterval95:[cp(interval[1]),cp(interval[0])],cpUpperUnbounded:interval[0]===0};
}
module.exports={pressureDebt,riskScore};
