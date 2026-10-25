# Idle motion correction — 2.49.1

| Field | Reviewed record |
| --- | --- |
| Date | 25 October 2026, Asia/Kuala_Lumpur |
| Repository / target | unDead41/slay-the-math-v2 / main |
| Pinned main base | `d77b3e0ce87d573de89e84a9b2374df97ad625b9`, 2.49.0 |
| Base tree | `6d32f0d6aa606c4a26e1c472232a080ae700f066` |
| Isolated working branch | `fix/idle-registration`; fresh checkout, older dirty V5 checkout preserved |
| Authorization | Slow the Idle blink and correct reported Idle/action positioning; preceding same-feature direct-main publication authorization continues |
| Initial review | Current Master SOR 1.2.0, AGENTS, governance, MC/animation/design/QA/runtime owners and latest Alyssa/combat audits read before changes |
| Final scope | Confirmed Alyssa defects resolved; enemy position report remains unconfirmed, with the exact limits below |

## Initial findings and final actions

| ID / category | Priority / confidence | Evidence | Action |
| --- | --- | --- | --- |
| AM-004 / MASALAH DISAHKAN | P2 / high | V5's replacement Idle has its annotated rear boot at native x394.683, while the retained original root is x278.483. The common pivot therefore puts Idle 125.496 canvas px ahead of the accepted action root. Live game canvas geometry itself does not move. | RESOLVED: one fixed Idle-only source pivot `[284.17700037379564,532.8535294215567]` and matching poster. All 15 source cells, proportions and breathing offsets remain. The four action clips remain byte-identical as registry objects. |
| AM-005 / MASALAH DISAHKAN | P2 / high | Blink exposures total125ms and repeat every1575ms. This reproduces the reported fast/frequent blink. | RESOLVED: 85/110/85ms closing/closed/opening, 280ms total, on every second1730ms breathing loop:3460ms steady cadence. The intervening peak uses the original open-eye pose5. No rig, morph or new raster. Pause and unchanged configuration retain the clock. |
| AM-U01 / LAPORAN BELUM DIREPRODUKSI | P2 / medium | Ijamm also reports enemy Idle too far forward. Current first-frame contacts and native Knight game sampling show stable geometry; production preview checks all12 enemies/bosses across all four actions and exact pixel-identical Idle returns. These checks do not prove every enemy stance is subjectively correctly placed. The optional direction clarification received no answer. | OPEN clarification limit: retain accepted enemy art/pivots instead of assigning unsupported offsets. Hosted review exposes every enemy and five actions for precise follow-up. Do not claim an enemy offset was fixed. |
| AM-R04 / RISIKO BERPOTENSI | P2 / high | Atlas reimport or poster failure could restore the incorrect Idle registration or faster blink. | PREVENTED: the source-gated importer reproduces all19 outputs identically, records source versus effective holds, and produces the corrected Idle poster. Native Canvas-unavailable/failed-atlas fallbacks pass. |

[Registration measurements](idle-2.49.1/registration-summary.json) include actual
before/after game canvas and footprint measurements. [Before](idle-2.49.1/before-idle.jpg)
and [after](idle-2.49.1/after-idle.jpg) use the same native fixture/viewport.
The original [2.45.0 audit](2.45.0.md) remains history; its referenced import data
now describe the current reproducible importer result.

## Actual verification

- Baseline:23 motion/cache/enemy tests pass. Two new regressions fail against
  the original product for the expected root/blink defects, then pass after the
  change. [RED](idle-2.49.1/red-tests.log), [GREEN25/25](idle-2.49.1/green-tests.log).
- `npm test` executed the complete Node suite:1150 tests,1148 pass,2 fail,
  zero skipped. The failures are **balance loader isolates data and keeps player
  defaults unchanged** and **Spool does not mistake rejected Draw Pile candidates
  for hand discard**, both because this shallow checkout lacked historical
  commit `2800f9aeba5ed594e6ef3f991bcf4dfa498a5de7`. Fetch that exact commit;
  rerun `tests/balance-combat.test.cjs`:10/10 pass, including both failures.
  Only terminal trailing whitespace is normalized in committed logs; results and
  failure records are retained. This is1150 unique tests verified across the full run and targeted recovery,
  not a claim that the initial full command was green.
  [Full run log](idle-2.49.1/full-suite.log), [history fetch](idle-2.49.1/history-fetch.log),
  [recovery](idle-2.49.1/history-rerun.log). No product/test bypass resolves them.
- Final affected-boundary rerun:34/34 pass, zero skipped, covering motion,
  enemy/boss compatibility, retained UI, cache, manifest and release outputs.
  [Final targeted log](idle-2.49.1/final-targeted.log).
- `npm run check`, importer reproduction19/19, production and portable builds
  pass. [Build](idle-2.49.1/final-build.log), [reimport](idle-2.49.1/import-reproduction.json).
- [Actual production-game browser](idle-2.49.1/alyssa-browser.json): all75
  exposure slots /68 distinct source poses, real Attack/Defend/Skill and damaged/
  blocked reactions, exact independent engine/save/RNG outcomes, stable retained
  canvases, modal pause, Motion Off, reduced motion, both stages/bosses, actual
  no-Canvas/failed-atlas fallback and fresh portable offline playback pass.
  All75 alpha bounds fit seven phone/desktop/UWHD/4K viewports with fixed floor.
- [Production preview browser](idle-2.49.1/preview-native.json): observed eye
  closure times2540/6000ms give3460ms spacing; 20ms sampling measures280/300ms
  closure spans. Pause freezes pixels. All12 enemies/bosses keep canvas geometry
  and return to identical Idle0 pixels after each action. Desktop and phone
  review show no horizontal overflow. This verifies continuity, not universal
  visual acceptance of the enemy stance.
- Final production HTML uses all five existing motions with an enemy selector,
  pause and optional auto cycle. Preview-only layout applies fixed actor scale
  ratios. Its final style and added browser runner were checked natively after
  the full Node run; core game/player inputs did not change afterward.

The first exploratory preview harness failed because an unqualified action
selector matched the button and both canvas datasets. Qualifying it as a button
fixes the harness; both final native reports pass. No product failure is hidden
by this adjustment. The native player harness adopts current main's atomic
clock pause and waits through the sparse blink without dropping exposure order.

## Protected boundary and limits

All five approved atlas bytes, four action registry objects, all enemy/boss
registries/assets, game geometry/CSS,2.49 VFX/loader fixes, all98 tutorial images,
23 chapters/12 practice steps, numerical rules, save and RNG remain unchanged.
Only the Idle poster changes. Source manifest provenance remains immutable;
current import audit separately records effective presentation holds/pivot.
`data-source-frame` belongs to the retained actor canvas alongside its logical
frame. No new game-side timer, random generator or image editing is introduced.

CI-247-01 and QA-248-PRELOAD-01 remain inherited P2/open. Lost historical Passive
trigger order and physical-device performance/recognition limits remain with
their owners. No physical FPS or perfect-anatomy guarantee is made. This scope
does not repair or relabel those findings. Publication/deployment are verified
separately against the actual resulting main ref and Pages run.
