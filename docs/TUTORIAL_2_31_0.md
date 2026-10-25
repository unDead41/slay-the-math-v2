# Complete player tutorial — 2.31.0

Current tutorial: [illustrated refresh from main2.45.0](TUTORIAL_VISUAL_REFRESH.md).
The seventeen-chapter counts and commands below describe the historical release.

Historical integration: [Education main 2.36.0](education/MAIN_2_36_0.md). The original
implementation evidence below is historical. The current guide explains two
answers, first-wrong Hint/More Hint, failed review/Replay without chapter credit,
the simpler report and developer-only connection setup. All16 actual UI captures
are refreshed for 2.36.0, with release-version image URLs and capture provenance
in docs/tutorial/screenshots.json.

Open **Main Menu → Tutorial**, or **Tutorial / How to Play** in the game header. Learn still opens the tutorial at the beginning of a new run. Return to game and Escape close the guide and restore focus to its entry control.

## Player content

Seventeen chapters cover the journey, modes/artifact opening, map, intent/Block, card costs/types, piles/Exhaust, Predict/help, Focus, Passives/status, rewards, Shop, Rest/Upgrade, Mystery, bosses, Education Practice/reporting, save/audio/input, and readiness. All authored tutorial copy is available in simple English and BM. The tutorial initially follows the question language, then retains its own selected language without changing the game's question setting.

Sixteen genuine player-UI screenshots use the original scene/card/character artwork. They are examples of ordinary-mode values and frozen offers, not promises of the next run's numbers. The image can be enlarged and panned; explanatory text and practice remain independently usable. No AI artwork, uploaded model or new question was introduced.

Eleven chapters have actual-engine practice: enter a connected room, play Attack, protect through End Turn, draw cards, answer Predict with its ordered support, arm/spend Focus, activate a Passive, choose/skip a reward, buy an offer, heal/upgrade at Rest, and open both boss seals on separate turns. Each example is self-contained and can be replayed. Navigation is always available; reading completion cannot bypass a practical chapter's action.

## Ownership and storage

- `dist/tutorial-data.js`: localized instructions and image identities.
- `dist/tutorial-core.js`: validated tutorial progress and independent example transactions.
- `dist/tutorial.js` / `.css`: dialog view, chapter navigation, screenshot zoom, rich text and responsive layouts.
- `slay-the-math.tutorial.v1`: tutorial chapter/language/completion only. Training runs are memory-only and reset on reopen/reload/replay.
- Engine/config/card/question owners are reused directly. Nothing in practice reads the player's run or lifetime profile, captures learning, synchronizes artifact discovery, queues a comment, or sends analytics.
- `app.js` keeps the existing help entry. Help no longer calls the generic modal autosave; ordinary dialog saves retain their existing behavior. Close disposes the tutorial's handlers/tooltips.

Unavailable storage gives a notice and leaves every chapter usable. Reset asks within the guide and changes only tutorial progress. An active timed Mystery retains its real deadline; the guide warns the player to return and finish it. The tutorial does not add pause semantics or change game rules.

## Screenshots and builds

`docs/tutorial/screenshots.json` records the capture setup, dimensions, byte size and SHA-256 of all 16 WebP images. `tools/capture-tutorial.cjs` renders the real player UI using development-only canonical fixtures; no real player/browser records are used. The screenshot tool needs Playwright, Chromium and Sharp as external QA dependencies. Normal gameplay/builds need none of them. The final capture starts from clean tutorial commit `1303680` / 2.31.0 and records all runtime input SHA-256 values. The original scene owners are unchanged.

Flat `assets/tutorial-*.webp` paths deliberately use the existing portable image dictionary. `build:prod` copies them with the rest of `dist`; the generated portable HTML embeds them. The root file-based entries keep their addresses and load the same versioned runtime scripts.

## Verification

Commands and final outcomes belong in [tutorial verification](tutorial/VERIFICATION.md). Focused checks cover ordinary and all three Master definitions, question support/retries, duplicate/stale actions, progress/language/reset, storage denial, host-record equality, real browser layout/input and image loading. Existing full-project tests and syntax/build checks remain required. Desktop browser checks are local Chromium emulation, not a claim of physical classroom/device testing.

## Try the feature branch on Windows

```powershell
Set-Location "C:\Users\ijmah\Desktop\slay-the-math-v2"
git fetch origin
git switch tutorial
git pull --ff-only origin tutorial
npm.cmd start
```

Open http://localhost:4173 and select **Tutorial**. If Git reports local changes, preserve them before switching; this update does not require resetting or cleaning them. Main publication remains a separate integration from this feature branch.
