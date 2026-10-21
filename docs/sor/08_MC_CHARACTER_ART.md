# 08 — MC pengembara dungeon dan model sheet

Versi: 2.1.0. Nama dan gelaran terkini DISAHKAN oleh Ijamm; sheet asal kekal rujukan seni.

## Keutamaan sumber

1. [Sheet MC dungeon](../../references/mc_dungeon_concept_v001.jpeg): kostum, empat pandangan dan motif semasa.
2. mc_female_main_model.png: asal wajah, rambut merah dan identiti watak.

Sheet baharu sudah menunjukkan depan, sisi, belakang dan sisi lawan. Jangan lagi mendakwa tiada rujukan belakang. Label kiri/kanan masih perlu disemak terhadap sisi anatomi sebelum rig.

**CHR-01:** Nama penuh MC ialah **Alyssa the Clairvoyance**, mengikut arahan langsung Ijamm. Nama: **Alyssa**. Gelaran: **the Clairvoyance**. Kekalkan ejaan ini; jangan gantikan dengan “the Predictor” atau “the Clairvoyant”. ID stabil kekal `mc_01`; nama ini tidak mengimport lore atau mekanik projek lain. Pemilik runtime: `DCConfig.MC` dalam `dist/config.js`.

## Identiti watak

- Rambut merah panjang beralun, ikatan tinggi/belakang dan reben gelap.
- Wajah/mata hangat dan gaya anime yang sama.
- Short cape merah bertrim emas, pakaian arang berlapis dan armor kulit ringan.
- Harness/belt, pouch, tali, sarung tangan/bracer, pelindung lutut dan but bertali.
- Lantern untuk meneroka dungeon; folio/satchel membawa motif matematik.
- Proporsi mengikut sheet semasa, konsisten antara semua pandangan.

**CHR-02:** Kostum mage merah/putih berlengan besar dalam rujukan lama bukan lagi kostum lalai. Siluet semasa ialah dungeon adventurer merah, arang dan kulit coklat.

| Bahan | Arah warna | Peranan |
| --- | --- | --- |
| Rambut/cape | Crimson / merah hangat | Identiti |
| Pakaian dalam | Arang | Struktur dan kontras |
| Kulit | Coklat gelap | Belt, pouch dan but |
| Logam | Emas/brass lusuh | Trim dan clasp |
| Lantern | Amber | Cahaya penjelajahan |

Warna di atas ialah arah bahan, bukan ukuran hex daripada imej.

## Tiga topik pada kostum

| ID | Topik | Bukti dalam sheet | Kontrak |
| --- | --- | --- | --- |
| T1 | Probability | Dua gelang pada gesper dengan permata tengah | Boleh merujuk union/intersection |
| T2 | Expansion & Factorisation | Grid/jubin pada folio/pouch | Motif algebra tiles; bukan jawapan tersirat |
| T3 | Indices | Bracer x²/x³ dan aksesori permata | Eksponen mesti dipaparkan dengan betul |

**CHR-03:** Ketiga-tiga ini topik utama. Tiga subfokus Probability dalam v1 kini berada di bawah T1.

**CHR-04:** Grid hiasan tidak membuktikan identiti algebra. Jika digunakan untuk mengajar, tambah dimensi/label yang menjadikan contoh itu benar.

## Sisi dan turnaround

**CHR-05:** Pandangan depan meletakkan lantern di kanan penonton (kiri anatomi MC), folio di kiri penonton (kanan anatomi MC). Jadikan ini anchor semakan; selaraskan profil/back jika draf bercanggah.

**CHR-06:** Sheet produksi menggunakan FRONT · LEFT · BACK · RIGHT, full body, orthographic, pose neutral dan garis tapak kaki sama. Label produksi English.

**CHR-07:** Jangan mirror satu sisi untuk menghasilkan sisi lawan. Lantern, folio, bracer dan reben mesti kekal pada sisi sama.

Fail diterima ialah JPEG 1600 × 900 px. Master 4096 × 2304 px kekal sasaran eksport baharu. Parchment bukan latar alpha.

## Battle dan penerimaan

MC menghadap kanan pada desktop, foot anchor pusat bawah. Portrait, turnaround dan battle sprite mempunyai asset ID berbeza.

