# Interaction contract

Source: PRODUCT.md and the user-approved design in this conversation.

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Map navigation | dist/map.js + engine.enterNode; mapView in app.js | PRODUCT.md + docs/MAP.md | branching / legacy save | graph, save, checkpoint and DOM tests |
| Form | forecastForm and native trial controls in dist/app.js; DCArtifactUI.education | PRODUCT.md + SOR 02 | fraction / decimal / percent; fixed-choice trial | engine, DOM and integration browser QA |
| Select/Listbox | native .art-tier in the supplied ArtifactUI, mounted by mechanics-host.js | DESIGN.md | platform-owned popup accepted; no custom geometry promise | native keyboard and browser tier filtering |
| Scrollbar | dist/dungeon.css global baseline | DESIGN.md | hand horizontal / atlas pan | browser QA |
| Toast | toast in dist/app.js | this contract | info / error | browser QA |
| Card artwork | mathArt + cardView in dist/app.js | DESIGN.md + docs/ASSETS.md | hand / reward / collection / selection | DOM and portable regression |
| Motion | settings.motion + OS preference | DESIGN.md | home ambient / battle idle | DOM toggle and reduced-motion CSS |
| Scene poses | DCVisuals + battleFeedback in app.js | docs/DUNGEON_EDITION_2_1.md | dedicated Ember sheet / model with CSS reaction | real-browser pose checks |
| Dialog | native dialog and showModal wrapper in dist/app.js | this contract | help / deck / forecast / selection / confirm | Escape, focus, responsive QA |

All gameplay state changes go through engine.js. Dialog background is inert, Escape is supported and trigger focus restored. Forecast invalid input shows inline guidance, retains value and does not count an attempt. Hint marks the answer assisted. If a started forecast is dismissed after an attempt or hint it consumes that turn's chance; it never awards Focus. Persistence errors leave the game playable with a persistent warning; corrupt or unsupported saves are rejected. Start-new and import/retry replacement require an app-owned confirmation. No account or personal information is collected. Sound starts only after a user action. Export/import use bounded validated JSON. Continue resumes the exact serialized state including an open forecast. Browser storage holds one current run and results; manual export allows backup.


Activating a native map icon immediately commits that node through engine.enterNode, which checks current edges before mutation. Focus alone does not commit; there is no selected-path preview or second entry button. Only successful room completion adds a visited node and advances the floor. Disabled rooms expose their type and state; the same engine reachability list owns map selection and entry. Restore/import resume the exact path and active room. The map seed is independent from combat draws. Existing saves without a path are explicitly treated as legacy, never assigned invented route history. All new runs and new stage-two checkpoints use branching maps.

## Source Edition 2.0

The user's nine reference screens authorize the shared visual redesign and a playable Shop. `docs/SOURCE_EDITION.md` records scope; `dist/config.js` owns numeric tuning. All UI text is simple English. Canonical new capabilities: Collection search/filter/pagination → `showLibrary` in app.js; Shop offers/purchases → `shopOffers`/`buyCard` in engine.js; Selectable room/reward/rest previews → their existing screen renderers in app.js. Search is in-memory and transient; it preserves the query/filter/page while the collection dialog is used, with a clear button and no remote requests. The six-card pagination controls expose boundaries.

A glowing map node selects a preview. Enter commits via the engine. Reward selection changes only the preview; Add claims one card. Rest selection changes only the preview; Confirm Rest claims the heal; Upgrade opens the existing card selector. Stock selection changes only the preview; Buy commits a single offer. Each stock item can be bought once and remains sold across refresh. Not enough Gold disables Buy with a visible reason; Leave is always available. Gold and deck update in one synchronous engine transaction. This is fictional in-game currency and involves no payment.

New runs use route version 2. Existing version 1/legacy saves keep their topology, including current encounters. A validated old save receives initial Gold only if it lacks the Gold field; HP, RNG, deck, Focus, answers and checkpoints are retained. Stats additions are optional validated nonnegative integers. Shop stock is a deterministic function of seed, stage and active room, independent of combat RNG. Forged prices are rejected on import.

## Dungeon Edition 2.1 superseding map behavior

