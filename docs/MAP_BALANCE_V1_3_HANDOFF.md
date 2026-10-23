# Map Balance v1.3 — handoff kepada Master

23 Oktober 2026 · branch `balance/map` · runtime base `2800f9aeba5ed594e6ef3f991bcf4dfa498a5de7` · game 2.24.0. Enam penambahbaikan yang diminta telah dilaksanakan dalam alat pembangunan. Kontrak dua stage/sepuluh level, Mystery 5/Rest 9/Boss 10, kuota, snapshot, save, stat, harga dan UI pemain dikekalkan. CP tidak dipaparkan kepada pemain. Tiada integrasi ke main oleh kerja ini.

**Bukti baharu: 3,000 campaign penuh + 3,525 replay stage berpadanan = 6,525 trial engine.** Semua selesai, tanpa error, censor atau invalid state; 2,655,643 panggilan API sebenar. Semua 800 kawalan mengekalkan status dan hash tindakan v1.2. Ini keputusan polisi sintetik pada Challenge baseline, bukan kadar kemenangan murid atau hasil calon Easy/Medium/Hard.

Pemilik definisi: [SOR Map v1.3](../modules/map/SOR/04_MAP_COMBAT_POWER.md). Arahan: [README eksperimen](../tools/balance/map-advanced/README.md). [V1.2](MAP_BALANCE_HANDOFF.md) kekal sejarah, termasuk semua snapshot/urutan 5,500 route dan 77,384 pasangan struktur dua stage; fail asal tidak diubah.

## Apa yang berubah dan hasilnya

| Penambahbaikan | Pelaksanaan dan bukti |
| --- | --- |
| Polisi laluan | Empat polisi adaptif: elak Elite, kejar reward, cari Shop dan recovery pada HP ≤50%; hanya kategori/edge/HP/Gold terlihat. Pilihan dan skor direkod setiap langkah. |
| Keadaan setara + ulangan | 800 entry Stage 1 dan 375 entry Stage 2 sebenar; setiap entry dimainkan pada tiga rank route dengan deck/HP/Gold/artifact/state/jam/RNG awal yang sama. 1,175 triplet lengkap. |
| Tekanan sebelum recovery | Semua 46 forced-Elite dan 62 map tanpa Rest sebelum 9 ditanda; setiap Elite/penalti HP Mystery mempunyai HP, sejarah/jarak Rest, kematian dan heal sebenar. |
| Risiko–ganjaran | Delta sebenar HP/Gold/deck/upgrade/artifact, affordability/pembelian/perbelanjaan Shop, peluang upgrade yang dilepaskan dan keadaan masuk boss. |
| Predict/difficulty | Feedback, high 85%, low 25% dan skip melalui API Predict sebenar. Oracle high/low didedahkan. Input difficulty calon telah disemak; adapter campaign gabungan belum diintegrasikan. |
| Punca + regresi | Flag 200 map, CP/Wilson bercontext, paired contrasts, coverage semua route, pemeriksaan hash/rekod/denominator dan comparator yang menolak perubahan kaedah. |

## Polisi laluan: keputusan campaign

Setiap seed menggunakan lapan uniform dan empat setiap polisi adaptif. RunSeed sama dipadankan mengikut repetition. Uniform bagi **400 pasangan yang dikongsi menang 152/400 (38%)**; uniform keseluruhan lapan repetition menang 320/800 (40%). Kolum delta menggunakan kawalan berpasangan 400 sahaja.

| Polisi feedback | Menang penuh | Kadar | Delta berpasangan vs uniform |
| --- | ---: | ---: | ---: |
| Uniform, semua repetition | 320/800 | 40.00% | — |
| Elak Elite | 232/400 | 58.00% | +20.00 mata peratus |
| Kejar reward | 108/400 | 27.00% | −11.00 mata peratus |
| Cari Shop | 232/400 | 58.00% | +20.00 mata peratus |
| Recovery ikut HP | 251/400 | 62.75% | +24.75 mata peratus |

Ini menunjukkan keputusan laluan mengubah hasil bot dengan ketara dalam konteks ini. Polisi reward mengumpulkan artifact/upgrade, tetapi lebih ramai gagal sebelum memanfaatkannya. Contohnya, survivor polisi reward masuk boss Stage 1 dengan purata 3.74 artifact dan 2.59 upgrade, tetapi hanya 25.83 HP; health-recovery 1.89 artifact/0.63 upgrade dan 44.35 HP. Angka arrival ini conditional, bukan kesan sebab-akibat satu reward.

