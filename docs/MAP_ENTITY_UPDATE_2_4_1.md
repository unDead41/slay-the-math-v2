# Map & Entity Update 2.4.1

The four current user references request a neater map, a left legend, concealed encounters, wider scrollable level spacing and a non-human Dungeon Master. This update changes those presentation owners while preserving the underlying game.

## Current behavior

- The map fills the available width, with a quiet legend/action rail at the left and parchment atlas beside it. All six supplied category seals remain.
- The selected-room enemy portrait, name, enemy statistics and alternative name-bearing path buttons are removed. Nodes expose only level, category, legal state and links. No identity-bearing title or accessible label remains. The actual enemy is revealed after Enter Room.
- Current ten-level atlas height is 2700 map units, about 248 units between level centres; legacy five-level height is 1450 units. A map-only responsive unit scales from 1px to 2px. The atlas scrolls independently and opens near the next available row.
- Selection preserves both scroll axes, keyboard focus and uncommitted game state. Current level recovers the chosen gate. The original engine still validates the exact node on entry.
- The left legend stays left on phones. A minimum 460px atlas width preserves five-path readability; horizontal panning belongs to the atlas alone. Short screens retain document scrolling for reachable controls. Laptop/desktop map framing fits the window.
- Dungeon Master is now an unidentifiable dark rift with floating broken rune arcs, without a human face or anatomy. Alyssa, altar, dungeon palette and the same live artifact choices remain.

## Artwork resolution and provenance

Runtime `dist/assets/dungeon-master.webp` is **3840×2160**. The built-in image generation/edit tool returned **1672×941** even after a resolution-specific follow-up. The runtime file is a mechanical Lanczos upscale with WebP quality 95, not native-4K generated detail. Exact prompts, dimensions and source/runtime hashes are in `dist/assets/dungeon-master-entity-2-4-1.json`. The old artwork provenance is retained in `dungeon-master-art.json`.

## Actual verification

| Check | Result |
|---|---|
| Changed UI and portable DOM suite | PASS: 17 tests, 0 failures/skips; includes map legality, hidden identities, selection, save restoration and real embedded asset checks |
| Journey browser workflow | PASS: six sizes 1920×1080, 1280×720, 844×390, 390×844, 320×740, 3840×2160; left legend, decoded seals, spacing, real scroll, no page overflow, keyboard, exact selected entry and Continue |
| Saved legacy route | PASS: original five-level topology retained |
| Existing main browser regression | PASS: seven groups covering menu, motion, map, source poses, Predict recovery, Collection and phone behavior |
| Unmodified portable HTML in Chromium | PASS: file://, decoded 3840×2160 artwork, artifact claim and scrollable map, zero HTTP requests |
| Syntax and portable build | PASS |
| Strict premium UI audit | PASS: 0 findings |
| DESIGN.md lint | PASS: 0 errors, 0 warnings |
| Core preservation | PASS: byte hashes of engine/config/math/map/generator/artifact effects/data/audio/visual registry and AGENTS match 2.4.0 |

Desktop, laptop, phone and Master captures were visually inspected. Browser evidence: `browser-journey-2-4-1.json` and `browser-journey-regression-2-4-1.json`. This is not a new balance study; the original 2.4 effects, including two card-dependent artifacts excluded from offers, remain unchanged.

## Installation and limits

Use the extracted update against the existing `C:\Users\ijmah\Desktop\slay-the-math-v2`. The cumulative installer accepts 2.3.0, 2.3.1, 2.3.2 and 2.4.0, with safe reapplication to 2.4.1. It validates affected source/target files, backs up, updates in place and rebuilds MAIN-SEKARANG.html. It stops before replacing unknown local edits. It creates no new Desktop project and opens no VS Code window.

**Continue** shows the updated map on an existing run. **New Run → Challenge** shows the entity artwork before selecting the Starting artifact. Windows PowerShell execution was not available here; integrity and reversible overlay/idempotence/rollback simulations are recorded in the ZIP's PACKAGE-VALIDATION.json.
