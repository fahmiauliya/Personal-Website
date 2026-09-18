import { spawnSync } from 'node:child_process';
import { access, cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
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
  await writeFile(config, `export default ${JSON.stringify({
    root: motionLab,
    base: './',
    publicDir: false,
    build: {
      outDir: exportDir,
      emptyOutDir: true,
      rollupOptions: { input: join(motionLab, entry) },
    },
  })};\n`);

  const build = spawnSync(join(motionLab, 'node_modules/.bin/vite'), ['build', '--config', config], {
    cwd: motionLab,
    stdio: 'inherit',
  });
  if (build.status !== 0) throw new Error(`Motion ${number} export failed.`);

  await rm(output, { recursive: true, force: true });
  await cp(exportDir, output, { recursive: true });
  await mkdir(join(output, 'TikTok_Sans'), { recursive: true });
  await cp(
    join(motionLab, 'public/TikTok_Sans/TikTokSans-VariableFont_opsz,slnt,wdth,wght.ttf'),
    join(output, 'TikTok_Sans/TikTokSans-VariableFont_opsz,slnt,wdth,wght.ttf'),
  );
  await cp(join(website, 'src/assets/geist-regular.woff2'), join(output, 'assets/geist-regular.woff2'));
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
      .replaceAll('url(/TikTok_Sans/', 'url(../TikTok_Sans/'));
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
