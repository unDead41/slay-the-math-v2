# Passive replacement and supplied audio — 2.20.0

The game now permits three active Passives and asks which active card to replace before playing another. `MUSIC(3).zip` supplies eight background cues and seven character greetings, with separate Music, Voice and Sound FX settings.

## Passive behavior

The user's cap and replacement request is confirmed. The implemented interpretation is **three active Passives during combat**; a deck may own more. This was stated while proceeding after an optional active-versus-deck clarification received no answer. Passive effects still last for their existing combat duration. `DCConfig.PASSIVE_LIMIT` owns the cap; source card amounts and identities are unchanged.

- Playing the fourth opens a saved, unpaid `passive_swap` choice. The three full native card frames are selectable. The popup names the incoming card and its actual Energy cost. Cancel, Close or Escape uses no Energy, Focus or gameplay RNG.
- Choosing commits one atomic card transaction: the outgoing physical card enters Discard, its persistent stat contribution is removed, and the incoming Passive is paid for and activated. Resolved Block, damage, draw and Focus remain. This is not a hand-discard event and cannot fire hand-discard artifact hooks.
- Inactive combat history retains original activation timing, progress, previous trigger turns and limits. Redrawing/reactivating a replaced card cannot farm Last Ember or reset once-per-turn/capped triggers. Accrued stat contributions return only while their Passive is active. A new combat resets this history as before.
- The arena shows active count `/3`. Replacement and deactivation appear in the full chronological combat log.

Legacy saves with four to ten active Passives remain loadable. An unpaid `passive_trim` asks which to deactivate until three remain. Existing saved card choices or Predict finish first; closing that deferred flow opens the trim. Closing the trim itself keeps it pending, with a reopen button and blocked combat actions. No automatic card is lost, and native double-clicks cannot select the next shifted option. Candidate buttons bind to the rendered choice ID. A frozen valid 2.19 save is included as a migration regression fixture.

## Audio behavior

The byte-preserved source files, exact mapping, provenance, measured durations and full PCM decode results are recorded in [source integration notes](audio/source-pack-3/INTEGRATION_NOTES.md) and [import audit](audio/source-pack-3/import-audit.json). Normal/Elite share the supplied combat cue for each stage; bosses, Shop, Rest, maps and defeat use their matching supplied files. Existing Menu and Mystery compositions remain available, giving ten unique BGM cues overall.

Dungeon Master greetings advance 1→2→3→4, then retain clip 4; Merchant advances 1→2→3, then retains clip 3. Distinct visible encounters reserve these independently per run, including while muted. Rerenders, selecting a Shop tab, purchases and revisiting the same offer do not add visits. Optional audio metadata is saved independently of gameplay, included in checkpoint snapshots, and safely recovered for legacy or malformed metadata without changing gameplay RNG.

Only one greeting plays at a time. Leaving the surface cancels late playback, and hidden pages stop it. Music fades between cues and reduces to the minimum active Voice/Predict duck factor; sliders use the current volume. Music mute, Voice mute and Sound FX are independent. Browser gesture requirements defer only the current greeting. Unmuting a consumed greeting does not replay it.

Builds regenerate the catalog from the committed registry. Portable output embeds ten canonical Music entries and seven Voice entries; stale legacy OGGs and old embedded aliases cannot replace supplied MP3s. No archive extraction is needed on the player's computer. `npm start` rebuilds catalog/entry metadata automatically.

## Verification

Final commands/results and browser measurements are recorded in [release evidence](verification/release-2.20.0/report.json). The same actual browser captures show the [replacement popup](verification/release-2.20.0/passive-swap.jpg) and [audio controls during Merchant speech](verification/release-2.20.0/audio-settings.jpg).

Browser checks cover cancellation and paid replacement, removed Strength versus retained Agility/Defense/armed Focus, original full card frames, legacy BM selection/reopen, actual Shop and Dungeon Master playback status, independent Voice settings, and phone/landscape/desktop/wide geometry. Dialogs scroll or pan locally; document dimensions stay at the combat viewport. Full native frame widths stay fixed at 190 or 280 pixels for the tested viewport classes.

All fifteen supplied MP3 streams pass independent inspection and full decoding. Browser playback state was observed; human listening, loop-seam quality and classroom/balance playtesting are not established by these checks. No transcript was supplied or invented. Windows itself was not run here: pull the new main, stop the old server, restart and refresh to see this release. `MODEL.zip` was unavailable and was not applied.
