# 15 — QA, bukti semakan dan release

Status: CADANGAN. Pakej ini belum menjalankan ujian runtime game.

## Prinsip semakan

**QA-01:** Pilih semakan mengikut risiko perubahan. Jangan jalankan suite besar berulang apabila tiada perubahan, kegagalan atau kebimbangan baharu.

**QA-02:** Jangan menulis ujian yang hanya mengulang nombor/struktur implementation tanpa menguji keputusan penting. Gunakan hasil bebas, boundary dan aliran pemain sebenar.

**QA-03:** Bezakan PASS, FAIL, NOT_RUN dan BLOCKED. Simpan arahan/langkah, input, hasil sebenar dan versi yang diuji.

## Matriks minimum

| Risiko | Senario | Hasil yang dijangka |
| --- | --- | --- |
| Formula gabungan | 8 Serangan, 3 Api yang subset Serangan, N=12 | P(Serangan atau Api)=2/3 |
| Penggantian | Dua Serangan daripada pool 8/12 | Tanpa ganti 14/33; dengan ganti 4/9 |
| Peristiwa | Serangan dan Perisai pada satu kad | Saling eksklusif; bukan disimpulkan “tidak bersandar” |
| Snapshot | Tapis dua kad kemudian jana soalan baharu | Counts/penyebut daripada draw pile baharu |
| Kos/transaksi | Klik kad dua kali dan ketika resolving | Satu kos dan satu kesan |
| Tapis boundary | Draw pile <4 atau aktif selepas tapis <6 | Disabled; tiada kos/zon berubah |
| Shuffle | Draw habis, discard ada; kedua-duanya habis | Reshuffle sah; atau cabut yang tersedia tanpa crash |
| Fasa boss | HP 36→35 pada boss 70 HP | Fasa 2 pending; intent semasa kekal; pola baharu selepas itu |
| Lethal | Musuh mati semasa tindakan pemain | Battle tamat; musuh tidak bertindak/reward berganda |
| Resume | Refresh sebelum/selepas jawapan, kad, reward, kem | State dan RNG kekal; tiada cubaan/ganjaran tambahan |
| Save rosak | JSON/schema/ID kad tidak sah | Mesej jelas, recovery atau run baharu; tiada crash loop |
| Responsif/akses | Tiga viewport, keyboard, tap, reduced motion | Tindakan utama lengkap; tiada overlap atau drag wajib |

Bagi bug sebenar, tambah regresi khusus apabila ia melindungi tingkah laku penting. Perubahan ejaan atau padding biasanya cukup dengan semakan visual yang berkaitan.

## Semakan visual

- Kad: ukuran seragam, teks Tapis tidak terpotong, kos dan damage jelas.
- Ikon: tenaga/Fokus dan Tarik/Tapis dibezakan.
- MC: identiti serta sisi anatomi konsisten.
- Musuh: intent/fasa dapat dibaca, VFX tidak menutup teks.
- Telefon: butang tindakan dan hand boleh dicapai.
- Warna: ukuran kontras bagi pasangan penting direkod sebelum mendakwa target tercapai.

## Playtest

Uji satu aliran tutorial, satu run penuh hingga boss kedua, satu kekalahan, satu save/resume pertengahan battle dan satu run dengan banyak Ramalan dilangkau.

Rekod pemain/penyemak sebagai kod tempatan jika perlu, versi, seed, deck, masa aktif, bilangan giliran, sebab gagal dan pemerhatian. Jangan mengada-adakan hasil atau menganggap seorang pemain mewakili semua murid.

## Tahap isu

| Tahap | Contoh | Keputusan release |
| --- | --- | --- |
| P0 | Jawapan matematik salah, kehilangan save, exploit ganjaran besar | Sekat release kandungan terlibat |
| P1 | Soft-lock battle, intent salah, kos berganda, flow telefon tidak boleh tamat | Baiki sebelum release |
| P2 | Clipping kecil, animasi kasar, mesej kurang jelas | Baiki jika mengganggu keputusan; selain itu rekod |
| P3 | Dekorasi, variasi art tambahan | Backlog |

## Syarat “siap”

**QA-04:** Kod/data/teks sepadan dengan SOR, semakan berkaitan mempunyai bukti, isu P0/P1 selesai, save boleh diteruskan, dan batas yang diketahui dilaporkan.

**QA-05:** Untuk release, catat versi game, contentVersion, schemaVersion, versi SOR, commit/tag jika ada, senarai semakan dan cara kembali kepada versi stabil.

**QA-06:** Jangan memanggil build/deploy sebagai berjaya hanya kerana command dimulakan. Tunggu hasil dan semak aliran yang berubah.

## Templat bukti

> Perubahan/versi: …  
> Risiko: …  
> Semakan dan input: …  
> Jangkaan: …  
> Hasil sebenar: …  
> Status: PASS / FAIL / NOT_RUN / BLOCKED  
> Had atau isu susulan: …

Pakej dokumentasi ini hanya boleh mendakwa semakan fail, pautan, struktur dan pengiraan contoh apabila semakan tersebut benar-benar dibuat.

