# Runtime performance — approved scope

24 October 2026. Ijamm explicitly approves recommendations 1–3 from the performance assessment: retain combat canvases/controllers, reuse already-verified resources, and replace count-only texture caching with memory budgeting. Publication remains feature-branch only.

Preserve the existing engine, exact seed/RNG/save progression, card/education/balance owners, original artwork/audio, fixed actor geometry and clip durations. Presentation never decides gameplay. Current main cb1bbcf688d9556b55bc8fe5522b5b652309640c (2.38.0), including Settings-only developer entry, education reports and clarified bilingual hints, stays intact.

Within one encounter, update changed UI without replacing matching actor canvases. New encounter/run, scene exit and explicit resource retry dispose old owners. Motion/dialog/hidden-page policies still apply.

A session-private immutable Blob cache uses normalized project URL plus expected SHA identity, a 32 MiB budget and LRU eviction with background-first eviction. Cache denial still allows sequential consumers to reuse verified bytes. Initial network/disk bytes are verified; incomplete, wrong-hash and cancelled work cannot enter the trusted cache. Consumers cannot mutate retained bytes. Different managers/manifests remain isolated.

The decoded texture cache accounts naturalWidth × naturalHeight × 4 bytes, budget 96 MiB. The current clip is pinned by live actor ownership; idle is preferred while budget permits. Release ownership on destroy, reject stale completions and evict unowned textures by LRU. A pinned-only oversize case is reported rather than blanking visible actors. Counts are estimates of retained decoded pixels, not measured browser/GPU memory.

Measure actual duplicate fetch/digest/decode work and native command/frame timing before/after on fixed fixtures. A synthetic benchmark is not a physical-device FPS guarantee. Full suite, targeted/native checks, failures, review findings and limits belong in the branch audit. No adaptive VFX, resized canvas, rewritten save policy, question sharding, artwork regeneration or main merge is included.

## Main integration authorization

Ijamm subsequently requests publishing this completed update. Release2.41.0 integrates current mainb730cad2.40.0, including the newer card/status/education/Dev owners. Coordinate functional-icon fallbacks and Tutorial images through verified preparation, preserve current-source image/controller metadata, and deduplicate live image decode jobs. [Main release/audit](../RUNTIME_OPTIMIZATION_MAIN_2_41_0.md) supersedes the earlier branch-only publication limit for this release; deferred optimization scope remains deferred.

## Automatic download follow-up —25 October2026

Ijamm requests applying appropriate performance improvements with the75% important-package gate. Use incremental shared-transport scheduling, foreground priority, one/two speculative transfer limits, visibility/network pause-resume and truthful retention counters. These are the additional changes in2.46.0; existing32/96MiB budgets, persistent actor/VFX surfaces, approved V5 artwork/clip registration, adaptive VFX and exact gameplay stay unchanged. Native evidence is required; do not claim physical-device FPS guarantees. [Audit](../audits/hosted-readiness/LATEST.md).

Ijamm subsequently requests publishing this completed follow-up to main. The combined 2.47.0 integrates the feature with main's illustrated tutorial 2.46.0. No additional animation, texture budget, numerical or save-policy optimization is introduced during publication. Preserve both owners and record fresh combined verification separately in [the main release](../HOSTED_PRELOAD_MAIN_2_47_0.md).
