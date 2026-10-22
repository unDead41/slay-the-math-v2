# Question Bank 1.6: harmonized content and complete playable review

All 120 original question identities and answer bindings are retained. Every prompt, Hint, More Hint, explanation, three worked steps and four choice feedback messages has been reviewed and rewritten against the supplied Form 4 English textbook, Malay textbook and DSKP. Wording changes are editorial; no mathematical answer needed correction. Choice wording is simplified where needed while the existing choice IDs remain stable.

## What changed

- Each game scenario is self-contained. Rune is a coloured counter or explicitly printed symbol, depending on the question; a card collection is the example collection stated in the question. Fire and Guard are explained as labels. Upgraded uses the listed subset. Energy in a set question is the printed cost; current Energy in a logic question uses its explicitly stated nonnegative-integer domain.
- Meanings use simple English and supporting Bahasa Melayu. The canonical 124-entry registry remains compatible with Artifact 3.5. All 124 entries have scoped teaching explanations and examples; the shared tooltip service uses them only for the question domain. Artifact meanings and effects are retained.
- Hint gives a concept and next action. More Hint uses the question's actual values or near-complete setup. Feedback addresses the selected wrong option without printing the final answer. Worked solutions show the given facts, method and conclusion.
- Every question has a concept mapping with source filename/hash, 1-based PDF page positions, printed pages, standard codes and a scope note. There are 110 core items, 7 supporting items and 3 enrichment items. These are coverage descriptions, not official endorsements or evidence of a validated mastery level.
- All 120 Hint/Solution visual pairs were reviewed. Probability tables show actual outcomes or changing counts. Set diagrams show exact regions with explicit unknowns, direct givens, numerical ordering and count-versus-element distinctions. Logic tables use the relevant claims. LOGIC-010 and LOGIC-023 no longer place the correct expression in the Hint header.
- Three internal source inconsistencies are documented in SOURCE_DISCREPANCIES.md. Ambiguous examples are not silently copied into the bank.

## Preview and behavior

QUESTION_BANK_RICH_TEXT_PREVIEW.html is a complete offline interactive review with all 120 items. Its editable sources are under learning/preview.*. It uses the bank's real session functions, rich-text renderer and visual renderer.

Review permits selecting any item and resetting that item independently. Learning reserves unseen IDs, adapts selection, records support, persists/resumes the same pending item and shows skill progress. Both modes support answer selection, per-choice feedback, Hint, More Hint, Basics and Show Steps. Only Learning writes its browser-local learning record; the game integration entry continues to use the existing game save callback.

The gate remains: reveal Hint, then submit a wrong answer on that same question. A wrong answer before Hint does not unlock More Hint retroactively. Opening a tooltip does not select or submit an answer. Full explanation, correct-answer indication, solution visual, answer-specific source/authoring notes and worked steps are withheld until correct submission or explicit final reveal. Neutral source titles/pages/standards remain available beforehand. Steps stay collapsed until Show Steps is pressed.

No HP loss, score change, timer penalty or artifact grant is invented by this package. Those outcomes belong to the actual game's existing policy. The preview displays the learning consequences: retry feedback, help availability, completion and recorded support use.

## Rebuild and verify

Use `python3 harmonization/build_harmonized.py`, then `python3 render_rich_text_preview.py`. Authored per-topic JSON, SET-visuals.json, TEACHING_GLOSSARY.json, the exact source registry and the frozen v1.5 base are included. The attached textbooks are not redistributed in the ZIP.

The fresh evidence files in verification/ describe what was actually checked. Older reports and baselines are retained under docs/history/v1_5 where applicable and are not current verification claims. The old review PDF/TeX is omitted because it describes the superseded wording; the complete current review is question-bank-form4-120.md and the playable HTML.

Actual game installation and teacher/player validation remain separate from content checks and preview tests. MODEL.zip was unavailable, so the preview is a game-style question folio rather than a screen captured from the user's current game build.

Context matching also avoids turning the yes/no response “No:” into the none quantifier, or the connective “even when/if/though” into an even-integer term. Both preferred and legacy annotations use these rules.

Authored logical words may be displayed as standard mathematical symbols by the math formatter. Those symbols have glossary explanations; their optional formal names are not treated as compulsory curriculum outcomes.
