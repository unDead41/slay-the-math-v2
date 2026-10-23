# Handoff kepada Balance Master

**Base:** 2800f9aeba5ed594e6ef3f991bcf4dfa498a5de7 (2.24.0). **Branch:** balance/economy. Tiada merge atau push ke main dilakukan.

Baca [SOR Economy & Rewards](SOR_ECONOMY_REWARDS.md), [audit runtime](AUDIT_RUNTIME.md), [dapatan simulasi](SIMULATION_FINDINGS.md) dan jadual dalam `tables/`. Data mentah/seeds/resit dalam `evidence/`; empat plot dalam `figures/`.

## Diserahkan

- Calon opt-in economy-1.2-candidate.1: private source-derived loot, source/category rules, rarity dua peringkat, bounded support/duplicate/stage factors, immutable receipts.
- Shop enam unik/satu sale 60%, rarity pricing, single final rounding, strongest actual discount, 3/2/1 artifacts dengan Boss Stage 1 locked, removal berbayar meningkat dan floor sepuluh.
- Profil Gold/recovery/event untuk Easy/Medium/Hard, semua 15 event, live preview dan exact deadline yang disimpan.
- Current/default dan pending legacy saves kekal nilai asal. Tiada perubahan card-combat stats, enemy stats, map topology, question bank, shuffle atau RNG soalan.

## Bukti dan had

30,720 tawaran kad / 512 seed / 60 cohort; 16,384 tawaran artifak / 32 cohort; 432 unjuran Gold/recovery /12 seed. Bukan engine Combat-policy campaigns dan bukan kadar kemenangan murid. Combat fixture sengaja set musuh 1 HP/open seals selepas declared damage budget supaya transaksi sebenar boleh diuji tanpa menyamar sebagai bot balance. Manifest menerangkan setiap andaian.

Rarity first-slot dalam tolerance eksploratori; pasangan support ON/OFF mengekalkan rarity. Exposure supported +0.46–4.36 mata peratus. Tiada sifar kad mampu beli dalam lawatan Shop pada conditional all-wins cohort. Saver menamatkan run dengan Gold berlebihan; kos/artifact power dan kesempatan belanja perlu dinilai bersama.

**Map handoff:** 9/24 graph stage baseline tiada route tanpa Elite. Lihat evidence/map_route_inputs.json untuk seed/path minimum. Economy tidak mengubahnya.

## Input yang belum tersedia

`NEEDS_INPUT`: ICP/CCP terukur dan artifak Combat final; HP/definisi difficulty penuh; cadangan Merchant/Contract/Purse; graph/timing Shop dari Map; pickup/skip/feedback dan cohort murid. Buat masa ini semua artifak dan Combat ialah 2.24.0, Max HP 60, discount 5%/15%, Purse +25. Versi ekonomi calon ini tidak bermaksud full Balance v1.2 telah aktif.

## Integrasi yang perlu dikekalkan

1. Bind `{economy:true,difficulty,support}` pada New Run melalui konfigurasi global Master. Difficulty ekonomi bebas Learn/Challenge dan tidak mengubah multiplier tempur Learn.
2. Pin semua input snapshot/balanceVersion. Jika Combat mengubah definisi requirement, stat atau artifact values, gunakan versi baharu dan retain adapter/definisi bagi save lama; jangan reroll receipt yang telah dibuka.
3. Jangan menyalin seluruh file engine.js/artifacts.js/mystery.js atas branch Combat secara buta; gabungkan hooks domain ini bersama perubahan Combat pada base yang sama.
4. Tiga slot Passive ialah aktif dalam Combat; ownership boleh melebihi tiga. Artifact eligibility hanya capability sebenar, termasuk Hand-discard yang sah.
5. Semak laporan Gold yang dinormalisasi: runtime lama memberi +60 selepas Boss 2, calon terus victory. Jadual perbandingan mengecualikan post-run Gold lama itu.
6. Upgrade quote ×1.20 disokong; Shop kini menjual unupgraded. n removal mengira servis Shop berbayar, bukan free ME10. Ini pilihan implementer yang direkod dan boleh ditukar melalui versi jika Master menentukan sebaliknya.

Sasaran murid Easy/Medium/Hard 90/70/50 kekal **UNMEASURED**. Pilih cohort playtest dan semak Wilson CI mengikut SOR Balance; jangan menukar hasil model ekonomi kepada dakwaan kemenangan murid.
