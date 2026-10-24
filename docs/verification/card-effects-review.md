# Independent card-effects review

Range reviewed: 264a60e..920688b. The reviewer made no checkout/index/ref changes and independently ran 36 focused tests successfully.

No critical defects were found. The important finding was archived presentation leakage: the resolver correctly used prior rules, while card glossary rendering, Library notes/comparisons and tutorial status instructions still used current rules. A second finding concerned Master Twin Shot notes incorrectly describing Strength on both hits.

Both were fixed in one pass. Seven new BM/English explanatory regressions were observed failing before the fixes. Card plans now carry their active glossary, Library preview plans use the active run definitions, and the tutorial selects the corresponding status explanation. Master Twin Shot notes explicitly state first-hit-only Strength/Focus/upgrade. Supplier source files remain unchanged; the importer generates the compatible card-kit extensions.

All seven explanatory regressions and the related current-card/UI/tutorial suites pass: 66/66. Final whole-suite and production-browser evidence is in card-effects-2-33-0.json.

Severity ruling: the Twin Shot note is treated as important rather than cosmetic because it changes the player's valuation of a card explicitly revised by this task. It was fixed rather than deferred. No declined-to-judge items or deferred minor findings remain. Numerical values remain playtest candidates.
