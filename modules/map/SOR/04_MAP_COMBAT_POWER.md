# SOR Map Balance & Combat Power — v1.2

Tarikh: 23 Oktober 2026. Pemilik domain: Map. Penyatuan dan keputusan balance akhir: Master.
Kod rujukan: `2800f9aeba5ed594e6ef3f991bcf4dfa498a5de7` (game 2.24.0), branch `balance/map`.

## Status dan keutamaan

- **DISAHKAN:** menilai setiap seed/laluan, mengekalkan kontrak map, menyimpan nilai kesukaran untuk pembangunan sahaja dan menyerahkan hasil kepada Master.
- **DISAHKAN:** sasaran keseluruhan Easy 90%, Medium 70%, Hard 50% murid menang satu run penuh. Pengesahan ini milik Master; hasil bot bukan hasil murid.
- **DITERUSKAN:** generator 1.0.0, katalog 1.1.0, `STM-001` hingga `STM-100`, route save versi 3 untuk run baharu. Save route 1/2 kekal dengan graph asalnya.
- **CADANGAN UNTUK DIUJI:** model anggaran, polisi bot, skala CP, saiz pilot dan semua angka baharu daripada Balance v1.2. Tiada calon stat/harga diaktifkan oleh audit ini.
- **PERLU_VERIFIKASI:** difficulty adapter Easy/Medium/Hard, CP route yang dikalibrasi, fairness untuk murid, build domain combat/ekonomi yang disatukan.

Dokumen ini menambah pemilik penilaian kepada [01_MAP_RNG.md](01_MAP_RNG.md), bukan menggantikan peraturan penjanaannya. Hasil dan had sebenar ada dalam [handoff](../../../docs/MAP_BALANCE_HANDOFF.md); arahan ulangan ada dalam [README alat](../../../tools/balance/map/README.md).

## MAP-BAL-01 — Kontrak map dikekalkan

Dua stage, sepuluh level setiap stage. Semua node level 5 ialah Mystery, level 9 Rest, level 10 Boss. Setiap edge maju tepat satu level; semua node reachable dan mempunyai laluan ke boss. Sambungan sah, kuota dan snapshot tidak ditulis semula oleh analyzer.

| Laluan awal | Shop seluruh map | Elite seluruh map | Rest seluruh map, termasuk level 9 |
| --- | ---: | ---: | ---: |
| 3 | 1 | 4 | 2 |
| 4 | 2 | 6 | 3 |
| 5 | 3 | 7 | 4 |

Kuota seluruh map tidak menjamin jumlah bilik yang sama pada setiap perjalanan. Flag `forcedElite` bermaksud setiap laluan lengkap melalui sekurang-kurangnya satu Elite. Flag `noEarlyRest` bermaksud tiada satu pun laluan yang mendapat Rest sebelum level 9. Kedua-duanya ialah pemerhatian, bukan bukti automatik map tidak sah.

## MAP-BAL-02 — Bezakan empat jenis bukti

| Jenis | Nilai/hasil | Makna |
| --- | --- | --- |
| Struktur | `VALID`, laluan, edge, bilangan/urutan room, kebarangkalian | Tepat bagi 200 snapshot katalog yang diaudit |
| Anggaran | `estimatedPressure`, `ESTIMATED_PRESSURE` | Model beban HP abstrak; bukan output perlawanan engine |
| Simulasi | `PROVISIONAL`, W/N, CP, interval, trace | Tindakan sah melalui engine sebenar dengan polisi sintetik tertentu |
| Murid | Kadar kemenangan penuh mengikut difficulty | Memerlukan ujian Master; belum dijalankan di sini |

Jangan menamakan anggaran sebagai simulasi, atau menjadikan kemenangan bot sebagai bukti sasaran murid tercapai. Nilai sifar berbeza daripada `null`/belum diuji. Error harness dan had benchmark berbeza daripada kalah pemain.

## MAP-BAL-03 — Enumerasi dan kebarangkalian laluan

Mulakan DFS pada setiap pintu masuk level 1, ikut semua edge sah hingga boss. Percantuman node tidak menghapuskan sejarah laluan yang berbeza. ID laluan ialah hash urutan node; kunci rekod ialah `(seed, stage, routeId)`, bukan routeId sahaja.

Katalog ini mempunyai 5,500 laluan: 2,846 Stage 1 dan 2,654 Stage 2, antara 7 hingga 88 setiap map. Semua laluan distrukturkan, tanpa sampling struktur. `maps.json` menyimpan snapshot node/edge; `routes.json/csv` menyimpan setiap urutan lengkap.

