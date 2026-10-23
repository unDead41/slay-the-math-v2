# Alyssa status VFX implementation

1. Project actual hero status snapshots and new enemy absorption receipts without changing engine state. Add focused regression cases for new, lost, queued, enemy-only and historical conditions.
2. Add bounded SVG/CSS auras, deterministic particles, real signed labels and a cancelable Web Animations controller anchored to Alyssa.
3. Integrate capture/mount/play/disposal with the existing action, render, modal, motion and visibility lifecycle. Preserve analytics, portraits and card motion.
4. Exercise real production and offline combat at desktop, phone and landscape sizes; verify settings, rerender and rapid-input cleanup and compare to independent saved engine outcomes.
5. Update owner SOR/decisions/changelog/version, run syntax and the combined regression suite once, build production and retain evidence before publishing the completed change.

Integration update: main advanced from analytics 2.26.0 to Master balancing `e2c323a` / 2.27.0 while the feature was being checked. Preserve that main in full, publish this visual extension as 2.28.0, and run fresh combined checks including Easy/Medium/Hard save bindings. The interrupted earlier full-suite candidate is superseded; it is not reported as a passing final release.

Publication update: retain the later GitHub Pages workflow/docs from main `b848f55`. This changes no game runtime; all 682 runtime hashes still match the final tested production build, so the passing 715-test and browser results apply to the same runtime bytes.
