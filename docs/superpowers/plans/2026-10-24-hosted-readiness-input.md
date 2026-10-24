# Hosted readiness implementation plan

Goal: prepare the menu before entry with a 180-second ceiling, priority background downloads based on the actual run, on-demand Practice, visible audio recovery and native input guards.
Spec: docs/sor/24_HOSTED_READINESS_INPUT.md plus Ijamm's 24 October branch-only implementation request.

1. Verify baseline and create feature branch. Preserve all current educational rules and artwork/audio. Main advanced to 2.37.0 / 6376a222169815af582cf55aa4794f3c809a3515 during implementation; incorporate its icon changes and SOR 1.2.0 on this branch as candidate 2.38.0.
2. RED → GREEN transport/manifest tests: bounded priority downloads, content verification, persistent reuse, retry, interruption, 180-second recovery, manifest-derived packs.
3. Implement the early shell and script sequencing, lazy Practice, project-scoped worker and visual/scene/audio integration. Test cold/warm/slow/failure and actual subpath behavior.
4. RED → GREEN native drag/selection guard tests; apply the shared policy to Practice without blocking fields, scroll or sliders.
5. Build, syntax and complete serial Node/jsdom suite; native Chromium integration; independent final review; commit and push feature branch only.

Review focus: interrupted downloads; cache corruption/quota; async scene replacement; old saves/deadlines; same-version asset updates and different project paths.

Execution record: transport/input RED→GREEN checks and the independent final review identified real recovery bugs; native recovery regressions now cover them. Current main was merged into the feature branch with both histories retained. Developer/file mode eagerly loads the Practice factory needed by its existing adapter; hosted player mode keeps it lazy. The final audit records actual validation and remaining device/cache limits.
