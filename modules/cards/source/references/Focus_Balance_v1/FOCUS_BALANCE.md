# Focus Card — reka bentuk dan balance v1

**Status angka: CADANGAN untuk playtest. Skop Attack/Defend/Skill sahaja dan pengecualian Passive datang daripada arahan Ijamm.**

Focus ialah keadaan sementara pada kad yang sedia ada. Bilangan kategori kekal Attack, Defend, Skill dan Passive. Kad tidak perlu dikumpul atau dibeli sekali lagi sebagai versi Focus.

## Aturan pemain

1. Pemain mengaktifkan toggle **Focus** ketika mempunyai sekurang-kurangnya 1 mata Focus dan belum menggunakan kad Focus pada giliran ini.
2. Toggle dan pembatalannya percuma. Mata Focus hanya ditolak apabila kad layak berjaya dimainkan.
3. Kad layak seterusnya menggunakan 1 Focus. Pemain membayar kos Energy asal seperti biasa.
4. Focus terpadam selepas kad itu dimainkan. Hadnya satu kad Focus setiap giliran, walaupun stok masih berbaki atau bertambah melalui kad lain.
5. Stok Focus maksimum 3 dan boleh dibawa ke giliran seterusnya dalam combat sama. Stok reset pada combat baharu. Toggle reset pada akhir giliran.
6. Passive tidak mendapat bonus dan tidak menggunakan Focus. Memainkan Passive tidak menghabiskan Focus yang sudah diaktifkan.

Sumber pemberian Focus sedia ada tidak ditukar oleh reka bentuk ini.

## Nilai utama

| Fungsi kad | Biasa | Focus |
|---|---|---|
| Attack contoh | 5 damage | 8 damage |
| Attack contoh lebih besar | 10 damage | 13 damage |
| Defend contoh | 5 Block | 8 Block |
| Defend contoh lebih besar | 9 Block | 12 Block |
| Quick Study | Draw 2 | Draw 3 |
| Deep Study | Draw 4 | Draw 5 |
| Mana Reading dengan X=2 | Draw 4 | Draw 5 |
| Read Ahead | Lihat 3, ambil 1 | Lihat 4, ambil 1 |
| Passive | Kesan asal | Tiada bonus Focus |

Damage/Block contoh ialah demonstrasi formula, bukan penetapan statistik baharu bagi Rune Strike atau Rune Guard. Jadual semua 40 kad berada dalam FOCUS_CARD_COLUMNS.md. Angka draf pada Skill dinyatakan dalam JSON.

## Had kuasa dan timing

- Attack menerima tambahan **3 damage jumlah per kad**, bukan +3 pada setiap hit. Bonus masuk pada hit pertama. Contoh dua hit 3+3 menjadi 6+3 = 9 jumlah sebelum mitigation; bukan 6+6. Jika kad mengenai beberapa musuh, hanya sasaran utama/hit pertama menerima bonus ini.
- Defend menerima tambahan **3 Block jumlah**, sekali sahaja pada pemberian Block pertama. Tidak menambah +3 setiap giliran bagi kesan tertunda, tidak menaikkan had carry dan tidak memanjangkan tempoh.
- Kad campuran meningkatkan satu kesan utama sahaja. Attack yang juga memberi Block hanya menaikkan damage; tidak memperoleh kedua-dua bonus.
- Skill meningkatkan satu nilai kecil atau satu tahap pilihan. Mana Reading ialah **2X+1**, bukan 3X. Recall memilih satu kad Discard sahaja, kemudian draw satu dari Draw Pile.
- Kos Energy, Exhaust, syarat memainkan kad, jumlah sasaran dan status asal kekal. Tiada tambahan Energy, penghasilan Focus tambahan atau pembuangan Exhaust daripada Focus.
- Upgrade atau Strength/Agility biasa diselesaikan terlebih dahulu. Tambah bonus Focus flat sekali, kemudian gunakan mitigation biasa. Jangan gandakan bonus Focus melalui pengiraan stat yang diulang.
- Had tangan kekal 10. Untuk Last Page, semak tangan kosong selepas kad dikeluarkan dari tangan tetapi **sebelum** kesan draw.
- Jika kapasiti tangan memastikan kad tambahan tidak boleh diperoleh, paparkan kesan biasa tanpa memotong Focus. Pencarian kategori yang sah masih boleh gagal selepas commit; kosnya tidak dipulangkan.
- Kad tidak sah, pembatalan atau Energy tidak cukup tidak memotong Focus. Double-click dan reload tidak boleh menggandakan bonus atau kos.

## Paparan yang mudah untuk murid

Dalam jadual pembangunan, gunakan column **Biasa** dan **Focus**. Dalam battle, gunakan kad sama dan tukar nombor kesannya apabila toggle aktif.

Contoh teks kad: `Deal 5 damage.` menjadi `Deal 8 damage.` dengan label kecil `Focus +3`.
Quick Study berubah daripada `Draw 2 cards.` kepada `Draw 3 cards.` dengan label `Focus +1 draw`.

Bingkai Attack, Defend dan Skill boleh menggunakan versi glow kategori yang telah dirancang. Label/nombor tetap diperlukan; jangan bergantung pada glow sahaja. Passive menggunakan paparan biasa. Preview, teks kad, calculation hover dan resolver perlu membaca definisi Focus yang sama.

Ayat pembentangan: “Focus membolehkan pemain menggunakan satu mata Focus untuk menguatkan satu kad pada setiap giliran. Kad Attack mendapat tambahan damage, kad Defend mendapat tambahan Block, dan kad Skill mendapat peningkatan kecil mengikut fungsinya. Passive tidak menggunakan Focus.”

## Bukti kod yang disemak

Snapshot repository: unDead41/slay-the-math-v2, commit `4233d1d2cad547a6d48cda948ce3c10ddea1b4b8`.

- dist/config.js menetapkan FOCUS_CAP=3, BOOST=3 dan HAND_LIMIT=10.
- dist/engine.js menggunakan boostArmed/boostUsed, menolak satu Focus pada kad damage/Block dan menetapkan semula penggunaan pada giliran baharu.
- Skill belum menerima bonus Focus dalam resolver yang disemak.
- Config semasa mempunyai 12 definisi kad dengan nama terdahulu. Set 40 ikon dan mekanik baharunya perlu dipetakan secara sengaja, bukan menggantikan ID runtime berdasarkan nama fail.
- SOR lama mengandungi contoh +2; nilai runtime semasa yang dibaca ialah +3. Bezakan dokumentasi sasaran lama daripada bukti kod.

Pakej ini tidak mengubah repository, tidak memasukkan Passive ke pool dan tidak mendakwa 40 kad baharu sudah berada dalam game. Ia menetapkan column Focus dan kontrak untuk set pilihan terkini.

## Penilaian balance

Nilai +3 adalah flat: 5 ke 8 ialah +60%, 10 ke 13 ialah +30%. Ia dibatasi kos satu Focus dan satu penggunaan per giliran. Skill draw 2 ke 3 ialah +1 kad; draw 4 ke 5 kekal +1, bukannya gandaan semua draw.

Ini hujah pengehadan kuasa, bukan bukti playtest bahawa setiap deck seimbang. Banding seed sama dengan pilihan Focus berbeza, catat giliran menang, HP akhir dan kad yang hampir sentiasa menjadi pilihan Focus. Uji juga kombo multi-hit, hybrid, Recall, tangan hampir penuh, Mana Reading dan Last Page. Ubah satu kumpulan nilai pada satu masa.
