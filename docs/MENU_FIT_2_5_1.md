# Main menu display fit — 2.5.1

User request: 21 October 2026, Malaysia. Update the existing Slay the Math project.

## Result

- Keep all five supplied artwork plates intact. The main foreground uses contain framing with padding, so UWHD no longer expands and cuts the foreground model. A dark, blurred copy fills the remaining display.
- Scale Home's title, five menu actions, footer and native Settings/mode dialogs together through the single menu unit in dungeon-2-3.css. The smaller viewport axis limits scaling on short ultrawide displays. Phones and short screens scroll naturally; targets stay at least 44px.
- Change automatic scene interval to 5000ms and crossfade duration to 5000ms in DCVisuals.timing. Five fixed source pairs avoid replacing an image that is still fading out during rapid manual changes.
- Keep decode/generation protection, failure recovery, Motion Off/OS reduction, hidden-tab/dialog/focus/hover pause behavior, native keyboard/focus handling and existing English labels.

## Scope and references

The six uploaded screenshots could not be opened in the execution environment. The actual running menu was independently inspected in the connected Chrome browser at a 3413×1740 CSS viewport (DPR .75): its menu buttons still had a fixed 480px maximum and foreground images used cover. That live observation and the explicit written request ground this correction.

Only Home styling/rendering and scene timing change. All original image/audio files, AGENTS.md, combat geometry, gameplay values, question bank and save schema remain unchanged. The exact 120-question artifact gate remains active. MAIN-SEKARANG.html is a generated optional output; npm run build regenerates it from the updated dist files. The maintained gameplay entry remains npm start / http://localhost:4173.

Canonical owners: DESIGN.md, UX-CONTRACT.md, SOR 10/11 and decisions DEC-20261021-01/02.

## Verification

Project-owned QA is in tests/menu-fit-browser.cjs. It checks 1280×720, 1920×1080, 2560×1440, 2560×1080, 3440×1440, the observed 3413×1740 viewport, 3840×2160, 5120×1440, 844×390, 390×844 and 320×740.

Checks include whole-image bounds, menu/dialog geometry, display scaling, native controls, static scene sources, keyboard/focus, exactly 5s scheduling/fade, pause/reduced motion, failed and stale image decodes, exact saved-run preservation and a real Challenge artifact/question transition.

Actual final verification on 21 October 2026:

- Script syntax and optional portable build pass.
- All 100 engine/education/DOM tests pass with zero skips; all seven map tests and validation of 100 seeds / 200 maps pass.
- DESIGN.md lint reports zero errors/warnings. Strict premium audit of actual runtime source reports zero findings.
- All nine new menu check groups pass across the 11 listed viewports. Existing dungeon (six groups) and education (seven groups) suites pass with no browser page errors. Arena grounding, artifact effects, original question keys, no-repeat history, exact saves and the offline build remain covered.
- UWHD menu and 4K Settings renderings were visually inspected.

Execution used isolated Linux, Node v26.8.2, Google Chrome 153.0.8010.52 and Playwright 1.64.1. The local execution container was unavailable, and the GitHub-hosted job could not start. The passing checks above ran in the independent execution environment, not GitHub Actions. The workflow remains available for future runs. Chromium viewport coverage does not claim a physical test of every monitor/browser or Windows shell execution.

Machine-readable results, runtime commit and exact tested-file hashes: [verification/menu-fit-2-5-1.json](verification/menu-fit-2-5-1.json). The final test-only overlays freeze the clock before exact millisecond assertions, scope Settings to the Home menu, and explicitly choose a legal Battle in the older DOM test instead of assuming the random first room is Battle. Game generation rules remain unchanged.

## Apply to the same Windows project

~~~powershell
cd "C:\Users\ijmah\Desktop\slay-the-math-v2"
git pull --ff-only origin main
npm start
~~~

If the game server is already running, keep it and refresh the browser with Ctrl+F5 after the pull. Open http://localhost:4173. No new Desktop folder or VS Code window is created.
