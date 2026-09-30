// PAGE=<url> node measure.cjs <stage selector> <scroll-to selector> <out.json> [samples] [gap ms]
// Measures a coded tile's live [data-t] text (text not yet traced) on a page of the production
// preview: each piece's box and every character's position (x, baseline y, size, and its own
// font when a span inside differs). The fonts are loaded in this tab only. ONE tab, closed at the end.
(async () => {
const fs = require('fs'); const [sel, scrollSel, outFile, samples = '1', gapMs = '400'] = process.argv.slice(2);
const site = require('path').resolve(__dirname, '../..');
const inter = fs.existsSync(site + '/dist/assets') ? '/assets/' + (fs.readdirSync(site + '/dist/assets').find(f => /^inter-variable-.*\.woff2$/.test(f)) || '') : '';
const tab = await (await fetch('http://127.0.0.1:9378/json/new?about:blank', { method: 'PUT' })).json();
const closeTab = () => fetch(`http://127.0.0.1:9378/json/close/${tab.id}`).catch(() => {});
const ws = new WebSocket(tab.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pending = new Map(); const logs = [];
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') logs.push(m.params.exceptionDetails.exception?.description?.slice(0, 300)); pending.get(m.id)?.(m); };
const send = (method, params) => new Promise(r => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });
const wait = ms => new Promise(r => setTimeout(r, ms));
const ev = async expr => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 500)); return r.result.result.value; };
try {
await send('Runtime.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 8, mobile: false });
await send('Page.navigate', { url: process.env.PAGE }); await wait(3000);
await ev(`(async () => {
  document.head.insertAdjacentHTML('beforeend', "<style>@font-face{font-family:'TikTok Sans';src:url(/fonts/tiktok-sans-variable.woff2) format('woff2');font-weight:100 1000;font-display:block}@font-face{font-family:'Geist Mono';src:url(/motions/fonts/geist-mono-latin-400.woff2) format('woff2');font-weight:400 600;font-display:block}${inter ? `@font-face{font-family:'Inter';src:url(${inter}) format('woff2');font-weight:100 900;font-display:block}` : ''}</style>");
  document.querySelector('${scrollSel}').scrollIntoView({ block: 'center' });
  for (let i = 0; i < 50 && !document.querySelector('${sel}'); i++) await new Promise(r => setTimeout(r, 200));
  // Each optional: a page may not have (or need) every one.
  for (const f of ["12px 'Geist Mono'", "12px Geist", "12px 'TikTok Sans'", "12px Inter"]) await document.fonts.load(f).catch(() => {});
  await document.fonts.ready;
  await new Promise(r => setTimeout(r, 800)); return 1; })()`);
const once = async () => JSON.parse(await ev(`(() => {
  const stage = document.querySelector('${sel}'); if (!stage) return JSON.stringify({ error: 'no stage' });
  stage.parentElement.style.transform = 'none'; stage.parentElement.parentElement.style.overflow = 'visible';
  const res = {};
  for (const el of stage.querySelectorAll('[data-t]')) {
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    const w = parseFloat(cs.width), h = parseFloat(cs.height); const sx = r.width / w, sy = r.height / h;
    const range = document.createRange(); const chars = []; const ascent = new Map();
    const fam0 = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let tn;
    while (tn = walker.nextNode()) {
      const parent = tn.parentElement;
      if (!ascent.has(parent)) {
        const probe = document.createElement('span'); probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
        parent.insertBefore(probe, tn); const pt = probe.getBoundingClientRect().top; probe.remove();
        const s = tn.data.search(/\\S/); range.setStart(tn, s); range.setEnd(tn, s + 1); ascent.set(parent, (pt - range.getClientRects()[0].top) / sy);
      }
      const up = ascent.get(parent); const pcs = getComputedStyle(parent);
      const fam = pcs.fontFamily.split(',')[0].replace(/["']/g, '').trim(); const own = fam !== fam0 || pcs.fontWeight !== cs.fontWeight;
      for (let i = 0; i < tn.data.length; i++) {
        if (!tn.data[i].trim()) continue;
        range.setStart(tn, i); range.setEnd(tn, i + 1); const b = [...range.getClientRects()].pop(); if (!b) continue;
        chars.push([tn.data[i], +((b.left - r.left) / sx).toFixed(3), +((b.top - r.top) / sy + up).toFixed(3), parseFloat(pcs.fontSize), ...(own ? [{ family: fam, weight: pcs.fontWeight }] : [])]);
      }
    }
    const entry = { width: +w.toFixed(3), height: +h.toFixed(3), size: parseFloat(cs.fontSize), weight: cs.fontWeight, family: fam0,
      variation: cs.fontVariationSettings, optical: cs.fontOpticalSizing, numeric: cs.fontVariantNumeric, stretch: cs.fontStretch, style: cs.fontStyle, spacing: cs.letterSpacing, scale: [+sx.toFixed(4), +sy.toFixed(4)], chars };
    const prev = res[el.dataset.t];
    if (prev && JSON.stringify({ ...prev, scale: 0, conflict: 0 }) !== JSON.stringify({ ...entry, scale: 0, conflict: 0 })) entry.conflict = true;
    res[el.dataset.t] = entry;
  }
  const liveText = []; const tw = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT); let t;
  while (t = tw.nextNode()) if (t.data.trim() && !t.parentElement.closest('[data-t], style, script')) liveText.push(t.data.trim().slice(0, 40));
  return JSON.stringify({ res, liveText, fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family) });
})()`));
const out = { res: {}, liveText: [], fonts: [], states: 0 };
for (let i = 0; i < +samples; i++) {
  const s = await once(); if (s.error) { out.error = s.error; break; }
  out.states++; out.fonts = s.fonts; for (const t of s.liveText) if (!out.liveText.includes(t)) out.liveText.push(t);
  for (const [k, v] of Object.entries(s.res)) { const prev = out.res[k]; if (prev && JSON.stringify({ ...prev, scale: 0 }) !== JSON.stringify({ ...v, scale: 0 })) prev.conflict = 'changes'; if (!prev) out.res[k] = v; }
  await wait(+gapMs);
}
fs.writeFileSync(outFile, JSON.stringify(out));
if (out.error) console.log(out.error);
for (const [k, v] of Object.entries(out.res || {})) console.log(k.slice(0, 26).padEnd(27), v.family.padEnd(11), v.weight, String(v.size).slice(0, 7).padEnd(8), 'box', v.width, 'x', v.height, 'lines', [...new Set(v.chars.map(c => c[2]))].length, v.conflict ? 'CONFLICT' : '');
console.log('untraced text:', out.liveText, '| errors', logs);
} catch (e) { console.log("error:", e.message); } finally { ws.close(); await closeTab(); process.exit(0); }
})();
