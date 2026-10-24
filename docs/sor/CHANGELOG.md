# Changelog SOR — Slay the Math

## Game 2.32.0 — Combat animation polish

- Publish completed combat-animation `b422a18` to main after Ijamm’s explicit authorization: ranked/combined status feedback, named Passive/stat ownership, clearer auras and shield depletion/expiry, ten proc signatures, shared SFX timing and Low/Full intensity. Original artwork/icons, source sprite timing, balance, maths and run schema stay under their existing owners.
- Update release/cache metadata. Record focused tests, native browser viewport/quality checks and source preservation separately from the incomplete production/offline and physical-device/audio checks. [Actual main verification](../COMBAT_MOTION_MAIN_2_32_0.md).

## Branch preview — combat-animation — 24 October 2026

- Combat motion polish, now authorized for the existing combat-animation branch: ranked/combined status feedback, Passive/stat label ownership, clearer crowded auras, shared presentation/SFX timing, conservative shield shatter, ten distinct proc signatures and Low/Full intensity. The later user instruction authorizes this branch push only; no main update, release version bump or asset/gameplay change. [Scope and verification](../COMBAT_MOTION_POLISH_LOCAL.md).

Versi dokumen berasingan daripada versi game.

## Game 2.31.0 — Complete illustrated tutorial

- Replace four-page help with 17 English/BM chapters, 16 real UI screenshots and 11 safe actual-engine practice chapters.
- Add chapter navigation, independently saved progress, replay/reset, screenshot enlargement, ordered canonical question help and boss-seal practice.
- Preserve player records, original assets/rules, native focus and timed Mystery ownership; support desktop/phone scrolling and unavailable storage. [Owner and actual checks](../TUTORIAL_2_31_0.md).

## Game 2.29.0 — Single-enemy card correction

- Convert Rune Sweep to one hit and Fate Storm to three hits on the same enemy; remove phantom AoE and target-selection RNG.
- Reuse the existing Master two-card values in ordinary modes; preserve all other card/profile/economy/map values and original assets.
- Version new receipts while retaining actual old ordinary-mode receipts and HP/RNG; advance Master to candidate.3 with an isolated save key.
- Add bounded before/after power and selected synergy measurements, actual campaign regression and current English/BM descriptions. [Scope, evidence and checks](../balance/master/SINGLE_TARGET_2_29_0.md).

## Game 2.28.0 — Alyssa RPG status effects

- Show moderate, floor-registered Block, Strength, Agility, Defense, Thorns, Weak and Vulnerable effects around Alyssa, with actual stat-change bursts and signed labels.
- Project shield impacts from real enemy absorption receipts, distinguishing normal expiry and queued grants. Restore current auras without replaying saved triggers; dispose effects across actions, dialogs, navigation, visibility and motion changes.
- Preserve source art/icons, card motion, analytics, gameplay/save/RNG/audio owners. Replace the old defend floating-number shortcut with actual status/absorption feedback.
- Add an online SFX search guide for Ijamm's later audio selection; no new sound files imported. [Scope and actual verification](../ALYSSA_STATUS_VFX_2_28_0.md).

## Game 2.27.0 — Integrated Master balance playtest

- Publish the completed Master update to `main` under Ijamm's explicit follow-up instruction. Keep the existing opt-in playtest and candidate values. [Main release and checks](../balance/master/MAIN_RELEASE_2_27_0.md).
- Integrate Map, Combat and Economy branches on main 2.26.0, including Learning Report/analytics from b67298b, retaining original artwork, audio, card motion and questions.
- Add one versioned browser/Node Easy/Medium/Hard binding, profile-specific saves, source-aware frozen loot, full economy/event effects and accurate candidate descriptions.
- Run actual full campaigns, same-entry Stage 2 regression, all-card ICP and selected pair/triple synergy screens. Preserve raw source snapshots and historic specialist evidence.
- [Master SOR](23_MASTER_BALANCE.md) and [validation/handoff](../balance/master/HANDOFF.md) distinguish implemented candidate tuning from unmeasured pupil goals.
## Game 2.26.0 — Education analytics integrated with main

