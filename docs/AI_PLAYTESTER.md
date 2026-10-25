# AI Playtester

Current AI review branch: **balance/master, 2.46.0-ai.1**, based on main **2.45.0 /6c49f39**. Ijamm authorizes this AI refresh on the branch only. [Current evidence, data and limits](balance/master/AI_DATA_2026_10_25.md). Earlier main-publication permissions below apply to their named releases.

Previous balance integration: **2.42.0**, with reviewed artifact/Mystery acquisitions and current-source Map/economy observations. [Main publication, validation and limits](balance/master/MAIN_RELEASE_2_42_0.md).

Earlier main integration: [game2.40.0](CARD_TUNING_MAIN_2_40_0.md). Ijamm now authorizes main publication of the completed card follow-up; earlier branch-only statements below are historical.

Earlier game: **2.40.0**, Master candidate.5. Choice ranking runs outside the actual-action observation boundary; only the resulting choice commit can affect telemetry. Five regressions match reported Block use against actual enemy-turn logs. Earlier reports retain their original source and may include the former card-comparison choice-observation defect. [Current changes and verification](CARD_TUNING_2_38_0.md).

Rekod integrasi AI terdahulu, 24 Oktober 2026 (Malaysia): Ijamm membenarkan penerbitan ke **main**, menggantikan had branch ai sahaja. Gabungan AI `807be67` dengan main `d5533ad` mengekalkan game 2.32.1, tutorial, animasi tempur serta muzik menu terkini. Semua nilai gameplay dikekalkan. [Rekod integrasi main](AI_PLAYTESTER_MAIN_2026_10_24.md).

## Buka alat

Dalam checkout branch semasa:

```powershell
npm.cmd run start:dev
```

Buka <http://localhost:4174/__dev/ai/> atau Developer Hub → AI Playtester. Alat berjalan melalui Node worker tempatan. Tiada API key, model download, akaun, cloud atau dependency produksi baharu. Player/production/offline tidak menerima fail atau endpoint AI. Sambungan mestilah loopback dengan Host sepadan; POST menolak cross-origin, content bukan JSON, >32 KB serta options yang tidak sah.

## Polisi dan eksperimen

| Pilihan | Fungsi |
| --- | --- |
| Beginner | Pilih kad legal menggunakan stream polisi berseed; tanpa Focus. |
| Intermediate | Skor current visible card plans dan penggunaan Focus. |
| Expert | Simulasi tiga turn dalam tiga kemungkinan draw; enam calon awal + End Turn, maksimum 300 transition. |
| Full campaign | Actual New Run, starting artifact, map bersambung, dua stage, musuh/Elite/boss, Predict, reward, Shop, Rest, Mystery dan carry sebenar. |
| Card / pair comparison | Ganti satu/dua slot Rune Strike dalam deck campuran 12 kad. Satu kad = 2 mask; pasangan = 4 mask. Pilih satu enemy/difficulty dan base/upgraded. Tiada artifact dalam fixture ini. |

Nama tahap tidak menjamin semakin tinggi win rate. Heuristic dan carian berhad boleh tersilap, terutama setup Passive/faedah tertunda. Campaign berkongsi polisi route sedia ada dan polisi acquisition baharu yang menilai synergy deck. Tahap combat bukan model murid sebenar.

Predict berasingan daripada combat: feedback memilih visible untried answers dan menggunakan maklum balas; high/low ialah model sintetik 85%/25% first-correct dengan canonical answer key dalam adapter kemampuan sahaja; skip tidak melakukan Predict. Artifact/Mystery campaign kekal dengan feedback existing. Combat agent tidak melihat answer key.

Carian menggunakan engine/cardPlan sebenar pada salinan. Unknown draw pool dibina daripada deck yang dimiliki selepas menolak Hand/Discard/Exhaust/Active/Resolving yang diketahui. Tiga stream polisi bebas mensampel susunan draw; RNG game dan artifact sebenar diganti sebelum simulasi. Susunan draw tersembunyi sebenar tidak digunakan. Kad reveal/Recall diputuskan berdasarkan pilihan yang kelihatan dalam dunia simulasi itu sahaja. Actual combat menggunakan resolver pilihan yang sama melalui hook opt-in; legacy replay kekal dengan polisi asalnya.

