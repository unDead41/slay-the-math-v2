# Reward and Shop card proportions — 2.5.3

Source: Ijamm's image(20261021-093914).png, 2048×1038. The user reports expanded reward cards, asks to check Shop and says the other menus are fine.

## Cause and correction

The 2.5.2 situation row used three 1fr tracks. Extra horizontal space widened each card, while row heights still followed the viewport unit. The atlas illustration inherited that unequal width and height.

In the existing dungeon.css owner, cap Reward/Shop card tracks at 210 viewport units and center them. Bound only their panels at 760 units. Give the illustration a square viewport inside its existing emblem, preserving the atlas tile ratio. All three choices remain in one horizontal row; phones scroll that row from its first card. Card content, native actions, typography, background plates and other menus retain their existing owners.

## Verification

The new geometry regression first fails on 2.5.2: a Shop illustration at 1280×720 measures 179.84×125.5, rather than square. After the correction, tests assert portrait card ratios, square illustration ratios, row alignment, and unchanged card width when only ultrawide screen width increases.

The browser suite passes all six situation scenes across 11 viewport sizes, including the exact 2048×1038 reference size, the 1001px breakpoint edge, 3440×1440, 5120×1440 and 3840×2160. At 1920×1080 and 2560×1080, Reward and Shop cards are both 210×321 CSS px. At 3440×1440 and 5120×1440 they are both 280×423.31. The supplied screenshot size renders 201.83×309.02 cards with square 142.16px illustrations. Existing selection/purchase, sold-state refresh, Rest/Upgrade, reward Add/Skip, Retry, stage progression and offline checks remain covered.

Reward at the reference size and Shop at desktop/UWHD/phone sizes were visually inspected. Exact results and tested-file hashes: [verification/card-proportions-2-5-3.json](verification/card-proportions-2-5-3.json). Execution uses Linux, Node 24.19.0, Playwright 1.62.1, Chromium 153.0.8010.0 and system fonts. This is viewport testing, not physical-monitor or Windows execution. The optional portable build is regenerated from the corrected source and excluded from the Git commit.

## Apply to the existing Windows project

```powershell
cd "C:\Users\ijmah\Desktop\slay-the-math-v2"
git pull --ff-only origin main
npm.cmd run build
```

Refresh the running game at http://localhost:4173 with Ctrl+F5. If its server is stopped, run npm.cmd start in the same folder.
