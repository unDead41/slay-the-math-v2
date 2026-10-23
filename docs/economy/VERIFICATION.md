# Verification of the final economy candidate

23 October 2026 (Malaysia), base `2800f9aeba5ed594e6ef3f991bcf4dfa498a5de7`, economy `economy-1.2-candidate.1`, runtime build `78aeafe0e2be79fc`.

- Full `npm test`: **501 passed, 0 failed, 0 skipped**, after review fixes. [Raw output](evidence/unit-suite.log). External QA jsdom/sharp modules were supplied through NODE_PATH without new game dependencies.
- `npm run check`, economy script syntax and `git diff --check`: passed.
- Actual Chromium: **10 checks passed**, desktop 1440×900 and mobile 390×844, no page errors. Covered six cards/one sale/Boss lock, paid purchase reload, Easy recovery, actual reward label, event profile preview and deadline reload. [Browser report](evidence/browser-verification.json).
- All success options and all failure consequences of fifteen events tested across three profiles; exact legacy deadlines, source restrictions, floor/cost/claim guards and question nonrepeat checks pass.
- Independent reviewer ran 121 targeted/existing tests and checked evidence. Checkpoint identity and passive draw capability findings were fixed with five RED→GREEN regressions; exact answer-time metadata corrected to 1 ms. Full suite and simulations regenerated after fixes.
- Reproduced **30,720 card offers, 16,384 artifact offers, 432 conditional Gold/recovery cases**, source hashes and recorded seeds. The raw cashflow/histogram outputs stayed unchanged after the narrow review fixes; new manifest pins the actual runtime file hashes.

These checks verify this economy candidate and its transactions. They do not establish ICP/CCP, engine combat-policy balance or pupil win rates. Full Combat/Map inputs remain as listed in the Master handoff.

Reproduce in the repository with `npm run audit:economy`, `npm run simulate:economy`, `npm run diagnose:economy`, then `python tools/economy/render_report.py` (Matplotlib/NumPy). `npm run test:economy-browser` uses Playwright and a configured Chromium; see QA_CHROMIUM_EXECUTABLE.
