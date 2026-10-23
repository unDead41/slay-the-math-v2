# Education analytics and offline collection

Status: implementation on `education-analytics` only. User explicitly asks to build the previously discussed system before considering main. Main starting release is 2.24.0, including MUSIC(5), icons and Dev toggle. No main update or cloud deployment is authorized by this task.

## Intent and chosen approach

Use the hybrid approach discussed in chat: record learning and comments on the device, show a useful player report offline, queue chosen sharing, and resume delivery after connectivity returns or the game is reopened. Manual CSV/JSON export remains available. Online-only collection would break disconnected play; manual-only export is the current implementation and does not meet reconnection behavior.

No cloud Supabase project is connected. Build a real opt-in local collector backed by SQLite, plus the client transport contract. An operator can later host this collector at the game's origin or connect another backend. No claim of a deployed cloud service. Player self-reports and operator exports are in scope; class accounts and a teacher web dashboard remain future work because that audience choice was not supplied.

## Player experience

Add Learning Report to the actual Main Menu and Settings, with the same report accessible from Education Practice. Use the existing Ink/gold visual system, simple English/BM and color-only rich-text rules. Report has topic bars, SK/SP breakdown with sample counts, independent/support/retry/reveal counts, a session trend, linked Basics and targeted review recommendations, plus CSV/JSON downloads. Empty rows show Not assessed; sparse evidence shows Not enough evidence. Do not assign official TP levels or diagnose a weakness from a single mistake. Keep original question randomness/no-repeat, card values, art, voices and saves.

Default records remain on device. A clearly worded share control enables sending learning records and comments to the current game's collector. Status distinguishes on-device, offline/waiting, sending, received, receiver unavailable and save failure. No sent state before an acknowledgement. Closing the game suspends work; opening resumes pending work. Do not promise background sync while closed.

## Evidence and curriculum

Canonical bank is form4-review-1.6.0, 120 questions with curriculumStandards SP IDs and learning.skillIds/foundationId. Use these IDs as the mathematical owner; supplement verified SK/SP names in a small curriculum registry sourced from the supplied DSKP Form4 pages, never infer topics from card art. Group by topic, SK and SP. Multi-tagged questions may appear in each relevant group but totals count each occurrence once. Minimum evidence is three distinct answered question IDs; any status thresholds are provisional implementation defaults, not classroom validation.

Track gameplay and Practice Learning independently; Review stays separately filterable and excluded from the default progress/weakness calculation. First-try accuracy, first try without help, supported correction and correction after retry remain distinct. Opened/revealed-without-attempt records are not counted as wrong answers. Unscored bank exhaustion contributes nothing. Question feedback reports describe content quality independently of learning outcomes.

Existing owner event streams are captured without changing them or gameplay RNG. A saved pending record continues updating the same analytics occurrence. Different genuine runs/Practice resets get different occurrence/session identities. Opening/rerendering/exporting a report must not add attempts. Older run records can be imported once; label observation time as capture time, with no invented answer duration/history dates. Developer sandbox records and network collection stay isolated.

## Contracts

### Learning owner: dist/learning-analytics.js (UMD DCAnalytics)

`createStore({storage,bank,curriculum,now=ISO clock,idFactory=secure UUID})` returns:
- `capture(session,{scope,sessionId,source,questionIds,language})` => `{changed,changedRecords}`. Scope is gameplay/practice/review; restrict to questionIds when supplied. Records contain canonical metadata, a cloned validated owner record, scope/session/source/language, stable id, firstCapturedAt/updatedAt. Do not mutate the session/run/bank.
- `getSessionId(scope)` and `startSession(scope)` for stable Practice identity and explicit reset. Gameplay caller supplies saved run started/seed identity.
- `records()` => fresh merged safe snapshots, with source schema/bank version retained.
- `report({scope='all',language='en'})` => totals, topics, contentStandards, learningStandards, skills, sessions, recommendations, and question details; `all` excludes review.
- `exportData()` structured envelope and `csv()` UTF-8 CSV with formula neutralization.
- read-only `error` for unavailable/corrupt/full storage; preserve corrupt bytes and keep new observations exportable in memory. Same-origin instances merge per record on writes and refresh reads.

Store key `slay-the-math.learning-analytics.v1`; it is independent from run, seen history, Practice and feedback keys. Up to 5000 occurrence records, with visible error rather than silent eviction. Minimal snapshot metadata uses questionId, bankVersion, topicCode, chapter, curriculumStandards, skillIds/foundationId and validated attempt/support evidence. No name, email, full run, device fingerprint, audio or combat state is collected.

### Sync owner: dist/learning-sync.js (UMD DCLearningSync)

