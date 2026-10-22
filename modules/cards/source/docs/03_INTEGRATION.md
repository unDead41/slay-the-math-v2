# Panduan Integrasi ke Main Game

Pakej ini ialah aset, data mekanik dan preview. Ia tidak mengubah main, tidak membuat commit dan tidak membuat push. Kerja bahasa semasa menggunakan branch dual-language-bm-bi. Integrasi mekanik penuh kekal tugasan berasingan.

1. Petakan 40 package card ID kepada runtime ID secara eksplisit dalam data/runtime-id-map.json. Entri null disengajakan kerana kod game tidak diedit dalam tugas consolidation ini. Kekalkan ID yang telah digunakan dalam save, deck, reward, shop dan log.
2. Port values, actions, passive trigger/limits dan peraturan dalam SOR ke resolver sedia ada. preparePlay ialah helper perancangan dan preview, bukan combat engine atau pelaksana RNG/queue. Jangan menganggap semua op data akan berjalan tanpa adapter.
3. Sahkan syarat, pilihan, sasaran dan kapasiti menggunakan state sebenar. Snapshot X, Strength/Agility, empty hand dan conditional bonuses sekali. Gunakan RNG seeded game bagi Fate Storm dan shuffle.
4. Commit kad, Energy dan Focus dalam satu transaksi idempotent. Rekod transaction ID, pilihan, targets dan RNG state; replay/reload tidak boleh commit dua kali. Kunci double-click ketika choice window terbuka.
5. Gunakan frame berdasarkan hasil commit/preview yang layak: 30 kad boleh Focus, 10 Passive sentiasa Normal. Canvas semua kategori 1280×1920, atau 2560×3840 untuk eksport 4K. Jangan trim padding atau menukar skala/anchor ketika toggle.
6. Artwork asal tidak diubah. Guna contain seragam dalam aperture yang diclip. Layer order: artwork → frame Normal/Focus → nama/kos/category → rich text. Jika menggunakan frame Focus lengkap, jangan tambahkan overlay glow sekali lagi. Overlay hanya alternatif untuk PNG kad yang sudah lengkap.
7. Renderer rich text membaca snapshot nilai yang sama dengan resolver; sambungkan glossary/calculation ke hover, tap dan keyboard. Guna bahasa pilihan pemain bagi semua penerangan; guna kit.cardName(card, lang) untuk nama paparan dan kit.cardNotes(card, lang) untuk Butiran. Nama asal dan ID kekal.
8. Tambah kad ke pool deck/reward/shop mengikut rarity dan balance yang dipilih selepas playtest. Memaparkan ikon dalam koleksi tidak membuktikan kad sudah boleh dimainkan.
9. Uji satu kad setiap kategori, multi-hit/AOE, 0 Energy, X, Recall, Last Page, tangan penuh, semua Passive, reset combat, carry, transaction replay dan UI sempit sebelum merge.

## Contoh guna helper preview

~~~js
const kit = require('./src/card-kit.js');
const plan = kit.preparePlay('stm.attack.twin_shot', {
  energy: 3, strength: 2, agility: 0,
  focusStock: 3, focusUsed: false,
  handAfterPlay: 4, availableDrawCards: 20
}, true);
// plan.values.first = 8; plan.values.second = 5
// plan.payEnergy = 1; plan.payFocus = 1
// State asal tidak diubah. Runtime adapter perlu mengesahkan dan commit.
console.log(kit.renderPlain(plan, 'en'));
~~~

## Ujian yang boleh diulang

~~~bash
node tests/card-kit.test.cjs
~~~

Untuk semakan byte, gunakan SHA256SUMS.txt dalam folder root. Asset-map memadankan ikon/frame; selections asal mengekalkan hash setiap ikon. Data runtime mapping perlu dilengkapkan semasa integrasi, bukan dengan meneka dari nama fail.


## Integrasi bahasa 1.1

Rujuk `04_BILINGUAL_LANGUAGE_SOR.md`. Kod bahasa `ms` daripada game disokong terus, bersama `bm`, `en` dan `bi`. Katalog dipasang dalam Collection pada branch bahasa; ini tidak mengaktifkan kesan tempur 40 kad. Jangan memetakan ID kad lama hanya berdasarkan nama terjemahan.
