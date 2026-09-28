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

```
src/
├── main.tsx, App.tsx, index.html   entry and page routing
├── data/portfolio.ts               projects, contact email and social links
├── styles/                         tokens.css (design constants) and global.css
├── assets/                         shared assets: the Geist font and icons/
├── components/                     building blocks shared by every page
│   ├── navigation/                 header, navigation morph, blur, scroll-rolling logo
│   ├── contact/                    footer (glass, pill), social links, Copy Email
│   ├── motion/                     Motion Lab previews, scene fitting, near-view loading
│   └── transition/                 loader, page puzzle, project open/close, first load
├── pages/
│   ├── home/                       intro and the Works grid
│   └── about/                      the About page (/about/)
└── works/
    ├── selected-projects/          one folder per project: beam/ and bifrost/ (pages),
    │                               lasting-learn/, talentpluto/, avea/, almanac-market/,
    │                               eden-ai/, tika-security/ (card covers)
    └── recent-work/                the Recent Work page and one folder per project
```

- Beam's gallery frames 01, 02, 03, 05 and 06 embed Motion Lab scenes. After changing one in the sibling `Motion Lab` project, run `npm run sync:motion-XX` to refresh its export in `public/motion-XX/`; `npm run sync:motions` refreshes the shared bundle in `public/motions/`.
- The footer glass has a tuning panel on the dev server only (`npm run dev`); its save button writes `src/components/contact/footerGlass.settings.json`.

The intro is a sticky lower layer. The Works section and footer share an opaque foreground layer that scrolls above it. At the 1440px Figma reference width, the project grid follows the supplied four-column stagger. It collapses to two columns and then one column on narrower viewports while keeping the same content hierarchy.

Geist Regular is self-hosted with its SIL Open Font License. The site has no runtime third-party requests.

## Publishing

For GitHub-connected Hostinger deployment, see [HOSTINGER.md](HOSTINGER.md). `npm run build` creates `dist/` and refreshes the production entry pages (home, `/about/` and every project route) and the hashed assets committed at the repository root. Do not edit those generated files directly.
