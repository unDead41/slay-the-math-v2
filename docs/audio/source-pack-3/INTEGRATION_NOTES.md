# Audio source pack 3 — integration notes

The current user request to apply the supplied music authorizes runtime integration. The unmodified source documents beside this file record an earlier SOR-only handoff on the `music` branch; those planning-only instructions do not describe the current implementation or release authorization.

`MUSIC(3).zip` is 25,975,180 bytes, SHA-256 `90cb3b1195548678c68becaad06f68b7e2c1750d85803391fe6ea540a6d00161`. Its fifteen audio records match the supplied manifest hashes. The runtime `.mp3` aliases preserve every original byte, including the eight BGM files' attached covers. No audio was trimmed, transcoded, time-stretched, pitch-shifted, or recompressed. Source records still name their original `.mpeg`/`.mp3` files.

## Runtime mapping

| Canonical asset | Surface | Runtime path |
| --- | --- | --- |
| bgm_combat_stage_1 | Stage 1 Normal and Elite | assets/music/stage1_combat.mp3 |
| bgm_combat_stage_2 | Stage 2 Normal and Elite | assets/music/stage2_combat.mp3 |
| bgm_boss_stage_1 | Stage 1 Boss definition | assets/music/stage1_boss.mp3 |
| bgm_boss_stage_2 | Stage 2 Boss definition | assets/music/stage2_boss.mp3 |
| bgm_shop | Shop, all tabs | assets/music/shop.mp3 |
| bgm_rest | Rest, Stage Clear, Victory | assets/music/rest.mp3 |
| bgm_map | Both maps | assets/music/map.mp3 |
| bgm_defeat | Run Ended | assets/music/defeat.mp3 |
| vo_dm_01…04 | Actual eligible gift-choice surface | assets/voice/dungeon_master/meet_01…04.mp3 |
| vo_shop_01…03 | Actual Shop visit | assets/voice/merchant/meet_01…03.mp3 |

Menu and Mystery retain their old compositions; Mystery is also the current artifact/education fallback. Existing synthesized SFX remain app-owned. Old unregistered OGG files cannot shadow the supplied MP3s because each supplied asset has one explicit source path and a canonical embedded key. Normal/Elite aliases share one source and one decoded cache entry per stage.

`dist/assets/music/audio-pack-3.json` owns the registry. `tools/build_music_catalog.cjs` consumes it so a subsequent build preserves the mapping and measured durations without carrying old BPM/key claims into new recordings. Portable integration embeds each canonical BGM through `DC_MUSIC` and each canonical voice through `DC_VOICE`.

## Presentation and settings

The app observes the actual visible surface before saving, then dispatches its frozen encounter descriptor through the audio controller. Only `run.audioPresentation` changes: independent per-run Merchant and Dungeon Master counts, stable keys, visit numbers and selected voice IDs. DM holds clip 4 after visit 4; Merchant holds clip 3 after visit 3. The bounded ledger accepts old saves and recovers only malformed optional audio metadata. Existing whole-run checkpoint copies own their matching audio snapshot. An imported ledger already containing 128 valid entries declines a new greeting instead of evicting duplicate protection; normal two-stage routes stay below this bound.

Music and Voice have separate volume/mute controls. Music mute does not suppress Voice. Voice/Predict ducking uses the minimum active factor (0.30), and restoring volume reads the latest Music setting. Muted/zero-volume greetings are consumed without replay on unmute. A blocked first greeting waits only while its current surface remains active. Leaving or superseding cancels pending fetch/decode playback; hidden pages stop sources before suspending so no voice tail resumes on show. At most one voice plays, including rapid leave/reopen. Native BGM transitions crossfade for 850 ms, retiring older fades before another transition.

## Verification and limits

- All fifteen source/runtime SHA-256 values match the supplied manifest.
- Independent ffprobe inspection confirms eight stereo 48 kHz MP3 BGM and seven stereo 44.1 kHz MP3 voices.
- All fifteen files fully decoded with ffmpeg to PCM S16LE without error. Container duration, attached-cover state and decoded PCM hashes are in `import-audit.json`.
- Focused Node tests cover catalog/source integrity, exact routing, idempotent per-run encounters, save/checkpoint snapshots and audio-only recovery, gesture unlock, late loads, rapid navigation, Voice settings, independent mute, ducking and visibility races.
- Browser playback, app integration, full-suite/build/portable verification and publication belong to the release integration report.

Human audition, loop seam approval and suitability of repeating the final voice clips have not been established by these checks. BGM loops use the full decoded source (`0` to `buffer.duration`); crossfade applies to track changes and does not claim seamless internal loop boundaries. No transcript was supplied or invented, and no subtitle text claims to reproduce the recordings. Author/platform/license facts beyond user-supplied provenance are not asserted.
