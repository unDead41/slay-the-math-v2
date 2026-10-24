# SDD ledger — plan: docs/superpowers/plans/2026-10-24-card-effects.md

Base: 264a60e, isolated clone, branch balance/card-effects-20261024. User approved inline application of every audit proposal and feature-branch push; main is excluded.

Pre-flight: the ordinary importer and Master generator share the same effects adapter. Master consumes the archived ordinary pre-effects data before applying its original candidate and then the new adapter, preventing duplicate delayed draws or accidental activation of other Master values in ordinary mode.

Ruling: ordinary existing runs retain original rules using an archived definition binding, instead of migrating paid receipts or pending choices. New runs record cardRulesVersion; Master gets a new version/key. This adds a small synchronous binding layer; all HP, RNG and old receipts remain unchanged.

Ruling: choose normal/upgraded growth caps 4/5 and initial Cinder Guard 4 Block. These instantiate the approved ranges and offset whole-phase Weak; they remain numerical playtest candidates.

Ruling: freeze growth cadence and maximum on first activation, including replacement by a differently upgraded copy. This preserves trigger history and prevents reload or replacement from silently recalculating completed triggers.

Task 1: implementation complete. New real-engine regressions initially failed 25/29 cases on original behavior; after implementation 29/29 passed. A further different-copy growth regression failed before the frozen-cap fix, then passed. Archived 111-card regression cohort also passes. Combined new/archived/UI targeted run: 145/145 passed.

Baseline environment: the initial full suite lacked jsdom and the pinned historical Git object. Installed QA dependencies outside the repository and fetched commit 2800f9a. No package dependencies or historical reports were changed. The only pre-existing untracked file, reports/map-balance/base-2800f9a/.trials.json.QIJByr, is excluded from commits.

Task 2: percentage/carry badge regressions initially failed, then all four passed. BM/English and full-suite integration in progress.

Task 2: complete. BM status regression was observed RED then GREEN. An archived-Shop regression reproduced cost-based restore rejection; config binding fixed it. A further old Shop preview regression reproduced new-value leakage and passed after run-aware display-plan binding. Updated intentional current expectations; historical map action hashes pass unchanged through the archived runtime. Full suite: 814/814 passed. Syntax and production build passed.

Task 3: production Chromium checks passed for ordinary, Medium Master, Last Ember and actual prior-save continuation/reload; zero page/resource errors and all images decoded. Bounded 24-battle three-profile/four-archetype screen: 23 WIN, 1 LOSS, zero invalid/censored. This does not measure pupil win rates. Fresh whole-branch review and final verification/publication pending.

Final review: one independent reviewer examined 264a60e..920688b read-only and independently passed 36 focused tests. No Critical findings. Important: archived tooltips/Library/tutorial leaked current descriptions. The Master Twin Shot note was initially labelled Minor. Ruling: treat this as Important because incorrect Strength allocation changes a player decision; fix it in the same pass.

Final: fixed archived explanations and Master Twin Shot notes — seven BM/English regressions observed RED before fixes; all seven plus related suites GREEN, 66/66. The first green attempt exposed two overly specific test-wording assertions (the archived wording is “one Attack hit received” and “lapisan”); expectations now test the actual one-hit meaning without rewriting the archived copy. Supplier files remain unchanged. Final whole-suite/production checks run after this pass. No deferred minors or declined-to-judge items.

Ruling: preserve the existing Shop pricing algorithms/tables. Revised ordinary card Energy costs therefore affect prices of newly generated ordinary offers through the existing cost bands; prior offers retain their original prices. Master rarity pricing is unchanged. This is a derived card-cost consequence rather than a separate economy tuning pass.

Final verification: fresh complete npm test after the review fixes: 821/821 passed, zero failures/skips/cancellations. Fresh syntax/production build passed. Final production Chromium passed ordinary, Medium Master, Last Ember and archived Library/tooltip/tutorial/actual-card/reload checks; all original images decoded, zero page/resource errors. Fresh Easy/Medium/Hard flow checks also passed. Final 24-battle screen is source-hash matched to the verified runtime: 23 WIN, 1 LOSS, zero invalid/censored. Final evidence: docs/verification/card-effects-2-33-0.json.

Publication preparation: connected GitHub tree ab7eded9c7b42a1424d21cd78d037a5e4d29d792 exactly matched the locally committed reviewed tree before final evidence/docs. This verifies source/art preservation in the connector transfer. Feature-branch ref update and final read-back pending.

Task 3: complete. Published only balance/card-effects-20261024. Remote head 2b3f972650e53610f9ca5957fa629d3067eb36ad and tree 6c3bc9b51db680fb70f901afa191c261bb1d7875 matched the verified local tree; remote package version is 2.33.0. Main progressed independently and was never written by this task. The publication receipt is docs/verification/card-effects-publication.json; the final documentation-only commit records this completed event. All code verification remains applicable.
