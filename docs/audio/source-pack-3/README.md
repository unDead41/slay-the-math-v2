# Slay the Math — Music With SOR v1

22 Oktober 2026 · Branch: music

Pakej ini menggabungkan 15 fail audio asal Ijamm dengan SOR untuk integrasi kemudian.

Mula baca **docs/audio/STM_AUDIO_SOR_v1.md**.

| Fail / folder | Tujuan |
| --- | --- |
| MUSIC/ | 15 sumber audio asal, bait dikekalkan |
| docs/audio/STM_AUDIO_SOR_v1.md | Peraturan scene, voice mengikut pertemuan, save/reopen, mix dan batas |
| docs/audio/audio-manifest.v1.json | 15 ID stabil, pemetaan, hash, durasi, route dan sequence |
| docs/audio/audio-cues.v1.csv | Jadual pemetaan ringkas |
| docs/audio/IMPLEMENTATION_CHECKLIST.md | Titik sambungan source dan semakan integrasi kemudian |
| docs/audio/source-audit.v1.json | Hasil ffprobe, hash sumber dan decode |
| docs/audio/VERIFICATION_v1.json | Semakan pakej SOR yang benar-benar dijalankan |

Urutan yang diminta: Dungeon Master 1–4 dan Merchant 1–3. Default CADANGAN: kira per run, simpan encounter supaya reopen tidak bertukar nombor, ulang dialog terakhir selepas had. Panel hadiah baru memainkan greeting; perubahan tab/pilihan dalam encounter sama tidak memainkan greeting berulang.

Fail .mpeg BGM mempunyai audio MP3. Import runtime hendaklah mengikut manifest dan SOR; menyalin folder MUSIC sahaja tidak memasang audio dalam game. Muzik dan voice belum diaktifkan oleh dokumen ini.

Sumber ZIP: MUSIC(2).zip  
SHA-256: 3eed8530a56c085281d3cfc40c2f49de308cd3b279247011f0f8311b259fb23c

Audio asal dimasukkan untuk memudahkan handoff. Nama sumber asal dikekalkan, tiada tempo/pitch/trim dibuat. Metadata hak milik/pengarang tidak diteka. Tiga PDF matematik dan MODEL.zip tidak digunakan bagi SOR audio ini.

