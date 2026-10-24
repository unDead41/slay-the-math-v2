# Daftar keputusan — Slay the Math

## DEC-20261024-COMBAT-POLISH-MAIN — Publish completed combat polish as 2.32.0

**DISAHKAN:** Ijamm now says “Okay push ke main please”. This supersedes the previous branch-only publication boundary for this completed combat update. Fast-forward tested main `6dc3ce3` through feature `b422a18`, then publish version/cache metadata and actual combined verification as 2.32.0. Preserve original art/icon mappings, source animations, gameplay/RNG and saves. The feature’s poster-based browser coverage and incomplete production/offline-build coverage remain explicit limits. [Main verification](../COMBAT_MOTION_MAIN_2_32_0.md).

## DEC-20261024-COMBAT-POLISH-BRANCH — Publish to combat-animation only

**DISAHKAN:** Ijamm subsequently asks to push the completed update to its branch if it has not been pushed. This supersedes DEC-20261024-COMBAT-POLISH-LOCAL’s no-branch-push boundary for this work only. Update the existing `combat-animation` branch from `7e0e6d7` using tested main `6dc3ce3` plus the completed polish. Preserve branch history with a checked fast-forward; do not update main or deploy. Runtime/artwork/gameplay remain the verified local result. [Scope, verification and limits](../COMBAT_MOTION_POLISH_LOCAL.md).

## DEC-20261024-COMBAT-POLISH-LOCAL — Improve combat feedback without publishing

**DISAHKAN:** after reviewing the eight proposed improvements, Ijamm says to update locally and not push to a branch. This supersedes previous main-push authorization for this new work only; existing published releases remain unchanged. **DITERUSKAN:** prioritize/merge actual status cues, combine exactly explained Passive/stat labels, separate crowded aura geometry, share cancelable presentation timing and one synthesized primary SFX, distinguish shield depletion from expiry, refine ten code-native Passive signatures, and persist Low/Full visual intensity in UI settings. Preserve artwork/icon mappings, source sprite timings, gameplay/RNG and run schema. **PERLU_VERIFIKASI:** physical devices, human SFX feel and a complete production/offline build with all original large assets. [Local scope and actual verification](../COMBAT_MOTION_POLISH_LOCAL.md). The later DEC-20261024-COMBAT-POLISH-BRANCH above supersedes the original no-branch-push instruction; main release is still not authorized.

## DEC-20261023-ART-RESTORE — Restore selected card and artifact illustrations

**DISAHKAN:** Ijamm explicitly requests the previous card/artifact icons and says to retain buff, debuff and UI/menu icons. This overrides the card/artifact portion of the 2.23 all-icon integration only. Restore all 40 selected card mappings from `dist/assets/card-assets.json` and all 31 artifact filenames from `dist/artifact-data.js`, using their existing verified source derivatives. Keep current UI, map, status and topic mappings and image bytes. Normal card builds and explicit reviewed-package reimports must preserve this boundary. Publish together with the authorized combat motion as 2.25.1. [Scope and verification](../ICON_ART_RESTORE_2_25_1.md).

## DEC-20261023-CARD-MOTION-MAIN — Publish combat animation to main

**DISAHKAN:** Ijamm explicitly requests "okay push ke main branch please" after the 2.25.0 feature-branch delivery. This supersedes the earlier `combat-animation`-only release boundary. Integrate the reviewed feature from `7e0e6d7` into main `2800f9a`. Following DEC-20261023-ART-RESTORE, the combined release is 2.25.1. Record fresh combined-tree verification in `docs/verification/combat-main-2-25-1.json`; prior branch reports remain historical evidence.

## DEC-20261023-CARD-MOTION — Combat card motion (2.25.0)

- **DISAHKAN:** Ijamm requests styled Draw, Discard and Exhaust card animation, plus trigger feedback for the ten current Passive cards.
- **DITERUSKAN:** implement on `combat-animation` from main `2800f9a` / 2.24.0. An ordered, unsaved observational journal preserves same-action Discard/reshuffle/redraw and merges only validated atomic clone results. The renderer saves before motion; no effect waits for an animation.
- **DITERUSKAN:** reuse source full portraits and original icons, keep hidden transfers face down, show actual Passive results from new combat-log entries, and dispose transient presentation on input/navigation/dialogs/visibility/resize/motion changes. Keep all gameplay values, stable IDs, RNG and saves unchanged.
- **PERLU_VERIFIKASI:** Ijamm's feel/physical-device review. MODEL.zip remained unavailable and is not applied. This initial feature-branch boundary is superseded by DEC-20261023-CARD-MOTION-MAIN above. [Scope and verification](../CARD_MOTION_2_25_0.md).

Versi: 2.0.1 · 18 Oktober 2026

## Sumber

| Kod | Sumber | Sokongan |
| --- | --- | --- |
| S1 | Permintaan awal projek | Web game dari kosong; dua stage, satu boss setiap stage |
| S2 | Perbualan Digitalize Duel Cube Math | Asas Probability, deck 12, HP 60, Energy 3, draw 4, Predict/Focus dan stage/boss |
| S3 | Menu prototaip Menara Kemungkinan v1 | Tajuk lama dan fokus Probability; bukan bukti semua kod |
| S4 | Screenshot kad awal | Tebas/Bara/Tarik/Tapis dan nilai asas |
| S5 | mc_female_main_model.png | Asal wajah/rambut merah |
| S6 | Permintaan sheet/SOR | Empat sudut dan MD untuk rujukan |
| S7 | WhatsApp Image 2026-10-18 at 13.12.10.jpeg | Sheet MC dungeon, belakang, Probability/Expansion & Factorisation/Indices |
| S8 | WhatsApp Image 2026-10-18 at 13.22.17.jpeg | Frame emas, empat keluarga warna, parchment dan konsep Passive |
| S9 | Arahan projek terkini 18 Oktober 2026 | Map bercabang; dungeon; English mudah; muzik stage/Rest/Shop/Mystery/Elite |

Dua imej S7/S8 telah diperiksa dan disertakan dalam [18](18_DESIGN_REFERENCES.md). Source game, bank penuh, playtest dan kurikulum rasmi belum diaudit oleh kemas kini dokumentasi ini.

## Asas diteruskan

| ID | Status | Keputusan |
| --- | --- | --- |
| DEC-20261018-01 | DISAHKAN | Bebas daripada mekanik kit fizikal lama |
| DEC-20261018-02 | DISAHKAN | Dua stage, satu boss setiap stage |
| DEC-20261018-05 | DITERUSKAN | HP 60, Energy 3, draw 4, starter 12 |
| DEC-20261018-06 | DITERUSKAN | Stage/boss lama dan HP boss 70/95; label English melalui alias |
| DEC-20261018-07 | DITERUSKAN | Predict memberi Focus; Draw dan Filter |
| DEC-20261018-09 | DISAHKAN | MC rujukan, sheet empat sudut dan motif matematik |
| DEC-20261018-10 | DISAHKAN | Pakej MD untuk rujukan pengguna dan AI |
| DEC-20261018-12 | CADANGAN | Focus had 3; +1 betul; belanja 1 untuk +2 damage/Block |
| DEC-20261018-13 | CADANGAN | Predict sebelum draw, satu cubaan, hint/skip |
| DEC-20261018-15 | CADANGAN | Pola boss, fasa ≤50%, intent terkunci dikekalkan |
| DEC-20261018-19 | CADANGAN | Resolver/data/UI berasingan, RNG streams dan save idempotent |
| DEC-20261018-20 | CADANGAN | Sasaran kerja dua minggu, dinilai terhadap skop semasa |

## Keputusan 2.0

| ID | Status | Arah semasa | Pemilik / menggantikan |
| --- | --- | --- | --- |
| DEC-20261018-21 | DITERUSKAN | S7/S8 ialah design awal, bukan aset produksi atau kontrak mekanik lengkap | 18; S7/S8 |
| DEC-20261018-22 | DITERUSKAN | T1 Probability, T2 Expansion & Factorisation, T3 Indices; fokus lama ialah subfokus T1 | 02,08; menggantikan tafsiran luas 03/04 lama |
| DEC-20261018-23 | DISAHKAN | Rambut merah, kostum pengembara dungeon; sheet baharu sumber kostum semasa | 08; S7/S9, menggantikan kostum 18 lama |
| DEC-20261018-24 | DITERUSKAN | Frame emas, nama atas, kos kiri, art besar, parchment; Attack merah/Defense biru/Skill teal/Passive ungu | 05,06; S8, menggantikan 08/17 lama bagi visual |
| DEC-20261018-25 | CADANGAN | Slash/Guard/Draw ialah label English bagi ID lama; Ward nama kerja konsep ungu | 04,10; tiada kad aktif tambahan |
| DEC-20261018-26 | DISAHKAN | Map bercabang dan room Rest/Shop/Mystery/Elite; dua boss kekal | 09; S9, menggantikan route 14 lama |
| DEC-20261018-27 | DISAHKAN | Teks game English mudah, istilah RPG biasa | 10; S9, menggantikan default BM |
| DEC-20261018-28 | DISAHKAN | Stage 1/2 track berbeza; Rest/Shop/Mystery; Elite 1/2 track berbeza | 11; S9 |
| DEC-20261018-29 | CADANGAN | Contoh DAG lima room/laluan/stage, nilai Gold/Shop/event dan statistik Elite | 07,09,12; menggantikan ekonomi 16 lama |
| DEC-20261018-30 | CADANGAN | Graph/room/save/alias schema perlu diselaraskan semasa implementation; Passive kekal tidak aktif | 13; tiada migration runtime didakwa siap |

