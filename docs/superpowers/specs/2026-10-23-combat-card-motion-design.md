# Combat card motion

Ijamm requests visible Draw, Discard and Exhaust motion and trigger feedback for all ten existing Passives. This change extends the current dungeon UI and original card/icon assets on `combat-animation`, from main `2800f9a` (2.24.0).

Implementation choice: an ephemeral, ordered card-transfer journal plus a presentation controller. A final-state comparison alone loses cards discarded and redrawn within one End Turn; delaying combat resolution until animation finishes would violate AGT-08. The journal therefore observes synchronous transfers, merges only validated card transactions, and never enters saves. Combat resolves and saves before presentation starts.

Draw uses a gold-backed card that turns face up at its real hand position; Discard arcs down into its pile; Exhaust contracts into orange embers. Hidden shuffle/search cards retain their backs. Multi-card movement overlaps, with reshuffles represented by a compact stack and actual count. Reuse source portrait art without changing frames, icons, costs or card effects.

Passives pulse their own badge and briefly show a named, effect-specific cue, driven solely by new `passive-trigger` combat-log entries. Strength, Agility, Defense, retained Block, Ward Block, drawn cards, Ember Core HP damage and Last Ember's actual capped Block/Focus gains remain distinct. Ongoing attributes animate on activation; waiting Passives do not pretend to trigger. Existing logs and details remain the durable explanation.

Motion Off, OS reduced motion, hidden pages, dialogs, navigation, resize and a superseding action clean up all transient visuals without undoing gameplay. Decorative overlays have no pointer targets, focusable clones or live announcements; existing accessible logs remain authoritative. Resume and incidental rerender never replay old triggers. Existing actor animation, audio, questions, save schema and balance remain unchanged.

Validate ordered transfers, rollback, all ten real trigger paths, capped/zero effects and save/RNG parity in Node; verify real browser movement, cleanup, modal choices, small screens, reduced motion and offline production packaging. The unavailable MODEL.zip is not required or claimed applied.
