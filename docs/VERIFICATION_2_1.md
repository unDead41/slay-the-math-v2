# Verification — Dungeon Edition 2.1

## Automated evidence

- `npm run check`: runtime JavaScript syntax validation.
- `DOM_QA_MODULE=<installed jsdom> npm test`: 60 tests passed, zero failures or skips.
  Includes exact Probability evaluation, turn/save invariants, original routes,
  Gold/shop behavior, new ten-level quotas, snapshot restoration, DOM controls,
  portable output and complete campaigns.
- New ten-level Learn campaigns for seeds 7, 42 and 81 each defeated both bosses
  through actual engine actions. These bounded strategies do not establish a
  population win rate or overall game balance.
- `npm --prefix modules/map test`: 7 tests passed. Includes all original 50 seed
  snapshots and all 200 supplied maps through CommonJS, ESM and browser-global APIs.
- `npm --prefix modules/map run validate`: 100 seeds, 200 unique layouts, all 12
  PNG hashes and all four map SOR files validated.
- `npm run build`: rebuilt the optional embedded offline game from current source.
- Frontend strict static audit: zero findings. Static evidence does not prove runtime UX.

## Runtime browser check

The optional project-owned `tests/browser-smoke.cjs` exercises real Chromium through
Playwright: source menu composition, image decoding, ten-level node selection and
Continue, Ember Mirror poses, Predict error/correction, collection search, dialogs,
keyboard controls and 390px reflow. The test launches its own local server.
Final browser result: **PASS**, seven behavior groups, no page errors or failed
asset requests. Desktop: 1920×1080; narrow viewport: 390×844. Screenshot inspection
confirmed the main menu, node artwork, combat and narrow layouts. The suite checks
that positional map transforms survive clicking, previews retain scroll, all four
Ember action images switch correctly, Motion Off persists and the page has no
horizontal overflow at 390px. Browser screenshots remain internal QA evidence.

`designmd lint DESIGN.md`: zero errors, zero warnings. The strict frontend static
audit also completed with zero findings. These checks supplement the runtime suite.

## Practical limits

No physical Windows, Android or iOS device was available. PowerShell installer
execution and listening to every soundtrack loop were not part of this visual/map
change. Supplied PNG/source hashes and mechanical crop checks are separate from
human art review. The browser and unit suites are separate evidence.
