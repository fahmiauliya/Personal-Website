// node check.mjs <baseUrl> — the check before a push: opens each page (desktop, and phone size for
// three), scrolls it through and back, and reports script errors, console and browser errors and
// failed or missing files; a project page must also close with Esc. One tab per page, each closed.
// check.sh serves the repo root (the files that get deployed) and runs this in one headless Chrome.
const [base] = process.argv.slice(2);
const wait = ms => new Promise(r => setTimeout(r, ms));
const PAGES = [['', 'desktop'], ['about/', 'desktop'], ['projects/bifrost/', 'desktop'], ['projects/beam/', 'desktop'], ['projects/recent/compai/', 'desktop'], ['projects/recent/finova/', 'desktop'], ['', 'phone'], ['projects/bifrost/', 'phone'], ['projects/beam/', 'phone']];
let bad = 0;
for (const [page, device] of PAGES) {
  const tab = await (await fetch('http://127.0.0.1:9378/json/new?about:blank', { method: 'PUT' })).json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let id = 0; const pending = new Map(); const problems = []; const urls = new Map(); let requests = 0;
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === 'Runtime.exceptionThrown') problems.push('script error: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).slice(0, 220));
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') problems.push('console error: ' + m.params.args.map(a => a.value ?? a.description).join(' ').slice(0, 220));
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') problems.push('browser error: ' + m.params.entry.text.slice(0, 160));
    if (m.method === 'Network.requestWillBeSent') { urls.set(m.params.requestId, m.params.request.url); requests++; }
    if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) problems.push(`HTTP ${m.params.response.status}: ${m.params.response.url.slice(-70)}`);
    if (m.method === 'Network.loadingFailed' && !m.params.canceled) problems.push(`failed to load: ${(urls.get(m.params.requestId) || '').slice(-70)} (${m.params.errorText})`);
  };
  const send = (method, params = {}) => new Promise((res, rej) => { const k = ++id; pending.set(k, m => m.error ? rej(new Error(method + ': ' + m.error.message)) : res(m.result)); ws.send(JSON.stringify({ id: k, method, params })); });
  const ev = async e => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 300)); return r.result.value; };
  let note = '';
  try {
    await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable'); await send('Log.enable');
    const phone = device === 'phone';
    await send('Emulation.setDeviceMetricsOverride', phone ? { width: 390, height: 844, deviceScaleFactor: 2, mobile: true } : { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    if (phone) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await send('Page.navigate', { url: base + page });
    // settled: the element count unchanged for 2s (5s at least)
    let last = -1, stable = 0; const t0 = Date.now();
    while (Date.now() - t0 < 25000) { await wait(500); const n = await ev(`document.querySelectorAll('*').length`).catch(() => -1); stable = n === last ? stable + 500 : 0; last = n; if (stable >= 2000 && Date.now() - t0 >= 5000) break; }
    const SCROLLER = `(document.querySelector('.project-layer')||document.scrollingElement)`;
    const shown = JSON.parse(await ev(`JSON.stringify({elements:document.querySelectorAll('*').length,height:${SCROLLER}.scrollHeight,layer:!!document.querySelector('.project-layer')})`));
    if (!page) { await ev(`document.querySelector('.works-grid')?.scrollIntoView()`); await wait(1200); await ev(`document.getElementById('nav-tab-recent')?.click()`); await wait(2500); }
    const steps = Math.min(40, Math.ceil(shown.height / (phone ? 844 : 900)) + 1);
    for (let i = 0; i < steps; i++) { await ev(`${SCROLLER}.scrollBy(0, innerHeight)`); await wait(450); }
    await wait(800);
    // gallery motions are in the page at the bottom, and again back at the top
    const motions = `document.querySelectorAll('.project-layer .scene-fit-stage > *').length`;
    const atBottom = shown.layer ? await ev(motions) : 0;
    for (let i = 0; i < steps; i++) { await ev(`${SCROLLER}.scrollBy(0, -innerHeight)`); await wait(250); }
    await wait(1200);
    note = `${shown.elements} elements, ${requests} files`;
    if (shown.layer) {
      note += `, motions mounted ${atBottom} at the bottom / ${await ev(motions)} back at the top`;
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await wait(3500);
      if (!(await ev(`location.pathname === '/' && !document.documentElement.classList.contains('project-open')`))) problems.push('Esc did not close the project page');
    }
  } catch (e) { problems.push('check failed: ' + e.message); }
  finally { ws.close(); await fetch(`http://127.0.0.1:9378/json/close/${tab.id}`).catch(() => {}); }
  const unique = [...new Set(problems)]; bad += unique.length;
  console.log(`${unique.length ? 'PROBLEM' : 'ok     '} ${device.padEnd(7)} /${page.padEnd(24)} ${note}`);
  for (const problem of unique) console.log('          - ' + problem);
}
console.log(bad ? `\n${bad} problem(s) found` : '\nno errors on any page');
process.exit(bad ? 1 : 0);
