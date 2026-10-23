# MUSIC(5) integration — game 2.24.0

Ijamm requests checking the latest `main`, applying the new audio on `music` first, then integrating it into `main`. The starting main is **2.23.1**, commit `af12035acdb73e2345adc0e8e5c8a60fa4346dcb`. Its icon package, developer toggle and color-only rich text remain current. This document supersedes the current asset counts and answer-reaction restrictions in the historical [2.22.0 audio notes](AUDIO_2_22_0.md).

## Assets and source

The authoritative registry is `dist/assets/music/audio-pack-5.json`. The catalog builder selects pack 5 before historical packs 4/3. Runtime and portable builds use explicit canonical paths and the same registry. All **57 previous supplied assets** (49 voices and eight BGM) match the source ZIP and existing runtime hashes; their registry records and bytes are preserved. Menu/Mystery music and generated Sound FX continue.

`MUSIC(5).zip` SHA-256: `bfdb64a198b9b1d6c15d65c2a62f98f1b12c1a1e52dd76e016601947d62378e6`. Its active `MUSIC/MUSIC/` directory contains 83 files: 75 voices and eight BGM. Runtime adds the two retained Menu/Mystery cues, for 85 registered assets. The ZIP's v2 manifest describes only the preceding 57 assets; it is historical evidence, not the new inventory. The source spelling `corret_answer_talking_*.mp3` maps to canonical `correct` IDs. Every available new recording is imported; there are five correct-answer and nine wrong-answer recordings. No tenth wrong-answer clip or new SFX is supplied.

| Group | Previous | Added | Total | Trigger |
| --- | ---: | ---: | ---: | --- |
| Answering/thinking | 3 | 4 | 7 | New interactive Predict, Artifact, Mystery or Practice question |
| Hint | 4 | 4 | 8 | First successful Hint reveal |
| More Hint | 4 | 4 | 8 | First successful More Hint reveal, after its actual unlock |
| Correct answer | 0 | 5 | 5 | Successfully checked correct submission |
| Wrong answer | 0 | 9 | 9 | Each distinct successfully checked incorrect submission |
| Rest | 4 | 0 | 4 | Successful Rest heal commit |
| Card reward | 8 | 0 | 8 | Actual card reward choices appear |
| Defeat | 4 | 0 | 4 | Final run defeat appears |
| Mystery entry | 15 | 0 | 15 | Fixed ME01–ME15 intro mapping |
| Dungeon Master | 4 | 0 | 4 | Unique artifact gift encounters, then hold visit four |
| Shop | 3 | 0 | 3 | Unique Shop encounters, then hold visit three |
| **Voices** | **49** | **26** | **75** | One global Voice bus |

## Volume and reproducible import

Run `python3 tools/import-audio-v3.py '/path/to/MUSIC(5).zip'`, then `npm run build`. The importer checks ZIP integrity, exact active-file membership, all 57 preceding hashes, and preserves the original archive. It masters only the 26 new recordings with two-pass FFmpeg loudnorm, using -18 LUFS, processing TP -2 dBTP and LRA 7. When needed, it re-encodes from the original with a measured gain correction; it never cascades lossy output as input.

Final MP3 bytes are decoded and measured again. Acceptance is **-18 LUFS ±0.5** and encoded true peak **≤ -1 dBTP**. The 26 outputs measure **-18.03 to -17.93 LUFS**, with maximum **-1.85 dBTP**. Output is MP3 128 kbps, stereo, 44.1 kHz. Pitch/rate stay unchanged, no trimming is performed, and each container duration differs by less than 0.1 second. Inputs span -22.49 to -11.07 LUFS. Per-file source/output hashes, duration, measurements, mastering mode, correction and FFmpeg version are in [manifest v3](audio/source-pack-5/audio-manifest.v3.json).

Every runtime voice uses `playbackRate:1`, `clipGain:1`. Existing independent Voice/Music/SFX sliders, defaults, single Voice bus, Music ducking, gesture unlock, cancellation, start deadlines and watchdogs retain their owners. Automated measurement/decode does not establish transcript correctness, human-perceived loudness on every device, semantic uniqueness or a human listening audition.

## Answer and support ordering

`DCAudioPresentation.questionState` reads the learning reducer's ordered events and actual attempt correctness. Option selection, invalid checks, Show Steps, layout/language rerenders and simply unlocking More Hint create no result receipt. The latest actual answer/support event owns presentation: Hint → wrong submission → More Hint → another wrong submission → correct submission can all speak in that order. Each answer receipt includes the question key and submission event index; distinct wrong attempts are eligible, repeated rendering of one attempt is not.

Correct/wrong priorities are 90, with existing support priority 80 and thinking 40. Each later answer/support transition has a new presentation scope, so older higher-priority audio yields immediately. The final correct or Mystery wrong reaction can play on the review panel. Explicit Reveal, exhaustion completion, timeout and abandonment do not claim correct/wrong speech. Mystery's existing automatic reveal after an incorrect submission is recognized only when its authoritative outcome is `INCORRECT`.

Receipts are consumed before scheduling and saved in the existing optional version-1 presentation ledger. Reloading a handled result does not replay it. A historical result from before this feature is consumed silently on first observation; a question observed during the current session can produce a new answer reaction. The existing 512-receipt bound declines extra audio without blocking gameplay. No question bank, learning reducer, game-save envelope, rewards, combat RNG or timer rules change. Legacy live-deck predictions use an ephemeral projection of actual attempt/hint changes and never mutate their engine question.

Practice sends minimal ordered event/attempt data through its current same-origin iframe. The parent validates source, origin, bank ID, bounded keys, boolean fields, event types and attempt data before calling the same projection. Its audio owner remains isolated in memory; active run/history are never written. Restart Review creates a fresh presentation generation. Standalone Practice creates no second audio controller.

## Validation

Release checks and actual results are recorded in [release evidence](verification/audio-2.24.0/release-evidence.md) and the native browser report beside it. The portable HTML is generated locally with `npm run build` and embeds all 75 voices plus 10 music cues; it remains ignored because of GitHub's per-file size limit. Source packages and previous release reports remain historical provenance.