Setiap calon mendapat tiga sampel yang sama dan had 14 transition setiap sampel, termasuk Focus toggle, play, choice dan enemy turn. Maksimum tiga play setiap turn. Selepas had, pending choice dibuang daripada penilaian; semua calon dibandingkan pada bilangan enemy turn lengkap yang sama. Terminal state kekal terminal. Laporan menyatakan horizon sebenar dan bilangan rollout dipendekkan. Future Predict/jawapan/ganjaran tidak dinilai; Focus yang bakal diperoleh melalui Predict tidak diramal. Input run, RNG dan save kekal sama.

## Pembinaan deck berdasarkan synergy

Reward boleh dipilih atau di-skip berdasarkan perubahan mutu deck. Shop membandingkan kad/artifact yang ditawarkan serta removal menggunakan harga sebenar dan baki Gold; tiada reroll. Upgrade memilih peningkatan marginal termasuk activation gifts dan saiz window selection; Mystery benar-benar decline apabila polisi memilih skip dan event membenarkannya. Removal mengekalkan minimum deck/sekali setiap Shop mengikut engine. Rest mendahulukan pemulihan HP apabila perlu, kemudian upgrade. Pilihan sasaran kad dalam Mystery turut menggunakan polisi ini.

Heuristic membaca mekanik sebenar dan mengambil kira Attack–Strength, Block–Agility/Shield Shot/retention, Skill–Grimoire Ward, Focus–Ember Core, kos, coverage dan salinan Passive unik. Ini anggaran strategi yang boleh tersilap, bukannya CP terukur. Semua tahap combat berkongsi acquisition ini. Tiga puluh penjelasan acquisition terakhir disimpan dalam JSON dan panel.

## Laporan yang ditambah baik

Report history menyimpan **lima job terakhir** dalam memory server. Job baharu mengekalkan laporan lama, termasuk sumber, pilihan dan eksportnya. Hanya satu job berjalan. Memilih laporan lama tidak membenarkan job serentak; pilih job running untuk Cancel. Pilihan history disimpan dalam URL supaya refresh membuka laporan yang sama. Job paling lama akan dibuang apabila melebihi lima; restart server memadam semua. Download bukti dahulu.

Cancel menamatkan worker dan mengekalkan row yang selesai. Permintaan lama tidak membatalkan job pengganti. Mesej worker lewat diabaikan; worker keluar sebelum `done` dilaporkan Failed. Jika dibatalkan sebelum source snapshot, hash sumber kosong dan tidak boleh dianggap bukti lengkap.

Wins/Losses ialah terminal sebenar. Censored = had simulasi tercapai; Invalid = kegagalan polisi/engine. Kedua-duanya kekal dalam jumlah cubaan dan tidak menjadi kalah. Terminal win rate = Wins/(Wins+Losses), kosong jika tiada terminal. Semak n serta invalid/censored dahulu.

Utility = `100 × win + 20 × remaining HP/maxHP − min(10, turn/2)`.

| Angka | Makna |
| --- | --- |
| Card A Δ | U10 − U00: sumbangan replacement A sahaja |
| Card B Δ | U01 − U00: sumbangan replacement B sahaja |
| Combined Δ | U11 − U00: jumlah perubahan pasangan |
| Pair interaction | U11 − U10 − U01 + U00: lebihan synergy berbanding kedua-dua kesan individu |

Hanya setiap seed yang lengkap, unik, terminal dan finite dalam konfigurasi menerima skor. Seed separa/duplicate/invalid/censored/di luar konfigurasi kekal tanpa skor. Seed lengkap/dirancang dipaparkan. Ini contextual exploratory utility, **bukan universal Combat Power**, rarity atau card-offer weights. Sampel kecil boleh melonjak apabila satu outcome berubah.