New runs now use route version 3 and the supplied ten-level map SOR in
`modules/map/SOR/`. A frozen stage snapshot persists with progress. Routes 1/2
and legacy saves retain five-level topology. Level 5 is Mystery, level 9 Rest,
level 10 Boss; whole-map quotas follow the number of initial paths. Only real
engine edges authorize room entry. Map preview retains scroll/focus; completion
positions the viewport near the newly available row. The six supplied seals
appear in nodes, room choices and the legend with text names and state labels.

Pose changes are presentation-only and are never awaited by engine mutations,
autosave or reward claims. Timers are canceled when rendering a replacement screen.

The tutorial's four-card probability exercise is practice only and never changes a run or grants Focus. Accessibility/verification owners remain the native dialog, shared buttons, global scrollbar baseline, inline answer errors and live toast. Browser visual QA and DOM checks are separate evidence.

## Combat Edition 2.2

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Battle layout | battleView in app.js + combat.css | User combat reference; docs/COMBAT_EDITION_2_2.md | wide dock / natural-flow narrow layout | tests/combat-browser.cjs |
| Focus icon | icon renderer + DCVisuals.icons.focus | SOR 06; user requires a distinct Focus icon | supplied illustrated eye badge | browser load and Focus interaction |
| MC name/title | DCConfig.MC | SOR 08, CHR-01/08 | split name/title or full accessible description | menu and combat browser checks |

All resource values come from the engine/config. Existing cardView owns hand cards. Button data-action/zone/id remain the interaction contract, including keyboard shortcuts and all pile dialogs. After a forecast rerender, focus restoration matches the complete trigger dataset so Discard/Exhaust do not fall back to Draw Pile. The presentation does not change combat costs, damage, learning credit, map progression or the serialized save schema.

## Dungeon Edition 2.3

| Capability | Canonical owner | Source | Observable contract |
|---|---|---|---|
| Menu artwork | DCVisuals.menuScenes + selectMenuScene/scheduleMenu | Five user artwork references | Decode before fade; unchanged control bounds; one current scene; retain previous art on failure; manual selection works with Motion Off |
| Menu actions | Existing delegated app.js actions and dialogs | User main menu reference + existing UX contract | Five native controls; disabled Continue without save; New Run retains replace confirmation; keyboard focus survives manual art changes |
| Autoplay | motionAllowed + scheduleMenu | User wants rotating art; presentation choice | 5s interval / 5s fade in 2.5.1, presentation only; pauses in dialogs/hidden tab/reduced motion or while main controls are hovered/focused; no run/save mutation |
| Arena grounding | battleView + DCVisuals + dungeon-2-3.css | Explicit user floor-placement correction | Floor and sprites share one coordinate space; fixed foot pivot; local background stays visible across viewport changes |

The update retains save key/schema, configured numeric values, map snapshot and in-place Windows target. Failed artwork loads do not erase the menu or run. Source icon derivatives replace matching utility glyphs; Focus keeps the distinct gold/ruby icon approved in 2.2 and Predict keeps its cyan geometry.

## Screen fit 2.3.1

Combat uses the full viewport width at FHD, QHD, ultrawide, 4K and a 3413×1708 CSS viewport reproducing the user's screenshot. Desktop controls, card text and arena spacing share one responsive unit; small screens retain document scrolling and the hand owns horizontal scrolling. The floor horizon, sprite pivots and contact shadows remain aligned when viewport size changes. `tests/screen-fit-browser.cjs` verifies width, overflow, desktop occupied height, action sizes and floor contact. Actual evidence: `docs/FIX_SCREEN_FIT_2_3_1.md`.

## HUD icon correction 2.3.2

Energy, Focus, Predict and HP use decoded illustrated assets with visible labels/numeric counters. Focus is the supplied eye crystal; Predict is a separate sphere/cards image. Resource badges share the same rendered width. HP badges remain beside actual HP values, including when phone labels wrap. Native Focus/Predict actions, disabled/armed states, keyboard shortcuts and save restoration retain their existing owners. `tests/combat-browser.cjs` checks real artwork loading and sizes, action behavior, no horizontal page overflow, and all six viewport cases through 4K.

The additional Rest correction uses the original blue campfire seal on the healing choice, shared with the map Rest node. The heal preview and confirmation retain their existing native flow. It is included in the same 2.3.2 update.

## Artifact Edition 2.4

