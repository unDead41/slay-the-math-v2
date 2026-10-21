# 05 — Reka bentuk visual kad

Versi: 2.0.0. Design awal pengguna DITERUSKAN sebagai arah seni; belum bermaksud aset produksi atau semua mekanik diluluskan.

Sumber: [sheet kad dungeon](../../references/card_concepts_v001.jpeg), dengan audit di [18](18_DESIGN_REFERENCES.md).

## Identiti baharu

**CDV-01:** Gunakan frame fantasi bersegi dengan trim emas, nama di atas, lencana tenaga bulat kiri atas, ilustrasi besar, jalur kategori di bawah ilustrasi dan panel parchment untuk kesan. Ini menggantikan layout v1 yang meletakkan nama di bawah artwork.

| Label produksi | Warna frame | Motif | Status |
| --- | --- | --- | --- |
| Attack | Merah/bara | Bilah dan impact | Aktif |
| Defense | Biru | Perisai kristal | Aktif |
| Skill | Hijau teal | Buku dan manipulasi kad | Aktif; dahulu Taktik |
| Passive | Ungu | Kristal/orbit | Konsep visual; belum aktif dalam pool |

**CDV-02:** Warna menunjukkan keluarga, bukan topik atau rarity. Skill kini teal; ungu untuk konsep Passive. Semua frame berkongsi emas yang sama; kategori mempunyai ikon dan label.

## Layout master 600 × 900 px

Nisbah 2:3 dikekalkan. Ukuran ini spesifikasi komponen baharu, bukan saiz setiap kad dalam JPEG.

| Zon | Kawasan cadangan |
| --- | --- |
| Frame / teks | Safe area sekurang-kurangnya 32 px |
| Kos tenaga | Kiri atas, sekitar 88 × 88 px; elakkan clipping |
| Nama | Bar atas y=42–124; maksimum dua baris |
| Artwork | x=40, y=148, lebar=520, tinggi=380 |
| Kategori | Jalur y=532–594; ikon dan label |
| Kesan utama | Parchment y=610–780 |
| Syarat penting | Sambungan panel y=780–836 |
| Afiniti / upgrade / rarity | Chip konsisten dalam safe area |

Nama, kos dan kesan mesti terbaca pada saiz battle sebenar. Ringkaskan teks sebelum mengecilkan font; detail panel menampung penerangan tambahan.

## Padanan gambar kepada data

| Dalam gambar | English | Teks asas | Implikasi |
| --- | --- | --- | --- |
| Tebas | Slash | Deal 6 damage. | Kekalkan ID tebas |
| Lindung | Guard | Gain 5 Block. | Alias benteng, bukan kad baharu |
| Tarik | Draw | Draw 2 cards. | Kekalkan ID tarik |
| Fokus / Passive | Ward, nama kerja | At the start of your turn, gain 1 Block. | Konsep sahaja |

**CDV-03:** Kos 1 dan ayat pada konsep Passive bukan kontrak trigger/tempoh lengkap. Ia tidak menjadi kad aktif atau menggantikan resource Focus secara automatik. [04](04_CARD_SYSTEM.md) mengawal pool kad.

## Ilustrasi dan matematik

Slash menunjukkan bilah dalam dungeon; Guard menunjukkan shield kristal; Draw menunjukkan buku dan kad masuk ke tangan; Filter menunjukkan kad diketepikan. Siluet Draw dan Filter mesti berbeza.

Probability, Expansion & Factorisation dan Indices boleh muncul sebagai motif objek. Simbol π dalam draf ialah dekorasi, bukan keputusan menambah topik bulatan.

**CDV-04:** Asingkan artwork, frame, ikon dan teks. Komposit BM ialah rujukan; produksi English mesti merender nama, kos, damage dan formula daripada data, bukan bitmap teks.

## Tipografi, keadaan dan penerimaan

**CDV-05:** Serif paparan untuk nama/nombor; teks kesan jelas dan gelap di parchment. Maksimum dua keluarga font.

**CDV-06:** Sediakan normal, keyboard focus, selected, playable, insufficient energy, invalid target dan resolving. Glow tidak menjadi satu-satunya petunjuk.

Lulus apabila ukuran kad seragam, frame tidak clipping, English ringkas, afiniti dapat dikenal, nombor sepadan data dan konsep Passive tidak masuk deck tanpa kontrak mekanik.

## Reward and Shop proportions 2.5.3 — 21 October 2026

Ijamm reports horizontally swollen cards in the reward scene and requests checking Shop. The runtime situation variant now bounds the width of the shared portrait-card tracks and these two scene panels. The square artwork viewport is centered inside the card-emblem with its source aspect ratio preserved, including atlas tiles. All three choices stay in one row; phone overflow belongs to that row. Extra ultrawide width alone does not enlarge cards. Existing frame, data, type, effects, selection and purchase/reward owners remain. Verification: docs/FIX_CARD_PROPORTIONS_2_5_3.md.
