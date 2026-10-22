# BM / English — Card Language SOR 1.1

Arahan Ijamm, 22 Oktober 2026: semua kandungan kad yang hendak digunakan dalam game menyokong BM/BI, dengan bahasa mudah yang boleh dibaca murid Tingkatan 1. Istilah matematik dirujuk kepada buku KSSM BM/BI dan DSKP yang dibekalkan. Ini sasaran penulisan; belum ada ujian kefahaman murid. Skop matematik Tingkatan 4 tidak ditukar kepada sukatan Tingkatan 1.

## Paparan pemain

- Nama paparan, penerangan 40 kad, butiran kesan, 25 tooltip, pengiraan, kategori, rarity, notis Fokus, label kawalan, carian dan teks bantuan ikut bahasa pilihan.
- `card.name` dan `card.id` kekal. `display_name.en/bm` ialah nama paparan. Nama asal turut dipaparkan dalam Butiran BM dan kedua-dua nama boleh dicari dalam kedua-dua bahasa.
- BM menggunakan ayat pendek. Contoh: “Beri 6 kerosakan.” / “Deal 6 damage.”; “Ambil 2 kad.” / “Draw 2 cards.”
- Defend = Bertahan (jenis kad); Defense = Pertahanan (sifat); Block = Blok (nilai penghalang kerosakan). Ini istilah permainan yang ditulis untuk projek, bukan istilah matematik rasmi.
- Bahasa `ms`, `ms-MY` dan `bm` menggunakan BM. `en`, `bi` dan bahasa lain menggunakan English. UI menggunakan butang BM/BI.
- Nilai pada kad dan tooltip datang daripada `preparePlay` yang sama. Fungsi paparan tidak membayar kos, mengubah kad atau memajukan RNG.
- Warna rich text kekal: pengiraan ungu lembut; istilah matematik merah jambu lembut; istilah permainan hijau lembut. Hover, tap dan Tab membuka tooltip. Escape menutupnya.
- Gambar, ID, kos, rarity, nilai, timing, Focus dan Passive asal dikekalkan. Hanya teks dan fungsi paparan bahasa dikemas kini.

## Sumber yang benar-benar diperiksa

Nombor PDF ialah nombor halaman fail, bermula 1. Nombor bercetak ialah nombor dalam buku. SHA-256 sumber direkod dalam `data/cards.master.json` → `localization_sources`.

| Sumber | Halaman PDF | Halaman bercetak | Digunakan untuk |
| --- | --- | --- | --- |
| Matematik Tingkatan 4 KSSM.pdf | 50 | 49 | Istilah Peratus (%) dan contoh nilai peratus |
| Mathematics Form 4 KSSM.pdf | 58 | 49 | Percentage (%) dan contoh nilai peratus |
| Matematik Tingkatan 4 KSSM.pdf | 245–246 | 244–245 | rawak, ruang sampel, kesudahan; konteks pemilihan berulang |
| Mathematics Form 4 KSSM.pdf | 253–254 | 244–245 | at random, sample space, outcomes; konteks pemilihan |
| DSKP KSSM MATEMATIK TG 4 dan 5.pdf | 81–83 | 67–69 | Bidang Kebarangkalian Peristiwa Bergabung; SP 9.1.1 dan 9.2.1–9.2.3 |

Istilah matematik yang benar-benar digunakan oleh kad ialah `%` (peratus / percent) dan `rawak / random`. Buku menggunakan tajuk “Percentage (%)”; tooltip English menggunakan ayat mudah “Percent means out of 100.” Formula peratus HP dan contoh 30% × 60 = 18 ialah contoh pengajaran yang ditulis untuk game.

DSKP menyokong pemetaan bidang; ia tidak menetapkan kos kad, peluang sasaran game, HP atau mekanik Fokus. Bagi Fate Storm, peluang sama dan sasaran boleh berulang ialah peraturan asal pakej. Ia tidak bermaksud semua pemilihan rawak dalam matematik mesti mempunyai peluang sama. Jika satu musuh tewas, pemilihan serangan seterusnya hanya menggunakan musuh yang masih hidup. Tiada andaian bahawa semua pukulan mempunyai ruang sampel yang sama.

## Penggunaan dalam game

`kit.cardName(card, lang)`, `kit.cardNotes(card, lang)`, `kit.renderHTML(plan, lang)` dan `kit.renderPlain(plan, lang)` menggunakan pilihan bahasa yang sama. Gunakan `ms` daripada pemilih bahasa game secara langsung; adapter tidak perlu menamakan semula ID.

Preview membaca dan menyimpan pilihan pada `slay-the-math.question-language.v1`, sama seperti game semasa. Jika storan tidak tersedia, pilihan masih berfungsi untuk halaman yang sedang dibuka. Nilai ini berasingan daripada save, jawapan, sejarah soalan dan RNG.

Katalog dalam branch `dual-language-bm-bi` dibuka melalui Card Collection → 40 cards · BM / English. Ia menggunakan sumber ini dan imej native asal dalam iframe terpencil. Bahasa awal mengikut pilihan game; menukar BM/BI dalam katalog menyelaraskan pilihan bahasa soalan. Membuka atau menukar bahasa katalog tidak mengaktifkan 40 kad dalam tempur.

Pakej asal belum mempunyai pemetaan runtime 40 kad. Integrasi mekanik tempur perlu dibuat secara berasingan dengan mengekalkan ID save dan resolver sedia ada. `runtime-id-map.json` kekal null dengan sengaja; tiada dakwaan semua kad boleh dimainkan.

## Semakan

Jalankan `node tests/card-kit.test.cjs` dan `node --test tests/language.test.cjs`. Perbandingan `tests/original-mechanics.json` menyemak semua nilai, kos, actions, timing, ID dan peraturan asal. Semakan browser dan game direkod dalam branch serta laporan pakej.
