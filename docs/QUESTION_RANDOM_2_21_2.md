# Gameplay question randomness — 2.21.2

## Confirmed behavior

Each new gameplay question is sampled uniformly from unused eligible bank IDs in the current run. The first Starting Artifact trial, later Artifact trials, Predict and Mystery share educationState.runUsedIds. Opening a question reserves its ID immediately, including wrong answers, timeout or abandonment. Correctness is not the condition for counting exposure.

Artifact and Predict use all unused items from the 120-question bank. Mystery uses all unused questions matching the event topic; its preferred list no longer narrows the random pool. Shop and Rest currently do not generate quizzes. Visiting or using those rooms does not clear exposure history; the next actual question still uses the shared ledger. This change does not add new quizzes or costs to those rooms.

New Run starts an empty exclusion set. Lifetime and mastery records remain available for progress, but do not exclude or rank the new run's questions. The seeded question RNG remains independent of combat/reward RNG. A fixed seed reproduces a fixed sequence for testing; a normal New Run receives its fresh game seed.

Retry preserves exposures in both stages, including a restarted Stage 1. Stage 2 checkpoint retries also retain questions opened after the checkpoint. Previously seen IDs are not injected back into the question pool. If all 120 IDs, or all eligible Mystery topic IDs, are exhausted, retain the existing exhaustion behavior without recycling questions.

Reload, language switching, Hint/More Hint and reopening an existing pending question do not select another ID. The same question/choices/attempts stay frozen until resolved or abandoned. Randomness applies when requesting a genuinely new question, not when repainting the existing one.

## Audit findings and changes

The run-wide exclusion ledger already existed, but the shared session selector ranked unused questions by difficulty and weakness before choosing among ties. Thus an early question could come only from a restricted Easy/skill subset. Mystery narrowed selection further to authored preferred IDs. Both restrictions are removed for rewarded gameplay through an explicit random selection policy.

Standalone Education Practice retains its adaptive Learning policy by default; its explicit Review selection and independent practice records are unchanged. Authored bank questions, answers, hints, IDs and mathematical content are unchanged. Only selection policy, Stage 1 Retry continuity and derived bundles change. The supplied source session module is extended with an optional policy; import-mechanics regenerates mechanics.js and the practice document from that source.

An old mechanics integration test required a different ID across two separate runs. That assertion contradicted current-run-only exclusion. It now checks seeded parity with a clean new run, fresh run coverage and retained lifetime/mastery evidence.

## Verification

- Across 1,024 opening Artifact seeds, all 120 IDs and Easy/Medium/Hard are reachable first.
- 120 interleaved Artifact/Predict/Mystery reservations remain unique across restore; subsequent reservations report exhaustion.
- A new run with a full lifetime profile selects the same seeded question as a clean new run.
- Mystery can reach all 40 items in its topic, including IDs outside its preferred list.
- Actual Shop purchase and Rest healing preserve the ledger before the next Predict.
- Stage 1 Retry preserves exposures; New Run resets them. Existing Stage 2 retry coverage remains tested.
- Pending question ID and Hint state survive reload without another reservation.
- Real browser flow: Starting Artifact → Predict → next-turn Predict gives three distinct IDs; reload preserves the third; New Run resets run exposure.

See docs/verification/question-random-2-21-2.json for actual checks and limits. No native Windows execution is claimed by browser tests on this host.
