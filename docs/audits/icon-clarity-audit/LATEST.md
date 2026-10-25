# Icon loading follow-up — 2.45.1-icons.1

## Main integration authorization — 2.49.0

Ijamm now requests publishing the completed icon-loading and combat-continuity
updates to `main`, continuing the preceding main-publication instruction. This
supersedes their 2.45.1 branch-only boundaries below for this combined release.
Current main 2.48.0, automatic downloads, the 23-chapter / 98-image / 12-practice
tutorial, AI/model, approved V5 art, numerical/save/RNG and language owners remain
protected. Original source SHAs, failed/passing records and branch limits below
remain history. [Pinned integration, required adaptations and fresh evidence](../../ICON_COMBAT_MAIN_2_49_0.md).

Combined scope status is **VALID with inherited P2 findings carried**. Fresh
Node verification passes **1148/1148** on `7568565`; final native continuity
passes **14/14** with the setup-only atomic-clock helper at `ee694d2`. Product,
Node-test/helper, configuration and generated inputs are unchanged between those
checkpoints; the single non-imported native helper delta has its own fresh replay.
[Exact commands, retained failures, hashes and limits](../../verification/icon-combat-main-20261025/evidence.json).
Publication is **VERIFIED** as main integration
`aedfdb4d5eef4fe64ff1ef6fbd969e673aa2dba5`, game2.49.0.
[Actual ref/tree/version, feature ancestry and Pages readback](../../verification/icon-combat-main-20261025/publication.json).
Pages run40188472242 completed successfully for that exact integration; public
browser inspection is NOT_RUN. CI-247-01 and QA-248-PRELOAD-01 remain inherited
P2/open; the current preload PASS does not establish a counter fix. MODEL.zip
remains unavailable and unread; physical-device and human-recognition limits remain.


| Field | Current audit |
| --- | --- |
| Date | 25 October 2026, Asia/Kuala_Lumpur |
| Repository / target | unDead41/slay-the-math-v2 / codex/icon-clarity-audit |
| Reviewed main | `6c49f3980c3a832635d4d01a6c50a8df98ac4aad`, 2.45.0 |
| Original remote feature | `81533b38b8c7be1d897c3acc282f749df9beaeab`, already an ancestor of main |
| Master SOR | 1.2.0; current main, AGENTS, domain owners and prior audits read |
| Authorization | Implement the appropriate follow-ups; push assistant branch only |
| Initial status | PERLU UPDATE — two reproduced P2 issues |
| Final status | VALID within the recorded icon/loading scope; limits below |

[Scope and behavior](../../ICON_LOADING_FOLLOWUP_2_45_1.md). This section governs this new branch update; older reports below remain historical evidence for their own snapshots.

## MASALAH DISAHKAN

| ID | Priority / confidence | Initial evidence, impact and scoped action |
| --- | --- | --- |
| FIX-ICON-01 | P2 / high | `bootstrap.js` reused a background decode promise without forwarding foreground priority. A real bootstrap/manager regression leaves a visible icon queued behind two held background transfers with spare capacity. Forward promotion during transfer; retain one transfer/decode and avoid refetching during decode. |
| FIX-ICON-02 | P2 / high | `icon-readiness.js` gave 30/43 UI keys the generic warning. Map/legend images without semantic attributes lost meaning behind Blob placeholders. Add UI/map glyphs and original-source identity lookup; preserve all ten status glyphs and real controls/names. |

## RISIKO BERPOTENSI

| ID | Priority / confidence | State and remaining check |
| --- | --- | --- |
| ICON-R1 | P2 / medium | OPEN: pupil recognition and physical-device performance are unmeasured. Native 28/44/64px decoding and BM phone interaction do not measure these outcomes. |
| ICON-R2 | P2 / high | CLOSED for the earlier integration concern: main 2.41.0 routes fifteen warmed icons through verified transport. FIX-ICON-01 addresses the narrower defect found afterward; keep its regression when Publish Handler changes. |

DOC-001/DOC-002 were resolved in main 2.43.0 and are not reopened by historical tables. Wider download targets and unrelated VFX/motion work remain with their owners.

## PENAMBAHBAIKAN

Implemented: visible-priority forwarding, registered semantic fallbacks, original-source recovery, combined bootstrap/manager/DOM tests and native HTTP delay/404 checks. All original assets, V5 motion/live VFX and numerical/question/save/RNG owners remain intact. Human recognition remains proposed validation.

## Final verification and diff audit

The fresh full serial suite passes **1,085/1,085**, zero failed/skipped, in 477655ms. The focused run passes21/21. The five new cases are included in the full run. Clean before-fix replays fail as expected: priority1/2 and fallback3/6. Logs and exact source hashes: [integration.json](../../verification/icon-loading-20261025/integration.json).

Native production checks pass all five recorded groups: held HTTP background responses/foreground Weak, all-functional-bitmap404s in real BM/Large combat and map, actual Normal/English→Large/BM switches, actual standalone boot/error fallback with zero HTTP, and all registered fallback meanings decoding at28/44/64px. Raw saved gameplay remains identical. A separate verified-image consumer check passes all31 Artifact Codex images, actual Passive/pose/reset and all17 Tutorial chapters, with no raw asset requests or page errors.

Syntax and production/portable builds pass. All678 source and679 production manifest resources match their actual hashes; the production app matches the unchanged developer instrumentation. Final runtime bytes match the snapshot used during the full run. The final diff preserves all original assets, numerical/card/question/save/RNG owners, V5 motion/live VFX, language, audio, loader budgets and DOM patcher. Only two runtime implementations plus derived version/cache metadata, tests and scoped documentation change. No additional issue was found within this diff's checked scope.

