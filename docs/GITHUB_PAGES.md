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

Friends do not install Node.js and the owner's PC need not stay on. Saves and learning reports remain on each player's browser/device; localhost saves do not automatically transfer to the website (use Export/Import). GitHub Pages is static hosting: the optional `/api/education` receiver and central database are not hosted here. Local reports and file exports continue to work; central collection needs a separate deployment.

## Troubleshooting

- A 404 before the first successful deployment is expected; check Pages Source and the workflow result.
- If Actions reports account billing/disabled-workflow restrictions, the account owner must resolve those in GitHub. No payment or billing changes are made by this setup.
- Use the Pages URL ending with `/`; do not share the repository code URL or localhost.

## First hosted attempt

Run https://github.com/unDead41/slay-the-math-v2/actions/runs/39954703122 failed before any build step. GitHub check annotation: "The job was not started because your account is locked due to a billing issue." The local production/subpath browser checks passed, but this is not a live deployment. Resolve the account restriction, enable the Pages source, then rerun the workflow. No billing changes were made.
