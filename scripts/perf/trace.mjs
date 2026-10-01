// node trace.mjs <baseUrl> <selector to centre | top> [page] — where the main thread's time goes
// with the page at rest: a 3s trace, summed by event name (ms per second). INJECT=file.js runs
// that script in the page first. RATE (CPU slowdown, default 4) and MOBILE=1 as in bench.mjs.
// One tab, closed; trace.sh starts and stops the server and the one headless Chrome.
import { readFileSync } from 'node:fs';
const [base, where, pageArg] = process.argv.slice(2);
const page = pageArg || 'projects/bifrost/';
const wait = ms => new Promise(r => setTimeout(r, ms));
const tab = await (await fetch('http://127.0.0.1:9378/json/new?about:blank', { method: 'PUT' })).json();
const ws = new WebSocket(tab.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pending = new Map(); const events = []; let done;
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } if (m.method === 'Tracing.dataCollected') events.push(...m.params.value); if (m.method === 'Tracing.tracingComplete') done(); };
const send = (method, params = {}) => new Promise((res, rej) => { const k = ++id; pending.set(k, m => m.error ? rej(new Error(method + ': ' + m.error.message)) : res(m.result)); ws.send(JSON.stringify({ id: k, method, params })); });
const ev = async e => (await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result?.value;
try {
  await send('Page.enable');
  const mobile = process.env.MOBILE === '1';
  await send('Emulation.setDeviceMetricsOverride', mobile ? { width: 390, height: 844, deviceScaleFactor: 3, mobile: true } : { width: 1440, height: 900, deviceScaleFactor: 2, mobile: false });
  if (mobile) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await send('Emulation.setCPUThrottlingRate', { rate: Number(process.env.RATE || 4) });
  await send('Page.navigate', { url: base + page });
  let last = -1, stable = 0; const t0 = Date.now();
  while (Date.now() - t0 < 40000) { await wait(500); const n = await ev(`document.querySelectorAll('*').length`).catch(() => -1); stable = n === last ? stable + 500 : 0; last = n; if (stable >= 3000 && Date.now() - t0 >= 8000) break; }
  if (where !== 'top') await ev(`(()=>{const f=document.querySelector('${where}');const s=document.querySelector('.project-layer')||document.scrollingElement;const r=f.getBoundingClientRect();s.scrollTop+=r.top+r.height/2-innerHeight/2})()`);
  await wait(2500);
  if (process.env.INJECT) { await ev(readFileSync(process.env.INJECT, 'utf8')); await wait(2500); }
  const finished = new Promise(r => done = r);
  await send('Tracing.start', { transferMode: 'ReportEvents', traceConfig: { includedCategories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink', 'cc', 'viz', 'gpu', 'toplevel'] } });
  await wait(3000);
  await send('Tracing.end'); await finished;
  const names = new Map(); for (const e of events) if (e.ph === 'M' && e.name === 'thread_name') names.set(e.pid + ':' + e.tid, e.args.name);
  const perThread = new Map(), perName = new Map();
  for (const e of events) {
    if (e.ph !== 'X' || !e.dur) continue;
    const thread = names.get(e.pid + ':' + e.tid) || '?';
    if (e.name === 'RunTask' || e.name === 'ThreadPool_RunTask') perThread.set(thread, (perThread.get(thread) || 0) + e.dur / 1000);
    else if (thread === 'CrRendererMain' && !/RunTask|OnHandleReady/.test(e.name)) perName.set(e.name, (perName.get(e.name) || 0) + e.dur / 1000);
  }
  const fmt = (m, n) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${k} ${Math.round(v / 3)}`).join(' | ');
  console.log('threads, ms/s:', fmt(perThread, 6));
  console.log('main thread by event, ms/s:', fmt(perName, 24));
} catch (e) { console.log('error', e.message); } finally { ws.close(); await fetch(`http://127.0.0.1:9378/json/close/${tab.id}`).catch(() => {}); process.exit(0); }
