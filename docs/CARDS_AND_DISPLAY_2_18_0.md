# Cards and display — game 2.18.0

Requested by Ijamm, 22 October 2026: correct fractions/set notation throughout all 120 questions, put scrolling inside Shop with full background art, and apply STM_Cards_Consolidated_v1(1).zip.

## Sources and scope

`modules/cards/source/data/cards.master.json` is the unchanged 40-card authority. Its EN/BM tokens, values, actions, Focus rules, Passive limits and mechanic notes drive the integration. Original source docs, tests and Focus reference are retained under `modules/cards/source`; runtime mapping is explicit in `modules/cards/runtime-id-map.json`.

All 40 IDs are new canonical `stm.*` identities. The existing twelve IDs remain accepted with their original effects, upgrades and saved offers. New runs use a twelve-instance package starter: 3 Rune Strike, 3 Weak Point, 2 Rune Guard, 2 Flash Ward, 1 Quick Study, 1 Read Ahead. New card reward/Shop pools use all 40. Prices retain the current economy; X cards use the two-Energy price. These starter/economy choices are reversible integration defaults, not playtested balance conclusions.

The package supplies base Normal/Focus values but no upgrade variants. A separate, configurable host extension preserves the existing Rest, Mystery upgrade bundles and Elite upgraded rewards: +3 on the first Attack damage or immediate Defend Block value; +1 on the Skill field that receives its Focus bonus; Passive costs one less Energy, minimum zero. These upgrade amounts are host playtest defaults in CARD_UPGRADES. Base data stays unchanged. Upgrade and Focus are separate calculations; upgraded Recall can draw without Focus. The game has one enemy per encounter, so all-enemy and random-living-enemy targeting resolve over that single enemy. Existing boss seals remain authoritative, including their one-HP floor until opened. The source does not assign Fire affinity; package cards use Neutral without guessing affinity from artwork/names.

## State and transactions

The combat adapter is separate from presentation. It validates before paying; Energy and eligible Focus commit together. Recall and Card Search choose before commitment and cancel free. Read Ahead, Clear Choice and Burning Page keep committed, bounded sessions with physical candidate zones, persisted choices and transaction receipts. They block other actions until resolved; closing a committed choice preserves it for Continue/Finish card choice. Draw keeps the ten-card cap and seeded shuffle.

Focus costs one, stock cap three, once per player turn; a bonus that cannot help leaves stock and armed state intact. Passive cards never spend or clear armed Focus. Passive active zones, counters, status expiry, next-turn queues, carry caps and temporary attributes reset at a new combat, preserving artifact contributions. Source numeric balance remains supplied playtest tuning.

## Rendering and artwork

The MathML failure came from generic HTML rich-text CSS applying `display:inline` to native mathematical nodes. Restrict only the reset selectors to HTML wrappers; native sets, fractions and superscripts retain their mathematical layout. No questions, answer bindings or source calculations are rewritten.

Shop fills the available viewport; artwork covers the entire scene behind HUD and menu. Only its named panel scrolls vertically. Selecting/purchasing preserves that visit/tab's scroll position; changing services starts at the top.

Card artwork and full Normal/Focus frames use lossless WebP derivatives at the original padded dimensions. Exact input/output hashes, canvas sizes and path mapping are in `dist/assets/card-assets.json`. The full Focus frame supplies glow once; Passive keeps its purple Normal frame. Rich-text controls are siblings of the play/select button, with hover, keyboard and tap tooltips. Card names/descriptions/notes/calculations follow the saved BM/English preference in Settings. Runtime numbers come from the actual execution plan, including current attributes and eligible Focus.

## Verification

Build, portable and syntax checks passed. All **350 Node/jsdom tests passed, zero failed/skipped**, including all 40 base/upgraded mechanics, save/replay, all 120 question projections and complete two-stage campaign simulations. All 47 card images decoded with matching dimensions/hashes. Browser Shop checks at 390×844,844×390,1280×720 and2560×1080 reached Leave Shop with document scroll 0 and identical artwork bounds. Live Focus preview 9 matched actual 9 HP damage and exactly one Focus spent. Fraction digits now use 20px in answer choices, with native display-style fractions rather than tiny script-size digits. Actual command outcomes, browser measurements and limits are recorded in `docs/verification/release-2-18.json`. Tests and browser checks validate implementation contracts; classroom comprehension, balance playtesting and the user's Windows installation remain separate checks.