Produk laluan Stage 1 × Stage 2 bagi setiap seed menghasilkan 77,384 pasangan campaign sah. Alat anggaran berasingan turut mengenumerasi semuanya, menyimpan kedua-dua routeId dan memilih pasangan mudah/median/sukar setiap seed. Ini coverage struktur pasangan, bukan 77,384 campaign dimainkan melalui engine.

Polisi laluan pilot memilih pintu masuk secara seragam, kemudian satu edge keluar secara seragam pada setiap persimpangan. Oleh itu:

`P(route) = 1 / jumlah pintu masuk × hasil darab (1 / bilangan edge keluar)`.

Ini tidak sama dengan memilih setiap laluan lengkap secara seragam. Jangkaan tekanan menggunakan `P(route)`; median ialah lower median tanpa pemberat selepas susun `estimatedPressure`, kemudian routeId sebagai pemutus seri. Nama mudah/median/sukar merujuk kedudukan anggaran, bukan ranking kemenangan yang sudah terbukti.

## MAP-BAL-04 — Konteks seed dan roster

Runtime memetakan uint32 `runSeed` kepada `STM-((runSeed % 100) + 1)`. Musuh normal/Elite ditentukan oleh `(level + column + runSeed % roster.length) % roster.length`; boss mengikut stage.

Setiap stage mempunyai tiga normal dan dua Elite. Bagi satu ID katalog, semua runSeed mempunyai pariti yang sama kerana beza 100; hanya tiga kelas roster normal/Elite boleh dicapai. Analyzer menggunakan wakil `j-1`, `j-1+100`, `j-1+200` bagi `STM-j`, bukan enam kombinasi bebas yang mustahil. Keadaan draw, tawaran dan event masih boleh berbeza dalam kelas roster yang sama.

Sampler pilot mengambil lapan uint32 yang sah bagi setiap ID katalog, dengan replacement, melalui rejection sampling bagi mengelakkan bias modulo. `samplerSeed=42`, algoritma, senarai runSeed sebenar dan semua had direkodkan. Ini meliputi 800 run, bukan keseluruhan ruang uint32.

## MAP-BAL-05 — Formula anggaran tekanan v1

Parameter rujukan abstrak: 12 damage pemain/giliran, 6 Block/giliran, nominal Rest 12 HP. Ini bukan dakwaan sesuatu deck benar-benar mengeluarkan angka tersebut.

Untuk encounter `i` dan kelas roster `v`:

1. `H = HP template + 10 jika Elite`.
2. `B = purata Block dalam pola musuh`; `T = clamp(ceil(H / (12 - B)), 1, 100)`. Jika penyebut tidak positif, guna 100.
3. Untuk giliran musuh `t=1..T-1`, gunakan pola semasa, bonus Elite +2, rage `2 × floor((t-1)/6)`, multiplier Learn 0.7 jika berkenaan dan pembundaran engine pada serangan.
4. `q_i = jumlah max(0, damageSerangan × hits - 6)`.
5. Lawatan Rest menambah kredit `-12`. Debt bermula 0 dan tidak boleh negatif: `D_i = max(0, D_(i-1) + q_i)`.
6. Tekanan laluan `E(route) = purata_v max_i(D_i)`, untuk tiga kelas roster yang boleh dicapai.

Peak digunakan supaya Rest di belakang tidak menyembunyikan tekanan berbahaya sebelum Rest. `minVariantPressure/maxVariantPressure`, gross/final debt dan kredit recovery disimpan dalam JSON. Nilai ini bukan HP sebenar yang hilang dan boleh melebihi Max HP.

Model ini mengecualikan pertumbuhan deck, upgrade, artifact, stat/status pemain, variasi draw, pembelian, kos/reward/extra combat Mystery, seal boss dan bonus fasa boss. Gold pada Shop dalam varian ialah baki nominal jika tidak berbelanja serta mengabaikan Mystery/artifact. Ia bukan ramalan kemampuan membeli yang sebenar. Gunakan trace engine untuk keadaan sebenar.

Untuk anggaran campaign `pressure-debt-campaign-1.0.0`, proses urutan tekanan Stage 1, kredit nominal stage-clear 12, kemudian urutan Stage 2 dengan debt yang sama; ambil peak keseluruhan sebelum purata tiga kelas roster yang sepadan. Jangan menambah dua peak per stage atau menggabungkan offset roster bebas. Probability pasangan ialah hasil darab probability laluan yang dirancang. Median pasangan juga lower median tanpa pemberat. Laporan pasangan mempunyai konteks/hash sendiri yang merujuk konteks pilot; ia tidak mengubah pilot atau menjadikan CP pasangan tersedia.

