# Mathematics Slayer — Set of Rules: Map RNG

Peraturan 1.0.0 · Katalog 1.1.0 · 18 Oktober 2026 · Menggantikan susunan peta ilustrasi statik terdahulu.

## Keputusan yang disahkan

Setiap stage mempunyai **10 level**, **3–5 laluan awal**, dan satu boss pada level 10.
Peraturan yang sama digunakan untuk Sigil Keep dan Deck Tower. Susunan bilik dan
sambungan berubah mengikut seed; kuota wajib tidak berubah.

| Laluan awal | Shop seluruh peta | Elite seluruh peta | Rest seluruh peta |
| --- | --- | --- | --- |
| 3 | 1 | 4 | 2 |
| 4 | 2 | 6 | 3 |
| 5 | 3 | 7 | 4 |

Ijamm mengesahkan kuota 4 laluan dan bahawa **jumlah Rest termasuk level 9**.
Kiraan bilik adalah tepat, bukan minimum. Sebuah bilik bersama dikira sekali
walaupun beberapa laluan memasukinya. Kuota mengikut **bilangan laluan awal**;
ia tidak dikira semula setiap kali laluan bercabang.

## 1. Struktur dan maksud path

- Level 1 mempunyai 3, 4 atau 5 bilik permulaan yang boleh dipilih.
- Level 1–8 mempunyai 3–5 koridor/bilik pada setiap baris. Bilangannya boleh berubah.
- Laluan boleh bercantum, bercabang dan mempunyai sambungan ke koridor bersebelahan.
- Tidak semua koridor disambungkan antara satu sama lain. Maksimum dua pilihan
  keluar bagi sebuah bilik pada level 1–8; tiada sambungan silang mendatar.
- Semua sambungan bergerak tepat satu level ke hadapan. Tiada pintasan level 5/9.
- Semua bilik mesti boleh dicapai dari sekurang-kurangnya satu pintu masuk dan
  mempunyai laluan ke boss. Tiada bilik terasing, jalan buntu atau edge berulang.
- Geometri sambungan tidak bersilang. Bercantum pada bilik yang sama dibenarkan.
- Contoh sah: 3 koridor awal berkembang menjadi 5 pada level 8, atau 5 menjadi 3.

`Path` di sini bermaksud koridor yang aktif pada suatu level, **bukan jumlah semua
gabungan perjalanan**. Interconnection boleh menghasilkan lebih daripada lima
pilihan perjalanan lengkap. Level 9 ialah pengecualian khas kerana Rest boleh
dikongsi; boss level 10 juga ialah satu bilik bersama.

## 2. Shop

Shop wajib mengikut kuota seluruh peta. Sesuatu perjalanan boleh mempunyai
Shop atau tiada Shop, bergantung kepada pilihan pemain.

- Depan: level 1–3.
- Tengah: level 4 atau 6; level 5 dikhaskan untuk Mystery.
- Belakang: level 7–8.
- Pemilihan posisi adalah RNG; tidak wajib satu Shop dalam setiap zon.
- Tiada Shop pada level 5, 9 atau 10.

## 3. Elite

Kuota Elite ialah 4 / 6 / 7 untuk 3 / 4 / 5 laluan awal.
Sesetengah koridor atau perjalanan boleh tiada Elite; kuota itu tidak bermaksud
setiap pemain wajib melawan kesemua Elite yang kelihatan pada peta.

Sebagai pilihan pelaksanaan v1, Elite ditempatkan pada level 2, 3, 4, 6, 7 atau 8.
Level 1 dimulakan dengan Battle biasa atau Shop. Ini boleh diubah dalam versi
SOR baharu; ia bukan syarat tambahan yang dianggap datang daripada Ijamm.

## 4. Mystery wajib pada level 5

**Setiap bilik pada level 5 ialah Mystery / Random Event.** Semua perjalanan
mesti melalui satu bilik tersebut. Event tidak digantikan dengan Shop atau Elite
semasa peta dijana. Kandungan event ketika masuk ialah sistem berasingan.

Pilihan pelaksanaan v1: bilik Battle yang belum dikhaskan pada level 2–4 atau
6–8 mempunyai peluang 16% menjadi Mystery tambahan. Ini tidak menukar kuota
Shop, Elite atau Rest dan bukan kadar event yang ditetapkan pengguna.

## 5. Rest dan level sebelum boss

