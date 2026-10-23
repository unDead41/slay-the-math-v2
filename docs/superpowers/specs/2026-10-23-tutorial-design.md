# Complete player tutorial

Ijamm's 23 October request authorizes completing and updating the full in-game tutorial, including self-captured screenshots. The previous seven-part outline is the starting scope. Proceed through implementation and verification in this session.

## Design

Replace the four-page help modal with an accessible field guide: journey, starting choices, map, combat, cards, piles, Predict, Focus, Passive, rewards, Shop, Rest, Mystery, bosses, Education Practice, settings and readiness. Use simple complete English and BM copy. Reuse the game's art, card renderer, rich text, mathematical evaluator and native dialog. Preserve the existing menu/header Tutorial entry and Learn's automatic tutorial entry.

Screenshots come from the real 2.30 game rendered locally, using deterministic examples and the original artwork. Store optimized flat WebP assets so both production and the portable build resolve them. Captions identify example values; text and practice use the loaded engine/configuration rather than copying balance amounts.

Practice creates independent in-memory runs through the current engine. Teach a legal map choice, Attack, Block/End Turn, draw/piles, canonical Predict with hints, armed Focus, Passive, rewards, Shop, Rest and boss seals. Completion requires the intended action, while navigation and replay remain available. Reading chapters can be marked read. Only tutorial navigation/language/completion persist in `slay-the-math.tutorial.v1`. Practice never reads/writes the player's run, question history, artifact discovery, analytics or collection. Do not change game rules. Timed Mystery deadlines keep their current owner; warn when opening the guide during an active timed question.

## Approaches

Chosen implementation call: illustrated chapters plus isolated engine exercises. A screenshot-only guide cannot demonstrate consequences; a forced full campaign would take too long and risk a player's save. No new raster artwork is needed because real screenshots are available.

## Acceptance

Every chapter is reachable and localized. Resume/reset and unavailable storage are safe. Exercises reject out-of-order/stale actions, reward only once, and validate with the actual engine in ordinary and Master contexts. Escape/close restores focus, keyboard/touch work, narrow screens scroll naturally, and screenshots can be enlarged without losing navigation. Original question/card/art/audio assets and external collection remain unchanged. Deliver a pushed feature branch and reviewable pull request; main integration can follow the project's normal release boundary.
