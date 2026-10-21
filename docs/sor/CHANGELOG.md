# Changelog SOR — Slay the Math

Versi dokumen berasingan daripada versi game.

## 2.0.1 — 18 Oktober 2026

- Catat implementation game 1.3.0: 10 komposisi sebenar dengan 20 fail OGG/MP3, skor, hash dan sumber sintesis.
- UI, kad, soalan, tutorial, map dan error menggunakan English mudah serta istilah RPG biasa.
- Tambah Music player, volume Music/SFX berasingan, mute, fade dan duck semasa Predict. Betulkan Unmute apabila dua saluran dimatikan dan resume selepas hide/show pantas.
- Kekalkan source map bercabang terkini, reward Elite dinaik taraf, semakan route dan simpanan schema 1.
- Bezakan Shop track yang siap daripada modul Shop/Passive/T2/T3 yang masih perlu dibina. Kekalkan semua keputusan visual/topik 2.0.
- Keputusan 31–34. Decode, loop dan hash audio diperiksa; semakan runtime sebenar serta had berada dalam `docs/VERIFICATION.md` projek.

## 2.0.0 — 18 Oktober 2026

- Jadikan dua design awal pengguna rujukan visual semasa; tambah 18_DESIGN_REFERENCES dan salinan imej asal tanpa perubahan byte.
- Gantikan kostum mage dengan dungeon adventurer berambut merah; belakang kini mempunyai rujukan.
- Selaraskan tiga topik kepada Probability, Expansion & Factorisation dan Indices. Fokus Probability v1 menjadi subfokus.
- Kad: nama atas, frame emas berkeluarga merah/biru/teal/ungu, ilustrasi besar dan panel parchment.
- Selaraskan alias Slash/Guard/Draw dan English mudah; konsep Passive direkod, tidak dimasukkan deck.
- Gantikan route linear dengan graph bercabang dan room Battle/Elite/Rest/Shop/Mystery/Boss.
- Selaraskan Gold, Shop, event, dua Elite, save graph dan QA sebagai kontrak cadangan.
- Tambah tujuh cue wajib: stage 1/2, Rest, Shop, Mystery, Elite 1/2; dua boss cue dicadangkan.
- Kemas kini indeks, AGENTS, prompt, keputusan dan pipeline. Pakej kini 23 MD serta dua imej rujukan.
- Versi major kerana domain topik dan kontrak route/save berubah; tiada kod, muzik, aset baharu atau migration runtime dihasilkan.

Semakan dokumen 2.0: 23 MD, 109 pautan relatif, 13 contoh matematik, lapan laluan contoh graph dan tujuh cue wajib diperiksa. Dua rujukan JPEG sepadan byte dengan sumber. Ujian runtime game tidak dijalankan.

## 1.0.0 — 18 Oktober 2026

- Sediakan 22 fail Markdown: indeks, AGENTS, 18 SOR bernombor, daftar keputusan dan changelog.
- Teruskan dua stage, satu boss setiap stage dan tiga fokus Kebarangkalian Peristiwa Bergabung.
- Bezakan DISAHKAN, DITERUSKAN, CADANGAN dan PERLU_VERIFIKASI.
- Tetapkan baseline tempur, starter deck, Ramalan/Fokus, roster, reward, kem dan upgrade sebagai rujukan untuk pembangunan.
- Tentukan standard kad, ikon, MC empat sudut, musuh, dunia, UI, akses, animasi, VFX dan audio.
- Sediakan kontrak data, RNG/save, pipeline aset, QA, pelan 14 hari dan prompt/templat.
- Nyatakan jurang bukti: audit kod, pemetaan DSKP, playtest, hak aset dan ukuran aplikasi sebenar.

Pakej ini menyediakan dokumentasi; tiada kod game, deployment atau aset baharu diubah/dihasilkan.

Semakan dokumentasi: 22 fail Markdown, urutan 18 SOR, 72 pautan relatif dan komposisi starter deck diperiksa. Lima pengiraan contoh disemak semula menggunakan pecahan tepat. Ujian runtime game tidak dijalankan.