- Rest hanya dibenarkan pada level 4, 6, 7, 8 atau 9: tengah dan belakang.
- **Semua bilik level 9 ialah Rest**, dan setiap perjalanan mesti melaluinya.
- Bilangan Rest level 9 dipilih secara RNG daripada 1 hingga nilai paling kecil
  antara jumlah Rest dan bilangan koridor pada level 8.
- Baki kuota Rest ditempatkan secara RNG pada level 4, 6, 7 atau 8.
- Rest dikongsi membolehkan kuota 2 Rest bagi peta 3 laluan kekal sah.

Contoh peta 3 laluan: 1 Rest di tengah + 1 Rest bersama pada level 9 = 2.
Contoh peta 5 laluan: 1 Rest di tengah + 3 Rest pada level 9 = 4.
Peta juga boleh menggunakan semua kuota Rest pada level 9 apabila kapasiti cukup.

## 6. Boss dan identiti stage

| Stage | Nama | Boss level 10 | ID aset rujukan |
| --- | --- | --- | --- |
| 1 | Sigil Keep | Twin Sigil Guardian | s1_twin_sigil_guardian |
| 2 | Deck Tower | Deck Lord | s2_deck_lord |

Nama/ID ini dipadankan dengan `roster.json` dalam Enemy Model Sheets V2.
Generator tidak mengubah stats, ganjaran, kandungan event atau mekanik combat.

## 7. RNG yang boleh diulang dan 100 seed

- Registry mengandungi tepat **100 ID seed**, `STM-001` hingga `STM-100`.
- Setiap seed mempunyai satu peta bagi setiap stage: **200 peta eksport**.
- Seed `STM-001`–`STM-050` mengekalkan semua snapshot peta asal. Penambahan
  `STM-051`–`STM-100` tidak mengubah algoritma, versi generator atau kuota.
- Input yang sama (seed, stage, mode laluan, versi generator) memberi JSON sama.
- Stage menggunakan input RNG berasingan; seed sama tidak menyalin layout stage 1
  ke stage 2. Kuota setiap stage mengikut laluan awal stage itu sendiri.
- Mode laluan `auto` memilih 3–5. API juga membenarkan 3/4/5 ditetapkan semasa
  pembangunan; perubahan mode ialah perubahan input RNG.
- Generator tidak terhad kepada 100: seed teks atau integer selamat lain dibenarkan.
- Algoritma: FNV-1a atas code unit UTF-16 JavaScript, kemudian Mulberry32.
- Tiada `Math.random()`, timestamp, fetch atau dependency luar dalam generator.
- Senarai seed ialah katalog ulangan, **bukan janji semua konfigurasi RNG seragam**.
  Bilik khas dipilih daripada slot sah; setiap slot bukan jaminan peluang sama
  antara zon yang mempunyai jumlah slot berbeza.

## 8. Urutan penjanaan dan validation

1. Tetapkan seed, stage dan bilangan laluan awal.
2. Jana lebar level 2–8 dalam julat 3–5; perubahan maksimum satu koridor per level.
3. Pilih bilangan Rest bersama pada level 9; tetapkan satu boss pada level 10.
4. Sambung semua bilik dengan edge bertertib, kemudian tambah sebahagian cabang
   bersebelahan yang masih tidak bersilang dan tidak melebihi dua pilihan keluar.
5. Tetapkan semua Mystery level 5 dan Rest level 9.
6. Letakkan baki Rest, kuota Shop dan kuota Elite dalam slot yang sah.
7. Isi slot lain sebagai Battle / Mystery tambahan.
8. Tolak peta jika kuota, tahap wajib, reachability atau sambungan tidak sah.

Jika keperluan baharu tidak muat dalam kapasiti peta, ubah SOR/algoritma dengan
jelas. Jangan senyap-senyap mengurangkan kuota atau menerbitkan peta tidak sah.

## 9. Integrasi dan simpanan permainan

Generator ini modul berasingan; kod game utama tidak termasuk dalam lampiran.
Gunakan `generateMap(seed, {stage})`, kemudian simpan **snapshot JSON peta**,
seed, stage, generatorVersion dan bilik semasa dalam save game.

Apabila Continue, pulihkan snapshot. Jangan jana seed baharu atau menggunakan
versi generator baharu pada run lama. Selepas room selesai, tawarkan hanya
`edges` yang mempunyai `from === currentRoomId`. Menu/refresh tidak boleh
mengubah seed, bilik, kuota atau pilihan laluan run tersebut.

Ini mengesahkan struktur peta, bukan keseimbangan HP, kadar menang atau ekonomi.
Ujian permainan diperlukan selepas stats combat dan harga Shop disambungkan.