Rujukan design diteruskan tidak bermaksud setiap perkataan/angka dalam gambar sudah diluluskan sebagai mekanik.

## Rekod lama yang digantikan

| ID lama | Rekod v1 | Pengganti |
| --- | --- | --- |
| DEC-20261018-03/04 | Probability T4 dan tiga subfokus sebagai keseluruhan fokus | 22; Probability kekal T1, tahap semua topik perlu mapping |
| DEC-20261018-08 | Emas/biru ais dan gaya kad awal | 24; UI gelap masih boleh diteruskan |
| DEC-20261018-11 | Starter bernama Tebas/Benteng/dll | 25; komposisi 5/3/2/1/1 kekal |
| DEC-20261018-14 | Dua battle + kem + boss dalam laluan linear | 26/29 |
| DEC-20261018-16 | Tiada Gold/Shop; akhir deck maksimum 17 | 29; saiz deck ikut transaksi |
| DEC-20261018-17 | Nama bawah art; Taktik ungu | 24 |
| DEC-20261018-18 | Belakang direka baharu; kostum mage | 23; belakang kini dirujuk sheet |

## Perlu bukti

| ID | Perkara | Langkah |
| --- | --- | --- |
| VER-01 | Kod berbanding kontrak SOR | Audit source sebelum patch runtime |
| VER-02 | Kurikulum setiap topik | Semak dokumen rasmi, edisi, halaman dan SK/SP |
| VER-03 | Balance route/Gold/Elite/masa | Playtest dengan seed/versi dan bukti |
| VER-04 | Hak edaran rujukan | Rekod provenance/hak sebenar |
| VER-05 | Kontras/prestasi/browser | Ukur aplikasi sebenar |
| VER-06 | Passive dan integrasi T2/T3 | Tentukan trigger/duration/effect/flow sebelum aktif |
| VER-07 | Sisi aksesori dalam semua pandangan | Semak anchor depan; jangan mirror buta |

Status CADANGAN ialah baseline boleh diuji. Jangan menaikkannya kepada DISAHKAN kerana AI telah menulis fail. Keputusan baharu merekod sumber, pengganti, impak dan semakan sebenar.


## Bukti implementation audio / English — game 1.3.0

| ID | Status | Rekod | Impak / sumber |
| --- | --- | --- | --- |
| DEC-20261018-31 | DITERUSKAN | 10 fail komposisi instrumental asal: Menu, dua dungeon, dua Elite, dua Boss, Rest/Shop/Mystery | Memenuhi cue dalam 28; OGG/MP3, score dan sumber sintesis disediakan |
| DEC-20261018-32 | DITERUSKAN | UI/soalan/map/error English, kawalan Music/SFX, mute, crossfade dan duck ketika Predict | Source 1.3.0; 10/11, schema save 1 dengan teks dibina semula selepas validation |
| DEC-20261018-33 | DITERUSKAN | Source map bercabang 1.2.0 digabungkan; laluan, reward Elite dinaik taraf dan semakan route dikekalkan | Tidak menimpa kerja map semasa menambah audio/bahasa |
| DEC-20261018-34 | PERLU_VERIFIKASI | Shop, Passive dan T2/T3 masih kontrak pembangunan; tidak dilaksanakan oleh tugasan audio | Shop track boleh didengar; kernel semasa masih Probability; semak implementation tersendiri |

Nama stage English semasa ialah Rune Keep / Draw Tower; Twin Seal Guardian / Deck Lord ialah boss. Pilihan komposisi/treatment ialah baseline boleh ditala selepas pemain mendengar. Pemeriksaan numerik dan DOM tidak menggantikan audition atau QA browser sebenar.

## Source Edition 2.0 — nine-screen redesign

| ID | Status | Decision and evidence |
| --- | --- | --- |
| DEC-20261018-35 | DISAHKAN | User requests rebuilding/updating game against nine attached menu designs and source arena/MC/enemy/music ZIPs. Shared blue-stone, gold-frame, armoured-MC visual direction replaces older mage costume. |
| DEC-20261018-36 | DITERUSKAN | Implemented all nine live surfaces, Gold Shop, three normal/two elite identities per stage, twenty front-view roster assets and all four arenas. Details: docs/SOURCE_EDITION.md. |
| DEC-20261018-37 | CADANGAN | Economy tuning: start 80, wins +25/+40/+60, shop prices 45/60/65, three distinct once-only offers; retained 12 HP Rest and 8 HP Mystery. This supersedes earlier example amounts in 12 for runtime 2.0. |
| DEC-20261018-38 | DITERUSKAN | Route v2 adds Shop, v1/legacy topology retained. Save schema 1 uses additive validated fields and safe restore defaults. |
| DEC-20261018-39 | DITERUSKAN | User Stage 1 normal/elite and two boss tracks installed with circular seam processing. Other existing room music retained. Three math topics remain the broader project direction; this UI update does not activate algebra, indices or Passive. |

## Dungeon Edition 2.1 — current supplied assets and map SOR

| ID | Status | Decision and evidence |
| --- | --- | --- |
| DEC-20261018-40 | DISAHKAN | Ijamm requests the supplied dark dungeon/gold menu art style with **Alyssa on the right**, enemy models/actions, map icons and a ZIP plus VS Code terminal commands. Alyssa is explicitly named by the user; the earlier unnamed-MC note is superseded for this task. |
| DEC-20261018-41 | DISAHKAN | The subsequently attached Map VSCode With SOR package supplies the ten-level rules and all six icon identities. New runs adopt that map contract; detailed owner: `modules/map/SOR/01_MAP_RNG.md`. |
| DEC-20261018-42 | DITERUSKAN | Route version 3 stores the map snapshot; routes 1/2 and legacy runs retain their original five-level topology. Catalogue selection is deterministic and separate from combat RNG. |
| DEC-20261018-43 | DITERUSKAN | New transparent Alyssa standing views and Ember Mirror model/action sheet imported mechanically with alpha/padding. Other source roster models and prior MC action poses retained. Only Ember Mirror has a newly supplied dedicated action sheet. |
| DEC-20261018-44 | DITERUSKAN | Menu, map node/legend/choice seals and outcome-driven pose reactions integrated. Installation, mapping, verification and limits: `MULA-DI-SINI.md` and `docs/DUNGEON_EDITION_2_1.md`. |

## Combat Edition 2.2 — 19 October 2026 (Malaysia)

| ID | Status | Decision and evidence |
| --- | --- | --- |
| DEC-20261019-01 | DISAHKAN | Ijamm requests updating combat against `image(20261018-162222).png`, using existing supplied arena/MC/enemy/music ZIP assets. The screenshot controls layout; configured gameplay values remain authoritative. |
| DEC-20261019-02 | DISAHKAN | Focus requires a new icon distinct from Predict. A gold target/ruby utility SVG replaces the shared orb on the Focus control; Predict retains its cyan orb. |
| DEC-20261019-03 | DISAHKAN | Exact MC name/title is **Alyssa the Clairvoyance**, recorded in SOR 08 and displayed from DCConfig.MC. Stable ID mc_01 and saves are retained. |
| DEC-20261019-04 | DITERUSKAN | Combat reuses cardView, engine actions, pose registry and dialogs; layout is scoped in combat.css. The front standing view matches the reference's open stance; existing action poses remain. |
| DEC-20261019-05 | DITERUSKAN | Delivery updates the confirmed existing path `C:\Users\ijmah\Desktop\slay-the-math-v2` in place, with backup, drift checks and rollback. It does not open another VS Code window or create another Desktop project. |

## Dungeon Edition 2.3 — 19 October 2026 (Malaysia)

| ID | Status | Decision and evidence |
|---|---|---|
| DEC-20261019-06 | DISAHKAN | User requests using Finalize Design(2).zip and five attached Alyssa menu images, with player and enemies visibly standing on the arena floor. |
| DEC-20261019-07 | DITERUSKAN | Five clean-plate menu backgrounds with stationary native menu controls and accessible manual scene selection; optional motion-aware 14s autoplay. |
| DEC-20261019-08 | DITERUSKAN | Arena art moves from body cover framing into the shared battle theatre. Normal/Elite/Boss backgrounds from both stages load through DCVisuals.arena. Shared foot pivot and contact shadows replace independent sprite/panel anchoring. |
| DEC-20261019-09 | DITERUSKAN | All five Stage 1 dedicated key-pose sets and supplied utility icons imported. Existing stable enemy IDs, HP/intent, card/math/map rules and save format retained; Focus remains distinct from Predict. |
| DEC-20261019-10 | DITERUSKAN | In-place update retains the confirmed path C:\Users\ijmah\Desktop\slay-the-math-v2, validates source and affected-file hashes, backs up before replacement and supports rollback. No new VS Code window or Desktop project is created. |

## Screen fit 2.3.1 — 19 October 2026 (Malaysia)

| ID | Status | Decision and evidence |
|---|---|---|
| DEC-20261019-11 | DITERUSKAN | User reports small combat and empty margins in image(20261018-181322).png. Reproduced 60% combat width at a 3413×1708 CSS viewport. Remove fixed combat width cap; scale desktop presentation with a shared CSS unit; centre arena cropping on its floor horizon. Seven screen-fit cases plus existing combat/menu/grounding checks pass. Actual user zoom is not verified. Hotfix updates existing 2.3.0 in place with backup. Details: docs/FIX_SCREEN_FIT_2_3_1.md. |

