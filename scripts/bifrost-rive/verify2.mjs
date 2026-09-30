// node verify2.mjs <name> <frame>... — recorded frame vs SVG, screenshots; ONE tab, closed at the end.
import { writeFileSync } from 'node:fs';
const [name, ...frames] = process.argv.slice(2);
const tab = await (await fetch('http://127.0.0.1:9378/json/new?about:blank', { method: 'PUT' })).json();
const closeTab = () => fetch(`http://127.0.0.1:9378/json/close/${tab.id}`).catch(() => {});
const ws = new WebSocket(tab.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pending = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise(r => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); setTimeout(() => r({ timedOut: true }), 60000); });
const ev = async e => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true, timeout: 50000 }); if (r.timedOut || r.exceptionDetails) throw new Error(JSON.stringify(r).slice(0, 300)); return r.result.value; };
try {
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1300, height: 1900, deviceScaleFactor: 2, mobile: false });
  for (const k of frames) {
    await send('Page.navigate', { url: 'http://127.0.0.1:8765/replay.html?v=' + Date.now() });
    for (let i = 0; i < 50 && !(await ev('!!window.ready')); i++) await new Promise(r => setTimeout(r, 200));
    await ev(`window.__offset = ${process.env.OFFSET || 0}`); const [w, h] = await ev(`show('${name}', ${k})`);
    for (const [tag, y] of [['rive', 0], ['svg', h + 20]]) {
      const { data } = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y, width: w, height: h, scale: 1 } });
      writeFileSync(`shots/r-${name}-${k}-${tag}.png`, Buffer.from(data, 'base64'));
    }
  }
} catch (e) { console.log('error', e.message); } finally { ws.close(); await closeTab(); process.exit(0); }
