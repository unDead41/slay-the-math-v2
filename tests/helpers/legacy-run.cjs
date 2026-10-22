// Explicit legacy deck fixture: compatibility checks keep exercising the original
// stable IDs after production newRun adopts the canonical 40-card catalogue.
const E=require('../../dist/engine.js');
const C=require('../../dist/config.js'),M=require('../../dist/math.js');
const STARTER=[['strike',3],['ember',3],['guard',2],['flameguard',2],['filter',1],['draw',1]];
function legacyRun(...args){const run=E.newRun(...args);run.seq=0;run.deck=[];for(const [key,count]of STARTER)for(let i=0;i<count;i++)run.deck.push(E.card(run,key));return run;}
// Model a question already present in a pre-bank save; production must resume
// this frozen question, while every newly generated Predict uses the bank.
function legacyForecast(run){const b=run.battle;if(b.question||b.forecastUsed)return E.forecast(run);const e=C.enemies[b.enemyId],kind=e.boss&&b.seals<e.seals.length?e.seals[b.seals]:run.stage===0?['single','exclusive','overlap'][(b.turn-1)%3]:['pairWithout','pairWith','atLeast'][(b.turn-1)%3];const q=M.makeQuestion(b.draw.map(c=>({...c,...E.definition(c)})),kind);if(!q)throw Error('Not enough cards in the source.');q.seal=e.boss&&b.seals<e.seals.length?b.seals:null;b.question=q;return E.forecast(run);}
module.exports={legacyRun,legacyForecast,newRun:legacyRun};
