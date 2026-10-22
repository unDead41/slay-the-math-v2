# Room UI correction — 2.13.1

User instruction: 22 October 2026 (Malaysia). References:
image(20261022-053117).png (Mystery), image(20261022-053219).png
(Shop), and image(20261022-053417).png (approved Rest).

## Result

- Mystery uses its existing supplied scene as the complete background, following
  the Dungeon Master's live HUD/right-panel composition. Phones show a scene
  banner before the naturally scrolling content.
- Shop has **Buy Cards**, **Buy Artifacts** and **Remove Card** tabs. Only one
  panel is exposed; each stock retains its 3×2 rack and actual prices. Native
  arrows, Home/End, focus rings and local narrow stock scrolling remain usable.
- Intro, review and reward rules have green game-term help and purple
  cost/reward previews from the current snapshot. The existing question renderer
  still owns pink math terms, Hint/Basics, worked steps and final calculations.

The source scene images, Rest composition, question/answer data, timers, offer
RNG, combat and reward transactions retain their existing owners. Reading help
cannot start a question, change an answer, pause a deadline, consume resources
or create a resolved calculation entry. A preview identifies its origin; actual
outcomes alone enter the engine's calculation history.

HP preview arithmetic includes nonlethal failure damage, capped healing and the
current-HP clamp after a Max HP trade. Requested draws remain requests subject to
the hand cap. Question-bank definitions that refer to a teaching pool are not
reused as definitions of the player's real deck.

Tab selection survives purchases and menu/Continue within the same visit.
Reload opens Cards and retains the existing Sold and removal-used state. Legacy
visits keep their original inventory and disable unavailable services. Removal
still selects a physical card, shows its cost, and requires confirmation.

## Verification

Focused regression tests reproduce the missing tabs and missing intro rich text
before the fixes. Runtime/browser evidence is recorded in
docs/verification/room-ui-2-13-1-browser.json; it covers 2048×1038, 1920×1080,
1280×720, 3440×1440, 3840×2160, 390×844 and 320×740.

Release checks and exact generated-file metadata are in
docs/verification/room-ui-2-13-1-release.json.

    npm run check
    npm run build
    npm test
    npm run test:room-ui-browser
    npm run test:mystery-browser
    npm run test:mystery-offline
    npm run test:shop-boss-browser
    npm run test:situations-browser

DOM/browser QA uses the project's existing external jsdom/Playwright setup. The
game itself has no new package dependency. MAIN-SEKARANG.html is generated and
is not part of the source commit. Rebuild it after pulling:

    git pull --ff-only origin main
    npm.cmd run build
    npm.cmd start
