# INTEGRATION.zip host binding

User-supplied Artifact 3.5, Question Bank 1.5.0 and STM_SHARED 1.0.0. Original selected source files are kept in `source/`. See `source/MASTER_INTEGRATION.md` and `source/extraction-audit.json` for package layout and the retained documentation conflicts. No source/runtime module conflict was found.

Run `npm run import:mechanics` from the project root to regenerate `dist/mechanics.js` and `dist/mechanics-source.css`. The dependency-free build handles only this audited closed module graph; it is not a general JavaScript compiler. The generated bundle is committed so normal play/build needs no dependency installation. There is no second browser runtime or network fetch.

The host uses supplied pure learning reducers in its synchronous engine transaction. The supplied async facade remains exported for other consumers; it is not instantiated alongside the same run. `dist/education.js` owns adaptation/validation of old pending data and profile history. `dist/mechanics-host.js` binds supplied rich renderers and artifact UI to the existing dialog, toast, Collection and real counters. The source auto-wrapping/MutationObserver adapter is deliberately not loaded because it expects different ownership fields and could create duplicate UI/effect owners.

`integration-audit.json` lists source/output hashes, the supplier and host registry locks and nine explicit core-rule definition overrides. `icon-alignment.json` checks all 31 retained icons against supplied PNGs: identical visible pixels and alpha, with no crop/resampling. WebP may discard RGB hidden under zero alpha. Effect IDs, triggers and values remain unchanged; two unsupported Passive/card-driven Discard items retain their existing offer exclusions. Duplicate PNG/4K art, PDF previews and demo pages are not runtime dependencies.

Release behavior, compatibility and actual checks: ../../docs/MAP_INTEGRATION_2_11_0.md.