## HUD icon correction 2.3.2 — 19 October 2026 (Malaysia)

| ID | Status | Decision and evidence |
|---|---|---|
| DEC-20261019-12 | DISAHKAN | Ijamm identifies Energy as too small, Focus as inconsistent with the icon design, Predict as missing its icon and Health as needing a larger icon in four uploaded crops (010651, 010718, 010808, 010838). |
| DEC-20261019-13 | DITERUSKAN | Map Focus to the supplied cyan eye badge and Predict to a distinct sphere/cards companion in the same gold-frame style. Enlarge Energy and HP through responsive combat CSS. This supersedes the 2.2/2.3.0 line-target and wireframe treatment, while retaining the requirement that Focus/Predict differ. Evidence: docs/FIX_HUD_ICONS_2_3_2.md and hud-icons-2-3-2.json. |

| DEC-20261019-14 | DISAHKAN | Ijamm adds a fifth crop (011706): Rest still has the old line-flame icon and must be updated in this same package. |
| DEC-20261019-15 | DITERUSKAN | Rest's healing choice reuses the supplied blue campfire map seal via the shared icon registry. Browser checks on desktop/phone verify the decoded artwork, uncommitted preview, exactly 12 HP on confirm and no duplicate healing on reload. |

## Artifact Edition 2.4 — 19 October 2026 (Malaysia)

| ID | Status | Decision and evidence |
|---|---|---|
| DEC-20261019-16 | DISAHKAN | User requests artifact implementation with actual effects; every new Challenge first meets the Dungeon Master, chooses a random Starting artifact, then reaches map paths. Re-uploaded ARTIFACT(1).zip is readable; use only necessary assets. |
| DEC-20261019-17 | DITERUSKAN | Three distinct eligible Starting offers are frozen once. Reuse the 31 runtime 800px icons and V3.1 effect values, excluding duplicate 4K/native/sheet art from the game. New original Dungeon Master encounter background; shared native choice/inventory controls. |
| DEC-20261019-18 | DITERUSKAN | 29 artifacts are obtainable. Initiate's Ring and Chain Weaver's Spool are excluded from offers until Passive/card-driven hand Discard exists. Their hooks are retained without silently enabling new cards. Lantern's enemy-damage threshold Block award occurs after the next player's reset so it remains usable. |
| DEC-20261019-19 | DITERUSKAN | Elite/Mystery pool, one Boss gift before Stage 2, independent artifact RNG, additive validated save data and unique acquisition ledger. Original math, card IDs, old saved paths and learning credit are preserved. Evidence: docs/ARTIFACT_EDITION_2_4.md. |

## Map and entity correction 2.4.1 — 19 October 2026 (Malaysia)

| ID | Status | Decision and evidence |
|---|---|---|
| DEC-20261019-20 | DISAHKAN | User requests a neater map, left legend, much larger scrollable level gaps and no selected-room enemy disclosure in references 021641/021700/021807. |
| DEC-20261019-21 | DISAHKAN | Reference 022006: Dungeon Master must be an unidentified non-human entity, with 4K artwork. |
| DEC-20261019-22 | DITERUSKAN | Existing mapView/native buttons remain owners. Wide atlas, left category/action rail, generic accessible labels and two-axis scroll restoration replace the identity-bearing preview. No generator, room or save changes. |
| DEC-20261019-23 | DITERUSKAN | Built-in image generation replaces the human with a dark rift and floating rune fragments. Native output was 1672×941; documented mechanical export is 3840×2160, explicitly upscaled. Actual checks: docs/MAP_ENTITY_UPDATE_2_4_1.md. |

## Direct map entry 2.4.2 — 19 October 2026 (Malaysia)

| ID | Status | Decision and evidence |
|---|---|---|
| DEC-20261019-24 | DISAHKAN | Reference 024803: remove Selected Path/Enter Room area; pressing the map icon must immediately open its scene. This supersedes the earlier preview/confirm interaction. |
| DEC-20261019-25 | DISAHKAN | Reference 025055: supply the exact approved entity artwork in 4K pixels. A 3840×2160 PNG export is included, explicitly upscaled from the 1672×941 source; existing runtime WebP already has 4K dimensions. |
| DEC-20261019-26 | DITERUSKAN | Reuse native node actions and engine entry. Left rail contains only the legend; click/Enter/Space opens the exact legal room with new-scene focus. Relevant engine and save values remain unchanged. Evidence: docs/DIRECT_MAP_UPDATE_2_4_2.md. |

## Form 4 review bank and supplied Master 2.4.3

| ID | Status | Decision and evidence |
|---|---|---|
| DEC-20261019-27 | DISAHKAN | User accepts three Form 4 chapters (9 Combined Events, 4 Sets, 3 Logic), requests 40 seed items each, random without repetition, and future education at Claim Artifact. Current explicit scope is questions first for review. Bank of 120 original MCQs is delivered separately; no runtime education gate is enabled. This supersedes the earlier algebra/indices content plan. Owner: SOR 02. |
| DEC-20261019-28 | DISAHKAN | User requests implementing image(20261019-032240).png. Its non-human stone Master with cyan eyes, carved face and hands supersedes the rift/no-anatomy art direction. Alyssa, altar and quiet right wall remain exactly as supplied. |
| DEC-20261019-29 | DITERUSKAN | New PNG is imported as the shared Dungeon Master WebP, mechanically upscaled to 3840×2160. Existing artifact choices, effects, claim/save flow and direct map entry remain. Desktop/phone, offline and packaging evidence: docs/STONE_MASTER_UPDATE_2_4_3.md. |

## Education gate 2.5.0

| ID | Status | Decision and evidence |
|---|---|---|
| DEC-20261019-30 | DISAHKAN | User reports no question after Claim & Choose Your Path and explicitly requests implementation using the existing 120 questions. This replaces the earlier review-only timing. |
| DEC-20261019-31 | DITERUSKAN | Shared artifact Claim now opens a saved trial: random unused item from the exact 40/40/40 bank, native four-choice answers, Hint, retry, correct explanation and final once-only artifact/progression commit. Exposure persists across New Runs/import/refresh; no auto-reset or HP penalty. Owners and verification: SOR 02/13/19, docs/EDUCATION_UPDATE_2_5_0.md. |
| DEC-20261019-32 | DITERUSKAN | The longer pending Elite flow exposes a prior snapshot gap after adding its card reward. Represent that new owned card in the ended battle discard snapshot until room completion, without firing effects. This preserves valid save/restore while the artifact question waits. Regression covers card reward, trial refresh and final claim. |

## Main menu fit 2.5.1 — 21 October 2026 (Malaysia)

| ID | Status | Decision and evidence |
|---|---|---|
| DEC-20261021-01 | DISAHKAN | User reports Home model clipping on UWHD, requests smaller model framing, display-scaled menu and 5s artwork transition. Six supplied screenshots could not be opened in the execution environment; the running menu was independently inspected at a 3413×1740 CSS viewport. |
| DEC-20261021-02 | DITERUSKAN | Reuse the five existing plates with a contained, padded foreground and dim ambience fill. Home and its existing non-wide dialogs share a viewport unit; scene controls remain native and stationary. Timing is 5000ms interval and 5000ms fade, with fixed image sources, decode/generation guards and existing motion/pause policy. Gameplay, saved runs, assets and combat styling are preserved. Verification and limits: docs/MENU_FIT_2_5_1.md. |

## Special situations 2.5.2 — 21 October 2026 (Malaysia)

| ID | Status | Decision and evidence |
|---|---|---|
| DEC-20261021-03 | DISAHKAN | Ijamm supplies four Shop, victory chest, quiet defeat and Rest/Explore mockups and explicitly requests applying their art style in the game. |
| DEC-20261021-04 | DITERUSKAN | Remove baked UI with built-in imagegen while preserving Alyssa, props and dungeon composition. Reuse the existing scene renderers and live controls. One visual registry maps four native-size WebP plates across six situations; contained responsive framing and phone stacking are owned by dungeon.css. This visual request does not change Shop stock counts, add artifact purchases or activate Explore. Actual coverage and limits: docs/SITUATION_ART_2_5_2.md. |

## Card proportion correction 2.5.3 — 21 October 2026 (Malaysia)

| ID | Status | Decision and evidence |
|---|---|---|
| DEC-20261021-05 | DISAHKAN | Ijamm reports the reward/card menu looks expanded in image(20261021-093914).png (2048×1038), says the other menus are fine and explicitly asks to check Shop too. |
| DEC-20261021-06 | DITERUSKAN | The 2.5.2 row stretched card widths with 1fr tracks while keeping height tied to the viewport unit; the atlas viewport inherited the unequal width/height. Bound reward/shop tracks and panels, preserve square source-art viewports and keep three choices in one row with phone scrolling. Other scenes and mechanics are unchanged. Verification: docs/FIX_CARD_PROPORTIONS_2_5_3.md. |

## Artifact Pack V3.2 — game 2.6.0

