# Combat Card Motion Implementation Plan

> Execution: implement sequentially in this session, using the executing-plans workflow.

**Goal:** Animate real pile transfers and all ten Passive triggers without making gameplay depend on animation.

**Architecture:** `card-flow.js` holds a per-action WeakMap journal; validated engine clones merge their journal only on commit. `card-motion.js` consumes transfers and new combat-log entries after the normal render/save, using a cancelable, noninteractive overlay. `card-motion.css` owns motion appearance.

**Tech Stack:** Existing JavaScript UMD modules, DOM/CSS, Web Animations API, Node tests and Playwright. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-23-combat-card-motion-design.md`

## Global constraints

- Preserve source art, balance, RNG, save schema, audio and question behavior.
- Observe actual committed transfers, including a UID discarded and redrawn in one action.
- Hidden cards remain face down; Motion Off and OS reduction use the existing static UI.
- No animation timer performs an engine action or saves a result.

## Review focus

- Atomic clone validation must discard failed journals.
- Rapid actions and modal choices must clear clones and restore every real card.
- Refresh/Continue must not replay previous Passive activations.
- Zero/capped effects must display actual amounts, not source requests.
- Viewport changes and offline URLs must not leave stale or broken overlays.

## Task 1 — Exact observational transfers

- [x] Add meaningful failing engine-flow tests, including End Turn reuse, Recall, Exhaust, choices and passive swap.
- [x] Create `dist/card-flow.js` with `begin(run)`, `fork(parentRun, childRun)`, `move(run, card, from, to, revealed)`, `end(token, commit)`.
- [x] Instrument existing transfer sites in `dist/engine.js` and `dist/card-combat.js`; preserve transaction validation.
- [x] Verify ordered transfers and identical serialized gameplay with/without capture.

## Task 2 — Presentation and app integration

- [x] Create `dist/card-motion.js`: pure trigger descriptions and transfer planning; cancelable DOM controller with `capture`, `play`, `cancel`, `destroy`.
- [x] Implement backs, arcs, embers, named Passive cues and badge pulses in `dist/card-motion.css`.
- [x] Connect the existing `act`, render and modal/page lifecycle in `dist/app.js`; add resources to `dist/index.html` and syntax checks.
- [x] Verify actual browser transfer paths, all ten trigger visuals, rapid input, motion settings, modal completion and viewport cleanup.

## Task 3 — Delivery

- [x] Update SOR 11, decisions and changelog with actual implementation and verification.
- [x] Run full Node suite, syntax checks, targeted browser checks and production/offline build.
- [x] Review diff, commit and publish the feature branch for Ijamm to try; keep main integration separate.

## Verification and review record

- Original full baseline could not load five optional DOM files without jsdom; no baseline gameplay failure was found. The final existing jsdom 26.1 QA harness ran the full suite: **482/482 passed, zero skips**. A trial with jsdom 30 was abandoned because unrelated all-bank DOM checks were excessively slow. No dependency was added to the game.
- Additional real post-transfer validation-rejection regression: targeted journal/Passive suite **11/11 passed**.
- Syntax checks, production build, all-ten production browser paths, 1920/390/844 viewports, rapid input, modal/resize cleanup and actual network-blocked standalone browser smoke passed.
- Fresh read-only reviewer found no runtime blocker. Its P2 QA finding was addressed: cleanup asserts a nonempty set of whole portrait articles using computed visibility, rather than inspecting inner action buttons. The corrected production-browser suite passed.
- Final visual polish and physical-device feel remain Ijamm review items. The read-only reviewer deferred offline rendering to the executor; the actual standalone browser check subsequently passed with zero requests/errors.
- Implementation choice: use the existing full portrait article for clones; native card action targets are removed from decorative copies. Same-action transfers are observed rather than inferred, preserving hidden card information and atomic rollback.