| Capability | Canonical owner | Observable contract | Verification |
|---|---|---|---|
| Artifact choices | artifact-ui.js + app.js button/select/claim handlers | Preview selects only; disabled confirm until choice; three frozen Starting offers before map; native keyboard/focus behavior | artifacts-browser.cjs and ui.test.cjs |
| Ownership and effect resolution | artifacts.js + engine.js | Unique IDs/source claims, resource/turn/combat triggers and frozen artifact RNG | artifacts.test.cjs |
| Artifact inventory | artifact-ui.js through existing modal/close owner | Same dialog, Escape and exact-trigger focus restoration | artifacts-browser.cjs |
| Persistence | engine.restore + artifacts.valid | No reroll/regrant; exact offers, ownership, counters and checkpoint; old runs stay at their saved scene | artifact/save/campaign checks |

All game-facing copy is English. Choices never commit on hover or selection. Successful claim announces the item and follows its owning flow: Starting to map, Elite/Mystery to completed room, Boss to the Stage 2 checkpoint. Existing serialized engine values own displayed HP/Energy/stats. Current rules and source-compatibility decisions: SOR 19.

## Map and entity correction 2.4.1

User source: four images 021641, 021700, 021807 and 022006. The map exposes category, level, state and legal links only; enemy/boss identities, images, statistics and full room details are absent from its text, title and accessibility attributes. This is a player-facing surprise rule; local game data is not encrypted. Once Enter Room succeeds, the battle screen reveals the actual unchanged encounter.

The existing mapView/select-node owner supplies a left rail with all six legend categories and the selected type/level. Existing engine entry owns Enter Room. Selection preserves both atlas axes, does not alter route/RNG/HP and restores the exact native node's focus. Current level uses the same chart and selected node, obeys reduced motion, and only changes scroll/focus. Both five-level saved paths and current ten-level paths use their stored topology. There is no new save field or generator version.

`journey.css` owns the scoped map frame and ample row spacing. Native overflow remains operable on both axes, including touch; the page does not overflow horizontally. The left legend stays left on phones; short screens may scroll the document to reach all controls. No shared shell overflow lock is added. The Dungeon Master art replacement shares the existing artifact renderer, native buttons and claim/save owner. Evidence: `tests/journey-browser.cjs`, `docs/browser-journey-2-4-1.json` and the map DOM checks.

## Direct map entry 2.4.2 — latest user instruction

References 024803 and 025055 supersede the 2.4.1 two-step map interaction. Remove the entire Selected Path, Enter Room, Current level and bottom hint area. The left rail now contains only the legend. Each enabled map icon is a native `data-action=node` button, using the existing engine entry owner exactly once. Pointer click, Enter and Space enter its exact legal scene; disabled locations remain inert. Native keyboard focus alone does not enter. Successful entry focuses #game and starts the new scene at the top of the document. No preview selection state or aria-pressed toggle remains.

Category-only map secrecy, wide row spacing, independent atlas panning, saved topology and the 4K runtime entity artwork retain their previous owners. The new high-resolution PNG is a separate export in the ZIP's ARTWORK folder, so it does not duplicate a large asset in the portable game. Full checks: tests/journey-browser.cjs and docs/DIRECT_MAP_UPDATE_2_4_2.md.

## Education claim gate 2.5.0 - current artifact workflow

| Capability | Canonical owner | Observable contract | Verification |
|---|---|---|---|
| Fixed question content and draw | question-data.js + education.js | Exact original 120 items; 40 per topic; independent RNG; random without replacement by ID; choices frozen once | education.test.cjs, QUESTION_BANK_SOURCE.json |
| Claim and progression | engine.chooseArtifact / continueEducation | Claim reserves gift and opens education. Correct answer then explicit final action grants the gift once and resumes its original destination | education/artifact/campaign tests |
| Question display and input | artifact-ui.js education variant + app.js native actions | Four buttons, selected/incorrect/solved states, disabled empty check, Hint and explanation, keyboard and new-scene focus | UI and education-browser tests |
| Exposure and resume | app.js readSeenQuestions/save + engine.restore | History survives New Run, Menu/Continue, import and reload; pending question/order/attempt/hint/solved state resumes; failures have persistent Export guidance | UI and browser tests |