- Integrate `education-analytics` with main 2.25.1 under Ijamm's explicit authorization; preserve combat card motion, original card/artifact artwork and MUSIC(5).
- Publish Learning Report in Main Menu, Settings and Practice, local evidence/comments, optional durable SQLite collection and CSV/JSON export.
- Resolve source and generated release conflicts without replacing the newer engine, artwork registries or question content. Add a production collector startup command and Windows/backend handoff.
- Sources, collection limits and setup: [current guide](../EDUCATION_ANALYTICS_2_26_0.md). [Integration verification](../EDUCATION_ANALYTICS_MAIN_VERIFICATION.md).

## Game 2.25.1 — Restore original card and artifact artwork

- Restore the 40 selected original card illustrations and 31 original artifact illustrations across live UI, source Codex, motion cues and portable output.
- Keep all current buff/debuff, UI/menu, map and topic icons. Source artwork bytes, portrait frames, gameplay IDs and saves stay intact.
- Make ordinary card generation and explicit icon-package reimport preserve the approved artwork boundary.
- Publish the 2.25.0 combat motion to main together with this correction, under Ijamm's explicit request. [Cause, scope and actual verification](../ICON_ART_RESTORE_2_25_1.md).

## Game 2.25.0 — Combat card motion

- Add actual Draw/Discard/Exhaust flights, face-down reshuffle and confirmed Recall/Passive movement using the existing source portraits.
- Show named, effect-specific cues for all ten current Passive triggers with actual capped/zero results.
- Keep animation independent of synchronous resolution/save/RNG and cancel all transient clones/hidden-card state across UI lifecycle and motion preferences.
- Develop and review on `combat-animation`; publish to main with the 2.25.1 artwork correction under Ijamm's explicit follow-up authorization. [Implementation and actual verification](../CARD_MOTION_2_25_0.md).
## Map balance v1.3 — 23 October 2026

- Implement all six accepted map-analysis improvements: adaptive visible routing, replicated matched-entry paths, recovery/penalty windows, actual risk/reward, Predict sensitivity and difficulty explanations/regression gates.
- Add a fixed 3,000-campaign experiment schedule, real survivor entry banks, three-rank replays, sharded raw results and CSV/JSON with separate planned/started/ten-node coverage. Preserve v1.2 evidence.
- Update [Map SOR v1.3](../../modules/map/SOR/04_MAP_COMBAT_POWER.md), [tool instructions](../../tools/balance/map-advanced/README.md) and [Master handoff](../MAP_BALANCE_V1_3_HANDOFF.md). Easy/Medium/Hard full adapters and pupil targets remain pending; no gameplay/version/UI change.

## Map balance audit v1.2 — 23 October 2026

- Add developer-only analysis for all 100 seeds, 200 maps, 5,500 complete stage paths and 77,384 legal two-stage pairs; preserve all topology and gameplay values.
- Add contextual pressure estimates, bounded real-engine campaign replay, explicit sampling/traversal coverage, uncertainty and error/censor handling, CSV/JSON and candidate-vs-runtime provenance.
- Add [Map SOR v1.2](../../modules/map/SOR/04_MAP_COMBAT_POWER.md) and [Master handoff](../MAP_BALANCE_HANDOFF.md). Candidate Easy/Medium/Hard tuning and pupil targets remain unvalidated; no game-version bump or player-facing CP.

## Feature preview 2.25.0-analytics.1 — education-analytics only

- Add Main Menu/Settings/Practice Learning Report with BM/English chapter graphs, selected SK/SP breakdown, honest sample counts and targeted Basics/review.
- Observe existing gameplay/Practice evidence without changing questions, rewards or RNG; retain Review separation and Retry continuity.
- Add offline durable pending collection, explicit consent, exact revision acknowledgements and optional authenticated SQLite receiver with operator CSV/JSON extraction.
- Preserve existing comments, exports, audio and Dev isolation. Main is not updated. [Guide](../EDUCATION_ANALYTICS_2_25_0.md); [actual validation](../EDUCATION_ANALYTICS_VERIFICATION.md).

## Game 2.20.0

- Limit combat to three active Passives with a free-to-cancel replacement popup, correct stat removal and preserved trigger history.
- Recover older over-cap saves with a free saved selection, including deferred choices and double-click protection.
- Apply eight supplied BGM and seven character voices with separate Voice controls, stable encounter order, cancellation and automatic ducking.
- Preserve source audio bytes, generate catalog/portable assets deterministically and update launchers/version metadata. [Changes and actual validation](../PASSIVE_AND_MUSIC_2_20_0.md).

