# Slay the Math: Dungeon of Chance

The user approved the in-chat design and explicitly requested complete implementation now. Build a simple-English single-player browser deckbuilder with two stages and two bosses, inspired by the genre rather than copied assets. Scope: one mage, twelve card types, four normal enemy types, two bosses, five map depths per stage, rewards, camp upgrades, events, exact probability forecasting, Focus, tutorial, local save/continue and stage checkpoint retry. No backend is needed.

Rules: 60 initial HP, 3 energy per turn, draw 4 cards, starter 12 physical cards (6 attacks, 4 guards, Filter and Draw). Block resets at the next player turn. Draw without replacement; shuffle discard when draw pile is empty. Filter temporarily sets aside up to two cards, never reducing the active battle deck below six or the current draw pile below two; restore after battle. Focus cap 3, one point adds 3 damage or block to one card once per turn. Forecast once per turn; only first correct unassisted response awards Focus; guided correction still opens a boss seal. Invalid input is not an attempt. Bosses have two seals, take half damage until both open, and cannot fall below 1 HP while sealed. Forecast state is a frozen visible composition and is saved. With-replacement boss trials sample runes from a snapshot, not additional combat cards. Never reduce mastery credit based on random draws.

Two bosses: Sentinel 70 HP, mutually-exclusive union then overlapping union seals; Dealer 95 HP, without-replacement then with-replacement pair seals. Clear stage 1 checkpoints stage 2 with 12 HP recovery. Lose stage 2: retry exact saved stage checkpoint. Maps: 13 locations on five floors per stage, with three entry points and a directed graph of branching and merging connections. Visit exactly one room per floor; only connected next-floor rooms are legal. The first two floors contain battles (including an optional elite); floors three and four offer camp/event alternatives; the final floor is the stage boss. An elite rewards an upgraded card. Route generation has its own deterministic seed and never consumes combat RNG. Persist the chosen node path and active encounter. Old v1 saves without route metadata retain their original map until the next stage; stage-two checkpoints store the new route. Rewards: three unique choices or skip. Camp: heal 12 or upgrade one card. Event: heal 8 or remove one card, permanent deck floor 10.

All constants are initially tuned values and live in config.js. Website uses buildless HTML/CSS and browser JavaScript modules via globals to allow offline double-click execution as well as hosting. Bundled SVG environment/enemy art and lossless WebP character/card art; no CDN or external runtime dependency. The user-selected female red mage, animated geometric home screen and mathematical card illustrations form the 1.1 visual edition. The prior Phaser suggestion is replaced by a self-contained engine because a turn-based card game does not need a scene renderer and the user needs an immediately runnable downloadable edition.

Difficulty: Learn mode scales announced incoming damage by 0.7, rounded up; Challenge mode retains original damage. Announced intent is frozen at turn start and survives reload. Imported and continued forecasts reset transient UI feedback, while serialized attempts remain authoritative.


Source Edition 2.0: the nine supplied screen references and latest source model packs supersede the older mage presentation. See docs/SOURCE_EDITION.md, DESIGN.md and UX-CONTRACT.md for implemented screens, source roster, economy, Shop and compatibility. Route v2 introduces a third-floor Shop without changing saved v1 routes. Runtime tuning lives in config.js. Probability remains the implemented math engine.


## Dungeon Edition 2.1 — current map and art override

Ijamm's latest attached map module and SOR supersede the earlier five-floor map
for new runs. New runs now have ten levels per stage (twenty rooms total), 3–5
initial paths, exact global Shop/Elite/Rest quotas and mandatory Mystery/Rest/Boss
at levels 5/9/10. Route version 3 freezes a stage snapshot; previous runs retain
their old topology. See modules/map/SOR and docs/DUNGEON_EDITION_2_1.md.
The latest menu uses explicitly named Alyssa at the right, the new transparent
standing sheet, dedicated Ember Mirror action poses and all six supplied map seals.
This visual/map integration does not change combat, card or mathematics tuning.

## Combat Edition 2.2

The latest user combat screenshot supersedes the former small three-column battle box. Use Alyssa left, enemy/intent right, HP beneath each, and a lower hand/resource/action dock. Use the existing supplied arena, MC, enemy and soundtrack assets. Give Focus a different icon from Predict. The exact approved character name is **Alyssa the Clairvoyance**, recorded in SOR 08 and DCConfig.MC. This task changes presentation and dialog-trigger focus restoration; all numeric card/combat/math/map rules and existing saves retain their prior contract.

## Dungeon Edition 2.3

