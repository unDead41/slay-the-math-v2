# Google Sheets Collection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Let players opt in to sending the existing durable education queue to an operator's Google Sheet without running a Node database receiver.

**Architecture:** Add an authenticated iframe/MessageChannel adapter and a destination-scoped wrapper around the unchanged outbox. Provide a generated Apps Script receiver with canonical validation, idempotent Sheet upserts and readable projections; integrate one shared BM/English setup control into host and Practice.

**Tech Stack:** Existing dependency-free JS/Node build, Google Apps Script V8/HtmlService/SpreadsheetApp/LockService, Node tests/jsdom, native Chromium.

**Spec:** `docs/superpowers/specs/2026-10-23-education-google-sheets-design.md`

## Global Constraints

- Branch `education-google-sheets` only; no main update or live deployment.
- Preserve 120 IDs/content, existing analytics/outbox semantics, balance, saves, RNG, artwork and audio.
- Sharing opt-in per destination; no credential in URLs, exports or runtime configuration.
- Exact ACK only after canonical storage and readable projections have flushed; partial writes repaired by idempotent replay.
- Existing per-origin storage and Google quotas remain limits, not promises of unlimited storage/offline cold start.

## Review Focus

- Google readiness from a nested sandbox must establish the right source without accepting an unsolicited Google frame.
- Old SQLite ACKs or cross-tab configuration changes must never silently grant Google consent or erase pending evidence.
- A partial projection failure after canonical write must be repaired before a later ACK.
- Deployment changes, pause/offline/pagehide and timeouts must invalidate stale messages without leaking capability credentials.
- Comments/formula prefixes and large Unicode payloads must remain inert and recoverable within Sheets cell limits.

### Task 1: Google bridge transport

**Files:** Create `dist/learning-google.js`, `tests/learning-google.test.cjs`.
**Interfaces:** `DCLearningGoogle.normalizeURL(value)`; `createTransport({url,host}) -> {fetch,close}`. The fetch adapter implements existing /status, /register and /batch response contracts through a private port.

- [x] Write failing tests for accepted deployment URLs, blocked lookalikes/Drive links, no eager network, nonce/origin/source checks, timeout/abort and stale/invalid replies.
- [x] Run the file and observe missing behavior fail.
- [x] Implement lazy secure iframe bootstrap and request IDs, with top-document Practice support and explicit cleanup.
- [x] Run transport tests to green.

### Task 2: Destination-scoped delivery

**Files:** Create `dist/learning-delivery.js`, `dist/learning-collection-config.js`, `tests/learning-delivery.test.cjs`.
**Interfaces:** `DCLearningDelivery.createClient(options)` keeps enqueue/setEnabled/status/flush/start/stop and adds `setDestination(url)`; status adds destination kind/URL. Uses Task 1's transport without changing `learning-sync.js`.

- [x] Write failing tests for old local compatibility, isolated Google ACK/identity/consent, switch/reopen, cross-tab changes, bad storage and preserved pending exports.
- [x] Run tests red, implement storage/host adapters and destination switching, then run green.

### Task 3: Apps Script receiver

**Files:** Create `tools/google-sheets/receiver.gs`, `tools/google-sheets/bridge.js`, `tools/build-google-sheets.cjs`, generated `integrations/google-sheets/Code.gs`, `tests/google-sheets-receiver.test.cjs`, and a bounded test utility for external Google services.
**Interfaces:** `doGet(e)` serves bridge; `stmEducationDispatch(request)` returns `{status,body}`; owner setup `setupCollector_()` is not callable through google.script.run. Build bundles canonical owner/validator and slim current bank.

- [x] Test setup idempotence, authentication, canonical evidence and BM comments, wrong metadata/events, duplicate/old/new/conflicting revisions, prevalidation, interrupted projection repair, chunks and inert spreadsheet cells.
- [x] Observe tests fail, implement with ScriptLock/flush and deterministic source bundling, then run green.

### Task 4: Shared game/Practice setup

**Files:** Modify `dist/app.js`, `dist/analytics-ui.js`, `dist/analytics.css`, `dist/index.html`, `tools/build-education-practice.cjs`, source `learning/preview.mjs`, and appropriate UI tests; regenerate release/Practice.
**Interfaces:** Both call Task 2's wrapper and handle `destination-save`/`destination-local`; configuration inputs are outside `[data-analytics-sync]` so async status cannot erase edits.

- [x] Write and observe failing host/Practice tests for visible configuration, destination pause/requeue, typing/focus and Dev/file network isolation.
- [x] Integrate shared UI/client, bootstrap site defaults into Practice and preserve existing report/export/gameplay behavior; run affected tests green.

### Task 5: Verify, document and publish branch

**Files:** Update package/build scripts, SOR 10/13/15/DECISIONS/CHANGELOG, README, operator guide and verification/progress record.

- [x] Generate copyable script; document one-time owner authorization/deployment and local/report versus site-wide configuration.
- [x] Run full serial suite with jsdom, syntax, production/portable/resource checks, native bridge/reconnect and preserved-owner byte checks.
- [x] Obtain a fresh bounded whole-branch review and fix important findings with regression evidence.
- [x] Publish validated tree to `education-google-sheets` only; verify remote ref/tree and give Windows branch commands. Main stays untouched by this work.
