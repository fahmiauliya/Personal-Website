import { copyFile, cp, mkdir, readFile, rm } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const html = await readFile(new URL('dist/index.html', root), 'utf8');
if (html.includes('.jsx') || html.includes('.tsx') || !html.includes('/assets/')) {
  throw new Error('Expected a production HTML file referencing bundled assets.');
}

// Publish assets before HTML. Retain older hashes for cached pages.
await cp(new URL('dist/assets/', root), new URL('assets/', root), { recursive: true });
for (const motion of ['motion-01', 'motion-02', 'motion-03', 'motion-05', 'motion-06']) {
  await rm(new URL(`${motion}/`, root), { recursive: true, force: true });
  await cp(new URL(`dist/${motion}/`, root), new URL(`${motion}/`, root), { recursive: true });
}
// public/motions/ is the shared Motion Lab motion bundle (npm run sync:motions);
// public/talentpluto/ holds the TalentPluto cover video and poster;
// public/fonts/ holds fonts shared by the Beam gallery motions (TikTok Sans).
for (const folder of ['motions/', 'talentpluto/', 'fonts/']) {
  await rm(new URL(folder, root), { recursive: true, force: true });
  await cp(new URL(`dist/${folder}`, root), new URL(folder, root), { recursive: true });
}
// The per-motion iframe exports the bundle replaced.
for (const legacy of ['bifrost/', 'beam/']) await rm(new URL(legacy, root), { recursive: true, force: true });
await copyFile(new URL('dist/favicon.svg', root), new URL('favicon.svg', root));
await copyFile(new URL('dist/index.html', root), new URL('index.html', root));
for (const route of ['about/', 'projects/beam/', 'projects/bifrost/']) {
  await mkdir(new URL(route, root), { recursive: true });
  await copyFile(new URL('dist/index.html', root), new URL(`${route}index.html`, root));
}
console.log('Production index.html, favicon.svg, and assets/ prepared for main.');
