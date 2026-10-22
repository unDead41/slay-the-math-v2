# SOR Rich Text Kad

## Pemetaan visual

| Jenis | Warna pada parchment | Interaksi |
|---|---|---|
| calculation | Ungu lembut; teks #6b3c98 | Nombor terhasil dan pecahan formula |
| math | Merah jambu lembut; teks #943066 | Istilah peratus atau rawak |
| game | Hijau lembut; teks #17593d | Block, Strength, Draw, Focus dan istilah game lain |

Ketiga-tiga jenis menggunakan garis putus-putus. Jangan menukar warna frame mengikut warna ilustrasi: frame Attack merah, Defend biru, Skill hijau, Passive ungu.

## Data dan keselamatan paparan

Penerangan ialah senarai token berjenis dalam cards.master.json: text, calculation, math, game. Calculation merujuk values pada kad yang sama. Math/game merujuk glossary. Penerangan EN/BM membaca nilai pengiraan yang sama. Nama kad dan selection code tidak diterjemahkan atau dijadikan ID baharu.

card-kit.js membina tooltip dan output HTML dengan escape untuk teks/atribut; tiada HTML daripada data dinilai sebagai skrip. Nilai preview dan nombor penerangan datang daripada preparePlay yang sama. Jangan masukkan bonus Focus ke tooltip sahaja sedangkan resolver masih menggunakan nilai Normal.

Contoh Rune Strike, Strength 2: Normal 6 + 2 + 0 = 8; Focus 6 + 2 + 3 = 11, sebelum mitigation musuh. Twin Shot, Strength 2: Normal 5 + 5; Focus 8 + 5. Mana Reading X=2: Normal 4; Focus 5. Apabila stok Focus kosong, used flag aktif, kad tidak sah atau bonus mustahil, preview tidak memaparkan glow atau nilai Focus palsu.

## Interaksi dan akses

Hover mouse, fokus papan kekunci dengan Tab dan sentuhan membuka tooltip. Escape, scroll atau pindah fokus menutupnya. Tooltip menggunakan role=tooltip dan aria-describedby, serta dihadkan pada viewport supaya tidak terpotong. Warna disokong oleh jenis istilah, teks dan garis; makna tidak bergantung pada glow sahaja. CSS mempunyai styles focus-visible.

Preview ialah contoh renderer yang berfungsi di luar talian dengan skrip relatif biasa. Tiada fetch/network diperlukan. BM menerangkan mekanik game dalam bahasa yang mudah; pakej ini tidak mengandungi soalan kurikulum dan tidak mendakwa semakan buku teks atau DSKP dibuat untuk mekanik ini.

## Komponen untuk integrasi

Gunakan data/cards.master.json sebagai autoriti; data/card-data.js ialah salinan terjana untuk preview tanpa fetch. Jika JSON dikemas kini, jana semula data/card-data.js dan jalankan ujian JSON/JS equality. Selaraskan token/tooltip kepada renderer rich text sedia ada game jika ada; kekalkan kategori warna, dashed underline dan nilai daripada resolver sebenar.
