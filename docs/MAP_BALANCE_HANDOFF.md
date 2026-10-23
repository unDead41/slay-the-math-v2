# Map balance v1.2 — handoff sejarah kepada Master

Hasil terkini: [handoff v1.3](MAP_BALANCE_V1_3_HANDOFF.md). Dokumen ini mengekalkan keputusan dan had audit v1.2 pada kod asal.

23 Oktober 2026 · branch `balance/map` · base `2800f9aeba5ed594e6ef3f991bcf4dfa498a5de7` · game 2.24.0.

Audit meliputi **100 seed, 200 map, semua 5,500 laluan per stage dan 77,384 pasangan laluan dua stage**. Pilot engine melaksanakan **800 campaign sampel + 300 campaign diagnostik**, tanpa error/censor. Daripada sampel, **320/800 menang penuh (40%)**. Ini hasil polisi sintetik pada Challenge semasa; sasaran murid Easy 90% / Medium 70% / Hard 50% belum disahkan.

Kontrak map, gameplay, save, kad, musuh dan harga dikekalkan. CP berada dalam alat/laporan pembangunan sahaja. Tiada merge/push ke main. [SOR Map v1.2](../modules/map/SOR/04_MAP_COMBAT_POWER.md) ialah pemilik definisi; [README alat](../tools/balance/map/README.md) menerangkan ulangan.

## Hasil dan lokasi

[Pakej ZIP untuk Master](../reports/map-balance/STM_Map_Balance_v1_2_base2800f9a.zip) mengandungi SOR, alat, CSV/JSON, konteks dan bukti ujian. [Bundle sejarah asal](../reports/map-balance/ORIGINAL_AUDIT_HISTORY.bundle) disediakan berasingan bersama checksum dalam manifest pakej.

| Fail | Kegunaan Master |
| --- | --- |
| [seeds.csv](../reports/map-balance/base-2800f9a/seeds.csv) / [JSON](../reports/map-balance/base-2800f9a/seeds.json) | 200 rekod map/stage: laluan mudah/median/sukar, tekanan, CP provisional dan keadaan masuk boss |
| [routes.csv](../reports/map-balance/base-2800f9a/routes.csv) / [JSON](../reports/map-balance/base-2800f9a/routes.json) | Semua 5,500 laluan: node, probability, combat/Elite, recovery, Shop dan coverage engine |
| [campaigns.csv](../reports/map-balance/base-2800f9a/campaigns.csv) / [JSON](../reports/map-balance/base-2800f9a/campaigns.json) | W/N dan CP full-run setiap seed, lapan trial setiap seed |
| [Pasangan laluan CSV](../reports/map-balance/campaign-route-pairs/pairs.csv) / [JSON](../reports/map-balance/campaign-route-pairs/pairs-index.json) | Semua 77,384 gabungan Stage 1–2, anggaran dengan nominal carry/recovery |
| [Ringkasan pasangan setiap seed](../reports/map-balance/campaign-route-pairs/seeds.json) | Pasangan mudah/median/sukar setiap seed; kedua-dua routeId dirujuk semula ke routes |
| [maps.json](../reports/map-balance/base-2800f9a/maps.json) | 200 snapshot penuh node/edge dan hash |
| [trials.json](../reports/map-balance/base-2800f9a/trials.json) | RunSeed tepat, route plan, actual room trace, HP/Gold/deck/artifact/RNG dan hasil |
| [nodes.json](../reports/map-balance/base-2800f9a/nodes.json) | Lawatan dan kematian node pilot, dengan denominator conditional |
| [summary.json](../reports/map-balance/base-2800f9a/summary.json) | Totals, interval, coverage, budget dan had |
| [source-differences.json](../reports/map-balance/base-2800f9a/source-differences.json) | Runtime vs calon Balance v1.2: 40 kad, 12 musuh, 31 artifact, 15 event |
| [context.json](../reports/map-balance/base-2800f9a/context.json) / [manifest](../reports/map-balance/base-2800f9a/manifest.json) | Versi, semua seed, polisi, parameter dan fingerprint sumber/input |
| [Semakan eksport bebas](../reports/map-balance/validation/independent-export-check.json) | CSV/JSON, graph, probability, hash, coverage dan pengiraan semula 232,152 peak pasangan |

JSON pasangan dibahagi kepada empat fail melalui `pairs-index.json` bagi memenuhi had penghantaran connector 16 MiB; semua 77,384 rekod dikekalkan. CSV kekal satu fail.