Observed card use datang daripada receipt dan event engine yang benar-benar berlaku dalam actual action. Pengiraan kos menggunakan ordinal committed play yang kekal apabila object battle diganti. Simulasi planning dan transaction gagal tidak masuk meter. Setiap row melaporkan plays/Energy/Focus/direct HP damage, Block diberi/diserap/luput/berbaki/tidak digunakan ketika combat tamat, sebenar kad ke Hand, status digunakan, stat diberi, trigger/damage Passive, retaliation serta pengurangan incoming damage daripada Weak/Defense.

Block menggunakan aturan perakaunan **FIFO**: sumber paling awal digunakan dahulu. Block yang dibawa ke turn seterusnya mengekalkan sumber asal; retention support dikreditkan kepada cap dominan Last Ember, Hold the Line atau Lasting Shield mengikut keputusan engine. Ini konvensyen accounting, bukan bukti causal marginal power. Sumber awal/artifact yang tidak dipautkan kepada kad berada dalam `__other__`. Granted = absorbed + expired + unused-at-end + remaining.

Draw mengira actual cards moved to Hand, termasuk Recall, delayed dan Passive; request yang tersekat oleh Hand cap tidak dikira. Buffed hits ialah penglibatan buff, bukan tambahan damage bebas. Effects telemetry version 2 mengira Status uses sekali bagi setiap durasi/fasa yang mempunyai Attack terjejas, dan Vulnerable hits mengira semua hit terjejas. Durasi yang luput tanpa Attack tidak dikira sebagai use. Sumber durasi dikekalkan secara FIFO sehingga fasa tamat; archived rules masih mengira penggunaan per hit. Weak/Vulnerable use, retention dan buff involvement ialah overlay; menjumlahkannya semula dengan damage/Block akan mengira kesan dua kali. Defense/Weak mengukur damage masuk yang dikurangkan; dalam overkill nilainya boleh melebihi HP hidup yang dijimatkan. Agility/Strength/Defense granted ialah unit kasar yang diberi, bukan stat kekal pada akhir combat.

Output-per-Energy dipisahkan untuk damage, absorbed Block, mitigasi dan cards-to-Hand; kos sifar memberi null/Unmeasured. Jangan campurkan semua unit menjadi satu CP. UI menunjukkan 20 sumber teratas mengikut plays; JSON menyimpan semua. Data lama yang tiada support telemetry dipaparkan Unmeasured.

Eksport JSON **schema 3**, agent **sampled-turn-search-4**, mengekalkan konfigurasi, runtime, source SHA256/per-file hashes, binding identity, keputusan sebenar, telemetry dan penjelasan. CSV mengekalkan semua posisi lama dan menambah experience/status/model ID selepas route. Alat tidak menala stat secara automatik. Sasaran murid Easy 90%, Medium 70%, Hard 50% belum diukur; kombinasi tidak diuji secara exhaustive.

## Experience daripada simulasi

AI menggunakan prior kecil untuk menilai acquisition kad, berdasarkan replay Combat semasa bagi 40 kad dan empat pasangan terpilih, Base/Upgraded dan tiga difficulty. Ini bukan latihan LLM. Data lama digunakan sebagai resipi eksperimen sahaja; label direplay pada enjin dan polisi semasa. Kad tunggal menggunakan delta replacement, manakala synergy menggunakan empat sel factorial yang lengkap. Seed latihan93 dipisahkan daripada seed pengesahan701/702. Data invalid/censored disimpan dan tidak diberi skor rekaan.

Setiap prior dibahagi20, dikecilkan dengan n/(n+5), dihadkan kepada ±0.25 dan dipuratakan mengikut saiz deck. Setiap pasangan terpakai sekali walaupun deck mempunyai banyak salinan. Kos/legality dan harga sebenar engine kekal menentukan tindakan. Model ini hanya membantu reward, Shop, upgrade, removal dan pilihan deck; card-mode combat melaporkan NOT_USED_IN_CARD_MODE.

