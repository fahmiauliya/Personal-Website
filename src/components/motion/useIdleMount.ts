import { useEffect, useState } from 'react';

// A gallery motion mounts when it comes near the screen (useNearView) — which is while the page
// is scrolling, and building a large motion then makes the scroll stutter. So the ones still
// waiting are also built ahead of time, one at a time in page order, whenever the page is at
// rest: by the time a visitor scrolls to them they're already there (paused until on screen).
const START_DELAY_MS = 1800; // after the project page's opening transition
const GAP_MS = 350;
const REST_MS = 400; // since the last scroll
type Mount = () => void;
const waiting: Mount[] = [];
let timer = 0;
let lastScroll = 0;
let listening = false;
const onScroll = () => { lastScroll = performance.now(); };

function next() {
  timer = 0;
  if (!waiting.length) return;
  const root = document.documentElement.classList;
  const busy = performance.now() - lastScroll < REST_MS || root.contains('project-vt-open') || root.contains('project-vt-close') || document.hidden;
  if (busy) { timer = window.setTimeout(next, REST_MS); return; }
  const run = () => { waiting.shift()?.(); if (waiting.length) timer = window.setTimeout(next, GAP_MS); };
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 1000 });
  else run();
}

export function useIdleMount(near: boolean) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { if (near) setLoaded(true); }, [near]);
  useEffect(() => {
    if (loaded) return;
    const mount: Mount = () => setLoaded(true);
    waiting.push(mount);
    if (!listening) { listening = true; document.addEventListener('scroll', onScroll, { capture: true, passive: true }); }
    if (!timer) timer = window.setTimeout(next, START_DELAY_MS);
    return () => { const at = waiting.indexOf(mount); if (at >= 0) waiting.splice(at, 1); };
  }, [loaded]);
  return loaded;
}
