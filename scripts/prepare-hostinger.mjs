import { copyFile, cp, readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const html = await readFile(new URL('dist/index.html', root), 'utf8');
if (html.includes('.jsx') || !html.includes('/assets/')) {
  throw new Error('Expected a production HTML file referencing bundled assets.');
}

// Publish assets before HTML. Retain older hashes for cached pages.
await cp(new URL('dist/assets/', root), new URL('assets/', root), { recursive: true });
await copyFile(new URL('dist/favicon.svg', root), new URL('favicon.svg', root));
await copyFile(new URL('dist/index.html', root), new URL('index.html', root));
console.log('Production index.html, favicon.svg, and assets/ prepared for main.');