## Format entri seterusnya

> Versi / tarikh: …  
> Ditambah: …  
> Diubah: …  
> Dibaiki: …  
> Keputusan berkaitan: …  
> Impak pada save/data/aset: …  
> Bukti semakan dan had: …

## Source Edition 2.0 — 18 October 2026

- Nine reference-driven live screen layouts; shared source-themed card frames, English copy and accessible native dialogs.
- Armoured MC with five pose assets, twenty source roster derivatives and four arena backgrounds.
- Playable deterministic Gold shops, once-only purchases, preview/confirm reward and rest.
- Collection search/filter/pagination and tutorial probability practice.
- User combat music imported with circular overlap; other original cue tracks retained.
- Versioned Shop maps preserve existing saves; additive economy/stat counters validated.
- Source/implementation evidence and scope recorded in docs/SOURCE_EDITION.md.

## Dungeon Edition 2.1 — 18 October 2026

- Alyssa standing sheet replaces the menu portrait; title and live gold menu remain at the left.
- New Ember Mirror models and four action poses follow actual combat outcomes.
- Six supplied transparent map seals integrated into nodes, room choices and legend.
- New runs use supplied ten-level maps, exact quotas, mandatory levels 5/9/10 and frozen snapshots.
- Existing routes and stage checkpoints remain compatible. No HP/economy/mathematics tuning changed.
- Included original map module/SOR, source sheets, asset crop/hash records, Windows update script and VS Code instructions.
- Verification evidence and limits recorded in `docs/VERIFICATION_2_1.md`.

## Combat Edition 2.2 — 19 October 2026 (Malaysia)

- Rebuilt the live combat composition around the attached reference and existing source art.
- Grounded Alyssa on the left, enemy/intent on the right, HP beneath each, hand and resource/action dock below.
- Added a gold target/ruby Focus icon distinct from the cyan Predict orb.
- Set the exact MC name/title **Alyssa the Clairvoyance** in SOR 08 and the shared runtime owner.
- Kept configured combat, card, mathematics, map and save rules.
- Fixed exact pile-trigger focus restoration after closing Predict.
- Added real-browser combat/action/save coverage at five viewport sizes and an in-place update/rollback package.
- Actual checks and limitations: `docs/VERIFICATION_2_2.md`.

## 2.3 visual integration — 19 October 2026

Five illustrated menu backgrounds from current references; stationary five-button menu and scene picker; reduced-motion-aware autoplay. Latest Stage 1 enemy action key poses, six arena images and UI atlas integrated. Shared theatre and transparent-canvas foot pivots fix wall/floor mismatch. Approved Alyssa the Clairvoyance title and distinct Focus preserved. Mechanics/save schema unchanged. See decisions 06–10 and docs/DUNGEON_EDITION_2_3.md.

## Screen fit 2.3.1 — 19 October 2026 (Malaysia)

Fixed combat appearing as a small central area on large CSS viewports. Removed the width cap and scaled arena/HUD/cards together. Arena cover cropping retains the floor horizon, including ultrawide screens. Kept current menu art, engine values and saves. Added seven viewport regression cases and an in-place 2.3.0 hotfix with backup/rollback. Evidence and Windows execution limits: docs/FIX_SCREEN_FIT_2_3_1.md.

## HUD icon correction 2.3.2 — 19 October 2026 (Malaysia)

Enlarged Energy artwork and removed its extra CSS ring. Restored Focus to the supplied illustrated cyan eye. Added a matching, distinct illustrated Predict sphere/cards icon and enlarged player/enemy HP badges. Preserved the screen-fit correction. Extended combat browser QA to all four HUD artworks and 4K; in-place hotfix supports 2.3.0 and 2.3.1 with backup/rollback. Actual checks and limits: docs/FIX_HUD_ICONS_2_3_2.md.

The additional Rest correction uses the original blue campfire seal on the healing choice, shared with the map Rest node. The heal preview and confirmation retain their existing native flow. It is included in the same 2.3.2 update.

