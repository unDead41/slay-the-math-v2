# Illustrated tutorial — main release 2.46.0

Ijamm explicitly requests publishing the completed tutorial to main on25 October
2026, Asia/Kuala_Lumpur. Master SOR1.2.0 was read from current main before this
publication. Main remains `6c49f3980c3a832635d4d01a6c50a8df98ac4aad` /2.45.0;
reviewed feature is `aa3938eed9f343381c1becaf75fa95d4268c3504` /2.46.0-tutorial.1,
tree `9e4e9aff94d36ddd35853b3cc84c4e2ccffa85ea`. It is one commit ahead, zero
behind and mergeable. The earlier feature-only restriction is superseded.

Promote the release to **2.46.0** and regenerate release/entry/cache metadata.
Keep all23 chapters, the ten-chapter Basics route,98 real English/BM images and12
isolated engine-backed exercises exactly as reviewed. No tutorial runtime/media,
mathematical, numerical, save, language, original art, motion or VFX rule changes
are included in this promotion. Original capture provenance remains historical
and is not relabelled as a fresh stable-release capture.

## CI finding and repair

PR20 [verification run40172579881](https://github.com/unDead41/slay-the-math-v2/actions/runs/40172579881)
completed1,089 tests:1,087 passed and two failed before loading historical balance
sources. Both failures call `git show 2800f9aeba5ed594e6ef3f991bcf4dfa498a5de7:dist/engine.js`.
The job log records `fetch-depth: 1` and the actual `git fetch --depth=1`.
The baseline Git object exists in the full local history, with engine blob
`a7c90666adee9bc3957c7016d3383634edf7de27`; all ten balance-combat tests pass
when that historical source is available.

**Confirmed CI-FETCH-01, P1/high, resolved in configuration:** the verification
checkout now fetches full history (`fetch-depth: 0`). Keep its pinned baseline,
all assertions and credential isolation. Do not replace the old engine with
current code, skip the failures or change balance to repair this CI input issue.

## Validation and boundaries

Fresh stable-release commands, runtime hashes, production transform/manifest
checks and actual outcomes are recorded in
[publication evidence](audits/tutorial-visual-refresh/main-2-46-0/verification.json).
The prior scoped78 tests and complete native tutorial/image matrix are preserved
separately in the [feature audit](audits/tutorial-visual-refresh/LATEST.md).
The CI failure above remains a failure of that old run; it is not called green.

The publication diff is release metadata, explicit authorization/evidence and
the historical-input checkout correction only. Compare the tutorial runtime and
all assets with the reviewed feature; require exact parity. Verify the expected
PR head and current main before merge, then read back main/ref/tree/version.
The existing main-push workflow owns GitHub Pages deployment; a successful merge
is not itself proof that a hosted deployment has completed. Physical pupil/device
performance and live Google delivery are not newly assessed. MODEL.zip remains
unavailable and unused.

## Windows update

Keep any tracked local edits in a backup stash before switching and pulling.

```powershell
& {
    Set-Location "C:\Users\ijmah\Desktop\slay-the-math-v2" -ErrorAction Stop
    git stash push -m ("backup-before-tutorial-main-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
    if ($LASTEXITCODE -ne 0) { throw "Backup gagal. Berhenti dahulu." }
    git switch main
    if ($LASTEXITCODE -ne 0) { throw "Gagal tukar ke main." }
    git pull --ff-only origin main
    if ($LASTEXITCODE -ne 0) { throw "Pull gagal. Salin ralat di atas." }
    npm.cmd start
}
```

Open http://localhost:4173 → Tutorial → Asas. The backup can be inspected with
`git stash list`; it is kept separately from the updated game.
