# In-game questions — branch progress

24 October 2026 · `education-report` · proposed preview `2.31.0-report.3`.

User scope: clearer Question / Help / Result tabs and next actions; at most two
answers in Predict, Mystery events and Artifact trials. First wrong unlocks both
Hint and More Hint, without recording either as used until opened. Second wrong
reveals the solution and prevents further answers, including after reload.

Keep Education Practice and historical learning records unchanged. Use an ordered,
versioned game-policy event so old attempts retain their real assistance history.
Upgrade only active pending game questions. Preserve all 120 IDs, content, source
references, choice order, exclusion ledger, original artwork and RNG streams.

Preserve reward gates: failed Predict has no Focus/seal; failed Artifact continues
without the chosen artifact; event consequences settle once only after its terminal
result. The event timer never resets on retry or when switching tabs.

Plan: canonical policy + save/reward tests; consumer transactions; shared accessible
question workspace; native English/BM/phone/reload checks; full serial regression,
production/preservation checks; publish only this feature branch. Regenerate the
Google receiver from the same canonical owner and document deployment updating.

Status: complete. Canonical policy, consumer/save/reward transactions, shared tabs,
English/BM copy, timer cleanup, generated receiver and maintenance models follow
the new rules. Full-app native 6 flows / 18 geometry checks; all120 game component
360 states; Google service-boundary native 6 flows; Practice all120 / 5 viewports /
portable offline all pass. Final serial regression 793/793 passes with no failures
or skipped tests. Syntax/production and post-suite 685-file/78-resource checks
pass. 706 protected files including all606 original assets remain exact.

Publication scope: education-report only, from ceaaaf5. Main is not an authorized
write target. See GAME_QUESTIONS_VERIFICATION.md and its machine-readable evidence.
