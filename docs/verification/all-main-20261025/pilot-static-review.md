# Pilot static review — cold URL offline

Known **P2/high/open**, scoped to local HTTP cold restart. This is separate from QA-248 retained-count accounting and is not a new three-branch regression. Pages is NOT_RUN.

The supplied ZIP hash and size match:30,121,890 bytes; SHA256 `ffef8954438640b2ecc671dfc620b57d3c0d5ee8d85b3b57f1d5d9d566f3c352`. Source is main `b3dc75005a89d6ce0248ddc125d6e0900351589a` /2.49.1. The bundle records6 PASS/4 FAIL/0 ERROR/0 MISSING.

A1/A3 have760 verified=available=CacheStorage keys760 before closure; A2/A4 retain331 startup files. All four have a controlling SW initially, but no cached HTML or asset manifest. All four time out on cold offline navigation; reconnect restores exact save/RNG. No save loss is demonstrated.

`source/dist/sw.js:13` bypasses navigation and keeps client configuration in memory (`3,9`). `source/dist/bootstrap.js:86` fetches the manifest with `cache:no-store` before SW configuration (`70–71,93`). Both source files remain byte-identical in the integration candidate: SW SHA256 `95c9bc9fb8d27731e6e9818bd12fe574269647635b9216601e1a5bd54a2f5667`; bootstrap SHA256 `a44edd71439423c9c7aacccff6c0a948dbada3b9385d0ef2d216a4063d233e44`.

The original collector uses the same retained profile/origin and closes/relaunches offline. However, its1MB HTTP cache, no-cache local server, persistent offline launch and20s navigation timeout do not isolate the first failed lifecycle component. Network logs only show ERR_ABORTED. This is strong evidence of a shell/manifest readiness gap, not proof of public Pages behavior or universal browser failure. The success path also needs to use the actual startup gate before testing Continue; that nuance does not invalidate the four observed earlier navigation timeouts.

One bounded, labelled A1 regression on final production is IN_PROGRESS_BY_QA. Record shell/manifest cache membership, actual SW registration/client lifecycle, navigation responses, startup gate and reconnect save equality. Do not rerun the ten-case pilot or count a regression as a new sample. No result is inferred here.

Evidence references remain inside the ZIP: REPORT.md; cases.jsonl; observations.jsonl; raw/A1–A4-cache-before.json; raw/A1–A4-console-network.json; raw/boss-comparator-attempt/collector.cjs; source/dist/sw.js; source/dist/bootstrap.js. No privileged save/deck/question/RNG file was extracted or copied. No browser, runtime edits, training or public write was performed by this review.
