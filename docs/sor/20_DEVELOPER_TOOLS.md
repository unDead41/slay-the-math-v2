# 20 — Developer Tools

Version: 1.1.0 · Game: 2.35.0 · Date: 2026-10-24 (Malaysia)

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

## Main integration — 2.23.1

DISAHKAN, 23 October 2026: Ijamm now authorizes publishing the developer toggle to main over v2.23.0. This supersedes the earlier branch-only restriction. Keep production free of developer controls; use npm start dev to see the main-menu and Settings toggle.

## Production password access — current branch contract, 24 October 2026

DISAHKAN: Ijamm requests Dev access in production using password `demo41`, published to dev-tools only. This supersedes older production-exclusion statements above for this branch.

`npm run build:prod` first builds the original player dist and validates private-data exclusion, then augments only release-prod with a static access gate, menu/Settings controls and an isolated Developer Hub. dist and the portable HTML remain player-only. `npm run start:prod` serves this output; uploading release-prod to Netlify or Pages includes the gate and Hub. Relative URLs work at the host root and a repository subpath.

Production defaults OFF. Enabling via the main menu or Settings opens a masked password dialog. Incorrect entries retain OFF with an error; Cancel/Escape retain OFF. The correct password enables the Hub for the tab session. OFF clears authorization, requiring a fresh password; the Hub also offers Dev OFF / Return to Game. Direct Hub navigation prompts before creating its sandbox iframe. A directly loaded sandbox still rejects diagnostic mutations until unlocked.

Player mode continues using real player storage. Only preview frames replace storage with memory; the production gate captures its dedicated native session key before isolation. Preview combat/card/motion changes never overwrite the player run. The pre-existing developer server remains password-free for local development.

This is deliberately a client-side convenience lock for a static public game. The password, session flag, source and tools are inspectable/bypassable in browser developer tools. It is not secure server authentication. No private data belongs in the game bundle. No server/database/auth service is required or provisioned.

Relevant checks: npm run check; node --test tests/dev-tools.test.cjs tests/release-build.test.cjs; npm run build:prod; npm run test:prod-dev-browser; npm run test:dev-browser. Hosted deployment is separate and main must remain unchanged until requested.

## Extended sandbox tools — 24 October 2026

DISAHKAN: add arbitrary map-node access across both stages, God Mode preventing HP loss, direct card insertion with copies/upgrade/Hand-or-draw, and one-click access to all 15 Mystery events. Ship only to dev-tools. These use the production renderer inside the isolated Hub preview, not the durable player run. Teleport uses a valid synthetic route prefix and preserves inventory; pending questions/choices must be finished. Card/Hand limits and Passive rules stay authoritative. Auto event fixtures satisfy prerequisites explicitly. God Mode is runtime-only, carries no save field and is unsuitable for balance evidence. [Current feature catalogue and limitations](../DEV_FEATURES.md).

## Exact questions, status editor and bug reproduction — 24 October 2026

DISAHKAN: Ijamm authorizes the five recommendations in the current feature guide, branch-only. Add exact-ID/consumer/language fixtures; validated native buff/debuff values and expiry; explicit one-way player-save copy/import; local HTML bug reports with optional user-selected screen capture; and four built-in real-engine scenarios. Preserve random sampling, authored question contents, profile-specific saves, native status caps/expiry and existing God/map/card tools. Unsupported status/expiry combinations are rejected rather than inventing new mechanics. The screenshot permission picker is browser-owned. No capture, report upload or player import occurs automatically. See docs/DEV_FEATURES.md.
## AI Playtester — branch ai, 24 October 2026

DISAHKAN: Ijamm authorizes publishing the previously local strategy/simulation AI to ai and improving it, superseding no-push for this branch only. Main remains unchanged. Base main 6dc3ce3 / game 2.31.0 retains the illustrated tutorial.

Developer Hub links /__dev/ai/. A loopback-only worker runs beginner/intermediate/expert campaigns and selected-card/pair screens. History retains five jobs, identity-bound cancel/reconnect/downloads; schema 2 separates individual A/B contributions, combined delta and excess pair interaction. Real resolved receipts measure per-card plays/Energy/Focus/direct HP damage. Current player saves, storage, gameplay values and production files are unchanged. [Guide](../AI_PLAYTESTER.md), [spec](../superpowers/specs/2026-10-24-ai-branch.md), [verification](../verification/ai-branch.json).

## AI effects, strategy and deck synergy — 24 October 2026

DISAHKAN: Ijamm selects improvements 1–3 and requests implementation on ai. Schema 3 adds actual support effects/cost ratios, FIFO Block attribution and explicit support overlays. Expert evaluates three sampled public-deck draw worlds through up to three completed turns with a common resolved cutoff and <=300 engine transitions. Opt-in acquisition policy ranks deck synergy for reward/skip, Shop, upgrade/removal and Mystery targets. Future Predict gains and pupil models are not simulated. Production/default saves/gameplay values remain under existing owners. [Design](../superpowers/specs/2026-10-24-ai-strategy-design.md), [current verification](../verification/ai-strategy.json).

