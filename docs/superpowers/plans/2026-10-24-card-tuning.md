# Card-tuning follow-up Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans inline for this already authorized task. One fresh review at the end.

**Goal:** Ship the three approved tuning changes and corrected AI choice telemetry on the assistant branch with prior-save compatibility.

**Architecture:** Versioned effects adapter, archived v1 definitions/settings and reentrant run-aware resolver/config binding. Actual AI actions are observed separately from policy computations.

**Tech Stack:** Existing JavaScript/Node game, generated data, Node tests, jsdom and Playwright QA; no project dependencies added.

**Spec:** `docs/superpowers/specs/2026-10-24-card-tuning-design.md`

## Global Constraints

- Branch publication only: `balance/card-effects-20261024`; do not update main.
- Last Page 1 Energy, Draw 2 +1 empty; Recall 0 Energy + Exhaust; ordinary Mana Barrier 7X. Other card/profile numbers unchanged.
- Preserve original and v1 ordinary saves, paid choices, opened offers, HP, UID, RNG and receipts. Reject unknown versions.
- New ordinary identity `card-effects-2`; distinct Master candidate.5 save identity; release `2.38.0-card-tuning.1`.
- Preserve supplied artwork, icons, motion, audio, questions, language behavior, map and pricing algorithms.

## Review Focus

- A v1 pending Recall must still charge 1 on confirmation; a paid Read Ahead choice must not pay again after reload.
- Archived explanations and Shop metadata must use their own run's definitions.
- Reentrant/throwing archive calls must restore the current data/config afterwards.
- Recall at zero Energy must remain bounded by Exhaust, Discard availability and Hand capacity.
- Visible choice ranking must not add phantom enemy hits or Block use to actual metrics.

## Task 1 — Complete the compatible tuning release

**Files:** `tools/cards/effects*`, `dist/card-combat.js`, `dist/engine.js`, `tools/ai-playtester/experiments.cjs`, generated card/balance/entry data, focused tests/fixtures, current owner/SOR/audit/handoff documents.

**Interfaces:** Keep public engine methods unchanged. Extend generated ordinary data with `archivedEffectsData['card-effects-1']`; `CC.definitionData(run)` and reentrant binding select the active generation. Choice policy returns the same value; only its observation boundary changes.

- [x] Verify full clean baseline and freeze synthetic v1 receipt, pending-choice and Shop fixtures.
- [x] Write and observe RED real-play/value and AI-log regressions; characterize prior saves before versioning.
- [x] Implement exact values and v1 archive; observe compatibility regressions RED before adding run-aware archive selection, then GREEN.
- [x] Update bilingual bodies/notes and source invariants; exercise v0/v1/v2 previews, Shop prices and Retry/reload.
- [x] Verify seeded before/after results, full suite, syntax, production and native player/AI browser checks.
- [x] Audit final diff, obtain one independent review, fix Important/Critical findings through RED→GREEN and rerun required checks.
- [x] Commit verified tree, publish with expected old branch SHA and no force, verify remote tree/ref, and record handoff. Main remains read-only.
