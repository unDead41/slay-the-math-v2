# 16 — Aliran pembangunan dan pelan kerja

Status: CADANGAN. Pelan ialah sasaran dua minggu, bukan jaminan semua aset/ciri selesai tanpa melihat repo dan masa sebenar.

## Sesi kerja

1. Baca AGENTS, governance, daftar keputusan dan SOR domain.
2. Semak keadaan kod semasa serta perubahan yang belum disimpan.
3. Nyatakan satu hasil yang boleh diperiksa.
4. Laksanakan perubahan terkecil yang melengkapkan hasil itu.
5. Jalankan semakan berisiko tinggi yang berkaitan.
6. Kemas kini SOR/keputusan hanya jika kontrak berubah.
7. Buat handoff ringkas dengan bukti sebenar.

**DEV-01:** Jangan meminta Ijamm meluluskan semula kerja yang telah diminta. Teruskan pilihan rutin yang boleh dibalikkan; rekod andaian penting.

**DEV-02:** Jika maklumat belum ada, siapkan kerja yang tidak bergantung padanya. Tanya hanya perkara yang benar-benar menentukan arah atau membawa kerugian jika disalah anggap.

## Pelan 14 hari

| Hari | Hasil fokus | Bukti siap |
| --- | --- | --- |
| 1 | Audit repo/prototaip, mapping SOR, baseline input/data | Senarai jurang dan satu run sedia ada dicuba |
| 2 | Combat state, kos, draw/discard dan intent | Pertarungan kecil tanpa UI mewah berfungsi |
| 3 | Lima kad starter, Tapis/Tarik, guard transaksi | Boundary dan double-click disemak |
| 4 | Math engine, snapshot, pecahan dan soalan T1-P1/P3 | Contoh bebas tepat dan soalan tidak kabur |
| 5 | Predict/Focus T1-P2 serta contoh T2/T3 yang disemak | Penerangan sepadan dengan model |
| 6 | Stage 1 bercabang, boss pertama dan Rest | Aliran stage 1 lengkap |
| 7 | Stage 2, boss kedua dan dua Elite | Run boleh tamat dari mula |
| 8 | Reward, Gold, Shop/Mystery, save/resume dan recovery | Refresh tidak menggandakan reward/RNG |
| 9 | Komponen kad, HUD dan ikon konsisten | Screenshot saiz sebenar dapat dibaca |
| 10 | MC, musuh dan background minimum | Semua aset mempunyai anchor/manifest |
| 11 | Tutorial tiga topik, English, koleksi dan ringkasan | Pemain baharu memahami satu giliran |
| 12 | Responsif, akses dan tujuh cue audio minimum | Flow telefon/keyboard/reduced motion selesai |
| 13 | Playtest, balance dan regresi kritikal | Isu utama dicatat dan dibetulkan |
| 14 | Build/release candidate, panduan dan handoff | Bukti QA serta batas yang diketahui |

Jika prototaip sudah mempunyai sistem tertentu, audit dan perbaiki; jangan membinanya semula semata-mata untuk mengikuti urutan hari.

## Kawalan skop

Keutamaan: ketepatan matematik → tempur stabil → dua stage lengkap → save → UI boleh dibaca → seni/animasi tambahan.

Jika masa tidak cukup, kurangkan variasi ilustrasi, VFX dan dialog. Jangan membuang penerangan, menyembunyikan intent, atau melabel ciri rosak sebagai siap.

Permintaan baharu direkodkan sebagai sekarang/selepas MVP. Shop/Rest/Mystery/Elite telah masuk skop terkini; akaun, multiplayer, relik dan RFID kekal backlog. Passive draf tidak diaktifkan secara automatik.

## Kerja kod dan versi

- **DEV-03:** Simpan perubahan projek mengikut Git/workflow repo sedia ada; jangan overwrite kerja Ijamm.
- **DEV-04:** Gunakan commit yang menerangkan perubahan sebenar. Dokumentasi versi SOR berasingan daripada release game.
- **DEV-05:** Jangan menukar framework atau struktur seluruh repo kerana satu bug UI.
- **DEV-06:** Bagi tugas bebas yang memang didelegasikan, tentukan fail milik setiap orang/agent dan kontrak integrasi. Tiada keperluan menggunakan banyak agent untuk semua kerja.
- **DEV-07:** Selepas semakan lulus, ulang hanya jika ada perubahan, kegagalan atau risiko baharu.

## Handoff untuk sesi seterusnya

Simpan nota: objektif, versi/branch jika ada, fail diubah, keputusan baharu, ujian sebenar, bug terbuka dan satu langkah seterusnya. Jangan hanya menulis “continue”.

Rujukan kekal ialah fail projek, bukan andaian AI masih mengingati seluruh perbualan. Pada sesi baharu, semak semula konteks yang relevan daripada fail tersebut.

Templat tersedia dalam [17](17_AI_PROMPTS_TEMPLATES.md).

## Skop 2.0

Sheet MC/kad baharu ialah input reka bentuk. Pelan perlu mengutamakan graph, alias/English dan room minimum; jangan membina semula statistik tempur yang tidak berubah. T2/T3 memerlukan bank/flow yang diuji, bukan sekadar menambah simbol pada art.

Sasaran 14 hari perlu dinilai semula terhadap source dan masa sebenar kerana skop room bertambah. Kurangkan variasi event, stok, animasi dan dialog dahulu; jangan membuang permintaan map bercabang atau ketepatan matematik.


## Developer Hub — 2.21.0

Use `npm run start:dev` for the sandbox on port 4174, and `npm run start:prod` for a fresh player build/preview on port 4173. `npm start` remains compatible. Setup, isolation and actual supported controls: [Developer Tools](20_DEVELOPER_TOOLS.md).