| ID | Status | Decision and evidence |
|---|---|---|
| DEC-20261021-07 | DISAHKAN | Ijamm supplies ARTIFACT (2).zip and explicitly requests applying it to the game. The archive's new content is 31 rich descriptions, 55 glossary terms and the three-color calculation standard; catalogue trigger values and original icon hashes match the prior integrated pack. |
| DEC-20261021-08 | DITERUSKAN | Reuse the exact existing 31 runtime icons; import only relevant source/data files, omit preview examples from runtime and preserve the 120-question claim gate. Add one shared accessible tooltip and optional bounded resolved-event history, rendered through existing artifact/log/dialog flows and Shop prices. Reconcile pending definitions to the actual core without inventing new cards, hand limits or d6 probability claims. Owners: SOR 10/13/19; evidence: docs/ARTIFACT_RICH_TEXT_2_6_0.md. |

## Stage 1 animations 2.7.0

| ID | Status | Decision and evidence |
|---|---|---|
| DEC-20261021-09 | DISAHKAN | Ijamm supplies NORMAL ELITE ENEMY.zip and MODEL(1).zip and requests Stage 1 non-boss enemy animations, then Alyssa animations. The former is readable; the latter failed workspace delivery. Its contents are not assumed or substituted. |
| DEC-20261021-10 | DITERUSKAN | Import the 25 native atlases / 128 active frames losslessly, with a shared fixed matrix into the existing floor anchor and one canvas player. Preserve source timing/order, normal/Elite identity, direction and gameplay. Add bounded decode caching, stale-load cancellation, pause/static motion policies and independent outcome reactions. Retain current boss/Stage 2 models and current Alyssa assets until her ZIP is retried. Owners: SOR 07/08/11/14; evidence: docs/STAGE1_ANIMATION_2_7_0.md. |

## Alyssa animations 2.8.0

| ID | Status | Decision and evidence |
|---|---|---|
| DEC-20261021-11 | DISAHKAN | Ijamm identifies the existing source MODEL.zip and requests reading it to update Alyssa's motion. Its readable v2 archive contains five right-facing clips / 30 frames, runtime sheets, durations and boot pivots. This resolves the attachment blocker without assuming failed uploads were read. |
| DEC-20261021-12 | DITERUSKAN | Losslessly import runtime sheets, preserving variable holds, complete cells and boot pivots. Use an independent hero player in both stages, preserve enemy/boss rendering, and keep outcomes/save/RNG independent of motion. Owners: SOR 08/11/14; evidence: docs/ALYSSA_ANIMATION_2_8_0.md and its verification records. |

## Alyssa right-facing-only correction 2.8.1

| ID | Status | Decision and evidence |
|---|---|---|
| DEC-20261021-13 | DISAHKAN | Ijamm reports old Alyssa motion still appearing and explicitly requires only the right-facing source for Attack, Defend, Skill, Damaged and Idle. |
| DEC-20261021-14 | DITERUSKAN | Replace all legacy hero image references with registered posters derived from the same motion source. Preserve this family during loading, Canvas/atlas failure and Motion Off; omit retired combat image entries from the new portable build. Owners: SOR 08/11/14; reproduced old fallback and actual verification: docs/ALYSSA_RIGHT_ONLY_2_8_1.md. |

## Combat polish — 21 October 2026, game 2.9.0

| ID | Status | Decision |
|---|---|---|
| DEC-20261021-15 | DISAHKAN | Ijamm requests triple-checking small Skill frames, freezing run Time after death (references 162435/162438), and a limited overlapping hand with delayed neighbor movement on hover (162533). |
| DEC-20261021-16 | DITERUSKAN | Calibrate all six Skill body heights about the existing boot pivots without altering source artwork/direction/timing. Persist a result timestamp at outcome, retaining save version 1 and honest one-time legacy fallback. |
| DEC-20261021-17 | CADANGAN | Reversible implementation tuning: Hand limit 10 in config, 140ms hover dwell, 180ms transition, and 44px minimum exposed card step. User authorized the behavior; these exact numbers are implementation defaults. Card/artifact draws share the cap and leave excess cards/RNG untouched. |

Owners: SOR 03/04/05/08/11/13/14/19. Verification and migration limits: `docs/COMBAT_POLISH_2_9_0.md`.

## Both-stage Normal/Elite motion — 22 October 2026 (Malaysia), game 2.10.0

| ID | Status | Decision |
|---|---|---|
| DEC-20261022-01 | DISAHKAN | Ijamm supplies the Normal/Elite enemy ZIPs for both stages and explicitly requests applying motion to both stages. |
| DEC-20261022-02 | DITERUSKAN | Preserve all 25 accepted Stage 1 sheets after exact source-pixel verification of the repack. Import Stage 2 v2.1's 25 clips / 135 frames and 25 matching posters through the shared native importer/player, including the authored left-facing Chain Golem. Add a presentation-only intent mapping; preserve gameplay, saves, bosses, legacy cross-stage encounters and Alyssa's full accepted registry/Skill calibration. |

Owners: SOR 07/11/14/15. Source mapping and actual checks: [both-stage motion](../ENEMY_MOTION_2_10_0.md).

## Harmonized education and practice branch — 22 October 2026, game 2.14.0

| ID | Status | Decision |
|---|---|---|
| DEC-20261022-EDUCATION-01 | DISAHKAN | Ijamm requests a branch named `education`, integration of the reviewed textbook/DSKP harmonization and an education-only practice feature on Main Menu using the full 120-question HTML folio. |
| DEC-20261022-EDUCATION-02 | DISAHKAN | Ijamm asks why the Hint/More Hint grid contains question marks. Source inspection confirms unfinished placeholder cells; improve their explanation and progressive guidance. |
| DEC-20261022-EDUCATION-03 | DITERUSKAN | Use the same active 1.6 bank for practice, Artifact and Mystery, preserving all stable question/choice/answer bindings. Practice has a separate record and no combat/reward/exposure mutation. The subsequent explicit screenshot instruction supersedes the unfinished/one-cell proposal: show all actual table/Venn values from Hint 1, with no `?` placeholders, preserving honest “Not given” regions and normal final-answer/Claim timing. |
| DEC-20261022-EDUCATION-04 | DITERUSKAN | Preserve old 1.4 pending trials/profile histories alongside 1.0/1.5. Keep engine Claim/timer ownership. Replace the stale tracked portable artifact with a reproducible ignored local build because the current full build exceeds GitHub's single-file limit; source/assets remain versioned. |

Owners: SOR 02/10/13/15. Implementation, sources, compatibility and actual checks: [Education Practice 2.14.0](../EDUCATION_PRACTICE_2_14_0.md). Main is not merged by this task.


## Map and INTEGRATION.zip — 22 October 2026 (Malaysia), game 2.11.0

| ID | Status | Decision |
|---|---|---|
| DEC-20261022-03 | DISAHKAN | Ijamm requests the supplied map aesthetic and applying INTEGRATION.zip to the game. |
| DEC-20261022-04 | DITERUSKAN | Use a text-free generated parchment dungeon plate with live existing graph controls/HUD and the same category secrecy; preserve route snapshots and both stages. |
| DEC-20261022-05 | DITERUSKAN | Integrate Artifact 3.5, Question Bank 1.5 and one matched STM_SHARED hub. Reuse the existing engine's synchronous transaction owner and supplied pure session reducers. Preserve IDs, answers, effect values, saves and eligible offers. Record host glossary reconciliation and honest legacy-evidence limits. |
| DEC-20261022-06 | DITERUSKAN | Following the supplied session contract, retain unfinished reservations across New Run, use the supplied fixed order for new choices and adapt difficulty without repeats. Existing pending shuffled saves retain their order. Increase bounded import to 2 MB for event history/checkpoints. |

Owners: SOR 02/09/10/13/14/15/19, DESIGN.md and UX-CONTRACT.md. Source and actual checks: [Map & Integration 2.11.0](../MAP_INTEGRATION_2_11_0.md).


## Map clarity, mode menu, question audit, Boss motion and Shop — 22 October 2026 (Malaysia)

| ID | Status | Decision |
|---|---|---|
| DEC-20261022-07 | DISAHKAN | Ijamm requests subdued dungeon background, clear routes/Floor/room actions and an updated Learn/Challenge menu with a proper sword icon. |
| DEC-20261022-08 | DISAHKAN | Audit Example/Hint/More Hint and report issues to Ijamm for the question-owner chat; do not silently rewrite source content. |
| DEC-20261022-09 | DISAHKAN | Apply both bosses from four supplied consolidated ZIP parts. |
| DEC-20261022-10 | DISAHKAN | Shop: six cards in 3×2 with exactly one random 60% discount, removal, and six artifacts in 3×2 (3 Starting/2 mid-tier/1 Boss). |
| DEC-20261022-11 | DITERUSKAN | Both modes support paid artifact purchases; preserve Challenge free-gift education. Separate opening gift from purchased Starting ownership, retain legacy visits and giftless Challenge ledgers, exclude owned Boss gifts and exhausted tier duplicates. |
| DEC-20261022-12 | CADANGAN | Config tuning: artifact prices 80/140/220, removal 50 once per visit, minimum ten cards. Sale then best artifact discount; visible price owner and atomic once-only mutations. |

Owners: SOR 02/07/09/10/11/12/13/14/15/19, DESIGN.md and UX-CONTRACT.md. Implementation/evidence: docs/GAME_UPDATE_2_12_0.md.


## Mystery Events — game 2.13.0, 22 October 2026 (Malaysia)

