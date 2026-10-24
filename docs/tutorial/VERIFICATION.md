# Tutorial verification

Base: `d76ad6e26ada3b3aea98db0b4d0462f3f6f026a4` (main 2.30.0). Feature: `tutorial` / 2.31.0.

## Completed focused checks

- Fourteen focused Node/jsdom tests passed after observed failing tests for the missing controller/view, support-after-completion and initial BM language. Tests use the actual engine/evaluator, not a replacement rule system.
- All eleven practical chapters completed in ordinary mode and with each loaded Master profile; examples remain accepted by the actual engine validator.
- Actual Chromium completed all seventeen chapters and all practical actions, decoded every referenced screenshot, resumed completion after reload, switched to BM, enlarged an image, and restored focus on Escape.
- 1440×1000 desktop, 390×844 portrait and 844×390 landscape layouts were visually inspected. Tests check dialog bounds, reachable footer, no page overflow, real Predict interaction and vertically stacked desktop chapter links.
- Browser localStorage snapshots excluding the tutorial key remained byte-identical after the course, BM selection, close and reopen. Storage-denied browser practice remained usable with a visible notice.
- Sixteen scene screenshots were captured from actual game UI and optimized to WebP. Asset hashes and fixtures are in `screenshots.json`.

## Release checks

- `npm test` with external jsdom configured: **772/772 pass**, **0 failures, 0 skips**, exit 0. The superseded four-page tutorial DOM test was migrated to the same host-save assertion using the real bank-based tutorial question, then the entire suite reran green.
- `npm run check`, `npm run build:prod` and the portable generation pass. The production directory contains all tutorial scripts/styles/images; the root file entries load the same versioned runtime.
- Production + portable tutorial Chromium run: **10 check groups**, **0 page/resource errors**. All 17 chapters and 11 practice chapters complete. Every screenshot decodes; the standalone file embeds all of them and completes a card lesson without HTTP requests.
- Viewports: 1440×1000, 390×844, 844×390, 667×375, 740×360 and 568×320. The last three assert at least 80 CSS px of actual article content, no footer overlap, and successful canonical Predict interaction.
- Existing card-motion browser suite: **8 groups**, **all 10 Passives**, 3 viewports, **0 errors**. Its first single-process QA Chromium run timed out after a Continue click; the same unchanged test passed using multi-process Chromium/disabled GPU, without product changes.
- Existing Alyssa status-VFX browser suite: **10 groups**, all three Master profiles, 3 viewports and actual standalone output, **0 errors or offline requests**.
- All **606 pre-existing asset files**, engine/config/card/question/education/artifact/audio/animation modules and supplier modules remain unchanged against the base. The 16 new screenshot hashes match the manifest (2,098,366 bytes total).

## Independent review and final fix

A fresh reviewer independently reviewed `d76ad6e..1303680` and ran all 14 focused tutorial tests successfully. It found no Critical/Minor issues and one Important issue: short landscape below 821px left the article with padding but no readable area. No behavior was declined as out of scope.

The actual-browser regression was expanded to 667×375, 740×360 and 568×320 and observed failing on article readability. A compact short-landscape layout now uses a vertical chapter rail, a smaller header and a single-row footer. The production/portable rerun passed all 10 groups, including real question completion at every size. This was the single final-review fix pass; the full project suite subsequently completed green. No material finding remains open.

## QA environment

Node 24, Playwright with Chromium 153, jsdom 26. QA packages are outside the repository; the player build adds no dependency. A shallow checkout also fetched the existing pinned `2800f9a` object needed by old balance comparison tests. The first unconfigured baseline attempt failed because jsdom and that object were unavailable; those environment inputs were supplied before the complete configured run.

No live Google collection, owner deployment, real pupil trial or physical-device claim is made.
