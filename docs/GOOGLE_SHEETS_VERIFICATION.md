# Google collection preview verification

Branch `education-google-sheets`, version `2.28.0-sheets.1`, base `e2c323a` / main 2.27.0. This change publishes to the feature branch only. Main advanced separately during development; it is not reset or replaced by this work.

The implementation adds a destination adapter around the unchanged outbox, a nonce/origin-checked nested Google MessageChannel transport, a canonical Apps Script/Sheets receiver and shared host/Practice setup controls. It does not alter the 120 question owners, game balance, artwork, music or run saves.

## Evidence

- First full serial suite: **734/734**, zero failures/skips, 501444ms. Final full suite after review fixes: **738/738**, zero failures/skips/cancellations, **571815ms** on the frozen final code.
- Affected host/Practice/transport/delivery/receiver suite: **54/54** before the last private receiver codec correction. The corrected receiver then passed **10/10**, including all 120 canonical owners and a real multi-chunk replay regression.
- Native Chromium exercised the real Main Menu report, correct/wrong/Hint events, Google-like nested origins, actual MessagePorts, consent, lost response after receiver flush, pause/reopen, offline/reconnect, Practice srcdoc and desktop/mobile overflow. Only external Google services/HtmlService wrapping/RPC were simulated; this was **not** a live deployment.
- Production/portable builds and syntax checks pass. All **683 production files** match dist byte-for-byte; **76 runtime resource hashes** match entry-point cache keys. Portable artifact: **295650738 bytes** (reproducible, not stored in Git).
- **640 protected files** match the starting main: original artwork/audio, game engine and config, balancing/economy/map owners, card motion, question data/localization, canonical learning owner, existing analytics/outbox and related protected sources.
- Generated one-file receiver: **104645 bytes**, SHA-256 `f974f78feabc5850aa35a22c7bf1c72ddd414a836a502eb90f4e376a9fec2ca8`; independent review confirmed exact source/build parity. Private receiver source/bundle is outside public game roots.

## Review fixes

A fresh read-only whole-feature reviewer found two Important issues. Both were reproduced before the fixes, then independently verified:

1. A stopped/BFCache client could resume with its old destination and consent after another document changed the saved link. Start now reconciles configuration before transmission; a changed target pauses and a corrupt configuration blocks sending without replacing its bytes.
2. Formula quoting was not an injective encoding for canonical chunk boundaries. Each payload slice now has a fixed inert `json:` prefix, stripped strictly before reconstruction/hash validation. Valid 41KB owner records span at least three cells and round-trip `=`, `-`, original apostrophes and Unicode on exact retries. Each stored cell stays within 16000 UTF-16 units.

The strengthened native test also exposed a Practice report storage refresh replacing a typed URL. Full refresh now preserves the draft/focus; explicit destination selection resets to the selected link. A duplicate idempotent pageshow listener was removed. The final review has no open Critical/Important/Minor findings.

A superseded run overlapped the RED regression/edit cycle and was not accepted as final evidence. The final clean run above started after all product changes, used a separate log and completed with exit 0.

## Limits

No Google account has been authorized, no actual Google Sheet/deployment has been created, and no live Google account policy, wrapper behavior, network restrictions, latency, quota or classroom throughput has been measured. The operator must complete [Google Sheets setup](GOOGLE_SHEETS_SETUP.md), confirm a test row and retain the private Sheet. Public URL configuration alone is not proof of a functioning deployment.

The simulated services verify protocol/storage behavior and interruption repair, not Google's production service implementation. Collection depends on the game being open or reopened at the same origin, player consent and a reachable deployed receiver. Existing export/recovery remains available. [Machine-readable checks](GOOGLE_SHEETS_VERIFICATION.json).
