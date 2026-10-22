# Slay the Math — Developer Tools SOR

Version: 1.1  
Date: 2026-10-23  
Status: Proposed requirements; documentation only; no game changes authorized.  
Owner: Ijamm

## 1. Purpose and scope

Provide a Developer Hub for directly testing scenes, cards and motion without playing through a complete run. The tools must exercise the real game renderers and rules. They must not become separate implementations of combat, cards, shops or events.

This document specifies requirements and an implementation sequence. It does not install scripts, change package.json, alter game balance, create a Git branch, commit or push. Audit the current repository before implementation; framework, file paths and exact APIs remain unverified.

## 2. Development and production commands

The requested workflow is supported conceptually through named npm scripts:

| Command | Required behavior |
| --- | --- |
| `npm run start:dev` | Start development mode with access to Developer Hub and the regular game. |
| `npm run start:prod` | Build the production game, then serve that build locally for player-mode verification. Fail if the build fails; never serve an old build after a failed build. |
| `npm run build:prod` | Produce the player release artifact without starting a server. |
| `npm start` | Optional alias for local production preview; adopt only after checking existing project scripts. |

Use `npm run start:dev` and `npm run start:prod`, rather than `npm start dev` or `npm start prod`. Arguments after npm start do not automatically select independent named scripts. The names above are a proposed contract, not commands installed by this document.

The production preview is a local verification server. Building or previewing does not publish or deploy the game. Exact underlying commands must follow the repository's existing tooling. If production is hosted elsewhere, use its deployment process separately.

### 2.1 Development mode

- Show an obvious DEV SANDBOX badge during test sessions.
- Allow opening the regular game or Developer Hub.
- Keep developer overrides and presets in a dedicated development namespace.
- Use the actual game scenes, components, rules and authored assets.
- Allow restarting, resetting and returning to the hub without reloading the full app.

### 2.2 Production mode

- Exclude the Developer Hub entry points and developer-only modules from the release artifact.
- Do not rely on hiding a menu button, a URL parameter, local storage or a runtime toggle as the production boundary.
- Production must not open developer tools through a direct URL, keyboard shortcut or restored developer preference.
- Shared gameplay components may remain in both builds; developer wrappers and override APIs must not be reachable in production.
- Bind the build mode to the actual build configuration, with release checks confirming the result.
- Production player saves and settings must remain compatible with the normal game.

## 3. Developer Hub

Tabs: Scenes, Cards, Motion, Presets and Logs.

Shared controls: Launch/Apply, Restart Same Setup, Reset to Defaults, Back to Dev Hub and Copy Test Details. Every panel must distinguish original values from temporary overrides. Exiting a session must clean up listeners, timers, tweens and audio owned by that session.

## 4. Dev Scene requirements

### 4.1 Combat and bosses

Provide searchable selection by real encounter/enemy/boss ID and display name. Do not hardcode a second roster. Display unavailable entries with a useful validation message.

Configurable setup:

- Player current/max HP and existing combat resources.
- Enemy HP override, with authored default visible.
- Starter deck, saved deck preset or custom card selection.
- Initial hand, artifacts and supported statuses.
- Normal enemy behavior or a supported forced intent.
- Stage/environment when the existing encounter model supports it.
- Deterministic seed where supported.

Launch through the real combat initializer. A selected encounter must receive all required state, rather than merely jumping to a screen. Custom multi-enemy composition is conditional on actual combat support.

Actions: refill HP/resources, draw a chosen card, advance an enemy turn, force victory/defeat and restart. Forced actions must appear in the log and must not be treated as evidence that normal combat flow passed.

### 4.2 Shop

Open the real shop with its Cards, Artifacts and Remove Card tabs. Configure gold, inventory, deck, sold-out states, initial tab and supported encounter/voice visit count. Use current authored stock rules; the existing design expectation is six regular cards plus one sale card, three artifacts and card removal, subject to source confirmation.

Verify affordable/unaffordable purchases, exact-price purchases, duplicate purchase prevention, removal eligibility, empty stock, full background artwork and scrolling inside the content panel. Test rich text, tooltips, language and audio through the actual UI.

### 4.3 Rest

Open with full or low HP and a chosen deck. Exercise each supported rest action, including the real upgrade flow where present. Show actual HP/card changes inside the sandbox. Test maximum-upgrade and unavailable-action states.

### 4.4 Mystery events

List every event from the authoritative registry; search by ID/name. Configure relevant HP, gold, cards, artifacts and educational challenge state. Exercise each supported choice and branch.

Two entry modes:

1. Normal Conditions: evaluate normal eligibility.
2. Force Preview: bypass event appearance eligibility only, clearly labelled. Do not silently bypass the costs or eligibility of choices inside the event.

Provide repeatable seed/outcome controls where supported. Restart restores the pre-event snapshot. Include educational question, correct/wrong/timeout outcomes, Hint and More Hint where the event uses them. Developer preview must not mark questions as seen in the player's run or lifetime history.

### 4.5 Supporting scenes

After core scenes: artifact selection/Dungeon Master, map, card reward, victory, defeat and menu previews. Permit first/second/third encounter voice checks where authored. Include reward whole-card selection and result-timer freeze checks when those features exist.

## 5. Dev Card requirements

### 5.1 Browser

Read cards from their authoritative definitions. Search name/ID; filter Attack, Defend, Skill and Passive, upgrade availability and Focus support. Switch BM/BI and report missing assets or text. Newly registered cards must appear without manually updating a developer list.

### 5.2 Valid state matrix

| Card type | Base | Upgraded | Focus | Upgraded + Focus |
| --- | --- | --- | --- | --- |
| Attack/Defend/Skill | Yes | When supported | When supported | When supported by the real rules |
| Passive | Yes | When supported | Not applicable | Not applicable |

Display four comparable previews where valid. Unsupported states must show Not Available; do not invent values. Passive cards must never show a Focus toggle.

Use the actual calculation path for upgrade and Focus. The order and interaction must be verified from source and the authoritative card mechanic specification; this SOR does not introduce balance values.

### 5.3 Rendering checks

Check whole frame, icon containment, long names, cost, numeric effects, upgrade differences, Focus glow, tooltip and rich text. Include mathematical fractions, set symbols and multiline content. Preserve term categories: calculation purple, mathematics terms pink and game terms green, using the game's established styling.

Preview the real contexts: hand, hover, reward, shop and large detail view. A large standalone preview is insufficient to prove hand/reward layout works.

### 5.4 Mechanics checks

Test in Combat launches the selected card state in a real sandbox encounter. Record before state, card state, expected outcome derived independently from the approved rule, actual result and relevant modifiers. Avoid comparing two displays that both use the same erroneous formula and calling that a pass.

Reset to an identical combat baseline for every comparison. Cover damage, block, draw, resource costs, statuses, turn timing and artifact interactions relevant to each card.

Include the player requirement of at most three active Passive cards per run, with a swap popup when replacing one, once that rule is implemented in the real game. The dev setup must distinguish valid player setup from a labelled forced diagnostic setup.

### 5.5 Future player collection

Reuse safe card rendering, search, filters and tooltips later. Keep developer overrides and spawn controls outside the player collection. Collection unlock rules, discovery policy and player-facing upgrade disclosure are future scope.

## 6. Dev Motion requirements

### 6.1 Reference limitation

MODEL.zip failed to become available. Actual Mathmon motion code/configuration has not been inspected. The requirements below are proposed; audit the supplied package before choosing a schema or claiming Mathmon compatibility. General Mathmon guidance supports preserving authored frames, anchors, direction assets and original artwork bytes.

### 6.2 Browser and playback

Select Alyssa, real enemies, bosses and supported NPC/VFX assets. List only available animations. Controls: Play, Pause, Restart, Loop, playback speed, frame step for spritesheets and timeline scrub where the underlying motion system supports it.

Distinguish spritesheet animation, tween motion and complete combat sequences. Unsupported controls must be hidden or explained rather than simulated inaccurately.

### 6.3 Temporary editing

Expose supported position, scale, origin/anchor, flip, frame rate, movement distance/duration, easing and impact/VFX/audio timing. Validate numeric ranges and show defaults. Runtime timing changes must not change game rules or damage calculation.

Overlays: origin, floor baseline, sprite bounds, starting/target position, impact marker and Alyssa/enemy size comparison. Fit transparent padding into the inspection logic; compare visible artwork bounds as well as texture dimensions.

Project checks: Alyssa faces RIGHT; enemies/bosses face LEFT. Verify floor contact, clipping, stable body size across frames, Skill frame consistency, boss size relative to Alyssa, and return to origin after repeated actions. Preview overrides must not alter original image bytes.

### 6.4 Save behavior

Editing is temporary by default. Offer Reset, Compare Original, Save Dev Preset and Export Proposed Configuration. Export includes asset/animation IDs, original values, proposed values, schema version and source revision where available. Applying exports to authoritative game configuration is a separate reviewed implementation step.

