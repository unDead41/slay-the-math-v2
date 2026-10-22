# Checklist integrasi Audio SOR v1

Status: handoff untuk kerja kemudian. Senarai ini belum menandakan runtime sudah diubah.

## Fail dan sumber

- [x] Periksa MUSIC(2).zip: 15 fail; 8 BGM, 7 VO; CRC dan decode lulus.
- [x] Rekod nama asal, SHA-256, durasi dan format dalam source-audit.v1.json.
- [x] Sediakan pemetaan dalam audio-manifest.v1.json dan audio-cues.v1.csv.
- [ ] Semak AGENTS, SOR dan main terkini sebelum memulakan integrasi.
- [ ] Buka branch music dan selaraskan perubahan main yang diperlukan dengan selamat.
- [ ] Semak kandungan setiap VO; transkrip tepat jika hendak menambah sari kata.
- [ ] Dengar kesesuaian mengulang VO terakhir dan audit loop semua lapan BGM.
- [ ] Import derivatif audio ke laluan manifest, kekalkan MUSIC/ asal dan rekod hash derivatif.

## Kontrak yang mesti kelihatan dalam implementasi

- [ ] Bezakan surface hadiah artifact daripada scene master sahaja: hadiah Elite/Boss/Mystery juga boleh menggunakan panel itu.
- [ ] Utamakan education sebelum pilihan artifact seperti renderer sebenar; jangan greeting pada trial soalan.
- [ ] Paid artifact dalam tab Shop menggunakan Merchant, bukan Dungeon Master.
- [ ] Bekukan pertemuan dan voice ID sekali bagi encounter; normal render tidak increment.
- [ ] DM 1/2/3/4; Merchant 1/2/3. Per-run, reopen dan hold-last mengikut status CADANGAN SOR.
- [ ] Simpan metadata audio melalui pemilik save; migrasi lama tidak meneka sejarah NPC.
- [ ] Voice satu-shot dan satu aktif; BGM boleh berjalan serentak dengan duck.
- [ ] Voice tidak menyekat input, resolusi, claim atau perkembangan.
- [ ] Batalkan decode/greeting lama pada pertukaran surface; mute dan hidden page dihormati.
- [ ] Music / SFX kekal, Voice mempunyai kawalan sendiri; global mute jika ada meliputi semua bus.

## Perangkap source baseline

1. dist/audio.js masih menggunakan ids lama dan trackFor berdasarkan scene sahaja.
2. Loader memilih embedded DC_MUSIC dahulu, kemudian OGG, kemudian MP3. MP3 baharu tidak boleh dibayangi sumber lama.
3. run.stage ialah 0/1. Boss ditentukan daripada definisi semasa, bukan nama paparan.
4. artifactState.offer.source ialah kunci hadiah semasa; Shop menggunakan stage + route.active.
5. build-portable.cjs mencari MP3 dalam assets/music dan menjangka jumlah 10. Voice perlu daftar/embed sendiri; jangan menyamakan alias dengan aset fizikal.
6. Katalog lama music-data.js menyimpan BPM/key komposisi lama. Audio baharu tidak mewarisi metadata itu.
7. manifest dalam docs/audio belum dibaca game. Jadikan runtime manifest sebagai sumber tunggal apabila diintegrasikan.

## Semakan penerimaan kemudian

- [ ] DM: 6 encounter menghasilkan 1,2,3,4,4,4 mengikut default cadangan.
- [ ] Shop: 5 node menghasilkan 1,2,3,3,3; semak pertukaran tab tidak repeat.
- [ ] Reopen/Continue/reload memainkan ID sama tanpa increment. Import dan checkpoint konsisten.
- [ ] New Run reset kedua-dua kiraan; Stage 2 mengekalkannya.
- [ ] Lawatan semasa muted tetap mendapat nombor encounter, tanpa bunyi; unmute tidak tiba-tiba restart dialog.
- [ ] Source load lambat lalu keluar scene tidak memainkan audio lama.
- [ ] Voice dibatalkan apabila masuk soalan Claim. BGM dipulihkan berdasarkan surface semasa.
- [ ] Uji duck Voice + Predict, slider ketika voice aktif dan pembatalan.
- [ ] Normal/Elite/Boss/Shop/Rest/Map/Defeat memilih track yang betul pada kedua-dua stage.
- [ ] Uji loop sekurang-kurangnya 3 kitaran dan seimbangkan level melalui pendengaran.
- [ ] Uji web dan portable offline; pastikan OGG/embedded lama tidak mengatasi audio baharu.
- [ ] Semakan save lama, metadata audio rosak dan regresi transaksi sebenar dijalankan.
- [ ] Kemas kini dokumen pemilik, rekod ujian sebenar dan sediakan perubahan untuk review.

## Bukti skop semasa

Baseline: music@085ae6e4aed070c2b58e600f2ee8993a6b6e30e0.
Source runtime telah dibaca untuk dokumentasi. Tiada aset dimasukkan ke dist, tiada code game diubah, tiada portable dibina semula dan tiada merge ke main dibuat oleh pakej SOR ini.

