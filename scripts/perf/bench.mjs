// node bench.mjs <baseUrl> <label> [profile,profile] [page] — the performance audit's tests on one page
// (default projects/bifrost/): main-thread time while the page rests at the top, a constant-speed
// scroll down and back up timed frame by frame, then the page at rest with a gallery motion in the
// middle of the screen. Profiles: desktop1, desktop4, mobile4, mobile6 (the number is the CPU
// slowdown). One tab per profile, each closed; run.sh starts and stops the server and the one
// headless Chrome. Prints a JSON line per profile. INJECT=file.js evaluates that script in the
// page before measuring, to try a change at runtime without building it.
const [base, label, only, pageArg] = process.argv.slice(2);
const page = pageArg || 'projects/bifrost/';
const PROFILES = {
  desktop1: { w: 1440, h: 900, dpr: 2, touch: false, rate: 1 },
  desktop4: { w: 1440, h: 900, dpr: 2, touch: false, rate: 4 },
  mobile4: { w: 390, h: 844, dpr: 3, touch: true, rate: 4 },
  mobile6: { w: 390, h: 844, dpr: 3, touch: true, rate: 6 },
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const SPEED = 800; // px per second

async function run(name, p) {
  const tab = await (await fetch('http://127.0.0.1:9378/json/new?about:blank', { method: 'PUT' })).json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let id = 0; const pending = new Map();
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
  const send = (method, params = {}, timeout = 120000) => new Promise((res, rej) => { const k = ++id; pending.set(k, m => m.error ? rej(new Error(method + ': ' + m.error.message)) : res(m.result)); ws.send(JSON.stringify({ id: k, method, params })); setTimeout(() => rej(new Error(method + ' timed out')), timeout); });
  const ev = async e => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 400)); return r.result.value; };
  const metrics = async () => Object.fromEntries((await send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
  const out = { label, profile: name };
  try {
    await send('Page.enable'); await send('Performance.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: p.w, height: p.h, deviceScaleFactor: p.dpr, mobile: p.touch });
    if (p.touch) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await send('Emulation.setCPUThrottlingRate', { rate: p.rate });
    await send('Page.addScriptToEvaluateOnNewDocument', { source: `window.__lt=[];new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lt.push(Math.round(e.duration))}).observe({type:'longtask',buffered:true});` });
    await send('Page.navigate', { url: base + page });
    // settle: element count unchanged for 3s (8s at least, 40s at most)
    let last = -1, stable = 0; const t0 = Date.now();
    while (Date.now() - t0 < 40000) { await wait(500); const n = await ev(`document.querySelectorAll('*').length`).catch(() => -1); stable = n === last ? stable + 500 : 0; last = n; if (stable >= 3000 && Date.now() - t0 >= 8000) break; }
    out.settleMs = Date.now() - t0;
    const SCROLLER = `(document.querySelector('.project-layer')||document.scrollingElement)`;
    const stats = async () => JSON.parse(await ev(`(()=>{const all=[...document.querySelectorAll('*')];let rendered=0;for(const e of all){if(e.checkVisibility?e.checkVisibility():e.getClientRects().length)rendered++}return JSON.stringify({elements:all.length,rendered,smil:document.querySelectorAll('animate,animateTransform,animateMotion,set').length,height:${SCROLLER}.scrollHeight})})()`));
    if (process.env.INJECT) { await ev((await import('node:fs')).readFileSync(process.env.INJECT, 'utf8')); await wait(2500); out.inject = process.env.INJECT; }
    out.dom = await stats();
    const idle = async (ms = 5000) => { await ev(`window.__lt=[]`); const a = await metrics(); await wait(ms); const b = await metrics(); return { ms_s: Math.round((b.TaskDuration - a.TaskDuration) / (ms / 1000) * 1000), script: Math.round((b.ScriptDuration - a.ScriptDuration) / (ms / 1000) * 1000), style: Math.round((b.RecalcStyleDuration - a.RecalcStyleDuration) / (ms / 1000) * 1000), layout: Math.round((b.LayoutDuration - a.LayoutDuration) / (ms / 1000) * 1000) }; };
    out.idleTop = await idle();
    const scroll = async dir => {
      const dist = await ev(`(()=>{const s=${SCROLLER};return ${dir > 0 ? 's.scrollHeight-s.clientHeight-s.scrollTop' : 's.scrollTop'}})()`);
      await ev(`window.__lt=[];window.__ft=[];window.__rec=1;requestAnimationFrame(function t(n){if(!window.__rec)return;window.__ft.push(n);requestAnimationFrame(t)})`);
      const a = await metrics(); const t = Date.now();
      await send('Input.synthesizeScrollGesture', { x: Math.round(p.w / 2), y: Math.round(p.h / 2), yDistance: -dir * dist, speed: SPEED, gestureSourceType: 'mouse' }, 180000);
      const secs = (Date.now() - t) / 1000; const b = await metrics();
      const ft = JSON.parse(await ev(`window.__rec=0;JSON.stringify(window.__ft)`)); const lt = JSON.parse(await ev(`JSON.stringify(window.__lt)`));
      const iv = ft.slice(1).map((x, i) => x - ft[i]).sort((x, y) => x - y);
      const reached = await ev(`${SCROLLER}.scrollTop`);
      return { px: Math.round(dist), secs: +secs.toFixed(1), fps: +((ft.length - 1) / ((ft[ft.length - 1] - ft[0]) / 1000)).toFixed(1), p95: +iv[Math.floor(iv.length * 0.95)].toFixed(1), worst: +iv[iv.length - 1].toFixed(0), janky: +(iv.filter(x => x > 33.4).length / iv.length * 100).toFixed(1), busy: Math.round((b.TaskDuration - a.TaskDuration) / secs * 1000), longTasks: lt.length, longest: Math.max(0, ...lt), end: Math.round(reached) };
    };
    out.down = await scroll(1);
    await wait(1500);
    out.domBottom = await stats();
    out.up = await scroll(-1);
    await wait(1500);
    // idle with a gallery motion in the middle of the screen
    for (const sel of (page.includes('bifrost') ? ['#p2-motion-02', '#p2-motion-05'] : ['#content-01', '#content-03'])) {
      const ok = await ev(`(()=>{const f=document.querySelector('${sel}');if(!f)return false;const s=${SCROLLER};const r=f.getBoundingClientRect();s.scrollTop+=r.top+r.height/2-innerHeight/2;return true})()`);
      if (!ok) continue; await wait(2500); out['idle' + sel] = await idle();
    }
  } catch (e) { out.error = e.message; }
  finally { ws.close(); await fetch(`http://127.0.0.1:9378/json/close/${tab.id}`).catch(() => {}); }
  console.log(JSON.stringify(out));
}
for (const [name, p] of Object.entries(PROFILES)) if (!only || only.split(',').includes(name)) await run(name, p);
process.exit(0);
