# Tangkapan menu selepas pembetulan keyboard

Alat pemilik yang tidak diubah dijalankan sekali dengan `TUTORIAL_CAPTURE_GROUP=menu` pada checkpoint tempatan bersih `ff3dcb5dbf4de5dd1ec72bf320ea8c209455e4a2`, tree `ff0907988895735fe08a21fc6b128a6f1dcbdfca`. Hasil: **20 tangkapan sebenar, 10 EN + 10 BM, exit 0, 37.797 saat, tiada kegagalan kumpulan**. Ini bukan ulangan penuh 98 gambar.

| Rekod katalog akhir | Bilangan | Sumber tangkapan sebenar | Input digest |
| --- | ---: | --- | --- |
| Kumpulan menu | 20 | ff3dcb5 | 62850ff6653ca2e15db48706c0c68fab9c6d7eef5cc2305b36a2489bb969dcf3 |
| Kumpulan lain | 78 | 6033478 | 7d24adee1ff9f6004b1345fa8d03ad6369a3ae48bf9c0b76202a7d0915b06899 |

Katalog akhir tetap mempunyai **98 ID/bahasa unik, 49 EN + 49 BM**. Keempat-empat bitmap menu berubah; 16 bitmap menu kekal sama selepas tangkapan sebenar. Semua 78 rekod lain, bitmap, tindakan, crop, input digest dan snapshot sumber asal kekal tepat. Katalog penuh sebelum pembetulan disalin byte-exact sebagai `prior-screenshots.json`, SHA256 `403f5b101e4bc15d2e909a8f1c62a28171e92c5e55f504473d14e0d2646f024f`.

App penuh kekal `0ae062696552ea7ce98ab481828a373dc5ea44e46e190caab625e7494d8f97fe` dan engine kekal `b6bf46d878555bfcf17051fe3a60473979e77449247895e36e9fe4c3ed570bcc` dalam kedua-dua batch. Snapshot asal tidak dilabel semula. Ujian strict raw app, alat capture dan semua 107 input semasa kekal sepanjang tangkapan menu. Tiada normalisasi atau pengecualian hash ditambah.

Perbezaan input runtime antara batch pertama dan batch menu baharu hanya: `dist/index.html`, `dist/play-mode-ui.js`, `dist/release.js`. Pembaikan UI mengaktifkan radio Settings melalui keyboard; markup, app dan renderer lain tidak berubah. Gambar tidak membuktikan keyboard berfungsi: itu ialah bukti native QA yang berasingan.

Katalog baharu: SHA256 `bf81a0a0c1d353e829e561be1de5252fe70cfa0f61c3816d1287a2cf3c4f813a`. Semua 99 output, hash dan saiz berada dalam `output-hashes.json`; bukti 20 baharu / 78 dikekalkan berada dalam `capture-integrity.json`. Alat menutup context/browser dan server sebelum exit 0; slot browser telah dilepaskan kepada Release Manager dan QA. Final build serta semakan strict/native selepas build masih di bawah pemilik masing-masing. Pet kekal FAQ tempatan dan kontrak adapter/permission; tiada backend AI hidup dikonfigurasi.