## Artifact Edition 2.4 — 19 October 2026 (Malaysia)

Added the illustrated Dungeon Master opening before map in new Challenge runs; three saved random Starting offers and explicit claim. Integrated source artifact effects, HP/Gold once-only acquisition, combat counters/stats/resources/draw, highest-only Shop discounts, Elite/Mystery and Stage 1 Boss choices, inventory and exact checkpoint retry. Imported only runtime 800px icons plus relevant source documentation. Two card-dependent artifacts stay locked. Current rules and actual evidence: SOR 19 and docs/ARTIFACT_EDITION_2_4.md.

## Map and entity correction 2.4.1 — 19 October 2026 (Malaysia)

Expanded the map into a wide parchment atlas with generous scrollable level spacing. Moved the six-category legend and generic entry controls to the left. Removed all map encounter-name/portrait/stat disclosure, including hidden attribute text. Preserved both atlas axes and keyboard selection, added Current level, and retained exact stored routes. Replaced the human Dungeon Master with a mysterious non-human rift entity; runtime artwork is a documented 3840×2160 upscaled export. Artifact effects and game values remain unchanged. Actual checks: docs/MAP_ENTITY_UPDATE_2_4_1.md.

## Direct map entry 2.4.2 — 19 October 2026 (Malaysia)

Removed Selected Path, secondary Enter Room, Current level and the bottom sidebar hint. Enabled map icons now enter the exact legal scene directly by click or native keyboard activation, focusing the new scene. Kept the left legend, category-only surprise and scrollable atlas. Included a separate 3840×2160 PNG export of the exact approved entity artwork, explicitly upscaled; runtime artwork is unchanged. Actual checks: docs/DIRECT_MAP_UPDATE_2_4_2.md.

## Stone Master artwork 2.4.3 - 19 October 2026

Imported the newest user-supplied stone Dungeon Master illustration without a redraw. Reused the existing live artifact renderer and effects. Recorded the Form 4 review-only bank scope in SOR 02/01 and decisions 27-29. The 120 questions are delivered separately; no education gate is enabled yet. Browser artifact and map journeys, six viewports through 4K, offline artwork/claim and package integrity checks pass. Windows execution is NOT_RUN. Evidence: docs/STONE_MASTER_UPDATE_2_4_3.md.

## Education 2.5.0 - 19 October 2026

Connected Claim Artifact to the exact original 120 questions, 40 per approved Form 4 topic. Added independent seeded selection without repeated IDs, frozen choice order, persistent exposure history, answer/Hint/explanation UI and strict saved-trial validation. Final correct-answer continuation commits the artifact effect and original room/stage progression once. Fixed the Elite card-reward snapshot so the pending offer/trial can be restored. Old saves keep their scene; no retroactive question injection. Actual checks and Windows limitation: docs/EDUCATION_UPDATE_2_5_0.md.

## 2.5.1 menu fit — 21 October 2026

- Fix UWHD Home clipping with contained, padded foreground artwork and muted ambient fill.
- Scale native title/actions/footer and non-wide Home dialogs from one viewport unit; retain phone/short-screen scrolling.
- Change artwork interval and crossfade to 5s; preserve fixed sources during rapid selection and reject stale decodes.
- Keep Motion Off/reduced-motion/pause, menu actions, original assets, combat and saves intact.
- Add project-owned browser geometry/lifecycle QA and CI verification; current evidence: docs/MENU_FIT_2_5_1.md.

## 2.5.2 special-situation art — 21 October 2026

- Apply the four supplied scene art directions to Shop, Rest, Reward, Stage Clear, Victory and Defeat.
- Remove baked mockup UI and retain live prices, cards, HP and summary controls.
- Fit the full illustrations on desktop/UWHD and stack artwork above controls on narrow screens; preserve native interactions and natural scrolling.
- Record asset hashes/prompts/dimensions and add browser coverage of scene geometry, purchases, Rest/Upgrade, rewards, summary progression and the offline build.
- Scope and actual verification: docs/SITUATION_ART_2_5_2.md.