Health-recovery mencatat 941 lawatan Rest: 835 tindakan heal dan 106 upgrade; purata pemulihan sebenar 10.51 HP setiap lawatan. Ia juga melawat Shop 774 kali, dengan 24 lawatan tiada satu kad mampu dibeli. Cari Shop memberi 835 lawatan/17 tiada kad mampu dibeli; lawatan tambahan tidak menjamin pembelian atau kemenangan.

## Tiga rank daripada entry yang sama

Rank dipilih menggunakan tekanan struktur v1.2 sebelum hasil dimainkan. Keadaan sumber tidak diedit untuk menyamakan survivor.

| Scope entry | Mudah (anggaran) | Median | Sukar (anggaran) |
| --- | ---: | ---: | ---: |
| Stage 1, 800 entry | 600/800 (75.00%) | 393/800 (49.13%) | 202/800 (25.25%) |
| Stage 2, 375 survivor entry | 348/375 (92.80%) | 321/375 (85.60%) | 300/375 (80.00%) |

Ini kadar clear stage, bukan menang satu run penuh. Stage 2 ialah bank survivor uniform; jangan membandingkan terus 92.8% dengan Stage 1 seolah-olah entry sama. `STM-024` tiada survivor Stage 2 daripada lapan kawalan, maka ketiga-tiga CP Stage 2 kekal null. Sebanyak 425 slot Stage 2 yang diminta tidak direka.

Lima map mempunyai point inversion mudah/sukar: STM-008/Stage 2, STM-041/2, STM-053/2, STM-085/2 dan STM-086/1. N per map hanya sehingga lapan, dan interval luas; flag ini untuk triage, bukan bukti ranking akhir terbalik. Urutan room/reward boleh mengubah penggunaan RNG selepas entry walaupun state/RNG awal sama.

## Recovery dan penalti Mystery

Laporan driver menggunakan 2,400 campaign feedback sahaja: 3,722 kemasukan stage dan 844 kematian sebelum Rest pertama. Terdapat 1,131 window penalti HP Mystery yang diperhatikan, dengan 168 kematian sebelum Rest seterusnya. Ini hubungan berurutan, bukan dakwaan penalti itu sendiri menyebabkan semua kematian.

| Populasi map | Kemasukan stage feedback | Mati sebelum Rest pertama | Window penalti HP Mystery / mati sebelum Rest |
| --- | ---: | ---: | ---: |
| 46 forced-Elite | 841 | 191 | 220 / 35 |
| 62 tanpa Rest sebelum 9 | 1,226 | 333 | 414 / 79 |

Populasi ini bertindih; jangan menambahnya sebagai cohort bebas. `recovery-windows` turut mengandungi senario Predict selain feedback dengan label berasingan. Rest reachable, Rest dicapai, pilihan heal dan HP pulih ialah empat perkara berbeza. Gold/Max HP serta transaksi Mystery lain kekal dalam trace/risk–reward; window khusus ini melaporkan kehilangan HP sebenar.

## Predict dan had Focus

Semua senario di bawah menggunakan health-recovery dan **200 runSeed yang sama**. Kawalan feedback ialah dua repetition pertama, bukan keseluruhan 400 run health-recovery.

| Profil | Menang penuh | Kadar | Betul cubaan pertama diperhatikan |
| --- | ---: | ---: | ---: |
| Feedback, cuba jawapan belum dicuba | 130/200 | 65.00% | 24.18% |
| High, target 85%, satu cubaan | 154/200 | 77.00% | 84.74% |
| Low, target 25%, satu cubaan | 94/200 | 47.00% | 25.22% |
| Skip Predict | 0/200 | 0.00% | Tidak dicuba |

High/low membaca key kanonik sebagai model pengetahuan sintetik yang dinyatakan; ia bukan ujian murid. Feedback meneruskan cubaan berpandukan feedback; low menutup selepas salah, maka perbezaannya bukan probability betul sahaja. Mystery/artifact meneruskan polisi asal.

Predict juga membuka seal boss; owner damage runtime mengekalkan sealed boss sekurang-kurangnya 1 HP selepas damage biasa. Skip menguji prerequisite Predict/seal bersama Focus. Perubahan high/low turut mengubah timing seal, exposure soalan dan RNG/reward kemudian. **Jangan menganggap hasil ini sebagai ukuran sebab-akibat Focus sahaja.** Kontras polisi Focus berasingan ialah permintaan kepada Combat/Master.

## Dataset, formula dan coverage

ContextId: `50111071981eee02c9f82455533f432fa95e6227920bde8c58503afdd6cd398b`.

