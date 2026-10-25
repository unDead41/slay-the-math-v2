# Tutorial visual refresh — final audit


## Main publication addendum

Ijamm now explicitly requests pushing this tutorial to main. Main was read again
at6c49f3980c3a832635d4d01a6c50a8df98ac4aad /2.45.0; the reviewed feature remains
aa3938eed9f343381c1becaf75fa95d4268c3504. Master SOR1.2.0 and current owners are
unchanged. This supersedes the feature-only boundary below for this publication.
Promote to2.46.0, preserve the exact tutorial/runtime/assets, and correct CI's
shallow checkout of historical balance inputs. Source PR CI had1,087/1,089 passes
and two missing-history errors, not a successful full run. See [main release and
fresh checks](../../TUTORIAL_MAIN_2_46_0.md). The feature audit below is historical
implementation evidence and remains intact.

25 October 2026, Asia/Kuala_Lumpur. Master SOR **1.2.0**. Repository
`unDead41/slay-the-math-v2`; main and implementation base
`6c49f3980c3a832635d4d01a6c50a8df98ac4aad` (**2.45.0**), tree
`7aef5e38693812bdcb80a537dee641a2fda3006f`. Working branch:
`tutorial-visual-refresh`, initially zero commits ahead/behind this snapshot.

The user requests a complete tutorial refresh from current main, with many
actual-game pictures or short recordings, simple enough for a Form 1 reader.
This authorizes tutorial implementation, current-game captures and relevant
verification. It does not change the mathematics curriculum, numerical rules,
artwork, character identity or saved-game contracts. Main publication requires
the task's publication instruction; this update is prepared on its own branch.

Read before changes: main Master SOR, AGENTS, governance, vision, decisions,
design references, UI/accessibility, combat, language, QA/workflow, original
tutorial handoff, current documentation/language/education/runtime audits.
The original tutorial has 17 chapters, 11 engine-backed exercises and 16 images.
Its image manifest already identifies game 2.45.0; the pictures are not described
as obsolete merely because the first tutorial release was 2.31.0.

## Initial findings

| Category / ID | Priority / confidence | Evidence, effect and action |
| --- | --- | --- |
| Confirmed / TUT-01 | P2 / high | `dist/tutorial.js:questionHTML` exposes Hint/More Hint/steps but no Basics control, despite the Predict chapter promising Basics and the controller accepting `foundation`. Add isolated, canonical Basics presentation and a focused regression. |
| Confirmed / TUT-02 | P2 / high | `tutorial-data.js` and `tutorial.js:image` expose one full-screen image per chapter; `tutorial.css` scales a 1440px capture into a capped figure. There are no illustrated before/after sequences for playing cards, Focus or answers. Replace these with manually controlled, localized, readable step captures and zoom. |
| Improvement / TUT-03 | P2 / high | One 17-chapter list mixes first-turn essentials, setup, optional systems and reporting. Add a short basics route, a complete reference route, smaller instructions, direct practice access and a guided full turn. Preserve existing chapter progress. |
| Improvement / TUT-04 | P2 / high | Artifact trials, status details, collection and issue reporting are compressed into other chapters. Give them their own illustrated instructions using the current real controls. |
| Potential / TUT-R1 | P1 / medium | Tutorial practice, language and capture automation could accidentally touch a real run, learning history or sharing queue. Preserve memory-only example runs; assert byte-identical host records; captures use fresh contexts with sharing disabled. |
| Potential / TUT-R2 | P2 / high | More media can increase startup/download/offline cost or bypass verified images. Use compressed real captures, current verified-image routing, manual navigation, image fallback and portable checks. Measure final bytes. |
| Potential / TUT-R3 | P2 / medium | Dense image controls can collapse short landscape layouts. Verify 390x844, 844x390, 667x375 and 568x320, keyboard and both languages. |

## Implementation and validation plan

1. Keep the real engine/evaluator and original assets. Preserve all original
   chapter IDs; add missing topics and a ten-chapter beginner route.
2. Capture current player UI in English/BM with isolated engine fixtures.
   Use crops of actual controls and actual resulting states; no AI mockups.
   Record source SHA, runtime hashes, language, scene/action, crop and image hash.
3. Present one pictured action at a time with a clear result, optional detail,
   a practice shortcut and replay. Keep navigation unlocked and motion manual.
4. Add full-turn practice and canonical Basics without touching player records.
5. Run focused controller/DOM/regression checks, syntax, production/portable,
   real-browser media/flow/layout/save-isolation verification. Broaden tests only
   where changed integration boundaries justify it.
6. Audit final diff, original assets/numerical-owner parity and current main.

Initial status was **PERLU UPDATE** within tutorial scope. Final status is
**VALID** for the scope and snapshot verified below. Publication is a separate
ref/tree read-back after this source/evidence review.
Physical pupil understanding is not established by automated checks. MODEL.zip
is unavailable and has not been read; this task uses the approved game assets.


## Final changes and findings

23 complete English/BM chapters replace the undifferentiated17-chapter list.
The default Basics route selects ten essentials; All chapters retains every
reference topic.49 real scene/action states have98 separately rendered language
captures,6,015,756 bytes altogether. The16 superseded tutorial images are retired.
Twelve engine-backed practice chapters include the new ordered full turn.

