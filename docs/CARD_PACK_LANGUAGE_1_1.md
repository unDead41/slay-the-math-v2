# Supplied card pack — simple BM / English

Ijamm requested dual-language support for the contents of STM_Cards_Consolidated_v1.zip, using simple language suitable for younger readers and supplied KSSM/DSKP sources for mathematical terminology. Work is confined to `dual-language-bm-bi`.

All 40 cards now have authored BM display names and simple BM/English descriptions and detailed rules. The 25 tooltips, formula explanations, category/rarity labels, controls and help text follow the same preference. Both canonical English and BM names are searchable in either language. All original artwork, canonical IDs, values, actions, timing, costs, rarity and Focus/Passive rules are preserved. A structural comparison against the original mechanics and byte comparison of all 92 original asset files provide the preservation checks.

The card package is exposed in Card Collection → 40 cards · BM / English. A separate iframe reuses the exact supplied renderer and data. It receives the current question language and asset owner. Only messages from that iframe and the current origin may change the language preference or close Collection. The preference is separate from run saves and question history. The full offline build uses embedded PNGs through the existing asset map; it does not fetch the catalogue from another server.

The source pack has no runtime ID mapping for these 40 cards. This change makes their language and read-only catalogue available in game. It does not install new combat effects, change the existing deck/reward/shop pool, or claim balance testing. The visible notice explains that the previewed effects are not active in battle.

## Sources and language boundary

Source-page review and SHA-256 identifiers are recorded in `modules/cards/source/docs/04_BILINGUAL_LANGUAGE_SOR.md` and `data/cards.master.json#/localization_sources`. Mathematical terms used by the cards are peratus/percent (%) and rawak/random. Relevant textbook printed pages are 49 and 244–245; DSKP printed pages 67–69 support the Form 4 probability scope. “30% of 60 HP = 18 HP” is an authored teaching example. HP, Focus, Block and card names are game translations, not KPM-defined terminology. Simpler language does not change the Form 4 content scope or establish a measured reading age.

Defend is translated as Bertahan; Defense as Pertahanan; Block as Blok. The distinction avoids presenting the card category and damage-reducing attribute as the same mechanic. Localized names are display fields; identity-based mechanics continue to use canonical names/IDs.

## Reproduction

- `npm run build`: regenerate card preview, asset copies, current entry pages and offline game.
- `npm run test:card-language`: source contracts, all 40 mechanics and language aliases.
- `npm run test:card-language-browser`: real-browser standalone source catalogue, live Collection, preference/save isolation, 320/390/1920px geometry and offline catalogue. Optional `QA_CHROMIUM_EXECUTABLE` and `BROWSER_QA_MODULE` choose the test browser.
- `npm run check` and `npm test`: existing game checks and regression suite.

Actual results are recorded under `docs/verification/card-pack-language/`. Screen captures are internal QA files and are not user deliverables. The downloadable ZIP retains the complete original artwork exports; the game vendors only 40 individual icons and 7 native frames used by the catalogue.

Verified result: 217 game regression tests passed with jsdom 26.1.0 enabled (0 failed, 0 skipped); 7 new language/host tests and 40 source mechanic checks passed; real-browser standalone/live/offline checks passed at 320, 390 and 1920px, with no page errors. All 92 supplied original asset files were byte-identical. A stale two-tab End-key expectation was updated to cover the new third tab, arrow movement and wraparound. The browser regression also verifies that closing the catalogue refreshes the underlying language control while preserving a real active-battle save.
