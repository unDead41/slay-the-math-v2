# Education entry points and question presentation — 2.16.1

Ijamm reports missing BM/English and Practice in the game, and a mismatch with the question preview. Main 146bc75 contains both features; the user’s exact local launch URL/file could not be inspected. Two concrete gaps were reproduced in source: MAIN-SEKARANG.html was an ignored generated snapshot requiring a separate rebuild, and the live game omitted the shared learning stylesheet used by the folio. Trial help also used a separate older layout.

Fixes:

- Version MAIN-SEKARANG.html and root index.html as small entry pages loading current dist scripts/styles via a relative base. Keep the original file address so the launcher does not relocate existing file-based save storage. They are regenerated with the module build. A browser with file storage disabled still needs the existing server/Export flow.
- Rename the large self-contained generated file to SLAY-THE-MATH-OFFLINE.html. Update current portable tests and packaging exclusions. Historical installer documentation remains historical.
- npm start rebuilds mechanics, language, Practice and entry pages first. The main menu shows v2.16.1, a saved Question language selector and a prominent Education Practice / 120 questions button.
- Load the same learning.css as the folio. Artifact and Mystery share one support renderer: Understand/Try, filled Hint and More Hint references, gate explanation, final solution visual and worked steps. Keep Hint references unmarked even after solving. Give live questions the folio paper/choice/Given/Find styling while retaining each encounter’s artwork and native game actions.

The practice menu still opens the exact generated folio document used by the hosted 120-question preview. Run/profile/comment keys, canonical 120-question data, answers, timers, rewards, main Boss scale and Shop behavior stay unchanged. Localized event/player UI outside questions is beyond this question-language setting.

Verification: syntax/build, complete Node/jsdom regression suite, real Main Menu → BM → New Run/Challenge → Artifact selection → live BM trial → Hint; Main Menu → Education Practice → BM PROB-001 → filled table; restored Hint, shared flow layout, and 375px folio without horizontal overflow. Both root and MAIN-SEKARANG entries load the current runtime. The actual Windows user installation and native OS sharing receiver were not tested.
