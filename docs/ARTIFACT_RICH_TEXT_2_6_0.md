# Artifact Rich Text — game 2.6.0

Applies Ijamm’s supplied `ARTIFACT (2).zip` (Artifact Pack V3.2) to the existing game. The archive retains the previous 31 effect definitions and original icon files. The new runtime content is segmented artifact text, term definitions and explanations of actual resolved values.

## In the game

- All 31 artifact descriptions use the pack’s separate green game terms and pink math terms. Ordinary words and card frames retain the existing theme.
- Underlined terms support hover, keyboard focus and tap. One escaped tooltip handles page and dialog contexts; Escape dismisses it first, outside click dismisses it, and its position stays inside the viewport. Selection and effect terms use separate native buttons.
- Purple dotted numbers explain actual before/after values, sources and caps. Open **Artifacts → View Calculations**, **Calculations** on the map/room header, or **Log** during combat. Artifact inventory also shows its latest retained resolved result.
- The 55-term glossary is in the existing artifact inventory dialog. Pending core definitions from the ZIP are reconciled to the actual game: Focus cap 3 and boost +3, flat Strength/Agility, Block reset timing and available-card draws without a Hand cap. No fairness probability is promised for the saved d6 stream.
- Damage before enemy defenses and actual enemy HP loss are separate. Healing, Max HP, remaining HP, Gold spent, stat totals and resource changes retain their own labels and units. Shop quotes use the same highest-discount-only calculation as the engine, rounding the final price up.

## Data and persistence

`rich-text-data.js` contains 31 descriptions and 55 terms; no demo snapshots enter gameplay. `rich-text.js` owns rendering, tooltip interactions, validated results and the latest 64 resolved events. Engine/artifact resolvers capture actual events after resolution. Reading or restoring them cannot draw cards, reroll the die or grant anything. Optional `calculationState` stays compatible with old version-1 saves and stage checkpoints. It is local explanation history, not a learning score or verification of imported history.

Runtime icons are reused: the new ZIP’s 31 PNG hashes match the previous source records, and each existing WebP matches the source’s visible pixels and alpha. Provenance and reconciled definitions: `docs/artifacts/source-v3.2/integration-audit.json`. Only relevant text/data files are retained from the supplied ZIP. The portable bundle grows by about 46 KB; no new image payload is needed.

## Verification

- `npm run check`: passed.
- `npm run build`: passed; generated portable HTML is 75,775,674 bytes. This generated file is rebuilt locally and excluded from the source update.
- `npm test` with isolated jsdom: 112 passed, 0 failed, 0 skipped. Tests cover source mappings, caps, draws, actual die branches, combined damage, sealed-boss mitigation, HP limits, once-only acquisition, legacy saves, history validation, escaping, keyboard/tap behavior and the original question gate. The final dialog-scoped locator adjustment was also checked separately.
- `npm run test:artifacts-browser`: 9 check groups passed; six responsive viewports from 320px to 3840px, an additional 3440×1440 Shop check, native touch context, actual purchases, checkpoint/claim flow and unmodified offline HTML. No browser errors or external offline requests.
- `npm run test:education-browser`: 7 check groups passed; six viewports, all three topics, saved attempts/hints/answers, ten unique abandoned-trial questions, explicit bank exhaustion and offline question/effect/map/room entry.
- Special-situation regression: all 66 geometry cases (six scenes × eleven viewports) completed before later native-action timeouts. The full suite is **not counted as passed**: this QA host also hit a screenshot capture timeout. An independent browser probe reloaded Stage Clear twice and Victory twice with exact saved calculations and no browser errors. Complete artifact/education suites passed separately, including Shop purchase and offline flow. The neutral-pointer fixture change prevents intentional card hover lift from distorting row measurements.

Structured evidence: `docs/verification/artifact-richtext-2-6-0.json`. Screenshots were inspected for the desktop Master, phone layout, inventory calculation and Shop UWHD.

## Retained boundaries

The original 120-question bank and no-repeat exposure history remain in use. Claim still requires answering the saved question before acquisition and progression. No balancing or new card mechanics are introduced. Of the 31 catalogue entries, the existing 29 eligible artifacts remain obtainable; Initiate’s Ring and Chain Weaver’s Spool need Passive/card-driven Discard mechanics that this game does not yet have. They retain their supplied descriptions and forward-compatible hooks. Historical values from before this update are not invented for old saves, and events older than the latest 64 are not retained.

## Update the existing Windows folder

```powershell
cd "C:\Users\ijmah\Desktop\slay-the-math-v2"
git pull --ff-only origin main
npm.cmd run build
```

Reload the game with Ctrl+F5. If its local server is stopped, run `npm.cmd start` and open http://localhost:4173.
