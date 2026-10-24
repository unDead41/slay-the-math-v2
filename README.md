# Slay the Math — 2.31.0

**Tutorial** now opens a complete English/BM field guide: 17 chapters, 16 real game screenshots and 11 safe, replayable practice chapters using the actual engine. Progress resumes independently of your run and Learning Report. Open Main Menu → Tutorial or the in-game Tutorial control. [How to use, scope and verification](docs/TUTORIAL_2_31_0.md).

Alyssa has RPG-style shield, buff/debuff auras and actual stat-change effects, with Motion Off/reduced-motion support. [Visual scope and verification](docs/ALYSSA_STATUS_VFX_2_28_0.md). [Sound-effect search guide](docs/ALYSSA_STATUS_SFX_GUIDE.md).

Battles have one enemy. Rune Sweep now delivers one 12-damage hit; Fate Storm delivers three 5-damage hits to that enemy without random target rolls. Both cost 2 Energy and receive their printed Focus/upgrade bonus once. Ordinary modes and Master playtests use the corrected effects. [Changes, save compatibility and measured checks](docs/balance/master/SINGLE_TARGET_2_29_0.md).

Master balance playtest: New Run → Easy / Medium / Hard, or open `?balance=medium`. The three profiles share versioned combat/economy/loot definitions and separate saves. [Balance handoff and unmeasured pupil targets](docs/balance/master/HANDOFF.md).

Learning Report is available from Main Menu, Settings and Education Practice, with BM/English chapter/SK/SP evidence, offline recording, optional comments collection and CSV/JSON exports. This release integrates `education-analytics` with main 2.25.1, retaining combat card motion, the original card/artifact artwork and Pack5 audio. [Windows update, database setup and central collection](docs/EDUCATION_ANALYTICS_2_26_0.md).

Start with **[MULA-DI-SINI.md](MULA-DI-SINI.md)** for Windows/VS Code instructions.

```powershell
npm.cmd start
```

Open http://localhost:4173. `npm start` rebuilds the education modules automatically.
The tracked `MAIN-SEKARANG.html` and root `index.html` load the current `dist/` scripts and styles at the original file URL. No npm packages are required to play or edit the source.
Use Ctrl+C to stop. `dist/` contains the editable game; `modules/map/` contains the
supplied 100-seed map module, original icon PNGs, exported layouts, tests and SOR.

**Education Practice** is available directly on the main menu, without starting a run.
It reuses the full 120-question folio: browse, Hint/More Hint, worked solutions,
Basics, full English/Bahasa Melayu question switching and a separate saved learning session.
Each question now has improvement categories and a comment box. Comments save on
this device; the exit reminder offers CSV/JSON download and file sharing for Ijamm.
Collection is off until a player enables sharing in Learning Report. For a receiver that creates its own SQLite database, use `npm.cmd run start:analytics:prod` (Node 22.13+); ordinary `npm start` needs no database. See [current feedback and delivery limits](docs/EDUCATION_ANALYTICS_2_26_0.md).
The same harmonized 1.6 bank is active in Predict, Artifact trials and Mystery challenges. Its shared run ledger prevents repeat questions; New Run resets exclusion while lifetime history remains.
See [Education 2.14.0](docs/EDUCATION_PRACTICE_2_14_0.md).

The MC is **Alyssa the Clairvoyance**. Combat follows the latest supplied reference:
Alyssa left, enemy/intent right, HP underneath, hand/resources/actions below. Focus
uses the supplied cyan eye crystal, distinct from the Predict sphere above cards. The main menu keeps Alyssa
on the right of the supplied dark dungeon/gold design.
Ember Mirror has dedicated Attack/Defend/Skill/Damaged poses. New runs have 10 levels
per stage, 3–5 initial paths and the supplied Mystery/Rest/Boss and quota rules.
Continue preserves the exact saved graph, including older five-level runs.

The Combat Update ZIP installs into the existing project folder using its root
`APPLY-UPDATE.ps1`. It checks affected files, backs up original bytes and supports
rollback. It never opens another VS Code window. See the Malay guide.

```bash
npm run check
npm test
npm run test:maps
npm run build
```

