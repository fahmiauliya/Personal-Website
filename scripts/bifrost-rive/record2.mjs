// node record2.mjs <frames> <file.riv>... — plays each file as the site does and saves every frame's
// draw calls at 60fps to rec2-<name>.json. ONE tab, closed at the end.
import { writeFileSync } from 'node:fs';
const [n, ...files] = process.argv.slice(2);
const tab = await (await fetch('http://127.0.0.1:9378/json/new?about:blank', { method: 'PUT' })).json();
const closeTab = () => fetch(`http://127.0.0.1:9378/json/close/${tab.id}`).catch(() => {});
process.on('beforeExit', closeTab);
const ws = new WebSocket(tab.webSocketDebuggerUrl);
ws.onclose = () => closeTab(); await new Promise(r => ws.onopen = r);
let id = 0; const pending = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise(r => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });
const ev = async e => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 400)); return r.result.value; };
try {
  await send('Runtime.enable');
  const ev2 = ev; // chunks stay small (a few MB) so each reply fits
  for (const f of files) {
    await send('Page.navigate', { url: 'http://127.0.0.1:8765/player.html?v=' + Date.now() });
    for (let i = 0; i < 50 && !(await ev('!!window.ready')); i++) await new Promise(r => setTimeout(r, 200));
    const info = await ev(`(async () => { const p = playerLoad('${f}'); for (let i = 0; i < 200 && !window.__r; i++) { step(16); await new Promise(r => setTimeout(r, 20)); } return await p; })()`);
    const frames = []; while (frames.length < +n) { const t0 = Date.now(); frames.push(...JSON.parse(await ev(`playerDiffs(${Math.min(10, +n - frames.length)})`))); if (process.env.VERBOSE) console.log(" ", frames.length, Date.now() - t0, "ms"); }
    const images = await ev('playerImages()');
    writeFileSync(`rec2-${f.replace('.riv', '')}.json`, JSON.stringify({ info, frames, images }));
    console.log(f, frames.length, 'frames');
  }
} catch (e) { console.log('error', e.message); } finally { ws.close(); await fetch(`http://127.0.0.1:9378/json/close/${tab.id}`); process.exit(0); }