Pilihan CLI `--experience=on` ialah default dengan fallback; `--experience=off` memberikan perbandingan heuristic asal. READY bermaksud runtime/difficulty/polisi tepat. Model hilang, rosak atau lama memberi MISSING_MODEL, INVALID_MODEL, STALE_RUNTIME atau STALE_POLICY dan pelarasan sifar; DISABLED bermaksud dimatikan secara sengaja. Sumber laporan merangkumi model, tetapi signature keserasian polisi mengecualikan model untuk mengelakkan hash berpusing. Tiada pembelajaran atau penulisan model daripada save pemain.

Combat, Map dan Economy perlu mengikuti [kontrak penghantaran simulasi](balance/SIMULATION_DATA_HANDOFF.md): manifest, JSONL, summary, raw dan SHA sumber dalam direktori baharu. `npm run ai:data -- validate PATH` menyemak bundle; `train PATH NEW_MODEL.json` menghasilkan calon tanpa mengaktifkannya. Learner semasa hanya fit Combat factorial; envelope Map/Economy disemak dan disimpan untuk diagnostik.

Eksport Combat memerlukan `schedule.json` yang ditetapkan sebelum simulasi. Import menolak difficulty yang tidak sepadan dengan provenance, laporan kosong dan seed/skill/mask atau laporan penuh yang hilang. Manifest baharu menyimpan jangkaan ID/kiraan untuk semakan semula; CLI menamakan liputan PREDECLARED_COHORT, DECLARED_REPORT_OPTIONS atau LEGACY_NO_COHORT_PLAN dengan jelas. Bundle lama kekal boleh dibaca, dengan batas liputan asalnya.

## CLI

```powershell
npm.cmd run ai:playtest -- --mode=campaign --difficulty=medium --skill=all --predict=feedback --seeds=2 --seed=20 --output=reports/local-ai/campaign-01
npm.cmd run ai:playtest -- --mode=cards --difficulty=medium --skill=expert --predict=low --seeds=2 --seed=40 --enemy=golem --cards=stm.attack.fate_storm,stm.passive.blazing_spirit --output=reports/local-ai/pair-01
```

Gunakan prefix output baharu: fail existing tidak ditulis ganti. Output .json dan .csv; tanpa --output hanya ringkasan dicetak. Invalid/censored memberi exit code 1. Ctrl+C CLI tidak menjamin row separa tersimpan; panel menyokong pembatalan dengan row selesai.

## Bukti dan had

Pakej lokal sesi terdahulu telah dibersihkan oleh penyelenggaraan workspace dan tidak ditemui dalam carian pemulihan. Kod dipulihkan daripada rekod sesi ke atas main semasa; raw/log lama tidak direka semula. Lihat [pengesahan semasa](verification/ai-branch.json) untuk ujian yang dijalankan semula. Bukti ini merekodkan penerbitan branch ai terdahulu. Penerbitan main kini dibenarkan dan direkodkan berasingan dalam rekod integrasi di atas. Latihan LLM, player advisor, physical-device testing dan pengesahan kadar menang murid kekal di luar hasil ini.

Hentikan job sebelum mengedit atau membina semula sumber game. Restart server selepas mengubah kod. Job menggunakan sumber semasa; menyunting fail ketika eksperimen berjalan bukan aliran kerja snapshot yang disokong.

## Pengesahan asas terdahulu — sebelum penambahbaikan strategi

790/790 ujian penuh, 18/18 ujian khusus, syntax, AI browser dan Developer Hub/toggle browser lulus. Ujian browser merangkumi response-order race, history/export/reload/cancel, player storage sentinels dan viewport 1440/750/390. Production build lulus; 822 fail production/module/entrypoint kekal sama, 705 production files sepadan dengan dist dan endpoint AI GET/POST semuanya 404.

