import { useEffect, useRef, useState } from 'react';
import visual1 from './assets/on-demand-visual.svg?raw';
import visual2 from './assets/on-demand-visual2.svg?raw';
import visual3 from './assets/on-demand-visual3.svg?raw';
import { counterPath } from './text';

// Motion Lab beam-content/motion-06's three visuals (OnDemandVisual, 2 and 3) in their loop
// (autoPlay) mode, ported. Each SVG is the lab's own markup with its animation hooks, built
// by the lab's code and saved as a file (./assets); only the two counters differ, drawn as
// outline paths (./text) instead of text. Each visual runs its cycle once from when it
// mounts, as in the lab, where the section mounts a visual each time it comes round.

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Everything appears instantly: the rows reload and the count runs up to 12,480 (8s). */
export function OnDemandVisual1() {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const svg = rootRef.current?.querySelector('svg');
    const counter = rootRef.current?.querySelector('[data-od-counter]');
    if (!svg || !counter) return;
    const show = (value: number) => counter.setAttribute('d', counterPath('files', value, 229, 512));
    show(12480);
    if (reducedMotion()) return;
    const LOOP = 8000;
    let frame = 0;
    let previous = 12480;
    const started = performance.now();
    svg.classList.add('od-motion-active');
    const tick = (now: number) => {
      const elapsed = now - started;
      if (elapsed >= LOOP) {
        svg.classList.remove('od-motion-active');
        show(12480);
        return;
      }
      const progress = Math.min(1, Math.max(0, (elapsed - 1750) / 1050));
      const value = elapsed < 1200 ? 12480 : Math.round(12480 * (1 - Math.pow(1 - progress, 3)));
      if (value !== previous) show((previous = value));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  return <div ref={rootRef} className="on-demand-visual" role="img" aria-label="Beam on-demand monorepo directory with 12,480 files available" dangerouslySetInnerHTML={{ __html: visual1 }} />;
}

/** Contents load on demand: the file is picked and its contents fetched (one 8s CSS cycle). */
export function OnDemandVisual2() {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const svg = rootRef.current?.querySelector('svg');
    if (!svg || reducedMotion()) return;
    svg.classList.add('od2-motion-active');
    const stop = window.setTimeout(() => svg.classList.remove('od2-motion-active'), 8000 + 24);
    return () => window.clearTimeout(stop);
  }, []);
  return (
    <div className="on-demand-visual" style={{ position: 'relative' }}>
      <div ref={rootRef} role="img" aria-label="Beam on-demand file selection showing local disk usage" dangerouslySetInnerHTML={{ __html: visual2 }} />
    </div>
  );
}

/** Built for huge repos: the count runs to 1,250,000, then the ready check appears. */
type Phase = 'closed' | 'opening' | 'complete';
export function OnDemandVisual3() {
  const TARGET = 1_250_000;
  const [phase, setPhase] = useState<Phase>('closed');
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (reducedMotion()) {
      setCount(TARGET);
      setPhase('complete');
      return;
    }
    let countFrame = 0;
    const frame = requestAnimationFrame(() => setPhase('opening'));
    const countStart = window.setTimeout(() => {
      const startedAt = performance.now();
      const update = (now: number) => {
        const progress = Math.min((now - startedAt) / 1500, 1);
        setCount(progress < 1 ? Math.round(TARGET * (1 - Math.pow(1 - progress, 4))) : TARGET);
        if (progress < 1) countFrame = requestAnimationFrame(update);
      };
      countFrame = requestAnimationFrame(update);
    }, 520);
    const complete = window.setTimeout(() => setPhase('complete'), 2900);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(countFrame);
      window.clearTimeout(countStart);
      window.clearTimeout(complete);
    };
  }, []);
  return (
    <div className="on-demand-visual odv3-motion" data-phase={phase} role="img" aria-label="Beam on-demand directory with more than 1.25 million files ready in 1.2 seconds">
      <div className="odv3-artwork" dangerouslySetInnerHTML={{ __html: visual3 }} />
      <svg className="odv3-count" viewBox="0 0 809 692" aria-hidden="true"><path fill="#0d76f2" d={counterPath('repos', count, 239, 410)} /></svg>
    </div>
  );
}
