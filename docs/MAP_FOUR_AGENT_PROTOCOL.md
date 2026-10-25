# Protokol empat subagent — Map Balancing

Versi protokol: 1.1.0. Tarikh: 25 Oktober 2026, Asia/Kuala_Lumpur.

**Status: protokol dengan empat profil agen dan skill boleh guna semula.** Lihat [pakej dan semakan penggunaan](MAP_AGENT_SKILL_HANDOFF.md). Native Codex config tersedia; Work menggunakan alat subagent sesi. Pengagih automatik merentas agen/shard collector belum dilaksanakan. Tiada simulasi, CP atau penalaan numerik baharu daripada pakej ini.

Snapshot perenggan asal di bawah ialah semakan protokol1.0; snapshot pakej1.1 ialah main68d61e7/game2.48.0 dan Map280278e. Kedua-duanya bukan pengukuran numerik main semasa.

Main diperiksa: `2b81a2cd80532324a76581563874a9ecd797cc42`, game2.47.0, Master SOR1.2.0. Branch Map sebelum kemas kini: `364a844879b8cd9463c4771eac15291a3fd22075`. Pengukuran terakhir v1.5 kekal pada game2.40.0/candidate.5, sumber `b730cad0cb27b53ffbdf687d8fc9edaed143ef43`. **Balance numerik main2.47 belum diukur oleh laporan ini.**

## Empat agen dengan tugas yang sama

Penyelaras ialah agent utama. Maksimum empat subagent, A–D, menilai kumpulan seed masing-masing. Semua mendapat skop sama: struktur/laluan, hasil engine, Elite/recovery/Mystery, Shop/reward/deck, keadaan boss, Predict dan penemuan berasaskan bukti. Setiap kumpulan meliputi semua difficulty, polisi dan ulangan yang ditetapkan oleh protokol eksperimen.

| Agen | Agihan awal contoh | Seed | Sasaran beban analisis |
| --- | --- | ---: | ---: |
| A | STM-001,005,009,…,097 | 25 | sekitar25% |
| B | STM-002,006,010,…,098 | 25 | sekitar25% |
| C | STM-003,007,011,…,099 | 25 | sekitar25% |
| D | STM-004,008,012,…,100 | 25 | sekitar25% |

Senarai tepat dan batc contoh ada dalam [pelan berstruktur](../reports/map-balance/four-agent-protocol-v1/summary.json). Ini agihan awal analisis, bukan seed baru atau perubahan sampling. Untuk jadual v1.5, setiap kumpulan25 seed merujuk600 campaign dan sehingga450 matched stage replay. Jumlah replay sebenar bergantung pada entry sah, termasuk survivor Stage2.

Mulakan dengan batc kecil, contohnya lima seed setiap agen. Penyelaras menyerahkan batc analisis yang belum dimulakan kepada agen yang selesai dahulu. Pemilik aktif mesti dihentikan/disahkan selesai sebelum penyerahan semula. Jumlah seed akhir boleh berbeza supaya masa kerja lebih seimbang. Tiada seed, repetition, had atau hasil ditukar untuk mengejar sasaran25%.

Setiap agen menyerahkan format sama: seed yang diperiksa, source/context dan case IDs, ringkasan coverage, penemuan `{kategori, keutamaan, keyakinan, bukti, kesan, pemilik, tindakan}`, had semakan serta rujukan jadual/raw. Semua finding mesti merujuk task/context sebenar; agen tidak mencipta state, survivor atau skor.

## Satu pool simulasi, empat pembaca/analisis

Gunakan satu sumber runtime yang dibekukan dan satu pemilik bagi setiap journal. Penyelaras menjalankan collector engine kanonik; empat subagent menganalisis subset hasil yang sudah disahkan stabil. Agen tidak menjalankan semula collector penuh atau menulis journal yang sama.

Cadangan had operasi ialah **maksimum empat worker Node keseluruhan**, disesuaikan ke bawah mengikut CPU quota/RAM yang tersedia. Empat subagent LLM bukan empat CPU tambahan. Jika beberapa difficulty dijalankan serentak, jumlah worker semua proses tetap tidak melebihi had bersama. Setiap journal mempunyai seorang penulis.

