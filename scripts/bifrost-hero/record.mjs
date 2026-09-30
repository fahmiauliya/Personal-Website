// node record.mjs — records everything heroanim.py needs from Hero-bg-home.riv, in ONE tab that is
// closed at the end. Setup, in a scratch folder: copy lab.html here, rive.js and rive.wasm from
// @rive-app/canvas (no longer a site dependency: install it with --no-save in a scratch copy) and Hero-bg-home.riv from Motion Lab's public/rive; serve it
// (python3 -m http.server 8765 --bind 127.0.0.1); run one headless Chrome
// (--headless=new --remote-debugging-port=9378); then run this, then `python3 heroanim.py`, and
// copy hero2/static.svg and hero2/animated.svg to src/works/selected-projects/bifrost/hero-background.
import { writeFileSync } from 'node:fs';
const tab = await (await fetch('http://127.0.0.1:9378/json/new?about:blank', { method: 'PUT' })).json();
const ws = new WebSocket(tab.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pending = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise(r => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });
const ev = async e => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 600)); return r.result.value; };
const chunked = async (first, next, total, chunk) => { const out = JSON.parse(await ev(first)); while (out.length < total) out.push(...JSON.parse(await ev(next(Math.min(chunk, total - out.length))))); return out; };
try {
  await send('Runtime.enable'); await send('Page.navigate', { url: 'http://127.0.0.1:8765/lab.html?v=' + Date.now() });
  for (let i = 0; i < 50 && !(await ev('!!window.ready')); i++) await new Promise(r => setTimeout(r, 200));
  const src = 'Hero-bg-home.riv';
  // main timeline frames 16–46 (its work area), nested artboards at their start
  await ev(`timelineLoad('${src}')`); const tl = [];
  for (let f = 16; f <= 46; f++) tl.push(JSON.parse(await ev(`timelineFrame(${f} / 30)`))[0]);
  writeFileSync('hero-frames.json', JSON.stringify({ frames: tl })); console.log('timeline', tl.length, 'frames,', tl[0].length, 'ops');
  // the main artboard at time 0, as played
  await ev(`playLoad('${src}')`); writeFileSync('rec-main0.json', await ev('playFrames(1, 0)')); console.log('main at 0 recorded');
  // each nested artboard alone over its loop, 60fps (frame 0 = time 0)
  for (const [name, play, n, chunk] of [['Corong', { 'Loop 1': 1, 'Loop 2': 1, 'Loop 3': 1 }, 901, 60], ['Number', { 'Timeline 1': 1 }, 29, 29], ['Binary', { 'Timeline 1': 1 }, 42, 4]]) {
    await ev(`nestedLoad('${src}', '${name}', ${JSON.stringify(play)})`);
    const frames = await chunked('nestedFrames(1, 0)', k => `nestedFrames(${k}, 1 / 60)`, n, chunk);
    writeFileSync(`rec-${name.toLowerCase()}.json`, JSON.stringify(frames)); console.log(name, frames.length, 'frames,', frames[0].length, 'ops');
  }
} finally {
  ws.close(); await fetch(`http://127.0.0.1:9378/json/close/${tab.id}`); process.exit(0);
}
