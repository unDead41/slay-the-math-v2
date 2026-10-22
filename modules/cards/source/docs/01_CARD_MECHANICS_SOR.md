# SOR Mekanik Kad — v1 lengkap untuk playtest

Tarikh: 22 Oktober 2026. Rujukan utama: data/cards.master.json.

## Autoriti sumber

Tiga ZIP input digunakan. Nama, kategori, kod pilihan dan artwork datang daripada STM_Selected_40_Icons_v1(2).zip. Bingkai berasal daripada Slay_the_Math_Focus_Card_Frames(1).zip. Bonus Focus dan had stok/penggunaan berasal daripada STM_Focus_Cards_Balance_v1(2).zip.

Fail balance input meninggalkan beberapa statistik asas, kos dan kesan Passive tidak ditetapkan. Versi ini melengkapkannya sebagai cadangan reka bentuk baharu. Lihat katalog bagi angka semua 40 kad. Dokumen sumber asal disimpan dalam references dan assets. Jangan menganggap angka baharu sudah berada dalam main game.

## Identiti dan kategori

Empat kategori, masing-masing 10 kad: Attack, Defend, Skill dan Passive. Focus ialah keadaan sementara bagi kad sama, bukan kategori, kad baharu dalam deck atau kad yang perlu dibeli semula. Ultimate tidak ditambah kerana skop input ialah 40 kad empat kategori.

ID pakej menggunakan stm.kategori.nama_kad. Kod ikon perlu digabung dengan kategori; Attack B07 berbeza daripada Skill B07. Burning Pages ialah Defend; Burning Page ialah Skill. Jangan menukar ID simpanan runtime berdasarkan nama PNG.

## Energy, tangan dan urutan commit

Cadangan baseline 3 Energy pada awal giliran; konfigurasi sebenar game perlu diselaraskan ketika integrasi. Kad X menggunakan semua baki Energy yang positif, minimum 1. Tiada diskaun Energy akibat Focus. Had tangan 10.

1. Sahkan giliran, sasaran, syarat dan pilihan wajib. Recall mesti mempunyai kad sah dalam Discard Pile.
2. Kunci transaksi kad dan snapshot syarat, termasuk tangan selepas kad yang dimainkan dikeluarkan tetapi sebelum draw/pencetus.
3. Bayar Energy dan 1 Focus yang layak sekali secara atomik.
4. Selesaikan printed actions mengikut susunan data. Tetingkap pilihan sebahagian daripada transaksi yang sama.
5. Alih kad ke Discard/Exhaust/zon Passive aktif, kemudian selesaikan pencetus selepas kad.

Kad dibatalkan sebelum commit atau tidak sah tidak memotong sumber. Selepas commit, carian sah yang gagal tetap membayar kos. Reload/double-click mesti menggunakan transaction ID yang sama supaya tidak menggandakan kesan. Helper yang dibekalkan ialah perancang tulen: ia mengira dan memulangkan pelan, bukan menolak sumber atau mengubah state game.

## Focus

- Stok maksimum 3. Kos 1. Maksimum satu kad Focus setiap giliran.
- Toggle percuma dan boleh dibatalkan. Potong hanya apabila kad layak berjaya commit.
- Attack +3 damage keseluruhan pada damage event pertama sahaja; bukan setiap hit atau setiap musuh.
- Defend +3 Block pada pemberian pertama sahaja. Carry cap, tempoh dan Block tertunda tidak mendapat bonus ini.
- Skill mempunyai satu bonus yang khusus: draw +1, pilihan +1, had penggantian +1, carian +1, atau draw tertunda +1.
- Passive tidak pernah Focus, tidak menggunakan stok, tidak memadam armed Focus, dan sentiasa menggunakan frame Normal ungu.
- Selepas kad Focus, toggle padam dan used flag kekal hingga giliran seterusnya. Tambahan stok tidak membenarkan penggunaan kedua.
- Stok dibawa merentas giliran dalam combat sama. Stok/armed/used reset pada combat baharu; armed reset pada akhir giliran.
- Jika bukti kapasiti menunjukkan bonus tambahan mustahil, selesaikan kesan biasa dan kekalkan stok serta armed state. Contoh: Quick Study dengan hanya dua slot tangan, atau Recall dengan satu slot.

## Damage, Block dan status

Damage Attack sebelum mitigation = base + Strength per hit + bonus bersyarat + Focus sekali + Vulnerable − Weak, minimum 0. Defense mengurangkan setiap hit dahulu, kemudian Block menyerap baki, akhirnya HP berkurang. Jangan darab Focus sekali lagi. Sure Hit mengabaikan Block sahaja.

