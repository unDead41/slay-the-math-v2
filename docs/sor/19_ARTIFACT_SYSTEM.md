# 19 — Artifact system, game 2.4.0

Owner: Ijamm. Current request authorizes real artifact effects and an illustrated Dungeon Master encounter before the first map in every new Challenge. Source: ARTIFACT(1).zip, Artifact Pack V3.1. Its original catalogue/effect document/SOR are preserved in `docs/artifacts/source-v3.1/`.

## Runtime owners

| Capability | Owner |
|---|---|
| IDs, names, tiers, trigger values, text, icon and compatibility metadata | `dist/artifact-data.js`, derived from the supplied catalogue |
| Offers, ownership, acquisition ledger, independent RNG and effect hooks | `dist/artifacts.js` |
| Actual cards, HP, Block, Energy, combat transitions, save/checkpoint validation | `dist/engine.js` |
| Shared choice/inventory renderer | `dist/artifact-ui.js`, using app.js native button and dialog owners |
| Scene layout | `dist/artifacts.css`, using existing dungeon tokens |

## Acquisition and eligibility

- **ART-01:** A newly created Challenge starts at `master`. Draw three distinct eligible Starting offers once, using artifact RNG rather than combat or map RNG. The user's random-choice instruction supersedes the source document's display-all-twelve example. Choose one and explicitly claim it before the map becomes available.
- **ART-02:** Save the offers before presentation. Preview, opening menus and refresh do not reroll or apply effects. A successful claim records a unique acquisition source and item ID before leaving the choice.
- **ART-03:** Of 31 catalogue items, 29 are currently obtainable: 11 Starting, 15 Elite/Mystery, 3 Boss. Initiate's Ring needs Passive cards; Chain Weaver's Spool needs a card effect that discards from hand. Those card mechanics are absent, so these two are excluded from offers. Their precise event hooks and assets are retained for a compatible card update. Do not rename a Skill into a Passive or count End Turn cleanup as card-driven Discard.
- **ART-04:** An Elite win freezes an eligible Elite/Mystery offer, then first completes the existing upgraded card reward. Only then is its artifact choice shown. After claim or optional skip, complete the room once.
- **ART-05:** Challenge Mystery has an optional Discover an Artifact action instead of its heal/removal choice. It offers up to three eligible, unowned Elite/Mystery items. Leaving the offered gift is allowed; reopening another event option is not a reroll.
- **ART-06:** After Boss Stage 1, offer all three Boss artifacts and require one claim before entering Stage 2. Apply it before saving the Stage 2 checkpoint. Boss Stage 2 ends the run without an unusable post-run combat reward.

## Effects and timing

The source catalogue remains the numerical authority. Starting/Elite/Boss rules are implemented by event hooks, not animations. The original effect list remains in `ARTIFACT_EFFECTS.md` under source-v3.1.

- **ART-07:** Ownership is unique by ID. Ration applies +5 Max HP and up to 5 healing once on acquisition; Purse applies +25 Gold once. Restore/render never replays acquisition. Current Max HP is 60 or 65 according to Ration ownership.
- **ART-08:** Reset per-turn counters and core Energy/Block, perform normal draw, then apply additional artifact resources/draws in stable ID order. Lens/Guard Pin/Die apply only on turn one. Die rolls once on artifact RNG and stores its result. Refresh never rolls again.
- **ART-09:** Strength adds to Attack-card damage and Agility to Defense-card Block. Balance remains an Attack; its Block does not get Agility. First-card bonuses are applied once before enemy Block and boss-seal mitigation. Focus retains its existing rule and cap.
- **ART-10:** Resolve all physical card moves in an Exhaust batch before any artifact draws. Only a successfully resolved card counts for Abacus or role triggers. Preview, forecast, draw and retaliation do not count as played cards.
- **ART-11:** Ember Balance adds Block before the announced attack. Brooch requires a positive attack fully stopped by Block; retaliation passes through ordinary enemy mitigation, can win, and never starts a phantom extra turn. Win healing is once, alive only, capped at Max HP.
- **ART-12:** Lantern's threshold is checked after the first Block reset and after HP changes. In this single-attack engine, an enemy-damage threshold is awarded after the next player-turn Block reset, so the 12 Block remains usable. Dead players never trigger or revive. This phase placement is an explicit runtime adaptation of the source trigger ordering.
- **ART-13:** Clasp contributes +3 on turn one, +4/+5/+6 on turns two/three/four, capped at +6 from itself. Charm/Armlet's +2 stack separately. These stats reset each combat. Gatekeeper adds +1 Energy each turn; Hourglass draws two each turn.
- **ART-14:** Shop cards use the highest owned discount (5% or 15%), never their sum: max(1, ceil(base price × (1 − rate))). The frozen, discounted stock is validated on restore.

