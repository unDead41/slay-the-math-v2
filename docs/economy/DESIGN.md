# Economy & Rewards candidate design

User spec: repository unDead41/slay-the-math-v2; exact base 2800f9aeba5ed594e6ef3f991bcf4dfa498a5de7; own branch balance/economy; no main merge/push. Read root AGENTS, owners 12/19/MYSTERY_EVENTS and Balance SOR v1.2 (BAL-21..28, CP-11..16).

Goal: meaningful purchases, source-correct loot, bounded support, persisted seeded offers and reproducible economy/recovery evidence. Targets 90/70/50 are student full-run goals, not simulation claims.

Approaches: (1) documentation only leaves transactions and RNG untested; (2) isolated opt-in economy overlay and real-engine tests/simulations, chosen by implementer because Combat/Map inputs are not ready; (3) replace complete balance/default difficulty now mixes domains and legacy saves. Choice (2) preserves legacy and makes the candidate reviewable without waiting for Combat.

Add economy-data.js and economy.js as a single versioned economy owner. New Run fourth argument {economy: true, difficulty: 'easy'|'medium'|'hard', support: true|false} opts in. Default calls and all saves without economyState remain legacy. Save profile, immutable offer context (deck/artifact IDs, stage/node/ordinal), two-stage rarity draws, factors and chosen IDs. Replay validation uses saved context, never current deck. Offers use private derived LCG streams; shuffle and questions stay unchanged. CP fields remain null/UNMEASURED. No UI CP.

Economic inputs from v1.2: Gold, rarity prices/pools, upgrades, growing paid removal, Rest/Boss recovery, event adapters and bounded support. Fixed 12-card starter; normal/elite three distinct; shop six distinct/one 60% sale; Skill-only event; same-category transform with upgrade reset; tier-uniform artifacts; 3/2/1 Shop with Boss locked in Stage 1; min deck ten. Artifacts retain current values and Combat timing as external input. Max HP remains 60 (+Ration - sacrifice), no enemy or card stat edits. This is an economy-only difficulty profile, not completed full-game difficulty.

Eligibility uses actual capabilities and excludes hand-discard artifacts without real Hand discard. No future draw ordering inspected. Existing pending saves are not migrated. Quotes round once after all multipliers and strongest actual artifact discount; acquisition updates only unsold quotes.

Non-goals: topology, card/enemy/artifact combat stats, question content, default player difficulty menus, calibrated student win rates. Deliver audit with code references, complete tables, recorded-seed histograms, route cashflow/recovery sensitivity and Master handoff. Runtime numerical candidates are CADANGAN / experiment only.
