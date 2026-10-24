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

## Reward and Shop width correction 2.5.3

Bound only Reward and Shop panel/card widths instead of filling arbitrary ultrawide space. Preserve portrait cards, square source-art proportions, a horizontal row of three choices and native row scrolling on phones. Keep artwork, other situation panels, Home, combat and existing actions unchanged. The browser suite now verifies geometry directly rather than only checking page overflow.

## Rich text — 2.6.0

Artifact Pack V3.2 uses soft purple numbers for resolved calculations, pink math terms and green game terms, distinguished by color only. Only annotated tokens receive colors; normal text and card-role frames inherit the existing theme. One tooltip owner supports hover, keyboard focus and tap, can be reached by pointer, stays within the viewport, and closes with Escape/outside click. Its content is escaped and connected through aria-describedby. Inside a dialog, Escape dismisses the tooltip first. Selection, term and result buttons are siblings rather than nested. The existing native modal owns focus and inert background behavior.

All 31 artifact rules use the same segmented-description owner in choices, pending trial and inventory. The 55-term glossary is available in inventory. Calculations expose before/after values, sources, actual caps and rounding; labels distinguish deltas, totals and price. No lesson answer or effect is committed by reading a definition.


## Map, modes, Boss and Shop — 2.12.0

2.12: mode choices share illustrated medallion size, native buttons and explicit difficulty descriptions. Shop has separate 3×2 card/artifact racks with visible prices/effects, Sold/not-enough-Gold states and natural document scrolling. Narrow racks alone scroll horizontally. Removal reuses the native selector plus named consequence/Gold confirmation. Shared tooltip, toast, dialog focus and English copy remain canonical.

## Mystery scene and Shop tabs — 2.13.1

**DISAHKAN:** Ijamm requests a full-background Mystery scene matching the Dungeon Master, separate Buy Cards / Buy Artifacts / Remove Card tabs, and the existing rich-text style in Mystery. Rest in reference 053417 is approved.

The existing supplied Mystery artwork fills the scene behind the live HUD and right panel; phones retain an art banner and natural scrolling. Only one Shop tab panel is exposed. Native tabs support pointer, keyboard and 44px targets; hidden stocks cannot crowd the current service. Green terms and purple snapshot previews use the existing STM_SHARED tooltip owner, while questions retain pink mathematical terms. Previews are read-only and do not become resolved rewards. Source and verification: [room UI 2.13.1](../ROOM_UI_2_13_1.md).

## Education Practice — 2.14.0

The user requests a sixth Main Menu action for education only. **Education Practice** opens the full 120-question folio with a persistent, native Main Menu return and focus restored to its trigger. Keep the existing menu artwork and 44px minimum targets. The folio owns its responsive atlas, theme/language controls and tooltip document. Fill table/Venn values directly in Hint 1 as requested in the latest screenshots; use “Not given” only for mathematically unspecified data. More Hint explains the filled reference. Keep final selection marks and the final answer panel in the solution stage. Artifact/Mystery screens use the same clearer question context and gated source notes. Details: [Education 2.14.0](../EDUCATION_PRACTICE_2_14_0.md).


## Question feedback — 2.15.0

Education Practice adds categories and plain-text comments below every question, with “Yes, we do read your comments.” Use native checkbox labels, textarea, Save, live status and 44px controls. Main Menu/Finish practice opens one native exit dialog with comment count, delivery explanation, export/share and keep-reviewing/return actions. Restore focus on cancellation and return. Clearly distinguish saved-on-device comments from comments shared with Ijamm. Owner and limits: [Question feedback](../QUESTION_FEEDBACK_2_15_0.md).


## Question language — 2.16.0

Whole-question English/Bahasa Melayu is implemented on education. Source review, scope and validation: [Question language](../QUESTION_LANGUAGE_2_16_0.md).


## Education entry points — 2.16.1

Current menu language/Practice controls, shared learning presentation and stable versioned entry pages: [fix and actual checks](../EDUCATION_ENTRYPOINTS_2_16_1.md). Offline generated output is now SLAY-THE-MATH-OFFLINE.html.


## Question menu — 2.17.0

Bound Artifact/Mystery scene height to the available viewport and give their focusable question panels internal vertical scrolling. Preserve scroll for the same encounter and focus new guidance. Use Ink and a small bilingual Math term / Game term / Calculation legend; Practice defaults to Ink. [Checks and screenshot](../QUESTION_MENU_2_17_0.md).


## Settings and release delivery — 2.17.0

By Ijamm’s request, the floating main-menu Question language control moves into Save and Settings. Changing it keeps the dialog open and focused, and uses the existing saved whole-question preference. Display the generated runtime version in both menu and Settings. In-question/practice controls remain available. [Details](../SETTINGS_RELEASE_2_17_0.md).