This workflow supersedes the immediate artifact-claim destinations in the 2.4 section. Selecting an artifact still previews only. Claim & Choose Your Path opens a question, with the gift still unowned. An incorrect answer disables that tried option and permits another choice; it does not remove HP or Focus. Hint is optional and recorded. Correct feedback shows the bank's true answer and explanation. The final Claim/Continue action commits once: Starting to map, Elite/Mystery to completed room, Boss to Stage 2 with the artifact and completed trial in the checkpoint. Skip before claiming remains available for optional gifts. The gate itself has no skip while questions remain. Predict retains its own unchanged credit/Focus policy.

Each item is marked seen when first opened, including abandoned questions. A separate same-origin browser history is unioned with run/export IDs so a replacement run does not reuse it. An empty remaining bank shows that all 120 have been seen and permits progression without repeating a question; no silent reset. History corruption is reported without overwriting it. Storage failure preserves in-memory play and displays an Export warning. Old saves remain where they were; they do not receive retroactive claims or questions.

The trial uses the established artifact art/layout, shared native button, toast and dialog owners, English strings, global scrollbars and natural phone scrolling. No timer or new modal is used for the question. Existing dialog overlays return to the same pending trial. Evidence: docs/EDUCATION_UPDATE_2_5_0.md.

## Main menu fit 2.5.1

Source: explicit user request on 21 October 2026 for a smaller, unclipped menu model on UWHD, display-scaled menu and 5s artwork transition. `homeView`, `selectMenuScene` and `scheduleMenu` remain the canonical rendering/selection/timer owners. Each source is fixed in its own foreground/ambient image; only opacity/selection changes after decode. Failed/late loads preserve the last confirmed scene. Menu actions retain exactly the same bounds during scene changes and never mutate the run.

The foreground is contained within the scene with padding; the subdued cover fill may crop, while the foreground never does. CSS scales Home and its non-wide native dialogs through the one menu unit in dungeon-2-3.css. Long/short/narrow screens scroll naturally; Settings, mode selection, keyboard, Escape, focus restoration and 44px controls remain usable. A selected scene can change manually with Motion Off. Automatic selection and the crossfade last 5000ms each; automatic changes are paused during main-control focus/hover, open dialogs, hidden tabs or reduced motion. tests/menu-fit-browser.cjs owns the new 11-viewport and lifecycle checks; the existing dungeon and education checks remain regressions.

## Special-situation artwork 2.5.2

The supplied scene mockups are converted to clean illustration plates. `situationArt` and `DCVisuals.situationScenes` share one presentation path for Shop, Rest, Reward, Stage Clear, Victory and Defeat. Baked HUD values, sample cards and buttons are absent from the runtime images. All prices, card offers, HP, counters and summary actions still come from the current engine, with the same delegated action IDs and save schema.

Shop selection previews, Buy commits once and sold state survives refresh. Rest/Upgrade retain their existing select/confirm/dialog flows. Reward Add/Skip and summary Retry/Next Stage/Main Menu keep their existing owners. The scene layer is decorative and cannot intercept pointer/keyboard events. Panels have natural flow, document scrolling and at least 44px action targets; phones stack the artwork above the controls. Card rows own any narrow horizontal scrolling. Home, map, battle and artifact/question encounters do not receive situation layout styling. Verification: tests/situations-browser.cjs.

## Reward and Shop proportions 2.5.3

Extra horizontal screen space must not widen cards at a fixed viewport height. Reward and Shop retain three portrait choices in one horizontal row, with narrow rows scrolling from the first card. Card artwork preserves its square source ratio. Panel width is bounded for these two scenes only; selection, purchase, prices and reward actions use the same native owners. The regression suite checks card/illustration ratios, row alignment and fixed-height ultrawide comparisons, including the exact 2048×1038 screenshot size.

## Artifact rich text and calculations 2.6.0

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Term / number tooltip | dist/rich-text.js bind | V3.2 glossary + resolved event snapshots | hover / focus / tap, shared dialog or page | DOM + artifacts browser |
| Resolved calculation history | dist/rich-text.js record / valid | engine and artifact resolution only | delta / total / price / saved die roll | engine boundary, save/reload, browser and portable tests |

