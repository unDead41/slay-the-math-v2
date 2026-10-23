# Education analytics main integration — 2.26.0

Verified on 23 October 2026 (Malaysia), using Node 24.19.0 and native headless Chromium. Main integration is explicitly authorized by Ijamm in the current request.

## Inputs and preserved owners

- Main: `7afb0aa18c2f3f4fb95a1fc7da67abbe5f0eeeaf` / 2.25.1.
- Analytics: `1acefda06bfd7694772fbfee60c9e6fa58d0e59b` / 2.25.0-analytics.1.
- Combined release: **2.26.0**.
- Resolve the `act` conflict by retaining main's CardFlow capture/end/play path and the analytics report handlers. Retain main's motion cancellation in render/modal, feature Retry session continuity, and all report entry points.
- Rebuild release metadata and all three launchers from one combined resource list. Preserve both histories in the integration commit.
- Exact diff checks against starting main show no changes to the engine, card mechanics/definitions, card/icon artwork registries, card motion/flow, original assets, audio, canonical question bank, education owner or BM/English question owner.

## Executed checks

| Check | Actual result |
| --- | --- |
| Full `npm test`, serial, jsdom enabled | **572 passed; 0 failed, cancelled or skipped**, 394208.13028 ms |
| `npm run check` | Exit 0, including both motion/flow and analytics/receiver modules |
| Native analytics browser/SQLite integration | PASS; details below |
| Existing `tests/card-motion-browser.cjs` | PASS; all ten Passive triggers and three viewports |
| `npm run start:analytics:prod` | Builds production and starts the 2.26.0 loopback collector |
| Production HTTP health and resource verification | PASS; all **68** content-hashed scripts/styles match `dist` and production bytes |
| All three HTML entry points / package-derived version | PASS |
| Newer main runtime and asset preservation | Exact diff checks pass |
| Production private database / Dev exclusion | PASS; no private DB or Dev files copied; private database HTTP path returns 404 |
| `git diff --check` / unresolved conflict markers | PASS |

The full suite ran after all executable integration edits, including the production collector startup script. Subsequent edits are documentation and verification records. Tests use the externally installed jsdom through `DOM_QA_MODULE`; the game/receiver itself remains dependency-free. Optional native browser QA uses Playwright with the locally available Chromium binary. The ordinary serial suite includes the collector, cross-instance journals, report/Practice DOM, release guard, existing motion/flow, question/language, save and gameplay regressions.

## Actual browser and database flow

1. Loaded the merged game, checked 2.26.0, motion/flow globals and Main Menu Learning Report with sharing off.
2. Opened the real generated Practice iframe in Learning mode. Opened Hint, submitted one wrong answer, opened More Hint and submitted the correct answer.
3. The report showed answered **1**, wrong attempts **1**, independent first try **0**, correct with support **1**, correct after retry **1**, reveal only **0**. No weakness or formal TP was invented from one question.
4. Saved a BM comment and enabled sharing in the real inherited-origin `srcdoc` report. The actual SQLite receiver committed **one learning record and one comment**; pending became 0 after receipt.
5. Downloaded JSON using the native browser download event. The download included owner recovery and evidence, with no collection credential.
6. Stopped the real receiver, edited the comment and verified pending **1**. Closed the tab, restarted the receiver on the same address and reopened the game. The latest edit was received, pending became 0 and the database retained **two logical rows**, without duplication.
7. Changed the language through Settings, opened **Laporan Pembelajaran**, retained the metrics and checked desktop **1440×900**, phone **390×844** and landscape **844×390**. The dialog scrolls internally, fits its viewport and causes no horizontal document overflow. The actual BM screenshot was visually inspected.
8. Exported the actual SQLite database with the operator CLI. Both received rows were present, including the latest comment; the capability credential was absent.

The initial optional browser harness selected a hidden duplicate Settings control; its selector was restricted to visible controls and the complete flow then passed. This required no production-code change.

The existing card-motion native browser suite independently rechecked Draw, Discard, Exhaust, face-down reshuffle, Recall, all ten actual Passive effects including capped Focus, free/deferred choices, motion preferences, rapid actions, Settings cancellation, resize cleanup and desktop/phone/landscape bounds. It reported no page errors.

Machine-readable results: [combined evidence](verification/education-analytics-main-2-26-0.json). Player/operator instructions: [current guide](EDUCATION_ANALYTICS_2_26_0.md).

## Limits

Physical Windows/device display, a real Wi-Fi adapter event, classroom comprehension and public cloud deployment were not independently tested. The disconnect/reopen check interrupted the real local receiver; unit HTTP tests also cover online-event retry and lost responses after durable commit. This release creates no hosting, domain, class roster or teacher account. Remote cold-start offline/PWA installation and cross-origin data migration are not supplied. MODEL.zip was unavailable; existing accepted artwork was preserved.
