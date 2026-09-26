import { useEffect, useState } from 'react';

// Drives the `position` prop of a Recent Work card the way Motion Lab's timeline dock
// does (BifrostWorkspace.tsx), for the two shapes its cards use. Values match each
// project's saved settings.json (see each Live<Name>.tsx wrapper), read once here rather
// than through a settings-file loader, since the website has no dial UI to save new ones.

// Same sampling as DialKit's cubicBezierProgress (Newton steps, then bisection): used by
// both clocks below so eased steps match the lab exactly.
function cubicBezier(p: number, [x1, y1, x2, y2]: [number, number, number, number]) {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  const axis = (t: number, a1: number, a2: number) => (1 - 3 * a2 + 3 * a1) * t ** 3 + (3 * a2 - 6 * a1) * t ** 2 + 3 * a1 * t;
  const slope = (t: number, a1: number, a2: number) => 3 * (1 - 3 * a2 + 3 * a1) * t ** 2 + 2 * (3 * a2 - 6 * a1) * t + 3 * a1;
  let t = p;
  for (let i = 0; i < 8; i += 1) {
    const x = axis(t, x1, x2) - p;
    if (Math.abs(x) < 1e-5) return axis(t, y1, y2);
    const dx = slope(t, x1, x2);
    if (Math.abs(dx) < 1e-6) break;
    t -= x / dx;
  }
  let lo = 0;
  let hi = 1;
  t = p;
  while (hi - lo > 1e-5) {
    if (axis(t, x1, x2) < p) lo = t;
    else hi = t;
    t = (lo + hi) / 2;
  }
  return axis(t, y1, y2);
}

/**
 * A straight track from `from` to `to` over `seconds` of wall-clock time, looping. This is
 * the lab's "clock" shape (BifrostWorkspace.tsx: a single linear step covering the frame's
 * `clockSeconds`), used by Compai (a custom 0→15 track played over 12.01s), Finova, and
 * Velocity (both 0→12 over 12s, matching their `LOOP_SECONDS` in real time).
 */
export function useLoopClock(seconds: number, playing: boolean, from = 0, to = seconds): number {
  const [position, setPosition] = useState(from);
  useEffect(() => {
    if (!playing || seconds <= 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPosition(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = ((now - start) / 1000) % seconds;
      setPosition(from + (to - from) * (elapsed / seconds));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seconds, playing, from, to]);
  return position;
}

const SLIDE_EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];

/**
 * A step count from 0 to `steps`, holding on each whole step for `holdSeconds` then
 * sliding to the next over `slideSeconds` (eased), looping — the lab's default steps
 * shape (no saved timeline). Used by Career Agent's story carousel.
 */
export function useStepClock(steps: number, holdSeconds: number, slideSeconds: number, playing: boolean): number {
  const [position, setPosition] = useState(0);
  useEffect(() => {
    if (!playing || steps <= 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPosition(0);
      return;
    }
    const cycle = steps * (holdSeconds + slideSeconds);
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      let elapsed = ((now - start) / 1000) % cycle;
      const index = Math.floor(elapsed / (holdSeconds + slideSeconds));
      elapsed -= index * (holdSeconds + slideSeconds);
      if (elapsed < holdSeconds) {
        // Holding: the previous slide already landed exactly on `index`, so this stays flat.
        setPosition(index);
      } else {
        const slide = (elapsed - holdSeconds) / slideSeconds;
        setPosition(index + cubicBezier(slide, SLIDE_EASE));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [steps, holdSeconds, slideSeconds, playing]);
  return position;
}
