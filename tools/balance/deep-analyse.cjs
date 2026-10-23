'use strict';
const fs=require('node:fs'),path=require('node:path'),z=require('node:zlib');
const {ROOT,BASE}=require('./loader.cjs'),B=require('./combat.cjs');
const dir=path.join(ROOT,'docs/balance/combat/deep-results');
const cohorts=['evolved','resource','setup','setup_clean','risk_followup','cluster','dilution','reload','campaign_reviewed','hard_followup'];
function rows(c){return fs.readdirSync(dir).filter(f=>new RegExp('^'+c+'-\\d+\\.jsonl\\.gz$').test(f)).flatMap(f=>z.gunzipSync(fs.readFileSync(path.join(dir,f))).toString().trim().split('\n').map(JSON.parse));}
function group(rs,key){const m=new Map();for(const r of rs){const k=JSON.stringify(key(r));if(!m.has(k))m.set(k,[]);m.get(k).push(r);}return [...m].map(([k,rows])=>({key:JSON.parse(k),rows}));}
const mean=a=>a.length?a.reduce((s,n)=>s+n,0)/a.length:null;
function wilson(w,n){if(!n)return null;const zz=1.96**2,p=w/n,d=1+zz/n,c=(p+zz/(2*n))/d,h=1.96*Math.sqrt(p*(1-p)/n+zz/(4*n*n))/d;return {low:Math.max(0,c-h),high:Math.min(1,c+h)};}
function summary(rs){const counts=rs.reduce((a,r)=>(a[r.result.status]=(a[r.result.status]||0)+1,a),{}),n=rs.length,w=counts.WIN||0,l=counts.LOSS||0,c=counts.BENCHMARK_LIMIT_CENSORED||0;return {n,counts,terminalWinRate:w+l?w/(w+l):null,conditionalWilson:wilson(w,w+l),allCaseWinBounds:[w/n,(w+c)/n],meanFinalHp:mean(rs.map(r=>r.result.final?.playerHp??r.result.finalHp).filter(Number.isFinite)),meanFinalEnemyHp:mean(rs.map(r=>r.result.final?.enemyHp).filter(Number.isFinite)),meanTurn:mean(rs.map(r=>r.result.final?.turn).filter(Number.isFinite)),meanPlays:mean(rs.map(r=>r.result.plays).filter(Number.isFinite))};}
function csv(name,rs){if(!rs.length)return;const fields=[...new Set(rs.flatMap(Object.keys))],enc=v=>'"'+String(v==null?'':typeof v==='object'?JSON.stringify(v):v).replaceAll('"','""')+'"';fs.writeFileSync(path.join(dir,name),[fields.map(enc).join(','),...rs.map(r=>fields.map(k=>enc(r[k])).join(','))].join('\n')+'\n');}
function setup(rs){return group(rs,r=>({...r.meta,mask:undefined})).map(({key,rows})=>{const s=B.factorialSummary(rows.map(r=>({seed:r.options.seed,mask:r.meta.mask,result:r.result})),1),t=rows.filter(r=>r.meta.mask===1),id=key.target;return {...key,n:s.n,status:s.status,ICP:s.icp?.[0]||null,referenceWins:s.winsByMask?.[0],targetWins:s.winsByMask?.[1],IDplayed:t.filter(r=>r.result.cards?.[id]).length,IDtriggered:t.filter(r=>r.result.passive?.[id]).length,meanFirstPlay:mean(t.map(r=>r.result.cards?.[id]?.firstTurn).filter(Number.isFinite)),meanFirstTrigger:mean(t.map(r=>r.result.passive?.[id]?.firstTurn).filter(Number.isFinite)),meanTurns:mean(t.map(r=>r.result.final?.turn).filter(Number.isFinite)),meanFinalEnemyHp:mean(t.map(r=>r.result.final?.enemyHp).filter(Number.isFinite)),meanPlayerHp:mean(t.map(r=>r.result.final?.playerHp).filter(Number.isFinite)),meanTargetEnergy:mean(t.map(r=>r.result.cards?.[id]?.energy||0)),meanBlockUsed:mean(t.map(r=>r.result.enemy?.blockUsed||0))};});}
function analyse(){
 const all={};for(const c of cohorts){if(!fs.existsSync(path.join(dir,c+'-parts.json')))throw Error('Incomplete '+c);all[c]=rows(c);}
 const coverage=cohorts.map(c=>({cohort:c,cases:all[c].length,outcomes:summary(all[c]).counts,engineEncounters:['campaign_reviewed','hard_followup'].includes(c)?all[c].reduce((s,r)=>s+r.result.encounters.length,0):c==='reload'?all[c].length*2:all[c].length}));
 const invalid=cohorts.flatMap(c=>all[c].filter(r=>['INVALID_POLICY_OR_ENGINE','MISMATCH'].includes(r.result.status)).map(r=>({cohort:c,index:r.index,error:r.result.error,status:r.result.status})));
 const flat=group(all.evolved,r=>({build:r.build,difficulty:r.difficulty,archetype:r.meta.archetype,size:r.meta.size,predict:r.options.predictProfile})).map(g=>({...g.key,...summary(g.rows)}));csv('evolved-outcomes.csv',flat);
 const overview=group(all.evolved,r=>({build:r.build,difficulty:r.difficulty,archetype:r.meta.archetype,predict:r.options.predictProfile})).map(g=>({...g.key,...summary(g.rows)}));csv('predict-overview.csv',overview);
 for(const c of ['resource','dilution'])csv(c+'-outcomes.csv',group(all[c],r=>({...r.meta,predict:r.options.predictProfile,difficulty:r.difficulty})).map(g=>({...g.key,...summary(g.rows)})));
 const clean=setup(all.setup_clean),competing=setup(all.setup),risk=setup(all.risk_followup);csv('setup-clean.csv',clean);csv('setup-competing-passives.csv',competing);csv('setup-50-seed-followup.csv',risk);
 const clusters=group(all.cluster,r=>({...r.meta,mask:undefined})).map(g=>({...g.key,...B.factorialSummary(g.rows.map(r=>({seed:r.options.seed,mask:r.meta.mask,result:r.result})),1)}));csv('artifact-clusters.csv',clusters);
 const campaignRows=(c,key)=>group(all[c],key).map(g=>({...g.key,...summary(g.rows),stage2Reached:g.rows.filter(r=>r.result.stage===1).length,boss2Reached:g.rows.filter(r=>r.result.log.some(e=>e.kind==='enter'&&e.stage===1&&e.type==='boss')).length,encounters:g.rows.reduce((s,r)=>s+r.result.encounters.length,0)}));
 const campaigns=campaignRows('campaign_reviewed',r=>({build:r.build,difficulty:r.difficulty,predict:r.options.predictProfile})),followup=campaignRows('hard_followup',r=>({difficulty:r.difficulty,policy:r.options.policy}));csv('campaign-outcomes.csv',campaigns);csv('hard-followup.csv',followup);
 csv('growth-transactions.csv',all.campaign_reviewed.flatMap(r=>r.result.log.map((e,i)=>({seed:r.options.seed,build:r.build,difficulty:r.difficulty,archetype:r.meta.archetype,predict:r.options.predictProfile,ordinal:i,...e}))));
 const pred=group([...all.evolved,...all.campaign_reviewed.flatMap(r=>r.result.encounters.map(e=>({...r,result:e})))],r=>({build:r.build,difficulty:r.difficulty,predict:r.options.predictProfile})).map(g=>{const totals=g.rows.reduce((a,r)=>{for(const[k,v]of Object.entries(r.result.predict||{}))a[k]=(a[k]||0)+v;a.opportunities+=(r.result.turns||[]).length;return a;},{opportunities:0});return {...g.key,...totals};});csv('predict-realised.csv',pred);
 const probes=JSON.parse(fs.readFileSync(path.join(dir,'artifact-probes.json'))),stress=JSON.parse(fs.readFileSync(path.join(dir,'stress.json')));csv('artifact-trigger-coverage.csv',probes.map(r=>({id:r.id,name:r.name,build:r.build,classification:r.classification,status:r.status,evidenceRecords:r.evidence.length,error:r.error,notes:r.notes})));
 const stressTotals=stress.reduce((a,r)=>{for(const k of ['paid','canceled','staleRejected','forgedRejected','reloads'])a[k]=(a[k]||0)+(r[k]||0);return a;},{}),result={baseCommit:BASE,coverage,totalEncounters:coverage.reduce((s,r)=>s+r.engineEncounters,0),invalid,stressRows:stress.length,stressFailures:stress.filter(r=>r.status!=='PASS'),stressTotals,campaigns,hardFollowup:followup,medium:overview.filter(r=>r.build==='candidate'&&r.difficulty==='medium'),riskFollowup:risk,clusters};
 fs.writeFileSync(path.join(dir,'SUMMARY.json'),JSON.stringify(result,null,2));
 const fmt=v=>v==null?'withheld':v.toFixed(2),wlc=r=>`${r.counts.WIN||0}/${r.counts.LOSS||0}/${r.counts.BENCHMARK_LIMIT_CENSORED||0}`;
 const md=`# Deep Combat & Card Synergy — Master handoff

23 Oktober 2026 (Malaysia). Branch balance/combat. Base game: ${BASE}. Calon v1.2 kekal eksperimen pembangunan. Tiada merge/push main, tiada perubahan angka produksi, ID, artwork, soalan, harga atau offer policy.

## Coverage sebenar

${result.totalEncounters} encounter dalam cohort utama, ditambah 50 encounter khusus Exhaust/Recall, probes artifak dan 50 trace transaksi Passive. Reload mengira dua encounter setiap pasangan. Campaign mengira encounter yang benar-benar dimainkan, bukan semua room yang dirancang. Ini berasingan daripada saringan awal 10,156 encounter.

| Cohort | Cases | Engine encounters | Outcomes |
|---|---:|---:|---|
${coverage.map(r=>`| ${r.cohort} | ${r.cases} | ${r.engineEncounters} | ${JSON.stringify(r.outcomes)} |`).join('\n')}

Invalid policy/engine atau reload mismatch: **${invalid.length}**. Censored kekal dalam denominator; ia bukan kekalahan murid atau bukti loop engine. Ranking ICP/CCP akhir ditangguh jika variant censored. Semua seed, deck instance/upgrade, artifak, resource, timeline dan hasil disimpan dalam JSONL gzip.

## Deck, Predict dan resource

Evolved menguji lima binaan (Attack/Block/Focus/Passive/draw), saiz 10/18/30, upgrade yang direkodkan dan satu pack Starting + mid-tier + Boss. Ini potensi combat dengan pemilikan tersebut, bukan kebarangkalian memperoleh pack. Komposisi berubah mengikut saiz; cohort dilution berasingan mengekalkan deck awal 12 kad dan empat upgrade, kemudian menambah Rune Strike/Rune Guard biasa sehingga 24/36. Resource menguji HP 50% serta upgrade 0%/75%.

Predict independent = sentiasa betul kali pertama; developing = sasaran 60% independent, 20% salah kemudian betul, 20% skip; struggling = 25%/25%/50%; skip = tidak mencuba Predict. Pilihan dibuat daripada stream polisi seeded; kiraan sebenar berada dalam predict-realised.csv. Ini andaian simulasi, bukan ukuran murid. Jawapan salah tidak memberi Focus/seal; betul selepas salah atau Hint memberi seal tanpa independent Focus. Assisted setup menggunakan Hint-correct.

| Medium constructed deck | Predict | W/L/censored | n | Mean turns |
|---|---|---|---:|---:|
${result.medium.filter(r=>r.predict!=='skip').map(r=>`| ${r.archetype} | ${r.predict} | ${wlc(r)} | ${r.n} | ${fmt(r.meanTurn)} |`).join('\n')}

Overview menggabungkan tiga saiz secara sama rata (30 kes, bukan 30 deck yang sama). CSV menyimpan saiz berasingan, HP, turn, plays dan baki HP musuh. Wilson interval bersyarat pada terminal results; all-case win bounds mengekalkan censoring. Seed digunakan semula antara konteks, maka pooled interval ialah deskriptif, bukan inferens murid bebas.

Always-skip tidak boleh membunuh boss dua seal melalui HP damage. Defensive Easy boleh mencapai had benchmark kerana Rage Easy tidak menambah damage. Pemain masih boleh menggunakan Predict untuk membuka seal; exhausted-bank completion juga membuka seal tanpa Focus. Tiada seal/HP dipaksa terbuka dalam simulasi.

## Perkembangan deck melalui run sebenar

600 campaign menggunakan map dua stage/10 level, offer asal, pembelian dalam Gold sebenar, Rest/upgrade dan hadiah Boss 1. Kad mesti datang daripada frozen offer yang sah. Tiada suntikan deck atau HP selepas battle. HP dibawa ke encounter seterusnya dengan healing engine sebenar. Route safe/risk menggunakan jenis node runtime dan dibahagi sama rata dalam seed cohort. Polisi Predict memperoleh seed tersendiri bagi stage/depth.

| Build/difficulty | Predict | W/L/censored | Attempts | Reached Stage 2 | Boss 2 |
|---|---|---|---:|---:|---:|
${campaigns.map(r=>`| ${r.build}/${r.difficulty} | ${r.predict} | ${wlc(r)} | ${r.n} | ${r.stage2Reached} | ${r.boss2Reached} |`).join('\n')}

Campaign ialah combat-candidate + Economy semasa. Mystery ditolak sebelum bermula, claim-artifact questions diselesaikan betul untuk mengasingkan combat/Predict, dan Rest/prices/loot/Boss healing lama dikekalkan. Oleh itu seluruh profil SOR v1.2 belum diintegrasi. Ini bukan bukti sasaran murid Easy90/Medium70/Hard50.

## Follow-up Hard

Pilot reviewed menghasilkan Hard 0/150 dan Easy 150/150. Follow-up menggunakan 50 map seed baharu, lima draft preferences, safe/risk dan dua polisi tindakan, dengan Medium/Hard dipadankan serta Predict sentiasa independent-correct.

| Difficulty | Policy | W/L/censored | Attempts | Reached Stage 2 |
|---|---|---|---:|---:|
${followup.map(r=>`| ${r.difficulty} | ${r.policy} | ${wlc(r)} | ${r.n} | ${r.stage2Reached} |`).join('\n')}

Hard ialah isu balance yang mesti diselesaikan sebelum menganggap calon ini siap produksi. Keputusan tidak menentukan nerf stat secara automatik: draft policy, perkembangan deck, route dan Economy lama ialah faktor bersama. Beginner masih menerima Focus helper; ia bukan model murid yang telah dikalibrasi.

## Setup payoff dan kombo

Kesemua 10 Passive serta Layered Shield, Mana Reading dan Next Chapter diuji secara paired dengan penggantian Rune Strike: saiz deck, seed, lawan, resource dan upgrade slot dipadankan. Clean deck tiada Passive lain. Cohort competing-passives mengandungi Passive sedia ada/duplicate dan tidak boleh dianggap kuasa salinan pertama. IDplayed dalam cohort itu boleh merangkumi salinan sedia ada.

Utility cadangan SOR: U=100 win +20 finalHP/maxHP -min(10,turns/2). Tiada proxy draw/Block ditambah semula. ICP ialah perubahan U dalam konteks ini. Tiga target berlainan yang mempunyai absolute paired U terbesar pada saringan clean diperluas kepada 50 seed baharu dalam dua konteks; selection bias dan multiple comparisons kekal.

| Target | Enemy | Predict | Upgrade | n | ICP U [95% t interval] | ID played/triggered |
|---|---|---|---|---:|---|---|
${risk.map(r=>`| ${r.target.split('.').at(-1)} | ${r.enemy} | ${r.predictProfile} | ${r.upgraded} | ${r.n} | ${fmt(r.ICP?.mean)} [${fmt(r.ICP?.low)},${fmt(r.ICP?.high)}] | ${r.IDplayed}/${r.IDtriggered} |`).join('\n')}

ICP besar bukan interaction surplus dan bukan bukti kombo OP. Pertahanan berterusan/carry/queued draw boleh tidak mempunyai passive-trigger log; gunakan timeline Block/hand dan paired outcome. Trigger=0 boleh bermaksud tidak terdedah atau tiada log trigger untuk ongoing effect. Baki HP musuh turut direkod kerana U boleh kurang membezakan dua kekalahan.

Lima cluster artifak masing-masing menggunakan 50 seed per Predict context: Strength/multi-hit, Agility/Layered/carry, free Exhaust/Abacus, Skill/draw/Ward, Focus/Ember Core. CSV membezakan utility marginal artifak tambahan daripada CCP kad 4/8-variant dalam saringan awal. Kos memperoleh artifak tidak dianggap percuma atau sudah balanced.

## Exploit, save dan artifak

200 pasangan uninterrupted/reload semuanya menyimpan status MATCH/MISMATCH. Checkpoint meliputi Predict reservation/wrong/hint/correct, Focus arm, unpaid/committed choice, card resolve dan end turn. Perbandingan meliputi state mekanik, RNG, outcome, bayaran dan trigger; presentation refresh tidak dibandingkan. Setiap boundary menyemak UID conservation, Hand10, Passive3, satu ID aktif, resource bounds, validator dan tiada UID keluar semula daripada Exhaust.

Stress ${stress.length} rows; totals ${JSON.stringify(stressTotals)}. Trace Passive menyusun instance yang benar-benar dimiliki dan mengekalkan kos Energy; damage enemy dihentikan hanya pada boundary fixture untuk menguji sejarah panjang. Ia bukan CP encounter. Hadiah activation dikira secara live sepanjang trace, bukan daripada log UI yang terhad. Save palsu (resource, duplicate aktif, receipt) mesti ditolak; cancel dan stale-choice retry mesti atomic. Tidak semua kemungkinan save corruption diuji.

Kesemua 31 artifak mempunyai probe dalam kedua-dua build. Candidate lulus. Baseline Spool tersalah menganggap penolakan calon Draw Pile sebagai hand discard; calon terdahulu sudah menutup perbezaan itu. Tiada kad semasa yang menyediakan positive hand-discard trigger, maka pengecualian Spool diuji secara negatif sahaja. Merchant/Bram = quote checks; Ration/Purse = acquisition checks. Bonus Defend dibuktikan melalui plan/receipt/Block delta kerana calculation entry sedia ada tidak menyertakan artifact ID. Probe Chance Die meliputi enam muka. Nilai Economy-owned Seal/Purse/Contract baharu tidak diaktifkan.

## Semakan, reproducibility dan batas

Semakan bebas mengenal pasti ralat polisi node battle, seal telemetry ketika bank exhausted, source hash yang tertinggal shared policy dan gift ledger yang boleh luput daripada log. Ujian regresi membuktikan pembetulan. Run reviewed menggunakan pembetulan itu. Source snapshots kini menyertakan deep/decks/growth/runner/combat/candidate/loader, serta engine provenance daripada loader.

Penyelenggaraan workspace memadam checkout/raw sebelum handoff. Baseline dipulihkan daripada patch tersimpan; harness dan semua cohort utama diulang semula. Bukti muktamad ialah raw yang dijana semula ini, dengan source hash baharu. Log aggregate sebelum pemulihan disimpan untuk perbandingan; tiada raw lama yang hilang dipersembahkan sebagai tersedia. Pilot campaign dengan ranking route salah dikecualikan.

maxWork ialah kiraan harness/API/preview, bukan instrumentation semua langkah atomik dalaman. Had 100 cycles/500 plays/10,000 work menghasilkan censoring dan tidak menukar game murid. Polisi membaca hand/intent/pilihan yang terdedah; tiada hidden draw order digunakan. Focus helper boleh mengatasi pilihan random/beginner; Burning Page mengambil calon pertama dan swap Passive menggunakan ranking ringkas. Ini bukan search optimum/RL dan bukan simulasi semua outcome.

Master perlu menggabungkan profil Hard dengan Map/Economy, menilai kebolehpercayaan Focus dan kos setup, serta menjalankan playtest murid. Tiada angka produksi ditala secara senyap dan tiada dakwaan semua loop telah dibuktikan tiada. MODEL.zip tidak tersedia dan tidak digunakan; PDF/soalan tidak diubah.
`;
 fs.writeFileSync(path.join(dir,'DEEP_COMBAT_REPORT.md'),md);console.log(JSON.stringify({coverage,totalEncounters:result.totalEncounters,invalid:invalid.length,stressTotals}));return result;
}
module.exports={rows,group,summary,setup,wilson,analyse};if(require.main===module)analyse();
