# Arahan projek — Slay the Math

Fail ini dibaca bersama [indeks SOR](SOR_README.md). Jika indeks dinamakan semula kepada SOR_README.md, laraskan pautan ini semasa integrasi.

## Tujuan

Bantu Ijamm membina permainan kad strategi matematik berasaskan web. Kekalkan Slay the Math bertema dungeon, dua stage, satu boss setiap stage, map bercabang dan tiga topik Probability, Expansion & Factorisation serta Indices. Teks game English mudah.

## Bacaan minimum

1. [Governance](docs/sor/00_GOVERNANCE.md).
2. [Visi dan skop](docs/sor/01_GAME_VISION_SCOPE.md).
3. [Daftar keputusan](docs/sor/DECISIONS.md).
4. [Dua design semasa](docs/sor/18_DESIGN_REFERENCES.md), kemudian SOR modul terlibat.

| Tugasan | SOR tambahan |
| --- | --- |
| Matematik, RNG, Ramalan | 02, 03, 13, 15 |
| Kad dan balancing | 03, 04, 05, 12 |
| Ikon dan UI | 05, 06, 10, 11 |
| Musuh, boss, stage | 02, 07, 09, 12 |
| MC atau aset baharu | 06, 08, 14, 17, 18 |
| Save, bug atau release | 03, 13, 15, 16 |

Nombor dalam jadual merujuk kepada fail bernombor dalam `docs/sor/`.

## Peraturan kerja

- **AGT-01:** Arahan langsung terkini Ijamm mengatasi baseline dokumen projek. Arahan sistem/platform tetap terpakai.
- **AGT-02:** Bezakan DISAHKAN, DITERUSKAN, CADANGAN dan PERLU_VERIFIKASI. Jangan tulis cadangan seolah-olah keputusan pengguna.
- **AGT-03:** Semak kod dan data semasa sebelum mengubah implementasi. Jangan mendakwa mekanik dalam SOR sudah berada dalam game.
- **AGT-04:** Gunakan satu sumber nilai untuk setiap sistem. HP/tenaga dalam config; label dalam kamus bahasa; visual melalui token; jawapan daripada evaluator yang sama dengan data soalan.
- **AGT-05:** Jangan tukar genre, tiga topik matematik, jumlah stage/boss, identiti MC atau sistem teras secara senyap. Jika Ijamm sendiri meminta perubahan, laksanakan dan rekodkan keputusan itu.
- **AGT-06:** Bagi pilihan kecil yang mudah dibalikkan, teruskan dengan pertimbangan munasabah dan laporkan. Jangan meminta pengesahan berulang.
- **AGT-07:** Matematik mesti tepat. Ruang sampel sebenar, penggantian, persilangan dan maklumat yang diketahui mesti dinyatakan.
- **AGT-08:** Logik tempur tidak bergantung pada animasi. RNG, ganjaran, penggunaan tenaga dan autosave mesti tahan double-click dan refresh.
- **AGT-09:** Ubah satu isu yang jelas; elakkan refactor luas atau ciri tambahan di luar tugasan.
- **AGT-10:** Jalankan semakan yang sepadan dengan risiko. Jangan cipta ujian remeh yang hanya meniru implementation. Jangan kata ujian lulus jika tidak dijalankan.
- **AGT-11:** Kekalkan perubahan pengguna dan aset asal. Jangan overwrite AGENTS, fail save atau aset yang tidak terlibat.
- **AGT-12:** Setiap perubahan peraturan mesti mengemas kini dokumen pemilik, daftar keputusan dan changelog yang berkaitan.
- **AGT-13:** Dalam handoff, nyatakan apa berubah, mengapa, semakan sebenar dan perkara yang masih belum selesai.
- **AGT-14:** Rujukan Slay the Spire ialah genre dan struktur strategi. Hasilkan nama, seni, UI, muzik dan kandungan asal.

- **AGT-15:** Sheet dungeon terkini mengatasi kostum mage lama. Lindung/Benteng ialah Guard pada ID sama; jangan menggandakan kad kerana alias.
- **AGT-16:** Design awal tidak mengaktifkan Passive. Resource Focus kekal; Ward ialah nama kerja konsep ungu.
- **AGT-17:** Tiga fokus Probability ialah subfokus T1. Jangan menghilangkan T2/T3 atau mendakwa semua topik pada satu tingkatan tanpa pemetaan.

## Peringatan konteks

Nama MC belum diputuskan. Gunakan `mc_01` sebagai ID sementara. Jangan mengimport Alyssa, NPC, biome atau peraturan Mathmon Adventure ke projek ini tanpa arahan Ijamm.

## Format laporan ringkas

> Diubah: …  
> SOR/keputusan terlibat: …  
> Semakan dijalankan: …  
> Hasil dan had: …  
> Langkah seterusnya: …
