import { spawnSync } from 'node:child_process';
import { access, cp, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const entries = { '01': 'beam-problem-solution.html', '02': 'beam-secrets.html', '03': 'beam-hero.html', '05': 'beam-footer.html', '06': 'beam-on-demand.html' };
const number = process.argv[2];
const entry = entries[number];
if (!entry) throw new Error('Choose Motion 01, 02, 03, 05, or 06.');

const website = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const motionLab = resolve(website, '..', 'Motion Lab');
const output = resolve(website, `public/motion-${number}`);
const temporary = await mkdtemp(join(tmpdir(), `motion-${number}-export-`));

try {
  await access(join(motionLab, entry));
  const config = join(temporary, 'vite.config.mjs');
  const exportDir = join(temporary, 'export');
  // Website overrides: Motion Lab files swapped for lighter website versions at export time,
  // loaded in place of the original (so their relative imports still resolve beside it).
  // Motion Lab keeps its own files. Motion 03's PDF preview draws the demo PDF's first page
  // in code instead of loading the 1.7 MB pdf.js reader (scripts/motion-export/overrides/).
  const overrides = number === '03' ? {
    [join(motionLab, 'src/motion-lab/beam-content/motion-03/product-demo/PdfPreview.tsx')]: {
      source: join(website, 'scripts/motion-export/overrides/PdfPreview.tsx'),
      assets: {},
    },
  } : {};
  await writeFile(config, `import { readFile } from 'node:fs/promises';
const overrides = ${JSON.stringify(overrides)};
export default {
  root: ${JSON.stringify(motionLab)},
  base: './',
  publicDir: false,
  plugins: [{
    name: 'website-overrides',
    enforce: 'pre',
    async load(id) {
      const override = overrides[id.split('?')[0]];
      if (!override) return null;
      let code = await readFile(override.source, 'utf8');
      for (const [from, to] of Object.entries(override.assets)) code = code.replaceAll(JSON.stringify(from).slice(1, -1), to);
      return code;
    },
  }],
  build: {
    outDir: ${JSON.stringify(exportDir)},
    emptyOutDir: true,
    rollupOptions: { input: ${JSON.stringify(join(motionLab, entry))} },
  },
};
`);

  const build = spawnSync(join(motionLab, 'node_modules/.bin/vite'), ['build', '--config', config], {
    cwd: motionLab,
    stdio: 'inherit',
  });
  if (build.status !== 0) throw new Error(`Motion ${number} export failed.`);

  await rm(output, { recursive: true, force: true });
  await cp(exportDir, output, { recursive: true });
  await cp(join(website, 'src/assets/fonts/geist-regular.woff2'), join(output, 'assets/geist-regular.woff2'));
  if (number === '03') {
    await cp(join(motionLab, 'public/assets/hero'), join(output, 'assets/hero'), { recursive: true });
  }

  for (const file of await readdir(join(output, 'assets'))) {
    if (!file.endsWith('.css')) continue;
    const path = join(output, 'assets', file);
    const css = await readFile(path, 'utf8');
    await writeFile(path, css
      .replace(
        'https://cdn.jsdelivr.net/npm/geist@1.3.0/dist/fonts/geist-mono/GeistMono-variable.woff2',
        './geist-regular.woff2',
      )
      // Every Beam motion shares one copy of TikTok Sans (public/fonts: the lab's variable
      // TTF as WOFF2, same glyphs and axes), so the browser downloads it once.
      .replaceAll('url(/TikTok_Sans/TikTokSans-VariableFont_opsz,slnt,wdth,wght.ttf) format("truetype")', 'url(/fonts/tiktok-sans-variable.woff2) format("woff2")'));
  }
  if (number === '03') {
    for (const file of await readdir(join(output, 'assets'))) {
      if (!file.endsWith('.js')) continue;
      const path = join(output, 'assets', file);
      const script = await readFile(path, 'utf8');
      await writeFile(path, script.replaceAll('/assets/hero/', './assets/hero/'));
    }
  }
  console.log(`Motion ${number} synced from the Motion Lab source.`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