## Game 2.17.0 delivery fix — 22 October 2026

- Move the main-menu question-language selector into Settings and retain its saved preference.
- Derive version from package.json, invalidate changed runtime scripts/styles and clarify correct-server startup.
- 217 tests pass; desktop/phone Settings and all runtime resource hashes verified. [Details](../SETTINGS_RELEASE_2_17_0.md).

## Game 2.17.0 — 22 October 2026

- Keep question artwork fixed while Hint, More Hint and worked steps scroll inside Artifact/Mystery panels.
- Use Ink with a compact bilingual term legend, including Ink by default in Education Practice.
- Split current-run coverage (reset on New Run) from retained lifetime question coverage, using existing save records.
- Build, syntax, 215 passing tests and browser geometry checks. [Evidence](../QUESTION_MENU_2_17_0.md).

## Game 2.16.1 — 22 October 2026

- Fix stale HTML entry paths and missing shared learning CSS; expose question language and the 120-question Practice entry on Main Menu.
- Align live Artifact/Mystery support with the folio and keep save/transaction ownership intact. [Details](../EDUCATION_ENTRYPOINTS_2_16_1.md).

## Education 2.16.0 integration into main — 22 October 2026

- Apply the education branch by explicit user request, preserving main Boss size, Shop tabs and Mystery backgrounds/rich text.
- Combined build and 207 tests passed. [Details](../EDUCATION_MAIN_INTEGRATION.md).

## Game 2.13.2 — 22 Oktober 2026 (Malaysia)

- Match both bosses’ visible height to Alyssa with explicit host calibration.
- Keep full VFX visible on tablets and comparable framing on phones, including fallback posters.
- Preserve source artwork, all 60 frames/holds, floor registration and gameplay.
- Verification: [Boss size](../BOSS_SIZE_2_13_2.md).

## Game 2.14.0 — 22 Oktober 2026 (Malaysia)

- Integrate reviewed Question Bank 1.6 with attached textbook/DSKP sources, simpler teaching definitions and explicit context/Given/Find in game.
- Add Education Practice directly on Main Menu with the full 120-question folio, separate saved Learning and resettable Review.
- Per the latest screenshot instruction, fill actual table/Venn values from Hint 1 immediately; More Hint explains those values. Unspecified regions remain “Not given” and solution-only selection marks stay gated.
- Preserve stable IDs, answer bindings, prior pending trials, Claim ownership and Mystery-specific rules.
- Generate the practice document from the active bank. Build the oversized offline HTML locally instead of committing a stale generated artifact.
- Details and actual checks: [Education Practice 2.14.0](../EDUCATION_PRACTICE_2_14_0.md).

## Game 2.13.0 — 22 Oktober 2026 (Malaysia)

- Apply all fifteen Mystery v2 scenes/mechanics to both stages/modes with the active shared bank.
- Add fixed one-attempt timers, final review, persistent candidates/deadlines and atomic confirmed rewards/costs/failure consequences.
- Add category-preserving card transforms, consumed Artifact history, permanent Max HP cost, stage-correct Echo encounter and temporary Oracle/Hourglass modifiers.
- Preserve existing bank/answer IDs and Artifact unfinished-trial behavior; reject malformed reward saves and keep keyboard focus on the new heading.
- Retain original ZIPs/artwork; validate runtime derivatives and document the supplied ME04 PNG’s incomplete bottom margin.


## Game 2.11.0 — 22 Oktober 2026 (Malaysia)

- Apply the supplied parchment dungeon map reference with live room icons, links and HUD; preserve both stages and legacy topology.
- Integrate Artifact 3.5 / Question Bank 1.5 / STM_SHARED from INTEGRATION.zip: one tooltip hub, ordered Hint/More Hint, specific feedback, visual learning and gated worked steps.
- Add seven Basics modules/14 unscored checks, 30-skill local evidence, persistent Codex search/tier/comparisons and real artifact counters in combat.
- Preserve the 120 original question/choice/answer bindings and all 31 artifact numeric effects. Retain existing icons after visible-pixel/alpha verification; explicitly reconcile nine engine-dependent glossary definitions.
- Extend compatible save/profile events, protect closed evidence from stale pending imports, preserve corrupted history and use a 2 MB bounded import.
- Details and actual checks: [Map & Integration 2.11.0](../MAP_INTEGRATION_2_11_0.md).

