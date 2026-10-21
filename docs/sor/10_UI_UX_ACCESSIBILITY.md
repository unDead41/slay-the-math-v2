# 10 — UI, English mudah dan aksesibiliti

Versi: 2.0.1. Bahasa game English mengikut arahan Ijamm; dokumentasi SOR boleh kekal BM.

## Bahasa produksi

**UX-01:** Gunakan ayat pendek, kata kerja jelas dan istilah RPG biasa. Jangan campur BM/English pada kad, tutorial, error, map, menu atau teks gambar yang dirender.

| Konsep | Label produksi |
| --- | --- |
| Tenaga / perisai / Fokus | Energy / Block / Focus |
| Ramalan | Predict |
| Serangan / Perisai / Taktik | Attack / Defense / Skill |
| Tebas / Bara / Benteng-Lindung | Slash / Ember / Guard |
| Tarik / Tapis | Draw / Filter |
| Mula / Sambung | New Run / Continue |
| Tamat giliran / Kembali | End Turn / Back |
| Pilih / Langkau | Choose / Skip |
| Kem / Kedai / Tanda soal | Rest / Shop / Mystery |
| Beli / Pulih / Naik taraf | Buy / Heal / Upgrade |

Nama kerja kad ungu ialah Ward; ia bukan nama baharu resource Focus. Alias dan ID dimiliki [04](04_CARD_SYSTEM.md).

Contoh copy: “Deal 6 damage.”, “Gain 5 Block.”, “Draw 2 cards.”, “Not enough Energy.”, “Choose your next room.”, “Cards are put back after each draw.”

Istilah matematik perlu tepat walaupun ringkas: mutually exclusive tidak ditukar kepada independent. Tutorial boleh memberi contoh selepas definisi.

## Token dan hierarki

| Token | Nilai cadangan | Fungsi |
| --- | --- | --- |
| background | #0D1421 | Latar dungeon |
| surface | #192735 | Panel gelap |
| textPrimary | #F5EEDD | Teks atas gelap |
| textSecondary | #C3CDD6 | Teks sokongan |
| accentGold | #D9B464 | Trim / tindakan utama |
| accentIce | #8AD7E8 | Informasi |
| parchment | #EFE0BB | Panel kesan kad |
| ink | #251F1B | Teks di parchment |
| danger | #F19B91 | Amaran + label |
| success | #9ED9B1 | Betul + label |

Nilai sasaran, bukan audit kontras. Warna keluarga kad ditentukan [05](05_CARD_VISUAL_DESIGN.md).

**UX-02:** Satu tindakan utama setiap skrin. Battle mengekalkan HP, Energy, Focus, intent, hand dan End Turn. Frame/tekstur tidak menutup teks.

**UX-03:** Spacing grid 8 px/4 px; teks isi sasaran 16–18 CSS px dan butiran penting sekurang-kurangnya 14 px.

## Skrin/room

| Skrin | Maklumat | Tindakan utama |
| --- | --- | --- |
| Menu | Tajuk, run aktif | New Run / Continue |
| Tutorial | Satu konsep dan contoh | Try / Next |
| Map | Current node, next edges, room type | Enter |
| Battle | Intent, sumber, kad, Predict | Play / End Turn |
| Reward | Tiga pilihan dan perubahan deck | Choose / Skip |
| Rest | Heal sebenar atau upgrade | Confirm |
| Shop | Gold, stok, harga, slot beli | Buy / Leave |
| Mystery | Event dan pilihan/hasil | Choose |
| Collection | Kad, kategori, afiniti, upgrade | View |
| Settings | Music, SFX, motion, Predict | Back |
| Summary | Hasil, route, masa aktif | New Run |

Map menunjukkan next node yang sah; jalur di luar edge tidak clickable. Room kosong atau stok habis sentiasa menyediakan Leave/Continue.

## Peranti dan input

Semak desktop 1280×720, landscape 844×390 dan portrait 390×844. Desktop: MC kiri, musuh kanan, hand bawah. Telefon mengurangkan ruang seni untuk keputusan; hand boleh discroll dan End Turn tetap dicapai.

**UX-04:** Tiada drag atau hover wajib. Klik/tap kad membuka preview; Confirm commit, Back/Escape membatalkan sebelum commit. Tiada had hand kerana ruang skrin.

**UX-05:** Keyboard boleh melengkapkan flow; fokus kembali ke pencetus selepas dialog. Target sentuh minimum 44×44 CSS px.

**UX-06:** Sasaran kontras projek 4.5:1 untuk teks biasa, 3:1 teks besar/kawalan penting; ukur pada aplikasi sebenar. Warna sentiasa disertai bentuk/label.

**UX-07:** Reduced motion, Music/SFX/mute, Predict skip dan pause disediakan. Countdown wajib tidak digunakan; masa aktif berhenti ketika pause/menu.

## Error dan penerimaan

Error pemain menyatakan tindakan: “Not enough Gold.”, “This room is complete.”, “Save could not be loaded.” Tiada seed, stack trace atau debug setting pada flow biasa.

Lulus apabila copy English konsisten, tidak clipping pada viewport ujian, map sah, room boleh ditinggalkan, nombor kad tepat dan flow tidak memerlukan hover/drag.


## Bukti implementation game 1.3.0

