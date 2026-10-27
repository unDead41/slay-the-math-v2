# Current pet verification evidence

Mathematics Slayer2.53.0-pet.1, feature branch only, based on main7a49fff /2.52.0. [Audit and exact limits](../../audits/pet-assistant/LATEST.md).

- `evidence.json`: source/tree bindings, actual gates, separate source/production manifests and limits.
- `source-hashes.json`: runtime/backend/package and every Node test input; all Node inputs unchanged since full-command start d980367.874188a is a native-harness-only correction.
- `node-coverage.json`:1162 retained full-command PASS names +95 complete fresh disjoint tail =1257 distinct recorded cases. Full command exit0 but original EOF stdout unavailable; no fabricated single-run count. Probe18 overlaps and is excluded.
- `browser/report.json`:36 real browser checks; endpoint intercepted, real game/art/engine/portable. `offline/report.json`:15 actual installed-cache/cold-restart checks, new browser process and stopped server/network; production release5c4c7a is the readiness identity.
- `qa-logs.tar.gz`: original available logs, negative/cancelled/historical gates, ledger and evidence collector.227-line final capture log is complete. `native-harness-failure.log`/partial JSON preserve the strict-selector failure separately.
- `review-rulings.md`: every recorded coordinator ruling and deferred minor with costs. Review final verdict is separate.
- `historical-2.51-base/`: earlier35/14 native receipts before current-main integration; these are not current results. `interrupted-capture.json` records an incomplete attempt; its images were not separately retained or relabeled final.

Commands used after final builds (Node24.22.1; jsdom26.1.0; Chromium from QA_CHROMIUM_EXECUTABLE or /tmp/chromium; NODE_PATH supplies QA-only jsdom/Playwright/sharp):

```sh
npm run build
npm run build:prod
npm run check
node --test tests/tutorial-media.test.cjs
node --test --test-concurrency=1 tests/*.test.cjs
node tests/pet-browser.cjs
QA_OUTPUT=docs/verification/pet-online-recovery/offline node tests/offline-restart-browser.cjs
node --test --test-concurrency=1 tests/status-explanation.test.cjs tests/status-vfx.test.cjs tests/texture-cache.test.cjs tests/tutorial-media.test.cjs tests/tutorial-ui.test.cjs tests/tutorial.test.cjs tests/ui.test.cjs tests/visual-preload.test.cjs tests/visuals.test.cjs
```

No API secret, real provider call, paid/public backend, whole-book/pupil/device/campaign/model outcome or main deployment is established by these files. The two deferred minors are the unsupported file-origin Online guide suggestion (use hosted Online; local portable works) and generic client error fallback.

Publication target: `codex/ai-pet-online-20261025`. The initial `ai/...` name collides with existing `refs/heads/ai`; the422 attempt and verified original AI ref are recorded in evidence.json. Original AI/main history remains outside this feature write.
