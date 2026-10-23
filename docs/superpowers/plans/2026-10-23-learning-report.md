# Learning Report Implementation Plan

> For agentic workers: use superpowers:executing-plans to implement this plan inline, with one fresh whole-branch review at the end.

**Goal:** Make the player's Learning Report clear and move collection setup into developer tools, on `education-report` only.

**Architecture:** Preserve the canonical analytics store, sync protocol and game owners. The shared report renderer owns views and presentation; host/Practice own navigation and downloads. A development-only local handler owns project receiver configuration.

**Tech stack:** Existing vanilla JS/CSS, Node, jsdom and native Chromium; no new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-23-learning-report-design.md`.

## Global constraints

- Branch `education-report`, base `d76ad6e`, version `2.31.0-report.1`; never update main.
- Preserve art/audio/motion, all 120 questions, game saves, RNG and receipt/consent isolation.
- Three report views; BM/English; native keyboard/touch controls and local dialog scroll.
- No in-game CSV controls or Google URL inputs. One disclosed JSON recovery action remains.
- Receiver URL is public configuration; the private Sheet is not exposed.
- Developer configuration writes are loopback/same-origin only, validated and stale-write guarded.
- Existing explicit browser destination choices remain; adopting the project default is explicit and pauses sharing.

## Review focus

- Storage/online events arrive while a player is reading Details or typing a question filter: view, focus and scroll survive.
- An old browser override differs from a new project default: the player can explicitly adopt the new default without inherited consent or lost pending entries.
- A cross-origin/LAN/stale developer write must not modify configuration or player saves.
- An offline/quota failure must leave a reachable, credential-free recovery file and truthful delivery copy.
- Narrow/short BM layouts must keep controls reachable without changing the background art scale.

## Task 1 — Shared report and player flows

Files: `dist/analytics-ui.js`, `dist/analytics.css`, `dist/app.js`, Practice `preview.mjs/html`, `question-feedback-ui.mjs`, `analytics-practice.css`, generated Practice and relevant UI tests.

Interfaces: `DCAnalyticsUI.html({report,status,language,view})`, `syncHTML(status,language)`, `selectView(root,view)`, `filterQuestions(root)`. Host and Practice retain the selected view. Delivery adds `useDefaultDestination()` and status flags without changing `DCLearningSync`.

- [x] Add failing tests for one visible view, source/view persistence, absent URL/CSV controls, question search, single JSON recovery, comment sharing navigation and explicit default adoption.
- [x] Run each regression against the old behavior and inspect the expected failure.
- [x] Implement the smallest shared renderer/host/Practice changes and truthful feedback copy.
- [x] Rebuild generated Practice; run report, Practice, feedback and delivery suites.

## Task 2 — Local developer collection setup

Files: `tools/dev/collection.cjs/js`, Developer Hub markup/style, `tools/dev/server.cjs`, `server.cjs`, site configuration comments, receiver source/bundle and tests.

Interfaces: development request handler accepts exact `{googleScriptUrl,revision}`; GET returns the validated default plus revision. It writes only the known public config file atomically. Hub config UI is independent of sandbox player storage.

- [x] Add failing endpoint tests for strict URL/shape/body validation, stale revisions, same-origin/loopback restriction, production denial and unchanged unrelated files.
- [x] Add receiver owner-identity regression first, then implement the guarded public setup wrapper and regenerate the bundle.
- [x] Implement Hub collection panel, local endpoint and browser-state feedback; retain dev collection isolation.
- [x] Run all developer/receiver/delivery tests and real browser operator/player checks.

## Task 3 — Release and branch handoff

Files: package/release/cache entrypoints, SOR decisions/owners/changelog, Google setup guide, branch guide and verification evidence; browser tests and screenshots.

- [x] Update preview version and build deterministic generated assets/production output.
- [x] Run complete serial Node/jsdom suite, syntax checks, production/resource-hash/preservation checks and native Google/offline/developer/report flows.
- [x] Review screenshots in English/BM at desktop, phone and short landscape sizes and correct any measured clipping.
- [x] Request one fresh-context read-only whole-branch review; address material findings with reproductions.
- [x] Publish the tested tree to `education-report` using native GitHub tools; verify remote tree/commit and confirm main was not written.
- [x] Give Ijamm the branch run commands, changed player flow and developer-only setup location, with live Google limitations.