Tooltip lookup and display are read-only: no random calls, acquisition, draws or reward mutation. Escape dismisses a visible tooltip first, preserving its anchor and the surrounding dialog; the next Escape uses the existing dialog close/focus owner. Plain connector text inherits the game theme. Delta HP, remaining HP, Max HP and other units stay separate. Descriptions are static rules, not promised runtime outcomes. Shop quotes are the actual frozen offer price; history records a purchase only after it succeeds.

## Stage 1 atlas motion 2.7.0

`DCActorAnimation` is the single atlas playback owner; `DCAnimationData` owns source frames and FPS. App render creates/disposes the active Stage 1 non-boss player, native actions provide resolved reaction cues, and existing dialog/visibility/motion owners configure pause/static behavior. Animation never grants damage, consumes Energy, rerolls, advances turns or delays a result. Its canvas is decorative; native controls and visible HUD labels remain the accessible interface. Static source exports remain a fallback until a texture has decoded and painted. Boss/Stage 2 encounters use the existing renderer.

## Combat polish 2.9.0

| Capability | Canonical owner | Observable contract | Verification |
|---|---|---|---|
| Hand capacity | config.HAND_LIMIT + engine.draw | Limit 10; stop before moving/shuffling extra cards; preserve physical cards and show actual draw count/full state. Legacy excess goes to top of Draw without RNG. | run-polish.test.cjs |
| Overlapping hand | cardView + hand.js/hand.css | Pointer dwell 140ms; one raised card; neighbors shift; stationary pointer cannot refocus from layout. Keyboard immediate; 0 plays tenth card; touch activation remains native; local phone rail; opaque disabled cards. Dispose on rerender; clear on dialogs/hidden pages. Reduced motion removes transitions. | hand-results-browser.cjs |
| Result Time | engine result transaction + summaryView | Frozen finished timestamp for defeat/victory/stage clear; menu/dialog/reload/import preserves it. Legacy results are stamped once on restore. Stage 2 continuation clears intermediate timestamp. | engine + browser result checks |

The existing live toast, dialog/focus, save key and English copy owners are reused. Palette/type/card art and sibling reward/Shop geometry retain DESIGN.md ownership.

## Both-stage Normal/Elite motion 2.10.0

`DCActorAnimation` remains the only atlas player, now for the ten canonical non-boss actors in both stages. Its stage-aware registry prevents legacy cross-stage IDs and bosses from selecting an unrelated sheet. The existing native End Turn action supplies the already resolved intent; a presentation-only table maps Stage 2 labels to Attack/Defend/Skill. Player-hit feedback uses actual HP loss or blocked-hit Defend. Animation never resolves damage, draws, saves or RNG. Same-source Stage 2 posters are visible until a successful paint or after texture/Canvas failure; Motion Off selects Idle. Existing hero, hand, result Time, dialog/focus, pause and scene disposal contracts remain authoritative. Verification: tests/enemy-motion-browser.cjs.

## Integrated mechanics 2.11.0

`modules/mechanics/source` preserves the supplied Artifact 3.5 / Question Bank 1.5 / STM_SHARED modules and source data. `tools/import-mechanics.cjs` emits one classic bundle. Nine engine-dependent artifact definitions are explicitly reconciled in its audit and all modules use that one host registry lock. `rich-text.js` retains resolved-calculation snapshots and delegates help to STM_SHARED; Question Bank, Artifact Codex, comparisons and existing inventory share one popup hub. Help never chooses an answer, selects a gift, spends resources or advances RNG.

The supplied pure learning-session reducers own ordered answer/support events. The current synchronous engine still owns the final artifact transaction. Hint read → wrong submitted afterward unlocks More Hint. Wrong before Hint does not. Feedback describes the selected error; worked solutions, answer calculations and solution visuals appear after correct. The Claim gate has no reveal shortcut. Basics offers seven optional lessons and 14 explicitly unscored checks, with no combat or assessment reward. Thirty skill rows describe local practice evidence and do not claim certified mastery. Selection remains separate from Check Answer and the final Claim.

