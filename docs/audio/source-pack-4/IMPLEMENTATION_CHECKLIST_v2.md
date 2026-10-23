# Checklist integrasi talking v2

Pakej aset telah diproses; senarai runtime di bawah ialah kerja kemudian.

## Pakej yang telah dibuat

- [x] CRC input ZIP lulus.
- [x] 57 sumber audio dikenal pasti dan didekod.
- [x] 49 talking dinormalkan dan diukur semula selepas MP3.
- [x] Semua talking berada dalam −18 ±0.5 LUFS dan ≤ −1 dBTP.
- [x] 49 backup talking asal dan 8 BGM dikekalkan sama bait.
- [x] Pemetaan 9 kumpulan dan 15 event diwarisi daripada nama/sumber yang dibekalkan.
- [x] Rekod source/normalized hashes, codec dan durasi.
- [x] Maklumkan reward card hanya 8 fail tersedia.

## Integrasi kemudian di branch music

- [ ] Semak source game/main terkini dan AGENTS sebelum mengubah kod.
- [ ] Import packagePath normalized; elakkan ORIGINALS dan dokumen history.
- [ ] Daftarkan ID dan proposedRuntimePath melalui asset registry game semasa.
- [ ] Sambung trigger question, Hint, More Hint, Rest, card reward dan Defeat.
- [ ] Sambung 15 entry voice berdasarkan event ID, bukan tajuk bahasa UI.
- [ ] Sambung Dungeon Master dan Merchant mengikut pertemuan.
- [ ] Satu coordinator Voice, satu suara aktif, satu slider Voice; clipGain semua 1.0.
- [ ] Gunakan shuffle bag audio tersendiri; jangan sentuh RNG soalan/kad/peta.
- [ ] Simpan receipt dan variasi terpilih; render ulang tidak mencipta playback.
- [ ] Sediakan token pembatalan async, deadline, watchdog dan duck ownership.
- [ ] Mute/hidden/scene change membatalkan voice tanpa stale autoplay.
- [ ] More Hint menggantikan Hint; Start Mystery membatalkan intro voice sebelum soalan.
- [ ] Rest dengan soalan prasyarat tidak heal awal demi audio; reward dipanggil ketika pilihan kad.
- [ ] Semak cache OGG/base64 lama dan rebuild portable dengan semua voice yang dirujuk.
- [ ] Pastikan audio tidak menyekat input atau mengubah hasil gameplay.

## Semakan pendengaran dan game

- [ ] Dengar setiap talking pada earphone dan speaker.
- [ ] Semak keselesaan aras Voice dengan BGM duck dan slider pilihan pengguna.
- [ ] Semak maksud dialog terakhir DM/Shop sesuai diulang.
- [ ] Padankan transkrip sebenar sebelum mengaktifkan sari kata.
- [ ] Uji web, portable/offline, slow decode, Continue/reload, tab hidden dan mute.
- [ ] Uji semua 15 Mystery event dan semua kumpulan voice.
- [ ] Jalankan regresi save/progression berkaitan; rekod bukti sebenar.

Tugasan ZIP ini tidak mengubah repository atau runtime game dan tidak merge ke main.

