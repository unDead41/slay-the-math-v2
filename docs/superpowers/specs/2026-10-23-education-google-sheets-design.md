# Google Sheets collection design

## Intent and authorization

Ijamm accepted Google Sheets + Google Apps Script as the simpler collection option and explicitly requested implementation on a feature branch before main. Work is on `education-google-sheets`, based on main `e2c323a` / 2.27.0. No main update or cloud deployment is authorized by this branch task. Preview version: `2.28.0-sheets.1`.

The existing analytics/outbox remains authoritative. Keep local recording, exact revision ACKs, concurrent immutable journals, comments/tombstones, curriculum mappings, gameplay RNG, balance, saves, art and audio unchanged. Sharing remains off until enabled for the chosen destination. No Google OAuth credential goes into the game.

## Approaches

- Existing CSV/JSON upload to Drive: immediately usable, but manual collection does not meet automatic reconnect delivery.
- **Chosen: Google Sheets + Apps Script**: Google hosts the small receiver; an operator deploys one supplied Code.gs file and pastes its web-app URL. Suitable for classroom-scale diagnostics within Google quotas.
- Existing SQLite receiver: retain as an optional local destination; it remains useful but is not required for Google collection.

## Boundaries

1. `learning-google.js` owns a lazy, abortable Google iframe/MessageChannel transport. Only HTTPS `script.google.com/macros/s/<deployment>/exec` addresses are accepted. No Google iframe/network before consent. Bootstrap uses a fresh 256-bit nonce and exact game origin; accept only nonce-matched Google-origin readiness, then exchange private requests on a transferred MessagePort. Support Google's nested HtmlService iframe, and same-origin Practice by attaching to the top game document. No `no-cors` or blind success.
2. `learning-delivery.js` composes the existing `DCLearningSync` client. The ordinary SQLite namespace stays compatible; each Google deployment has its own SHA-256 storage namespace, consent, identity and receipts. Changing destinations pauses sharing, closes old transport, retains all old data and queues known local records for the new destination. Cross-tab destination changes must take effect. Invalid saved configuration blocks delivery and preserves its bytes.
3. `tools/google-sheets/` owns source and a deterministic builder producing one copyable `Code.gs` outside public game files. Bundle the actual learning owner, analytics validator and a slim active bank; never substitute inferred correctness. Only the receiver dispatch/doGet are client callable; operator setup/helpers end in `_`.
4. Apps Script setup creates private Learning, Comments, _Records and _Clients sheets once. Client capability secrets are stored only as SHA-256. ScriptLock serializes writes. Prevalidate a complete batch and all conflicts before writes. Store canonical payload in <=16,000-character chunks; project readable learning/comment columns. Flush canonical rows and projections before exact ACK. A partial service failure returns no ACK and retry repairs projections without duplicate logical rows. Quota/lock failure leaves pending data on the device. No public bulk read/export route.
5. A collapsed collection-link control in Learning Report works in host and Practice, in BM/English. It stays outside async status replacement so typing/focus is retained. Display the active destination and paused/pending/confirmed state. Developer/file sandboxes never contact Google. JSON/CSV contain no capability secret.

## Operator flow and limits

Run owner-only setup in Apps Script, authorize the account, deploy **execute as me / anyone allowed by account policy**, and paste the /exec URL in the game's report. Default allowed game origins are localhost/127.0.0.1 port 4173; add a hosted game origin in the supplied operator constant when hosting. Deployment requires the operator's Google account; connected Drive tools do not deploy Apps Script, so code readiness and live Google deployment must be reported separately.

An optional site-owned `learning-collection-config.js` can distribute the same receiver URL to all players; a local report setting overrides it. Existing per-origin data does not migrate between different game addresses. No browser-closed sending or new PWA cold-start promise. Sheets is not a transactional SQL database; idempotent repair and no premature ACK preserve delivery despite partial writes. This is diagnostic data, not official TP or anti-cheat evidence.

## Acceptance

- Existing local receiver tests stay green; Google never inherits SQLite ACKs or consent.
- Actual canonical records/comments/tombstones upsert once, handle same-revision conflict, lost response, interruption and restart.
- Reject forged metadata, owner events, unsupported URLs, unsolicited/stale bridge messages, malformed replies and formula injection.
- Host and generated Practice expose configuration, preserve controls during status updates and retain gameplay/source bank.
- Run targeted tests, full serial suite, syntax, production/portable checks and native browser bridge/reconnect checks. Native Google wrappers may be simulated when no deployed endpoint is available; do not claim a live Google write.
