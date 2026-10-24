# AI Playtester — branch ai

24 Oktober 2026 (Malaysia). Asas main `6dc3ce3`, game 2.31.0, termasuk tutorial baharu. Ijamm membenarkan penerbitan **branch ai sahaja** serta penambahbaikan berkaitan. Versi game dan semua nilai gameplay dikekalkan.

## Buka alat

Dalam checkout branch ai:

```powershell
npm.cmd run start:dev
```

Buka <http://localhost:4174/__dev/ai/> atau Developer Hub → AI Playtester. Alat berjalan melalui Node worker tempatan. Tiada API key, model download, akaun, cloud atau dependency produksi baharu. Player/production/offline tidak menerima fail atau endpoint AI. Sambungan mestilah loopback dengan Host sepadan; POST menolak cross-origin, content bukan JSON, >32 KB serta options yang tidak sah.

## Polisi dan eksperimen

| Pilihan | Fungsi |
| --- | --- |
| Beginner | Pilih kad legal menggunakan stream polisi berseed; tanpa Focus. |
| Intermediate | Skor current visible card plans dan penggunaan Focus. |
| Expert | Cari sehingga 3 play / 48 transition, maksimum 6 calon per node, termasuk pilihan end turn. |
| Full campaign | Actual New Run, starting artifact, map bersambung, dua stage, musuh/Elite/boss, Predict, reward, Shop, Rest, Mystery dan carry sebenar. |
| Card / pair comparison | Ganti satu/dua slot Rune Strike dalam deck campuran 12 kad. Satu kad = 2 mask; pasangan = 4 mask. Pilih satu enemy/difficulty dan base/upgraded. Tiada artifact dalam fixture ini. |

Nama tahap tidak menjamin semakin tinggi win rate. Heuristic dan carian berhad boleh tersilap, terutama setup Passive/faedah tertunda. Campaign menggunakan polisi route/pembelian/reward/choice existing yang dikongsi; tahap combat bukan model murid sebenar.

Predict berasingan daripada combat: feedback memilih visible untried answers dan menggunakan maklum balas; high/low ialah model sintetik 85%/25% first-correct dengan canonical answer key dalam adapter kemampuan sahaja; skip tidak melakukan Predict. Artifact/Mystery campaign kekal dengan feedback existing. Combat agent tidak melihat answer key.

Carian menggunakan engine/cardPlan sebenar pada salinan. Draw salinan dikanonkan dan gameplay/artifact RNG salinan diganti. Branch berhenti pada draw/search/reveal/Recall, pending choices, Hand UID baharu melalui Passive/artifact atau perubahan RNG; kad hipotetikal yang baru dicabut tidak dinilai. Lethal yang diketahui dinilai tanpa reward yang dijana. Future enemy turns dan Predict tidak dicari. Input run, RNG dan save tidak berubah oleh keputusan bot.

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

Observed card use datang daripada receipt yang resolved: bilangan play, Energy/Focus dibayar dan direct HP damage. Pengiraan dideduplicate per battle/transaction, termasuk pilihan kad. Damage tidak merangkum nilai Block, buff, draw atau setup, jadi jangan gunakan angka itu sahaja untuk menilai kad. UI memaparkan top 20 mengikut play; JSON menyimpan semua.

Eksport JSON mengandungi schema 2, konfigurasi, runtime, source SHA256/per-file hashes, binding identity setiap row, keputusan sebenar, telemetry serta 30 penjelasan terakhir. CSV ialah outcome/cost rata dan mengekalkan status invalid/censored serta job ID, source hash, agent/engine/definition identity dan konfigurasi mode/Predict/cards/enemy/upgrade. Alat tidak menala stat secara automatik. Sasaran murid Easy 90%, Medium 70%, Hard 50% masih belum diukur; kombinasi tidak diuji secara exhaustive.

## CLI

```powershell
npm.cmd run ai:playtest -- --mode=campaign --difficulty=medium --skill=all --predict=feedback --seeds=2 --seed=20 --output=reports/local-ai/campaign-01
npm.cmd run ai:playtest -- --mode=cards --difficulty=medium --skill=expert --predict=low --seeds=2 --seed=40 --enemy=golem --cards=stm.attack.fate_storm,stm.passive.blazing_spirit --output=reports/local-ai/pair-01
```

Gunakan prefix output baharu: fail existing tidak ditulis ganti. Output .json dan .csv; tanpa --output hanya ringkasan dicetak. Invalid/censored memberi exit code 1. Ctrl+C CLI tidak menjamin row separa tersimpan; panel menyokong pembatalan dengan row selesai.

## Bukti dan had

Pakej lokal sesi terdahulu telah dibersihkan oleh penyelenggaraan workspace dan tidak ditemui dalam carian pemulihan. Kod dipulihkan daripada rekod sesi ke atas main semasa; raw/log lama tidak direka semula. Lihat [pengesahan semasa](verification/ai-branch.json) untuk ujian yang dijalankan semula. Penerbitan main, latihan ML, player advisor, physical-device testing dan pengesahan kadar menang murid bukan hasil tugasan ini.

Hentikan job sebelum mengedit atau membina semula sumber game. Restart server selepas mengubah kod. Job menggunakan sumber semasa; menyunting fail ketika eksperimen berjalan bukan aliran kerja snapshot yang disokong.

## Pengesahan semasa

790/790 ujian penuh, 18/18 ujian khusus, syntax, AI browser dan Developer Hub/toggle browser lulus. Ujian browser merangkumi response-order race, history/export/reload/cancel, player storage sentinels dan viewport 1440/750/390. Production build lulus; 822 fail production/module/entrypoint kekal sama, 705 production files sepadan dengan dist dan endpoint AI GET/POST semuanya 404.

Batch sumber akhir: 9 actual campaign (3 difficulty × 3 polisi, synthetic low Predict, seed22) dan 48 encounter Fate Storm + Blazing Spirit (Wisp/Golem/Dealer serta Golem upgraded, 3 polisi, satu seed). Tiada invalid/censored, semua committed plays sepadan dengan receipt usage, dan identiti sumber CSV diperiksa. Raw JSON/CSV: reports/ai-playtester/branch-ai-2026-10-24/. Sampel kecil ini bukan pengesahan kadar menang murid. Ujian tambahan membuktikan actual HTTP worker campaign selesai dan CLI self-replacement delta sifar.