## MAP-BAL-06 — Skala kesukaran CP berdasarkan risiko menang

Untuk scope yang mempunyai `W` kemenangan daripada `N` keputusan sah:

`p_hat = (W + 0.5) / (N + 1)`

`CP = 1000 × ln(1 / p_hat) / ln(1 / p_ref)`, dengan `p_ref = 0.70` dalam config audit ini.

CP lebih tinggi bermaksud lebih sukar untuk polisi/konteks yang dinyatakan. `p_hat=0.70` memberi 1000. Ini skala rujukan, bukan kelulusan difficulty Medium. Pelicinan mengelakkan skor infiniti daripada sampel kecil yang semuanya kalah/menang.

Laporkan W/N mentah bersama Wilson 95% dan transformasi interval CP secara terbalik. Bagi sifar kemenangan, hujung bawah probability tepat 0 dan hujung atas CP tidak terbatas: JSON `null` bersama `cpUpperUnbounded=true`, bukan nombor terhingga yang mengelirukan. Tiada trial memberi CP `null`. Error atau censor yang belum menyelesaikan scope memberi `UNSCORABLE`.

Keputusan Stage 1 yang sudah menang kekal sah jika run kemudian error/censor di Stage 2. Error/censor campaign masih dilaporkan berasingan. Stage 2 menggunakan hanya run yang benar-benar sampai ke stage itu; kalah Stage 1 bukan kalah Stage 2. Skor Stage 2 dilabel `stage_campaign_conditional` dan tidak boleh dibanding terus dengan entry deck/HP Stage 1. CP campaign mengukur kemenangan kedua-dua stage dalam run yang sama.

Pilot lapan trial setiap seed terlalu kecil untuk ranking muktamad. Skor seed/campaign yang mempunyai trial sah berstatus `PROVISIONAL` dan `PENDING_MASTER`; tiada arrival memberi `NOT_SIMULATED`. Semua `routes.combatPower` dan CP pasangan kekal `null`; setiap route/pair sudah mempunyai anggaran tekanan, tetapi belum mempunyai bank entry state dan replikasi mencukupi untuk CP yang setara. Jangan mengisi CP route menggunakan CP seed atau satu perlawanan diagnostik.

## MAP-BAL-07 — Deck, polisi dan engine rujukan

| Input | Konteks pilot |
| --- | --- |
| Balance | Runtime base 2800f9a, game 2.24.0; candidate v1.2 tidak digunakan |
| Mode/difficulty | Challenge / `runtime-baseline-no-tier`; runtime hanya Learn/Challenge |
| Mula | 60 Max HP, 80 Gold, Focus cap 3; artifak Starting melalui aliran sebenar |
| Deck 12 kad | Rune Strike ×3, Weak Point ×3, Rune Guard ×2, Flash Ward ×2, Quick Study ×1, Read Ahead ×1 |
| Combat | `visible-greedy-feedback-v1`: pelan kad/hand/intent yang kelihatan, tanpa susunan draw atau jawapan tersembunyi |
| Laluan | `uniform-visible-v1`, tidak melihat identiti encounter tersembunyi ketika memilih node |
| Soalan | Pilih seragam antara jawapan terlihat yang belum dicuba; guna feedback Predict/artifact; Mystery satu cubaan |
| Recovery | Heal jika hilang ≥8 HP atau tiada kad boleh upgrade; selainnya upgrade kad tertinggi mengikut heuristik |
| Reward/Shop | Skor heuristik kad/artifact, kecukupan role; tambah kad sehingga 24, kemudian Skip; beli tawaran mampu milik mengikut merit/harga; tiada strategi removal Shop |
| Carry | HP, deck, upgrade, Gold dan artifact sebenar dibawa antara room/stage |
| Masa | Jam benchmark beku; tambah satu saat setiap cubaan jawapan. Ini bukan model masa/kebolehan murid |

Pemberat keputusan kad dalam `policy.cjs`/`replay.cjs` ialah polisi bot, bukan nilai kuasa kad. Pakej Balance v1.2 mentakrif ICP/CCP melalui utility deck berpadanan. CP map berasaskan risiko menang tidak setara unitnya dan tidak boleh dijumlahkan dengan ICP/CCP kad.

Semua combat, seal, damage, Gold, loot, event, Shop dan peralihan stage diselesaikan oleh API runtime. Harness tidak menetapkan HP/damage/ganjaran terus. Trace menyimpan seed, node, HP/Gold, saiz/fingerprint deck, upgrade, artifact, RNG, keputusan dan bilangan giliran. Trial pertama turut menyimpan log tindakan; run lain boleh dimainkan semula daripada konteks dan seed.

