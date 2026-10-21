---
version: alpha
colors:
  background: "#09131f"
  surface: "#101e2a"
  primary: "#e4bd70"
  ice: "#6ee7ef"
  ember: "#eb7656"
  text: "#f7efdc"
typography:
  display:
    fontFamily: "Georgia, Cambria, serif"
  body:
    fontFamily: "Trebuchet MS, Segoe UI, sans-serif"
rounded:
  card: "9px"
  control: "7px"
spacing:
  unit: "6px"
components:
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
  focus:
    textColor: "{colors.ice}"
  damage:
    textColor: "{colors.ember}"
---

## Overview
Slay the Math is a browser dungeon card game for students. The user's nine supplied screen designs and three source model packs define this edition. The signature is a painted red-haired armoured adventurer against blue stone, cyan crystals and warm torchlight. Live controls reproduce the reference hierarchy. Full screenshots are never used as fake clickable screens. Keep the decision area calm and legible; detailed source art carries the fantasy identity.

## Colors
Model B: `dist/dungeon.css` is the canonical token source for this edition, loaded after retained base styles. `dist/scene.css` consumes those tokens for the latest menu, map seals and pose rules; `dist/combat.css` is the final scoped combat-layout layer. Mapping: colors.background → --bg; colors.surface → --surface; colors.primary → --gold; colors.ice → --ice; colors.ember → --ember; colors.text → --text. Shared controls, cards, panels and meters consume these tokens. --gold-soft is #ffe6ab; --muted is #b8c2ca. Gold marks primary actions; cyan marks selected options and knowledge; red marks damage/HP. Labels and shapes accompany color. Parchment map/card effects use dark ink. Retained style.css/crimson.css/map.css supply legacy utility geometry only; their prior mage-home identity is superseded by this explicit user redesign.

## Typography
Restrained Georgia/Cambria titles and card labels; Trebuchet/Segoe body. Player-facing copy is simple English. Tabular counters, large intent values, readable effect summaries. Development notes may be Malay. Mathematical fractions use stacked notation in tutorial choices; Predict accepts exact typed fractions, decimals or percentages.

## Layout
Home follows the latest supplied dark dungeon reference: a left title/gold menu and the new Alyssa front portrait on the right. Shared HUD shows stage, room, HP, Gold and deck. The map uses a left legend rail beside a wide scrollable parchment atlas; encounter identities remain hidden until room entry. Reward places portrait beside three cards and an explicit Add action. Rest presents two selectable options and one confirmation. Shop presents merchant, stock and price preview. Collection uses six-card pages, category filters, local search and an upgrade preview. Native dialogs own Tutorial, Predict and secondary tools. On narrow screens, decision controls move into natural document flow. Crowded combat hands overlap, with a visible local scrollbar when the minimum exposed card step cannot fit. New runs use the supplied ten-level map SOR: twenty rooms per complete run, 3–5 initial paths, mandatory Mystery at level 5, Rest at level 9 and Boss at level 10. A scrollable parchment atlas opens near the available row. Older saved routes retain five floors.

## Elevation & Depth
Dark blue, lightly translucent panels sit above the actual arena backgrounds. Gold double insets and small corner diamonds follow the references. Painted characters get restrained ground shadows. Cards and selected controls have modest elevation and cyan outlines; no decorative particle layer covers text.

## Shapes
Cards use 9px corners, controls 7px. Circular energy costs, paired-circle probability emblem and angular gold edges distinguish the game. Native semantic buttons own actions.

## Components
`cardView` is the sole renderer for hand, reward, stock, collection, tutorial and card-selection dialogs. `mathArt` owns individual source card art and retained mathematical atlas fallback. `modal`/`close` own native dialog semantics and focus restoration; `toast` owns live feedback. `mapView` owns direct-entry room icons and the legend while `map.js` owns graph legality. `DCVisuals` in `visuals.js` owns the supplied pose/icon registry. `mapIcon` renders all six transparent seal categories consistently. `engine.js` owns all gameplay, prices, stock, Gold and claims. `DESIGN.md` mirrors runtime tokens; no separate framework theme exists.

## Do's and Don'ts
Use the source armoured adventurer, never the old red/white mage. Preserve exact HP, card effects and probabilities; screenshot numbers are illustrative. Keep source originals intact. Source enemy IDs and stable engine IDs are mapped in `docs/SOURCE_EDITION.md`. Passive, algebra and indices art do not silently activate new mechanics. Predict remains the existing Probability system.

