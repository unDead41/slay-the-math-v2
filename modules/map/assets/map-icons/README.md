# Slay the Math — Map Icons FHD

Enam ikon PNG berasingan dengan reka bentuk bingkai yang konsisten:
bulatan gunmetal, dua garis emas antik dan empat hiasan berlian pada arah utama.

| Ikon | Warna kategori | Simbol | Nama fail |
| --- | --- | --- | --- |
| Normal Enemy | Merah | Dua pedang bersilang | normal_enemy.png |
| Elite Enemy | Merah | Topeng raksasa kristal bertanduk | elite_enemy.png |
| Shop | Biru | Kantung syiling dan dua syiling emas | shop.png |
| Mystery | Ungu | Tanda soal kristal amethyst | mystery.png |
| Boss | Merah | Helmet guardian bermahkota | boss.png |
| Rest | Biru | Api unggun magik | rest.png |

## Saiz dan ketelusan

- `fhd/`: setiap fail **1920 × 1080 px**, PNG RGBA.
- `square/`: setiap fail **1080 × 1080 px**, PNG RGBA, lebih mudah digunakan
  sebagai ikon nod peta. Artwork yang sama dipusatkan dalam kanvas persegi.
- Ruang di luar bingkai mempunyai alpha telus. Panel berwarna di dalam
  bingkai ialah sebahagian daripada reka bentuk ikon.
- Semua ikon mempunyai saiz bingkai yang diseragamkan dan ruang tepi yang cukup.
- Fail diuji untuk dimensi, kewujudan alpha, piksel telus dan tepi kanvas telus.

## Resolusi sumber

Art dijana secara berasingan menggunakan image_gen, kemudian ruang telus
dipotong dan saiz kanvas dinormalkan untuk eksport. Sumber native ialah sekitar
**1672 × 941 px** (Boss: 1671 × 941 px). Fail FHD ialah eksport yang diskalakan
daripada sumber tersebut; perincian baharu tidak dijana semasa penskalaan.
Tiada perubahan lukisan atau pewarnaan dibuat pada langkah eksport.

## Pemetaan untuk generator peta

| `node.type` | Fail yang digunakan daripada `square/` |
| --- | --- |
| battle | normal_enemy.png |
| elite | elite_enemy.png |
| shop | shop.png |
| mystery | mystery.png |
| boss | boss.png |
| rest | rest.png |

Gunakan origin/anchor tengah apabila meletakkan ikon pada nod peta.
Kecilkan keseluruhan kanvas persegi mengikut saiz nod yang dikehendaki.

`manifest.json` menyimpan saiz sumber, saiz eksport, keputusan alpha dan SHA-256.
`generation-prompts.json` menyimpan prompt bagi keenam-enam ikon. Normal Enemy
digunakan sebagai rujukan bingkai untuk menghasilkan lima kategori lain.

Pakej ini mengandungi aset ikon. Ia tidak menukar kuota atau aturan RNG peta.
