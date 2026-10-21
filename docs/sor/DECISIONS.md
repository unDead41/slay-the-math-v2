# Daftar keputusan — Slay the Math

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
