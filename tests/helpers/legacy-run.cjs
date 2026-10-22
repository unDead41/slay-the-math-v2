// Explicit legacy deck fixture: compatibility checks keep exercising the original
// stable IDs after production newRun adopts the canonical 40-card catalogue.
const E=require('../../dist/engine.js');
const STARTER=[['strike',3],['ember',3],['guard',2],['flameguard',2],['filter',1],['draw',1]];
function legacyRun(...args){const run=E.newRun(...args);run.seq=0;run.deck=[];for(const [key,count]of STARTER)for(let i=0;i<count;i++)run.deck.push(E.card(run,key));return run;}
module.exports={legacyRun,newRun:legacyRun};
