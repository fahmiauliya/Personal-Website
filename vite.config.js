import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// Dev server only: "Save to local" in the footer glass's parameter panel
// (src/components/FooterGlassDials.tsx) posts its values here, and they are written to
// src/components/footerGlass.settings.json, which the site reads. Same shape as Motion
// Lab's settings files: groups of numbers, or colours as #rrggbb.
function footerGlassSettingsPlugin() {
  return {
    name: 'footer-glass-local-settings',
    // A save must not reload the page: the panel already applies the values live, and a
    // reload would drop its scroll position. The file is read fresh on the next load.
    handleHotUpdate({ file }) {
      if (file.endsWith('footerGlass.settings.json')) return [];
    },
    configureServer(server) {
      server.middlewares.use('/__site/footer-glass/settings', async (req, res) => {
        if (req.method !== 'POST') { res.writeHead(404).end(); return; }
        if (req.headers.origin !== `http://${req.headers.host}` || req.headers['content-type'] !== 'application/json') {
          res.writeHead(403).end();
          return;
        }
        try {
          let body = '';
          for await (const chunk of req) {
            body += chunk.toString();
            if (body.length > 65_536) throw new Error('Settings are too large.');
          }
          const finite = (value) => typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= 1e6;
          const values = {};
          for (const [group, controls] of Object.entries(JSON.parse(body).values ?? {})) {
            if (group.length > 40 || !controls || typeof controls !== 'object') throw new Error('Invalid dial group.');
            values[group] = {};
            for (const [name, value] of Object.entries(controls)) {
              const colour = typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
              if (name.length > 40 || (!colour && !finite(value))) throw new Error('Invalid dial value.');
              values[group][name] = value;
            }
          }
          const target = fileURLToPath(new URL('src/components/footerGlass.settings.json', import.meta.url));
          await writeFile(target, `${JSON.stringify({ values }, null, 2)}\n`);
          res.writeHead(200, { 'Content-Type': 'application/json' }).end('{"ok":true}');
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: error instanceof Error ? error.message : 'Could not save settings.' }));
        }
      });
    },
  };
}

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  plugins: [footerGlassSettingsPlugin()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
