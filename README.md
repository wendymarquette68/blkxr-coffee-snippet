# BLKXR Coffee Maker — preview snippet

Black-and-gold coffee maker by WendstormXR for BLKXR, with a gold pressure gauge and a single BLKXR cup wordmark.

This is a test release for The Pod. Press the large GRIND dial for a 3.2-second grinder sound, then press the gold BREW button for a 12-second animated cycle with spatial audio and brown coffee. BREW turns green while brewing. When it finishes, pick up the 10.7 cm cup by its handle; the saucer stays on the tray. Brewing is locked while the cup is held or away. An abandoned cup returns after two minutes without being held. A separate selectable edition offers six body finishes. DOSE and DOUBLE remain decorative controls.

Runtime bundles target Windows and Android using Unity 6000.3.21f1 and Creator SDK 4.0.29. The front panel uses the machine base's warm metallic gold. Steam uses a faint textured wisp; automatic mouth-proximity sipping/steam is not implemented. This repository contains only the coffee runtime assets, loader and card; no private world source or account data.

## Install

You can install through the Altspace website without Unity. Open **Edit world → Snippets → All**, search **BLKXR Coffee Maker**, open its card, and choose **Copy code & open index.html**. In the website editor, paste the copied complete `<bs-snippet>…</bs-snippet>` once inside the page's `<body>` (before `</body>`), keeping the existing world code. Save the file and leave/rejoin the world to check it. For an externally hosted world, use **Copy code** and edit the page at its own host.

Do not use **New snippet** to install this coffee maker: that creates a new catalogue listing. Use the existing `blkxr-coffee-maker` listing.

To choose placement, edit these attributes on the copied opening tag:

```html
position="0 1 0" rotation="0 90 0" scale="1 1 1" edition="black-gold"
```

Position is X Y Z in metres; Y is the height of the machine's base. Rotation is X Y Z in degrees; change the middle number to turn it. Scale `1 1 1` keeps its intended size. The example places the base one metre high and turns the machine 90 degrees; use coordinates appropriate to your own counter. Keep the copied script URL. For multiple machines, give each tag a different `instance` value. `edition="selectable"` enables the separate six-finish edition; `black-gold` is the fixed BLKXR edition.

Unity users can add a **BS Snippet** component and enter `blkxr-coffee-maker`. Set placement in the snippet's attributes; leave the carrier GameObject at its default transform.

Website workflow checked against the site's published world editor on November 21, 2026. Website-only changes should also be retained in a creator's source project before a future Unity upload replaces the hosted page.

Headset and multiple-user acceptance testing is pending. Do not treat this preview as the final giveaway package.
