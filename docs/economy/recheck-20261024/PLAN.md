# Economy compatibility recheck

User authorises corrections and publication to balance/economy only. Main snapshot: 50d3af423cdc2240e949f4ddf29e023865304b65, game2.36.0. Old Economy remote df53579593937c2d71fcb6bb96409036ad575070 is already an ancestor of main (41 commits behind at start); inspect current implementation rather than replay old source.

1. Compare source owners, current Master candidate.4 and two-attempt education policy against historical evidence.
2. Reproduce/correct actual financial measurement defects, with failing regressions before changes. Do not retune Combat/Map or ordinary prices from unmeasured CP.
3. Regenerate seeded offer/source/ownership checks under actual Master bindings, current all-event two-attempt/deadline/cost matrix and transactions, plus matched economy observations from real two-stage engine campaigns.
4. Record fresh manifests/source hashes, numeric prices/profile/event tables, findings and Master handoff. Preserve historical cohorts as historical.
5. Run full unit suite and syntax/build as appropriate, actual browser economy checks, recheck main SHA before push. Publish only balance/economy. Existing dirty historical checkout is preserved; this task uses an isolated detached worktree based on current main.

Initial findings: Master artifact affordability used A.price instead of checkout E.shopPrice; Purse +40 inside a purchase was netted against gross spending/earnings. Three initial RED tests confirm these two defects and the missing current-binding experiment API. Existing economy tests passed except missing jsdom environment dependency; re-run with available /tmp/stm-education-qa modules.
