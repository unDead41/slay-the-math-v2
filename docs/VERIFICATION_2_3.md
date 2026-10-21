# Verification — Dungeon Edition 2.3

19 October 2026 (Malaysia). Results below are executed checks, not inferred from
the source. Browser checks ran in headless Chromium 138 through the project QA
scripts. The connected external and cloud browser sessions could not reach the
workspace localhost server; they were not used as proof of successful rendering.

| Check | Actual result |
|---|---|
| npm run check | Pass: runtime JavaScript syntax |
| npm run build | Pass: portable HTML, with five backgrounds, source sprites and music embedded |
| npm test, with jsdom available | 60 passed, 0 failed, 0 skipped; includes portable boot, real gameplay, exact save/Continue and Predict |
| npm run test:maps | 7 passed; validator checked 100 seeds, 200 maps, source PNG hashes and four map SOR files |
| npm run test:browser | 7 browser groups passed, no page/asset errors; actual menu/map, pose changes, Predict, collection and narrow UI |
| npm run test:dungeon-browser | 6 browser groups passed, no page/asset errors; five artwork choices, stationary live controls, disabled Continue, dialogs/focus, five viewport sizes, all 12 enemies and all six arenas, actual pose changes and autoplay/reduced motion |
| Asset validation | All 111 runtime WebP files decoded successfully; original source hashes and frame pivots recorded |
| Static UI audit | Strict audit: 0 errors, 0 warnings, 0 unresolved findings |

Browser viewport sizes: 1920×1080, 1280×720, 844×390, 390×844 and 320×740.
New grounding checks verify the arena is actually visible, sprite canvas
dimensions are correct, each displayed foot pivot aligns with its contact shadow
within 1.2 CSS px, and the contact point lies below the source wall/floor boundary
and above the status-panel edge. Dedicated grounded and flying actor cases are
both checked. Real Attack/Block/End Turn actions exercise the five supplied pose
sets. Utility controls and the hand remain separate from the floor coordinate
space. Screenshots were visually inspected for the large menu, normal/elite
arenas and phone layout; screenshots are internal QA, not source artwork.

Autoplay is tested with a virtual browser clock: enabled cycling, Motion Off,
OS reduced motion and dialog pause. Manual scene changes verify decoded artwork
and unchanged menu control bounds. Existing keyboard, modal recovery, Focus,
math correction, save and route tests continue to cover gameplay behavior.

Platform limits: the Windows PowerShell installer and rollback were not executed
on Windows in this Linux environment. Packaging verifies manifest hashes and
simulates the listed file replacements against the supplied 2.0 and delivered
2.1/2.2 baselines. PowerShell retains the existing reviewed in-place backup,
drift checks, correct-folder server marker and rollback implementation. A source
key-pose sheet is not described as a full frame-by-frame animation. Prior MC
action cutouts and Stage 2/boss models remain from the earlier supplied sources.