## Supplied 40-card mechanics and display — 2.18.0

The explicit request to apply the supplied 40-card package supersedes the earlier Passive exclusion and eight/twelve-card pool baseline. Current scope, stable-ID compatibility, base values/upgrade extension, transaction and rendering owners: [Cards and display 2.18.0](../CARDS_AND_DISPLAY_2_18_0.md). Source-authoritative mechanics remain playtest tuning.


## Combat and Predict — 2.19.0

DISAHKAN: combat occupies one viewport. Consolidate room/Gold/turn/deck in the header; move Menu into Settings; place Hand count over resources; move used piles above Predict and artifacts along the arena upper edge. The former piles area shows a small actor/turn log with a full native dialog. Passive icons/trigger counts sit beside Alyssa. Keep 44px actions and keyboard access. Narrow/short layouts preserve local hand/status/Passive panning and dialog scroll without a combat document scrollbar. Predict uses the same Ink BM/English math/support renderer as Artifact/Mystery. See [Combat and Predict 2.19.0](../COMBAT_AND_PREDICT_2_19_0.md).


## Passive and supplied audio — 2.20.0

Show the active `/3` counter and an incoming-card/cost summary with full-frame outgoing candidates. Cancel is free before swap commit; an explicitly closed legacy trim remains reopenable. Bind to rendered choice IDs and ignore native double-click repeats. Keep fixed card sizing and native local dialog scrolling/panning. Sound settings expose independent Voice volume/mute alongside existing Music and Sound FX; do not invent spoken subtitles. See [Passive and Music 2.20.0](../PASSIVE_AND_MUSIC_2_20_0.md).

## Rich text: color only — 2.21.3

DISAHKAN oleh Ijamm (22 October 2026): remove all decorative rich-text underlines and token bottom borders, including hover states and legends. Apply across questions, answers, hints, cards, artifacts, tooltips and Education Practice. Keep real fraction bars, mathematical notation, keyboard focus outlines and existing tooltip interactions. This rule supersedes all previous dashed/dotted rich-text rules.


## Painted icon controls — game 2.23.0

Existing buff/debuff buttons retain 44px targets, real counts and accessible detail labels; use the full artwork box within each button for the new painted glyph. Closed/open boss seals and mixed Attack+Block intent reflect existing engine values only. Music, Voice and Sound FX show their own muted/unmuted icon without conflating the three mixer buses. Save information, Export/Import and question topic labels keep visible text beside decorative art. Color-only rich text and genuine fraction bars remain canonical. Scope and actual visual checks: [Icon package 2.23.0](../ICON_PACKAGE_2_23_0.md).


## Learning Report preview — 2.25.0-analytics.1

Learning Report is available from actual Main Menu, Settings and Education Practice, following the saved question language in English/BM. Use a shared escaped Ink/gold renderer, sample-count chapter bars, SK/SP detail tables, recent-session bars, linked revision and CSV/JSON downloads. Empty evidence is Not assessed; sparse evidence is Not enough evidence. A native bounded dialog owns scrolling; report controls keep keyboard focus through async delivery updates. Sharing starts off and distinguishes local, offline, pending, sending and exact receiver-confirmed states. Explain that sending resumes while the game is open/reopened, and that a receiver is needed. Existing question comments/native Share/exit cancellation remain. [Contract](../EDUCATION_ANALYTICS_2_25_0.md).

## Google collection preview — 2.28.0-sheets.1

Shared Learning Report adds a collapsed Collection link / Pautan pengumpulan field outside the asynchronously updated sending status. Both host and Practice use the same destination label, paused-on-switch consent and current-destination pending count. Validate /exec URLs before saving; preserve typed text/focus during delivery updates and focus Enable sharing after a destination change. Disable setup and sending in Dev/file Practice. Retain Ink/gold, native bounded dialog scrolling, color-only rich text and visible privacy/reopen guidance. [Owner setup](../GOOGLE_SHEETS_SETUP.md).


## Complete player tutorial — 2.31.0

Ijamm requests completing the full illustrated in-game tutorial, including self-captured screenshots. Replace the old four-page help with 17 English/BM chapters, genuine player-UI screenshots and isolated actual-engine exercises. Keep existing Tutorial entry/focus, native modal semantics, responsive scrolling and image enlargement. Only tutorial progress/language persist; never capture its examples into player saves/history/reports/collection. Timed Mystery deadlines continue and show a warning. Current owner and evidence: [Tutorial 2.31.0](../TUTORIAL_2_31_0.md).
