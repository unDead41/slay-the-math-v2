# Learning Report: a clear practice journal

## Authority and scope

Ijamm asks to harmonise the cluttered Learning Report, remove in-game CSV export/import, move the Google collection link out of the player flow and make reasonable implementation choices. Publish only `education-report`, based on main `d76ad6e` / 2.30.0. Main publication is explicitly excluded. The delegated design judgment means execution proceeds without another design-approval exchange.

## Approach

Use the existing vanilla JS/CSS report owner shared by the real game and generated Practice. A single scrolling document with additional disclosures still leaves unrelated tasks mixed together; a new dashboard application would duplicate storage and navigation. Choose three compact views: Overview, Details and Sharing. This is the implementation choice, not a claim that Ijamm specified these exact labels.

Overview presents answered occurrences, different questions and independent first tries, three real chapter bars, and focused revision actions or an honest empty state. Details contains secondary counts, SK/SP, session trends and a searchable question record. Sharing contains opt-in consent, delivery status and one disclosed JSON recovery download. Keep scope filtering explicit and Review separate. Sparse evidence never becomes a fabricated weakness or formal DSKP level.

The visual identity is the existing dungeon ink journal: navy `#101923`, raised ink `#172636`, gold `#e2c27c`, pale text `#f3f1e9`, muted `#bfc7d0`, ice `#8ad7e8`. Restrained Georgia headings pair with system UI body text and tabular numerals. The signature is three quiet chapter tracks with their evidence counts, rather than six competing statistic cards. No new artwork, fonts or dependencies. Native controls, 44px targets, visible keyboard focus and a bounded dialog scroll work at desktop, phone and short landscape sizes. Artwork geometry must not change when the report grows.

## Data and operator controls

Remove CSV download and native CSV sharing from report/comment/exit controls; do not remove existing saved comments, outboxes or the pure historical CSV formatter used by external tooling. There is no CSV importer in the current game. Preserve game-save import/export. Keep one JSON backup under Sharing for offline/corrupt/quota recovery, including learning records, saved comments, pending entries and current owner recovery, without capabilities or credentials. Comment controls open this shared Sharing view instead of duplicating file controls.

Google setup belongs in the development-only Developer Hub. A local, same-origin, loopback-only endpoint reads and atomically updates only the public `dist/learning-collection-config.js` default. Validate the strict Apps Script `/exec` URL with the existing normaliser; reject stale edits and malformed, oversized or cross-origin writes. Player/production servers expose no developer route. The sandbox still uses temporary progress and never sends records. Saving a project default is explicit, affects future player builds and does not enable consent. Preserve existing per-browser destinations and their consent/identity/receipt namespaces. Provide an explicit player action to adopt the organiser's current default, pausing consent through the existing destination-switch contract.

The receiver address is public configuration needed by the browser, not a secret or authentication boundary. The Google Sheet remains private. Carry forward the already-delivered owner setup fix: a selectable `setupCollector` checks active/effective account identity and invokes private `setupCollector_`, with no Sheet URL returned to web callers.

## Verification and limits

Test actual game/Practice flows, BM/English, source filtering, view/focus/search retention through async status, comment save/delete/exit, absence of CSV and URL controls, safe JSON recovery, no gameplay/RNG/storage mutation, explicit default adoption, developer endpoint access/concurrency/validation, and owner setup. Run targeted baseline, full serial regression, syntax, production/resource hashes and native browser checks; inspect real screenshots at 390x844, 844x390 and desktop. Google service boundaries remain simulated; the user's live Google account/deployment, physical Windows devices and classroom comprehension are outside local proof. `MODEL.zip` is unavailable and unrelated to this change.
