# Artifact Edition 2.4.0

New Challenge runs now meet the Dungeon Master in an illustrated dungeon scene. Three random Starting gifts are saved before display; the player previews and claims one, receives its actual effect and then reaches the branching map. Offers and acquisition do not repeat on refresh or Continue.

## Implemented

- 31 supplied icon identities and effect definitions from Artifact Pack V3.1; 29 are obtainable with the current cards. Initiate's Ring and Chain Weaver's Spool remain locked from offers until Passive and card-driven hand Discard exist. Their event contracts are tested independently; no fake trigger or replacement effect is used.
- Starting effects, combat/turn counters, HP/Gold acquisition, real extra draw/Block/Focus/Energy, Attack/Defense bonuses, Strength/Agility, Shop discounts, win healing, retaliation and once-only die outcomes.
- Elite artifact choice after its card reward, optional Mystery discovery, and one of all three Boss artifacts before the Stage 2 checkpoint.
- Owned-artifact inventory through the existing dialog. Hand values include artifact bonuses; HP and Energy denominators show the real limits/budget. The prior icon/screen-fit fixes are included.
- Compatible existing saves, separate artifact RNG, frozen offers, bounded validated counters, once-only claims and exact Stage 2 retry.

Details, owner map and the two deliberate source-contract adaptations (three random initial offers and Lantern's usable post-reset Block award) are in SOR 19.

## Actual checks

| Verification | Result |
|---|---|
| Regression before integration | Expected failure: no master scene or artifact claim API |
| Full Node/jsdom suite | PASS: 83 tests, 0 failures and 0 skips; original mechanics, math, map/save/shop/audio/DOM coverage plus artifact cases |
| Artifact engine cases | PASS: 22 cases covering acquisition, trigger scopes, draw/card conservation, stacking, mitigation, discount rounding, full win/retry and invalid saves |
| Artifact browser workflow | PASS: six viewports (1920, 1280, 844, 390, 320, 3840); frozen offers, keyboard preview, no premature grant, single claim, inventory/Escape, actual HP/damage, Boss checkpoint/Energy and Mystery discovery |
| Actual offline portable HTML | PASS in Chromium: decoded embedded encounter/gifts, claim and map, with zero HTTP requests |
| Existing combat/Rest browser regression | PASS: six sizes through 4K; actions, Focus/Predict/piles, Continue, bosses and Rest preview/confirm |
| All 31 runtime icons | PASS: SHA-256, full image decode, 800×800 and real alpha |
| Syntax / portable build | PASS |

The initial jsdom parse of the full embedded HTML exceeded Node's default heap. Its DOM test now independently verifies the real embedded image bytes, then omits large base64 payloads only from jsdom input. Chromium tests the unmodified deliverable, including actual image decode and offline execution. Game code and the portable file are not rewritten to accommodate the test.

Master desktop/phone screenshots and the encounter artwork were visually inspected. Browser measurements/checks are in `browser-artifacts-2-4.json` and `browser-combat-2-4.json`. Balance values follow the supplied proposal; automated route completion is not a player balance study.

## Install and limits

Use the extracted update installer against the existing `C:\Users\ijmah\Desktop\slay-the-math-v2`. It accepts installed 2.3.0/2.3.1/2.3.2, validates affected source/target files, backs up, updates in place and rebuilds MAIN-SEKARANG.html. It preserves unknown edits by stopping before replacement. No new Desktop project or VS Code window is created.

Existing runs continue as saved. Start **New Run → Challenge** to meet the Dungeon Master. A new artifact-enabled save requires the updated runtime; export an old run before intentionally rolling back to 2.3. Windows PowerShell execution was not available here; ZIP integrity, source hashes and reversible overlays are checked in PACKAGE-VALIDATION.json.
