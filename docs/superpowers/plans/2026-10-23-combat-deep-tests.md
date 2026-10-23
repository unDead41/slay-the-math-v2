# Deep Combat & Synergy validation

Authorized follow-up to c863a5f, on balance/combat. Original game base 2800f9a. Preserve player values, saves, ID/art/question assets, Economy ownership and main.

- [x] Real-engine harness: explicit 1..60 decks, Predict correct/wrong/retry/skip, resource/UID/Exhaust invariants, event and turn telemetry, meaningful save/restore boundaries.
- [x] Constructed grown decks, low HP and upgrade cohorts; actual full-run progression using current offers/prices; separate fixed-base dilution cohort.
- [x] All 10 Passives and 3 delayed setup cards, clean and competing contexts; paired 50-seed risk follow-up in two encounters.
- [x] Long swap/cancel/stale-choice/tampered-save traces, free Exhaust/Recall clusters, read-only preview and 200 reload differential pairs.
- [x] Actual 31-artifact probes, negative controls and scope classification, 50-seed artifact-cluster contexts.
- [x] Independent review and regression correction of route ranking, exhausted seal telemetry, complete source provenance and live gift ledger.
- [x] Final recovered result integrity and report; commit/durable delivery recorded in the final handoff.

Recovery: workspace maintenance removed uncommitted work. Regenerate all primary cohorts and compare retained aggregate logs; do not represent missing raw as retained. Limitations and rulings live in docs/balance/combat/DEEP_VALIDATION.md.
