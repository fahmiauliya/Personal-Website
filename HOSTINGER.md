# Deploy main directly to Hostinger

Use **Deploy Web App → Import Git Repository** to let Hostinger build this
React/Vite project directly from `main`. No additional branch or GitHub
Actions workflow is required.

## Build settings

| Setting | Value |
| --- | --- |
| Repository | `fahmiauliya/Personal-Website` |
| Branch | `main` |
| Framework | Vite (React) |
| Project root | Repository root (`.`) |
| Node.js | 22 (22.12 or newer) |
| Install command, if shown | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Environment variables | None required |

The existing `package.json`, `package-lock.json`, and `.nvmrc` provide the
build script, locked dependencies, and Node version. Keep generated `dist/`
and `node_modules/` out of Git; Hostinger generates the production files.
This static frontend does not need a custom server entry file.

## Connect and deploy

1. Push the latest local changes to `main`.
2. In hPanel, choose **Add Website → Deploy Web App → Import Git Repository**.
3. Authorize Hostinger to access the private repository and select it.
4. Confirm the build settings above, then deploy.
5. Connect the intended domain and verify HTTPS, the homepage, and its assets.
6. Enable automatic deployments from `main` for future updates.

This build-enabled flow is available on Hostinger Business and Cloud plans.
The standard **Advanced → Git** flow for custom PHP/HTML sites is a different
deployment setup: copying this repository to `public_html` does not produce
the Vite build. If your panel only offers that flow, confirm the available
hosting features before connecting `main` to the live web root.

## Verification

Run `npm run build` locally before pushing. After deployment, confirm the
Hostinger deployment reports the intended `main` commit, and check the page,
JavaScript, CSS, font, and favicon over HTTPS. Check the design on desktop
and mobile. A local build alone does not verify the live deployment.

References:
- https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/
- https://www.hostinger.com/support/1583302-how-to-deploy-a-git-repository-in-hostinger/