`npm run build` rebuilds optional `SLAY-THE-MATH-OFFLINE.html` with embedded art/music.
This generated file is no longer tracked: the current full-animation build exceeds GitHub’s single-file limit.
Build it locally after checkout, or use `npm start` directly.
DOM tests need jsdom via `DOM_QA_MODULE` (otherwise explicitly skipped); optional
browser checks use Playwright via `BROWSER_QA_MODULE` and an installed Chromium.
The game itself has no dependency on either QA package.

See [implementation and limits](docs/DUNGEON_EDITION_2_1.md), [verification](docs/VERIFICATION_2_1.md),
[DESIGN.md](DESIGN.md), [UX-CONTRACT.md](UX-CONTRACT.md) and [SOR_README.md](SOR_README.md).
Predict, Artifact trials and Mystery use the shared 120-question bank covering Probability, Sets and Logic. Practice remains an independent review.

Main menu UWHD/display fit and 5s transitions: [Menu fit 2.5.1](docs/MENU_FIT_2_5_1.md). Browser QA: `npm run test:menu-browser` with Playwright supplied through `BROWSER_QA_MODULE`.

Special-situation artwork update: [2.5.2 notes](docs/SITUATION_ART_2_5_2.md). Run `npm run test:situations-browser` with the existing Playwright QA setup to verify the new scene layouts and actions.

Reward and Shop portrait-card correction: [2.5.3 notes](docs/FIX_CARD_PROPORTIONS_2_5_3.md).

Artifact Pack V3.2 rich text and resolved calculations: [2.6.0 notes](docs/ARTIFACT_RICH_TEXT_2_6_0.md). Open **Artifacts → View Calculations**, **Calculations** on the map/rooms, or **Log** in combat. Highlighted terms and numbers support hover, keyboard focus and tap.

Stage 1 normal/Elite frame animations: [2.7.0 notes](docs/STAGE1_ANIMATION_2_7_0.md). Five supplied enemies use 25 clips / 128 frames, with unchanged combat rules and a stable arena floor.

Alyssa's source `MODEL.zip` is integrated in [2.8.0](docs/ALYSSA_ANIMATION_2_8_0.md): 30 right-facing frames across Idle, Attack, Defend, Skill and Damaged, in both stages. Source timing and boot pivots are preserved. Run `npm run test:alyssa-browser` for focused browser checks.

[2.8.1](docs/ALYSSA_RIGHT_ONLY_2_8_1.md) removes the older hero image fallback. All five combat poses, loading/failure fallbacks and Motion Off now use the same approved right-facing family. Run `npm run build` after pulling to refresh the offline HTML.

## Both-stage enemy motion 2.10.0

All 10 Normal/Elite enemies across both stages now use the supplied Idle, Attack, Defend, Skill and Damaged sequences: 50 clips / 263 frames. The supplied Stage 1 repack matches the installed sheets exactly. Stage 2 adds its five source models, including the corrected left-facing Chain Golem and matching loading/failure posters. Alyssa retains her accepted right-facing motion and Skill calibration. See [source mappings and verification](docs/ENEMY_MOTION_2_10_0.md). Run `npm run test:enemy-browser` with the existing Playwright QA setup. Rebuild the optional offline HTML after pulling.

## Combat polish 2.9.0

Skill frames now keep a consistent body size at the same boot pivot. Result Time freezes at stage clear, victory or defeat. Hand holds at most 10 cards; excess draws stay in the pile. A compact overlapping hand reveals cards after a 140ms hover dwell or immediate keyboard focus. Use 0 for the tenth card. See [details and verification](docs/COMBAT_POLISH_2_9_0.md).

## Map and integrated learning 2.11.0

The supplied map reference now guides a worn parchment dungeon atlas, live HUD and left legend. Actual saved room connections remain clickable native controls. Both stages and old five-level routes keep their generated topology.

`INTEGRATION.zip` supplies Artifact 3.5, Question Bank 1.5 and the matched shared rich-text service. The 120 original questions now include ordered Hint/More Hint, specific wrong-choice feedback, hint/solution diagrams, worked steps after a correct answer, seven Basics modules with 14 unscored practice checks and 30-skill learning evidence. Collection → Artifacts opens the persistent Codex with search, tier filters and effect comparisons. Owned artifact counters use the real engine state. Details, compatibility and evidence: [Map & Integration 2.11.0](docs/MAP_INTEGRATION_2_11_0.md).

After pulling, run `npm.cmd run build`, then `npm.cmd start`. Rebuilding updates the offline `SLAY-THE-MATH-OFFLINE.html`. To regenerate only the supplied mechanics bundle from preserved source, use `npm.cmd run import:mechanics`.

