# Stage 1 Enemy Animations — Standardized v3

Pakej tunggal untuk **lima musuh Stage 1**, merangkumi **25 animasi dan 128 frame**. Normal: Rune Bat, Ember Mirror, Prism Guard. Elite: Mirror Knight, Shard Beast. Semua menghadap kiri.

Extract seluruh ZIP, kemudian buka **OPEN_PREVIEW.html**. Pilih aksi untuk membandingkan semua musuh, atau pilih satu musuh untuk semakan lebih besar. Pause, Previous/Next dan slider boleh digunakan untuk melihat frame. Preview memuatkan hanya sheet Idle dan aksi semasa.

## Standard bersama

- Frame **768 × 768 px**, PNG **RGBA8 / sRGB / straight alpha**.
- Spritesheet **2560 × 1728 px**, grid **3 kolum × 2 baris**.
- Padding dalaman minimum **96 px** pada atas, bawah, kiri dan kanan.
- Gap **64 px**, margin luar **64 px**, semuanya alpha 0. Petak yang tidak digunakan juga alpha 0.
- Pivot tetap **(0.5, 0.5)**, tanpa trim atau recenter per frame.
- Skala Idle: median sisi terpanjang siluet **384 px ±1 px**, diukur pada alpha ≥16. Nisbah badan setiap spesies dikekalkan.
- FPS sama bagi semua musuh: **Idle 6, Attack 12, Defend 10, Skill 10, Damaged 12**.
- Idle loop; aksi lain sekali kemudian kembali ke Idle/state semasa.

Semua piksel artwork dan urutan frame asal dipelihara. Bekas PNG diberi header warna sRGB yang seragam. Perbezaan format manifest lama disatukan kepada schema v3. Defend Rune Bat dan Ember Mirror berubah daripada 8 kepada 10 FPS supaya sepadan dengan musuh lain.

## Jumlah frame

| Enemy | Type | Idle | Attack | Defend | Skill | Damaged | Total |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Rune Bat | normal | 4 | 6 | 4 | 6 | 3 | 23 |
| Ember Mirror | normal | 4 | 6 | 4 | 6 | 3 | 23 |
| Prism Guard | normal | 6 | 6 | 6 | 6 | 4 | 28 |
| Mirror Knight | elite | 6 | 6 | 6 | 6 | 3 | 27 |
| Shard Beast | elite | 6 | 6 | 6 | 6 | 3 | 27 |

Jumlah frame mengikut gerakan asal setiap watak. Tiada frame tambahan dibuat untuk menyamakan bilangan. Damaged Prism Guard mengekalkan keempat-empat frame yang telah dipersetujui. Sesetengah Attack/Defend/Skill mempunyai neutral sama pada permulaan dan penghujung; pengulangan endpoint itu disenaraikan dalam manifest. Semua frame dalam setiap aksi Damaged berbeza.

## Import

Gunakan **animation_manifest.json** sebagai indeks utama semua musuh. Setiap folder `enemies/<id>/` turut mempunyai manifest dengan schema yang sama dan path relatif kepada folder itu. `animation_registry.js` ialah salinan data dalam bentuk global JavaScript untuk akses tanpa fetch; ia juga digunakan oleh preview offline.

Untuk slicing grid: `frameWidth: 768`, `frameHeight: 768`, `margin: 64`, `spacing: 64`. Bagi frame indeks `i`, `(x,y) = (64 + (i % 3) × 832, 64 + floor(i / 3) × 832)`. Ambil hanya indeks aktif yang disenaraikan; elakkan petak kosong.

Atlas JSON hash disediakan bagi setiap sheet. `import_manifest.json` mengumpulkan lima texture setiap musuh supaya engine boleh memuatkan musuh yang diperlukan. Semua key texture/animasi dan nama frame menggunakan prefix ID musuh yang konsisten.

Attack contact dan Skill release: cadangan frame **3**. Defend boleh hold frame **2**, kemudian resume **3** sehingga akhir. Indeks bermula 0. Event gameplay dicetuskan sekali bagi satu tindakan; FPS tidak menentukan jumlah damage/Block.

Gunakan display scale yang sama untuk semua musuh. Kekalkan keseluruhan canvas dan pivot; saiz VFX tidak digunakan untuk autoscale. Posisi badan/kaki yang telah diterima dipelihara supaya standardisasi tidak menambah jitter.

## Kandungan

- `enemies/`: 25 sheet, 128 PNG individu, 25 atlas dan lima manifest seragam.
- `previews/`: satu WebP semua aksi bagi setiap musuh, contact sheet semua frame dan perbandingan skala. Media review beresolusi lebih rendah; fail runtime kekal 768 px.
- `SOR_ANIMATION.md`, `FRAME_COUNTS.csv`, `validation_report.json`, `SHA256SUMS.txt`: standard dan bukti semakan.
- `sources/`: audit ZIP input, checksum, manifest asal serta prompt janaan yang tersedia. Manifest asal ialah rekod sumber; manifest v3 di root/folder musuh ialah spesifikasi import.

Dalam mode Pause dengan semua musuh dipaparkan, slider berhenti pada frame akhir bagi animasi yang lebih pendek. Pilih satu musuh untuk mendapatkan julat slider tepat bagi musuh itu. Ini tingkah laku preview sahaja; fail animasi tidak menambah salinan frame.

Semakan dimensi, alpha, padding, pixel sumber/output, atlas, path preview dan integriti ZIP dilakukan. Import engine dan timing combat belum diuji dalam projek game.
