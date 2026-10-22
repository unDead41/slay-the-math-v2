# 01 — Visi, identiti dan skop game

Versi: 2.2.0. Rujuk [keputusan](DECISIONS.md) bagi sumber arahan dan cadangan. Arahan terkini menggunakan bank 120 item Tingkatan 4 Bab 9, 4 dan 3 selepas Claim Artifact. Implementasi aktif dalam game 2.5.0; pemilik peraturan dan batas ialah SOR 02.

## Identiti

Slay the Math ialah permainan kad strategi matematik berasaskan web dengan tema dungeon. Pemain memilih laluan, membina deck, membaca intent dan menyelesaikan cabaran matematik yang jelas.

Nama prototaip terdahulu Duel Cube Math — Menara Kemungkinan kekal rekod sejarah, bukan tajuk baharu. Rujukan Slay the Spire ialah genre; dunia, artwork, UI, bunyi dan kandungan mesti asal.

## Tiang reka bentuk

- **VIS-01:** Pilihan kad, Energy, Block dan route mesti bermakna.
- **VIS-02:** Tiga topik pendidikan baharu: Kebarangkalian Peristiwa Bergabung (Bab 9), Operasi Set (Bab 4), Penaakulan Logik (Bab 3), semuanya KSSM Matematik Tingkatan 4. Ini menggantikan rancangan algebra/indices. Simbol dekoratif pada kostum tidak menggantikan kandungan sebenar; Predict semasa kekal Probability.
- **VIS-03:** Kos, intent, syarat dan kesan jelas sebelum confirm.
- **VIS-04:** MC red-haired dungeon adventurer; kad ilustrasi berframe emas dan parchment.
- **VIS-05:** Dua stage dengan satu boss setiap stage, melalui map bercabang.
- **VIS-06:** Bahasa game English mudah, istilah RPG biasa dan tiada countdown wajib.

Dokumen pembangunan boleh kekal BM. Semua teks yang dilihat pemain mengikuti [10](10_UI_UX_ACCESSIBILITY.md).

## Skop semasa

| Sistem | Arah semasa |
| --- | --- |
| MC | Satu watak berdasarkan sheet dungeon baharu |
| Map | Branching graph, dua stage dan boss wajib |
| Room | Battle, Elite, Rest, Shop, Mystery dan Boss |
| Tempur | Turn-based, HP/Energy/Block/Focus, intent, draw/discard |
| Kad aktif | Lima definisi starter + tiga tambahan; Passive draf dikecualikan |
| Matematik | Predict untuk Probability; bank 40 item setiap bab aktif pada trial selepas Claim Artifact dalam Challenge |
| Ekonomi | Reward kad, Gold, Shop dan kem; angka masih cadangan |
| Audio | Stage 1/2 berbeza; Rest/Shop/Mystery; Elite 1/2 berbeza |
| Skrin | Menu, tutorial, map, room, battle, reward, koleksi, tetapan, ringkasan |
| Peranti/save | Web responsif; satu run aktif per profil browser |

Imej awal bukan bukti semua sistem telah dibina. Rujuk [18](18_DESIGN_REFERENCES.md) bagi beza visual/konsep/mekanik.

## Sasaran dan batas

Sasaran pengguna ialah murid yang mempelajari topik tersebut serta guru/pemain umum. Bank baharu memetakan SP terpilih dalam DSKP KPM/BPK September 2018 bagi tiga bab Tingkatan 4. MCQ ini tidak mendakwa meliputi seluruh DSKP. Pemilik skop dan batas: [02](02_MATH_LEARNING.md).

Multiplayer, akaun/cloud sync, lebih banyak MC, sistem relik, editor dan integrasi RFID kekal backlog. Shop tidak lagi diletakkan dalam backlog kerana permintaan terkini memasukkannya.

Sasaran dua minggu kekal sasaran kerja, bukan jaminan. Utamakan core stabil dan room minimum; kurangkan variasi seni/VFX jika perlu.

## Penerimaan

Dua stage boleh ditamatkan, route bercabang sah, boss tidak boleh dilangkau, semua room mempunyai tindakan jelas, English konsisten, identiti dua design terpelihara dan save tidak menggandakan hasil.


## Supplied 40-card mechanics and display — 2.18.0

The explicit request to apply the supplied 40-card package supersedes the earlier Passive exclusion and eight/twelve-card pool baseline. Current scope, stable-ID compatibility, base values/upgrade extension, transaction and rendering owners: [Cards and display 2.18.0](../CARDS_AND_DISPLAY_2_18_0.md). Source-authoritative mechanics remain playtest tuning.
