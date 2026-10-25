# Tangkapan tutorial — 2.51.0

**VALID untuk tangkapan tempatan.** Keserasian release gabungan masih menunggu build akhir, QA dan semakan penerbitan.

Alat pemilik `node tools/capture-tutorial.cjs` dijalankan sekali pada checkpoint tempatan bersih `6033478c0d6279258ed153dae4e0e19ef83bff1d`, tree `11675d86b21bab796171174b6a84db24a68aec24`. Ia tamat dengan exit 0 selepas 415.879 saat: **98 tangkapan sebenar, 49 English + 49 BM**, tiada kegagalan kumpulan, berjumlah 6,031,332 bait imej. Dua belas WebP berubah; 86 kekal sama walaupun ditangkap semula. Delta selepas checkpoint itu hanya 13 fail imej/katalog.

Katalog semasa mempunyai satu batch sebenar dengan input digest `7d24adee1ff9f6004b1345fa8d03ad6369a3ae48bf9c0b76202a7d0915b06899`. SHA256 app penuh ialah `0ae062696552ea7ce98ab481828a373dc5ea44e46e190caab625e7494d8f97fe`. Semua 107 input runtime, alat pemilik dan ujian provenance kekal sama sepanjang tangkapan. Setiap imej sepadan dengan hash, bait, tindakan, crop serta input app/engine yang direkodkan. Katalog 2.50 terdahulu dikekalkan byte-exact dalam `prior-screenshots.json`; tiada snapshot lama dilabel semula.

Ujian kini memadankan app penuh tanpa pengecualian yang membuang dua hook Settings. Assertion negatif untuk perubahan runtime lain dikekalkan. Sebelum tangkapan baharu, mismatch sebenar menghasilkan **1 PASS / 2 FAIL daripada 3 ujian**; rekod itu kekal sejarah. Semakan akhir menunggu manifest dijana semula oleh Release Manager dan QA pada calon beku. Tiada GREEN daripada manifest lama didakwa.

Alat pemilik menunggu context/browser ditutup dan menghentikan server dalam `finally`, kemudian exit 0. Slot browser dilepaskan secara jelas kepada Release Manager dan QA. Context tangkapan menggunakan polisi Service Worker disekat milik alat asal. Gambar ini tidak membuktikan pemasangan offline persisten, deployment atau API hidup. Skop pet ialah FAQ tempatan serta kontrak permission/adapter; backend AI hidup belum dikonfigurasi.

Semakan teks baca sahaja: `tutorial-data.js` baris 18–29 tidak menjanjikan 75% atau offline penuh; arahan Enter, Retry serta persediaan bilik/Practice masih tepat. Settings baris 267–279 mengekalkan bahasa, export/import, motion, status dan audio. Gambar EN/BM sebenar masih menunjukkan kedua-dua kawalan save; kawalan paparan di bawah memerlukan scroll dialog. **Cadangan pilihan P3:** nota pendek dwibahasa bahawa persediaan offline penuh mesti mencapai Ready dalam Settings, serta arahan scroll untuk save/paparan. Tiada perubahan struktur 23 bab / 12 latihan atau runtime dibuat untuk semakan teks ini.

- `output-hashes.json`: kesemua 99 laluan keluaran, saiz dan SHA256.
- `capture-integrity.json`: padanan sumber, metadata, imej dan delta.
- `capture-command.json` / `capture.log`: arahan sebenar, persekitaran khusus, tempoh dan exit.
- `strict-provenance-red.log`: kegagalan provenance asal yang dikekalkan.
