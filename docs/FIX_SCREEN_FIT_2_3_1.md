# Screen fit hotfix 2.3.1

The user's `image(20261018-181322).png` shows a narrow combat area with small controls and large empty margins. The 2.3 stylesheet capped the game width at 2048 CSS pixels and the arena height at 650 CSS pixels. The same appearance was reproduced at a 3413×1708 CSS viewport, captured at device scale 0.6: combat used only 60% of the available width. This matches the screenshot but does not establish the user's actual browser zoom or display settings.

## Implementation

- Remove the combat width cap. A shared `--combat-unit` scales arena spacing, sprites' contact offsets, cards, text and controls with the available desktop width and height. Its lower bound is 1px, preserving the existing narrow-screen layouts and natural scrolling.
- Keep all arena art proportional. Centre cover cropping on the supplied arenas' 68% floor horizon, keeping the shared ground line below that horizon on narrow and ultrawide screens.
- Keep the 1600×1200 sprite canvas and (800,1100) foot pivot. Contact shadows use the same coordinates at every supported scale.
- Update only presentation, its regression checks and release documentation. No new assets, dependencies, engine values, map changes or save migration.

## Checks actually run

| Check | Result |
|---|---|
| Regression before the fix | FAIL as expected: combat width 60% at 3413px |
| `npm run test:screen-fit` in headless Chromium | PASS: 3413×1708 at 0.6 DPR, 2560×1440, 3440×1440, 3840×2160, 1920×1080, 1280×720, 390×844 |
| `npm run test:dungeon-browser` in headless Chromium | PASS: five menu scenes/actions, five viewport sizes including 320px, all twelve enemies, six arenas and five supplied pose sets |
| `npm run test:combat-browser` in headless Chromium | PASS: actions, card preview, Predict, Focus, pile focus restoration, Continue and responsive layouts |
| `npm run check` | PASS |
| `npm run build` | PASS: portable HTML regenerated with the updated CSS |

Measured screen-fit geometry is in `browser-screen-fit-2-3-1.json`. Reduced motion was used for stable measurements. Screenshots of the reproduced issue, the repaired simulated small-zoom case and 4K were visually inspected. Mobile intentionally scrolls vertically; only the hand scrolls horizontally. This CSS patch did not rerun the unchanged mathematics/map suites. Windows PowerShell execution was not available here; package integrity and reversible manifest overlays are checked separately in `PACKAGE-VALIDATION.json` in the release ZIP.

## Install in the existing project

Start with Ctrl+0 in the browser to reset its zoom to 100%, followed by Ctrl+F5. The hotfix also supports larger CSS viewports; it does not require a new run.

Extract the hotfix ZIP and run its `APPLY-UPDATE.ps1`, targeting the existing `C:\Users\ijmah\Desktop\slay-the-math-v2`. Version 2.3.0 is required. The installer verifies affected files, backs them up, updates in place and rebuilds `MAIN-SEKARANG.html`. It refuses to overwrite unrecognised local edits. It never opens another VS Code window. The backup contains `ROLLBACK-UPDATE.ps1`; stop the server before running rollback.