## Game 2.9.0 — 21 Oktober 2026

- Normalize all six Skill body silhouettes around the supplied boot pivots without changing source sheets, timing or right-facing direction.
- Freeze and persist result time at resolution; preserve it on reload and result revisits.
- Cap every draw at 10 cards, preserving excess cards and shuffle RNG. Normalize older overfull saves without deleting cards.
- Overlap crowded hands; reveal the hovered card and move neighbors after 140ms, with immediate keyboard focus, reduced motion and phone scrolling.
- Details: [Combat polish](../COMBAT_POLISH_2_9_0.md).

## Game 2.8.1 — 21 Oktober 2026

- Correct the older hero image fallback retained by 2.8.0. All five battle pose images now use the approved right-facing motion family, including loading/failure paths and Motion Off.
- Preserve the original animation sheets, remove legacy hero CSS pose movement and omit retired hero images from the refreshed portable build.
- Root cause, reproduction and verification: [Alyssa right-only](../ALYSSA_RIGHT_ONLY_2_8_1.md).

## Game 2.8.0 — 21 Oktober 2026

- Resolve the prior Alyssa attachment blocker using Ijamm's specified existing MODEL.zip source.
- Import five right-facing clips / 30 frames with original durations and boot pivots, in both stages.
- Preserve Stage 1 enemy playback and gameplay. Details and actual validation: [Alyssa motion](../ALYSSA_ANIMATION_2_8_0.md).

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

## 2.5.3 card proportion correction — 21 October 2026

- Fix stretched Reward and Shop cards on ultrawide displays with bounded portrait-card tracks and compact panels.
- Preserve square illustration viewports and a horizontal row of three choices; retain narrow-screen scrolling.
- Add real-browser ratio, row-alignment and fixed-height UWHD regression checks. Other menus and gameplay remain unchanged.
- Evidence: docs/FIX_CARD_PROPORTIONS_2_5_3.md.

## 2.6.0 — 21 October 2026: supplied Artifact Pack V3.2

- Integrate 31 segmented artifact descriptions, 55 glossary terms and scoped purple/pink/green tokens.
- One hover/focus/tap tooltip supports page and shared-dialog contexts without nested buttons or selecting an artifact while reading.
- Record actual resolved contributions, deltas, caps, die branches, stat totals and Shop rounding; show calculations in inventory, room/map action and battle log. Preserve trigger/education/ownership behavior.
- Optional bounded validated snapshot history is compatible with older saves and checkpoints. Reuse all 31 identical existing icons without adding duplicate large exports.
- Decisions 07–08; verification and retained limitations: docs/ARTIFACT_RICH_TEXT_2_6_0.md.

## 2.7.0 — 21 October 2026: Stage 1 non-boss atlas animation

- Import the supplied five-enemy v3 pack: 25 clips, 128 frames, left facing, native padding and one stable floor registration.
- Play Idle/Attack/Defend/Skill/Damaged at source FPS with generation-safe decode, bounded texture cache, scene disposal and pause/static motion settings. Engine, RNG, artifact/education/save rules are independent of frames.
- React to actual HP loss after automatic artifact Block. Both bosses and Stage 2 use existing assets. Alyssa's new MODEL(1).zip was unavailable and remains pending; no new hero frames are claimed.
- Decisions 09–10; actual checks: docs/STAGE1_ANIMATION_2_7_0.md.

## 2.10.0 — 22 October 2026 (Malaysia): Normal/Elite motion in both stages

- Complete supplied motion for all 10 canonical non-boss enemies: 50 clips / 263 frames across Idle, Attack, Defend, Skill and Damaged.
- Verify the Stage 1 repack against all 25 installed sheets without replacing accepted bytes. Import Stage 2 v2.1 losslessly, preserving full cells, timing, baked normalization and Chain Golem's authored left direction.
- Use matching Stage 2 source posters during loading/failure, retain static Idle with Motion Off, and map each resolved Stage 2 intent to its proper action without changing the engine.
- Preserve Alyssa's right-facing family/Skill correction, bosses, save format, hand limit, frozen result Time and current combat rules.
- Add source-pixel audits and focused browser regression coverage. Actual results and limits: docs/ENEMY_MOTION_2_10_0.md.


