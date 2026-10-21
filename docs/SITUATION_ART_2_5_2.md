# Special-situation artwork — 2.5.2

Source: Ijamm's four supplied scene mockups, 21 October 2026 (Malaysia).

## Scene mapping

| Supplied reference | Live scene | Runtime asset |
|---|---|---|
| Mysterious merchant's dungeon card shop-1.png | Both stage Shops | situation-shop.webp |
| Alyssa opens a glowing victory chest(1).png | Card Reward, Stage Clear, final Victory | situation-reward.webp |
| Alyssa’s Quiet Defeat(1).png | Defeat / Run Ended | situation-defeat.webp |
| Dungeon rest site with explore-2.png | Rest | situation-rest.webp |

Built-in imagegen precise-object-edit removes the baked panels, text, sample cards, prices and HUD. The scene, Alyssa's pose, merchant, chest, campfire and lighting are retained. Full prompts, reference/clean-plate/runtime hashes and dimensions are in [situation-art.json](../dist/assets/situation-art.json). Native clean plates are 1672×941, except the chest at 1671×941. Quality-94 WebP conversion does not upscale them or claim native 4K detail. Original uploads and existing game assets are untouched.

## Live layout and interactions

DCVisuals.situationScenes supplies the mapping; the existing app.js scene renderers share situationArt. dungeon.css owns the scoped responsive variant. Desktop layouts contain the full plate and place live ornate panels at right. Panels, typography, cards and actions scale with a viewport unit. At 1000px and below, an art banner precedes the controls; the document scrolls naturally, and narrow card rows own horizontal scrolling. Native buttons, keyboard focus, the shared dialogs and reduced-motion behavior remain.

Prices, card names/effects, HP, Gold and statistics come from the existing engine. Shop purchases, Rest/Upgrade, reward Add/Skip, Retry, Stage 2 progression, artifact/question gates and saves retain their current owners. In particular, the image's example six-card inventory, artifact sales and Explore choice do not introduce new mechanics in this visual update. No engine, question-bank, save-schema, combat or Home-timing change is included.

## Verification

Actual results and tested source hashes are recorded in [verification/situation-art-2-5-2.json](verification/situation-art-2-5-2.json). Script syntax, the portable build, all 100 engine/education/DOM tests (zero skips), the six new situation check groups and the existing education browser suite pass. The pre-existing full menu suite did not complete: it reached its 9000ms Settings locator timeout on this host, so it is not reported as passed. Home CSS and its 5s timing are unchanged; the new suite separately verifies Continue, shared dialogs and returning to the map.

The new browser suite exercises all six scenes at 1280×720, 1920×1080, 2560×1080, 3440×1440, 3840×2160, 844×390, 390×844 and 320×740. It verifies contained decoded artwork, no horizontal page overflow, at least 44px native actions, exact save preservation through resizing, both stage Shops, keyboard selection, once-only purchase and sold-state refresh, healing, native Upgrade dialog/Escape, reward Add/Skip, learning record/Retry, Stage 2 checkpoint and embedded offline artwork/actions. Shop, reward, Rest and defeat screenshots were visually inspected; phone action rows use a row direction explicitly to avoid inherited tall button sizing.

Execution is Linux/Node/Chromium via Playwright with system fonts. This is browser viewport testing, not a claim of physical-monitor testing or Windows shell execution. QA dependencies remain external to the game. npm run build regenerates the optional portable HTML; its generated 75MB output is excluded from the source commit.

## Apply in the existing Windows project

```powershell
cd "C:\Users\ijmah\Desktop\slay-the-math-v2"
git pull --ff-only origin main
```

Keep the existing game server running and press Ctrl+F5 at http://localhost:4173. If it is stopped, run npm start in the same folder. For the optional portable HTML, run npm run build after the pull.