| Finding | Final status / evidence |
| --- | --- |
| TUT-01 | Resolved. Canonical localized Basics and unscored checks are reachable from practice Help. Focus remains zero after helped completion; no player record changes. |
| TUT-02 | Resolved. Numbered manual before/after pictures, real DOM crops, captions, zoom and a direct practice shortcut replace the single-picture presentation. Every frame in both languages decodes in production and is embedded offline. |
| TUT-03 / TUT-04 | Implemented. Beginner/reference routes, preserved original chapter IDs/progress, shorter instructions and separate loading/Artifact/full-turn/status/collection/reporting chapters. |
| TUT-R1 | Covered within tested scope: byte-identical non-tutorial storage through all chapters/languages/exercises; isolated setup/capture contexts; no sharing enabled or external origin admitted. |
| TUT-R2 | Covered within tested scope:98 optional Tutorial-pack images, manifest hashes, real404 fallback, portable zero-network playback, verified-only dynamic requests. Required startup bytes increase by20,012 for tutorial code/CSS, not6MB of media. |
| TUT-R3 | Covered at1440x1000,390x844,844x390,667x375,740x360 and568x320. Reachable footer, local readable scrolling, native tab keyboard navigation and real Predict completion pass. |
| Additional / TUT-05 / P2 high | Visual review caught a boss crop that omitted the seals. Recaptured the actual `.seals` before/after; both language image hashes differ and the real successful answer is recorded. |
| Additional / TUT-07 / P2 high | Reward practice was showing finished-battle metrics. It now shows HP/Gold/Deck and real Deck growth after taking a card, with a focused regression. |
| Additional / TUT-06 / P2 high | Current status pictures could be mistaken for archived per-hit rules. Older saves now get an explicit current-picture notice and expanded actual legacy-rule text. Existing archived-rule tests pass. |

No additional unresolved issue was found in the reviewed tutorial diff. Physical
pupil/device outcomes remain unverified; this is not a claim that every child
will understand all Form4 mathematics after one try.

## Fresh validation

The complete evidence index is [verification/results.json](verification/results.json).

- **78/78** focused controller/DOM/media and direct-consumer regressions pass;
  zero failures/skips. Includes all three loaded Master profiles, full-turn order,
  old v1 progress, archived rules, two-attempt failure, Basics/help/retry, normal
  player UI integration and actual portable DOM boot. [Raw result](verification/node.log).
- **Syntax PASS** and **production/portable build PASS**. The generated portable
  HTML is312,102,545 bytes. [Syntax](verification/syntax.log), [build](verification/build.log).
- **Ten native production/portable groups PASS**, zero page/HTTP errors. All23
  chapters, all12 practical chapters and every pictured frame in both languages
  are exercised. Five phone/landscape sizes, storage denial, timed-Mystery warning,
  exact host records, completion/reload, language, zoom and Escape/focus pass.
  Actual file-based portable embeds every frame and completes card practice with
  zero HTTP requests. [Result](verification/browser.json).
- **Three additional native groups PASS**, zero errors: old-progress BM route/
  practice shortcut on desktop/phone, actual changing Block values and exact host
  storage; intentional real media404 retains visible caption/fallback and working
  card practice. [Result](verification/access.json), [desktop proof](../../tutorial/preview-desktop-ms.webp),
  [phone proof](../../tutorial/preview-phone-ms.webp).
- **Strict verified-image integration PASS**: worker blocked, disk cache denied,
  unversioned/raw image URLs rejected; all23 tutorial chapters, card previews,
  actual Passive/pose, Artifact HUD and31 Codex icons use verified bytes. Zero raw
  image requests/page errors; exact game save. [Result](verification/verified-images.json).
- **Source/art preservation PASS**: all610 non-tutorial assets from main remain
  byte-identical; only16 old tutorial captures retire. No changes in modules,
  balance/AI policies, or other runtime owners beyond tutorial files and generated
  release/entry/asset metadata. [Asset proof](verification/asset-parity.json).

The original photo capture inputs are preserved per batch in
[the capture catalogue](../../tutorial/screenshots.json).94 photos precede
the tutorial-only archived-save caption and reward metric refinements; four boss crops were captured
again afterward. Between those batches, only tutorial.js and its generated
index/release fingerprints differ; the host game/presentation/math/asset owners
match. Do not relabel the first batch as a clean-main or later-UI capture.

Earlier verification-harness failures were resolved before these final results:
await actual app readiness before the storage baseline; await verified image
readiness before decode; address visible/native tab controls unambiguously. The
initial consumer run lacked a generated portable file; the final production build
and78-test run include it. No earlier failed run is reported as a pass.

The whole project suite was not rerun: engine/card/question/balance/art owners
are unchanged and the scoped78-test plus native/integration matrix covers the
changed boundaries. No new FPS/memory, classroom or live Google-delivery result
is claimed. MODEL.zip was unavailable and unused.

Before publication, read main again, require this same base or review any new
changes, audit the staged diff and verify the published branch ref/tree. No main
merge or hosted deployment belongs to this task's prepared feature branch.


Final build integrity also verifies every entry against each build's **own**
manifest:760 source entries and761 production entries. Production app.js/index.html
are the exact output of the unchanged canonical Developer-access build transform;
they intentionally differ from source. A source-manifest-versus-production
comparison was therefore an invalid check, corrected before publication. Tested
runtime input hashes still match current source, and the diff against the pinned
main contains only admitted tutorial files/media and generated metadata.