## Map, modes, Bosses and Shop 2.12.0

Clearer map routes/Floor labels, illustrated Learn/Challenge choices, full motion for both bosses and two 3×2 Shop racks: six cards (one at 60% off), six artifacts (3 Starting / 2 Mid-tier / 1 Boss), and paid card removal. Purchases work in both modes and survive reload. [Details and save compatibility](docs/GAME_UPDATE_2_12_0.md). **Question audit found a glossary harmonization issue**; authored content stays unchanged. [Audit for the question owner](docs/QUESTION_SUPPORT_AUDIT_2_12.md).

After pulling, rebuild `SLAY-THE-MATH-OFFLINE.html` with `npm.cmd run build`, restart using `npm.cmd start`, then Ctrl+F5.

## Mystery Events 2.13.0

Fifteen supplied Mystery Events now run in both stages and modes, using the active shared question bank, fixed 30/45/60-second deadlines, final answer review and atomic once-only consequences. Artwork loads only for the current event; 8K masters remain in the source ZIPs. Refresh retains the same question, deadline, choices and reward candidates. New runs retain the existing question-history profile.

Run `npm run build` after pulling to refresh `SLAY-THE-MATH-OFFLINE.html`, then restart `npm start`. The large generated portable file is verified locally; source and runtime artwork are the release inputs. Integration rules, source PNG recovery and verification are in [MYSTERY_EVENTS_2_13_0.md](docs/MYSTERY_EVENTS_2_13_0.md).

## Mystery backgrounds and Shop tabs 2.13.1

Mystery now uses its supplied illustration as the full encounter background, like the Dungeon Master. Intro, review and reward rules share green game terms and purple snapshot previews; questions keep the existing pink math terms and worked calculations. Shop has **Buy Cards / Buy Artifacts / Remove Card** tabs with keyboard navigation. See [changes and verification](docs/ROOM_UI_2_13_1.md). Rebuild the portable HTML after pulling.

## Boss size correction — 2.13.2

Both bosses now match Alyssa’s visible height on desktop and phones. Preserve the supplied left-facing art, full source frames and shared floor; tablet placement keeps the widest VFX inside the arena. Details and executed checks: [Boss size](docs/BOSS_SIZE_2_13_2.md). Rebuild the portable HTML after pulling.


## 2.16.0 — Bahasa soalan

Pilih Question language / Bahasa soalan untuk menukar keseluruhan 120 soalan, Petunjuk, Petunjuk Lanjut dan jalan kerja antara English dan Bahasa Melayu. Kandungan dibandingkan dengan buku teks EN/BM dan DSKP. Fungsi pendidikan ini kini tersedia pada main.


## Developer Tools (v2.21.0)

```sh
npm run start:dev
```

Open http://localhost:4174 for scene selection, card upgrade/Focus comparisons and motion inspection. Sandbox progress is temporary; scene presets save separately. For a fresh player build and local preview:

```sh
npm run start:prod
```

Open http://localhost:4173. `npm run build:prod` only builds, and `npm start` keeps its previous player-mode behavior. Full instructions and limits: [Developer Tools](docs/sor/20_DEVELOPER_TOOLS.md).

## Google Sheets collection — 2.30.0

Main now includes an optional Google destination to Main Menu / Settings / Education Practice → Learning Report. No database server is needed for this option. Records stay on-device until the player opts in and the Google receiver confirms the exact revision. The existing local SQLite option remains available.

Copy **integrations/google-sheets/Code.gs** into an owner-controlled Apps Script project, run its private setup once, deploy the web app, and paste its `/exec` URL into **Collection link**. Full BM instructions, site defaults, Wi-Fi recovery, export and limits: [Google Sheets setup](docs/GOOGLE_SHEETS_SETUP.md). Live Google authorization/deployment is still an owner setup step; game code publication does not deploy or authorize the Google receiver.

## AI Playtester — branch ai

Developer-only strategy/simulation tool: `npm run start:dev`, then http://localhost:4174/__dev/ai/. Three combat policies, actual campaigns, contextual single-card/pair measurements, five-report history and resolved Energy/Focus telemetry. See [AI Playtester](docs/AI_PLAYTESTER.md). Published to ai only; game 2.31.0 and player profiles remain unchanged.
