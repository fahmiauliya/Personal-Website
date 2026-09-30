// node recordscrub.mjs <file.riv> <timeline> <frames> <fps> <name> — a timeline scrubbed to each
// frame, saved as rec2-<name>.json. ONE tab, closed at the end.
import { writeFileSync } from 'node:fs';
const [file, timeline, n, fps, name] = process.argv.slice(2);
const tab = await (await fetch('http://127.0.0.1:9378/json/new?about:blank', { method: 'PUT' })).json();
const ws = new WebSocket(tab.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pending = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise(r => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); setTimeout(() => r({ timedOut: true }), 60000); });
const ev = async e => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true, timeout: 50000 }); if (r.timedOut || r.exceptionDetails) throw new Error(JSON.stringify(r).slice(0, 300)); return r.result.value; };
try {
  await send('Runtime.enable'); await send('Page.navigate', { url: 'http://127.0.0.1:8765/player.html?v=' + Date.now() });
  for (let i = 0; i < 50 && !(await ev('!!window.ready')); i++) await new Promise(r => setTimeout(r, 200));
  const info = await ev(`scrubLoad('${file}', '${timeline}')`);
  const frames = [];
  while (frames.length < +n) frames.push(...JSON.parse(await ev(`scrubDiffs(${frames.length}, ${Math.min(10, +n - frames.length)}, ${fps})`)));
  const images = await ev('playerImages()');
  writeFileSync(`rec2-${name}.json`, JSON.stringify({ info, frames, images }));
  console.log(name, frames.length, 'frames,', images.length, 'images', images.map(u => Math.round(u.length / 1024) + 'KB').join(' '));
} catch (e) { console.log('error', e.message); } finally { ws.close(); await fetch(`http://127.0.0.1:9378/json/close/${tab.id}`); process.exit(0); }
