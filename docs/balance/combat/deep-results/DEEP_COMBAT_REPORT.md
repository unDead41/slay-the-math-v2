# Deep Combat & Card Synergy — Master handoff

23 Oktober 2026 (Malaysia). Branch balance/combat. Base game: 2800f9aeba5ed594e6ef3f991bcf4dfa498a5de7. Calon v1.2 kekal eksperimen pembangunan. Tiada merge/push main, tiada perubahan angka produksi, ID, artwork, soalan, harga atau offer policy.

## Coverage sebenar

19661 encounter dalam cohort utama, ditambah 50 encounter khusus Exhaust/Recall, probes artifak dan 50 trace transaksi Passive. Reload mengira dua encounter setiap pasangan. Campaign mengira encounter yang benar-benar dimainkan, bukan semua room yang dirancang. Ini berasingan daripada saringan awal 10,156 encounter.

| Cohort | Cases | Engine encounters | Outcomes |
|---|---:|---:|---|
| evolved | 2400 | 2400 | {"WIN":1403,"LOSS":866,"BENCHMARK_LIMIT_CENSORED":131} |
| resource | 1050 | 1050 | {"WIN":729,"LOSS":321} |
| setup | 3120 | 3120 | {"WIN":2391,"LOSS":729} |
| setup_clean | 3120 | 3120 | {"WIN":1566,"LOSS":1554} |
| risk_followup | 600 | 600 | {"WIN":342,"LOSS":258} |
| cluster | 1000 | 1000 | {"WIN":736,"LOSS":264} |
| dilution | 600 | 600 | {"WIN":443,"LOSS":157} |
| reload | 200 | 400 | {"MATCH":200} |
| campaign_reviewed | 600 | 5933 | {"WIN":313,"LOSS":287} |
| hard_followup | 200 | 1438 | {"WIN":44,"LOSS":156} |

Invalid policy/engine atau reload mismatch: **0**. Censored kekal dalam denominator; ia bukan kekalahan murid atau bukti loop engine. Ranking ICP/CCP akhir ditangguh jika variant censored. Semua seed, deck instance/upgrade, artifak, resource, timeline dan hasil disimpan dalam JSONL gzip.

## Deck, Predict dan resource

Evolved menguji lima binaan (Attack/Block/Focus/Passive/draw), saiz 10/18/30, upgrade yang direkodkan dan satu pack Starting + mid-tier + Boss. Ini potensi combat dengan pemilikan tersebut, bukan kebarangkalian memperoleh pack. Komposisi berubah mengikut saiz; cohort dilution berasingan mengekalkan deck awal 12 kad dan empat upgrade, kemudian menambah Rune Strike/Rune Guard biasa sehingga 24/36. Resource menguji HP 50% serta upgrade 0%/75%.

Predict independent = sentiasa betul kali pertama; developing = sasaran 60% independent, 20% salah kemudian betul, 20% skip; struggling = 25%/25%/50%; skip = tidak mencuba Predict. Pilihan dibuat daripada stream polisi seeded; kiraan sebenar berada dalam predict-realised.csv. Ini andaian simulasi, bukan ukuran murid. Jawapan salah tidak memberi Focus/seal; betul selepas salah atau Hint memberi seal tanpa independent Focus. Assisted setup menggunakan Hint-correct.

| Medium constructed deck | Predict | W/L/censored | n | Mean turns |
|---|---|---|---:|---:|
| attack | independent | 30/0/0 | 30 | 7.13 |
| attack | developing | 30/0/0 | 30 | 7.33 |
| attack | struggling | 30/0/0 | 30 | 7.90 |
| block | independent | 30/0/0 | 30 | 15.33 |
| block | developing | 30/0/0 | 30 | 17.30 |
| block | struggling | 30/0/0 | 30 | 18.37 |
| focus | independent | 30/0/0 | 30 | 15.90 |
| focus | developing | 24/6/0 | 30 | 21.43 |
| focus | struggling | 5/25/0 | 30 | 28.10 |
| passive | independent | 20/10/0 | 30 | 17.77 |
| passive | developing | 17/13/0 | 30 | 19.30 |
| passive | struggling | 12/18/0 | 30 | 19.27 |
| draw | independent | 30/0/0 | 30 | 16.00 |
| draw | developing | 29/1/0 | 30 | 17.20 |
| draw | struggling | 25/5/0 | 30 | 18.23 |

Overview menggabungkan tiga saiz secara sama rata (30 kes, bukan 30 deck yang sama). CSV menyimpan saiz berasingan, HP, turn, plays dan baki HP musuh. Wilson interval bersyarat pada terminal results; all-case win bounds mengekalkan censoring. Seed digunakan semula antara konteks, maka pooled interval ialah deskriptif, bukan inferens murid bebas.

