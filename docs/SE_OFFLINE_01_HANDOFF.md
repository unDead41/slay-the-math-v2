# SE-OFFLINE-01 — handoff untuk Simulation & Evidence

## Identiti semasa — Mathematics Slayer 2.52.0

Ijamm mengarahkan nama rasmi **Mathematics Slayer** pada 26 Oktober 2026.
Nama ini sama dalam BM dan English. Kekalkan repo/URL, identifier, storage keys,
schema, save/RNG, Alyssa, topik, angka, model dan aset asal. Portable utama ialah
`MATHEMATICS-SLAYER-OFFLINE.html`; `SLAY-THE-MATH-OFFLINE.html` ialah alias
byte-identical untuk laluan fail lama, bukan nama paparan semasa.
**Verifikasi calon pemulihan dan penerbitan 2.52.0 masih BELUM DISAHKAN**.
[Skop, bukti dan status](RENAME_MATHEMATICS_SLAYER_2_52_0.md). Nota keluaran terdahulu di bawah ialah sejarah
mengikut pin dan hasil asalnya; ujian lama bukan bukti calon pemulihan baharu.

## Historical main integration authorization — 2.51.0

Ijamm now requests listing the changes still pending and publishing them to main.
This authorizes the combined Online/Offline feature e941 and immutable registry
snapshot e057 with main 09a5 / 2.50.0 as 2.51.0, preserving current education,
VFX/Idle, numerical, save/RNG, language, AI and original-asset owners. This
supersedes the relevant branch-only boundaries below; their source pins and
original test outcomes remain history. Combined scoped compatibility is **VALID with carried P2 findings**: 175 focused
checks on 7a, 23 fresh final checks on 20b and the stated native groups pass.
Main publication is **VERIFIED** at `338e1f82d89a8fa54882ea08ab6d0e1ebe7d5a2b`, game 2.51.0,
with exact reviewed tree `b94729255bbbd2dfdcabf8cddf4308ed560a13d2`.
[Actual ref/parents/version and exact-code Pages SUCCESS](verification/online-main-20261026/publication.json).
This documentation receipt preserves the verified runnable/test/configuration bytes.
No simulation campaign, collector or model update is included. [Current scope,
evidence and limits](ONLINE_OFFLINE_MAIN_2_51_0.md).


26 Oktober2026, Asia/Kuala_Lumpur. **Branch sahaja: `fix/online-offline-readiness`. Jangan push/merge main.** Main rujukan `b3dc75005a89d6ce0248ddc125d6e0900351589a`, game2.49.1, Master SOR1.2.0. Candidate2.49.1-offline.2 membawa pembetulan offline terdahulu serta perubahan Idle/main2.49.1 tanpa mengubah artwork, engine, bank, balancing atau save/RNG.

## Finding dan pembetulan

Batch asal `SE-PILOT-20261025-B3DC750-01` mempunyai4FAIL A1–A4. A1/A3 benar-benar menyimpan760/760aset, tetapi SW lama sengaja melangkau navigation/HTML dan bootstrap meminta manifest daripada rangkaian. Asset counter bukan bukti shell boleh dimulakan semula. Reconnect asal memelihara save/RNG; ini bukan kehilangan save atau kekalahan gameplay.

Branch offline terdahulu menyediakan pemasangan penuh melalui Settings. Protokol asal batch tidak memilih Offline: kes startup masih memerlukan shell tersimpan ketika Online. Candidate ini menambah resit **startup** selepas gate75% penting: HTML, SW, canonical manifest dan semua fail startup pada release sama disimpan, dibuka semula dan disahkan hash. SW baharu boleh membina semula release daripada resit startup selepas proses browser ditutup. Navigation dipin dengan `stm-release`; setiap resource disahkan terhadap manifest sama. Script startup hilang/rosak atau release tidak sepadan gagal dengan recovery, tanpa menjalankan campuran kod.

