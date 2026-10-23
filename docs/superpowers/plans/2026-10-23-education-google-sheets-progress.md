# SDD ledger — plan: docs/superpowers/plans/2026-10-23-education-google-sheets.md

Base: e2c323abde649ed3421e7d2f65ff540770079386 / main 2.27.0. Branch education-google-sheets. User explicitly accepted the proposed Google approach and asked for implementation before main; no repeat design approval is required.

Pre-flight: Task 1 fetch adapter matches the existing outbox protocol consumed by Task 2. Task 3 dispatch uses the same envelopes; Task 4 calls the wrapper's existing client methods and explicit destination setter. No gameplay/data-owner changes.

Ruling: Keep the proven outbox unchanged and isolate Google storage through a wrapper — this preserves legacy/local tests and prevents cross-receiver ACK/consent reuse; costs a new destination adapter to maintain.

Ruling: Provide one copyable Apps Script file and owner setup rather than claiming a deployment through Drive — available tools do not deploy Apps Script or grant the operator's Google authorization; live deployment remains an explicit setup step.

Task 1: complete — six transport tests RED (missing implementation) to GREEN. Correct nested origin/nonce, lazy frames, port requests, abort and malformed responses covered. Builder-check: nothing important left.
Task 2: complete — seven tests RED to GREEN; additional destination-edit regression, ten total after final restart regressions. Existing outbox owner unchanged.
Task 3: implemented — seven missing-bundle RED tests to GREEN, canonical owner/feedback source reused. Additional 120-owner and older-replay repair checks added. Five cells each store a 15,995-character payload slice plus inert json: prefix; this covers the 65,536-byte entry bound including Unicode without ambiguous formula/apostrophe sanitization.
Task 4: implemented — four setup UI tests RED to GREEN; all 28 affected host/Practice tests passed. Site default bootstrap, disabled Dev/file setup, keyboard focus and typed text preserved.
Task 5: completed checks — final frozen-code suite 738/738, production/portable/syntax/native checks and clean independent review. Publish the validated tree through native Git only to education-google-sheets; remote ref/tree proof is recorded by the publication tools and final handoff.

Baseline: 42 existing collector/sync/UI tests passed before feature integration.

Final review corrections: stopped/BFCache resume now re-reads destination configuration before sending; two RED→GREEN regressions cover a changed destination and corrupted configuration. Practice full storage-event report refresh preserves typed URL and focus; native strengthened test reproduced the reset before the fix. Removed one duplicate idempotent pageshow listener.

Verification so far: first full serial suite 734/734, 0 skipped/failed (501444ms); final affected suite 54/54 (57441ms); native Chromium nested Google simulation confirms lost response/reopen, offline/reconnect and host/Practice; production/portable and syntax checks pass. A final full suite is running after lifecycle corrections. Live Google deployment remains unverified.

Whole-branch read-only review complete: no open Critical/Important/Minor findings after fixes. Independent reviewer verified 25 delivery/host/Practice checks and all 10 receiver checks; generated Code.gs is 104645 bytes, SHA256 f974f78feabc5850aa35a22c7bf1c72ddd414a836a502eb90f4e376a9fec2ca8. Multi-chunk regression reproduced exact-retry failure before prefix encoding, then passed '=', '-', original quotes and Unicode. Review set aside live authorization/deployment, actual Google wrappers/account restrictions/coercion, quota/latency/classroom throughput and remote publication; these are expressly unverified live/operator responsibilities, not invented successes.

Final clean suite: 738/738, 0 failures/skips/cancellations, 571815ms, command DOM_QA_MODULE=<jsdom> npm test. Earlier overlapping/superseded verification was excluded; no product file changed during the accepted run. All 683 production files equal dist, 76 resource hashes match, 640 protected source/art files match base; native nested Google transport/reopen/offline checks have no errors. Full evidence: docs/GOOGLE_SHEETS_VERIFICATION.{md,json}. Main received separate updates during work; this branch remains based on e2c323a and must be compared/merged normally later. No main ref update or live Google deployment is part of this publication.
