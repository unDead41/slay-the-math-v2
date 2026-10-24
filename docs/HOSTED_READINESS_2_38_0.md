# Hosted resource readiness — 2.38.0 candidate

Feature branch `fix/hosted-readiness-input`, initially based on main `50d3af423cdc2240e949f4ddf29e023865304b65` (2.36.0), then integrated with current main `6376a222169815af582cf55aa4794f3c809a3515` (2.37.0 / Master SOR 1.2.0). Ijamm requests branch publication only.

Before the menu, the game prepares the core scripts, UI icons and first artwork with real progress and a 180-second recovery deadline. Enter Game activates audio through a genuine interaction. Sound can recover independently. The production manifest requires 13,904,970 bytes (13.3 MiB) before entry, out of 225,640,121 bytes of registered resources. Optional menu audio is a further 4,701,741 bytes and can finish independently. These are uncompressed file sizes, not measured network transfer. The 180-second budget covers download and image preparation; a slow connection gets Retry, never a false Ready.

The Practice renderer loads only when Practice opens and presents all 120 questions. The canonical question bank remains in the engine: actual selection depends on live exposures/session policy, and save validation uses the bank. This release does not split question payloads per seed.

After an actual run exists, background requests prioritize its frozen map actors, hero and shared cards/room resources before Boss assets. Four transfers are allowed, at most two background. Native map entry waits for necessary artwork before the existing engine commits the node. It does not reroll the map or a question. The existing atlas cache warms the first actor frame; later animation failures retain static presentation and never own combat resolution.

Downloads is available on the main menu, outside Practice/gameplay controls. It displays the current resource count/size and offers an explicit full download. Persisted bytes are checked by SHA-256, namespaced by project path and manifest contents. Unchanged files from an older project cache are reused only after checking the new expected hash. Displayed scene images, stylesheet backgrounds and actor atlases use the verified response bytes, including when a Service Worker or disk cache is unavailable. Quota denial falls back to online mode. A partial/incorrect build is not labelled ready. A mismatched resource list asks for Reload Game; active play is not forcibly reloaded. Private API responses, saves, feedback and collection data are excluded.

Native text/image drag is disabled for game presentation and Practice. Comments, searches, answer inputs, selection/copy fields, volume sliders, keyboard focus and touch scrolling retain their behavior. This does not provide copy protection.

## Local review

After fetching this branch, use `npm start` for player mode or `npm run start:prod` for production. The public Pages site remains on main until a later authorized merge and successful deployment. Browser cache may be evicted; full offline availability and physical-device behavior must not be inferred from cached-file counters.

## Validation

See the scoped [branch audit](audits/hosted-readiness/LATEST.md) for evidence, open limits and final test counts. Commands: `npm run check`, `npm run build:prod`, `npm test` with jsdom, and `node tests/hosted-readiness-browser.cjs` with the existing Playwright QA dependency. No game runtime npm dependency is introduced.

Run the additional native regressions with `node tests/readiness-recovery-browser.cjs` and `node tests/readiness-build-browser.cjs`. Production Developer Hub coverage remains in `tests/production-dev-browser.cjs`. QA dependencies (jsdom/Playwright) are supplied externally through the existing environment overrides; no new production package is required.