| ID | Status | Decision and evidence |
|---|---|---|
| DEC-20261022-MYSTERY-01 | DISAHKAN | Ijamm requests applying the supplied Mystery Events v2 package. Fifteen illustrated events, fixed per-event timers, topic mapping, costs/rewards/failures and final review replace generic new Mystery rooms. Source owner: MYSTERY_EVENTS.md. |
| DEC-20261022-MYSTERY-02 | DITERUSKAN | Active Question Bank/STM service and profile exposure history are reused. The older bank snapshot is not imported. Event/reward/question RNG remain independent; saved choices/deadline/targets/offers persist. |
| DEC-20261022-MYSTERY-03 | DITERUSKAN | Atomic effect dispatcher, once-only receipts, consumed-artifact ledger, Max HP sacrifice, stage-correct Echo combat and next-combat/first-turn modifiers are implemented and regression-tested. Source numeric balance remains proposed. |
| DEC-20261022-MYSTERY-04 | DITERUSKAN | Runtime uses current-scene 1920/960 WebP derivatives; source hashes and documented four-row ME04 margin recovery are in mystery-art.json. Native dungeon UI/rich text is retained. Legacy pending Artifact gifts and checkpoints keep their existing flow. |

## Room UI corrections — 22 October 2026 (Malaysia), game 2.13.1

| ID | Status | Decision and evidence |
| --- | --- | --- |
| DEC-20261022-ROOM-UI-01 | DISAHKAN | Ijamm requests full-background Mystery artwork like the Dungeon Master, Shop tabs for cards/artifacts/removal, and existing game rich text in Mystery. References: image(20261022-053117).png and image(20261022-053219).png. Rest in image(20261022-053417).png is approved. |
| DEC-20261022-ROOM-UI-02 | DITERUSKAN | Retain the source artwork, dungeon tokens, shared tooltip hub, question content and engine transaction/save owners. Use read-only cost/reward previews and native roving Shop tabs; current tabs persist during the visit, while reload opens Cards with existing purchases/services preserved. |

Owners: SOR 10 and MYSTERY_EVENTS.md, DESIGN.md, UX-CONTRACT.md. Actual verification: docs/ROOM_UI_2_13_1.md.

## Boss size correction — 22 October 2026 (Malaysia), game 2.13.2

| ID | Status | Decision and evidence |
| --- | --- | --- |
| DEC-20261022-BOSS-SIZE-01 | DISAHKAN | Ijamm reports the boss looks smaller than Alyssa in image(20261022-063153).png and requests comparable size, using the normal encounter in image(20261022-063228).png as reference. |
| DEC-20261022-BOSS-SIZE-02 | DITERUSKAN | Both bosses inherited the ordinary-enemy host scale despite different source padding. Use explicit per-boss calibration with phone/tablet containment; retain source art, timings, pivots and gameplay. Owners: SOR 07/11, DESIGN.md and UX-CONTRACT.md. Evidence: docs/BOSS_SIZE_2_13_2.md. |


## Question feedback — 22 October 2026, game 2.15.0

| ID | Status | Decision |
|---|---|---|
| DEC-20261022-FEEDBACK-01 | DISAHKAN | Ijamm requests per-question improvement comments/categories in education-only practice, the reassurance that comments are read, and an exit popup explaining collection for future improvements. |
| DEC-20261022-FEEDBACK-02 | DITERUSKAN | Reuse Main Menu Education Practice and all 120 questions. Save one editable comment per question/bank on the device; provide CSV/JSON download and native file sharing with fallback so players can send to Ijamm when connected. State clearly that no automatic delivery is configured. Keep comments separate from game/reward/Learning data and preserve the education branch boundary. |

Owners: SOR 10/13/15; implementation and delivery limits: [Question feedback](../QUESTION_FEEDBACK_2_15_0.md).


## Bahasa soalan — 2.16.0

- DISAHKAN: Ijamm requests whole-question BM/English switching using both supplied textbooks and DSKP, beyond glossary meanings.
- DITERUSKAN: Authored display overlay for all 120 questions and Basics; canonical mathematical data and game state remain stable. [Details](../QUESTION_LANGUAGE_2_16_0.md).


## Education merged to main — 22 October 2026

- DEC-20261022-EDUCATION-MAIN-01 — DISAHKAN: Ijamm authorizes applying education to main in this chat. This supersedes the previous branch-only release boundary.
- DITERUSKAN: Preserve main 2.13.2 Boss/Shop/Mystery fixes and combine full Education 2.16.0. [Integration and actual verification](../EDUCATION_MAIN_INTEGRATION.md).


## Education visibility — 2.16.1

- DEC-20261022-EDUCATION-ENTRY-01 — DISAHKAN: Ijamm requests fixing missing BM/English/Practice and aligning the live question display with the preview on main.
- DITERUSKAN: Version small current-runtime entry pages, expose language on Main Menu, share learning CSS/support presentation, and separate generated offline snapshots. [Evidence and limits](../EDUCATION_ENTRYPOINTS_2_16_1.md).


## Question menu — 2.17.0

DEC-20261022-QUESTION-MENU-01 — DISAHKAN: Ijamm requests internal scroll instead of artwork zoom, Ink with a small legend, current-run coverage resetting on New Run, and retained lifetime coverage. DITERUSKAN: derive counts from existing receipts/profile; preserve question draw/assessment/reward behavior. [Implementation and verification](../QUESTION_MENU_2_17_0.md).


## Settings and release delivery — 2.17.0

DEC-20261022-SETTINGS-RELEASE-01 — DISAHKAN: Ijamm requests moving the main-menu Question language selector into Settings and fixing the displayed old version to v2.17.0. DITERUSKAN: retain game version 2.17.0, derive its display from package metadata, invalidate changed runtime resources by content and clarify pull/restart steps. [Implementation and limits](../SETTINGS_RELEASE_2_17_0.md).


## Cards and display — 2.18.0, 22 October 2026

- DEC-20261022-CARDS-DISPLAY-01 — DISAHKAN: Ijamm asks to fix mathematical rendering for every question, give Shop internal scrolling and large background artwork, and apply STM_Cards_Consolidated_v1(1).zip.
- DITERUSKAN: Integrate all 40 supplied identities/mechanics, Focus and ten Passive cards with original EN/BM data, full frames and icons. Preserve legacy definitions/saves/offers, boss seals and the one-enemy encounter model. Native MathML remains authoritative for notation.
- CADANGAN: The twelve-instance package starter, all-40 reward/Shop pool and X-card two-Energy price are reversible integration defaults. Base package values stay unchanged; a separately configured host upgrade extension preserves Rest, Mystery upgrade bundles and Elite upgraded rewards, with its own playtest tuning. Do not claim playtested balance or pupil comprehension.

Owners and actual evidence: [Cards and display](../CARDS_AND_DISPLAY_2_18_0.md).


## Combat and Predict — 2.19.0, 22 October 2026 (Malaysia)

- DEC-20261022-COMBAT-01 — DISAHKAN: Ijamm requests whole reward-card selection, a buff/debuff icon package under fighter HP, compact combat without document scrolling, relocated artifacts/piles/run information, a simple actor/turn combat log, fixed-size Read Ahead and visible Passive triggers.
- DEC-20261022-PREDICT-01 — DISAHKAN: Predict opens randomized items from the same 120-question bank, with no repeated gameplay question in the current run. This supersedes the earlier live-deck-only Predict baseline and lifetime-wide exclusion.
- DITERUSKAN: local panning/native dialog scrolling keeps actions reachable on small screens. Opening reserves a question even when closed unsolved. New Run resets the exclusion ledger; lifetime/mastery and genuine saved pending questions remain. Practice/tutorial remain isolated review; bank exhaustion permits explicit unscored boss-seal completion without Focus. Preserve source card values, art, save IDs and existing mathematical content.
- PERLU_VERIFIKASI: classroom comprehension and balance playtesting remain future work.

Scope and evidence: [Combat and Predict](../COMBAT_AND_PREDICT_2_19_0.md).


## Passive cap and music integration — 2.20.0

- DEC-20261022-PASSIVE-01 — DISAHKAN: Ijamm requests a maximum of three Passives and a popup to choose which existing Passive to replace. DITERUSKAN: interpret this as three active Passives in combat, allowing more in the deck; this assumption was stated after the optional clarification received no answer. Preserve source combat duration, costs and trigger limits; cancellation before choosing is free.
- DEC-20261022-AUDIO-01 — DISAHKAN: Ijamm now asks to apply supplied MUSIC(3).zip to the game. This overrides the source archive's earlier SOR-only music-branch planning instructions. DITERUSKAN: integrate eight BGM/seven voices with canonical byte-preserved assets, retain missing Menu/Mystery cues, separate Voice controls and deterministic per-run encounters.
- PERLU_VERIFIKASI: human listening/loop seams, final greeting repeat suitability and balance/classroom playtesting. MODEL.zip was unavailable. [Implementation and actual validation](../PASSIVE_AND_MUSIC_2_20_0.md).


## DEC-20261023-DEV — Developer sandbox (2.21.0)

DISAHKAN: Ijamm requested implementation from main v2.20.0 using the Developer Tools SOR. Development/production use separate npm scripts; dev-only response adapters reuse the real game engine/renderers with memory storage. Developer files stay outside dist and portable output. Source artwork, player saves and card balance remain unchanged. Scope, limits and verification contract: [Developer Tools](20_DEVELOPER_TOOLS.md). MODEL.zip was unavailable; existing Slay the Math motion data is used, without claiming a Mathmon editor import.


## DEC-20261023-DEV-WINDOWS — Compatible dev loader (2.21.1)

