# Pet recovery guidance — 27 October 2026

Scope: resume the already-published pet feature and close its two deferred Minor findings. Repository `unDead41/slay-the-math-v2`, feature `codex/ai-pet-online-20261025`, starting SHA `d27155a7544d3fccd5b68d35c506c9d6ee47f5ab`. Main read first at `7a49fff83388347f0157616fc6b051ddbda4c694`, game2.52.0 / Master SOR1.3.0. Candidate stays2.53.0-pet.1. Existing branch-only authorization continues; main, original ai and paid/public activation remain outside this change.

## Initial findings and cause

| Finding | Priority / confidence | Evidence and effect | Resolution |
| --- | --- | --- | --- |
| The operator guide suggests an HTTPS endpoint enables file-origin Online, although the actual backend rejects Origin:null. | P3 / high | Starting guide step5 contradicts existing server origin validation and its audit erratum. Operators could configure an unsupported route. | Correct step5 to require a hosted HTTP(S) game URL, retaining portable local help and the current origin policy. |
| Rejected classroom codes and mismatched game/helper releases lose actionable recovery guidance. | P3 / high | The server emits safe status/code pairs; the widget throws a generic error and the canonical help adapter returns local FAQ. Five regression assertions reproduce the generic message. | Keep a request-scoped, memory-only allowlisted recovery key inside the widget. Match only401/UNAUTHORIZED or409/VERSION_MISMATCH to reviewed BM/English copy; keep local FAQ. |

No arbitrary failed-response body is rendered. Unknown/mismatched pairs keep generic fallback. The normal freshness check precedes error interpretation; cancellation clears the recovery key. Clear/retry/context/language/mode/close preserve the current owners. No shared adapter or backend change, automatic retry/reload, new training/simulation, numerical/bank change, or original-asset substitution.

## Evidence boundaries

- [RED](red-ui.log):19 widget tests,14 pass and5 expected assertion failures before the runtime fix. The new regression cases cover both languages, correct status/code pairing, arbitrary error-body suppression, usable local help, manual recovery without failed history, and late Offline cancellation.
- [Focused GREEN](green-pet.log):41/41 pass, no skip/cancel;19 API,19 widget,3 actual app consumers. [Syntax](check.log) exits0.
- [Full project command](full-node.log) exits1, recording1236 distinct PASS cases and two image-dependency failures, with no retained EOF summary. They are `all reviewed runtime derivatives decode with checked hashes, alpha padding and a common canvas` and `approved variants retain exact transparent padding and have verified native/export provenance`. The first command omitted IMAGE_QA_MODULE and its NODE_PATH did not include runtime Sharp. [Corrected one-case image probe](sharp-rerun.log) passes1/1; the [disjoint tail](tail-node.log) passes29/29, including the second image case and28 cases absent from retained full stdout. No pair overlaps: **1266 distinct recorded PASS cases across commands**, not a single-run all-green claim. [Exact selections](tail-selection.json), [gap derivation](coverage-gap.json), [case ledger](node-coverage.json).
- Fresh [native pet](browser/report.json)54/54 and [production cold-offline](offline/report.json)15/15 pass, including real new-process/server-stopped reopening, original pet/local maths and unchanged save/RNG. Controlled endpoint/provider fixtures are never live OpenAI evidence. [Production/portable build](build.log) exits0. Both aliases are identical318,208,896bytes. Source manifestfe0fe42d3d8705ecb0f93b31 and production4599ce7cacd82477dc5e6525 independently match all772/773 offline listed files; cold readiness binds production. Source/test hashes and exact checks are recorded in [evidence.json](evidence.json).
- The98 earlier tutorial pictures and their metadata are preserved at their original capture source. This change does not recapture or relabel them. Their app/engine and images remain unchanged; of111 original capture inputs,108 match and3 differ: pet-assistant.js, plus generated index.html/release.js content identities. The pet error states have their own new native captures. Strict media verification remains part of the full command.

## Final audit and limits

Code/prose diff whitespace checks pass. Raw Node reporter logs retain their original blank/trailing spaces; the staged all-file whitespace check flags those log lines. They are preserved as evidence rather than rewritten to satisfy a formatting check.

The two confirmed P3 findings are the only requested changes. The final diff also contains their tests, current-owner generated launchers/manifests, and documentation/evidence. No additional issue was found in the reviewed error mapping, stale-response boundary, local fallback, public payload/history or origin-policy scope. This is a coordinator review; no new independent agent review is claimed. The earlier independent review remains historical at its original source.

Live model quality, math explanation accuracy, latency, billing/retention, HTTPS/proxy operations, distributed/per-student quotas, physical devices, other browser families, pupil comprehension and long-term cache eviction are not established here. No new game-balance/win-rate campaign or ML training occurs. Existing CI-247-01, QA-248-PRELOAD-01 and AM-U01 remain with their owners. MODEL.zip is unavailable/unread and is not required for these fixes.

Activation still requires a server-side provider key/model, private classroom code, exact permitted origins and a hosted HTTPS backend. The existing [operator guide](../../PET_ASSISTANT.md) and [Publisher handoff](../../AI_PET_PUBLISHER_HANDOFF.md) own those steps. Do not paste keys into chat/source/player fields. Feature publication and any later main/public deployment are separate actions.
