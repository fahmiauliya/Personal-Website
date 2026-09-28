import { execFileSync } from 'node:child_process';
import { copyFile, cp, mkdir, readdir, readFile, rm } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const html = await readFile(new URL('dist/index.html', root), 'utf8');
if (html.includes('.jsx') || html.includes('.tsx') || !html.includes('/assets/')) {
  throw new Error('Expected a production HTML file referencing bundled assets.');
}

// Publish assets before HTML. Hashed files from the last committed build (what is live)
// are kept, so a visitor still on the previous page can load its chunks; anything older
// is removed, so assets/ holds at most two builds instead of growing with every deploy.
const git = (...args) => execFileSync('git', args, { cwd: new URL('.', root), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
function liveAssets() {
  try {
    const keep = new Set();
    const queue = [git('show', 'HEAD:index.html')];
    while (queue.length) {
      for (const [, name] of queue.pop().matchAll(/\/?assets\/([\w.-]+\.\w+)/g)) {
        if (keep.has(name)) continue;
        keep.add(name);
        // Chunks name other chunks and files; follow them (text files only).
        if (/\.(js|css)$/.test(name)) { try { queue.push(git('show', `HEAD:assets/${name}`)); } catch { /* not committed */ } }
      }
    }
    return keep;
  } catch {
    return null; // No git history to read: keep everything rather than guess.
  }
}
const keep = liveAssets();
await cp(new URL('dist/assets/', root), new URL('assets/', root), { recursive: true });
if (keep) {
  for (const name of await readdir(new URL('dist/assets/', root))) keep.add(name);
  for (const name of await readdir(new URL('assets/', root))) {
    if (!keep.has(name)) await rm(new URL(`assets/${name}`, root));
  }
}
for (const motion of ['motion-01', 'motion-02', 'motion-03', 'motion-05', 'motion-06']) {
  await rm(new URL(`${motion}/`, root), { recursive: true, force: true });
  await cp(new URL(`dist/${motion}/`, root), new URL(`${motion}/`, root), { recursive: true });
}
// public/motions/ is the shared Motion Lab motion bundle (npm run sync:motions);
// public/talentpluto/ holds the TalentPluto cover video and poster;
// public/fonts/ holds fonts shared by the Beam gallery motions (TikTok Sans).
for (const folder of ['motions/', 'talentpluto/', 'fonts/', 'rive/']) {
  await rm(new URL(folder, root), { recursive: true, force: true });
  await cp(new URL(`dist/${folder}`, root), new URL(folder, root), { recursive: true });
}
// The per-motion iframe exports the bundle replaced.
for (const legacy of ['bifrost/', 'beam/']) await rm(new URL(legacy, root), { recursive: true, force: true });
await copyFile(new URL('dist/favicon.svg', root), new URL('favicon.svg', root));
await copyFile(new URL('dist/index.html', root), new URL('index.html', root));
// Every route needs its own entry page on a static host, or a direct link (or a reload)
// there is a 404. Recent Work routes come from its data file, so a new project is covered.
const recentData = await readFile(new URL('src/works/recent-work/recentWorkData.ts', root), 'utf8');
const recentSlugs = [...recentData.matchAll(/^\s*slug: '([\w-]+)',$/gm)].map(match => match[1]);
if (!recentSlugs.length) throw new Error('No Recent Work slugs found in recentWorkData.ts.');
// Recent Work routes are regenerated from scratch, so a removed project leaves nothing behind.
await rm(new URL('projects/recent/', root), { recursive: true, force: true });
const routes = ['about/', 'projects/beam/', 'projects/bifrost/', ...recentSlugs.map(slug => `projects/recent/${slug}/`)];
for (const route of routes) {
  await mkdir(new URL(route, root), { recursive: true });
  await copyFile(new URL('dist/index.html', root), new URL(`${route}index.html`, root));
}
console.log(`Production pages (${routes.length + 1} routes), favicon.svg, and assets/ prepared for main.`);
