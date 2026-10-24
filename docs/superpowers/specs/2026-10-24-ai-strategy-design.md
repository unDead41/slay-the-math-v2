# AI effects, multi-turn planning and deck synergy

Ijamm explicitly selected improvements 1–3 and asked for implementation. This extends branch `ai` at `02f9c94`; the existing authorization to publish AI improvements to `ai` persists. No main publication. Implementation choices below are the builder's calls, not claimed pupil requirements.

## Goals and approach

Measure actual support effects with their paid Energy/Focus; let Expert consider three player turns using sampled unknown draws; choose campaign rewards, purchases, upgrades and removals for the existing deck.

Approaches considered: static hand-written card scores alone are cheap but miss delayed effects; unbounded search/learning is too costly and unvalidated; bounded real-engine sampled rollouts plus transparent deck heuristics reuse the tested engine and offer an inspectable result. Use the third approach. The user already chose the three concrete features and requested execution; normal implementation choices are delegated to the builder under the session's autonomy instructions.

## Constraints

- Node/CommonJS developer tools only; no new dependency, trained model, cloud, player save key or game-version bump.
- Preserve all production `dist`, modules, art, questions, IDs, numerical balance, default entry, main branch and existing specialist replay behavior.
- New replay observation/deck callbacks are opt-in; default replay output/decisions remain compatible.
- Measure support in named units. Do not add damage, Block, draws and stacks into a claimed universal CP. Existing paired terminal utility remains the contextual outcome measure.
- Keep invalid/censored outcomes, source identities, old JSON/CSV and five-job history semantics. Schema 3 and agent version identify new behavior.

## Actual effects

`tools/ai-playtester/effects.cjs` supplies `createEffectsTracker(x)` with `capture(run, fn)`, `snapshot()` and `dispose()`. Instrument the private runtime's log/calculation events and enemy damage/block reset functions only while a real action is captured. Planning and failed transactions never contribute metrics. Uninstall wrappers after each attempt.

Per canonical card retain resolved plays, paid Energy/Focus and direct receipt damage. Add actual Block granted, absorbed, expired and left unused at combat end; actual cards moved to Hand (including delayed/Passive draws), status stacks applied/consumed, passive triggers/damage, retaliation damage, stat units granted and defensive mitigation.

Block ownership uses a documented FIFO accounting convention, not causal marginal power. Carried Block keeps its original source; retaining cards record support separately. Unattributed starting/artifact Block remains an explicit other source. A combat-end remainder is unused, not absorbed. Deduplicate by log sequence within captured actions and the campaign-wide committed-play ordinal for costs. Status ownership expires with the actual engine statuses. Report vulnerable hit consumption and buff units/affected plays rather than inventing exact causal HP gains. Enemy Weak and Defense mitigation use the actual engine's layered per-hit values; they describe reduced incoming damage, not necessarily extra living HP in overkill situations. Overlay support counters must not be summed again into direct damage or Block.

Expose effect totals, per-card units and separate output-per-Energy ratios. Zero cost uses null ratios. Shared buffs are credited as involvement/units, never as additive independent damage. Browser tables distinguish created versus used Block and raw effect units.

## Expert planning

Reconstruct an unknown draw pool from the known owned deck minus visible Hand/Discard/Exhaust/Active/Resolving cards. Never use live draw order or gameplay/artifact RNG as a planning input. Draw order is sampled with three fixed independent policy streams after canonical sorting. The same public state must produce the same decision despite different hidden order/RNG.

Evaluate up to six legal root card/Focus alternatives plus End Turn across all three sampled worlds. Each world follows a bounded heuristic continuation for three player turns, at most three plays per turn and fourteen engine transitions including visible choices. Total budget <= 294 (public maximum 300). Each root gets equal budgets and samples. Record checkpoints only after fully resolved actions/enemy phases; discard a pending choice at budget exhaustion. Compare nonterminal outcomes at the common completed-turn cutoff across all roots/worlds; terminal states are absorbing. Report shortened horizons and truncations explicitly. Choose the highest mean terminal/HP/damage outcome; deterministic ties favor earlier plain-card alternatives or End Turn. No future Predict answers, question keys or rewards enter the evaluation. Future Focus from Predict is not modeled; existing carried Focus and actual passive/artifact gains are.

Resolve choices using only the simulated visible options. Passive replacement considers ongoing deck utility. Stop on terminal scenes or budget. Fail loudly on invalid planning transitions; do not hide exceptions as losses. Explanations expose horizon, sample count, transitions and bounded heuristic nature. Beginner/Intermediate retain their advertised styles; Intermediate's immediate score improves support/mitigation valuation.

## Deck development

`tools/ai-playtester/deck-policy.cjs` exports `createDeckPolicy(x)`. Methods return a legal choice plus short reason: `reward(run, keys, upgraded)`, `shop(run)`, `camp(run)`, `upgrade(run, candidates)` and `remove(run, candidates)`.

Extract card mechanics from runtime display plans/data: damage/hits, Block, draw/selection, attributes, statuses, triggers, costs, duplicates and upgrade differences. Score marginal changes to deck quality, with synergy for Strength–Attack, Agility–Block, Block–Shield Shot/retention, Skills–Grimoire Ward, Focus use–Ember Core and cadence passives. Account for dilution, costly cards, duplicate unique Passives and missing offensive/defensive roles. Scores are transparent heuristics, not measured CP.

Reward can skip when every addition worsens the deck. Shop can leave, buy an affordable displayed card/artifact, or remove one card within actual engine limits. Preserve a small recovery budget when HP is low and a worthwhile purchase is absent. Upgrade ranks marginal improvement over that card's base; removal ranks the deck after removal. Camp preserves existing recovery threshold, otherwise chooses the best marginal upgrade. Use engine prices and offered IDs without rerolling or touching RNG. Existing artifact scoring can remain heuristic but purchases compete against card/removal gain and affordability.

Integrate through optional replay policy/observation callbacks, including existing Mystery card targets. Bound explanations in the report. All combat skills share the same new acquisition policy; they are not calibrated pupil models.

## Verification and delivery

Write meaningful RED→GREEN real-engine tests for Block absorption/expiry/retention, Weak/Defense, actual/capped/delayed/Passive draws, stat/trigger counters, failed-action rollback, no planning contamination, deck synergy/skip/upgrade/removal/affordability, Expert setup/future defensive danger/Focus reservation and hidden-state invariance. Reconcile receipts/costs against actual committed plays. Browser checks must exercise support tables, worker campaign, history/export/cancel and player-storage isolation. Run full npm tests, syntax, existing developer browser tests and production exclusion/byte checks. Fresh representative campaigns and pair experiments must identify source/version; no claim that every combo is evaluated or pupil targets achieved.

Persist current results separately from the earlier 790-test baseline. Publish only tested final content to `ai` with no force and verify GitHub tree and unchanged main.
