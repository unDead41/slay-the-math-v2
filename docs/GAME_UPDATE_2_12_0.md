# Map, modes, Boss motion and expanded Shop — 2.12.0

22 October 2026, Asia/Kuala_Lumpur. Source baseline main `07d03a6` (2.11.0).

The user's five-part request owns this release. Retain the existing native map, card, dialog, rich-text, save and animation owners.

- Map: soften the existing dungeon plate with a parchment wash. Stronger dashed future paths, dark teal next-room paths and solid rust travelled paths; a text/line key explains each state. Larger Floor labels, room names and Enter Room badges; narrow Floor labels sit above the seals. Direct legal entry and saved topology stay authoritative.
- Modes: balanced illustrated book and crossed-sword medallions, clear difficulty/gift descriptions and explicit Start wording. The crossed swords reuse the original supplied Battle seal. No new generated artwork.
- Questions: read-only audit, with a confirmed denominator/common-denominator harmonization issue for the question owner. See QUESTION_SUPPORT_AUDIT_2_12.md. Authored source bank is byte-identical.
- Bosses: `sentinel` maps to Twin Sigil Guardian; `dealer` maps to Deck Lord. All ten native 3200×2144 sheets / sixty 1024px cells are encoded losslessly. Left facing, no flip, original frame order/variable holds, six frames per action. Single existing atlas player; intents map Attack/Defend/Skill, hits map actual damage/Block. Source event hooks are documentation, never a second gameplay resolver. CRC and SHA audit covers all four parts. Individual upscaled 4K frames and huge 4K atlases are excluded from runtime.
- Projection: original runtime anatomical pivot [512,768], scale 1.65, canvas floor [800,1000]. The host's foot percentage matches that floor, leaving 200 canvas pixels for faint VFX below the robes. Every alpha bound remains inside 1600×1200. Static posters use the identical matrix. Other actors and Alyssa keep their accepted registry, pivots, scale and pixels.
- Shop: six unique cards in a 3×2 rack, exactly one seeded random 60%-off card (40% payable). Another 3×2 rack offers three Starting, two mid-tier Elite/Mystery and one Boss artifact. Eligible owned IDs are excluded; exhausted tier slots say Sold out with no reroll/duplicate substitution. Source-dependent Passive/Discard exclusions remain.
- Purchases work in both modes. Paid Buy Artifact is a synchronous Gold/ownership/source/once-effect transaction; existing free gift Claim paths in Challenge retain their education gate. Learn keeps its direct opening and does not acquire new free Elite/Mystery/Boss gifts. A legacy Challenge without artifactState can create a `shopOnly` ledger on purchase and later receive normal non-starting Challenge gifts without an invented opening gift.
- Reversible tuning in config.ECONOMY.shop: Starting 80 Gold, mid-tier 140, Boss 220; card removal 50 Gold, once per visit, keep at least ten cards. These values are implementation defaults, not playtest balance claims.
- Sale applies to the normal card base price, then the highest owned artifact discount (5%/15%) applies with ceil/minimum-one rounding. A newly bought discount artifact immediately updates quotes. Stock IDs, sale slot and base prices remain frozen; calculations and Buy use the same price owner.
- Removal uses the existing native card selector and a named price/consequence confirmation. Cancel preserves the save. Confirm charges and removes one physical UID atomically, records the service, and remains used after reload.
- Additive shop version 2 stores offers, bought slots, entry ownership, artifact offers/purchases and removed card. Restore recomputes stock and rejects forged prices/tiers/sales/claims. Existing three-card visits remain exactly as saved until departure; future visits use version 2. Run format/key stays 1. Multiple purchased Starting artifacts retain a separate unique initial gift. Boss gifts offer only remaining unowned Boss artifacts.

## Design reconciliation

| Existing rule | Current user-directed resolution |
|---|---|
| Three Shop cards, one row | Six cards, 3×2; the merchant scene uses natural document scrolling and a sticky contained art column. Narrow racks scroll locally and retain the requested three columns. |
| Detailed parchment / small numbered markers | Reduce art prominence, strengthen routes, label Floor explicitly and keep native entry badges. |
| Static bosses | Same shared atlas player and canonical floor with per-boss source registration; no timer grants damage. |
| Starting gifts limited to one owned Starting ID | Exactly one opening gift remains; separately purchased Starting items are allowed and validated. |

No palette/font replacement or new UI framework. dungeon.css remains the token owner; journey.css owns map presentation. Card, Shop, mode and artifact controls use existing native primitives and shared STM tooltip. Source prices/cards/effects remain engine-owned.

## Verification

Actual commands/results are recorded in `docs/verification/release-2-12.json` and the focused browser reports. Required scope includes all Node/DOM tests; syntax; production portable build; map/integration browser matrix and all 120 rich items; Shop/mode transactions and narrow layouts; boss frame timing, grounding, fallback, pause/reduction, real intent reactions and offline asset loading. Browser automation is Chromium on this executor, not physical Windows/mobile/Safari/Firefox testing.

After pulling on Windows, stop the old server, run `npm.cmd run build`, then `npm.cmd start`, and refresh with Ctrl+F5. The repository's old portable HTML is generated output; source changes require rebuilding it.