Primary contextId: `5ad57aec8aa32642bb80014119c8085c1e501b5f35e8d212cb5a543a34aec9d9`.
Paired-estimate contextId: `7ef1b238b820f097e32f80c57c7f3e81bef6dba197dc6e3ea83162cbd7179e0d`.
Kod pilot dibekukan pada `8f44451fd3a9e90a0cdbf76bd188aa04c682ae71`. Commit penghantaran turut menambah dokumen, alat semakan bebas dan anggaran pasangan, dengan fingerprint berasingan.

Penghantaran remote menggunakan sambungan GitHub kerana Git CLI runtime tiada credential. Commit remote boleh mempunyai metadata/sejarah berbeza daripada commit audit tempatan; fingerprint fail mengesahkan kandungan. `reports/map-balance/ORIGINAL_AUDIT_HISTORY.bundle` yang dikongsi bersama ZIP Master mengekalkan sejarah audit asal termasuk commit 8f44451. Selepas memiliki base repo, import tanpa menukar branch sendiri dengan `git fetch ORIGINAL_AUDIT_HISTORY.bundle refs/heads/balance/map:refs/heads/review/map-audit-original`.

## Struktur dan liputan

Semua 200 map valid; semua edge maju satu level dan semua laluan melalui Mystery 5, Rest 9, Boss 10. Generator 1.0.0/katalog 1.1.0 serta kuota 3–5 pintu masuk tidak berubah. Route lama 1/2 dan snapshot tersimpan tidak dijana semula.

| Pemerhatian | Stage 1 | Stage 2 |
| --- | ---: | ---: |
| Laluan lengkap | 2,846 | 2,654 |
| Map yang memaksa sekurang-kurangnya satu Elite | 22 | 24 |
| Map tanpa sebarang akses Rest sebelum level 9 | 36 | 26 |
| Laluan tanpa Shop | 1,551 | 1,467 |
| Laluan tanpa Rest awal | 2,120 | 1,844 |
| Laluan dengan ≥2 Elite pada node berturut-turut | 512 | 467 |
| Elite berturut-turut maksimum | 3 | 3 |

Semua 200 map mempunyai sekurang-kurangnya satu laluan tanpa Rest awal. Ini mematuhi kontrak sekarang; kuota Rest seluruh map boleh digunakan semuanya pada level 9. BAL-25 calon yang menolak forced Elite memerlukan keputusan Master sebelum generator baharu dibina.

Setiap map mempunyai 7–88 laluan. Produk laluan Stage 1 × Stage 2 setiap seed menghasilkan 77,384 pasangan sah (maksimum 3,081 bagi satu seed). Kedua-dua enumerasi struktur mempunyai coverage 100%. Gabungan dua stage menggunakan tiga kelas roster runSeed yang sama, bukannya menggabungkan roster bebas yang tidak boleh dicapai.

Pilot+diagnostik memulakan 1,309 routeId berbeza, **23.8%** daripada 5,500; termasuk kematian pada prefix laluan. Semua sepuluh node benar-benar dimasuki bagi 966 routeId, **17.56%**. Tiada dakwaan semua 77,384 pasangan dilawan melalui engine. Route Stage 2 yang hanya dirancang dan tidak dicapai tidak dikira sebagai coverage stage.

## Konteks dan keputusan engine

Deck mula: Rune Strike ×3, Weak Point ×3, Rune Guard ×2, Flash Ward ×2, Quick Study ×1, Read Ahead ×1. Mula 60 HP/80 Gold, Challenge dengan artifact sebenar. Polisi `visible-greedy-feedback-v1` menggunakan hand, intent dan pelan kad terlihat; jawapan dipilih antara pilihan terlihat dan feedback sah. Polisi ini tidak membaca jawapan betul atau draw order. Ia bukan model kebolehan murid.

Laluan dipilih seragam pada pintu masuk dan setiap edge keluar. Lapan runSeed uint32 bagi setiap ID katalog disampel dengan replacement, `samplerSeed=42`; kesemuanya disimpan dalam trials. Setiap campaign membawa HP, deck, Gold, upgrade dan artifact sebenar ke Stage 2. Rest/reward/Shop/Mystery/seal/boss diselesaikan oleh API engine.

| Scope pilot | Menang / trial sah | Kadar mentah | Wilson 95% | CP provisional |
| --- | ---: | ---: | --- | ---: |
| Campaign dua stage | 320/800 | 40.00% | 36.66–43.43% | 2,568.10 |
| Stage 1 dari New Run | 375/800 | 46.875% | 43.44–50.34% | 2,124.07 |
| Stage 2, conditional sampai | 320/375 | 85.33% | 81.39–88.56% | 447.77 |

