# Sequential Ring on the website

This folder is the production copy of the selected Sequential Ring from `motion lab/`. It runs from the website's own dependencies and assets, without importing another project's files or mounting DialKit's tuning interface.

`HeroAnimation.jsx` mounts `SequentialRing.jsx` in a responsive visual area up to 560px wide above the announcement. It supplies the opening mark and an accessible collection description. Playback starts automatically without visible controls. The website loads this component separately from the initial page content.

## Saved behavior

- 10 images, 12% card size, 21% corner roundness.
- 1× playback; floating rotation speed 0.2.
- Sequential reveal, aligned stack, gooey merge and recoil, then unfolding.
- Bounce strength 25, requested bounce duration 1.15 seconds, gooey strength 70.
- No hover interaction; horizontal and unrestricted vertical dragging follow the hand.
- Reduced motion shows the final formation and disables animated interaction.

The exact settings and timeline are in `preset.json`, copied from `motion lab/presets/sequential-ring.json`. The provenance's `source` path refers to the original capture under `motion lab/presets/`.

## Update from Motion Lab

1. Export the desired Sequential Ring preset from Motion Lab.
2. Replace this folder's `preset.json` with that exported V1 JSON.
3. Run the website's `npm run build`, then review the homepage.

If the renderer itself changes in Motion Lab, copy `geometry.js`, `layers.js`, `timeline.js`, `useLiveOpening.js`, and `motion.css` from `motion lab/src/motion/`. `MotionScene.jsx` uses the same implementation with its atlas import adjusted to `../../assets/material-atlas.webp`. `SequentialRing.jsx` is the lab's `MotionPlayer.jsx` with the export renamed. Keep the website's `variants.js`, which includes V1 only; update its behavior flags if needed.

The studio and original demo continue to work independently. Website build output is prepared in `dist/` and the repository-root production files by the existing Hostinger build script. Building does not push or deploy the site.
