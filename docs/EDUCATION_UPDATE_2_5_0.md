# Education after Claim Artifact - 2.5.0

The previous release only delivered a review bank and went straight from Claim to the map. The user now explicitly requests the actual implementation using those 120 questions. This release connects the shared artifact Claim action to a saved question scene, then commits the artifact and journey transition after the answer.

## Player flow

New Run > Challenge > select one artifact > Claim & Choose Your Path > one question > choose A-D > Check Answer. A wrong choice is marked and ruled out; the player can choose another option or use Hint. No HP penalty or mandatory timer is added. A correct answer shows the exact answer and explanation. The final Claim/Continue action grants the selected artifact once and opens the map.

The same owner handles Elite/Mystery/Boss gifts. Their original destinations remain: finish the current room, or enter Stage 2 with its Boss artifact in the checkpoint. Optional gifts can still be left before starting the trial. The pending trial itself cannot be skipped while unused questions remain. This changes claim timing; it does not change artifact effect values, eligibility, card lists, combat Predict or its Focus/mastery credit.

## Real bank and no-repeat behavior

- All 120 original fixed items are embedded in question-data.js: 40 Probability of Combined Events, 40 Operations on Sets, 40 Logical Reasoning. Prompt, four option texts/IDs, correct ID, hint, explanation, seed and curriculum metadata are copied without rewriting.
- docs/QUESTION_BANK_SOURCE.json identifies the input review bank and source hash. Release packaging compares every imported content field against the original JSON.
- education.js selects randomly from a non-exhausted topic, then a uniformly indexed unused item within that topic. Its seeded RNG is independent of combat/map/artifact RNG. Answer order is shuffled once and saved.
- Mark an ID seen when the question scene opens, even if the player abandons the run without answering. A new run does not clear exposure history.
- The same-origin browser key duel-cube-question-history.v1 stores the union of seen IDs. Run/export state carries the accumulated set as well. Import unions history; it does not erase earlier local exposure.
- Refresh, Menu/Continue and import resume the exact question/order, selected answer, attempted choices, Hint and solved state. Rendering never rerolls a question.
- After all 120 have been seen, an explicit bank-complete message permits continuation without repeating old questions. There is no automatic reset.

## State and save correctness

engine.chooseArtifact reserves the selected existing offer and enters education, with the artifact still unowned. engine.continueEducation requires a solved or explicitly exhausted trial, verifies its owning offer/context, then grants the artifact and resumes the original progression in one synchronous action. Preview, incorrect attempts and refresh cannot grant acquisition effects. Completed trial records are separate from combat learning statistics.

Saved educationState is optional and versioned; old saves remain at their original scene. Validation checks known IDs, choice permutations, attempted choices, solved-answer consistency, owner source/kind, unique exposure and completed records. An unknown/tampered bank or pending answer is rejected. The retained offer is validated in its original master/reward/event/stageclear context. Existing old scenes do not receive a retroactive trial.

For an Elite win, the selected new card is added to the ended battle's discard snapshot while its artifact offer/question waits. This fixes a pre-existing save gap where the run deck had one extra owned card but the battle-zone inventory did not. No card-play, draw, discard-trigger effect or RNG call occurs from that bookkeeping.

History is written before the run snapshot. A failed storage write keeps in-memory play available with an Export warning; persistence across closing a tab cannot be promised when storage is unavailable. Unreadable history is preserved/reported rather than silently reset. Different browser origins have separate storage; moving history with a run uses Export/Import.

## Presentation and interaction

artifact-ui.js extends the existing scene owner, using the exact supplied stone Master/Alyssa background and chosen artifact icon. education.css consumes the existing dungeon tokens. Desktop places the trial at right; phone uses a compact art banner and natural document scrolling. Prompts and long options wrap; native buttons have 44px-plus targets, visible keyboard focus, selected/incorrect/correct text/state cues and live feedback. The trial heading gets opening focus; Hint and the next answer/Continue can scroll into view. The standard header/dialogs remain usable and return to the same trial. All game text is English.

## Verification

Actual commands and evidence are summarized in VERIFICATION-EDUCATION.json, with browser reports in docs/browser-education-2-5-0.json, docs/browser-artifacts-2-5-0.json and docs/browser-journey-2-5-0.json.

- Syntax and offline build: PASS.
- Education unit cases: all 120 keys/transactions; 120 draws across new runs without replacement; wrong/hint/refresh/strict restore; once-only Gold; explicit exhaustion; old saves; Elite card reward, Mystery and Boss checkpoint.
- DOM: real Claim control, original question content, empty-selection guard, wrong/hint/resume, new-run history, import union, storage failure and corrupt-history preservation, plus existing tutorial/collection/dialog/save flows.
- Real Chromium: the exact Claim path, keyboard choice, double activation, wrong/hint/solved-state refresh, once-only Purse Gold, six viewports from 320px to 4K, original content in all three topics, ten abandoned new runs without repeating an ID, explicit exhaustion and actual offline HTML with zero HTTP requests.
- Existing artifact and map browser regressions: effects, checkpoint, Mystery, all six room types, direct map entry, left legend, hidden encounter identities and wide scrolling preserved.
- Existing core engine/math/campaign/map/shop/audio/language checks: PASS.
- Rendered phone and desktop screenshots reviewed. Design lint and strict UI audit: PASS.
- Package hashes, archive CRC, prior-delivered preimages and simulated install/idempotence/rollback: PASS.
- Windows PowerShell execution: NOT_RUN. The installer is statically checked and its file operations are simulated by hashes.

## Delivery and compatibility

The cumulative update supports 2.3.0/2.3.1/2.3.2/2.4.0/2.4.1/2.4.2/2.4.3 and applies in place to C:\Users\ijmah\Desktop\slay-the-math-v2. It preserves AGENTS, checks affected-file drift, backs up before replacement and rebuilds the offline file. No new Desktop project/editor window is created. The latest 2.4.3 stone Master art and all previous icons/map/floor fixes remain bundled.

An active education scene requires runtime 2.5. Export before intentionally rolling back. Installation does not edit browser storage. A save already beyond the opening gift stays there; use New Run > Challenge to test the opening gate, or continue an unclaimed artifact offer. Exact commands: MULA-DI-SINI.md.
