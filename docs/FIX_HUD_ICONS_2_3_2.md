# HUD and Rest icon correction 2.3.2

Ijamm identifies five issues in the supplied crops: small Energy artwork, a mismatched Focus design, a missing illustrated Predict icon, a small Health icon and an unchanged Rest icon. Inspection found two unmapped illustrated icons and size rules that reduced the supplied Energy/Health artwork.

| Area | Before | Current result |
|---|---|---|
| Energy | 40px artwork nested inside a second CSS circle | Full illustrated badge; 72px at FHD, 60–66px on smaller layouts |
| Focus | Earlier gold/ruby line target | Supplied cyan eye crystal, matching the atlas; same box size as Energy |
| Predict | 27px wireframe fallback | Separate painted divination sphere and three cards; 42px at FHD / 40px on phones |
| Health | 19px at FHD / 15px on phones | 30px at FHD / 24px on phones, for both fighters |
| Rest | Line-flame glyph on the healing choice | Existing supplied blue campfire seal, 68px desktop / 60px phone |

`DCVisuals.icons` owns all mappings. Rest references `mapIcons.camp`, preserving one source for the same seal. The Predict companion follows the existing double-gold frame and four diamond studs, while its orb/cards symbol stays distinct from Focus's eye crystal. Its original 1254×1254 RGBA PNG is retained without resampling. Prompt, reference/output hashes and alpha checks are in `dist/assets/hud-icons-2-3-2.json`. All other source artwork is retained.

The presentation continues to use the 2.3.1 screen-fit unit at larger CSS viewports. HP, Energy, Focus, card values, map progression and saves remain owned by the existing engine. Rest preview does not heal until Confirm Rest is clicked.

## Actual verification

| Check | Result |
|---|---|
| Updated combat regression against old UI | FAIL as expected: Focus still used icon-focus.svg |
| `npm run test:combat-browser` | PASS: decoded assets, HUD sizing, Focus spend, keyboard controls, Predict dialog, pile focus, Continue, two bosses; six viewports from 320px to 4K |
| Rest desktop/phone browser flow | PASS: supplied campfire seal, no page overflow, HP 38 before confirmation, HP 50 after confirmation, still 50 after reload |
| `npm run test:screen-fit` | PASS: seven viewports including QHD, ultrawide, 4K and simulated small browser zoom; floor contact preserved |
| `npm run check` | PASS |
| `npm run build` | PASS: portable HTML rebuilt with all five mappings and embedded Predict PNG |
| Strict UI contract audit | PASS: no findings |

Combat desktop and 320px phone screenshots, the generated icon and Rest desktop/phone screenshots were visually inspected. Measurements and functional checks are in `browser-hud-icons-2-3-2.json`. The unchanged mathematics/map suites were not repeated for this icon change. The installer has not been executed on Windows here; manifest integrity, supported-source hashes and reversible overlays are checked in the release's `PACKAGE-VALIDATION.json`.

## Existing-folder update

The hotfix supports installed 2.3.0 or 2.3.1 and includes the screen-fit correction. Run the extracted `APPLY-UPDATE.ps1` against `C:\Users\ijmah\Desktop\slay-the-math-v2`. It verifies affected files, preserves unknown local edits by stopping before replacement, creates a backup and rebuilds the portable HTML. The backup includes a hash-aware rollback script. It does not open another VS Code window or create another Desktop project.

After installing, refresh with Ctrl+F5 and use Continue. Browser Ctrl+0 restores 100% zoom if needed. The run does not require a reset.
