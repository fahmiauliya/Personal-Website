# Fahmi Auliya — Portfolio 2026

A responsive personal portfolio implemented in React, Vite, and TypeScript from the Portfolio 2026 Figma design.

## Run locally

Use Node.js 22.12 or newer (Node 22 is specified in `.nvmrc`).

```sh
npm ci
npm run dev -- --port 5173
```

Then open the local URL printed by Vite.

## Commands

```sh
npm run typecheck
npm run build
npm run preview
```

## Source structure

- `src/App.tsx`: page composition and foreground layering.
- `src/components/Intro.tsx`: identity, biography, contact actions, and the lower page layer.
- `src/components/Header.tsx`: compact primary navigation.
- `src/components/Works.tsx`: staggered eight-project layout.
- `src/components/ContactFooter.tsx`: contact panel and footer in the Works layer.
- `src/components/SocialLinks.tsx`: shared social navigation.
- `src/pages/About/`: the standalone About page available at `/about/`.
- `src/pages/Beam/`: the Beam case study. Its gallery frames 01, 02, 03, 05, and 06 embed those Motion Lab scenes from the sibling `Motion Lab` project. Run `npm run sync:motion-01`, `npm run sync:motion-02`, `npm run sync:motion-03`, `npm run sync:motion-05`, or `npm run sync:motion-06` after changing a motion to refresh its checked-in standalone export in the matching `public/motion-XX/` folder.
- `src/data/portfolio.ts`: editable project, contact, and social data.
- `src/styles/tokens.css`: design constants taken from Figma.
- `src/styles/global.css`: layout, component styling, layering, and responsive rules.
- `src/assets/icons/`: exact SVG exports from Figma.

The intro is a sticky lower layer. The Works section and footer share an opaque foreground layer that scrolls above it. At the 1440px Figma reference width, the project grid follows the supplied four-column stagger. It collapses to two columns and then one column on narrower viewports while keeping the same content hierarchy.

Geist Regular is self-hosted with its SIL Open Font License. The site has no runtime third-party requests.

## Publishing

For GitHub-connected Hostinger deployment, see [HOSTINGER.md](HOSTINGER.md). `npm run build` creates `dist/` and refreshes the production entry, `/about/` entry, and hashed assets committed at the repository root. Do not edit those generated files directly.
