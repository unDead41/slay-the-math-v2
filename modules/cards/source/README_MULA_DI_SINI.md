# SLAY THE MATH — Card Master Pack v1

Pakej gabungan 40 ikon pilihan Ijamm, semua bingkai Normal/Focus, mekanik lengkap sebagai cadangan playtest, rich text dan preview luar talian.

1. Extract All ZIP ke satu folder. Jangan jalankan HTML terus dari dalam ZIP.
2. Buka **OPEN_CARD_PREVIEW.html** menggunakan Chrome, Edge atau Firefox. Tiada server, internet atau pemasangan diperlukan untuk preview.
3. Pilih kategori, cari nama kad, tukar EN/BM dan cuba Focus ON/OFF.
4. Hover, sentuh atau tekan Tab pada istilah bergaris putus-putus untuk melihat pengiraan atau maksud istilah.
5. Klik Details untuk Normal/Focus dan aturan kesan yang khusus bagi kad tersebut.

## Apa yang lengkap

- 40 ikon individu dengan padanan nama/kod/kategori asal, 4 sheet dan 1 overview.
- 4 frame Normal + 3 frame Focus pada resolusi native dan eksport 4K, bersama SVG dan overlay asal.
- 40 definisi mekanik: kos Energy, rarity cadangan, kesan, timing, syarat, Passive dan aturan Focus.
- EN/BM untuk penerangan mekanik. Nama kad asal dikekalkan.
- Data JSON, helper preview JavaScript, CSS rich text, SOR dan ujian kontrak.

**Status:** angka asas, kos, rarity, kesan tambahan dan Passive yang belum disediakan dalam input dilengkapkan sebagai **cadangan baharu untuk playtest**. Bonus Focus daripada input dikekalkan. Ini bukan dakwaan balance sudah diuji melalui gameplay. Pakej ini belum mengubah repository atau main game.

| Fail / folder | Kegunaan |
|---|---|
| OPEN_CARD_PREVIEW.html | Lihat dan bandingkan semua kad dengan rich text |
| data/cards.master.json | Rujukan mekanik utama, semua 40 kad |
| docs/00_CARD_CATALOGUE.md | Jadual 40 kad Normal/Focus, EN/BM |
| docs/01_CARD_MECHANICS_SOR.md | Peraturan mekanik dan aturan kesan |
| docs/02_RICH_TEXT_SOR.md | Kontrak rich text dan tooltips |
| docs/03_INTEGRATION.md | Panduan memasang dalam game sebenar |
| assets/icons | PNG pilihan asal dan rekod pemilihan |
| assets/frames | Semua bingkai, SVG, overlay dan metadata asal |
| references/Focus_Balance_v1 | Fail balance input tanpa perubahan |
| data/asset-map.json | Padanan aset kepada package card ID |
| data/runtime-id-map.json | Jadual pemetaan ke runtime untuk integrasi kemudian |
| tests/card-kit.test.cjs | Semakan data dan pengiraan; jalankan dengan Node.js |
| VALIDATION_REPORT.json | Keputusan verifikasi pakej |
| SHA256SUMS.txt | Hash integriti semua fail pakej |

Simpan keseluruhan folder bersama; HTML bergantung pada fail relatif. Sumber bingkai 4K ialah eksport berskala daripada sumber asal, bukan lukisan native 4K. PNG ikon asal ialah ilustrasi legap dan diskalakan secara seragam menggunakan contain dalam ruang artwork yang dimask.

## Kemas kini bahasa 1.1

Nama kad, semua penerangan, Butiran, tooltip dan menu kini menggunakan BM/BI. Cari nama BM atau nama asal English dalam mana-mana bahasa. Buka `OPEN_CARD_PREVIEW.html`, kemudian tekan BM atau BI. Fail mesti diekstrak bersama folder assets/data/src.

Bahasa diringkaskan untuk pembaca muda. Istilah matematik disemak dengan ketiga-tiga PDF KSSM/DSKP yang dibekalkan. Halaman sumber, perbezaan istilah permainan dan matematik, serta kontrak integrasi: `docs/04_BILINGUAL_LANGUAGE_SOR.md`. Nama asal, gambar, nilai dan mekanik dikekalkan. Katalog bahasa boleh disambung kepada game; pakej ini sendiri bukan pelaksana 40 mekanik tempur.
