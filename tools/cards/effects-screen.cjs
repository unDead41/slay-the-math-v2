'use strict';
// A fresh, bounded integration screen. Never overwrites historical power data.
const fs=require('node:fs'),path=require('node:path'),{loadMaster}=require('../balance/master/loader.cjs'),D=require('../balance/deep.cjs'),decks=require('../balance/decks.cjs');
const dir=path.resolve(__dirname,'../../reports/card-effects-2.33.0');
const label=process.argv[2]||'screen';if(!/^[a-z0-9-]+$/.test(label))throw Error('Invalid screen label');const target=path.join(dir,label+'.json');if(fs.existsSync(target))throw Error('Refusing to overwrite an existing screen');
const rows=[];
for(const difficulty of ['easy','medium','hard']){const x=loadMaster({difficulty});for(const archetype of ['attack','block','draw','passive'])for(const seed of [24240,24241]){
 const outcome=D.simulate(x,{seed,enemy:'dealer',deck:decks.deck(archetype,18,.33),predictProfile:'developing',reload:true,maxCycles:60,maxPlays:400,maxWork:10000});
 rows.push({difficulty,archetype,seed,provenance:x.provenance,...outcome});
}}
const summary={context:'Constructed 18-card decks against a sealed Stage 2 boss; existing strategic heuristic and synthetic developing Predict. Integration screen, not pupil win rates or a card ranking.',cases:rows.length,wins:rows.filter(r=>r.status==='WIN').length,losses:rows.filter(r=>r.status==='LOSS').length,invalid:rows.filter(r=>r.status==='INVALID_POLICY_OR_ENGINE').length,censored:rows.filter(r=>r.status==='BENCHMARK_LIMIT_CENSORED').length};
fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(target,JSON.stringify({summary,rows},null,2)+'\n');console.log(JSON.stringify(summary));if(summary.invalid||summary.censored)process.exitCode=1;