## 2.12.0 — 22 October 2026 (Malaysia)

- Clarify parchment map routes, Floor/room labels and entry badges; update illustrated mode choices.
- Add both supplied Boss animation families (10 clips / 60 frames), grounded source pivots and matching fallback posters through the same player.
- Expand Shop to two 3×2 racks, one 60%-off card, tiered artifact purchases in both modes and a paid once-per-visit removal service. Preserve legacy visits and free-gift questions.
- Audit all 120 items and report denominator/common-denominator support harmonization to the source owner without modifying the bank.
- Exact rules and verification: docs/GAME_UPDATE_2_12_0.md and docs/verification/release-2-12.json.

## 2.13.1 — 22 October 2026 (Malaysia)

- Replace the inset Mystery illustration with the full-background Dungeon Master composition and a responsive live panel.
- Separate Shop into Buy Cards / Buy Artifacts / Remove Card native tabs; retain exact prices, frozen stock, purchase/removal confirmation and saved Sold/service status.
- Apply shared game-term help and honest current-snapshot calculation previews to Mystery intro/review/reward rules. Preserve authored question rich text, real transaction logs and strict deadlines.
- Retain the approved Rest composition and source artwork. Verification: docs/ROOM_UI_2_13_1.md.


## 2.15.0 — 22 October 2026 (Malaysia)

- Add improvement categories, editable per-question comments and the requested reassurance to all 120 Education Practice questions.
- Persist independently of game/reward/Learning; preserve unreadable originals and surface storage failures.
- Add an exit reminder, CSV/JSON download and explicit native file sharing/download fallback. Clarify local saving versus delivery to Ijamm.
- Keep the active question bank, answers, Hint values, artwork and engine unchanged. See docs/QUESTION_FEEDBACK_2_15_0.md.


## 2.16.0 — Bahasa soalan

Pilih Question language / Bahasa soalan untuk menukar keseluruhan 120 soalan, Petunjuk, Petunjuk Lanjut dan jalan kerja antara English dan Bahasa Melayu. Kandungan dibandingkan dengan buku teks EN/BM dan DSKP. Perubahan kekal pada branch education.


## Game 2.18.0 — 22 October 2026

Integrate the supplied 40-card mechanics/Focus/Passive package and bilingual presentation; preserve legacy cards/saves. Correct native MathML layout across all120 questions; Shop uses full-background art and internal panel scroll. [Scope and verification](../CARDS_AND_DISPLAY_2_18_0.md).


## Game 2.19.0 — 22 October 2026 (Malaysia)

Whole-frame reward selection; fixed-size Read Ahead; compact one-viewport combat with relocated run information, artifacts and piles; ten status icons, visible Passive triggers and actor/turn combat journal. Predict shares the authored 120-item bank and run-wide exclusion with Artifact/Mystery; retain lifetime/mastery, pending saves and capped Focus. [Scope and checks](../COMBAT_AND_PREDICT_2_19_0.md).


## 2.21.0 — 23 October 2026 (Malaysia)

- Added Developer Hub for direct scene access, real card-state comparison/combat tests, temporary motion inspection, scene presets and diagnostics.
- Added start:dev/start:prod/build:prod; development previews isolate storage and production excludes developer files/routes.
- Added fixture, isolation and browser regression coverage. Owner and limitations: [20](20_DEVELOPER_TOOLS.md).


## 2.21.1 — Windows developer startup fix

- Normalize line endings in the development response adapter so CRLF checkouts load the main menu and Developer Hub previews.
- Add newline regression tests; preserve original source bytes and production behavior.


## 2.21.2 — Random questions across a run

- Use uniform unused-question selection for first/later Artifact trials, Predict and Mystery; remove difficulty weighting and preferred-subset bias from gameplay.
- Preserve Stage 1 Retry exposures as well as Stage 2 checkpoints. Keep New Run reset, lifetime history, frozen pending questions and explicit bank exhaustion.
- Verify all 120 IDs are reachable first, cross-consumer uniqueness, Shop/Rest continuity, restore, retry and a real browser Artifact → Predict → next Predict flow.

## Game 2.21.3 — 22 October 2026

