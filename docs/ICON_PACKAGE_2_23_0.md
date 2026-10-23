# Reviewed icon package — Slay the Math 2.23.0

The v2.22.0 player mixed atlas bitmaps, inline utility SVGs and line-art status badges. Ijamm requests applying the reviewed package using the painted MathMon buff/debuff reference across the game's icons. This release uses one gold/navy/jewel family for UI, map, statuses, artifacts and card illustrations, keeping their real labels, counts and existing actions.

Integration base: `83a1aeee80ff0488758f94451f7afd1c27500988` (main v2.22.0). The earlier icon inventory audited main v2.21.3; the current card/artifact IDs and consumers were checked against v2.22.0 before integration.

## Delivered scope

| Family | Catalogue entries | Runtime behavior |
| --- | ---: | --- |
| Combat statuses | 10 | Existing engine values, expiry descriptions and 44px detail buttons |
| Existing UI symbols | 32 | 31 unique images; unused Sound asset aliases the primary speaker image |
| Map nodes | 6 | Battle, Elite, Boss, Shop, Camp and Mystery; Challenge/Rest reuse the matching symbol |
| Artifacts | 31 | All 12 Starting, 16 Elite/Mystery and 3 Boss identities; original effects and IDs |
| Card illustrations | 40 | Ten per category; source card values and native normal/Focus frames retained |
| Additional reviewed symbols | 11 | Existing boss-seal/mute/mixed-intent states, Skill filter, Save information, Export/Import and three topic labels |
| Total | 130 | 129 unique 512 × 512 transparent lossless WebP images; 13.45 MiB added artwork |

The package's `proposed.*` IDs remain unchanged for provenance. In this release those eleven pictures decorate existing features; they do not create extra status effects, quiz mechanics or save actions. Legacy-only UI symbols remain available for saved older content. There is no new Poison, Burn, Freeze, Stun or Silence mechanic.

Focus is a cyan eye; Predict is a cyan sphere above three cards. Defense status uses armor, Block uses a solid shield and Defend uses a protective plus shield. Weak uses a broken sword; Vulnerable uses a cracked shield. Skill's closed teal grimoire is distinct from the open Tutorial book. Each mixer bus shows its own muted/unmuted picture while preserving its existing setting.

## Owners and build behavior

- `dist/icon-assets.js` owns semantic mappings, source aliases and the shared online/embedded resolver.
- `dist/visuals.js` projects UI/map mappings; `dist/combat-status.js` projects status artwork without changing rules.
- The main app resolves source artifact image aliases before insertion. `dist/mechanics-host.js` uses the same resolver for the imported Artifact Codex, detail, comparison and live HUD.
- `tools/import-cards.cjs` overlays the reviewed 40 illustration mappings every build. It still copies the unchanged supplier data and retains the seven original portrait/auxiliary frame mappings.
- `dist/icon-package.css` uses the full 44px status artwork box, avoids a duplicate frame on boss seals and aligns symbols beside visible labels. Rich text retains color-only annotations and real fraction bars.
- `dist/assets/icon-package.json` records original archive hashes, all 129 source/runtime hashes, dimensions, byte sizes and the import's visible-RGB/alpha checks. `dist/assets/status-icons.json` describes the current ten status images.
- Versioned flat filenames work with the existing production and portable builders. Review sheets, 1080 masters and large FHD/4K exports are not copied into the runtime. Original authored artwork stays at its existing paths.

Normal builds use the committed images and registry. Reimporting the original review package is a separate optional operation requiring Sharp:

```sh
node tools/import-icon-package.cjs /path/to/Slay_the_Math_Icon_Audit
```

Input archive identities:

| Archive | SHA-256 |
| --- | --- |
| STM_Icons_Review_Sheets_SOR.zip | `8da230ae42595f7cd9e5ed7b84e8a14cc78c44bf14f05275f5b704541e9103ed` |
| STM_Icons_Individual_FHD_1080.zip | `126abd5bb223f56694d5f8d218cb8660ddf168dd0bca88803d3a99d6a4b8a41a` |

The 1080 PNG inputs have 100px transparent outer padding. Runtime derivatives retain at least 40 transparent pixels on every edge. The review's labeled sheets allow 20 entries and 100px gaps. The 4K/FHD/1080 review exports were resampled from generated boards around 1403 × 1121; exported dimensions are not a claim of native 4K detail.

## Validation

- `npm run check` passed, including the registry and explicit importer.
- `npm test` passed **467 tests, zero failures, zero skips**, with JSDOM supplied through `DOM_QA_MODULE` and Sharp available for image decoding (`IMAGE_QA_MODULE` supports the isolated CI install). Coverage includes original math, cards, saves, artifacts, maps and v2.22.0 audio plus real UI state transitions and asset/alpha checks.
- `npm run build:prod` passed; the generated offline HTML is 290,044,102 bytes. `release-prod` and the large portable build remain reproducible ignored output.
- `npm run test:icons-browser` was run using Playwright and a supplied Chromium executable. It checks the actual production build, Sound/Save states, all six map symbols, boss seals, mixed enemy intent, status inspection, question-topic art and source Artifact Codex. Desktop 1920 × 1080 and phone 390 × 844 combat retain viewport fit and 44px status targets.
- The actual generated `file://` portable game decodes the reviewed boss/status/card/artifact artwork and Codex images with zero network/dependent local asset requests. Browser error collection is empty.
- The existing verification workflow now installs isolated Sharp alongside JSDOM/Playwright and runs the production/portable icon regression.
- `git diff --check` passed. Card/artifact master data, engine rules and audio implementation remain byte-identical to the integration base.

Automated checks do not establish classroom comprehension or physical Windows/device appearance. MODEL.zip was unavailable and has not been applied. Earlier audio audition/transcript limitations still apply.

## Updating an existing Windows production checkout

Stop the running server with Ctrl+C. In the project folder, inspect `git status --short`, keep any local edits in a commit or stash, pull `main` with `git pull --ff-only`, then run `npm run start:prod`. This rebuilds `release-prod` from current sources before serving it. The terminal and Settings should report v2.23.0 at the same `http://localhost:4173` address. Refresh the browser with Ctrl+F5 if it is still open.

Owners: [Icon SOR](sor/06_ICON_SYSTEM.md), [asset pipeline](sor/14_ASSET_PIPELINE.md), [decision](sor/DECISIONS.md#dec-20261023-icons--apply-reviewed-icon-package-2230).
