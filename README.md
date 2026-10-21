# Slay the Math — Dungeon Edition 2.5.3

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
