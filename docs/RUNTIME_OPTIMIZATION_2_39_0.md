# Runtime optimization — 2.39.0 candidate

Feature branch `fix/hosted-readiness-input` only. Includes current main `cb1bbcf688d9556b55bc8fe5522b5b652309640c` (2.38.0), including education reports, clearer bilingual hints and Settings-only Developer access. No main publication or GitHub Pages deployment. Main later advanced independently toade5d3a (also2.39.0); this feature candidate retains the testedcb1bbcf base. Latest-main icon/readiness integration still needs a combined check before release.

During the same encounter, combat keeps both actor canvases and animation controllers. A small keyed DOM reconciler changes HP, cards, status, labels and disabled controls. It retains card nodes by UID and avoids writing unchanged subtrees. Rendering still produces the same view model; this is not a rewrite of the engine or save policy. New runs/rooms, scene exit and explicit resource retry replace the actor owners. Motion, dialog and hidden-page policies remain active.

Verified resource bytes can now be reused in the same tab even when persistent browser cache is denied. The private immutable Blob cache retains at most 32MiB and returns a fresh Response to each consumer. Only complete, hash-verified responses enter it; LRU eviction prefers background entries. Each manager/manifest remains isolated. Closing/destroying the manager releases its retained data; this is not an offline-completeness claim.

Decoded textures use a 96 MiB estimated pixel budget (`naturalWidth × naturalHeight ×4`), replacing the old four-texture limit. Live actor current clips are protected; idle clips have preference over unrelated textures while the budget permits. Owner release makes unused images eligible for eviction. If live clips alone exceed the budget, they stay visible and `cacheStats().overBudgetBytes` reports the exception. These numbers exclude canvas, DOM, audio, other image consumers, decoder scratch space and GPU duplication.

| Controlled check | Before | After |
| --- | --- | --- |
| Same canvases retained across 30 unchanged-encounter Dev commands | 0/30 | 30/30 |
| Command p50 / p95, native Chromium 1366×768 | 6.4 / 9.6 ms | 4.4 / 7.8 ms |
| Frame-gap p95 in that sequence | 133.4 ms | 66.7 ms |
| One cache-denied prepare plus three reads, network / SHA checks | 4 / 4 | 1 / 1 |

The table uses two fresh runs of the identical final build: full DOM rebuild as a control, then persistent rendering. Both record identical runtime hashes. Initial pre-change samples are also retained in evidence. These small local timing samples are indicative, not a physical-device FPS guarantee. Independent engine comparisons verify that a real card action and End Turn preserve exact saved gameplay/RNG. The [branch audit](audits/hosted-readiness/LATEST.md) and [structured verification](verification/runtime-optimization-2-39-0/integration.json) record checks, review findings and limits.

Use `npm start` for the player or `npm run start:dev` for local development. Build production with `npm run build:prod`; serve `release-prod/` under the intended Pages subpath for a static preview. The existing Pages URL changes only after a separately authorized main release. No runtime dependency was added.
