# Live combat VFX — 2.44.0

Ijamm requests applying all completed VFX to the actual game after publishing the V10 preview on main. This installs the reviewed Shield V3, Passive V10 and stat/barrier V9 painters in combat. Earlier preview-only boundaries remain historical. The prior main-publication instruction continues for this completed combat update; no hosted Site deployment is involved.

## Runtime behaviour

| Effect | Actual source and presentation |
| --- | --- |
| Block / Shield | Current Block, committed absorption receipts, gain, active, hit, depletion/break and ordinary expiry. Increasing existing Block gives a sheen without removing the existing material. A positive replacement shield stays visible. |
| Ten Passives | Equipped cards that actually triggered, in first-trigger receipt order. One, two or three share the approved circle base; each retains its own V10 ornament. Removing a Passive compacts the remaining layers smoothly. |
| Strength / Agility / Defense | Actual signed status values, red / green / blue identity, ordered rings and directional ember / wind / crystal particles. Fixed attribute lanes prevent vertical particle overlap. |
| Thorns | Actual Thorns value and retaliation receipt. Brown spikes burst radially on hit, followed by retraction/dissolve on expiry. A same-action hit and expiry play sequentially. |
| Weak | Actual affected actor's duration. Purple-black open chains, formation, active and detached-link expiry. |
| Vulnerable | Actual affected actor's duration. Red-black coils and electricity, formation, active and unwinding expiry. |

The player and enemy share the compositor. The enemy currently exposes Defense, Block, Weak and Vulnerable through the existing status owner. This update does not grant enemies Strength, Agility, Thorns or Passives. Hypothetical three-stat enemy layouts are renderer tests, not new enemy mechanics.

Only Passive owns the projected floor. Body effects use a separate masked buffer that becomes transparent above the feet; the original ground shadow remains original artwork/UI. Front and back canvases surround each unchanged actor canvas. Original card, artifact, UI/status icons, character assets, animations and their source floor registration remain unchanged.

## Ownership and performance

- `status-vfx.js` projects canonical `DCCombatStatus`, actual combat logs and damage receipts. The existing labels, bilingual status explanations and single-action SFX ownership are retained.
- `combat-vfx.js` owns only presentation. It reads snapshots; it cannot change combat, save values, RNG, rewards, card zones or input legality. The three new field modules are byte-identical to the approved editable preview painters.
- Stable canvases survive incremental HP/card/language rerenders. Clock and layer order persist; Continue mounts current effects without replaying historical one-shots. Scene changes and rollback reset the compositor.
- Motion Off, OS reduced motion, dialogs, hidden tabs and pagehide stop rendering. No active/fading effects means no further VFX RAF. A browser without Canvas 2D retains the existing status badges/labels and suppresses the old decorative SVG floor effects.
- Full buffers use approximately 0.8 megapixels per canvas; Low approximately 0.4. DPR is bounded. Crowding counts fading effects too. Sustained draw cost above the budget selects Low after twelve warmup frames. Inactive aura fields release texture caches. These are implementation budgets, not measured physical-device FPS claims.

The log is bounded to eighty entries. If a fresh Continue no longer contains a first-trigger receipt, existing engine trigger counters restore that Passive's presence. Missing older first triggers are ordered before the surviving receipts, with activation turn and equipped order as deterministic ties. Exact historical ordering between multiple already-trimmed triggers cannot be recovered from the existing save schema. The live session retains its observed order; no save migration or invented triggers are added.

## Validation and reproduction

See [current audit and exact evidence](audits/combat-animation/LATEST.md). Tests exercise actual triggers for all ten Passives, independent engine/save equality through a native DOM card action, player/enemy status ownership, absorbed/depleted/expired Shield distinctions, lifecycle queues, particle lanes, render retention and cancellation.

Build with `npm run build:prod`, then run with `npm run start:prod`. The game should show **2.44.0**. The portable build and hashed production resource list include the same VFX modules.

For local rendering QA only:

```sh
node tools/qa/build-live-vfx.cjs /absolute/qa-output release-prod
```

This writes a fixture launcher and a test shell alongside a copy of the production files. Fourteen saves are validated by the actual engine; ten use actual Passive trigger actions. The body-only case explicitly seeds loadable statuses for coverage. The shell uses unchanged game modules/styles and omits the resource bootstrap: the managed HTTP QA host lacks secure-context Web Crypto. It is never part of production `dist`, the production build or the portable game. Normal localhost and HTTPS resource loading retain their existing owner and checks.

Native browser QA is scoped to this runtime module harness, not an end-to-end production download/cache/offline certification. Physical phones, Windows hardware FPS and final user recognition of all ten motifs at gameplay scale remain unverified. MODEL.zip was unavailable and was not used.

To return to the previous release, revert this integration commit and rebuild; no save-schema migration is required.
