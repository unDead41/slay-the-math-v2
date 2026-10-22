# 06 — Ikon, emblem dan simbol matematik

Versi: 2.2.0. Rujukan visual ialah [konsep kad](../../references/card_concepts_v001.jpeg), [sheet MC](../../references/mc_dungeon_concept_v001.jpeg) dan arahan Focus terkini Ijamm.

## Peranan

**ICO-01:** Satu makna menggunakan satu ikon utama. Ikon yang sama tidak bertukar fungsi antara skrin.

**ICO-02:** Utility UI menggunakan glyph jelas. Emblem kad boleh mempunyai bingkai logam/bevel seperti gambar, tetapi glyph kategori di dalamnya tetap sama. Jangan campur rendering secara rawak dalam peranan sama.

## Registry minimum

| ID | English label | Bentuk |
| --- | --- | --- |
| hp | HP | Jantung |
| block | Block | Shield penuh |
| energy | Energy | Lencana bulat emas + tanda Energy; kos angka di atasnya |
| focus | Focus | Kristal mata cyan daripada atlas asal, dalam bingkai bulat emas; berbeza daripada Predict |
| predict | Predict | Orb ramalan cyan bercahaya di atas tiga kad; bingkai bulat emas yang sepadan |
| attack | Attack | Bilah; frame merah |
| defense | Defense | Shield; frame biru |
| skill | Skill | Buku terbuka; frame teal |
| passive_draft | Passive | Orbit/kristal; frame ungu, konsep sahaja |
| affinity_fire | Fire | Nyalaan |
| affinity_neutral | Neutral | Bulatan kosong |
| draw_pile | Draw Pile | Timbunan dengan anak panah masuk |
| discard_pile | Discard Pile | Timbunan dengan anak panah turun |
| filtered_pile | Set Aside | Kad dengan penapis |
| draw | Draw | Kad keluar dari timbunan |
| filter | Filter | Kad melalui penapis |
| topic_probability | Probability | Dua gelang/Venn |
| topic_expansion_factorisation | Expansion & Factorisation | Grid/jubin algebra |
| topic_indices | Indices | x² atau x³ |
| union | OR | Kedua-dua bulatan Venn terang |
| intersection | AND | Persilangan terang |
| independent | Independent | Dua cabutan dengan reset |
| dependent | Dependent | Cabutan bersambung |
| exclusive | Mutually Exclusive | Dua bulatan berasingan |
| battle | Battle | Bilah |
| elite | Elite | Crest bertanduk, berbeza daripada boss |
| rest | Rest | Api kem di atas dasar |
| shop | Shop | Beg syiling |
| mystery | Mystery | Tanda soal |
| boss | Boss | Mahkota/crest besar |
| gold | Gold | Syiling |
| help | Help | Buku/tanda soal |
| settings | Settings | Gear |
| sound | Sound | Pembesar suara |
| save | Saved | Fail dengan tanda semak |

ID lama tactic boleh dipetakan kepada skill melalui adapter; jangan membuat dua kategori kerana alias. Defense ialah jenis kad; Block ialah nilai sementara, dan mesti dilabel apabila konteks samar.

## Bentuk dan akses

**ICO-03:** Utility glyph: grid 32 unit, safe area 3, stroke 2, hujung bulat. Semak pada 20/24/32 px. Bingkai lencana ialah layer berasingan.

**ICO-04:** Sasaran sentuh minimum 44 × 44 CSS px; accessible name English. Tiada emoji sebagai aset produksi.

**ICO-05:** State active/focus/disabled tidak bergantung pada warna sahaja. Emblem logam tidak boleh mengurangkan kejelasan pada 24 px.

**ICO-06:** Ikon topik bukan jenis kad. π dalam draf bukan pengganti ikon Indices. Formula pembelajaran dirender sebagai teks sebenar, bukan glyph dekoratif.

Lulus apabila Energy/Focus, Draw/Filter, Elite/Boss dan Attack/Defense/Skill dapat dibezakan pada saiz sebenar. Rujuk [14](14_ASSET_PIPELINE.md).


## Dungeon Edition 2.1 — current integration

The six supplied framed transparent map icons now own node, choice and legend art. Canonical mapping is DCVisuals.mapIcons in dist/visuals.js; source colors/frame/alpha contract: modules/map/SOR/02_MAP_ICONS.md. Existing resource/card icons remain unchanged.

## Combat Edition 2.2 — historical Focus and Predict separation

The original 2.2 treatment (superseded by ICO-07 below): Ijamm explicitly requires a new Focus icon which is different from Prediction/Predict. `dist/assets/icon-focus.svg` is the canonical Focus resource icon: gold concentration target, four directional markers, warm ruby centre. `DCVisuals.icons.focus` owns its path and the shared `icon` renderer loads it. Predict retains the cyan faceted orb glyph. Neither icon changes the rule: Predict can earn Focus; Focus boosts one eligible card. Keep text labels and numeric counters beside both.

The Focus SVG is newly authored utility artwork. Existing model, arena, map and soundtrack art stays sourced from the user's packages.

## Dungeon Edition 2.3 — latest UI atlas

Use the latest Finalize Design UI ICON atlas for Hand, Draw, Discard, Exhaust, Tutorial, Collection, Settings, Energy, HP and Gold. Mechanical crops follow paddedRegion in ui-icons-atlas.json and retain alpha. Runtime owner is DCVisuals.icons. The original 2.3.0 integration retained the earlier gold/ruby Focus and wireframe Predict. Their current replacements are specified in ICO-07/08 below. All icon controls keep visible text or accessible labels. Existing six map seals are retained.

## HUD icon correction 2.3.2 — current canonical assets

**ICO-07:** Focus uses the supplied `ui-focus.webp` cyan eye crystal from Finalize Design(2).zip. Predict uses `ui-predict.png`: a distinct cyan divination sphere with a glint above three fanned cards. Both follow the atlas's double gold circular frame and four diamond studs. `DCVisuals.icons.focus/predict` own these paths. The former gold/ruby line target and wireframe Predict are superseded. Predict still earns Focus; Focus still boosts an eligible card.

**ICO-08:** At 1920×1080, Energy/Focus use 72px artwork boxes, Predict 42px, and both HP badges 30px. Energy has no additional CSS circle shrinking its source badge. Smaller layouts use 60–66px resource badges, 40–42px Predict and 24–30px Health; 4K uses the shared combat unit. Preserve aspect ratio, alpha, labels and numeric values. Actual checks: `docs/FIX_HUD_ICONS_2_3_2.md`.

**ICO-09:** Rest's healing choice uses `DCVisuals.icons.rest`, referencing the same supplied blue campfire seal as `DCVisuals.mapIcons.camp`. The choice displays a 68px asset on desktop / 60px on phones. Keep its native select/preview/confirm flow and heal value owned by the engine. The separate decorative fire behind Alyssa is not a UI control.


## Supplied 40-card mechanics and display — 2.18.0

The explicit request to apply the supplied 40-card package supersedes the earlier Passive exclusion and eight/twelve-card pool baseline. Current scope, stable-ID compatibility, base values/upgrade extension, transaction and rendering owners: [Cards and display 2.18.0](../CARDS_AND_DISPLAY_2_18_0.md). Source-authoritative mechanics remain playtest tuning.
