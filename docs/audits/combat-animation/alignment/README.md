# Body-placement evidence — 2.49.1-combat.1

Base main: d77b3e0ce87d573de89e84a9b2374df97ad625b9. Branch target: combat-animation.
The new runtime modifies only the compositor; 708 original current-main assets
and the other protected owners remain unchanged. See preservation.json.

Commands (configure installed QA dependencies and a Chromium executable):

```sh
node --test --test-concurrency=1 tests/live-vfx-renderer.test.cjs tests/live-vfx-ui.test.cjs tests/live-vfx.test.cjs tests/status-vfx.test.cjs tests/combat-persistence.test.cjs tests/animation.test.cjs tests/enemy-motion.test.cjs tests/boss-motion.test.cjs tests/texture-cache.test.cjs tests/asset-manifest.test.cjs tests/release-build.test.cjs
npm run check
npm run build:prod
QA_OUTPUT=/tmp/stm-vfx-placement npm run test:vfx-alignment-browser
QA_OUTPUT=/tmp/stm-vfx-continuity npm run test:combat-continuity-browser
QA_REPORT=/tmp/stm-alyssa.json npm run test:alyssa-browser
git diff --check
```

The native placement helper wraps real painters to observe their actual Canvas
matrix, compares it to independent source-body references, checks returned native
pixels/floor ownership and saved-state equality, and records actual screenshots.
It does not replace the game renderer with a mock. The three-passive setup uses
real engine activations. Negative unit records and the intermediate syntax error
are retained as compressed raw logs; only final successful checks count as PASS.

source-grid.jpg shows the actual frame-0 atlas projection and the old x800 pivot;
body axes are reviewed independently of extended weapons. The reference fixture
retains source image hashes. Main's earlier full-suite counts are not replayed or
relabeled here. Physical-device performance and human recognition remain separate.
