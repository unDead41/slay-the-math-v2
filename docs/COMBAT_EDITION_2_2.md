# Combat Edition 2.2

User direction: implement the supplied combat layout using existing ZIP assets,
give Focus a different icon from Predict, and record **Alyssa the Clairvoyance**
in the MC SOR. Dates use 19 October 2026 in Malaysia.

## Runtime ownership

| Requested behavior | Owner / implementation |
| --- | --- |
| Reference combat composition | `battleView` in `dist/app.js`; scoped `dist/combat.css`, loaded last |
| Hero name and title | `DCConfig.MC` in `dist/config.js`; `docs/sor/08_MC_CHARACTER_ART.md` |
| Distinct Focus utility art | `dist/assets/icon-focus.svg`; `DCVisuals.icons.focus`; shared icon renderer |
| Predict | Existing cyan orb, shared forecast dialog and engine evaluator |
| Source models and resolved poses | `dist/visuals.js` + `battleFeedback`; existing source sheets/derivatives |
| Gameplay/save | Existing `dist/engine.js`, map modules and configuration values |
| In-place installer | `tools/windows/Apply-CombatUpdate.ps1`, copied to the ZIP root |

The top turn badge, left hero, right enemy/intent, lower HP panels and bottom
hand/resource/action dock follow `references/combat_layout_v002.png`. Numbers
in that image are illustrative. The app always reads actual Energy, HP, Block,
Focus, hand/pile counts and announced intent.

Alyssa uses the current supplied transparent front standing view to match the
reference's open stance. Idle has a grounded foot shadow. Existing action poses
remain, and Ember Mirror retains its dedicated action sheet. Other enemies use
their roster models and CSS reactions. No new character art is generated.

The hand keeps the shared `cardView`. Narrow layouts use document scrolling and
a visible horizontal hand scrollbar. Native buttons, R/E/1–9 shortcuts, all
pile dialogs, reduced motion and autosave remain. Dialog restoration now matches
the complete trigger dataset, including the pile zone, after a forecast rerender.

## Source packages retained

| Package | Retained content |
| --- | --- |
| Slay_the_Math_Arena_Model.zip | Four supplied stage/normal/boss arena derivatives |
| Slay_the_Math_Enemy_Model_Sheets_V2.zip | Existing roster identities and front-view models |
| Slay_the_Math_MC_Model_Sheets.zip.zip | Existing Attack/Defend/Skill/Damage poses |
| MUSIC BG.zip | Previously imported Stage 1 combat/elite and two boss tracks |
| Prior attached transparent standing/Ember sheets | Current Alyssa standing art and dedicated Ember poses |

Focus is newly authored vector utility art, distinct in shape and colour from
Predict. It is a gold concentration target with four directional markers and a
warm ruby centre. The source art, source manifests, map icons and music are
retained. Small source crops may look softer at large display sizes; this update
does not invent higher-resolution details.

## Installation contract

The ZIP is an incremental package for the known 2.0 or 2.1 project. It includes
the cumulative runtime/map dependencies needed by the new layout. The installer
uses a file manifest, not a recursive overwrite of the target tree.

It refuses unknown drift on affected files before writing; preserves `.git`,
`AGENTS.md`, unrelated files and browser saves; backs up overwritten bytes;
uses staged file replacement; and can roll back. It rebuilds the optional
portable HTML locally rather than shipping a duplicate large generated file.

If port 4173 is occupied, a unique temporary file in the target dist folder must
be returned by that listener before its Node server can be stopped. Another
project's listener is never stopped based only on its process name. Temporary
marker files are removed. No VS Code command/window is launched.

Confirmed target: `C:\Users\ijmah\Desktop\slay-the-math-v2`.

## Scope

Save schema stays 1; current routes keep their versions and snapshots. Card
values, element tags, engine math, damage, costs, reward/economy and map rules
are unchanged from 2.1. No new enemy action sheets, 3D models, Passive system
or algebra/indices question bank is claimed. Verification: `VERIFICATION_2_2.md`.
