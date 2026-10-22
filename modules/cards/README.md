# Supplied card pack — language module

Localized from STM_Cards_Consolidated_v1.zip for `dual-language-bm-bi`, 22 October 2026. Read `source/docs/04_BILINGUAL_LANGUAGE_SOR.md` for source PDF pages and exact language scope.

Edit `source/data/cards.master.json`, rebuild the browser mirror with `node source/tools/build-data.cjs`, then `npm run build` at the repository root. `tools/import-cards.cjs` builds `dist/card-preview.js` and copies 47 unchanged source PNGs into the existing asset owner. Only native frames and individual icons are vendored for runtime; the delivered ZIP retains all original artwork exports and source references.

Card Collection → 40 cards · BM / English opens the catalogue. Initial language follows the question preference. BM/BI changes in the catalogue update that preference without changing a run. The generated offline game also contains the same catalogue and image bytes.

This module localizes and previews the supplied mechanics. Forty new playable card effects are not installed in the combat engine. Source IDs and null runtime mapping remain explicit. Existing collection, deck and battle definitions stay owned by their current modules.