Resit startup **berasingan** daripada resit pemasangan penuh. Ia membolehkan menu/Continue yang resource-nya sudah tersimpan. Aset bilik lain yang belum disimpan masih memerlukan sambungan/pemulihan. Label “Sedia dimainkan offline” masih memerlukan SEMUA769fail player disahkan; startup separa tidak mendapat label itu. Pilihan Online/Offline kekal satu, dan startup tersimpan tidak memberikan kebenaran pet API. Backend/key/data developer serta save diagnostik tidak dimasukkan dalam pakej player.

## Main bergerak selepas QA

Semakan akhir mendapati main maju kepada `509be90a3f211004c29379c96469f4e3a70cc0a4` /2.50.0 semasa kerja ini berjalan. Master SOR1.2.0, AGENTS dan laporan integrasi terkini telah dibaca. SW/bootstrap/asset-readiness main tidak berubah dan finding yang sama masih direkodkan sebagai OWNER-COLD-URL-OFFLINE. Candidate ini kekal terikat kepada base pilot B3DC750 yang diuji; ia **belum digabungkan dengan2.50.0**.

Sebelum integrasi main, Master mesti memelihara education recovery/report/Practice, body-aligned VFX, Tutorial recapture dan protokol/registry terbaru. Gabungkan hook Settings dengan perubahan app pendidikan dan regenerate package/release/HTML/manifest serta semak provenance Tutorial semasa. Jangan menggantikan tree main dengan tree branch ini. Replay branch ini sah sebagai regresi pada sumbernya; penerimaan gabungan2.50.0 memerlukan replay baharu pada SHA gabungan. [Delta/sempadan tepat](verification/se-offline-01/main-advance.json).

## Input asal yang mesti dikekalkan

| Kes | Seed asal | Cache asal | Bahasa / viewport |
| --- | --- | --- | --- |
| A1 |1568180215|full|en,1440×900|
| A2 |1235945743|startup|en,1440×900|
| A3 |905676559|full|ms,390×844|
| A4 |4075897635|startup|ms,390×844|

Pakej sumber ialah `Slay_the_Math_Batch_10_Bukti_B3DC750.zip`. Hash ZIP dan empat hash save asal tersedia dalam `tests/fixtures/se-offline-pilot.json`. Gunakan `raw/privileged/Ax-before-restart.json`; keempat-empat fail itu sama byte dengan `Ax-initial.json`. `originalEntryHash` ialah hash **fail JSON asal termasuk formatting**, bukan JSON yang diserialize semula. Runner memeriksa kedua-dua hash sebelum menyuntik save. Save penuh/hidden RNG/deck kekal dalam ZIP input diagnostik di luar `dist/`; ia tidak diterbitkan sebagai input policy atau fitting AI.

Hasil lama dan seed ledger asal kekal immutable. Ini **deliberate regression replay**, `trainingEligible=false`, bukan empat sampel bebas atau batch baharu. Jangan reservasi seed baharu untuk replay ini dan jangan menulis semula4FAIL asal sebagai PASS. Rekod source SHA/tree, manifest ID dan run ID replay baharu yang merujuk batch/case asal dalam registry kanonik pemilik Simulation.

## Cara mengulang

1. Fetch branch di atas dalam checkout terasing. Catat SHA penuh yang diterima dan bandingkan `publication.json`. Baca Master/AGENTS dan registry kanonik terkini; tiada perubahan balancing/training dibenarkan.
2. Ekstrak ZIP asal ke folder input di luar `dist/` dan `release-prod/`. Kekalkan bytes; jangan membina semula save melalui `newRun(seed)` kerana seed sahaja bukan keseluruhan identiti.
3. Jalankan `npm run build:prod`. Gunakan output sebenar `release-prod` pada subpath `/slay-the-math-v2/`, bukan portable HTML. Tetapkan Playwright/Chromium mengikut environment Simulation; contoh Linux di bawah.
4. Jalankan runner A1–A4 secara bersiri. Untuk replay source committed dist yang sama jenis dengan batch asal, gunakan `QA_DIST=dist` dan rekod lane itu berasingan daripada production. Jangan dakwa salah satu lane diuji jika hanya lane lain dijalankan.

