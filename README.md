# Fahmi Auliya

A minimal under-construction page built with React and Vite.

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
- `src/components/PageShell.jsx`: semantic header, main, and footer.
- `src/styles/tokens.css`: centralized colors, typography, spacing, radius, and motion.
- `src/styles/global.css`: fluid layout, typography, entrance sequence, and reduced-motion support.
- `src/assets/`: self-hosted Inter Regular Latin WOFF2 and its license.
- `public/favicon.svg`: lightweight initial favicon.

The layout uses three grid rows and dynamic viewport height. Content grows naturally on short screens. There are no interactive controls; focus-visible styling is available for future controls.

## Verification

- Production build passes.
- Chrome checks pass at 320×568, 375×812, 390×844, 768×1024, 1024×768, 1366×768, 1440×900, 1920×1080, and 2560×1440.
- Additional landscape/short-screen checks: 812×375, 568×320, and 320×240.
- No horizontal overflow or region overlap; wordmark remains centered.
- Long replacement text, reduced motion, completed entrance animation, and keyboard traversal checked.
- No browser console warnings or runtime errors in the final browser pass.
- Desktop and mobile screenshots visually reviewed.
- 200% enlargement checked using CSS zoom. Native browser-menu zoom has not been verified.
- Safe-area spacing checked using simulated inset values; physical notched-device behavior has not been verified.

Inter is self-hosted, preloaded, and limited to one regular Latin font file. No third-party requests are needed to render the page.
