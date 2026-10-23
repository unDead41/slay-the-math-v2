# Audio 2.24.0 — release evidence

Starting main: `af12035acdb73e2345adc0e8e5c8a60fa4346dcb` / 2.23.1. Work branch: `music`. Runtime under test: Node v24.19.0; native Chromium 153.0.8010.0.

| Check | Result |
| --- | --- |
| Source ZIP integrity and checksum | PASS; original archive unchanged |
| Existing supplied assets | PASS; all 57 source/runtime hashes and preceding registry records preserved |
| New voice mastering | PASS; 26 outputs measured after MP3 encoding, -18.03 to -17.93 LUFS, maximum -1.85 dBTP, 44.1 kHz stereo, duration difference <0.1 s, all decoded |
| Red/green regression | Six new/updated audio tests failed against old behavior; focused suite passed after implementation |
| `npm test` including pretest build | PASS; 472 tests, 0 failures, 0 skipped |
| Additional Practice message validation | PASS; four UI tests, including invalid-event rejection and repeated-attempt receipt |
| `npm run check` | PASS |
| `python -m py_compile tools/import-audio-v3.py` | PASS |
| `npm run build:prod` | PASS; portable HTML 295271719 bytes; no developer files injected into production |
| `node tests/audio-alyssa-browser.cjs` | PASS; eight scenarios, all 75 voices decoded, zero page/HTTP errors |
| `npm run test:dev-browser` | PASS; both existing developer browser scripts, including player storage isolation, Settings/menu toggle, reload persistence and Hub combat |
| `git diff --check` | PASS |

The native audio run covers actual Predict Hint → wrong → More Hint → correct controls, silent option selection, Artifact wrong/correct, Mystery correct/incorrect/timeout review, Rest healing, card rewards, defeat, timed Mystery intro, isolated Practice repeated wrong attempts/correct/Restart Review/Reveal, and offline playback with 75 embedded voices. Detailed native results: [browser report](browser-report.json).

The first browser attempt stopped because the solved Predict panel has two valid Close controls and the test selector was ambiguous. The selector was narrowed to the first Close control; the complete native browser run then passed. The first developer run returned success with an empty captured log in this environment; the command was repeated with direct output and both PASS lines were verified.

GitHub-hosted CI: **BLOCKED before any job step**, not a test pass. PR #17 workflow run [39909093695](https://github.com/unDead41/slay-the-math-v2/actions/runs/39909093695), verify job 120267677291, reports: “The job was not started because your account is locked due to a billing issue.” The job steps list is empty. The separate Ubuntu migration notice is informational. The checks above were executed locally; no billing/account changes or CI bypass were made. Automated decoding/playback and loudness measurement do not substitute for human audition, verified transcripts, semantic uniqueness checks or physical Windows/device testing.
