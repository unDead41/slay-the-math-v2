# New Main Menu music — game 2.32.1

Ijamm supplied `Menu.mp3.mpeg` on 24 October 2026 and requested using it when opening the game's Main Menu. The update was first published to `music` as requested. His subsequent instruction, “push ke main please”, authorizes publishing this completed update to `main` as game 2.32.1 and supersedes the original branch-only boundary.

The branch starts from current main `264a60ecec7e64251304cdbc58b587a8867502ab` / 2.32.0. The existing audio registry `dist/assets/music/audio-pack-5.json` remains the one runtime source. Only its stable `menu` cue is replaced, with the explicit source `assets/music/menu_ancient_stone_keep.mp3`; the former OGG cannot take precedence. The generated music catalog displays **Ancient Stone Keep — Main Menu**. The package remains source pack 5 for its existing voice/BGM collection; the individually supplied menu replacement has its own audit here.

The supplied `.mpeg` file is an MP3 container, stereo 48 kHz, 199.608 seconds (about 3:20). Its metadata credits zaimshahbudin. The runtime file is a byte-for-byte copy under an `.mp3` extension, with no re-encoding, crop, pitch, speed or volume processing. SHA-256: `9b3f06a390e3e6fecea9734e3352a5877f4eda64a4fd66829725caa121515681`. Size: 4,701,741 bytes. [Source and runtime audit](source-audit.json).

The existing controller routes Home to `menu`, loops the complete clip at rate/gain 1, respects saved Music mute/volume, and uses its normal scene crossfades. On browsers that restrict autoplay, music begins after the first player click/key gesture. Leaving Home uses the actual scene cue; returning Home uses this new track. No new start button, forced unmute, second audio player or gameplay dependency is added. Existing menu/voice/Music controls and all 75 talking clips remain current.

Normal, production and portable builds use the same canonical ID. The offline build embeds the new source under `DC_MUSIC.menu`. The old menu audio files remain historical source assets and are not chosen by the current registry. Automated decode/playback is distinct from a human listening audition or loop-seam approval.

Actual checks and limits: [verification](verification.json). The original upload and the three attached curriculum PDFs are not modified. MODEL.zip was unavailable and is not used for this audio update.
