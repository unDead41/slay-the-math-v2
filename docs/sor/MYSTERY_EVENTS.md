# Mystery Event owner — 2.13.1

Status: Ijamm confirmed applying the supplied Mystery v2 package on 22 October 2026 (Malaysia). Source values retain their proposed balance status. Current runtime contract, compatibility and evidence: [MYSTERY_EVENTS_2_13_0.md](../MYSTERY_EVENTS_2_13_0.md). Full source mechanics: [v2 SOR](../mystery/source-v2/SOR_MYSTERY_EVENTS_v2.md).

This owner supersedes the old generic Mystery Heal/Remove/Artifact offer for newly entered rooms. It introduces fifteen optional, one-attempt timed math challenges without changing Predict's timing or the active question bank. Both stages/modes reuse the same three topics and profile history. Do not use decorative artwork as numerical question data.

Costs/rewards are explicit atomic transactions, failure damage is nonlethal outside combat, and review precedes consequences. ME13 failure enters one Normal battle on the current event node. ME08/14 are temporary combat/first-turn modifiers; ME15 permanently subtracts five Max HP once. See source table for exact 15-event values. Continue/refresh never rerolls an offer, renews a deadline or grants another reward.

## Presentation correction — 2.13.1

The supplied scene is now a full encounter background, matching the established Dungeon Master composition, with a right-side live panel and a mobile art banner. Intro, review and reward rules use the existing game-term glossary and preview calculation popup. Source question rich text and mathematics remain unchanged. Previews read the current snapshot only: costs, HP floors, healing caps and Max HP clamping are shown before any transaction. They do not expose a question early, alter a deadline, record a resolved event or grant/pay anything. See [room UI 2.13.1](../ROOM_UI_2_13_1.md).

## Economy candidate — 23 October 2026

For opt-in economyState only, [SOR 22](22_ECONOMY_REWARDS.md) adapts all fifteen events to saved economy profiles: times, Gold/heal/cost/failure and ME15/ME14 specifics. Live stakes/eligibility/resolver/validation share the frozen adapted definition. ME03 remains Skill-only; ME04 same-category/reset upgrade; ME10 keeps at least ten; ME13 creates one Normal encounter with only Normal rewards. Legacy pending deadlines/prices/questions remain untouched. Topic/question data and random nonrepeat selection are unchanged. Values remain candidate, not student win-rate evidence.


## In-game question workspace — 24 October 2026

DISAHKAN: Ijamm changes bank events from one answer to at most two. First wrong retains question phase, deadline, offers and RNG, unlocks both hints and applies no failure transaction. Correct retry succeeds; second wrong ends in incorrect review. Timeout/abandon retain their established terminal paths; Continue settles once. Do not reset the timer during retry, Help, menu or reload. [Current policy](../education/GAME_QUESTIONS.md).


## Education main integration — 2.36.0, 24 October 2026

DISAHKAN: Ijamm now requests publishing education-report to main. This supersedes
the earlier branch-only publication boundary. Merge af03f38 with main beb4a4d,
retaining the current tutorial, card rules, AI and production Dev access. Align
tutorial exercises/text, AI attempt termination and developer collection routes
with the versioned question policy. Run fresh combined-tree tests and record
actual results in [the main release](../education/MAIN_2_36_0.md). Earlier reports
remain historical evidence; live Google and pupil/device validation are separate.
