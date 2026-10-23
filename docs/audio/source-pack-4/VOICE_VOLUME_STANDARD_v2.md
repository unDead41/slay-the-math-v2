# Standard volume talking v2

23 Oktober 2026 · Sasaran engineering pakej Slay the Math

## Peraturan

Semua talking Alyssa, Dungeon Master dan Merchant menggunakan target yang sama: **−18 LUFS integrated**, dengan toleransi **±0.5 LU** selepas encoding MP3. Sasaran true peak pemprosesan ialah **−2 dBTP**, dan hasil encoded mesti **≤ −1 dBTP**.

Ini ialah standard projek yang dipilih bagi tugasan ini. Volume slider runtime bukan pengganti mastering loudness sumber.

## Hasil sebenar

| Ukuran | Hasil |
| --- | ---: |
| Talking diperiksa dan dinormalkan | 49 |
| Input paling perlahan / kuat | -26.54 / -10.11 LUFS |
| Output paling perlahan / kuat | −18.35 / −17.88 LUFS |
| True peak tertinggi selepas encoding | −1.77 dBTP |
| Klip dalam toleransi loudness | 49/49 |
| Klip dalam had true peak | 49/49 |
| Output decode berjaya | 49/49 |
| BGM diubah oleh pemprosesan ini | 0/8 |

Butiran measured tiap-tiap fail ada dalam [volume-audit.v2.json](volume-audit.v2.json). Source dan output mempunyai hash berasingan dalam manifest. Semua sumber asal disimpan.

## Kaedah

1. Dekod stream audio asal; ukuran pertama melalui FFmpeg loudnorm.
2. Normalisasi dua pass menggunakan input_I/input_TP/input_LRA/input_thresh dan target offset yang diukur.
3. Output MP3 dengan libmp3lame, VBR quality 2, stereo 44,100 Hz.
4. Ukur semula MP3 hasil encoding. Terima hanya jika |LUFS + 18| ≤ 0.5 dan true peak ≤ −1 dBTP.
5. Dekod output penuh dan banding durasi; beza container mestilah ≤ 0.1 saat.

27 klip dapat menggunakan mod linear; 22 menggunakan mod dynamic FFmpeg loudnorm. Ini pemprosesan audio sebenar, bukan hanya replayGain tag atau menukar nilai slider. Tiada perubahan pitch/rate atau trim dibuat. Ia bukan proses lossless kerana output MP3 dienkod semula.

## Polisi game kemudian

Default clipGain **1.0** bagi semua talking; satu Voice volume untuk ketiga-tiga speaker. Cadangan default Voice 0.85 dan Master 1.0. Sliders, mute dan output peranti masih mengubah loudness yang didengar.

Jangan menjalankan normalizer automatik kedua atau menambah gain berlainan mengikut filename. Jika playtest memerlukan tuning, ubah standard/derivatif secara terkawal dan ukur semula; jangan menimpa ORIGINALS.

BGM duck menggunakan faktor 0.30 atas volume pilihan pengguna ketika talking bermain, kemudian pulih melalui duck owner. Hadkan kepada satu talking aktif.

## Batas

Ukuran numerik tidak menggantikan audition untuk timbre, bunyi nafas, sibilance dan rasa subjektif. Audition dan playback runtime game belum dibuat. Loop BGM dan sari kata tepat juga belum diluluskan oleh audit ini.

