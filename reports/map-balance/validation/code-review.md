# Map audit code review

Fresh read-only review of base 2800f9a to implementation 629b2b56. Scope: enumerator, pressure/CP, policy, canonical replay, sampler, exporter, source audit and tests. Final datasets/SOR were still in progress and were checked separately by the primary agent and independent Python verifier.

No Critical findings. Four confirmed findings:

1. Important: stage aggregation discarded a resolved Stage 1 win when a later stage errored/censored. Fixed by aggregating resolved stage outcomes separately and retaining campaign anomaly counters.
2. Important: an exact API budget boundary could mark completed Rest/Boss outcomes unresolved. Fixed by reconciling completed engine states before the limit return and enforcing the budget on each API action.
3. Important: the context omitted the actual candidate-reference digest and part of the engine dependency closure. Fixed by verifying reference bytes and hashing inputs plus the full loaded runtime dependency graph.
4. Minor: Wilson zero-win cancellation produced a tiny positive lower bound and a misleading finite upper CP. Fixed with exact endpoint treatment.

One fix pass committed as 8f44451, with five meaningful failing regressions before fixes and 19/19 targeted tests passing afterwards. An additional regression connects the configured probability anchor; export coverage now distinguishes partial route exposure from full ten-node traversal.

The reviewer found no answer-key or hidden draw-order leakage. The deliberate small pilot, conditional Stage 2 population, heuristic exclusions and lack of final pupil calibration remain disclosed limits. Forced-route diagnostics use different RNG/roster classes across ranks and cannot establish causal route effects.

After the fixes, the full root suite passed 491/491 with concurrency 2; map module tests passed 7/7. Derived two-stage pair estimates were independently recalculated in Python for every pair/class and checked against manifests/CSV/JSON. They are not additional engine simulations.
