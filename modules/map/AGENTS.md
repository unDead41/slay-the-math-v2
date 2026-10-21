# Slay the Math map module

- Read `SOR/00_READ_FIRST.md`, then the relevant SOR before changing this module.
- Preserve the confirmed global room quotas and mandatory levels 5, 9 and 10.
- Preserve seed snapshots unless a deliberate, documented generator-version change is required.
- `src/map-rng.js` is the generator source; `npm run build:data` synchronizes the ES-module entry and exported data.
- Keep six icon categories mapped through `src/map-icons.mjs`. Preserve transparent PNG exteriors.
- Keep CSS scoped under `[data-stm-map]`; avoid changes to the host game's global styles.
- `onRoomInspect` must remain an inspection callback. Real room entry and completion belong to the host game.
- Run the relevant checks once after a change. Repeat only after changes, failures, or an unresolved concern.
- Use `npm test` and `npm run validate` for this package. Do not claim browser or combat integration was tested unless it was actually exercised.