- Remove decorative rich-text underlines and token bottom borders from runtime and source styles, including cards, artifact runtime and Practice legends.
- Preserve category colors, true mathematical fraction bars and keyboard focus/tooltip behavior.
- Record the new color-only rule in AGENTS.md and the UI/UX SOR.

## Game 2.22.0 — Normalized talking, 23 October 2026

- Apply 49 normalized MUSIC(4) voices with explicit canonical assets; retain eight unchanged supplied BGM, Menu/Mystery fallback and existing SFX.
- Bind Alyssa thinking, Hint, More Hint, committed Rest, eight available reward-card variants, defeat and 15 matching Mystery intros to actual game/Practice presentation. Retain normalized ordered Dungeon Master/Merchant encounters.
- Add independent audio shuffle bags, saved consumption receipts, scope cancellation, automatic start deadlines and watchdog cleanup; preserve game RNG, save compatibility, timed Mystery resolution and v2.21.3 rich text.
- Extend production/portable registry generation and meaningful controller, save and actual-UI regressions. [Scope, evidence and audition limits](../AUDIO_2_22_0.md).

## Developer toggle — 23 October 2026

Add npm start dev alias, main-menu-first development startup and synchronized menu/Settings developer toggle with session preference and player-storage isolation.

## Game 2.23.0 — Reviewed icon package, 23 October 2026

- Apply the consistent painted gold/navy/jewel icon family to UI, map, ten statuses, 31 artifacts and 40 card illustrations, preserving original files and authored gameplay data.
- Add dedicated visuals to existing boss-seal states, mixed enemy intent, Skill category, separate mixer mute controls, Save/Export/Import and the three topic labels. Keep all text/counts/44px status buttons.
- Add one canonical registry/resolver for the app, source Artifact HUD/Codex and offline embeds; make card illustration overrides survive rebuilds. Record input/runtime hashes and honest source resolution in the import manifest.
- Bump main's production metadata from 2.22.0 to 2.23.0 and retain normalized talking/audio integration. [Scope and actual checks](../ICON_PACKAGE_2_23_0.md).

## Game 2.23.1 — Developer toggle on main

Merge main-menu/Settings Dev ON/OFF and npm start dev alias into v2.23.0, retaining the reviewed icon and audio packages. Production remains free of developer tools.


## 2.24.0 — MUSIC(5) and checked answer talking

- Apply 26 new normalized recordings on music from latest main 2.23.1: answering +4, Hint +4, More Hint +4, correct +5, wrong +9. Active voices total 75; preserve all previous audio, icons, developer toggle and color-only rich text.
- React to actual checked correct/wrong answers in Predict, Artifact, Mystery review and isolated Practice; later answer/help events cancel older speech. Preserve once-per-attempt receipts through save/reload; historical results, Reveal, exhaustion, timeout and abandonment stay silent.
- Add reproducible FFmpeg importer with post-encoding measurements, source/output hashes and registry audit; embed every registered voice in portable builds. [Contract and verification](../AUDIO_2_24_0.md).


## 23 October 2026 — experimental combat balance

Added isolated pinned-baseline/candidate engine harness, explicit optional upgrade contracts, bounded Passive activation gifts, selection-discard distinction, candidate enemy/profile adapter, seed-matched ICP/CCP/Focus records and handoff. Candidate numbers remain development-only; no main integration. Concrete boundary and legacy regression evidence is recorded in docs/balance/combat/VALIDATION.md.


## 23 October 2026 — Deep combat tests

Added explicit-deck true-engine harness, actual campaign progression, accuracy profiles, setup/50-seed follow-up, artifact clusters, streaming raw records, differential reload and long transaction stress. Corrected harness route ranking/telemetry/provenance/gift ledger. Workspace recovery reruns retain source snapshots and prior aggregate comparison. No new production numeric tuning.
## 23 October 2026 — Economy candidate on 2.24.0 base

- Add SOR 22 / Economy & Rewards owner, exact runtime audit, current-vs-candidate prices/income/rarity/events and Master handoff.
- Add opt-in versioned economy profiles/loot receipts, source-aware bounded weighting, candidate Shop/removal/recovery and all fifteen event adapters; retain default/legacy contracts.
- Record 30,720 card offers, 16,384 artifact offers, 432 conditional Gold/recovery cases and read-only Map input flags, with raw seeds/assumptions.
- Combat/artifact stats, topology, question data/shuffle stay unchanged; human win rates and CP remain unmeasured.

