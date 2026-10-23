# Alyssa RPG status effects — 2.28.0

Ijamm requests visible RPG-style buff/shield/stat-up/down effects around Alyssa. The change was initially developed from main `b67298b` / 2.26.0, then integrated onto newly published main `e2c323a` / Master balancing 2.27.0. It retains the balance playtest, learning analytics, combat card motion and original selected card/artifact artwork. Moderate intensity is a reversible implementation default. The later Pages workflow/documentation update `b848f55` is also preserved; all 682 tested runtime files remain byte-identical after that rebase.

| Actual condition | Persistent effect | New-event feedback |
| --- | --- | --- |
| Block above zero | Translucent cyan/gold runic shield | Shield formation on gain; impact from actual enemy Block absorption; soft expiry dissolve |
| Positive Strength | Warm ember ground arc and three rising embers | Warm upward burst and actual signed Strength change |
| Positive Agility | Two gold motion arcs | Gold upward burst and actual signed Agility change |
| Positive Defense | Gold floor rune ring and side wards | Protective rune burst and actual signed Defense change |
| Thorns | Warm spiked ground ring | Actual gain burst; expiry dissolve |
| Weak / Vulnerable on Alyssa | Muted violet descending marks / crimson fractured arcs | Application marks and actual stack reductions/removal |
| Negative Strength / Agility | Muted downward aura | Actual stat delta; no fabricated positive buff |

Queued Block, retention caps and future Draw remain the existing queued status badges. They do not create an active shield or new grant before the engine gives it. Enemy-only Weak/Vulnerable do not decorate Alyssa. This adds presentation for existing valid states, not new ways to apply debuffs or new combat mechanics.

## Owners and lifecycle

`dist/status-vfx.js` projects `DCCombatStatus.view(run,'player')`, captures only an ephemeral pre-command snapshot and reads new `enemy-turn` receipts. It adds no run/save fields and does not consume random numbers. The existing action wrapper resolves, renders and saves before requesting effects. A next-frame generation guard lets a confirmed native Passive replacement close before showing its actual stat reduction; an open dialog, later action or scene change cancels that presentation.

Decorative SVG/CSS layers use the original hero's floor/canvas host. Native actor poses, source images, card/artifact/status icons and gameplay definitions remain unchanged. Each action displays at most four transient groups, with no random particles, screen shake, full-screen flash or new image dependencies. Floating labels use actual signed deltas and English/BM names. The old defend-number shortcut is suppressed so an absorbed attack is not mislabeled as newly gained Block.

Continue, reload and ordinary render restore current auras silently. Game Motion Off, OS reduced motion, native dialogs, hidden/pagehide, next commands, render/navigation, scene exit and destruction remove effects. Resize cancels bursts while the floor-registered current aura adapts to its existing actor host. Failed effects never block gameplay. Existing status buttons, counts, detail dialogs and combat logs remain the accessible sources.

## Sound selection

Ijamm will source clips later. [Search guide](ALYSSA_STATUS_SFX_GUIDE.md) lists proposed sounds, keywords, durations and filenames for card movement, shields, stat gains/losses, debuffs and Passive triggers. No new audio files are imported by this feature; current Sound FX controls and supplied music/voices retain their owners.

## Verification

Actual final results are recorded in `docs/verification/alyssa-status-vfx-2-28-0.json`, with the native production/standalone report alongside it. Focused cases cover actual Passive gains and confirmed removal, actual Block absorption despite same-value refill, ordinary expiry, player-versus-enemy debuffs, pending grants, immutable save/RNG, late completion and UI lifecycle. Browser checks use real saved engine fixtures, compare actual gameplay results to an independent engine clone, inspect desktop/phone/landscape rendering and exercise all three Master profiles with their isolated saves and bound definitions.

Physical-device playback and Ijamm's judgment of motion feel are not claimed by automated checks. MODEL.zip was unavailable and is not imported.
