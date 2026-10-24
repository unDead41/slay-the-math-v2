# Share Slay the Math through GitHub Pages

DISAHKAN, 23 October 2026: Ijamm requests a public browser link for friends, using the latest main build. No game balance or save format changes are needed.

## Enable once

Open https://github.com/unDead41/slay-the-math-v2/settings/pages and select **GitHub Actions** under **Build and deployment → Source**. This repository setting requires owner access and cannot be changed through the connected GitHub tools.

If the first deployment ran before this setting was enabled, open **Actions → Publish game to GitHub Pages → Run workflow**, choose `main` and run it. Wait for the deployment to succeed before sharing the link:

https://undead41.github.io/slay-the-math-v2/

The link is the intended address, not evidence of an already-live deployment. Confirm it loads the main menu after the first successful run.

## Later updates

`.github/workflows/pages.yml` builds from `main` on each push and supports manual reruns. It uses the existing `npm run build:prod`, checks runtime syntax, and uploads only `release-prod`. GitHub Pages serves the game at the project root; the game uses relative asset URLs so `/slay-the-math-v2/` works. Developer Hub/server files and private database files are excluded by the production build. The generated large offline HTML is not uploaded.

Version metadata and resource hashes come from the existing build. Changes become live only after a successful deployment; failed builds do not replace a previous site. Open/reload the game after an update; an already-open tab keeps its loaded version until reloaded.

## Saves and reports

Friends do not install Node.js and the owner's PC need not stay on. Saves and learning reports remain on each player's browser/device; localhost saves do not automatically transfer to the website (use Export/Import). GitHub Pages is static hosting: the optional `/api/education` receiver and central database are not hosted here. Local reports and file exports continue to work; Google Sheets collection is now available through an owner-deployed Apps Script receiver; configure its /exec URL and allowed game origin using [Google Sheets setup](GOOGLE_SHEETS_SETUP.md). The optional SQLite receiver still needs a separate server.

## Troubleshooting

- A 404 before the first successful deployment is expected; check Pages Source and the workflow result.
- If Actions reports account billing/disabled-workflow restrictions, the account owner must resolve those in GitHub. No payment or billing changes are made by this setup.
- Use the Pages URL ending with `/`; do not share the repository code URL or localhost.

## First hosted attempt

Run https://github.com/unDead41/slay-the-math-v2/actions/runs/39954703122 failed before any build step. GitHub check annotation: "The job was not started because your account is locked due to a billing issue." The local production/subpath browser checks passed, but this is not a live deployment. Resolve the account restriction, enable the Pages source, then rerun the workflow. No billing changes were made.

## Production Dev branch update — 24 October 2026

On dev-tools / 2.31.1-dev.1, the production build intentionally includes a password-gated static Developer Hub. This supersedes the older developer-exclusion description for this branch only. Player storage stays separate from memory-only previews. The gate is a client-side convenience lock, not secure authentication; see SOR 20. This feature has not been published to main or a live site.

## Main release 2.35.0

Ijamm has authorized the production Dev password, extended sandbox and diagnostics integration into main. The production build now intentionally includes the static gated Hub; earlier production-exclusion/branch-only statements are historical. AI Playtester still needs the local dev server and is not included in the static Hub.