## Persistence and compatibility

- **ART-15:** Run save remains format 1 with a versioned additive `artifactState`. It stores owned IDs, acquisition sources, pending offers and artifact RNG. Battle state stores role/played-card/Exhaust counters, used flags, die, Energy budget and Clasp contribution. Invalid IDs, duplicate ownership/acquisition, incompatible offers, invalid counters/resources/Max HP are rejected.
- **ART-16:** Existing saves with no artifactState continue their existing room/path without an injected opening or retroactive artifact. Learn mode keeps its current flow. New Challenges receive the system. Stage 1 Retry returns to the same seeded Starting offer; Stage 2 Retry restores its exact acquired-artifact checkpoint.
- **ART-17:** Keep the current card list, probability evaluator, mastery-credit rules and frozen map snapshot. Artifacts are separate from cards. The two unsupported triggers do not activate new cards silently.

## Assets and evidence

Only the 31 runtime 800×800 icons, relevant catalogue/SOR, and one generated encounter background are included. Icon derivatives are lossless WebP with original alpha and no crop/resampling. No 4K sheets, 4K individual masters or raw generation boards are bundled. Hashes: `dist/assets/artifact-assets.json`; encounter provenance: `dist/assets/dungeon-master-art.json`.

Actual verification and limitations: `docs/ARTIFACT_EDITION_2_4.md`.

### Artwork override 2.4.1

Ijamm now requires an unidentified entity rather than a human Dungeon Master. The new source image replaces the human elder with an abstract dark rift and floating rune fragments while retaining Alyssa and the altar. The runtime canvas is a 3840×2160 upscaled export with recorded provenance; it does not change offers, ownership, claim timing or effects. See `docs/MAP_ENTITY_UPDATE_2_4_1.md` and `dist/assets/dungeon-master-entity-2-4-1.json`.

### Latest artwork override 2.4.3

Ijamm explicitly supplies image(20261019-032240).png and requests implementation. This exact new image supersedes the rift: a non-human stone/obsidian Master with cyan eyes, carved face and stone hands faces Alyssa over the altar. Reuse the shared scene/choice renderer and all artifact effects. The 3840×2160 PNG/WebP exports are mechanically upscaled from 1672×941, with no redraw. Provenance: dungeon-master-stone-2-4-3.json. The requested Form 4 question bank is review-only in this delivery; Claim Artifact still uses the existing flow until that bank is approved and separately integrated.

### Education claim gate 2.5.0 - latest instruction

Ijamm now explicitly requests the missing question implementation after Claim & Choose Your Path, using the 120-item bank. This supersedes the review-only timing in 2.4.3 and the immediate claim destinations described above. The shared Claim action freezes the selected gift and one unused question, then opens education. Ownership/effects wait until a correct answer and the final Continue/Claim action. Starting, Elite/Mystery and Boss share this owner and return to their original destination after the transaction. Wrong answers permit retry and Hint with no HP penalty or required timer. An exhausted bank is explained explicitly and never recycles questions automatically. Preview/refresh cannot reroll or grant anything. Numeric artifact effects and eligibility remain unchanged; SOR 02/13 own question/history details.

## Artifact Pack V3.2 integration — game 2.6.0

Ijamm explicitly requests applying `ARTIFACT (2).zip`. It retains the V3.1 effect values, icon sources and 12/16/3 tier catalogue; its new content is the rich-text and calculation standard. Original relevant source files remain under `docs/artifacts/source-v3.2/`; that directory's `integration-audit.json` records ZIP/icon hashes, identical visible pixels and alpha, and reconciled core definitions. All 31 existing WebP icons are reused. Raw 4K exports, duplicate sheets and demo HTML are not runtime assets.

