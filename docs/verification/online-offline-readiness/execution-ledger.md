# SDD ledger — plan: docs/plans/online-offline-readiness.md
Adopted during completion, after baseline 1148/1148 and initial implementation. No prior task commits are claimed. RED/GREEN logs are durable in docs/verification/online-offline-readiness.
Pre-flight: Task 1 produces preference, release-bound retained-cache and worker contracts consumed by Task 2; native fixtures use the actual engine. No interface conflict found.
Ruling: Use an optional gated pet adapter plus bundled FAQ because current main has no external pet/backend — does not invent a provider or key — external pet owner must integrate the published contract before live free chat exists.
Ruling: Relocate only generated build artifacts and disposable browser profiles to task-owned RAM storage because this machine has a full overlay disk — production source/build logic remains unchanged — physical-device and OS-reboot durability are not established by this environment.
Task 1 focused gate passed before commit (worktree based on d77b3e0, tests: node --test tests/play-mode.test.cjs tests/play-mode-ui.test.cjs tests/offline-install.test.cjs tests/service-worker-offline.test.cjs → ℹ duration_ms 998.707026)
Task 1 native gate: native-storage-green.log passes 4/4; native-storage-red.log preserves absent-definition false entry before fail-closed fix. Syntax passed. Final completion/commit pending.
Task 1: complete (commits d77b3e0..39777a9, tests: node --test tests/play-mode.test.cjs tests/play-mode-ui.test.cjs tests/offline-install.test.cjs tests/service-worker-offline.test.cjs → ℹ duration_ms 1634.832951)
Task 2 evidence: native hosted14/14, storage faults4/4, portable3/3, Online preload9/9, combat continuity14/14 pass; source hashes match tested production.
Ruling: Keep original Tutorial captures/provenance and permit only the two exact optional showSaves hooks in the provenance guard — actual full-suite RED exposed legitimate Settings-only source drift and unrelated runtime edits still fail — a future Tutorial or broader app change still requires capture review.
Task 2 initial full suite:1177/1178,1fail,0skip; original log retained. Targeted provenance/Settings/Tutorial adaptation is now green; final full suite remains required. Product bytes unchanged since native PASS.
Final review: one fresh-context gpt-6-astra reviewer, read-only on a71410b. Two Important/P2 findings, no Critical/Minor. Root reproduced storage3RED and native gateRED; fixes are in the single authorized root pass, full suite pending.
Final: Ruling: Missing live provider/backend/animated pet remains outside this adapter — local FAQ and a gated integration contract are the available player behavior — live chat needs the pet owner's service.
Final: Ruling: New main2.49.1 is not merged into this pinned candidate — Master must preserve Idle changes and rebuild the combination — integration remains unverified until then.
Final: Ruling: OS reboot, physical devices, other browsers and hardware graphics remain unmeasured — real CacheStorage process-restart and software rendering are the demonstrated behavior — those environments may differ.
Final: Ruling: Human audio recognition is not established —85native decodes and muted real playback are verified — audible output/recognition still needs audition.
Final: Ruling: Earlier GPU/temp-space crashes remain unresolved environment evidence — no product GPU fix is claimed — hardware rendering may still expose a separate issue.
Final: Ruling: Portable success is separate from browser-cache proof — the two reports validate different delivery formats — neither establishes the other's storage behavior.
Final: Ruling: Inherited CI-247-01 and QA-248-PRELOAD-01 stay open — fresh native PASS is not a historical counter/CI fix — their original intermittent conditions may remain.
Final: Ruling: Mathematical answer revalidation is outside this resource change — evaluator/question bytes are unchanged and the baseline/numerical suite still runs — no new answer-by-answer textbook audit is claimed.
Final: Ruling: Exact two-hook Tutorial compatibility is retained — unrelated source mutations still fail and original captures remain unchanged — broader Tutorial changes require recapture/review.
Final: Ruling: Whole-origin compromise and arbitrary corruption after verification are outside a point-in-time readiness claim — readiness is reaudited and cold workers fail closed — later eviction/corruption can still require repair.
Final: fixed R1 Offline gate recovery — native review-gate-red→green, same Settings/Online entry assertions; suite1182/1182.
Final: fixed R2 retained same-key replacement — three installer RED→GREEN cases including warm audit/install and post-receipt corruption; focused36/36, suite1182/1182.
Task 2: complete implementation/verification (commits39777a9..0c3d1a2; npm test →1182/1182,0fail/skip,408366.788454ms; fresh restart14/14, Online9/9, portable3/3; publication remains the authorized final handoff step).
Final review: all Important findings fixed in one root pass; no Critical or deferred Minors; no second reviewer.
