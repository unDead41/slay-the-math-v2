# Mathematics Slayer — panduan muzik

Audio, filenames, provenance dan hash asal tidak berubah. Pakej sepuluh trek di
bawah ialah sejarah Slay the Math, bukan keseluruhan inventori audio semasa.
Tiada rakaman baharu, transcript atau human listening check didakwa.

## Sejarah — Dungeon Music Pack asal

Ten original instrumental tracks for a dungeon card RPG. No lyrics or third-party recordings.

## Listen

Open an MP3 file to listen. In the game, open **Music → Listen to all 10 tracks**. Music Volume and Sound FX Volume are separate. Closing the Music menu returns to the correct game theme.

| Place | Track | BPM | Loop length |
| --- | --- | ---: | ---: |
| Main Menu | The Door Below | 80 | 72.0 s |
| Stage 1 Dungeon | Lanterns in the Stone | 92 | 62.61 s |
| Stage 2 Dungeon | Halls of the Hidden Seal | 106 | 54.34 s |
| Stage 1 Elite | The Iron Warden | 118 | 56.95 s |
| Stage 2 Elite | The Obsidian Sentinel | 134 | 57.31 s |
| Stage 1 Boss | Keeper of the First Gate | 124 | 61.94 s |
| Stage 2 Boss | The Last Equation | 140 | 61.71 s |
| Rest | A Fire and a Small Hope | 68 | 70.59 s |
| Shop | Coins by Candlelight | 104 | 64.62 s |
| Mystery | A Question Behind the Wall | 76 | 63.16 s |

## Use in the game

- `assets/music/*.ogg`: web loop files, stereo 44.1 kHz.
- `assets/music/*.mp3`: listening files and fallback, stereo 44.1 kHz.
- `assets/music/scores.json`: full score, seed, file hashes, provenance and audio measurements.

Stage 1 uses a lighter exploratory arrangement. Stage 2 uses a darker arrangement. Each Elite and Boss has its own stage theme. Rest is calm, Shop is light, and Mystery uses a sparse eerie texture. These descriptions express the score design.

Shop music is ready and can be previewed. A playable Shop is not built in game 1.3.0. The two Dungeon themes also cover their stage map, normal battles and rewards. Rest is used for stage-clear and victory screens; Mystery is used after defeat.

For smooth loops, decode a file to a Web Audio buffer and loop the decoded musical duration. A plain media element can add a browser-dependent pause. The game already includes routing, fades, music ducking during Predict and a two-track buffer cache.

These files are generated for Slay the Math and may be used and modified in the project. The reproducible composition source is `tools/compose_music.py` in the game source repository. Numerical checks verify decoded lengths, levels and loop boundaries; they do not replace listening or real browser playback testing.

## Simple English terms

| Meaning | Game text |
| --- | --- |
| Damage card type | Attack |
| Protection card type | Defense |
| Card that changes your options | Skill |
| Damage stopped this turn | Block |
| Card resource | Energy |
| Answer bonus resource | Focus |
| Cards ready to draw | Draw Pile |
| Used cards that can return | Discard Pile |
| Cards removed for this battle | Exhaust Pile |
| Math action | Predict |
| Rest place | Rest |
| Store | Shop |
| Question-mark place | Mystery |
| Strong enemy | Elite |
| Stage guardian | Boss |

Use short card text: **Deal 6 damage. Gain 5 Block. Draw 2 cards.** Keep exact probability terms and explain them with short sentences.
