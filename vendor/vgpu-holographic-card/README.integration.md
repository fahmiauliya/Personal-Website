# Holographic Card source and portfolio integration

The five original example files were downloaded unchanged using:

```sh
npx vgpu examples pull holographic-card --out ./holographic-card
```

`UPSTREAM.json` records the CLI revision, aggregate checksum, and SHA-256 of every source file. The original files are preserved here and in the Personal Website project's `vendor/vgpu-holographic-card` folder. License: MIT; see `LICENSE`.

## Adaptation in Personal Website

- `src/pages/About/capabilityFoil.ts`: vgpu WebGPU initialization, surface, compiled effect, resize handling at native screen/browser-zoom resolution, and idempotent cleanup. The upstream 2× DPR cap is removed; a resolution listener refreshes settled frames when display density changes. Draws are submitted only while the existing controller changes the light or reveal.
- `src/pages/About/capabilityFoil.wgsl`: the example's wavelength/diffraction, pearl, surface grain, and directional reflection adapted to the existing flat, near-white Product Design card. Existing topographic curves replace the example's triangle/lettering artwork. The light remains localized with a softer connecting contour reveal and nearest-edge pearl.
- `src/pages/About/CapabilityCard.tsx`: keeps the existing DOM title and layout, staged hover timing, eased pointer, reduced motion, and static touch presentation. Loads WebGPU on visibility; initialization/runtime failure uses the clipped CSS/SVG fallback.
- `src/pages/About/about.css`: WebGPU owns the active material; SVG/CSS layers remain the fallback. Layout, card borders, and surrounding grid are unchanged.
- `package.json` / `package-lock.json`: pin `vgpu` to `0.5.0`.

The original example remains a reference, not an extra route or redesigned card. Its graphite background, extra labels, triangle, and tilt are not used in the portfolio card.