## MAP-BAL-08 — Had, diagnostik dan coverage

Had tetap: 100 giliran combat, 500 card plays per combat, 10,000 panggilan API per campaign; wall-clock batch 1,800 saat, diperiksa antara campaign. Had memberi `BENCHMARK_LIMIT_CENSORED`, bukan kalah. Tiada optional stopping apabila hasil sudah kelihatan baik. Checkpoint/resume memerlukan contextId sama, termasuk hash input dan dependency engine sebenar.

Selain 800 pilot, 300 campaign diagnostik merancang laluan mudah/median/sukar bagi kedua-dua stage. RunSeed diagnostik ialah tiga wakil roster berbeza. Oleh sebab roster/RNG serta carry state berubah, hasil diagnostik bukan eksperimen sebab-akibat kesan laluan. Diagnostik dikecualikan daripada CP/W/N pilot. Laluan Stage 2 yang dirancang tetapi tidak dicapai tidak dikira diuji.

Coverage struktur = semua laluan lengkap dienumerasi. Coverage simulasi membezakan:

- route plan yang mempunyai sekurang-kurangnya satu node dimasuki (`simulatedUniqueRoutes`), termasuk kematian pada prefix;
- semua sepuluh node dalam route plan benar-benar dimasuki (`fullyTraversedUniqueRoutes`);
- kemenangan stage, kemasukan boss, error/censor dan coverage node sebenar.

Coverage route di atas menggabungkan pilot dan diagnostik. Risiko node/HP masuk boss dalam summary menggunakan pilot sahaja. Semua denominator dan trace mentah disimpan; rate node ialah conditional pada polisi dan pemain yang sampai, bukan bahaya intrinsik node.

## MAP-BAL-09 — Recovery, Shop, reward dan boss

Bandingkan setiap seed melalui room count, Elite berturut-turut, combat sejak Rest, Rest pertama, Shop dan nominal Gold, serta jurang tekanan mudah–sukar. Trace engine mengesahkan HP/Gold/deck/artifact masuk dan keluar setiap room, termasuk boss. Reward boleh meningkatkan kekuatan selepas laluan berisiko; lebih banyak Elite tidak semestinya menghasilkan CP lebih tinggi.

Sebelum mengisytiharkan satu map terlalu sukar, Master mesti menilai kadar sampai boss, distribusi HP/deck/artifact semasa masuk, kematian sebelum recovery, pembelian yang mampu dibuat dan kehilangan peluang upgrade apabila terpaksa heal. Pisahkan Stage 2 conditional daripada ujian Stage 2 menggunakan entry bank yang distandardkan.

## MAP-BAL-10 — Calon v1.2, cadangan dan penerimaan Master

Input asal Balance v1.2 menggunakan baseline af12035 (game 2.23.1), berbeza daripada base tugasan. Hash archive/member dan semua perbezaan runtime direkod dalam `source-differences.json`. Semua 40 snapshot energy/value kad semasa dalam pakej sepadan dengan base; angka cadangan tetap belum digunakan.

Isu rentas domain termasuk boss HP 70/95 berbanding calon Medium 90/125, Rest 12 berbanding 15, rage +2/6 giliran berbanding calon +1/6, bonus Elite runtime yang tidak boleh digandakan apabila calon sudah tier-adjusted, artifact Boss dijual Stage 1, rarity/support loot dan minimum removal Mystery 1 berbanding calon 10. Butiran serta pemiliknya ada dalam handoff.

Master perlu menentukan polisi forced Elite/akses Rest mengikut difficulty sebelum sebarang generator versi baharu. BAL-25 calon dan kuota map semasa tidak boleh dianggap sudah serasi. Cadangan memindah satu Rest, menjamin pilihan mengelak Elite, atau mengubah akses Shop mesti diuji pada salinan/snapshot baharu dengan kuota dan semua laluan divalidasi. Run/save lama tidak dijana semula.

Penerimaan audit domain ini: 100 seed direkod, semua 200 map/5,500 route valid, konteks dan formula tersedia, trial sah/error/censor berasingan, output boleh diulang, dan tiada CP pada UI/build pemain. Penerimaan balance akhir memerlukan domain combat/ekonomi yang sama versinya, ujian polisi/deck berbeza serta playtest murid yang Master kendalikan. Dataset ini tidak menetapkan ambang senang/sukar muktamad.