Batch sumber akhir: 9 actual campaign (3 difficulty × 3 polisi, synthetic low Predict, seed22) dan 48 encounter Fate Storm + Blazing Spirit (Wisp/Golem/Dealer serta Golem upgraded, 3 polisi, satu seed). Tiada invalid/censored, semua committed plays sepadan dengan receipt usage, dan identiti sumber CSV diperiksa. Raw JSON/CSV: reports/ai-playtester/branch-ai-2026-10-24/. Sampel kecil ini bukan pengesahan kadar menang murid. Ujian tambahan membuktikan actual HTTP worker campaign selesai dan CLI self-replacement delta sifar.

## Penambahbaikan strategi semasa

Ijamm memilih tiga perubahan di atas dan meminta implementasi. Bukti semasa direkodkan berasingan dalam [ai-strategy.json](verification/ai-strategy.json); angka 790 di atas ialah baseline terdahulu. Source hash dan semakan akhir mesti datang daripada run semasa.

Pengesahan akhir strategi: **814/814** full tests dan **42/42** AI tests; actual AI browser, Developer Hub/toggle, syntax, HTTP worker campaign dan CLI lulus. Semua 40 kad melalui planning smoke; dua fixture multi-hit mengesahkan Weak/Defense/Agility/Block. Production dibina pada salinan input sama: 822 fail dilindungi kekal sama, 705 fail public byte-identical dengan dist, generated offline tiada AI, semua AI GET/POST 404.

Batch sumber akhir: **9 campaign + 60 selected-pair encounters**, semuanya terminal, tiada invalid/censored; receipt costs, Block conservation, source hashes dan CSV identity/support diperiksa. Raw reports: reports/ai-playtester/strategy-2026-10-24/. Sampel satu seed setiap kombinasi konfigurasi ini tidak mengesahkan pupil win rates atau optimality. Semakan bebas menemui tiga Important yang dibaiki RED→GREEN: actual choice policy, Mystery skip dan upgrade-only mechanics; lihat [review](verification/ai-strategy-review.md).

## Pengesahan integrasi main

Gabungan dengan main 2.32.1 lulus **820/820** full tests (tiada skip), syntax, AI browser dan Developer Hub/toggle. Build produksi pada export sumber sama lulus: 823 fail dilindungi kekal, 706 fail public sepadan dengan dist, offline tidak mengandungi AI dan semua AI GET/POST 404. [Bukti integrasi semasa](verification/ai-main-2026-10-24.json). Angka 814/814 di atas kekal hasil branch ai terdahulu.


## Question-policy integration — 2.36.0

Feedback now honours the live two-answer game policy and closes a failed Predict
without a third submission. Campaign event choices exclude tried answers. These
are compatibility updates, not changes to agent search, card valuation, synergy
weights or pupil models. Prior numerical reports retain their recorded sources.

## Master refresh semasa — branch sahaja

Agent sampled-turn-search-3 menilai artifact dengan kos sebenar, kredit Gold, Max HP, trigger deck dan diskaun tertinggi yang sudah dimiliki. Gift percuma/Elite/Boss berkongsi polisi itu. Mystery dibandingkan menggunakan tawaran yang sudah dibuka pada salinan run; transform kehilangan upgrade dan tidak mengurangkan saiz deck. Pilihan optional yang merugikan boleh decline; hanya tindakan sebenar masuk telemetry. CSV kini menambah route, dan modul artifact termasuk dalam source hash. Anggaran peluang combat/Shop seterusnya ialah heuristic, bukan CP.

Main2.41 dibaca bersama tiga branch specialist. Candidate.5, nilai kad/profile dan save key dikekalkan. [Handoff dan bukti semasa](balance/master/REFRESH_2026_10_24.md). Batch baharu403 outcome dan42 replay Map tidak mengesahkan kadar menang murid.

Semakan akhir refresh membetulkan penilaian ID canonical ME08: buff Strength/Agility percuma kini dinilai positif. Suite1042/1042 lulus. Data selepas review menggunakan sumber baharu di `reports/master-balance/refresh-20261024/final/`; data sebelum review dikekalkan berasingan.
