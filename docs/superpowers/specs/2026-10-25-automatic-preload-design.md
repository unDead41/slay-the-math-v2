# Automatic downloads and 75% startup preparation

25 October 2026, Asia/Kuala_Lumpur. User requests diagnosis of published background downloads, 75% of important package before entry and suitable performance improvements. Master SOR1.2.0; base main6c49f3980c3a832635d4d01a6c50a8df98ac4aad, game2.45.0. Work on fix/automatic-background-preload; preserve main's V5 actor registrations and VFX, exact artwork/audio, game values, bank, saves and RNG.

## Evidence and scope

Live2.45.0 shows107 required files/9.5MB at entry and339/679 resources,93.9/218MB,0 pending on the menu. bootstrap.background queues only actual-stage actors/common matches/boss; enter queues menu images. The remainder requires a manual button. A paused/failed stage queue also has a seed/stage key preventing an automatic reschedule. Historical verified counts remain ready even after memory eviction when disk storage is unavailable.

## Approach and decisions

Use the existing verified manager, not a second downloader. Downloading the entire game before entry delays Practice/Boss unnecessarily; the old small-core-only gate does not satisfy75%. Choose a deterministic early-game important package: core, hero, Stage1 actor files, menu, card/frame/functional/artifact art, first-stage arenas and shared map/shop/rest scenes. Boss/Stage2, tutorial/course and Practice payload are not part of this package. Count actual build bytes, not file count. Every hard-required core file must succeed; select whole optional files by useful priority until at least75% of package bytes is verified. Do not decode all downloaded atlases before entry; decode only the currently needed images/actors.

Startup retains the180-second bounded recovery. If storage is denied or an optional startup file fails, only offer explicit online continuation after code and hard-core visuals are ready; never describe75% as cached in that fallback. Required-code/image failure cannot be bypassed.

Entering starts automatic remaining-resource downloads except lazy Practice. A bounded incremental queue reserves foreground capacity, promotes the current run's assets, defers Boss/Stage2, and uses one background transfer during combat/two otherwise. Pause new background transfers while hidden/offline or explicitly paused; resume/retry on return/reconnect. Existing foreground scene/Practice work remains usable. Report verified versus actually retained bytes honestly and provide retry/manual-full controls. Cache denial stops speculative whole-game transfers; foreground/current-run preparation remains available. Never promise downloading after the tab closes.

These network/decode changes are the recommended optimization in this scope. Existing persistent canvases,32MiB session cache,96MiB estimated texture cache and adaptive VFX remain; no unmeasured numeric/canvas/art/save rewrite.

## Acceptance

Meaningful RED→GREEN unit/integration tests protect75% bytes plus100% hard core, lazy exclusions, incomplete/error fallback, incremental current-room priority, hidden/offline/manual pause, reconnect, cache-denied retention and foreground capacity. Native production tests cover real entry/background/cold-warm cache, scene input/save equality, EN/BM, narrow menu, Practice and actor first frame. Run the full existing suite once on final source, syntax/build and exact manifest checks, then one fresh read-only review and one root fix pass if needed. Record limitations and actual evidence, not guaranteed device FPS.
