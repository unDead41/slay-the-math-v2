# Combat Edition 2.2 verification

Tested on Linux with Node and real headless Chromium; Windows installation is
not claimed. User-local release date: 19 October 2026 (Malaysia).

| Check | Actual result | Evidence |
| --- | --- | --- |
| JavaScript syntax, `npm run check` | PASS | All current runtime JS checked |
| `npm run build` | PASS | Current portable HTML generated |
| Game tests with jsdom | PASS: 60/60, 0 skipped | `qa/game-tests-2.2.txt` |
| Map module tests | PASS: 7/7 | `qa/map-tests-2.2.txt` |
| Map validation | PASS: 100 seeds, 200 unique maps, 12 PNG hashes, 4 SOR files | Same map report |
| Existing browser regression | PASS: 7 behavior groups, no page/HTTP errors | `qa/browser-2.2.json` |
| New combat browser checks | PASS: 6 behavior groups, no page/HTTP errors | `qa/combat-browser-2.2.json` |
| Strict frontend audit | PASS: 0 findings | `qa/static-ui-2.2.json` |
| DESIGN.md official lint | PASS: 0 errors, 0 warnings | `qa/design-lint-2.2.txt` |
| Cumulative package assembly against 2.0 and 2.1 | PASS: runtime and rebuilt portable HTML byte-match the tested 2.2 source; unrelated guide/notes retained | `qa/package-assembly-2.2.json` |
| Windows PowerShell execution | NOT_RUN: Windows/PowerShell unavailable here | Installer reviewed; no claim of installation on user's PC |

The browser checks exercise the source Rune Bat and Alyssa layout, new Focus
icon, actual configured counters, one boosted Block card, once-per-turn spending,
exact save/Continue, keyboard card/End Turn/Predict, all three pile dialogs,
Escape focus restoration, empty-hand recovery, both bosses and live seals.
Viewport checks cover 1920x1080, 1280x720, 844x390, 390x844 and 320x740. They
check root overflow, fighter separation, hand placement, reachable 44px actions
and nonoverlap between spent piles and action buttons. Screenshots were inspected
for desktop, both boss presentation and portrait/landscape layouts; QA screenshots
are internal evidence and are not included in this update package.

The supplied headless Chromium adapter produced corrupt GPU screenshot tiles
during capture. Final visual inspection used `QA_DISABLE_GPU=1` (software
rasterization). This does not establish hardware GPU performance, Windows browser
performance, a physical-device touch audit or a full accessibility certification.

Core `engine.js`, `math.js`, `map.js`, `map-rng.js`, `audio.js` and `music-data.js`
are byte-identical to 2.1. The only configuration addition is MC identity; card,
enemy and numeric settings are retained. Save schema remains 1.

The cumulative manifest was applied in an independent Python assembly simulation
to each supplied 2.0 and 2.1 ZIP. Both reconstructed projects passed the JavaScript
syntax check and produced the exact tested 2.2 runtime and portable HTML bytes.
Unrelated notes/custom project guidance were retained; a modified config was
rejected by manifest preflight. This verifies manifest completeness and base
compatibility, not execution of the PowerShell installer or Windows port handling.
The ZIP builder also checks every archive entry CRC before returning success.

The reviewed installer checks unknown affected-file edits, backs up original
bytes, stages replacements, rebuilds the optional portable file and provides
guarded rollback. Actual Windows installation remains NOT_RUN here.