Block daripada Defend = base atau gandaan X + Agility sekali bagi setiap pemberian + Focus pada pemberian pertama sahaja, minimum 0. Block Passive adalah fixed tanpa Agility. Layered Shield menyimpan nilai pemberian tertunda ketika commit, supaya buff kemudian tidak mengira nilai sama berulang.

Vulnerable: +2 pada hit Attack masuk berikutnya; satu stack digunakan. Weak: −2 pada hit Attack keluar berikutnya, minimum 0; satu stack digunakan walaupun menjadi 0. Maksimum 3 stack setiap status; tamat pada hujung giliran seterusnya pihak terjejas. Ini ialah definisi cadangan game ini, bukan andaian peraturan game lain.

Thorns membalas setiap hit Attack musuh yang bersambung, termasuk hit yang diserap sepenuhnya oleh Block. Balasan dan Ember Core ialah fixed HP damage: abaikan Defense/Block, tiada Strength/Vulnerable/Focus, dan tidak mencetus balasan berantai atau kiraan kad Attack.

## Draw, pilihan dan RNG

Ambilan biasa mengisi semula Draw Pile dengan Discard Pile menggunakan RNG seed run apabila kosong. Jangan memasukkan kad resolving, Exhaust atau Passive aktif. Berhenti jika tiada kad tersedia. Kad melebihi had tangan kekal dalam Draw Pile; jangan buang atau menganggap kad itu berjaya diambil.

Read Ahead, Clear Choice, Burning Page dan Card Search ialah tetingkap pilihan terhad. Jika Draw Pile kosong sebelum sesi, isi sekali. Tiada reshuffle semasa sesi. Guna kad tersedia sahaja. Choice UI perlu membenarkan penyelesaian automatik apabila hanya satu pilihan sah; transaksi tidak boleh tergantung.

Read Ahead mengambil satu dan menyusun baki di atas Draw Pile. Clear Choice mengambil satu dan membuang baki. Burning Page membuang setiap calon yang ditolak, membenarkan 1/2 penggantian dan akhirnya mengambil satu. Card Search memilih kategori sebelum commit, meneliti maksimum 4/5, mengambil padanan pertama serta membuang yang dilangkau. Carian boleh gagal.

Recall memilih tepat satu instance Discard sebelum commit; Focus kemudian draw satu dari Draw Pile. Recall sendiri tidak boleh dipilih kerana berada di zon resolving dan berakhir di Exhaust. Next Chapter memberi bonus hanya pada draw phase giliran pemain seterusnya. Last Page menyemak empty hand sekali sebelum semua draw dan pencetus Passive: Normal 1/3, Focus 2/4.

## Passive, carry dan reset

Passive dibayar dan dimainkan dari tangan, kemudian berada di zon aktif hingga tamat combat. Hanya satu instance aktif bagi setiap card ID; salinan sama tidak boleh dimainkan lagi pada combat itu. Kesan berlainan boleh bergabung. Semua 10 trigger/limits/values ada dalam JSON dan nota katalog.

Growing Flame dan Battle Rhythm mengira kad selepas pengaktifan, bukan hit; trigger kad ke-3/6/9 sahaja, maksimum +3 atribut. Grimoire Ward dan Ember Core terhad sekali setiap giliran. Clear Mind mula pada giliran seterusnya. Last Ember sekali per combat, hanya jika HP > 0 dan 100 × HP ≤ 30 × maxHP; jika sudah di bawah ambang semasa pengaktifan, trigger ketika itu. Ia tidak menghidupkan semula watak.

Pada awal giliran, simpan minimum(baki Block, cap carry tertinggi), reset Block yang lain, kemudian beri queued Block dan selesaikan draw. Lasting Shield cap 4 setiap giliran; Hold the Line cap 5 sekali. Dua cap ini digabung dengan maksimum 5, bukan 9.

Pada combat baharu: pulihkan struktur deck/Exhaust, clear semua Passive sementara dan atribut yang diberikannya, kaunter, carry, queue, status serta Focus. Jangan menarik balik atribut daripada sumber lain apabila membersihkan sumbangan Passive.

## Semakan balance yang masih perlu gameplay

Banding seed sama: masa membunuh musuh, HP akhir, Energy dibelanjakan, kekerapan Focus setiap kad, penghasilan Block dan pertumbuhan atribut. Uji Strength pada multi-hit, Agility pada Layered Shield, draw deck kecil, Passive serentak, hand cap dan pertemuan dengan satu atau beberapa musuh. Ujian kontrak mengesahkan konsistensi peraturan; ia bukan bukti semua deck seimbang.