**UX-08:** Menu, kad, soalan, error, tutorial, map bercabang dan dialog dalam source 1.3.0 menggunakan English mudah. Nama stage: Rune Keep dan Draw Tower; boss: Twin Seal Guardian dan Deck Lord. Slash/Ember/Guard/Draw/Filter memaparkan ID kad sedia ada. Defense ialah jenis kad; Block ialah nilai pertahanan.

**UX-09:** Simpanan format 1 divalidasi mengikut struktur, kad fizikal, formula dan nilai jawapan sebelum teks soalan/intent BM lama dibina semula dalam English. Route bercabang atau route legacy, HP, RNG, Focus, seal, status hint dan checkpoint dikekalkan. Log BM lama boleh diganti mesej resume sahaja.

Rujukan source: `dist/app.js`, `dist/config.js`, `dist/math.js`, `dist/engine.js` dan `dist/map.js`. Ini laporan modul bahasa/audio yang diaudit, bukan pengesahan bahawa semua kontrak Shop, Passive atau T2/T3 sudah dilaksanakan.

## Source Edition 2.0 update

The user requested a rebuild against nine current menu references plus the supplied arena/MC/enemy/music packages. Runtime evidence, exact scope, source mappings, new Shop tuning, route-version compatibility and limits are maintained in [Source Edition](../SOURCE_EDITION.md), decisions 35–39, `DESIGN.md` and `UX-CONTRACT.md`. Earlier prototype examples in this document remain history where superseded. The implemented evaluator remains Probability; other planned math modes are not claimed active.

## Combat Edition 2.2 — current combat layout

The supplied reference now owns combat placement: turn badge top-centre; Alyssa left; enemy and intent right; HP bars below the models; hand centre-bottom; Energy/Focus/Draw left; Discard/Exhaust/Predict/End Turn right. Medium and narrow layouts reflow to natural document scrolling and a separately scrollable hand. Buttons remain native controls; shortcuts and dialogs retain their common owners. Full MC name/title follows SOR 08. Focus/Predict have different silhouettes per SOR 06.

The update also restores the exact pile trigger after a Predict dialog rerender, using its zone as well as its action. No card, HP, Energy, damage, reward, map or save-format tuning is part of this visual change.

## Dungeon Edition 2.3 — five-scene menu

Five supplied artwork references control Home's visual direction: Alyssa right, restrained gold title and five vertical controls left. Use clean backgrounds and native Continue/New Run/Tutorial/Card Collection/Settings controls, rather than hit targets over raster text. Continue is disabled without a valid run; New Run opens the existing mode/replace dialog. Manual 44px scene buttons support keyboard and touch. Changing art never moves menu controls. On phones, art sits above the menu in document flow. Actual sprites, floor background and their contact shadows share the battle theatre coordinates.

## Screen fit 2.3.1

The fixed 2048px combat width and 650px arena caps are replaced by full-width combat and a shared responsive CSS unit. Desktop controls scale with available width/height; existing phone reflow and natural scrolling remain. Cover framing centres on the 68% arena horizon to keep actors on the floor. The user's actual browser zoom is unverified; Ctrl+0 is the first troubleshooting step. Implementation/checks: `docs/FIX_SCREEN_FIT_2_3_1.md`, decision DEC-20261019-11.

## HUD icon correction 2.3.2

The four user-reported icon issues are corrected through the shared DCVisuals registry and responsive combat CSS. Use illustrated Focus/Predict assets with different central symbols. Energy's source badge occupies the whole resource slot; HP badges increase to 30px at FHD and 24px on phones. Label/number owners, native buttons, keyboard shortcuts and the previous screen-fit correction remain. See SOR 06 ICO-07/08 and `docs/FIX_HUD_ICONS_2_3_2.md`.

The additional Rest correction uses the original blue campfire seal on the healing choice, shared with the map Rest node. The heal preview and confirmation retain their existing native flow. It is included in the same 2.3.2 update.

## Map activation 2.4.2

The latest user instruction makes map icons native direct-entry buttons rather than preview toggles. Enabled icons expose category, level and Enter Room state without enemy identity. There is no aria-pressed state or separate confirmation button. Focus alone is safe; click, Enter and Space enter the exact legal node. Successful navigation moves focus to the main scene. Disabled nodes cannot enter. Existing atlas scrolling and global scrollbar ownership remain.

## Main menu fit 2.5.1 — 21 October 2026

**UX-10 (DISAHKAN):** Ijamm requests a smaller, unclipped Home model on UWHD and menu sizing that follows the display. Full foreground artwork uses contain framing with padding; a muted cover layer fills the edges. One viewport-derived menu unit scales the title, native menu buttons, footer and existing Settings/mode dialogs. At narrow or short heights the page/dialog scrolls; 44px controls remain reachable. The five menu actions, keyboard/focus, saved run and game rules retain their existing owners. Sources and limits: docs/MENU_FIT_2_5_1.md and tests/menu-fit-browser.cjs.

## Special situations 2.5.2 — 21 October 2026 (Malaysia)

The four newly supplied scene mockups govern Shop, Rest, chest reward/victory and defeat art. Reuse the canonical ornate panels, buttons, card renderer, type and navy/gold/cyan tokens. Keep all prices, HP, card effects and statistics live. dungeon.css owns the responsive situation variant: contained art and right-side panels on desktop; art banner then naturally scrolling controls below 1000px. Narrow card rows alone scroll horizontally. Preserve native focus/dialogs, 44px action targets and all current scene actions. Mockup-only labels do not authorize extra mechanics. See docs/SITUATION_ART_2_5_2.md.