Always-skip tidak boleh membunuh boss dua seal melalui HP damage. Defensive Easy boleh mencapai had benchmark kerana Rage Easy tidak menambah damage. Pemain masih boleh menggunakan Predict untuk membuka seal; exhausted-bank completion juga membuka seal tanpa Focus. Tiada seal/HP dipaksa terbuka dalam simulasi.

## Perkembangan deck melalui run sebenar

600 campaign menggunakan map dua stage/10 level, offer asal, pembelian dalam Gold sebenar, Rest/upgrade dan hadiah Boss 1. Kad mesti datang daripada frozen offer yang sah. Tiada suntikan deck atau HP selepas battle. HP dibawa ke encounter seterusnya dengan healing engine sebenar. Route safe/risk menggunakan jenis node runtime dan dibahagi sama rata dalam seed cohort. Polisi Predict memperoleh seed tersendiri bagi stage/depth.

| Build/difficulty | Predict | W/L/censored | Attempts | Reached Stage 2 | Boss 2 |
|---|---|---|---:|---:|---:|
| baseline/medium | independent | 40/10/0 | 50 | 47 | 41 |
| baseline/medium | developing | 27/23/0 | 50 | 37 | 30 |
| baseline/medium | struggling | 26/24/0 | 50 | 38 | 26 |
| candidate/easy | independent | 50/0/0 | 50 | 50 | 50 |
| candidate/easy | developing | 50/0/0 | 50 | 50 | 50 |
| candidate/easy | struggling | 50/0/0 | 50 | 50 | 50 |
| candidate/medium | independent | 31/19/0 | 50 | 45 | 32 |
| candidate/medium | developing | 26/24/0 | 50 | 40 | 29 |
| candidate/medium | struggling | 13/37/0 | 50 | 26 | 16 |
| candidate/hard | independent | 0/50/0 | 50 | 2 | 1 |
| candidate/hard | developing | 0/50/0 | 50 | 0 | 0 |
| candidate/hard | struggling | 0/50/0 | 50 | 1 | 1 |

Campaign ialah combat-candidate + Economy semasa. Mystery ditolak sebelum bermula, claim-artifact questions diselesaikan betul untuk mengasingkan combat/Predict, dan Rest/prices/loot/Boss healing lama dikekalkan. Oleh itu seluruh profil SOR v1.2 belum diintegrasi. Ini bukan bukti sasaran murid Easy90/Medium70/Hard50.

## Follow-up Hard

Pilot reviewed menghasilkan Hard 0/150 dan Easy 150/150. Follow-up menggunakan 50 map seed baharu, lima draft preferences, safe/risk dan dua polisi tindakan, dengan Medium/Hard dipadankan serta Predict sentiasa independent-correct.

| Difficulty | Policy | W/L/censored | Attempts | Reached Stage 2 |
|---|---|---|---:|---:|
| medium | strategic | 34/16/0 | 50 | 46 |
| medium | beginner | 8/42/0 | 50 | 21 |
| hard | strategic | 2/48/0 | 50 | 6 |
| hard | beginner | 0/50/0 | 50 | 0 |

Hard ialah isu balance yang mesti diselesaikan sebelum menganggap calon ini siap produksi. Keputusan tidak menentukan nerf stat secara automatik: draft policy, perkembangan deck, route dan Economy lama ialah faktor bersama. Beginner masih menerima Focus helper; ia bukan model murid yang telah dikalibrasi.

## Setup payoff dan kombo

Kesemua 10 Passive serta Layered Shield, Mana Reading dan Next Chapter diuji secara paired dengan penggantian Rune Strike: saiz deck, seed, lawan, resource dan upgrade slot dipadankan. Clean deck tiada Passive lain. Cohort competing-passives mengandungi Passive sedia ada/duplicate dan tidak boleh dianggap kuasa salinan pertama. IDplayed dalam cohort itu boleh merangkumi salinan sedia ada.

Utility cadangan SOR: U=100 win +20 finalHP/maxHP -min(10,turns/2). Tiada proxy draw/Block ditambah semula. ICP ialah perubahan U dalam konteks ini. Tiga target berlainan yang mempunyai absolute paired U terbesar pada saringan clean diperluas kepada 50 seed baharu dalam dua konteks; selection bias dan multiple comparisons kekal.

| Target | Enemy | Predict | Upgrade | n | ICP U [95% t interval] | ID played/triggered |
|---|---|---|---|---:|---|---|
| ember_core | wisp | independent | true | 50 | -0.27 [-0.43,-0.11] | 34/32 |
| ember_core | dealer | independent | true | 50 | 53.54 [38.83,68.25] | 50/50 |
| growing_flame | wisp | developing | true | 50 | -0.42 [-0.61,-0.22] | 32/29 |
| growing_flame | dealer | developing | true | 50 | 0.08 [-0.20,0.36] | 50/50 |
| blazing_spirit | wisp | independent | true | 50 | -0.17 [-0.32,-0.02] | 34/34 |
| blazing_spirit | dealer | independent | true | 50 | 32.90 [19.25,46.55] | 50/50 |