Set minimum: idle, attack/cast, defend, hit, victory. Boleh bermula dengan aset statik + VFX. Api kekal pada serangan Ember; tidak perlu mengelilingi MC sepanjang masa.

Lulus apabila wajah/rambut sama, aksesori tidak bertukar sisi, tiga motif kekal, belakang boleh dirujuk dan komposit tidak disalah anggap sprite animasi.

Rujuk [18](18_DESIGN_REFERENCES.md), [14](14_ASSET_PIPELINE.md) dan [17](17_AI_PROMPTS_TEMPLATES.md).


## Dungeon Edition 2.1 — current integration

Ijamm explicitly names the current MC Alyssa and places her at the right of the new main menu. The supplied transparent standing four-view sheet owns standing appearance. Existing action sheets remain. Stable game/save IDs are unchanged.

## Combat Edition 2.2 — approved title and combat presentation

**CHR-08:** Display **Alyssa the Clairvoyance** consistently in the menu, combat title and accessible description. Presentation can split the name and title onto separate lines; `DCConfig.MC` remains their single runtime owner.

**CHR-09:** The current combat reference places Alyssa on the **left**, full body, above a grounded foot shadow and her HP panel. Use the supplied transparent front view to match the reference's open stance. The existing Attack, Defend, Skill and Damage assets remain outcome-driven poses. The source sheet is not a frame animation or a new 3D model.

The exact user reference and scope are recorded in [18](18_DESIGN_REFERENCES.md), decision `DEC-20261019-01` and [Combat Edition](../COMBAT_EDITION_2_2.md). HP, Energy, Focus, card definitions and save schema are unchanged by the naming/layout update.

## Dungeon Edition 2.3 — grounded Alyssa

**CHR-09:** The exact approved identity remains **Alyssa the Clairvoyance**. Finalize Design(2).zip / MC/MODEL/mc_standing_4_pov.png owns the new standing crop. Standing and retained action crops are exported onto the same 1600×1200 transparent canvas with foot pivot (800,1100). The scene transform anchors this pivot to the floor shadow; status panels do not own sprite positioning. No vertical standing-idle animation is applied. Menu artwork uses five user-supplied Alyssa scene references with baked UI removed; the real menu is rendered separately.

## Alyssa animation request — 21 October 2026

Ijamm requests updating Alyssa's animation alongside Stage 1 enemies. MODEL(1).zip was not made available in the workspace; no contents or new hero frames from that file were read/used. Existing Alyssa artwork remains in place while a retry/upload is needed. The presentation reaction to End Turn now uses actual resolved HP loss, including automatic artifact Block, independently of future hero frame assets.

## Supplied Alyssa motion — game 2.8.0

The subsequent direct instruction identifies the already-stored `MODEL.zip`. That readable v2 pack resolves the pending-artwork status above: five clips / 30 frames now play in both stages, facing right without flipping. Preserve source durations and per-frame boot pivots, including horizontal shifts for wide Attack/Skill poses. Runtime cells are 1024px; the original 4K canvases are upscaled exports. Provenance, floor registration, fallback and verification: [Alyssa 2.8.0](../ALYSSA_ANIMATION_2_8_0.md).

## Right-facing-only correction — 2.8.1

Ijamm explicitly requires the new right-facing family for all five combat motions. The earlier `ground-alyssa-*` image fallback is superseded by frame projections from the same approved motion source, owned by `DCAnimationData.hero.posters`. Use that registry for standing/Idle, Attack, Defend, Skill and Damage/Damaged, including loading, unavailable Canvas, texture failures and Motion Off. Do not revive earlier front-facing poses. Source hashes and verification: [2.8.1](../ALYSSA_RIGHT_ONLY_2_8_1.md).

### Skill scale calibration — 2.9.0

The six supplied Skill poses have different crown-to-boot body heights. Preserve source pixels and casting anatomy; apply a uniform per-frame projection correction about each supplied boot pivot, referenced to frame 0. Crown landmarks exclude fire/cards. All six corrected body heights match within one source pixel and every complete alpha bound remains inside the common canvas. The hero remains right-facing, with no mirrored or legacy poses. Measurements and factors are in the import audit; the importer reproduces the registry.
