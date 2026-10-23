# Audit of exact runtime base

**BASE_COMMIT:** `2800f9aeba5ed594e6ef3f991bcf4dfa498a5de7`; package version 2.24.0. SOR v1.2 was prepared against earlier af12035 (2.23.1); its economic proposals are tested here against the supplied newer base. This audit distinguishes code facts from the opt-in candidate.

| Finding | Source | Measured current code behavior | Candidate change / disposition | Code owner |
| --- | --- | --- | --- | --- |
| AUD-01 | Starting | 12 fixed starter cards; Challenge offers three eligible Starting artifacts on independent artifact RNG. | Candidate keeps fixed starter and tier-uniform eligibility, saves a source-derived loot receipt. | dist/engine.js newRun; dist/artifacts.js offer/enable |
| AUD-02 | Normal / Elite | Uniform three distinct card IDs via combat shuffle RNG; Elite grants upgraded, then artifact. | Candidate rarity+bounded support via independent loot; three distinct, one/Skip; Elite flow and upgrade retained. | dist/engine.js win/chooseReward |
| AUD-03 | Shop cards | Six unique IDs, one seeded 60% sale already implemented; price is based on Energy. | Keep six/one; rarity base prices, single final rounding and frozen receipts. | dist/engine.js shopOffers/shopPriceCalculation |
| AUD-04 | Shop artifacts | 3 Starting / 2 Mid / 1 Boss in both stages; excludes all requires artifacts even when Passive exists. | Boss slot locked Stage 1; real capability eligibility at offer snapshot; no replacement roll. | dist/engine.js shopArtifacts |
| AUD-05 | Removal | Shop minimum ten but constant 50 per visit; ME10 permits reducing to one card. | Run-wide +15 cost growth, once per visit, ten-card floor for both Shop and ME10. | dist/engine.js removeShopCard; dist/mystery.js targets |
| AUD-06 | Recovery | Rest 12 HP OR upgrade; Boss 1 +12 HP; baseline artifact win healing. | Rest 20/15/12; Boss clear 20/12/8 once; actual artifact values retained. | dist/engine.js camp/nextStage; dist/artifacts.js won |
| AUD-07 | Boss rewards | Boss 1 Gold + eligible Boss artifact before checkpoint; no additional card roll; Boss 2 +60 Gold then victory. | Same Boss 1 flow, profile Gold/recovery; Boss 2 victory without post-run reward. | dist/engine.js win/continueEducation/nextStage |
| AUD-08 | Mystery 15 | All fifteen v2 events exist, one scored attempt, fixed 30/45/60s; profile-agnostic costs/penalties. | All fifteen adapted for three economy profiles; same preview/eligibility/resolver definition; exact saved deadline. | dist/mystery.js enter/start/commit/proceed/valid |
| AUD-09 | Source rules | ME03 Skill-only; ME04 same category and reset upgrade; ME12 choice; current rewards uniform. | Preserve all source restrictions before rarity sampling; save all transform outcomes before target selection. | dist/mystery.js makeOffers; dist/economy.js cardPolicy |
| AUD-10 | Discounts | Best actual 5%/15%; existing Shop rounds sale before artifact discount. | Round once after rarity×upgrade×profile×sale×best actual discount; no discount summation. | dist/artifacts.js discount/priceCalculation; dist/economy.js quote |
| AUD-11 | Persistence | Paid purchase ledgers, unique artifact acquisition sources and event settlements already exist. | Retain those owners; add immutable profile/context/factors/IDs and validate by receipt replay. | dist/engine.js validate/validShop; dist/economy.js valid |
| AUD-12 | RNG / power | No measured ICP/CCP dataset at the supplied base. | CP null/UNMEASURED, fixed capability tags, no combat shuffle/question changes or owned-card nerfs. | dist/economy.js factors; unchanged-input-hashes.json |

Counted from runtime: 40 cards, 31 artifacts, 15 events. Input file hashes are in evidence/unchanged-input-hashes.json. No CP, student win rate or card combination result is invented.