## Semakan tambahan 2.0

| Risiko | Semakan | Jangkaan |
| --- | --- | --- |
| Rujukan | Hash dua JPEG terhadap sumber | Byte sama, saiz sumber dilabel tepat |
| Topik | T1/T2/T3 dan subfokus Probability | Tiada kehilangan Expansion/Factorisation atau Indices |
| Algebra/indices | Semak empat contoh setiap domain secara bebas | Pengembangan, faktor penuh dan hukum eksponen tepat |
| Kategori | Alias Guard dan konsep Ward | Starter kekal 12; Ward dikecualikan |
| Bahasa | Semua copy pemain dan bitmap sumber | Produksi English; JPEG BM hanya rujukan |
| Map | Semua path, cycle, next edges, boss | DAG sah, boss reachable, tiada jump/backtrack |
| Shop/Event | Refresh sebelum/selepas pilihan | Gold/kad/claim tepat sekali |
| Audio | Stage/room berubah dan rerender | Tujuh cue wajib dikenal; Elite 1/2 berbeza; satu loop aktif |
| MC | Lantern/folio dalam semua pandangan | Sisi konsisten, belakang mengikut sheet baharu |

Ujian runtime di atas ialah keperluan untuk implementation, bukan ujian game yang sudah dijalankan oleh pakej dokumen.

## Combat polish regressions — 2.9.0

Check all six Skill matrices/body heights and actual canvas frames, cap/partial/artifact draws, full-hand RNG stability, physical-card conservation and legacy restore. Resolve real lethal damage and verify result Time after menu, dialogs, refresh and elapsed waiting. Exercise crowded-hand hover dwell, rapid crossings, stationary pointer, cancellation, native keyboard/touch, reduced motion, empty hand and phone rail access through the tenth card. Evidence: `tests/run-polish.test.cjs`, `tests/hand-results-browser.cjs`, `tests/animation.test.cjs` and the 2.9.0 verification report.

## Both-stage enemy motion — 2.10.0

Verify native pixels/alpha for all supplied sheets and individual cells, padding and every fixed-matrix frame bound. Exercise all 10 actors / 50 clips in Chromium, native player-hit reactions and each Stage 2 intent cycle against an independent engine clone. Check blocked hits, dialogs, Motion Off/OS reduction, refresh, Canvas/atlas failures and same-source posters. Check all 135 Stage 2 bounds inside the arena across desktop, ultrawide, 4K and phone sizes. Preserve bosses, legacy cross-stage rendering and Alyssa's accepted registry/Skill projection; test the generated portable file offline. Evidence: `tests/enemy-motion.test.cjs`, `tests/enemy-motion-browser.cjs`, source import audits and [2.10.0 report](../ENEMY_MOTION_2_10_0.md). Distinguish browser automation from physical-device/Windows testing.


## Parchment map and integrated mechanics — 2.11.0

For 2.11.0 verify the supplied suite independently, original question/choice/effect alignment, both More Hint event orders, corrupt profile preservation, old pending saves, explicit exactly-once claim, no repeat/adaptive profile history, unscored Basics, reveal gating and all 120 rich-rendered items/240 visuals. Exercise Codex search/clear/tier, comparisons without mutation, keyboard tab focus, one shared tooltip across dialogs/domains and real counter projection. Check map at eight viewports, both stages/legacy paths and native entry/panning; smoke the generated portable file offline. Report actual results and physical-device/Windows limitations in docs/MAP_INTEGRATION_2_11_0.md.


## Map, modes, Boss and Shop — 2.12.0

2.12 acceptance: six-card/six-artifact 3×2 layouts, exactly one 60% sale, all purchase/removal/discount/cancel/reload paths, legacy shops and giftless Challenge, no duplicate one-shot effects or forged state; both bosses all sixty frame timings, anatomy floor and VFX bounds, live reactions/reduced motion/fallback/offline. Keep the all-120-item integration browser regression and read-only question audit. Actual results: docs/verification/release-2-12.json.


## Question feedback — 2.15.0

Verify all 120 question-to-comment bindings and reload/edit behavior; Hint/Review/Learning reset must preserve comments, run and rewarded history. Cover multi-tab writes, corrupt/quota storage, inert text, CSV formula safety, explicit file download/share, cancelled/unsupported sharing, and trusted frame/origin exit gating. Inspect the real game popup and narrow layout. Distinguish stubbed native Share from OS recipient testing. Evidence: docs/verification/question-feedback/report.json and docs/QUESTION_FEEDBACK_2_15_0.md.


## Question language — 2.16.0

Whole-question English/Bahasa Melayu is implemented on education. Source review, scope and validation: [Question language](../QUESTION_LANGUAGE_2_16_0.md).


## Education entry points — 2.16.1

Current menu language/Practice controls, shared learning presentation and stable versioned entry pages: [fix and actual checks](../EDUCATION_ENTRYPOINTS_2_16_1.md). Offline generated output is now SLAY-THE-MATH-OFFLINE.html.