MVP includes playback, stepping, overlays and key controls. A full animation-authoring timeline is outside MVP.

## 7. State, persistence and determinism

- Use a dedicated sandbox state owner and save adapter; do not write player progression.
- Preview rewards, purchases, cards and achievements remain sandbox-only.
- Preserve player settings and save data; test both clean and existing-save entry.
- Ensure failure and exit paths also clean up temporary state.
- Store presets as versioned configuration with stable IDs, not duplicate masters.
- Presets referencing removed IDs show actionable errors instead of silently substituting content.
- Record every random input needed for replay; a seed alone is insufficient if timers or external randomness affect outcomes.
- Clearly mark scenarios that cannot yet replay deterministically.

## 8. Presets and diagnostics

Suggested presets: Boss Default, Shop Low Gold, Rest Upgrade, Mystery Event Branch, Card Four States and Motion Size Comparison.

Copy Test Details includes build/revision, module, scene/card/animation ID, language, preset version, seed, overrides, recent actions and errors. Avoid including unrelated personal data. Logs are bounded and clearable.

## 9. Architecture responsibilities

| Component | Responsibility |
| --- | --- |
| Build configuration | Decide dev/prod and exclude developer entry points from release |
| Dev Hub | Navigation and developer controls |
| Sandbox session | Initial state, reset, isolation and teardown |
| Content adapters | Resolve actual registries and call valid scene initializers |
| Shared gameplay systems | Authoritative combat, card calculation, rendering, events and motion |
| Preset store | Versioned developer setups |
| Diagnostics | Logs and reproducible test details |

These are responsibilities, not mandated filenames. Reuse existing project abstractions rather than creating parallel stores or masters.

## 10. Implementation phases

| Phase | Work | Exit criterion |
| --- | --- | --- |
| 0 | Audit repository scripts, rules, scene lifecycle, state/save ownership, card definitions and MODEL.zip | Confirmed integration map and unresolved items recorded |
| 1 | Dev/prod command contract, build exclusion and sandbox hub | Both modes start correctly; production has no reachable dev entry |
| 2 | Combat/boss, shop, rest and mystery event launchers | All registered supported content selectable; reset works |
| 3 | Card browser, valid state matrix and combat tests | Real rendering and mechanics exercised |
| 4 | Motion browser, playback, overlays and temporary controls | Repeatable preview/reset without asset changes |
| 5 | Presets, logs and export | Scenarios reload and failures are understandable |
| 6 | Regression and release verification | Player state isolation, cleanup and production exclusion verified |

Use an isolated developer-tools branch when implementation is authorized. Inspect the latest main first; do not overwrite concurrent music, language or card work. No implementation branch is created by this documentation task.

## 11. Acceptance checklist

- [ ] `npm run start:dev` exposes Developer Hub and normal gameplay.
- [ ] `npm run start:prod` builds successfully before serving player mode.
- [ ] Failed production builds do not fall back to stale output.
- [ ] Release artifact has no reachable dev routes, shortcuts or override APIs.
- [ ] Every supported registered enemy/boss can be launched.
- [ ] Shop gold/stock and real purchase/removal flows work.
- [ ] Rest actions and upgrade edge cases work.
- [ ] Every registered mystery event is searchable and restartable.
- [ ] Educational previews do not modify player seen-question records.
- [ ] Card previews cover all valid upgrade/Focus combinations.
- [ ] Passive cards have no Focus controls.
- [ ] BM/BI rich text and mathematical symbols render in actual card contexts.
- [ ] Mechanics checks use controlled before/after state and approved expectations.
- [ ] Motion playback, supported stepping and reset work.
- [ ] Direction, floor contact, visible size and clipping are inspectable.
- [ ] Repeated entry/exit does not duplicate listeners, timers or audio.
- [ ] Player save/progression remains unchanged after normal exit and simulated failure.
- [ ] Presets validate schema and missing IDs.
- [ ] Copy Test Details contains sufficient replay information.

## 12. Verification plan and deliverables

During implementation, use repository-defined checks and focused regression tests for build gating, save isolation, reset/teardown and card state interactions. Perform browser checks at normal and small viewports, keyboard navigation and BM/BI. Inspect actual production output and attempt direct developer entry. Do not claim these implementation checks have passed from this SOR alone.

Expected later implementation deliverables: reviewed scripts/build setup, Developer Hub, sandbox adapters, scene/card/motion panels, preset schema, diagnostics and a report of actual validation results.

Current deliverable: this Markdown SOR packaged as a ZIP. No game code or configuration has been changed.