`p=(W+0.5)/(N+1)`; `CP=1000 × ln(1/p)/ln(1/0.70)`, dengan Wilson95 daripada W/N mentah. Null membezakan belum diuji/tiada entry/unresolved daripada kalah sah. Zero-win mempunyai upper CP tidak terbatas, disimpan null + flag. Semua CP provisional dan bergantung pada deck/polisi/mode/versi/entry scope. Ia tidak setara dengan ICP/CCP kad. Deck merit hanya proksi polisi.

| Fail dalam [v1.3](../reports/map-balance/v1.3/) | Kegunaan |
| --- | --- |
| [policy-summary.csv](../reports/map-balance/v1.3/policy-summary.csv), [policy-stage-summary.csv](../reports/map-balance/v1.3/policy-stage-summary.csv), [policy-comparisons.csv](../reports/map-balance/v1.3/policy-comparisons.csv) | Campaign/stage, Wilson/CP, boss entry, recovery/Shop dan pasangan shared-seed |
| [predict-summary.csv](../reports/map-balance/v1.3/predict-summary.csv) | Empat profil berdenominator 200 dengan disclosure oracle/seal |
| [seed-policy-summary.csv](../reports/map-balance/v1.3/seed-policy-summary.csv) | 1,000 baris seed × stage × lima polisi feedback |
| [matched-route-summary.csv](../reports/map-balance/v1.3/matched-route-summary.csv), [matched-contrasts.csv](../reports/map-balance/v1.3/matched-contrasts.csv) | 600 rank rows termasuk tiga null Stage 2; 2,350 contrasts entry berpasangan |
| [route-coverage.csv](../reports/map-balance/v1.3/route-coverage.csv) | Semua 5,500 route, rancangan/lawatan/prefix dan coverage penuh berasingan |
| [recovery-windows.csv](../reports/map-balance/v1.3/recovery-windows.csv), [risk-reward.csv](../reports/map-balance/v1.3/risk-reward.csv), [difficulty-drivers.csv](../reports/map-balance/v1.3/difficulty-drivers.csv) | Tekanan, transaksi sebenar dan punca/flag setiap map |
| [entry-bank.json](../reports/map-balance/v1.3/entry-bank.json) | 1,175 keadaan: source trial, HP/Gold/deck/artifact/hash/jam/stream RNG |
| [trials-index.json](../reports/map-balance/v1.3/trials-index.json), `trial-*.jsonl` | Semua 6,525 trial dan state penuh sumber dalam 43 shard ≤4 MiB, dengan hash setiap rekod |
| [context.json](../reports/map-balance/v1.3/context.json), [manifest.json](../reports/map-balance/v1.3/manifest.json), [analysis-provenance.json](../reports/map-balance/v1.3/analysis-provenance.json) | 100 seed, runSeed sebenar dalam raw, parameter/protokol/sumber input dan report code |
| [summary.json](../reports/map-balance/v1.3/summary.json), [quality-gate.json](../reports/map-balance/v1.3/quality-gate.json) | Totals dan penerimaan integriti sahaja |

Setiap jadual mempunyai JSON dengan nama sama. Struktur kekal 100%/5,500 route. Campaign memulakan 1,545 routeId penuh yang diketahui dan melawat sepuluh node pada 1,321 routeId; prefix adaptif yang mati awal kekal tanpa route penuh rekaan. Matched replay merancang 597 routeId target (Stage 2 hanya 99 map), dan melawat sepuluh node pada 580. Gabungan kedua-dua batch melawat sepuluh node pada 1,656/5,500 route (30.11%). Memasuki sepuluh node tidak semestinya menang boss. Semua route lain masih mempunyai analisis struktur/anggaran, tanpa CP route rekaan.

## Input domain terkini dan tindakan Master

[Readiness penghantaran](../reports/map-balance/integration-readiness-v1.3.json) merekod recheck selepas batch bermula. Combat kini menyediakan Node candidate profiles pada `balance/combat` commit `1bf66320ed275755d25734ad907395443f71176f`; loader/candidate dan SOR/deep validation disemak. Economy telah maju ke `df53579593937c2d71fcb6bb96409036ad575070`. Nilai calon kedua-dua domain kekal input; tiada fail gameplay daripada branch tersebut ditindih ke branch map.

Full Easy/Medium/Hard **belum diintegrasikan ke worker map**: Combat menyatakan overlay bukan drop-in player data dan campaignnya menggunakan ekonomi semasa serta decline Mystery; Economy masih memerlukan HP/Combat penuh. Readiness dalam context ialah snapshot preflight, ketika Combat belum tersedia. Jangan menamakan hasil baseline ini sebagai hasil candidate difficulty. Sasaran murid Easy 90% / Medium 70% / Hard 50% kekal UNMEASURED.