DISAHKAN: Ijamm reports an empty background with DEV SANDBOX badge and missing main menu. Reproduced by converting app.js to CRLF: the dev loader rejects its literal LF-only closing marker. Normalize newline characters only in the server response copy before injection. Preserve source files, gameplay and save storage; regression-test Windows line endings.


## DEC-20261023-RANDOM — Uniform no-repeat gameplay questions (2.21.2)

DISAHKAN: Ijamm requests random, nonrepeating questions throughout each current run, regardless of context. Replace difficulty/weakness-weighted rewarded draws with uniform unused draws; remove Mystery preferred-subset bias while retaining topic compatibility. Preserve profile/lifetime history separately from current-run exclusion. Retry is the same run for question exposure; only New Run resets it. Existing Shop/Rest do not acquire new quiz mechanics.

## 22 October 2026 — Rich text color only (2.21.3)

DISAHKAN: Ijamm removes decorative underlines from rich text because they compete with fraction bars. Category colors remain pink/math, green/game and purple/calculation. Preserve true fraction bars and focus/tooltip behavior. Supersedes previous underline styling. Owner: 10_UI_UX_ACCESSIBILITY.md.

## DEC-20261023-AUDIO4 — Apply normalized talking (2.22.0)

- DISAHKAN: Ijamm asks to apply the prepared audio package directly to main v2.21.3. This supersedes the earlier no-push/package-only instruction. Audio implementation continues on `music` before integration to main.
- DISAHKAN: Standardize all talking volume and bind the supplied filenames to question/help, Rest, happy card selection, defeat, Mystery intro and ordered Shop/Dungeon Master encounters.
- DITERUSKAN: Use the verified -18 LUFS package, 49 actual voice files and eight unchanged BGM, preserving Menu/Mystery and existing SFX. The card-reward source contains eight recordings; do not invent the requested-but-unsupplied ninth/tenth. Use independent audio variation, saved consumption receipts, existing separate mixer settings and scope-safe cancellation. Practice audio remains isolated from game saves.
- PERLU_VERIFIKASI: human audition, transcripts/captions, loop seams and Ijamm's physical Windows/device playback. [Implementation and actual checks](../AUDIO_2_22_0.md).

## Developer toggle — 23 October 2026

DISAHKAN: npm start dev launches main menu with synchronized Dev ON/OFF in menu and Settings; enable reveals Developer Hub, disable blocks developer mutations. Implement on dev-tools only; no main publication.

## DEC-20261023-ICONS — Apply reviewed icon package (2.23.0)

- DISAHKAN: Ijamm identifies the running production build as v2.22.0 and asks to update main, continuing the all-icon package request based on MathMon's buff/debuff art style. Apply the reviewed package to current main commit `83a1aeee80ff0488758f94451f7afd1c27500988`.
- DITERUSKAN: use 129 lossless 512px runtime derivatives for 130 catalogue entries; canonical Sound is shared. Connect existing UI/map/status/artifact/card consumers and add the eleven reviewed symbols only to existing states/actions/topic labels. Preserve source art, stable IDs, save format, card/artifact values, question selection and v2.22.0 audio.
- DITERUSKAN: retain resampled 4K/FHD/1080 review exports separately; commit a compact runtime registry, hash manifest and build-safe card overrides. Version game 2.23.0 to make the production change visible.
- PERLU_VERIFIKASI: classroom comprehension and Ijamm's physical Windows/device display remain outside automated checks. MODEL.zip was unavailable and is not applied. [Implementation and validation](../ICON_PACKAGE_2_23_0.md).

## Main integration — 2.23.1

DISAHKAN, 23 October 2026: Ijamm now authorizes publishing the developer toggle to main over v2.23.0. This supersedes the earlier branch-only restriction. Keep production free of developer controls; use npm start dev to see the main-menu and Settings toggle.


## DEC-20261023-AUDIO5 — New talking on latest main (2.24.0)

- DISAHKAN: Ijamm supplies new audio and asks to check latest git main, apply on music first, then push/integrate into main. Starting main is af12035 / 2.23.1; its icon and developer-toggle work stays current.
- DITERUSKAN: source inventory contains 26 additions: 4 answering, 4 Hint, 4 More Hint, 5 correct and 9 wrong. Use every available recording; retain all 57 preceding supplied files without re-encoding. The stale embedded v2 manifest does not describe the new additions.
- DITERUSKAN: master new talking to the existing -18 LUFS ±0.5 / encoded TP ≤ -1 dBTP standard; retain rate/gain 1 and the original ZIP. Use actual ordered reducer events for answer/support reactions, with per-attempt receipts and no outcome for timeout/reveal/exhaustion.
- IMPLEMENTED contract and audit: [Audio 2.24.0](../AUDIO_2_24_0.md). Human audition, verified transcripts and physical Windows/device testing remain unverified.

## DEC-20261023-MAP-BALANCE — Seed/route audit for Master

- DISAHKAN: Ijamm assigns `balance/map` at base 2800f9a; audit all 100 registered seeds and legal paths, preserve two stages/ten levels and mandatory Mystery 5/Rest 9/Boss 10. No merge or push to main; preserve other branches.
- DISAHKAN: map/laluan difficulty and Combat Power are developer references only. Full-run pupil victory goals Easy 90%, Medium 70%, Hard 50% belong to Master calibration.
- IMPLEMENTED: read-only structural enumeration and contextual pressure estimates, fixed canonical-engine pilot, CSV/JSON, source comparison and [Map SOR v1.2](../../modules/map/SOR/04_MAP_COMBAT_POWER.md). No production imports, save schema or gameplay stat/price/topology changes.
- CADANGAN: pressure-debt estimate, visible greedy/feedback policy and log-risk CP scale are testable analysis choices, not calibrated game rules. Eight pilot trials per seed remain provisional; route CP stays null pending comparable entry-bank evaluation.
- PERLU_VERIFIKASI: implement candidate difficulties in the owning domains, reconcile candidate BAL-25 with existing quotas/forced Elite paths, broaden deck/policy tests and conduct pupil validation. [Master handoff](../MAP_BALANCE_HANDOFF.md).

## DEC-20261023-MAP-BALANCE-V13 — Six accepted map improvements

- DISAHKAN: Ijamm requests implementation of all six proposed improvements: avoid-Elite/reward/Shop/low-HP recovery routing, identical-entry repeated rank comparisons, pressure before recovery/Mystery penalties, actual risk/reward, Predict/difficulty sensitivity and difficulty explanations with regression checks. Branch remains balance/map; no main integration.
- IMPLEMENTED: developer-only canonical-engine policies/replays/telemetry, fixed 3,000-campaign schedule and captured-state rank triplets, sharded/hash-protected records, CSV/JSON, report gates and independent verifier. [Current SOR](../../modules/map/SOR/04_MAP_COMBAT_POWER.md), [results and validation](../MAP_BALANCE_V1_3_HANDOFF.md).
- CADANGAN: route utility weights, 50% HP/60 Gold decision thresholds, eight/four/two repetition budgets and synthetic 85%/25% Predict targets are reference analysis settings, not pupil calibration or gameplay tuning. Matched CP remains provisional with Wilson95; rank names remain structural estimates.
- PERLU_VERIFIKASI: full Combat/Master difficulty adapters, integrated economy candidate, alternative deck/combat policies and pupil full-run 90/70/50 playtests. Stage 2 survivor selection, divergent later RNG and heuristic deck merit limit causal interpretation. No stat/price/generator/save/player-UI changes.

## 23 October 2026 — Combat/Card Synergy branch

DISAHKAN (direct Ijamm instruction): isolated `balance/combat` at base 2800f9a; audit 40 cards/four states, real-engine ICP/CCP, 820 static pair specifications then Lite; retain three Passive/swap history; internal CP only; no main push/merge. CADANGAN: SOR v1.2 numeric overlays and difficulty profiles remain Node-only experiments pending Master integration and campaign/student evidence. See docs/balance/combat/SOR_COMBAT_CARD_SYNERGY.md.


## 23 October 2026 — Deep Combat/Synergy evidence

DISAHKAN (direct follow-up): deeply test five domains: evolved decks, varied Predict accuracy, setup horizon, exploit/restore and actual artifact triggers. CADANGAN: report Hard/growth coupling as a Master integration risk; do not infer student 90/70/50 rates or automatically nerf from one utility delta. Experimental data remains internal; no main merge/push. See docs/balance/combat/deep-results/DEEP_COMBAT_REPORT.md.
## DEC-20261023-ECON-01 — isolated economy work

**DISAHKAN:** Ijamm requests Economy/Loot/Rewards audit and tested proposals on base 2800f9aeba5ed594e6ef3f991bcf4dfa498a5de7, branch balance/economy, no merge/push main; source rules and random nonrepeat questions preserved; CP unmeasured stays null; Combat/Map gaps NEEDS_INPUT.

**CADANGAN / implemented experiment:** economy-1.2-candidate.1 opts in through New Run. Default/legacy remains current. Single config, immutable source-derived loot receipts, bounded support, six/one-sale Shop, price/removal/recovery/event adapters. Actual artifact values and HP 60 retained because final Combat input is unavailable. n counts paid Shop removals. Evidence and limitations: docs/economy/SOR_ECONOMY_REWARDS.md and HANDOFF_MASTER.md. No student/CP claim. Reversible via omission of the explicit economy option; unknown snapshot versions reject rather than silently migrate.