## 23 October 2026 — Economy deep validation

Expanded offline deck/offer, six spending policies, answer/deadline/recovery, cumulative costs and route-risk experiments, plus stateful reload/transaction regressions. No runtime candidate numbers changed. Report: ../economy/deep/REPORT.md. Inputs from Combat/Map remain NEEDS_INPUT.

## GitHub Pages setup — 23 October 2026

Add a main-push/manual Pages workflow that builds and checks the current production game and uploads only release-prod. Document the one-time owner setting, share URL, browser save behavior and static-hosting limits. No gameplay/version changes.
## 2.28.0-sheets.1 — 23 October 2026 — branch preview

- Optional Google Apps Script/Sheets collection through shared Learning Report setup in host and Education Practice; lazy authenticated nested iframe/port bridge, current-destination consent/identity/ACK isolation and offline replay.
- Generated one-file receiver reuses actual canonical validators, locks and prevalidates batches, upserts raw/readable Sheet rows, repairs partial writes before ACK and preserves inert formula-like comments/Unicode payloads.
- BM operator guide, local/site-default configuration and native/simulated-Google regression coverage. Main 2.27.0 balancing, art, audio, question bank and saves are preserved. Live Google setup remains required; branch-only publication.

## 2.30.0 — 23 October 2026 — Google collection main integration

- Merge the reviewed Google Sheets education collection feature with main 2.29.0, preserving single-enemy cards/candidate.3, legacy receipts, Alyssa status effects, original artwork/audio and Pages setup.
- Main Menu/Settings/Practice Learning Report includes Google /exec configuration and opt-in delivery with offline pending records, current-destination consent/receipts and exact confirmed upserts. Ship one copyable Apps Script receiver and BM owner setup.
- Regenerate package/version/cache entrypoints; retain all main QA commands and add Google build/QA. Live Google authorization/deployment remains an explicit owner step. [Main integration](../GOOGLE_SHEETS_MAIN_2_30_0.md).


## 2.32.1 — New Main Menu music

- Use the supplied Menu.mp3.mpeg / Ancient Stone Keep recording for Home, preserving its exact MP3 bytes and replacing the canonical menu source so old OGG files cannot override it.
- Preserve existing Music settings, first-gesture unlock, full-track looping, scene crossfades and all talking. Generate normal/production/offline builds from the shared registry.
- Publish the completed music-branch update to main following Ijamm's explicit follow-up authorization. [Source and actual verification](../audio/menu-2026-10-24/README.md).

## 24 October 2026 — AI Playtester branch ai

Published developer strategy/simulation AI on main 2.31.0 base, preserving the tutorial. Added five-report history, safe identity-bound cancellation and reload selection, individual A/B replacement deltas alongside pair interaction, and per-card resolved Energy/Focus/direct-damage telemetry. No gameplay or main publication change. Fresh validation replaces the unavailable local-draft evidence; see docs/AI_PLAYTESTER.md and docs/verification/ai-branch.json.

## 24 October 2026 — AI strategy update on ai (game stays 2.31.0)

- Track actual card support alongside paid Energy/Focus: absorbed/expired/unused Block, Weak/Defense mitigation, actual Hand moves, buff/status involvement and Passive effects.
- Extend Expert to three sampled draw worlds and up to three complete turns, with equal budgets/common resolved cutoff and hidden order/RNG independence.
- Choose reward/skip, Shop, upgrade/removal and Mystery targets by marginal deck synergy, preserving legacy replay behavior without optional hooks.
- Publish schema 3 support tables/ratios, explanations and source-bound exports. [Verification](../verification/ai-strategy.json).

## 24 October 2026 — AI Playtester on main

- Integrate the completed support valuation, sampled future-turn planning and deck-synergy AI after Ijamm's explicit main publication request.
- Preserve current game 2.32.1, combat animation, supplied menu music, tutorial, player saves and numerical gameplay. Retain both main and AI SOR histories; the tool remains developer-only.
- Record fresh merged-tree verification separately from historical ai-branch results. [Integration](../AI_PLAYTESTER_MAIN_2026_10_24.md).