| Keutamaan / pemilik | Cadangan dan kesan yang hendak diuji |
| --- | --- |
| Master + Combat + Economy | Pin loader/definisi/difficulty/versi dan satukan HP, Gold, Rest, Focus, artifact, bonus Elite serta mode. Run matrix map baharu pada adapter campaign gabungan; jangan double bonus Elite atau gandakan Learn × Easy secara tersilap. |
| Map + Master | Uji akses recovery lebih awal dan pilihan mengelak Elite pada subset 46/62 map. Kesan CP/win selepas perubahan graph belum diukur; perlu versi generator baharu dengan kuota dan snapshot lama dikekalkan. |
| Combat + Master | Bezakan nilai Focus daripada seal, dan uji ulang risiko Elite pada deck/artifact entry sama sebelum menaik/menurunkan stat. Tiada nerf/buff automatik daripada ranking kecil. |
| Economy + Master | Semak Shop yang tiba sebelum mampu berbelanja, availability Boss artifact Stage 1 dan peluang upgrade yang hilang kerana heal. Guna actual purchase/spend/boss entry, bukan nominal Gold sahaja. |
| Master | Tambah deck/archetype dan polisi combat lain, kemudian cohort murid sebenar untuk 90/70/50. Bot ini tidak menganggar kebolehan matematik atau masa menjawab murid. |

## Ujian, pemulihan dan batas

50 ujian map audit lulus; map module 7/7 dan validation 100 seed/200 layout unik/12 PNG hash lulus; syntax, build portable dan production lulus. Scan production menemui sifar rujukan audit/Combat Power. Full root selepas pembetulan review **522/522 lulus, 0 skipped**; review bebas dan log penuh direkod dalam [validation v1.3](../reports/map-balance/validation-v1.3/).

Verifier Python bebas PASS: 6,525 raw records, 47 source/input hashes, 326,852 sel CSV/JSON, 600 matched score rows, 5,500 route rows dan semua 800 status/hash kawalan. Ia menyemak graph prefix, bank sumber, triplet, denominator, CP/Wilson, resource reconciliation serta coverage scope. Semua 1,175 triplet entry disahkan.

Semakan pertama menemui 14 rekod belum tersimpan lengkap (sembilan campaign/lima matched). Resume mengulangi **task ID/runSeed yang sama sahaja**, tanpa mengganti sampel berdasarkan hasil; dataset akhir mempunyai semua 6,525 rekod unik dan hash sah. Gate fail untuk shard/index/count mismatch kini diuji. Log batch asal menyimpan 1,369.84 saat; `elapsedSeconds` dalam ringkasan akhir ialah invocation regenerasi/resume terakhir, bukan jumlah masa eksperimen.

Parameter yang berubah hanya alat audit: utiliti routing, profil pengetahuan sintetik, jadual repetition, capture/replay, resource telemetry, report dan validation. Fail gameplay `dist/`, generator/data seed, package.json, stat kad/musuh dan harga tidak berubah berbanding runtime base. Fail/parameter lengkap ada dalam diff dan context. Tiada browser/peranti manual atau playtest murid baharu, tiada exhaustive semua draw/deck/artifact/event RNG, tiada A/B generator/stat calon dan tiada CP pasangan 77,384 campaign yang dikalibrasi. CP route yang tersedia masih provisional N≤8. Review bebas menemui dua diagnostic scope/pressure yang telah dibetulkan dengan regression RED→GREEN; cohort driver kini sepadan 1,131/168 dan combat tambahan Mystery termasuk dalam beban sebelum Rest.

Untuk perubahan combat/ekonomi seterusnya, gunakan output/context baharu, jalankan semula fixed matrix serta verifier, kemudian comparator. Comparator menolak perubahan protokol/polisi/analysis/config/seed; runtime berbeza dengan kaedah sama dilabel dan memerlukan rujukan baharu yang disemak. Master membuat keputusan balance akhir.

[Sejarah sumber v1.3](../reports/map-balance/MAP_V1_3_SOURCE_HISTORY.bundle) mengekalkan commit asal harness dan range review sebelum commit dataset. Ia memerlukan commit d70b409 sedia ada; import ke nama branch review sendiri, tanpa menukar branch kerja. Penghantaran GitHub menggunakan API dengan metadata commit yang boleh berbeza; kandungan tree dan setiap blob diverifikasi berbanding checkout. Bundle ini tidak menduplikasi177 MB raw trial yang sudah berada dalam branch.