425 run kalah sebelum Stage 2; ia bukan 425 kekalahan Stage 2. `STM-024` tiada arrival Stage 2 dalam lapan pilot, maka skor Stage 2 `null/NOT_SIMULATED`. Perbezaan kadar antara stage tidak membuktikan Stage 2 mudah: entry deck/artifact sudah bertambah dan hanya survivor Stage 1 masuk ke denominator.

Diagnostik mendapat 134 kemenangan dan 166 kekalahan daripada 300 campaign; ia dikecualikan daripada kadar/CP pilot. Diagnostik memaksa pilihan route anggaran mudah/median/sukar pada kedua-dua stage, dengan runSeed/roster berbeza antara rank. Perbandingan itu bukan A/B sebab-akibat route.

Semua 1,100 trial selesai sebelum budget 1,800 saat; 562,850 panggilan API engine. Error, invalid state dan censor = 0. Had per campaign/combat: 10,000 API actions, 100 giliran combat, 500 card plays per combat. Trial yang terkena had akan menjadi censored, bukan kalah pemain.

## Tekanan, recovery dan keadaan masuk boss

| Ukuran pilot | Boss Stage 1 | Boss Stage 2 |
| --- | ---: | ---: |
| Run sampai boss | 477 | 328 |
| HP masuk purata | 35.53 | 42.74 |
| HP masuk median | 34 | 44 |
| Julat HP masuk | 13–65 | 13–65 |
| Saiz deck masuk purata | 18.51 | 23.77 |
| Gold masuk purata | 171.62 | 271.75 |
| Kematian di boss | 102 | 8 |

Max HP boleh meningkat melalui artifact; 65 bukan kesilapan terhadap HP mula 60. Fingerprint deck, upgrade, artifact dan RNG setiap kemasukan boss ada dalam trace. Purata ialah merentas arrival pilot, bukan purata tanpa pemberat bagi summary seed.

Daripada 425 kekalahan Stage 1: 247 berlaku pada Elite, 102 boss, 73 battle biasa dan 3 extra combat dalam Mystery (`roomType=event`). Daripada 55 kekalahan Stage 2: 29 Elite, 8 boss, 17 battle dan 1 Mystery combat. Ini alasan memeriksa tekanan sebelum recovery dan keuntungan artifact selepas Elite, bukan bukti statistik sebab-akibat bahawa satu jenis room perlu dilemahkan.

Tekanan struktur menganggarkan fixed 12 damage/6 Block pemain setiap giliran dan kredit Rest 12. Debt tidak negatif; skor ialah peak debt, dipuratakan merentasi tiga kelas roster sah. Ia boleh melebihi Max HP dan bukan kehilangan HP yang disimulasikan. Formula, pengecualian dan median diterangkan dalam SOR.

Anggaran pasangan meneruskan debt Stage 1, menolak nominal stage-clear heal 12, kemudian memproses semua room Stage 2. Peak awal dikekalkan. Recovery terhad kepada debt yang wujud; tiada negative debt disimpan. Ini mengelakkan penjumlahan dua peak secara salah dan masih mengecualikan peningkatan deck/artifact. Semua pasangan mempunyai CP `null`.

Lima jurang tekanan route per stage terbesar, untuk triage Master:

| Seed | Stage | Tekanan minimum | Maksimum | Jurang |
| --- | ---: | ---: | ---: | ---: |
| STM-018 | 2 | 54.33 | 179.67 | 125.33 |
| STM-100 | 2 | 51.00 | 175.00 | 124.00 |
| STM-064 | 2 | 58.33 | 175.00 | 116.67 |
| STM-048 | 2 | 51.00 | 159.67 | 108.67 |
| STM-091 | 2 | 54.00 | 159.67 | 105.67 |

Ini ranking anggaran; reward, upgrade dan artifact boleh mengubah urutan kesukaran sebenar. Ringkasan per seed menyimpan routeId mudah/median/sukar, bukan sekadar satu nombor tanpa rujukan laluan.

## Formula CP dan batas penggunaannya

`p_hat=(W+0.5)/(N+1)`; `CP=1000 × ln(1/p_hat) / ln(1/0.70)`.