## Motion
The new transparent sheet supplies Alyssa standing front/back/left/right. Combat 2.2 uses her front stance to match the supplied open-stance reference; idle feet remain grounded without a floating animation. Her existing attack, defend, skill and damage poses remain. Ember Mirror has its own dedicated new model and four action poses; other enemy reactions use CSS on their model. Pose swaps and floating numbers follow resolved engine outcomes; no delayed animation mutates gameplay. Home breathing, pointer parallax, short dialog transitions and card hover remain restrained. A single common canvas preserves Ember pose padding. Pose timers never alter engine state. Persistent Motion Off and OS reduced motion disable decorative animations, including pseudo-elements. Audio uses the three user tracks for Stage 1 combat/elite and both bosses, with baked circular crossfades; the remaining room cues retain the existing original soundtrack.

## Reconcile drift
| Previous rule | User-directed resolution |
| --- | --- |
| Red/white mage and geometric portal | Armoured dungeon adventurer and blue stone source arenas |
| Malay interface | Existing English edition retained; stage names follow source roster: Sigil Keep / Deck Tower |
| Artifact icon below title | Shared framed cards with title above artwork, role band, parchment effect |
| Immediate reward/rest claim | Preview then explicit Add / Confirm Rest |
| No playable shop | Versioned map adds Shop; old saved routes preserve their original topology |

## Dungeon Edition 2.1 references

Latest screenshot: dark blue stone, gold menu at left, Alyssa at right. `source-art/alyssa-standing-4-pov.png` owns her current standing appearance. The six original framed seals in `modules/map/assets/map-icons/` own map categories: Battle/Elite/Boss red, Shop/Rest blue, Mystery purple. Halo and labels communicate selection/state without recoloring their artwork. The previous unnamed-MC note is superseded by the user's explicit Alyssa instruction. Details and retained source mappings: `docs/DUNGEON_EDITION_2_1.md`.

## Combat Edition 2.2 reference

The user combat reference in `references/combat_layout_v002.png` owns the new battle hierarchy: turn badge top-centre, Alyssa on the left, enemy and intent on the right, HP under each character, resource medallions bottom-left, live hand bottom-centre, spent piles and Predict/End Turn bottom-right. At medium widths the side controls stack; on tablets and phones the hand and actions move into natural document flow. Only the hand owns horizontal scrolling. The art remains the supplied arena/model assets; no screenshot is used as an interactive surface. Screenshot values never replace configured values.

Focus uses the new gold target/ruby icon in `dist/assets/icon-focus.svg`; Predict retains its cyan orb glyph. They have different silhouettes as well as colour. `DCVisuals.icons` owns the asset path. `DCConfig.MC` owns the exact name/title **Alyssa the Clairvoyance**, reflected in menu, combat and SOR 08. Native dialogs, keyboard shortcuts, action handlers, engine state and save schema stay shared across layouts.

## Dungeon Edition 2.3 — menu and arena grounding

The five latest reference images supersede the separate floating portrait on Home. Use their dungeon/anime identity and scene poses (corridor, campfire, rune archive, map and doorway); clean plates remove baked title/menu pixels. `DCVisuals.menuScenes` is the canonical scene registry. The same five real HTML menu controls remain stationary while artwork fades. Gold Continue becomes available when a save exists; otherwise New Run carries primary emphasis. Manual diamond scene controls are 44px targets. The visible UI remains English. `dungeon-2-3.css` owns these explicitly scoped refinements and uses the existing `dungeon.css` colour/type tokens. No separate theme is introduced.

Battle backgrounds belong to `.battle-theatre .arena-sky`, rather than a cover background on the document body. Source images preserve aspect ratio and use cover framing centred on the 68% floor horizon so floor remains visible. `DCVisuals.arena(stage,kind)` chooses the six supplied Normal/Elite/Boss variants. All sprite exports share a 1600×1200 canvas, foot pivot (800,1100), and `fighter-anchor` at the theatre ground line. A contact shadow uses the same line; HP panels sit beneath it. Ground actors have no vertical idle motion. Rune Bat remains airborne with a projected floor shadow; Ember Mirror's flame hovers just above its contact glow. These source anatomies are intentionally preserved. All five poses retain their pivot.

## Screen fit 2.3.1

Combat fills the available viewport width. A shared responsive CSS unit scales the desktop arena, card dock, labels and controls together at larger CSS viewports, with a 1px floor preserving phone layouts. Arena cropping stays centred on the 68% floor horizon, keeping the 77% desktop / 73% phone ground line on the floor. No wrapper zoom or transform changes native hit targets. Evidence and limits: `docs/FIX_SCREEN_FIT_2_3_1.md`.

## HUD icon correction 2.3.2

The user's four crops identify a small Energy symbol, a Focus style mismatch, a missing illustrated Predict and a small HP badge. The current atlas now owns Focus: use its cyan eye crystal, superseding the 2.2 line target. A companion painted Predict badge uses a cyan sphere and three cards, sharing the double gold frame but a different silhouette. Energy fills its resource badge instead of nesting inside another CSS ring. Both fighters' HP badges are larger. Sizes scale through the existing combat unit. Source art and generation provenance: `dist/assets/hud-icons-2-3-2.json`.

