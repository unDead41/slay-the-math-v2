# Emberlyn — Online API and local learning help

Candidate **2.53.0-pet.1**, branch `codex/ai-pet-online-20261025`, based on actual main `7a49fff83388347f0157616fc6b051ddbda4c694` /2.52.0. Main remains outside this feature's publication scope. This conversational helper is separate from the existing developer playtester/model; no simulation campaign, balancing values or model training changes.

## Current integration

The existing Settings group is the sole Online/Offline owner. Default Online preserves resource loading but does **not** grant API permission: the player must explicitly select Online. The pet registers its transport once with `STMPetHelp.setTransport`; every request passes through existing `STMPlayMode.requestOnline`, including its 12-second deadline/choice-change cancellation. No `DCConnection` module or duplicate selector is added. Offline and unselected mode use packaged FAQ and mathematical definitions, not an offline LLM. Current main's full installer/readiness remains authoritative.

The original owned ChatGPT pet **Emberlyn** is reused byte-for-byte. The small launcher is hideable in Settings. BM/English follows current game language. Original frames run at 5 fps; Motion Off, reduced motion, hidden document and hidden launcher stop its single animation timer. A native dialog and an inside-modal trigger preserve focus and prevent battle keyboard shortcuts while chatting. Mobile home placement uses the noninteractive hero picture and scrolls with it; battle placement keeps the hand clear.

Scope: the game plus Form 4 **Logical Reasoning**, **Operations on Sets**, **Probability of Combined Events**, in simple BM/English. Exact fraction/set/truth calculators check supported inputs. Conditional multiplication explicitly requires P(B given A) and P(A)>0; independence is never inferred. Pure checks do not guarantee every generated explanation is correct. Original saved-deck definitions/upgrades use the existing engine.definition owner; current, archived `card-effects-1`, and unversioned 40-card facts follow the existing card-combat rule selection. Facts are definitions, not live damage/cost/status/Focus quotes; the actual preview remains authoritative.

When a question is active, free chat pauses, including after returning to Main Menu. The original Continue action resumes a pending run before its original Hint is opened. The pet opens the original Help tab/Hint control, preserving assistance/attempt records. Practice conservatively pauses free chat throughout its area and uses its original Hint tab. Generic local reference definitions remain available. No private question text/answers/worked bank solutions, full save, RNG, unseen order, future offers or learning records are sent. This is normal-flow integrity, not an anti-cheat guarantee against edited clients or external assistants.

Context comes from small read-only app callbacks rather than parsing a potentially stale persisted save. Only visible scene/difficulty/rule version/HP/MaxHP/Energy/Focus/Block/hand IDs/upgrades reach the server. Local cancellation tokens never leave the client. Chat and classroom code stay in tab memory, with Clear. Replies use textContent. No chat logging or automatic training is implemented.

## Secure activation — operator inputs

No real provider key/call or external backend deployment is established by this implementation. To activate:

1. Set `OPENAI_API_KEY` directly in the Node host secret manager or an ignored local `.env`. **Never paste it into chat, client config, source control or the player access-code field.**
2. Set `OPENAI_MODEL` to an available Responses/function-calling model in that API project. No model/costly default is guessed.
3. Set a private `PET_ACCESS_CODE` of 12–200 ASCII letters, digits, underscores or hyphens and give that classroom code to intended players. It is a small-classroom shared boundary, not student accounts.
4. Provide a Node backend with outbound HTTPS access to api.openai.com. For public use, configure HTTPS and exact game origins in `PET_ALLOWED_ORIGINS` (comma-separated, no wildcard/path). GitHub Pages needs a separate backend; it cannot execute Node.
5. Set only the public backend base URL in `dist/pet-config.js` before building, e.g. `https://helper.example/api/pet/`. Default `/api/pet/` works on the same local Node origin. A file: portable copy needs an explicit remote HTTPS URL for online chat; its local FAQ needs no server.

Use a Node release supporting --env-file (tested with Node 24). Copy `.env.example` locally and fill it privately, or use hosting environment variables.

```sh
npm run build:prod
node --env-file=.env server.cjs --prod
```

Deploy the repository backend (`server.cjs`, `tools/pet` and canonical runtime modules). Uploading static `release-prod` alone does not run the API. Local testing without a configured key remains fully playable; online requests fail closed and local help remains available.

Build the game and backend from the same versioned source snapshot. Normal clients tag their game release; a mismatched server fails closed to local help, including an older cached client after a backend upgrade.

GET `/api/pet/status` reports the server release and configuration presence, not live model connectivity or billing. POST `/api/pet/ask` requires the classroom Bearer code, permitted Origin, bounded JSON and supported context/rule version. Provider URL/model/tools cannot be chosen by a player. HTTPS reverse proxies need their real game origin explicitly configured.

Limits: 1,000 message characters, 8 history items, 16,000 request bytes, 650 output tokens/call, maximum 3 provider calls/question, default 120 paid calls/hour/process and 3 concurrent requests. Tool continuations count. Backend default deadline 10 seconds fits the shared 12-second client boundary. Caps are in-memory, reset on restart and are per replica: larger deployments need shared quotas/auth and provider-project spend controls. Upstream errors never echo keys/private provider bodies. store:false is sent; this is not a promise about all provider retention. Configure hosting logs appropriately.

## Original pet and curriculum provenance

Stable pet ID `pet_6ad9838d7d2c81918412761fe703171e`, original PNG **4,427,889 bytes**,1536×2288 RGBA, SHA256 `51ac96816818d22a27d469286926863f32b362e90c33dca5d62a1bbaa075a2fc`. Frame 192×208; 8 columns/11 rows; inspected populated row counts6/8/8/4/5/8/6/6/6/8/8. No redraw, asset substitution or ChatGPT pet creation/selection/update. Temporary export URLs are not retained.

The supplied source review from the original work was selective: BM PDF pages 62,64,97,104,253,264; DSKP 56,62,82; English compound-statement/scope excerpts 69,103,251. The recovered formulas also match the current mathematical owner SOR02. This is not whole-book/all 120-question validation. MODEL.zip remains unavailable/unread; it is not needed to recover the original pet.

Official API references checked 27 October 2026: [authentication](https://developers.openai.com/api/reference/overview), [Responses migration](https://developers.openai.com/api/docs/guides/migrate-to-responses), [typed function calls](https://developers.openai.com/api/docs/guides/function-calling). [Publisher/current-owner handoff](AI_PET_PUBLISHER_HANDOFF.md). [Actual audit/evidence](audits/pet-assistant/LATEST.md).

## Verification

```sh
npm run test:pet
npm run check:pet
npm run build:prod
npm run test:pet-browser
```

DOM tests need jsdom (`DOM_QA_MODULE` supported); browser tests need Playwright/Chromium (`BROWSER_QA_MODULE`, `QA_CHROMIUM_EXECUTABLE`). HTTP tests use real local HTTP and an injected fake provider. Native tests intercept only the tutor endpoint; game/engine/art/portable bytes are real. No fake result is described as live API validation. Original old candidate b497eb0 and its local QA were pruned before publication; old 1173/35 results remain historical only. Fresh results below are bound to this reconstruction on current main.

Current recovery evidence:36 focused,36 native pet,15 production cold-offline and3 strict media checks pass;98 real bilingual captures and111 exact source bindings. Full Node command exits0 with1162 retained PASS names and a complete fresh disjoint95-case tail (1257 distinct recorded cases; original EOF summary unavailable). See the audit/evidence for exact scope, source/production release identities and the file-origin Online operator erratum.