CP lebih tinggi bermaksud risiko kalah lebih tinggi dalam konteks yang sama. 1000 ialah anchor skala pada probability 0.70, bukan threshold Medium yang sudah terbukti. N=0 memberi null; error/censor yang belum menyelesaikan scope memberi `UNSCORABLE`; Wilson probability bawah 0 memberi CP atas tidak terbatas yang direkod sebagai null + flag. Stage yang sudah selesai tidak dibatalkan oleh error/censor kemudian.

Setiap seed hanya lapan pilot; interval luas dan ranking belum stabil. Route/pair mempunyai nilai tekanan, tetapi belum CP setara daripada entry-bank replay. CP map tidak sama unit dengan ICP/CCP kad dalam Balance v1.2; jangan campur atau jumlahkan kedua-duanya.

## Perbezaan Balance v1.2 dengan runtime

Pakej `STM_Balance_SOR_v1_2_20261023.zip` dibaca sebagai calon, bukan konfigurasi live. Baseline pakej af12035/game 2.23.1; base tugasan ialah 2800f9a/game 2.24.0. Semua entry manifest pakej disahkan. SHA-256 archive `f35d4a5b7714182b7e020a95f4a022ec5269db6cc20e22de784953909a51ce47`; member JSON `90c7b23a224159d6fc9f6e038801f3414d4ff4328ed663be85e10bed6e7a796f`.

| Perkara | Runtime sebenar | Calon v1.2 / tindakan pemilik |
| --- | --- | --- |
| Difficulty | Learn/Challenge sahaja | Easy/Medium/Hard belum diimplementasi; Combat/Master bekalkan adapter versioned, berasingan daripada mode |
| HP/Gold mula | 60/80 | Easy 75/100, Medium 60/80, Hard 55/70 |
| Rest / heal peralihan stage | 12/12 | Easy 20/20, Medium 15/12, Hard 12/8 |
| Rage | +2 setiap 6 giliran | Medium +1/6; Easy/Hard juga berbeza; jangan anggap profile tersedia |
| Elite | Template +10 HP, +2 intent damage | Nilai calon sudah tier-adjusted; elakkan double bonus apabila adapter dibina |
| Boss HP | 70 / 95 | Medium 90 / 125; milik Combat, belum digunakan di sini |
| Learn | Damage ×0.7 | Jangan gandakan modifier ini dengan difficulty Easy secara tersilap |
| Kad | 40 energy/value semasa sepadan snapshot pakej | Kos/Focus/upgrade/Strength/Agility calon belum diterapkan; senarai setiap kad dalam source-differences |
| Normal/Elite | Beberapa musuh berkongsi mekanik yang sama | Calon membezakan pola/HP/stat; nama/visual berbeza belum bermaksud tekanan berbeza |
| Shop Boss artifact | Boleh dibeli Stage 1 | Calon unlock Stage 2; Economy/Master perlu A/B kesan terhadap carry |
| Loot | Pilihan pool unik secara seragam | Cadangan rarity/support weighting belum aktif |
| Mystery ME10 removal minimum | 1 kad | Calon 10; Economy/Mystery putuskan kesan deck thinning |
| Mystery timer | Masa base runtime | Multiplier difficulty calon belum digunakan; jam bot bukan masa murid |
| Forced Elite | 46 map; sah ikut kuota sekarang | Master selaraskan calon BAL-25 dengan kontrak map |

HP efektif runtime → calon Medium: bat 30→28, wisp 30→30, beetle 36→34, knight 54→54, shard 54→56, weaver 30→44, shade 48→48, mimic 48→46, golem 58→70, reaper 58→72, sentinel 70→90, dealer 95→125. Pola dan nilai penuh berada dalam source-differences; tiada angka baharu diterapkan pada game oleh branch ini.

## Cadangan dan kesan yang perlu diuji

