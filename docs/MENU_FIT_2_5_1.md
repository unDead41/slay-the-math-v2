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

Checks include whole-image bounds, menu/dialog geometry, display scaling, native controls, static scene sources, keyboard/focus, exactly 5s scheduling/fade, pause/reduced motion, failed and stale image decodes, exact saved-run preservation and a real Challenge artifact/question transition. Existing dungeon and education browser suites remain regressions. The GitHub Actions run records actual test results and preview artifacts; pending jobs must not be described as passed.

The local execution container was unavailable for this task, so shell verification runs on the repository's GitHub Actions runner. Browser-device observations and CI renderings are separate evidence. Chromium coverage does not claim a physical test of every monitor/browser.

## Apply to the same Windows project

~~~powershell
cd "C:\Users\ijmah\Desktop\slay-the-math-v2"
git pull --ff-only origin main
npm start
~~~

If the game server is already running, keep it and refresh the browser with Ctrl+F5 after the pull. Open http://localhost:4173. No new Desktop folder or VS Code window is created.
