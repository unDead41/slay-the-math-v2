# Direct Map Update 2.4.2

The latest user references remove the Selected Path area and request immediate map-icon entry. The approved entity artwork is also requested as a full 4K image.

## Result

- The entire Selected Path, secondary Enter Room, Current level and bottom sidebar hint area is removed. The left rail contains the six-category legend only.
- Each available map icon is the actual native entry button. One click, Enter or Space calls the existing engine entry for that exact node. Focus alone does not navigate; disabled rooms remain inert. A successful entry focuses the new scene and resets page scrolling.
- Encounter names/portraits remain hidden until entry. The existing wide atlas, ample level gaps, two-axis scrolling, legal edges, frozen saved topology and game effects retain their owners.
- The exact approved artwork is supplied as `ARTWORK/Dungeon_Master_4K.png` in the ZIP. It is a **3840×2160 PNG**, exported from the pixel-identical uploaded 1672×941 source. This is a Lanczos upscale, not native 4K generation. The game already uses the matching 3840×2160 WebP. No redraw was made.
- The separate PNG is outside the installer payload, so it does not duplicate a large asset in the portable game. Its source/PNG/runtime hashes are recorded in `dist/assets/dungeon-master-png-2-4-2.json` and ARTWORK/PROVENANCE.json.

## Actual checks

| Verification | Result |
|---|---|
| UI/portable DOM suite | PASS: 17 tests, 0 failures/skips; direct exact-node entry, missing panel, disabled-room safety, duplicate old-node activation, save and embedded assets |
| Journey browser | PASS: six sizes through 3840×2160, left legend, no horizontal page overflow, scroll, hidden encounter identity and direct entry with pointer/Enter |
| All six room types | PASS: Battle, Elite, Rest, Shop, Mystery and Boss enter their correct scenes through map icons |
| Saved routes | PASS: current travelled path/disconnected locks and legacy five-level route retained |
| Existing main browser | PASS: seven groups for menu, motion, direct map/save, source poses, Predict, Collection and phone behavior |
| Actual portable HTML | PASS: unchanged file:// deliverable, decoded 4K artwork, artifact claim and direct map entry, zero HTTP requests |
| PNG export | PASS: full decode, exact 3840×2160 and SHA-256 |
| Syntax/build | PASS |
| DESIGN.md lint | PASS: 0 errors/warnings |
| Strict UI audit | PASS: 0 findings |
| Engine/config/math/map/generator/artifact data/effects/audio/visual registry/AGENTS | Byte-identical to 2.4.1 |

Desktop and phone map captures were visually inspected. Browser evidence: `browser-direct-map-2-4-2.json` and `browser-direct-map-regression-2-4-2.json`. Space uses the native button behavior; browser scenarios explicitly exercise pointer and Enter.

## Install and limits

The cumulative installer supports 2.3.0, 2.3.1, 2.3.2, 2.4.0 and 2.4.1, with reapplication to 2.4.2. It updates the existing Windows project in place with source/target hash checks, backup and rollback; it rebuilds MAIN-SEKARANG.html. Unknown edits stop replacement. No new Desktop project or VS Code window is created.

After installation, refresh with Ctrl+F5, use Continue and click a glowing map icon. New Run → Challenge shows the entity scene. Windows PowerShell itself was not executed here; source-hash, overlay/idempotence/rollback and ZIP checks are recorded in PACKAGE-VALIDATION.json. The prior artifact rules and two unavailable card-dependent artifacts are unchanged.
