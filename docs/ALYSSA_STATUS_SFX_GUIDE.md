# Combat animation sound search guide

Requested by Ijamm on 23 October 2026. These are proposed search terms and filenames for audio Ijamm will source later. No new audio files are imported by this visual change. The existing Sound FX volume/mute owner remains canonical.

| Action | Suggested sound | Search keywords | Target duration | Suggested filename |
| --- | --- | --- | --- | --- |
| Draw card | Soft card slide with a light whoosh | `card draw slide short` | 0.15–0.30 s | `card_draw.wav` |
| Discard card | Small card flick or placement | `card flick discard` | 0.15–0.30 s | `card_discard.wav` |
| Exhaust card | Small burning flare and short hiss | `magic fire burn whoosh short` | 0.35–0.70 s | `card_exhaust.wav` |
| Block gained | Airy shield formation with a soft resonant finish | `magic shield activate short` | 0.35–0.65 s | `shield_gain.wav` |
| Block absorbs a hit | Compact magical impact | `magic shield block impact` | 0.15–0.40 s | `shield_hit.wav` |
| Shield breaks from a hit | Short magical crack and scattering fragments | `magic shield break shatter` | 0.30–0.65 s | `shield_break.wav` |
| Unspent Block expires | A soft dissolving hiss | `magic shield dissipate soft` | 0.25–0.45 s | `shield_expire.wav` |
| Strength rises | Warm fire ignition and a small upward accent | `fire buff power up short` | 0.30–0.60 s | `buff_strength.wav` |
| Agility rises | Swift airy whoosh and light chime | `agility buff swift whoosh` | 0.20–0.40 s | `buff_agility.wav` |
| Defense rises | Warm armor/rune resonance | `armor buff magic resonance` | 0.35–0.60 s | `buff_defense.wav` |
| Weak/Vulnerable applied | Muted curse hiss and descending tone | `debuff curse apply short` | 0.30–0.55 s | `debuff_apply.wav` |
| Attribute decreases | Soft descending chime | `stat down descending chime` | 0.25–0.50 s | `stat_down.wav` |
| Debuff ends | Clear outward chime/sparkle | `magic cleanse dispel short` | 0.30–0.60 s | `debuff_clear.wav` |
| Passive triggers | Subtle magical proc ping | `subtle magic proc notification` | 0.12–0.25 s | `passive_trigger.wav` |

## Selection and later integration

### Synthesized routing — 24 October 2026 (combat-animation branch)

The local polish selects one primary cue per committed action and schedules it with the visual presentation lead. Depletion, HP impact, shield absorption, debuff/stat loss, cleanse, shield gain and Passive feedback take precedence over routine card movement. Low/Full changes visual intensity only; Game Motion Off still permits independently enabled Sound FX. New commands, dialogs and hidden/navigation states cancel pending sound. Short synthesized tones are reversible fallbacks, not imported/recorded versions of the suggested WAV files. No supplied MP3 from another chat is claimed imported or auditioned by this change. The search table remains useful for replacing these fallbacks later.

Prefer clean isolated one-shots without background music, voices or long silence. WAV is a useful source/master; runtime encoding and loudness matching happen after audition. Preserve natural decay and confirm game-use/redistribution terms when choosing clips.

Play a status sound once for a new committed event. Persistent auras do not need loops. Continue, reload and rerender must not replay a sound. Shield absorption/break and normal expiry need different cues; queued Block does not play the active-shield sound early. For simultaneous Passive and stat effects, select a restrained primary cue and cap/merge repeated impacts so they do not stack loudly over Alyssa's voices or BGM.

Alyssa's elemental attack motif remains fire. Shield/armor/utility cues can be abstract magical resonances; avoid ice/lightning attack sounds that suggest an added element or mechanic. Proposed durations and filenames are implementation suggestions, not a claim that any clips have been licensed, auditioned or installed.