- **ART-18:** `rich-text-data.js` contains the 31 segmented English descriptions and 55 glossary entries without example snapshots. `rich-text.js` owns scoped term/result rendering, the shared tooltip and bounded event presentation. `artifact-ui.js` remains the choice, trial and inventory owner.
- **ART-19:** Core-dependent definitions match the current engine: Focus cap 3, spend 1 for +3 damage/Block once per turn; Strength/Agility are flat additions to their eligible roles; player Block resets before artifact turn additions; all draws obey the shared Hand limit (10 in 2.9.0), leave excess cards in the pile and report only actual movement. No d6 fairness/probability claim is introduced.
- **ART-20:** Resolve effects before recording numeric snapshots. Acquisition, resource/Block/Draw effects, actual die branch, combat stat totals, card damage/Block, retaliation, victory healing and Shop prices record actual contributions, before/after values and caps/rounding. Healing and HP loss use actual deltas; enemy HP loss is distinct from pre-defense damage, including the sealed-boss 1 HP floor.
- **ART-21:** A description is a rule; it never shows a demo result as gameplay. Inventory shows its latest retained actual event only when one exists. History holds the latest 64 events. Shop quotes use the actual price owner; successful purchases separately record price and Gold spent.
- **ART-22:** Opening tooltips/history/inventory never runs triggers or RNG. Separate selection and term buttons preserve keyboard access and prevent nested controls. Escape closes a tooltip before its containing dialog. Existing ownership, frozen offers, education questions and trigger limits remain unchanged. Initiate's Ring and Chain Weaver's Spool stay excluded until compatible card mechanics exist; all 31 descriptions/glossary mappings are available.

Acceptance and actual checks: [Artifact Rich Text 2.6.0](../ARTIFACT_RICH_TEXT_2_6_0.md).


## Parchment map and integrated mechanics — 2.11.0

ART-23 (2.11.0): INTEGRATION.zip supplies Artifact 3.5 with the same 31 IDs, triggers and numeric values. Reuse existing icons and real effect owners. The supplied tracker/UI are bound manually to artifactState.owned, current turn/combat flags, Clasp contribution, actual calculation events and existing dialog/toast owners. A compact HUD inside combat resources shows counters/used states. Collection → Artifacts opens persistent discovery/collection, search/clear, native tier filter, source examples and read-only comparisons. The shared registry explicitly reconciles the nine existing engine-dependent definitions. No auto-wrapping engine adapter or duplicate reward owner is installed. Eligibility stays 29 obtainable/31 catalogued.


## Map, modes, Boss and Shop — 2.12.0

ART-24 (2.12): paid Shop acquisition works in Learn and Challenge, with 3 Starting/2 mid-tier/1 Boss unowned eligible offers. Buy spends Gold and grants the unique artifact/source once; it is separate from free Claim, whose Challenge education gate is unchanged. Starting purchases do not replace startingId or invent extra opening gifts. Learn gets no new free gift paths. Legacy Challenge can use a shopOnly ledger without a startingId. Discount artifacts immediately update unsold quotes; strongest rate only, after the single card sale. Purchased Boss items are excluded from subsequent Boss gifts; that offer may contain one/two/three remaining items or be exhausted. Existing effect values/triggers/unsupported exclusions remain.


## Combat balance experiment — 23 October 2026

CADANGAN: branch `balance/combat`, base `2800f9aeba5ed594e6ef3f991bcf4dfa498a5de7`, evaluates SOR Balance v1.2 through the real engine in an isolated Node loader. Candidate values are development-only; no player numeric data, loot/prices, IDs, artwork or questions are activated/changed. See [Combat/Card Synergy handoff](../balance/combat/SOR_COMBAT_CARD_SYNERGY.md), raw results and CSVs for measured context and limitations. Optional explicit-upgrade execution fields preserve existing definition fallbacks. Human full-run win targets remain unverified.


## Deep Combat/Synergy follow-up — 23 October 2026

DISAHKAN: Ijamm requests deep evolved-deck/Predict/setup/exploit/artifact-trigger testing. The development-only harness and measured handoff are in [Deep Combat report](../balance/combat/deep-results/DEEP_COMBAT_REPORT.md). Candidate Hard/growth risk requires Master review with Economy/Map; bot results are not student win rates. Production numbers, ID/assets/questions and Economy policy are unchanged by this follow-up.
