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

The website renderer caches stage dimensions and unchanged styles, and draws live playback once per animation frame. Preserve these production optimizations when syncing future studio changes.

If the renderer itself changes in Motion Lab, review and copy `geometry.js`, `layers.js`, `timeline.js`, `useLiveOpening.js`, and `motion.css` from `motion lab/src/motion/`. `MotionScene.jsx` uses the same implementation with its atlas import adjusted to `../../assets/material-atlas.webp`. `SequentialRing.jsx` is the lab's `MotionPlayer.jsx` with the export renamed. Keep the website's `variants.js`, which includes V1 only; update its behavior flags if needed.

The studio and original demo continue to work independently. Website build output is prepared in `dist/` and the repository-root production files by the existing Hostinger build script. Building does not push or deploy the site.

## Mobile performance check — 2026-09-11

Local production Chrome was tested at 390×844 with device scale factor 3, touch input, and 4× CPU throttling. Both baseline and optimized runs delivered approximately 60 requestAnimationFrame callbacks per second, with 95th-percentile intervals around 16.8ms. This did not reproduce the reported phone slowdown. Callback timing is not a measurement of frames actually presented by a physical phone's GPU.

Across the opening and four seconds of floating, the optimized trace reduced style recalculation events from 1,172 to 623 and FunctionCall duration from 257ms to 151ms. These single-run totals indicate reduced overhead, not a guaranteed device FPS improvement. The renderer now reads dimensions on resize, applies each transform once, skips unchanged filter/opacity/layer writes, and avoids rendering the opening twice per frame.

An additional 8× CPU-throttled run with touch dragging also maintained approximately 60 callbacks per second. Touch capture and page scroll locking passed. The gooey entrance, saved count/roundness, and reduced-motion freeze/resume were checked separately. Physical-device and mobile Safari performance remain unverified.