`createClient({storage,fetch,endpoint='/api/education',online,now,crypto,onchange,host})` returns `enqueue({id,kind,payload})`, `setEnabled(boolean)`, `status()`, `flush()`, `start()`, `stop()`. `start` owns online/offline/retry listeners; stop cancels owned resources. Kinds are learning-record/question-feedback. Default disabled; persist opt-in. Payload uses stable logical id; each changed payload gets monotonic numeric revision. Same payload/rerender does not enqueue again. Pending upserts merge across instances. Partial/stale acknowledgements remove only the exact acknowledged revision. Malformed/failed requests retain pending bytes. Retry is bounded/backed off; storage errors stay visible and exportable. No dependency on navigator.onLine alone as proof of delivery.

Use secure per-device random client ID/secret stored only in the sync key. Never use gameplay RNG or an embedded admin secret. Endpoint status discovery distinguishes a regular static game from a configured collector. Network work is disabled in Dev sandbox. Queue has 5000 pending logical-entry bound with explicit failure; never discard unsent entries to make room.

HTTP API: GET `/api/education/status` returns `{protocolVersion:1,enabled:true}`. POST `/register` body `{clientId,secret}` registers a random capability idempotently; a conflicting secret must fail. POST `/batch` authenticates `X-STM-Client-Id` and `Authorization: Bearer <secret>`, body `{entries:[{id,revision,kind,payload}]}` <=25, returns `{acknowledged:[{id,revision}]}` after durable DB commit. Same-origin only (no public CORS); bound body sizes, validate IDs/types/known question metadata, never expose other client rows. Old revisions never overwrite newer ones. Pending payloads are diagnostic client evidence, not official assessment or anti-cheat claims.

### Collector

`tools/analytics/collector.cjs` provides a Node HTTP handler and SQLite owner, optional Node22.13+ requirement. No new game dependency. Separate `tools/analytics/server.cjs` serves the existing game with this handler and injects only a public same-origin endpoint hint. Bind localhost by default; deployment/network binding is an operator choice. SQLite path is outside dist/release-prod and git-ignored. `tools/analytics/export.cjs` produces operator CSV/JSON with no unauthenticated bulk export endpoint. Include start/export npm scripts and clear Windows instructions. Test actual SQLite persistence, authentication, idempotence, stale revisions, invalid payloads, access isolation and export.

### Practice integration

Builder embeds the same analytics/sync/UI modules in the folio without extra requests; same-origin storage shares the report with host. Capture Learning on actual transitions and persisted records; explicit Learning reset rotates analytics Practice session identity and retains prior analytics. Review remains separate. Capture feedback as question-feedback revisioned upserts, including later deletion tombstones when shared. Add a small report entry and sharing state; revise exit text only when configured/acknowledged rather than claiming automatic delivery unconditionally. Preserve original feedback export, user text and native exit behavior.

### Host/UI integration

Host observes current run's runUsedIds only, so inherited lifetime records are not duplicated as this run's attempts. Stable `started:seed` gameplay session key; source lookup uses current consumer and completed/source receipts when possible, otherwise gameplay. Observe before saving/reporting and enqueue changed records without changing run schema. Include modules before app and version/cache build inputs. Pure report renderer owns labels/graphs and escapes all user content. Charts have text values, keyboard access and narrow viewport layout. Standalone file/offline builds keep local reports; collection requires HTTP receiver.

## Verification and boundary

Meaningful red-first tests per owner, full npm test with jsdom, syntax/build/production/portable checks, unchanged canonical question bank hash, native browser phone/desktop report and real question/Hint transitions. A real HTTP/SQLite collector test must lose a response after commit, retry with no duplicate and recover on reopen. Source metadata/DSKP mappings verified for all 120 IDs. Review whole branch once; fix important findings with reproducing tests. Publish the reviewable branch and verified Windows commands; never update main.


## Final implementation refinements from verification

- Gameplay capture uses the existing read-only Q.runIds/Q.getSession projections, supporting confirmed receipts from older saves without importing unrelated lifetime records. Scoped linkSession aliases preserve Retry continuity without adding a field to the run save.
- New occurrence IDs are learning:SHA256([scope,resolvedSessionId,questionId]); secure UUIDs remain session identities. Immutable per-snapshot and alias journals protect concurrent writes, and recovered healthy journals stay exportable beside a corrupt aggregate projection.
- The outbox writes immutable payload/receipt journals bound to logical ID, revision, kind and payload fingerprint. A same-revision content conflict returns atomic HTTP409 {conflicts:[{id,revision}]}; the client validates, preserves its latest edit and rebases once. Concurrent capacity overflow remains readable/exportable and blocks further admissions with a visible warning.
- Local JSON exports include ownerRecovery snapshots in addition to collected learning/comments/pending records. They contain no client capability secrets and are never enqueued as network payloads.
- Capture/enqueue errors do not block core game or Practice owner saving/rendering. Network unavailability is distinct from a local save failure.

Production preflight rejects SQLite/DB files in the public game tree before copying; stale release output is removed on rejection, while source data remains intact.
