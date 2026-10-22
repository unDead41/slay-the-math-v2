# Slay the Math — Dungeon Edition 2.12.0

Start with **[MULA-DI-SINI.md](MULA-DI-SINI.md)** for Windows/VS Code instructions.

```powershell
npm.cmd start
```

Open http://localhost:4173. No npm packages are required to play or edit the source.
Use Ctrl+C to stop. `dist/` contains the editable game; `modules/map/` contains the
supplied 100-seed map module, original icon PNGs, exported layouts, tests and SOR.

The MC is **Alyssa the Clairvoyance**. Combat follows the latest supplied reference:
Alyssa left, enemy/intent right, HP underneath, hand/resources/actions below. Focus
has a new gold target/ruby icon distinct from Predict. The main menu keeps Alyssa
on the right of the supplied dark dungeon/gold design.
Ember Mirror has dedicated Attack/Defend/Skill/Damaged poses. New runs have 10 levels
per stage, 3–5 initial paths and the supplied Mystery/Rest/Boss and quota rules.
Continue preserves the exact saved graph, including older five-level runs.

The Combat Update ZIP installs into the existing project folder using its root
`APPLY-UPDATE.ps1`. It checks affected files, backs up original bytes and supports
rollback. It never opens another VS Code window. See the Malay guide.

```bash
npm run check
npm test
npm run test:maps
npm run build
```

`npm run build` rebuilds optional `MAIN-SEKARANG.html` with embedded art/music.
DOM tests need jsdom via `DOM_QA_MODULE` (otherwise explicitly skipped); optional
browser checks use Playwright via `BROWSER_QA_MODULE` and an installed Chromium.
The game itself has no dependency on either QA package.

See [implementation and limits](docs/DUNGEON_EDITION_2_1.md), [verification](docs/VERIFICATION_2_1.md),
[DESIGN.md](DESIGN.md), [UX-CONTRACT.md](UX-CONTRACT.md) and [SOR_README.md](SOR_README.md).
Probability remains the implemented mathematics mode.

Main menu UWHD/display fit and 5s transitions: [Menu fit 2.5.1](docs/MENU_FIT_2_5_1.md). Browser QA: `npm run test:menu-browser` with Playwright supplied through `BROWSER_QA_MODULE`.

Special-situation artwork update: [2.5.2 notes](docs/SITUATION_ART_2_5_2.md). Run `npm run test:situations-browser` with the existing Playwright QA setup to verify the new scene layouts and actions.

Reward and Shop portrait-card correction: [2.5.3 notes](docs/FIX_CARD_PROPORTIONS_2_5_3.md).

Artifact Pack V3.2 rich text and resolved calculations: [2.6.0 notes](docs/ARTIFACT_RICH_TEXT_2_6_0.md). Open **Artifacts → View Calculations**, **Calculations** on the map/rooms, or **Log** in combat. Underlined terms and numbers support hover, keyboard focus and tap.

Stage 1 normal/Elite frame animations: [2.7.0 notes](docs/STAGE1_ANIMATION_2_7_0.md). Five supplied enemies use 25 clips / 128 frames, with unchanged combat rules and a stable arena floor.

Alyssa's source `MODEL.zip` is integrated in [2.8.0](docs/ALYSSA_ANIMATION_2_8_0.md): 30 right-facing frames across Idle, Attack, Defend, Skill and Damaged, in both stages. Source timing and boot pivots are preserved. Run `npm run test:alyssa-browser` for focused browser checks.

[2.8.1](docs/ALYSSA_RIGHT_ONLY_2_8_1.md) removes the older hero image fallback. All five combat poses, loading/failure fallbacks and Motion Off now use the same approved right-facing family. Run `npm run build` after pulling to refresh the offline HTML.

## Both-stage enemy motion 2.10.0

All 10 Normal/Elite enemies across both stages now use the supplied Idle, Attack, Defend, Skill and Damaged sequences: 50 clips / 263 frames. The supplied Stage 1 repack matches the installed sheets exactly. Stage 2 adds its five source models, including the corrected left-facing Chain Golem and matching loading/failure posters. Alyssa retains her accepted right-facing motion and Skill calibration. See [source mappings and verification](docs/ENEMY_MOTION_2_10_0.md). Run `npm run test:enemy-browser` with the existing Playwright QA setup. Rebuild the optional offline HTML after pulling.

## Combat polish 2.9.0

Skill frames now keep a consistent body size at the same boot pivot. Result Time freezes at stage clear, victory or defeat. Hand holds at most 10 cards; excess draws stay in the pile. A compact overlapping hand reveals cards after a 140ms hover dwell or immediate keyboard focus. Use 0 for the tenth card. See [details and verification](docs/COMBAT_POLISH_2_9_0.md).

## Map and integrated learning 2.11.0

The supplied map reference now guides a worn parchment dungeon atlas, live HUD and left legend. Actual saved room connections remain clickable native controls. Both stages and old five-level routes keep their generated topology.

`INTEGRATION.zip` supplies Artifact 3.5, Question Bank 1.5 and the matched shared rich-text service. The 120 original questions now include ordered Hint/More Hint, specific wrong-choice feedback, hint/solution diagrams, worked steps after a correct answer, seven Basics modules with 14 unscored practice checks and 30-skill learning evidence. Collection → Artifacts opens the persistent Codex with search, tier filters and effect comparisons. Owned artifact counters use the real engine state. Details, compatibility and evidence: [Map & Integration 2.11.0](docs/MAP_INTEGRATION_2_11_0.md).

After pulling, run `npm.cmd run build`, then `npm.cmd start`. Rebuilding updates the offline `MAIN-SEKARANG.html`. To regenerate only the supplied mechanics bundle from preserved source, use `npm.cmd run import:mechanics`.

## Map, modes, Bosses and Shop 2.12.0

Clearer map routes/Floor labels, illustrated Learn/Challenge choices, full motion for both bosses and two 3×2 Shop racks: six cards (one at 60% off), six artifacts (3 Starting / 2 Mid-tier / 1 Boss), and paid card removal. Purchases work in both modes and survive reload. [Details and save compatibility](docs/GAME_UPDATE_2_12_0.md). **Question audit found a glossary harmonization issue**; authored content stays unchanged. [Audit for the question owner](docs/QUESTION_SUPPORT_AUDIT_2_12.md).

After pulling, rebuild `MAIN-SEKARANG.html` with `npm.cmd run build`, restart using `npm.cmd start`, then Ctrl+F5.
