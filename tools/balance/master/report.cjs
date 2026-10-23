'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto');
const {loadMaster,ROOT}=require('./loader.cjs');
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const raw=p=>zlib.gunzipSync(fs.readFileSync(path.join(ROOT,p))).toString('utf8');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
function verify(){
 const engineFiles=loadMaster({difficulty:'medium'}).sourceFiles.sort(),checks=[];for(const label of ['initial','calibration','holdout','power','validation-replay']){
  const base='reports/master-balance/'+label+'/',m=read(base+'manifest.json'),s=read(base+'summary.json'),sources=raw(base+'sources.json.gz'),rows=raw(base+(label==='power'?'raw':'campaigns')+'.jsonl.gz').trim().split('\n').map(JSON.parse);
  const key=r=>label==='power'?[r.kind,r.cards.join(),r.enemy,r.seed,r.upgraded].join('|'):[r.runSeed,r.difficulty,r.predictProfile,r.routePolicy].join('|'),planned=new Set(m.tasks.map(key)),snapshot=JSON.parse(sources),engineHash=sha(engineFiles.map(p=>p+'\n'+snapshot[p]).join('\n'));
  if(sha(sources)!==m.sourceHash||s.sourceHash!==m.sourceHash||rows.length!==m.tasks.length||planned.size!==rows.length||new Set(rows.map(key)).size!==rows.length||rows.some(r=>!planned.has(key(r))))throw Error('Evidence integrity mismatch: '+label);
  const expected=label==='power'?m.provenance.definitionHash:m.definitionHash;
  if(label!=='power'&&rows.some(r=>r.provenance?.definitionHash!==expected))throw Error('Mixed candidate definitions: '+label);
  if(label==='power'?m.provenance.engineHash!==engineHash:rows.some(r=>r.provenance?.engineHash!==engineHash))throw Error('Raw engine source differs from snapshot: '+label);
  checks.push({label,cases:rows.length,sourceHash:m.sourceHash,definitionHash:expected,engineHash});
 }
 return checks;
}
function report(){
 const integrity=verify(),x=loadMaster({difficulty:'medium'}),dir=path.join(ROOT,'docs/balance/master');fs.mkdirSync(dir,{recursive:true});
 const data=require('../../../dist/balance-data.js'),p=read('reports/master-balance/power/summary.json'),holdout=read('reports/master-balance/holdout/summary.json'),name=id=>data.cards.cards.find(c=>c.id===id)?.name||id;
 const replay=read('reports/master-balance/validation-replay/comparison.json');if(replay.cases!==18||replay.matched!==18)throw Error('Validator replay differs from measured holdout.');
 if(data.definitionHash!==read('reports/master-balance/holdout/manifest.json').definitionHash||data.definitionHash!==read('reports/master-balance/power/manifest.json').provenance.definitionHash)throw Error('Current definitions need new measurements before rendering power/profile tables.');
 const f=n=>n===null?'unranked':Number(n).toFixed(2),pct=n=>(100*n).toFixed(1)+'%';
 const score=(id,enemy,upgraded)=>p.groups.find(g=>g.key===['ICP',id,enemy,upgraded].join('|'))?.meanEffect??null;
 const cards='# Measured card power — integrated Master candidate\n\nMedium only; same-size 12-card replacement decks; developing synthetic Predict; no artifacts; 3 paired seeds per cell. Values are delta U against Rune Strike, separately for short Wisp and sealed Dealer fights. Normal and upgraded replacement/reference slots use matching upgrade status. These are contextual measurements, not universal ratings.\n\n| Card | Energy | Wisp | Dealer | Wisp upgraded | Dealer upgraded |\n| --- | ---: | ---: | ---: | ---: | ---: |\n'+data.cards.cards.map(c=>'| '+name(c.id)+' | '+(c.energy.kind==='fixed'?c.energy.amount:'X')+' | '+[score(c.id,'wisp',false),score(c.id,'dealer',false),score(c.id,'wisp',true),score(c.id,'dealer',true)].map(f).join(' | ')+' |').join('\n')+'\n\nUtility: 100 win + 20 finalHP/maxHP − min(10,turns/2), after real combat-win artifact effects (none equipped here). Full variants, status, resource, Focus and per-card logs are in [raw power records](../../../reports/master-balance/power/raw.jsonl.gz); [CSV](../../../reports/master-balance/power/scores.csv). Three seeds are insufficient to certify a universal OP/weak ranking. The earlier specialist data uses its own recorded profiles.\n';
 fs.writeFileSync(path.join(dir,'CARD_POWER.md'),cards);
 const keys=Object.keys(data.profiles.medium),profiles='# Candidate profiles\n\nSource: `tools/balance/master/config.json` overlays the v1.2 spec. Generated binding: '+data.version+'. Pupil targets are unmeasured. All three difficulties share the same cards/artifacts.\n\n| Variable | Easy | Medium | Hard |\n| --- | ---: | ---: | ---: |\n'+keys.map(k=>'| '+k+' | '+['easy','medium','hard'].map(d=>data.profiles[d][k]).join(' | ')+' |').join('\n')+'\n';fs.writeFileSync(path.join(dir,'PROFILES.md'),profiles);
 const baseline=require('../../../dist/artifact-data.js'),artifacts='# Integrated artifact values\n\nSame definitions across difficulties. Runtime limits/receipts remain authoritative. The three economy-owned items are included here, unlike the earlier Combat-only candidate.\n\n| Artifact | Legacy values | Master values | Candidate effect |\n| --- | --- | --- | --- |\n'+data.artifacts.artifacts.map(a=>'| '+a.name+' | `'+JSON.stringify(baseline.artifacts.find(b=>b.id===a.id).values)+'` | `'+JSON.stringify(a.values)+'` | '+a.text+' |').join('\n')+'\n';fs.writeFileSync(path.join(dir,'ARTIFACTS.md'),artifacts);
 const high=p.groups.filter(g=>g.key.startsWith('CCP|')).sort((a,b)=>b.meanEffect-a.meanEffect).slice(0,8),comboTable=high.map(g=>{const [,ids,enemy,upgraded]=g.key.split('|');return '| '+ids.split('+').map(name).join(' + ')+' | '+enemy+' | '+upgraded+' | '+f(g.meanEffect)+' |';}).join('\n');
 const campaignTable=Object.entries(holdout.groups).map(([key,g])=>'| '+key.split('/').join(' | ')+' | '+g.wins+'/'+g.n+' | '+pct(g.winRate)+' | '+g.descriptiveWilson95.map(pct).join('–')+' | '+g.censored+' / '+g.invalid+' |').join('\n');
 const deps=JSON.parse(raw('reports/master-balance/holdout/sources.json.gz')),changedDependencies=x.sourceFiles.filter(file=>deps[file]!==fs.readFileSync(path.join(ROOT,file),'utf8'));
 const handoff=`# Master balancing handoff — game 2.27.0

Implemented on balance/master; main is not published by this task. Start New Run and select an Easy/Medium/Hard playtest link, or open the game with ?balance=easy / medium / hard. Current common definition binding: ${data.version}; definition hash ${data.definitionHash}.

## What is integrated

Latest main b67298b (Learning Report/optional analytics 2.26.0), including original artwork/card motion from 7afb0aa, plus Map 5480273, Combat remote 1bf6632 (local source 68dce74, identical tree) and Economy df53579. The final game version is 2.27.0 to avoid the concurrent analytics version. Analytics sharing remains under its existing consent/settings owner.

The shared browser/Node binding connects 40 candidate cards, 31 artifacts, 12 enemies, full difficulty profiles, source-aware frozen rewards, Shop prices/removal, Rest, 15 Mystery events, Boss rewards and real campaign carry. Economic Seal/Purse/Contract now use 10%/+40/20%. Difficulty saves are isolated and versioned; restore rejects a different definition/profile, and retry/checkpoint retain the binding. Learn assistance is not multiplied onto candidate combat. Legacy entry/saves and the question bank remain available. See [Master SOR](../../sor/23_MASTER_BALANCE.md), [profiles](PROFILES.md), [all 40 measured cards](CARD_POWER.md), [31 artifacts](ARTIFACTS.md) and the specialist numeric card audit under ../combat.

No map topology or extra Explore feature is invented. Mandatory Mystery 5, Rest 9 and Boss 10 remain. Source support weighting uses capability tags; unmeasured loot CP remains null. Card CP and map pressure are different quantities.

## Campaign evidence

720 primary two-stage campaign attempts, plus 18 matched validator verification replays: initial 180, calibration 180, untouched holdout seeds 20–39 another 360. No invalid or censored campaign result in these cohorts. The initial profile won every Easy pilot and no Hard pilot. Candidate.2 adjusts starting HP, enemy HP/attack, Rage/phase and Easy recovery as a package; the package comparison does not identify one isolated causal variable. No card stat was changed to force a bot win rate.

All battles use the real resolver, actual connected route choices, frozen legal offers, available Gold, acquired cards/artifacts, real Rest/upgrade and carried HP. Mystery is attempted. Feedback Predict guesses untried visible answers and retries; high/low know the canonical Predict answer with synthetic 85%/25% probability and abandon a wrong first answer. Artifact trials use feedback; Mystery gets one feedback-based attempt. These policies differ in seal access as well as Focus. They are not measured pupil skill. The two route policies are recovery-seeking and reward-seeking; later choices, encounters and RNG exposure may diverge.

Holdout results (20 paired seeds per cell; intervals describe that bot cohort):

| Difficulty | Predict | Route | Wins | Rate | Wilson 95% | Censored / invalid |
| --- | --- | --- | ---: | ---: | --- | --- |
${campaignTable}

**Pupil 90% / 70% / 50% remains unmeasured.** Easy remains extremely forgiving for these bots; Hard is strongly sensitive to knowledge and route. Preserve that limitation instead of claiming calibration. Holdout cells reuse seeds across policies, so pooling them as independent pupil observations is invalid. Real pupils and broader decision/deck policies are the next calibration inputs.

## Card and synergy evidence

Fresh 624 replacement/factorial cases, 1,632 encounters, zero invalid/censored: every card normal/upgraded, two horizons, 3 seeds per cell; ten chosen pairs and four triads. Utility is actual win/HP/turn outcome, not summed draw/Block proxies. Pair interaction uses all four cells. Triads retain eight cells and separate third-order interaction from total synergy. Selected pair results worth follow-up:

| Pair | Enemy | Upgraded | Mean interaction U |
| --- | --- | --- | ---: |
${comboTable}

Large positive U often crosses the loss/win threshold. It does not prove an infinite combo or universal OP state, and acquisition cost is not free in the campaign. Defensive setup is valuable in long fights; it can lose tempo in short ones. No automatic nerf or CP-based loot multiplier is justified by 3 seeds. Historical Combat Lite/deep evidence remains intact and retains its original profile context.

## Reproduction and provenance

- npm run balance:master -- --label=NEW-LABEL --seeds=20 --offset=40 --workers=3
- npm run balance:power (refuses to overwrite existing evidence; use a separate checkout/output when deliberately repeating).
- node tools/balance/master/report.cjs verifies manifests/source snapshots and regenerates these tables.
- npm test; npm run check; npm run test:maps; npm run build:prod; npm run test:balance-master-browser.
- In this environment jsdom is supplied through NODE_PATH=/tmp/stm-audio-qa/node_modules:$CODEX_PRIMARY_RUNTIME_NODE_MODULES; browser QA additionally uses QA_CHROMIUM_MODULE=@sparticuz/chromium. No project dependency installation is required here.

Every measured cohort keeps manifest tasks, compressed raw records and exact source snapshots under reports/master-balance. Analytics integration initially preserved every engine dependency byte. The final review then strengthened save validation in ${changedDependencies.join(', ')}: mandatory matching Economy state and the candidate Thorns bound. These are validator changes, not new card/profile numbers. All 18 difficulty/Predict/route cells for held-out seed20 were replayed after those fixes and exactly matched the prior outcomes, carried state, room snapshots, action trace/RNG and metrics. See [comparison](../../../reports/master-balance/validation-replay/comparison.json) and its separate source snapshot. Do not relabel historical source hashes as the final tree.

The final validation record is [VALIDATION.md](VALIDATION.md). [Execution plan](../MASTER_PLAN.md) records scope and the concurrent main update. Real pupil win rates, physical device/audio audition, all possible combinations and universal CP rankings remain unverified.
`;
 fs.writeFileSync(path.join(dir,'HANDOFF.md'),handoff);fs.writeFileSync(path.join(ROOT,'reports/master-balance/INTEGRITY.json'),JSON.stringify({cohorts:integrity,currentDefinitionHash:data.definitionHash,changedEngineDependenciesSinceHoldout:changedDependencies,validatorReplay:{cases:replay.cases,matched:replay.matched}},null,2)+'\n');
 console.log(JSON.stringify({cohorts:integrity.length,campaigns:720,validationReplays:replay.cases,powerEncounters:p.encounters,changedDependencies}));
}
if(require.main===module)report();module.exports={verify,report};