Main was rechecked at the reviewed6c49f39 snapshot before publication. The non-forced feature update uses the expected old feature head; actual branch commit/tree/version and unchanged main are read back in the final handoff. No main update is authorized.

---

# Historical main integration — 2.39.0

Main publication is now explicitly authorized. The current integration audit
and fresh evidence live in
[STATUS_ICON_POLISH_MAIN_2_39_0.md](../../STATUS_ICON_POLISH_MAIN_2_39_0.md).
The preview audit below is retained as history; its branch-only boundary is
superseded for this integration.

# Icon branch audit and handoff

| Field | Checked snapshot |
| --- | --- |
| Date | 24 October 2026, Asia/Kuala_Lumpur |
| Master SOR | 1.2.0; read with main documentation audit |
| Base main | `6376a222169815af582cf55aa4794f3c809a3515` |
| Runtime base | `990541d57c6df96cefb21eddc7a365d1d989a74d`, game 2.37.0 |
| Existing remote branch | `codex/icon-clarity-audit`, `b18c4c99d28530026f8d90d28964569c2f7af610` |
| Git relationship at start | Original icon commit already merged into main; new work advances its branch from current main. |
| New preview | 2.38.0-icons.1; branch-only authorization |
| Overall status | **VALID within the recorded icon/UI integration scope**; explicit limitations below. |

## MASALAH DISAHKAN — initial audit and corrections

| ID | Priority / confidence | Evidence at runtime base, effect and scoped correction |
| --- | --- | --- |
| ICON-001 | P1 / high | `dist/app.js` status tiles showed a raw value without a unit. `Weak 2` did not explain the configured −25% or duration. `combat-status.js` now supplies run-aware units/short effects/timing; inline and comparison/detail surfaces use them. |
| ICON-002 | P2 / high | `combat-status.js` localized only three current-rule effects; VFX maintained a separate name dictionary. Most names and panel prompts remained English in BM. All ten status records and status controls now use the shared BM/English owner; VFX consumes its names. |
| ICON-003 | P2 / high | `icon-clarity.css` used 10px phone labels. Readable units/names now start at 12px; a stored Large choice uses 14px without scaling cards/arena. |
| ICON-004 | P2 / high | The ten original files were distinct, but the three shield-family pictures shared prominent shield/gold framing. This is a readability/design judgment, not measured recognition failure. Three approved generated variants emphasize different central silhouettes. |
| ICON-005 | P2 / high | The comparison panel showed name/count/type while full effect text required another action. It now displays each actual short effect and timing alongside units. |
| ICON-006 | P2 / high | Existing checks covered successful loads and semantic keys but no real delayed/failed icon response. Named pending controls, bounded priority warming and local SVG error fallbacks are added and tested with actual HTTP delay/404 responses. |
| ICON-007 | P1 / high | Final VFX testing found the taller stacked rack moved the aura above the short landscape arena at 844×390; a subsequent intent-clear assertion caught overlapping intent text. Short landscape now places HP/statuses side by side and anchors intent above the panel. The final 24-state and VFX browser suites pass; before logs are retained. |

No numerical mechanics, canonical questions, save/RNG contracts, original card/artifact artwork, source hero/enemy motion, audio or analytics consent is part of these changes. DOC-001/DOC-002 in the main documentation audit remain acknowledged upstream follow-ups; this icon task does not change AGENTS topic/MC policy.

## RISIKO BERPOTENSI

| ID | Priority / confidence | Basis, remaining check and boundary |
| --- | --- | --- |
| ICON-R1 | P2 / medium | Actual glance recognition may differ from automated geometry/grayscale checks. Physical device and pupil checks remain needed before claiming recognition/comprehension outcomes. |
| ICON-R2 | P2 / medium | Publish Handler may later add broader asset scheduling. Its integration should consume the fifteen-icon manifest and avoid duplicate priority lists; this branch adds no cache/download-screen ownership. |

## PENAMBAHBAIKAN

The six user-selected improvements above are implemented in this set. No additional out-of-scope feature is activated. A later human recognition check can compare the three variants at actual game sizes; this remains validation work, not a fabricated test result.

## Final diff audit and checks

Fresh evidence belongs to [integration.json](../../verification/status-icon-polish/integration.json) and its raw logs/reports. The full serial run passes **932 tests**, zero failed/skipped. After the CSS-only landscape correction, all final runtime JavaScript bytes still match that full-run snapshot. The final focused run passes **34**, zero failed/skipped; the earlier broader UI check passes 118. Syntax and final production build pass.

Final production evidence includes 24 viewport/language/size states, no intent overlap or clipped status content, real deferred/404 responses and zero-network portable variants; 41 existing icon-regression states; all 17 tutorial chapters/11 practice chapters; exact saved-state/three-Master-profile VFX checks; and static-subpath production Dev isolation. All 84 runtime resources match the built output with the expected Dev app instrumentation, while all16 tutorial image hashes/85 source hashes match.

Strength explanations were checked against actual ordinary/Master Twin Shot plans: Strength contributes to both ordinary hits and only the primary Master hit. Text therefore refers to eligible hits/card preview rather than inventing one universal allocation rule. No numerical rule was changed.

Final diff preserves original card/artifact assets/renderers, numerical data, questions, saves/RNG, source motion, audio and collection owners. The main documentation update was incorporated without resolving its unrelated DOC-001/DOC-002. No additional blocking issue was found in the recorded scope. Human recognition, physical devices and wider Publish Handler deployment remain explicit limitations. The actual remote branch ref/SHA is verified in the final handoff; main publication remains outside this instruction.