`runPool` sedia ada sudah menyerahkan task seterusnya kepada thread yang lapang dalam satu invocation. Ini boleh digunakan oleh collector pusat. `run.cjs` masih memproses difficulty secara bersiri; protokol ini tidak mendakwa pelaksanaan serentak merentas tier sudah ditambah.

**Jangan gunakan empat panggilan `--seed-limit 25` untuk membahagi simulasi.** Flag itu memilih prefix registry yang sama, STM-001 hingga025. CLI semasa tiada selector seed manifest, lease atau merger untuk empat collector berasingan. Agihan25 seed di atas ialah skop analisis agen; collector penuh mengekalkan senarai100 seed dan context asalnya. Jika collector berasingan diperlukan kelak, bina dan uji adapter shard/merge terlebih dahulu, dengan source/protocol version baharu.

## Aliran kerja yang menjimatkan masa

1. Penyelaras membaca [Master SOR](../MASTER_SOR_PROJECT.md), AGENTS, governance, owner Map dan audit; merekod main/Map SHA sebenar serta diff relevan. Sediakan sumber sekali dan bekukan protokol sebelum mengumpul data. Jangan clone repo/aset atau salin raw penuh empat kali.
2. Enumerasi/validasi struktur dibuat sekali. Empat agen menilai kumpulan seed dan risiko masing-masing. Collector engine menggunakan pool terhad; policy, RNG, difficulty, ulangan dan limits kekal seperti protokol eksperimen.
3. Agen membaca context/manifest dan jadual seed/driver dahulu. Buka raw atau replay khusus hanya untuk finding, censor, missing ID, percanggahan atau diagnosis yang memerlukannya. Gunakan shard tertutup atau snapshot immutable; jangan membaca suffix yang masih sedang ditulis sebagai rekod lengkap.
4. Simpan hasil analisis agen dalam direktori sendiri, contohnya `reports/map-balance/<cohort>/agents/A/`. Kongsi rujukan raw; jangan menggandakan semua trace atau menjana CSV/global report empat kali. Pantau ruang sebelum collection/build/export dan berhenti antara task sebelum kehabisan ruang.
5. Penyelaras menggabungkan findings dan mengira laporan global daripada raw kanonik. **Jangan puratakan empat nilai CP atau empat ringkasan kadar menang.** Gunakan W/N dan denominator sebenar bagi scope/difficulty yang betul; matched triplet mengekalkan entry-state/RNG yang sama.
6. Jalankan verifier bebas, semakan diff dan penerbitan sekali bagi set perubahan akhir. Hanya penyelaras commit/push ke `balance/map`, dengan expected-head tanpa force dan readback ref/tree. Master membaca ringkasan dan bukti terpilih; `main` kekal di bawah arahan penerbitannya sendiri.

## Pengesahan dan penggunaan semula bukti

| Perubahan | Semakan yang sesuai |
| --- | --- |
| Dokumentasi/protokol sahaja | Ketepatan kenyataan, pautan, skema/agihan dan diff; tiada cohort atau suite game baharu diperlukan jika kod/input eksperimen tidak berubah. |
| Pembetulan analisis laporan | Guna raw immutable yang sama, pin fingerprint analisis baharu dan jana/verifikasi semula derivatif. Jangan mendakwa simulasi baharu. |
| UI/visual sahaja | Semak aliran, callback, bahasa/visual dan dependency terjejas. Callback entry/completion, RNG, state atau timing bukan lagi perubahan kosmetik. |
| Generator/topology | Validasi semua graph/laluan katalog, kuota, mandatory5/9/10, reachability, snapshot/save; cohort baharu apabila pengalaman laluan/entry berubah. |
| Combat/Economy/Predict/AI/loader/reward/recovery atau sumber runtime lain | Bekukan source/context/output baharu dan jalankan semakan serta kes eksperimen yang terjejas. Jangan relabel data2.40 sebagai2.47. |

