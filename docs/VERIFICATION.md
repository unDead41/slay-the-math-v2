# Source Edition 2.0 — verification

- `npm run check`: all six JavaScript entrypoints pass syntax checks.
- `DOM_QA_MODULE=<available-jsdom> npm test`: 56 tests, 56 passed, zero failed/skipped. Includes exact probability enumeration, full two-stage campaigns in Learn and Challenge, both boss seals, checkpoints, old-save restoration, Gold/stock/duplicate/forged-price handling, reference-driven UI actions, collection search/empty/clear/pagination, safe tutorial practice and portable HTML.
- `node build-portable.cjs`: standalone HTML contains image/audio data and inline scripts/styles. New CSS background assets are also embedded.
- Frontend Design strict project audit: zero findings.
- DESIGN.md official lint is recorded in the task evidence; errors resolved before packaging.
- Managed preview could not start because the environment denied its process mount. No alternative server/browser infrastructure was installed. The deployed page can be checked separately in the connected browser.

The campaign simulations use actual engine actions; they do not prove human difficulty balance. DOM verification does not prove visual composition, touch behavior, FPS or audio quality. Source pose sprites are discrete views, not a skeletal animation rig. Predict is still the existing Probability mode. Expansion/Factorisation, Indices and Passive remain outside the implemented game rules.

Live browser follow-up: the deployed main menu and Card Collection were inspected in the connected Chrome browser. This exposed a background paint-order issue and a retained square aspect ratio intruding into the card title row. Both were repaired at the shared CSS owners. The final live edition is checked again after publication; engine and source derivatives are unchanged by these CSS corrections.

Final browser checks: live main menu, collection art/title layout, collection empty search/clear, battle source sprites and Predict were inspected at 1280×800 and/or 390×844. Predict fits the 390px viewport (dialog 374px) with no horizontal page overflow. Escape closes Predict and restores its trigger. The existing saved encounter was resumed; no answer, card play or turn was committed during this browser check. A final fighter-width correction removes double shrinking within the arena grid; final source artwork and rules are unchanged. Browser checks complement the 56 passing automated tests; balance/FPS/audio audition are not claimed.
