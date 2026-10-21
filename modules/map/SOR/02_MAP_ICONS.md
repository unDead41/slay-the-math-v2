# SOR — Map Icons

Versi aset 1.0 · 18 Oktober 2026.

## Identiti dan warna yang disahkan

| `node.type` | Nama | Warna utama | Simbol |
| --- | --- | --- | --- |
| battle | Normal Enemy | Merah | Dua pedang bersilang |
| elite | Elite Enemy | Merah | Topeng raksasa kristal bertanduk |
| shop | Shop | Biru | Kantung syiling dan syiling emas |
| mystery | Mystery | Ungu | Tanda soal kristal |
| boss | Boss | Merah | Helmet guardian bermahkota |
| rest | Rest | Biru | Api unggun magik |

Semua kategori menggunakan reka bentuk bingkai yang konsisten: gunmetal
berbentuk bulatan, dua tepi emas antik dan empat hiasan berlian pada arah utama.
Warna kategori digunakan pada artwork/panel dalaman; bingkai neutral kekal seragam.

## PNG dan paparan

- Gunakan `assets/map-icons/square/` untuk nod peta: 1080 × 1080 px.
- `assets/map-icons/fhd/` mengandungi eksport 1920 × 1080 px.
- Ruang luar bingkai mesti mengekalkan alpha telus. Panel dalaman ialah artwork.
- Pusatkan origin/anchor pada ikon; kekalkan nisbah aspek.
- Jangan menambah label nama ke dalam PNG. Teks bantuan disediakan oleh UI.
- Normal, Elite dan Boss perlu dikenali melalui simbol, selain warna merah yang dikongsi.
- Status pilihan boleh ditunjukkan melalui halo UI; jangan mewarnakan semula PNG asal.

PNG dijana secara berasingan berdasarkan master bingkai Normal Enemy.
Eksport FHD diskalakan daripada sumber native sekitar 1672 × 941 px, dan
dimensi/ruang tepinya diseragamkan. Lihat `assets/map-icons/manifest.json`
untuk ukuran sumber, hash dan keputusan alpha.

Prompt asal disimpan dalam `assets/map-icons/generation-prompts.json`.
Menukar ikon tidak boleh mengubah kuota atau struktur RNG.
