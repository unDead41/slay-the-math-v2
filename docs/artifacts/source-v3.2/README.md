# Slay the Math — Artifact Pack V3.2 — Rich Text

**31 artifak · 3 sheet · 12 Starting + 16 Elite/Mystery + 3 Boss**

Buka **ARTIFACT_EFFECTS.md** untuk melihat semua kesan dan **SOR_ARTIFACTS.md** untuk aturan penuh.

## Fail untuk digunakan

- **sheets/** — tiga sheet akhir PNG transparen 4096 × 4096.
- **individual_4k/** — 31 ikon individu, setiap satu 4096 × 4096.
- **icons_800/** — 31 ikon individu 800 × 800, sama saiz dengan frame pada sheet.
- **artifact_catalog.json** — nama, ID, kesan dan tier.
- **asset_manifest.json** — koordinat frame dan laluan fail.

Urutan setiap sheet: kiri ke kanan, kemudian baris seterusnya. Semua frame menggunakan kanvas 800 × 800, gutter 100 px dan padding luar sekurang-kurangnya 100 px. Grid dipusatkan; ruang luar sebenar dinyatakan dalam SOR.

PNG mempunyai alpha sebenar. Sesetengah image viewer memaparkan alpha sebagai hitam atau checkerboard; warna itu bukan sebahagian artwork.

## Nota resolusi

4K ialah **resolusi eksport**. Sumber AI pada 1672 × 941 bagi setiap board telah dipisahkan, dinormalkan dan di-upscale; bukan artwork yang dijana pada native 4K. Fail sumber tidak patut digunakan sebagai sheet akhir kerana ia belum mempunyai spacing piksel yang dinormalkan.

**sources_native/** dan prompt disertakan untuk provenance. Kesan merupakan cadangan reka bentuk V3.1 dan belum diintegrasikan atau diuji dalam kod combat.


## Rich text yang dikemas kini

- Buka **ARTIFACT_RICH_TEXT_PREVIEW.html** untuk mencuba hover semua artifact.
- **SOR_RICH_TEXT_CALCULATION.md**: standard 3 warna, 55 glosari, calculation dan audit 31 artifact.
- **rich_text/**: glosari, description bersegmen, data contoh, theme CSS/JSON, rumus dan panduan integrasi.
- Calculation ungu lembut; istilah matematik pink lembut; istilah game hijau lembut. Teks biasa ikut design game.
- Semua ikon individu, sheet dan artwork asal dikekalkan. Source game belum diubah oleh pakej aset ini.
