# SOR peta bercabang — versi 1.2

Keperluan: peta mempunyai beberapa laluan seperti rujukan pengguna, dengan dua stage dan satu boss pada penghujung setiap stage. Ini ialah graf lokasi yang boleh dimainkan.

## Peraturan perjalanan

1. Setiap stage baharu mempunyai lima tingkat: tiga lokasi pada setiap empat tingkat pertama, kemudian satu boss. Jumlah 13 lokasi.
2. Permulaan di bawah; pemain memilih satu daripada tiga gerbang. Arah perjalanan sentiasa ke tingkat berikutnya.
3. Lokasi hanya boleh dimasuki jika ia berada dalam senarai `next` lokasi yang baru selesai. Pemain tidak boleh melompat tingkat, bergerak ke belakang atau masuk lokasi lain pada tingkat yang sama.
4. Simpang mempunyai beberapa sambungan; beberapa laluan boleh bercantum semula. Semua lokasi boleh dicapai dan semua laluan berakhir di boss. Tiada jalan mati sebelum boss.
5. Memasuki bilik menetapkan `route.active`. Menyelesaikan pertarungan memerlukan pemilihan/langkau ganjaran sebelum lokasi ditanda selesai. Menyelesaikan api unggun atau telaga terus menandakan lokasi selesai.
6. Lokasi selesai ditambah kepada `route.path`, kemudian `depth` meningkat satu. Laluan yang dilepasi tidak memberikan ganjaran tambahan.

## Bilik dan imbangan

| Bilik | Kesan |
|---|---|
| Pertarungan | Satu daripada tiga kad ganjaran biasa, atau langkau |
| Elit | Musuh +10 HP dan +2 damage sebelum penskalaan mod; kad ganjaran dipilih sudah dinaik taraf |
| Api unggun | +12 HP, atau naik taraf satu kad |
| Telaga kenangan | +8 HP, atau keluarkan satu kad; minimum deck 10 |
| Boss | Dua segel Ramalan, kemudian habiskan HP boss |

Tingkat pertama ialah pertarungan masuk; tingkat kedua mempunyai pertarungan biasa dan elit. Tingkat ketiga/keempat menawarkan tempat rehat atau telaga. Panjang perjalanan dan tiga pertarungan setiap stage kekal seimbang dengan versi asal. Kedudukan bilik dan arah simpang dihasilkan daripada seed dan stage.

## Simpanan dan keserasian

- Format akar simpanan kekal versi 1. Run baharu mempunyai `route: {version: 1, path: [], active: null}`.
- `path` menyimpan ID lokasi sebenar dalam urutan perjalanan; panjangnya mesti sama dengan `depth`.
- `active` menyimpan bilik yang sedang diselesaikan. Nama lokasi, musuh, jenis bilik dan hubungan graf mesti sepadan dengan keadaan run.
- Simpanan asal tanpa `route` diteruskan menggunakan peta asal. Sejarah cabang lama tidak direka atau diteka. Stage seterusnya memperoleh peta bercabang.
- Checkpoint stage 2 menyimpan seed, deck, HP dan keadaan peta permulaan; retry berulang mengekalkan checkpoint yang sama.
- Penjana peta tidak menggunakan atau mengubah `rng` pertarungan. Melihat peta tidak mengubah urutan cabutan.
- Jika algoritma graf atau identiti nod berubah pada masa depan, naikkan versi laluan dan sediakan migrasi atau pembaca versi lama. Jangan menafsir semula `route.path` sedia ada secara senyap.

## Pemilik kod dan paparan

| Fail | Tanggungjawab |
|---|---|
| `dist/map.js` | Satu penjana graf, metadata lokasi, lokasi boleh dicapai dan pengesahan jejak |
| `dist/engine.js` | Pengesahan kemasukan, kesan bilik, kemajuan, ganjaran dan checkpoint |
| `dist/app.js` / `mapView` | Satu paparan graf; peta dan senarai pilihan menggunakan reachability yang sama |
| `dist/map.css` | Kertas, sambungan bertitik, jejak merah dan susunan responsif |

Label keadaan, ikon dan tanda semak melengkapkan warna. Semua tindakan menggunakan butang native, boleh ditekan dengan papan kekunci dan boleh digunakan tanpa hover. Garisan sahaja tidak pernah menentukan pergerakan; keputusan enjin ialah autoriti.

## Semakan perubahan

Uji percabangan, percantuman, tiada orphan/jalan mati, larangan melompat atau mengulang lokasi, rehat/telaga pada kedua-dua tingkat tengah, ganjaran elit, eksport/import, checkpoint dan simpanan lama. Ujian kempen mesti memainkan kad serta menyelesaikan Ramalan sebenar sehingga kedua-dua boss. Bina semula `MAIN-SEKARANG.html` selepas setiap perubahan kod `dist/`.