The additional Rest correction uses the original blue campfire seal on the healing choice, shared with the map Rest node. The heal preview and confirmation retain their existing native flow. It is included in the same 2.3.2 update.

## Artifact Edition 2.4 — the Dungeon Master's gift

Use the user's latest illustrated meeting of Alyssa and the Dungeon Master in the approved blue-stone dungeon. The 2.4.3 upload supersedes the 2.4.1 rift: the Master is a non-human obsidian/stone entity with cyan eyes, a carved face, gold cracks and large stone hands above the altar. Keep the exact supplied illustration. Characters inhabit the left of a full-bleed background; a quiet right wall carries three native gift choices. The selected artifact receives the single warm glow treatment. Reuse the existing navy/gold palette, Georgia display face, Trebuchet body, button/dialog owners, focus ring and reduced-motion policy; artifacts.css consumes the dungeon.css tokens. On phones the scene becomes a 400px narrative banner above stacked icon/text choices in natural flow. No UI text is baked into artwork.

The supplied 800px artifact icons retain their alpha and proportions. Their 4K copies, duplicate sheets and native boards are excluded. Desktop/phone and offline rendered checks appear in docs/ARTIFACT_EDITION_2_4.md.

## Map and entity correction 2.4.1 / direct entry 2.4.2

The signature is an expedition atlas with generous space between level rows, rather than a whole-stage miniature. `journey.css` is the final scoped map layer; it consumes the existing dungeon.css palette, type and scrollbar owners. Its geometry token `--journey-unit: clamp(1px, .052083333vw, 2px)` owns the map-only scale. The ten-level parchment is 2700 units tall and the legacy five-level parchment 1450 units tall; current ten-level rows are about 248 units apart. The quiet gold left rail owns only the six-category legend; activating a room icon enters that room immediately. No enemy preview or alternate name-bearing choices remain. Ink lines and level numbers carry navigation; cyan marks the selected gate, red traces the travelled route.

The atlas alone owns map panning and visible scrollbars. On phones its minimum 460px internal width preserves readable five-path seals; horizontal movement stays inside the chart, and the legend stays left. The document retains natural scrolling on short screens. Desktop map framing and a compact short-laptop legend keep room entry reachable. Map icons are native entry buttons: click, Enter or Space opens their exact legal room through engine.enterNode, with focus moved to the new scene. Focus alone never enters a room. Unrelated map rerenders preserve both scroll axes.

The entity artwork runtime file is 3840×2160. Built-in image generation returned a 1672×941 source; a documented Lanczos/WebP export supplies the 4K canvas, and must be described as upscaled rather than native 4K. Prompt, source/runtime hashes and dimensions: `dist/assets/dungeon-master-entity-2-4-1.json`.

The 2.4.2 instruction removes the entire Selected Path / Enter Room / Current level area. The left rail is a legend, and the atlas itself owns entry. The separate full-resolution PNG export of the approved entity image is bundled as ARTWORK/Dungeon_Master_4K.png; it is the documented 3840×2160 upscale of the original, with no redraw.

## Education gate 2.5.0

The user now requests actual questions after Claim Artifact. Extend the existing full-bleed Master encounter: retain the supplied stone Master and Alyssa at left; the quiet right wall carries one dark, legible question panel rather than a separate visual identity. artifact-ui.js owns both choice and question variants. A small chosen-gift row connects the two steps. Chapter, item ID and seen-count describe real content. Four native lettered answer buttons, explicit Check Answer, Hint and correct explanation use the existing navy/gold/cyan tokens, display/body families, radius, focus rings and global scrollbar. education.css adds only scoped geometry/state rules; dungeon.css remains the token source. Wrong choices include a text cue; correct feedback has a text label and cyan knowledge accent.

On phones a compact 245px art banner precedes the question in natural document flow. Long prompts/options wrap and remain fully readable; no fixed-height question scroller or shared shell lock is added. Focus moves to the trial heading on opening and to the next usable control after an answer; feedback/hint can scroll into view. Question, choice and hint state belongs to the engine save, never DOM-only rendering. No new decorative animation or generated art is introduced.

## Main menu fit 2.5.1

The user's UWHD report supersedes Home's cover crop and fixed 480px action cap. `dungeon-2-3.css` remains the menu layout owner. Its `--menu-unit` on `body.home-active` uses the smaller viewport axis (1920×1080 reference, .8px floor, 2px ceiling), so title, action sizes, footer, scene controls and the existing non-wide Settings/mode dialogs grow together. Phone controls retain at least 44px targets and natural document/dialog scrolling. No wrapper zoom or global viewport lock is used.

