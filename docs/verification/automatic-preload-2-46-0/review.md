# One fresh whole-branch review and root disposition

Review range6c49f398..0d6a350, read-only, no test/build/browser execution. Reviewer reported0Critical/1Important/1Minor; No to merge before fixes.

Important: historical persistent Set made cache eviction or later read-access loss count as available; automatic admission skipped missing bytes. Root reproduced actual CacheStorage namespace deletion and disk+session eviction. Fix pass reconciles current namespace metadata at gate/entry/recovery/settlement and5-second visible-page intervals, invalidates read-loss persistence, re-admits missing assets and supports explicit storage recovery. A pending older snapshot cannot satisfy a newer explicit recovery. Failed files are not retried merely by polling.

Minor report: successful foreground recovery left the old background-failed status. Root re-gradesImportant/P2 for this requested truthful-download feature, fixes in the same pass, with exact failure-count RED->GREEN. No unaddressed minor or second independent review.

Declined-to-judge list and root rulings:
1. Final suite/native results: root runs and records fresh fixed-source results; no prior pass is transferred silently.
2. Production/portable/hash reproducibility: root builds and checks every manifest byte/hash plus protected-owner parity.
3. Browser eviction/quota/worker platform timing: actual namespace deletion/recovery is exercised; physical eviction heuristics/quota and every worker lifecycle remain unmeasured.
4. Live deployment/multiversion/remote head: separate publication/readback; no live main change implied by work branch.
5. Physical FPS/RAM/classroom/audio: unmeasured, no smoothness guarantee claimed.
6. Domain/aesthetic correctness of unchanged math/bank/balance/art/VFX/audio: preserve exact owners/bytes, no replacement domain audit requested.