| Keutamaan/pemilik | Cadangan | Kesan yang dinilai; status |
| --- | --- | --- |
| 1 — Master + Map | Tentukan sama ada perlu pilihan mengelak Elite mengikut difficulty; triage 46 map forced Elite dan chain 2–3 | Boleh mengurangkan risiko wajib sebelum recovery. Belum diuji sebagai generator baharu; kuota/save sedia ada mesti kekal |
| 1 — Master + Combat | A/B calon stat pada entry deck/HP/artifact yang sama; fokus Stage 1 Elite sebelum menaikkan boss HP | Bezakan masalah encounter, deck dan route. Pilot sekarang mempunyai 247 kematian Stage 1 Elite; bukan lesen terus menukar stat |
| 2 — Map + Recovery owner | Uji akses Rest sebelum level 9 untuk 62 map tanpa recovery awal | Mengurangkan debt awal jika akses benar-benar sampai. Semua Rest kini level 9 pada map tersebut; menjamin Rest awal memerlukan reka graph/Rest bersama versi baharu, bukan menukar type satu node level 9 |
| 2 — Economy + Master | A/B akses Boss artifact Stage 1 dan pembelian/removal polisi yang lebih baik | Boleh mengubah lonjakan kuasa dan Gold carry; kesan kadar menang belum diukur |
| 2 — Combat/Recovery | Uji calon Medium Rest 15 berbanding runtime 12 | Tambahan sehingga 3 HP setiap heal yang tidak overflow; tekanan sebelum Rest kekal. Magnitud pada CP belum diuji |
| 3 — Master | Tambah polisi Attack/Guard/Tactic, variasi deck dan bank entry Stage 2 yang distandardkan | Uji kestabilan ranking dan pisahkan survivor bias daripada kesukaran intrinsik Stage 2 |

Tiada cadangan di atas dianggap keputusan balance akhir. Jalankan semula analyzer dengan context/output baharu selepas domain lain disatukan; jangan menggunakan CP baseline ini untuk calon stat yang belum diimplementasi.

## Fail/parameter yang berubah dan pengesahan

- Alat baharu: `tools/balance/map/` (enumerasi, pressure, CP, polisi, replay, sampler/export/source audit, input rujukan dan README), `tools/balance/map-campaign-pairs.cjs`, `tools/verify-map-balance-report.py`.
- Ujian baharu: `tests/map-balance-{structure,replay,export,source}.test.cjs`.
- Output: `reports/map-balance/base-2800f9a/`, `campaign-route-pairs/`, `validation/`.
- Dokumen: Map SOR 04, indeks modul/root, SOR 09/12, keputusan/changelog, pelan/ledger dan handoff ini.
- Parameter audit sahaja: 12 damage, 6 Block, Rest credit 12, reference probability 0.70; lapan pilot/seed, sampler 42, tiga diagnostik/seed dan had benchmark yang dinyatakan. Semua difingerprint. `dist`, config gameplay, generator/data seed dan package.json mempunyai diff kosong berbanding base.

| Semakan sebenar | Hasil |
| --- | --- |
| `node --test tests/map-balance-*.test.cjs` | 19/19 lulus; determinisme, legal edges, visible-only policy, censoring, denominator, exact Wilson boundary dan provenance |
| Full root `node --test --test-concurrency=2 tests/*.test.cjs` | 491/491 lulus, 0 skipped, selepas pembetulan |
| `npm run test:maps` | 7/7 lulus; 100 seed/200 unique layouts/12 PNG hash valid |
| `npm run check` dan syntax alat | Lulus |
| `npm run build:prod` dan scan output | Lulus; 0 rujukan audit/CP dan tiada direktori audit dalam build pemain |
| Verifier Python bebas | PASS: 185,500 sel CSV, 200 graph, 5,500 route, manifest/source hashes, trace prefix, denominator, 77,384 pair dan 232,152 peak dikira semula |
| Review kod bebas | 4 penemuan dibetulkan dengan regressions; 5 kes RED sebelum fix, 19/19 GREEN selepasnya; tiada Critical |

Log sebenar disimpan dalam [validation](../reports/map-balance/validation/). Environment baharu memerlukan jsdom di scratch dan sharp daripada runtime untuk ujian sedia ada; tiada perubahan dependency manifest. Percubaan root parallel pertama kehilangan proses UI tanpa assertion (463/464); concurrency 2 menyelesaikan full suite, termasuk DOM UI. Ini bukan dakwaan semua browser/peranti diuji.

## Belum diuji dan langkah Master

Calon Easy/Medium/Hard belum aktif, tiada playtest murid, tiada browser manual baharu, tiada exhaustive deck/artifact/event/draw RNG, tiada matched-deck ICP/CCP kad, tiada A/B generator atau stat calon dan tiada CP route/pair yang dikalibrasi. Anggaran pasangan tidak mensimulasikan pertumbuhan deck atau carry artifact.

Master boleh mengambil SOR + context + source-differences + CSV/JSON ini, menggabungkan versi combat/ekonomi secara jelas, kemudian menjalankan semula baseline yang sama sebelum membandingkan perubahan. Pengesahan 90%/70%/50% hendaklah menggunakan kemenangan satu run dua stage oleh murid pada difficulty sebenar; keputusan pilot ini kekal rujukan pembangunan.