### 2026-10-23 — Economy deep validation (CADANGAN evidence)
User authorised all six economy follow-up areas. Expand deterministic experiments and transaction regression coverage on balance/economy; retain current candidate numbers without measured Combat evidence. Use 100 paired seeds per policy/difficulty with balanced 12/13-seed answer/budget strata; report coverage limits, stop/end vs completed-only cash and conditional HP budgets. No main merge. Explore absent at base, NEEDS_INPUT_DEFINITION. See docs/economy/deep/REPORT.md.


## DEC-20261023-MASTER-BALANCE — Three-domain integration

- DISAHKAN: Ijamm requests reading the three completed balance branches, completing Master work and pushing the Master branch. No main publish/merge is requested.
- IMPLEMENTED: versioned browser/Node binding, explicit Easy/Medium/Hard playtest entry, isolated profile saves, strict restore/retry, canonical campaign replay with actual combat/economy/Mystery, and fresh bounded ICP/CCP measurements. Current owner: [23](23_MASTER_BALANCE.md).
- CADANGAN: `master-1.3.0-candidate.2` profile adjustments address the initial combined Hard cliff. Common card definitions retain the specialist v1.2 overlay. Seal 10%, Purse 40 and Contract 20% complete the economic artifact contract.
- PERLU_VERIFIKASI: real pupil full-run targets 90/70/50, wider player/deck policies and selected high-synergy cases. The bot cohorts, uncertainty, source snapshots and actual checks belong in [Master handoff](../balance/master/HANDOFF.md); no human outcome is fabricated.

## DEC-20261023-EDAN — Offline education analytics preview

- DISAHKAN: Ijamm asks to implement the discussed comment collection, learning analytics and offline/reconnection system in a branch before main. Work belongs to education-analytics; main integration is not authorized in this turn.
- DITERUSKAN: player-first reports without login, local durable recording, explicit opt-in collection, optional same-origin SQLite receiver and operator exports. No connected cloud project is configured, so no cloud resources, teacher accounts or central deployment are created.
- DITERUSKAN: existing120 bank IDs and reducer events own correctness, help and exposure. Report chapter/SK/SP/skills with sample counts, distinguish independent/support/retry/reveal, exclude Review by default, and require three different answered IDs before revision recommendations. Retry must not duplicate carried evidence. No official TP labels.
- DITERUSKAN: sharing starts off; records stay pending until exact revision acknowledgement after durable commit. Offline/reopen retry, concurrent-instance persistence, comment edits/deletions, corrupt/quota handling and credential-free exports are required. Developer sandbox never sends.
- PERLU_VERIFIKASI: Ijamm's physical Windows/browser/classroom experience and any future central hosting/account/retention arrangement. MODEL.zip was unavailable and is not applied by this analytics change. [Implementation](../EDUCATION_ANALYTICS_2_25_0.md).

## DEC-20261023-EDAN-MAIN — Education analytics on main (2.26.0)

- DISAHKAN: Ijamm now requests pushing the completed analytics system to main and explaining backend/database setup. This supersedes the preview's branch-only authorization boundary.
- DITERUSKAN: integrate feature head `1acefda` with current main `7afb0aa` / 2.25.1, preserving its card-motion engine hooks and original-art registries. Version 2.26.0 identifies the combined release.
- DITERUSKAN: no database is needed for on-device reports/exports. The optional Node receiver creates SQLite automatically; `start:analytics:prod` builds and serves the player release and receiver on one origin. Sharing stays opt-in, with the same durable pending/ACK contract.
- PERLU_VERIFIKASI: central hosting, public HTTPS, persistent volumes, operational backups and classroom access remain a separate deployment. No cloud resources or accounts are created by publishing the code. [Setup and limits](../EDUCATION_ANALYTICS_2_26_0.md); [actual integration checks](../EDUCATION_ANALYTICS_MAIN_VERIFICATION.md).

## DEC-20261023-MASTER-MAIN — Master balance on main (2.27.0)

- DISAHKAN: Ijamm's follow-up, “okay mybe kita boleh push update ni ke main kot!!”, authorizes publishing the completed Master update to `main`. This supersedes the earlier Master-branch-only publication boundary.
- DITERUSKAN: integrate remote Master `bd0c11d3580b56fd61fa6f26965d7c28c5a89803` with main `b67298bf14c530a30f03dbc8a2cb3362b0913a5d`. Retain game 2.27.0, explicit New Run Easy/Medium/Hard playtest, candidate.2 values, legacy saves, original art/audio/motion and analytics consent.
- PERLU_VERIFIKASI: pupil full-run goals 90%/70%/50% remain unmeasured; publication does not turn bot evidence into pupil validation. [Release scope and actual checks](../balance/master/MAIN_RELEASE_2_27_0.md).

## DEC-20261023-PAGES — Public playable link

DISAHKAN: Ijamm requests GitHub Pages to let friends play the latest game easily. Add automatic production-only publication on main pushes, retaining the existing game version, mechanics and local saves. The owner must activate Pages Source = GitHub Actions once; connected repository tools cannot edit this setting. Static hosting does not deploy the optional analytics receiver. See docs/GITHUB_PAGES.md.

## DEC-20261023-ALYSSA-STATUS-VFX — RPG status effects around Alyssa

- **DISAHKAN:** Ijamm requests visible buff, shield and stat-up/down effects surrounding Alyssa, plus appropriate sound-effect descriptions/search terms for clips he will source online.
- **DITERUSKAN:** integrate on main `e2c323a` / 2.27.0 as 2.28.0, preserving Master balancing and analytics. Use moderate auras plus short bursts as a reversible implementation choice; no intensity preference response was supplied. Project actual player status values and newly committed enemy Block-absorption receipts without changing combat, saves, RNG, analytics or source artwork.
- **DITERUSKAN:** preserve the current icons, original card/artifact illustrations, source hero clips, right-facing pivot and all previous card motion. Honor the shared motion/modal/visibility lifecycle, queued-versus-active distinction and exact commit before presentation.
- **PERLU_VERIFIKASI:** physical-device playback and Ijamm's assessment of motion feel. New SFX are only described, not imported. MODEL.zip remains unavailable and is not used. [Visual contract](../ALYSSA_STATUS_VFX_2_28_0.md), [SFX search guide](../ALYSSA_STATUS_SFX_GUIDE.md).

## DEC-20261023-SINGLE-ENEMY — Target correction and bounded rebalance (2.29.0)

- DISAHKAN: Ijamm notes the game always has one enemy and requests converting AoE/random-enemy effects to single target, then rebalancing only the affected scope rather than restarting balance work.
- DITERUSKAN: audit all 40 current cards; only Rune Sweep and Fate Storm use inappropriate enemy targets. Keep Fate Storm multi-hit on the same enemy, with independent ordinary mitigation per hit and no target RNG. Preserve stable IDs and original artwork.
- CADANGAN / IMPLEMENTED: keep existing Master 12-damage Rune Sweep and 5+5+5 Fate Storm at 2 Energy; apply those two definitions to ordinary modes. Allocate Strength, +4 Focus and +3 upgrade once on the primary hit. Other 38 card values, enemy/difficulty/economy/map values and question rules stay as before.
- DITERUSKAN: use a single build adapter, preserve canonical supplier input and historical receipt values/HP/RNG, isolate candidate.3 saves, retain previous measured cohorts under their original sources, and publish this verified correction through the authorized main workflow.
- PERLU_VERIFIKASI: human playtests, pupil 90/70/50 rates and exhaustive combinations. [Current evidence and validation](../balance/master/SINGLE_TARGET_2_29_0.md).
## DEC-20261023-EDAN-GOOGLE — Google Sheets collection branch

- DISAHKAN: Ijamm accepts the proposed Google option because a self-hosted server/database is difficult, and requests implementation in the appropriate branch before pushing main. Target is `education-google-sheets`; no main publication is authorized by this request.
- DITERUSKAN: extend the existing offline analytics/comments system with Google Apps Script + private Sheets; sharing stays opt-in per destination and receipt follows durable canonical/projection confirmation. Retain local SQLite and all existing game/balance/source art owners.
- DITERUSKAN: ship one generated Code.gs and shared BM/English Learning Report setup controls. User/operator authorizes/deploys the Google receiver once; optional site default removes repeated URL entry for players.
- PERLU_VERIFIKASI: live Google deployment/account policy, classroom quotas/network compatibility and pupil use. No real Google collection, Google credentials, teacher accounts or automated main merge are created. [Owner guide](../GOOGLE_SHEETS_SETUP.md).

## DEC-20261023-EDAN-GOOGLE-MAIN — Google collection on main (2.30.0)

- DISAHKAN: Ijamm now requests pushing the completed Google update to main. This supersedes DEC-20261023-EDAN-GOOGLE's earlier feature-branch-only publication boundary.
- DITERUSKAN: merge Google head `a535a04` with current main `8b6a3c6` / 2.29.0; preserve its single-enemy mechanics, candidate.3 identity/receipt compatibility, status-VFX hooks, original artwork/audio, all 120 canonical questions and Pages workflow. Identify the combined release as 2.30.0.
- DITERUSKAN: player consent, local/offline records, exact ACK after canonical/projection flush and destination isolation remain required. No database server is needed for the Google option; owner authorizes/deploys Apps Script once.
- PERLU_VERIFIKASI: live Google deployment/account/quotas/classroom access, hosted Pages outcome and physical devices remain separate from verified code integration. MODEL.zip failed to arrive and is not used. [Integration evidence and setup](../GOOGLE_SHEETS_MAIN_2_30_0.md).


## DEC-20261023-TUTORIAL — Complete illustrated player guide