## AI main integration — 24 October 2026

DISAHKAN: Ijamm now explicitly requests pushing this completed AI update to main. This supersedes the two earlier ai-only publication boundaries. Integrate ai `807be67` with main `d5533ad`, retaining game 2.32.1, current combat presentation and menu music. AI remains available through `npm run start:dev` and `/__dev/ai/`; production/player routes and gameplay profiles retain their existing owners. Historical branch evidence is not evidence for the merged tree. [Main integration and fresh checks](../AI_PLAYTESTER_MAIN_2026_10_24.md).

Release follow-up: Ijamm asks why the new AI feature did not increase the version. Release **2.33.0** identifies the added AI capabilities; generated metadata and launchers use the package version. Earlier 2.32.1 references above record the initial merge, not the current release. [Release-specific verification](../AI_PLAYTESTER_MAIN_2026_10_24.md#release-version-2330).

## Main integration — 2.35.0, 24 October 2026

DISAHKAN: Ijamm now authorizes publishing the complete production/password/extended diagnostics Dev update to main. This supersedes the branch-only publication boundaries above. Merge with main 2.34.0, preserve AI/local-only backend and card effects. The status editor follows the current percentage/duration Weak/Vulnerable rules. Production ships the static password-gated Hub; AI Playtester remains local-dev-server-only.

## Education collection configuration preview — 2.31.0-report.1

Branch education-report adds **Developer Hub → Education collection**. The development server alone exposes GET/POST `/__dev/education-collection`; production/player servers deny it. Access requires a loopback peer and a localhost/127.0.0.1/[::1] Host matching the listening port; writes also require the exact same Origin and JSON. Exact `{googleScriptUrl,revision}` writes are capped at 2 KB, validated with the existing strict Apps Script `/exec` URL owner, and rejected when the source revision changed. Atomic replacement writes only `dist/learning-collection-config.js`; it never reads player saves, private Google Sheets or collection credentials.

This is deliberate project configuration outside sandbox progress. The sandbox still uses memory and cannot send. The public receiver URL is included in future player builds, where consent remains off unless explicitly enabled. Existing browser destinations are preserved; adopting a changed Google project default is an explicit action that pauses sharing. The input is absent from player/production Learning Report, not treated as a secret hidden from browser inspection. Rebuild the player release to distribute a saved setting.


## Education main integration — 2.36.0, 24 October 2026

DISAHKAN: Ijamm now requests publishing education-report to main. This supersedes
the earlier branch-only publication boundary. Merge af03f38 with main beb4a4d,
retaining the current tutorial, card rules, AI and production Dev access. Align
tutorial exercises/text, AI attempt termination and developer collection routes
with the versioned question policy. Run fresh combined-tree tests and record
actual results in [the main release](../education/MAIN_2_36_0.md). Earlier reports
remain historical evidence; live Google and pupil/device validation are separate.
## Settings-only Developer controls — 24 October 2026

DISAHKAN: Ijamm requests removing redundant Developer controls from the main menu. Dev ON/OFF, Open Developer Hub and Copy Player Run to Dev appear only in Settings, in both local development and production. Password and sandbox isolation remain unchanged. This update is local only; no commit or remote push is authorized. This supersedes earlier main-menu access instructions.

Publication authorization: Ijamm subsequently requests pushing this Settings-only update to `dev-tools`. This supersedes the local-only boundary for this update; main remains excluded. Verification: production build, local-dev toggle browser test and production/static-subpath browser suite passed.

## Settings-only main publication — 24 October 2026

DISAHKAN: Ijamm authorizes merging the Settings-only Developer controls update `8a44068` into current main. This supersedes its earlier branch-only boundary. Retain current main release metadata and all education/icon/audit updates. Fresh combined-tree checks are recorded in `docs/audits/dev-tools/LATEST.md`.

## Reports and hint clarity — 2.37.0-report.4 branch preview

DISAHKAN: Ijamm selects in-game reports, private Google issue triage and the all 120 bilingual clarity pass for education-report only. The private Google Sheet Issues board groups question/category reports and uses developer-only status Baharu/Sedang disemak/Selesai, notes and fixed-version cells. Player Reviewed ticks remain separate; distinct device IDs are not verified people. Setup/refresh runs as the Sheet owner in Apps Script, not from player RPC. Existing sandbox feedback remains temporary and cannot transmit. [Contract and actual verification](../education/FEEDBACK_CLARITY.md).


## Education reports main publication — 2.38.0

DISAHKAN: Ijamm now authorizes publishing education-report6bfb483 into main37558d5. This supersedes the report4 branch-only boundary. Retain current Settings-only Dev access and all numerical/card/save/RNG/artwork owners; merge the Result report, private Issues receiver and reviewed bilingual hint sources. Fresh combined-tree evidence and manual Google receiver update: [main release](../education/MAIN_2_38_0.md). Earlier preview test reports remain historical evidence.
