# MUSIC(4) integration — game 2.22.0

Ijamm explicitly requests applying the prepared audio package to `main` v2.21.3. Work is developed on `music`, preserving that branch's original documentation commit, then integrated into `main`. This authorization supersedes the earlier request to prepare a ZIP without pushing. The v2.21.3 color-only rich-text rule, question sampling, gameplay effects and save format remain current.

## Active assets and mastering

`dist/assets/music/audio-pack-4.json` is the active registry; `tools/build_music_catalog.cjs` generates `dist/music-data.js` from it. It installs 49 normalized talking clips and the same eight supplied BGM, retaining Menu and Mystery/Artifact music. Explicit canonical paths prevent old OGG files or old embedded aliases from taking precedence. Pack 3 files/documents remain historical provenance, not active voice selection.

Every voice uses the verified package bytes at -18 LUFS ±0.5, encoded true peak at most -1 dBTP, rate 1 and clip gain 1. The measured package spans -18.35 to -17.88 LUFS, maximum true peak -1.77 dBTP. No new runtime normalization, speed/pitch change or independent per-clip volume multiplier is applied. Eight BGM retain their source bytes. The normalized ZIP retains the 49 original voice backups; originals are not runtime inputs.

Voice volume defaults to 85%, Music 45%, Sound FX 65%, with independent existing settings. One global Voice bus permits one line at a time. Voice and Predict duck Music to the minimum factor 0.30, never multiply two duck factors. Attack is 150 ms, release 350 ms; leaving a scope cancels Voice with at most an 80 ms fade. Existing generated Sound FX continue; this pack supplies no new dedicated SFX.

## When each group plays

| Group | Clips | Actual trigger |
| --- | ---: | --- |
| Alyssa thinking | 3 | A new interactive Predict, Artifact trial, Mystery question or Practice question appears; before its answer |
| Hint | 4 | First successful Hint content reveal for that question |
| More Hint | 4 | First successful More Hint content reveal; unlocking it or answering wrongly alone does not trigger it |
| Rest | 4 | Player commits Rest healing at a Rest node; speaks over the resulting Map, not on entering Rest or choosing Upgrade |
| Card reward | 8 | Actual reward card choices become visible, before choosing or skipping; no Shop/inventory/hover trigger |
| Defeat | 4 | Final run defeat appears, once per result; no wrong-answer or ordinary-damage trigger |
| Mystery entry | 15 | Matching ME01–ME15 intro is visible, before Start Challenge; these are Alyssa lines, including ME15 |
| Dungeon Master | 4 | Actual artifact gift choices; unique encounters use visits 1 → 2 → 3 → 4, then hold 4 |
| Merchant | 3 | Actual Shop visits; visits 1 → 2 → 3, then hold 3, independent of Dungeon Master |

Only eight card-reward recordings were supplied. Clips nine/ten and dedicated correct/wrong-answer voices are not invented. Master/Shop sequence behavior is retained from v2.20.0, now using normalized bytes.

Mystery entry uses a fixed `eventId` mapping, a 200 ms presentation delay and a two-second automatic start deadline. Start Challenge/Leave cancels the intro; no timer, question, reward or claim ever waits for audio. Other new Alyssa automatic lines also expire after two seconds instead of starting late. Each playing voice has a duration-plus-two-seconds cleanup watchdog.

## Persistence and cancellation

`audio-presentation.js` extends optional `run.audioPresentation` version 1 with a separate bounded Alyssa receipt ledger, audio-only RNG and per-group shuffle bags. Each bag uses all variants before refilling and avoids repeating the preceding line at a bag boundary. No combat, reward, map or question RNG is consumed. NPC encounters retain their existing independent ordered visit ledger and frozen IDs.

The app reserves/consumes a visible line before scheduling and saves it. Re-rendering, answer selection and changing question language retain the current receipt. Reload, mute, failure, zero volume and hidden-page cancellation do not automatically retry a consumed Alyssa line. The live delivery reference is presentation-only; malformed optional audio data recovers without rejecting a valid game save. Checkpoints retain independent copies. Bounds are 128 NPC encounters and 512 Alyssa receipts; saturation declines extra audio without pruning duplicate protection.

Question/help state comes from the existing authoritative learning record, not click counts. A solved/closed question cancels its line. Rest is recorded only after the existing synchronous healing transaction succeeds. Scope changes cancel old loads before comparing priority, so an old high-priority Hint cannot block a new question. Within one valid scope the priorities are Defeat 100, support 80, NPC 70, Mystery 60, Rest/reward 50 and thinking 40. Stale decode/ended/watchdog callbacks cannot play an obsolete line or release another line's Music duck.

Practice's current same-origin iframe sends question/help presentation state to the parent. The parent validates origin, source frame, bank ID and message shape, then uses an isolated in-memory audio owner. Practice audio does not write the active run or rewarded history. Standalone Practice does not create another audio controller.

## Builds and evidence

The normal, production, development and portable builds use the same registry and controller. The portable file embeds 10 music cues and all 49 normalized voices under canonical IDs. It is generated locally with `npm run build`, remains ignored because it exceeds GitHub's per-file limit, and is not a source input.

- `npm test`: 462 Node/jsdom tests passed, zero failed/skipped, including real UI controls, restored receipts, shuffle boundaries, unchanged game RNG, native controller boundaries, stale-load cancellation, deadlines and watchdog cleanup.
- `npm run check`: passed.
- `npm run build:prod`: passed; portable size 271,203,990 bytes at this revision.
- Chromium 153: all 49 MP3 voices decoded; actual Predict/help, Artifact, Rest/reward/defeat, Mystery, isolated Practice and portable offline playback passed. Browser playback/decode and portable evidence: [browser report](verification/audio-2.22.0/browser-report.json), generated by `npm run test:audio-browser` with an installed Chromium.
- Existing Developer Hub browser regression passed: real scenes, card comparison/combat, motion teardown, restart, presets and player/Practice storage isolation.
- Source mastering/import hashes: [import audit](audio/source-pack-4/import-audit.json), [volume audit](audio/source-pack-4/volume-audit.v2.json), [source manifest](audio/source-pack-4/audio-manifest.v2.json).

Source-pack documents are preserved unchanged, so their `runtimeInstalled:false`/package-prepared labels describe the pre-integration package. This document and the active runtime registry own the installed game's status. Numerical normalization, automated playback and decoding do not establish human audition, verified transcripts, spoken-language captions, BGM loop-seam approval or testing on Ijamm's Windows/audio hardware.

## Local update

After the `music` change is merged, a clean local checkout can use `git switch main`, `git pull --ff-only`, then `npm run start:prod`. Stop an older server first. If Git reports local changes, preserve/commit them before pulling; do not discard them or use a hard reset. The server and Settings should report v2.22.0.
