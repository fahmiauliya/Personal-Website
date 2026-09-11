# Fahmi Auliya

A minimal under-construction page built with React and Vite, featuring the saved Sequential Ring image animation.

## Run locally

Use Node.js 22.12 or newer (Node 22 is specified in `.nvmrc`).

```sh
npm ci
npm run dev -- --port 5173
```

Open http://127.0.0.1:5173/.

```sh
npm run build
npm run preview
```

## Organization

For GitHub-connected hosting, see [Hostinger deployment setup](HOSTINGER.md).

- `src/App.jsx`: announcement content.
- `src/index.html`: editable HTML entry for development and builds.
- `index.html`, `assets/`, `favicon.svg`: generated production files committed on `main` for Hostinger. Run `npm run build` before committing site changes; do not edit these files directly.
- `src/components/PageShell.jsx`: semantic main and footer.
- `src/components/HeroAnimation.jsx`: automatically playing website animation.
- `src/components/sequential-ring/`: self-contained production copy of the selected Motion Lab component, its renderer, styles, and saved preset. See its [integration notes](src/components/sequential-ring/README.md).
- `src/styles/tokens.css`: centralized colors, typography, spacing, radius, and motion.
- `src/styles/global.css`: fluid layout, typography, entrance sequence, and reduced-motion support.
- `src/assets/`: self-hosted Inter Regular Latin WOFF2, its license, and the material study image atlas.
- `public/favicon.svg`: lightweight initial favicon.

The layout uses two grid rows and a fixed dynamic viewport height. Page scrolling, overscroll, and text dragging are disabled. The animation scales to the available height on short screens so the announcement and footer remain visible. The image collection plays its entrance automatically, then floats continuously. Visitors can drag in both axes. Sequential Ring has no hover response. Reduced-motion preferences show the completed formation.

The animation loads in a separate JavaScript chunk while the announcement renders immediately. The reserved visual area keeps the layout stable during loading. The website does not mount the Motion Lab editor or read its browser-saved tuning; it uses `src/components/sequential-ring/preset.json`. Both `motion lab/` and `animation-demo/` remain separate development projects.

## Verification

- Production build passes.
- Production Chrome checks at 320×568, 390×844, 768×1024, 1366×768, 1440×900, and 812×375.
- No page scrolling or overlap between animation, announcement, and footer; wheel, keyboard, and outside touch gestures keep the page still. Mouse and touch dragging remain active inside the animation.
- Saved image count and rounding, full entrance, continuous floating, and drag capture checked.
- Reduced motion checked both on a fresh visit and when the preference changes during playback.
- No tuning editor appears on the website; no runtime errors or failed asset requests in the browser check.
- Desktop and mobile screenshots visually reviewed.

Inter is self-hosted, preloaded, and limited to one regular Latin font file. No third-party requests are needed to render the page.
