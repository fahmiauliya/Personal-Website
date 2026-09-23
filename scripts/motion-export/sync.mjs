import { access, cp, mkdir, mkdtemp, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Usage: npm run sync:bifrost -- 01   (01–13, or cover)
//        npm run sync:beam -- cover
// Builds one Motion Lab frame (src/motion-lab/<project>-content/motion-<slug>) into a
// standalone page at public/<project>/motion-<slug>/ from the page in ./entry. The
// website's iframe sets its display size. Numbered frames are matched in frames.ts by
// `number`, unnumbered ones such as the cover by `slug`.
const projects = {
  bifrost: { content: 'bifrost-content' },
  beam: { content: 'beam-content' },
};
const [project, number] = process.argv.slice(2);
if (!projects[project]) throw new Error(`Choose a project: ${Object.keys(projects).join(', ')}.`);
if (!/^(\d{2}|[a-z]+)$/.test(number ?? '')) throw new Error(`Choose a frame, e.g. npm run sync:${project} -- cover`);
const frameMarker = /^\d+$/.test(number) ? `{ number: ${Number(number)},` : `slug: '${number}'`;

const here = dirname(fileURLToPath(import.meta.url));
const entry = join(here, 'entry');
const website = resolve(here, '../..');
const motionLab = resolve(website, '..', 'Motion Lab');
const content = join(motionLab, 'src/motion-lab', projects[project].content);
const source = join(content, `motion-${number}/motion-${number}.tsx`);
const output = join(website, `public/${project}/motion-${number}`);
const modules = join(motionLab, 'node_modules');
// The page's Geist font; both projects use the one in Bifrost's content folder.
const geistFont = join(motionLab, 'src/motion-lab/bifrost-content/fonts/geist-latin-400.woff2');

// Reads one frame's entry from frames.ts. Each entry is a one-line object literal,
// so a few patterns are enough; fail loudly if its shape changes.
async function readFrame() {
  const frames = await readFile(join(content, 'frames.ts'), 'utf8');
  const line = frames.split('\n').find(frame => frame.includes(frameMarker));
  if (!line) throw new Error(`${project} motion ${number} is missing from frames.ts.`);
  const size = /width: ([\d.]+), height: ([\d.]+)/.exec(line);
  const background = /background: '([^']+)'/.exec(line);
  const box = /content: \{ x: ([\d.]+), y: ([\d.]+), width: ([\d.]+), height: ([\d.]+) \}/.exec(line);
  if (!size || !background || !box) throw new Error(`Could not read ${project} motion ${number} from frames.ts.`);
  const imageName = /image: (\w+)/.exec(line)?.[1];
  const imagePath = imageName && new RegExp(`import ${imageName} from '(\\./[^']+)'`).exec(frames)?.[1];
  if (imageName && !imagePath) throw new Error(`Could not find the ${imageName} import in frames.ts.`);
  const [x, y, width, height] = box.slice(1).map(Number);
  return {
    width: Number(size[1]),
    height: Number(size[2]),
    background: background[1],
    image: imagePath ? join(content, imagePath) : undefined,
    content: { x, y, width, height },
    steps: Number(/\bsteps: (\d+)/.exec(line)?.[1]) || undefined,
  };
}

// Playback settings as BifrostWorkspace reads them (defaults + settings.json).
async function readSettings() {
  const defaults = { playbackRate: 1, holdSeconds: 2, slideSeconds: 1.2 };
  try {
    return { ...defaults, ...JSON.parse(await readFile(join(content, `motion-${number}/settings.json`), 'utf8')) };
  } catch (error) {
    if (error.code === 'ENOENT') return defaults;
    throw error;
  }
}

// realpath: macOS tmpdir is a symlink, which breaks Vite's HTML output path.
const exportDir = await realpath(await mkdtemp(join(tmpdir(), `${project}-motion-${number}-`)));

try {
  await access(source);
  const usesRive = (await readFile(source, 'utf8')).includes('@rive-app/');
  const frame = await readFrame();
  const settings = await readSettings();

  // Build with Motion Lab's own Vite and React so the motion runs on the versions it was made with.
  const { build } = await import(pathToFileURL(join(modules, 'vite/dist/node/index.js')).href);
  await build({
    configFile: false,
    root: entry,
    base: './',
    publicDir: false,
    logLevel: 'warn',
    define: {
      __MOTION_FRAME__: JSON.stringify({ ...frame, image: undefined }),
      __MOTION_SETTINGS__: JSON.stringify(settings),
    },
    resolve: {
      alias: {
        '@motion/motion': source,
        '@motion/frame-image': frame.image ?? join(entry, 'empty.js'),
        '@motion/rive-runtime': usesRive ? join(entry, 'rive-runtime.js') : join(entry, 'empty.js'),
        '@motion/geist': geistFont,
        react: join(modules, 'react'),
        'react-dom': join(modules, 'react-dom'),
        '@rive-app/react-canvas': join(modules, '@rive-app/react-canvas'),
      },
    },
    build: { outDir: exportDir, emptyOutDir: true },
  });

  // Motion Lab serves /rive and /fonts from its public folder. Copy what the bundle
  // references and make those paths relative so they resolve inside this folder.
  const publicReference = /(["'(])\/((?:rive|fonts)\/[\w.@-]+)/g;
  const copied = new Set();
  for (const file of await readdir(join(exportDir, 'assets'))) {
    if (!/\.(js|css)$/.test(file)) continue;
    const path = join(exportDir, 'assets', file);
    const code = await readFile(path, 'utf8');
    for (const [, , asset] of code.matchAll(publicReference)) copied.add(asset);
    // JS paths resolve against the page; CSS paths against assets/.
    await writeFile(path, code.replace(publicReference, file.endsWith('.css') ? '$1../$2' : '$1./$2'));
  }
  for (const asset of copied) {
    await mkdir(dirname(join(exportDir, asset)), { recursive: true });
    await cp(join(motionLab, 'public', asset), join(exportDir, asset));
  }

  // One Rive runtime per project folder, so the browser downloads and caches it once.
  // Replaced on each sync so it always matches the bundled @rive-app version.
  if (usesRive) {
    await mkdir(join(output, '../runtime'), { recursive: true });
    await cp(join(modules, '@rive-app/canvas/rive.wasm'), join(output, '../runtime/rive.wasm'));
  }

  await rm(output, { recursive: true, force: true });
  await cp(exportDir, output, { recursive: true });
  console.log(`${project} motion ${number} synced to public/${project}/motion-${number}/ (${[...copied].join(', ') || 'no public assets'}${frame.steps ? `, ${frame.steps}-step timeline` : ''}).`);
  console.log(`Scene: { src: '/${project}/motion-${number}/index.html', width: ${frame.width}, height: ${frame.height}, title: '…' }`);
} finally {
  await rm(exportDir, { recursive: true, force: true });
}