The profile exposure ledger is never reset by New Run or Import. Following the supplied session contract, New Run resumes an unfinished trial reservation; after completion the next trial draws an unused question using adaptive difficulty/weak-skill ranking. Source choice order is frozen for new reservations; existing pending saves retain their old shuffled order. Refresh retains selection, attempts and support. Legacy saves have no trustworthy support-event timestamps or skill evidence: they retain exposure and pending answers, with conservative Hint ordering and no invented historical mastery. Corrupt history remains in storage with a visible warning. Import accepts validated JSON up to 2 MB to accommodate the learning log and Stage 2 checkpoint.

The source tracker is a presentation projection of the engine's real counters, used flags and resolved calculation entries. `run.stmArtifactUI` is optional display state for Challenge; it does not grant effects or validate rewards. The profile Codex retains discovered/collected IDs under the supplied key. Offer previews mark discovery; only actual acquired IDs count as collected. Search, tier filtering, read-only comparisons and examples do not mutate gameplay. The two unsupported Passive/card-driven Discard artifacts retain their existing eligibility exclusions. Activations pulse the compact HUD and announce through the existing toast, with actual amounts in Calculations.


## Map, modes, Boss motion and Shop 2.12.0

Shop version 2 is owned by engine.createShop/validShop, buyCard/buyArtifact/removeShopCard; cardView, shopView, selectDeck, modal/close and toast remain UI owners. Source policy: SOR 12/13/19 and DEC-20261022-10/11/12. Selection/help previews are read-only; visible priced Buy commits once. Paid artifact purchases work in both modes without opening a free Claim trial. Removal selects a UID then confirms its price and lasting consequence; Cancel preserves all state. Sold/service-used state survives refresh; failure keeps Gold/deck/ownership unchanged. Stock/base prices/sale never reroll; newly owned discounts update quotes through the same engine price owner. Legacy visits finish with old stock. Boss animation remains presentation-only, with per-actor floor registration; existing reduced motion, dialog pause and same-source failure posters apply.


## Mystery Events — 2.13.0

Mystery is a named timed-question variant of the existing education flow. Intro states success/failure and fixed duration; Leave before Start exposes no question. A–D submits once; terms only open help. Support/dialogs/menu do not pause the deadline. Correct/wrong/timeout/abandon leads to answer review before consequences; optional target choice and explicit confirmation precede atomic cost/reward. Transitions focus the new heading, returning to the shared map on completion. Malformed imported offers are rejected by the save owner. Current-illustration loading cannot change the mathematical prompt or outcome. See docs/MYSTERY_EVENTS_2_13_0.md for the source policy.

## Room UI — 2.13.1

Shop tab state is presentation-only. Click, ArrowLeft/ArrowRight and Home/End select/focus one enabled tab without changing Gold, stock, RNG, card targets or saves. Purchases stay on their active tab; reload opens Cards with the engine’s frozen offers and Sold/service-used status intact. Leave Shop remains outside the tab panels. Old visits keep their original stock and disable unavailable services. Removal retains the shared native selector, explicit confirmation and cancellation.

Mystery art covers the encounter rather than appearing in an inset frame. Intro/review/reward text uses the existing STM_SHARED tooltip hub. Purple previews show the authored cost/reward and current HP/Gold arithmetic, including healing/HP-loss caps and the Max HP clamp; they do not add resolved calculation entries. Only actual consequences write the existing ledger. Terms, numbers, Hint, Basics, menu and tooltips never pause/reset the saved deadline or submit an answer. Question-bank meanings stay in question context; no teaching-pool Card definition is applied to the real deck.

## Boss size — 2.13.2

Both bosses match Alyssa’s visible idle height across desktop and phone layouts, including static fallback. Responsive positioning preserves the shared ground line and keeps all five actions’ faint VFX inside the arena. Intent, HP, cards and native actions keep their existing layers and owners. Size changes do not commit gameplay or save mutations.


## Education Practice — 2.14.0

The user requests the full 120-question folio directly from Main Menu on branch `education`, using the reviewed textbook/DSKP 1.6 bank. Hint 1 immediately displays actual table/Venn values as in the latest screenshots; unspecified data says “Not given”. More Hint explains the same filled reference. Final answer/selection marks and Artifact Claim keep their existing state ownership. Practice has its own saved Learning record and no run/rewarded-exposure mutation. Source, compatibility, responsive behavior and actual verification: [Education 2.14.0](docs/EDUCATION_PRACTICE_2_14_0.md).
