# Hostinger: deploy main to public_html

The repository root contains production-ready `index.html`, `favicon.svg`,
and `assets/`. These generated files are committed alongside the source on
`main`, so standard Hostinger Git deployment works without building on the server.

## Hostinger settings

- Repository: `fahmiauliya/Personal-Website`
- Branch: `main`
- Destination: `public_html`
- Deployment flow: website Dashboard → Advanced → Git

Redeploy the latest commit after pushing. The live HTML must load
`/assets/index-*.js`, not `/src/main.jsx`. If old HTML persists after a
successful deployment, clear the Hostinger website cache and refresh.

## Editing and publishing

1. Edit `src/` or `public/`. The editable HTML entry is `src/index.html`.
2. Run `npm ci` when installing dependencies, then `npm run build`.
3. Commit both source changes and the generated root `index.html`,
   `favicon.svg`, and `assets/` files, then push to `main`.
4. Wait for Hostinger auto-deployment or click Redeploy.

`npm run build` generates `dist/` and copies the production page and assets
into the repository root. Older hashed assets are retained for cached pages.
Do not edit generated files manually. `dist/` and `node_modules/` stay ignored.
`npm run dev` uses the source entry, so localhost editing still works.

## Verification

Check the live homepage, bundled JavaScript, CSS, font, and favicon for HTTP
200 responses and correct content types. Verify the visible page on desktop
and mobile. Local build success alone does not confirm Hostinger deployment.

Reference: https://www.hostinger.com/support/1583302-how-to-deploy-a-git-repository-in-hostinger/
