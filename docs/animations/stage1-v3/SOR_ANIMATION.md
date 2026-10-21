# SOR Enemy Animation Stage 1 — v3

**21 Oktober 2026 · Slay the Math**

Skop: Rune Bat, Ember Mirror, Prism Guard (Normal); Mirror Knight, Shard Beast (Elite). Semua pandang kiri. Lima aksi wajib: Idle, Attack, Defend, Skill, Damaged. Nama dan ID stabil: rune_bat, ember_mirror, prism_guard, mirror_knight, shard_beast.

Kontrak eksport: 768 × 768 PNG RGBA8, sRGB dan straight alpha. Sheet 2560 × 1728, grid 3 × 2, margin 64, spacing 64, padding dalaman sekurang-kurangnya 96 setiap sisi. Pivot (0.5,0.5), tiada trim/recenter setiap frame, semua gap/margin/petak kosong alpha 0. Median sisi terpanjang Idle 384 ±1 px pada alpha ≥16; proporsi asal dipelihara.

FPS canonical: Idle 6, Attack 12, Defend 10, Skill 10, Damaged 12. Idle loop; aksi lain sekali dan kembali ke Idle/state semasa. Bilangan frame asal dipelihara; tiada frame berulang ditambah untuk mencapai bilangan seragam. Neutral pertama/akhir yang sama bagi sesetengah aksi dibenarkan dan direkodkan; Damaged mesti bebas daripada salinan piksel.

Identiti wajib: Prism Guard menggerakkan satu perisai asal dengan tangan kiri. Mirror Knight memegang satu pedang kanan dan satu perisai kiri. Shard Beast mempunyai empat kaki, satu ekor dan kristal/armor yang konsisten; Defend menggunakan armor badan. Arah, anggota dan VFX yang diterima tidak dilukis semula melalui standardisasi ini.

Source of truth runtime: animation_manifest.json schema v3, per-enemy manifest, atlas JSON hash dan import_manifest.json. Semua koordinat, frame aktif, FPS, pivot dan event mesti dapat dibaca dengan kaedah yang sama untuk kelima-lima musuh. Attack contact / Skill release cadangan indeks 3. Defend hold 2, resume 3. Indeks bermula 0.

Semakan penerimaan: tepat 5 musuh, 25 aksi, 128 frame; pixel RGBA sumber dan output sama; header PNG sRGB seragam; padding/gap/pivot/dimensi lulus; atlas crop sama dengan PNG individu; path dan kawalan preview lulus; ZIP dan checksums sah. Import engine dan timing combat disahkan kemudian semasa integrasi.

| Enemy | Type | Idle | Attack | Defend | Skill | Damaged | Total |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Rune Bat | normal | 4 | 6 | 4 | 6 | 3 | 23 |
| Ember Mirror | normal | 4 | 6 | 4 | 6 | 3 | 23 |
| Prism Guard | normal | 6 | 6 | 6 | 6 | 4 | 28 |
| Mirror Knight | elite | 6 | 6 | 6 | 6 | 3 | 27 |
| Shard Beast | elite | 6 | 6 | 6 | 6 | 3 | 27 |