- **DISAHKAN:** Ijamm accepts the proposed how-to-play scope and requests the complete tutorial system, pictures and self-captured game screenshots; complete the update end to end.
- **DITERUSKAN:** implement on `tutorial` from main `d76ad6e` / 2.30.0 as 2.31.0. Use 17 English/BM chapters, 16 real screenshots and 11 replayable actual-engine practice chapters. Independent memory-only training and a tutorial-only progress key preserve the player run, question ledger, report, artifact history and collection.
- **DITERUSKAN:** retain current artwork/card/question/rules, existing native Tutorial controls and Learn entry. Enlarge example screenshots, preserve focus, support natural scrolling and storage failure. Timed Mystery keeps its deadline and warns before prolonged guide use. Publishing the feature branch is delivery; main integration remains separate.
- **PERLU_VERIFIKASI:** physical devices, classroom comprehension and future screenshots after UI changes. MODEL.zip failed to arrive and is not used; the three uploaded PDFs are not modified. [Scope and verification](../TUTORIAL_2_31_0.md).

## Production Dev password — 24 October 2026

DISAHKAN: Ijamm requests production Dev ON/OFF with password demo41, branch dev-tools only. Build a static password dialog and Hub using existing adapters; preserve player storage and isolate previews. Supersedes production exclusion on this feature branch. Client-side gate is not server authentication. Main publication is not authorized.

## Extended developer sandbox — 24 October 2026

DISAHKAN: Ijamm requests free map access, invulnerable HP, immediate card insertion and access to all 15 Mystery events in the production Dev sandbox. Keep source mechanics, saves and normal progression unchanged. Current branch only; no main publication. Suggestions in docs/DEV_FEATURES.md remain CADANGAN.

## Developer diagnostics — 24 October 2026

DISAHKAN: apply the five previously proposed developer features on dev-tools only. Include 120 exact question IDs in three contexts with language selection, supported native status edits, explicit copied player-save import, local bug report/screenshot export and four built-in scenarios. Keep main unchanged and player data isolated.

## DEC-20261024-MENU-MUSIC — New opening menu track, branch only

- DISAHKAN: Ijamm supplies Menu.mp3.mpeg for the game's opening menu and asks to update the music branch without pushing/merging main. This branch-only boundary applies to this new recording and supersedes earlier audio-release authorization for main.
- DITERUSKAN: base this patch on current main 264a60e / 2.32.0; identify the branch build as 2.32.1. Replace only the stable menu cue with the supplied Ancient Stone Keep MP3. Retain its exact bytes at a canonical .mp3 path, full-track loop and normal controller unlock/mute/scene behavior.
- IMPLEMENTED source/audit owner: [Main Menu music](../audio/menu-2026-10-24/README.md). Automated decode/playback does not claim human listening, seamless-loop approval or physical-device validation.


## DEC-20261024-MENU-MUSIC-MAIN — Publish the supplied menu recording

- DISAHKAN: Ijamm's follow-up “push ke main please” authorizes publishing the completed music update to main. This supersedes DEC-20261024-MENU-MUSIC's earlier branch-only boundary.
- DITERUSKAN: integrate music 0f6e426 with current main 264a60e / 2.32.0, retaining game 2.32.1 and the already verified runtime. Preserve the current combat-motion polish, tutorial, balance, analytics, original artwork and save rules.
- VERIFIED: 84 production/runtime resources match, including the exact new menu MP3; native browser/offline results are recorded in the source audit folder. The 45 focused audio/UI/entrypoint/release checks are repeated for publication. Hosted CI remains separate from local verification. [Source and evidence](../audio/menu-2026-10-24/README.md).

## DEC-20261024-AI — publish and improve AI Playtester

**DISAHKAN:** Ijamm explicitly requests pushing AI to branch ai and adding useful improvements before pushing. Supersedes earlier local-only/no-push boundary for ai; no main/other-branch write is authorized.

**IMPLEMENTED:** reconstruct the pruned local draft from the retained session over actual main 6dc3ce3/game 2.31.0; independently rerun checks. Developer-only three-policy strategy/search, real campaigns and contextual selected-card/pair screens, five-job memory history, source-bound exports, strict identity cancellation and individual A/B/combined/interaction utility. Per-card receipt plays/Energy/Focus/direct HP damage are usage telemetry, not power ratings. No trained model, cloud, player advisor, automatic tuning, save migration or numerical changes.

**PERLU_VERIFIKASI:** human pupil 90/70/50 targets, exhaustive combinations, physical Windows/devices and public hosting remain unverified. Previous raw/log evidence was pruned and is not fabricated. [Current guide](../AI_PLAYTESTER.md) and [fresh verification](../verification/ai-branch.json).

## DEC-20261024-AI-STRATEGY — Support value, future turns and acquisition

DISAHKAN: Ijamm quotes and selects the first three proposed AI improvements and says to update them. Continue on ai under the existing ai-only publication authorization. DITERUSKAN: scoped actual-effect accounting, three-world/three-turn bounded engine rollouts, common fully resolved cutoff, and mechanic-derived marginal deck acquisition. FIFO Block and dominant retention-cap accounting are explicit builder conventions; buff involvement/status/retention overlays are not additive damage. Preserve production owners, numerical game balance, save keys and main. PERLU_VERIFIKASI: broader strategy optimality, actual pupils and 90/70/50 targets. [Current evidence](../verification/ai-strategy.json).

## DEC-20261024-AI-MAIN — Publish the completed AI update to main

- DISAHKAN: Ijamm says "okay push ke main please" after delivery of all three AI strategy improvements. This supersedes DEC-20261024-AI and AI-STRATEGY's ai-only publication boundary.
- DITERUSKAN: merge ai `807be67` into main `d5533ad`; preserve game 2.32.1, supplied menu music, combat animation, tutorial, artwork, save keys and numerical balance. Keep the AI tool developer-only. Resolve both SOR append conflicts by retaining both histories.
- PERLU_VERIFIKASI: heuristic optimality, exhaustive combinations, physical devices, hosted deployment and pupil 90/70/50 targets remain separate from integration verification. [Main integration evidence](../AI_PLAYTESTER_MAIN_2026_10_24.md).

## DEC-20261024-AI-VERSION — Identify the AI feature release

- DISAHKAN: Ijamm questions why the AI feature update retained the game version. Correct release identification within the already authorized main publication.
- DITERUSKAN: use **2.33.0**, a minor increment from 2.32.1 for the added AI features. Generate release.js, version/cache metadata and all launchers from package.json; retain runtime rules, numerical profiles, AI logic and save keys.
- Verification is scoped to this metadata change; retain the original 820-test integration result as historical evidence. [Release record](../AI_PLAYTESTER_MAIN_2026_10_24.md#release-version-2330).

## DEC-20261024-CARD-EFFECTS — Apply approved audit on a feature branch

**DISAHKAN:** Ijamm requests applying every proposal in the 40-card audit and pushing to the assistant feature branch, explicitly excluding main.

**IMPLEMENTED / PLAYTEST:** game 2.33.0 on `balance/card-effects-20261024`, base 264a60e. Vulnerable +50% and Weak −25% are phase-duration effects; Last Ember retains only unused emergency Block once; growth caps are 4/5; draw/activation cards, failed search and Master Twin Shot follow [the current owner](../CARD_EFFECTS_2_33_0.md). Cinder Guard starts at 4 Block to offset whole-phase Weak. Ordinary prior runs retain archived definitions, costs, Shop previews and paid receipts; Master uses candidate.4. Original assets and all unrelated domain values remain unchanged. These are candidate game values, not verified pupil win rates. Publication authorization is feature-branch only.

## DEC-20261024-CARD-EFFECTS-MAIN — Publish approved card balance to main

- DISAHKAN: Ijamm says “okay push ke main”, superseding CARD-EFFECTS' earlier branch-only boundary.
- DITERUSKAN: integrate feature `a9c49f0` with current main `c54ce92` / 2.33.0 as **2.34.0**. Preserve the supplied menu recording, AI developer tool, original artwork, combat presentation, questions, existing saves and both branches' decision histories. AI incoming estimates, duration-source support accounting and Last Ember retention attribution follow the current rules; historical numeric reports keep their original provenance.
- Verification covers the merged tree, including active/archived cards and production/developer separation. Synthetic checks do not establish pupil win rates, physical-device behavior or hosted deployment. [Integration record](../CARD_EFFECTS_MAIN_2_34_0.md).

## Main integration — 2.35.0, 24 October 2026

DISAHKAN: Ijamm now authorizes publishing the complete production/password/extended diagnostics Dev update to main. This supersedes the branch-only publication boundaries above. Merge with main 2.34.0, preserve AI/local-only backend and card effects. The status editor follows the current percentage/duration Weak/Vulnerable rules. Production ships the static password-gated Hub; AI Playtester remains local-dev-server-only.

## Settings-only Developer controls — 24 October 2026

DISAHKAN: Ijamm requests removing redundant Developer controls from the main menu. Dev ON/OFF, Open Developer Hub and Copy Player Run to Dev appear only in Settings, in both local development and production. Password and sandbox isolation remain unchanged. This update is local only; no commit or remote push is authorized. This supersedes earlier main-menu access instructions.

Publication authorization: Ijamm subsequently requests pushing this Settings-only update to `dev-tools`. This supersedes the local-only boundary for this update; main remains excluded. Verification: production build, local-dev toggle browser test and production/static-subpath browser suite passed.
