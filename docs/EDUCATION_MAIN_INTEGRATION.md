# Education integration into main

22 October 2026 (Malaysia). Ijamm explicitly requests applying the education branch to main. This supersedes the earlier education-only delivery boundary; those notes remain as historical release records.

Base main: `085ae6e` (Boss size 2.13.2). Education: `db220d1` (2.16.0).

The combined game includes the harmonized 120-question bank, filled Hint 1 tables, Education Practice on Main Menu, per-question comments/export and whole-question English/Bahasa Melayu. The latest main Shop tabs, full Mystery background/shared rich text and boss scale remain intact. The old tracked portable HTML is replaced by a reproducible ignored build; run `npm run build` to regenerate it.

Resolved conflicts combine the native Shop action/focus flow with Practice entry/exit; Mystery retains snapshot previews and its background while projecting localized questions. The HTML loads Shop CSS, Practice CSS/JS and the language runtime. The package retains both room and education browser scripts.

Validation: build, JavaScript syntax checks and all 207 Node tests with jsdom passed. This includes all 120 question language transitions, previous save compatibility, comments, Hint gates, timer integrity, native Shop navigation/purchases and Mystery rich previews. Browser QA opened Main Menu → Education Practice, displayed the BM prompt/filled table, switched back to English with Hint still open and displayed the comment exit popup. Boss scaling/style files match the main base byte-for-byte. No physical Windows/device or OS sharing-recipient test is claimed.