```bash
export SE_BATCH_DIR=/absolute/path/to/extracted-original-batch
export BROWSER_QA_MODULE=/absolute/path/to/playwright
export QA_CHROMIUM_EXECUTABLE=/absolute/path/to/chromium
export QA_OUTPUT=/absolute/path/to/new-replay-output
npm run test:se-offline
```

`QA_PROFILE_ROOT` dan `TMPDIR` boleh diarahkan ke ruang sementara task sendiri apabila ruang disk environment tidak cukup. Jangan guna profil browser sebenar pemain. `SE_CASES=A1,A2,A3,A4` ialah penapis pilihan; tanpa penapis, keempat-empat kes dijalankan. Runner mengekalkan cache full/startup dan bahasa/viewport asal. A1/A3 menunggu semua entry **manifest candidate semasa**, bukan hardcode760 lama. A2/A4 berhenti pada cache startup dan mengesahkan baki aset serta full-readiness masih false.

Runner asal dalam ZIP menggunakan path environment asal dan versi collector akhirnya menapis B3/B4. Ia juga memeriksa Continue selepas cold navigation sebelum menekan gate Enter Game. Runner fokus ini menggunakan input/expected save asal dan menekan Enter seperti aliran biasa sebelum Continue; ini pembetulan interaksi harness, bukan mengurangkan assertion navigation, save atau RNG.

## Kriteria penerimaan replay

- Warm visit menyimpan resit startup yang telah disahkan sebelum Enter tersedia. Tidak ada langkah tambahan memilih Offline dalam keempat-empat kes asal.
- Tutup keseluruhan proses browser dan simpan profil; hentikan server asal. Buka proses baharu dengan profil sama, block network serta disable HTTP cache. Permintaan API tidak tercache mesti gagal.
- URL asal memberi navigation200 daripada SW dan dipin ke release yang sama seperti warm visit. HTML/manifest/script tidak boleh datang daripada release lain.
- Enter dan Continue berjaya. Seluruh save asal mesti deep-equal selepas cold boot dan Continue, termasuk RNG, deck, Gold, seed dan mode Learn. Bahasa asal kekal.
- Startup separa tidak mendakwa pakej penuh. Resource yang tidak ada kekal gagal/Retry; jangan menjana resource palsu atau membuat keputusan gameplay daripada visual fallback.
- Simpan report, before/cold screenshots sebenar, console errors dan identiti source/build. Jika gagal, kekalkan hasil FAIL dan diagnosis; jangan tukar seed/save atau mengubah sejarah batch asal.

## Hasil pemilik pembetulan dan batas

Replay tempatan A1–A4 candidate production telah lulus4/4, menggunakan keempat-empat save/seed asal. A1/A3 menyimpan766/766entry candidate, A2/A4 masing-masing341/339entry ketika ditutup; resit startup319fail termasuk canonical manifest. Hasil ini bukan rerun bebas oleh Simulation & Evidence. [Bukti replay](verification/se-offline-01/replay/report.json), [asal/pemeliharaan](verification/se-offline-01/origin-and-preservation.json), [audit](audits/se-offline-01/LATEST.md).

Chromium/Linux, software graphics dan profil filesystem tmpfs digunakan. Ini membuktikan CacheStorage merentas proses browser; bukan OS reboot, peranti fizikal, semua browser atau GitHub Pages awam. Audio manusia, latihan AI dan seluruh audit matematik di luar skop. MODEL.zip dan Matematik Tingkatan4 KSSM.pdf yang gagal dilampirkan tidak digunakan. Main tidak diubah; Simulation perlu menerima/menolak hasil replay sendiri sebelum menutup finding dalam registry.

## SHA untuk replay pemilik

Implementation terbitan yang mengandungi source dan bukti diuji ialah `ada427a88796a4f4f3f6d689d260a8be2a7cf8ff`. Receipt dokumentasi boleh menambah commit selepasnya tanpa menukar runnable bytes. Sahkan [publication.json](verification/se-offline-01/publication.json) dan pin SHA sebenar runner anda. Main readback09a5aa4 ialah metadata sahaja selepas code2.50.0/509be90; tiada integrasi2.50.0 didakwa oleh branch ini.
