# Combat and Predict — 2.19.0

Requested by Ijamm, 22 October 2026: whole-frame reward selection, buff/debuff icons, compact combat without document scrolling, fixed Read Ahead choices, shared run-unique Predict questions and visible Focus/Passive effects.

## Behavior and owners

| Area | Result | Owner |
| --- | --- | --- |
| Reward selection | Native action/outline covers the complete visible frame, inset 10% on the padded canvas. Description scrolling and term controls remain separate. | `cards.css`, `card-ui.js` |
| Read Ahead | Fixed tracks `clamp(190px,22vw,280px)` keep 4/3/2/1 choices the same size. Short dialogs scroll internally; narrow card rows pan. | `cards.css` |
| Combat | One viewport; room, Gold, turn and deck count in the header; Main Menu in Settings; Hand count above resources; used piles above Predict. Artifacts occupy the upper arena strip. | `app.js`, `combat-compact.css`, `mechanics-host.js` |
| Status | Ten original navy/gold SVG badges beneath the correct HP panel, with actual counts and native detail buttons. Strength/Agility/Defense, Block, Weak/Vulnerable, Thorns, next-turn Draw/Block and temporary Block retention remain distinct. | `combat-status.js`, `assets/status-icons.json` |
| Passive | Active icons beside Alyssa show activation/trigger counts, condition/progress and last resolved trigger. Reading details grants no effects. | `card-combat.js`, `app.js` |
| Journal | Bounded chronological history, grouped by actual actor and turn. Card labels and resolved amounts are visible. Compact view keeps the latest opposing actor; Full Log preserves all retained groups. | `combat-log.js`, engine/card hooks, `app.js` |
| Predict | The authored 120-question bank uses the existing Ink, native MathML, BM/English, Hint, gated More Hint and worked-solution renderer. | `combat-predict.js`, `education.js`, `mechanics-host.js` |

The question bank, both textbook overlays and canonical 40-card source data retain their contents. Original characters, frames, arenas and animation registration remain source-owned. Small/short screens bound character canvases to the available arena; hand, status and Passive rails retain local panning. Native dialogs own expanded content. Main combat has no document scrollbar. Non-card controls retain 44px targets.

## Question and save contract

Predict, Artifact and Mystery share `educationState.runUsedIds`. An item is reserved when opened, so closing or abandoning it cannot reroll the same question later in that run. A separate question RNG preserves combat RNG. **New Run resets exclusion**, while `usedIds` and reducer archives preserve lifetime exposure and learning evidence. Continue/import retain actual pending identity, answer order, attempts and support. Checkpoint retries retain all exposures from the failed attempt.

First-try correct answers without support grant +1 Focus, capped at 3, once. Guided/retried answers grant no Focus; correctness can open one pending boss seal. If all 120 items were opened, an explicit unscored completion grants no Focus/learning credit and can open one seal to avoid blocking a completed-bank run. Education Practice and tutorial remain independent unscored review.

Selection version 2 validates run exclusions and question RNG. True legacy saves remain accepted; frozen live-deck Predict questions finish using their original source/math. No old card IDs or pending physical card choices are replaced.

## Focus and Passive findings

The supplied 40-card definitions match the canonical master. Thirty eligible active cards **spend** Focus for bonuses. Passives never spend armed Focus. Last Ember is the package's Focus grant: living HP at or below 30%, +6 Block and +1 Focus, once per combat, subject to the Focus cap. Existing values/timing were correct; the missing condition and capped-gain feedback caused ambiguity. The UI/log now expose actual gains, including +0 at cap. Legacy Clarity logs its actual capped gain too.

Ember Core no longer counts an additional trigger after the focused card already killed the sole enemy, matching the source's stop-on-combat-end rule.

## Verification and delivery

`npm run build`, generated portable boot, syntax checks and **398 Node/jsdom tests passed with zero failures/skips**. Coverage includes all 40 cards, all 120 Predict transactions/restores, interleaved consumer uniqueness, new-run reuse/lifetime archives, legacy saves, Focus caps, passive/delayed effects, replay guards and complete campaign simulations.

Actual Chrome checks covered 320×568 through 2560×1080. All measured combat documents matched their viewport dimensions. Read Ahead remained 280×420 through 4→3→2→1, plus the normal 3→2→1 sequence. Reward selection measured 80% of the native padded canvas in both dimensions. BM Hint→wrong→More Hint expanded the dialog from its local scroll container while arena/document dimensions stayed fixed. Settings Main Menu and named enemy/player logs were exercised.

Measurements, screenshot hashes and limits: [verification record](verification/release-2-19.json). [Combat](verification/combat-2-19-combat.jpg), [phone](verification/combat-2-19-phone.jpg), [Read Ahead](verification/combat-2-19-read-ahead.jpg), [reward](verification/combat-2-19-reward.jpg).

Browser checks use isolated, engine-validated fixture saves. They do not prove classroom comprehension, playtested balance or that the user's Windows folder has updated.

Stop the old server with Ctrl+C, then from the actual project folder:

```powershell
git stash push -m "backup-before-v2.19.0"
if ($LASTEXITCODE -eq 0) {
    git pull --ff-only origin main
    if ($LASTEXITCODE -eq 0) { npm.cmd start }
}
```

Keep the stash as a backup. Refresh the browser after startup and check **v2.19.0** in Main Menu or Settings. `MAIN-SEKARANG.html` and root `index.html` load the current runtime; `SLAY-THE-MATH-OFFLINE.html` is generated by the build.
