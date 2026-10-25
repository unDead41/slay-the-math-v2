# Illustrated tutorial — 2.46.0

Based on main **2.45.0**, `6c49f3980c3a832635d4d01a6c50a8df98ac4aad`.
Main publication is approved; see [release and checks](TUTORIAL_MAIN_2_46_0.md).
Originally prepared on `tutorial-visual-refresh` as2.46.0-tutorial.1. Open **Main Menu → Tutorial** or the
in-game Tutorial control. Learn keeps its existing automatic tutorial entry.

## Player flow

The default **Basics / Asas** route has ten chapters: introduction, starting,
map, intent/Block, cards, a full turn, Predict, Focus, boss seals and readiness.
**All chapters / Semua bab** adds loading/retry, Artifact claims, piles,
Passives, status details, rewards, Shop, Rest, Mystery, collection, maths
Practice, reporting and settings: **23 chapters** altogether.

Each chapter starts with one short idea and a manually controlled pictured
sequence. The numbered picture buttons show one action/result at a time.
Captions remain available if an image fails. Enlarge permits inspecting the
original detail. There is no automatic slideshow, video download or new motion
dependency. The 49 scene/action states have98 actual game captures in the selected English/BM UI,
including cropped real card costs, status values and before/after states.
No AI artwork or repainted game interface is used.

Short instructions keep essential rules visible. Secondary rule details live
under **More about this rule / Lanjut tentang peraturan ini**. **Try the practice**
jumps directly to the example. Navigation stays unlocked; reading completion
cannot replace an exercise's actual required action.

Twelve chapters provide replayable engine-backed practice. The new full turn
requires Defend → Attack → End Turn and shows actual changing values after each
action. Predict practice now has Question / Help / Result tabs, Hint, More Hint,
canonical bilingual Basics with unscored checks, retry/failure review and worked
steps. The same engine/evaluator decides Focus and boss seals. Two wrong answers
do not complete the chapter. Replay starts a fresh isolated example.

## Compatibility and ownership

All seventeen original chapter IDs are retained. Existing v1 progress restores
on All chapters, retaining its current chapter and completion list. The existing
`slay-the-math.tutorial.v1` key gains an optional `route` field; older records
without it are accepted. Switching routes never clears completion. Reset asks
within the tutorial and affects this key and in-memory examples only.

Actual runs, card values, RNG, offers, source maths, original art/audio and
learning/sharing owners remain unchanged. Practice never reads or writes the
player's run, lifetime question history, reports, comments or delivery queues.
Language starts from Settings; explicit tutorial language buttons affect this
guide only. A live timed Mystery still runs and keeps its warning/deadline.
Status reference details respect archived ordinary rules where applicable.

## Media and reproduction

`tutorial-data.js` owns captions, chapter groups, routes and media identities.
`tutorial-core.js` owns isolated transactions/progress. `tutorial.js` and CSS own
presentation. The existing verified image bridge loads the selected picture
only. Flat `tutorial-shot-<scene>-<language>.webp` names remain compatible with
the portable image dictionary; the resource manifest classifies them as optional
Tutorial media. Original single-image tutorial assets are retired after the
new references are verified.

Run `npm run capture:tutorial` with external QA dependencies supplied through
`BROWSER_QA_MODULE`, `SHARP_QA_MODULE` and `QA_CHROMIUM_MODULE` or
`QA_CHROMIUM_EXECUTABLE`. Normal player builds need none of these packages.
Capture uses disposable local contexts, validated engine fixtures, actual
native controls and the game's verified image owner. Sharing is never enabled
and outbound origins are blocked. `TUTORIAL_CAPTURE_GROUP` can repair a named
capture group; a complete capture and hash audit are required for final evidence.

`docs/tutorial/screenshots.json` records language, viewport, exact crop/selector,
actual actions/setup digest, game version, source commit, working-tree state,
runtime hashes (retained by batch digest) and each output hash/size. A dirty source capture is explicitly
identified; the base SHA alone does not imply the capture came from clean main.

## Checks and limits

Actual commands/results and final audit belong in
[the current tutorial audit](audits/tutorial-visual-refresh/LATEST.md) and its
verification files. Check production and the actual generated portable HTML,
both languages, every frame, all practice, keyboard/focus, progress migration,
storage denial, image failure and short/portrait layouts. A finite browser matrix
does not prove physical-device performance or pupil comprehension. The maths
bank remains Form 4; simple game instructions do not change that curriculum.

The unavailable MODEL.zip was not read or needed; captures use approved assets
already in the actual game.
