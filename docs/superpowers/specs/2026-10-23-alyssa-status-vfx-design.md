# Alyssa RPG status effects

Ijamm requests visible RPG-style buff, shield and stat-up/down effects around Alyssa. The implementation starts from main `b67298b` / 2.26.0 and is subsequently integrated onto main `e2c323a` / 2.27.0 as release 2.28.0, retaining Master balancing, education analytics and the restored original card/artifact illustrations.

## Presentation choice

Use moderate effects as an implementation default: subtle persistent auras and short bursts on actual changes. Trigger-only and brighter continuous effects were considered; the moderate option keeps active conditions visible while leaving arena controls and cards readable. No preference response was supplied; this choice is not recorded as user approval of a particular intensity.

## Behavior

- Positive Block: translucent runic shield in front of the body, an expanding shield on gain, and a brief impact when an enemy-turn receipt reports actual Block absorption. Block expiry fades; it must not fabricate an absorbed hit.
- Strength: warm ember aura, rising embers on gain, downward particles on reduction. Agility: gold motion arcs. Defense: a gold protective rune ring distinct from spendable Block.
- Thorns: a short-lived warm spiked ring matching the actual active status. Weak/Vulnerable: distinct muted violet/crimson sigils and descending marks when applied; removing a debuff uses a clean outward dissolve.
- Floating stat labels use the actual signed delta and current English/BM labels. Queued grants remain queued badges and do not show an active shield before Block exists.
- Continued saves and ordinary rerenders display current auras without replaying historical gain/impact bursts. Enemy status changes do not add an Alyssa debuff.

## Ownership and limits

Add an independent read-only `status-vfx.js`/CSS presentation owner. It projects `DCCombatStatus.view` and newly committed `enemy-turn` log receipts. The existing `act` wrapper captures before the synchronous command, renders/saves the result and then requests short effects. Static auras mount on the existing hero canvas host, so the source art, grounding and right-facing atlas remain intact. No image bytes, gameplay values, RNG, save fields, analytics or audio are changed.

The decorative host is inert, aria-hidden and pointer-transparent, clipped to the actor/arena region below HUD/dialog controls. Keep particles bounded and deterministic. Motion Off, OS reduced motion, dialogs, hidden/pagehide, next action, rerender, scene exit and destruction cancel/pause presentation with no late ghosts. No animation owns a cost, trigger or turn.

## Acceptance

Use actual engine fixtures to check stat gains, passive swap reductions, Block gain and enemy absorption, active thorns, debuff gain/clear and queued-versus-active effects. Check unchanged save/RNG, failed commands, Continue/reload, rapid actions, native dialogs, settings, hidden pages and desktop/phone/landscape geometry. Inspect production and actual standalone offline rendering, preserve the existing card-motion and original-icon regression checks, and record actual test results.
