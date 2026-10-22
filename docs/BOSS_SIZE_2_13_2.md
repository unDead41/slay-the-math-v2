# Boss size correction — 2.13.2

22 October 2026 (Malaysia). References: image(20261022-063153).png (boss) and image(20261022-063228).png (normal encounter).

## Cause and correction

Both bosses inherited the ordinary-enemy host figureScale 0.9. Their different source padding and draw matrix made the visible idle silhouettes only about 82% of Alyssa’s height on desktop. Configure figureScale 1.1 for sentinel/Twin Sigil Guardian and dealer/Deck Lord in the existing animation registry and its importer. Keep drawScale 1.65 and the original source/floor pivots.

Phones use a 58vw cap for the two boss hosts. Between 601 and 1050px, shift the host left only when the widest authored VFX needs more room; do not shrink the boss or change its ground line. The same host displays animation, Motion Off and source posters.

Source atlases/posters, all 60 source cells, frame holds, direction, Alyssa, Normal/Elite actors, combat outcomes and save data are unchanged. The generated MAIN-SEKARANG.html is excluded from the source commit; rebuild after pulling.

## Executed verification

- Syntax checks and portable build passed.
- All 185 Node/DOM tests passed; zero failures or skips.
- Both bosses measured at 2048×1042, 1920×1080, 1280×720, 3440×1440, 3840×2160, 768×1024, 601×900, 600×900, 390×844 and 320×740. Visible idle height is approximately 99.5–100.6% of Alyssa’s, with less than one pixel of floor error.
- All 60 frames’ complete alpha bounds fit the registered canvas. All five actions’ projected VFX bounds fit the arena at the ten viewport sizes. No horizontal page overflow or gameplay mutation from presentation checks.
- Both Canvas-unavailable posters retain matching size and floor registration. Desktop, tablet and phone screenshots were visually inspected.
- Existing Shop/Boss browser suite passed, including all ten changing clips, resolved intent cycles, Motion Off and unavailable-Canvas/failed-atlas fallbacks.

- The final 227,221,147-byte portable HTML passed isolated Boss checks at desktop and phone sizes for both stages: matching size/floor, valid unchanged run, zero external requests and zero browser errors.

Machine-readable evidence: docs/verification/boss-size-2-13-2-browser.json, boss-size-2-13-2-shop-boss.json and boss-size-2-13-2-offline.json.

## Broader runner limitation

The unchanged integration-offline-browser.cjs was also attempted. It did not complete reliably: one run reached an injected Boss fixture with Continue disabled; another found zero Artifact HUD controls after the first generated map node. These failures are not counted as passes. The isolated valid Boss saves passed in the actual portable file; no engine/save change was made for this presentation fix.