Ijamm requests the five supplied illustrated Alyssa menu scenes, the latest Finalize Design(2).zip assets, and fighters visibly standing on the arena floor. The left menu is native HTML over clean-plate derivatives of the five references; it has Continue, New Run, Tutorial, Card Collection and Settings. Art changes manually or every 14 seconds while Motion is enabled, with OS reduced motion, hidden tabs, dialogs and focused/hovered main-menu controls pausing autoplay. Existing run, mathematics, cards, RNG, map and audio contracts remain. The six Normal/Elite/Boss arena images are local to the battle theatre. A shared foot pivot and contact shadows anchor actors to the actual floor. Stage 1 has five supplied dedicated pose sets; Stage 2 and bosses retain their supplied models and CSS reactions. Details: docs/DUNGEON_EDITION_2_3.md.

## Artifact Edition 2.4

Ijamm explicitly requests real artifact effects and an illustrated Dungeon Master encounter before the map in each new Challenge. Three frozen random eligible Starting offers, pick one, then map; later Elite/Mystery/Boss acquisition follows the supplied Artifact Pack V3.1. This supersedes the older no-artifact scope. Existing saves and Learn keep their flow. Current contract, the two unavailable card-dependent items and numerical/timing owners: docs/sor/19_ARTIFACT_SYSTEM.md.

## Map and entity correction 2.4.1

Ijamm's four current references request a neater, larger scrollable map with wider level spacing, a legend on the left and surprise encounters. Remove the identity-bearing selected-room preview and disclose only room category before entry. Existing room data, generator snapshot, legality and rewards remain authoritative. Replace the human Dungeon Master with an unidentifiable entity in the same Alyssa dungeon composition. Runtime artwork is a 3840×2160 upscaled export; provenance explicitly records the smaller native AI source. Detailed implementation and checks: docs/MAP_ENTITY_UPDATE_2_4_1.md.

## Direct map entry 2.4.2

Ijamm removes the Selected Path/Enter Room area and requests that pressing a map icon directly opens its scene. This supersedes the two-step preview from 2.4.1. The legend remains left and category-only secrecy remains. The exact approved entity artwork is also supplied as a 3840×2160 PNG export (upscaled from 1672×941), in addition to the existing 4K runtime WebP. No new image composition is requested.

## Supplied Master artwork 2.4.3 / Form 4 review bank

The user explicitly supplies image(20261019-032240).png and requests implementation. Use its non-human stone Master with cyan eyes, carved face and stone hands, facing Alyssa over the altar. This supersedes the old no-face/no-hands rift instruction. A mechanically upscaled 3840x2160 WebP replaces the shared scene asset. Separately, the user approves Form 4 chapters 9, 4 and 3 and requests 40 original questions each for review first. The 120-item bank is delivered outside the game; education at Claim Artifact is not enabled by this artwork update. See SOR 02 and docs/STONE_MASTER_UPDATE_2_4_3.md.

## Education after Claim Artifact 2.5.0

The latest user instruction explicitly requests the missing question implementation after Claim & Choose Your Path, using the existing 120-item bank. The review-only timing is superseded. The shared artifact Claim now reserves its gift, opens one saved unused Form 4 question, supports wrong-answer retry and Hint without HP penalty/timer, and shows the correct explanation before the final once-only claim/progression transaction. Starting, Elite/Mystery and Boss gifts share this gate. Same-origin exposure history survives New Run/import/refresh; no automatic question recycling. Existing Predict credit, combat values and artwork remain. Owners: SOR 02/13/19 and docs/EDUCATION_UPDATE_2_5_0.md.


## Current map and learning integration — 2.11.0

The supplied October 21 map reference now guides the parchment dungeon atlas with a live status header and left legend. INTEGRATION.zip adds the matched Artifact 3.5 / Question Bank 1.5 / STM_SHARED presentation and learning support. The original 120 Form 4 question IDs/answers remain: Hint, More Hint after a later wrong attempt, specific feedback, hint/solution visuals, worked steps after correct, optional unscored Basics and local skill evidence. Collection → Artifacts provides discovery, filters and read-only examples/comparisons. The engine remains the sole reward/resource owner. An unfinished trial resumes across New Run according to the supplied session contract; completed questions never re-enter the draw pool. See docs/MAP_INTEGRATION_2_11_0.md for the compatible-save details and actual verification.


## Map, modes, Boss motion and Shop 2.12.0

The latest user request adds readable routes, illustrated mode choices, both supplied Boss animation families and a six-card/six-artifact Shop with a 60% card sale and paid removal. Paid artifact purchases are available in both modes; Challenge free gifts retain questions. Existing bank content is audited and reported without rewriting. SOR 12/13/19 owns exact transactions and save policy; GAME_UPDATE_2_12_0.md records tuning, assets and tests.
