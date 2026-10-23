# 20 — Developer Tools

Version: 1.0.0 · Game: 2.21.0 · Date: 2026-10-23 (Malaysia)

DISAHKAN: Ijamm requested implementation from main v2.20.0 of the previously supplied Developer Tools SOR, including separate development and production commands. This domain owns developer access, sandbox fixtures and diagnostic controls. Existing card/combat/event/motion owners still own gameplay.

## Commands

```sh
npm run start:dev
npm run start:prod
npm run build:prod
```

Development defaults to http://localhost:4174 and opens the game main menu at `/`; Developer Hub is at `/__dev/`. Production defaults to http://localhost:4173. Set `PORT` to change either. `npm start` retains its previous player-mode behavior for compatibility. `npm start dev` and `npm start -- dev` are supported aliases for development; `npm start prod` selects the existing production folder (build it first).

`start:prod` removes the previous release directory, generates current mechanics/entrypoints/portable output, copies only `dist` into ignored `release-prod`, and starts the production preview only after success. Local preview does not deploy the game. `build:prod` produces the folder and offline artifact without starting a server.

## Architecture and isolation

- Developer code lives under `tools/dev`, outside the production runtime and offline artifact.
- `server.cjs --dev` alone loads the developer request handler. Player and production modes return 404 for developer routes.
- The development server injects its adapter into a response copy of the existing app closure. The file `dist/app.js` gains no developer API or conditional hook.
- The injection checks a known closing marker and fails clearly if integration drifts. Update this adapter when changing the app's closure structure.
- Game previews replace window local/session storage with memory before any game scripts execute. Generated Education Practice documents receive their own early memory bootstrap too.
- No player saves, settings, question history, practice progress or feedback are read/written by preview modules. Refresh discards sandbox progress. This is a development convenience, not a security boundary against arbitrary code run in browser developer tools.
- Presets alone persist through `slay-the-math.dev-presets.v1` in the hub. Parse/write failures retain originals and offer JSON export.
- Actual scene setup validates through DCEngine before installation. Reset/restart uses a cloned baseline, and the existing renderer cleans up live battle/event UI. Motion inspectors own and cancel their renderer/timeline resources separately.

## Scenes

Combat supports the actual enemy registry, seed, stage, Learn/Challenge, intent, elite flag, player/enemy HP, Gold, Energy, Focus, custom deck with upgrade suffix, and owned artifact selection. Enemy selection selects its authored animation stage. Use an empty deck field for the actual starter deck.

Shop uses an actual connected version-2 map path and the real shop initializer. Rest uses the engine's supported standalone original-route state. Mystery uses real event eligibility, offers, education and settlement paths; force appearance excludes other event candidates, not option requirements. Every event is available with an eligible setup. ME06 requires an owned Starting artifact and enough Gold. Invalid setups report an error without replacing the active session.

Dungeon Master, map, card reward, victory and defeat have direct entries. Voice visit selection sets the audio presentation ledger without touching gameplay RNG. The actual audio settings still control playback and browsers may require a gesture inside the preview to unlock sound.

Combat shortcuts refill HP/Energy, draw a card, advance the enemy turn, or force a win/defeat. Forced outcomes are diagnostic result previews, not proof that natural win/loss progression and rewards passed; they deliberately do not replay every victory trigger. Pending choices/questions must be finished before forcing a result. Every shortcut is captured by hub diagnostics.

## Cards

The browser lists the 40 supplied canonical cards and filters by name/ID/category. English/BM previews reuse DCCardUI and DCEngine.cardPlan. Base, Upgraded, Focus and Upgraded+Focus start from independent, equivalent fixtures. Passive displays only Base/Upgraded and rejects Focus combat entry.

Actual plan reasons remain visible: Recall without discard or other context-sensitive effects can be unavailable. The UI must not fake a Focus benefit. Test Card in Combat puts the selected physical card first in the real initial hand, preserving the normal draw cap and zone accounting. Gameplay still enforces costs, card choices, three active Passives and replacement.

## Motion

The browser lists all current actor clips and uses DCActorAnimation.create with cloned metadata. It supports play/pause, restart, per-frame seek/step, speed, loop, scale multiplier, offsets, flip and floor/origin guides. Original and edited versions appear side by side. Authored per-frame durations, pivots and scales remain authoritative. Source images/configuration are never overwritten.

Export Proposed Configuration includes build, actor, original metadata and proposed settings. Applying it to source is separate work. Full timeline authoring, per-frame pivot editing and synchronised VFX/audio event editing are not supplied by this inspector. MODEL.zip was unavailable in this session; no claim is made that Mathmon's motion editor has been imported. Existing Slay the Math motion data is used directly.

## Presets and diagnostics

Scene presets save validated setup by name and stable IDs; loading fills controls for review, and Launch runs it. Invalid/missing IDs and unknown schema versions are rejected. JSON import is capped at 100 KB. Motion uses its dedicated proposal export rather than pretending it is a scene preset.

Logs retain the latest 80 developer actions. Copy/download includes build, setup, before-state and current run so real structured combat receipts can be inspected. Current state and combat history are authoritative; the tool does not announce automated expected/actual matching for every card. Restart repeats seeded gameplay setup; wall-clock event deadlines and forced-result timestamps remain time-dependent.

## Verification requirements

Run `npm run check`, Node tests, `npm run test:dev-browser`, and `npm run build:prod`. For optional browser tests supply the installed Playwright and Chromium through existing `BROWSER_QA_MODULE`/`QA_CHROMIUM_EXECUTABLE` conventions. Existing DOM tests require jsdom (`DOM_QA_MODULE` and module resolution where applicable).

Required regression coverage: all enemy fixtures, all Mystery events with eligibility, actual purchase/upgrade actions, valid card states, passive Focus exclusion, invalid input, response-only injection, player storage sentinels, practice storage isolation, motion stepping/teardown, exact restart baseline, presets, responsive layout, and production direct-route denial. Actual results belong in docs/verification/developer-tools-2-21.json.

## Deferred extensions from the broader SOR

Custom shop stock selection, arbitrary status injection, selecting an entire initial hand, forced education answers, player Collection unlock policy and a full motion authoring editor remain extensions. This release delivers direct content access and the listed troubleshooting controls without introducing duplicate gameplay rules.


## Windows startup fix — 2.21.1

The response-only adapter normalizes CRLF/CR line endings before matching the app closure. Windows Git checkouts can use CRLF while Linux uses LF. The previous literal LF marker rejected CRLF and returned HTTP 500 for /__dev/app.js, leaving background and DEV SANDBOX badge without the main menu. Source bytes are not rewritten. Unknown closure structures still fail explicitly. Regression coverage includes LF, CRLF, CR and a real browser session with a temporarily converted CRLF app file.

## Main-menu and Settings toggle — 23 October 2026

DISAHKAN: developer-only branch work, no merge/push to main. Start at the game main menu with Dev OFF. Main menu and Save and Settings expose synchronized ON/OFF switches. ON reveals Open Developer Hub; OFF hides access and rejects developer API mutation calls. The explicit Hub route remains available for diagnostic workflows. The toggle uses only `slay-the-math.dev-enabled.v1` in native session storage; player save/history/settings remain isolated in memory. Refresh keeps the toggle for the current tab, while sandbox progress is discarded. Hub preview frames enable tools explicitly. Player/production responses contain neither toggle nor adapter. This is an access convenience, not an authorization boundary.