ICP besar bukan interaction surplus dan bukan bukti kombo OP. Pertahanan berterusan/carry/queued draw boleh tidak mempunyai passive-trigger log; gunakan timeline Block/hand dan paired outcome. Trigger=0 boleh bermaksud tidak terdedah atau tiada log trigger untuk ongoing effect. Baki HP musuh turut direkod kerana U boleh kurang membezakan dua kekalahan.

Lima cluster artifak masing-masing menggunakan 50 seed per Predict context: Strength/multi-hit, Agility/Layered/carry, free Exhaust/Abacus, Skill/draw/Ward, Focus/Ember Core. CSV membezakan utility marginal artifak tambahan daripada CCP kad 4/8-variant dalam saringan awal. Kos memperoleh artifak tidak dianggap percuma atau sudah balanced.

## Exploit, save dan artifak

200 pasangan uninterrupted/reload semuanya menyimpan status MATCH/MISMATCH. Checkpoint meliputi Predict reservation/wrong/hint/correct, Focus arm, unpaid/committed choice, card resolve dan end turn. Perbandingan meliputi state mekanik, RNG, outcome, bayaran dan trigger; presentation refresh tidak dibandingkan. Setiap boundary menyemak UID conservation, Hand10, Passive3, satu ID aktif, resource bounds, validator dan tiada UID keluar semula daripada Exhaust.

Stress 102 rows; totals {"paid":2266,"canceled":1046,"staleRejected":2116,"forgedRejected":9064,"reloads":5742}. Trace Passive menyusun instance yang benar-benar dimiliki dan mengekalkan kos Energy; damage enemy dihentikan hanya pada boundary fixture untuk menguji sejarah panjang. Ia bukan CP encounter. Hadiah activation dikira secara live sepanjang trace, bukan daripada log UI yang terhad. Save palsu (resource, duplicate aktif, receipt) mesti ditolak; cancel dan stale-choice retry mesti atomic. Tidak semua kemungkinan save corruption diuji.

Kesemua 31 artifak mempunyai probe dalam kedua-dua build. Candidate lulus. Baseline Spool tersalah menganggap penolakan calon Draw Pile sebagai hand discard; calon terdahulu sudah menutup perbezaan itu. Tiada kad semasa yang menyediakan positive hand-discard trigger, maka pengecualian Spool diuji secara negatif sahaja. Merchant/Bram = quote checks; Ration/Purse = acquisition checks. Bonus Defend dibuktikan melalui plan/receipt/Block delta kerana calculation entry sedia ada tidak menyertakan artifact ID. Probe Chance Die meliputi enam muka. Nilai Economy-owned Seal/Purse/Contract baharu tidak diaktifkan.

## Semakan, reproducibility dan batas

Semakan bebas mengenal pasti ralat polisi node battle, seal telemetry ketika bank exhausted, source hash yang tertinggal shared policy dan gift ledger yang boleh luput daripada log. Ujian regresi membuktikan pembetulan. Run reviewed menggunakan pembetulan itu. Source snapshots kini menyertakan deep/decks/growth/runner/combat/candidate/loader, serta engine provenance daripada loader.

Penyelenggaraan workspace memadam checkout/raw sebelum handoff. Baseline dipulihkan daripada patch tersimpan; harness dan semua cohort utama diulang semula. Bukti muktamad ialah raw yang dijana semula ini, dengan source hash baharu. Log aggregate sebelum pemulihan disimpan untuk perbandingan; tiada raw lama yang hilang dipersembahkan sebagai tersedia. Pilot campaign dengan ranking route salah dikecualikan.

maxWork ialah kiraan harness/API/preview, bukan instrumentation semua langkah atomik dalaman. Had 100 cycles/500 plays/10,000 work menghasilkan censoring dan tidak menukar game murid. Polisi membaca hand/intent/pilihan yang terdedah; tiada hidden draw order digunakan. Focus helper boleh mengatasi pilihan random/beginner; Burning Page mengambil calon pertama dan swap Passive menggunakan ranking ringkas. Ini bukan search optimum/RL dan bukan simulasi semua outcome.

Master perlu menggabungkan profil Hard dengan Map/Economy, menilai kebolehpercayaan Focus dan kos setup, serta menjalankan playtest murid. Tiada angka produksi ditala secara senyap dan tiada dakwaan semua loop telah dibuktikan tiada. MODEL.zip tidak tersedia dan tidak digunakan; PDF/soalan tidak diubah.
