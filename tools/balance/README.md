# Combat balance development tools

Pinned base: `2800f9aeba5ed594e6ef3f991bcf4dfa498a5de7`.

```sh
node --test tests/balance-combat.test.cjs
STM_BALANCE_OUTPUT=docs/balance/combat/new-results node tools/balance/run.cjs baseline
STM_BALANCE_OUTPUT=docs/balance/combat/new-results node tools/balance/run.cjs candidate
node tools/balance/enemies.cjs
node tools/balance/report.cjs
```

`report.cjs` consumes retained `results-final`. Set a separate output directory for repeat experiments so the submitted evidence is not overwritten. Retained historical measurement sources and replay instructions: snapshots/README.md.

- `baseline`: pinned real engine from git object at base.
- `candidate`: real engine with optional contracts and SOR v1.2 numeric overlays/profile, Node only.
- `cards_only`: diagnostic card AND artifact overlay with existing enemy config; not a pure card ablation, not full Lite.

Reports are internal. Never import development CP into player UI, reward odds, draw weighting or saves. Numerical candidate activation requires Master integration/version migration and campaign/human validation. Existing game starts with existing definitions; this branch does not silently apply v1.2 tuning to a run.
