# Master balance on main — game 2.27.0

Ijamm authorized publishing the completed Master update to `main` on 23 October 2026. This supersedes the earlier branch-only publication scope; see [decision](../../sor/DECISIONS.md#dec-20261023-master-main--master-balance-on-main-2270).

## Release inputs and behavior

- Inspected main: `b67298bf14c530a30f03dbc8a2cb3362b0913a5d` (2.26.0, including Learning Report and optional analytics).
- Completed remote Master: `bd0c11d3580b56fd61fa6f26965d7c28c5a89803`, tree `d903cab64850bfdb3e4c7a3d86fe0081cc41a82f` (2.27.0). Its first parent is the inspected main; its other parents are the three specialist balance branches.
- Main publication adds the authorization/release documents to that tested Master tree. Runtime, data, assets, tests and tools are unchanged from the completed Master source. The release commit keeps main and Master as its ordered parents, preserving both histories.

New Run offers the explicit Easy/Medium/Hard balance playtest; direct links use `?balance=easy`, `?balance=medium` or `?balance=hard`. Common binding remains `master-1.3.0-candidate.2`. The integrated cards, synergy tooling, enemy profiles, frozen source-aware rewards, Shop, events, recovery and campaign carry are described in the [handoff](HANDOFF.md). Original art/audio/card motion, the 120-question bank, legacy entry/saves and analytics consent remain under their existing owners.

The pupil full-run goals of 90% / 70% / 50% remain unmeasured. Publishing this playtest does not change the interpretation or source provenance of the archived bot and card-power evidence.

## Fresh release checks

Run on 23 October 2026 against the completed Master source, after recording main publication authorization:

| Command/check | Actual result |
| --- | --- |
| `npm test` (including its normal build hook) | 707 passed; zero failures, skipped or cancelled. |
| `npm run check` | Exit 0 across the configured game, balance and analytics scripts. |
| `npm run build:prod` | Exit 0; player release generated, portable output 295,614,657 bytes. |
| `npm run test:balance-master-browser` | Easy, Medium and Hard passed real menu, gift question, route/battle, Predict, reload, valid save and decoded-art checks in Chromium; zero page/resource errors. |
| Generated-output comparison | No runtime, tool, test, module or package changes from the completed Master tree after rebuilding. |

[Fresh command output](validation/main-release.log) records this publication check. The earlier full [validation](VALIDATION.md), [review](REVIEW.md), raw campaign manifests and measured power reports remain intact. Dependencies and browser setup are the same as the preceding validation; no project dependency installation was needed.
