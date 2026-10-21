# Integrasi rich text artifact V3.2

1. Buka `../ARTIFACT_RICH_TEXT_PREVIEW.html` untuk melihat semua 31 artifact, kategori warna, definisi dan contoh calculation. Fail ini ialah preview, bukan source game.
2. `glossary.json` menyimpan 55 entri: math/pink dan game/hijau. `artifact_richtext.json` menyimpan description English, segmen rich text berstruktur, ID term, aturan dan snapshot contoh bagi setiap artifact.
3. Import `theme.css` dengan scope `[data-stm-richtext]`. Jangan aplikasikan warna pada seluruh paragraph. Teks biasa mewarisi design game.
4. `theme.json` ialah standard warna dan garis bawah. Calculation ungu; math pink; game hijau. Kekalkan garis bertitik/putus-putus dan sokong hover, fokus dan tap.
5. Segmen `text` dipaparkan sebagai teks biasa. Segmen `term` dipaparkan sebagai sasaran hover berwarna mengikut kategori dan menggunakan definisi `glossary_id`.
6. Nilai calculation datang daripada kejadian sebenar core game. Paparkan hasil akhir sahaja dan bina tooltip daripada snapshot sumber, nilai sebelum, langkah, had dan nilai selepas. Jangan guna angka `example_snapshot` sebagai nilai gameplay.
7. Pisahkan perubahan HP dan baki HP, juga unit berbeza. Nombor calculation dan istilah unit bersebelahan ialah dua sasaran hover; jangan sarangkan button.
8. Untuk frasa campuran seperti `50% Max HP or less`, gunakan segmen pink / hijau / pink yang telah diberikan.
9. Fungsi Focus, had resource/Hand, scaling stat dan agihan dadu perlu dipadankan dengan core game. Jangan menyiarkan nilai atau kebarangkalian yang belum disahkan.

Kemas kini ini menyertakan data, standard dan preview rich text. Ia mengekalkan semua artwork serta nilai kesan artifact asal, dan tidak mengubah source game yang tiada dalam ZIP aset ini.