The foreground uses `object-fit: contain` with a visible safety margin on every scene; a dark, blurred cover layer of the same source fills the remaining display without clipping the foreground model. All five scene sources stay fixed during a fade, so rapid manual choices cannot replace the pixels of an outgoing image. The same existing scene/generation owner swaps active classes after decode. `DCVisuals.timing.menu` and `menuFade` own the 5000ms automatic interval and 5000ms crossfade. Menu controls stay stationary. Motion Off, OS reduction, hidden tabs, open dialogs and main-control interaction retain their pause behavior. Original artwork, gameplay and saved runs remain unchanged.

## Special situations 2.5.2

The four supplied Shop/chest/defeat/campfire mockups own the scene composition. Their baked controls are removed using built-in imagegen precise-object-edit; Alyssa, props, merchant and dungeon lighting remain the visual anchors. The clean WebP plates are decorative layers in the existing rewardView, campView, shopView and summaryView, with DCVisuals.situationScenes as the artwork registry. The shared dungeon.css owns the scoped situation layout. Existing navy/gold/cyan tokens, Georgia/Cambria display type, Trebuchet/Segoe body type, ornate panel, native buttons and cardView remain canonical.

Desktop plates use contain framing, with the character at left and live panels at right; no background crop cuts off the model. A viewport unit scales panels, typography, cards and actions through 4K without scaling the shared shell. At 1000px and below, the whole illustration becomes a compact banner before the live panel; narrow card rows own horizontal scrolling. The document retains vertical scrolling, keyboard focus and reduced-motion behavior. Reward, Stage Clear and final Victory share the chest illustration; Defeat uses its own sad pose. Both Shop stages retain their live trader names and stock. Screenshot prices, sample cards, artifacts for sale and Explore labels do not create new engine mechanics. Provenance: dist/assets/situation-art.json.

## Reward and Shop card proportions 2.5.3

The user's UWHD screenshot reports stretched cards in the reward panel. In the existing dungeon.css situation variant, cap reward/shop tracks at 210 menu units and center them; narrow rows retain horizontal scrolling from the first card. Cap only the reward panel and Shop stock/detail panels at 760 units. Keep their existing typography and row heights. Give the square source-art viewport its own aspect ratio inside the existing card-emblem so the atlas is not stretched to the card's available width. Rest, results, scene plates, Home and combat styles retain their prior geometry.

## Artifact rich text 2.6.0

The supplied ARTIFACT (2).zip adds three scoped token colors: calculation #B9A3E3 with dotted underline, math #E7A1C4 and game #9ED5B0 with dashed underlines. Ordinary text, card frames and background art keep their existing design. The 31 descriptions and 55 glossary entries come from the pack; core-dependent definitions are reconciled with config/engine.

Artifact selection remains a native button for artwork/name. The adjacent effect paragraph contains independent native term buttons, so no interaction is nested and reading a term cannot select or claim a gift. One shared tooltip owner supports hover, keyboard focus, tap, Escape and outside dismissal, including inside the existing modal dialog. Resolved values live in the existing inventory and log flows plus a Calculations action; each value and unit are separate targets. Shop prices use the same engine price calculation, with no card geometry changes.

## Stage 1 frame animation 2.7.0

Five non-boss enemies share the supplied atlas origin and display scale. A canvas overlays the existing floor-registered static sprite; only a successfully painted frame hides its fallback. Source cells use their full accepted padding. Motion belongs to one presentation player; its state is never saved as combat. Dialogs/hidden tabs pause, Motion Off/reduced motion uses a static supplied frame, and navigation disposes the player. No artwork, model sizing or animation update for the unavailable Alyssa ZIP is claimed.

## Combat hand and Skill polish 2.9.0

The current user instruction replaces separated crowded-hand cards with an overlapping rail. Reuse the existing gold/parchment portrait cards, Georgia labels, dungeon.css palette and combat unit; hand.css scopes the geometry. Opaque disabled cards prevent text from showing through from lower cards. A hovered card lifts after a 140ms dwell and neighbors slide aside; keyboard focus is immediate. Local scrolling preserves readable cards on phones, with no page-width expansion. This extends the battle hand only; reward, Shop and Collection keep cardView and their established layouts.

Skill keeps the source right-facing poses and timing. Per-frame uniform body projection removes apparent size changes around the same boot pivot. Source sheets and posters remain unchanged.

## Both-stage enemy motion 2.10.0

Extend the existing floor-registered atlas player to all ten Normal/Elite actors. Preserve accepted Stage 1 art and the complete Alyssa registry. Stage 2 uses the supplied v2.1 left-facing family, including Chain Golem's correction, full padded cells, common scale and grounded shadows. Chain Weaver retains its authored hover. Same-source posters cover loading and failures; disable legacy CSS transforms on atlas-backed enemy images. Existing arena, HUD, typography, palette, hand and input owners remain canonical. Source registration and QA: docs/ENEMY_MOTION_2_10_0.md.