Guna semula hasil engine hanya apabila identiti sumber/protokol/input/case benar-benar sepadan. Kunci global merangkumi cohort, difficulty, contextId dan task.id; task.id sahaja berulang antara tier. Hash mesti mengikat sumber/dependency, config, polisi, seed/runSeed/repetition, limits serta initial/entry-state/RNG yang relevan.

Resume hanya ID yang tiada rekod sah selepas membaca persisted shards. Loss, censor dan error yang sudah direkod kekal. Penulisan terputus memerlukan quarantine/pemulihan bukti; jangan membuang rekod lengkap. Semak duplikasi, percanggahan hash, case yang tiada/tidak dijangka, runtime identity, captured entries, triplet, resource accounting dan conservation.

`checkFiles()` menyemak integriti artifak tetapi membaca quality gate yang disimpan. Pengesahan akhir mesti turut menggunakan [verifier bebas](../tools/verify-map-advanced.py) untuk pengiraan semula daripada raw; PASS pembaca manifest sahaja tidak mencukupi. Scope unresolved mengekalkan CP null. Struktur, lawatan prefix, sepuluh node dan kemenangan dilapor berasingan.

Suite besar dijalankan mengikut risiko/diff pada integrasi akhir apabila berkaitan. Jangan mengulang suite penuh atau campaign yang sama bagi setiap save, subagent atau suntingan laporan. Semakan wajib yang relevan tidak ditinggalkan untuk mendapatkan masa yang lebih pendek.

## Laporan ringkas kepada Master

Urutan bacaan: audit terkini → handoff/summary/validation-index → jadual difficulty/seed/driver berkaitan → raw/replay terpilih. Kekalkan kewajipan membaca Master SOR dan AGENTS sebelum kerja repository.

Setiap laporan menyatakan `reportKind` (`PROTOCOL_ONLY` atau `MEASUREMENT`), SHA sumber sebenar, versi game/balance/polisi, source/config/runner hashes, manifest case, coverage, W/N, error/censor/missing, integrity gate, score gate, findings, had dan receipt penerbitan. Laporan setiap agen turut menyatakan seed/case ditugaskan, siap/pending, tempoh analisis aktif/elapsed dan blocker. Timing yang belum diukur kekal null.

Ukur masa hujung ke hujung: penyediaan, collection, analisis, verification dan publication. Bandingkan dengan jadual kes/coverage yang sama dan rekod CPU/RAM/concurrency/cache. **Tiada bukti4× kelajuan daripada empat agen sahaja.** Cadangan batch/CPU di atas ialah pilihan operasi yang boleh dinilai, bukan angka prestasi yang telah diukur.

## Hasil kemas kini ini

Empat subagent menyemak agihan beban, integriti/resume, strategi pengesahan dan handoff. Kesemuanya read-only, tanpa simulasi atau pengubahsuaian gameplay. Protokol, pelan awal dan audit didokumenkan untuk penggunaan sesi akan datang; Markdown ini tidak memasang daemon atau menghidupkan subagent latar secara automatik.

Data v1.5 kekal4,083 records pada2.40, dengan21 Easy skip censored dan117 rank CP null. N1 dan target murid90/70/50 masih memerlukan penilaian Master. [Handoff pengukuran](MAP_BALANCE_V1_5_HANDOFF.md) dan semua data sejarah dikekalkan. CP hanya rujukan pembangunan, bukan kuasa kad atau UI pemain.

## Resit penerbitan

Kandungan protokol diterbitkan pada `cd00417b0a85230ebd5d512ced4a9f191d626d3b`, tree `e6ce198b2f1253b5f641902c75228ee92f7e8bdb`, branch [balance/map](https://github.com/unDead41/slay-the-math-v2/tree/balance/map). Diff remote mengesahkan hanya7 fail Markdown/JSON yang disenaraikan berubah. Expected-head update tanpa force dan remote ref readback PASS. Tiada kod/data runtime, cohort sejarah atau main diubah. Commit resit susulan hanya melengkapkan rekod penerbitan ini.
